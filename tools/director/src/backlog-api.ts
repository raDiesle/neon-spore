/**
 * `GET /api/backlog`, on the server side — the reading half of the NOT BUILT
 * YET sheet, split out of `server.ts` the same way `notes-api.ts` carries the
 * RELEASE NOTES route: a request handler is not the file where a server binds
 * its port.
 *
 * Ten files are read on every request rather than cached: six spec files,
 * `docs/queue.md`, `docs/parked.md` and the three design documents, all parsed
 * fresh for the reason the roster always was — a copy kept beside the spec goes
 * stale silently. Every one of them is a pure read now that the queue no longer
 * asks git about a lane; the reads themselves are what keep this async.
 */

import { buildBacklog } from "./backlog.js";
import { buildDesigns, type DesignFile } from "./design-docs.js";
import { buildQueue } from "./queue.js";

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

const DESIGN_NAMES = ["versus.md", "teaching.md", "alive.md"];

function specFile(base: URL, name: string): URL {
  return new URL(`../../../docs/spec/${name}`, base);
}

function docFile(base: URL, name: string): URL {
  return new URL(`../../../docs/${name}`, base);
}

export async function backlogState(): Promise<Response> {
  // `import.meta.url` from here, not the caller, so a file moved does not
  // silently start reading the wrong tree. It takes no argument at all now that
  // no group here asks git anything — every one of them is a read of a file
  // this module can find on its own.
  const base = new URL(import.meta.url);
  const [bestiary, bosses, couplings, assists, systems, ideas, queueMd, parkedMd, designText] =
    await Promise.all([
      Bun.file(specFile(base, "bestiary.md")).text(),
      Bun.file(specFile(base, "bosses.md")).text(),
      Bun.file(specFile(base, "couplings.md")).text(),
      Bun.file(specFile(base, "assists.md")).text(),
      Bun.file(specFile(base, "systems.md")).text(),
      Bun.file(specFile(base, "ideas.md")).text(),
      Bun.file(docFile(base, "queue.md")).text(),
      Bun.file(docFile(base, "parked.md")).text(),
      Promise.all(DESIGN_NAMES.map((name) => Bun.file(docFile(base, name)).text())),
    ]);

  const designs: DesignFile[] = DESIGN_NAMES.map((name, i) => ({
    name,
    text: designText[i] ?? "",
  }));
  const queue = buildQueue(queueMd);
  const backlog = buildBacklog(
    bestiary,
    bosses,
    couplings,
    assists,
    systems,
    ideas,
    queue,
    buildDesigns(designs),
    parkedMd,
  );
  return Response.json(backlog, { headers: noCache });
}
