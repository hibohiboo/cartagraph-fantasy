import { describe, it, expect } from 'vitest';
import type { CardType, Rarity, TagCategory, AdvantageType, CharacterStatus, Difficulty } from './index';

describe('Shared Types', () => {
  it('should define card types correctly', () => {
    const action: CardType = 'action';
    const choice: CardType = 'choice';
    const possession: CardType = 'possession';
    const sceneTransition: CardType = 'scene_transition';

    expect(action).toBe('action');
    expect(choice).toBe('choice');
    expect(possession).toBe('possession');
    expect(sceneTransition).toBe('scene_transition');
  });

  it('should define rarity types correctly', () => {
    const common: Rarity = 'common';
    const uncommon: Rarity = 'uncommon';
    const rare: Rarity = 'rare';
    const legendary: Rarity = 'legendary';

    expect(common).toBe('common');
    expect(uncommon).toBe('uncommon');
    expect(rare).toBe('rare');
    expect(legendary).toBe('legendary');
  });

  it('should define tag categories correctly', () => {
    const skill: TagCategory = 'skill';
    const status: TagCategory = 'status';
    const achievement: TagCategory = 'achievement';
    const condition: TagCategory = 'condition';

    expect(skill).toBe('skill');
    expect(status).toBe('status');
    expect(achievement).toBe('achievement');
    expect(condition).toBe('condition');
  });

  it('should define advantage types correctly', () => {
    const normal: AdvantageType = 'normal';
    const advantage: AdvantageType = 'advantage';
    const disadvantage: AdvantageType = 'disadvantage';

    expect(normal).toBe('normal');
    expect(advantage).toBe('advantage');
    expect(disadvantage).toBe('disadvantage');
  });

  it('should define character status correctly', () => {
    const ready: CharacterStatus = 'ready';
    const inAction: CharacterStatus = 'in_action';
    const waitingForInput: CharacterStatus = 'waiting_for_input';
    const incapacitated: CharacterStatus = 'incapacitated';

    expect(ready).toBe('ready');
    expect(inAction).toBe('in_action');
    expect(waitingForInput).toBe('waiting_for_input');
    expect(incapacitated).toBe('incapacitated');
  });

  it('should define difficulty correctly', () => {
    const beginner: Difficulty = 'beginner';
    const intermediate: Difficulty = 'intermediate';
    const advanced: Difficulty = 'advanced';
    const expert: Difficulty = 'expert';

    expect(beginner).toBe('beginner');
    expect(intermediate).toBe('intermediate');
    expect(advanced).toBe('advanced');
    expect(expert).toBe('expert');
  });
});