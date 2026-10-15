/**
 * `GET /api/waves-doc` — DOCUMENTATION › WAVES, on the server side: how the
 * waves are generated (`docs/spec/wave-generation.md`) and every wave
 * measured (`docs/spec/wave-curriculum-today.md`, `bun run waves:measure`).
 *
 * Read on every request, like `backlog-api.ts` reads its spec files, so the
 * page is the tree's and a measurement rewritten is on it at the next open.
 */

import type { Wave } from "@neon-spore/content";
import { readWaves } from "./waves-api.js";

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

export interface WavesDoc {
  /** How generating works, and how to use it. */
  guide: string;
  /** The measured tables: the whole game, every wave, the bosses. */
  today: string;
  /** The list on disk, and AUTO's beats to a clear field by wave id — the
   * live table drawn over the page's own (`waves-table.ts`). */
  waves: Wave[];
  clear: Record<string, number>;
}

/** AUTO's measurement, as `bun run waves:measure` wrote it; none before it has
 * run, and every row then says so. */
async function readClear(): Promise<Record<string, number>> {
  const file = Bun.file(new URL("../../../docs/spec/wave-curriculum-today.json", import.meta.url));
  if (!(await file.exists())) return {};
  const json = (await file.json()) as { clear?: Record<string, number> };
  return json.clear ?? {};
}

export async function wavesDocState(): Promise<Response> {
  const spec = (name: string) => Bun.file(new URL(`../../../docs/spec/${name}`, import.meta.url));
  const [guide, today, waves, clear] = await Promise.all([
    spec("wave-generation.md").text(),
    spec("wave-curriculum-today.md").text(),
    readWaves(),
    readClear(),
  ]);
  const doc: WavesDoc = { guide, today, waves, clear };
  return Response.json(doc, { headers: noCache });
}
