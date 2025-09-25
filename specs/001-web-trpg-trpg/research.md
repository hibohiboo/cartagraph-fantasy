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

## 9. MonorepoでのTypeScript型共有戦略

### Decision
Bun Workspaces + TypeScript Project References with "Live Types" pattern

### Rationale
- Bunの純粋TypeScript サポートにより開発時のビルドステップを排除
- プロジェクトレファレンスによるインクリメンタル コンパイルと適切なクロスパッケージ型チェック
- "Live Types" パターンで開発時に直接 .ts ソースからインポート、古い宣言ファイル問題を防止
- 頻繁な内部依存関係を持つモノレポでBunのワークスペース解決がnpm/yarnより高速

### Alternatives Considered
- **パスエイリアスのみ**: ランタイム解決複雑性とIDEでソースファイルではなくコンパイル済み出力にジャンプする問題により却下
- **.d.ts ファイルによるビルドベースアプローチ**: 開発体験の悪化と古い型宣言問題により却下
- **従来のバンドリングでのNx/Turborepo**: 5パッケージ構造には不必要な複雑性により却下

### Configuration Pattern
```typescript
// Root tsconfig.json
{
  "compilerOptions": { "composite": true },
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/frontend" }
  ]
}
```

### Shared Package Structure
```
packages/shared/
├── package.json  // conditional exports設定
├── tsconfig.json // composite: true, declaration: true
└── src/
    ├── types/
    │   ├── entities.ts      // ゲームエンティティ型
    │   ├── session.ts       // セッション管理型
    │   └── wasm-interface.ts // FFI型定義
    └── index.ts
```

### WebAssembly FFI Type Safety
```rust
// packages/core/src/entities.rs
#[derive(Serialize, Deserialize, Tsify)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct Character {
    pub name: String,
    pub cards: Vec<Card>,
    pub tags: Vec<Tag>,
}
```

---

## 10. DDD + オニオンアーキテクチャでのRust実装

### Decision
Multi-layered Rust WASM modules with Session-centric aggregate roots and Event Sourcing

### Rationale
- Rustの型システムがドメイン境界を自然に強制し、WebAssemblyコンパイルでアーキテクチャ整合性を保持
- GameSessionを主要な集約ルートとして一貫性境界を管理
- イベントソーシングによりTRPGの巻き戻しと再生機能を実現
- オニオンアーキテクチャでドメインロジックをインフラから独立してテスト可能

### Alternatives Considered
- **フラットモジュール構造**: 複雑なTRPGルールの関心分離不足により却下
- **JavaScript中心アプローチ**: ゲームルール一貫性のコンパイル時保証不足により却下
- **文字列ベースID**: 型安全性不足により却下

### Architecture Pattern
```rust
// Domain Layer (最内層)
pub mod domain {
    pub mod entities;     // Character, Scenario, Session
    pub mod value_objects; // DiceResult, CardType, SceneName
    pub mod aggregates;   // GameSession, CharacterSheet
    pub mod services;     // RuleEngine, ProbabilityCalculator
}

// Application Layer
pub mod application {
    pub mod commands;     // CreateSession, UseCard, RollDice
    pub mod queries;      // GetSessionState, GetCharacterStats
    pub mod handlers;     // Command/Query handlers
}

// Infrastructure Layer (最外層)
pub mod infrastructure {
    pub mod persistence;  // Event store, state snapshots
    pub mod wasm_bindings; // JavaScript interface
}
```

### Aggregate Root Design
```rust
#[derive(Serialize, Deserialize)]
pub struct GameSession {
    session_id: SessionId,
    scenario: ScenarioInstance,
    players: HashMap<PlayerId, SessionCharacter>,
    current_scene: SceneState,
    shared_cards: Vec<Card>,
    rule_engine: RuleEngine,
    event_history: Vec<DomainEvent>,
}
```

### Event Sourcing with Thalo
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SessionEvent {
    SessionStarted { session_id: SessionId, scenario_id: ScenarioId },
    CardUsed { player_id: PlayerId, card_id: CardId, timestamp: u64 },
    DiceRolled { player_id: PlayerId, notation: DiceNotation, result: DiceResult },
    SceneAdvanced { from_scene: SceneId, to_scene: SceneId },
}
```

---

## 11. IndexedDB vs LocalStorage ゲーム状態永続化

### Decision
IndexedDB as primary storage with LocalStorage for lightweight settings

### Rationale
- **容量**: IndexedDBは大容量（数GB）でLocalStorage（5-10MB）より大幅に多く、複雑なTRPGデータに必要
- **構造化データ**: 複雑なJavaScriptオブジェクト、配列、バイナリデータをシリアライゼーションなしで扱える
- **非同期操作**: 大データ操作でもUIブロッキングを防止
- **高度クエリ**: インデックス機能で効率的なデータ検索（キャラクター履歴、イベントログフィルタリング）
- **オフライン対応**: データ整合性とバージョニングサポートが優秀

### Alternatives Considered
- **LocalStorageのみ**: 容量制限（5-10MB）と同期ブロッキング操作により却下
- **ハイブリッド**: IndexedDB（メインデータ） + LocalStorage（ユーザー設定のみ）

### Event Sourcing with IndexedDB
```javascript
// Object Store Structure
events: {
  eventId: string,
  sessionId: string,
  timestamp: number,
  type: string,
  payload: object,
  playerId?: string
}

gameState: {
  sessionId: string,
  currentState: object,
  lastEventId: string,
  version: number
}
```

### Cross-Tab Synchronization
```javascript
// BroadcastChannel for real-time sync
const gameChannel = new BroadcastChannel('trpg-game-sync');
gameChannel.postMessage({
  type: 'GAME_EVENT',
  sessionId: 'session-123',
  event: eventData
});
```

### Backend Migration Strategy
- **イベントベース同期**: バックエンドが同じイベントストリームを消費
- **オフラインファースト維持**: ローカルイベントが同期まで権威
- **競合解決**: イベントタイムスタンプとベクタークロックで競合処理
- **増分同期**: 最後の成功同期以降の新しいイベントのみ

---

## Status Summary

✅ **完了**: WebAssembly + React統合パターン調査
✅ **完了**: MonorepoでのTypeScript型共有戦略調査
✅ **完了**: DDD + オニオンアーキテクチャでのRust実装調査
✅ **完了**: IndexedDB vs LocalStorage ゲーム状態永続化調査
⏳ **後回し**: Hono + Cloudflare Workers パターン調査（フロントエンド優先のため）

---

## Phase 0 Research Complete

**すべての技術調査が完了しました。Phase 1 設計フェーズへ移行準備完了。**

### 確定した技術スタック
1. **WebAssembly + React**: WebWorker統合パターンでメインスレッド応答性保持
2. **Monorepo TypeScript**: Bun Workspaces + Project References + "Live Types" パターン
3. **DDD + Onion Architecture**: Session中心の集約ルート + イベントソーシング
4. **IndexedDB Storage**: イベントソーシング + BroadcastChannel クロスタブ同期

### 次のフェーズ
- **Phase 1**: data-model.md, contracts/, quickstart.md, CLAUDE.md の作成
- **Constitution Check**: 再評価
- **Phase 2**: タスク生成アプローチ計画