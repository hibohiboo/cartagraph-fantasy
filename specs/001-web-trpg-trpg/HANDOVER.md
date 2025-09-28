# Task 11 引継ぎドキュメント: ScenarioTemplate集約実装

**Date**: 2025-09-28
**Previous Session**: Character集約実装完了 (Task 10)
**Next Task**: Task 11 - ScenarioTemplate集約実装
**Branch**: `task10` (clean)

---

## 🎯 次のタスク概要

### Task 11: ScenarioTemplate集約実装 [S]
**目的**: シーン・イベント構造付きScenarioTemplate集約のTDD実装
**手法**: 純粋TDDサイクル（1つずつ小さなサイクル）
**成果物**: ScenarioTemplate集約 + DTO + WASM interface + TypeScript型生成

---

## ✅ 完了済み状況

### オニオンアーキテクチャ基盤確立
```
packages/core/src/
├── domain/
│   ├── entities/
│   │   ├── game_session.rs     ✅ 完全実装 (61/61テスト)
│   │   └── character.rs        ✅ 完全実装 (19/19テスト)
│   └── value_objects/          ✅ ID型・状態型完備
├── infrastructure/
│   └── serialization/dto.rs   ✅ DTO変換パターン確立
└── wasm_interface.rs           ✅ FFI契約実装済み
```

### 実装品質
- **総テスト**: 74/74 通過
- **アーキテクチャ**: Infrastructure → Domain依存方向遵守
- **境界型安全性**: DTO変換による完全な型安全性確保
- **TDD手法**: 小さなサイクル徹底

---

## 📋 Task 11 実装計画

### TDD実装アプローチ (重要)
**ユーザーからの重要フィードバック**:
> "失敗テストを先に並べないでください。todoリストにしてtasks.mdにフィードバックしたのち、１つずつTDDを進めて"

#### 正しい手順
1. **TodoWriteツールでタスク分解**: 実装内容をtodoリストとして整理
2. **tasks.mdへフィードバック**: タスク計画の更新・記録
3. **小さなTDDサイクル**: 1つずつテストファースト実装
   - RED: 1つの失敗テスト作成
   - GREEN: 最小実装
   - Refactor: 品質向上
   - 次のサイクルへ

#### 避けるべきアンチパターン
- ❌ 大量の失敗テストを先に並べる
- ❌ `panic!()`での強制失敗
- ✅ `unimplemented!()`, `todo!()`の活用
- ✅ 1テスト → 実装 → 次のテスト

### ScenarioTemplate実装方針

#### Domain層実装 (packages/core/src/domain/entities/scenario_template.rs)
```rust
// 実装すべき基本構造
pub struct ScenarioTemplate {
    // Identity
    pub scenario_id: ScenarioId,

    // Metadata
    pub name: String,
    pub description: String,
    pub author_id: UserId,

    // Game Design
    pub recommended_players: PlayerRange,
    pub estimated_duration: std::time::Duration,
    pub difficulty: Difficulty,

    // Structure
    pub scenes: HashMap<SceneId, SceneDefinition>,
    pub initial_scene_id: SceneId,

    // Resources
    pub shared_cards: Vec<CardTemplate>,

    // Metadata
    pub created_at: DateTime<Utc>,
    pub last_updated: DateTime<Utc>,
    pub version: u64,
}
```

#### 実装する主要メソッド
1. `ScenarioTemplate::create()` - 基本作成
2. `add_scene()` - シーン追加
3. `add_shared_card()` - 共有カード追加
4. `validate_scene_flow()` - シーン遷移検証
5. `set_initial_scene()` - 初期シーン設定

#### インフラ層実装
1. **DTO追加**: `ScenarioTemplateDto` in `dto.rs`
2. **WASM interface**: 4-5個のScenarioTemplate操作メソッド
3. **TypeScript型生成**: `#[ts(export)]`による自動生成

---

## 🏗️ アーキテクチャガイド

### 確立された実装パターン

#### 1. Domain実装パターン
```rust
// packages/core/src/domain/entities/scenario_template.rs
impl ScenarioTemplate {
    pub fn create(scenario_id: ScenarioId, name: String, author_id: UserId) -> Self {
        Self {
            scenario_id,
            name,
            author_id,
            // ... 初期値設定
            created_at: chrono::Utc::now(),
            version: 1,
        }
    }

    pub fn add_scene(&mut self, scene: SceneDefinition) -> Result<(), String> {
        // ビジネスロジック実装
        Ok(())
    }
}
```

#### 2. DTO実装パターン
```rust
// packages/core/src/infrastructure/serialization/dto.rs
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ScenarioTemplateDto {
    pub scenario_id: String,
    pub name: String,
    // ... 他のフィールド
}

// 双方向変換
impl From<&ScenarioTemplate> for ScenarioTemplateDto { /* 実装 */ }
impl From<ScenarioTemplateDto> for ScenarioTemplate { /* 実装 */ }
```

#### 3. WASM Interface実装パターン
```rust
// packages/core/src/wasm_interface.rs
pub fn wasm_create_scenario_template(scenario_id: String, name: String, author_id: String) -> String {
    // ScenarioTemplate::create()呼び出し
    // DTOに変換してJSON文字列で返却
}
```

### アーキテクチャ制約 (必須遵守)
- **Domain層**: 外部依存ゼロ、`Serialize/Deserialize` trait禁止
- **Infrastructure層**: DTO変換責任、型安全境界の確保
- **依存方向**: Infrastructure → Domain (逆方向禁止)

---

## 🔍 デバッグ・検証手順

### 実装完了判定基準
1. **コンパイル**: `cargo build`成功
2. **テスト**: `cargo test`全通過
3. **WASM Build**: `wasm-pack build --target web`成功
4. **型生成**: TypeScript型定義の自動生成確認

### よくある実装エラーと対策

#### 1. コンパイルエラー
```bash
# 修正コマンド
cd packages/core && cargo build
```
- **Importエラー**: `use crate::domain::*;`の追加
- **型エラー**: DTOとDomain型の変換漏れ

#### 2. テスト実行
```bash
cd packages/core && cargo test
```
- **想定エラー**: `unimplemented!()`の実装漏れ
- **修正**: 最小実装での通過確認

#### 3. WASM契約テスト
- **Contract tests**: `wasm_interface.rs`のテスト関数確認
- **JSON シリアライゼーション**: DTO変換の正確性確認

---

## 📁 重要ファイル

### 実装対象ファイル
1. `packages/core/src/domain/entities/scenario_template.rs` - **新規作成**
2. `packages/core/src/infrastructure/serialization/dto.rs` - **追加実装**
3. `packages/core/src/wasm_interface.rs` - **追加実装**
4. `packages/core/src/domain/entities/mod.rs` - **pub mod追加**

### 参考実装ファイル
1. `packages/core/src/domain/entities/character.rs` - TDD実装パターン
2. `packages/core/src/domain/entities/game_session.rs` - 集約ルート実装パターン
3. `packages/core/src/infrastructure/serialization/dto.rs` - DTO変換パターン

### 進捗確認ファイル
1. `specs/001-web-trpg-trpg/tasks.md` - Task 11実装計画更新
2. `specs/001-web-trpg-trpg/plan.md` - 進捗トラッキング更新

---

## 🚀 開始手順

### 1. セッション開始時の確認
```bash
# 現在のブランチ確認
git status
# Expected: On branch task10, working tree clean

# テスト状況確認
cd packages/core && cargo test
# Expected: 74/74 tests passing
```

### 2. Task 11開始コマンド
```bash
# Task 11実装開始の発話例
# "specs\001-web-trpg-trpg\の確認後、Task 11のScenarioTemplate集約実装を開始します。
#  まずTodoWriteでタスク分解し、tasks.mdにフィードバック後、TDDで実装します。"
```

### 3. 実装順序
1. **TodoWrite**: ScenarioTemplate実装タスクの分解
2. **tasks.md更新**: Task 11計画のフィードバック
3. **TDD実装**: 小さなサイクルでScenarioTemplate実装
4. **DTO追加**: Infrastructure層でのDTO変換実装
5. **WASM interface**: FFI契約の追加
6. **進捗更新**: plan.mdの更新

---

## ⚠️ 重要な注意事項

### TDD手法の厳格遵守
- **1つずつ**: 複数の失敗テストを並べない
- **小さなサイクル**: RED → GREEN → Refactor
- **TodoWrite活用**: 実装前のタスク整理必須

### アーキテクチャ品質維持
- **依存方向**: Infrastructure → Domain
- **ドメイン純粋性**: 外部依存なし
- **型安全境界**: DTO変換での型変換

### 実装品質保証
- **テスト駆動**: テストファースト実装
- **段階的拡張**: 最小 → 基本 → 制約付き
- **継続的検証**: cargo build/test でのフィードバック

---

このドキュメントにより、次のClaude Codeセッションが円滑にTask 11のScenarioTemplate集約実装を開始できます。