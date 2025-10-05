import { test, expect } from '@playwright/test';

test.describe('シナリオ2: プレイヤーがキャラクター作成、セッション参加', () => {
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

  test('プレイヤーがキャラクター作成後、セッション一覧を確認', async ({ page }) => {
    test.setTimeout(30000); // 30秒

    // ステップ1: ホーム画面でプレイヤーIDを設定
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(
      '遺跡漁りとドブさらい',
    );

    // ユーザーID設定
    await page.getByText('ユーザーIDを設定').click();
    await page.fill('input[placeholder="ユーザーIDを入力"]', 'player-001');
    await page.getByText('保存').click();
    await expect(page.locator('text=現在のユーザーID:')).toContainText(
      'player-001',
    );

    // ステップ2: キャラクターを作成
    await page.goto('/characters');
    await expect(
      page.getByRole('heading', { level: 1, name: 'キャラクター管理' }),
    ).toBeVisible();

    // 初期状態: キャラクターが存在しない
    await expect(page.getByText('キャラクターがありません')).toBeVisible();

    // 新しいキャラクターを作成
    await page.getByRole('link', { name: '新しいキャラクターを作成' }).click();
    await page.waitForURL('/characters/new');

    // キャラクターフォーム入力
    await page.fill('#name', '勇者アレックス');
    await page.fill('#playerId', 'player-001');

    // キャラクター作成
    await page.getByRole('button', { name: 'キャラクターを作成' }).click();

    // キャラクター一覧にリダイレクトされる
    await page.waitForURL('/characters');
    await expect(
      page.getByRole('heading', { level: 1, name: 'キャラクター管理' }),
    ).toBeVisible();

    // 作成したキャラクターが表示される
    await expect(page.getByText('勇者アレックス')).toBeVisible();
    await expect(page.getByText('player-001')).toBeVisible();

    // IndexedDBにキャラクターが保存されているか確認
    const characterInDB = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('trpg-characters', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction('characters', 'readonly');
      const store = transaction.objectStore('characters');
      const getAllRequest = store.getAll();

      return new Promise<any[]>((resolve) => {
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      });
    });

    expect(characterInDB.length).toBeGreaterThan(0);
    expect(characterInDB[0].name).toBe('勇者アレックス');
    expect(characterInDB[0].playerId).toBe('player-001');

    // ステップ3: セッション一覧を確認（GMが作成したセッションが表示される）
    await page.goto('/sessions');
    await expect(
      page.getByRole('heading', { level: 1, name: 'セッション管理' }),
    ).toBeVisible();

    // 初期状態: セッションが存在しない場合の表示確認
    // または既存セッションが表示される場合の確認
    // ここでは空の状態を確認
    await expect(page.getByText('現在アクティブなセッションはありません')).toBeVisible();
  });

  test('プレイヤーがキャラクター作成後、GMが作成したセッションに参加可能', async ({ page }) => {
    test.setTimeout(60000); // 60秒

    // 前提: GMがシナリオとセッションを作成（Scenario 1と同じ手順）
    // ステップ1: GMとしてシナリオとセッションを作成
    await page.goto('/');

    // GM用のユーザーID設定
    await page.getByText('ユーザーIDを設定').click();
    await page.fill('input[placeholder="ユーザーIDを入力"]', 'gm-001');
    await page.getByText('保存').click();

    // GMがシナリオ作成
    await page.goto('/scenarios/new');
    await page.fill('#title', 'テストシナリオ: プレイヤー参加用');
    await page.fill('#description', 'プレイヤー参加テスト用シナリオ');
    await page.fill('#initialSceneName', '冒険の始まり');
    await page.fill('#authorId', 'gm-001');
    await page.getByRole('button', { name: 'シナリオを作成' }).click();
    await page.waitForURL('/scenarios');

    // GMがセッション作成
    await page.goto('/sessions/new');
    await page.selectOption('#scenario', { index: 1 });
    await page.fill('#gmUserId', 'gm-001');
    await page.getByRole('button', { name: 'セッションを作成' }).click();
    await page.waitForURL('/sessions', { timeout: 5000 });

    // セッションが作成されたことを確認
    await expect(page.getByText('プレイヤー募集中')).toBeVisible();

    // ステップ2: プレイヤーとしてキャラクター作成
    // プレイヤーIDに切り替え（LocalStorageを直接編集）
    await page.evaluate(() => {
      localStorage.setItem('current-user-id', 'player-002');
    });

    // キャラクター作成
    await page.goto('/characters/new');
    await page.fill('#name', '魔法使いベラ');
    await page.fill('#playerId', 'player-002');
    await page.getByRole('button', { name: 'キャラクターを作成' }).click();
    await page.waitForURL('/characters');

    // キャラクターが作成されたことを確認
    await expect(page.getByText('魔法使いベラ')).toBeVisible();

    // ステップ3: セッション一覧を確認し、参加可能なセッションを表示
    await page.goto('/sessions');
    await expect(
      page.getByRole('heading', { level: 1, name: 'セッション管理' }),
    ).toBeVisible();

    // GMが作成したセッションが表示されることを確認
    await expect(page.getByText('プレイヤー募集中')).toBeVisible();
    await expect(page.getByText('GM: gm-001')).toBeVisible();

    // ステップ4: セッション参加（現在はUI未実装のため、将来実装時に追加）
    // TODO: セッション参加ボタンをクリック
    // TODO: 参加確認モーダルで「参加する」をクリック
    // TODO: セッションの詳細ページに遷移
    // TODO: プレイヤー数が1に増えることを確認
  });
});
