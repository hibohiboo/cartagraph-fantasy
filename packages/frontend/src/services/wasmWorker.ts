// WASM WebWorker統合サービス
export class WasmWorkerService {
  private worker: Worker | null = null;
  private messageId = 0;
  private pendingMessages = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();

  async initialize(): Promise<void> {
    if (this.worker) return;

    try {
      // WebWorkerを作成（インライン）
      const workerScript = `
        let wasmModule = null;

        self.onmessage = async function(e) {
          const { id, type, payload } = e.data;

          try {
            switch (type) {
              case 'init':
                // WASM モジュールを初期化
                const wasmImport = await import('@cartagraph/core/pkg/cartagraph_core.js');
                await wasmImport.default();
                wasmModule = wasmImport;

                self.postMessage({
                  id,
                  type: 'success',
                  payload: 'WASM initialized in worker'
                });
                break;

              case 'call':
                if (!wasmModule) {
                  throw new Error('WASM module not initialized');
                }

                const { functionName, args } = payload;
                let result;

                // 利用可能な関数を呼び出し
                switch (functionName) {
                  case 'main':
                    wasmModule.main();
                    result = 'main() called successfully';
                    break;
                  default:
                    throw new Error(\`Unknown function: \${functionName}\`);
                }

                self.postMessage({
                  id,
                  type: 'success',
                  payload: result
                });
                break;

              default:
                throw new Error(\`Unknown message type: \${type}\`);
            }
          } catch (error) {
            self.postMessage({
              id,
              type: 'error',
              payload: error.message
            });
          }
        };
      `;

      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob), { type: 'module' });

      this.worker.onmessage = (e) => {
        const { id, type, payload } = e.data;
        const pending = this.pendingMessages.get(id);

        if (pending) {
          this.pendingMessages.delete(id);
          if (type === 'success') {
            pending.resolve(payload);
          } else if (type === 'error') {
            pending.reject(new Error(payload));
          }
        }
      };

      this.worker.onerror = (error) => {
        console.error('WebWorker error:', error);
      };

      // WASM初期化
      await this.sendMessage('init', null);
      console.log('✅ WASM WebWorker initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize WASM WebWorker:', error);
      throw error;
    }
  }

  private sendMessage(type: string, payload: any): Promise<any> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    const id = ++this.messageId;

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(id, { resolve, reject });

      this.worker!.postMessage({
        id,
        type,
        payload,
      });

      // タイムアウト（5秒）
      setTimeout(() => {
        if (this.pendingMessages.has(id)) {
          this.pendingMessages.delete(id);
          reject(new Error('Worker message timeout'));
        }
      }, 5000);
    });
  }

  async callWasmFunction(functionName: string, args: any[] = []): Promise<any> {
    return this.sendMessage('call', { functionName, args });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.pendingMessages.clear();
    }
  }
}

// シングルトン インスタンス
export const wasmWorker = new WasmWorkerService();