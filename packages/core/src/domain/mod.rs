// オニオンアーキテクチャ：ドメイン層（最内層）
pub mod entities;
pub mod value_objects;
pub mod events;
pub mod services;

// ドメインエンティティと値オブジェクトを公開（曖昧さ回避のため明示的にインポート）
pub use entities::{
    GameSession, Character, ScenarioTemplate, SessionPlayer,
    SceneDefinition, PlayerRange, Difficulty,
    CardTemplate, TemplateCardType,
};
pub use value_objects::{
    SessionId, PlayerId, UserId, CharacterId, ScenarioId, SceneId, EventId, CardId, TagId,
    SessionStatus, PlayerStatus,
    Card, RuntimeCardType,
    Tag, TagCategory, TagValue,
    CardUsageContext, CardUsageError, SceneContext,
    DiceNotation, DiceResult, AdvantageType, DiceParseError, DiceRollError,
    EventLogEntry, EventVisibility, EventCategory, EventLogCollection, EventFilter,
};
pub use services::{
    RuleEngine, GlobalRules, ScenarioRules, CardUsageLimit, CustomCardRule,
    UsageCondition, CardEffect, TagModification, TransitionRule, TransitionCondition,
    EventEffect, EffectTarget, EffectModification, RuleViolation, GameContext,
};
pub use events::*;