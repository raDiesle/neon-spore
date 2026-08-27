/**
 * `GET /api/backlog`, on the server side — the reading half of the NOT BUILT
 * YET sheet, split out of `server.ts` the same way `checks-api.ts` already
 * carries the TO CHECK routes: a request handler is not the file where a
 * server binds its port.
 *
 * Nine files are read on every request rather than cached: six spec files,
 * `docs/queue.md` and the three design documents, all parsed fresh for the
 * reason the roster always was — a copy kept beside the spec goes stale
 * silently. `buildQueue` additionally asks git about each lane, which is why
 * this whole thing is async where `buildBacklog` alone would not need to be.
 */

import { buildBacklog } from "./backlog.js";
import { buildDesigns, type DesignFile } from "./design-docs.js";
import { buildQueue } from "./queue-panel.js";

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

const DESIGN_NAMES = ["versus.md", "teaching.md", "alive.md"];

function specFile(base: URL, name: string): URL {
  return new URL(`../../../docs/spec/${name}`, base);
}

function docFile(base: URL, name: string): URL {
  return new URL(`../../../docs/${name}`, base);
}

export async function backlogState(repoRootPath: string): Promise<Response> {
  // `import.meta.url` from here, not the caller, so a file moved does not
  // silently start reading the wrong tree — `repoRootPath` only names *which*
  // checkout's git this queries, for the lane facts.
  const base = new URL(import.meta.url);
  const [bestiary, bosses, couplings, assists, systems, ideas, queueMd, designText] =
    await Promise.all([
      Bun.file(specFile(base, "bestiary.md")).text(),
      Bun.file(specFile(base, "bosses.md")).text(),
      Bun.file(specFile(base, "couplings.md")).text(),
      Bun.file(specFile(base, "assists.md")).text(),
      Bun.file(specFile(base, "systems.md")).text(),
      Bun.file(specFile(base, "ideas.md")).text(),
      Bun.file(docFile(base, "queue.md")).text(),
      Promise.all(DESIGN_NAMES.map((name) => Bun.file(docFile(base, name)).text())),
    ]);

  const designs: DesignFile[] = DESIGN_NAMES.map((name, i) => ({
    name,
    text: designText[i] ?? "",
  }));
  const queue = await buildQueue(repoRootPath, queueMd);
  const backlog = buildBacklog(
    bestiary,
    bosses,
    couplings,
    assists,
    systems,
    ideas,
    queue,
    buildDesigns(designs),
  );
  return Response.json(backlog, { headers: noCache });
}
