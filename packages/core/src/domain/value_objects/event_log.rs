use crate::types::{EventId, SessionId, PlayerId, ScenarioId, UserId};
use crate::domain::events::{DomainEvent, GameSessionEvent};
use chrono::{DateTime, Utc};

/// Event Log Entry Value Object - ゲーム内イベントのログエントリ
#[derive(Debug, Clone, PartialEq)]
pub struct EventLogEntry {
    event_id: EventId,
    session_id: SessionId,
    timestamp: DateTime<Utc>,
    event_type: GameSessionEvent,
    visibility: EventVisibility,
    related_player: Option<PlayerId>,
    message: String,
}

/// イベントの可視性制御
#[derive(Debug, Clone, PartialEq)]
pub enum EventVisibility {
    Public,           // 全プレイヤーに可視
    Private(PlayerId), // 特定プレイヤーのみ可視
    GMOnly,           // GMのみ可視
    System,           // システムログ（通常非表示）
}

/// イベントカテゴリ - フィルタリング用
#[derive(Debug, Clone, PartialEq)]
pub enum EventCategory {
    Session,    // セッション管理系
    Player,     // プレイヤーアクション系
    Card,       // カード使用系
    Dice,       // ダイス振り系
    Scene,      // シーン遷移系
    System,     // システム系
}

impl EventLogEntry {
    pub fn new(
        event_id: EventId,
        session_id: SessionId,
        timestamp: DateTime<Utc>,
        event_type: GameSessionEvent,
        visibility: EventVisibility,
        related_player: Option<PlayerId>,
        message: String,
    ) -> Self {
        Self {
            event_id,
            session_id,
            timestamp,
            event_type,
            visibility,
            related_player,
            message,
        }
    }

    /// DomainEventからEventLogEntryを作成
    pub fn from_domain_event(
        domain_event: &DomainEvent,
        visibility: EventVisibility,
        related_player: Option<PlayerId>,
        message: String,
    ) -> Self {
        Self::new(
            domain_event.event_id.clone(),
            domain_event.session_id.clone(),
            domain_event.timestamp,
            domain_event.event_type.clone(),
            visibility,
            related_player,
            message,
        )
    }

    // Getters
    pub fn event_id(&self) -> &EventId {
        &self.event_id
    }

    pub fn session_id(&self) -> &SessionId {
        &self.session_id
    }

    pub fn timestamp(&self) -> &DateTime<Utc> {
        &self.timestamp
    }

    pub fn event_type(&self) -> &GameSessionEvent {
        &self.event_type
    }

    pub fn visibility(&self) -> &EventVisibility {
        &self.visibility
    }

    pub fn related_player(&self) -> &Option<PlayerId> {
        &self.related_player
    }

    pub fn message(&self) -> &str {
        &self.message
    }

    /// プレイヤーがこのイベントを見ることができるかチェック
    pub fn is_visible_to_player(&self, player_id: &PlayerId, is_gm: bool) -> bool {
        match &self.visibility {
            EventVisibility::Public => true,
            EventVisibility::Private(target_player) => target_player == player_id,
            EventVisibility::GMOnly => is_gm,
            EventVisibility::System => false, // システムログは通常非表示
        }
    }

    /// イベントのカテゴリを決定
    pub fn category(&self) -> EventCategory {
        match &self.event_type {
            GameSessionEvent::SessionCreated { .. } => EventCategory::Session,
            GameSessionEvent::PlayerAdded { .. } => EventCategory::Player,
            GameSessionEvent::SessionStarted { .. } => EventCategory::Session,
            GameSessionEvent::SessionStatusChanged { .. } => EventCategory::Session,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // TDDサイクル1: EventLogEntry基本作成テスト
    #[test]
    fn test_event_log_entry_creation_basic() {
        let event_id = EventId::new();
        let session_id = SessionId::new();
        let timestamp = chrono::Utc::now();
        let event_type = GameSessionEvent::SessionCreated {
            scenario_id: ScenarioId::new(),
            gm_user_id: UserId::new(),
        };
        let visibility = EventVisibility::Public;
        let related_player = None;
        let message = "セッションが作成されました".to_string();

        let log_entry = EventLogEntry::new(
            event_id.clone(),
            session_id.clone(),
            timestamp,
            event_type.clone(),
            visibility.clone(),
            related_player.clone(),
            message.clone(),
        );

        assert_eq!(log_entry.event_id(), &event_id);
        assert_eq!(log_entry.session_id(), &session_id);
        assert_eq!(log_entry.timestamp(), &timestamp);
        assert_eq!(log_entry.event_type(), &event_type);
        assert_eq!(log_entry.visibility(), &visibility);
        assert_eq!(log_entry.related_player(), &related_player);
        assert_eq!(log_entry.message(), &message);
    }
}