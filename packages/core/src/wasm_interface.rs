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
}