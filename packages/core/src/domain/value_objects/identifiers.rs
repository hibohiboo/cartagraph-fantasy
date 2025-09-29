use uuid::Uuid;

// ドメイン層の純粋な識別子（インフラ依存なし）
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct SessionId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct PlayerId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct UserId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CharacterId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct ScenarioId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct SceneId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct EventId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CardId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct TagId(pub String);

// ID生成実装（ドメイン層）
impl SessionId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl Default for SessionId {
    fn default() -> Self {
        Self::new()
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

impl Default for PlayerId {
    fn default() -> Self {
        Self::new()
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

impl Default for UserId {
    fn default() -> Self {
        Self::new()
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

impl Default for CharacterId {
    fn default() -> Self {
        Self::new()
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

impl Default for ScenarioId {
    fn default() -> Self {
        Self::new()
    }
}

impl SceneId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl Default for SceneId {
    fn default() -> Self {
        Self::new()
    }
}

impl EventId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl Default for EventId {
    fn default() -> Self {
        Self::new()
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

impl Default for CardId {
    fn default() -> Self {
        Self::new()
    }
}

impl TagId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }

    pub fn from_string(s: String) -> Self {
        Self(s)
    }
}

impl Default for TagId {
    fn default() -> Self {
        Self::new()
    }
}