# デザインシステム

非同期TRPG風ゲーム「遺跡漁りとドブさらい」のデザインシステムドキュメント

## 概要

このデザインシステムは、一貫性のあるユーザー体験を提供するための基盤を定義します。全てのUIコンポーネントはこのシステムに従って設計されています。

---

## カラーパレット

### プライマリカラー

```css
/* ブランドカラー */
--color-primary: #3b82f6;      /* Blue 500 */
--color-primary-hover: #2563eb; /* Blue 600 */
--color-primary-light: #93c5fd; /* Blue 300 */
--color-primary-dark: #1e40af;  /* Blue 700 */
```

### セカンダリカラー

```css
/* アクセントカラー */
--color-secondary: #64748b;       /* Slate 500 */
--color-secondary-hover: #475569; /* Slate 600 */
```

### セマンティックカラー

```css
/* 成功 */
--color-success: #10b981;      /* Green 500 */
--color-success-light: #d1fae5; /* Green 100 */

/* 警告 */
--color-warning: #f59e0b;      /* Amber 500 */
--color-warning-light: #fef3c7; /* Amber 100 */

/* エラー・危険 */
--color-danger: #ef4444;       /* Red 500 */
--color-danger-light: #fee2e2; /* Red 100 */

/* 情報 */
--color-info: #3b82f6;         /* Blue 500 */
--color-info-light: #dbeafe;   /* Blue 100 */
```

### ゲーム固有カラー

```css
/* カードタイプ */
--color-card-action: #3b82f6;      /* 青 - アクション */
--color-card-choice: #10b981;      /* 緑 - 選択肢 */
--color-card-possession: #8b5cf6;  /* 紫 - 所持品 */
--color-card-transition: #f97316;  /* オレンジ - シーン遷移 */
```

### ニュートラルカラー

```css
/* グレースケール */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;

/* 白黒 */
--color-white: #ffffff;
--color-black: #000000;
```

---

## タイポグラフィ

### フォントファミリー

```css
/* システムフォントスタック */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP",
             Roboto, "Helvetica Neue", Arial, sans-serif;

/* 等幅フォント（コード表示用） */
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
             Consolas, "Courier New", monospace;
```

### フォントサイズ

| サイズ | px値 | rem値 | 用途 |
|--------|------|-------|------|
| xs | 12px | 0.75rem | キャプション、バッジ |
| sm | 14px | 0.875rem | 補足テキスト、ラベル |
| base | 16px | 1rem | 本文テキスト |
| lg | 18px | 1.125rem | 強調テキスト |
| xl | 20px | 1.25rem | 小見出し |
| 2xl | 24px | 1.5rem | セクション見出し |
| 3xl | 30px | 1.875rem | ページタイトル |
| 4xl | 36px | 2.25rem | 大見出し |

### フォントウェイト

```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 行の高さ

```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

---

## スペーシング

8pxグリッドシステムを採用

| サイズ | px値 | rem値 | Tailwindクラス |
|--------|------|-------|----------------|
| 0 | 0px | 0 | p-0, m-0 |
| 1 | 4px | 0.25rem | p-1, m-1 |
| 2 | 8px | 0.5rem | p-2, m-2 |
| 3 | 12px | 0.75rem | p-3, m-3 |
| 4 | 16px | 1rem | p-4, m-4 |
| 5 | 20px | 1.25rem | p-5, m-5 |
| 6 | 24px | 1.5rem | p-6, m-6 |
| 8 | 32px | 2rem | p-8, m-8 |
| 10 | 40px | 2.5rem | p-10, m-10 |
| 12 | 48px | 3rem | p-12, m-12 |

### スペーシングの使い分け

- **xs (4px)**: アイコンとテキスト間、密なUI要素
- **sm (8px)**: フォーム要素間、カード内パディング
- **md (16px)**: セクション間、標準的なパディング
- **lg (24px)**: コンポーネント間、大きなマージン
- **xl (32px)**: ページレベルのセクション分割

---

## ボーダー

### 太さ

```css
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 4px;
```

### 角丸

```css
--border-radius-none: 0;
--border-radius-sm: 0.125rem;  /* 2px */
--border-radius-md: 0.375rem;  /* 6px */
--border-radius-lg: 0.5rem;    /* 8px */
--border-radius-xl: 0.75rem;   /* 12px */
--border-radius-full: 9999px;  /* 完全な円形 */
```

### 使い分け

- **none**: テーブル、リスト
- **sm**: バッジ、タグ
- **md**: ボタン、入力フィールド
- **lg**: カード、モーダル
- **xl**: 大きなコンテナ
- **full**: アバター、ピル型ボタン

---

## シャドウ

```css
/* ドロップシャドウ */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* インナーシャドウ */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

/* フォーカスリング */
--shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.5);
```

### 使い分け

- **sm**: ボタン、入力フィールド
- **md**: カード、ドロップダウン
- **lg**: モーダル、ポップオーバー
- **xl**: ダイアログ
- **2xl**: 最上位要素

---

## アニメーション

### トランジション

```css
/* デュレーション */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;

/* イージング */
--easing-linear: linear;
--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### アニメーション用途

| 用途 | デュレーション | イージング |
|------|----------------|------------|
| ホバー | 150ms | ease-out |
| フォーカス | 150ms | ease-out |
| モーダル表示 | 200ms | ease-in-out |
| スライド | 300ms | ease-in-out |
| フェード | 200ms | ease-in-out |

---

## ブレークポイント

レスポンシブデザインのブレークポイント

```css
/* Tailwind CSSデフォルト */
--breakpoint-sm: 640px;   /* モバイル（横） */
--breakpoint-md: 768px;   /* タブレット */
--breakpoint-lg: 1024px;  /* デスクトップ */
--breakpoint-xl: 1280px;  /* ワイドデスクトップ */
--breakpoint-2xl: 1536px; /* 超ワイド */
```

### デバイス対応

- **< 640px**: スマートフォン（縦）
- **640px - 768px**: スマートフォン（横）、小型タブレット
- **768px - 1024px**: タブレット
- **1024px - 1280px**: デスクトップ
- **> 1280px**: ワイドデスクトップ

---

## コンポーネントバリアント

### ボタン

| バリアント | 背景色 | テキスト色 | ボーダー | 用途 |
|------------|--------|------------|----------|------|
| primary | Blue 600 | White | なし | 主要アクション |
| secondary | Gray 200 | Gray 900 | なし | 二次アクション |
| outline | Transparent | Blue 600 | Blue 600 | 控えめなアクション |
| danger | Red 600 | White | なし | 危険な操作 |
| ghost | Transparent | Gray 700 | なし | 最小限のアクション |

### カード

| バリアント | 背景色 | ボーダー | シャドウ | 用途 |
|------------|--------|----------|----------|------|
| default | White | Gray 200 | sm | 標準カード |
| outlined | White | Gray 300 | なし | アウトライン強調 |
| elevated | White | なし | lg | 浮き上がり効果 |

---

## アイコンシステム

### サイズ

| サイズ | px値 | 用途 |
|--------|------|------|
| xs | 12px | バッジ内アイコン |
| sm | 16px | インラインアイコン |
| md | 20px | ボタンアイコン |
| lg | 24px | 見出しアイコン |
| xl | 32px | 大きなアイコン |
| 2xl | 48px | ヒーローアイコン |

### 推奨アイコンライブラリ

- **Heroicons**: https://heroicons.com/
- **Lucide Icons**: https://lucide.dev/

---

## アクセシビリティ

### コントラスト比

WCAG 2.1 レベルAA準拠

| テキストサイズ | 最小コントラスト比 |
|----------------|-------------------|
| 通常テキスト | 4.5:1 |
| 大きなテキスト（18px以上） | 3:1 |
| UIコンポーネント | 3:1 |

### フォーカス状態

全てのインタラクティブ要素にフォーカスリングを提供

```css
/* フォーカス時 */
.focusable:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### キーボードナビゲーション

- **Tab**: 次の要素へ
- **Shift+Tab**: 前の要素へ
- **Enter**: アクティブ化
- **Space**: チェックボックス/ラジオボタンの切り替え
- **ESC**: モーダル/ドロップダウンを閉じる
- **Arrow keys**: リスト/メニュー内移動

---

## ベストプラクティス

### 一貫性

- 同じ用途には同じコンポーネントを使用
- カラーパレットを逸脱しない
- スペーシングシステムを遵守

### レスポンシブデザイン

- モバイルファースト設計
- タッチターゲットは最低44x44px
- 横スクロールを避ける

### パフォーマンス

- 不要なアニメーションを避ける
- 大きな画像を最適化
- 必要なコンポーネントのみをインポート

### アクセシビリティ

- セマンティックHTMLを使用
- ARIA属性を適切に設定
- キーボード操作を確保
- 十分なコントラスト比を維持

---

## デザイントークン

Tailwind CSSを使用しているため、デザイントークンは`tailwind.config.js`で管理されています。

```js
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      // ...
    },
    spacing: {
      1: '4px',
      2: '8px',
      // ...
    },
    borderRadius: {
      sm: '2px',
      md: '6px',
      // ...
    }
  }
}
```

---

## 参考リンク

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

**Last Updated**: 2025-10-05
