// GameSessionDto validation schema using valibot
import * as v from 'valibot';

// SessionStatusDto schema (simplified for MVP)
// Full variant support can be added later
const SessionStatusDtoSchema = v.union([
  v.literal('created'),
  v.literal('waiting_for_players'),
  v.literal('recruiting'),
  v.literal('starting'),
  v.literal('paused'),
  v.literal('completed'),
  v.literal('terminated'),
  v.object({
    in_progress: v.object({
      current_scene: v.string(),
      active_players: v.array(v.string()),
    }),
  }),
]);

// SessionPlayerDto schema (minimal - can be expanded)
const SessionPlayerDtoSchema = v.object({
  player_id: v.string(),
  user_id: v.string(),
  character_name: v.string(),
  status: v.string(),
});

// CardDto schema (minimal - can be expanded)
const CardDtoSchema = v.object({
  card_id: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
});

// GameSessionDto schema
export const GameSessionDtoSchema = v.object({
  session_id: v.string(),
  scenario_id: v.string(),
  gm_user_id: v.string(),
  created_at: v.string(),
  players: v.record(v.string(), v.optional(SessionPlayerDtoSchema)),
  max_players: v.number(),
  current_scene: v.string(),
  session_status: SessionStatusDtoSchema,
  shared_cards: v.array(CardDtoSchema),
  available_choices: v.array(v.string()),
  version: v.union([v.bigint(), v.number()]), // Accept both for flexibility
});

/**
 * Parse and validate GameSessionDto from JSON string or unknown object
 * @throws {v.ValiError} if validation fails
 */
export function parseGameSessionDto(data: unknown) {
  return v.parse(GameSessionDtoSchema, data);
}

/**
 * Safe parse that returns Result type
 */
export function safeParseGameSessionDto(data: unknown) {
  return v.safeParse(GameSessionDtoSchema, data);
}

/**
 * Parse JSON string to GameSessionDto with validation
 */
export function parseGameSessionDtoFromJson(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);
    return parseGameSessionDto(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
    throw error;
  }
}
