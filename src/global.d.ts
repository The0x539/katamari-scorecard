/// <reference types="preact" />
/// <reference types="@rsbuild/core/types" />
/// <reference types="temporal-polyfill/global" />

declare module "*.jxl" {
  const src: string;
  export default src;
}

declare namespace preact.JSX {
  interface IntrinsicElements {
    "king-of-all-cosmos": unknown;
  }
}
