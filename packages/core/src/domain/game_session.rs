// GameSession ドメイン集約 - TDD開発中

use crate::types::*;

// まず最小のRED: GameSessionを作成できるか？

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_simple_game_session() {
        // 最初のTDDサイクル - 完了
        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();

        let session = GameSession::create(session_id, scenario_id);

        assert_eq!(session.status(), SessionStatus::WaitingForPlayers);
    }

    #[test]
    fn test_add_player_to_session() {
        // 2番目のREDフェーズ: プレイヤーを追加する
        // やりたいこと: セッションに1人のプレイヤーを追加
        // まだ実装されていないのでコンパイルエラーになる

        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();
        let mut session = GameSession::create(session_id, scenario_id);

        let player_id = PlayerId::new();
        let user_id = UserId::new();

        // このメソッドはまだ存在しない → コンパイルエラー (RED)
        let result = session.add_player(player_id.clone(), user_id);

        // 実装されたらこれらが通るはず
        assert!(result.is_ok());
        assert_eq!(session.player_count(), 1);
        assert!(session.has_player(&player_id));
    }
}