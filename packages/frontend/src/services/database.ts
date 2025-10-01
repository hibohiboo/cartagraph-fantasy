/* eslint-disable @typescript-eslint/no-explicit-any */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  GameSession,
  SessionPlayer,
  Character,
} from '@cartagraph/shared/types';

// データベース スキーマ定義
interface CartagraphDB extends DBSchema {
  sessions: {
    key: string;
    value: GameSession;
    indexes: { 'by-status': string };
  };
  players: {
    key: string;
    value: SessionPlayer;
    indexes: { 'by-session': string };
  };
  characters: {
    key: string;
    value: Character;
    indexes: { 'by-player': string };
  };
  gameState: {
    key: string;
    value: {
      sessionId: string;
      state: any;
      timestamp: number;
    };
  };
}

class DatabaseService {
  private db: IDBPDatabase<CartagraphDB> | null = null;

  private readonly dbName = 'cartagraph-game';

  private readonly version = 1;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<CartagraphDB>(this.dbName, this.version, {
        upgrade(db) {
          // セッション ストア
          const sessionStore = db.createObjectStore('sessions', {
            keyPath: 'id',
          });
          sessionStore.createIndex('by-status', 'status');

          // プレイヤー ストア
          const playerStore = db.createObjectStore('players', {
            keyPath: 'id',
          });
          playerStore.createIndex('by-session', 'sessionId');

          // キャラクター ストア
          const characterStore = db.createObjectStore('characters', {
            keyPath: 'id',
          });
          characterStore.createIndex('by-player', 'playerId');

          // ゲーム状態 ストア
          db.createObjectStore('gameState', {
            keyPath: 'sessionId',
          });
        },
      });

      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }

  // セッション操作
  async saveSession(session: GameSession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('sessions', session);
  }

  async getSession(sessionId: string): Promise<GameSession | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('sessions', sessionId);
  }

  async getAllSessions(): Promise<GameSession[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAll('sessions');
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.delete('sessions', sessionId);
  }

  // プレイヤー操作
  async savePlayer(player: SessionPlayer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('players', player);
  }

  async getPlayersBySession(sessionId: string): Promise<SessionPlayer[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllFromIndex('players', 'by-session', sessionId);
  }

  // キャラクター操作
  async saveCharacter(character: Character): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('characters', character);
  }

  async getCharactersByPlayer(playerId: string): Promise<Character[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllFromIndex('characters', 'by-player', playerId);
  }

  // ゲーム状態操作
  async saveGameState(sessionId: string, state: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.put('gameState', {
      sessionId,
      state,
      timestamp: Date.now(),
    });
  }

  async getGameState(sessionId: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    const record = await this.db.get('gameState', sessionId);
    return record?.state;
  }

  // データベースクリア（開発用）
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(
      ['sessions', 'players', 'characters', 'gameState'],
      'readwrite',
    );
    await Promise.all([
      tx.objectStore('sessions').clear(),
      tx.objectStore('players').clear(),
      tx.objectStore('characters').clear(),
      tx.objectStore('gameState').clear(),
    ]);
    await tx.done;
  }
}

// シングルトン インスタンス
export const database = new DatabaseService();

// 初期化ヘルパー
export async function initDatabase(): Promise<void> {
  await database.init();
}

export default database;
