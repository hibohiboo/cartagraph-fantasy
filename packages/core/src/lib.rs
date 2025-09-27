use wasm_bindgen::prelude::*;

// オニオンアーキテクチャ層構造
pub mod domain;           // 最内層：純粋ドメインロジック
pub mod infrastructure;   // 最外層：インフラ実装
pub mod types;           // 互換性のため残存（段階的移行）
pub mod wasm_interface;

// 外部クレート
extern crate console_error_panic_hook;

// WebAssembly初期化
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

// 基本エクスポート
pub use types::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generate_typescript_types() {
        // ts-rs型生成のトリガー
        // テスト実行時に自動的にTypeScript型定義が生成される

        // 基本的な型テスト
        let session_id = types::SessionId::new();
        assert!(!session_id.0.is_empty());

        let player_id = types::PlayerId::new();
        assert!(!player_id.0.is_empty());

        println!("TypeScript types generated successfully!");
    }
}