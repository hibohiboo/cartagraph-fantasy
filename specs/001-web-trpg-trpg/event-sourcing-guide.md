# Event Sourcing 実践ガイド

**Date**: 2025-10-06
**Target**: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」
**Status**: Implementation Guide

---

## 概要

Event Sourcingは、アプリケーションの状態をイベントの連続として記録する設計パターン。TRPGの「巻き戻し」「再生」機能に最適。

---

## Event Sourcingの基本概念

### 従来の状態管理 vs Event Sourcing

**従来 (CRUD)**:
```typescript
// 現在の状態のみ保存
const gameState = {
  currentScene: 'scene-2',
  playerHealth: 50,
  inventory: ['sword', 'potion']
};

// 更新 → 過去の状態は失われる
gameState.playerHealth = 30; // 50だったことは分からない
```

**Event Sourcing**:
```typescript
// イベントの連続として記録
const events = [
  { type: 'SessionStarted', scene: 'scene-1' },
  { type: 'PlayerDamaged', damage: 20, newHealth: 80 },
  { type: 'ItemAcquired', item: 'sword' },
  { type: 'PlayerDamaged', damage: 30, newHealth: 50 },
  { type: 'SceneAdvanced', from: 'scene-1', to: 'scene-2' },
  { type: 'PlayerDamaged', damage: 20, newHealth: 30 }
];

// 任意の時点に巻き戻し可能
const stateAtEvent3 = replayEvents(events.slice(0, 4));
// → { currentScene: 'scene-1', playerHealth: 50, inventory: ['sword'] }
```

---

## `version` フィールドの3つの役割

Event Storeの`version`フィールドは**2つの異なる用途**で使われます:

### 1. イベントスキーマバージョン (`StoredEvent.version`)

**用途**: イベントペイロードの構造変更管理

```typescript
interface StoredEvent {
  eventId: string;
  sessionId: string;
  sequence: number;
  eventType: string;
  payload: any;
  timestamp: number;
  version: number;  // ← イベントスキーマバージョン
}
```

#### 例: `CardUsed` イベントの進化

**v1: 初期実装**
```typescript
{
  eventType: 'CardUsed',
  payload: {
    cardId: 'card-123',
    playerId: 'player-456'
  },
  version: 1
}
```

**v2: タグ情報追加**
```typescript
{
  eventType: 'CardUsed',
  payload: {
    cardId: 'card-123',
    playerId: 'player-456',
    cardTags: ['skill:fire', 'cost:2']  // 新規追加
  },
  version: 2
}
```

**v3: 使用理由追加**
```typescript
{
  eventType: 'CardUsed',
  payload: {
    cardId: 'card-123',
    playerId: 'player-456',
    cardTags: ['skill:fire', 'cost:2'],
    reason: 'auto-trigger'  // 新規追加
  },
  version: 3
}
```

#### イベント再生時のバージョン対応

```typescript
function applyCardUsedEvent(state: GameState, event: StoredEvent): GameState {
  switch (event.version) {
    case 1:
      // v1: 基本情報のみ
      return {
        ...state,
        usedCards: [...state.usedCards, {
          cardId: event.payload.cardId,
          playerId: event.payload.playerId,
          tags: [],  // v1には存在しない → 空配列
          reason: 'unknown'  // v1には存在しない → デフォルト値
        }]
      };

    case 2:
      // v2: タグ情報あり
      return {
        ...state,
        usedCards: [...state.usedCards, {
          cardId: event.payload.cardId,
          playerId: event.payload.playerId,
          tags: event.payload.cardTags,
          reason: 'unknown'  // v2には存在しない → デフォルト値
        }]
      };

    case 3:
      // v3: 完全な情報
      return {
        ...state,
        usedCards: [...state.usedCards, {
          cardId: event.payload.cardId,
          playerId: event.payload.playerId,
          tags: event.payload.cardTags,
          reason: event.payload.reason
        }]
      };

    default:
      throw new Error(`Unsupported CardUsed event version: ${event.version}`);
  }
}
```

---

### 2. 集約バージョン (`GameSession.version`)

**用途**: 楽観的ロック (Optimistic Locking) による並行更新制御

```rust
// Rustのドメインモデル
pub struct GameSession {
    session_id: SessionId,
    current_scene: SceneId,
    players: HashMap<PlayerId, SessionPlayer>,
    // ... 他のフィールド ...
    version: u64,  // ← 集約バージョン (楽観的ロック用)
}
```

#### 楽観的ロックの仕組み

**問題**: 2人のGMが同時にセッションを更新

```
タブA (GM)                    タブB (プレイヤー)
   |                              |
   | 1. セッション読み込み         | 1. セッション読み込み
   |    version: 5                |    version: 5
   |                              |
   | 2. シーン遷移                 |
   |    SessionAdvanced           |
   |    version: 5 → 6            | 2. カード使用
   |                              |    CardUsed
   | 3. 保存 (成功)                |    version: 5 → 6
   |    version: 6                |
   |                              | 3. 保存 (失敗!)
   |                              |    期待 version: 5
   |                              |    実際 version: 6
   |                              |    → 競合エラー
```

**解決**: バージョンチェックで競合検出

```typescript
async function saveSession(session: GameSession): Promise<void> {
  const currentSession = await db.get('sessions', session.sessionId);

  if (currentSession && currentSession.version !== session.version) {
    throw new Error('Optimistic lock failure: session was modified by another user');
  }

  // バージョンをインクリメント
  session.version += 1;
  await db.put('sessions', session);
}
```

#### Event Sourcingとの組み合わせ

Event Sourcingでは、**イベントの `sequence` が集約バージョンの役割を果たす**:

```typescript
// イベント追加時に自動的にシーケンス番号が増える
const sequence = await eventStore.appendEvent({
  eventId: crypto.randomUUID(),
  sessionId: 'session-123',
  eventType: 'CardUsed',
  payload: { ... },
  timestamp: Date.now(),
  version: 1  // ← イベントスキーマバージョン
});

// sequence がこのセッションの「集約バージョン」として機能
// sequence: 0 → 1 → 2 → 3 → ...
```

**並行更新の検出**:
```typescript
// タブAがイベント追加
const seqA = await eventStore.appendEvent(eventA);  // sequence: 5

// タブBも同時にイベント追加を試みる
try {
  const seqB = await eventStore.appendEvent(eventB);  // sequence: 6
  // 成功 (IndexedDBのユニークインデックス [sessionId, sequence] により自動採番)
} catch (error) {
  // 失敗の可能性は低い (IndexedDBはトランザクション内で自動採番)
}
```

**重要**: IndexedDBのトランザクション内で`sequence`を自動採番しているため、楽観的ロック失敗はほぼ発生しません。ただし、**同一タブ内での並行操作**には注意が必要です。

---

### 3. スナップショットバージョン (`Snapshot.version`)

**用途**: スナップショットのスキーマ変更管理

```typescript
interface Snapshot {
  sessionId: string;
  sequence: number;  // このスナップショット時点のイベントシーケンス
  state: any;        // ゲーム状態
  timestamp: number;
  version: number;   // ← スナップショットスキーマバージョン
}
```

#### 例: スナップショット構造の進化

**v1: 基本状態のみ**
```typescript
{
  sessionId: 'session-123',
  sequence: 100,
  state: {
    currentScene: 'scene-2',
    players: { ... }
  },
  version: 1
}
```

**v2: パフォーマンス最適化 (インデックス追加)**
```typescript
{
  sessionId: 'session-123',
  sequence: 200,
  state: {
    currentScene: 'scene-2',
    players: { ... },
    // 高速検索用のインデックス追加
    playerIndex: {
      'player-1': { sceneId: 'scene-2', status: 'active' },
      'player-2': { sceneId: 'scene-1', status: 'waiting' }
    }
  },
  version: 2
}
```

#### スナップショット復元時のバージョン対応

```typescript
async function loadSessionState(sessionId: string): Promise<GameState> {
  const snapshot = await eventStore.getLatestSnapshot(sessionId);

  let state: GameState;

  if (snapshot) {
    // スナップショットバージョンに応じて復元
    switch (snapshot.version) {
      case 1:
        state = {
          ...snapshot.state,
          playerIndex: buildPlayerIndex(snapshot.state.players)  // v1には存在しない → 構築
        };
        break;

      case 2:
        state = snapshot.state;  // そのまま使用
        break;

      default:
        throw new Error(`Unsupported snapshot version: ${snapshot.version}`);
    }

    // スナップショット以降のイベントを再生
    const events = await eventStore.getEvents({
      sessionId,
      fromSequence: snapshot.sequence + 1
    });

    for (const event of events) {
      state = applyEvent(state, event);
    }
  } else {
    // スナップショットがない場合は初期状態から全イベント再生
    state = initialState;
    const events = await eventStore.getEvents({ sessionId, fromSequence: 0 });

    for (const event of events) {
      state = applyEvent(state, event);
    }
  }

  return state;
}
```

---

## 実践例: TRPGセッションのEvent Sourcing

### シナリオ: プレイヤーがカードを使用してダイスを振る

#### 1. イベント記録

```typescript
// イベント1: カード使用
await eventStore.appendEvent({
  eventId: crypto.randomUUID(),
  sessionId: 'session-123',
  eventType: 'CardUsed',
  payload: {
    playerId: 'player-456',
    cardId: 'card-attack',
    cardName: '火炎斬り'
  },
  timestamp: Date.now(),
  version: 1  // CardUsedイベントのスキーマバージョン
});
// → sequence: 42 (自動採番)

// イベント2: ダイス判定
await eventStore.appendEvent({
  eventId: crypto.randomUUID(),
  sessionId: 'session-123',
  eventType: 'DiceRolled',
  payload: {
    playerId: 'player-456',
    diceNotation: '2d6+2',
    rawRolls: [4, 5],
    modifier: 2,
    finalResult: 11,
    success: true
  },
  timestamp: Date.now(),
  version: 1  // DiceRolledイベントのスキーマバージョン
});
// → sequence: 43 (自動採番)

// イベント3: シーン遷移
await eventStore.appendEvent({
  eventId: crypto.randomUUID(),
  sessionId: 'session-123',
  eventType: 'SceneAdvanced',
  payload: {
    fromScene: 'scene-battle',
    toScene: 'scene-victory',
    trigger: 'boss-defeated'
  },
  timestamp: Date.now(),
  version: 1  // SceneAdvancedイベントのスキーマバージョン
});
// → sequence: 44 (自動採番)
```

#### 2. ゲーム状態復元

```typescript
async function loadGame(sessionId: string): Promise<GameState> {
  // 最新スナップショット取得 (sequence: 40)
  const snapshot = await eventStore.getLatestSnapshot(sessionId);

  let state: GameState = snapshot ? snapshot.state : initialGameState;
  console.log(`Loaded snapshot at sequence ${snapshot?.sequence ?? 'none'}`);

  // スナップショット以降のイベント取得 (sequence: 41, 42, 43, 44)
  const events = await eventStore.getEvents({
    sessionId,
    fromSequence: snapshot ? snapshot.sequence + 1 : 0
  });

  console.log(`Replaying ${events.length} events...`);

  // イベント再生
  for (const event of events) {
    state = applyEvent(state, event);
  }

  return state;
}

function applyEvent(state: GameState, event: StoredEvent): GameState {
  switch (event.eventType) {
    case 'CardUsed':
      return applyCardUsedEvent(state, event);

    case 'DiceRolled':
      return applyDiceRolledEvent(state, event);

    case 'SceneAdvanced':
      return applySceneAdvancedEvent(state, event);

    default:
      console.warn(`Unknown event type: ${event.eventType}`);
      return state;
  }
}

function applyCardUsedEvent(state: GameState, event: StoredEvent): GameState {
  // イベントバージョンに応じた処理
  const payload = event.payload;

  return {
    ...state,
    usedCards: [
      ...state.usedCards,
      {
        playerId: payload.playerId,
        cardId: payload.cardId,
        cardName: payload.cardName,
        timestamp: event.timestamp
      }
    ],
    log: [
      ...state.log,
      `${payload.playerId} が ${payload.cardName} を使用しました`
    ]
  };
}
```

#### 3. 巻き戻し機能

```typescript
async function rewindToSequence(sessionId: string, targetSequence: number): Promise<GameState> {
  // 指定シーケンスまでのイベントを再生
  const events = await eventStore.getEvents({
    sessionId,
    fromSequence: 0,
    toSequence: targetSequence
  });

  let state = initialGameState;
  for (const event of events) {
    state = applyEvent(state, event);
  }

  return state;
}

// 使用例: sequence 42 の状態に巻き戻し
const stateAtSeq42 = await rewindToSequence('session-123', 42);
console.log(stateAtSeq42);
// → { currentScene: 'scene-battle', usedCards: [...] }
```

---

## バージョン管理のベストプラクティス

### 1. イベントスキーマバージョン

**推奨**: セマンティックバージョニング

```typescript
// メジャーバージョン: 破壊的変更
// マイナーバージョン: 後方互換性のある追加
// パッチバージョン: バグ修正

const EVENT_SCHEMA_VERSION = {
  CardUsed: 2,      // v2: タグ情報追加 (後方互換)
  DiceRolled: 1,    // v1: 初期バージョン
  SceneAdvanced: 3  // v3: トリガー理由追加 (後方互換)
};

// イベント作成時
await eventStore.appendEvent({
  eventType: 'CardUsed',
  payload: { ... },
  version: EVENT_SCHEMA_VERSION.CardUsed  // ← 定数使用
});
```

### 2. 後方互換性の維持

**原則**: 古いイベントは永久に再生可能であるべき

```typescript
// ✅ 良い例: フィールド追加 (後方互換)
// v1 → v2
{
  playerId: 'player-123',
  cardId: 'card-456',
  cardTags: ['skill:fire']  // 新規追加
}

// ✅ 良い例: デフォルト値でフォールバック
function applyCardUsedEvent(state: GameState, event: StoredEvent): GameState {
  const tags = event.payload.cardTags ?? [];  // v1には存在しない → 空配列
  // ...
}

// ❌ 悪い例: フィールド削除 (破壊的変更)
// v1 → v2
{
  playerId: 'player-123',
  // cardId フィールドを削除 → v1イベントが再生できない!
}
```

### 3. イベントマイグレーション (非推奨)

**原則**: イベントは不変 (Immutable)

イベントを書き換えるのではなく、**再生時に変換**:

```typescript
// ❌ 悪い例: イベントを直接書き換え
async function migrateEvents() {
  const events = await eventStore.getEvents({ sessionId });
  for (const event of events) {
    event.version = 2;  // 直接書き換え → 履歴が失われる!
    await eventStore.updateEvent(event);
  }
}

// ✅ 良い例: 再生時に変換
function applyCardUsedEvent(state: GameState, event: StoredEvent): GameState {
  let payload = event.payload;

  // v1 → v2 変換
  if (event.version === 1) {
    payload = {
      ...payload,
      cardTags: []  // v1には存在しない → デフォルト値
    };
  }

  // 変換後のペイロードで処理
  return applyCardUsedV2(state, payload);
}
```

---

## トラブルシューティング

### Q1. イベントスキーマを間違えて保存してしまった

**A**: 補正イベントを追加

```typescript
// ❌ 間違ったイベント (sequence: 50)
{
  eventType: 'CardUsed',
  payload: {
    playerId: 'player-123',
    cardId: 'wrong-card'  // 間違い!
  },
  version: 1
}

// ✅ 補正イベント追加 (sequence: 51)
{
  eventType: 'CardUsageCorrected',
  payload: {
    originalSequence: 50,
    correctCardId: 'correct-card',
    reason: 'User input error'
  },
  version: 1
}

// 再生時に補正イベントを適用
function applyCardUsageCorrectedEvent(state: GameState, event: StoredEvent): GameState {
  const originalIndex = state.usedCards.findIndex(
    card => card.sequence === event.payload.originalSequence
  );

  if (originalIndex !== -1) {
    state.usedCards[originalIndex].cardId = event.payload.correctCardId;
  }

  return state;
}
```

### Q2. スナップショットが古くてイベント再生が遅い

**A**: スナップショット間隔を調整

```typescript
// metadata で設定
await db.put('metadata', {
  key: 'snapshot-interval',
  value: 50,  // 100 → 50 に変更
  updatedAt: Date.now()
});

// EventStoreService で読み込み
const intervalEntry = await db.get('metadata', 'snapshot-interval');
this.snapshotInterval = intervalEntry?.value ?? 100;
```

### Q3. バージョンが多すぎて管理が大変

**A**: イベントタイプごとにバージョン管理

```typescript
// バージョン定義を一元管理
const EVENT_VERSIONS = {
  SessionCreated: 1,
  SessionStarted: 1,
  SessionEnded: 1,
  PlayerJoined: 2,      // v2に更新
  PlayerLeft: 1,
  CardUsed: 3,          // v3に更新
  DiceRolled: 1,
  SceneAdvanced: 2,     // v2に更新
  EventTriggered: 1
} as const;

// イベント作成ヘルパー
function createEvent(
  eventType: keyof typeof EVENT_VERSIONS,
  sessionId: string,
  payload: any
): Omit<StoredEvent, 'sequence'> {
  return {
    eventId: crypto.randomUUID(),
    sessionId,
    eventType,
    payload,
    timestamp: Date.now(),
    version: EVENT_VERSIONS[eventType]  // 自動的に正しいバージョン
  };
}

// 使用例
await eventStore.appendEvent(
  createEvent('CardUsed', 'session-123', { playerId: '...', cardId: '...' })
);
```

---

## まとめ

### `version` の3つの役割

| version | 用途 | 場所 | 値の意味 |
|---------|------|------|----------|
| **イベントスキーマバージョン** | イベント構造の変更管理 | `StoredEvent.version` | 1, 2, 3, ... (イベントタイプごと) |
| **集約バージョン** | 楽観的ロック (並行更新制御) | `GameSession.version` または `sequence` | 0, 1, 2, 3, ... (イベントごとに増加) |
| **スナップショットバージョン** | スナップショット構造の変更管理 | `Snapshot.version` | 1, 2, 3, ... (スナップショット構造の進化) |

### Event Sourcing のメリット

1. **完全な履歴**: 全ての変更が記録される
2. **巻き戻し**: 任意の時点に状態を復元可能
3. **監査証跡**: 誰が何をしたか全て分かる
4. **デバッグ**: イベントを再生してバグ再現
5. **将来の分析**: 過去のイベントから新しい情報を抽出

### TRPGでの活用

- **セーブ・ロード**: イベントストリームの保存・復元
- **リプレイ機能**: イベント再生でゲーム進行を再現
- **巻き戻し**: GM判断でシーンやアクションを取り消し
- **統計分析**: プレイヤーの行動パターン分析
