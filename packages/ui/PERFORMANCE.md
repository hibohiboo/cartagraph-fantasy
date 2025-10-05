# パフォーマンスガイドライン

UIコンポーネントライブラリのパフォーマンス最適化ガイド

## 概要

このドキュメントは、`@cartagraph-fantasy/ui`コンポーネントライブラリを使用する際のパフォーマンス最適化のベストプラクティスを提供します。

---

## バンドルサイズ最適化

### Tree Shaking

必要なコンポーネントのみをインポート:

```tsx
// ✅ Good: 必要なコンポーネントのみ
import { Button, Modal } from '@cartagraph-fantasy/ui';

// ❌ Bad: 全てをインポート
import * as UI from '@cartagraph-fantasy/ui';
```

### コード分割

React.lazyで大きなコンポーネントを遅延ロード:

```tsx
import { lazy, Suspense } from 'react';

// シナリオエディターは大きいので遅延ロード
const ScenarioEditorCanvas = lazy(() =>
  import('@cartagraph-fantasy/ui').then(m => ({ default: m.ScenarioEditorCanvas }))
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ScenarioEditorCanvas />
    </Suspense>
  );
}
```

### バンドルサイズの目安

| コンポーネント | gzip後サイズ | 備考 |
|----------------|--------------|------|
| Button | ~1KB | 基本コンポーネント |
| Modal | ~3KB | フォーカス管理含む |
| ScenarioEditorCanvas | ~50KB+ | React Flow依存 |

---

## レンダリング最適化

### React.memo

高頻度で更新される親の下にある静的コンポーネントをメモ化:

```tsx
import { memo } from 'react';
import { GameCard } from '@cartagraph-fantasy/ui';

// ✅ Good: カードリストで親が頻繁に更新される場合
const MemoizedGameCard = memo(GameCard);

function CardList({ cards }) {
  return cards.map(card => (
    <MemoizedGameCard key={card.id} {...card} />
  ));
}
```

### useCallback / useMemo

イベントハンドラーと計算結果をメモ化:

```tsx
import { useCallback, useMemo } from 'react';
import { SessionList } from '@cartagraph-fantasy/ui';

function Sessions({ sessions }) {
  // ✅ Good: ハンドラーをメモ化
  const handleSessionClick = useCallback((id: string) => {
    navigate(`/sessions/${id}`);
  }, [navigate]);

  // ✅ Good: フィルタリング結果をメモ化
  const activeSessions = useMemo(() =>
    sessions.filter(s => s.status === 'in_progress'),
    [sessions]
  );

  return (
    <SessionList
      sessions={activeSessions}
      onSessionClick={handleSessionClick}
    />
  );
}
```

### 仮想スクロール

大量のリストを表示する場合は`react-window`を使用:

```tsx
import { FixedSizeList } from 'react-window';
import { SessionCard } from '@cartagraph-fantasy/ui';

function VirtualSessionList({ sessions }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={sessions.length}
      itemSize={120}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <SessionCard {...sessions[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## 状態管理の最適化

### ローカル vs グローバル状態

```tsx
// ✅ Good: UIの状態はローカルで管理
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {/* ... */}
    </Modal>
  );
}

// ❌ Bad: 不要なグローバル状態
const globalStore = create((set) => ({
  modalOpen: false,
  setModalOpen: (open) => set({ modalOpen: open })
}));
```

### 状態の分割

大きな状態オブジェクトを分割して不要な再レンダリングを防ぐ:

```tsx
// ✅ Good: 状態を分割
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

// ❌ Bad: 全てを1つの状態に
const [state, setState] = useState({
  formData: {},
  errors: {},
  loading: false,
  // ...
});
```

---

## アニメーションのパフォーマンス

### CSS Transitionsを優先

JavaScriptアニメーションよりCSS transitionsを使用:

```tsx
// ✅ Good: CSS transition
<div className="transition-all duration-200 hover:scale-105">
  <Card />
</div>

// ❌ Bad: JavaScript animation（必要な場合を除く）
<motion.div animate={{ scale: 1.05 }}>
  <Card />
</motion.div>
```

### transform/opacityを使用

`transform`と`opacity`はGPUアクセラレーションされ、高速:

```css
/* ✅ Good */
.animate-slide {
  transform: translateX(100px);
  transition: transform 300ms;
}

/* ❌ Avoid */
.animate-slide {
  left: 100px;
  transition: left 300ms;
}
```

### will-changeの慎重な使用

```css
/* ✅ Good: アニメーション直前に適用 */
.modal-entering {
  will-change: transform, opacity;
}

/* ❌ Bad: 常時適用 */
.modal {
  will-change: transform, opacity;
}
```

---

## 画像最適化

### 適切なフォーマット

- **WebP**: モダンブラウザ向け（サイズ30%削減）
- **AVIF**: 次世代フォーマット（さらに20%削減）
- **JPEG/PNG**: フォールバック

### レスポンシブ画像

```tsx
<img
  src="/image.jpg"
  srcSet="
    /image-320w.jpg 320w,
    /image-640w.jpg 640w,
    /image-1280w.jpg 1280w
  "
  sizes="(max-width: 640px) 100vw, 640px"
  alt="説明"
  loading="lazy"
/>
```

### 遅延ローディング

```tsx
// ✅ Good: 画像を遅延ロード
<img src="/image.jpg" loading="lazy" alt="説明" />

// ✅ Better: Intersection Observer
import { useInView } from 'react-intersection-observer';

function LazyImage({ src, alt }) {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <div ref={ref}>
      {inView && <img src={src} alt={alt} />}
    </div>
  );
}
```

---

## イベントハンドラーの最適化

### Passive Event Listeners

スクロールイベント等でパフォーマンス向上:

```tsx
useEffect(() => {
  const handleScroll = () => {
    // スクロール処理
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### Debounce / Throttle

高頻度イベントを制御:

```tsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

function SearchInput({ onSearch }) {
  // ✅ Good: 入力を300msデバウンス
  const debouncedSearch = useMemo(
    () => debounce(onSearch, 300),
    [onSearch]
  );

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

---

## データフェッチングの最適化

### React Query / SWR

キャッシュとバックグラウンド更新:

```tsx
import { useQuery } from '@tanstack/react-query';

function Sessions() {
  const { data, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });

  if (isLoading) return <LoadingSpinner />;

  return <SessionList sessions={data} />;
}
```

### Prefetching

ユーザーアクション前にデータをプリフェッチ:

```tsx
import { useQueryClient } from '@tanstack/react-query';

function SessionCard({ session }) {
  const queryClient = useQueryClient();

  // ✅ Good: ホバー時にプリフェッチ
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['session', session.id],
      queryFn: () => fetchSession(session.id),
    });
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      <SessionCard {...session} />
    </div>
  );
}
```

---

## パフォーマンス測定

### React DevTools Profiler

コンポーネントの再レンダリングを可視化:

1. React DevTools拡張をインストール
2. Profilerタブを開く
3. 記録開始してアクションを実行
4. フレームグラフで重いコンポーネントを特定

### Web Vitals

Core Web Vitalsを測定:

```tsx
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS(console.log);  // Cumulative Layout Shift
onFID(console.log);  // First Input Delay
onLCP(console.log);  // Largest Contentful Paint
```

### Performance API

```tsx
// マーク開始
performance.mark('component-render-start');

// コンポーネント処理

// マーク終了と測定
performance.mark('component-render-end');
performance.measure(
  'component-render',
  'component-render-start',
  'component-render-end'
);

// 結果表示
const measure = performance.getEntriesByName('component-render')[0];
console.log(`Render time: ${measure.duration}ms`);
```

---

## チェックリスト

### 開発時

- [ ] 必要なコンポーネントのみインポート
- [ ] React.memoで静的コンポーネントをメモ化
- [ ] useCallback/useMemoでハンドラーと計算をメモ化
- [ ] 大きなリストには仮想スクロール
- [ ] CSS transitionsを優先

### ビルド時

- [ ] バンドルサイズを確認（`bun run build --analyze`）
- [ ] Tree shakingが機能していることを確認
- [ ] コード分割が適切に行われているか確認

### 本番環境

- [ ] 画像を最適化（WebP/AVIF）
- [ ] React DevTools Profilerで測定
- [ ] Lighthouseスコア90+を目標
- [ ] Core Web Vitals基準をクリア

---

## ベンチマーク目標

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| 初回描画 | < 1.5s | Lighthouse FCP |
| Time to Interactive | < 3.5s | Lighthouse TTI |
| バンドルサイズ | < 200KB (gzip) | webpack-bundle-analyzer |
| コンポーネント再レンダリング | < 16ms | React Profiler |
| スクロールパフォーマンス | 60fps | Performance monitor |

---

## トラブルシューティング

### 問題: モーダルが重い

**原因**: 大きなコンテンツの再レンダリング

**解決策**:
```tsx
// モーダルコンテンツをメモ化
const ModalContent = memo(() => {
  // 重い処理
  return <ComplexContent />;
});

<Modal isOpen={isOpen} onClose={onClose}>
  <ModalContent />
</Modal>
```

### 問題: リストスクロールがカクつく

**原因**: 多数の要素を一度にレンダリング

**解決策**: react-windowで仮想スクロール

### 問題: 画像が遅い

**原因**: 大きな画像、最適化なし

**解決策**:
1. WebP/AVIFに変換
2. `loading="lazy"`を追加
3. srcSetでレスポンシブ画像

---

## 参考リンク

- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [React Window](https://react-window.vercel.app/)
- [TanStack Query](https://tanstack.com/query/)

---

**Last Updated**: 2025-10-05
