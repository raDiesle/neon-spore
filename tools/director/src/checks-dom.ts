/**
 * The TO CHECK sheet's vocabulary and its shared actions — what the server
 * sends, and the row and bulk-decide helpers, split out of `checks-page.ts`
 * to keep both files under the line ceiling.
 */

import { asImagePath, isDirectorLink } from "../../checks/restated.js";
import { inline } from "./markdown.js";

/** One `docs/checks/<sha>.md` entry for one check — see `tools/checks/restated.ts`. */
export interface Restated {
  badge?: string;
  subject: string;
  changed: string;
  decide: string;
  before?: string;
  after?: string;
  where: string;
}

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
  /** The hand-written restatement, beside the trailer — null for most checks. */
  restated: Restated | null;
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

/** `before`/`after` as an `<img>` when it names a captured frame, prose otherwise. */
function beforeAfterRow(label: "before" | "after", value: string): HTMLElement {
  const row = el("p", "hint");
  row.appendChild(document.createTextNode(`${label} — `));
  const path = asImagePath(value);
  if (path) {
    const img = document.createElement("img");
    img.className = "restated-frame";
    img.src = `/${path}`;
    img.alt = `${label}: ${value}`;
    row.appendChild(img);
  } else {
    row.appendChild(document.createTextNode(value));
  }
  return row;
}

/** `where` as a link that opens beside the list when it names a director place, a command otherwise. */
function whereRow(where: string): HTMLElement {
  const row = el("p", "hint");
  row.appendChild(document.createTextNode("where — "));
  if (isDirectorLink(where)) {
    const a = document.createElement("a");
    a.href = where;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = where;
    row.appendChild(a);
  } else {
    inline(row, where);
  }
  return row;
}

/** One row per field, in reading order — silent on `before`/`after` when a lane wrote neither. */
export function restatedRows(r: Restated): HTMLElement[] {
  const rows = [
    el("p", "hint", r.subject),
    el("p", "hint", `changed — ${r.changed}`),
    el("p", "hint", `decide — ${r.decide}`),
  ];
  if (r.before) rows.push(beforeAfterRow("before", r.before));
  if (r.after) rows.push(beforeAfterRow("after", r.after));
  rows.push(whereRow(r.where));
  return rows;
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
 * The bar's two decide-everything controls, built here rather than in
 * `index.html` since the count is not known until the sheet has loaded.
 * Idempotent, so `render()` and `bindChecks()` can both call it. Deliberately
 * not alike: `pass` is the primary, gold control; `clear` sits beside it
 * plain, because it makes a different claim — nobody looked, and the list is
 * closed anyway.
 */
export function decideAllButtons(): { pass: HTMLButtonElement; clear: HTMLButtonElement } {
  const bar = document.getElementById("checksBar");
  const already = document.getElementById("checksPassAll");
  const alreadyClear = document.getElementById("checksClearAll");
  if (already instanceof HTMLButtonElement && alreadyClear instanceof HTMLButtonElement) {
    return { pass: already, clear: alreadyClear };
  }
  const pass = button("✓ TESTED ALL", "primary");
  pass.id = "checksPassAll";
  const clear = button("CLEARED");
  clear.id = "checksClearAll";
  const count = document.getElementById("checksCount");
  bar?.insertBefore(clear, count);
  bar?.insertBefore(pass, clear);
  return { pass, clear };
}

/** Asking why it failed inline, because a FAIL with no reason is a shrug. */
export function failRow(
  row: HTMLElement,
  check: { sha: string; text: string },
  take: (result: Record<string, unknown>) => void,
): void {
  const box = el("div", "check-fail");
  const input = document.createElement("input");
  input.placeholder = "what was wrong?";
  const confirm = button("RECORD FAIL", "primary");
  confirm.addEventListener("click", () => {
    void post("/api/checks/decide", {
      sha: check.sha,
      text: check.text,
      verdict: "FAIL",
      note: input.value,
    }).then(take);
  });
  box.append(input, confirm);
  row.appendChild(box);
  input.focus();
}

/**
 * Every outstanding check that names a command, run in order — the half of
 * getting back to the machine that can look which does not need looking at.
 */
export async function runAllCommand(
  bar: HTMLButtonElement,
  jobs: readonly { sha: string; text: string; command: string | null }[],
  take: (result: Record<string, unknown>) => void,
): Promise<void> {
  bar.disabled = true;
  for (const check of jobs) {
    bar.textContent = `running ${check.command}…`;
    take(await post("/api/checks/run", { sha: check.sha, text: check.text }));
  }
  bar.textContent = "▶ RUN THE COMMANDS";
  bar.disabled = false;
}

/** `verdict` posted for every job in turn, in order — the fresh view is the last response's. */
async function decideMany(
  jobs: readonly { sha: string; text: string }[],
  verdict: "PASS" | "CLEARED",
): Promise<Record<string, unknown>> {
  let result: Record<string, unknown> = {};
  for (const check of jobs) {
    result = await post("/api/checks/decide", {
      sha: check.sha,
      text: check.text,
      verdict,
      note: "",
    });
  }
  return result;
}

/** Every outstanding check decided in one motion. Asks first and says how many. */
export async function decideAllClick(
  bar: HTMLButtonElement,
  jobs: readonly { sha: string; text: string }[],
  verdict: "PASS" | "CLEARED",
  take: (result: Record<string, unknown>) => void,
): Promise<void> {
  if (jobs.length === 0) return;
  const label = verdict === "PASS" ? "tested" : "cleared";
  const many = `${jobs.length} outstanding check${jobs.length === 1 ? "" : "s"}`;
  if (!window.confirm(`Mark ${many} as ${label}?`)) return;
  bar.disabled = true;
  take(await decideMany(jobs, verdict));
  bar.disabled = false;
}

/** Ready to be deleted: merged, every check on it decided, not the branch HEAD is standing on. */
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
