use serde::{Deserialize, Serialize};
use ts_rs::TS;
use chrono::{DateTime, Utc};
use super::{CharacterId, UserId, SessionId, ScenarioId, Card, Tag};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct Character {
    pub character_id: CharacterId,
    pub name: String,
    pub player_id: UserId,
    pub personal_cards: Vec<Card>,
    pub acquired_tags: Vec<Tag>,
    pub session_history: Vec<SessionRecord>,
    pub scenario_restrictions: std::collections::HashMap<ScenarioId, RestrictionReason>,
    #[ts(type = "string")]
    pub created_at: DateTime<Utc>,
    #[ts(type = "string")]
    pub last_updated: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct SessionRecord {
    pub session_id: SessionId,
    pub scenario_id: ScenarioId,
    #[ts(type = "string")]
    pub participated_at: DateTime<Utc>,
    pub final_tags: Vec<Tag>,
    pub final_cards: Vec<Card>,
    pub feedback: Option<String>,
}

// セッション専用キャラクターコピー
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct SessionCharacter {
    pub character_id: CharacterId,
    pub name: String,
    pub session_cards: Vec<Card>, // 持ち込み + セッション配布
    pub session_tags: Vec<Tag>,   // 初期 + セッション獲得
    pub status: CharacterStatus,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum CharacterStatus {
    #[serde(rename = "ready")]
    Ready,
    #[serde(rename = "in_action")]
    InAction,
    #[serde(rename = "waiting_for_input")]
    WaitingForInput,
    #[serde(rename = "incapacitated")]
    Incapacitated,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum RestrictionReason {
    #[serde(rename = "already_completed")]
    AlreadyCompleted,
    #[serde(rename = "incompatible_tags")]
    IncompatibleTags,
    #[serde(rename = "scenario_limited")]
    ScenarioLimited,
}

// キャラクター作成リクエスト
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct CreateCharacterRequest {
    pub name: String,
    pub player_id: UserId,
    pub initial_cards: Option<Vec<Card>>,
    pub initial_tags: Option<Vec<Tag>>,
}