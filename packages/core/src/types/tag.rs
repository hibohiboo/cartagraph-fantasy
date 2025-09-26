use serde::{Deserialize, Serialize};
use ts_rs::TS;
use super::TagId;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct Tag {
    pub tag_id: TagId,
    pub name: String,
    pub category: TagCategory,
    pub value: Option<TagValue>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum TagCategory {
    #[serde(rename = "skill")]
    Skill,        // スキル系
    #[serde(rename = "status")]
    Status,       // 状態系
    #[serde(rename = "achievement")]
    Achievement,  // 実績系
    #[serde(rename = "condition")]
    Condition,    // 状況系
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(tag = "type", content = "value")]
pub enum TagValue {
    #[serde(rename = "numeric")]
    Numeric(i32),
    #[serde(rename = "boolean")]
    Boolean(bool),
    #[serde(rename = "text")]
    Text(String),
}

// タグ操作関連
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct TagModification {
    pub tag_id: TagId,
    pub operation: TagOperation,
    pub new_value: Option<TagValue>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum TagOperation {
    #[serde(rename = "add")]
    Add,
    #[serde(rename = "remove")]
    Remove,
    #[serde(rename = "modify")]
    Modify,
}