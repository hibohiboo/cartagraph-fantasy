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

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct SessionPlayer {
    pub player_id: PlayerId,
    pub user_id: UserId,
    pub character: SessionCharacter,
    pub status: PlayerStatus,
    #[ts(type = "string")]
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum PlayerStatus {
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