// Simple Game WebWorker - MVP版
// 最小限のWASM統合とメッセージ処理
import * as cartagraphCore from '@cartagraph/core/pkg/cartagraph_core';
// 基本メッセージ型
type WorkerMessageMap = {
  INIT: undefined;
  CREATE_SESSION: { scenarioId: string; gmUserId: string };
  ADD_PLAYER: { sessionId: string; userId: string; characterName: string };
  ROLL_DICE: {
    sessionId: string;
    playerId: string;
    diceCount: number;
    diceSides: number;
  };
  GET_SESSION: { sessionId: string; scenarioId: string };
  SUCCESS: { result: string };
  ERROR: { error: string };
  INIT_SUCCESS: { message: string };
};
type WorkerMessage = {
  [K in keyof WorkerMessageMap]: {
    type: K;
    id: string;
    payload: WorkerMessageMap[K];
  };
}[keyof WorkerMessageMap];

type WasmModule = typeof cartagraphCore;
let wasmModule: WasmModule | null = null;
let initialized = false;

// WASM初期化
async function initializeWasm(): Promise<void> {
  try {
    console.log('[SimpleWorker] Loading WASM module...');

    // 相対パスでWASMモジュールを読み込み
    const module = await import('@cartagraph/core/pkg/cartagraph_core.js');

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
// eslint-disable-next-line complexity
window.self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, id, payload } = event.data;

  try {
    switch (type) {
      case 'INIT':
        await initializeWasm();
        window.self.postMessage({
          type: 'INIT_SUCCESS',
          id,
          payload: { message: 'WASM initialized successfully' },
        });
        break;

      case 'CREATE_SESSION': {
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const sessionResult = wasmModule.wasm_create_session(
          payload.scenarioId,
          payload.gmUserId,
        );
        window.self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: sessionResult },
        });
        break;
      }

      case 'ADD_PLAYER': {
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const playerResult = wasmModule.wasm_add_player(
          payload.sessionId,
          payload.userId,
          payload.characterName,
        );
        window.self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: playerResult },
        });
        break;
      }

      case 'ROLL_DICE': {
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const diceResult = wasmModule.wasm_roll_dice(
          payload.sessionId,
          payload.playerId,
          payload.diceCount,
          payload.diceSides,
        );
        window.self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: diceResult },
        });
        break;
      }

      case 'GET_SESSION': {
        if (!initialized || !wasmModule) {
          throw new Error('WASM not initialized');
        }
        const sessionData = wasmModule.wasm_get_session_as_json(
          payload.sessionId,
          payload.scenarioId,
        );
        window.self.postMessage({
          type: 'SUCCESS',
          id,
          payload: { result: sessionData },
        });
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error(`[SimpleWorker] Error handling ${type}:`, error);
    window.self.postMessage({
      type: 'ERROR',
      id,
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
};

// エラーハンドラー
window.self.onerror = (error) => {
  console.error('[SimpleWorker] Global error:', error);
};

console.log('[SimpleWorker] Worker ready');
