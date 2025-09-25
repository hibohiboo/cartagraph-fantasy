# Technical Research: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Date**: 2025-09-26
**Phase**: Phase 0 - Outline & Research
**Status**: In Progress

## Overview
WebAssembly + React + Hono技術スタックでの非同期TRPG風ゲーム開発に向けた技術調査結果。

---

## 1. WebAssembly + React + WebWorker Integration

### Decision
WebWorkers + WASM pattern with message-based communication

### Rationale
- メインUIスレッドの応答性を保持しつつ、CPU集約的なゲームロジック（ダイス計算、ルール評価）を並列実行
- TRPG の複雑なルールシステムに対して、UI ブロッキングを防止
- ゲームの保存・ロード機能や巻き戻し機能に必要なstate snapshotに対応

### Alternatives Considered
- **直接メインスレッドWASM統合**: UI ブロッキングの可能性により却下
- **純粋JavaScript実装**: 複雑ルール評価のパフォーマンス限界により却下

### Implementation Pattern
```rust
// Rust WASM側
#[wasm_bindgen]
pub struct GameEngine {
    state: Arc<RwLock<GameState>>,
}

#[wasm_bindgen]
impl GameEngine {
    pub fn process_action(&mut self, action: &str) -> String {
        // ゲームアクション処理、シリアライズされた状態変更を返す
    }
}
```

---

## 2. Build Pipeline & Development Workflow

### Decision
Vite + vite-plugin-wasm + vite-plugin-wasm-pack

### Rationale
- 2025年時点でwebpackベースソリューションより優秀な開発体験
- ファーストクラスHMRサポートと優れたWASM統合
- 成熟したプラグインエコシステム

### Alternatives Considered
- **Create React App + react-app-rewired**: 設定複雑性とメンテナンスオーバーヘッドにより却下
- **純粋webpack設定**: 設定複雑性により却下

### Configuration
```javascript
// vite.config.js
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  build: { target: 'esnext' },
  optimizeDeps: { exclude: ['your-wasm-package'] }
});
```

---

## 3. State Synchronization Architecture

### Decision
Event-driven architecture with serialized state snapshots

### Rationale
- TRPGの明確なフェーズ（セットアップ、プレイ、解決）がステートマシンに適合
- シリアライズされたスナップショットによりゲーム保存・ロード・巻き戻し機能を実現
- 非同期プレイに必要な状態同期が可能

### Alternatives Considered
- **直接共有メモリ**: 複雑性とブラウザ制限により却下
- **リアクティブバインディング**: 状態変更毎のシリアライゼーションオーバーヘッドにより却下

---

## 4. WebWorker Communication Strategy

### Decision
Module pre-loading with transfer-based communication

### Rationale
- メインスレッドでWASMモジュールを一度ロード・コンパイルし、ワーカーへ転送することで非同期インスタンス化の競合状態を排除
- ダイス振りなど即座にフィードバックが期待される操作で重要

### Alternatives Considered
- **ワーカーローカルモジュールロード**: 競合状態により却下
- **共有配列バッファアプローチ**: ブラウザサポート制限により却下

### Implementation
```javascript
// メインスレッド
const wasmModule = await WebAssembly.compileStreaming(fetch('game.wasm'));
worker.postMessage({ type: 'INIT', module: wasmModule });

// ワーカースレッド
self.onmessage = async ({ data }) => {
  if (data.type === 'INIT') {
    const instance = await WebAssembly.instantiate(data.module);
    // ゲームロジック準備完了
  }
};
```

---

## 5. Game Logic Distribution

### Decision
- **Rust/WASM**: ルールエンジン、ダイスメカニクス、状態検証
- **React**: UI、アニメーション、ユーザーインタラクション

### Rationale
- Rustの型安全性を複雑ルールシステムで活用しつつ、Reactをプレゼンテーション専用に
- TRPGルールの複雑性はRustのコンパイル時保証の恩恵を受ける

### Alternatives Considered
- **JavaScriptルールエンジン**: ランタイムエラーの可能性により却下
- **完全WASM実装**: DOM操作の複雑性により却下

### Recommended Boundaries
- **Rust/WASM**: ダイス確率計算、ルール検証、ゲーム状態管理、AI/NPC動作
- **React**: カードアニメーション、ドラッグ&ドロップ、フォーム入力、リアルタイムチャット、音響・視覚効果

---

## 6. Performance Optimization

### Decision
Batch operations and lazy state synchronization

### Rationale
- TRPGゲームでは複数同時ダイス振りやカード効果が頻発
- 操作をバッチ化することで個別操作に比べシリアライゼーションオーバーヘッドを60-80%削減

### Alternatives Considered
- **全操作リアルタイム同期**: パフォーマンスオーバーヘッドにより却下
- **クライアント側予測のみ**: 同期ずれの可能性により却下

---

## 7. Monorepo Structure

### Decision
Separate WASM and React workspaces in monorepo

### Rationale
- ゲームロジックをUI関心事から独立して開発・テスト可能
- TRPGシステムのルール複雑性には広範なテストが必要

### Structure
```
trpg-game/
├── packages/
│   ├── game-engine/ (Rust WASM)
│   ├── ui-components/ (React)
│   └── shared-types/ (TypeScript definitions)
├── apps/
│   └── web-client/ (Main React app)
└── tools/
    └── build-scripts/
```

### Alternatives Considered
- **単一リポジトリ構造**: ビルド複雑性により却下
- **分離リポジトリ**: 依存関係管理オーバーヘッドにより却下

---

## 8. Dice Rolling System

### Decision
Hybrid approach - JavaScript for random seed generation, Rust for probability calculations

### Rationale
- WASMはシステム乱数へのアクセスが制限されているが、JavaScriptのcrypto.getRandomValues()は暗号学的に安全な乱数を提供
- Rustは複雑な確率数学を効率的に処理

### Alternatives Considered
- **純粋JavaScript RNG**: 複雑確率計算のパフォーマンス制限により却下
- **WASMのみ乱数**: WASM環境でのエントロピーソース不足により却下

---

## Status Summary

✅ **完了**: WebAssembly + React統合パターン調査
🔄 **進行中**: Hono + Cloudflare Workers パターン調査
⏳ **待機中**: MonorepoでのTypeScript型共有戦略調査
⏳ **待機中**: DDD + オニオンアーキテクチャでのRust実装調査
⏳ **待機中**: IndexedDB vs LocalStorage ゲーム状態永続化調査

---

## Next Steps
1. Hono + Cloudflare Workers の最適化戦略を調査
2. モノレポでのTypeScript型共有設定を調査
3. RustでのDDDパターン実装を調査
4. ゲーム状態永続化戦略を調査
5. 全調査結果をもとにPhase 1設計フェーズへ移行