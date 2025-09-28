# Data Model Design: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Date**: 2025-09-26
**Phase**: Phase 1 - Design & Contracts
**Prerequisites**: research.md complete

## Overview
ドメイン駆動設計(DDD)に基づく、非同期TRPG風ゲームのドメインモデル設計。Event Sourcingとオニオンアーキテクチャを採用し、WebAssemblyでのコアロジック実装を前提とする。

---

## Domain Model Architecture

### Aggregate Root Design
Rustの型システムを活用したDDD境界設計。各集約ルートは一貫性境界を持つ。

```rust
// Core domain aggregates
pub mod aggregates {
    pub struct GameSession;      // Primary aggregate root
    pub struct ScenarioTemplate; // Secondary aggregate root
    pub struct Character;        // Secondary aggregate root
}
```

---

## 1. GameSession (主要集約ルート)

### Purpose
実際のゲームプレイインスタンス。セッション全体の一貫性を保証する境界。

### Aggregate Structure
```rust
#[derive(Serialize, Deserialize)]
pub struct GameSession {
    // Identity
    session_id: SessionId,

    // Session Context
    scenario: ScenarioInstance,
    gm_user_id: UserId,
    created_at: DateTime<Utc>,

    // Players & Characters
    players: HashMap<PlayerId, SessionPlayer>,
    max_players: usize,

    // Game State
    current_scene: SceneState,
    shared_cards: Vec<Card>,
    session_log: EventLog,

    // Rules Engine
    rule_engine: RuleEngine,

    // Event History (Event Sourcing)
    uncommitted_events: Vec<DomainEvent>,
    version: u64,
}

pub struct SessionPlayer {
    player_id: PlayerId,
    user_id: UserId,
    character: SessionCharacter,  // Copy of original character
    status: PlayerStatus,         // Active, Inactive, Departed
    joined_at: DateTime<Utc>,
}

pub enum PlayerStatus {
    Active,
    Inactive(Duration),
    Departed,
}
```

### Value Objects
```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct SessionId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct PlayerId(pub Uuid);
```

### Domain Events
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SessionEvent {
    // Session Lifecycle
    SessionCreated {
        session_id: SessionId,
        scenario_id: ScenarioId,
        gm_id: UserId
    },
    SessionStarted {
        session_id: SessionId,
        initial_scene: SceneId
    },
    SessionEnded {
        session_id: SessionId,
        reason: EndReason
    },

    // Player Management
    PlayerJoined {
        player_id: PlayerId,
        character: SessionCharacter
    },
    PlayerLeft {
        player_id: PlayerId,
        reason: DepartureReason
    },
    PlayerStatusChanged {
        player_id: PlayerId,
        status: PlayerStatus
    },

    // Game Actions
    CardUsed {
        player_id: PlayerId,
        card_id: CardId,
        timestamp: DateTime<Utc>
    },
    DiceRolled {
        player_id: PlayerId,
        notation: DiceNotation,
        result: DiceResult
    },
    SceneAdvanced {
        from_scene: SceneId,
        to_scene: SceneId,
        trigger: SceneTrigger
    },
    EventTriggered {
        event_id: EventId,
        trigger_source: TriggerSource
    },
}

pub enum EndReason {
    Completed,
    GMTerminated,
    AllPlayersLeft,
    Timeout,
}

pub enum DepartureReason {
    Voluntary,
    Kicked,
    Timeout,
}
```

---

## 2. ScenarioTemplate (二次集約ルート)

### Purpose
再利用可能なシナリオ定義。GMが選択してセッションを開始するテンプレート。

### Aggregate Structure
```rust
#[derive(Serialize, Deserialize)]
pub struct ScenarioTemplate {
    // Identity
    scenario_id: ScenarioId,

    // Metadata
    name: ScenarioName,
    description: String,
    author_id: UserId,
    version: VersionNumber,

    // Game Design
    recommended_players: PlayerRange,
    estimated_duration: Duration,
    difficulty: Difficulty,
    tags: Vec<ScenarioTag>,

    // Structure
    scenes: HashMap<SceneId, SceneDefinition>,
    initial_scene_id: SceneId,

    // Resources
    shared_cards: Vec<CardTemplate>,

    // Derivation
    derived_from: Option<ScenarioId>,

    // Event History
    uncommitted_events: Vec<DomainEvent>,
    version: u64,
}

pub struct SceneDefinition {
    scene_id: SceneId,
    name: String,
    description: String,
    objective: String,
    completion_condition: CompletionCondition,
    events: HashMap<EventId, EventDefinition>,
    transitions: Vec<SceneTransition>,
}

pub struct EventDefinition {
    event_id: EventId,
    name: String,
    event_type: EventType,
    triggers: Vec<EventTrigger>,
    effects: Vec<EventEffect>,
    message: String,
}
```

### Value Objects
```rust
#[derive(Debug, Clone, PartialEq)]
pub struct ScenarioName(String);

#[derive(Debug, Clone, PartialEq)]
pub struct PlayerRange {
    min: usize,
    max: usize,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Difficulty {
    Beginner,
    Intermediate,
    Advanced,
    Expert,
}

pub enum EventType {
    Narrative,        // 物語進行イベント
    Action,          // 行動判定イベント
    Possession,      // 所持判定イベント
    SceneTransition, // シーン移動イベント
    CardDistribution, // カード配布イベント
}
```

### Domain Events
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ScenarioEvent {
    ScenarioCreated {
        scenario_id: ScenarioId,
        name: ScenarioName,
        author_id: UserId
    },
    ScenarioUpdated {
        scenario_id: ScenarioId,
        changes: ScenarioChanges
    },
    ScenarioDerived {
        new_scenario_id: ScenarioId,
        source_scenario_id: ScenarioId
    },
    ScenarioPublished {
        scenario_id: ScenarioId
    },
    ScenarioArchived {
        scenario_id: ScenarioId
    },
}
```

---

## 3. Character (二次集約ルート)

### Purpose
プレイヤーが作成・管理するキャラクター。セッション間で永続化される。

### Aggregate Structure
```rust
#[derive(Serialize, Deserialize)]
pub struct Character {
    // Identity
    character_id: CharacterId,

    // Basic Info
    name: CharacterName,
    player_id: UserId,

    // Game Attributes
    personal_cards: Vec<Card>,      // 持ち込みカード
    acquired_tags: Vec<Tag>,        // 獲得タグ

    // Session History
    session_history: Vec<SessionRecord>,

    // Restrictions
    scenario_restrictions: HashMap<ScenarioId, RestrictionReason>,

    // Metadata
    created_at: DateTime<Utc>,
    last_updated: DateTime<Utc>,

    // Event History
    uncommitted_events: Vec<DomainEvent>,
    version: u64,
}

pub struct SessionRecord {
    session_id: SessionId,
    scenario_id: ScenarioId,
    participated_at: DateTime<Utc>,
    final_tags: Vec<Tag>,
    final_cards: Vec<Card>,
    feedback: Option<String>,
}

// セッション専用キャラクターコピー
#[derive(Serialize, Deserialize)]
pub struct SessionCharacter {
    character_id: CharacterId,
    name: CharacterName,
    session_cards: Vec<Card>,  // 持ち込み + セッション配布
    session_tags: Vec<Tag>,    // 初期 + セッション獲得
    status: CharacterStatus,
}

pub enum CharacterStatus {
    Ready,
    InAction,
    WaitingForInput,
    Incapacitated,
}
```

### Value Objects
```rust
#[derive(Debug, Clone, PartialEq)]
pub struct CharacterName(String);

pub enum RestrictionReason {
    AlreadyCompleted,
    IncompatibleTags,
    ScenarioLimited,
}
```

---

## 4. Supporting Entities & Value Objects

### Card System
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    card_id: CardId,
    name: String,
    card_type: CardType,
    tags: Vec<Tag>,
    embedded_events: Vec<EventId>,
    rarity: Rarity,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CardType {
    Action,           // アクション用カード
    Choice,          // 選択肢カード
    Possession,      // 所持カード
    SceneTransition, // シーン移動カード
}

#[derive(Debug, Clone, PartialEq)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Legendary,
}
```

### Tag System
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    tag_id: TagId,
    name: String,
    category: TagCategory,
    value: Option<TagValue>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TagCategory {
    Skill,        // スキル系
    Status,       // 状態系
    Achievement,  // 実績系
    Condition,    // 状況系
}

#[derive(Debug, Clone, PartialEq)]
pub enum TagValue {
    Numeric(i32),
    Boolean(bool),
    Text(String),
}
```

### Dice System
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiceNotation {
    dice_count: u8,
    dice_sides: u8,
    modifier: i8,
    advantage: AdvantageType,
}

#[derive(Debug, Clone, PartialEq)]
pub enum AdvantageType {
    Normal,
    Advantage,   // 有利(+1修正)
    Disadvantage, // 不利(-1修正)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiceResult {
    notation: DiceNotation,
    raw_rolls: Vec<u8>,
    final_result: u8,
    success: bool,
}

impl DiceResult {
    pub fn is_success(&self) -> bool {
        self.final_result >= 7
    }
}
```

---

## 5. Domain Services

### Rule Engine
```rust
pub struct RuleEngine {
    scenario_rules: ScenarioRules,
    global_rules: GlobalRules,
}

impl RuleEngine {
    pub fn validate_card_usage(&self, card: &Card, context: &GameContext) -> Result<(), RuleViolation>;
    pub fn calculate_dice_result(&self, notation: &DiceNotation, entropy: &[u8]) -> DiceResult;
    pub fn resolve_event_effects(&self, event: &EventDefinition, context: &GameContext) -> Vec<GameEffect>;
    pub fn check_scene_transition(&self, current_scene: &SceneState, trigger: &SceneTrigger) -> Option<SceneId>;
}
```

### Event Log Service
```rust
pub struct EventLog {
    entries: Vec<LogEntry>,
    sequence: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    sequence_id: u64,
    timestamp: DateTime<Utc>,
    event_type: LogEventType,
    actor: Option<PlayerId>,
    content: LogContent,
    visibility: Visibility,
}

pub enum LogEventType {
    SystemMessage,
    PlayerAction,
    DiceRoll,
    CardUsage,
    SceneChange,
    Roleplay,
}

pub enum Visibility {
    All,
    GM,
    Player(PlayerId),
    Party,
}
```

---

## 6. State Transitions

### Session State Machine
```rust
#[derive(Debug, Clone, PartialEq)]
pub enum SessionState {
    Created,
    Recruiting,
    Starting,
    InProgress {
        current_scene: SceneId,
        active_players: HashSet<PlayerId>,
    },
    Paused,
    Completed,
    Terminated,
}

impl SessionState {
    pub fn can_transition_to(&self, target: &SessionState) -> bool;
    pub fn required_conditions(&self, target: &SessionState) -> Vec<Condition>;
}
```

### Scene State Machine
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SceneState {
    scene_id: SceneId,
    status: SceneStatus,
    active_events: HashMap<EventId, EventInstance>,
    completion_progress: CompletionProgress,
    participants: HashSet<PlayerId>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum SceneStatus {
    Entering,
    Active,
    Resolving,
    Completed,
}
```

---

## 7. Repository Interfaces (Infrastructure)

### Primary Repositories
```rust
pub trait SessionRepository {
    async fn save(&mut self, session: GameSession) -> Result<(), RepositoryError>;
    async fn find_by_id(&self, session_id: SessionId) -> Result<Option<GameSession>, RepositoryError>;
    async fn find_active_by_player(&self, player_id: PlayerId) -> Result<Vec<GameSession>, RepositoryError>;
}

pub trait ScenarioRepository {
    async fn save(&mut self, scenario: ScenarioTemplate) -> Result<(), RepositoryError>;
    async fn find_by_id(&self, scenario_id: ScenarioId) -> Result<Option<ScenarioTemplate>, RepositoryError>;
    async fn find_public(&self) -> Result<Vec<ScenarioTemplate>, RepositoryError>;
}

pub trait CharacterRepository {
    async fn save(&mut self, character: Character) -> Result<(), RepositoryError>;
    async fn find_by_id(&self, character_id: CharacterId) -> Result<Option<Character>, RepositoryError>;
    async fn find_by_player(&self, player_id: UserId) -> Result<Vec<Character>, RepositoryError>;
}
```

### Event Store Interface
```rust
pub trait EventStore {
    async fn save_events(&mut self, aggregate_id: AggregateId, events: Vec<DomainEvent>) -> Result<(), EventStoreError>;
    async fn load_events(&self, aggregate_id: AggregateId) -> Result<Vec<DomainEvent>, EventStoreError>;
    async fn load_events_from(&self, aggregate_id: AggregateId, version: u64) -> Result<Vec<DomainEvent>, EventStoreError>;
}
```

---

## 8. Validation Rules

### Business Invariants
```rust
impl GameSession {
    fn validate_player_limit(&self) -> Result<(), DomainError> {
        if self.players.len() > self.max_players {
            return Err(DomainError::PlayerLimitExceeded);
        }
        Ok(())
    }

    fn validate_scene_transition(&self, target_scene: SceneId) -> Result<(), DomainError> {
        let current_scene = &self.current_scene;
        if !current_scene.can_transition_to(target_scene) {
            return Err(DomainError::InvalidSceneTransition);
        }
        Ok(())
    }
}

impl Character {
    fn validate_scenario_participation(&self, scenario_id: ScenarioId) -> Result<(), DomainError> {
        if let Some(reason) = self.scenario_restrictions.get(&scenario_id) {
            return Err(DomainError::ScenarioRestricted(reason.clone()));
        }
        Ok(())
    }
}
```

---

## 9. WebAssembly FFI Integration

### Type Safety Bridge
```rust
// WebAssemblyエクスポート用の型安全ブリッジ
#[wasm_bindgen]
pub struct GameSessionHandle {
    inner: GameSession,
}

#[wasm_bindgen]
impl GameSessionHandle {
    #[wasm_bindgen(constructor)]
    pub fn new(scenario_id: String, gm_id: String) -> GameSessionHandle;

    #[wasm_bindgen]
    pub fn use_card(&mut self, player_id: String, card_id: String) -> String;

    #[wasm_bindgen]
    pub fn roll_dice(&mut self, player_id: String, notation: String, entropy: &[u8]) -> String;

    #[wasm_bindgen]
    pub fn get_game_state(&self) -> String;

    #[wasm_bindgen]
    pub fn process_events(&mut self) -> String;
}

// TypeScript型定義生成用アノテーション
use tsify::Tsify;

#[derive(Tsify, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct GameStateSnapshot {
    session_id: String,
    current_scene: String,
    players: Vec<PlayerSnapshot>,
    shared_cards: Vec<CardSnapshot>,
    recent_log: Vec<String>,
}
```

---

## 10. Integration Points

### Frontend Integration
- **WebWorker Communication**: メッセージパッシングによる非同期処理
- **State Synchronization**: IndexedDBイベントストア + BroadcastChannel
- **UI State Binding**: React Query + Zustand でローカルステート管理

### Storage Integration
- **Event Sourcing**: IndexedDBのObject Storeでイベントストリーム保存
- **Snapshots**: 定期的なゲーム状態スナップショット作成
- **Cross-Tab Sync**: BroadcastChannelでリアルタイム同期

### Future Backend Integration
- **API Contracts**: OpenAPI schemaからの型生成
- **Event Synchronization**: ローカルイベント → バックエンドイベントストリーム
- **Conflict Resolution**: イベントタイムスタンプベースの競合解決

---

## Summary

**Domain Boundaries**:
- **GameSession**: ゲームプレイの一貫性境界
- **ScenarioTemplate**: シナリオ定義の再利用境界
- **Character**: プレイヤー資産の永続化境界

**Key Design Decisions**:
- Event Sourcing によるゲーム状態管理
- Session-centric aggregate root でマルチプレイヤー整合性保証
- WebAssembly FFI での型安全性確保
- DDD + Onion Architecture でドメインロジック独立性確保

**MVP Implementation Priority**:
1. **Core**: GameSession, Character, Card system (TDD必須)
2. **Shared**: TypeScript型定義 (型テスト)
3. **Frontend**: React UI, IndexedDB統合 (E2E)

このドメインモデルにより、複雑なTRPGルールを型安全に実装し、非同期プレイを支援するイベントベースアーキテクチャを実現する。

---

## 11. Onion Architecture Implementation Status

### Architecture Overview (実装済み)
```
packages/core/src/
├── domain/              # Domain Layer (インフラ依存なし)
│   ├── entities/        # 集約ルート・エンティティ
│   │   ├── game_session.rs    # GameSession集約 ✅ 完了
│   │   └── character.rs       # Character集約 ✅ 完了
│   ├── value_objects/   # 値オブジェクト
│   │   └── identifiers.rs     # ID型定義 ✅ 完了
│   └── mod.rs          # ドメイン境界定義 ✅ 完了
├── infrastructure/     # Infrastructure Layer
│   └── serialization/
│       └── dto.rs      # DTO変換 ✅ 完了
└── wasm_interface.rs   # WASM FFI境界 ✅ 完了
```

### Domain Layer Implementation (完了)

#### GameSession集約
- **純粋ドメインロジック**: Serde traitを除去、インフラ依存ゼロ実現
- **集約ルート境界**: セッション一貫性の完全実装
- **TDD実装**: 61/61テスト通過、小さなサイクルでの段階的実装
- **状態遷移**: SessionStatus, PlayerStatusの完全実装

#### Character集約
- **純粋ドメインロジック**: インフラ依存なしの実装完了
- **ビジネスルール**: カード追加、タグ管理、シナリオ制限チェック
- **TDD実装**: 19/19テスト通過、5つのTDDサイクル完了
- **セッション履歴**: SessionRecord管理の完全実装

### Infrastructure Layer Implementation (完了)

#### DTO Pattern
```rust
// DTOパターン: ドメイン ↔ WASM境界の型安全性確保
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GameSessionDto {
    pub session_id: String,
    pub scenario_id: String,
    // ... 他のフィールド
}

// 双方向変換の実装
impl From<&GameSession> for GameSessionDto { /* 実装済み */ }
impl From<GameSessionDto> for GameSession { /* 実装済み */ }
```

#### TypeScript型生成
- **ts-rs統合**: Rust型から自動的にTypeScript型定義生成
- **WASM境界**: 型安全なFFI contractsの実現
- **型同期**: ドメイン変更 → TypeScript型の自動更新

### WASM Interface Implementation (完了)

#### Contract Methods
```rust
// GameSession WASM interface
pub fn wasm_create_session(scenario_id: String, gm_user_id: String) -> String;
pub fn wasm_join_session(session_data: String, player_id: String, user_id: String) -> String;
pub fn wasm_start_session(session_data: String) -> String;
pub fn wasm_leave_session(session_data: String, player_id: String) -> String;

// Character WASM interface
pub fn wasm_create_character(character_id: String, name: String, player_id: String) -> String;
pub fn wasm_add_character_card(character_data: String, card_data: String) -> String;
pub fn wasm_check_scenario_participation(character_data: String, scenario_id: String) -> String;
pub fn wasm_add_character_session_record(character_data: String, record_data: String) -> String;
```

### Architecture Quality Assurance

#### 依存方向の正確性 ✅
```
Infrastructure → Domain (正しい)
WASM Interface → Domain + Infrastructure (正しい)
Domain → 外部依存なし (正しい)
```

#### Domain Layer純粋性 ✅
- **Serde traits除去**: `#[derive(Serialize, Deserialize)]`を完全排除
- **Infrastructure分離**: シリアライゼーション責任をInfrastructure層に移譲
- **ビジネスロジック集中**: ドメインルール実装のみにフォーカス

#### 型安全境界 ✅
- **DTO変換**: ドメイン型 ↔ DTO変換で境界型安全性確保
- **WASM契約**: String-based FFI + 構造化シリアライゼーション
- **TypeScript統合**: Rust型からのTypeScript定義自動生成

### Test Coverage Status

#### テスト実行結果 (74/74 通過)
```bash
GameSession Tests: 61/61 ✅
Character Tests: 19/19 ✅
Contract Tests: 8/8 ✅ (WASM interface)
Integration Tests: 完了 ✅
```

#### TDD実装証跡
- **小さなサイクル**: 各機能を1つずつテストファースト実装
- **RED-GREEN-Refactor**: 純粋なTDDサイクルの徹底
- **段階的拡張**: 最小ケース → 基本ケース → 制約付きケースの順次実装

### Next Implementation Phase

#### ScenarioTemplate集約 (Task 11)
- **Domain実装**: TDD-firstでのScenarioTemplate集約実装
- **DTO統合**: ScenarioTemplateDto + 双方向変換
- **WASM interface**: Scenario CRUD operations
- **型生成**: TypeScript型定義の自動生成

#### アーキテクチャ維持方針
- **依存方向**: Infrastructure → Domain の厳格な維持
- **純粋性**: Domain層の外部依存ゼロ維持
- **型安全性**: DTO境界での完全な型変換実装
- **TDD継続**: 新機能実装での小さなサイクル徹底

### Summary

オニオンアーキテクチャの実装により、以下を達成：

1. **ドメインロジック独立性**: インフラ依存ゼロのクリーンなドメイン層
2. **型安全WASM境界**: DTOパターンによる構造化シリアライゼーション
3. **テスト可能性**: 74/74テスト通過、TDD実装品質保証
4. **拡張性**: 新集約追加時の既存コード影響ゼロ設計

このアーキテクチャ基盤により、ScenarioTemplate集約以降の実装も同様の品質で拡張可能。