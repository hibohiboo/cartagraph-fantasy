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

    // TDDサイクル2: カード追加 (基本ケース)
    pub fn add_card(&mut self, card: Card) -> Result<(), String> {
        self.personal_cards.push(card);
        self.last_updated = chrono::Utc::now();
        Ok(())
    }

    // TDDサイクル3: タグ追加 (基本ケース)
    pub fn add_tag(&mut self, tag: Tag) -> Result<(), String> {
        self.acquired_tags.push(tag);
        self.last_updated = chrono::Utc::now();
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // TDD サイクル 1: キャラクター作成 (最小ケース) - 完了
    #[test]
    fn test_character_creation() {
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

    // TDD サイクル 2: カード追加 (基本ケース) - 完了
    #[test]
    fn test_add_card() {
        let mut character = create_test_character();
        let card = create_test_card();

        let result = character.add_card(card.clone());

        // 期待値：カードが追加される
        assert!(result.is_ok());
        assert_eq!(character.personal_cards.len(), 1);
        assert_eq!(character.personal_cards[0].card_id, card.card_id);
    }

    // TDD サイクル 3: タグ追加 (基本ケース) - RED フェーズ
    #[test]
    fn test_add_tag() {
        // RED: 失敗するテスト (1つだけ)
        let mut character = create_test_character();
        let tag = create_test_tag();

        let result = character.add_tag(tag.clone());

        // 期待値：タグが追加される
        assert!(result.is_ok());
        assert_eq!(character.acquired_tags.len(), 1);
        assert_eq!(character.acquired_tags[0].tag_id, tag.tag_id);
    }

    // ヘルパー関数
    fn create_test_character() -> Character {
        Character::create(
            CharacterId::new(),
            "テストキャラクター".to_string(),
            UserId::new(),
        )
    }

    fn create_test_card() -> Card {
        Card {
            card_id: crate::types::CardId::new(),
            name: "テストカード".to_string(),
            card_type: crate::types::CardType::Action,
            tags: vec![],
            embedded_events: vec![],
            rarity: crate::types::Rarity::Common,
        }
    }

    fn create_test_tag() -> Tag {
        Tag {
            tag_id: crate::types::TagId::new(),
            name: "テストタグ".to_string(),
            category: crate::types::TagCategory::Skill,
            value: Some(crate::types::TagValue::Boolean(true)),
        }
    }
}