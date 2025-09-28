use crate::domain::value_objects::identifiers::{CardId, EventId, TagId};

/// Card Value Object - ゲーム内カードの不変表現
#[derive(Debug, Clone, PartialEq)]
pub struct Card {
    card_id: CardId,
    name: String,
    card_type: CardType,
    tags: Vec<TagId>,
    embedded_events: Vec<EventId>,
    rarity: Rarity,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CardType {
    Action,           // アクション用カード
    Choice,          // 選択肢カード
    Possession,      // 所持カード
    SceneTransition, // シーン移動カード
}

#[derive(Debug, Clone, PartialEq)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Legendary,
}

impl Card {
    pub fn new(
        card_id: CardId,
        name: String,
        card_type: CardType,
        tags: Vec<TagId>,
        embedded_events: Vec<EventId>,
        rarity: Rarity,
    ) -> Self {
        Self {
            card_id,
            name,
            card_type,
            tags,
            embedded_events,
            rarity,
        }
    }

    pub fn card_id(&self) -> &CardId {
        &self.card_id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn card_type(&self) -> &CardType {
        &self.card_type
    }

    pub fn tags(&self) -> &[TagId] {
        &self.tags
    }

    pub fn embedded_events(&self) -> &[EventId] {
        &self.embedded_events
    }

    pub fn rarity(&self) -> &Rarity {
        &self.rarity
    }

    /// カードが指定されたタグを持っているかチェック
    pub fn has_tag(&self, tag_id: &TagId) -> bool {
        self.tags.contains(tag_id)
    }

    /// カードが使用可能な状況かを検証
    pub fn can_be_used_in_context(&self, context: &CardUsageContext) -> Result<(), CardUsageError> {
        // TODO: implement usage validation
        unimplemented!("Card usage validation not yet implemented")
    }
}

/// カード使用コンテキスト
#[derive(Debug)]
pub struct CardUsageContext {
    // TODO: define context fields
}

/// カード使用エラー
#[derive(Debug, Clone, PartialEq)]
pub enum CardUsageError {
    InvalidContext,
    MissingRequiredTags,
    AlreadyUsed,
    // TODO: add more specific error types
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_card_creation_basic() {
        // TDDサイクル1: 最小ケース - 基本的なカード作成
        let card_id = CardId::from_string("card_001".to_string());
        let name = "基本攻撃".to_string();
        let card_type = CardType::Action;
        let tags = vec![];
        let embedded_events = vec![];
        let rarity = Rarity::Common;

        let card = Card::new(card_id.clone(), name.clone(), card_type.clone(), tags, embedded_events, rarity.clone());

        assert_eq!(card.card_id(), &card_id);
        assert_eq!(card.name(), &name);
        assert_eq!(card.card_type(), &card_type);
        assert_eq!(card.tags().len(), 0);
        assert_eq!(card.embedded_events().len(), 0);
        assert_eq!(card.rarity(), &rarity);
    }

    #[test]
    fn test_card_has_tag() {
        // TDDサイクル2: タグ所持チェック機能
        let tag_id_1 = TagId::new();
        let tag_id_2 = TagId::new();

        let card = Card::new(
            CardId::from_string("card_002".to_string()),
            "スキルカード".to_string(),
            CardType::Action,
            vec![tag_id_1.clone()],
            vec![],
            Rarity::Uncommon,
        );

        // 所持しているタグ
        assert!(card.has_tag(&tag_id_1));
        // 所持していないタグ
        assert!(!card.has_tag(&tag_id_2));
    }
}