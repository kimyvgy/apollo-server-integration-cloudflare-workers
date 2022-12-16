import type { KVNamespace } from "@cloudflare/workers-types";

export {};

declare global {
  const GRAPHQL_CACHE: KVNamespace;
}
