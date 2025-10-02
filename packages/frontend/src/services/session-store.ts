/**
 * セッションメタデータストレージサービス
 *
 * 仕様: specs/001-web-trpg-trpg/frontend-design.md の「3. session-store.ts」セクションを参照
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

type SessionStatus = 'WaitingForPlayers' | 'InProgress' | 'Completed';

interface SessionMetadata {
  sessionId: string;
  scenarioId: string;
  gmUserId: string;
  status: SessionStatus;
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

    return this.db.get('sessions', sessionId);
  }

  async getAllSessions(): Promise<SessionMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAll('sessions');
  }

  async getSessionsByStatus(status: SessionStatus): Promise<SessionMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAllFromIndex('sessions', 'by-status', status);
  }

  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
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

export type { SessionMetadata, SessionStatus };
