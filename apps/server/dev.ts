// `wrangler dev`, on a port that belongs to this tree.
//
// Wrangler is not one of our servers: it answers no marker, so `claimPort`'s
// probe-and-step-aside cannot be used on it. What can be kept is the half that
// matters between two worktrees — the number is derived from the tree's path
// (`tools/ports.ts`), the same one every time, so two sessions never ask for
// one socket and a `curl` twice reaches the same relay.
import { relayPort, treeKey } from "../../tools/ports.js";

/**
 * Wrangler's own entry point, run by `node` as a *direct* child.
 *
 * It was `npx --yes wrangler dev …` through a shell, which on Windows is
 * `cmd → npx.cmd → node cli.js → workerd ×2` — and the shell in the middle
 * exits as soon as node is up, so the tree is cut. Stopping this script then
 * took the shell and left wrangler's node and both `workerd` holding the port;
 * on 12 September 2026 three of them had to be found with `Get-Process` and
 * killed by pid after the script that started them had reported the port free.
 * The file `npx` ends in is the one spawned here, resolved from this tree's
 * `wrangler` so the dev server, the deploy and the tests stay on one version.
 *
 * `node` and not `bun`: wrangler's own bin shim runs it under node, and a
 * workerd hosted inside a Bun process crashes on its first request
 * (`test/relay.ts` has the details).
 */
export function wranglerCli(): string {
  return Bun.fileURLToPath(
    new URL("./wrangler-dist/cli.js", import.meta.resolve("wrangler/package.json")),
  );
}

/** The command this script runs — one place, so the test can read it too. */
export function wranglerDevCommand(port: number): string[] {
  return [
    "node",
    "--no-warnings",
    wranglerCli(),
    "dev",
    "--config",
    "../../wrangler.jsonc",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
  ];
}

if (import.meta.main) {
  const tree = Bun.fileURLToPath(new URL("../../", import.meta.url));
  const port = Number(process.env.RELAY_PORT ?? relayPort(tree));
  console.log(`relay for ${treeKey(tree)}`);
  console.log(`  http://127.0.0.1:${port}/net/health`);
  console.log(`  bun run relay:check ws://127.0.0.1:${port}`);

  const child = Bun.spawn(wranglerDevCommand(port), {
    cwd: Bun.fileURLToPath(new URL("./", import.meta.url)),
    stdio: ["inherit", "inherit", "inherit"],
  });
  // A stop that reaches this script reaches wrangler: what a person's Ctrl-C
  // already did through the console, done for a `kill` from anywhere else.
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      child.kill();
    });
  }
  process.exit(await child.exited);
}
