use crate::domain::value_objects::identifiers::{CardId, EventId, TagId};

/// Card Value Object - ゲーム内カードの不変表現
#[derive(Debug, Clone, PartialEq)]
pub struct Card {
    card_id: CardId,
    name: String,
    card_type: RuntimeCardType,
    tags: Vec<TagId>,
    embedded_events: Vec<EventId>,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum RuntimeCardType {
    Action,           // アクション用カード
    Choice,          // 選択肢カード
    Possession,      // 所持カード
    SceneTransition, // シーン移動カード
}


impl Card {
    pub fn new(
        card_id: CardId,
        name: String,
        card_type: RuntimeCardType,
        tags: Vec<TagId>,
        embedded_events: Vec<EventId>,
    ) -> Self {
        Self {
            card_id,
            name,
            card_type,
            tags,
            embedded_events,
        }
    }

    pub fn card_id(&self) -> &CardId {
        &self.card_id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn card_type(&self) -> &RuntimeCardType {
        &self.card_type
    }

    pub fn tags(&self) -> &[TagId] {
        &self.tags
    }

    pub fn embedded_events(&self) -> &[EventId] {
        &self.embedded_events
    }


    /// カードが指定されたタグを持っているかチェック
    pub fn has_tag(&self, tag_id: &TagId) -> bool {
        self.tags.contains(tag_id)
    }

    /// カードが使用可能な状況かを検証
    pub fn can_be_used_in_context(&self, context: &CardUsageContext) -> Result<(), CardUsageError> {
        // カードタイプとシーンコンテキストの整合性チェック
        match (&self.card_type, &context.scene_context) {
            (RuntimeCardType::Action, SceneContext::Action) => Ok(()),
            (RuntimeCardType::Choice, SceneContext::Choice) => {
                // 選択肢カードが利用可能かチェック
                if context.available_choices.contains(&self.card_id) {
                    Ok(())
                } else {
                    Err(CardUsageError::InvalidContext)
                }
            },
            (RuntimeCardType::SceneTransition, SceneContext::SceneEnd) => Ok(()),
            (RuntimeCardType::Possession, _) => Ok(()), // 所持カードは常に使用可能
            _ => Err(CardUsageError::WrongCardType),
        }
    }
}

/// カード使用コンテキスト
#[derive(Debug)]
pub struct CardUsageContext {
    pub player_tags: Vec<TagId>,
    pub available_choices: Vec<CardId>,
    pub scene_context: SceneContext,
}

#[derive(Debug, Clone, PartialEq)]
pub enum SceneContext {
    Action,      // アクション可能なシーン
    Choice,      // 選択肢選択中
    SceneEnd,    // シーン終了時
}

/// カード使用エラー
#[derive(Debug, Clone, PartialEq)]
pub enum CardUsageError {
    InvalidContext,
    MissingRequiredTags,
    AlreadyUsed,
    WrongCardType, // カードタイプがコンテキストに適さない
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_card_creation_basic() {
        // TDDサイクル1: 最小ケース - 基本的なカード作成
        let card_id = CardId::from_string("card_001".to_string());
        let name = "基本攻撃".to_string();
        let card_type = RuntimeCardType::Action;
        let tags = vec![];
        let embedded_events = vec![];

        let card = Card::new(card_id.clone(), name.clone(), card_type.clone(), tags, embedded_events);

        assert_eq!(card.card_id(), &card_id);
        assert_eq!(card.name(), &name);
        assert_eq!(card.card_type(), &card_type);
        assert_eq!(card.tags().len(), 0);
        assert_eq!(card.embedded_events().len(), 0);
    }

    #[test]
    fn test_card_has_tag() {
        // TDDサイクル2: タグ所持チェック機能
        let tag_id_1 = TagId::new();
        let tag_id_2 = TagId::new();

        let card = Card::new(
            CardId::from_string("card_002".to_string()),
            "スキルカード".to_string(),
            RuntimeCardType::Action,
            vec![tag_id_1.clone()],
            vec![],
        );

        // 所持しているタグ
        assert!(card.has_tag(&tag_id_1));
        // 所持していないタグ
        assert!(!card.has_tag(&tag_id_2));
    }

    #[test]
    fn test_card_usage_validation() {
        // TDDサイクル5: カード使用検証ロジック
        let action_card = Card::new(
            CardId::from_string("action_card".to_string()),
            "攻撃".to_string(),
            RuntimeCardType::Action,
            vec![],
            vec![],
        );

        let choice_card = Card::new(
            CardId::from_string("choice_card".to_string()),
            "選択A".to_string(),
            RuntimeCardType::Choice,
            vec![],
            vec![],
        );

        // アクションコンテキストでのアクションカード使用 - 成功
        let action_context = CardUsageContext {
            player_tags: vec![],
            available_choices: vec![],
            scene_context: SceneContext::Action,
        };
        assert!(action_card.can_be_used_in_context(&action_context).is_ok());

        // アクションコンテキストでの選択肢カード使用 - 失敗
        let result = choice_card.can_be_used_in_context(&action_context);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), CardUsageError::WrongCardType);

        // 選択肢コンテキストでの選択肢カード使用 - 成功
        let choice_context = CardUsageContext {
            player_tags: vec![],
            available_choices: vec![choice_card.card_id().clone()],
            scene_context: SceneContext::Choice,
        };
        assert!(choice_card.can_be_used_in_context(&choice_context).is_ok());
    }
}