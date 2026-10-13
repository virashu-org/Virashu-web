/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  /** Server-only Viewer token used for draft/visual editing. Never shipped to the browser. */
  readonly SANITY_API_READ_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
