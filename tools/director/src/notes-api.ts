/**
 * `GET /api/notes` — the release notes, and the two facts VERSUS votes against.
 *
 * One route and one verb, which is the whole difference from the four this
 * replaced. TO CHECK had a read, a decide, a run and a clean, because its list
 * was a set of obligations somebody had to answer; release notes are a record
 * of what already happened, so there is nothing for a browser to write back.
 *
 * The head and dirty fields ride along for the same reason they used to ride on
 * `/api/checks`: `docs/versus.md` refused a route of its own on the grounds
 * that a page which is already open is already fetching this one, and two more
 * fields cost less than a second endpoint doing one `git` call each.
 */

import { join } from "node:path";
import { type Note, parseNotes } from "./notes.js";

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

export interface NotesView {
  notes: Note[];
  /** `git rev-parse --short HEAD` — what a VERSUS vote was cast against. */
  head: string;
  /**
   * Whether anything is uncommitted. A vote against a dirty tree names a state
   * nobody else can get back to, so the pair says so on the record.
   */
  dirty: boolean;
}

/**
 * Neither field is fatal to miss: a checkout with no git at all still gets a
 * page, and the record says `unknown`.
 */
async function headOf(root: string): Promise<{ head: string; dirty: boolean }> {
  const read = async (args: string[]): Promise<string | null> => {
    const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "ignore" });
    const out = await new Response(proc.stdout).text();
    return (await proc.exited) === 0 ? out : null;
  };
  const head = await read(["rev-parse", "--short", "HEAD"]);
  const status = await read(["status", "--porcelain"]);
  return { head: head?.trim() || "unknown", dirty: status === null || status.trim() !== "" };
}

export async function notesState(root: string): Promise<Response> {
  try {
    const file = Bun.file(join(root, "docs/release-notes.md"));
    const md = (await file.exists()) ? await file.text() : "";
    const view: NotesView = { notes: parseNotes(md), ...(await headOf(root)) };
    return Response.json(view, { headers: noCache });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
