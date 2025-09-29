// Simple Worker Service - MVP版
// 基本的なWebWorker通信のみ

interface WorkerMessage {
  type: string;
  id: string;
  payload?: any;
}

interface PendingRequest {
  resolve: (result: any) => void;
  reject: (error: Error) => void;
}

export class SimpleWorkerService {
  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private initialized = false;

  // 初期化
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // WebWorker作成
    this.worker = new Worker(
      new URL('../workers/simple-game-worker.ts', import.meta.url),
      { type: 'module' }
    );

    // メッセージリスナー設定
    this.worker.onmessage = this.handleMessage.bind(this);
    this.worker.onerror = this.handleError.bind(this);

    // WASM初期化
    await this.sendMessage('INIT', {});
    this.initialized = true;

    console.log('[SimpleWorkerService] Initialized');
  }

  // メッセージ送信
  private sendMessage(type: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }

      const id = crypto.randomUUID();

      // リクエスト登録
      this.pendingRequests.set(id, { resolve, reject });

      // メッセージ送信
      this.worker.postMessage({ type, id, payload });

      // タイムアウト設定（10秒）
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${type}`));
        }
      }, 10000);
    });
  }

  // メッセージ受信
  private handleMessage(event: MessageEvent<WorkerMessage>): void {
    const { type, id, payload } = event.data;
    const pending = this.pendingRequests.get(id);

    if (!pending) return;

    this.pendingRequests.delete(id);

    if (type === 'SUCCESS' || type === 'INIT_SUCCESS') {
      pending.resolve(payload);
    } else if (type === 'ERROR') {
      pending.reject(new Error(payload.error || 'Worker error'));
    }
  }

  // エラーハンドリング
  private handleError(error: ErrorEvent): void {
    console.error('[SimpleWorkerService] Worker error:', error);

    // 全ての保留中リクエストをエラーで解決
    this.pendingRequests.forEach((pending) => {
      pending.reject(new Error(`Worker error: ${error.message}`));
    });
    this.pendingRequests.clear();
  }

  // 公開API - セッション作成
  async createSession(scenarioId: string, gmUserId: string): Promise<string> {
    const result = await this.sendMessage('CREATE_SESSION', { scenarioId, gmUserId });
    return result.result;
  }

  // 公開API - プレイヤー追加
  async addPlayer(sessionId: string, userId: string, characterName: string): Promise<string> {
    const result = await this.sendMessage('ADD_PLAYER', { sessionId, userId, characterName });
    return result.result;
  }

  // 公開API - ダイス振り
  async rollDice(sessionId: string, playerId: string, diceCount: number, diceSides: number): Promise<string> {
    const result = await this.sendMessage('ROLL_DICE', { sessionId, playerId, diceCount, diceSides });
    return result.result;
  }

  // 公開API - セッション取得
  async getSession(sessionId: string, scenarioId: string): Promise<string> {
    const result = await this.sendMessage('GET_SESSION', { sessionId, scenarioId });
    return result.result;
  }

  // 状態取得
  isInitialized(): boolean {
    return this.initialized;
  }

  // クリーンアップ
  cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.initialized = false;

    // 保留中のリクエストをキャンセル
    this.pendingRequests.forEach((pending) => {
      pending.reject(new Error('Service cleanup'));
    });
    this.pendingRequests.clear();
  }
}

// シングルトンインスタンス
let simpleWorkerService: SimpleWorkerService | null = null;

export const getSimpleWorkerService = (): SimpleWorkerService => {
  if (!simpleWorkerService) {
    simpleWorkerService = new SimpleWorkerService();
  }
  return simpleWorkerService;
};