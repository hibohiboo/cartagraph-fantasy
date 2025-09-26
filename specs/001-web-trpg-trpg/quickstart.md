# Quickstart Guide: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Date**: 2025-09-26
**Phase**: Phase 1 - Design & Contracts
**Purpose**: End-to-End user story validation and development setup instructions

---

## Overview
このドキュメントは開発者向けの完全なセットアップガイドと、エンドユーザーの主要ユーザーフローのテストシナリオを提供する。MVP実装完了時にこのガイドの全ての手順が動作することが完了条件となる。

---

## Development Setup

### Prerequisites
- **Node.js**: 22+ LTS
- **Rust**: 1.75+ with wasm-pack
- **Bun**: Latest stable (package management)
- **Git**: Version control
- **Browser**: Chrome/Firefox latest (WebAssembly support)

### Environment Variables
```bash
# .env.local
TRPG_ENV=development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WASM_PATH=/wasm/trpg_core.wasm
INDEXEDDB_NAME=trpg_game_db
INDEXEDDB_VERSION=1
```

### 1. Repository Setup
```bash
# Clone and navigate to project
git clone <repository-url>
cd cartagraph-fantasy

# Install dependencies
bun install

# Setup monorepo workspaces
bun run setup:workspaces
```

### 2. WebAssembly Core Setup
```bash
# Build Rust WASM core
cd packages/core
cargo build --target wasm32-unknown-unknown --release
wasm-pack build --target web --scope trpg

# Generate TypeScript bindings
bun run generate:types
cd ../..
```

### 3. Shared Types Setup
```bash
# Generate shared type definitions
cd packages/shared
bun run build:types
bun run validate:contracts

# Link to other packages
bun link
cd ../..
```

### 4. Frontend Setup
```bash
# Setup React frontend
cd packages/frontend
bun link @trpg/shared
bun link @trpg/core
bun run dev
# Accessible at http://localhost:5173
cd ../..
```

### 5. UI Components Setup
```bash
# Setup Storybook
cd packages/ui
bun run storybook
# Accessible at http://localhost:6006
cd ../..
```

### 6. Verification Commands
```bash
# Run all tests
bun run test:all

# Type checking
bun run typecheck

# Linting
bun run lint

# Build all packages
bun run build:all
```

---

## User Story Test Scenarios

### Test Scenario 1: シナリオ作成者のワークフロー

#### Setup
1. ブラウザで `http://localhost:5173` を開く
2. 「シナリオ作成者」として名前を入力してユーザー作成

#### Steps
1. **シナリオ作成開始**
   ```
   Given: シナリオ作成者としてログイン済み
   When: 「新規シナリオ作成」ボタンをクリック
   Then: シナリオエディターが表示される
   ```

2. **基本情報入力**
   ```
   Given: シナリオエディターが開いている
   When: 以下を入力
     - シナリオ名: "テスト遺跡探索"
     - 説明: "初心者向けテストシナリオ"
     - 推奨人数: 2-4人
     - 難易度: beginner
   Then: 入力内容が保存される
   ```

3. **初期シーン作成**
   ```
   Given: 基本情報が入力済み
   When: 「シーン追加」で初期シーンを作成
     - シーン名: "遺跡入口"
     - 説明: "古い遺跡の入口に立っている"
     - 目的: "遺跡内への進入方法を決定する"
   Then: シーンが作成され、シーンエディターが表示される
   ```

4. **イベント追加**
   ```
   Given: "遺跡入口"シーンが作成済み
   When: 以下のイベントを追加
     - イベント名: "入口の選択"
     - タイプ: choice
     - 選択肢: ["正面から入る", "裏口を探す", "準備を整える"]
   Then: イベントがシーンに追加される
   ```

5. **シナリオ保存**
   ```
   Given: シーンとイベントが作成済み
   When: 「シナリオ保存」ボタンをクリック
   Then: シナリオがIndexedDBに保存される
   ```

6. **公開設定**
   ```
   Given: シナリオが保存済み
   When: 「シナリオ公開」ボタンをクリック
   Then: シナリオが公開シナリオ一覧に表示される
   ```

#### Expected Results
- シナリオが正常に作成・保存される
- 公開シナリオ一覧で確認できる
- コンソールエラーが発生しない
- IndexedDBにデータが永続化される

#### Validation Commands
```javascript
// Browser Console
const db = await indexedDB.open('trpg_game_db', 1);
const transaction = db.transaction(['scenarios'], 'readonly');
const store = transaction.objectStore('scenarios');
const scenarios = await store.getAll();
console.log('Created scenarios:', scenarios);
```

---

### Test Scenario 2: GMのセッション運営

#### Setup
1. テストシナリオ1が完了していること
2. 新しいブラウザタブで `http://localhost:5173` を開く
3. 「GM太郎」として名前を入力してユーザー作成

#### Steps
1. **シナリオ選択**
   ```
   Given: GM太郎としてログイン済み
   When: 「セッション開催」→「シナリオ選択」
   Then: 公開シナリオ一覧が表示される
   ```

2. **セッション設定**
   ```
   Given: "テスト遺跡探索"を選択済み
   When: セッション設定を入力
     - 最大プレイヤー数: 3
     - 募集メッセージ: "初心者歓迎！"
   Then: セッションが作成される
   ```

3. **プレイヤー募集開始**
   ```
   Given: セッションが作成済み
   When: 「募集開始」ボタンをクリック
   Then: セッションが「募集中」ステータスになる
   ```

4. **セッション開始**
   ```
   Given: 最低人数のプレイヤーが参加済み
   When: 「セッション開始」ボタンをクリック
   Then: ゲーム画面に遷移し、初期シーンが表示される
   ```

5. **イベント発火**
   ```
   Given: セッションが開始済み
   When: GMが「入口の選択」イベントを手動発火
   Then: 全プレイヤーに選択肢が表示される
   ```

#### Expected Results
- セッションが正常に作成・開始される
- GMコントロール画面が正常に機能する
- セッション状態がリアルタイムで更新される
- BroadcastChannelで他タブにも状態変更が反映される

#### Validation Commands
```javascript
// Browser Console (GM Tab)
const gameChannel = new BroadcastChannel('trpg-game-sync');
gameChannel.addEventListener('message', (event) => {
  console.log('Game sync event:', event.data);
});
```

---

### Test Scenario 3: プレイヤーのゲームプレイ

#### Setup
1. テストシナリオ2でセッションが開始済み
2. 新しいブラウザタブで `http://localhost:5173` を開く
3. 「プレイヤー花子」として名前を入力してユーザー作成

#### Steps
1. **キャラクター作成**
   ```
   Given: プレイヤー花子としてログイン済み
   When: 「キャラクター作成」で以下を入力
     - 名前: "冒険者ハナコ"
     - 初期タグ: ["好奇心旺盛", "慎重派"]
   Then: キャラクターが作成される
   ```

2. **セッション参加申請**
   ```
   Given: キャラクター作成済み
   When: 「セッション参加」で募集中セッションに申請
     - キャラクター: "冒険者ハナコ"
     - メッセージ: "よろしくお願いします！"
   Then: 参加申請がGMに送信される
   ```

3. **セッション参加承認**
   ```
   Given: 参加申請済み
   When: GM側で参加を承認
   Then: ゲーム画面にアクセス可能になる
   ```

4. **ゲームプレイ画面表示**
   ```
   Given: セッション参加承認済み
   When: ゲーム画面にアクセス
   Then: 現在のシーン("遺跡入口")と利用可能なアクションが表示される
   ```

5. **選択肢カード使用**
   ```
   Given: "入口の選択"イベントが発火済み
   When: "正面から入る"選択肢カードをクリック
   Then: カード使用が処理され、対応するイベントが発生する
   ```

6. **行動判定実行**
   ```
   Given: カード使用により行動判定イベントが発火
   When: 2d6ダイス振りボタンをクリック
   Then: ダイス結果が表示され、成功/失敗が判定される
   ```

#### Expected Results
- キャラクター作成が正常に動作する
- セッション参加フローが完了する
- ゲーム画面でインタラクションができる
- カード使用とダイス判定が正常に処理される
- WebWorkerでのWASM処理が正常に動作する

#### Validation Commands
```javascript
// Browser Console (Player Tab)
// WebWorker communication test
const worker = new Worker('/src/workers/gameWorker.js');
worker.postMessage({
  type: 'ROLL_DICE',
  data: { notation: '2d6', modifier: 0 }
});
worker.addEventListener('message', (event) => {
  console.log('WASM dice result:', event.data);
});
```

---

### Test Scenario 4: 非同期プレイ機能

#### Setup
1. テストシナリオ3まで完了済み
2. 既存の全ブラウザタブを保持

#### Steps
1. **プレイヤー2追加**
   ```
   Given: 新しいブラウザタブを開く
   When: 「プレイヤー次郎」でユーザー・キャラクター作成
     - キャラクター名: "魔法使いジロウ"
   Then: セッションに参加申請・承認される
   ```

2. **非同期アクション実行**
   ```
   Given: プレイヤー花子がアクション完了済み
   When: プレイヤー次郎が別の選択肢カードを使用
   Then: 両方のアクションがログに記録される
   ```

3. **進捗状況確認**
   ```
   Given: 複数プレイヤーがアクション実行済み
   When: 任意のプレイヤーがログページを確認
   Then: 全プレイヤーのアクション履歴が時系列で表示される
   ```

4. **クロスタブ同期確認**
   ```
   Given: 複数タブでゲーム画面を開いている
   When: 一つのタブでアクションを実行
   Then: 他のタブでもリアルタイムに状態が更新される
   ```

5. **ゲーム状態永続化確認**
   ```
   Given: ゲーム進行中
   When: ブラウザをリロード
   Then: ゲーム状態が復元され、継続してプレイできる
   ```

#### Expected Results
- 複数プレイヤーの非同期プレイが正常に動作する
- BroadcastChannelによるクロスタブ同期が機能する
- IndexedDBからの状態復元が正常に動作する
- イベントソーシングによるログ記録が正確に動作する

#### Validation Commands
```javascript
// Browser Console (Any Tab)
// Check IndexedDB event store
const checkEventStore = async () => {
  const db = await indexedDB.open('trpg_game_db', 1);
  const transaction = db.transaction(['events'], 'readonly');
  const store = transaction.objectStore('events');
  const events = await store.getAll();
  console.log('Stored events:', events.sort((a, b) => a.timestamp - b.timestamp));
};
checkEventStore();
```

---

## Performance Validation

### WebAssembly Performance Test
```javascript
// Browser Console
const performanceTest = async () => {
  const start = performance.now();

  // WASM dice rolling performance test
  const worker = new Worker('/src/workers/gameWorker.js');
  const promises = [];

  for (let i = 0; i < 1000; i++) {
    promises.push(new Promise((resolve) => {
      worker.postMessage({
        type: 'ROLL_DICE',
        data: { notation: '2d6+1', modifier: 0 }
      });
      worker.addEventListener('message', resolve, { once: true });
    }));
  }

  await Promise.all(promises);
  const end = performance.now();

  console.log(`1000 dice rolls completed in ${end - start}ms`);
  console.log(`Average: ${(end - start) / 1000}ms per roll`);
};

performanceTest();
```

### Expected Performance Targets
- **WASM Module Load**: < 200ms
- **Dice Roll (WASM)**: < 1ms per roll
- **Card Usage Processing**: < 5ms
- **State Snapshot Save**: < 50ms
- **Cross-tab Sync Latency**: < 10ms
- **IndexedDB Read/Write**: < 20ms

---

## Error Handling Validation

### Test Error Scenarios
```javascript
// Browser Console - Test error handling
const testErrorHandling = async () => {
  // Test WASM error handling
  const worker = new Worker('/src/workers/gameWorker.js');

  // Invalid dice notation
  worker.postMessage({
    type: 'ROLL_DICE',
    data: { notation: 'invalid', modifier: 0 }
  });

  // Test IndexedDB error handling
  try {
    const db = await indexedDB.open('trpg_game_db', 1);
    const transaction = db.transaction(['invalid_store'], 'readonly');
  } catch (error) {
    console.log('Expected IndexedDB error caught:', error.message);
  }

  // Test network error simulation (for future backend integration)
  try {
    await fetch('/api/invalid-endpoint');
  } catch (error) {
    console.log('Expected network error caught:', error.message);
  }
};

testErrorHandling();
```

---

## Debugging Commands

### Development Tools
```bash
# Real-time log monitoring
bun run dev:logs

# WASM debug build
cd packages/core && cargo build --target wasm32-unknown-unknown --debug

# Type checking in watch mode
bun run typecheck:watch

# Bundle analysis
bun run analyze:bundle
```

### Browser Debug Helpers
```javascript
// Global debug helpers (add to browser console)
window.trpgDebug = {
  // Clear all IndexedDB data
  async clearAllData() {
    const db = await indexedDB.open('trpg_game_db', 1);
    const transaction = db.transaction(db.objectStoreNames, 'readwrite');
    for (const storeName of db.objectStoreNames) {
      await transaction.objectStore(storeName).clear();
    }
    location.reload();
  },

  // Export current game state
  async exportState() {
    const db = await indexedDB.open('trpg_game_db', 1);
    const data = {};
    for (const storeName of db.objectStoreNames) {
      const transaction = db.transaction([storeName], 'readonly');
      data[storeName] = await transaction.objectStore(storeName).getAll();
    }
    console.log('Exported state:', data);
    return data;
  },

  // Simulate network latency
  addNetworkLatency(ms) {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, ms));
      return originalFetch(...args);
    };
  }
};
```

---

## Completion Criteria

### Phase 1 MVP Completion Checklist

#### Core Functionality
- [ ] シナリオ作成・編集・保存が完全に動作
- [ ] キャラクター作成・管理が完全に動作
- [ ] セッション作成・プレイヤー管理が完全に動作
- [ ] ゲームプレイ（カード使用・ダイス判定）が完全に動作
- [ ] 非同期プレイ・ログ記録が完全に動作

#### Technical Requirements
- [ ] WebAssembly統合が正常に動作
- [ ] IndexedDB永続化が正常に動作
- [ ] BroadcastChannelクロスタブ同期が正常に動作
- [ ] TypeScript型安全性が保証されている
- [ ] すべてのテストが通過している

#### User Experience
- [ ] UIが直感的で使いやすい
- [ ] エラーメッセージが分かりやすい
- [ ] パフォーマンス目標を満たしている
- [ ] ブラウザ互換性が確保されている

#### Documentation
- [ ] このQuickstartガイドのすべてのステップが動作する
- [ ] API契約が実装と一致している
- [ ] コード内ドキュメンテーションが充実している

---

## Next Steps (Post-MVP)

1. **Backend Integration**: Node.js + Hono API統合
2. **Real-time Features**: WebSocket通信
3. **Advanced UI**: React Flow統合
4. **Performance Optimization**: バンドルサイズ削減
5. **Testing**: E2E自動テスト追加
6. **Deployment**: Cloudflare Workers配信

---

**重要**: このQuickstartガイドは実装の完了基準として機能します。すべてのシナリオが正常に動作することをMVP完了の証明とします。