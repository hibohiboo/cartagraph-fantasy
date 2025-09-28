use super::super::value_objects::*;
use super::SessionPlayer;
use std::collections::HashMap;
use chrono::{DateTime, Utc};

// ドメインエンティティ：純粋なビジネスロジック（インフラ依存なし）
#[derive(Debug, Clone)]
pub struct GameSession {
    // Identity
    pub session_id: SessionId,

    // Session Context
    pub scenario_id: ScenarioId,
    pub gm_user_id: UserId,
    pub created_at: DateTime<Utc>,

    // Players & Characters
    pub players: HashMap<PlayerId, SessionPlayer>,
    pub max_players: usize,

    // Game State
    pub current_scene: SceneId,
    pub session_status: SessionStatus,
    pub shared_cards: Vec<Card>,        // セッション共有カード
    pub available_choices: Vec<CardId>, // 現在利用可能な選択肢カード

    // Event History (Event Sourcing)
    pub version: u64,
}

impl GameSession {
    // ドメインロジック：セッション作成
    pub fn create(session_id: SessionId, scenario_id: ScenarioId, gm_user_id: UserId) -> Self {
        Self {
            session_id,
            scenario_id,
            gm_user_id,
            created_at: chrono::Utc::now(),
            players: HashMap::new(),
            max_players: 4, // デフォルト値
            current_scene: SceneId::new(), // 仮値
            session_status: SessionStatus::WaitingForPlayers,
            shared_cards: Vec::new(),
            available_choices: Vec::new(),
            version: 1,
        }
    }

    // ドメインロジック：ステータス取得
    pub fn status(&self) -> &SessionStatus {
        &self.session_status
    }

    // ドメインロジック：プレイヤー追加
    pub fn add_player(&mut self, player_id: PlayerId, user_id: UserId) -> Result<(), String> {
        if self.players.contains_key(&player_id) {
            return Err("Player already exists in session".to_string());
        }

        if self.players.len() >= self.max_players {
            return Err("Session is full".to_string());
        }

        let session_player = SessionPlayer::new(player_id.clone(), user_id);
        self.players.insert(player_id, session_player);
        self.version += 1;
        Ok(())
    }

    // ドメインロジック：プレイヤー数
    pub fn player_count(&self) -> usize {
        self.players.len()
    }

    // ドメインロジック：プレイヤー存在確認
    pub fn has_player(&self, player_id: &PlayerId) -> bool {
        self.players.contains_key(player_id)
    }

    // ドメインロジック：セッション開始
    pub fn start(&mut self) -> Result<(), String> {
        if self.players.is_empty() {
            return Err("Cannot start session without players".to_string());
        }

        let active_players = self.players.keys().cloned().collect();
        self.session_status = SessionStatus::InProgress {
            current_scene: self.current_scene.clone(),
            active_players,
        };
        self.version += 1;
        Ok(())
    }

    // ドメインロジック：アクティブプレイヤー取得
    pub fn get_active_players(&self) -> std::collections::HashSet<PlayerId> {
        match &self.session_status {
            SessionStatus::InProgress { active_players, .. } => active_players.clone(),
            _ => self.players.keys().cloned().collect(),
        }
    }

    // ドメインロジック：プレイヤー削除
    pub fn remove_player(&mut self, player_id: &PlayerId) -> Result<(), String> {
        if !self.players.contains_key(player_id) {
            return Err("Player not found in session".to_string());
        }

        self.players.remove(player_id);
        self.version += 1;
        Ok(())
    }

    // ドメインロジック：プレイヤーステータス変更
    pub fn change_player_status(&mut self, player_id: &PlayerId, new_status: PlayerStatus) -> Result<(), String> {
        let player = self.players.get_mut(player_id)
            .ok_or("Player not found in session")?;

        player.change_status(new_status);
        self.version += 1;
        Ok(())
    }

    // ドメインロジック：共有カード追加
    pub fn add_shared_card(&mut self, card: Card) {
        self.shared_cards.push(card);
        self.version += 1;
    }

    // ドメインロジック：選択肢カード設定
    pub fn set_available_choices(&mut self, choice_cards: Vec<CardId>) {
        self.available_choices = choice_cards;
        self.version += 1;
    }

    // ドメインロジック：カード使用
    pub fn use_card(&mut self, player_id: &PlayerId, card: &Card) -> Result<(), String> {
        // プレイヤーがセッションに参加しているかチェック
        if !self.players.contains_key(player_id) {
            return Err("Player not found in session".to_string());
        }

        // カード使用コンテキストの作成
        let context = CardUsageContext {
            player_tags: vec![], // TODO: 実際のプレイヤータグを取得
            available_choices: self.available_choices.clone(),
            scene_context: SceneContext::Action, // TODO: 実際のシーンコンテキストを判定
        };

        // カード使用可能性の検証
        card.can_be_used_in_context(&context)
            .map_err(|e| format!("Card usage error: {:?}", e))?;

        // カード使用処理（イベント記録など）
        self.version += 1;
        Ok(())
    }

    // ドメインロジック：共有カードの取得
    pub fn get_shared_cards(&self) -> &[Card] {
        &self.shared_cards
    }

    // ドメインロジック：利用可能選択肢の取得
    pub fn get_available_choices(&self) -> &[CardId] {
        &self.available_choices
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_game_session_card_integration() {
        // TDDサイクル7: GameSession & Card/Tag統合テスト

        // セッション作成
        let mut session = GameSession::create(
            SessionId::new(),
            ScenarioId::new(),
            UserId::new(),
        );

        // プレイヤー追加
        let player_id = PlayerId::new();
        let user_id = UserId::new();
        session.add_player(player_id.clone(), user_id.clone()).unwrap();

        // 共有カード追加
        let action_card = Card::new(
            CardId::from_string("action_001".to_string()),
            "攻撃".to_string(),
            RuntimeCardType::Action,
            vec![],
            vec![],
            RuntimeCardRarity::Common,
        );

        let choice_card = Card::new(
            CardId::from_string("choice_001".to_string()),
            "選択A".to_string(),
            RuntimeCardType::Choice,
            vec![],
            vec![],
            RuntimeCardRarity::Common,
        );

        session.add_shared_card(action_card.clone());
        session.add_shared_card(choice_card.clone());

        // 共有カードが正しく追加されたことを確認
        assert_eq!(session.get_shared_cards().len(), 2);
        assert_eq!(session.get_shared_cards()[0].name(), "攻撃");
        assert_eq!(session.get_shared_cards()[1].name(), "選択A");

        // 選択肢カードを利用可能に設定
        session.set_available_choices(vec![choice_card.card_id().clone()]);
        assert_eq!(session.get_available_choices().len(), 1);

        // セッション開始
        session.start().unwrap();

        // カード使用テスト - アクションカード使用成功
        let result = session.use_card(&player_id, &action_card);
        assert!(result.is_ok());

        // カード使用テスト - 選択肢カード使用（利用可能ではないため失敗）
        // （現在のuse_cardは常にSceneContext::Actionなので失敗）
        let result = session.use_card(&player_id, &choice_card);
        assert!(result.is_err());

        // 存在しないプレイヤーによるカード使用 - 失敗
        let non_existent_player = PlayerId::new();
        let result = session.use_card(&non_existent_player, &action_card);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Player not found"));
    }
}