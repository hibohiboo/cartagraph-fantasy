# Frontend Design: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Date**: 2025-10-02
**Phase**: Phase 3 - Frontend Implementation
**Status**: In Progress

## Overview
React 19 + TypeScript + Tailwind CSSによるフロントエンド設計。WebAssembly Worker統合、IndexedDBによるローカルファースト設計、UIコンポーネントライブラリによる再利用性を実現。

---

## Application Architecture

### Technology Stack
- **Framework**: React 19 (Hooks-first)
- **Routing**: React Router v7
- **State Management**: React Query + Zustand (予定)
- **Styling**: Tailwind CSS
- **UI Components**: packages/ui (Storybook)
- **WASM Integration**: WebWorker + simple-worker-service
- **Storage**: IndexedDB (idb wrapper)
- **Build Tool**: Vite

### Package Structure
```
packages/frontend/
├── src/
│   ├── pages/              # ページコンポーネント
│   ├── components/         # ページ固有コンポーネント
│   ├── services/           # ビジネスロジック層
│   ├── workers/            # WebWorker統合
│   ├── hooks/              # カスタムReact Hooks
│   ├── App.tsx             # ルートコンポーネント
│   └── main.tsx            # エントリポイント
└── public/                 # 静的アセット
```

---

## Routing & Pages

### Route Configuration
| Path | Component | Description | Status |
|------|-----------|-------------|--------|
| `/` | Home | ホーム画面、各機能へのナビゲーション | ✅ 完了 |
| `/sessions` | Sessions | セッション一覧 (アクティブ/完了) | ✅ 完了 |
| `/sessions/new` | CreateSession | 新規セッション作成 | ✅ 完了 |
| `/game/:sessionId?` | Game | ゲームプレイ画面 | 🚧 基盤のみ |
| `/scenario/:scenarioId?` | Scenario | シナリオ閲覧 | 🚧 基盤のみ |
| `/characters` | Characters | キャラクター一覧 (予定) | ❌ 未実装 |
| `/characters/new` | CreateCharacter | キャラクター作成 (予定) | ❌ 未実装 |
| `/characters/:id` | CharacterDetail | キャラクター詳細 (予定) | ❌ 未実装 |

---

## Page Specifications

### 1. Home (`/`)

**目的**: アプリケーションのエントリポイント、各機能へのナビゲーション

**機能**:
- ゲーム概要説明
- セッション管理へのリンク
- ゲームプレイへのリンク
- シナリオ一覧へのリンク

**実装状態**: ✅ 完了

**使用コンポーネント**:
- `Link` (react-router-dom)
- カスタムCSS (Home.css)

---

### 2. Sessions (`/sessions`)

**目的**: セッション一覧の表示と管理

**機能**:
- ✅ アクティブなセッション一覧表示
- ✅ 完了したセッション一覧表示
- ✅ セッション作成ページへのナビゲーション
- ✅ セッション詳細へのナビゲーション
- ❌ プレイヤー管理モーダル (未実装)
- ❌ IndexedDBからのセッション取得 (未実装)

**実装状態**: ⚠️ 一部完了 (75%)

**使用コンポーネント**:
- `SessionList` (@cartagraph-fantasy/ui)
- `SessionCard` (@cartagraph-fantasy/ui)

**状態管理**:
```typescript
const [sessions, setSessions] = useState<SessionCardProps[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**データフロー**:
```
IndexedDB (TODO) → loadSessions() → sessions state → SessionList → SessionCard
```

**未実装機能**:
- IndexedDBからのセッション一覧取得
- プレイヤー管理UI (招待、キック、ステータス変更)
- セッションステータス更新
- リアルタイム同期 (BroadcastChannel)

---

### 3. CreateSession (`/sessions/new`)

**目的**: 新規セッション作成

**機能**:
- ✅ シナリオ選択ドロップダウン
- ✅ GMユーザー名入力
- ✅ バリデーション
- ✅ WebWorker経由でセッション作成
- ✅ エラーハンドリング
- ✅ セッション一覧へのリダイレクト
- ❌ IndexedDBへの保存 (未実装)
- ❌ シナリオ一覧の動的取得 (未実装)

**実装状態**: ⚠️ 一部完了 (80%)

**使用コンポーネント**:
- `CreateSessionForm` (@cartagraph-fantasy/ui)

**データフロー**:
```
CreateSessionForm → handleSubmit() → getSimpleWorkerService().createSession()
→ IndexedDB保存 (TODO) → navigate('/sessions')
```

**現在のシナリオデータ** (モックデータ):
```typescript
const mockScenarios = [
  { id: 'scenario001', name: '遺跡の探索', description: '...' },
  { id: 'scenario002', name: '闇の森', description: '...' },
  { id: 'scenario003', name: 'ドラゴンの洞窟', description: '...' }
];
```

**未実装機能**:
- IndexedDBへのセッション保存
- シナリオ一覧の動的取得 (IndexedDBまたはWASM)
- セッション作成後のプレイヤー招待UI

---

### 4. Game (`/game/:sessionId?`)

**目的**: メインゲームプレイ画面

**機能** (計画):
- 現在のシーン表示
- カード使用インターフェース (ドラッグ&ドロップ)
- ダイス振りインターフェース (アニメーション付き)
- イベントログ表示 (フィルタ機能)
- プレイヤー情報表示
- リアルタイム更新 (他プレイヤーのアクション)

**実装状態**: 🚧 基盤のみ (WebWorker統合テストのみ)

**未実装機能**:
- 上記すべての機能

---

### 5. Scenario (`/scenario/:scenarioId?`)

**目的**: シナリオ閲覧・選択

**機能** (計画):
- シナリオ一覧表示
- シナリオ詳細表示
- シナリオ検索・フィルタ
- 推奨人数・難易度表示

**実装状態**: 🚧 基盤のみ

**未実装機能**:
- 上記すべての機能

---

## UI Component Library (packages/ui)

### 実装済みコンポーネント

#### 1. SessionCard
**ファイル**: `packages/ui/src/components/SessionCard.tsx`

**Props**:
```typescript
interface SessionCardProps {
  sessionId: string;
  scenarioId: string;
  gmUserId: string;
  status: 'WaitingForPlayers' | 'InProgress' | 'Completed';
  playerCount: number;
  createdAt: string;
  onViewSession?: (sessionId: string) => void;
  onManagePlayers?: (sessionId: string) => void;
}
```

**機能**:
- ステータス別の色分け (青: 募集中, 緑: 進行中, 灰: 完了)
- セッション情報表示
- アクションボタン (セッション表示、プレイヤー管理)

**Storybookストーリー**: 6種類 (WaitingForPlayers, InProgress, Completed, NoActions, LongIds, ZeroPlayers)

---

#### 2. SessionList
**ファイル**: `packages/ui/src/components/SessionList.tsx`

**Props**:
```typescript
interface SessionListProps {
  sessions: SessionCardProps[];
  title?: string;
  emptyMessage?: string;
  onViewSession?: (sessionId: string) => void;
  onManagePlayers?: (sessionId: string) => void;
}
```

**機能**:
- グリッドレイアウト (レスポンシブ: 1列 → 2列 → 3列)
- 空の状態表示
- タイトルとメッセージのカスタマイズ

**Storybookストーリー**: 7種類 (WithTitle, WithoutTitle, Empty, SingleSession, ManySessions, など)

---

#### 3. CreateSessionForm
**ファイル**: `packages/ui/src/components/CreateSessionForm.tsx`

**Props**:
```typescript
interface CreateSessionFormProps {
  scenarios: Array<{ id: string; name: string; description?: string }>;
  onSubmit: (data: CreateSessionFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  error?: string;
}

interface CreateSessionFormData {
  scenarioId: string;
  gmUserId: string;
}
```

**機能**:
- シナリオ選択ドロップダウン
- シナリオ説明の動的表示
- GMユーザー名入力
- バリデーション (必須フィールド)
- 送信中状態の表示
- エラーメッセージ表示

**実装パターン**:
- サブコンポーネント分離 (ErrorMessage, ScenarioDescription, FormActions)
- useMemo による最適化
- Lint複雑度エラー対策済み

**Storybookストーリー**: 7種類 (Default, WithoutCancel, Submitting, WithError, EmptyScenarios, など)

---

#### 4. 既存コンポーネント (タスク5で実装)

**Button**:
- 3種類のバリアント (primary, secondary, outline)
- 3種類のサイズ (small, medium, large)

**Card**:
- 3種類のバリアント (default, bordered, elevated)
- クリックイベント対応

---

## Services Layer

### 1. simple-worker-service.ts
**目的**: WebWorker通信のシングルトンサービス

**WASM契約仕様**:
- `specs/001-web-trpg-trpg/contracts/wasm-interface-task16.yaml` - MVP版インターフェース (現在実装)
- `specs/001-web-trpg-trpg/contracts/wasm-interface-future.yaml` - 将来版インターフェース (計画)

**主要メソッド**:
```typescript
class SimpleWorkerService {
  createSession(scenarioId: string, gmUserId: string): Promise<string>
  addPlayer(sessionId: string, userId: string, characterName: string): Promise<string>
  rollDice(sessionId: string, playerId: string, diceCount: number, diceSides: number): Promise<string>
  getSession(sessionId: string, scenarioId: string): Promise<string>
}
```

**実装パターン**:
- Promiseベースメッセージ送受信
- UUID付きリクエスト追跡
- 10秒タイムアウト
- シングルトンパターン (`getSimpleWorkerService()`)

**WASM FFI境界**:
```
SimpleWorkerService (TypeScript)
  ↓ postMessage
simple-game-worker.ts (WebWorker)
  ↓ WASM bindings
packages/core/src/wasm_interface.rs (Rust)
  ↓ Domain Layer
GameSession, Character, ScenarioTemplate集約
```

**契約仕様との対応**:
- `wasm-interface-task16.yaml` で定義された関数がRustで実装済み
- TypeScript側はWebWorkerメッセージング層でラップ
- 型安全性はts-rsによる自動生成で保証

**使用箇所**:
- CreateSession.tsx (セッション作成)
- Game.tsx (WebWorker統合テスト)

---

### 2. event-store.ts
**目的**: IndexedDBベースのイベントストア

**主要機能**:
- イベントストリーム管理
- スナップショット管理
- BroadcastChannel同期
- 範囲クエリ、統計情報取得

**実装状態**: ✅ 完了 (タスク19)

**使用予定箇所**:
- Sessions.tsx (セッション一覧取得)
- CreateSession.tsx (セッション保存)
- Game.tsx (ゲーム状態管理)

**未統合**: フロントエンドページとの統合が必要

---

### 3. database.ts
**目的**: IndexedDB初期化とスキーマ定義

**実装状態**: ✅ 完了

**使用**: event-store.tsから内部利用

---

## State Management Strategy

### Current Implementation (useState)
```typescript
// ページレベルのローカル状態
const [sessions, setSessions] = useState<SessionCardProps[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Planned Migration (Zustand + React Query)

**Zustand** (グローバル状態):
```typescript
// 予定: UIステート、ユーザー設定
interface AppStore {
  currentUserId: string | null;
  setCurrentUserId: (id: string) => void;
  // ...
}
```

**React Query** (非同期データ):
```typescript
// 予定: セッション、キャラクター、シナリオのキャッシュ管理
const { data: sessions, isLoading, error } = useQuery({
  queryKey: ['sessions'],
  queryFn: () => fetchSessionsFromIndexedDB(),
});
```

**実装タスク**: タスク25 (UIステート管理実装)

---

## Data Flow Patterns

### 1. セッション作成フロー
```
User Input (CreateSessionForm)
  ↓
handleSubmit()
  ↓
getSimpleWorkerService().createSession()
  ↓ (WebWorker経由)
WASM: wasm_create_session()
  ↓ (レスポンス)
Session JSON
  ↓ (TODO)
IndexedDB保存 (EventStore)
  ↓
navigate('/sessions')
```

### 2. セッション一覧表示フロー (計画)
```
Sessions.tsx mount
  ↓
useEffect(() => loadSessions())
  ↓
IndexedDB query (EventStore)
  ↓
sessions state 更新
  ↓
SessionList → SessionCard レンダリング
```

### 3. WebWorker統合パターン
```
Frontend Page
  ↓
SimpleWorkerService.method()
  ↓ (postMessage)
simple-game-worker.ts
  ↓
WASM function call
  ↓ (postMessage)
SimpleWorkerService (Promise resolve)
  ↓
Frontend Page (async/await)
```

---

## IndexedDB Schema

### Object Stores

#### 1. events (イベントストリーム)
```typescript
{
  eventId: string (keyPath)
  sessionId: string (index)
  sequence: number (index)
  timestamp: number (index)
  type: string
  payload: object
  version: number
}
```

**インデックス**:
- `sessionId` - セッション別イベント取得
- `sequence` - イベント順序管理
- `timestamp` - 時系列クエリ

---

#### 2. snapshots (状態スナップショット)
```typescript
{
  snapshotId: string (keyPath)
  sessionId: string (index)
  sequence: number
  timestamp: number
  state: object
  version: number
}
```

**用途**: 100イベント毎の自動スナップショット

---

#### 3. metadata (スキーマバージョン管理)
```typescript
{
  key: string (keyPath)
  value: any
}
```

**用途**: スキーマバージョン、マイグレーション履歴

---

#### 4. sessions (予定 - セッションメタデータ)
```typescript
{
  sessionId: string (keyPath)
  scenarioId: string
  gmUserId: string
  status: 'WaitingForPlayers' | 'InProgress' | 'Completed'
  playerCount: number
  createdAt: string
  updatedAt: string
}
```

**未実装**: セッション一覧の高速取得用

---

## Cross-Tab Synchronization

### BroadcastChannel Messages

**実装状態**: ✅ event-store.tsで完了

**メッセージタイプ**:
```typescript
type SyncMessage =
  | { type: 'EVENT_APPENDED'; sessionId: string; sequence: number }
  | { type: 'SNAPSHOT_SAVED'; sessionId: string; sequence: number }
  | { type: 'SESSION_DELETED'; sessionId: string }
  | { type: 'REQUEST_SYNC'; sessionId: string }
  | { type: 'SYNC_RESPONSE'; sessionId: string; sequence: number };
```

**使用予定**:
- Sessions.tsx (セッション一覧の自動更新)
- Game.tsx (ゲーム状態の同期)

**未統合**: フロントエンドページとの統合が必要

---

## Performance Considerations

### Bundle Size
- **WASM**: 273KB (目標 < 5MB) ✅
- **Frontend**: 監視必要

### Rendering Optimization
- **SessionList**: グリッドレイアウトでの仮想化は不要 (通常数十件程度)
- **Game.tsx**: React.memoによるカード再レンダリング最適化が必要

### IndexedDB Performance
- **イベントクエリ**: <50ms (目標達成済み)
- **スナップショット読み込み**: <100ms (目標達成済み)

---

## Accessibility

### 現在の実装
- セマンティックHTML (button, form, label)
- 適切なaria-label (未実装)
- キーボードナビゲーション (基本対応)

### 改善予定
- aria-label追加
- フォーカス管理
- スクリーンリーダー対応

---

## Testing Strategy

### Component Testing (予定)
- **UI Components**: Storybook Interaction Tests
- **Pages**: React Testing Library

### E2E Testing (予定)
- **タスク8**: quickstart.mdシナリオに基づくE2Eテスト
- **ツール**: Playwright または Cypress

### Integration Testing
- **WebWorker統合**: Game.tsx に基本テスト実装済み
- **IndexedDB統合**: 未実装

---

## Migration Path to Backend

### Current: Frontend-Only Architecture
```
Frontend → IndexedDB (ローカルストレージ)
Frontend → WebWorker → WASM (コアロジック)
```

### Future: Backend Integration
```
Frontend → Backend API (REST/WebSocket)
Backend → PostgreSQL + Neo4j
Backend → WASM (サーバーサイドロジック)
```

### Event Sourcing Migration
- ローカルイベント → バックエンドイベントストリーム同期
- 競合解決: イベントタイムスタンプベース
- オフラインファースト維持

---

## Development Workflow

### Component Development
1. packages/ui でコンポーネント実装
2. Storybookで動作確認
3. packages/frontend でページ統合

### Page Development
1. pages/ にページコンポーネント作成
2. main.tsx にルート追加
3. 必要に応じてservices/ に統合ロジック追加

### Testing
1. Storybook起動: `cd packages/ui && bun run storybook`
2. Frontend起動: `cd packages/frontend && bun run dev`
3. 動作確認: `http://localhost:5173`

---

## Implementation Status Summary

### ✅ 完了
- Routing基盤 (React Router v7)
- Home, Sessions, CreateSession ページ
- SessionCard, SessionList, CreateSessionForm コンポーネント
- WebWorker統合サービス
- IndexedDB Event Store基盤
- Tailwind CSS スタイリング

### 🚧 一部完了
- Sessions ページ (プレイヤー管理UI、IndexedDB統合が未完了)
- CreateSession ページ (IndexedDB保存が未完了)

### ❌ 未実装
- Game ページ (ゲームプレイUI)
- Scenario ページ
- Characters ページ
- プレイヤー管理UI
- IndexedDB統合 (セッション一覧取得・保存)
- クロスタブ同期UI
- 状態管理 (Zustand + React Query)
- E2Eテスト

---

## Next Steps

### 短期 (タスク20完了)
1. プレイヤー管理UIコンポーネント実装
2. IndexedDB統合 (セッション保存・取得)
3. BroadcastChannel統合 (セッション一覧の自動更新)

### 中期 (タスク21-23)
1. キャラクター管理UIページ実装
2. ゲームプレイUIページ実装
3. シナリオエディターUI実装

### 長期 (タスク24-26)
1. クロスタブ同期完全実装
2. Zustand + React Query 状態管理移行
3. E2Eテスト完全実装

---

**このドキュメントは、フロントエンド実装の進捗に応じて継続的に更新されます。**
