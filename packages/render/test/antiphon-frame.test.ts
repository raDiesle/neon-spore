import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  ANTIPHON_SHIP,
  type AntiphonState,
  antiphonBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE ANTIPHON's body, its pits, its organ, its rail and its end, on all
 * three screens.
 *
 * The states are **set** rather than played to, `scuttle-frame.test.ts`'s
 * arrangement: `sim/test/antiphon.test.ts` proves the cycle, the pit, the
 * hardening and the ship, and what this file asks is whether every branch
 * of the picture is one a canvas accepts — bare, an organ up, twins, a rail
 * out, pitted, still, the ship, down, gone — and the two things nothing
 * else in the suite could catch: that the **organ** is on the pilot's
 * screen and not the navigator's, that the **rail** is on the navigator's
 * and not the pilot's; and that the eruption is a transient the next run
 * does not inherit.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** A world with the body up, stepped enough beats that every `*Beat` set in the past is one it has seen. */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("antiphon");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.antiphonOutBeats + 2); i++) step(world, []);
  return world;
}

/** The body bare: nothing standing, nothing on the rail, no pit. */
function bare(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("the antiphon wave grew no body");
  s.organs = [];
  s.rail = [];
  s.pits = [];
  s.extra = 0;
  s.cycleBeat = world.beat;
  s.stillBeat = -1;
  s.downBeat = -1;
  s.turnTicks = 0;
  s.heldP1 = false;
  s.heldP2 = false;
  return s;
}

/** One organ grown over column 4, red, on a rail of three. */
function grown(world: World, shape = 1): AntiphonState {
  const s = bare(world);
  s.organs = [{ shape, col: 4, color: "red", grownBeat: world.beat - CFG.antiphonGrowBeats }];
  s.rail = [
    { shape: 0, col: 2, color: "cyan" },
    { shape, col: 4, color: "red" },
    { shape: 3, col: 6, color: "red" },
  ];
  return s;
}

/** Their own ship, on a rail of hulls. */
function ship(world: World): AntiphonState {
  const s = grown(world, ANTIPHON_SHIP);
  for (const c of s.rail) c.shape = ANTIPHON_SHIP;
  s.pits = [0, 5, 9, 12, 2, 7];
  return s;
}

/** The right ship was fired a beat ago. */
function down(world: World): AntiphonState {
  const s = ship(world);
  s.organs = [];
  s.rail = [];
  s.downBeat = world.beat - 1;
  return s;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
): { calls: number; text: string; words: string[] } {
  const log: string[] = [];
  const texts: TextBox[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
      c.texts = texts;
    },
  });
  return { calls: ctx.calls, text: log.join("|"), words: texts.map((t) => t.text) };
}

const turnWord = (words: string[]): boolean => words.some((w) => w.includes("TURN"));
const pullWord = (words: string[]): string[] => words.filter((w) => w.includes("PULL"));

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, with the body bare and then set as `arrange` says. */
function frame(
  role: ViewRole,
  arrange: (world: World) => void,
): { calls: number; text: string; words: string[] } {
  const world = hung();
  bare(world);
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE ANTIPHON's body", () => {
  it.each(ROLES)("draws the body on %s", (role) => {
    const f = frame(role, () => {});
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).toContain(PALETTE.hull);
  });

  it("puts the organ on the pilot's screen and not the navigator's", () => {
    // An organ up, with nothing on the rail, is more of the hull's rim on the
    // screen shown the organ, and the same rim count on the screen that is
    // not — the window under it is hers, but it is drawn in the shield's tone.
    const alone = (role: ViewRole) =>
      frame(role, (w) => {
        grown(w).rail = [];
      }).text;
    const none = (role: ViewRole) => frame(role, () => {}).text;
    expect(count(alone("p1"), PALETTE.hullRim)).toBeGreaterThan(count(none("p1"), PALETTE.hullRim));
    expect(count(alone("test"), PALETTE.hullRim)).toBeGreaterThan(
      count(none("test"), PALETTE.hullRim),
    );
    expect(count(alone("p2"), PALETTE.hullRim)).toBe(count(none("p2"), PALETTE.hullRim));
    // Nor is an organ's shape or column on his screen given away by the
    // organ standing elsewhere: two shapes are two pictures, two columns one.
    const at = (col: number) =>
      frame("p1", (w) => {
        const s = grown(w);
        s.rail = [];
        for (const o of s.organs) o.col = col;
      }).text;
    expect(at(2)).toBe(at(6));
    expect(alone("p1")).not.toBe(frame("p1", (w) => (grown(w, 9).rail = [])).text);
  });

  it("puts the rail on the navigator's screen and not the pilot's", () => {
    // A rail out is the candidates' rims in their colours where it is shown,
    // and the window's thread under it; on the pilot's the same rail is nothing.
    const railed = (role: ViewRole) => frame(role, (w) => void grown(w)).text;
    const none = (role: ViewRole) => frame(role, () => {}).text;
    const rim = (text: string, hex: string) => count(text, hex);
    expect(rim(railed("p2"), PALETTE.redRim)).toBeGreaterThan(rim(none("p2"), PALETTE.redRim));
    expect(rim(railed("p2"), PALETTE.cyanRim)).toBeGreaterThan(rim(none("p2"), PALETTE.cyanRim));
    expect(rim(railed("test"), PALETTE.redRim)).toBeGreaterThan(rim(none("test"), PALETTE.redRim));
    expect(rim(railed("p1"), PALETTE.redRim)).toBe(rim(none("p1"), PALETTE.redRim));
    expect(count(railed("p2"), PALETTE.shieldRim)).toBeGreaterThan(
      count(railed("p1"), PALETTE.shieldRim),
    );
    // And nothing on her screen marks the organ: the organ moved to another
    // candidate's place is the same picture.
    const organIs = (col: number) =>
      frame("p2", (w) => {
        const s = grown(w);
        const c = s.rail.find((r) => r.col === col);
        if (c) s.organs = [{ ...c, grownBeat: w.beat - CFG.antiphonGrowBeats }];
      }).text;
    expect(organIs(4)).toBe(organIs(6));
  });

  it("stands twins a gap apart on the pilot's screen", () => {
    const one = frame("p1", (w) => void grown(w)).text;
    const two = frame("p1", (w) => {
      const s = grown(w);
      s.organs.push({ shape: 2, col: 6, color: "cyan", grownBeat: s.organs[0]?.grownBeat ?? 0 });
    }).text;
    expect(two).not.toBe(one);
    expect(count(two, PALETTE.hullRim)).toBeGreaterThan(count(one, PALETTE.hullRim));
  });

  it("draws the organ's grip with the word on the pilot's screen, and neither on the navigator's", () => {
    // The mark is drawn in the rock's grey whether or not a thumb holds it;
    // the word under it shares that same fill (`boss-cue-text.ts`) and shows
    // only while nothing holds the mark, so a count taken while the word can
    // also be showing cannot tell the mark from the word sitting under it —
    // a held mark can, since the word is gone and the mark is not
    // (`frame-colours.test.ts`'s EXCEPTIONS for why this pairing is the fix).
    const none = frame("p1", () => {});
    const up = frame("p1", (w) => void grown(w));
    expect(turnWord(up.words)).toBe(true);
    expect(turnWord(none.words)).toBe(false);
    const held = frame("p1", (w) => {
      grown(w).heldP2 = true;
    });
    expect(turnWord(held.words)).toBe(false);
    expect(held.text).not.toBe(up.text);
    expect(count(held.text, PALETTE.rock)).toBeGreaterThan(count(none.text, PALETTE.rock));
    // Her screen never takes the organ's mark. Her own rail carries a word in
    // that same grey (`antiphon-rail-grip.ts`), so the count is read with her
    // thumb resting on a candidate, which takes PULL away and leaves behind
    // only whatever the organ would have added.
    const hers = frame("p2", (w) => {
      grown(w).heldRail = 0;
    });
    expect(count(hers.text, PALETTE.rock)).toBe(count(frame("p2", () => {}).text, PALETTE.rock));
    expect(turnWord(hers.words)).toBe(false);
  });

  it("draws the organ turned as far as the thumb has turned it, on the pilot's screen only", () => {
    const turned = (role: ViewRole, ticks: number) =>
      frame(role, (w) => {
        grown(w).turnTicks = ticks;
      }).text;
    const quarter = Math.floor((TPB * CFG.antiphonTurnBeats) / 4);
    expect(turned("p1", quarter)).not.toBe(turned("p1", 0));
    expect(turned("p1", quarter)).not.toBe(turned("p1", quarter * 2));
    // A whole turn is upright again.
    expect(turned("p1", TPB * CFG.antiphonTurnBeats)).toBe(turned("p1", 0));
    // And the rail never turns: her screen is the same picture at any turn.
    expect(turned("p2", quarter)).toBe(turned("p2", 0));
  });

  it.each(ROLES)("sinks a pit into the body for every shape named, on %s", (role) => {
    const none = frame(role, () => {}).text;
    const pitted = frame(role, (w) => {
      bare(w).pits = [0, 5, 9];
    }).text;
    expect(count(pitted, PALETTE.dim)).toBeGreaterThan(count(none, PALETTE.dim));
  });

  it.each(ROLES)("goes glassy and still with every pit there, on %s", (role) => {
    const full = frame(role, (w) => {
      bare(w).pits = [0, 5, 9, 12, 2, 7];
    }).text;
    const still = frame(role, (w) => {
      const s = bare(w);
      s.pits = [0, 5, 9, 12, 2, 7];
      s.stillBeat = w.beat - 1;
    }).text;
    expect(still).not.toBe(full);
  });

  it.each(ROLES)("grows their own ship on a rail of hulls, on %s", (role) => {
    const f = frame(role, ship);
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).not.toBe(frame(role, (w) => (ship(w).organs = [])).text);
  });

  it.each(ROLES)("closes the body in and fades it once the right ship is named, on %s", (role) => {
    const stood = frame(role, ship);
    const going = frame(role, down);
    expect(count(going.text, PALETTE.hull)).toBeLessThan(count(stood.text, PALETTE.hull));
    const gone = frame(role, (w) => {
      down(w).downBeat = w.beat - CFG.antiphonOutBeats - 1;
    });
    const none = frame(role, (w) => {
      w.boss = null;
    });
    expect(gone.text).toBe(none.text);
  });

  it("rings the candidates she may still pull, and strokes the ones she has", () => {
    // The ring and the stroke are both the dim tone, so a count cannot tell
    // one from the other; what a crossing has to be is a *different picture*
    // on her screen and the same one on his, which is the leak that matters.
    const railed = (role: ViewRole) => frame(role, (w) => void grown(w)).text;
    const crossed = (role: ViewRole) =>
      frame(role, (w) => {
        grown(w).crossed = [0];
      }).text;
    expect(crossed("p2")).not.toBe(railed("p2"));
    expect(crossed("p1")).toBe(railed("p1"));
  });

  it("fills the ring under her thumb, and says nothing of it on his screen", () => {
    const held = (role: ViewRole) =>
      frame(role, (w) => {
        grown(w).heldRail = 0;
      });
    const loose = (role: ViewRole) => frame(role, (w) => void grown(w));
    expect(count(held("p2").text, PALETTE.text)).toBeGreaterThan(
      count(loose("p2").text, PALETTE.text),
    );
    expect(held("p1").text).toBe(loose("p1").text);
  });

  it("keeps the eruption as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.boss.antiphon.note([0, 5, 9]);
    fx.ingest([{ type: "antiphonBurst", col: 4, pits: 3 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx.boss.antiphon.erupting).toBe(true);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});

/**
 * **The organ's word is the field's one cue** (`docs/decisions.md` #34,
 * `render/src/boss-cue-text.ts`), for `sinew-frame.test.ts`' reason. The seat
 * is the pilot's twice over: the organ hangs on his screen alone
 * (`showsAntiphonOrgan`) and the cue asks again before it is drawn, so a screen
 * that somehow got the body would still not get the instruction.
 */
describe("THE ANTIPHON's word", () => {
  it("says the verb once on the pilot's screen, in the cue's grey", () => {
    const world = hung();
    grown(world);
    const { words, text } = drawn(world, "p1", 3);
    // Once and not twice: the kind of action here *is* `TURN`, and a kind line
    // repeating the verb is dropped (`boss-cue-text.ts`).
    expect(words.filter((w) => w === "TURN").length).toBe(1);
    expect(text).toContain(PALETTE.rock);
  });

  it("says nothing at all on the navigator's, who has no organ to turn", () => {
    const world = hung();
    grown(world);
    expect(turnWord(drawn(world, "p2", 3).words)).toBe(false);
  });

  it("says PULL once under her rail, and never on his screen", () => {
    // One word under the middle of the rail rather than one per candidate: a
    // word on the candidate she should cross off would be her own reading
    // handed back to her (`boss-cue-read-p.ts`).
    const world = hung();
    grown(world);
    expect(pullWord(drawn(world, "p2", 3).words).length).toBe(1);
    expect(pullWord(drawn(world, "p1", 3).words)).toEqual([]);
  });

  it("takes the word away while her thumb is on a candidate", () => {
    const world = hung();
    grown(world).heldRail = 1;
    expect(pullWord(drawn(world, "p2", 3).words)).toEqual([]);
  });
});
