import type { MechanicId } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";
import type { DemoRow } from "./demo-menu.js";
import { buildControls } from "./menu-controls.js";
import { buildDemos, buildHowTo, buildWaves } from "./menu-pages.js";
import { backButton, el, type MenuPage, sporeSvg } from "./menu-parts.js";
import { buildSeats } from "./menu-seats.js";
import { buildSettings, type SettingsHooks } from "./menu-settings.js";
import { whoLine } from "./menu-who.js";

/**
 * The menu's markup, built here rather than written into index.html.
 *
 * It is the front door now: a plain address lands here, and the field is one
 * press away rather than the other way round. So the root page has to answer
 * three questions at a glance — what happens if I press the top button, who am
 * I at this table, and is the other phone here — and the seat is a card with
 * the job written on it rather than two letters in a row of three.
 *
 * **The front page is four rows**, on the owner's instruction: PLAY, HOW TO
 * PLAY, SETTINGS and — while there is a room — LEAVE ROOM. Everything that used
 * to stand beside them is one press down. PLAY is where two people meet, and it
 * carries the seat cards, because choosing a seat is part of meeting rather
 * than something to do while standing in the hall.
 *
 * **The rig has no row at all.** It is opened by pressing the spore over the
 * wordmark three times inside `RIG_TAPS_MS`, and nothing on the page says so:
 * it is not a way into the game, and the one person who wants it knows where it
 * is. A fourth press does nothing new, because the count is cleared the moment
 * the page opens.
 */

export interface MenuEntry {
  /** How `setEntry` names it afterwards. Stable, and not the label. */
  key: string;
  label: string;
  desc: string;
  run: () => void;
}

export interface MenuHandlers {
  entries: MenuEntry[];
  /** The rows behind PLAY, where the two of you meet — see `menu-entries.ts`. */
  play: MenuEntry[];
  /** The three difficulties, on their own page behind PLAY's DIFFICULTY row. */
  levels: MenuEntry[];
  /** The rig's own rows, on the page behind the spore — see `menu-entries.ts`. */
  testing: MenuEntry[];
  /** One row per mechanic — see `demo-menu.ts`. */
  demos: DemoRow[];
  /** A wave was picked out of the list. */
  onWave: (wave: number) => void;
  /** A demonstration was picked out of the list. */
  onDemo: (id: MechanicId) => void;
  onSeat: (role: ViewRole) => void;
  /** The six pages, opened from the top of HOW TO PLAY (`intro.ts`). */
  openIntro: () => void;
  /** What the settings page needs of the rest of the app. */
  settings: SettingsHooks;
}

export interface MenuDom {
  root: HTMLElement;
  show: (page: MenuPage) => void;
  /** The seat is the view switch's, so the menu is told rather than deciding. */
  paintSeat: (role: ViewRole) => void;
  /**
   * A room hands the seat out, and a device showing the other player's band is
   * a device whose touches go nowhere — so while there is one, the cards say
   * which seat this is instead of offering a choice that cannot be taken.
   */
  lockSeats: (locked: boolean, why: string) => void;
  /** The two people's names on the two seat cards (`menu-seats.ts`). */
  paintNames: (names: readonly [string, string]) => void;
  /** Re-label an entry, or take it off the page. Named by `key`. */
  setEntry: (key: string, next: { label?: string; desc?: string; on?: boolean }) => void;
  /**
   * The button an entry is, for the one caller that needs to put something in
   * front of it rather than beside it — LEAVE ROOM asks before it hangs up on
   * the other player (`confirm.ts`), and asking happens in the entry's place.
   */
  entryRoot: (key: string) => HTMLElement | undefined;
  /**
   * The line under the tagline saying how far this device has got. An empty
   * string takes it off the page, which is a device that has never played.
   */
  setProgress: (line: string) => void;
  /** The spore breathes only while the menu is up. */
  animate: (on: boolean) => void;
}

/** How many presses on the spore open the rig, and how long they have. */
const RIG_TAPS = 3;
const RIG_TAPS_MS = 2000;

export function buildMenu(h: MenuHandlers): MenuDom {
  const root = el("div");
  root.id = "menu";
  const scroll = el("div", "scroll");
  const inner = el("div", "inner");
  root.append(el("div", "sky"), scroll);
  scroll.append(inner);

  const spore = sporeSvg();
  const title = el("h1", undefined, "NEON SPORE");
  title.dataset.text = "NEON SPORE";
  // How far this device has got, under the tagline. Empty and hidden until
  // there is something to say — see `progress.ts`.
  const progress = el("p", "progress");
  progress.hidden = true;
  inner.append(
    spore.svg,
    title,
    el("p", "tag", "TWO PEOPLE · TWO DEVICES · TALKING IS THE CONTROL SCHEME"),
    progress,
  );

  const rootPage = el("div", "page on");
  const playPage = el("div", "page");
  const levelPage = el("div", "page");
  const testingPage = el("div", "page");
  const pages: Record<MenuPage, HTMLElement> = {
    root: rootPage,
    play: playPage,
    level: levelPage,
    testing: testingPage,
    // Both jump lists are opened from TESTING now, so both go back to it.
    waves: buildWaves((p) => show(p), h.onWave, "testing"),
    demos: buildDemos((p) => show(p), h.demos, h.onDemo, "testing"),
    keys: buildControls((p) => show(p), "settings"),
    how: buildHowTo((p) => show(p), h.openIntro),
    settings: buildSettings((p) => show(p), h.settings),
  };
  const show = (page: MenuPage): void => {
    for (const [name, node] of Object.entries(pages)) node.classList.toggle("on", name === page);
    scroll.scrollTop = 0;
  };

  // One map over all three lists: a key is a key wherever its row is drawn, so
  // `setEntry("continue", …)` goes on reaching CONTINUE after it moved behind
  // PLAY. No key is on two lists, and `menu-entries.ts` is where that is kept
  // true — the rig's first row is `single` because `play` is the front page's.
  const entries = new Map<string, { root: HTMLElement; label: HTMLElement; desc: HTMLElement }>();
  const drawEntries = (list: MenuEntry[], page: HTMLElement): void => {
    list.forEach((entry, i) => {
      const button = el("button", "entry");
      button.type = "button";
      button.style.setProperty("--i", String(i));
      const mark = el("span", "mark", "▸");
      // Decoration. Without this it is read out in front of the entry's name.
      mark.ariaHidden = "true";
      const label = el("span", "label", entry.label);
      const desc = el("span", "desc", entry.desc);
      button.append(mark, label, desc);
      button.addEventListener("click", entry.run);
      page.append(button);
      entries.set(entry.key, { root: button, label, desc });
    });
  };
  drawEntries(h.entries, rootPage);

  playPage.append(
    backButton((p) => show(p)),
    el("h2", undefined, "PLAY"),
    whoLine(),
  );
  drawEntries(h.play, playPage);

  // Back to PLAY and not to the front page: a page reached one floor down must
  // not put the reader two floors up (`menu-parts.ts`).
  levelPage.append(
    backButton((p) => show(p), "play"),
    el("h2", undefined, "DIFFICULTY"),
  );
  drawEntries(h.levels, levelPage);
  levelPage.append(
    el(
      "p",
      "foot",
      "Only the speed changes: everything falls a tile a beat, so the setting is the beat. Changing it starts the run again from the first wave.",
    ),
  );

  testingPage.append(
    backButton((p) => show(p)),
    el("h2", undefined, "TESTING"),
  );
  drawEntries(h.testing, testingPage);
  testingPage.append(
    el(
      "p",
      "foot",
      "One device, both seats. Two people on two phones start from the front page instead.",
    ),
  );

  // Under the three rows rather than on the front page: the seat is a thing the
  // two of you settle while you are meeting, and a card offering a job to
  // somebody who has not said who they are playing with was the front page's
  // biggest block of text.
  const { seatBlock, paintSeat, lockSeats, paintNames } = buildSeats(h.onSeat);
  playPage.append(seatBlock);

  // The rig's door: three presses on the spore, inside a couple of seconds.
  // `Date.now` and not a frame clock — this is a person's hand on a title
  // screen, and nothing here reaches the simulation.
  let taps: number[] = [];
  spore.svg.addEventListener("click", () => {
    const now = Date.now();
    taps = taps.filter((t) => now - t < RIG_TAPS_MS);
    taps.push(now);
    if (taps.length < RIG_TAPS) return;
    taps = [];
    show("testing");
  });

  inner.append(
    pages.root,
    pages.play,
    pages.level,
    pages.testing,
    pages.waves,
    pages.demos,
    pages.keys,
    pages.how,
    pages.settings,
  );
  document.body.append(root);

  return {
    root,
    show,
    paintSeat,
    lockSeats,
    paintNames,
    setEntry: (key, next) => {
      const found = entries.get(key);
      if (!found) return;
      if (next.label !== undefined) found.label.textContent = next.label;
      if (next.desc !== undefined) found.desc.textContent = next.desc;
      if (next.on !== undefined) found.root.classList.toggle("off", !next.on);
    },
    entryRoot: (key) => entries.get(key)?.root,
    setProgress: (line) => {
      progress.textContent = line;
      progress.hidden = line === "";
    },
    animate: spore.animate,
  };
}
