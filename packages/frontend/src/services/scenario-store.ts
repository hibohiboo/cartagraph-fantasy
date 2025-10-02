import { openDB, type IDBPDatabase } from 'idb';

export interface ScenarioMetadata {
  scenarioId: string;
  title: string;
  description: string;
  initialSceneName: string;
  authorId: string;
  createdAt: string;
  lastUpdated: string;
}

const DB_NAME = 'trpg-scenario-db';
const DB_VERSION = 1;
const STORE_NAME = 'scenarios';

class ScenarioStoreService {
  private db: IDBPDatabase | null = null;

  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) {
      return;
    }

    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = (async () => {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, {
              keyPath: 'scenarioId',
            });

            store.createIndex('by-authorId', 'authorId', { unique: false });
            store.createIndex('by-createdAt', 'createdAt', { unique: false });
          }
        },
      });
    })();

    await this.initPromise;
  }

  async saveScenario(scenario: ScenarioMetadata): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.put(STORE_NAME, scenario);
  }

  async getScenario(
    scenarioId: string,
  ): Promise<ScenarioMetadata | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.get(STORE_NAME, scenarioId);
  }

  async getAllScenarios(): Promise<ScenarioMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAll(STORE_NAME);
  }

  async getScenariosByAuthor(authorId: string): Promise<ScenarioMetadata[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAllFromIndex(STORE_NAME, 'by-authorId', authorId);
  }

  async deleteScenario(scenarioId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete(STORE_NAME, scenarioId);
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear(STORE_NAME);
  }
}

let scenarioStoreInstance: ScenarioStoreService | null = null;

export function getScenarioStore(): ScenarioStoreService {
  if (!scenarioStoreInstance) {
    scenarioStoreInstance = new ScenarioStoreService();
  }
  return scenarioStoreInstance;
}
