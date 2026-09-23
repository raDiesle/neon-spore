import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HiveState,
  hiveBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { handleThumb } from "../src/guide-hand.js";
import { rgba } from "../src/hex.js";
import { hiveClenchRise } from "../src/hive-hold.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * THE HIVE's mass, its sites shut, swelling, open and scarred, and its end,
 * on all three screens.
 *
 * The states are **set** rather than played to, `scuttle-frame.test.ts`'s
 * arrangement: `sim/test/hive.test.ts` proves the cadence, the seal, the
 * provoke and the spill, and what this file asks is whether every branch of
 * the picture is one a canvas accepts — shut, a breach open, a scar, a site
 * swelling, twins swelling, down, out — and the two things nothing else in
 * the suite could catch: that a breach's **colour** is on the pilot's screen
 * and not the navigator's, that the **swell** is on the navigator's and not
 * the pilot's; and that the clench is a transient the next run does not
 * inherit.
 */

/**
 * The canvas, and one throwaway frame a seat: the first frame drawn at a
 * size lays down a sprite the frames after it `drawImage`, and two pictures
 * this file says are the same have to be two frames after that one.
 */
beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/**
 * A world with the mass in, stepped enough beats that every `*Beat` field an
 * arrangement sets in the past is still a beat the world has seen — a
 * `downBeat` before beat zero would read as a mass that hangs. That is past
 * the look, so the first site has opened; `shut` closes it again.
 */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("hive");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.hiveOutBeats + 2); i++) step(world, []);
  return world;
}

/** The mass with every site shut and the look just begun: nothing open, nothing swelling. */
function shut(world: World): HiveState {
  const s = hiveBoss(world);
  if (s === null) throw new Error("the hive wave hung no mass");
  s.opened = 0;
  s.sealed = s.sealed.map(() => false);
  s.openBeat = world.beat;
  s.spillBeat = world.beat;
  s.downBeat = -1;
  return s;
}

/** The first `n` sites open, every one red, the next opening a whole cadence away. */
function open(world: World, n = 2): HiveState {
  const s = shut(world);
  s.opened = n;
  for (let i = 0; i < n; i++) s.colors[i] = "red";
  s.openBeat = world.beat;
  return s;
}

/** Two sites open and the third a beat into its swell, so the swell is more than nothing. */
function swelling(world: World, n = 2): HiveState {
  const s = open(world, n);
  s.openBeat = world.beat - (CFG.hiveOpenBeats - CFG.hiveSwellBeats) - 1;
  return s;
}

/** The first three opened and sealed again: three scars, nothing open. */
function scarred(world: World): HiveState {
  const s = open(world, 3);
  for (let i = 0; i < 3; i++) s.sealed[i] = true;
  return s;
}

/**
 * The mass clenched, a beat into it, with two breaches open behind it: the
 * state the pilot is shown and hauls at (`hive-grip.ts`).
 */
function clenched(world: World, hauled = 0): HiveState {
  const s = open(world, 2);
  s.phase = "clench";
  s.phaseBeat = world.beat - 1;
  s.haulMilli = hauled;
  return s;
}

/** A swelling lobe with the navigator's thumb on it, a beat in. */
function pinched(world: World, i = 2): HiveState {
  const s = swelling(world, i);
  s.pinch = i;
  s.pinchBeat = world.beat - 1;
  return s;
}

/** Every site sealed, the last of them a beat ago. */
function down(world: World): HiveState {
  const s = shut(world);
  s.opened = s.cols.length;
  s.sealed = s.sealed.map(() => true);
  s.downBeat = world.beat - 1;
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the mass shut and then set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  shut(world);
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE HIVE's mass", () => {
  it.each(ROLES)("draws the mass in its wax on %s", (role) => {
    const f = frame(role, () => {});
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).toContain(PALETTE.bile);
  });

  it("puts a breach's colour on the pilot's screen and not the navigator's", () => {
    // An open breach is red on the screen shown the colour, and the same
    // breaches recoloured cyan are the same picture on the screen that is not.
    const red = (role: ViewRole) => frame(role, open);
    const cyan = (role: ViewRole) =>
      frame(role, (w) => {
        const s = open(w);
        s.colors[0] = "cyan";
        s.colors[1] = "cyan";
      });
    const bare = (role: ViewRole) => frame(role, () => {});
    expect(count(red("p1").text, PALETTE.red)).toBeGreaterThan(count(bare("p1").text, PALETTE.red));
    expect(count(red("test").text, PALETTE.red)).toBeGreaterThan(
      count(bare("test").text, PALETTE.red),
    );
    expect(count(red("p2").text, PALETTE.red)).toBe(count(bare("p2").text, PALETTE.red));
    expect(red("p1").text).not.toBe(cyan("p1").text);
    expect(red("test").text).not.toBe(cyan("test").text);
    expect(red("p2").text).toBe(cyan("p2").text);
    // The navigator's breach is grey, and it is still a breach: another picture than none.
    expect(count(red("p2").text, PALETTE.dim)).toBeGreaterThan(count(bare("p2").text, PALETTE.dim));
  });

  it("puts the swell on the navigator's screen and not the pilot's", () => {
    // The next site a beat into its swell is another picture than the same
    // sites with the opening a whole cadence away, on the screen shown the
    // swell — and the same one where it is not.
    const still = (role: ViewRole) => frame(role, open);
    const bulge = (role: ViewRole) => frame(role, swelling);
    expect(bulge("p2").text).not.toBe(still("p2").text);
    expect(bulge("test").text).not.toBe(still("test").text);
    expect(bulge("p1").text).toBe(still("p1").text);
    expect(count(bulge("p2").text, PALETTE.bileRim)).toBeGreaterThan(
      count(still("p2").text, PALETTE.bileRim),
    );
  });

  it("swells two sites at once from the twin count, on the navigator's screen", () => {
    const one = frame("p2", (w) => swelling(w, CFG.hiveTwinFrom - 1));
    const two = frame("p2", (w) => swelling(w, CFG.hiveTwinFrom));
    const oneStill = frame("p2", (w) => open(w, CFG.hiveTwinFrom - 1));
    const twoStill = frame("p2", (w) => open(w, CFG.hiveTwinFrom));
    expect(
      count(two.text, PALETTE.bileRim) - count(twoStill.text, PALETTE.bileRim),
    ).toBeGreaterThan(count(one.text, PALETTE.bileRim) - count(oneStill.text, PALETTE.bileRim));
  });

  it.each(ROLES)("stitches a scar over a sealed site, on %s", (role) => {
    const bare = frame(role, () => {});
    const sealed = frame(role, scarred);
    expect(count(sealed.text, PALETTE.hullRim)).toBeGreaterThan(count(bare.text, PALETTE.hullRim));
    expect(count(sealed.text, PALETTE.red)).toBe(count(bare.text, PALETTE.red));
  });

  it.each(ROLES)("closes the mass and fades it once the last site is sealed, on %s", (role) => {
    const going = frame(role, down);
    const stood = frame(role, () => {});
    expect(count(going.text, PALETTE.bile)).toBeLessThan(count(stood.text, PALETTE.bile));
    const wax = rgba(PALETTE.bileDeep, 0.8).slice(0, -5);
    expect(count(going.text, wax)).toBeGreaterThan(0);
    const gone = frame(role, (w) => {
      down(w).downBeat = w.beat - CFG.hiveOutBeats - 1;
    });
    expect(count(gone.text, wax)).toBe(0);
    expect(count(gone.text, PALETTE.bile)).toBe(0);
  });

  it.each(ROLES)("draws a clenched mass, breaches and all, on %s", (role) => {
    // Both seats are drawn the clench, and they have to be: *it is clenched*
    // is a sentence one says to the other, and neither could say it about a
    // body that looked the same clenched as hung (§11.14). **How far up it is
    // is a `translate`, which this log does not record** — the height itself
    // is read off `hiveClenchRise` two tests down, and what is asked here is
    // that the branch draws at all, with every breach still in it.
    const up = frame(role, (w) => clenched(w));
    expect(up.calls).toBeGreaterThan(200);
    expect(up.text).toContain(PALETTE.bile);
    expect(count(up.text, PALETTE.dim)).toBeGreaterThan(
      count(frame(role, () => {}).text, PALETTE.dim),
    );
  });

  it("rings the clenched underside on the pilot's screen alone, and fills it under his thumb", () => {
    const carrying = (role: ViewRole) => frame(role, (w) => clenched(w, CFG.hiveHaulMilli / 2));
    const still = (role: ViewRole) => frame(role, (w) => clenched(w));
    const hung = (role: ViewRole) => frame(role, (w) => open(w, 2));
    // His: a ring, and it fills once a thumb is carrying it.
    expect(count(still("p1").text, PALETTE.text)).toBeGreaterThan(
      count(hung("p1").text, PALETTE.text),
    );
    expect(count(carrying("p1").text, PALETTE.text)).toBeGreaterThan(
      count(still("p1").text, PALETTE.text),
    );
    // Hers: the clench, and no handle on it at all — the mass is up on her
    // screen too, and there is nothing she can do about it (`hive-hand.ts`).
    expect(count(still("p2").text, PALETTE.text)).toBe(count(hung("p2").text, PALETTE.text));
  });

  it("answers the haul frame by frame, and is home when the carry is enough", () => {
    // The rise, not a frame: what the thumb has carried is a number the drawer
    // subtracts, so the mass is somewhere new on every frame of the carry
    // rather than at the end of it. The translate it is spent on is one the
    // canvas log does not record, which is why this is read off the geometry.
    const world = hung();
    const s = clenched(world);
    const rise = (hauled: number) => {
      s.haulMilli = hauled;
      return hiveClenchRise(s, CFG, world.beat, 0.5);
    };
    const up = rise(0);
    expect(up).toBeGreaterThan(0);
    expect(rise(CFG.hiveHaulMilli / 4)).toBeLessThan(up);
    expect(rise(CFG.hiveHaulMilli / 2)).toBeLessThan(rise(CFG.hiveHaulMilli / 4));
    expect(rise(CFG.hiveHaulMilli)).toBe(0);
    // And nothing at all while the mass hangs, hauled or not.
    s.phase = "spill";
    expect(rise(0)).toBe(0);
  });

  it("puts the rehearsal's ghost thumb on the mass for the length of the haul, his alone", () => {
    // The hand a film draws over the gesture, which is how a rehearsal shows
    // one at all (`guide-hand.ts`): read off the world rather than off the
    // script, so it rides the mass down instead of standing where the act
    // said. Not a frame — `handleThumb` is the placement, and placing it
    // wrong is the failure a picture would hide.
    const world = hung();
    const s = clenched(world);
    const thumb = (hauled: number, seat: 1 | 2 = 1) => {
      s.haulMilli = hauled;
      return handleThumb(L, world, seat, 0.5);
    };
    // Clenched and untouched, there is no hand: the mass is up and nobody has
    // reached for it yet.
    expect(thumb(0)).toBeNull();
    const early = thumb(CFG.hiveHaulMilli / 4);
    const late = thumb(CFG.hiveHaulMilli / 2);
    expect(early).not.toBeNull();
    // And it comes down with what it is carrying.
    expect(late?.y ?? 0).toBeGreaterThan(early?.y ?? 0);
    // Hers never, on the one handle she also has a use for: her pinch is a
    // different gesture on a different part of it (`hive-pinch-thumb.test.ts`).
    expect(thumb(CFG.hiveHaulMilli / 2, 2)).toBeNull();
    // And gone the moment the clench is over, which is the tick the carry was
    // enough (`sim/hive-hand.ts`) — a hand left on a mass that is home is a
    // hand that never let go.
    s.phase = "spill";
    expect(thumb(CFG.hiveHaulMilli)).toBeNull();
  });

  it("squeezes a held lobe on the navigator's screen and nothing on the pilot's", () => {
    const held = (role: ViewRole) => frame(role, (w) => pinched(w));
    const loose = (role: ViewRole) => frame(role, (w) => swelling(w, 2));
    expect(held("p2").text).not.toBe(loose("p2").text);
    expect(count(held("p2").text, PALETTE.text)).toBeGreaterThan(
      count(loose("p2").text, PALETTE.text),
    );
    // He is shown no swell at all, so a thumb on one is nothing on his screen.
    expect(held("p1").text).toBe(loose("p1").text);
  });

  it.each(ROLES)("collars a wrung breach on %s", (role) => {
    // The collar is a second *shape*, not a shade, because her screen draws
    // every breach the same grey already (`hive-hold.ts`) — so it is on both,
    // and it is the one thing under this boss that is.
    const wrung = frame(role, (w) => {
      const s = open(w, 2);
      s.wrung[0] = true;
    });
    const plain = frame(role, (w) => open(w, 2));
    expect(count(wrung.text, PALETTE.hullRim)).toBeGreaterThan(count(plain.text, PALETTE.hullRim));
  });

  it("takes the colour out of a wrung breach on the screen that had one", () => {
    // Either bolt seals it, so there is no colour left to name; on her screen
    // there was none to take, and the collar is the whole of what she is told.
    const wrung = (role: ViewRole) =>
      frame(role, (w) => {
        const s = open(w, 2);
        s.wrung[0] = true;
      });
    const plain = (role: ViewRole) => frame(role, (w) => open(w, 2));
    expect(count(wrung("p1").text, PALETTE.red)).toBeLessThan(count(plain("p1").text, PALETTE.red));
    expect(count(wrung("p2").text, PALETTE.red)).toBe(count(plain("p2").text, PALETTE.red));
  });

  it("keeps the clench and the jolt as transients the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest(
      [
        { type: "hiveWrong", col: 5 },
        { type: "hiveSeal", col: 5, left: 3 },
        { type: "hiveClench", col: 5 },
        { type: "hiveHaul", col: 5 },
        { type: "hiveWrung", col: 5 },
      ],
      L,
      0,
      () => 0,
      CFG,
    );
    fx.update(1 / 60, L);
    expect(fx.boss.hive.clench).toBeGreaterThan(0);
    expect(fx.boss.hive.jolt).toBeGreaterThan(0);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
