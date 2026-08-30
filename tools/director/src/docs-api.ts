/**
 * The three GET routes that only read a document off disk — `docs/borrowed.md`,
 * `docs/tower-defence.md` and the spec directory — split out of `server.ts`
 * the same way `backlog-api.ts` and `checks-api.ts` were, and for a sharper
 * reason than tidiness.
 *
 * `build.ts` bakes these same three answers into `dist/api/`, so it needs the
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

/** Every spec file, verbatim. */
export async function readSpecFiles(): Promise<{ name: string; text: string }[]> {
  const dir = Bun.fileURLToPath(specDir);
  const names = (await readdir(dir)).filter((n) => n.endsWith(".md")).sort();
  return await Promise.all(
    names.map(async (name) => ({ name, text: await Bun.file(join(dir, name)).text() })),
  );
}
