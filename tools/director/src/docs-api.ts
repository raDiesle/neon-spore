/**
 * The GET routes that only read a document off disk — `docs/borrowed.md`,
 * `docs/tower-defence.md`, `docs/claude-vs-chatgpt.md` and the spec directory —
 * split out of `server.ts` the same way `backlog-api.ts` and `notes-api.ts`
 * were, and for a sharper reason than tidiness.
 *
 * `build.ts` bakes these same answers into `dist/api/`, so it needs the
 * readers. It used to import them from `server.ts`, and importing that file
 * *runs* it: a port is claimed and `Bun.serve` binds it at module scope. The
 * build then wrote `dist/`, printed its lines, and never exited — a director
 * was listening behind it, holding the event loop open until the idle timer
 * fired an hour later. `bun run build` hung there, after all its output, which
 * is the worst place for a hang to be: it looks finished.
 *
 * So a reader lives here, where nothing binds anything, and both sides import
 * it. Nothing outside a server may import `server.ts`.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";

const specDir = new URL("../../../docs/spec/", import.meta.url);
const borrowedFile = new URL("../../../docs/borrowed.md", import.meta.url);
const towerDefenceFile = new URL("../../../docs/tower-defence.md", import.meta.url);
const assistantsFile = new URL("../../../docs/claude-vs-chatgpt.md", import.meta.url);

/**
 * `docs/borrowed.md`, whole — served rather than parsed into entries because
 * its argument is prose, and a parse would drop the half that took the
 * reading.
 */
export async function readBorrowedText(): Promise<string> {
  return await Bun.file(borrowedFile).text();
}

/**
 * `docs/tower-defence.md`, whole — the second study of other games, read for
 * what a slick, a bulb or a meteor could otherwise be. Served the same way
 * `docs/borrowed.md` is, and for the same reason: its argument is a table with
 * a verdict column.
 */
export async function readTowerDefenceText(): Promise<string> {
  return await Bun.file(towerDefenceFile).text();
}

/**
 * `docs/claude-vs-chatgpt.md`, whole — the study of the two subscriptions that
 * could pay for the agent on this project, task by task. Served rather than
 * parsed for the same reason the other two studies are: its argument is a
 * table with a verdict column, and a parse that kept only the names would
 * throw away the half that took the reading.
 */
export async function readAssistantsText(): Promise<string> {
  return await Bun.file(assistantsFile).text();
}

/**
 * The routes that answer with one document's whole text, as a table.
 *
 * `server.ts` serves these and `build.ts` bakes them, and the two lists were
 * written out by hand on both sides. They drifted: the comment above the
 * borrowed route in `server.ts` described `/api/spec`, and each new study had
 * to be added in two places that nothing held together. One table read by both
 * cannot disagree with itself, and a fourth study is one line here.
 *
 * Keyed by the path the client already fetches, so `build.ts` bakes to
 * `dist/<path>` by dropping the leading slash and nothing else.
 */
export const DOC_ROUTES: Record<string, () => Promise<string>> = {
  "/api/borrowed": readBorrowedText,
  "/api/tower-defence": readTowerDefenceText,
  "/api/claude-vs-chatgpt": readAssistantsText,
};

/** Every spec file, verbatim. */
export async function readSpecFiles(): Promise<{ name: string; text: string }[]> {
  const dir = Bun.fileURLToPath(specDir);
  const names = (await readdir(dir)).filter((n) => n.endsWith(".md")).sort();
  return await Promise.all(
    names.map(async (name) => ({ name, text: await Bun.file(join(dir, name)).text() })),
  );
}
