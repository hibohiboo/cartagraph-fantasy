use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

// 基本識別子型 - すべてUUID v4として実装
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct SessionId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct PlayerId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct UserId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct CharacterId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct ScenarioId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct SceneId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct EventId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct CardId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
pub struct TagId(pub Uuid);

// ID生成実装
impl SessionId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl PlayerId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl UserId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl CharacterId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl ScenarioId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl SceneId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl EventId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl CardId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

impl TagId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}