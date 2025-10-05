# コンポーネントAPIリファレンス

全UIコンポーネントの詳細なAPIドキュメント

---

## レイアウトコンポーネント

### AppLayout

アプリケーション全体のレイアウト構造

#### Props

```typescript
interface AppLayoutProps {
  /** Header content */
  header?: React.ReactNode;
  /** Sidebar content */
  sidebar?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Whether sidebar is collapsed on mobile */
  sidebarCollapsed?: boolean;
  /** Callback when sidebar toggle is clicked */
  onSidebarToggle?: () => void;
}
```

#### 使用例

```tsx
<AppLayout
  header={<Header />}
  sidebar={<Navigation />}
  footer={<Footer />}
  sidebarCollapsed={false}
  onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
>
  <MainContent />
</AppLayout>
```

---

### Navigation

ナビゲーションメニュー

#### Props

```typescript
interface NavigationItem {
  /** Navigation item label */
  label: string;
  /** Navigation item path or href */
  href: string;
  /** Whether the item is currently active */
  active?: boolean;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional badge content */
  badge?: string | number;
}

interface NavigationProps {
  /** Navigation items */
  items: NavigationItem[];
  /** Callback when navigation item is clicked */
  onNavigate?: (href: string) => void;
  /** Orientation of navigation */
  orientation?: 'horizontal' | 'vertical';
  /** Visual variant */
  variant?: 'default' | 'pills' | 'underline';
}
```

#### 使用例

```tsx
<Navigation
  items={[
    { label: 'ホーム', href: '/', active: true, icon: '🏠' },
    { label: 'セッション', href: '/sessions', badge: 5 }
  ]}
  onNavigate={(href) => navigate(href)}
  orientation="horizontal"
  variant="pills"
/>
```

---

### Modal

汎用モーダルダイアログ

#### Props

```typescript
interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (typically action buttons) */
  footer?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
}
```

#### 機能

- **フォーカス管理**: モーダル表示時に自動フォーカス、閉じた時に元の要素に復帰
- **キーボード操作**: ESCキーで閉じる（オプション）
- **スクロールロック**: モーダル表示中はbodyスクロール無効化
- **アクセシビリティ**: `role="dialog"`, `aria-modal="true"`

#### 使用例

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="確認"
  size="md"
  closeOnBackdrop={true}
  closeOnEscape={true}
  footer={
    <div className="flex justify-end gap-2">
      <Button onClick={() => setIsOpen(false)}>キャンセル</Button>
      <Button variant="primary" onClick={handleConfirm}>確認</Button>
    </div>
  }
>
  <p>この操作を実行しますか？</p>
</Modal>
```

---

### Dialog

確認ダイアログ（Modalの簡易ラッパー）

#### Props

```typescript
interface DialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: React.ReactNode;
  /** Confirm button text */
  confirmText?: string; // デフォルト: '確認'
  /** Cancel button text */
  cancelText?: string; // デフォルト: 'キャンセル'
  /** Callback when confirm is clicked */
  onConfirm?: () => void;
  /** Dialog variant */
  variant?: 'info' | 'warning' | 'danger'; // デフォルト: 'info'
}
```

#### 使用例

```tsx
<Dialog
  isOpen={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  title="削除の確認"
  message="このアイテムを削除してもよろしいですか？この操作は取り消せません。"
  variant="danger"
  confirmText="削除"
  onConfirm={handleDelete}
/>
```

---

## 基本コンポーネント

### Button

アクション実行用ボタン

#### Props

```typescript
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Click handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
}
```

#### 使用例

```tsx
<Button
  variant="primary"
  size="medium"
  onClick={handleClick}
  disabled={isProcessing}
  loading={isLoading}
>
  実行
</Button>
```

---

### Card

コンテンツコンテナ

#### Props

```typescript
interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Click handler */
  onClick?: () => void;
  /** Hover effect */
  hoverable?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

#### 使用例

```tsx
<Card
  variant="elevated"
  padding="md"
  hoverable={true}
  onClick={() => navigate('/details')}
>
  <h3>カードタイトル</h3>
  <p>カードコンテンツ</p>
</Card>
```

---

## ゲームコンポーネント

### GameCard

ゲーム用カードコンポーネント

#### Props

```typescript
type CardType = 'action' | 'choice' | 'possession' | 'scene_transition';
type CardState = 'normal' | 'selected' | 'disabled' | 'used';

interface GameCardProps {
  /** Card name */
  name: string;
  /** Card type */
  cardType: CardType;
  /** Card description */
  description?: string;
  /** Card tags */
  tags?: string[];
  /** Card state */
  state?: CardState;
  /** Click handler */
  onClick?: () => void;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}
```

#### カードタイプの色分け

- `action`: 青（#3b82f6）
- `choice`: 緑（#10b981）
- `possession`: 紫（#8b5cf6）
- `scene_transition`: オレンジ（#f97316）

#### 使用例

```tsx
<GameCard
  name="探索アクション"
  cardType="action"
  description="周囲を詳しく探索する"
  tags={['探索', 'アクション']}
  state="normal"
  onClick={() => playCard(card)}
  size="medium"
/>
```

---

### DiceRoll

ダイス振りコンポーネント

#### Props

```typescript
type Advantage = 'normal' | 'advantage' | 'disadvantage';

interface DiceRollProps {
  /** Number of dice to roll */
  diceCount?: number; // デフォルト: 2
  /** Sides per die */
  diceSides?: number; // デフォルト: 6
  /** Modifier to add to total */
  modifier?: number;
  /** Dice roll results */
  result?: number[];
  /** Total result */
  total?: number;
  /** Whether dice are rolling */
  isRolling?: boolean;
  /** Roll callback */
  onRoll?: () => void;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Advantage/disadvantage */
  advantage?: Advantage;
}
```

#### 使用例

```tsx
<DiceRoll
  diceCount={2}
  diceSides={6}
  modifier={3}
  result={[4, 6]}
  total={13}
  isRolling={false}
  onRoll={handleRoll}
  advantage="advantage"
  size="large"
/>
```

---

### PlayerStatus

プレイヤー状態表示

#### Props

```typescript
interface PlayerStatusProps {
  /** Player name */
  name: string;
  /** Player tags */
  tags?: string[];
  /** Number of cards */
  cards?: number;
  /** Whether player is active */
  isActive?: boolean;
  /** Click handler */
  onClick?: () => void;
}
```

#### 使用例

```tsx
<PlayerStatus
  name="冒険者アリス"
  tags={['勇敢', '機敏']}
  cards={8}
  isActive={true}
  onClick={() => selectPlayer(player)}
/>
```

---

## 状態表示コンポーネント

### LoadingSpinner

ローディングインジケーター

#### Props

```typescript
interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional loading message */
  message?: string;
  /** Whether to show as fullscreen overlay */
  fullscreen?: boolean;
}
```

#### 使用例

```tsx
<LoadingSpinner
  size="lg"
  message="データを読み込んでいます..."
  fullscreen={true}
/>
```

---

### ErrorMessage

エラーメッセージ表示

#### Props

```typescript
type ErrorVariant = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  /** Error title */
  title?: string; // デフォルト: 'エラー'
  /** Error message */
  message: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Variant */
  variant?: ErrorVariant; // デフォルト: 'error'
}
```

#### 使用例

```tsx
<ErrorMessage
  title="読み込みエラー"
  message="データの読み込みに失敗しました。ネットワーク接続を確認してください。"
  variant="error"
  onRetry={() => refetch()}
  onDismiss={() => setError(null)}
/>
```

---

### EmptyState

空状態表示

#### Props

```typescript
interface EmptyStateProps {
  /** Icon or illustration */
  icon?: React.ReactNode;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

#### 使用例

```tsx
<EmptyState
  icon="📭"
  title="セッションがありません"
  description="新しいセッションを作成して冒険を始めましょう。"
  action={{
    label: 'セッションを作成',
    onClick: () => navigate('/sessions/new')
  }}
/>
```

---

## フォームコンポーネント

### CreateSessionForm

セッション作成フォーム

#### Props

```typescript
interface ScenarioOption {
  id: string;
  title: string;
}

interface CreateSessionFormData {
  title: string;
  scenarioId: string;
  maxPlayers: number;
}

interface CreateSessionFormProps {
  /** Available scenarios */
  scenarios: ScenarioOption[];
  /** Submit callback */
  onSubmit: (data: CreateSessionFormData) => void;
  /** Cancel callback */
  onCancel: () => void;
}
```

#### 使用例

```tsx
<CreateSessionForm
  scenarios={[
    { id: '1', title: '森の遺跡' },
    { id: '2', title: '古代の塔' }
  ]}
  onSubmit={(data) => createSession(data)}
  onCancel={() => navigate('/sessions')}
/>
```

---

### CreateCharacterForm

キャラクター作成フォーム

#### Props

```typescript
interface CreateCharacterFormData {
  name: string;
  tags: string[];
}

interface CreateCharacterFormProps {
  /** Submit callback */
  onSubmit: (data: CreateCharacterFormData) => void;
  /** Cancel callback */
  onCancel: () => void;
}
```

#### 使用例

```tsx
<CreateCharacterForm
  onSubmit={(data) => createCharacter(data)}
  onCancel={() => navigate('/characters')}
/>
```

---

### CreateScenarioForm

シナリオ作成フォーム

#### Props

```typescript
interface CreateScenarioFormData {
  title: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
}

interface CreateScenarioFormProps {
  /** Submit callback */
  onSubmit: (data: CreateScenarioFormData) => void;
  /** Cancel callback */
  onCancel: () => void;
}
```

#### 使用例

```tsx
<CreateScenarioForm
  onSubmit={(data) => createScenario(data)}
  onCancel={() => navigate('/scenarios')}
/>
```

---

## シナリオエディターコンポーネント

### ScenarioEditorCanvas

React Flowベースのビジュアルエディター

#### Props

```typescript
interface SceneNodeData {
  id: string;
  title: string;
  description?: string;
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface ScenarioEditorCanvasProps {
  /** Initial scenes */
  initialScenes?: SceneNodeData[];
  /** Initial edges */
  initialEdges?: EdgeData[];
  /** Save callback */
  onSave?: (scenes: SceneNodeData[], edges: EdgeData[]) => void;
}
```

#### 使用例

```tsx
<ScenarioEditorCanvas
  initialScenes={[
    { id: '1', title: '開始シーン', description: '冒険の始まり' }
  ]}
  initialEdges={[]}
  onSave={(scenes, edges) => saveScenario(scenes, edges)}
/>
```

---

## リストコンポーネント

### SessionList

セッション一覧表示

#### Props

```typescript
interface SessionCardProps {
  id: string;
  title: string;
  scenarioTitle: string;
  currentPlayers: number;
  maxPlayers: number;
  status: 'recruiting' | 'in_progress' | 'completed';
}

interface SessionListProps {
  /** Sessions to display */
  sessions: SessionCardProps[];
  /** Session click callback */
  onSessionClick?: (sessionId: string) => void;
  /** Join session callback */
  onJoinSession?: (sessionId: string) => void;
}
```

#### 使用例

```tsx
<SessionList
  sessions={sessionList}
  onSessionClick={(id) => navigate(`/sessions/${id}`)}
  onJoinSession={(id) => joinSession(id)}
/>
```

---

## ベストプラクティス

### Props設計

1. **必須propsを最小限に**: デフォルト値を活用
2. **callback関数はオプショナル**: onClickなどはundefined許容
3. **childrenを活用**: 柔軟なコンテンツ配置

### 型安全性

```tsx
// ✅ Good: String unionで型安全
variant?: 'primary' | 'secondary' | 'outline';

// ❌ Bad: 文字列で型安全性なし
variant?: string;
```

### アクセシビリティ

```tsx
// ✅ Good: aria-labelでスクリーンリーダー対応
<button onClick={handleClick} aria-label="メニューを開く">
  ☰
</button>

// ❌ Bad: aria-labelなし
<button onClick={handleClick}>☰</button>
```

---

**Last Updated**: 2025-10-05
