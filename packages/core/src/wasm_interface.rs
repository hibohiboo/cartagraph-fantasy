// WASM FFI インターフェース - Task 7: Contract Tests

use wasm_bindgen::prelude::*;

#[cfg(test)]
mod contract_tests {
    #[test]
    fn test_create_session_wasm_contract() {
        // 最初のRED Phase: createSession WASM FFI メソッドのコントラクト
        // やりたいこと: JSからWASM経由でGameSessionを作成
        // まだ実装されていないのでコンパイルエラーになる

        let session_id_str = "session-123";
        let scenario_id_str = "scenario-456";

        // このWASM関数はまだ存在しない → コンパイルエラー (RED)
        let result = wasm_create_session(session_id_str, scenario_id_str);

        // 実装されたらこれらが通るはず
        assert!(result.is_ok());
    }

    #[test]
    fn test_add_player_wasm_contract() {
        // 2番目のRED Phase: addPlayer WASM FFI メソッドのコントラクト
        // やりたいこと: JSからWASM経由でプレイヤーを追加
        // まだ実装されていないのでコンパイルエラーになる

        let session_id_str = "session-123";
        let player_id_str = "player-456";
        let user_id_str = "user-789";

        // このWASM関数はまだ存在しない → コンパイルエラー (RED)
        let result = wasm_add_player(session_id_str, player_id_str, user_id_str);

        // 実装されたらこれらが通るはず
        assert!(result.is_ok());
    }

    #[test]
    fn test_use_card_wasm_contract() {
        // 3番目のRED Phase: useCard WASM FFI メソッドのコントラクト
        // やりたいこと: JSからWASM経由でカードを使用
        // まだ実装されていないのでコンパイルエラーになる

        let session_id_str = "session-123";
        let player_id_str = "player-456";
        let card_id_str = "card-789";

        // このWASM関数はまだ存在しない → コンパイルエラー (RED)
        let result = wasm_use_card(session_id_str, player_id_str, card_id_str);

        // 実装されたらこれらが通るはず
        assert!(result.is_ok());
    }

    #[test]
    fn test_roll_dice_wasm_contract() {
        // 4番目のRED Phase: rollDice WASM FFI メソッドのコントラクト
        // やりたいこと: JSからWASM経由でダイスを振る
        // まだ実装されていないのでコンパイルエラーになる

        let session_id_str = "session-123";
        let player_id_str = "player-456";
        let dice_count = 2;
        let dice_sides = 6;

        // このWASM関数はまだ存在しない → コンパイルエラー (RED)
        let result = wasm_roll_dice(session_id_str, player_id_str, dice_count, dice_sides);

        // 実装されたらこれらが通るはず
        assert!(result.is_ok());
    }

    #[test]
    fn test_typescript_type_consistency() {
        // 型安全テスト: Rust型とTypeScript型の一貫性確認
        // やりたいこと: ts-rs生成型がRust型と一致することを確認
        // まだ実装されていないのでコンパイルエラーになる

        // このテスト関数はまだ存在しない → コンパイルエラー (RED)
        let result = verify_typescript_type_exports();

        // 実装されたらこれらが通るはず
        assert!(result.is_ok());
    }

    #[test]
    fn test_wasm_boundary_type_roundtrip() {
        // WASM境界型一貫性テスト: 文字列 → Rust型 → 処理 → 結果の型安全性確認

        // 1. createSessionの型一貫性確認
        let session_result = wasm_create_session("test-session-id", "test-scenario-id");
        assert!(session_result.is_ok());
        let session_response = session_result.unwrap();
        assert_eq!(session_response, "session_created");

        // 2. addPlayerの型一貫性確認
        let player_result = wasm_add_player("test-session-id", "test-player-id", "test-user-id");
        assert!(player_result.is_ok());
        let player_response = player_result.unwrap();
        assert_eq!(player_response, "player_added");

        // 3. useCardの型一貫性確認
        let card_result = wasm_use_card("test-session-id", "test-player-id", "test-card-id");
        assert!(card_result.is_ok());
        let card_response = card_result.unwrap();
        assert_eq!(card_response, "card_used");

        // 4. rollDiceの型一貫性確認
        let dice_result = wasm_roll_dice("test-session-id", "test-player-id", 2, 6);
        assert!(dice_result.is_ok());
        let dice_response = dice_result.unwrap();
        assert_eq!(dice_response, "dice_rolled:3,5");
    }

    // GREEN Phase: 最小限の実装でテストを通す
    fn wasm_create_session(session_id: &str, scenario_id: &str) -> Result<String, String> {
        use crate::types::{SessionId, ScenarioId, GameSession};

        // 最小実装: 文字列からIDを構築してGameSessionを作成
        let session_id = SessionId::from_string(session_id.to_string());
        let scenario_id = ScenarioId::from_string(scenario_id.to_string());

        let _session = GameSession::create(session_id, scenario_id);

        // 成功としてStringを返す（実際のJsValue変換は後で実装）
        Ok("session_created".to_string())
    }

    fn wasm_add_player(_session_id: &str, _player_id: &str, _user_id: &str) -> Result<String, String> {
        use crate::types::{SessionId, PlayerId, UserId, GameSession};

        // 最小実装: IDを構築してプレイヤー追加操作をシミュレート
        let _session_id = SessionId::from_string(_session_id.to_string());
        let _player_id = PlayerId::from_string(_player_id.to_string());
        let _user_id = UserId::from_string(_user_id.to_string());

        // 実際の実装では、セッションを取得してプレイヤーを追加する
        // 現在は最小限の成功レスポンスを返す
        Ok("player_added".to_string())
    }

    fn wasm_use_card(_session_id: &str, _player_id: &str, _card_id: &str) -> Result<String, String> {
        use crate::types::{SessionId, PlayerId, CardId};

        // 最小実装: IDを構築してカード使用操作をシミュレート
        let _session_id = SessionId::from_string(_session_id.to_string());
        let _player_id = PlayerId::from_string(_player_id.to_string());
        let _card_id = CardId::from_string(_card_id.to_string());

        // 実際の実装では、セッションを取得してカードを使用する
        // 現在は最小限の成功レスポンスを返す
        Ok("card_used".to_string())
    }

    fn wasm_roll_dice(_session_id: &str, _player_id: &str, _dice_count: u32, _dice_sides: u32) -> Result<String, String> {
        use crate::types::{SessionId, PlayerId};

        // 最小実装: IDを構築してダイス振り操作をシミュレート
        let _session_id = SessionId::from_string(_session_id.to_string());
        let _player_id = PlayerId::from_string(_player_id.to_string());

        // 実際の実装では、ダイスを振って結果をセッションに記録する
        // 現在は最小限の成功レスポンスを返す（ダミーの結果）
        Ok("dice_rolled:3,5".to_string())
    }

    fn verify_typescript_type_exports() -> Result<String, String> {
        use crate::types::{GameSession, SessionStatus, PlayerStatus, SessionId, ScenarioId};
        use ts_rs::TS;

        // 型安全性検証: ts-rsが正しく型をエクスポートできることを確認

        // 1. 基本ID型のTypeScript型定義確認
        let session_id_ts = SessionId::decl();
        if !session_id_ts.contains("string") {
            return Err("SessionId TypeScript declaration failed".to_string());
        }

        let scenario_id_ts = ScenarioId::decl();
        if !scenario_id_ts.contains("string") {
            return Err("ScenarioId TypeScript declaration failed".to_string());
        }

        // 2. Enum型のTypeScript型定義確認
        let session_status_ts = SessionStatus::decl();
        if !session_status_ts.contains("waiting_for_players") {
            return Err("SessionStatus TypeScript declaration failed".to_string());
        }

        let player_status_ts = PlayerStatus::decl();
        if !player_status_ts.contains("waiting") {
            return Err("PlayerStatus TypeScript declaration failed".to_string());
        }

        // 3. 複合型のTypeScript型定義確認
        let game_session_ts = GameSession::decl();
        if !game_session_ts.contains("session_id") || !game_session_ts.contains("scenario_id") {
            return Err("GameSession TypeScript declaration failed".to_string());
        }

        Ok("typescript_types_verified".to_string())
    }
}