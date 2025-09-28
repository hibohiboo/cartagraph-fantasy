use crate::domain::value_objects::*;
use std::collections::HashMap;

/// ゲームルールエンジン - ビジネスルールの検証と効果解決を担当するドメインサービス
#[derive(Debug, Clone)]
pub struct RuleEngine {
    global_rules: GlobalRules,
    scenario_rules: Option<ScenarioRules>,
}

/// グローバルルール（全シナリオ共通）
#[derive(Debug, Clone)]
pub struct GlobalRules {
    max_players_per_session: usize,
    card_usage_limits: HashMap<RuntimeCardType, CardUsageLimit>,
    dice_success_threshold: u8,
}

/// シナリオ固有ルール
#[derive(Debug, Clone)]
pub struct ScenarioRules {
    scenario_id: ScenarioId,
    custom_card_rules: HashMap<CardId, CustomCardRule>,
    scene_transition_rules: HashMap<SceneId, Vec<TransitionRule>>,
    event_effects: HashMap<EventId, EventEffect>,
}

/// カード使用制限
#[derive(Debug, Clone)]
pub struct CardUsageLimit {
    max_uses_per_scene: Option<u32>,
    max_uses_per_session: Option<u32>,
    required_tags: Vec<TagId>,
}

/// カスタムカードルール
#[derive(Debug, Clone)]
pub struct CustomCardRule {
    card_id: CardId,
    usage_conditions: Vec<UsageCondition>,
    effects: Vec<CardEffect>,
}

/// 使用条件
#[derive(Debug, Clone)]
pub enum UsageCondition {
    RequireTag(TagId),
    RequireMinPlayers(usize),
    RequireSceneContext(SceneContext),
    RequireDiceSuccess(u8),
}

/// カード効果
#[derive(Debug, Clone)]
pub enum CardEffect {
    AddTag(TagId, TagValue),
    RemoveTag(TagId),
    ModifyTagValue(TagId, TagModification),
    TriggerEvent(EventId),
    ForceSceneTransition(SceneId),
}

/// タグ修正操作
#[derive(Debug, Clone)]
pub enum TagModification {
    Add(i32),
    Multiply(f32),
    Set(TagValue),
}

/// シーン遷移ルール
#[derive(Debug, Clone)]
pub struct TransitionRule {
    from_scene: SceneId,
    to_scene: SceneId,
    conditions: Vec<TransitionCondition>,
}

/// 遷移条件
#[derive(Debug, Clone)]
pub enum TransitionCondition {
    AllPlayersReady,
    RequiredCardsUsed(Vec<CardId>),
    TagThresholdMet(TagId, TagValue),
    EventTriggered(EventId),
}

/// イベント効果
#[derive(Debug, Clone)]
pub struct EventEffect {
    event_id: EventId,
    target: EffectTarget,
    modifications: Vec<EffectModification>,
}

/// 効果対象
#[derive(Debug, Clone)]
pub enum EffectTarget {
    AllPlayers,
    SpecificPlayer(PlayerId),
    Session,
    Scene,
}

/// 効果修正
#[derive(Debug, Clone)]
pub enum EffectModification {
    AddCards(Vec<CardId>),
    ModifyTags(Vec<(TagId, TagModification)>),
    ChangeScene(SceneId),
    AddLogEntry(String),
}

/// ルール違反エラー
#[derive(Debug, Clone, PartialEq)]
pub enum RuleViolation {
    CardUsageLimitExceeded(CardId),
    MissingRequiredTag(TagId),
    InvalidSceneContext(SceneContext),
    InsufficientPlayers(usize, usize), // required, actual
    DiceThresholdNotMet(u8, u8), // required, actual
    InvalidSceneTransition(SceneId, SceneId),
    EventNotAllowed(EventId),
    CustomRuleViolation(String),
}

impl RuleEngine {
    /// 新しいルールエンジンを作成
    pub fn new() -> Self {
        Self {
            global_rules: GlobalRules::default(),
            scenario_rules: None,
        }
    }

    /// シナリオ固有ルールを設定
    pub fn with_scenario_rules(mut self, scenario_rules: ScenarioRules) -> Self {
        self.scenario_rules = Some(scenario_rules);
        self
    }

    /// カード使用の検証
    pub fn validate_card_usage(
        &self,
        card: &Card,
        context: &GameContext,
    ) -> Result<(), RuleViolation> {
        // 1. グローバルルールでのカード使用制限チェック
        if let Some(limit) = self.global_rules.card_usage_limits.get(card.card_type()) {
            self.validate_usage_limit(card, limit, context)?;
        }

        // 2. シナリオ固有のカスタムルールチェック
        if let Some(scenario_rules) = &self.scenario_rules {
            if let Some(custom_rule) = scenario_rules.custom_card_rules.get(card.card_id()) {
                self.validate_custom_rule(card, custom_rule, context)?;
            }
        }

        // 3. カードのコンテキスト適合性チェック（既存のロジックを活用）
        let card_usage_context = CardUsageContext {
            player_tags: context.player_tags.values().flatten().map(|tag| tag.tag_id().clone()).collect(),
            available_choices: vec![], // 実装時に適切な値を設定
            scene_context: self.determine_scene_context(context),
        };

        card.can_be_used_in_context(&card_usage_context)
            .map_err(|err| match err {
                CardUsageError::InvalidContext => RuleViolation::InvalidSceneContext(
                    self.determine_scene_context(context)
                ),
                CardUsageError::MissingRequiredTags => RuleViolation::CustomRuleViolation(
                    "Missing required tags".to_string()
                ),
                CardUsageError::WrongCardType => RuleViolation::CustomRuleViolation(
                    "Wrong card type for current context".to_string()
                ),
                CardUsageError::AlreadyUsed => RuleViolation::CardUsageLimitExceeded(
                    card.card_id().clone()
                ),
            })
    }

    /// カード使用制限の検証
    fn validate_usage_limit(
        &self,
        card: &Card,
        limit: &CardUsageLimit,
        context: &GameContext,
    ) -> Result<(), RuleViolation> {
        // シーン内使用回数制限チェック
        if let Some(max_per_scene) = limit.max_uses_per_scene {
            let scene_usage = context.scene_usage_count.get(card.card_id()).unwrap_or(&0);
            if *scene_usage >= max_per_scene {
                return Err(RuleViolation::CardUsageLimitExceeded(card.card_id().clone()));
            }
        }

        // セッション内使用回数制限チェック
        if let Some(max_per_session) = limit.max_uses_per_session {
            let session_usage = context.session_usage_count.get(card.card_id()).unwrap_or(&0);
            if *session_usage >= max_per_session {
                return Err(RuleViolation::CardUsageLimitExceeded(card.card_id().clone()));
            }
        }

        // 必要タグチェック
        for required_tag in &limit.required_tags {
            let has_tag = context.player_tags.values()
                .any(|player_tags| player_tags.iter().any(|tag| tag.tag_id() == required_tag));
            if !has_tag {
                return Err(RuleViolation::MissingRequiredTag(required_tag.clone()));
            }
        }

        Ok(())
    }

    /// カスタムルールの検証
    fn validate_custom_rule(
        &self,
        _card: &Card,
        custom_rule: &CustomCardRule,
        context: &GameContext,
    ) -> Result<(), RuleViolation> {
        for condition in &custom_rule.usage_conditions {
            match condition {
                UsageCondition::RequireTag(tag_id) => {
                    let has_tag = context.player_tags.values()
                        .any(|player_tags| player_tags.iter().any(|tag| tag.tag_id() == tag_id));
                    if !has_tag {
                        return Err(RuleViolation::MissingRequiredTag(tag_id.clone()));
                    }
                },
                UsageCondition::RequireMinPlayers(min_players) => {
                    if context.active_players.len() < *min_players {
                        return Err(RuleViolation::InsufficientPlayers(
                            *min_players,
                            context.active_players.len()
                        ));
                    }
                },
                UsageCondition::RequireSceneContext(required_context) => {
                    let current_context = self.determine_scene_context(context);
                    if current_context != *required_context {
                        return Err(RuleViolation::InvalidSceneContext(current_context));
                    }
                },
                UsageCondition::RequireDiceSuccess(threshold) => {
                    // ダイス成功条件は実際のダイス振りが必要なため、ここでは制限チェックのみ
                    if *threshold > self.global_rules.dice_success_threshold {
                        return Err(RuleViolation::DiceThresholdNotMet(*threshold, 0));
                    }
                },
            }
        }

        Ok(())
    }

    /// ゲームコンテキストからシーンコンテキストを決定
    fn determine_scene_context(&self, _context: &GameContext) -> SceneContext {
        // 現在の実装では基本的なロジック
        // 将来的にはより複雑なシーン状態判定を実装
        SceneContext::Action
    }

    /// イベント効果の解決
    pub fn resolve_event_effects(
        &self,
        event_id: &EventId,
        context: &GameContext,
    ) -> Result<Vec<EffectModification>, RuleViolation> {
        // シナリオ固有のイベント効果を確認
        if let Some(scenario_rules) = &self.scenario_rules {
            if let Some(event_effect) = scenario_rules.event_effects.get(event_id) {
                return self.apply_event_effect(event_effect, context);
            }
        }

        // シナリオ固有のイベントが見つからない場合はエラー
        Err(RuleViolation::EventNotAllowed(event_id.clone()))
    }

    /// イベント効果の適用
    fn apply_event_effect(
        &self,
        event_effect: &EventEffect,
        context: &GameContext,
    ) -> Result<Vec<EffectModification>, RuleViolation> {
        // イベントの対象を決定
        let target_players = match &event_effect.target {
            EffectTarget::AllPlayers => context.active_players.clone(),
            EffectTarget::SpecificPlayer(player_id) => {
                if context.active_players.contains(player_id) {
                    vec![player_id.clone()]
                } else {
                    return Err(RuleViolation::CustomRuleViolation(
                        "Target player not in session".to_string()
                    ));
                }
            },
            EffectTarget::Session | EffectTarget::Scene => {
                // セッション・シーン対象の場合は全プレイヤーに適用
                context.active_players.clone()
            },
        };

        // 対象プレイヤーがいない場合はエラー
        if target_players.is_empty() {
            return Err(RuleViolation::CustomRuleViolation(
                "No target players for event effect".to_string()
            ));
        }

        // 効果修正を適用
        let mut modifications = Vec::new();
        for modification in &event_effect.modifications {
            match modification {
                EffectModification::AddCards(card_ids) => {
                    // 各対象プレイヤーにカードを追加
                    for _player_id in &target_players {
                        modifications.push(EffectModification::AddCards(card_ids.clone()));
                    }
                },
                EffectModification::ModifyTags(tag_modifications) => {
                    // タグ修正は各プレイヤーに適用
                    for _player_id in &target_players {
                        modifications.push(EffectModification::ModifyTags(tag_modifications.clone()));
                    }
                },
                EffectModification::ChangeScene(scene_id) => {
                    // シーン変更は一度だけ適用
                    modifications.push(EffectModification::ChangeScene(scene_id.clone()));
                },
                EffectModification::AddLogEntry(message) => {
                    // ログエントリも一度だけ追加
                    modifications.push(EffectModification::AddLogEntry(message.clone()));
                },
            }
        }

        Ok(modifications)
    }

    /// シーン遷移ルールチェック
    pub fn check_scene_transition(
        &self,
        from_scene: &SceneId,
        to_scene: &SceneId,
        context: &GameContext,
    ) -> Result<(), RuleViolation> {
        // シナリオ固有の遷移ルールを確認
        if let Some(scenario_rules) = &self.scenario_rules {
            if let Some(transition_rules) = scenario_rules.scene_transition_rules.get(from_scene) {
                // 該当する遷移ルールを検索
                for rule in transition_rules {
                    if rule.to_scene == *to_scene {
                        return self.validate_transition_conditions(&rule.conditions, context);
                    }
                }
                // 定義された遷移ルールに該当しない場合はエラー
                return Err(RuleViolation::InvalidSceneTransition(from_scene.clone(), to_scene.clone()));
            }
        }

        // シナリオ固有のルールが定義されていない場合は、基本的な検証のみ
        // 現在のシーンと異なるシーンへの遷移は基本的に許可
        if from_scene == to_scene {
            return Err(RuleViolation::CustomRuleViolation(
                "Cannot transition to the same scene".to_string()
            ));
        }

        Ok(())
    }

    /// 遷移条件の検証
    fn validate_transition_conditions(
        &self,
        conditions: &[TransitionCondition],
        context: &GameContext,
    ) -> Result<(), RuleViolation> {
        for condition in conditions {
            match condition {
                TransitionCondition::AllPlayersReady => {
                    // 全プレイヤーの準備完了チェック
                    // 現在の実装では全プレイヤーがアクティブであることを条件とする
                    if context.active_players.is_empty() {
                        return Err(RuleViolation::InsufficientPlayers(1, 0));
                    }
                },
                TransitionCondition::RequiredCardsUsed(required_cards) => {
                    // 必要なカードが使用されているかチェック
                    for required_card in required_cards {
                        let card_used = context.used_cards.values()
                            .any(|player_cards| player_cards.contains(required_card));
                        if !card_used {
                            return Err(RuleViolation::CustomRuleViolation(
                                format!("Required card not used: {:?}", required_card)
                            ));
                        }
                    }
                },
                TransitionCondition::TagThresholdMet(tag_id, threshold_value) => {
                    // タグの閾値チェック
                    let threshold_met = context.player_tags.values()
                        .any(|player_tags| {
                            player_tags.iter().any(|tag| {
                                tag.tag_id() == tag_id && self.tag_meets_threshold(tag, threshold_value)
                            })
                        });
                    if !threshold_met {
                        return Err(RuleViolation::CustomRuleViolation(
                            format!("Tag threshold not met: {:?}", tag_id)
                        ));
                    }
                },
                TransitionCondition::EventTriggered(event_id) => {
                    // イベントトリガーチェック
                    // 現在の実装では、イベントが解決可能であることを条件とする
                    self.resolve_event_effects(event_id, context)
                        .map_err(|_| RuleViolation::EventNotAllowed(event_id.clone()))?;
                },
            }
        }

        Ok(())
    }

    /// タグが閾値を満たしているかチェック
    fn tag_meets_threshold(&self, tag: &Tag, threshold: &TagValue) -> bool {
        match (tag.value(), threshold) {
            (Some(TagValue::Numeric(tag_value)), TagValue::Numeric(threshold_value)) => {
                tag_value >= threshold_value
            },
            (Some(TagValue::Boolean(tag_value)), TagValue::Boolean(threshold_value)) => {
                tag_value == threshold_value
            },
            (Some(TagValue::Text(tag_value)), TagValue::Text(threshold_value)) => {
                tag_value == threshold_value
            },
            _ => false, // 型が一致しない場合は条件を満たさない
        }
    }
}

/// ゲームコンテキスト - ルール検証に必要な情報
#[derive(Debug, Clone)]
pub struct GameContext {
    pub session_id: SessionId,
    pub current_scene: SceneId,
    pub active_players: Vec<PlayerId>,
    pub player_tags: HashMap<PlayerId, Vec<Tag>>,
    pub used_cards: HashMap<PlayerId, Vec<CardId>>,
    pub scene_usage_count: HashMap<CardId, u32>,
    pub session_usage_count: HashMap<CardId, u32>,
}

impl Default for GlobalRules {
    fn default() -> Self {
        let mut card_usage_limits = HashMap::new();

        // デフォルトのカード使用制限
        card_usage_limits.insert(
            RuntimeCardType::Action,
            CardUsageLimit {
                max_uses_per_scene: Some(3),
                max_uses_per_session: None,
                required_tags: vec![],
            }
        );

        card_usage_limits.insert(
            RuntimeCardType::Choice,
            CardUsageLimit {
                max_uses_per_scene: Some(1),
                max_uses_per_session: None,
                required_tags: vec![],
            }
        );

        Self {
            max_players_per_session: 6,
            card_usage_limits,
            dice_success_threshold: 7,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // TDDサイクル1: ルールエンジン基本作成テスト
    #[test]
    fn test_rule_engine_creation() {
        let engine = RuleEngine::new();

        assert_eq!(engine.global_rules.max_players_per_session, 6);
        assert_eq!(engine.global_rules.dice_success_threshold, 7);
        assert!(engine.scenario_rules.is_none());

        // カード使用制限のデフォルト値チェック
        let action_limit = engine.global_rules.card_usage_limits.get(&RuntimeCardType::Action);
        assert!(action_limit.is_some());
        assert_eq!(action_limit.unwrap().max_uses_per_scene, Some(3));

        let choice_limit = engine.global_rules.card_usage_limits.get(&RuntimeCardType::Choice);
        assert!(choice_limit.is_some());
        assert_eq!(choice_limit.unwrap().max_uses_per_scene, Some(1));
    }

    // TDDサイクル2: シナリオルール設定テスト
    #[test]
    fn test_scenario_rules_configuration() {
        let scenario_id = ScenarioId::new();
        let scenario_rules = ScenarioRules {
            scenario_id: scenario_id.clone(),
            custom_card_rules: HashMap::new(),
            scene_transition_rules: HashMap::new(),
            event_effects: HashMap::new(),
        };

        let engine = RuleEngine::new().with_scenario_rules(scenario_rules);

        assert!(engine.scenario_rules.is_some());
        assert_eq!(engine.scenario_rules.unwrap().scenario_id, scenario_id);
    }

    // TDDサイクル3: カード使用検証テスト - GREEN phase
    #[test]
    fn test_card_usage_validation() {
        let engine = RuleEngine::new();
        let card = Card::new(
            CardId::from_string("test_card".to_string()),
            "Test Card".to_string(),
            RuntimeCardType::Action,
            vec![],
            vec![],
        );

        let context = GameContext {
            session_id: SessionId::new(),
            current_scene: SceneId::new(),
            active_players: vec![PlayerId::new()],
            player_tags: HashMap::new(),
            used_cards: HashMap::new(),
            scene_usage_count: HashMap::new(),
            session_usage_count: HashMap::new(),
        };

        // 基本的な使用は成功するはず
        let result = engine.validate_card_usage(&card, &context);
        assert!(result.is_ok());

        // 使用制限に達した場合はエラー
        let mut context_with_limit = context.clone();
        context_with_limit.scene_usage_count.insert(card.card_id().clone(), 3); // デフォルト制限に達
        let result = engine.validate_card_usage(&card, &context_with_limit);
        assert!(result.is_err());
        match result.unwrap_err() {
            RuleViolation::CardUsageLimitExceeded(card_id) => {
                assert_eq!(card_id, *card.card_id());
            },
            _ => panic!("Expected CardUsageLimitExceeded"),
        }
    }

    // TDDサイクル4: イベント効果解決テスト - RED phase
    #[test]
    fn test_event_effect_resolution() {
        let engine = RuleEngine::new();
        let event_id = EventId::new();

        let context = GameContext {
            session_id: SessionId::new(),
            current_scene: SceneId::new(),
            active_players: vec![],
            player_tags: HashMap::new(),
            used_cards: HashMap::new(),
            scene_usage_count: HashMap::new(),
            session_usage_count: HashMap::new(),
        };

        let result = engine.resolve_event_effects(&event_id, &context);
        assert!(result.is_err()); // まだ未実装なのでエラー
    }

    // TDDサイクル5: シーン遷移ルールチェックテスト - GREEN phase
    #[test]
    fn test_scene_transition_rule_check() {
        let engine = RuleEngine::new();
        let from_scene = SceneId::new();
        let to_scene = SceneId::new();

        let context = GameContext {
            session_id: SessionId::new(),
            current_scene: from_scene.clone(),
            active_players: vec![PlayerId::new()], // プレイヤーがいる場合
            player_tags: HashMap::new(),
            used_cards: HashMap::new(),
            scene_usage_count: HashMap::new(),
            session_usage_count: HashMap::new(),
        };

        // 基本的なシーン遷移は成功するはず（シナリオルールが定義されていない場合）
        let result = engine.check_scene_transition(&from_scene, &to_scene, &context);
        assert!(result.is_ok());

        // 同じシーンへの遷移はエラー
        let result = engine.check_scene_transition(&from_scene, &from_scene, &context);
        assert!(result.is_err());
        match result.unwrap_err() {
            RuleViolation::CustomRuleViolation(msg) => {
                assert!(msg.contains("Cannot transition to the same scene"));
            },
            _ => panic!("Expected CustomRuleViolation for same scene transition"),
        }
    }

    // 追加テスト: 複合的なルール検証
    #[test]
    fn test_comprehensive_rule_validation() {
        let scenario_id = ScenarioId::new();
        let card_id = CardId::from_string("special_card".to_string());
        let tag_id = TagId::new();
        let from_scene = SceneId::new();
        let to_scene = SceneId::new();
        let event_id = EventId::new();

        // シナリオ固有ルールを作成
        let mut custom_card_rules = HashMap::new();
        custom_card_rules.insert(card_id.clone(), CustomCardRule {
            card_id: card_id.clone(),
            usage_conditions: vec![
                UsageCondition::RequireTag(tag_id.clone()),
                UsageCondition::RequireMinPlayers(2),
            ],
            effects: vec![],
        });

        let mut event_effects = HashMap::new();
        event_effects.insert(event_id.clone(), EventEffect {
            event_id: event_id.clone(),
            target: EffectTarget::AllPlayers,
            modifications: vec![
                EffectModification::AddLogEntry("Event triggered".to_string()),
            ],
        });

        let mut scene_transition_rules = HashMap::new();
        scene_transition_rules.insert(from_scene.clone(), vec![
            TransitionRule {
                from_scene: from_scene.clone(),
                to_scene: to_scene.clone(),
                conditions: vec![TransitionCondition::AllPlayersReady],
            }
        ]);

        let scenario_rules = ScenarioRules {
            scenario_id,
            custom_card_rules,
            scene_transition_rules,
            event_effects,
        };

        let engine = RuleEngine::new().with_scenario_rules(scenario_rules);

        // カードの作成
        let card = Card::new(
            card_id.clone(),
            "Special Card".to_string(),
            RuntimeCardType::Action,
            vec![],
            vec![],
        );

        // タグ付きプレイヤーコンテキスト
        let player_id = PlayerId::new();
        let mut player_tags = HashMap::new();
        let tag = Tag::new(tag_id.clone(), "Test Tag".to_string(), TagCategory::Skill, Some(TagValue::Numeric(1)));
        player_tags.insert(player_id.clone(), vec![tag]);

        let context = GameContext {
            session_id: SessionId::new(),
            current_scene: from_scene.clone(),
            active_players: vec![player_id.clone(), PlayerId::new()], // 2プレイヤー
            player_tags,
            used_cards: HashMap::new(),
            scene_usage_count: HashMap::new(),
            session_usage_count: HashMap::new(),
        };

        // カスタムルール付きカード使用 - 成功
        let result = engine.validate_card_usage(&card, &context);
        assert!(result.is_ok());

        // イベント効果解決 - 成功
        let result = engine.resolve_event_effects(&event_id, &context);
        assert!(result.is_ok());
        let modifications = result.unwrap();
        assert_eq!(modifications.len(), 1);
        match &modifications[0] {
            EffectModification::AddLogEntry(msg) => {
                assert_eq!(msg, "Event triggered");
            },
            _ => panic!("Expected AddLogEntry modification"),
        }

        // シーン遷移 - 成功
        let result = engine.check_scene_transition(&from_scene, &to_scene, &context);
        assert!(result.is_ok());

        // 条件不足でのカード使用テスト
        let context_insufficient = GameContext {
            session_id: SessionId::new(),
            current_scene: from_scene.clone(),
            active_players: vec![PlayerId::new()], // 1プレイヤー（不足）
            player_tags: HashMap::new(), // タグなし
            used_cards: HashMap::new(),
            scene_usage_count: HashMap::new(),
            session_usage_count: HashMap::new(),
        };

        let result = engine.validate_card_usage(&card, &context_insufficient);
        assert!(result.is_err());
    }

    // テスト: エラーケースの詳細検証
    #[test]
    fn test_rule_violation_error_types() {
        let engine = RuleEngine::new();
        let card = Card::new(
            CardId::from_string("test_card".to_string()),
            "Test Card".to_string(),
            RuntimeCardType::Choice,
            vec![],
            vec![],
        );

        let context = GameContext {
            session_id: SessionId::new(),
            current_scene: SceneId::new(),
            active_players: vec![PlayerId::new()],
            player_tags: HashMap::new(),
            used_cards: HashMap::new(),
            scene_usage_count: HashMap::new(),
            session_usage_count: HashMap::new(),
        };

        // 選択肢カードの使用制限超過テスト
        let mut context_with_limit = context.clone();
        context_with_limit.scene_usage_count.insert(card.card_id().clone(), 1); // デフォルト制限1に達

        let result = engine.validate_card_usage(&card, &context_with_limit);
        assert!(result.is_err());
        match result.unwrap_err() {
            RuleViolation::CardUsageLimitExceeded(violated_card_id) => {
                assert_eq!(violated_card_id, *card.card_id());
            },
            _ => panic!("Expected CardUsageLimitExceeded"),
        }

        // 存在しないイベントの解決テスト
        let non_existent_event = EventId::new();
        let result = engine.resolve_event_effects(&non_existent_event, &context);
        assert!(result.is_err());
        match result.unwrap_err() {
            RuleViolation::EventNotAllowed(event_id) => {
                assert_eq!(event_id, non_existent_event);
            },
            _ => panic!("Expected EventNotAllowed"),
        }
    }
}