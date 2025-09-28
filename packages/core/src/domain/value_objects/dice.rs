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
    /// JavaScriptから提供されるランダム値を使用してダイス振り
    ///
    /// JavaScript側でMath.random()やcrypto.getRandomValues()で
    /// 生成された0.0-1.0の浮動小数点数を受け取り、
    /// 適切なエントロピーに変換してダイス振りを実行
    pub fn roll_with_js_random(&self, js_random_values: &[f64]) -> Result<DiceResult, DiceRollError> {
        if js_random_values.len() < self.dice_count as usize {
            return Err(DiceRollError::InsufficientEntropy);
        }

        // 0.0-1.0の浮動小数点数を0-255の整数エントロピーに変換
        let entropy: Vec<u8> = js_random_values
            .iter()
            .take(self.dice_count as usize)
            .map(|&val| {
                // 0.0-1.0を0-255にマッピング
                (val.clamp(0.0, 0.999999) * 256.0) as u8
            })
            .collect();

        self.roll(&entropy)
    }
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

    // TDDサイクル8: 確率検証テスト
    #[test]
    fn test_probability_validation() {
        // 2d6の理論的確率分布検証
        let notation = DiceNotation::new_2d6();
        let mut outcomes = std::collections::HashMap::new();

        // 全組み合わせテスト（6×6=36通り）
        for die1 in 1..=6 {
            for die2 in 1..=6 {
                let entropy = [die1 - 1, die2 - 1]; // 0-5の範囲でエントロピー
                let result = notation.roll(&entropy).unwrap();
                *outcomes.entry(result.final_result).or_insert(0) += 1;
            }
        }

        // 理論的期待値の検証
        assert_eq!(outcomes.get(&2), Some(&1)); // 最小値(1,1)
        assert_eq!(outcomes.get(&7), Some(&6)); // 最頻値
        assert_eq!(outcomes.get(&12), Some(&1)); // 最大値(6,6)

        // 成功率の検証 (≥7): 21/36 ≈ 58.3%
        let total_success = outcomes.iter()
            .filter(|(&result, _)| result >= 7)
            .map(|(_, &count)| count)
            .sum::<u32>();
        assert_eq!(total_success, 21);

        let total_failure = outcomes.iter()
            .filter(|(&result, _)| result < 7)
            .map(|(_, &count)| count)
            .sum::<u32>();
        assert_eq!(total_failure, 15);
    }

    // TDDサイクル9: バッチ振りパフォーマンステスト
    #[test]
    fn test_batch_rolling_performance() {
        let notation = DiceNotation::new_2d6();

        // 大量のダイス振りでパフォーマンス測定
        let start = std::time::Instant::now();
        let batch_size = 1000;
        let mut results = Vec::with_capacity(batch_size);

        for i in 0..batch_size {
            let entropy = [(i % 256) as u8, ((i * 7) % 256) as u8]; // 疑似ランダム
            let result = notation.roll(&entropy).unwrap();
            results.push(result);
        }

        let duration = start.elapsed();

        // パフォーマンス要件: 1000回の振りが50ms未満で完了
        assert!(duration.as_millis() < 50, "Batch rolling took {}ms, expected <50ms", duration.as_millis());

        // 結果の妥当性確認
        assert_eq!(results.len(), batch_size);
        for result in &results {
            assert!(result.final_result >= 2 && result.final_result <= 12);
            assert_eq!(result.raw_rolls.len(), 2);
        }

        // 統計的妥当性の簡易チェック（理論値58.3%に近い範囲40-80%）
        let success_count = results.iter().filter(|r| r.is_success()).count();
        let success_rate = success_count as f64 / batch_size as f64;
        assert!(success_rate >= 0.40 && success_rate <= 0.80,
               "Success rate {} is outside expected range [0.40, 0.80]", success_rate);
    }

    // TDDサイクル10: 複合機能統合テスト
    #[test]
    fn test_comprehensive_dice_integration() {
        // パース→振り→結果検証の統合フロー
        let notation = DiceNotation::parse("2d6+2").unwrap();
        let entropy = [3, 4]; // (3%6)+1=4, (4%6)+1=5 -> 合計9+2修正=11

        let result = notation.roll(&entropy).unwrap();
        assert_eq!(result.final_result, 11);
        assert!(result.is_success());
        assert_eq!(result.raw_rolls, [4, 5]);
        assert_eq!(result.notation().modifier, 2);

        // 有利+修正値の組み合わせ
        let complex_notation = DiceNotation::parse("2d6-1")
            .unwrap()
            .with_advantage(AdvantageType::Advantage);

        let low_entropy = [0, 1]; // 合計3-1修正+1有利=3
        let result = complex_notation.roll(&low_entropy).unwrap();
        assert_eq!(result.final_result, 3);
        assert!(!result.is_success());
    }

    // TDDサイクル11: JavaScriptエントロピー統合テスト
    #[test]
    fn test_javascript_entropy_integration() {
        let notation = DiceNotation::new_2d6();

        // JavaScript Math.random()風の値でテスト
        let js_random_values = [0.25, 0.75]; // 0.25 * 256 = 64, 0.75 * 256 = 192
        let result = notation.roll_with_js_random(&js_random_values).unwrap();

        // エントロピー変換の検証: [64, 192] -> [(64%6)+1=5, (192%6)+1=1] -> 合計6
        assert_eq!(result.raw_rolls, [5, 1]);
        assert_eq!(result.final_result, 6);
        assert!(!result.is_success());

        // 境界値テスト
        let boundary_values = [0.0, 0.999999]; // [0, 255] -> [1, 4] -> 合計5
        let result = notation.roll_with_js_random(&boundary_values).unwrap();
        assert_eq!(result.raw_rolls, [1, 4]);
        assert_eq!(result.final_result, 5);

        // エントロピー不足エラー
        let insufficient_values = [0.5]; // 2d6なので2つ必要
        let result = notation.roll_with_js_random(&insufficient_values);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), DiceRollError::InsufficientEntropy);

        // 範囲外値の自動クランプ
        let out_of_range_values = [-0.1, 1.5]; // クランプされて[0.0, 0.999999]
        let result = notation.roll_with_js_random(&out_of_range_values).unwrap();
        assert_eq!(result.raw_rolls, [1, 4]); // 0と255相当のエントロピー
    }

    // TDDサイクル12: 実用的なWASM統合シナリオテスト
    #[test]
    fn test_realistic_wasm_scenarios() {
        // GM側: 複数プレイヤーの同時ダイス振り
        let players_dice = vec![
            ("player1", DiceNotation::parse("2d6+1").unwrap()),
            ("player2", DiceNotation::new_2d6().with_advantage(AdvantageType::Advantage)),
            ("player3", DiceNotation::parse("2d6-1").unwrap().with_advantage(AdvantageType::Disadvantage)),
        ];

        // JavaScriptから供給される疑似乱数
        let js_entropy_pool = [
            [0.1, 0.6], // player1用
            [0.8, 0.3], // player2用
            [0.4, 0.9], // player3用
        ];

        let mut results = Vec::new();
        for (i, (player_name, notation)) in players_dice.iter().enumerate() {
            let result = notation.roll_with_js_random(&js_entropy_pool[i]).unwrap();
            results.push((player_name, result));
        }

        // 結果検証
        assert_eq!(results.len(), 3);

        // Player1: [0.1*256=25, 0.6*256=153] -> [(25%6)+1=2, (153%6)+1=4] = 6+1修正 = 7 (成功)
        let (_, result1) = &results[0];
        assert_eq!(result1.raw_rolls, [2, 4]);
        assert_eq!(result1.final_result, 7);
        assert!(result1.is_success());

        // Player2: [0.8*256=204, 0.3*256=76] -> [(204%6)+1=1, (76%6)+1=5] = 6+1有利 = 7 (成功)
        let (_, result2) = &results[1];
        assert_eq!(result2.raw_rolls, [1, 5]);
        assert_eq!(result2.final_result, 7);
        assert!(result2.is_success());

        // Player3: [0.4*256=102, 0.9*256=230] -> [(102%6)+1=1, (230%6)+1=3] = 4-1修正-1不利 = 2 (失敗)
        let (_, result3) = &results[2];
        assert_eq!(result3.raw_rolls, [1, 3]); // 102%6=0->1, 230%6=2->3
        assert_eq!(result3.final_result, 2);   // 4-1-1=2
        assert!(!result3.is_success());
    }
}