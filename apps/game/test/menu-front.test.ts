import { describe, expect, it } from "bun:test";
import type { LinkStatus } from "@neon-spore/net";
import {
  type EntryActions,
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
  play: () => {},
  close: () => {},
  show: () => {},
  openRoom: () => {},
  rejoinWith: () => {},
  openTuning: () => {},
  demoCount: 7,
};

const keys = (list: { key: string }[]): string[] => list.map((e) => e.key);
const labels = (list: { label: string }[]): string[] => list.map((e) => e.label);

const front = menuEntries(actions);
const play = playEntries(actions);
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

  it("carries no RESUME row and no CONTINUE row: the chip is the way back to the field", () => {
    // RESUME went first, into CONTINUE; CONTINUE went on 17 September 2026,
    // the owner's call. A menu opened over a running field closes on its own
    // chip, and the two presses that begin a wave on two phones are the READY
    // holds on the room screen (`join-room.ts`).
    for (const list of [front, play, rig]) {
      expect(keys(list)).not.toContain("resume");
      expect(keys(list)).not.toContain("continue");
      expect(labels(list)).not.toContain("CONTINUE");
    }
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

  it("is spaced to read in one line on a 360 px phone, not only on the owner's", () => {
    // The owner's answer, 15 September 2026, out of four ways to buy the 18 px
    // the line was over by: keep the words and the type size, spend the
    // letter-spacing. 0.22em is 325 px of text against the 324 px box a 360 px
    // phone gives it — one line on a 390 px phone and two on every Galaxy and
    // every Pixel; 0.18em is 307 px. A number rather than a rendering, because
    // this runner has no DOM and the string does not reflow: the width is the
    // spacing, and the browser that measured both is in `docs/queue.md`.
    const tag = css.slice(css.indexOf("#menu .tag {"));
    expect(tag.slice(0, tag.indexOf("}"))).toContain("letter-spacing: 0.18em");
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
   * gear. CONTINUE left on 17 September 2026 (`menu-entries.ts` says where
   * each of its three answers went). */
  it("ends on NEW GAME, with no CONTINUE and no DIFFICULTY row under it", () => {
    expect(labels(play).slice(PARTNERS_KEPT)).toEqual(["NEW GAME"]);
  });

  it("presses a row by where it is, not by who was on it when it was built", () => {
    const asked: number[] = [];
    const rows = playEntries({ ...actions, rejoinWith: (i) => asked.push(i) });
    rows[2]?.run();
    expect(asked).toEqual([2]);
  });

  /**
   * **Nothing on this menu picks a tempo** (the owner, 15 September 2026): a
   * game that already exists does not change its difficulty. It is picked once,
   * by the host, on the room screen while the game is being made
   * (`join-room-step.ts`), and NEW GAME is the way to another. The gear that
   * stood at the end of a partner's row and the three tempi behind it went with
   * that rule, and so did the wrapper the two buttons shared.
   */
  it("offers no tempo anywhere: not a row, not a page, not a second press", () => {
    const every = [...front, ...play, ...rig];
    expect(keys(every)).not.toContain("easy");
    expect(labels(every).join(" ")).not.toContain("DIFFICULTY");
    // And no second press target for one to hide behind: a row is the bare
    // button it was before the gear (`menu-rows.ts`).
    expect(rows).toContain("page.append(button)");
    expect(rows).not.toContain("entry-pair");
    expect(css).not.toContain("#menu .gear");
    expect(parts).not.toContain('| "level"');
    // And no question in front of a tempo either: the two-step that asked
    // before changing one went with the rows (`menu-steps.ts`).
    expect(steps).not.toContain("level.choose");
  });

  it("shares no key with either other list, so `setEntry` names one row", () => {
    const all = [...keys(front), ...keys(play), ...keys(rig)];
    expect(new Set(all).size).toBe(all.length);
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

describe("the row CONTINUE used to be", () => {
  it("is painted nowhere, in a room or out of one", () => {
    // `paintLink` names every row it touches by key; a key it still reached
    // for would be a row it believes exists.
    for (const link of [null, status({}), status({ state: "desync" })]) {
      const r = recorder();
      paintLink({ dom: r.dom, link, pairs: [], held: "", wave: 6 });
      expect(r.on.has("continue")).toBe(false);
      expect(r.desc.has("continue")).toBe(false);
    }
  });
});

const shell = await Bun.file(Bun.fileURLToPath(new URL("../src/shell.ts", import.meta.url))).text();
const menu = await Bun.file(Bun.fileURLToPath(new URL("../src/menu.ts", import.meta.url))).text();
const bindings = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-bindings.ts", import.meta.url)),
).text();
const steps = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-steps.ts", import.meta.url)),
).text();

describe("what a parted run does to the two phones", () => {
  it("takes the menu down, on the edge and not on the state", () => {
    // Both phones notice, because both exchange fingerprints — and it fires
    // once, so a menu the player then opened to LEAVE ROOM is not taken from
    // under their thumb. The room screen opens itself on the fault
    // (`join.ts`), and its READY holds are the mend.
    expect(shell).toContain('if (status.state === "desync" && parted !== true) menu?.close();');
    expect(shell).not.toContain('joinScreen?.open(false);\n        menu?.open("play")');
  });

  it("asks nothing of the menu: no ready binding, no CONTINUE press", () => {
    expect(menu).not.toContain("b.ready()");
    expect(menu).not.toContain("carryOn");
    expect(bindings).not.toContain("ready:");
  });

  it("sends a QUIT in a room to the room screen, and one off the wire to PLAY", () => {
    expect(shell).toContain('if (link.status().state === "solo") {\n      menu?.open("play");');
    expect(shell).toContain("menu?.close();\n    joinScreen?.open(true);");
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
    paintLink({ dom: r.dom, link: status({}), pairs: [], held: "", wave: 0 });
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
    paintLink({ dom: r.dom, link: null, pairs: [], held: "ACDE", wave: 0 });
    expect(r.rejoin()).toBe("ACDE");
    // And the list, which is the other question, is still empty without a partner.
    expect(r.on.get("pair0")).toBe(false);
  });

  it("is off the page with nothing to go back to", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [], held: "", wave: 0 });
    expect(r.rejoin()).toBe("");
  });

  it("is off the page in a room, where there is nothing to go back to", () => {
    // The commonest way to be looking at this page is with the field running
    // underneath it, and a button offering the room you are in is a button
    // that says the game is somewhere else.
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairs: [], held: "ACDE", wave: 0 });
    expect(r.rejoin()).toBe("");
  });

  it("is offered beside the list rather than instead of it", () => {
    // They answer different questions — where you just were, and who you play
    // with — and a pair who reload mid-session are owed both.
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [david], held: "ACDE", wave: 0 });
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
    paintLink({ dom: r.dom, link: null, pairs: [ada], held: "", wave: 0 });
    expect(r.on.get("pair0")).toBe(true);
    expect(r.label.get("pair0")).toBe("CONTINUE GAME WITH ADA · WAVE 7");
    expect(r.desc.get("pair0")).toContain("Hard");
    expect(r.desc.get("pair0")).toContain("no code to read out");
  });

  it("says no wave for somebody an older build remembered as a name", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [david], held: "", wave: 0 });
    expect(r.label.get("pair0")).toBe("CONTINUE GAME WITH DAVID");
  });

  it("leaves the rows it has nobody for off the page", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairs: [ada, david], held: "", wave: 0 });
    expect(r.on.get("pair1")).toBe(true);
    expect(r.on.get("pair2")).toBe(false);
    expect(r.label.get("pair2")).toBeUndefined();
  });

  it("is off in a room, where the pair are already together", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairs: [ada], held: "", wave: 0 });
    expect(r.on.get("pair0")).toBe(false);
  });
});
