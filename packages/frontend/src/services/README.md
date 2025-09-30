# Services Layer

フロントエンドのビジネスロジック層。

## Event Store (event-store.ts)

Event Sourcing用のIndexedDBベースイベントストア実装。

### 機能
- イベントストリーム（sessionId, sequence, timestampインデックス）
- 範囲クエリ（fromSequence, toSequence, limit）
- スナップショット管理（100イベント毎）
- バージョン管理・マイグレーション対応

### 使用例
```typescript
import { eventStore } from './event-store';

// 初期化
await eventStore.init();

// イベント追加
const sequence = await eventStore.appendEvent({
  eventId: 'event-1',
  sessionId: 'session-123',
  eventType: 'SESSION_CREATED',
  payload: { scenarioId: 'scenario-1' },
  timestamp: Date.now(),
  version: 1,
});

// イベント取得
const events = await eventStore.getEvents({
  sessionId: 'session-123',
  fromSequence: 0,
  limit: 100,
});

// スナップショット + 差分イベント復元
const { snapshot, events } = await eventStore.loadSessionState('session-123');
```

## Sync Manager (sync-manager.ts)

BroadcastChannelによるクロスタブ同期。

### 機能
- EVENT_APPENDED, SNAPSHOT_SAVED, SESSION_DELETED通知
- REQUEST_SYNC, SYNC_RESPONSE メッセージ処理
- リスナー登録・削除機構

### 使用例
```typescript
import { syncManager } from './sync-manager';

// 初期化
syncManager.init();

// リスナー登録
const unsubscribe = syncManager.addListener((message) => {
  if (message.type === 'EVENT_APPENDED') {
    console.log('New event:', message.event);
    // UIを更新
  }
});

// イベント追加通知
syncManager.notifyEventAppended(sessionId, event);

// クリーンアップ
unsubscribe();
syncManager.cleanup();
```

## Database Service (database.ts)

基本的なIndexedDB操作（セッション、プレイヤー、キャラクター、ゲーム状態）。

## Worker Service (simple-worker-service.ts)

WebWorker + WASM統合サービス。

## テスト実行

### 通常テスト
```bash
bun test
```
通常のテストでは、IndexedDBが必要なテストはスキップされます。

### ブラウザテスト（IndexedDB必須）
```bash
bun run test:browser
```
または
```bash
BROWSER_TEST=1 bun test src/services/event-store.test.ts
```

**注意**: ブラウザ環境でのみ動作します（Node.jsではIndexedDB非対応）。
実際の動作確認は開発サーバー起動後、ブラウザで確認してください。