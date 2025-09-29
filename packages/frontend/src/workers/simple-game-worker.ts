// Simple Game WebWorker - MVP版
// 最小限のWASM統合とメッセージ処理

// 基本メッセージ型
interface WorkerMessage {
  type: string;
  id: string;
  payload?: any;
}

// WASM関数の型定義
interface WasmModule {
  wasm_create_session: (scenarioId: string, gmUserId: string) => string;
  wasm_add_player: (sessionId: string, userId: string, characterName: string) => string;
  wasm_use_card: (sessionId: string, playerId: string, cardId: string) => string;
  wasm_roll_dice: (sessionId: string, playerId: string, diceCount: number, diceSides: number) => string;
  wasm_get_session_as_json: (sessionId: string, scenarioId: string) => string;
  verify_typescript_type_exports: () => string;
}

let wasmModule: WasmModule | null = null;
let initialized = false;

// WASM初期化
async function initializeWasm(): Promise<void> {
  try {
    console.log('[SimpleWorker] Loading WASM module...');

    // 相対パスでWASMモジュールを読み込み
    const module = await import('../../../core/pkg/cartagraph_core.js');

    // WASMモジュールを初期化
    await module.default();

    wasmModule = module as WasmModule;
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