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

/**
 * **The front page is four rows**, and what is behind each of them.
 *
 * The owner asked for the menu to stop being a list of everything: PLAY, HOW TO
 * PLAY, SETTINGS and — while there is a room — LEAVE ROOM, with the two of you
 * meeting behind PLAY and the rig behind three presses on the spore. Every row
 * is a pure function of the actions it is handed, so this drives the real lists
 * rather than reading the file; the one thing that needs a page is `paintLink`,
 * and a recorder standing in for `MenuDom` is enough to hold it to its rules.
 */

const actions: EntryActions = {
  carryOn: () => {},
  play: () => {},
  close: () => {},
  show: () => {},
  openRoom: () => {},
  rejoin: () => {},
  openTuning: () => {},
  demoCount: 7,
  openIntro: () => {},
};

const keys = (list: { key: string }[]): string[] => list.map((e) => e.key);
const labels = (list: { label: string }[]): string[] => list.map((e) => e.label);

const front = menuEntries(actions);
const play = playEntries(actions);
const levels = levelEntries();
const rig = testingEntries(actions);

describe("the front page", () => {
  it("is PLAY, HOW TO PLAY, SETTINGS and LEAVE ROOM, in that order", () => {
    expect(labels(front)).toEqual(["PLAY", "HOW TO PLAY", "SETTINGS", "LEAVE ROOM"]);
  });

  it("carries no TESTING row: the rig is behind the spore", () => {
    expect(labels(front)).not.toContain("TESTING");
    expect(labels(play)).not.toContain("TESTING");
  });

  it("carries no RESUME row, because CONTINUE is the one row that means both", () => {
    for (const list of [front, play, rig]) expect(keys(list)).not.toContain("resume");
  });

  it("carries no WHAT THIS IS row: the six pages are read from HOW TO PLAY", () => {
    expect(labels(front)).not.toContain("WHAT THIS IS");
  });
});

describe("the page behind PLAY", () => {
  it("is where the two of you meet: CONTINUE, the difficulty, REJOIN and the code", () => {
    expect(labels(play)).toEqual(["CONTINUE", "DIFFICULTY", "REJOIN", "OPEN A ROOM"]);
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
    expect(steps).toContain('bindTwoStep(row, "START AGAIN"');
  });

  it("say which one the run is on, and what it means", () => {
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: status({ level: "hard" }),
      pairRoom: "",
      held: "",
      opened: false,
      wave: 0,
    });
    expect(r.label.get("hard")).toBe("HARD · ON");
    expect(r.label.get("easy")).toBe("EASY");
    expect(r.desc.get("level")).toContain("Hard");
    expect(r.desc.get("level")).toContain("starts the run again");
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

const status = (over: Partial<LinkStatus>): LinkStatus =>
  ({ state: "playing", room: "ABCD", player: 1, peers: 2, ...over }) as LinkStatus;

describe("CONTINUE", () => {
  it("is off the page with no room at all", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairRoom: "", held: "", opened: false, wave: 0 });
    expect(r.on.get("continue")).toBe(false);
  });

  it("is off the page while the other phone is still missing", () => {
    // The room's own head count, not a guess from the state: one phone in a
    // room is a pair that cannot start anything together (`LinkStatus.peers`).
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: status({ peers: 1 }),
      pairRoom: "",
      held: "",
      opened: false,
      wave: 0,
    });
    expect(r.on.get("continue")).toBe(false);
  });

  it("is offered once both phones are in the room", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairRoom: "", held: "", opened: false, wave: 0 });
    expect(r.on.get("continue")).toBe(true);
    expect(r.desc.get("continue")).toContain("Both of you press it");
  });

  it("says it is the way back when a field is already open under the menu", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairRoom: "", held: "", opened: true, wave: 6 });
    expect(r.desc.get("continue")).toBe("Back to wave 7.");
  });

  it("says what this phone is waiting for once it has pressed", () => {
    // The press is half of a start, so the menu stays up and the row is what
    // says so — there is nothing else on either screen that could.
    const r = recorder();
    paintLink({
      dom: r.dom,
      link: status({ readyHere: true, readyThere: false }),
      pairRoom: "",
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
      pairRoom: "",
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
const pages = await Bun.file(
  Bun.fileURLToPath(new URL("../src/menu-pages.ts", import.meta.url)),
).text();

describe("the two doors that are not rows", () => {
  it("opens the rig by pressing the spore, and only after three presses", () => {
    expect(view).toContain("spore.svg.addEventListener");
    expect(view).toContain("RIG_TAPS");
    expect(view).toContain('show("testing")');
  });

  it("draws the seat cards on the PLAY page rather than on the front one", () => {
    expect(view).toContain("playPage.append(seatBlock)");
    expect(view).not.toContain("rootPage.append(seatBlock)");
  });

  it("puts WHAT THIS IS at the top of HOW TO PLAY", () => {
    const howTo = pages.slice(pages.indexOf("export function buildHowTo"));
    expect(howTo).toContain("WHAT THIS IS");
    expect(howTo).toContain("openIntro");
  });
});

describe("SINGLE PLAYER", () => {
  it("is the rig's row and is off while there is a room", () => {
    expect(keys(rig)[0]).toBe("single");
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairRoom: "", held: "", opened: false, wave: 0 });
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
    paintLink({ dom: r.dom, link: null, pairRoom: "", held: "ACDE", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("ACDE");
    // And REJOIN, which is the other question, is still off without a partner.
    expect(r.on.get("rejoin")).toBe(false);
  });

  it("is off the page with nothing to go back to", () => {
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairRoom: "", held: "", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("");
  });

  it("is off the page in a room, where there is nothing to go back to", () => {
    // The commonest way to be looking at this page is with the field running
    // underneath it, and a button offering the room you are in is a button
    // that says the game is somewhere else.
    const r = recorder();
    paintLink({ dom: r.dom, link: status({}), pairRoom: "", held: "ACDE", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("");
  });

  it("is offered beside REJOIN rather than instead of it", () => {
    // They answer different questions — where you just were, and who you play
    // with — and a pair who reload mid-session are owed both.
    const r = recorder();
    paintLink({ dom: r.dom, link: null, pairRoom: "WXY3", held: "ACDE", opened: false, wave: 0 });
    expect(r.rejoin()).toBe("ACDE");
    expect(r.on.get("rejoin")).toBe(true);
  });
});
