use serde::{Deserialize, Serialize};

/// ダイス記法表現 - "2d6+1"のような文字列をパースして扱う
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DiceNotation {
    dice_count: u8,
    dice_sides: u8,
    modifier: i8,
    advantage: AdvantageType,
}

/// 有利/不利システム
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AdvantageType {
    Normal,
    Advantage,   // 有利: +1修正
    Disadvantage, // 不利: -1修正
}

/// ダイス振り結果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiceResult {
    notation: DiceNotation,
    raw_rolls: Vec<u8>,
    final_result: u8,
    success: bool,
}

impl DiceNotation {
    /// 基本的な2d6記法作成
    pub fn new_2d6() -> Self {
        Self {
            dice_count: 2,
            dice_sides: 6,
            modifier: 0,
            advantage: AdvantageType::Normal,
        }
    }

    /// 修正値付き記法作成
    pub fn with_modifier(mut self, modifier: i8) -> Self {
        self.modifier = modifier;
        self
    }

    /// 有利/不利付き記法作成
    pub fn with_advantage(mut self, advantage: AdvantageType) -> Self {
        self.advantage = advantage;
        self
    }

    /// 文字列パース（"2d6+1"形式）
    pub fn parse(notation: &str) -> Result<Self, DiceParseError> {
        let notation = notation.trim();

        // 基本的な2d6パターンをチェック
        if notation == "2d6" {
            return Ok(Self::new_2d6());
        }

        // 修正値付きパターン（+1, -2など）
        if let Some(plus_pos) = notation.find('+') {
            let (dice_part, modifier_part) = notation.split_at(plus_pos);
            if dice_part == "2d6" {
                let modifier_str = &modifier_part[1..]; // '+' を除く
                if let Ok(modifier) = modifier_str.parse::<i8>() {
                    return Ok(Self::new_2d6().with_modifier(modifier));
                }
            }
        }

        if let Some(minus_pos) = notation.find('-') {
            let (dice_part, modifier_part) = notation.split_at(minus_pos);
            if dice_part == "2d6" {
                let modifier_str = &modifier_part[1..]; // '-' を除く
                if let Ok(modifier) = modifier_str.parse::<i8>() {
                    return Ok(Self::new_2d6().with_modifier(-modifier));
                }
            }
        }

        Err(DiceParseError::InvalidFormat)
    }

    /// ダイス振り実行
    pub fn roll(&self, entropy: &[u8]) -> Result<DiceResult, DiceRollError> {
        if entropy.len() < self.dice_count as usize {
            return Err(DiceRollError::InsufficientEntropy);
        }

        // エントロピーから各ダイス結果を生成（1-6の範囲）
        let mut raw_rolls = Vec::new();
        for i in 0..self.dice_count {
            let die_result = (entropy[i as usize] % self.dice_sides) + 1;
            raw_rolls.push(die_result);
        }

        // 合計計算
        let sum: u8 = raw_rolls.iter().sum();

        // 修正値適用
        let modified_result = (sum as i16 + self.modifier as i16).max(0) as u8;

        // 有利/不利効果適用
        let final_result = match self.advantage {
            AdvantageType::Advantage => (modified_result as i16 + 1).max(0) as u8,
            AdvantageType::Disadvantage => (modified_result as i16 - 1).max(0) as u8,
            AdvantageType::Normal => modified_result,
        };

        // 成功判定（≥7）
        let success = final_result >= 7;

        Ok(DiceResult {
            notation: self.clone(),
            raw_rolls,
            final_result,
            success,
        })
    }
}

/// ダイスパースエラー
#[derive(Debug, Clone, PartialEq)]
pub enum DiceParseError {
    InvalidFormat,
    UnsupportedDiceType,
    InvalidModifier,
}

/// ダイス振りエラー
#[derive(Debug, Clone, PartialEq)]
pub enum DiceRollError {
    InsufficientEntropy,
    InvalidDiceConfiguration,
}

impl DiceResult {
    /// 成功判定（≥7）
    pub fn is_success(&self) -> bool {
        self.success
    }

    /// 最終結果取得
    pub fn final_result(&self) -> u8 {
        self.final_result
    }

    /// 生ダイス振り結果取得
    pub fn raw_rolls(&self) -> &[u8] {
        &self.raw_rolls
    }

    /// 使用された記法取得
    pub fn notation(&self) -> &DiceNotation {
        &self.notation
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // TDDサイクル1: DiceNotation基本作成テスト - RED phase
    #[test]
    fn test_dice_notation_creation_basic() {
        let notation = DiceNotation::new_2d6();

        assert_eq!(notation.dice_count, 2);
        assert_eq!(notation.dice_sides, 6);
        assert_eq!(notation.modifier, 0);
        assert_eq!(notation.advantage, AdvantageType::Normal);
    }

    // TDDサイクル2: 修正値付き記法テスト - RED phase
    #[test]
    fn test_dice_notation_with_modifier() {
        let notation = DiceNotation::new_2d6().with_modifier(1);

        assert_eq!(notation.modifier, 1);

        let notation_negative = DiceNotation::new_2d6().with_modifier(-2);
        assert_eq!(notation_negative.modifier, -2);
    }

    // TDDサイクル3: 有利/不利システムテスト - RED phase
    #[test]
    fn test_dice_notation_advantage_system() {
        let advantage_notation = DiceNotation::new_2d6().with_advantage(AdvantageType::Advantage);
        assert_eq!(advantage_notation.advantage, AdvantageType::Advantage);

        let disadvantage_notation = DiceNotation::new_2d6().with_advantage(AdvantageType::Disadvantage);
        assert_eq!(disadvantage_notation.advantage, AdvantageType::Disadvantage);
    }

    // TDDサイクル4: 文字列パースメント - GREEN phase
    #[test]
    fn test_dice_notation_parse_basic() {
        // 基本的な2d6パース
        let result = DiceNotation::parse("2d6");
        assert!(result.is_ok());
        let notation = result.unwrap();
        assert_eq!(notation.dice_count, 2);
        assert_eq!(notation.dice_sides, 6);
        assert_eq!(notation.modifier, 0);

        // 修正値付きパース
        let result = DiceNotation::parse("2d6+1");
        assert!(result.is_ok());
        let notation = result.unwrap();
        assert_eq!(notation.modifier, 1);

        // 負の修正値
        let result = DiceNotation::parse("2d6-2");
        assert!(result.is_ok());
        let notation = result.unwrap();
        assert_eq!(notation.modifier, -2);

        // 無効な記法
        let result = DiceNotation::parse("invalid");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), DiceParseError::InvalidFormat);
    }

    // TDDサイクル5: ダイス振りテスト - GREEN phase
    #[test]
    fn test_dice_roll_basic() {
        let notation = DiceNotation::new_2d6();
        let entropy = [1, 2, 3, 4]; // テスト用エントロピー

        let result = notation.roll(&entropy);
        assert!(result.is_ok());

        let dice_result = result.unwrap();
        assert_eq!(dice_result.raw_rolls.len(), 2);
        assert_eq!(dice_result.raw_rolls[0], 2); // (1 % 6) + 1 = 2
        assert_eq!(dice_result.raw_rolls[1], 3); // (2 % 6) + 1 = 3
        assert_eq!(dice_result.final_result, 5); // 2 + 3 = 5
        assert!(!dice_result.is_success()); // 5 < 7

        // エントロピー不足のテスト
        let insufficient_entropy = [1];
        let result = notation.roll(&insufficient_entropy);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), DiceRollError::InsufficientEntropy);
    }

    // TDDサイクル6: 成功判定テスト - GREEN phase
    #[test]
    fn test_success_evaluation() {
        // 成功ケース: 合計≥7
        let notation = DiceNotation::new_2d6();
        let high_entropy = [5, 6]; // (5%6)+1=6, (6%6)+1=1 -> 合計7
        let result = notation.roll(&high_entropy).unwrap();
        assert_eq!(result.final_result, 7);
        assert!(result.is_success());

        // 失敗ケース: 合計<7
        let low_entropy = [0, 1]; // (0%6)+1=1, (1%6)+1=2 -> 合計3
        let result = notation.roll(&low_entropy).unwrap();
        assert_eq!(result.final_result, 3);
        assert!(!result.is_success());

        // 修正値付きテスト
        let notation_with_modifier = DiceNotation::new_2d6().with_modifier(3);
        let result = notation_with_modifier.roll(&low_entropy).unwrap();
        assert_eq!(result.final_result, 6); // 3 + 3修正 = 6 (失敗)
        assert!(!result.is_success());

        // 高い修正値で成功に
        let notation_high_modifier = DiceNotation::new_2d6().with_modifier(5);
        let result = notation_high_modifier.roll(&low_entropy).unwrap();
        assert_eq!(result.final_result, 8); // 3 + 5修正 = 8 (成功)
        assert!(result.is_success());
    }

    // TDDサイクル7: 有利/不利効果テスト - GREEN phase
    #[test]
    fn test_advantage_disadvantage_effects() {
        let base_entropy = [2, 3]; // (2%6)+1=3, (3%6)+1=4 -> 合計7 (基本成功)

        // 通常ダイス: 合計7で成功
        let normal_notation = DiceNotation::new_2d6();
        let normal_result = normal_notation.roll(&base_entropy).unwrap();
        assert_eq!(normal_result.final_result, 7);
        assert!(normal_result.is_success());

        // 有利ダイス: +1修正で8
        let advantage_notation = DiceNotation::new_2d6().with_advantage(AdvantageType::Advantage);
        let advantage_result = advantage_notation.roll(&base_entropy).unwrap();
        assert_eq!(advantage_result.final_result, 8);
        assert!(advantage_result.is_success());

        // 不利ダイス: -1修正で6
        let disadvantage_notation = DiceNotation::new_2d6().with_advantage(AdvantageType::Disadvantage);
        let disadvantage_result = disadvantage_notation.roll(&base_entropy).unwrap();
        assert_eq!(disadvantage_result.final_result, 6);
        assert!(!disadvantage_result.is_success());

        // 境界ケース: 不利で0未満にならないことを確認
        let low_entropy = [0, 0]; // 合計2
        let disadvantage_low = DiceNotation::new_2d6().with_advantage(AdvantageType::Disadvantage);
        let result = disadvantage_low.roll(&low_entropy).unwrap();
        assert_eq!(result.final_result, 1); // max(2-1, 0) = 1
    }
}