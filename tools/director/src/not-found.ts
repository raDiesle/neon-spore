/**
 * **What the director's server answers for a path it has no route for.**
 *
 * A page whose bundle has lost track of one of its own sources asks for that
 * source by its path in the tree — `/tools/director/src/director.css`, once,
 * after a sheet was added to that file's `@import` list with the server up —
 * and a bare `not found` there read like a missing file, when the file was
 * on disk and only the running server's picture of it was stale. Stopping and
 * starting the server cleared it (`docs/queue.md`, 10 October 2026). Bun 1.4.3
 * rebuilt a grown `@import` list on reload when this was written, so this is
 * the sign for the day it does not: a source path says *restart me*.
 */

/** The tree's own source directories: a request under one is a bundle asking for its source. */
const SOURCES = ["/tools/", "/packages/", "/apps/"] as const;

/** The body and status for a request no route took. */
export function notFound(pathname: string): { status: 404; body: string } {
  if (!SOURCES.some((dir) => pathname.startsWith(dir))) return { status: 404, body: "not found" };
  return {
    status: 404,
    body: `${pathname} is a source file, and this page's bundle asked for it by path: the director's picture of the tree is stale. Stop and start the director (bun run dev), then reload.`,
  };
}
