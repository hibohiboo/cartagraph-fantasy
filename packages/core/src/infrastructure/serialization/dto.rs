// インフラ層：DTO（Data Transfer Object）- シリアライゼーション用
use serde::{Deserialize, Serialize};
use ts_rs::TS;
use chrono::{DateTime, Utc};
use std::collections::{HashMap, HashSet};
use crate::domain::*;

// DTO: ドメインエンティティのシリアライゼーション表現
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GameSessionDto {
    pub session_id: String,
    pub scenario_id: String,
    pub gm_user_id: String,
    #[ts(type = "string")]
    pub created_at: DateTime<Utc>,
    pub players: HashMap<String, SessionPlayerDto>,
    pub max_players: usize,
    pub current_scene: String,
    pub session_status: SessionStatusDto,
    pub version: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SessionPlayerDto {
    pub id: String,
    pub user_id: String,
    pub character: Option<String>,
    pub status: PlayerStatusDto,
    #[ts(type = "string")]
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum SessionStatusDto {
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
        current_scene: String,
        active_players: HashSet<String>,
    },
    #[serde(rename = "paused")]
    Paused,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "terminated")]
    Terminated,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum PlayerStatusDto {
    #[serde(rename = "waiting")]
    Waiting,
    #[serde(rename = "active")]
    Active,
    #[serde(rename = "inactive")]
    Inactive { duration_minutes: u32 },
    #[serde(rename = "departed")]
    Departed,
}

// ドメイン ↔ DTO変換
impl From<&GameSession> for GameSessionDto {
    fn from(session: &GameSession) -> Self {
        Self {
            session_id: session.session_id.0.clone(),
            scenario_id: session.scenario_id.0.clone(),
            gm_user_id: session.gm_user_id.0.clone(),
            created_at: session.created_at,
            players: session.players.iter()
                .map(|(k, v)| (k.0.clone(), v.into()))
                .collect(),
            max_players: session.max_players,
            current_scene: session.current_scene.0.clone(),
            session_status: (&session.session_status).into(),
            version: session.version,
        }
    }
}

impl From<&SessionPlayer> for SessionPlayerDto {
    fn from(player: &SessionPlayer) -> Self {
        Self {
            id: player.id.0.clone(),
            user_id: player.user_id.0.clone(),
            character: player.character.as_ref().map(|c| c.0.clone()),
            status: (&player.status).into(),
            joined_at: player.joined_at,
        }
    }
}

impl From<&SessionStatus> for SessionStatusDto {
    fn from(status: &SessionStatus) -> Self {
        match status {
            SessionStatus::Created => SessionStatusDto::Created,
            SessionStatus::WaitingForPlayers => SessionStatusDto::WaitingForPlayers,
            SessionStatus::Recruiting => SessionStatusDto::Recruiting,
            SessionStatus::Starting => SessionStatusDto::Starting,
            SessionStatus::InProgress { current_scene, active_players } => {
                SessionStatusDto::InProgress {
                    current_scene: current_scene.0.clone(),
                    active_players: active_players.iter().map(|p| p.0.clone()).collect(),
                }
            }
            SessionStatus::Paused => SessionStatusDto::Paused,
            SessionStatus::Completed => SessionStatusDto::Completed,
            SessionStatus::Terminated => SessionStatusDto::Terminated,
        }
    }
}

impl From<&PlayerStatus> for PlayerStatusDto {
    fn from(status: &PlayerStatus) -> Self {
        match status {
            PlayerStatus::Waiting => PlayerStatusDto::Waiting,
            PlayerStatus::Active => PlayerStatusDto::Active,
            PlayerStatus::Inactive { duration_minutes } => PlayerStatusDto::Inactive { duration_minutes: *duration_minutes },
            PlayerStatus::Departed => PlayerStatusDto::Departed,
        }
    }
}