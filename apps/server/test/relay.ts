import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import { unstable_getMiniflareWorkerOptions } from "wrangler";

/**
 * The shipped worker, in a real workerd, configured by the deploy's own file.
 *
 * `packages/net` is tested against a wire the test controls, which proves the
 * scheduler and proves nothing about the Durable Objects. Miniflare runs the
 * real workerd, so what answers here is the worker that ships rather than a
 * stand-in for it.
 *
 * **Nothing about the worker is described twice.** `wrangler.jsonc` is read by
 * wrangler, not by a regex over it, and `unstable_getMiniflareWorkerOptions`
 * turns it into the shape miniflare wants — so the compatibility date, the two
 * Durable Object bindings and the SQLite storage the `migrations` ask for all
 * arrive from the deploy's own config. A test passing against a date, a
 * binding or a storage class the deploy does not use is not a thing that can
 * happen here.
 *
 * That function speaks miniflare 4's option shape and miniflare 5 accepts it
 * through `convertV4MiniflareOptions`, which is the conversion miniflare
 * publishes for exactly this. Both packages are Cloudflare's, and
 * `versions.test.ts` holds them to one version between them.
 *
 * **Why not `createTestHarness`.** Cloudflare's own testing page calls the
 * Miniflare API an advanced case and points at `createTestHarness()` from
 * `wrangler`, which reads `wrangler.jsonc` whole, listens on a real port and
 * works with any test runner. It cannot be used here: hosted inside a Bun
 * process, the runtime it starts crashes on the first request it is given
 * ("The Workers runtime crashed unexpectedly", then `ECONNRESET`), while the
 * same script under `node` answers `200`. Until that is fixed, the harness is
 * a thing this suite can only reach by spawning Node beside it, and everything
 * it would buy except the real socket is bought above for nothing.
 */
const ROOT = new URL("../../../", import.meta.url);

const built = await Bun.build({
  entrypoints: [Bun.fileURLToPath(new URL("../src/index.ts", import.meta.url))],
  target: "browser",
  format: "esm",
});
if (!built.success) throw new AggregateError(built.logs, "could not build the worker");
const SCRIPT = await built.outputs[0]?.text();

const { workerOptions } = unstable_getMiniflareWorkerOptions(
  Bun.fileURLToPath(new URL("wrangler.jsonc", ROOT)),
);
// The deploy serves `apps/game/dist` beside the relay. A test has no bundle
// there, asks the worker nothing a static file could answer, and would fail
// before it started on a checkout that has never run `bun run build`.
const { assets: _served, ...worker } = workerOptions;

/** The shipped worker, with whatever `vars` the case under test wants on it. */
export function relay(vars: Record<string, string> = {}): Miniflare {
  return new Miniflare(
    convertV4MiniflareOptions({
      workers: [
        {
          ...worker,
          name: "relay",
          modulesRoot: Bun.fileURLToPath(ROOT),
          modules: [
            {
              type: "ESModule",
              path: Bun.fileURLToPath(new URL("index.mjs", ROOT)),
              contents: SCRIPT,
            },
          ],
          bindings: { ...(worker.bindings ?? {}), ...vars },
        },
      ],
    }),
  );
}

/**
 * **What raising a workerd is allowed to take, and every test that raises one
 * of its own with it.**
 *
 * `relay()` is lazy: the runtime behind it comes up on `mf.ready` or on the
 * first `dispatchFetch`, and a boot costs a worker start, three socket
 * handshakes and a few hundred milliseconds of wall clock. On an idle machine
 * that is comfortably inside bun's five-second default; under a full check it
 * is not. Twice now: "ends a run nobody came back to" lost that race at
 * 5000.30 ms with three copies of the suite running at once, and on 17
 * September 2026 all fourteen cases of `names.test.ts` timed out together on a
 * diff that touched nothing under `apps/server` — the boot was charged to
 * whichever case reached the worker first and the rest queued behind it.
 *
 * So **the raise is awaited in a `beforeAll` given this budget, in every file
 * that raises one**, and a case that stands up a second relay of its own is
 * given it as `test`'s third argument. Written down once rather than as a
 * longer number in whichever test failed first, and generous because it is not
 * a deadline anybody is trying to meet: a case that genuinely hangs still
 * fails, and one that is merely starved still passes.
 *
 * The other way out was `tools/check/shard.ts` keeping the workerd files off a
 * shard that carries anything else. It was not taken: a bin holds its files for
 * a memory reason, the boot would still be raced by the seven shards beside it,
 * and it would put a scheduling rule about two named files in a tool that has
 * never had to know one.
 */
export const OWN_RELAY_MS = 20_000;
