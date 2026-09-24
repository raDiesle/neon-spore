import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { spendShot } from "../src/spend.js";
import {
  type TasterState,
  tasterBoss,
  tasterLifted,
  tasterPhase,
  tasterPried,
} from "../src/taster.js";
import { tasterHandsHeard } from "../src/taster-hand.js";
import type { Color, Command, DragTarget } from "../src/types.js";

/**
 * **THE TASTER's three thumbs**, one per movement (`sim/taster-hand.ts`).
 *
 * The rule the fan is built on is proved next door in `taster.test.ts`; this
 * file only ever asks what a *hand* does to it — who may send each one, in
 * which movement it is heard at all, what it buys, and what it costs when it
 * is held too long or let go too early. The fan's state is set rather than
 * played into, for `boss-cue-taster.test.ts`' reason: the growth, the set and
 * the shear have their own tests and re-playing them here would only make
 * this file slow at proving something it is not about.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): { world: World; t: TasterState } {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "taster" });
  const t = tasterBoss(world);
  if (t === null) throw new Error("no fan installed");
  return { world, t };
}

/** Run `n` beats, and say which of the boss's events went by (`world.events` is a beat's own). */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

function spend(world: World, n: number, color: Color): void {
  for (let i = 0; i < n; i++) spendShot(world, color);
}

function drag(target: DragTarget, on: boolean, extra: Partial<Command> = {}): Command {
  return { kind: "drag", target, on, fromMilli: 0, ...extra } as Command;
}

/** `n` blades struck off by hand, from the outside in, so a movement can be set. */
function shearOff(t: TasterState, n: number): void {
  for (let i = 0; i < n; i++) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.shorn = true;
    k.edge = null;
    k.layers = 0;
    t.shorn += 1;
  }
}

/** Blade `i` out of the crest, its growth already up, with no colour yet. */
function growing(world: World, t: TasterState, i: number): void {
  const k = t.blades[i];
  if (k === undefined) throw new Error(`no blade ${i}`);
  k.growBeat = world.beat - CFG.tasterGrowBeats;
  k.setBeat = -1;
  k.edge = null;
  k.shorn = false;
}

describe("the pin", () => {
  /** The fan `fanning`, with one blade out and ready to decide. */
  function fanning(): { world: World; t: TasterState; i: number } {
    const { world, t } = open();
    // Far enough in that a blade can have been growing for its whole
    // `tasterGrowBeats` — `growing` dates it backwards, and beat nought has no
    // room behind it.
    beats(world, CFG.tasterGrowBeats + 1);
    shearOff(t, CFG.tasterFanShorn);
    const i = t.blades.length - 1;
    growing(world, t, i);
    expect(tasterPhase(t, CFG)).toBe("fanning");
    return { world, t, i };
  }

  function press(world: World, t: TasterState, i: number, on = true, player: 1 | 2 = 1): void {
    tasterHandsHeard(world, player, drag("tasterBlade", on, { id: t.col + i }));
  }

  it("holds a blade out of its decision while the thumb is down", () => {
    const { world, t, i } = fanning();
    press(world, t, i);
    expect(t.pin).toBe(i);
    expect(world.events.some((e) => e.type === "tasterPin")).toBe(true);
    // Its growth is up, so without the thumb it would have set on the next
    // beat. It does not, and that is the whole of what the pilot bought.
    beats(world, 1);
    expect(t.blades[i]?.setBeat).toBe(-1);
    expect(t.pinBeats).toBe(1);
  });

  it("lets it decide anyway once the hold runs out, and heavy for it", () => {
    const { world, t, i } = fanning();
    spend(world, 4, "red");
    press(world, t, i);
    const seen = beats(world, CFG.tasterPinBeats + 1);
    expect(t.blades[i]?.setBeat).toBeGreaterThanOrEqual(0);
    expect(t.blades[i]?.layers).toBe(CFG.tasterThickMax);
    expect(t.pin).toBe(-1);
    expect(seen.has("tasterThick")).toBe(true);
  });

  it("gives the blade back the moment the thumb lifts, with the count cleared", () => {
    const { world, t, i } = fanning();
    press(world, t, i);
    beats(world, 1);
    press(world, t, i, false);
    expect(t.pin).toBe(-1);
    expect(t.pinBeats).toBe(0);
    // One layer, not `tasterThickMax`: a pin let go in time costs nothing.
    spend(world, 4, "red");
    beats(world, 1);
    expect(t.blades[i]?.layers).toBe(1);
  });

  it("moves to the second blade a thumb lands on, and starts the count again", () => {
    const { world, t, i } = fanning();
    press(world, t, i);
    beats(world, 1);
    expect(t.pinBeats).toBe(1);
    // Opened after the beat, so the fan's own `setEdges` cannot have decided
    // it out from under the second press.
    const other = i - 1;
    growing(world, t, other);
    press(world, t, other);
    expect(t.pin).toBe(other);
    expect(t.pinBeats).toBe(0);
  });

  it("is the pilot's, and hers is dropped without a sound", () => {
    const { world, t, i } = fanning();
    press(world, t, i, true, 2);
    expect(t.pin).toBe(-1);
    expect(world.events.some((e) => e.type === "tasterPin")).toBe(false);
  });

  it("is refused outside `fanning`, and on a blade that has nothing to hold", () => {
    const { world, t } = open();
    const i = t.blades.length - 1;
    growing(world, t, i);
    expect(tasterPhase(t, CFG)).toBe("opening");
    press(world, t, i);
    expect(t.pin).toBe(-1);
    shearOff(t, CFG.tasterFanShorn);
    // Out of the crest is the whole of what it wants: a column the fan has not
    // opened yet is a pin placed before the boss said where it was going.
    press(world, t, 0);
    expect(t.pin).toBe(-1);
  });

  it("drops itself when the blade it held goes", () => {
    const { world, t, i } = fanning();
    press(world, t, i);
    const k = t.blades[i];
    if (k === undefined) throw new Error("no blade");
    k.shorn = true;
    beats(world, 1);
    expect(t.pin).toBe(-1);
    expect(t.pinBeats).toBe(0);
  });
});

describe("the wipe", () => {
  /** The fan `hurrying`, with the leftmost columns soft. */
  function hurrying(): { world: World; t: TasterState } {
    const { world, t } = open();
    shearOff(t, CFG.tasterHurryShorn);
    expect(tasterPhase(t, CFG)).toBe("hurrying");
    return { world, t };
  }

  function carry(world: World, t: TasterState, i: number, milli: number, player: 1 | 2 = 2): void {
    tasterHandsHeard(world, player, drag("tasterGap", true, { id: t.col + i, fromMilli: milli }));
  }

  it("cuts the crest the thousandth the carry is long enough, either way", () => {
    for (const sign of [1, -1]) {
      const { world, t } = hurrying();
      carry(world, t, 0, sign * (CFG.tasterWipeMilli - 1));
      expect(t.crest).toBe(0);
      carry(world, t, 0, sign * CFG.tasterWipeMilli);
      expect(t.crest).toBe(1);
      expect(world.events.some((e) => e.type === "tasterWipe")).toBe(true);
      expect(world.events.some((e) => e.type === "tasterCrest")).toBe(true);
    }
  });

  it("spends no colour at all, which is the whole of why it exists", () => {
    const { world, t } = hurrying();
    const before = [...world.spend.map((s) => ({ ...s }))];
    carry(world, t, 0, CFG.tasterWipeMilli);
    expect(world.spend).toEqual(before);
    expect(world.balance.colorHits).toBe(0);
    expect(world.balance.colorMisses).toBe(0);
  });

  it("cuts once per grab, however far the thumb goes on", () => {
    const { world, t } = hurrying();
    carry(world, t, 0, CFG.tasterWipeMilli);
    carry(world, t, 0, CFG.tasterWipeMilli * 2);
    expect(t.crest).toBe(1);
    tasterHandsHeard(world, 2, drag("tasterGap", false, { id: t.col }));
    carry(world, t, 0, CFG.tasterWipeMilli);
    expect(t.crest).toBe(2);
  });

  it("opens the crest for good at the same count a bolt would", () => {
    const { world, t } = hurrying();
    for (let n = 0; n < CFG.tasterCrestCuts; n++) {
      carry(world, t, 0, CFG.tasterWipeMilli);
      tasterHandsHeard(world, 2, drag("tasterGap", false, { id: t.col }));
    }
    expect(tasterLifted(t)).toBe(true);
    expect(world.events.some((e) => e.type === "tasterLift")).toBe(true);
  });

  it("is hers, wants a soft column, and stops once the crest is through", () => {
    const { world, t } = hurrying();
    carry(world, t, 0, CFG.tasterWipeMilli, 1);
    expect(t.crest).toBe(0);
    // A column with a blade still in it is not a gap.
    carry(world, t, t.blades.length - 1, CFG.tasterWipeMilli);
    expect(t.crest).toBe(0);
    t.liftBeat = world.beat;
    carry(world, t, 0, CFG.tasterWipeMilli);
    expect(t.crest).toBe(0);
  });

  it("is refused outside `hurrying`", () => {
    const { world, t } = open();
    shearOff(t, CFG.tasterFanShorn);
    expect(tasterPhase(t, CFG)).toBe("fanning");
    carry(world, t, 0, CFG.tasterWipeMilli);
    expect(t.crest).toBe(0);
  });
});

describe("the pry", () => {
  function closed(): { world: World; t: TasterState } {
    const { world, t } = open();
    shearOff(t, t.blades.length - CFG.tasterClosedBlades);
    for (let i = t.blades.length - CFG.tasterClosedBlades; i < t.blades.length; i++) {
      const k = t.blades[i];
      if (k === undefined) continue;
      k.edge = "red";
      k.layers = 1;
      k.growBeat = 0;
      k.setBeat = 0;
    }
    expect(tasterPhase(t, CFG)).toBe("closed");
    return { world, t };
  }

  function haul(world: World, milli: number, player: 1 | 2 = 1): void {
    tasterHandsHeard(world, player, drag("tasterLock", true, { fromYMilli: milli }));
  }

  it("opens on the thousandth the carry reaches the bottom, and not before", () => {
    const { world, t } = closed();
    haul(world, CFG.tasterPryMilli - 1);
    expect(tasterPried(t, world.beat, CFG)).toBe(false);
    expect(t.pryMilli).toBe(CFG.tasterPryMilli - 1);
    haul(world, CFG.tasterPryMilli);
    expect(tasterPried(t, world.beat, CFG)).toBe(true);
    expect(world.events.some((e) => e.type === "tasterPry")).toBe(true);
  });

  it("reads a carry upward as no carry at all", () => {
    const { world, t } = closed();
    haul(world, -CFG.tasterPryMilli);
    expect(t.pryMilli).toBe(0);
    expect(tasterPried(t, world.beat, CFG)).toBe(false);
  });

  it("stays open for its beats with the thumb off, then locks again", () => {
    const { world, t } = closed();
    haul(world, CFG.tasterPryMilli);
    tasterHandsHeard(world, 1, drag("tasterLock", false));
    expect(t.pryMilli).toBe(0);
    beats(world, CFG.tasterPryBeats - 1);
    expect(tasterPried(t, world.beat, CFG)).toBe(true);
    const seen = beats(world, 2);
    expect(tasterPried(t, world.beat, CFG)).toBe(false);
    expect(t.pryBeat).toBe(-1);
    expect(seen.has("tasterClose")).toBe(true);
  });

  it("leaves the pair beats of margin every beam can be filled in", () => {
    // The whole reason the number is what it is (`config-taster.ts`).
    expect(CFG.tasterPryBeats).toBeGreaterThan(CFG.tasterPryFills * CFG.lancePrimeBeats);
  });

  it("cannot be restarted inside its own window", () => {
    const { world, t } = closed();
    haul(world, CFG.tasterPryMilli);
    const opened = t.pryBeat;
    beats(world, 1);
    haul(world, CFG.tasterPryMilli);
    expect(t.pryBeat).toBe(opened);
  });

  it("is the pilot's, and is refused before the fan closes", () => {
    const { world, t } = closed();
    haul(world, CFG.tasterPryMilli, 2);
    expect(tasterPried(t, world.beat, CFG)).toBe(false);
    const fresh = open();
    haul(fresh.world, CFG.tasterPryMilli);
    expect(tasterPried(fresh.t, fresh.world.beat, CFG)).toBe(false);
  });
});

describe("two devices", () => {
  it("fingerprint a fan with a thumb on it differently from one without", () => {
    const a = open(7);
    const b = open(7);
    for (const s of [a, b]) beats(s.world, CFG.tasterGrowBeats + 1);
    for (const s of [a, b]) shearOff(s.t, CFG.tasterFanShorn);
    for (const s of [a, b]) growing(s.world, s.t, s.t.blades.length - 1);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    tasterHandsHeard(
      a.world,
      1,
      drag("tasterBlade", true, { id: a.t.col + a.t.blades.length - 1 }),
    );
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });

  it("fingerprint a half-hauled interlock differently from a shut one", () => {
    const a = open(7);
    const b = open(7);
    for (const s of [a, b]) shearOff(s.t, s.t.blades.length - CFG.tasterClosedBlades);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    tasterHandsHeard(a.world, 1, drag("tasterLock", true, { fromYMilli: 700 }));
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
