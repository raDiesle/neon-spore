/**
 * The BORROWED tab: `docs/borrowed.md` rendered whole.
 *
 * Every other tab on this sheet parses a document into named entries with a
 * badge, because every other tab is a list of *this game's* things. This one is
 * a study of two other games, and its argument lives in a table with a verdict
 * column — the mapping is the content, and a parse that kept only the names
 * would throw away the half that took the reading. So it renders the markdown
 * as written, the way `spec.ts` shows a spec file verbatim rather than as rows.
 */

import { renderMarkdown } from "./markdown.js";

export async function renderBorrowed(): Promise<void> {
  const container = document.getElementById("borrowedDoc");
  if (!container) return;

  try {
    const res = await fetch("/api/borrowed");
    if (!res.ok) throw new Error(res.statusText);
    const { text } = (await res.json()) as { text: string };
    container.replaceChildren();
    renderMarkdown(container, text);
  } catch {
    container.replaceChildren();
    const msg = document.createElement("p");
    msg.textContent = "no server — read only";
    msg.style.color = "var(--dim)";
    container.appendChild(msg);
  }
}
