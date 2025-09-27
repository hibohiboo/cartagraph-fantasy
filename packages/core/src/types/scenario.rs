use serde::{Deserialize, Serialize};
use ts_rs::TS;
use std::collections::HashMap;
use super::{ScenarioId, UserId, SceneId, EventId, CardTemplate};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ScenarioTemplate {
    // Identity
    pub scenario_id: ScenarioId,

    // Metadata
    pub name: String,
    pub description: String,
    pub author_id: UserId,
    pub version: String,

    // Game Design
    pub recommended_players: PlayerRange,
    pub estimated_duration_minutes: u32,
    pub difficulty: Difficulty,
    pub tags: Vec<String>,

    // Structure
    pub scenes: HashMap<SceneId, SceneDefinition>,
    pub initial_scene_id: SceneId,

    // Resources
    pub shared_cards: Vec<CardTemplate>,

    // Derivation
    pub derived_from: Option<ScenarioId>,

    // Versioning
    pub version_number: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SceneDefinition {
    pub scene_id: SceneId,
    pub name: String,
    pub description: String,
    pub objective: String,
    pub completion_condition: CompletionCondition,
    pub events: HashMap<EventId, EventDefinition>,
    pub transitions: Vec<SceneTransition>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct EventDefinition {
    pub event_id: EventId,
    pub name: String,
    pub event_type: EventType,
    pub triggers: Vec<EventTrigger>,
    pub effects: Vec<EventEffect>,
    pub message: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct PlayerRange {
    pub min: usize,
    pub max: usize,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum Difficulty {
    #[serde(rename = "beginner")]
    Beginner,
    #[serde(rename = "intermediate")]
    Intermediate,
    #[serde(rename = "advanced")]
    Advanced,
    #[serde(rename = "expert")]
    Expert,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum EventType {
    #[serde(rename = "narrative")]
    Narrative,        // 物語進行イベント
    #[serde(rename = "action")]
    Action,          // 行動判定イベント
    #[serde(rename = "possession")]
    Possession,      // 所持判定イベント
    #[serde(rename = "scene_transition")]
    SceneTransition, // シーン移動イベント
    #[serde(rename = "card_distribution")]
    CardDistribution, // カード配布イベント
}

// プレースホルダー型（詳細は後で実装）
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CompletionCondition {
    pub condition_type: String,
    pub parameters: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SceneTransition {
    pub from_scene: SceneId,
    pub to_scene: SceneId,
    pub condition: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct EventTrigger {
    pub trigger_type: String,
    pub parameters: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct EventEffect {
    pub effect_type: String,
    pub parameters: HashMap<String, String>,
}