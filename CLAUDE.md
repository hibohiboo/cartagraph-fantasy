# Claude Context: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Project**: Asynchronous TRPG-style Web Game
**Tech Stack**: Rust WebAssembly + React + TypeScript Monorepo
**Architecture**: DDD + Onion Architecture + Event Sourcing
**Last Updated**: 2025-09-26

---

## Project Overview
Webブラウザで遊べる非同期TRPG風ゲーム。忙しいユーザーが自分のペースで物語を楽しめる非同期な体験を提供する。

**Core Value**: いつでもどこでも参加でき、プレイヤー自身が物語を紡ぐ体験

---

## Technology Stack

### Core Architecture
- **Frontend**: React 19 + TypeScript 5.3 + Vite
- **Core Logic**: Rust 1.75 + WebAssembly (wasm-pack)
- **Package Management**: Bun (monorepo management)
- **Storage**: IndexedDB (initial) → PostgreSQL + Neo4j (future)
- **UI Components**: Storybook + React Flow (scenario editing)

### WebAssembly Integration
- **Pattern**: WebWorker + WASM message-based communication
- **FFI**: Rust wasm-bindgen + TypeScript tsify
- **Communication**: Structured serialization between JS ↔ WASM
- **Performance**: <5MB WASM bundle, <1ms dice rolls

### State Management
- **Architecture**: Event Sourcing + CQRS
- **Persistence**: IndexedDB object stores
- **Synchronization**: BroadcastChannel for cross-tab sync
- **Consistency**: Session-centric aggregate roots

---

## Monorepo Structure
```
packages/
├── core/             # Rust WebAssembly (ゲームロジック)
│   ├── domain/       # DDD entities, aggregates, services
│   ├── application/  # Command/Query handlers
│   └── wasm/         # WebAssembly FFI bindings
├── shared/           # TypeScript shared types
│   ├── types/        # Domain model types
│   └── contracts/    # OpenAPI schemas
├── frontend/         # React application
│   ├── components/   # UI components
│   ├── workers/      # WebWorker integration
│   └── hooks/        # React hooks
├── ui/               # Storybook + reusable components
│   ├── components/   # Component library
│   └── stories/      # Storybook stories
└── backend/          # Node.js + Hono (future)
    ├── api/          # REST API routes
    └── domain/       # Backend domain logic
```

---

## Domain Model

### Primary Aggregates
1. **GameSession** (主要集約ルート)
   - セッション全体の一貫性境界
   - プレイヤー管理、シーン進行、イベント処理
   - Event Sourcing によるゲーム状態管理

2. **ScenarioTemplate** (二次集約ルート)
   - 再利用可能なシナリオ定義
   - シーン・イベント構造、完了条件定義
   - 派生シナリオ作成サポート

3. **Character** (二次集約ルート)
   - プレイヤー資産の永続化境界
   - カード・タグ管理、セッション履歴
   - シナリオ参加制限管理

### Core Systems
- **Card System**: アクション・選択肢・所持・シーン遷移カード
- **Tag System**: スキル・状態・実績・条件タグ
- **Dice System**: 2d6基本、修正値、有利/不利システム
- **Event System**: トリガー・条件・効果による動的イベント処理

---

## Development Practices

### Testing Strategy (MVP Focus)
- **core** (TDD必須): ドメインロジック、ルールエンジン、イベント処理
- **shared** (型テスト): TypeScript型定義の整合性
- **frontend** (E2E): ユーザーシナリオの動作確認
- **ui** (snapshot): コンポーネントの視覚的回帰テスト
- **backend** (後回し): API統合テスト（将来実装）

### Build Pipeline
- **WASM**: `cargo build → wasm-pack → TypeScript bindings`
- **Frontend**: `Vite + TypeScript → Bundle optimization`
- **Types**: `shared package → cross-package type sharing`
- **Storybook**: `Component documentation + visual testing`

### Code Conventions
- **Rust**: DDD boundaries, strong typing, Event Sourcing patterns
- **TypeScript**: Strict mode, functional patterns, React Query
- **React**: Hooks-first, component composition, accessibility
- **CSS**: Tailwind utilities, component-scoped styles

---

## Key Technical Decisions

### WebAssembly Architecture
- **Rationale**: CPU集約的ルール処理、型安全性、パフォーマンス
- **Pattern**: Module preloading → Worker transfer → Message passing
- **Integration**: TypeScript FFI bindings for type safety

### Event Sourcing
- **Rationale**: TRPG巻き戻し・再生機能、非同期プレイ対応
- **Storage**: IndexedDB event streams + periodic snapshots
- **Sync**: BroadcastChannel for real-time cross-tab updates

### Frontend-Only MVP
- **Rationale**: 初期検証フォーカス、複雑性軽減
- **Storage**: IndexedDB/LocalStorage でオフライン対応
- **Migration**: 将来的にバックエンドAPI統合、データ移行計画済み

---

## Current Implementation Status

### Phase 1: Design Complete ✅
- [x] Domain model design (DDD aggregates, value objects)
- [x] API contracts (OpenAPI schemas for all endpoints)
- [x] WASM interface contracts (FFI type definitions)
- [x] Technical research (WebAssembly patterns, storage strategies)

### Phase 2: Task Planning (Next)
- [ ] Generate implementation tasks from design documents
- [ ] TDD test scenarios from contracts and user stories
- [ ] Dependencies and parallelization strategy
- [ ] MVP milestone definitions

### Phase 3: Implementation (Pending)
- [ ] Shared types and contracts
- [ ] Core WASM domain logic (TDD)
- [ ] Frontend React application
- [ ] UI component library
- [ ] Integration and E2E testing

---

## User Stories Priority

### Core User Flows
1. **シナリオ作成者**: シナリオ作成 → シーン定義 → イベント設定 → 公開
2. **GM**: シナリオ選択 → セッション開催 → プレイヤー募集 → ゲーム進行管理
3. **プレイヤー**: キャラ作成 → セッション参加 → カード使用 → ダイス判定
4. **非同期プレイ**: ログ確認 → 進捗把握 → 自分のペースでアクション

### Technical User Stories
1. **WebWorker統合**: メインスレッド応答性維持
2. **クロスタブ同期**: 複数タブでの状態同期
3. **オフライン対応**: インターネット接続不要でのプレイ
4. **状態永続化**: ブラウザリロード後の状態復元

---

## Performance Requirements
- **WASM Module**: <5MB bundle size
- **Dice Calculation**: <1ms per roll
- **State Sync**: <10ms cross-tab latency
- **UI Response**: <100ms user interaction feedback
- **Data Persistence**: <50ms IndexedDB operations

---

## Development Commands

### Setup & Build
```bash
bun install                    # Install all dependencies
bun run setup:workspaces      # Initialize monorepo
bun run build:all             # Build all packages
```

### Development
```bash
bun run dev                   # Start all dev servers
bun run dev:frontend         # Frontend only
bun run dev:storybook        # UI components only
```

### Testing & Quality
```bash
bun run test:all             # Run all tests
bun run test:core            # Core WASM tests only
bun run typecheck            # TypeScript validation
bun run lint                 # Code linting
```

### WebAssembly
```bash
cd packages/core && wasm-pack build --target web
bun run generate:wasm-types  # Generate TS bindings
```

---

## Context for AI Assistance

### When working on this project:
1. **Always consider MVP scope**: Frontend-only, IndexedDB storage
2. **Follow TDD approach**: Tests before implementation, especially for core
3. **Maintain type safety**: Rust ↔ TypeScript FFI contracts
4. **Think Event Sourcing**: State changes as events, not direct mutations
5. **Consider non-blocking**: WebWorker patterns, async operations

### Common tasks:
- Implementing Rust domain logic with WebAssembly exports
- Creating TypeScript React components with WASM integration
- Writing contract tests from OpenAPI specifications
- Debugging WebWorker communication patterns
- Optimizing IndexedDB event sourcing performance

### Architecture constraints:
- No backend API calls in MVP (frontend-only)
- All game logic must run in WebAssembly
- State synchronization via BroadcastChannel
- Type safety across Rust ↔ TypeScript boundary
- DDD aggregate boundaries must be respected

This context should provide sufficient information for effective AI assistance on the 非同期TRPG風ゲーム project.