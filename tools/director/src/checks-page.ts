/**
 * TO CHECK — the sheet that says what landed on `main` and nobody has looked
 * at yet, and lets a person say that they have.
 *
 * A cloud session can run `bun test` and a typecheck; it cannot watch a wave
 * at tempo, judge a silhouette at 26 px or reach a relay. `CLAUDE.md` asks it
 * to name those parts, and the naming lives in the commit as a `Check:`
 * trailer — so this page derives its list from the history rather than from a
 * file somebody has to remember to prune.
 *
 * The one thing it writes is the half nothing can derive: whether a person
 * looked, and what they saw. That goes to `docs/verified.md`, and when a
 * branch has nothing undecided left on it, this is where it is deleted.
 */

import { renderBranches } from "./checks-branches.js";
import { button, type CheckState, type ChecksView, el, post, restatedLines } from "./checks-dom.js";
import { inline } from "./markdown.js";

let view: ChecksView | null = null;

/** The count on the header button, so the sheet does not have to be opened to see it. */
function paintCount(): void {
  const open = document.getElementById("checksOpen");
  if (!open) return;
  const left = view?.left ?? 0;
  open.textContent = left === 0 ? "⚑ TO CHECK" : `⚑ ${left} TO CHECK`;
  open.classList.toggle("waiting", left > 0);
}

async function load(): Promise<void> {
  const res = await fetch("/api/checks");
  if (!res.ok) throw new Error(res.statusText);
  view = (await res.json()) as ChecksView;
  paintCount();
}

function take(result: Record<string, unknown>): void {
  if (result.view) {
    view = result.view as ChecksView;
    paintCount();
    render();
  }
}

/** Asking why it failed inline, because a FAIL with no reason is a shrug. */
function failRow(row: HTMLElement, check: CheckState): void {
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

function renderCheck(check: CheckState): HTMLElement {
  const row = el("div", `check${check.verdict ? " is-done" : ""}`);
  const head = el("div", "check-head");
  head.appendChild(el("span", "mark", check.verdict === "FAIL" ? "✗" : check.verdict ? "✓" : "▢"));
  // A stable handle on the row — "3, 7 and 12 passed" beats quoting a
  // sentence back, and the number holds while the trunk does even once other
  // checks around it get decided. See `tools/checks/checks.ts`.
  head.appendChild(el("span", "n", `#${check.n}`));
  const text = el("span", "what");
  inline(text, check.text);
  head.appendChild(text);

  if (check.verdict) {
    head.appendChild(el("span", "stamp", `${check.verdict} ${check.decidedOn}`));
  } else {
    if (check.command) {
      const run = button("▶ RUN");
      run.addEventListener("click", () => {
        run.disabled = true;
        run.textContent = "running…";
        void post("/api/checks/run", { sha: check.sha, text: check.text }).then((result) => {
          if (result.ok) return take(result);
          row.appendChild(el("pre", "check-out", String(result.output ?? result.error ?? "")));
          run.disabled = false;
          run.textContent = "▶ RUN AGAIN";
        });
      });
      head.appendChild(run);
    }
    const pass = button("✓ TESTED", "primary");
    pass.addEventListener("click", () => {
      void post("/api/checks/decide", {
        sha: check.sha,
        text: check.text,
        verdict: "PASS",
        note: "",
      }).then(take);
    });
    const fail = button("✗ FAILED");
    fail.addEventListener("click", () => failRow(row, check));
    head.append(pass, fail);
  }

  row.appendChild(head);
  // The trailer stays the record — this is a restatement beside it, never a
  // replacement, and it is silent whenever it has nothing to add.
  if (check.hint) row.appendChild(el("p", "hint", check.hint));
  // The hand-written half of the same idea — what changed, and the question
  // with a yes and a no — from `docs/checks/restated.md`. Silent for the
  // great majority of checks, which have none.
  if (check.restated) {
    for (const line of restatedLines(check.restated)) row.appendChild(el("p", "hint", line));
  }
  if (check.note) row.appendChild(el("p", "note", check.note));
  return row;
}

function renderCommits(into: HTMLElement, checks: CheckState[]): void {
  let commit = "";
  let group: HTMLElement | null = null;
  for (const check of checks) {
    if (check.full !== commit) {
      commit = check.full;
      group = el("section", "commit");
      const head = el("div", "commit-head");
      head.appendChild(el("code", "", check.sha));
      head.appendChild(el("span", "subject", check.subject));
      head.appendChild(el("span", "when", check.date));
      group.appendChild(head);
      into.appendChild(group);
    }
    group?.appendChild(renderCheck(check));
  }
}

function render(): void {
  const body = document.getElementById("checksBody");
  const count = document.getElementById("checksCount");
  if (!body || !view) return;
  body.replaceChildren();

  const left = view.checks.filter((c) => c.verdict === null);
  if (count) {
    count.textContent =
      left.length === 0
        ? "nothing outstanding — everything on main has been looked at."
        : `${left.length} outstanding · ${view.runnable} of them name a command`;
  }

  // Said before the list, not after it: a main that has not been pulled
  // answers "nothing to check" about work it cannot see, which is the one
  // wrong answer this page can give.
  if (view.behind > 0) {
    const n = view.behind;
    body.appendChild(
      el(
        "p",
        "check-stale",
        `main is ${n} commit${n === 1 ? "" : "s"} behind origin — pull first.`,
      ),
    );
  }

  renderCommits(body, left);

  const done = view.checks.filter((c) => c.verdict !== null);
  if (done.length > 0) {
    const box = document.createElement("details");
    box.appendChild(el("summary", "", `already decided (${done.length})`));
    const inner = el("div");
    renderCommits(inner, done);
    box.appendChild(inner);
    body.appendChild(box);
  }

  renderBranches(body, view.branches, take);
}

/** Step through them: the first undecided one, highlighted and scrolled to. */
function next(): void {
  const rows = document.querySelectorAll<HTMLElement>(
    "#checksBody .check:not(.is-done):not(.branch)",
  );
  let seen = false;
  for (const row of rows) {
    const first = !seen && !row.classList.contains("now");
    row.classList.toggle("now", first);
    if (first) {
      seen = true;
      row.scrollIntoView({ block: "center" });
    }
  }
}

/**
 * Every outstanding check that names a command, in order. This is the half of
 * getting back to the machine that can look which does not need looking at —
 * the relay, a shape report, a suite the sandbox could not run — so it is one
 * button rather than a list of things to remember to type.
 */
async function runAll(bar: HTMLButtonElement): Promise<void> {
  bar.disabled = true;
  const jobs = (view?.checks ?? []).filter((c) => c.verdict === null && c.command);
  for (const check of jobs) {
    bar.textContent = `running ${check.command}…`;
    const result = await post("/api/checks/run", { sha: check.sha, text: check.text });
    take(result);
  }
  bar.textContent = "▶ RUN THE COMMANDS";
  bar.disabled = false;
  render();
}

export function bindChecks(): void {
  const sheet = document.getElementById("checks");
  const open = document.getElementById("checksOpen");
  const close = document.getElementById("checksClose");
  if (!sheet || !open || !close) return;

  const show = (on: boolean): void => {
    sheet.classList.toggle("on", on);
    if (!on) return;
    load()
      .then(render)
      .catch(() => {
        const body = document.getElementById("checksBody");
        body?.replaceChildren(
          el("p", "note", "no server — this list is read out of git, so it needs one."),
        );
      });
  };

  open.addEventListener("click", () => show(true));
  close.addEventListener("click", () => show(false));
  document.getElementById("checksNext")?.addEventListener("click", next);
  const all = document.getElementById("checksRunAll");
  if (all instanceof HTMLButtonElement) all.addEventListener("click", () => void runAll(all));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheet.classList.contains("on")) show(false);
  });

  // Read once at startup, unlike the backlog: the whole point is to be told
  // there is something waiting without having to ask.
  void load().catch(() => {});
}
