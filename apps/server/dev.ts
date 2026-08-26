// `wrangler dev`, on a port that belongs to this tree.
//
// Wrangler is not one of our servers: it answers no marker, so `claimPort`'s
// probe-and-step-aside cannot be used on it. What can be kept is the half that
// matters between two worktrees — the number is derived from the tree's path
// (`tools/ports.ts`), the same one every time, so two sessions never ask for
// one socket and a `curl` twice reaches the same relay.
import { spawnSync } from "node:child_process";
import { relayPort, treeKey } from "../../tools/ports.js";

const tree = Bun.fileURLToPath(new URL("../../", import.meta.url));
const port = Number(process.env.RELAY_PORT ?? relayPort(tree));

console.log(`relay for ${treeKey(tree)}`);
console.log(`  http://127.0.0.1:${port}/net/health`);
console.log(`  bun run relay:check ws://127.0.0.1:${port}`);

// Through a shell on purpose: Node's `spawnSync` refuses a `.cmd` directly on
// Windows with EINVAL, and `npx` is a `.cmd` there. Nothing here has a space in
// it, so there is no quoting to get wrong.
const result = spawnSync(
  "npx",
  [
    "--yes",
    "wrangler",
    "dev",
    "--config",
    "../../wrangler.jsonc",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { stdio: "inherit", shell: true },
);
process.exit(result.status ?? 1);
