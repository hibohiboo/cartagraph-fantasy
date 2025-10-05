# 永続化層設計: IndexedDB ストレージ

**Date**: 2025-10-06
**Phase**: Persistence Layer Design
**Status**: Implemented

## 概要
フロントエンドMVPで使用するIndexedDBベースの永続化層の設計。Event Sourcing、メタデータ管理、オフライン対応を実現。

---

## IndexedDB データベース構成

### 1. Event Store Database (`cartagraph-event-store`)

**目的**: Event Sourcingによるゲーム状態管理

**バージョン**: 1

#### Object Store: `events`

**用途**: イベントストリームの保存

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| `eventId` | string (UUID) | イベント一意識別子 (Primary Key) | ✓ |
| `sessionId` | string (UUID) | セッションID | ✓ |
| `sequence` | number | セッション内の順序番号 (0から開始) | ✓ |
| `eventType` | string | イベントタイプ (例: `CardUsed`, `DiceRolled`) | ✓ |
| `payload` | object | イベントデータ (JSON) | ✓ |
| `timestamp` | number | UNIX timestamp (ミリ秒) | ✓ |
| `version` | number | スキーマバージョン | ✓ |

**インデックス**:
- `by-session`: `sessionId` (非ユニーク) - セッション別イベント取得
- `by-session-sequence`: `[sessionId, sequence]` (ユニーク) - セッション内順序保証
- `by-timestamp`: `timestamp` (非ユニーク) - 時系列クエリ

**イベントタイプ例**:
```typescript
type EventType =
  | 'SessionCreated'
  | 'SessionStarted'
  | 'SessionEnded'
  | 'PlayerJoined'
  | 'PlayerLeft'
  | 'CardUsed'
  | 'DiceRolled'
  | 'SceneAdvanced'
  | 'EventTriggered';
```

---

#### Object Store: `snapshots`

**用途**: ゲーム状態のスナップショット (100イベントごと)

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| `sessionId` | string (UUID) | セッションID (Primary Key) | ✓ |
| `sequence` | number | スナップショット時点のイベントシーケンス | ✓ |
| `state` | object | ゲーム状態 (JSON) | ✓ |
| `timestamp` | number | UNIX timestamp (ミリ秒) | ✓ |
| `version` | number | スキーマバージョン | ✓ |

**インデックス**:
- `by-session-sequence`: `[sessionId, sequence]` (非ユニーク) - セッション別スナップショット検索

**スナップショット戦略**:
- 100イベントごとに自動作成
- 最新スナップショット + 差分イベントでゲーム状態復元
- パフォーマンス目標: イベント再生 < 50ms

---

#### Object Store: `metadata`

**用途**: スキーマバージョン管理・マイグレーション履歴

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| `key` | string | メタデータキー (Primary Key) | ✓ |
| `value` | any | 任意の値 | ✓ |
| `updatedAt` | number | UNIX timestamp (ミリ秒) | ✓ |

**初期メタデータ**:
```json
{
  "key": "schema-version",
  "value": 1,
  "updatedAt": 1696579200000
}
```

---

### 2. Session Store Database (`trpg-sessions`)

**目的**: セッションメタデータの高速取得

**バージョン**: 1

#### Object Store: `sessions`

**用途**: セッション一覧・検索

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| `sessionId` | string (UUID) | セッションID (Primary Key) | ✓ |
| `scenarioId` | string (UUID) | シナリオID | ✓ |
| `gmUserId` | string | GM ユーザーID | ✓ |
| `status` | `'WaitingForPlayers'` \| `'InProgress'` \| `'Completed'` | セッション状態 | ✓ |
| `playerCount` | number | 参加プレイヤー数 | ✓ |
| `createdAt` | string (ISO 8601) | 作成日時 | ✓ |
| `updatedAt` | string (ISO 8601) | 更新日時 | ✓ |

**インデックス**:
- `by-status`: `status` (非ユニーク) - ステータス別フィルタ
- `by-createdAt`: `createdAt` (非ユニーク) - 作成日時ソート

**ステータス遷移**:
```
WaitingForPlayers → InProgress → Completed
```

---

### 3. Character Store Database (`trpg-characters`)

**目的**: キャラクターメタデータ管理

**バージョン**: 1

#### Object Store: `characters`

**用途**: キャラクター一覧・プレイヤー別検索

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| `characterId` | string (UUID) | キャラクターID (Primary Key) | ✓ |
| `name` | string | キャラクター名 | ✓ |
| `playerId` | string | プレイヤーID | ✓ |
| `createdAt` | string (ISO 8601) | 作成日時 | ✓ |
| `lastUpdated` | string (ISO 8601) | 最終更新日時 | ✓ |

**インデックス**:
- `by-playerId`: `playerId` (非ユニーク) - プレイヤー別キャラクター取得
- `by-createdAt`: `createdAt` (非ユニーク) - 作成日時ソート

**MVP実装範囲**:
- 現在は最小限のメタデータのみ
- 将来実装: カード・タグ・履歴データ (別Object Storeまたは別DB)

---

### 4. Scenario Store Database (`trpg-scenario-db`)

**目的**: シナリオメタデータ管理

**バージョン**: 1

#### Object Store: `scenarios`

**用途**: シナリオ一覧・作成者別検索

| フィールド | 型 | 説明 | 必須 |
|-----------|-----|------|------|
| `scenarioId` | string (UUID) | シナリオID (Primary Key) | ✓ |
| `title` | string | シナリオタイトル | ✓ |
| `description` | string | シナリオ説明 | ✓ |
| `initialSceneName` | string | 初期シーン名 | ✓ |
| `authorId` | string | 作成者ID | ✓ |
| `createdAt` | string (ISO 8601) | 作成日時 | ✓ |
| `lastUpdated` | string (ISO 8601) | 最終更新日時 | ✓ |

**インデックス**:
- `by-authorId`: `authorId` (非ユニーク) - 作成者別シナリオ取得
- `by-createdAt`: `createdAt` (非ユニーク) - 作成日時ソート

**MVP実装範囲**:
- 現在は基本メタデータのみ
- 将来実装: シーン・イベント構造 (別Object Storeまたは別DB)
- React Flow エディターのノード・エッジデータは現在メモリのみ

---

## データアクセスパターン

### Event Sourcing パターン

**ゲーム状態復元**:
```typescript
// 1. 最新スナップショット取得
const snapshot = await eventStore.getLatestSnapshot(sessionId);

// 2. スナップショット以降のイベント取得
const fromSequence = snapshot ? snapshot.sequence + 1 : 0;
const events = await eventStore.getEvents({ sessionId, fromSequence });

// 3. イベント再生
let state = snapshot?.state ?? initialState;
for (const event of events) {
  state = applyEvent(state, event);
}
```

**イベント追加**:
```typescript
// シーケンス番号自動採番
const sequence = await eventStore.appendEvent({
  eventId: crypto.randomUUID(),
  sessionId: 'session-123',
  eventType: 'CardUsed',
  payload: { cardId: 'card-456', playerId: 'player-789' },
  timestamp: Date.now(),
  version: 1,
});

// 100イベントごとにスナップショット作成
if (sequence % 100 === 0) {
  await eventStore.saveSnapshot({
    sessionId: 'session-123',
    sequence,
    state: currentGameState,
    timestamp: Date.now(),
    version: 1,
  });
}
```

---

### メタデータ管理パターン

**セッション一覧取得 (ステータス別)**:
```typescript
// アクティブセッションのみ
const activeSessions = await sessionStore.getSessionsByStatus('InProgress');

// 全セッション (作成日時降順)
const allSessions = await sessionStore.getAllSessions();
allSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
```

**キャラクター一覧取得 (プレイヤー別)**:
```typescript
const myCharacters = await characterStore.getCharactersByPlayerId('player-123');
```

**シナリオ一覧取得 (作成者別)**:
```typescript
const myScenarios = await scenarioStore.getScenariosByAuthor('author-123');
```

---

## クロスタブ同期 (BroadcastChannel)

**チャネル構成**:
```typescript
// Event Store 同期
const eventChannel = new BroadcastChannel('trpg-event-sync');

// Session Store 同期
const sessionChannel = new BroadcastChannel('trpg-session-sync');
```

**メッセージタイプ**:
```typescript
type SyncMessage =
  | { type: 'EVENT_APPENDED'; sessionId: string; sequence: number }
  | { type: 'SNAPSHOT_SAVED'; sessionId: string; sequence: number }
  | { type: 'SESSION_CREATED'; sessionId: string }
  | { type: 'SESSION_UPDATED'; sessionId: string }
  | { type: 'REQUEST_SYNC'; sessionId: string }
  | { type: 'SYNC_RESPONSE'; sessionId: string; sequence: number };
```

**使用例**:
```typescript
// タブAでイベント追加
const sequence = await eventStore.appendEvent(event);
eventChannel.postMessage({
  type: 'EVENT_APPENDED',
  sessionId: event.sessionId,
  sequence,
});

// タブBで受信・同期
eventChannel.onmessage = async (msg) => {
  if (msg.data.type === 'EVENT_APPENDED') {
    await reloadEvents(msg.data.sessionId);
  }
};
```

---

## パフォーマンス考慮事項

### 目標

| 操作 | 目標レイテンシ | 実測値 |
|------|---------------|--------|
| イベント追加 | < 10ms | 測定中 |
| イベント範囲取得 (100件) | < 50ms | 測定中 |
| スナップショット保存 | < 50ms | 測定中 |
| セッションメタデータ取得 | < 10ms | 測定中 |
| キャラクター一覧取得 | < 30ms | 測定中 |

### 最適化戦略

**インデックス活用**:
- 複合インデックス `[sessionId, sequence]` でイベント順序保証
- `by-status`, `by-playerId` インデックスで頻繁なクエリを高速化

**スナップショット戦略**:
- 100イベントごとにスナップショット作成
- 古いスナップショットは削除しない (将来的な巻き戻し対応)

**バッチ操作**:
```typescript
// 複数イベント一括取得
const events = await eventStore.getEvents({
  sessionId: 'session-123',
  fromSequence: 0,
  toSequence: 100,
  limit: 100,
});
```

---

## データ整合性保証

### トランザクション境界

**イベント追加 + スナップショット**:
```typescript
const tx = db.transaction(['events', 'snapshots'], 'readwrite');
await tx.objectStore('events').add(event);
if (shouldSnapshot) {
  await tx.objectStore('snapshots').put(snapshot);
}
await tx.done;
```

**セッション削除 (カスケード)**:
```typescript
// イベント + スナップショット全削除
await eventStore.deleteSession(sessionId);

// メタデータも削除
await sessionStore.deleteSession(sessionId);
```

### 整合性制約

**ユニーク制約**:
- `events`: `[sessionId, sequence]` - セッション内シーケンス番号の一意性
- `sessions`, `characters`, `scenarios`: Primary Key (自動)

**参照整合性** (アプリケーション層で実装):
- セッション削除時にイベント・スナップショット削除
- キャラクター削除時のセッション参照チェック (将来実装)

---

## マイグレーション戦略

### スキーマバージョニング

**現在のバージョン**: 全DB v1

**マイグレーション例** (将来):
```typescript
// v1 → v2: characters に personalCards フィールド追加
openDB('trpg-characters', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 2) {
      const tx = db.transaction('characters', 'readwrite');
      const cursor = await tx.store.openCursor();
      while (cursor) {
        cursor.value.personalCards = [];
        await cursor.update(cursor.value);
        await cursor.continue();
      }
    }
  },
});
```

### バックエンド移行戦略 (将来)

**Phase 1: ハイブリッド運用**
- IndexedDB: ローカルファースト、オフライン対応
- Backend API: 同期・バックアップ・マルチデバイス対応

**Phase 2: イベント同期**
- ローカルイベント → バックエンドイベントストリーム同期
- 競合解決: タイムスタンプベース

**Phase 3: 完全移行**
- IndexedDB → キャッシュ層
- Backend → 権威ストア

---

## 開発用ユーティリティ

### データクリア

```typescript
// Event Store全削除
await eventStore.clearAll();

// Session Store全削除
await sessionStore.clear();

// Character Store全削除
await characterStore.clear();

// Scenario Store全削除
await scenarioStore.clear();
```

### 統計情報取得

```typescript
const stats = await eventStore.getStats('session-123');
// {
//   eventCount: 250,
//   snapshotCount: 1,
//   firstEventTime: 1696579200000,
//   lastEventTime: 1696579800000,
// }
```

---

## データモデル比較表

| 概念 | Event Store | Session Store | Character Store | Scenario Store |
|------|------------|--------------|----------------|---------------|
| **主キー** | eventId | sessionId | characterId | scenarioId |
| **データ型** | イベントストリーム | メタデータ | メタデータ | メタデータ |
| **更新頻度** | 高 (プレイ中) | 中 (ステータス変更) | 低 (作成・更新) | 低 (作成・更新) |
| **容量見積** | 大 (数千イベント/セッション) | 小 (数十バイト/レコード) | 小 (数十バイト/レコード) | 小 (数十バイト/レコード) |
| **同期** | BroadcastChannel | BroadcastChannel | 不要 (作成者のみ) | 不要 (作成者のみ) |

---

## セキュリティ考慮事項

### データアクセス制御

**現状 (MVP)**:
- IndexedDBは同一オリジンのみアクセス可能
- ユーザー認証なし (簡素化)

**将来実装**:
- バックエンドAPI: JWT認証
- データ暗号化: Web Crypto API
- プライベートセッション: GM・プレイヤー間のアクセス制御

### データ保持期間

**現状 (MVP)**:
- 無期限 (ユーザー手動削除まで)
- ブラウザストレージクリアで全削除

**将来実装**:
- セッション終了後の自動アーカイブ (30日後)
- 非アクティブキャラクターの自動削除 (90日後)

---

## まとめ

### 実装済みデータベース

1. **Event Store** (`cartagraph-event-store`) - Event Sourcing
2. **Session Store** (`trpg-sessions`) - セッションメタデータ
3. **Character Store** (`trpg-characters`) - キャラクターメタデータ
4. **Scenario Store** (`trpg-scenario-db`) - シナリオメタデータ

### 主要機能

- Event Sourcing による状態管理
- スナップショットによるパフォーマンス最適化
- BroadcastChannel によるクロスタブ同期
- インデックスによる高速クエリ

### 将来拡張

- カード・タグ詳細データの保存
- シナリオ構造 (シーン・イベント) の永続化
- バックエンドAPI統合
- データ暗号化・アクセス制御
