# Feature Specification: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」

**Feature Branch**: `001-web-trpg-trpg`
**Created**: 2025-09-25
**Status**: Draft
**Input**: User description: "Webブラウザで遊べる非同期TRPG風ゲームが作りたい。非同期TRPG風の物語体験ゲーム「遺跡漁りとドブさらい」を開発する。忙しくて対面でTRPGを遊べない人が、自分のペースで物語を楽しめることを目的とする。いつでもどこでも参加でき、プレイヤー自身が物語を紡ぐ体験を提供する。"

## Execution Flow (main)
```
1. Parse user description from Input
   → Complete: 非同期TRPG風ゲーム「遺跡漁りとドブさらい」の開発
2. Extract key concepts from description
   → Identified: シナリオ作成者、GM、プレイヤー、シナリオ、シーン、イベント、カード、キャラクター
3. For each unclear aspect:
   → 認証方式を簡素化（ログイン不要でユーザー識別）、データ永続化期間を明確化
4. Fill User Scenarios & Testing section
   → 主要ユーザーフローを特定
5. Generate Functional Requirements
   → 30の機能要件を生成
6. Identify Key Entities (if data involved)
   → 8つの主要エンティティを特定
7. Run Review Checklist
   → [NEEDS CLARIFICATION]マーカーを解決
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
忙しくて対面でTRPGを遊べないユーザーが、Webブラウザ上で非同期TRPG風ゲーム「遺跡漁りとドブさらい」をプレイする。ユーザーは自分のペースで物語を楽しみ、いつでもどこでも参加できる非同期な体験を得る。

### Acceptance Scenarios

#### シナリオ作成者のワークフロー
1. **Given** システムにログインしたシナリオ作成者が、**When** 新しいシナリオを作成し、**Then** シーンとイベントを含む完全なシナリオがシステムに保存される
2. **Given** 既存シナリオが存在する時、**When** シナリオ作成者が既存シナリオを元に派生版を作成し、**Then** オリジナルを参照した新しいシナリオが作成される

#### GMのセッション運営
3. **Given** 公開されたシナリオを選択したGMが、**When** プレイヤー募集を開始し、**Then** プレイヤーが参加申請できる状態になる
4. **Given** プレイヤーが揃ったセッションで、**When** GMがセッションを開始し、**Then** プレイヤーが初期シーンでカードを使用可能になる
5. **Given** セッション進行中に、**When** GMがイベントを任意発火し、**Then** 該当するイベントが全プレイヤーに表示される

#### プレイヤーのゲームプレイ
6. **Given** キャラクターを作成したプレイヤーが、**When** セッションに参加申請し、**Then** GMによる承認待ちの状態になる
7. **Given** セッション中のプレイヤーが、**When** カードを使用し、**Then** 対応するイベントが発生しログに記録される
8. **Given** 行動判定イベントが発生した時、**When** プレイヤーが判定を実行し、**Then** 2d6の結果と修正値により成功/失敗が決定される

#### 非同期プレイ
9. **Given** 他のプレイヤーがイベントを進行させた時、**When** 別のプレイヤーがログインし、**Then** 進捗状況がログで確認できる
10. **Given** 配布された選択肢以外のアクションを取りたいプレイヤーが、**When** GMに新しい選択肢を提案し、**Then** GMがそれを承認または却下できる

### Edge Cases
- **プレイヤーの長期間非アクティブ**: GMがセッション終了権限を行使し、別セッションとして再開する
- **GMの突然の離脱**: セッションは継続不可能とし、中断される
- **同一キャラクターの複数セッション参加**: セッション専用キャラクターコピーにより競合は発生しない
- **シーン移動カード未使用**: GMが任意にシーン遷移イベントを発火可能

## Requirements *(mandatory)*

### Functional Requirements

#### ユーザー管理
- **FR-001**: システムはユーザーアカウントの作成を許可しなければならない
- **FR-002**: システムは簡素なユーザー識別機能を提供しなければならない（初期実装ではログイン不要、将来的にID/パスワード認証を追加予定）
- **FR-003**: システムはセッション中のユーザー情報を永続化しなければならない（初期実装ではセッション終了まで、将来的に永続化期間を無期限に拡張予定）

#### シナリオ作成・管理
- **FR-004**: システムはシナリオ作成者がシナリオを作成できる機能を提供しなければならない
- **FR-005**: システムはシナリオ、シーン、イベントの階層構造を保持しなければならない
- **FR-006**: システムは既存シナリオを元にした派生シナリオの作成を許可しなければならない
- **FR-007**: システムはシナリオに推奨人数、説明を関連付けなければならない
- **FR-008**: システムはイベントトリガー（セッション開始時、カード使用、別イベント呼び出し、GM任意発火）を定義可能にしなければならない

#### セッション管理
- **FR-009**: システムはGMがシナリオを選択してセッションを開催できる機能を提供しなければならない
- **FR-010**: システムはGMがプレイヤー募集と参加承認を管理できなければならない
- **FR-011**: システムはセッション専用のキャラクターコピーを作成しなければならない
- **FR-012**: システムはGMによるセッション終了権限を提供しなければならない
- **FR-013**: システムはセッション終了時にキャラクターへのフィードバック（タグ、カード）を反映しなければならない

#### キャラクター管理
- **FR-014**: システムはプレイヤーがキャラクターを作成できる機能を提供しなければならない
- **FR-015**: システムはキャラクターの名前、所持カード、タグを管理しなければならない
- **FR-016**: システムは持ち込みカード（セッション外）と所持カードを区別しなければならない
- **FR-017**: システムは同一キャラクターの同一シナリオ再参加を基本的に制限しなければならない（例外：お店シナリオ等）

#### カードシステム
- **FR-018**: システムはカードに名前、タグ、内包イベントを定義できなければならない
- **FR-019**: システムはプレイヤーがキャラクター所持カードとパーティ共有カードを使用できなければならない
- **FR-020**: システムはカード使用時に対応するイベントを発火しなければならない
- **FR-021**: システムは選択肢カード使用時に他の選択肢を破棄しなければならない

#### 判定システム
- **FR-022**: システムは行動判定で2d6を振り、修正後7以上を成功としなければならない
- **FR-023**: システムは有利/不利による修正値を適用しなければならない
- **FR-024**: システムはキャラクター単体またはパーティでの判定を実行しなければならない
- **FR-025**: システムはパーティ判定で「全員成功」または「誰か1人成功」を指定可能にしなければならない
- **FR-026**: システムは所持判定でタグやカード所持状況による分岐を実行しなければならない

#### 非同期機能
- **FR-027**: システムはプレイヤーが許可されたイベントを任意のタイミングで実行できなければならない
- **FR-028**: システムは全てのプレイヤーアクション・イベント・ロールプレイをログとして記録しなければならない
- **FR-029**: システムはプレイヤーが新しい選択肢をGMに提案できる機能を提供しなければならない
- **FR-030**: システムはログを非同期に閲覧可能にしなければならない

### Key Entities *(include if feature involves data)*
- **ユーザー**: システム利用者。ユーザーID、ユーザー名を持つ
- **シナリオ**: ゲームの物語構造。シナリオ名、説明、初期シーン、作者、推奨人数を持つ
- **シーン**: シナリオの構成要素。シーン名、目的、終了条件、イベント一覧を持つ
- **イベント**: シーンの構成要素。種別、条件、遷移先、付随メッセージを持つ
- **キャラクター**: プレイヤーの分身。名前、プレイヤー、所持カード、持ち込みカードを持つ
- **カード**: ゲーム進行の核。名前、タグ、内包イベントを持つ
- **タグ**: キャラクターやカードの属性。名前と任意の数値・種別を持つ
- **セッション**: 実際のゲームプレイインスタンス。参加プレイヤー、現在のシーン、進行ログを管理

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---