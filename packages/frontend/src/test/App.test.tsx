import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App';

// テスト用のクエリクライアント
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// テストラッパー
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe('App Component', () => {
  it('should render navigation', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(screen.getByText('遺跡漁りとドブさらい')).toBeInTheDocument();
    expect(screen.getByText('ホーム')).toBeInTheDocument();
    expect(screen.getByText('ゲーム')).toBeInTheDocument();
    expect(screen.getByText('シナリオ')).toBeInTheDocument();
  });

  it('should have main content area', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});