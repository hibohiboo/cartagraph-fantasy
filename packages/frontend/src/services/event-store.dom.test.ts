// Event Store Performance Tests
// 実行方法: BROWSER_TEST=1 bun test src/services/event-store.test.ts
// 注意: IndexedDBが必要なため、ブラウザ環境でのみ動作します
import { describe, it, expect, beforeEach } from 'vitest';
import { EventStoreService } from './event-store';

const shouldRunBrowserTests = process.env.BROWSER_TEST === '1';
const describeOrSkip = shouldRunBrowserTests ? describe : describe.skip;

describeOrSkip('EventStore Performance Tests', () => {
  let eventStore: EventStoreService;
  const testSessionId = 'perf-test-session';

  beforeEach(async () => {
    eventStore = new EventStoreService();
    await eventStore.init();
    await eventStore.clearAll();
  });

  // パフォーマンステスト: 大量イベント追加
  it('should handle 1000 events append in reasonable time', async () => {
    const eventCount = 1000;
    const startTime = performance.now();

    for (let i = 0; i < eventCount; i++) {
      await eventStore.appendEvent({
        eventId: `event-${i}`,
        sessionId: testSessionId,
        eventType: 'TEST_EVENT',
        payload: { index: i, data: 'test data' },
        timestamp: Date.now(),
        version: 1,
      });
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(
      `Appended ${eventCount} events in ${duration.toFixed(2)}ms (${(duration / eventCount).toFixed(2)}ms per event)`,
    );

    // 1000イベントを10秒以内に追加できることを確認
    expect(duration).toBeLessThan(10000);

    // イベント数確認
    const count = await eventStore.getEventCount(testSessionId);
    expect(count).toBe(eventCount);
  }, 15000); // タイムアウト15秒

  // パフォーマンステスト: 範囲クエリ
  it('should query events efficiently', async () => {
    // 500イベント準備
    const eventCount = 500;
    for (let i = 0; i < eventCount; i++) {
      await eventStore.appendEvent({
        eventId: `event-${i}`,
        sessionId: testSessionId,
        eventType: 'TEST_EVENT',
        payload: { index: i },
        timestamp: Date.now(),
        version: 1,
      });
    }

    // 範囲クエリパフォーマンス測定
    const startTime = performance.now();
    const events = await eventStore.getEvents({
      sessionId: testSessionId,
      fromSequence: 100,
      toSequence: 200,
    });
    const endTime = performance.now();

    const duration = endTime - startTime;
    console.log(`Queried ${events.length} events in ${duration.toFixed(2)}ms`);

    // 範囲クエリが50ms以内に完了することを確認
    expect(duration).toBeLessThan(50);
    expect(events.length).toBe(101); // 100-200 inclusive
  }, 10000);

  // パフォーマンステスト: スナップショット読み込み
  it('should load session state efficiently', async () => {
    // 200イベント + スナップショット準備
    const eventCount = 200;
    for (let i = 0; i < eventCount; i++) {
      await eventStore.appendEvent({
        eventId: `event-${i}`,
        sessionId: testSessionId,
        eventType: 'TEST_EVENT',
        payload: { index: i },
        timestamp: Date.now(),
        version: 1,
      });
    }

    // スナップショット保存
    await eventStore.saveSnapshot({
      sessionId: testSessionId,
      sequence: 100,
      state: { someState: 'test' },
      timestamp: Date.now(),
      version: 1,
    });

    // 状態読み込みパフォーマンス測定
    const startTime = performance.now();
    const { snapshot, events } =
      await eventStore.loadSessionState(testSessionId);
    const endTime = performance.now();

    const duration = endTime - startTime;
    console.log(
      `Loaded session state in ${duration.toFixed(2)}ms (snapshot + ${events.length} events)`,
    );

    // 状態読み込みが100ms以内に完了することを確認
    expect(duration).toBeLessThan(100);
    expect(snapshot).toBeDefined();
    expect(snapshot?.sequence).toBe(100);
    expect(events.length).toBe(99); // 101-200のイベント
  }, 10000);

  // 統計情報テスト
  it('should calculate stats correctly', async () => {
    const eventCount = 50;
    for (let i = 0; i < eventCount; i++) {
      await eventStore.appendEvent({
        eventId: `event-${i}`,
        sessionId: testSessionId,
        eventType: 'TEST_EVENT',
        payload: { index: i },
        timestamp: Date.now() + i,
        version: 1,
      });
    }

    const stats = await eventStore.getStats(testSessionId);

    expect(stats.eventCount).toBe(eventCount);
    expect(stats.firstEventTime).toBeDefined();
    expect(stats.lastEventTime).toBeDefined();
    expect(stats.lastEventTime!).toBeGreaterThanOrEqual(stats.firstEventTime!);
  });

  // 基本機能テスト
  it('should append and retrieve events correctly', async () => {
    const sequence1 = await eventStore.appendEvent({
      eventId: 'event-1',
      sessionId: testSessionId,
      eventType: 'SESSION_CREATED',
      payload: { scenarioId: 'test-scenario' },
      timestamp: Date.now(),
      version: 1,
    });

    expect(sequence1).toBe(0);

    const sequence2 = await eventStore.appendEvent({
      eventId: 'event-2',
      sessionId: testSessionId,
      eventType: 'PLAYER_ADDED',
      payload: { playerId: 'player-1' },
      timestamp: Date.now(),
      version: 1,
    });

    expect(sequence2).toBe(1);

    const events = await eventStore.getEvents({ sessionId: testSessionId });
    expect(events).toHaveLength(2);
    expect(events[0].eventType).toBe('SESSION_CREATED');
    expect(events[1].eventType).toBe('PLAYER_ADDED');
  });
});

describeOrSkip('SyncManager Basic Tests', () => {
  it('should initialize without errors', async () => {
    const { SyncManager } = await import('./sync-manager');
    const manager = new SyncManager();

    expect(() => manager.init()).not.toThrow();
    expect(manager.isInitialized()).toBe(true);

    manager.cleanup();
  });
});
