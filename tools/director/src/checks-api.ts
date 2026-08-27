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
}

async function view(root: string): Promise<ChecksView> {
  const checks = await readChecks(root);
  const branches = await readBranches(root, checks);
  return {
    checks,
    branches,
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
