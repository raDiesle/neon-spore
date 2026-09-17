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
  // Four spec files. `couplings.md` and `assists.md` went on 16 September
  // 2026, when the owner cut the MECHANICS page down to what is not
  // implemented yet and every section of both turned out to be built or half
  // built; `bestiary.md` went with the roster the old BOSSES tab drew. The two
  // boss pages came back on 17 September 2026 for the opposite reason: the
  // owner asked for a page of what is *left* on a boss, and both files were
  // reordered by state that day so they can be read for it.
  const [systems, ideas, bosses, choreo] = await Promise.all([
    Bun.file(specFile(base, "systems.md")).text(),
    Bun.file(specFile(base, "ideas.md")).text(),
    Bun.file(specFile(base, "bosses.md")).text(),
    Bun.file(specFile(base, "bosses-choreographed.md")).text(),
  ]);

  const backlog = buildBacklog(systems, ideas, bosses, choreo);
  return Response.json(backlog, { headers: noCache });
}
