/// <reference types="vite/client" />
/// <reference types="vite-plugin-wasm/client" />

declare module '@cartagraph/core/pkg/cartagraph_core.js' {
  export default function init(input?: RequestInfo | URL | Response | BufferSource | WebAssembly.Module): Promise<any>;
  export function main(): void;
}