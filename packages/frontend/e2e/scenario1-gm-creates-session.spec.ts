import { test, expect } from '@playwright/test';

test.describe('シナリオ1: GMがシナリオ作成、セッション開始', () => {
  test.beforeEach(async ({ page }) => {
    // IndexedDBをクリア
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('trpg-scenario-db');
      indexedDB.deleteDatabase('trpg-session-db');
      indexedDB.deleteDatabase('trpg-character-db');
      localStorage.clear();
    });
  });

  test('GMがユーザーID設定、シナリオ作成、セッション作成', async ({ page }) => {
    test.setTimeout(30000); // 30秒

    // ステップ1: ホーム画面でユーザーIDを設定
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(
      '遺跡漁りとドブさらい',
    );

    // ユーザーID設定
    await page.getByText('ユーザーIDを設定').click();
    await page.fill('input[placeholder="ユーザーIDを入力"]', 'gm-001');
    await page.getByText('保存').click();
    await expect(page.locator('text=現在のユーザーID:')).toContainText(
      'gm-001',
    );

    // ステップ2: シナリオを作成
    await page.getByText('シナリオ一覧').click();
    await expect(
      page.getByRole('main').getByRole('heading', { level: 1 }),
    ).toContainText('シナリオ一覧');

    await page.getByRole('link', { name: '新規作成' }).click();
    await page.waitForURL('/scenarios/new');
    await expect(
      page.getByRole('heading', { level: 1, name: 'シナリオ新規作成' }),
    ).toBeVisible();

    // シナリオフォーム入力
    await page.fill('#title', 'テストシナリオ: 遺跡の探索');
    await page.fill(
      '#description',
      'これはE2Eテスト用のシナリオです。古代の遺跡を探索します。',
    );
    await page.fill('#initialSceneName', '酒場での出会い');
    await page.fill('#authorId', 'gm-001');

    // シナリオ作成
    await page.getByRole('button', { name: 'シナリオを作成' }).click();

    // シナリオ一覧にリダイレクトされ、作成したシナリオが表示される
    await page.waitForURL('/scenarios');
    await expect(
      page.getByRole('heading', { level: 1, name: 'シナリオ一覧' }),
    ).toBeVisible();
    await expect(page.locator('text=テストシナリオ: 遺跡の探索')).toBeVisible();

    // IndexedDBにシナリオが保存されているか確認
    const scenarioInDB = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('trpg-scenario-db', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction('scenarios', 'readonly');
      const store = transaction.objectStore('scenarios');
      const getAllRequest = store.getAll();

      return new Promise<any[]>((resolve) => {
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      });
    });

    expect(scenarioInDB.length).toBeGreaterThan(0);
    expect(scenarioInDB[0].title).toBe('テストシナリオ: 遺跡の探索');
    expect(scenarioInDB[0].authorId).toBe('gm-001');

    // ステップ3: セッションを作成
    await page.goto('/sessions');
    await expect(
      page.getByRole('heading', { level: 1, name: 'セッション管理' }),
    ).toBeVisible();

    await page.getByRole('link', { name: '新しいセッションを作成' }).click();
    await page.waitForURL('/sessions/new');

    // セッションフォーム入力（シナリオを選択）
    // TODO: 実際のシナリオ一覧から選択する必要がある場合は調整
    // 現在はモックシナリオを使用しているため、最初のシナリオを選択
    await page.selectOption('#scenario', { index: 1 }); // index 0 is placeholder
    await page.fill('#gmUserId', 'gm-001');

    // セッション作成
    await page.getByRole('button', { name: 'セッションを作成' }).click();

    // デバッグ: スクリーンショット撮影
    await page.screenshot({
      path: 'test-results/after-session-create.png',
      fullPage: true,
    });

    // セッション一覧にリダイレクトされる
    await page.waitForURL('/sessions', { timeout: 1000 });
    await expect(
      page.getByRole('heading', { level: 1, name: 'セッション管理' }),
    ).toBeVisible();

    // IndexedDBにセッションが保存されているか確認
    const sessionInDB = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('trpg-session-db', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction('sessions', 'readonly');
      const store = transaction.objectStore('sessions');
      const getAllRequest = store.getAll();

      return new Promise<any[]>((resolve) => {
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      });
    });

    expect(sessionInDB.length).toBeGreaterThan(0);
    expect(sessionInDB[0].gmUserId).toBe('gm-001');
    expect(sessionInDB[0].status).toBe('WaitingForPlayers');
  });
});
