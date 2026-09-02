/**
 * `GET /api/backlog`, on the server side — the reading half of the NOT BUILT
 * YET sheet, split out of `server.ts` the same way `notes-api.ts` carries the
 * RELEASE NOTES route: a request handler is not the file where a server binds
 * its port.
 *
 * Nine files are read on every request rather than cached: six spec files,
 * the spec files and the three design documents, all parsed fresh for the
 * reason the roster always was — a copy kept beside the spec goes stale
 * silently. Every one of them is a pure read; the reads are what keep this
 * async.
 */

import { buildBacklog } from "./backlog.js";
import { buildDesigns, type DesignFile } from "./design-docs.js";

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
  const [bestiary, bosses, couplings, assists, systems, ideas, designText] = await Promise.all([
    Bun.file(specFile(base, "bestiary.md")).text(),
    Bun.file(specFile(base, "bosses.md")).text(),
    Bun.file(specFile(base, "couplings.md")).text(),
    Bun.file(specFile(base, "assists.md")).text(),
    Bun.file(specFile(base, "systems.md")).text(),
    Bun.file(specFile(base, "ideas.md")).text(),
    Promise.all(DESIGN_NAMES.map((name) => Bun.file(docFile(base, name)).text())),
  ]);

  const designs: DesignFile[] = DESIGN_NAMES.map((name, i) => ({
    name,
    text: designText[i] ?? "",
  }));
  const backlog = buildBacklog(
    bestiary,
    bosses,
    couplings,
    assists,
    systems,
    ideas,
    buildDesigns(designs),
  );
  return Response.json(backlog, { headers: noCache });
}
