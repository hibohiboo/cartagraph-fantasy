use serde::{Deserialize, Serialize};
use ts_rs::TS;
use chrono::{DateTime, Utc};
use std::collections::{HashMap, HashSet};
use super::{SessionId, UserId, PlayerId, ScenarioId, SceneId, SessionCharacter, Card};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct GameSession {
    // Identity
    pub session_id: SessionId,

    // Session Context
    pub scenario_id: ScenarioId,
    pub gm_user_id: UserId,
    #[ts(type = "string")]
    pub created_at: DateTime<Utc>,

    // Players & Characters
    pub players: HashMap<PlayerId, SessionPlayer>,
    pub max_players: usize,

    // Game State
    pub current_scene: SceneId,
    pub shared_cards: Vec<Card>,
    pub session_status: SessionStatus,

    // Event History (Event Sourcing)
    pub version: u64,
}

impl GameSession {
    // TDD: 最小実装でテストを通す
    pub fn create(session_id: SessionId, scenario_id: ScenarioId) -> Self {
        Self {
            session_id,
            scenario_id,
            gm_user_id: UserId::new(), // 仮値
            created_at: chrono::Utc::now(),
            players: HashMap::new(),
            max_players: 4, // デフォルト値
            current_scene: SceneId::new(), // 仮値
            shared_cards: Vec::new(),
            session_status: SessionStatus::WaitingForPlayers,
            version: 0,
        }
    }

    pub fn status(&self) -> SessionStatus {
        self.session_status.clone()
    }

    // TDD 2nd cycle: プレイヤー追加の最小実装
    pub fn add_player(&mut self, player_id: PlayerId, user_id: UserId) -> Result<(), String> {
        // 最小実装: 単純にプレイヤーを追加
        let session_player = SessionPlayer {
            id: player_id.clone(),
            user_id,
            character: None, // 初期状態ではキャラクター未選択
            status: PlayerStatus::Waiting,
            joined_at: chrono::Utc::now(),
        };

        self.players.insert(player_id, session_player);
        Ok(())
    }

    pub fn player_count(&self) -> usize {
        self.players.len()
    }

    pub fn has_player(&self, player_id: &PlayerId) -> bool {
        self.players.contains_key(player_id)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct SessionPlayer {
    pub id: PlayerId,
    pub user_id: UserId,
    pub character: Option<SessionCharacter>, // キャラクター選択は任意
    pub status: PlayerStatus,
    #[ts(type = "string")]
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum PlayerStatus {
    #[serde(rename = "waiting")]
    Waiting, // TDD用: プレイヤー待機状態
    #[serde(rename = "active")]
    Active,
    #[serde(rename = "inactive")]
    Inactive { duration_minutes: u32 },
    #[serde(rename = "departed")]
    Departed,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum SessionStatus {
    #[serde(rename = "created")]
    Created,
    #[serde(rename = "waiting_for_players")]
    WaitingForPlayers,
    #[serde(rename = "recruiting")]
    Recruiting,
    #[serde(rename = "starting")]
    Starting,
    #[serde(rename = "in_progress")]
    InProgress {
        current_scene: SceneId,
        active_players: HashSet<PlayerId>,
    },
    #[serde(rename = "paused")]
    Paused,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "terminated")]
    Terminated,
}