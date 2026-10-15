import { renderMarkdown } from "./markdown.js";
import type { WavesDoc } from "./waves-doc-api.js";
import { waveTable } from "./waves-table.js";
import { playFromTable } from "./waves-table-play.js";

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
/** Opens a wave by id on the director's screen and plays it (`main.ts`). */
let play: ((id: string) => void) | undefined;

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
  liveTable(today, doc);
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

/**
 * EVERY WAVE and THE BOSSES AGAINST THE BANDS, as the markdown has them,
 * replaced by the one live table under EVERY WAVE's own heading — the owner,
 * 15 October 2026, asked for the two merged (`waves-table.ts`).
 */
function liveTable(today: HTMLElement, doc: WavesDoc): void {
  const headings = Array.from(today.querySelectorAll("h2, h3, h4, h5"));
  const every = headings.find((h) => h.textContent?.trim() === "Every wave");
  if (!every) return;
  while (every.nextSibling) every.nextSibling.remove();
  // The heading stays where the markdown put it, but its parent may be a
  // wrapper, so whatever follows that wrapper goes too.
  let up: Element | null = every.parentElement;
  while (up && up !== today) {
    while (up.nextSibling) up.nextSibling.remove();
    up = up.parentElement;
  }
  const onWave = play
    ? (index: number) => {
        const id = doc.waves[index]?.id;
        if (id && play) playFromTable(id, play);
      }
    : undefined;
  every.after(waveTable(doc.waves, doc.clear, onWave).element);
}

export function bindWavesDocTab(playWave?: (id: string) => void): void {
  play = playWave;
  document
    .querySelector<HTMLButtonElement>('#statesTabs button[data-tab="waves"]')
    ?.addEventListener("click", () => void renderWavesDoc());
}
