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
}