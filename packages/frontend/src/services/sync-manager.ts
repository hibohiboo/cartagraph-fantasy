// Sync Manager - BroadcastChannelによるクロスタブ同期
import { eventStore, type StoredEvent } from './event-store';

// 同期メッセージ型
export type SyncMessage =
  | { type: 'EVENT_APPENDED'; sessionId: string; event: StoredEvent }
  | { type: 'SNAPSHOT_SAVED'; sessionId: string; sequence: number }
  | { type: 'SESSION_DELETED'; sessionId: string }
  | { type: 'REQUEST_SYNC'; sessionId: string; fromSequence: number }
  | { type: 'SYNC_RESPONSE'; sessionId: string; events: StoredEvent[] };

// 同期リスナー
export type SyncListener = (message: SyncMessage) => void;

export class SyncManager {
  private channel: BroadcastChannel | null = null;

  private readonly channelName = 'cartagraph-sync';

  private listeners: Set<SyncListener> = new Set();

  private initialized = false;

  // 初期化
  init(): void {
    if (this.initialized) return;

    try {
      this.channel = new BroadcastChannel(this.channelName);

      // メッセージ受信
      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        this.handleMessage(event.data);
      };

      // エラーハンドリング
      this.channel.onmessageerror = (event) => {
        console.error('[SyncManager] Message error:', event);
      };

      this.initialized = true;
      console.log('✅ SyncManager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SyncManager:', error);
      // BroadcastChannelが利用できない環境での代替処理
    }
  }

  // メッセージ送信
  broadcast(message: SyncMessage): void {
    if (!this.channel) {
      console.warn('[SyncManager] Channel not available');
      return;
    }

    try {
      this.channel.postMessage(message);
      console.log('[SyncManager] Broadcast:', message.type, message.sessionId);
    } catch (error) {
      console.error('[SyncManager] Broadcast error:', error);
    }
  }

  // メッセージハンドリング
  private handleMessage(message: SyncMessage): void {
    console.log('[SyncManager] Received:', message.type, message.sessionId);

    // 全リスナーに通知
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error('[SyncManager] Listener error:', error);
      }
    });

    // メッセージタイプ別処理   // 他のメッセージはリスナーで処理
    if (message.type === 'REQUEST_SYNC') {
      this.handleSyncRequest(message);
    }
  }

  // 同期リクエスト処理
  private async handleSyncRequest(
    message: Extract<SyncMessage, { type: 'REQUEST_SYNC' }>,
  ): Promise<void> {
    try {
      const events = await eventStore.getEvents({
        sessionId: message.sessionId,
        fromSequence: message.fromSequence,
      });

      // レスポンス送信
      this.broadcast({
        type: 'SYNC_RESPONSE',
        sessionId: message.sessionId,
        events,
      });
    } catch (error) {
      console.error('[SyncManager] Sync request failed:', error);
    }
  }

  // リスナー登録
  addListener(listener: SyncListener): () => void {
    this.listeners.add(listener);

    // アンサブスクライブ関数を返す
    return () => {
      this.listeners.delete(listener);
    };
  }

  // イベント追加通知
  notifyEventAppended(sessionId: string, event: StoredEvent): void {
    this.broadcast({
      type: 'EVENT_APPENDED',
      sessionId,
      event,
    });
  }

  // スナップショット保存通知
  notifySnapshotSaved(sessionId: string, sequence: number): void {
    this.broadcast({
      type: 'SNAPSHOT_SAVED',
      sessionId,
      sequence,
    });
  }

  // セッション削除通知
  notifySessionDeleted(sessionId: string): void {
    this.broadcast({
      type: 'SESSION_DELETED',
      sessionId,
    });
  }

  // 他のタブに同期リクエスト
  requestSync(sessionId: string, fromSequence: number): void {
    this.broadcast({
      type: 'REQUEST_SYNC',
      sessionId,
      fromSequence,
    });
  }

  // クリーンアップ
  cleanup(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
    this.initialized = false;
    console.log('[SyncManager] Cleanup completed');
  }

  // 状態確認
  isInitialized(): boolean {
    return this.initialized;
  }
}

// シングルトンインスタンス
export const syncManager = new SyncManager();

// 初期化ヘルパー
export function initSyncManager(): void {
  syncManager.init();
}

export default syncManager;
