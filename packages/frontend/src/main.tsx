import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ページコンポーネント
import App from './App';
import Home from './pages/Home';
import Game from './pages/Game';
import Scenario from './pages/Scenario';

// Reactクエリクライアント
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// React Router v7設定
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'game/:sessionId?',
        element: <Game />,
      },
      {
        path: 'scenario/:scenarioId?',
        element: <Scenario />,
      },
    ],
  },
]);

// アプリケーション起動
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);