import { renderMarkdown } from "./markdown.js";
import type { WavesDoc } from "./waves-doc-api.js";

/**
 * DOCUMENTATION › WAVES: how the waves are generated, and every wave with its
 * numbers in a row — the owner, 15 October 2026: *a documentation page about
 * autogenerating waves and how long which wave takes, and the list of waves
 * for the full screen with more direct numbers, without opening their single
 * details.* The text is two files under `docs/spec/`, served by
 * `waves-doc-api.ts`; the table is the one `bun run waves:measure` writes.
 *
 * Lazy like every room in the sheet (`style-page.ts`): fetched and drawn on
 * the first click of its tab, once.
 */

let drawn = false;

async function renderWavesDoc(): Promise<void> {
  if (drawn) return;
  const body = document.getElementById("wavesDocBody");
  if (!body) return;
  drawn = true;
  const res = await fetch("/api/waves-doc");
  if (!res.ok) {
    drawn = false;
    body.textContent = `Could not read the wave documents: ${res.statusText}`;
    return;
  }
  const doc = (await res.json()) as WavesDoc;
  const guide = document.createElement("div");
  const today = document.createElement("div");
  today.className = "waves-today";
  renderMarkdown(guide, doc.guide);
  renderMarkdown(today, doc.today);
  // Both titles and every section under them in the contents menu, so EVERY
  // WAVE and the boss table are one click away (`contents-list.ts`).
  for (const [tag, depth] of [
    ["h3", "1"],
    ["h4", "2"],
  ] as const) {
    for (const h of [guide, today].flatMap((d) => Array.from(d.querySelectorAll(tag)))) {
      (h as HTMLElement).dataset.depth = depth;
    }
  }
  body.replaceChildren(guide, today);
}

export function bindWavesDocTab(): void {
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="waves"]')
    ?.addEventListener("click", () => void renderWavesDoc());
}
