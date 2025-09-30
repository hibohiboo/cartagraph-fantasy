import { useEffect, useState } from 'react';
import { database, initDatabase } from '../services/database';
import type { GameSession, SessionPlayer } from '@cartagraph/shared/types';

// データベース初期化フック
export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        setIsInitialized(false);
      }
    }

    init();
  }, []);

  return { isInitialized, error };
}

// セッション管理フック
export function useSessions() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const allSessions = await database.getAllSessions();
      setSessions(allSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async (session: GameSession) => {
    try {
      await database.saveSession(session);
      await loadSessions(); // リロード
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session');
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await database.deleteSession(sessionId);
      await loadSessions(); // リロード
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    saveSession,
    deleteSession,
    reload: loadSessions,
  };
}

// ゲーム状態管理フック
export function useGameState(sessionId: string | null) {
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGameState = async (sid: string) => {
    setLoading(true);
    setError(null);
    try {
      const state = await database.getGameState(sid);
      setGameState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game state');
    } finally {
      setLoading(false);
    }
  };

  const saveGameState = async (state: any) => {
    if (!sessionId) {
      setError('Session ID is required');
      return;
    }

    try {
      await database.saveGameState(sessionId, state);
      setGameState(state);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game state');
      throw err;
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadGameState(sessionId);
    }
  }, [sessionId]);

  return {
    gameState,
    loading,
    error,
    saveGameState,
    reload: () => sessionId && loadGameState(sessionId),
  };
}

// プレイヤー管理フック
export function useSessionPlayers(sessionId: string | null) {
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = async (sid: string) => {
    setLoading(true);
    setError(null);
    try {
      const sessionPlayers = await database.getPlayersBySession(sid);
      setPlayers(sessionPlayers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const savePlayer = async (player: SessionPlayer) => {
    try {
      await database.savePlayer(player);
      if (sessionId) await loadPlayers(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save player');
      throw err;
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadPlayers(sessionId);
    }
  }, [sessionId]);

  return {
    players,
    loading,
    error,
    savePlayer,
    reload: () => sessionId && loadPlayers(sessionId),
  };
}