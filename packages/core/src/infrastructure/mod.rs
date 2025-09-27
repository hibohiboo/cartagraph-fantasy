// オニオンアーキテクチャ：インフラ層（最外層）
pub mod serialization;
pub mod wasm_bindings;

pub use serialization::*;
pub use wasm_bindings::*;