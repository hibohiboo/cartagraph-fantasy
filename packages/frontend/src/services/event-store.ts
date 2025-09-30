// Event Store Service - Event Sourcing用IndexedDB実装
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// Event Store スキーマ
export interface EventStoreDB extends DBSchema {
  // イベントストリーム: sessionIdでパーティション
  events: {
    key: string; // eventId
    value: StoredEvent;
    indexes: {
      'by-session': string;
      'by-session-sequence': [string, number];
      'by-timestamp': number;
    };
  };
  // スナップショット: 定期的な状態保存
  snapshots: {
    key: string; // sessionId
    value: Snapshot;
    indexes: {
      'by-session-sequence': [string, number];
    };
  };
  // メタデータ: バージョン管理・マイグレーション用
  metadata: {
    key: string;
    value: {
      key: string;
      value: any;
      updatedAt: number;
    };
  };
}

// 保存イベント構造
export interface StoredEvent {
  eventId: string;
  sessionId: string;
  sequence: number; // セッション内の順序番号
  eventType: string;
  payload: any; // JSON化されたイベントデータ
  timestamp: number;
  version: number; // スキーマバージョン
}

// スナップショット構造
export interface Snapshot {
  sessionId: string;
  sequence: number; // このスナップショット時点のイベントシーケンス
  state: any; // ゲーム状態のスナップショット
  timestamp: number;
  version: number;
}

// クエリオプション
export interface EventQuery {
  sessionId: string;
  fromSequence?: number;
  toSequence?: number;
  limit?: number;
}

export class EventStoreService {
  private db: IDBPDatabase<EventStoreDB> | null = null;

  private readonly dbName = 'cartagraph-event-store';

  private readonly version = 1;

  private readonly snapshotInterval = 100; // 100イベントごとにスナップショット

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<EventStoreDB>(this.dbName, this.version, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(`[EventStore] Upgrading from v${oldVersion} to v${newVersion}`);

          // イベントストア
          if (!db.objectStoreNames.contains('events')) {
            const eventStore = db.createObjectStore('events', {
              keyPath: 'eventId',
            });
            eventStore.createIndex('by-session', 'sessionId', { unique: false });
            eventStore.createIndex('by-session-sequence', ['sessionId', 'sequence'], { unique: true });
            eventStore.createIndex('by-timestamp', 'timestamp', { unique: false });
          }

          // スナップショットストア
          if (!db.objectStoreNames.contains('snapshots')) {
            const snapshotStore = db.createObjectStore('snapshots', {
              keyPath: 'sessionId',
            });
            snapshotStore.createIndex('by-session-sequence', ['sessionId', 'sequence'], { unique: false });
          }

          // メタデータストア
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', {
              keyPath: 'key',
            });
          }

          // 初期メタデータ設定
          transaction.objectStore('metadata').put({
            key: 'schema-version',
            value: newVersion,
            updatedAt: Date.now(),
          });
        },
      });

      console.log('✅ Event Store initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Event Store:', error);
      throw error;
    }
  }

  // イベント追加
  async appendEvent(event: Omit<StoredEvent, 'sequence'>): Promise<number> {
    if (!this.db) throw new Error('Event Store not initialized');

    const tx = this.db.transaction(['events', 'snapshots'], 'readwrite');
    const eventStore = tx.objectStore('events');

    // 次のシーケンス番号を取得
    const lastEvent = await eventStore.index('by-session-sequence')
      .openCursor(IDBKeyRange.bound([event.sessionId, 0], [event.sessionId, Number.MAX_SAFE_INTEGER]), 'prev');

    const sequence = lastEvent ? (lastEvent.value.sequence + 1) : 0;

    // イベント保存
    const storedEvent: StoredEvent = {
      ...event,
      sequence,
    };
    await eventStore.add(storedEvent);

    // スナップショット判定
    if (sequence > 0 && sequence % this.snapshotInterval === 0) {
      console.log(`[EventStore] Snapshot interval reached at sequence ${sequence}`);
      // スナップショット作成は外部で行う（ゲームロジックに依存）
    }

    await tx.done;
    return sequence;
  }

  // イベント取得（範囲指定）
  async getEvents(query: EventQuery): Promise<StoredEvent[]> {
    if (!this.db) throw new Error('Event Store not initialized');

    const { sessionId, fromSequence = 0, toSequence = Number.MAX_SAFE_INTEGER, limit } = query;

    const events = await this.db.getAllFromIndex(
      'events',
      'by-session-sequence',
      IDBKeyRange.bound([sessionId, fromSequence], [sessionId, toSequence])
    );

    return limit ? events.slice(0, limit) : events;
  }

  // 最新イベント取得
  async getLatestEvents(sessionId: string, count: number = 10): Promise<StoredEvent[]> {
    if (!this.db) throw new Error('Event Store not initialized');

    const allEvents = await this.db.getAllFromIndex('events', 'by-session', sessionId);
    return allEvents.slice(-count);
  }

  // イベント総数取得
  async getEventCount(sessionId: string): Promise<number> {
    if (!this.db) throw new Error('Event Store not initialized');

    const events = await this.db.getAllFromIndex('events', 'by-session', sessionId);
    return events.length;
  }

  // スナップショット保存
  async saveSnapshot(snapshot: Snapshot): Promise<void> {
    if (!this.db) throw new Error('Event Store not initialized');

    await this.db.put('snapshots', snapshot);
    console.log(`[EventStore] Snapshot saved for session ${snapshot.sessionId} at sequence ${snapshot.sequence}`);
  }

  // 最新スナップショット取得
  async getLatestSnapshot(sessionId: string): Promise<Snapshot | undefined> {
    if (!this.db) throw new Error('Event Store not initialized');

    return await this.db.get('snapshots', sessionId);
  }

  // スナップショットからの復元 + イベント再生
  async loadSessionState(sessionId: string): Promise<{ snapshot: Snapshot | null; events: StoredEvent[] }> {
    if (!this.db) throw new Error('Event Store not initialized');

    // 最新スナップショット取得
    const snapshot = await this.getLatestSnapshot(sessionId);

    // スナップショット以降のイベント取得
    const fromSequence = snapshot ? snapshot.sequence + 1 : 0;
    const events = await this.getEvents({ sessionId, fromSequence });

    console.log(`[EventStore] Loaded session ${sessionId}: snapshot=${snapshot?.sequence ?? 'none'}, events=${events.length}`);

    return {
      snapshot: snapshot ?? null,
      events,
    };
  }

  // セッション削除（イベント・スナップショット全削除）
  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Event Store not initialized');

    const tx = this.db.transaction(['events', 'snapshots'], 'readwrite');

    // イベント削除
    const eventStore = tx.objectStore('events');
    const eventCursor = await eventStore.index('by-session').openCursor(sessionId);
    let deletedEvents = 0;

    while (eventCursor) {
      await eventCursor.delete();
      deletedEvents++;
      await eventCursor.continue();
    }

    // スナップショット削除
    await tx.objectStore('snapshots').delete(sessionId);

    await tx.done;
    console.log(`[EventStore] Deleted session ${sessionId}: ${deletedEvents} events`);
  }

  // パフォーマンス統計
  async getStats(sessionId: string): Promise<{
    eventCount: number;
    snapshotCount: number;
    firstEventTime: number | null;
    lastEventTime: number | null;
  }> {
    if (!this.db) throw new Error('Event Store not initialized');

    const events = await this.db.getAllFromIndex('events', 'by-session', sessionId);
    const snapshot = await this.getLatestSnapshot(sessionId);

    return {
      eventCount: events.length,
      snapshotCount: snapshot ? 1 : 0,
      firstEventTime: events[0]?.timestamp ?? null,
      lastEventTime: events[events.length - 1]?.timestamp ?? null,
    };
  }

  // データベースクリア（開発用）
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Event Store not initialized');

    const tx = this.db.transaction(['events', 'snapshots', 'metadata'], 'readwrite');
    await Promise.all([
      tx.objectStore('events').clear(),
      tx.objectStore('snapshots').clear(),
      // メタデータは保持
    ]);
    await tx.done;
    console.log('[EventStore] All data cleared');
  }
}

// シングルトンインスタンス
export const eventStore = new EventStoreService();

// 初期化ヘルパー
export async function initEventStore(): Promise<void> {
  await eventStore.init();
}

export default eventStore;