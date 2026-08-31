/**
 * Bun's bundler emits an imported binary as a file and hands back its URL.
 * TypeScript needs telling, once, that this is what such an import is worth —
 * without it every baked asset is a red squiggle and `bun run typecheck` fails
 * on a build step that works.
 */
declare module "*.webp" {
  const url: string;
  export default url;
}

declare module "*.apng" {
  const url: string;
  export default url;
}

declare module "*.png" {
  const url: string;
  export default url;
}
