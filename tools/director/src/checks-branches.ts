/**
 * The branches under the checks: what is left of the work once `main` has it.
 *
 * A branch is spent when its commits are on `main` and every `Check:` they
 * carry has been decided — not when it merged. Work reaches `main` before
 * anybody has looked at it, and a branch deleted at that moment takes with it
 * the only handle on which landing a look belongs to.
 */

import { type Branch, button, el, post, ready, reason } from "./checks-dom.js";

export function renderBranches(
  into: HTMLElement,
  branches: Branch[],
  take: (result: Record<string, unknown>) => void,
): void {
  const section = el("section", "commit");
  section.appendChild(el("div", "commit-head", "BRANCHES"));
  if (branches.length === 0) section.appendChild(el("p", "note", "only main."));
  for (const branch of branches) {
    // `branch` keeps NEXT off these: stepping through what to look at should
    // not stop on a branch, which is not a thing anybody looks at.
    const row = el("div", `check branch${ready(branch) ? "" : " is-done"}`);
    const head = el("div", "check-head");
    head.appendChild(el("span", "mark", ready(branch) ? "✓" : "·"));
    head.appendChild(el("span", "what", branch.name));
    const where = [branch.local ? "local" : "", branch.remote ? "origin" : ""].filter(Boolean);
    head.appendChild(el("span", "stamp", `${reason(branch)} · ${where.join(", ")}`));
    if (ready(branch)) {
      const drop = button("🗑 DELETE");
      drop.addEventListener("click", () => {
        drop.disabled = true;
        void post("/api/checks/clean", { name: branch.name }).then((result) => {
          // A refusal is the point of the button, not a failure of it: git
          // will not remove a worktree with edits in it, and says so here.
          if (result.error) {
            row.appendChild(el("pre", "check-out", String(result.error)));
            drop.disabled = false;
            return;
          }
          take(result);
        });
      });
      head.appendChild(drop);
    }
    row.appendChild(head);
    section.appendChild(row);
  }
  into.appendChild(section);
}
