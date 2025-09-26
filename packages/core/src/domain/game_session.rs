// GameSession ドメイン集約 - TDD開発中

use crate::types::*;

// まず最小のRED: GameSessionを作成できるか？

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_simple_game_session() {
        // RED フェーズ: 最小のケース
        // やりたいこと: 単純にGameSessionを作る
        // まだ実装されていないのでコンパイルエラーになる

        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();

        // この関数はまだ存在しない → コンパイルエラー (RED)
        let session = GameSession::create(session_id, scenario_id);

        // 作られたセッションの最低限の検証
        assert_eq!(session.status(), SessionStatus::WaitingForPlayers);
    }
}