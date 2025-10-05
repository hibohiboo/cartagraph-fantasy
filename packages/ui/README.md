# @cartagraph-fantasy/ui

非同期TRPG風ゲーム「遺跡漁りとドブさらい」のUIコンポーネントライブラリ

## 概要

このパッケージは、React 19 + TypeScript + Tailwind CSSで構築された再利用可能なUIコンポーネントを提供します。全コンポーネントはStorybookでドキュメント化されており、アクセシビリティとレスポンシブデザインを重視しています。

## インストール

```bash
# モノレポ内で使用
bun install
```

## 使用方法

### 基本的な使い方

```tsx
import { Button, Card, Modal } from '@cartagraph-fantasy/ui';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        モーダルを開く
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="確認"
      >
        <p>モーダルコンテンツ</p>
      </Modal>
    </div>
  );
}
```

## コンポーネント一覧

### レイアウトコンポーネント

#### AppLayout
アプリケーション全体のレイアウト構造を提供

```tsx
<AppLayout
  header={<Header />}
  sidebar={<Sidebar />}
  footer={<Footer />}
>
  <MainContent />
</AppLayout>
```

**主な機能**:
- レスポンシブデザイン（モバイル/タブレット/デスクトップ）
- サイドバー折りたたみ機能
- Sticky header対応

#### Navigation
ナビゲーションメニュー

```tsx
<Navigation
  items={[
    { label: 'ホーム', href: '/', active: true },
    { label: 'セッション', href: '/sessions', badge: 5 }
  ]}
  orientation="horizontal"
  variant="pills"
/>
```

**バリアント**: `default` | `pills` | `underline`
**レイアウト**: `horizontal` | `vertical`

#### Modal & Dialog
アクセシブルなモーダルダイアログ

```tsx
// 汎用モーダル
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="タイトル"
  size="md"
  footer={<ActionButtons />}
>
  <Content />
</Modal>

// 確認ダイアログ
<Dialog
  isOpen={isOpen}
  onClose={onClose}
  title="削除の確認"
  message="本当に削除しますか？"
  variant="danger"
  onConfirm={handleDelete}
/>
```

**サイズ**: `sm` | `md` | `lg` | `xl`
**バリアント**: `info` | `warning` | `danger`

---

### 基本コンポーネント

#### Button
アクション実行用ボタン

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  実行
</Button>
```

**バリアント**: `primary` | `secondary` | `outline`
**サイズ**: `small` | `medium` | `large`

#### Card
コンテンツコンテナ

```tsx
<Card variant="default" padding="md">
  <CardContent />
</Card>
```

**バリアント**: `default` | `outlined` | `elevated`

---

### ゲームコンポーネント

#### GameCard
ゲーム用カードコンポーネント

```tsx
<GameCard
  name="探索アクション"
  cardType="action"
  description="周囲を探索する"
  tags={['探索', 'アクション']}
  state="normal"
  onClick={handleCardClick}
/>
```

**カードタイプ**: `action` | `choice` | `possession` | `scene_transition`
**状態**: `normal` | `selected` | `disabled` | `used`

#### DiceRoll
ダイス振りコンポーネント

```tsx
<DiceRoll
  diceCount={2}
  diceSides={6}
  modifier={2}
  result={[4, 6]}
  total={12}
  advantage="advantage"
  onRoll={handleRoll}
/>
```

**有利/不利**: `normal` | `advantage` | `disadvantage`

#### PlayerStatus
プレイヤー状態表示

```tsx
<PlayerStatus
  name="冒険者アリス"
  tags={['勇敢', '機敏']}
  cards={5}
  isActive={true}
/>
```

---

### フォームコンポーネント

#### CreateSessionForm
セッション作成フォーム

```tsx
<CreateSessionForm
  scenarios={scenarioList}
  onSubmit={handleCreateSession}
  onCancel={handleCancel}
/>
```

#### CreateCharacterForm
キャラクター作成フォーム

```tsx
<CreateCharacterForm
  onSubmit={handleCreateCharacter}
  onCancel={handleCancel}
/>
```

#### CreateScenarioForm
シナリオ作成フォーム

```tsx
<CreateScenarioForm
  onSubmit={handleCreateScenario}
  onCancel={handleCancel}
/>
```

---

### シナリオエディターコンポーネント

#### ScenarioEditorCanvas
React Flowベースのビジュアルエディター

```tsx
<ScenarioEditorCanvas
  initialScenes={scenes}
  initialEdges={edges}
  onSave={handleSave}
/>
```

**主な機能**:
- ドラッグ&ドロップでシーン配置
- シーン間の接続管理
- リアルタイム検証
- プレビューモード

#### SceneEditForm
シーン編集フォーム

```tsx
<SceneEditForm
  scene={sceneData}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

#### ScenarioValidator
シナリオ検証結果表示

```tsx
<ScenarioValidator
  messages={validationMessages}
  onClose={handleClose}
/>
```

---

### 状態表示コンポーネント

#### LoadingSpinner
ローディングインジケーター

```tsx
<LoadingSpinner
  size="md"
  message="データを読み込んでいます..."
  fullscreen={false}
/>
```

**サイズ**: `sm` | `md` | `lg`

#### ErrorMessage
エラーメッセージ表示

```tsx
<ErrorMessage
  title="エラー"
  message="データの読み込みに失敗しました"
  variant="error"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

**バリアント**: `error` | `warning` | `info`

#### EmptyState
空状態表示

```tsx
<EmptyState
  icon="📭"
  title="データがありません"
  description="新しいデータを作成してください"
  action={{
    label: '新規作成',
    onClick: handleCreate
  }}
/>
```

---

### リストコンポーネント

#### SessionList / SessionCard
セッション一覧とカード

```tsx
<SessionList
  sessions={sessions}
  onSessionClick={handleSessionClick}
  onJoinSession={handleJoin}
/>
```

#### ScenarioList / ScenarioCard
シナリオ一覧とカード

```tsx
<ScenarioList
  scenarios={scenarios}
  onScenarioClick={handleScenarioClick}
  onEditScenario={handleEdit}
/>
```

#### CharacterCard
キャラクターカード

```tsx
<CharacterCard
  name="冒険者アリス"
  tags={['勇敢', '機敏']}
  cards={12}
  sessions={3}
  onClick={handleClick}
/>
```

---

## スタイリング

### Tailwind CSS

全コンポーネントはTailwind CSSを使用しています。カスタムテーマを適用する場合は、`tailwind.config.js`を編集してください。

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      }
    }
  }
}
```

### カスタムスタイル

コンポーネントに追加のクラスを適用する場合:

```tsx
<Button className="mt-4 shadow-lg">
  カスタムスタイル
</Button>
```

---

## アクセシビリティ

全コンポーネントはWCAG 2.1レベルAAに準拠しています。

### 主な機能

- **キーボードナビゲーション**: Tab、Shift+Tab、Enter、ESCキー対応
- **ARIA属性**: role, aria-label, aria-describedby等を適切に設定
- **フォーカス管理**: モーダルのフォーカストラップ
- **スクリーンリーダー対応**: 適切なセマンティックHTML

### ベストプラクティス

```tsx
// ✅ Good: ARIA属性とキーボード対応
<button
  onClick={handleClick}
  aria-label="メニューを開く"
  aria-expanded={isOpen}
>
  ☰
</button>

// ❌ Bad: aria-label なし
<button onClick={handleClick}>
  ☰
</button>
```

---

## パフォーマンス

### コード分割

コンポーネントは個別にインポート可能です:

```tsx
// ✅ Good: 必要なコンポーネントのみインポート
import { Button } from '@cartagraph-fantasy/ui';

// ❌ Avoid: 全コンポーネントをインポート
import * as UI from '@cartagraph-fantasy/ui';
```

### メモ化

パフォーマンスが重要な場合はReact.memoを使用:

```tsx
import { memo } from 'react';
import { GameCard } from '@cartagraph-fantasy/ui';

const MemoizedGameCard = memo(GameCard);
```

### 推奨事項

- **仮想スクロール**: 大量のリストを表示する場合はreact-windowを検討
- **遅延ローディング**: React.lazyでコンポーネントを遅延読み込み
- **イベントハンドラー**: useCallbackでメモ化

---

## 開発

### Storybookの起動

```bash
cd packages/ui
bun run storybook
```

http://localhost:6006 でStorybookが起動します。

### テストの実行

```bash
bun run lint        # ESLint
bun run typecheck   # TypeScript型チェック
```

### ビルド

```bash
bun run build       # コンポーネントライブラリビルド
bun run build-storybook  # Storybookビルド
```

---

## コントリビューション

### 新しいコンポーネントの追加

1. **コンポーネント作成**: `src/components/YourComponent.tsx`
2. **Props定義**: TypeScript interfaceをexport
3. **Storybookストーリー作成**: `src/components/YourComponent.stories.tsx`
4. **エクスポート追加**: `src/index.ts`

### コーディング規約

- **命名**: PascalCaseでコンポーネント名、camelCaseでprops
- **Props**: 全propsにJSDocコメント
- **バリアント**: string unionで型安全に
- **デフォルト値**: propsのデフォルト値を明示

例:
```tsx
export interface ButtonProps {
  /** ボタンのラベル */
  children: React.ReactNode;
  /** ボタンのバリアント */
  variant?: 'primary' | 'secondary' | 'outline';
  /** クリック時のコールバック */
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
}) => {
  // 実装
};
```

---

## ライセンス

MIT

---

## リンク

- [Storybook](http://localhost:6006)
- [プロジェクトドキュメント](../../specs/001-web-trpg-trpg/frontend-design.md)
- [GitHub](https://github.com/your-org/cartagraph-fantasy)

---

**Last Updated**: 2025-10-05
