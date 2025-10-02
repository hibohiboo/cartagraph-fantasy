/**
 * セッションストアサービスのテスト
 *
 * ブラウザ環境でのIndexedDB統合テスト
 */

import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSessionStore, SessionMetadata } from './session-store';

// テストヘルパー: モックセッションデータ生成
let mockIdCounter = 0;
function createMockSession(
  overrides: Partial<SessionMetadata> = {},
): SessionMetadata {
  mockIdCounter += 1;
  return {
    sessionId: `session-${Date.now()}-${mockIdCounter}`,
    scenarioId: 'scenario-001',
    gmUserId: 'gm-user-123',
    status: 'WaitingForPlayers',
    playerCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('SessionStoreService', () => {
  let store: ReturnType<typeof getSessionStore>;

  beforeEach(async () => {
    store = getSessionStore();
    await store.clear();
  });

  afterEach(async () => {
    await store.clear();
  });

  describe('初期化', () => {
    it('getSessionStore()は同一インスタンスを返す', () => {
      const store1 = getSessionStore();
      const store2 = getSessionStore();
      expect(store1).toBe(store2);
    });

    it('init()は複数回呼んでも安全', async () => {
      await store.init();
      await store.init();
      await store.init();
      expect(store).toBeDefined();
    });
  });

  describe('セッション保存', () => {
    it('新しいセッションを保存できる', async () => {
      const session = createMockSession();
      await store.saveSession(session);

      const retrieved = await store.getSession(session.sessionId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.sessionId).toBe(session.sessionId);
      expect(retrieved?.scenarioId).toBe(session.scenarioId);
      expect(retrieved?.gmUserId).toBe(session.gmUserId);
      expect(retrieved?.status).toBe(session.status);
      expect(retrieved?.playerCount).toBe(session.playerCount);
    });

    it('既存セッションを上書き保存できる', async () => {
      const session = createMockSession({ playerCount: 0 });
      await store.saveSession(session);

      // 上書き保存
      const updated = { ...session, playerCount: 5 };
      await store.saveSession(updated);

      const retrieved = await store.getSession(session.sessionId);
      expect(retrieved?.playerCount).toBe(5);
    });

    it('updatedAtが自動的に更新される', async () => {
      const session = createMockSession({
        updatedAt: '2020-01-01T00:00:00.000Z',
      });
      await store.saveSession(session);

      const retrieved = await store.getSession(session.sessionId);
      expect(retrieved?.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
      expect(new Date(retrieved!.updatedAt).getTime()).toBeGreaterThan(
        new Date('2020-01-01T00:00:00.000Z').getTime(),
      );
    });
  });

  describe('セッション取得', () => {
    it('存在しないセッションはundefinedを返す', async () => {
      const retrieved = await store.getSession('non-existent-id');
      expect(retrieved).toBeUndefined();
    });

    it('getAllSessions()で全セッションを取得できる', async () => {
      const session1 = createMockSession();
      const session2 = createMockSession();
      const session3 = createMockSession();

      await store.saveSession(session1);
      await store.saveSession(session2);
      await store.saveSession(session3);

      const allSessions = await store.getAllSessions();
      expect(allSessions).toHaveLength(3);
      expect(allSessions.map((s) => s.sessionId)).toContain(session1.sessionId);
      expect(allSessions.map((s) => s.sessionId)).toContain(session2.sessionId);
      expect(allSessions.map((s) => s.sessionId)).toContain(session3.sessionId);
    });

    it('getAllSessions()は空配列を返す（セッションなし）', async () => {
      const allSessions = await store.getAllSessions();
      expect(allSessions).toEqual([]);
    });
  });

  describe('ステータス別取得', () => {
    beforeEach(async () => {
      await store.saveSession(
        createMockSession({ status: 'WaitingForPlayers' }),
      );
      await store.saveSession(
        createMockSession({ status: 'WaitingForPlayers' }),
      );
      await store.saveSession(createMockSession({ status: 'InProgress' }));
      await store.saveSession(createMockSession({ status: 'Completed' }));
    });

    it('WaitingForPlayersステータスのセッションを取得', async () => {
      const sessions = await store.getSessionsByStatus('WaitingForPlayers');
      expect(sessions).toHaveLength(2);
      expect(sessions.every((s) => s.status === 'WaitingForPlayers')).toBe(
        true,
      );
    });

    it('InProgressステータスのセッションを取得', async () => {
      const sessions = await store.getSessionsByStatus('InProgress');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].status).toBe('InProgress');
    });

    it('Completedステータスのセッションを取得', async () => {
      const sessions = await store.getSessionsByStatus('Completed');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].status).toBe('Completed');
    });

    it('該当するステータスがない場合は空配列', async () => {
      await store.clear();
      const sessions = await store.getSessionsByStatus('InProgress');
      expect(sessions).toEqual([]);
    });
  });

  describe('セッションステータス更新', () => {
    it('セッションステータスを更新できる', async () => {
      const session = createMockSession({ status: 'WaitingForPlayers' });
      await store.saveSession(session);

      await store.updateSessionStatus(session.sessionId, 'InProgress');

      const retrieved = await store.getSession(session.sessionId);
      expect(retrieved?.status).toBe('InProgress');
      // 他のフィールドは変更されない
      expect(retrieved?.scenarioId).toBe(session.scenarioId);
      expect(retrieved?.playerCount).toBe(session.playerCount);
    });

    it('存在しないセッションの更新はエラー', async () => {
      await expect(
        store.updateSessionStatus('non-existent-id', 'InProgress'),
      ).rejects.toThrow('Session non-existent-id not found');
    });

    it('ステータス更新時にupdatedAtも更新される', async () => {
      const session = createMockSession({ status: 'WaitingForPlayers' });
      await store.saveSession(session);

      // 少し待機
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      const beforeUpdate = await store.getSession(session.sessionId);
      await store.updateSessionStatus(session.sessionId, 'InProgress');
      const afterUpdate = await store.getSession(session.sessionId);

      expect(afterUpdate?.updatedAt).not.toBe(beforeUpdate?.updatedAt);
    });
  });

  describe('プレイヤー数更新', () => {
    it('プレイヤー数を更新できる', async () => {
      const session = createMockSession({ playerCount: 0 });
      await store.saveSession(session);

      await store.updatePlayerCount(session.sessionId, 3);

      const retrieved = await store.getSession(session.sessionId);
      expect(retrieved?.playerCount).toBe(3);
      // 他のフィールドは変更されない
      expect(retrieved?.status).toBe(session.status);
      expect(retrieved?.scenarioId).toBe(session.scenarioId);
    });

    it('存在しないセッションの更新はエラー', async () => {
      await expect(
        store.updatePlayerCount('non-existent-id', 5),
      ).rejects.toThrow('Session non-existent-id not found');
    });

    it('プレイヤー数更新時にupdatedAtも更新される', async () => {
      const session = createMockSession({ playerCount: 0 });
      await store.saveSession(session);

      // 少し待機
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });

      const beforeUpdate = await store.getSession(session.sessionId);
      await store.updatePlayerCount(session.sessionId, 2);
      const afterUpdate = await store.getSession(session.sessionId);

      expect(afterUpdate?.updatedAt).not.toBe(beforeUpdate?.updatedAt);
    });
  });

  describe('セッション削除', () => {
    it('セッションを削除できる', async () => {
      const session = createMockSession();
      await store.saveSession(session);

      await store.deleteSession(session.sessionId);

      const retrieved = await store.getSession(session.sessionId);
      expect(retrieved).toBeUndefined();
    });

    it('存在しないセッションの削除はエラーにならない', async () => {
      await store.deleteSession('non-existent-id');
      const allSessions = await store.getAllSessions();
      expect(allSessions).toHaveLength(0);
    });

    it('clear()で全セッションを削除できる', async () => {
      await store.saveSession(createMockSession());
      await store.saveSession(createMockSession());
      await store.saveSession(createMockSession());

      await store.clear();

      const allSessions = await store.getAllSessions();
      expect(allSessions).toEqual([]);
    });
  });

  describe('統合シナリオ', () => {
    it('セッション作成から削除までのフロー', async () => {
      // 1. セッション作成
      const session = createMockSession({
        status: 'WaitingForPlayers',
        playerCount: 0,
      });
      await store.saveSession(session);

      // 2. プレイヤー追加（カウント更新）
      await store.updatePlayerCount(session.sessionId, 1);
      await store.updatePlayerCount(session.sessionId, 2);

      let retrieved = await store.getSession(session.sessionId);
      expect(retrieved?.playerCount).toBe(2);

      // 3. セッション開始（ステータス更新）
      await store.updateSessionStatus(session.sessionId, 'InProgress');

      retrieved = await store.getSession(session.sessionId);
      expect(retrieved?.status).toBe('InProgress');

      // 4. セッション完了
      await store.updateSessionStatus(session.sessionId, 'Completed');

      retrieved = await store.getSession(session.sessionId);
      expect(retrieved?.status).toBe('Completed');

      // 5. 削除
      await store.deleteSession(session.sessionId);

      retrieved = await store.getSession(session.sessionId);
      expect(retrieved).toBeUndefined();
    });

    it('複数ステータスのセッションを管理できる', async () => {
      // 複数のセッションを作成
      await store.saveSession(
        createMockSession({ status: 'WaitingForPlayers' }),
      );
      await store.saveSession(
        createMockSession({ status: 'WaitingForPlayers' }),
      );
      await store.saveSession(createMockSession({ status: 'InProgress' }));
      await store.saveSession(createMockSession({ status: 'Completed' }));
      await store.saveSession(createMockSession({ status: 'Completed' }));
      await store.saveSession(createMockSession({ status: 'Completed' }));

      // 全体確認
      const all = await store.getAllSessions();
      expect(all).toHaveLength(6);

      // ステータス別確認
      const waiting = await store.getSessionsByStatus('WaitingForPlayers');
      const inProgress = await store.getSessionsByStatus('InProgress');
      const completed = await store.getSessionsByStatus('Completed');

      expect(waiting).toHaveLength(2);
      expect(inProgress).toHaveLength(1);
      expect(completed).toHaveLength(3);
    });
  });
});
