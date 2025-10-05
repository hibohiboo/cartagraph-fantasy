import { test, expect } from '@playwright/test';

test.describe('シナリオ3: ゲームプレイ - ダイス振り、イベントログ', () => {
  test.beforeEach(async ({ page }) => {
    // IndexedDBをクリア
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('trpg-scenario-db');
      indexedDB.deleteDatabase('trpg-session-db');
      indexedDB.deleteDatabase('trpg-character-db');
      indexedDB.deleteDatabase('trpg-characters');
      localStorage.clear();
    });
  });

  test('ゲーム画面が正しく表示され、初期イベントログが記録される', async ({ page }) => {
    test.setTimeout(30000); // 30秒

    // セッションIDを指定してゲーム画面に遷移
    const sessionId = 'test-session-001';
    await page.goto(`/game/${sessionId}`);

    // ゲーム画面の基本要素を確認
    await expect(
      page.getByRole('heading', { level: 1, name: 'ゲームプレイ' }),
    ).toBeVisible();
    await expect(page.locator('header').getByText(`セッションID: ${sessionId}`)).toBeVisible();

    // シーン表示を確認（h2 headingとして探す）
    await expect(page.getByRole('heading', { level: 2, name: '遺跡の入口' })).toBeVisible();
    await expect(
      page.getByText('古代の遺跡の入口に到着した。石造りの門は半分崩れているが、奥への道は続いている。'),
    ).toBeVisible();

    // ダイスロールパネルを確認
    await expect(page.getByRole('heading', { level: 3, name: 'ダイスロール' })).toBeVisible();
    await expect(page.getByRole('button', { name: '2D6を振る' })).toBeVisible();

    // イベントログパネルを確認
    await expect(page.getByRole('heading', { level: 3, name: 'イベントログ' })).toBeVisible();

    // 初期イベントログが表示されることを確認
    await expect(
      page.getByText(`ゲームを開始しました (セッションID: ${sessionId})`),
    ).toBeVisible();
  });

  test('ダイスを振って結果がイベントログに記録される', async ({ page }) => {
    test.setTimeout(30000); // 30秒

    const sessionId = 'test-session-002';
    await page.goto(`/game/${sessionId}`);

    // ページ読み込み完了を待つ
    await expect(page.getByRole('heading', { level: 1, name: 'ゲームプレイ' })).toBeVisible();

    // 初期状態: イベントログが1件（システムメッセージ）
    const initialEvents = page.locator('[class*="space-y-2"] > div');
    await expect(initialEvents).toHaveCount(1);

    // ダイスを振る
    await page.getByRole('button', { name: '2D6を振る' }).click();

    // ダイス結果が表示されることを確認（ダイスロールパネル内の結果ボックス）
    const resultBox = page.locator('.bg-gray-50.rounded-md.border.border-gray-200');
    await expect(resultBox.getByText('ダイス結果:')).toBeVisible();
    await expect(resultBox.getByText('合計:')).toBeVisible();
    await expect(resultBox.getByText('最終結果:')).toBeVisible();

    // イベントログが2件に増えることを確認（システム + ダイス）
    await expect(initialEvents).toHaveCount(2);

    // ダイスロールのイベントログエントリを確認
    await expect(page.getByText(/2D6を振った: \d+ \+ \d+ = \d+ → 最終結果: \d+/)).toBeVisible();

    // プレイヤーアクターが表示されることを確認（イベントログ内）
    await expect(page.getByText('プレイヤー:', { exact: true })).toBeVisible();
  });

  test('修正値を設定してダイスを振ると、修正値が反映される', async ({ page }) => {
    test.setTimeout(30000); // 30秒

    const sessionId = 'test-session-003';
    await page.goto(`/game/${sessionId}`);

    await expect(page.getByRole('heading', { level: 1, name: 'ゲームプレイ' })).toBeVisible();

    // 修正値を設定
    const modifierInput = page.locator('#modifier');
    await modifierInput.fill('3');
    await expect(modifierInput).toHaveValue('3');

    // ダイスを振る
    await page.getByRole('button', { name: '2D6を振る' }).click();

    // 修正値が表示に反映されることを確認（ダイス結果ボックス内）
    const resultBox = page.locator('.bg-gray-50.rounded-md.border.border-gray-200');
    await expect(resultBox.getByText('修正値:')).toBeVisible();
    await expect(resultBox.getByText('+3')).toBeVisible();

    // イベントログに修正値が記録されることを確認
    await expect(page.getByText(/2D6を振った: \d+ \+ \d+ = \d+ \(修正: \+3\) → 最終結果: \d+/)).toBeVisible();
  });

  test('複数回ダイスを振ると、イベントログが蓄積される', async ({ page }) => {
    test.setTimeout(30000); // 30秒

    const sessionId = 'test-session-004';
    await page.goto(`/game/${sessionId}`);

    await expect(page.getByRole('heading', { level: 1, name: 'ゲームプレイ' })).toBeVisible();

    const eventList = page.locator('[class*="space-y-2"] > div');

    // 初期状態: 1件（システムメッセージ）
    await expect(eventList).toHaveCount(1);

    // 1回目のダイスロール
    await page.getByRole('button', { name: '2D6を振る' }).click();
    await expect(eventList).toHaveCount(2);

    // 2回目のダイスロール
    await page.getByRole('button', { name: '2D6を振る' }).click();
    await expect(eventList).toHaveCount(3);

    // 3回目のダイスロール
    await page.getByRole('button', { name: '2D6を振る' }).click();
    await expect(eventList).toHaveCount(4);

    // すべてのダイスロールイベントが表示されることを確認
    const diceEvents = page.getByText(/2D6を振った:/);
    await expect(diceEvents).toHaveCount(3);
  });

  test('負の修正値も正しく適用される', async ({ page }) => {
    test.setTimeout(30000); // 30秒

    const sessionId = 'test-session-005';
    await page.goto(`/game/${sessionId}`);

    await expect(page.getByRole('heading', { level: 1, name: 'ゲームプレイ' })).toBeVisible();

    // 負の修正値を設定
    const modifierInput = page.locator('#modifier');
    await modifierInput.fill('-2');
    await expect(modifierInput).toHaveValue('-2');

    // ダイスを振る
    await page.getByRole('button', { name: '2D6を振る' }).click();

    // 負の修正値が表示されることを確認（ダイス結果ボックス内）
    const resultBox = page.locator('.bg-gray-50.rounded-md.border.border-gray-200');
    await expect(resultBox.getByText('修正値:')).toBeVisible();
    await expect(resultBox.getByText('-2')).toBeVisible();

    // イベントログに負の修正値が記録されることを確認
    await expect(page.getByText(/2D6を振った: \d+ \+ \d+ = \d+ \(修正: -2\) → 最終結果: \d+/)).toBeVisible();
  });
});
