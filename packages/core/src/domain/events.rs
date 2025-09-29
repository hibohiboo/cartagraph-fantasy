use serde::{Deserialize, Serialize};
use ts_rs::TS;
use chrono::{DateTime, Utc};
use crate::types::*;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct DomainEvent {
    pub event_id: EventId,
    pub session_id: SessionId,
    #[ts(type = "string")]
    pub timestamp: DateTime<Utc>,
    pub event_type: GameSessionEvent,
    pub version: u64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum GameSessionEvent {
    #[serde(rename = "session_created")]
    SessionCreated {
        scenario_id: ScenarioId,
        gm_user_id: UserId,
    },
    #[serde(rename = "player_added")]
    PlayerAdded {
        player_id: PlayerId,
        user_id: UserId,
    },
    #[serde(rename = "session_started")]
    SessionStarted {
        current_scene: SceneId,
    },
    #[serde(rename = "session_status_changed")]
    SessionStatusChanged {
        new_status: SessionStatus,
    },
}

impl DomainEvent {
    pub fn new(session_id: SessionId, event_type: GameSessionEvent, version: u64) -> Self {
        Self {
            event_id: EventId::new(),
            session_id,
            timestamp: chrono::Utc::now(),
            event_type,
            version,
        }
    }
}