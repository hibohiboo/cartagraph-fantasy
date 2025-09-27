use super::super::value_objects::*;
use crate::types::{Card, Tag, SessionRecord, RestrictionReason};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

// ドメインエンティティ：純粋なビジネスロジック（インフラ依存なし）
#[derive(Debug, Clone)]
pub struct Character {
    // Identity
    pub character_id: CharacterId,

    // Basic Info
    pub name: String,
    pub player_id: UserId,

    // Game Attributes
    pub personal_cards: Vec<Card>,
    pub acquired_tags: Vec<Tag>,

    // Session History
    pub session_history: Vec<SessionRecord>,

    // Restrictions
    pub scenario_restrictions: HashMap<ScenarioId, RestrictionReason>,

    // Metadata
    pub created_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,

    // Event History (Event Sourcing)
    pub version: u64,
}

impl Character {
    // TDDサイクル1: Character作成 (最小ケース)
    pub fn create(character_id: CharacterId, name: String, player_id: UserId) -> Self {
        Self {
            character_id,
            name,
            player_id,
            personal_cards: Vec::new(),
            acquired_tags: Vec::new(),
            session_history: Vec::new(),
            scenario_restrictions: HashMap::new(),
            created_at: chrono::Utc::now(),
            last_updated: chrono::Utc::now(),
            version: 1,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // TDD サイクル 1: キャラクター作成 (最小ケース) - RED フェーズ
    #[test]
    fn test_character_creation() {
        // RED: 失敗するテスト (1つだけ)
        let character_id = CharacterId::new();
        let name = "テストキャラクター".to_string();
        let player_id = UserId::new();

        let character = Character::create(character_id.clone(), name.clone(), player_id.clone());

        // 期待値：基本情報が正しく設定される
        assert_eq!(character.character_id, character_id);
        assert_eq!(character.name, name);
        assert_eq!(character.player_id, player_id);
        assert!(character.personal_cards.is_empty());
        assert!(character.acquired_tags.is_empty());
        assert!(character.session_history.is_empty());
        assert!(character.scenario_restrictions.is_empty());
        assert_eq!(character.version, 1);
    }
}