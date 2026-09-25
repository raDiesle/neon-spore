/**
 * THE SOUND CATALOGUE: its own sheet, the way the backlog has one.
 *
 * It answers three questions. What does this sound like — press it. What is
 * attached to it — the picture beside it, drawn out of the game's own geometry
 * (`sound-art.ts`). And what is built and not yet spent: two thirds of the
 * catalogue is `spare`, finished and unclaimed, so a creature that is still a
 * name in the spec can be listened to before anyone writes it.
 *
 * The BOUND stamp is not maintained by hand. `packages/audio/test/catalogue.test.ts`
 * reads the binding files and fails if a sound claims to be wired and is not,
 * or is played and claims to be spare.
 */

import { byFamily, CATALOGUE, Engine, families, type SoundDef, THEMES } from "@neon-spore/audio";
import { bindMusicPage } from "./music-page.js";
import { readRemembered, writeRemembered } from "./remembered.js";
import { mountSheet } from "./session.js";
import { plotLegend } from "./sound-plot.js";
import { line, row } from "./sound-row.js";
import { bindTabs } from "./tabs.js";

const engine = new Engine({ volume: 0.8 });
type Status = "all" | "bound" | "spare";
/** Which status the pages show, remembered across a reload (`remembered.ts`). */
const STATUS_KEY = "sound-status";
const stored = readRemembered(STATUS_KEY);
let status: Status = stored === "bound" || stored === "spare" ? stored : "all";

function shown(family: string): SoundDef[] {
  const list = family === "all" ? [...CATALOGUE] : byFamily(family as SoundDef["family"]);
  return status === "all" ? list : list.filter((s) => s.status === status);
}

function renderPage(family: string): void {
  const page = document.getElementById(`sound-${family}`);
  if (!page) return;
  page.replaceChildren();

  const list = shown(family);
  const bound = list.filter((s) => s.status === "bound").length;
  page.appendChild(
    line(
      "note",
      `${list.length} sounds — ${bound} wired into the game, ${list.length - bound} built and unspent. ` +
        "The red stripe on each plot is the speech band: a sound crossing it is one the pair " +
        "hears instead of each other, and almost none of them do.",
    ),
  );

  const key = document.createElement("div");
  key.className = "plotkey";
  key.appendChild(plotLegend());
  key.appendChild(line("note", "Every plot to the right of a sound reads on these axes."));
  page.appendChild(key);

  const bar = document.createElement("div");
  bar.className = "soundbar";
  for (const [label, value] of [
    ["ALL", "all"],
    ["BOUND", "bound"],
    ["SPARE", "spare"],
  ] as const) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.className = status === value ? "on" : "";
    b.addEventListener("click", () => {
      status = value;
      writeRemembered(STATUS_KEY, value === "all" ? null : value);
      renderAll();
    });
    bar.appendChild(b);
  }
  page.appendChild(bar);

  if (list.length === 0) {
    page.appendChild(line("note", "Nothing in this family with that filter on."));
    return;
  }
  for (const def of list) page.appendChild(row(def, engine));
}

/**
 * Every family's page. Cheap enough to redo whole when the filter changes.
 *
 * MUSIC is not among them and is not redrawn here: it holds a running player,
 * and a redraw for the sake of a BOUND/SPARE filter that does not apply to it
 * would cut off whatever is playing.
 */
function renderAll(): void {
  renderPage("all");
  for (const family of families()) renderPage(family);
}

/**
 * The sheet. Built on first open rather than at boot: 190 rows, each with a
 * plotted SVG and a contour, is not work a session that came here to place
 * creatures on a grid should pay for.
 */
export function bindSoundPage(): void {
  const sheet = document.getElementById("soundboard");
  const open = document.getElementById("soundOpen");
  const close = document.getElementById("soundClose");
  if (!sheet || !open || !close) return;

  // Markup first, then the shared binder. `tabs.ts` already knows how a tab
  // bar behaves; a second copy of that here would be one more thing to keep
  // in step with the backlog's.
  buildTabs();
  bindTabs("#soundTabs", "soundpage", "sound-");

  let drawn = false;
  let hush: () => void = () => {};
  // `mountSheet` (`session.ts`) wires open/close/Escape, the family bar built
  // above and the restoring click to the URL — `onOpen`/`onClose` are this
  // sheet's own one-time draw and its running player.
  mountSheet({
    name: "sound",
    sheet,
    open,
    close,
    innerBar: "#soundTabs",
    onOpen: () => {
      if (!drawn) {
        drawn = true;
        renderAll();
        hush = bindMusicPage(engine);
      }
      // A browser will not start audio before a gesture, and opening the
      // sheet is one. Doing it here means the first ▶ plays rather than arms.
      engine.unlock();
    },
    onClose: () => hush(),
  });
}

/** One tab and one page per family, from the catalogue rather than from markup. */
function buildTabs(): void {
  const tabs = document.getElementById("soundTabs");
  const body = document.getElementById("soundBody");
  if (!tabs || !body) return;

  const make = (family: string, label: string, first: boolean): void => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.dataset.tab = family;
    tab.textContent = label;
    if (first) tab.className = "on";
    tabs.appendChild(tab);

    const page = document.createElement("div");
    page.className = first ? "soundpage on" : "soundpage";
    page.id = `sound-${family}`;
    body.appendChild(page);
  };

  make("all", `EVERYTHING ${CATALOGUE.length}`, true);
  for (const family of families()) {
    make(family, `${family.toUpperCase()} ${byFamily(family).length}`, false);
  }
  // Last, and apart: the music is candidates rather than catalogue, and it is
  // the one tab where pressing a button starts something that keeps going.
  make("music", `MUSIC ${THEMES.length} ★`, false);
}
