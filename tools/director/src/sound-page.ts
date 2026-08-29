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

import {
  byFamily,
  CATALOGUE,
  Engine,
  families,
  judgeBand,
  planSound,
  type SoundDef,
  THEMES,
} from "@neon-spore/audio";
import { bindMusicPage } from "./music-page.js";
import { mountSheet } from "./session.js";
import { subjectArt } from "./sound-art.js";
import { NO_SUBJECT, subjectFor, triggerFor } from "./sound-link.js";
import { plotLegend, plotSound } from "./sound-plot.js";
import { bindTabs } from "./tabs.js";

const engine = new Engine({ volume: 0.8 });
let status: "all" | "bound" | "spare" = "all";

function line(cls: string, text: string): HTMLParagraphElement {
  const p = document.createElement("p");
  p.className = cls;
  p.textContent = text;
  return p;
}

/** `soft()` multiplies a gain, so a layer's own number can arrive as 0.0559999. */
const round = (n: number): string => String(Math.round(n * 1000) / 1000);

/** The recipe as the numbers that make it — the whole sound is this line. */
function recipe(def: SoundDef): string {
  return def.layers
    .map((l) => {
      const to = l.toFreq && l.toFreq !== l.freq ? `→${Math.round(l.toFreq)}` : "";
      const bits = [`${l.source} ${Math.round(l.freq)}${to}Hz`, `g${round(l.gain)}`];
      if (l.filter) bits.push(`${l.filter.type} ${Math.round(l.filter.freq)}`);
      if (l.ring) bits.push(`ring ${Math.round(l.ring.freq)}`);
      if (l.wobble) bits.push(`wob ${l.wobble.rate}`);
      if (l.repeat) bits.push(`×${l.repeat.times}`);
      return bits.join(" ");
    })
    .join("   ·   ");
}

function row(def: SoundDef): HTMLElement {
  const bound = def.status === "bound";
  const el = document.createElement("div");
  el.className = bound ? "sound is-built" : "sound";

  el.appendChild(subjectArt(subjectFor(def), bound, NO_SUBJECT[def.id]));

  const body = document.createElement("div");
  body.className = "sound-body";

  const head = document.createElement("div");
  head.className = "head";
  const play = document.createElement("button");
  play.type = "button";
  play.className = "playbtn";
  play.textContent = "▶";
  play.title = "play";
  play.addEventListener("click", () => {
    engine.unlock();
    engine.play(def);
  });
  head.appendChild(play);
  const name = document.createElement("span");
  name.className = "name";
  name.textContent = def.id;
  head.appendChild(name);
  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = bound ? "BOUND" : "SPARE";
  head.appendChild(stamp);
  body.appendChild(head);

  body.appendChild(line("note", def.blurb));
  body.appendChild(line("use", triggerFor(def)));
  if (def.pierce) body.appendChild(line("pierce", `COVERS A VOICE — ${def.pierce}`));

  const plan = planSound(def);
  const band = judgeBand(def, plan);
  body.appendChild(
    line(
      "kind",
      `${plan.duration.toFixed(2)}s · ${plan.voices.length} voices · costs the conversation ${band.seconds.toFixed(3)}s`,
    ),
  );

  const code = document.createElement("code");
  code.className = "recipe";
  code.textContent = recipe(def);
  body.appendChild(code);

  el.appendChild(body);
  el.appendChild(plotSound(plan));
  return el;
}

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
      renderAll();
    });
    bar.appendChild(b);
  }
  page.appendChild(bar);

  if (list.length === 0) {
    page.appendChild(line("note", "Nothing in this family with that filter on."));
    return;
  }
  for (const def of list) page.appendChild(row(def));
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
