import { ValiError } from 'valibot';
import { describe, it, expect } from 'vitest';
import {
  parseGameSessionDto,
  parseGameSessionDtoFromJson,
  safeParseGameSessionDto,
} from './game-session';

describe('parseGameSessionDto', () => {
  const validSessionData = {
    session_id: 'session-123',
    scenario_id: 'scenario-456',
    gm_user_id: 'gm-789',
    created_at: '2025-01-03T00:00:00Z',
    players: {},
    max_players: 5,
    current_scene: 'initial_scene',
    session_status: 'waiting_for_players',
    shared_cards: [],
    available_choices: [],
    version: 0,
  };

  describe('parseGameSessionDto', () => {
    it('正しいデータ構造をパースできる', () => {
      const result = parseGameSessionDto(validSessionData);

      expect(result.session_id).toBe('session-123');
      expect(result.scenario_id).toBe('scenario-456');
      expect(result.gm_user_id).toBe('gm-789');
      expect(result.session_status).toBe('waiting_for_players');
    });

    it('必須フィールドが欠けている場合にエラーをスローする', () => {
      const invalidData = {
        session_id: 'session-123',
        // scenario_idが欠けている
        gm_user_id: 'gm-789',
      };

      expect(() => parseGameSessionDto(invalidData)).toThrow(ValiError);
    });

    it('型が間違っている場合にエラーをスローする', () => {
      const invalidData = {
        ...validSessionData,
        max_players: '5', // 数値ではなく文字列
      };

      expect(() => parseGameSessionDto(invalidData)).toThrow(ValiError);
    });

    it('session_statusのバリアントをすべて受け入れる', () => {
      const statuses = [
        'created',
        'waiting_for_players',
        'recruiting',
        'starting',
        'paused',
        'completed',
        'terminated',
      ];

      statuses.forEach((status) => {
        const data = { ...validSessionData, session_status: status };
        const result = parseGameSessionDto(data);
        expect(result.session_status).toBe(status);
      });
    });

    it('session_status in_progressバリアントを受け入れる', () => {
      const data = {
        ...validSessionData,
        session_status: {
          in_progress: {
            current_scene: 'scene-2',
            active_players: ['player-1', 'player-2'],
          },
        },
      };

      const result = parseGameSessionDto(data);
      expect(result.session_status).toEqual({
        in_progress: {
          current_scene: 'scene-2',
          active_players: ['player-1', 'player-2'],
        },
      });
    });

    it('playersオブジェクトを正しくパースする', () => {
      const data = {
        ...validSessionData,
        players: {
          'player-1': {
            player_id: 'player-1',
            user_id: 'user-1',
            character_name: 'Hero',
            status: 'active',
          },
        },
      };

      const result = parseGameSessionDto(data);
      expect(result.players['player-1']?.player_id).toBe('player-1');
      expect(result.players['player-1']?.character_name).toBe('Hero');
    });

    it('shared_cardsとavailable_choicesの配列を受け入れる', () => {
      const data = {
        ...validSessionData,
        shared_cards: [
          { card_id: 'card-1', name: 'Sword', description: 'A sharp sword' },
        ],
        available_choices: ['choice-1', 'choice-2'],
      };

      const result = parseGameSessionDto(data);
      expect(result.shared_cards).toHaveLength(1);
      expect(result.shared_cards[0].name).toBe('Sword');
      expect(result.available_choices).toEqual(['choice-1', 'choice-2']);
    });

    it('versionフィールドとしてnumberを受け入れる', () => {
      const data = { ...validSessionData, version: 42 };
      const result = parseGameSessionDto(data);
      expect(result.version).toBe(42);
    });

    it('versionフィールドとしてbigintを受け入れる', () => {
      const data = { ...validSessionData, version: BigInt(123) };
      const result = parseGameSessionDto(data);
      expect(result.version).toBe(BigInt(123));
    });
  });

  describe('parseGameSessionDtoFromJson', () => {
    it('正しいJSON文字列をパースできる', () => {
      const jsonString = JSON.stringify(validSessionData);
      const result = parseGameSessionDtoFromJson(jsonString);

      expect(result.session_id).toBe('session-123');
      expect(result.scenario_id).toBe('scenario-456');
    });

    it('不正なJSON文字列の場合にエラーをスローする', () => {
      const invalidJson = '{ invalid json }';

      expect(() => parseGameSessionDtoFromJson(invalidJson)).toThrow(
        'Invalid JSON',
      );
    });

    it('正しいJSONだがスキーマに合わない場合にエラーをスローする', () => {
      const invalidData = { session_id: 'session-123' }; // 必須フィールドが欠けている
      const jsonString = JSON.stringify(invalidData);

      expect(() => parseGameSessionDtoFromJson(jsonString)).toThrow(ValiError);
    });

    it('WASMから返される実際のJSON形式をパースできる', () => {
      // WASMから実際に返される形式（snake_case）
      const wasmJson = `{
        "session_id": "6e2d8249",
        "scenario_id": "scenario001",
        "gm_user_id": "gm-001",
        "created_at": "2025-01-03T07:59:00Z",
        "players": {},
        "max_players": 5,
        "current_scene": "initial",
        "session_status": "waiting_for_players",
        "shared_cards": [],
        "available_choices": [],
        "version": 0
      }`;

      const result = parseGameSessionDtoFromJson(wasmJson);
      expect(result.session_id).toBe('6e2d8249');
      expect(result.gm_user_id).toBe('gm-001');
    });
  });

  describe('safeParseGameSessionDto', () => {
    it('正しいデータの場合にsuccess=trueを返す', () => {
      const result = safeParseGameSessionDto(validSessionData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.output.session_id).toBe('session-123');
      }
    });

    it('不正なデータの場合にsuccess=falseを返す', () => {
      const invalidData = { session_id: 'session-123' };
      const result = safeParseGameSessionDto(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.issues).toBeDefined();
        expect(result.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
