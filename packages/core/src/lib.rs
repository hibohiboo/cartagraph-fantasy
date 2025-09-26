use wasm_bindgen::prelude::*;

// モジュール宣言
pub mod types;

// 外部クレート
extern crate console_error_panic_hook;

// WebAssembly初期化
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

// 基本エクスポート
pub use types::*;