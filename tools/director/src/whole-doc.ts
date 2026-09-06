/**
 * The tab that renders one document whole — BORROWED (`docs/borrowed.md`).
 *
 * Every other tab on this sheet parses a document into named entries with a
 * badge, because every other tab is a list of *this game's* things. This one
 * is a study of two games that are not it, and its argument lives in a table
 * with a verdict column: the mapping is the content, and a parse that kept
 * only the names would throw away the half that took the reading. So the
 * markdown is rendered as written, the way `spec.ts` shows a spec file
 * verbatim rather than as rows.
 *
 * It is written for more than one caller and kept that way — TOWER DEFENCE and
 * CLAUDE VS CHATGPT were the other two until the owner took them off the
 * sheet, and the next whole document is a container id and a route.
 */

import { renderMarkdown } from "./markdown.js";

export async function renderWholeDoc(containerId: string, api: string): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await fetch(api);
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
