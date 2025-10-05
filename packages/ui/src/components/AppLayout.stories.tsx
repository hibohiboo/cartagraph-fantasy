import { useState } from 'react';
import { AppLayout } from './AppLayout';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample components for demonstration
const SampleHeader = () => (
  <div className="flex items-center justify-between">
    <h1 className="text-xl font-bold text-gray-900">遺跡漁りとドブさらい</h1>
    <div className="flex gap-2">
      <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
        ログイン
      </button>
    </div>
  </div>
);

const SampleSidebar = () => (
  <nav>
    <ul className="space-y-2">
      <li>
        <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">
          ホーム
        </a>
      </li>
      <li>
        <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">
          セッション一覧
        </a>
      </li>
      <li>
        <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">
          キャラクター一覧
        </a>
      </li>
      <li>
        <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">
          シナリオ一覧
        </a>
      </li>
    </ul>
  </nav>
);

const SampleFooter = () => (
  <div className="text-center text-sm text-gray-600">
    © 2025 遺跡漁りとドブさらい
  </div>
);

const SampleContent = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">メインコンテンツ</h2>
    <p className="text-gray-700">
      ここにメインコンテンツが表示されます。
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-2">カード {i}</h3>
          <p className="text-sm text-gray-600">サンプルコンテンツ</p>
        </div>
      ))}
    </div>
  </div>
);

export const Default: Story = {
  args: {
    header: <SampleHeader />,
    sidebar: <SampleSidebar />,
    children: <SampleContent />,
    footer: <SampleFooter />,
  },
};

export const WithoutSidebar: Story = {
  args: {
    header: <SampleHeader />,
    children: <SampleContent />,
    footer: <SampleFooter />,
  },
};

export const WithoutHeader: Story = {
  args: {
    sidebar: <SampleSidebar />,
    children: <SampleContent />,
    footer: <SampleFooter />,
  },
};

export const WithoutFooter: Story = {
  args: {
    header: <SampleHeader />,
    sidebar: <SampleSidebar />,
    children: <SampleContent />,
  },
};

export const MinimalLayout: Story = {
  args: {
    children: <SampleContent />,
  },
};

const InteractiveSidebarComponent = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AppLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="lg:hidden px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              aria-label="メニューを開く"
            >
              ☰ メニュー
            </button>
            <h1 className="text-xl font-bold text-gray-900">遺跡漁りとドブさらい</h1>
          </div>
        </div>
      }
      sidebar={<SampleSidebar />}
      sidebarCollapsed={collapsed}
      onSidebarToggle={() => setCollapsed(!collapsed)}
      footer={<SampleFooter />}
    >
      <SampleContent />
    </AppLayout>
  );
};

export const InteractiveSidebar = () => <InteractiveSidebarComponent />;

export const LongContent: Story = {
  args: {
    header: <SampleHeader />,
    sidebar: <SampleSidebar />,
    footer: <SampleFooter />,
    children: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">スクロール可能なコンテンツ</h2>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">セクション {i + 1}</h3>
            <p className="text-sm text-gray-600">
              長いコンテンツのサンプルです。ページ全体がスクロール可能になります。
            </p>
          </div>
        ))}
      </div>
    ),
  },
};
