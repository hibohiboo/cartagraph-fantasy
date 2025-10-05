# metadata Object Store 使用ガイド

**Database**: `cartagraph-event-store`
**Object Store**: `metadata`
**用途**: スキーマバージョン管理・アプリケーション設定・マイグレーション履歴

---

## 概要

`metadata` Object Storeは、Event Storeデータベース全体のメタ情報を管理する汎用Key-Valueストアです。主にスキーマバージョニングとマイグレーション管理に使用されます。

---

## スキーマ定義

```typescript
interface MetadataEntry {
  key: string;           // Primary Key: メタデータのキー
  value: any;            // 任意の値 (JSON化可能)
  updatedAt: number;     // UNIX timestamp (ミリ秒)
}
```

**特徴**:
- **汎用性**: 任意のキー・バリューを保存可能
- **型安全性なし**: `value`は`any`型なので、アプリケーション層で型管理が必要
- **更新日時**: 各エントリーの最終更新日時を記録

---

## 主な用途

### 1. スキーマバージョン管理

**目的**: データベースのスキーマバージョンを記録し、マイグレーション判定に使用

**初期化時の登録**:
```typescript
// データベース作成時に自動登録 (event-store.ts)
openDB<EventStoreDB>('cartagraph-event-store', 1, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // ... Object Store作成 ...

    // スキーマバージョン記録
    transaction.objectStore('metadata').put({
      key: 'schema-version',
      value: newVersion,  // 例: 1
      updatedAt: Date.now(),
    });
  },
});
```

**バージョン確認**:
```typescript
const schemaEntry = await db.get('metadata', 'schema-version');
if (schemaEntry) {
  console.log(`Current schema version: ${schemaEntry.value}`);
  console.log(`Last updated: ${new Date(schemaEntry.updatedAt)}`);
}
```

**マイグレーション判定**:
```typescript
const schemaEntry = await db.get('metadata', 'schema-version');
const currentVersion = schemaEntry?.value ?? 0;

if (currentVersion < 2) {
  // v1 → v2 マイグレーション実行
  await migrateV1toV2(db);

  // バージョン更新
  await db.put('metadata', {
    key: 'schema-version',
    value: 2,
    updatedAt: Date.now(),
  });
}
```

---

### 2. マイグレーション履歴

**目的**: 過去のマイグレーション実行履歴を記録

**マイグレーション記録**:
```typescript
// マイグレーション実行前
const migrationStart = Date.now();

// マイグレーション実行
await migrateV1toV2(db);

// 履歴記録
await db.put('metadata', {
  key: 'migration-v1-to-v2',
  value: {
    executedAt: migrationStart,
    completedAt: Date.now(),
    status: 'success',
    recordsAffected: 1234,
  },
  updatedAt: Date.now(),
});
```

**マイグレーション履歴確認**:
```typescript
const migrationHistory = await db.get('metadata', 'migration-v1-to-v2');
if (migrationHistory) {
  const duration = migrationHistory.value.completedAt - migrationHistory.value.executedAt;
  console.log(`Migration v1→v2 took ${duration}ms`);
  console.log(`Records affected: ${migrationHistory.value.recordsAffected}`);
}
```

---

### 3. アプリケーション設定

**目的**: Event Storeに関連する設定値を保存

**スナップショット間隔設定**:
```typescript
// デフォルト値: 100イベント
await db.put('metadata', {
  key: 'snapshot-interval',
  value: 100,
  updatedAt: Date.now(),
});

// 設定読み込み
const intervalEntry = await db.get('metadata', 'snapshot-interval');
const snapshotInterval = intervalEntry?.value ?? 100; // デフォルト100
```

**イベント保持期間**:
```typescript
// 古いイベントの自動削除設定 (将来実装)
await db.put('metadata', {
  key: 'event-retention-days',
  value: 90, // 90日間保持
  updatedAt: Date.now(),
});
```

**データ圧縮設定**:
```typescript
// イベントペイロードの圧縮有効化 (将来実装)
await db.put('metadata', {
  key: 'enable-compression',
  value: true,
  updatedAt: Date.now(),
});
```

---

### 4. 統計情報

**目的**: データベース全体の統計情報をキャッシュ

**最終同期日時**:
```typescript
// バックエンドとの最終同期日時 (将来実装)
await db.put('metadata', {
  key: 'last-sync-timestamp',
  value: Date.now(),
  updatedAt: Date.now(),
});

// 同期チェック
const lastSyncEntry = await db.get('metadata', 'last-sync-timestamp');
const lastSyncTime = lastSyncEntry?.value ?? 0;
const hoursSinceSync = (Date.now() - lastSyncTime) / (1000 * 60 * 60);
console.log(`Last synced ${hoursSinceSync.toFixed(1)} hours ago`);
```

**データベース統計**:
```typescript
// 定期的に統計を更新
await db.put('metadata', {
  key: 'db-stats',
  value: {
    totalEvents: 5000,
    totalSnapshots: 50,
    totalSessions: 25,
    databaseSizeMB: 12.5,
  },
  updatedAt: Date.now(),
});
```

---

## 使用パターン例

### パターン1: 機能フラグ (Feature Flags)

```typescript
// 実験的機能の有効化
await db.put('metadata', {
  key: 'feature-flag:advanced-dice-rolling',
  value: true,
  updatedAt: Date.now(),
});

// フラグチェック
const flagEntry = await db.get('metadata', 'feature-flag:advanced-dice-rolling');
const isEnabled = flagEntry?.value ?? false;

if (isEnabled) {
  // 実験的機能を使用
  advancedDiceRoll();
}
```

### パターン2: ユーザー設定

```typescript
// ユーザーごとの設定 (将来実装)
await db.put('metadata', {
  key: 'user-preference:event-log-filter',
  value: {
    userId: 'user-123',
    filters: ['PlayerAction', 'DiceRoll'],
  },
  updatedAt: Date.now(),
});
```

### パターン3: デバッグ情報

```typescript
// 開発環境でのデバッグモード
await db.put('metadata', {
  key: 'debug-mode',
  value: process.env.NODE_ENV === 'development',
  updatedAt: Date.now(),
});

// デバッグモードチェック
const debugEntry = await db.get('metadata', 'debug-mode');
if (debugEntry?.value) {
  console.log('[DEBUG] Verbose logging enabled');
}
```

---

## ベストプラクティス

### 1. キー命名規則

**推奨形式**: `カテゴリー:詳細`

```typescript
// スキーマ関連
'schema-version'
'migration-v1-to-v2'

// 設定
'snapshot-interval'
'event-retention-days'
'enable-compression'

// 機能フラグ
'feature-flag:advanced-dice-rolling'
'feature-flag:experimental-ui'

// 統計
'db-stats'
'last-sync-timestamp'

// ユーザー設定
'user-preference:event-log-filter'
'user-preference:theme'
```

### 2. 型安全性の確保

**型ガード関数の使用**:
```typescript
// 型定義
interface SchemaVersion {
  version: number;
}

interface SnapshotInterval {
  interval: number;
}

// 型ガード
function isSchemaVersion(value: any): value is SchemaVersion {
  return typeof value === 'number';
}

function isSnapshotInterval(value: any): value is SnapshotInterval {
  return typeof value === 'number' && value > 0;
}

// 使用例
const schemaEntry = await db.get('metadata', 'schema-version');
if (schemaEntry && isSchemaVersion(schemaEntry.value)) {
  const version: number = schemaEntry.value;
  console.log(`Schema version: ${version}`);
}
```

### 3. デフォルト値の提供

```typescript
async function getMetadata<T>(key: string, defaultValue: T): Promise<T> {
  const entry = await db.get('metadata', key);
  return entry?.value ?? defaultValue;
}

// 使用例
const snapshotInterval = await getMetadata('snapshot-interval', 100);
const debugMode = await getMetadata('debug-mode', false);
```

### 4. 更新日時の活用

```typescript
// 古い設定の検出
const entry = await db.get('metadata', 'snapshot-interval');
if (entry) {
  const ageInDays = (Date.now() - entry.updatedAt) / (1000 * 60 * 60 * 24);
  if (ageInDays > 30) {
    console.warn(`Setting 'snapshot-interval' hasn't been updated in ${ageInDays.toFixed(0)} days`);
  }
}
```

---

## 注意事項

### 1. 容量制限

IndexedDBの容量制限に注意:
- **推奨**: metadataは小さな値のみ (< 1KB/エントリー)
- **避ける**: 大きなオブジェクト・バイナリデータの保存

### 2. トランザクション

metadataの更新は他のObject Storeと独立して実行可能:
```typescript
// メタデータのみのトランザクション
const tx = db.transaction('metadata', 'readwrite');
await tx.objectStore('metadata').put({
  key: 'last-cleanup-timestamp',
  value: Date.now(),
  updatedAt: Date.now(),
});
await tx.done;
```

### 3. 読み取り専用データ

頻繁に読み取るメタデータはアプリケーション起動時にキャッシュ:
```typescript
// アプリケーション起動時
class EventStoreService {
  private snapshotInterval: number = 100;

  async init(): Promise<void> {
    // ... DB初期化 ...

    // メタデータ読み込み
    const intervalEntry = await this.db.get('metadata', 'snapshot-interval');
    this.snapshotInterval = intervalEntry?.value ?? 100;
  }

  // キャッシュ値を使用
  async appendEvent(event: StoredEvent): Promise<number> {
    // ...
    if (sequence % this.snapshotInterval === 0) {
      // スナップショット作成
    }
  }
}
```

---

## 現在の使用状況 (MVP)

### 実装済み

- `schema-version`: スキーマバージョン記録 (v1)

### 未実装 (将来拡張)

- マイグレーション履歴
- アプリケーション設定
- 機能フラグ
- 統計情報キャッシュ
- ユーザー設定

---

## マイグレーション例 (v1 → v2)

将来のスキーマ変更時の参考実装:

```typescript
async function migrateV1toV2(db: IDBPDatabase<EventStoreDB>): Promise<void> {
  console.log('[Migration] Starting v1 → v2 migration');

  // マイグレーション記録開始
  const startTime = Date.now();

  // 1. 新しいインデックス追加 (例: events に playerId インデックス)
  // NOTE: これは upgrade() 内でのみ可能
  // const eventStore = db.createObjectStore('events', ...);
  // eventStore.createIndex('by-playerId', 'playerId');

  // 2. 既存データの変換
  const tx = db.transaction('events', 'readwrite');
  const cursor = await tx.store.openCursor();
  let recordsAffected = 0;

  while (cursor) {
    const event = cursor.value;
    // データ変換 (例: payload 構造変更)
    event.payload = transformPayloadV1toV2(event.payload);
    event.version = 2; // バージョン更新

    await cursor.update(event);
    recordsAffected++;
    await cursor.continue();
  }

  await tx.done;

  // マイグレーション記録完了
  await db.put('metadata', {
    key: 'migration-v1-to-v2',
    value: {
      executedAt: startTime,
      completedAt: Date.now(),
      status: 'success',
      recordsAffected,
    },
    updatedAt: Date.now(),
  });

  // スキーマバージョン更新
  await db.put('metadata', {
    key: 'schema-version',
    value: 2,
    updatedAt: Date.now(),
  });

  console.log(`[Migration] Completed v1 → v2: ${recordsAffected} records migrated`);
}
```

---

## まとめ

### `metadata` Object Storeの役割

1. **スキーマバージョン管理**: マイグレーション判定の基盤
2. **設定管理**: Event Store全体の設定値
3. **履歴記録**: マイグレーション実行履歴
4. **統計キャッシュ**: パフォーマンス最適化

### 使用時のポイント

- **キー命名**: カテゴリー:詳細 形式で命名
- **型安全性**: 型ガード関数で型チェック
- **デフォルト値**: 必ずデフォルト値を提供
- **更新日時**: 設定の鮮度確認に活用
- **容量節約**: 小さな値のみ保存 (< 1KB)

### 現在の実装

- MVP段階では `schema-version` のみ使用
- 将来拡張で機能フラグ・設定管理を追加予定
