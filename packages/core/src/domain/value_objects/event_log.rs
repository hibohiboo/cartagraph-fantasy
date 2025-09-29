use crate::types::{EventId, SessionId, PlayerId, ScenarioId, UserId};
use crate::domain::events::{DomainEvent, GameSessionEvent};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Event Log Entry Value Object - ゲーム内イベントのログエントリ
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum EventVisibility {
    Public,           // 全プレイヤーに可視
    Private(PlayerId), // 特定プレイヤーのみ可視
    GMOnly,           // GMのみ可視
    System,           // システムログ（通常非表示）
}

/// イベントカテゴリ - フィルタリング用
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
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

/// イベントログ集合 - フィルタリング機能付き
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventLogCollection {
    entries: Vec<EventLogEntry>,
}

/// イベントフィルタ条件
#[derive(Debug, Clone)]
pub struct EventFilter {
    pub session_id: Option<SessionId>,
    pub player_id: Option<PlayerId>,
    pub category: Option<EventCategory>,
    pub visibility_for_player: Option<(PlayerId, bool)>, // (player_id, is_gm)
    pub after_timestamp: Option<DateTime<Utc>>,
    pub before_timestamp: Option<DateTime<Utc>>,
}

impl EventLogCollection {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
        }
    }

    pub fn from_entries(entries: Vec<EventLogEntry>) -> Self {
        Self { entries }
    }

    /// イベントログエントリを追加
    pub fn add_entry(&mut self, entry: EventLogEntry) {
        self.entries.push(entry);
    }

    /// 全エントリの取得
    pub fn entries(&self) -> &[EventLogEntry] {
        &self.entries
    }

    /// フィルタ条件に基づくエントリの取得
    pub fn filter_entries(&self, filter: &EventFilter) -> Vec<&EventLogEntry> {
        self.entries
            .iter()
            .filter(|entry| self.matches_filter(entry, filter))
            .collect()
    }

    /// エントリの総数
    pub fn count(&self) -> usize {
        self.entries.len()
    }

    /// フィルタ条件に一致するかチェック
    fn matches_filter(&self, entry: &EventLogEntry, filter: &EventFilter) -> bool {
        // セッションIDフィルタ
        if let Some(session_id) = &filter.session_id {
            if entry.session_id() != session_id {
                return false;
            }
        }

        // プレイヤーIDフィルタ
        if let Some(player_id) = &filter.player_id {
            if let Some(related_player) = entry.related_player() {
                if related_player != player_id {
                    return false;
                }
            } else {
                return false;
            }
        }

        // カテゴリフィルタ
        if let Some(category) = &filter.category {
            if &entry.category() != category {
                return false;
            }
        }

        // 可視性フィルタ
        if let Some((player_id, is_gm)) = &filter.visibility_for_player {
            if !entry.is_visible_to_player(player_id, *is_gm) {
                return false;
            }
        }

        // 時間範囲フィルタ
        if let Some(after) = &filter.after_timestamp {
            if entry.timestamp() <= after {
                return false;
            }
        }

        if let Some(before) = &filter.before_timestamp {
            if entry.timestamp() >= before {
                return false;
            }
        }

        true
    }

    /// JSON文字列からEventLogCollectionを復元
    pub fn from_json(json_str: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json_str)
    }

    /// EventLogCollectionをJSON文字列にシリアライズ
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// 永続化に適したJSON文字列に変換（整形済み）
    pub fn to_json_pretty(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }
}

impl Default for EventFilter {
    fn default() -> Self {
        Self {
            session_id: None,
            player_id: None,
            category: None,
            visibility_for_player: None,
            after_timestamp: None,
            before_timestamp: None,
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

    // TDDサイクル2: 可視性制御機能テスト
    #[test]
    fn test_event_visibility_control() {
        let player1 = PlayerId::new();
        let player2 = PlayerId::new();

        // Public イベントのテスト
        let public_event = EventLogEntry::new(
            EventId::new(),
            SessionId::new(),
            chrono::Utc::now(),
            GameSessionEvent::SessionStarted {
                current_scene: crate::types::SceneId::new(),
            },
            EventVisibility::Public,
            None,
            "ゲーム開始！".to_string(),
        );

        // Public は全員に可視
        assert!(public_event.is_visible_to_player(&player1, false)); // 一般プレイヤー
        assert!(public_event.is_visible_to_player(&player2, false)); // 別プレイヤー
        assert!(public_event.is_visible_to_player(&player1, true));  // GM

        // Private イベントのテスト
        let private_event = EventLogEntry::new(
            EventId::new(),
            SessionId::new(),
            chrono::Utc::now(),
            GameSessionEvent::PlayerAdded {
                player_id: player1.clone(),
                user_id: UserId::new(),
            },
            EventVisibility::Private(player1.clone()),
            Some(player1.clone()),
            "秘密の情報".to_string(),
        );

        // Private は対象プレイヤーのみ可視
        assert!(private_event.is_visible_to_player(&player1, false));  // 対象プレイヤー
        assert!(!private_event.is_visible_to_player(&player2, false)); // 別プレイヤー
        assert!(!private_event.is_visible_to_player(&player2, true));  // GM（対象外）

        // GMOnly イベントのテスト
        let gm_event = EventLogEntry::new(
            EventId::new(),
            SessionId::new(),
            chrono::Utc::now(),
            GameSessionEvent::SessionStatusChanged {
                new_status: crate::types::SessionStatus::Completed,
            },
            EventVisibility::GMOnly,
            None,
            "GM専用メッセージ".to_string(),
        );

        // GMOnly はGMのみ可視
        assert!(!gm_event.is_visible_to_player(&player1, false)); // 一般プレイヤー
        assert!(!gm_event.is_visible_to_player(&player2, false)); // 別プレイヤー
        assert!(gm_event.is_visible_to_player(&player1, true));   // GM

        // System イベントのテスト
        let system_event = EventLogEntry::new(
            EventId::new(),
            SessionId::new(),
            chrono::Utc::now(),
            GameSessionEvent::SessionCreated {
                scenario_id: ScenarioId::new(),
                gm_user_id: UserId::new(),
            },
            EventVisibility::System,
            None,
            "システムログ".to_string(),
        );

        // System は誰にも可視でない
        assert!(!system_event.is_visible_to_player(&player1, false)); // 一般プレイヤー
        assert!(!system_event.is_visible_to_player(&player2, false)); // 別プレイヤー
        assert!(!system_event.is_visible_to_player(&player1, true));  // GM
    }

    // TDDサイクル3: イベントログフィルタリング機能テスト
    #[test]
    fn test_event_log_filtering() {
        let session1 = SessionId::new();
        let session2 = SessionId::new();
        let player1 = PlayerId::new();
        let player2 = PlayerId::new();

        let base_time = chrono::Utc::now();
        let time1 = base_time - chrono::Duration::minutes(10);
        let time2 = base_time - chrono::Duration::minutes(5);
        let time3 = base_time;

        // テスト用のイベントエントリを作成
        let entries = vec![
            // Session1 - Player1関連
            EventLogEntry::new(
                EventId::new(),
                session1.clone(),
                time1,
                GameSessionEvent::PlayerAdded {
                    player_id: player1.clone(),
                    user_id: UserId::new(),
                },
                EventVisibility::Public,
                Some(player1.clone()),
                "プレイヤー1参加".to_string(),
            ),
            // Session1 - Player2関連 - Private
            EventLogEntry::new(
                EventId::new(),
                session1.clone(),
                time2,
                GameSessionEvent::PlayerAdded {
                    player_id: player2.clone(),
                    user_id: UserId::new(),
                },
                EventVisibility::Private(player2.clone()),
                Some(player2.clone()),
                "プレイヤー2の秘密アクション".to_string(),
            ),
            // Session2 - Session系
            EventLogEntry::new(
                EventId::new(),
                session2.clone(),
                time3,
                GameSessionEvent::SessionStarted {
                    current_scene: crate::types::SceneId::new(),
                },
                EventVisibility::Public,
                None,
                "セッション2開始".to_string(),
            ),
        ];

        let log_collection = EventLogCollection::from_entries(entries);
        assert_eq!(log_collection.count(), 3);

        // テスト1: セッションIDでフィルタ
        let session1_filter = EventFilter {
            session_id: Some(session1.clone()),
            ..Default::default()
        };
        let session1_entries = log_collection.filter_entries(&session1_filter);
        assert_eq!(session1_entries.len(), 2);

        // テスト2: プレイヤーIDでフィルタ
        let player1_filter = EventFilter {
            player_id: Some(player1.clone()),
            ..Default::default()
        };
        let player1_entries = log_collection.filter_entries(&player1_filter);
        assert_eq!(player1_entries.len(), 1);
        assert_eq!(player1_entries[0].message(), "プレイヤー1参加");

        // テスト3: カテゴリでフィルタ（Player系イベント）
        let player_category_filter = EventFilter {
            category: Some(EventCategory::Player),
            ..Default::default()
        };
        let player_category_entries = log_collection.filter_entries(&player_category_filter);
        assert_eq!(player_category_entries.len(), 2);

        // テスト4: 可視性フィルタ（player1に見えるもの、GM権限なし）
        let visibility_filter = EventFilter {
            visibility_for_player: Some((player1.clone(), false)),
            ..Default::default()
        };
        let visible_entries = log_collection.filter_entries(&visibility_filter);
        assert_eq!(visible_entries.len(), 2); // PublicとPlayer1のPlayerAddedのみ

        // テスト5: 時間範囲フィルタ
        let time_filter = EventFilter {
            after_timestamp: Some(base_time - chrono::Duration::minutes(7)),
            before_timestamp: Some(base_time + chrono::Duration::minutes(1)),
            ..Default::default()
        };
        let time_filtered_entries = log_collection.filter_entries(&time_filter);
        assert_eq!(time_filtered_entries.len(), 2); // time2とtime3のイベント

        // テスト6: 複合フィルタ（session1かつプレイヤー系）
        let complex_filter = EventFilter {
            session_id: Some(session1),
            category: Some(EventCategory::Player),
            ..Default::default()
        };
        let complex_filtered = log_collection.filter_entries(&complex_filter);
        assert_eq!(complex_filtered.len(), 2);
    }

    // TDDサイクル4: シリアライゼーション機能テスト
    #[test]
    fn test_event_log_serialization() {
        let session_id = SessionId::new();
        let player_id = PlayerId::new();

        // テスト用のイベントログエントリを作成
        let entry = EventLogEntry::new(
            EventId::new(),
            session_id.clone(),
            chrono::Utc::now(),
            GameSessionEvent::SessionCreated {
                scenario_id: ScenarioId::new(),
                gm_user_id: UserId::new(),
            },
            EventVisibility::Public,
            Some(player_id),
            "テストイベント".to_string(),
        );

        let mut collection = EventLogCollection::new();
        collection.add_entry(entry);

        // JSON シリアライゼーション
        let json_result = collection.to_json();
        assert!(json_result.is_ok());
        let json_str = json_result.unwrap();
        assert!(json_str.contains("テストイベント"));
        assert!(json_str.contains("session_created"));

        // JSON デシリアライゼーション
        let deserialized_result = EventLogCollection::from_json(&json_str);
        assert!(deserialized_result.is_ok());
        let deserialized_collection = deserialized_result.unwrap();

        // 復元されたデータの検証
        assert_eq!(deserialized_collection.count(), 1);
        let restored_entries = deserialized_collection.entries();
        assert_eq!(restored_entries[0].message(), "テストイベント");
        assert_eq!(restored_entries[0].session_id(), &session_id);
        assert_eq!(restored_entries[0].visibility(), &EventVisibility::Public);

        // Pretty JSON テスト
        let pretty_json_result = collection.to_json_pretty();
        assert!(pretty_json_result.is_ok());
        let pretty_json = pretty_json_result.unwrap();
        assert!(pretty_json.contains("  "));  // インデントがあることを確認
        assert!(pretty_json.contains("\n"));  // 改行があることを確認

        // 無効なJSONからのデシリアライゼーション失敗テスト
        let invalid_json = "{ invalid json }";
        let error_result = EventLogCollection::from_json(invalid_json);
        assert!(error_result.is_err());
    }
}