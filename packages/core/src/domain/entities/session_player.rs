use super::super::value_objects::*;
use chrono::{DateTime, Utc};

// ドメインエンティティ：純粋なビジネスロジック
#[derive(Debug, Clone)]
pub struct SessionPlayer {
    pub id: PlayerId,
    pub user_id: UserId,
    pub character: Option<CharacterId>, // キャラクター選択は任意
    pub status: PlayerStatus,
    pub joined_at: DateTime<Utc>,
}

impl SessionPlayer {
    pub fn new(id: PlayerId, user_id: UserId) -> Self {
        Self {
            id,
            user_id,
            character: None,
            status: PlayerStatus::Waiting,
            joined_at: chrono::Utc::now(),
        }
    }

    pub fn assign_character(&mut self, character_id: CharacterId) {
        self.character = Some(character_id);
    }

    pub fn change_status(&mut self, new_status: PlayerStatus) {
        self.status = new_status;
    }

    pub fn is_active(&self) -> bool {
        matches!(self.status, PlayerStatus::Active)
    }
}