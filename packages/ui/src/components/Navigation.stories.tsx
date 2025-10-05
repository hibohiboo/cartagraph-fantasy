import { useState } from 'react';
import { Navigation } from './Navigation';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Navigation',
  component: Navigation,
  tags: ['autodocs'],
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  { label: 'ホーム', href: '/' },
  { label: 'セッション', href: '/sessions' },
  { label: 'キャラクター', href: '/characters' },
  { label: 'シナリオ', href: '/scenarios' },
];

const itemsWithIcons = [
  { label: 'ホーム', href: '/', icon: '🏠' },
  { label: 'セッション', href: '/sessions', icon: '🎲' },
  { label: 'キャラクター', href: '/characters', icon: '👤' },
  { label: 'シナリオ', href: '/scenarios', icon: '📖' },
];

const itemsWithBadges = [
  { label: 'ホーム', href: '/' },
  { label: 'セッション', href: '/sessions', badge: 5 },
  { label: 'キャラクター', href: '/characters', badge: 12 },
  { label: 'シナリオ', href: '/scenarios', badge: 'NEW' },
];

export const HorizontalDefault: Story = {
  args: {
    items: sampleItems.map((item, i) => ({ ...item, active: i === 0 })),
    orientation: 'horizontal',
    variant: 'default',
  },
};

export const HorizontalPills: Story = {
  args: {
    items: sampleItems.map((item, i) => ({ ...item, active: i === 1 })),
    orientation: 'horizontal',
    variant: 'pills',
  },
};

export const HorizontalUnderline: Story = {
  args: {
    items: sampleItems.map((item, i) => ({ ...item, active: i === 2 })),
    orientation: 'horizontal',
    variant: 'underline',
  },
};

export const VerticalDefault: Story = {
  args: {
    items: sampleItems.map((item, i) => ({ ...item, active: i === 0 })),
    orientation: 'vertical',
    variant: 'default',
  },
};

export const VerticalPills: Story = {
  args: {
    items: sampleItems.map((item, i) => ({ ...item, active: i === 1 })),
    orientation: 'vertical',
    variant: 'pills',
  },
};

export const WithIcons: Story = {
  args: {
    items: itemsWithIcons.map((item, i) => ({ ...item, active: i === 1 })),
    orientation: 'horizontal',
    variant: 'default',
  },
};

export const WithBadges: Story = {
  args: {
    items: itemsWithBadges.map((item, i) => ({ ...item, active: i === 0 })),
    orientation: 'vertical',
    variant: 'default',
  },
};

const InteractiveComponent = () => {
  const [activeHref, setActiveHref] = useState('/');

  return (
    <Navigation
      items={sampleItems.map((item) => ({
        ...item,
        active: item.href === activeHref,
      }))}
      onNavigate={(href) => setActiveHref(href)}
      orientation="horizontal"
      variant="pills"
    />
  );
};

export const Interactive = () => <InteractiveComponent />;

const ComplexNavigationComponent = () => {
  const [activeHref, setActiveHref] = useState('/sessions');

  const complexItems = [
    { label: 'ホーム', href: '/', icon: '🏠' },
    { label: 'セッション', href: '/sessions', icon: '🎲', badge: 3 },
    { label: 'キャラクター', href: '/characters', icon: '👤', badge: 8 },
    { label: 'シナリオ', href: '/scenarios', icon: '📖', badge: 'NEW' },
    { label: '設定', href: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold mb-2">水平型 - Pills</h3>
        <Navigation
          items={complexItems.map((item) => ({
            ...item,
            active: item.href === activeHref,
          }))}
          onNavigate={(href) => setActiveHref(href)}
          orientation="horizontal"
          variant="pills"
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">垂直型 - Default</h3>
        <Navigation
          items={complexItems.map((item) => ({
            ...item,
            active: item.href === activeHref,
          }))}
          onNavigate={(href) => setActiveHref(href)}
          orientation="vertical"
          variant="default"
        />
      </div>
    </div>
  );
};

export const ComplexNavigation = () => <ComplexNavigationComponent />;
