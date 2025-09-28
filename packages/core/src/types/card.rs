use serde::{Deserialize, Serialize};
use ts_rs::TS;
use super::{CardId, EventId, TagId};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Card {
    pub card_id: CardId,
    pub name: String,
    pub card_type: CardType,
    pub tags: Vec<TagId>,
    pub embedded_events: Vec<EventId>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export)]
pub enum CardType {
    #[serde(rename = "action")]
    Action,           // アクション用カード
    #[serde(rename = "choice")]
    Choice,          // 選択肢カード
    #[serde(rename = "possession")]
    Possession,      // 所持カード
    #[serde(rename = "scene_transition")]
    SceneTransition, // シーン移動カード
}


// カードテンプレート（シナリオ定義用）
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CardTemplate {
    pub name: String,
    pub card_type: CardType,
    pub tags: Vec<String>, // タグ名の配列
    pub embedded_events: Vec<String>, // イベント名の配列
    pub description: Option<String>,
}