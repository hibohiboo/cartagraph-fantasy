import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Suspense fallback={<div className="loading">読み込み中...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default App;