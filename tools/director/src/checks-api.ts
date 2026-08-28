/**
 * The TO CHECK sheet's four verbs, on the server side: read the state, record
 * a verdict, run a check that names a command, and delete a branch that has
 * nothing left on it.
 *
 * The reading is `tools/checks`; none of the deciding happens here. What this
 * file adds is that a browser can reach it — the same reason the director has
 * a server at all, a page being unable to write a file.
 */

import {
  type Branch,
  branchReady,
  type CheckState,
  outstanding,
  runnable,
} from "../../checks/checks.js";
import type { Verdict } from "../../checks/ledger.js";
import {
  deleteBranch,
  readBranches,
  readChecks,
  runCommand,
  trunk,
  writeDecision,
} from "../../checks/repo.js";

const noCache = { "cache-control": "no-store, must-revalidate" } as const;

export interface ChecksView {
  checks: CheckState[];
  branches: Branch[];
  /** So the header can carry a number without parsing the list twice. */
  left: number;
  ready: number;
  runnable: number;
  /** Commits on origin's main this checkout has not pulled. */
  behind: number;
  /** `git rev-parse --short HEAD` — what a VERSUS vote was cast against. */
  head: string;
  /** Whether anything is uncommitted. A vote against a dirty tree names a
   * state nobody else can get back to, so the pair says so on the record. */
  dirty: boolean;
}

/**
 * The two facts the VERSUS tab needs and no route of its own exists for.
 *
 * `docs/versus.md` refused a `GET /api/versus` on the grounds that
 * `/api/checks` is already fetched by a page that is already open — so these
 * are two more fields on the view it answers with, rather than a second
 * endpoint doing one `git` call each. Neither is fatal to miss: a checkout
 * with no git at all still gets a page, and the record says `unknown`.
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

async function view(root: string): Promise<ChecksView> {
  const checks = await readChecks(root);
  const branches = await readBranches(root, checks);
  return {
    checks,
    branches,
    ...(await headOf(root)),
    behind: (await trunk(root)).behind,
    left: outstanding(checks).length,
    ready: branches.filter(branchReady).length,
    runnable: runnable(checks).length,
  };
}

const today = (): string => new Date().toISOString().slice(0, 10);

export async function checksState(root: string): Promise<Response> {
  try {
    return Response.json(await view(root), { headers: noCache });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function checksDecide(root: string, req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as {
      sha: string;
      text: string;
      verdict: Verdict;
      note?: string;
    };
    if (body.verdict !== "PASS" && body.verdict !== "FAIL") throw new Error("PASS or FAIL");
    await writeDecision(root, {
      sha: body.sha,
      date: today(),
      verdict: body.verdict,
      text: body.text,
      note: (body.note ?? "").trim(),
    });
    // The same envelope as the other two, so the page has one way to take a
    // fresh state back rather than three.
    return Response.json({ view: await view(root) }, { headers: noCache });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 400 });
  }
}

/**
 * A green command records itself; a red one records nothing. What a failing
 * command asks for is a fix, and writing FAIL here would take away the chance
 * for the same check to go green once the fix lands.
 */
export async function checksRun(root: string, req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { sha: string; text: string };
    const checks = await readChecks(root);
    const check = checks.find((c) => c.sha === body.sha && c.text === body.text);
    if (!check?.command) throw new Error("that check names no command");
    const result = await runCommand(root, check.command);
    if (result.ok) {
      await writeDecision(root, {
        sha: check.sha,
        date: today(),
        verdict: "PASS",
        text: check.text,
        note: "",
      });
    }
    return Response.json({ ...result, view: await view(root) }, { headers: noCache });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 400 });
  }
}

export async function checksClean(root: string, req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as { name: string };
    const checks = await readChecks(root);
    const branches = await readBranches(root, checks);
    const branch = branches.find((b) => b.name === body.name);
    if (!branch) throw new Error(`no branch named ${body.name}`);
    const gone = await deleteBranch(root, branch);
    return Response.json({ gone, view: await view(root) }, { headers: noCache });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 400 });
  }
}
