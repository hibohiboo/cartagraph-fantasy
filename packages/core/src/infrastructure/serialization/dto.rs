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
    pub shared_cards: Vec<CardDto>,
    pub available_choices: Vec<String>,
    pub version: u32,
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
            shared_cards: session.shared_cards.iter().map(|card| card.into()).collect(),
            available_choices: session.available_choices.iter().map(|choice| choice.0.clone()).collect(),
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

// DTO → ドメイン変換（逆方向）
impl From<GameSessionDto> for GameSession {
    fn from(dto: GameSessionDto) -> Self {
        Self {
            session_id: SessionId::from_string(dto.session_id),
            scenario_id: ScenarioId::from_string(dto.scenario_id),
            gm_user_id: UserId::from_string(dto.gm_user_id),
            created_at: dto.created_at,
            players: dto.players.into_iter()
                .map(|(k, v)| (PlayerId::from_string(k), v.into()))
                .collect(),
            max_players: dto.max_players,
            current_scene: SceneId::from_string(dto.current_scene),
            session_status: dto.session_status.into(),
            shared_cards: dto.shared_cards.into_iter().map(|card| card.into()).collect(),
            available_choices: dto.available_choices.into_iter().map(CardId::from_string).collect(),
            version: dto.version,
        }
    }
}

impl From<SessionPlayerDto> for SessionPlayer {
    fn from(dto: SessionPlayerDto) -> Self {
        Self {
            id: PlayerId::from_string(dto.id),
            user_id: UserId::from_string(dto.user_id),
            character: dto.character.map(CharacterId::from_string),
            status: dto.status.into(),
            joined_at: dto.joined_at,
        }
    }
}

impl From<SessionStatusDto> for SessionStatus {
    fn from(dto: SessionStatusDto) -> Self {
        match dto {
            SessionStatusDto::Created => SessionStatus::Created,
            SessionStatusDto::WaitingForPlayers => SessionStatus::WaitingForPlayers,
            SessionStatusDto::Recruiting => SessionStatus::Recruiting,
            SessionStatusDto::Starting => SessionStatus::Starting,
            SessionStatusDto::InProgress { current_scene, active_players } => {
                SessionStatus::InProgress {
                    current_scene: SceneId::from_string(current_scene),
                    active_players: active_players.into_iter().map(PlayerId::from_string).collect(),
                }
            }
            SessionStatusDto::Paused => SessionStatus::Paused,
            SessionStatusDto::Completed => SessionStatus::Completed,
            SessionStatusDto::Terminated => SessionStatus::Terminated,
        }
    }
}

impl From<PlayerStatusDto> for PlayerStatus {
    fn from(dto: PlayerStatusDto) -> Self {
        match dto {
            PlayerStatusDto::Waiting => PlayerStatus::Waiting,
            PlayerStatusDto::Active => PlayerStatus::Active,
            PlayerStatusDto::Inactive { duration_minutes } => PlayerStatus::Inactive { duration_minutes },
            PlayerStatusDto::Departed => PlayerStatus::Departed,
        }
    }
}

// Character DTO定義
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CharacterDto {
    pub character_id: String,
    pub name: String,
    pub player_id: String,
    pub personal_cards: Vec<String>, // CardId as string
    pub acquired_tags: Vec<String>,  // TagId as string
    pub session_history: Vec<SessionRecordDto>,
    pub scenario_restrictions: HashMap<String, String>, // ScenarioId -> RestrictionReason
    #[ts(type = "string")]
    pub created_at: DateTime<Utc>,
    #[ts(type = "string")]
    pub last_updated: DateTime<Utc>,
    pub version: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SessionRecordDto {
    pub session_id: String,
    pub scenario_id: String,
    #[ts(type = "string")]
    pub participated_at: DateTime<Utc>,
    pub final_tags: Vec<String>,  // TagId as string
    pub final_cards: Vec<String>, // CardId as string
    pub feedback: Option<String>,
}

// Character変換ロジック
impl From<Character> for CharacterDto {
    fn from(character: Character) -> Self {
        Self {
            character_id: character.character_id.0,
            name: character.name,
            player_id: character.player_id.0,
            personal_cards: character.personal_cards.into_iter().map(|c| c.card_id.0).collect(),
            acquired_tags: character.acquired_tags.into_iter().map(|t| t.tag_id.0).collect(),
            session_history: character.session_history.into_iter().map(SessionRecordDto::from).collect(),
            scenario_restrictions: character.scenario_restrictions.into_iter()
                .map(|(k, v)| (k.0, format!("{:?}", v)))
                .collect(),
            created_at: character.created_at,
            last_updated: character.last_updated,
            version: character.version,
        }
    }
}

impl From<CharacterDto> for Character {
    fn from(dto: CharacterDto) -> Self {
        Self {
            character_id: CharacterId::from_string(dto.character_id),
            name: dto.name,
            player_id: UserId::from_string(dto.player_id),
            personal_cards: Vec::new(), // 簡略化: 実際の実装では CardId から Card を復元する必要あり
            acquired_tags: Vec::new(),  // 簡略化: 実際の実装では TagId から Tag を復元する必要あり
            session_history: dto.session_history.into_iter().map(crate::types::SessionRecord::from).collect(),
            scenario_restrictions: HashMap::new(), // 簡略化: RestrictionReason のパース必要
            created_at: dto.created_at,
            last_updated: dto.last_updated,
            version: dto.version,
        }
    }
}

impl From<crate::types::SessionRecord> for SessionRecordDto {
    fn from(record: crate::types::SessionRecord) -> Self {
        Self {
            session_id: record.session_id.0,
            scenario_id: record.scenario_id.0,
            participated_at: record.participated_at,
            final_tags: record.final_tags.into_iter().map(|t| t.tag_id.0).collect(),
            final_cards: record.final_cards.into_iter().map(|c| c.card_id.0).collect(),
            feedback: record.feedback,
        }
    }
}

impl From<SessionRecordDto> for crate::types::SessionRecord {
    fn from(dto: SessionRecordDto) -> Self {
        Self {
            session_id: crate::types::SessionId::from_string(dto.session_id),
            scenario_id: crate::types::ScenarioId::from_string(dto.scenario_id),
            participated_at: dto.participated_at,
            final_tags: Vec::new(), // 簡略化: TagId から Tag を復元する必要あり
            final_cards: Vec::new(), // 簡略化: CardId から Card を復元する必要あり
            feedback: dto.feedback,
        }
    }
}

// ScenarioTemplate DTO
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ScenarioTemplateDto {
    pub scenario_id: String,
    pub name: String,
    pub description: String,
    pub author_id: String,
    pub recommended_players: PlayerRangeDto,
    pub estimated_duration_secs: u64,
    pub difficulty: DifficultyDto,
    pub scenes: HashMap<String, SceneDefinitionDto>,
    pub initial_scene_id: Option<String>,
    pub shared_cards: Vec<CardTemplateDto>,
    #[ts(type = "string")]
    pub created_at: DateTime<Utc>,
    #[ts(type = "string")]
    pub last_updated: DateTime<Utc>,
    pub version: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct PlayerRangeDto {
    pub min: usize,
    pub max: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum DifficultyDto {
    Beginner,
    Intermediate,
    Advanced,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SceneDefinitionDto {
    pub scene_id: String,
    pub name: String,
    pub description: String,
    pub objectives: Vec<String>,
    pub completion_conditions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CardTemplateDto {
    pub card_id: String,
    pub name: String,
    pub description: String,
    pub card_type: CardTypeDto,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum CardTypeDto {
    Action,
    Resource,
    Event,
    Skill,
}


// ScenarioTemplate: ドメイン → DTO変換
impl From<&crate::domain::entities::ScenarioTemplate> for ScenarioTemplateDto {
    fn from(scenario: &crate::domain::entities::ScenarioTemplate) -> Self {
        Self {
            scenario_id: scenario.scenario_id.0.clone(),
            name: scenario.name.clone(),
            description: scenario.description.clone(),
            author_id: scenario.author_id.0.clone(),
            recommended_players: PlayerRangeDto {
                min: scenario.recommended_players.min,
                max: scenario.recommended_players.max,
            },
            estimated_duration_secs: scenario.estimated_duration.as_secs(),
            difficulty: match scenario.difficulty {
                crate::domain::entities::Difficulty::Beginner => DifficultyDto::Beginner,
                crate::domain::entities::Difficulty::Intermediate => DifficultyDto::Intermediate,
                crate::domain::entities::Difficulty::Advanced => DifficultyDto::Advanced,
            },
            scenes: scenario.scenes.iter().map(|(id, scene)| {
                (id.0.clone(), SceneDefinitionDto {
                    scene_id: scene.scene_id.0.clone(),
                    name: scene.name.clone(),
                    description: scene.description.clone(),
                    objectives: scene.objectives.clone(),
                    completion_conditions: scene.completion_conditions.clone(),
                })
            }).collect(),
            initial_scene_id: scenario.initial_scene_id.as_ref().map(|id| id.0.clone()),
            shared_cards: scenario.shared_cards.iter().map(|card| CardTemplateDto {
                card_id: card.card_id.0.clone(),
                name: card.name.clone(),
                description: card.description.clone(),
                card_type: match card.card_type {
                    crate::domain::entities::TemplateCardType::Action => CardTypeDto::Action,
                    crate::domain::entities::TemplateCardType::Resource => CardTypeDto::Resource,
                    crate::domain::entities::TemplateCardType::Event => CardTypeDto::Event,
                    crate::domain::entities::TemplateCardType::Skill => CardTypeDto::Skill,
                },
            }).collect(),
            created_at: scenario.created_at,
            last_updated: scenario.last_updated,
            version: scenario.version,
        }
    }
}

// ScenarioTemplate: DTO → ドメイン変換
impl From<ScenarioTemplateDto> for crate::domain::entities::ScenarioTemplate {
    fn from(dto: ScenarioTemplateDto) -> Self {
        Self {
            scenario_id: crate::domain::value_objects::ScenarioId::from_string(dto.scenario_id),
            name: dto.name,
            description: dto.description,
            author_id: crate::domain::value_objects::UserId::from_string(dto.author_id),
            recommended_players: crate::domain::entities::PlayerRange {
                min: dto.recommended_players.min,
                max: dto.recommended_players.max,
            },
            estimated_duration: std::time::Duration::from_secs(dto.estimated_duration_secs),
            difficulty: match dto.difficulty {
                DifficultyDto::Beginner => crate::domain::entities::Difficulty::Beginner,
                DifficultyDto::Intermediate => crate::domain::entities::Difficulty::Intermediate,
                DifficultyDto::Advanced => crate::domain::entities::Difficulty::Advanced,
            },
            scenes: dto.scenes.into_iter().map(|(id, scene_dto)| {
                (crate::domain::value_objects::SceneId::from_string(id), crate::domain::entities::SceneDefinition {
                    scene_id: crate::domain::value_objects::SceneId::from_string(scene_dto.scene_id),
                    name: scene_dto.name,
                    description: scene_dto.description,
                    objectives: scene_dto.objectives,
                    completion_conditions: scene_dto.completion_conditions,
                })
            }).collect(),
            initial_scene_id: dto.initial_scene_id.map(crate::domain::value_objects::SceneId::from_string),
            shared_cards: dto.shared_cards.into_iter().map(|card_dto| crate::domain::entities::CardTemplate {
                card_id: crate::domain::value_objects::CardId::from_string(card_dto.card_id),
                name: card_dto.name,
                description: card_dto.description,
                card_type: match card_dto.card_type {
                    CardTypeDto::Action => crate::domain::entities::TemplateCardType::Action,
                    CardTypeDto::Resource => crate::domain::entities::TemplateCardType::Resource,
                    CardTypeDto::Event => crate::domain::entities::TemplateCardType::Event,
                    CardTypeDto::Skill => crate::domain::entities::TemplateCardType::Skill,
                },
            }).collect(),
            created_at: dto.created_at,
            last_updated: dto.last_updated,
            version: dto.version,
        }
    }
}

// Card/Tag DTO (GameSession用)
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CardDto {
    pub card_id: String,
    pub name: String,
    pub card_type: CardTypeValueObjectDto,
    pub tags: Vec<String>,
    pub embedded_events: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum CardTypeValueObjectDto {
    Action,
    Choice,
    Possession,
    SceneTransition,
}


// Card: ドメイン → DTO変換
impl From<&crate::domain::value_objects::Card> for CardDto {
    fn from(card: &crate::domain::value_objects::Card) -> Self {
        Self {
            card_id: card.card_id().0.clone(),
            name: card.name().to_string(),
            card_type: match card.card_type() {
                crate::domain::value_objects::RuntimeCardType::Action => CardTypeValueObjectDto::Action,
                crate::domain::value_objects::RuntimeCardType::Choice => CardTypeValueObjectDto::Choice,
                crate::domain::value_objects::RuntimeCardType::Possession => CardTypeValueObjectDto::Possession,
                crate::domain::value_objects::RuntimeCardType::SceneTransition => CardTypeValueObjectDto::SceneTransition,
            },
            tags: card.tags().iter().map(|tag| tag.0.clone()).collect(),
            embedded_events: card.embedded_events().iter().map(|event| event.0.clone()).collect(),
        }
    }
}

// Card: DTO → ドメイン変換
impl From<CardDto> for crate::domain::value_objects::Card {
    fn from(dto: CardDto) -> Self {
        Self::new(
            crate::domain::value_objects::CardId::from_string(dto.card_id),
            dto.name,
            match dto.card_type {
                CardTypeValueObjectDto::Action => crate::domain::value_objects::RuntimeCardType::Action,
                CardTypeValueObjectDto::Choice => crate::domain::value_objects::RuntimeCardType::Choice,
                CardTypeValueObjectDto::Possession => crate::domain::value_objects::RuntimeCardType::Possession,
                CardTypeValueObjectDto::SceneTransition => crate::domain::value_objects::RuntimeCardType::SceneTransition,
            },
            dto.tags.into_iter().map(crate::domain::value_objects::TagId::from_string).collect(),
            dto.embedded_events.into_iter().map(crate::domain::value_objects::EventId::from_string).collect(),
        )
    }
}
