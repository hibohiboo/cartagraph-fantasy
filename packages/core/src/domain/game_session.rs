// GameSession ドメイン集約 - TDD開発中

use crate::types::*;
use crate::domain::{DomainEvent, GameSessionEvent};
use std::collections::{HashMap, HashSet};
use chrono::{DateTime, Utc};

impl GameSession {
    // TDD: 最小実装でテストを通す
    pub fn create(session_id: SessionId, scenario_id: ScenarioId) -> Self {
        let mut session = Self {
            session_id: session_id.clone(),
            scenario_id: scenario_id.clone(),
            gm_user_id: UserId::new(), // 仮値
            created_at: chrono::Utc::now(),
            players: HashMap::new(),
            max_players: 4, // デフォルト値
            current_scene: SceneId::new(), // 仮値
            shared_cards: Vec::new(),
            session_status: SessionStatus::WaitingForPlayers,
            version: 0,
            uncommitted_events: Vec::new(),
        };

        // SessionCreatedイベントを記録
        let event = DomainEvent::new(
            session_id,
            GameSessionEvent::SessionCreated {
                scenario_id,
                gm_user_id: session.gm_user_id.clone(),
            },
            1,
        );
        session.uncommitted_events.push(event);
        session.version = 1;

        session
    }

    pub fn status(&self) -> SessionStatus {
        self.session_status.clone()
    }

    // TDD 2nd cycle: プレイヤー追加の最小実装
    pub fn add_player(&mut self, player_id: PlayerId, user_id: UserId) -> Result<(), String> {
        // 最小実装: 単純にプレイヤーを追加
        let session_player = SessionPlayer {
            id: player_id.clone(),
            user_id,
            character: None, // 初期状態ではキャラクター未選択
            status: PlayerStatus::Waiting,
            joined_at: chrono::Utc::now(),
        };

        self.players.insert(player_id, session_player);
        Ok(())
    }

    pub fn player_count(&self) -> usize {
        self.players.len()
    }

    pub fn has_player(&self, player_id: &PlayerId) -> bool {
        self.players.contains_key(player_id)
    }

    // TDD 3rd cycle: セッション開始の最小実装
    pub fn start(&mut self) -> Result<(), String> {
        // 最小実装: 単純にステータスを InProgress に変更
        let active_players: HashSet<PlayerId> = self.players.keys().cloned().collect();

        self.session_status = SessionStatus::InProgress {
            current_scene: self.current_scene.clone(),
            active_players,
        };

        Ok(())
    }

    pub fn get_active_players(&self) -> HashSet<PlayerId> {
        // 現在のプレイヤーリストからアクティブなプレイヤーを返す
        match &self.session_status {
            SessionStatus::InProgress { active_players, .. } => active_players.clone(),
            _ => self.players.keys().cloned().collect(),
        }
    }

    // Event Sourcing: 未コミットイベントを取得
    pub fn get_uncommitted_events(&self) -> &[DomainEvent] {
        &self.uncommitted_events
    }

    // Event Sourcing: イベントを適用して状態を変更
    pub fn apply_event(&mut self, event: &DomainEvent) {
        match &event.event_type {
            GameSessionEvent::SessionCreated { scenario_id, gm_user_id } => {
                self.scenario_id = scenario_id.clone();
                self.gm_user_id = gm_user_id.clone();
                self.session_status = SessionStatus::WaitingForPlayers;
            }
            GameSessionEvent::PlayerAdded { player_id, user_id } => {
                let session_player = SessionPlayer {
                    id: player_id.clone(),
                    user_id: user_id.clone(),
                    character: None,
                    status: PlayerStatus::Waiting,
                    joined_at: chrono::Utc::now(),
                };
                self.players.insert(player_id.clone(), session_player);
            }
            GameSessionEvent::SessionStarted { current_scene } => {
                let active_players: HashSet<PlayerId> = self.players.keys().cloned().collect();
                self.session_status = SessionStatus::InProgress {
                    current_scene: current_scene.clone(),
                    active_players,
                };
                self.current_scene = current_scene.clone();
            }
            GameSessionEvent::SessionStatusChanged { new_status } => {
                self.session_status = new_status.clone();
            }
        }

        self.version = event.version;
    }
}

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

    #[test]
    fn test_start_session() {
        // 3番目のREDフェーズ: セッション開始
        // やりたいこと: 条件を満たしたセッションを開始する
        // まだ実装されていないのでコンパイルエラーになる

        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();
        let mut session = GameSession::create(session_id, scenario_id);

        // プレイヤーを追加
        let player_id = PlayerId::new();
        let user_id = UserId::new();
        let _ = session.add_player(player_id, user_id);

        // このメソッドはまだ存在しない → コンパイルエラー (RED)
        let result = session.start();

        // 実装されたらこれらが通るはず
        assert!(result.is_ok());
        assert_eq!(session.status(), SessionStatus::InProgress {
            current_scene: session.current_scene.clone(),
            active_players: session.get_active_players(),
        });
    }

    #[test]
    fn test_event_sourcing_basic() {
        // 4番目のREDフェーズ: Event Sourcing基本機能
        // やりたいこと: セッション作成時にイベントが記録される

        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();
        let session = GameSession::create(session_id, scenario_id);

        // イベントが記録されているか確認
        let uncommitted_events = session.get_uncommitted_events();
        assert_eq!(uncommitted_events.len(), 1); // SessionCreated
    }

    #[test]
    fn test_apply_event() {
        // 5番目のREDフェーズ: apply_event機能
        // やりたいこと: イベントを適用して状態を変更できる

        use crate::domain::{DomainEvent, GameSessionEvent};

        let session_id = SessionId::new();
        let scenario_id = ScenarioId::new();
        let mut session = GameSession::create(session_id.clone(), scenario_id);

        // PlayerAddedイベントを作成
        let player_id = PlayerId::new();
        let user_id = UserId::new();
        let event = DomainEvent::new(
            session_id,
            GameSessionEvent::PlayerAdded { player_id: player_id.clone(), user_id },
            2,
        );

        // apply_eventメソッドでイベントを適用
        session.apply_event(&event);

        // 状態が変更されているか確認
        assert!(session.has_player(&player_id));
        assert_eq!(session.player_count(), 1);
        assert_eq!(session.version, 2);
    }
}