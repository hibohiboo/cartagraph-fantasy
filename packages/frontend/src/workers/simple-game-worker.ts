// Simple Game WebWorker - MVP版
// 最小限のWASM統合とメッセージ処理
import * as cartagraph_core from '@cartagraph/core/pkg/cartagraph_core';
// 基本メッセージ型
interface WorkerMessage {
  type: string;
  id: string;
  payload?: any;
}

type WasmModule = typeof cartagraph_core;
let wasmModule: WasmModule | null = null;
let initialized = false;

// WASM初期化
async function initializeWasm(): Promise<void> {
  try {
    console.log('[SimpleWorker] Loading WASM module...');

    // 相対パスでWASMモジュールを読み込み
    const module = await import("@cartagraph/core/pkg/cartagraph_core.js");

    // WASMモジュールを初期化
    await module.default();

    wasmModule = module;
    initialized = true;
    console.log('[SimpleWorker] WASM module loaded successfully');
  } catch (error) {
    console.error('[SimpleWorker] WASM loading failed:', error);
    throw error;
  }
}

// メッセージハンドラー
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, id, payload } = event.data;

  try {
    switch (type) {
      case 'INIT':
        await initializeWasm();
        self.postMessage({
          type: 'INIT_SUCCESS',
          id,
          payload: { message: 'WASM initialized successfully' }
        });
        break;

      case 'CREATE_SESSION':
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const sessionResult = wasmModule.wasm_create_session(
          payload.scenarioId,
          payload.gmUserId
        );
        self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: sessionResult }
        });
        break;

      case 'ADD_PLAYER':
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const playerResult = wasmModule.wasm_add_player(
          payload.sessionId,
          payload.userId,
          payload.characterName
        );
        self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: playerResult }
        });
        break;

      case 'ROLL_DICE':
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const diceResult = wasmModule.wasm_roll_dice(
          payload.sessionId,
          payload.playerId,
          payload.diceCount,
          payload.diceSides
        );
        self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: diceResult }
        });
        break;

      case 'GET_SESSION':
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const sessionData = wasmModule.wasm_get_session_as_json(
          payload.sessionId,
          payload.scenarioId
        );
        self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: sessionData }
        });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

  } catch (error) {
    console.error(`[SimpleWorker] Error handling ${type}:`, error);
    self.postMessage({
      type: 'ERROR',
      id,
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

// エラーハンドラー
self.onerror = (error) => {
  console.error('[SimpleWorker] Global error:', error);
};

console.log('[SimpleWorker] Worker ready');