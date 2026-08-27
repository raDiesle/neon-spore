/**
 * The TO CHECK sheet's vocabulary: what the server sends, and the three
 * helpers every row is built out of. Split from `checks-page.ts` to keep both
 * under the file ceiling, and because the readiness rules are worth reading
 * next to the shape they are about.
 */

export interface CheckState {
  sha: string;
  full: string;
  date: string;
  subject: string;
  text: string;
  command: string | null;
  verdict: "PASS" | "FAIL" | null;
  decidedOn: string;
  note: string;
  /** A stable handle on this one check — see `tools/checks/checks.ts`. */
  n: number;
  /** `hint.ts`'s restatement of `text`, or null when it has nothing to add. */
  hint: string | null;
}

export interface Branch {
  name: string;
  local: boolean;
  remote: boolean;
  merged: boolean;
  worktree: string;
  current: boolean;
  undecided: number;
}

export interface ChecksView {
  checks: CheckState[];
  branches: Branch[];
  left: number;
  ready: number;
  runnable: number;
  /** Commits on origin's main this checkout has not pulled. */
  behind: number;
}

export function el(tag: string, cls = "", text = ""): HTMLElement {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
}

export function button(label: string, cls = ""): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.className = cls;
  b.textContent = label;
  return b;
}

export async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as Record<string, unknown>;
}

/**
 * Ready to be deleted: merged, every check on it decided, and not the branch
 * HEAD is standing on. `tools/checks/checks.ts` says the same thing for the
 * CLI and for the server — this is the browser's copy, and the server refuses
 * anything this would wave through by mistake.
 */
export function ready(branch: Branch): boolean {
  return branch.merged && branch.undecided === 0 && !branch.current;
}

export function reason(branch: Branch): string {
  if (branch.current) return "you are standing on it";
  if (!branch.merged) return "still ahead of main";
  if (branch.undecided === 1) return "1 check outstanding";
  if (branch.undecided > 1) return `${branch.undecided} checks outstanding`;
  return branch.worktree ? "merged and checked — its worktree goes too" : "merged and checked";
}
