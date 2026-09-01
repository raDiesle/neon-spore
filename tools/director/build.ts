import { rm } from "node:fs/promises";
import { join } from "node:path";
import { WAVES } from "@neon-spore/content";
import { buildDateToday } from "../build-stamp.js";
import { backlogState } from "./src/backlog-api.js";
import { checksState } from "./src/checks-api.js";
import {
  readAssistantsText,
  readBorrowedText,
  readSpecFiles,
  readTowerDefenceText,
} from "./src/docs-api.js";

/**
 * Builds the director the way `apps/game/preview.ts` builds the game: a
 * static bundle, `bun build ./index.html --outdir=dist`, with no server
 * behind it once it ships. That is the half of the director that *can*
 * ship — see `docs/queue.md`'s burn-director-ship entry, which this file
 * exists to answer.
 *
 * `server.ts` earns its keep in development because a browser cannot write
 * `waves.ts`, decide a check or run one — none of that survives a build,
 * because there is no repository behind a static bundle. What *can* survive
 * is everything the director only ever reads: the wave list, the backlog
 * ("NOT BUILT YET"), the spec, `docs/borrowed.md` and `docs/tower-defence.md`, and the check ledger's own
 * state (read by VERSUS for the head it voted against — never by a decide or
 * a run, which have no route to call). Each of those is baked here, once, at
 * build time, into a plain file under `dist/api/`, at the exact path the
 * client already fetches — `main.ts`, `backlog-page.ts`, `spec.ts`,
 * `whole-doc.ts` and `versus-vote.ts` need no change: a static host answering
 * `GET /api/backlog` with a file looks identical to `server.ts` answering it
 * with a handler. `PUT` and `POST` have no such file to land on, so saving a
 * wave or deciding a check simply has nowhere to go — which is why `main.ts`
 * hides those controls in a build it detects as shipped, rather than
 * offering a button a static host cannot answer.
 *
 * `dist/__director` is that detection: the same shape `server.ts`'s own
 * `/__director` answers, with `shipped: true` where the live route always
 * says `false`. One route, one flag, read the same way regardless of which
 * of the two is running underneath it.
 *
 * Run through `bun run build` at the repository root, beside the game's own
 * build — see `package.json` and `docs/queue.md` for the switch between
 * shipping both and shipping the game alone.
 */

const here = new URL("./", import.meta.url);
const repoRootPath = Bun.fileURLToPath(new URL("../../", import.meta.url));
const distDir = Bun.fileURLToPath(new URL("./dist/", here));
const indexHtml = Bun.fileURLToPath(new URL("./index.html", here));

await rm(distDir, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [indexHtml],
  outdir: distDir,
  minify: true,
  sourcemap: "linked",
  define: { __BUILD_DATE__: JSON.stringify(buildDateToday()) },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  console.error("director build failed");
  process.exit(1);
}

/** One GET route's answer, baked to the exact path the client already fetches. */
async function bake(relPath: string, body: string): Promise<void> {
  await Bun.write(join(distDir, relPath), body);
}

const [backlogRes, checksRes] = await Promise.all([
  backlogState(repoRootPath),
  checksState(repoRootPath),
]);

await Promise.all([
  bake("api/waves", JSON.stringify(WAVES)),
  bake("api/backlog", await backlogRes.text()),
  bake("api/checks", await checksRes.text()),
  bake("api/borrowed", JSON.stringify({ text: await readBorrowedText() })),
  bake("api/tower-defence", JSON.stringify({ text: await readTowerDefenceText() })),
  bake("api/claude-vs-chatgpt", JSON.stringify({ text: await readAssistantsText() })),
  bake("api/spec", JSON.stringify({ files: await readSpecFiles() })),
  bake(
    "__director",
    JSON.stringify({
      app: "neon-spore-director",
      pid: 0,
      port: 0,
      tree: "built",
      shipped: true,
      builtAt: new Date().toISOString(),
      builtOn: buildDateToday(),
    }),
  ),
]);

for (const artifact of result.outputs) {
  console.log(`director ${artifact.kind}: ${artifact.path}`);
}
console.log(`director build: ${distDir}`);
