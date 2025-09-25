# Implementation Plan: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Branch**: `001-web-trpg-trpg` | **Date**: 2025-09-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-web-trpg-trpg/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Complete: 仕様書を分析し、30の機能要件と8つのエンティティを確認
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Complete: 技術スタックを確定（Rust WebAssembly + React + Node.js）
   → Project Type: web - モノレポ構成
3. Evaluate Constitution Check section below
   → Check: 5つのプロジェクト構成、DDD+オニオンアーキテクチャ採用
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → Research WebAssembly integration with React, Hono API patterns
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → Generate API contracts, domain models, setup instructions
6. Re-evaluate Constitution Check section
   → Verify library-first approach, testing strategy
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
非同期TRPG風ゲーム「遺跡漁りとドブさらい」の開発。忙しいユーザーがWebブラウザで自分のペースで楽しめる非同期なTRPG体験を提供する。技術アプローチ：コアロジックをRust(WebAssembly)で実装し、フロントエンドをReact+TypeScript、バックエンドをNode.js+Hono+TypeScriptで構築するモノレポ構成。

## Technical Context
**Package Management**: bun（モノレポのパッケージ管理に採用。高速な依存解決とスクリプト実行の統一を目的）
**Language/Version**: Rust 1.75 (コアロジック), TypeScript 5.3 (フロントエンド/バックエンド), Node.js 22+
**Primary Dependencies**: React 19, React router v7, Hono, wasm-pack, Storybook, Cloudflare Workers
**Storage**: 初期実装 - IndexedDB/LocalStorage, 将来 - PostgreSQL (Neon), Neo4j
※UIレイヤーではReact Flowを利用し、Neo4jとのグラフ構造移行を見据えた編集体験を提供予定
**Testing**: cargo test (Rust), Vitest + React Testing Library (React), Vitest (Node.js)
**Target Platform**: Cloudflare Workers (バックエンド), WebAssembly+WebWorker (フロントエンドコア)
**Project Type**: web - モノレポ構成でフロントエンド+バックエンド+UIコンポーネント
**UI Editing**: React Flow（シナリオ・シーン・タグ等の編集UIに使用。
  将来的なGraphDB（Neo4j）とのデータ構造親和性を意識した選定）
**Performance Goals**: 検証なのでなし
**Constraints**: オフライン対応(初期), WebAssemblyサイズ<5MB, DDD+オニオンアーキテクチャ
**Scale/Scope**: 検証なのでユーザー数は5人以下, シナリオエディタ+ゲームプレイ画面

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 5 (backend, frontend, ui, core, shared) - 3を超過
- Using framework directly? React/Hono直接使用, wrapper無し
- Single data model? 共通型定義をsharedパッケージで管理
- Avoiding patterns? DDDドメインモデル使用（複雑性必要）

**Architecture**:
- EVERY feature as library? 各パッケージがライブラリとして独立
- Libraries listed: core(ゲームロジック), ui(コンポーネント), shared(型定義), backend(API), frontend(アプリ)
- CLI per library: backend(サーバー起動), core(テストランナー), frontend(開発サーバー)
- Library docs: llms.txt format planned? 各パッケージにREADME.md配置予定

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? **MVP段階**: coreドメインロジック最優先TDD、UI/Storybookはsnapshot中心
- Git commits show tests before implementation? コミットメッセージで明示
- Order: Contract→Integration→E2E→Unit strictly followed? API設計から順次実装
- Real dependencies used? IndexedDB実装、後にPostgreSQL統合テスト
- Integration tests for: WebAssembly↔React, React↔Backend API, モノレポ間連携
- **MVP Testing Priority**: core (TDD必須) > shared (型テスト) > frontend (E2E) > ui (snapshot) > backend (後回し)
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? console.logからstructured loggingへ移行
- Frontend logs → backend? WebWorkerエラーもバックエンド送信
- Error context sufficient? スタックトレース+ユーザー操作履歴

**Versioning**:
- Version number assigned? 0.1.0で開始
- BUILD increments on every change? 各パッケージ独立バージョニング
- Breaking changes handled? モノレポ内でAPI変更は同時更新

## Project Structure

### Documentation (this feature)
```
specs/001-web-trpg-trpg/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
**Structure Decision**: Option 2 (Web application) + モノレポ構成
```
packages/
├── backend/          # Node.js + Hono + TypeScript
│   ├── src/
│   │   ├── domain/   # DDDドメインモデル
│   │   ├── usecases/ # アプリケーションサービス
│   │   ├── infrastructure/ # 永続化・外部API
│   │   └── api/      # Honoルート定義
│   └── tests/
├── frontend/         # React + TypeScript + WebAssembly
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── workers/  # WebWorker (Rust WASM呼び出し)
│   └── tests/
├── ui/               # Storybook + Reactコンポーネント
│   ├── src/
│   │   ├── components/
│   │   └── stories/
│   └── tests/
├── core/             # Rust WebAssemblyコアロジック
│   ├── src/
│   │   ├── domain/   # ゲームルールドメインモデル
│   │   ├── usecases/ # ゲーム進行ロジック
│   │   └── wasm/     # WebAssembly FFI
│   └── tests/
└── shared/           # TypeScript共通型定義
    ├── src/
    │   ├── types/    # APIレスポンス型, ドメインモデル型
    │   └── contracts/ # OpenAPI schema
    └── tests/
```

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - WebAssemblyとReactの統合パターン
   - HonoでのCloudflare Workers最適化
   - モノレポでのTypeScript型共有戦略
   - DDD+オニオンアーキテクチャでのRust実装

2. **Generate and dispatch research agents**:
   ```
   Task: "Research WebAssembly integration patterns with React and WebWorkers"
   Task: "Find Hono best practices for Cloudflare Workers deployment"
   Task: "Research monorepo TypeScript configuration for shared types"
   Task: "Find Domain-Driven Design patterns in Rust WebAssembly"
   Task: "Research IndexedDB vs LocalStorage for game state persistence"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - ユーザー, シナリオ, シーン, イベント, キャラクター, カード, タグ, セッション
   - DDD集約ルート設計, 値オブジェクト識別
   - 状態遷移図（セッション進行, カード使用）

2. **Generate API contracts** from functional requirements:
   - シナリオ作成: POST /scenarios, GET /scenarios/:id
   - セッション管理: POST /sessions, PUT /sessions/:id/players
   - ゲームプレイ: POST /sessions/:id/actions, GET /sessions/:id/log
   - Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - API endpoint毎のrequest/response schema validation
   - WebAssembly FFI interface test
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - シナリオ作成→GM募集→プレイヤー参加→ゲームプレイ→終了
   - 非同期プレイ: ログイン→進捗確認→アクション実行
   - Quickstart test = E2E user story validation

5. **Update agent file incrementally** (O(1) operation):
   - Create CLAUDE.md with current tech stack context
   - モノレポ構成, Rust WebAssembly, React patterns
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → domain model creation task [P]
- Each user story → integration test task
- WebAssembly build pipeline setup task
- Storybook component development tasks
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- **MVP実装順序**: shared → core (ドメインロジック最優先) → frontend (フロントエンドのみ) → ui → backend (後回し)
- **初期MVPスコープ**: フロントエンドのみ（バックエンド連携は将来実装）
- Mark [P] for parallel execution (independent packages)
- WebAssembly compilation pipeline setup first

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 5つのプロジェクト | モノレポ + WebAssembly + UI分離が必要 | 3プロジェクトではWebAssemblyとUI分離が困難 |
| Repository pattern | DDD + 永続化抽象化が必要 | 直接DB接続では将来のNeo4j移行で大規模変更が発生 |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS (with justified complexity)
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*