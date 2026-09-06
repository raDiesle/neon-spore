import { expect, test } from "bun:test";

/**
 * One workerd, chosen by Cloudflare rather than by us.
 *
 * `relay.ts` puts two Cloudflare packages together: `wrangler` reads
 * `wrangler.jsonc`, `miniflare` runs the worker. Wrangler pins its miniflare
 * exactly, so a tree that also carries a *different* one runs its tests
 * against a workerd the config was not shaped for — which is how this suite
 * came to pin `miniflare` at a version by hand and wait for a stable release
 * that would let it stop.
 *
 * It does not wait any more. Wrangler's own pin is the version, and this is
 * the test that says so: bump `wrangler` and this fails until `miniflare`
 * follows it, in the one place where the two are written down.
 */
test("apps/server asks for the miniflare wrangler already depends on", async () => {
  const ours = (await Bun.file(new URL("../package.json", import.meta.url)).json()) as {
    devDependencies: Record<string, string>;
  };
  const wrangler = (await Bun.file(
    Bun.fileURLToPath(import.meta.resolve("wrangler/package.json")),
  ).json()) as { dependencies: Record<string, string> };

  expect(ours.devDependencies.miniflare).toBe(wrangler.dependencies.miniflare);
});
