import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navigation from '../components/Navigation';
import { MemoryRouter } from 'react-router-dom';

describe('Basic Component Tests', () => {
  it('should render Navigation component', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByText('遺跡漁りとドブさらい')).toBeInTheDocument();
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('ゲーム')).toBeInTheDocument();
    expect(screen.getByText('シナリオ')).toBeInTheDocument();
  });

  it('should render Home page content', async () => {
    const Home = (await import('../pages/Home')).default;

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('遺跡漁りとドブさらい')).toBeInTheDocument();
    expect(screen.getByText('非同期TRPGスタイルWebゲーム')).toBeInTheDocument();
  });
});