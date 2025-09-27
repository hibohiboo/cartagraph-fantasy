use serde::{Deserialize, Serialize};
use ts_rs::TS;
use uuid::Uuid;

// 基本識別子型 - すべてString UUID v4として実装
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct SessionId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct PlayerId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct UserId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct CharacterId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct ScenarioId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct SceneId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct EventId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct CardId(
    #[ts(type = "string")]
    pub String
);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../shared/src/types/")]
#[serde(transparent)]
pub struct TagId(
    #[ts(type = "string")]
    pub String
);

// ID生成実装
impl SessionId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl PlayerId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl UserId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl CharacterId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl ScenarioId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl SceneId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

impl EventId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}

impl CardId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl TagId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}