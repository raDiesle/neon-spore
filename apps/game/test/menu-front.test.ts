import { describe, expect, it } from "bun:test";
import type { LinkStatus } from "@neon-spore/net";
import {
  type EntryActions,
  levelEntries,
  menuEntries,
  playEntries,
  testingEntries,
} from "../src/menu-entries.js";
import { paintLink } from "../src/menu-link.js";
import type { MenuDom } from "../src/menu-view.js";
import { newPartner, PARTNERS_KEPT } from "../src/partners.js";

/**
 * **The front page is three rows**, and what is behind each of them.
 *
 * The owner asked for the menu to stop being a list of everything: PLAY,
 * SETTINGS and — while there is a room — LEAVE ROOM, with the two of you
 * meeting behind PLAY and the rig behind three presses on the spore. HOW TO
 * PLAY stood second until 14 September 2026, when he took it off as well: the
 * intro scene says what its prose said, and the way to ask for that scene again
 * is a row on SETTINGS. Every row is a pure function of the actions it is
 * handed, so this drives the real lists rather than reading the file; the one
 * thing that needs a page is `paintLink`, and a recorder standing in for
 * `MenuDom` is enough to hold it to its rules.
 */

const actions: EntryActions = {
  carryOn: () => {},
  play: () => {},
  close: () => {},
  show: () => {},
  openRoom: () => {},
  rejoinWith: () => {},
  levelFor: () => {},
  openTuning: () => {},
  demoCount: 7,
};

const keys = (list: { key: string }[]): string[] => list.map((e) => e.key);
const labels = (list: { label: string }[]): string[] => list.map((e) => e.label);

const front = menuEntries(actions);
const play = playEntries(actions);
const levels = levelEntries();
const rig = testingEntries(actions);

describe("the front page", () => {
  it("is PLAY, SETTINGS and LEAVE ROOM, in that order", () => {
    expect(labels(front)).toEqual(["PLAY", "SETTINGS", "LEAVE ROOM"]);
  });

  it("carries no HOW TO PLAY row, and the menu has no such page left", () => {
    expect(labels(front)).not.toContain("HOW TO PLAY");
    expect(parts).not.toContain('"how"');
    expect(pages).not.toContain("buildHowTo");
  });

  it("carries no TESTING row: the rig is behind the spore", () => {
    expect(labels(front)).not.toContain("TESTING");
    expect(labels(play)).not.toContain("TESTING");
  });

  it("carries no RESUME row, because CONTINUE is the one row that means both", () => {
    for (const list of [front, play, rig]) expect(keys(list)).not.toContain("resume");
  });

  it("carries no WHAT THIS IS row: the intro is asked for from SETTINGS", () => {
    expect(labels(front)).not.toContain("WHAT THIS IS");
  });

  it("says talking is the key rather than naming a control scheme", () => {
    // The owner's wording, 14 September 2026. Set in caps and divided by middle
    // dots, which is the shape the line has always had — and short enough that
    // a 390 px phone reads it in one line, which the old one never was.
    expect(view).toContain('"TWO PEOPLE · TWO DEVICES · TALKING IS THE KEY"');
    expect(view).not.toContain("TALKING IS THE CONTROL SCHEME");
  });
});

describe("the page behind PLAY", () => {
  it("is a list of people to carry on with, then the way to meet somebody new", () => {
    // The owner asked for this on 14 September 2026. One row per partner the
    // store can hold, drawn empty and painted by the link, and NEW GAME under
    // them — where OPEN A ROOM was. REJOIN is gone: it was one row for the
    // most recent partner, which is what this list is four of.
    expect(keys(play).slice(0, PARTNERS_KEPT)).toEqual(["pair0", "pair1", "pair2", "pair3"]);
    expect(labels(play)).not.toContain("REJOIN");
    expect(labels(play)).not.toContain("OPEN A ROOM");
    expect(labels(play)[PARTNERS_KEPT]).toBe("NEW GAME");
  });

  /** DIFFICULTY left when the room screen took it: a new game's tempo is the
   * host's pick on step 4 (`join-room-step.ts`) and a pair's is behind their
   * gear. CONTINUE is still the way back to an open field and the mend of a
   * parted run (`docs/queue.md`). */
  it("keeps CONTINUE at the bottom and no DIFFICULTY row", () => {
    expect(labels(play).slice(PARTNERS_KEPT)).toEqual(["NEW GAME", "CONTINUE"]);
  });

  it("presses a row by where it is, not by who was on it when it was built", () => {
    const asked: number[] = [];
    const rows = playEntries({ ...actions, rejoinWith: (i) => asked.push(i) });
    rows[2]?.run();
    expect(asked).toEqual([2]);
  });

  /**
   * The owner put the difficulty on the pair's row on 14 September 2026: a
   * tempo is a thing two people settle between themselves, so it belongs where
   * the pair is rather than on a page a floor away. The gear is a second press
   * target *beside* the row's own button — a button inside a button is not a
   * thing (`menu-rows.ts`) — and it names the same index the row does.
   */
  it("carries a gear on every partner's row, opening the tempi for that pair", () => {
    const asked: number[] = [];
    const rows = playEntries({ ...actions, levelFor: (i) => asked.push(i) });
    for (const row of rows.slice(0, PARTNERS_KEPT)) row.aside?.run();
    expect(asked).toEqual([0, 1, 2, 3]);
  });

  it("puts a gear on nothing else, because nothing else is a pair", () => {
    for (const list of [front, play.slice(PARTNERS_KEPT), levels, rig]) {
      expect(list.filter((row) => row.aside !== undefined)).toEqual([]);
    }
  });

  it("hides the gear with the row it belongs to, and not on its own", () => {
    // `setEntry(key, { on: false })` takes a row off the page, and a gear left
    // standing beside a row that is gone is a press with nothing behind it.
    expect(rows).toContain('el("div", "entry-pair")');
    expect(rows).toContain('found.off.classList.toggle("off", !next.on)');
    expect(css).toContain("#menu .entry-pair.off {");
  });

  it("shares no key with either other list, so `setEntry` names one row", () => {
    const all = [...keys(front), ...keys(play), ...keys(levels), ...keys(rig)];
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("the three difficulties", () => {
  it("are the three the simulation has, in the order they get harder", () => {
    expect(keys(levels)).toEqual(["easy", "medium", "hard"]);
  });

  it("act on nothing by themselves: the question in front of them does", () => {
    // Changing the level takes the run back to the first wave, so each row is
    // behind the two-step LEAVE ROOM is behind (`menu-steps.ts`, `confirm.ts`).
    const ran: string[] = [];
    for (const row of levels) row.run();
    expect(ran).toEqual([]);
    expect(steps).toContain("bindTwoStep(row, level.word, () => level.choose(one))");
  });

  it("say which one the run is on, and what it means", () => {
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: status({ level: "hard" }),
      pairs: [],
      held: "",
      opened: false,
      wave: 0,
    });
    expect(r.label.get("hard")).toBe("HARD · ON");
    expect(r.label.get("easy")).toBe("EASY");
  });

  it("mark the pair's tempo when the page was opened through their gear", () => {
    // The same three rows serve both, so the mark is the only thing on the page
    // saying which of the two a press will change (`menu.ts`, `levelFor`).
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: null,
      pairs: [],
      held: "",
      opened: false,
      wave: 0,
      pairLevel: "easy",
    });
    expect(r.label.get("easy")).toBe("EASY · ON");
    expect(r.label.get("medium")).toBe("MEDIUM");
  });
});

/** A stand-in for the page: what `paintLink` said about each row, by key. */
function recorder(): {
  dom: MenuDom;
  on: Map<string, boolean>;
  desc: Map<string, string>;
  label: Map<string, string>;
  /** The last room the top button was painted with — "" is off the page, and
   * the sentinel is a paint that never happened. */
  rejoin: () => string;
} {
  const on = new Map<string, boolean>();
  const desc = new Map<string, string>();
  const label = new Map<string, string>();
  let rejoin = "\u0000";
  const dom = {
    setRejoin: (room: string) => {
      rejoin = room;
    },
    setEntry: (key: string, next: { desc?: string; on?: boolean; label?: string }) => {
      if (next.on !== undefined) on.set(key, next.on);
      if (next.desc !== undefined) desc.set(key, next.desc);
      if (next.label !== undefined) label.set(key, next.label);
    },
    setProgress: () => {},
    lockSeats: () => {},
    paintNames: () => {},
  } as unknown as MenuDom;
  return { dom, on, desc, label, rejoin: () => rejoin };
}

/** Somebody an older build remembered as a plain name: no wave, and the tempo
 * every device that has never chosen is already on. */
const david = newPartner("David");

const status = (over: Partial<LinkStatus>): LinkStatus =>
  ({ state: "playing", room: "ABCD", player: 1, peers: 2, ...over }) as LinkStatus;

describe("CONTINUE", () => {
  it("is off the page with no room at all", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [], held: "", opened: false, wave: 0 });
    expect(r.on.get("continue")).toBe(false);
  });

  it("is off the page while the other phone is still missing", () => {
    // The room's own head count, not a guess from the state: one phone in a
    // room is a pair that cannot start anything together (`LinkStatus.peers`).
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: status({ peers: 1 }),
      pairs: [],
      held: "",
      opened: false,
      wave: 0,
    });
    expect(r.on.get("continue")).toBe(false);
  });

  it("is offered once both phones are in the room", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairs: [], held: "", opened: false, wave: 0 });
    expect(r.on.get("continue")).toBe(true);
    expect(r.desc.get("continue")).toContain("Both of you press it");
  });

  it("says it is the way back when a field is already open under the menu", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairs: [], held: "", opened: true, wave: 6 });
    expect(r.desc.get("continue")).toBe("Back to wave 7.");
  });

  it("says what this phone is waiting for once it has pressed", () => {
    // The press is half of a start, so the menu stays up and the row is what
    // says so — there is nothing else on either screen that could.
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: status({ readyHere: true, readyThere: false }),
      pairs: [],
      held: "",
      opened: false,
      wave: 0,
    });
    expect(r.desc.get("continue")).toContain("Waiting for the other phone");
  });

  it("is the way out of a parted run, and says so instead", () => {
    // The one case where a field is open under the menu and going back to it is
    // worth nothing: the world on the other phone is no longer this one
    // (`link-run.ts`'s fingerprints). Both press it and the room stamps a fresh
    // beat zero on the wave the pair got to.
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: status({ state: "desync" }),
      pairs: [],
      held: "",
      opened: true,
      wave: 6,
    });
    expect(r.on.get("continue")).toBe(true);
    expect(r.desc.get("continue")).toContain("out of step");
    expect(r.desc.get("continue")).toContain("Both press it");
  });
});

const shell = await Bun.file(Bun.fileURLToPath(new URL("../src/shell.ts", import.meta.url))).text();
const menu = await Bun.file(Bun.fileURLToPath(new URL("../src/menu.ts", import.meta.url))).text();
const steps = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-steps.ts", import.meta.url)),
).text();

describe("what a parted run does to the two phones", () => {
  it("brings the menu up on the PLAY page, on the edge and not on the state", () => {
    // Both phones notice, because both exchange fingerprints — and it fires
    // once, so a menu the player closed to look at the field does not come
    // straight back up under their thumb.
    expect(shell).toContain('status.state === "desync" && parted !== true');
    expect(shell).toContain('menu?.open("play")');
  });

  it("makes CONTINUE the room's START rather than the way back to the field", () => {
    expect(menu).toContain('link?.state === "desync"');
    expect(menu).toContain("if (opened && !broken())");
    expect(menu).toContain("b.ready()");
    // And leaves the menu up on that press: half a start is not a start.
    expect(menu).toContain("b.ready();\n        paintLink();");
  });
});

/**
 * The two pieces of wiring that are markup rather than a list. There is no DOM
 * in this runner, so they are read out of the source the way `input-pc.test.ts`
 * and `how-to-play.test.ts` do.
 */
const view = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-view.ts", import.meta.url)),
).text();
const rows = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-rows.ts", import.meta.url)),
).text();
const css = await Bun.file(Bun.fileURLToPath(new URL("../src/menu.css", import.meta.url))).text();
const pages = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-pages.ts", import.meta.url)),
).text();
const parts = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-parts.ts", import.meta.url)),
).text();
const settings = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-settings.ts", import.meta.url)),
).text();

describe("the two doors that are not rows", () => {
  it("opens the rig by pressing the spore, and only after three presses", () => {
    expect(view).toContain("spore.svg.addEventListener");
    expect(view).toContain("RIG_TAPS");
    expect(view).toContain('show("testing")');
  });

  /**
   * The owner took the seat off the PLAY page on 15 September 2026. A pair
   * never chose one — the room deals the seats by arrival order, so the cards
   * were drawn locked every time two phones were in a room — and BOTH is one
   * device taking both bands, which is the rig and not a pair. So the cards
   * are on the rig's page, and a pair reads its seat off the room screen's
   * own pills (`join-words.ts` `seatWord`).
   */
  it("draws the seat cards on the rig's page and on neither of the other two", () => {
    expect(view).toContain("testingPage.append(seatBlock)");
    expect(view).not.toContain("playPage.append(seatBlock)");
    expect(view).not.toContain("rootPage.append(seatBlock)");
  });

  it("puts WHAT THIS IS on SETTINGS, which is the only way left to ask for the intro", () => {
    expect(settings).toContain("WHAT THIS IS");
    expect(settings).toContain("hooks.openIntro()");
  });
});

describe("SINGLE PLAYER", () => {
  it("is the rig's row and is off while there is a room", () => {
    expect(keys(rig)[0]).toBe("single");
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairs: [], held: "", opened: false, wave: 0 });
    expect(r.on.get("single")).toBe(false);
  });
});

/**
 * **BACK INTO THE GAME**, the one thing on the front page that is not a row.
 *
 * Two people are playing, one of them reloads, and the other phone loses
 * nothing — it is still in the room with the field up, waiting. Until this
 * existed the reloaded phone landed on four rows, and the only way back was
 * REJOIN a floor down behind PLAY, which needs both of them to have played
 * together before and both to have given names. A reload is neither a first
 * meeting nor a second one, and it should ask nothing of either of them.
 */
describe("the top button", () => {
  it("offers the room this device was just in, with no partner and no name", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [], held: "ACDE", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("ACDE");
    // And the list, which is the other question, is still empty without a partner.
    expect(r.on.get("pair0")).toBe(false);
  });

  it("is off the page with nothing to go back to", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [], held: "", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("");
  });

  it("is off the page in a room, where there is nothing to go back to", () => {
    // The commonest way to be looking at this page is with the field running
    // underneath it, and a button offering the room you are in is a button
    // that says the game is somewhere else.
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairs: [], held: "ACDE", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("");
  });

  it("is offered beside the list rather than instead of it", () => {
    // They answer different questions — where you just were, and who you play
    // with — and a pair who reload mid-session are owed both.
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [david], held: "ACDE", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("ACDE");
    expect(r.on.get("pair0")).toBe(true);
  });
});

/**
 * **The PLAY page's list of people to carry on with.**
 *
 * The rows are drawn empty and painted from what the device remembers, so what
 * is tested here is the painting: who is on the page, what their row says, and
 * the one case where the whole list comes off.
 */
describe("the list of partners", () => {
  const ada = { name: "Ada", furthest: 6, level: "hard" as const };

  it("says who and how far, in the owner's own sentence", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [ada], held: "", opened: false, wave: 0 });
    expect(r.on.get("pair0")).toBe(true);
    expect(r.label.get("pair0")).toBe("CONTINUE GAME WITH ADA · WAVE 7");
    expect(r.desc.get("pair0")).toContain("Hard");
    expect(r.desc.get("pair0")).toContain("no code to read out");
  });

  it("says no wave for somebody an older build remembered as a name", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [david], held: "", opened: false, wave: 0 });
    expect(r.label.get("pair0")).toBe("CONTINUE GAME WITH DAVID");
  });

  it("leaves the rows it has nobody for off the page", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [ada, david], held: "", opened: false, wave: 0 });
    expect(r.on.get("pair1")).toBe(true);
    expect(r.on.get("pair2")).toBe(false);
    expect(r.label.get("pair2")).toBeUndefined();
  });

  it("is off in a room, where the pair are already together", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairs: [ada], held: "", opened: false, wave: 0 });
    expect(r.on.get("pair0")).toBe(false);
  });
});
