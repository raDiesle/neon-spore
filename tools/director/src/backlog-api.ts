/**
 * `GET /api/backlog`, on the server side — the reading half of the NOT BUILT
 * YET sheet, split out of `server.ts` the same way `notes-api.ts` carries the
 * RELEASE NOTES route: a request handler is not the file where a server binds
 * its port.
 *
 * Two spec files are read on every request rather than cached, and parsed
 * fresh for the reason the roster always was — a copy kept beside the spec
 * goes stale silently. Both are a pure read; the reads are what keep this
 * async.
 */

import { buildBacklog } from "./backlog.js";

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

function specFile(base: URL, name: string): URL {
  return new URL(`../../../docs/spec/${name}`, base);
}

export async function backlogState(): Promise<Response> {
  // `import.meta.url` from here, not the caller, so a file moved does not
  // silently start reading the wrong tree. It takes no argument at all now that
  // no group here asks git anything — every one of them is a read of a file
  // this module can find on its own.
  const base = new URL(import.meta.url);
  // Two spec files, not six. `bestiary.md` and `bosses.md` were read for the
  // roster the BOSSES tab drew, and that tab went on 16 September 2026;
  // `couplings.md` and `assists.md` went the same day, when the owner cut the
  // MECHANICS page down to what is not implemented yet and every section of
  // both turned out to be built or half built.
  const [systems, ideas] = await Promise.all([
    Bun.file(specFile(base, "systems.md")).text(),
    Bun.file(specFile(base, "ideas.md")).text(),
  ]);

  const backlog = buildBacklog(systems, ideas);
  return Response.json(backlog, { headers: noCache });
}
