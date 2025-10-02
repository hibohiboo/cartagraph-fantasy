/**
 * キャラクターメタデータストレージサービス
 *
 * 仕様: specs/001-web-trpg-trpg/frontend-design.md の「5. Character」セクションを参照
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface CharacterMetadata {
  characterId: string;
  name: string;
  playerId: string;
  createdAt: string;
  lastUpdated: string;
}

interface CharacterDBSchema extends DBSchema {
  characters: {
    key: string;
    value: CharacterMetadata;
    indexes: {
      'by-playerId': string;
      'by-createdAt': string;
    };
  };
}

class CharacterStoreService {
  private db: IDBPDatabase<CharacterDBSchema> | null = null;

  private readonly DB_NAME = 'trpg-characters';

  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<CharacterDBSchema>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        const characterStore = db.createObjectStore('characters', {
          keyPath: 'characterId',
        });
        characterStore.createIndex('by-playerId', 'playerId');
        characterStore.createIndex('by-createdAt', 'createdAt');
      },
    });
  }

  async saveCharacter(character: CharacterMetadata): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put('characters', {
      ...character,
      lastUpdated: new Date().toISOString(),
    });
  }

  async getCharacter(characterId: string): Promise<CharacterMetadata | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.get('characters', characterId);
  }

  async getAllCharacters(): Promise<CharacterMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAll('characters');
  }

  async getCharactersByPlayerId(playerId: string): Promise<CharacterMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAllFromIndex('characters', 'by-playerId', playerId);
  }

  async deleteCharacter(characterId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete('characters', characterId);
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear('characters');
  }
}

// シングルトンインスタンス
let characterStoreInstance: CharacterStoreService | null = null;

export function getCharacterStore(): CharacterStoreService {
  if (!characterStoreInstance) {
    characterStoreInstance = new CharacterStoreService();
  }
  return characterStoreInstance;
}
