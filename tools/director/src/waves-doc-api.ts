/**
 * `GET /api/waves-doc` — DOCUMENTATION › WAVES, on the server side: how the
 * waves are generated (`docs/spec/wave-generation.md`) and every wave
 * measured (`docs/spec/wave-curriculum-today.md`, `bun run waves:measure`).
 *
 * Read on every request, like `backlog-api.ts` reads its spec files, so the
 * page is the tree's and a measurement rewritten is on it at the next open.
 */

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

export interface WavesDoc {
  /** How generating works, and how to use it. */
  guide: string;
  /** The measured tables: the whole game, every wave, the bosses. */
  today: string;
}

export async function wavesDocState(): Promise<Response> {
  const spec = (name: string) => Bun.file(new URL(`../../../docs/spec/${name}`, import.meta.url));
  const [guide, today] = await Promise.all([
    spec("wave-generation.md").text(),
    spec("wave-curriculum-today.md").text(),
  ]);
  const doc: WavesDoc = { guide, today };
  return Response.json(doc, { headers: noCache });
}
