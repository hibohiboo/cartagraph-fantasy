/**
 * E2E Test Scenario 1: シナリオ作成者のワークフロー
 * Based on quickstart.md Test Scenario 1
 *
 * TDD RED Phase: 最初の失敗テスト
 */

import { describe, it, expect } from 'vitest';

describe.skip('E2E Scenario 1: シナリオ作成者のワークフロー', () => {
  it('should allow user to create scenario template and start session', async () => {
    // Setup: ブラウザでlocalhost:5173を開く
    // 「シナリオ作成者」として名前を入力してユーザー作成

    // RED Phase: UserServiceが実装されていないため失敗する
    // const userService = await import('@/services/UserService');

    // const user = await userService.createUser({
    //   name: 'シナリオ作成者'
    // });

    // expect(user).toBeDefined();
    // expect(user.name).toBe('シナリオ作成者');

    // Step 1: シナリオ作成開始
    // Given: シナリオ作成者としてログイン済み
    // When: 「新規シナリオ作成」ボタンをクリック
    // Then: シナリオエディターが表示される

    // RED Phase: ScenarioServiceが実装されていないため失敗する
    // const scenarioService = await import('@/services/ScenarioService');

    // const scenario = await scenarioService.createScenario({
    //   title: 'テスト遺跡探索',
    //   description: '初心者向けテストシナリオ',
    //   recommendedPlayers: { min: 2, max: 4 },
    //   difficulty: 'beginner'
    // });

    // expect(scenario).toBeDefined();
    // expect(scenario.title).toBe('テスト遺跡探索');
  });
});