use crate::domain::value_objects::identifiers::TagId;

/// Tag Value Object - ゲーム内タグの不変表現
#[derive(Debug, Clone, PartialEq)]
pub struct Tag {
    tag_id: TagId,
    name: String,
    category: TagCategory,
    value: Option<TagValue>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TagCategory {
    Skill,        // スキル系
    Status,       // 状態系
    Achievement,  // 実績系
    Condition,    // 状況系
}

#[derive(Debug, Clone, PartialEq)]
pub enum TagValue {
    Numeric(i32),
    Boolean(bool),
    Text(String),
}

impl Tag {
    pub fn new(
        tag_id: TagId,
        name: String,
        category: TagCategory,
        value: Option<TagValue>,
    ) -> Self {
        Self {
            tag_id,
            name,
            category,
            value,
        }
    }

    pub fn tag_id(&self) -> &TagId {
        &self.tag_id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn category(&self) -> &TagCategory {
        &self.category
    }

    pub fn value(&self) -> &Option<TagValue> {
        &self.value
    }

    /// タグの数値を取得（数値タグの場合）
    pub fn numeric_value(&self) -> Option<i32> {
        match &self.value {
            Some(TagValue::Numeric(n)) => Some(*n),
            _ => None,
        }
    }

    /// タグの値を変更（同じタグIDで新しい値オブジェクトを作成）
    pub fn with_value(&self, new_value: Option<TagValue>) -> Self {
        Self {
            tag_id: self.tag_id.clone(),
            name: self.name.clone(),
            category: self.category.clone(),
            value: new_value,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tag_creation_basic() {
        // TDDサイクル3: 最小ケース - 基本的なタグ作成
        let tag_id = TagId::new();
        let name = "剣術スキル".to_string();
        let category = TagCategory::Skill;
        let value = Some(TagValue::Numeric(3));

        let tag = Tag::new(tag_id.clone(), name.clone(), category.clone(), value.clone());

        assert_eq!(tag.tag_id(), &tag_id);
        assert_eq!(tag.name(), &name);
        assert_eq!(tag.category(), &category);
        assert_eq!(tag.value(), &value);
    }

    #[test]
    fn test_tag_numeric_value() {
        // TDDサイクル4: 数値タグの値取得機能
        let numeric_tag = Tag::new(
            TagId::new(),
            "体力".to_string(),
            TagCategory::Status,
            Some(TagValue::Numeric(10)),
        );

        let text_tag = Tag::new(
            TagId::new(),
            "職業".to_string(),
            TagCategory::Achievement,
            Some(TagValue::Text("戦士".to_string())),
        );

        let no_value_tag = Tag::new(
            TagId::new(),
            "無値タグ".to_string(),
            TagCategory::Condition,
            None,
        );

        // 数値タグから値を取得
        assert_eq!(numeric_tag.numeric_value(), Some(10));
        // 非数値タグからはNone
        assert_eq!(text_tag.numeric_value(), None);
        // 値なしタグからはNone
        assert_eq!(no_value_tag.numeric_value(), None);
    }

    #[test]
    fn test_tag_value_modification() {
        // TDDサイクル6: タグ値変更ロジック
        let original_tag = Tag::new(
            TagId::new(),
            "レベル".to_string(),
            TagCategory::Status,
            Some(TagValue::Numeric(1)),
        );

        // 数値を増加
        let upgraded_tag = original_tag.with_value(Some(TagValue::Numeric(2)));
        assert_eq!(upgraded_tag.numeric_value(), Some(2));
        // 元のタグは変更されない（値オブジェクトの不変性）
        assert_eq!(original_tag.numeric_value(), Some(1));
        // IDと名前は同じ
        assert_eq!(upgraded_tag.tag_id(), original_tag.tag_id());
        assert_eq!(upgraded_tag.name(), original_tag.name());

        // 値をなしに変更
        let cleared_tag = original_tag.with_value(None);
        assert_eq!(cleared_tag.numeric_value(), None);
    }
}