use serde::{Deserialize, Serialize};
use ts_rs::TS;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct DiceNotation {
    pub dice_count: u8,
    pub dice_sides: u8,
    pub modifier: i8,
    pub advantage: AdvantageType,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub enum AdvantageType {
    #[serde(rename = "normal")]
    Normal,
    #[serde(rename = "advantage")]
    Advantage,   // 有利(+1修正)
    #[serde(rename = "disadvantage")]
    Disadvantage, // 不利(-1修正)
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct DiceResult {
    pub notation: DiceNotation,
    pub raw_rolls: Vec<u8>,
    pub final_result: u8,
    pub success: bool,
    #[ts(type = "string")]
    pub timestamp: DateTime<Utc>, // ISO 8601形式にシリアライズ
}

// ダイス記法パース結果
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct DiceNotationParseResult {
    pub success: bool,
    pub notation: Option<DiceNotation>,
    pub error: Option<String>,
}

// 成功判定のしきい値 (TRPG標準: 7以上で成功)
pub const DICE_SUCCESS_THRESHOLD: u8 = 7;

impl DiceResult {
    pub fn is_success(&self) -> bool {
        self.final_result >= DICE_SUCCESS_THRESHOLD
    }
}