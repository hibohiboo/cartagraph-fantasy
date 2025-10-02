import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// ページコンポーネント
import App from './App';
import Characters from './pages/Characters';
import CreateCharacter from './pages/CreateCharacter';
import CreateScenario from './pages/CreateScenario';
import CreateSession from './pages/CreateSession';
import Game from './pages/Game';
import Home from './pages/Home';
import Scenario from './pages/Scenario';
import ScenarioDetail from './pages/ScenarioDetail';
import Scenarios from './pages/Scenarios';
import Sessions from './pages/Sessions';

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
      {
        path: 'scenarios',
        element: <Scenarios />,
      },
      {
        path: 'scenarios/new',
        element: <CreateScenario />,
      },
      {
        path: 'scenarios/:scenarioId',
        element: <ScenarioDetail />,
      },
      {
        path: 'sessions',
        element: <Sessions />,
      },
      {
        path: 'sessions/new',
        element: <CreateSession />,
      },
      {
        path: 'characters',
        element: <Characters />,
      },
      {
        path: 'characters/new',
        element: <CreateCharacter />,
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