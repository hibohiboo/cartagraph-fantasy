// GameSession テスト - オニオンアーキテクチャ対応

use crate::domain::*;


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_simple_game_session() {
        // 最初のTDDサイクル - 完了
        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();
        let gm_user_id = UserId::new();

        let session = GameSession::create(session_id, scenario_id, gm_user_id);

        assert_eq!(session.status(), &SessionStatus::WaitingForPlayers);
    }

    #[test]
    fn test_add_player_to_session() {
        // 2番目のTDDサイクル: プレイヤーを追加する
        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();
        let gm_user_id = UserId::new();
        let mut session = GameSession::create(session_id, scenario_id, gm_user_id);

        let player_id = PlayerId::new();
        let user_id = UserId::new();

        let result = session.add_player(player_id.clone(), user_id);

        assert!(result.is_ok());
        assert_eq!(session.player_count(), 1);
        assert!(session.has_player(&player_id));
    }

    #[test]
    fn test_start_session() {
        // 3番目のTDDサイクル: セッション開始
        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();
        let gm_user_id = UserId::new();
        let mut session = GameSession::create(session_id, scenario_id, gm_user_id);

        // プレイヤーを追加
        let player_id = PlayerId::new();
        let user_id = UserId::new();
        let _ = session.add_player(player_id, user_id);

        let result = session.start();

        assert!(result.is_ok());
        // セッションが InProgress ステータスになることを確認
        match session.status() {
            SessionStatus::InProgress { .. } => assert!(true),
            _ => panic!("Session should be in InProgress status"),
        }
    }
}