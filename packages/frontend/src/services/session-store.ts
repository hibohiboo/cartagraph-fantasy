/**
 * セッションメタデータストレージサービス
 * セッション一覧の高速取得のためのメタデータ管理
 *
 * ## 仕様
 *
 * ### 保存
 * - saveSession: セッションメタデータを保存（既存データは上書き）
 * - updatedAtは自動的に現在時刻に更新される
 *
 * ### 取得
 * - getSession: sessionIdで単一セッション取得（存在しない場合はundefined）
 * - getAllSessions: 全セッション取得（作成順ではなくストア順）
 * - getSessionsByStatus: ステータスでフィルタして取得
 *
 * ### 更新
 * - updateSessionStatus: セッションステータスのみ更新（セッション不在時はエラー）
 * - updatePlayerCount: プレイヤー数のみ更新（セッション不在時はエラー）
 * - 更新時はupdatedAtも自動更新される
 *
 * ### 削除
 * - deleteSession: セッション削除（存在しなくてもエラーにならない）
 * - clear: 全セッション削除
 *
 * ### 初期化
 * - init: データベース初期化（自動的に呼ばれる、複数回呼んでも安全）
 * - シングルトンパターン（getSessionStore()で同一インスタンス取得）
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SessionMetadata {
  sessionId: string;
  scenarioId: string;
  gmUserId: string;
  status: 'WaitingForPlayers' | 'InProgress' | 'Completed';
  playerCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SessionDBSchema extends DBSchema {
  sessions: {
    key: string;
    value: SessionMetadata;
    indexes: {
      'by-status': string;
      'by-createdAt': string;
    };
  };
}

class SessionStoreService {
  private db: IDBPDatabase<SessionDBSchema> | null = null;
  private readonly DB_NAME = 'trpg-sessions';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<SessionDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // セッションストア
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'sessionId',
        });
        sessionStore.createIndex('by-status', 'status');
        sessionStore.createIndex('by-createdAt', 'createdAt');
      },
    });
  }

  async saveSession(session: SessionMetadata): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('sessions', {
      ...session,
      updatedAt: new Date().toISOString(),
    });
  }

  async getSession(sessionId: string): Promise<SessionMetadata | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.get('sessions', sessionId);
  }

  async getAllSessions(): Promise<SessionMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAll('sessions');
  }

  async getSessionsByStatus(
    status: 'WaitingForPlayers' | 'InProgress' | 'Completed'
  ): Promise<SessionMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return await this.db.getAllFromIndex('sessions', 'by-status', status);
  }

  async updateSessionStatus(
    sessionId: string,
    status: 'WaitingForPlayers' | 'InProgress' | 'Completed'
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    await this.saveSession({
      ...session,
      status,
    });
  }

  async updatePlayerCount(sessionId: string, playerCount: number): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const session = await this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    await this.saveSession({
      ...session,
      playerCount,
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('sessions', sessionId);
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('sessions');
  }
}

// シングルトンインスタンス
let sessionStoreInstance: SessionStoreService | null = null;

export function getSessionStore(): SessionStoreService {
  if (!sessionStoreInstance) {
    sessionStoreInstance = new SessionStoreService();
  }
  return sessionStoreInstance;
}

export type { SessionMetadata };
