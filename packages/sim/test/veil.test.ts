import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { wornKind } from "../src/creature-rules.js";
import { hashWorld } from "../src/hash.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import {
  veilArmourTicks,
  veilBeatsToMorph,
  veilBecomes,
  veilIsArmoured,
  veilMorphs,
} from "../src/veil.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE VEIL, and the three things about it nothing else in this suite covers: a
 * body whose colour is **rolled** rather than authored, a body that changes
 * that colour **on a clock**, and a body that a wrong shot makes **temporarily
 * unkillable**.
 *
 * Every other creature here is answered by asking one question once. This one
 * has to be asked again every few beats, which means the interesting failures
 * are all about *time*: a call that was right when it was made and wrong when
 * it was acted on, and a rebuff that costs the pair long enough for the answer
 * to change underneath them.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const veil = (col: number): SpawnEntry => ({ beat: 0, col, kind: "veil", color: null });
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: Color): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

interface Run {
  world: World;
  events: SimEvent[];
}

function run(seed: number, ticks: number, inputs: TimedCommand[] = [], col = 5): Run {
  const world = createWorld({ ...CFG }, seed, [veil(col)]);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const only = (world: World): Creature => {
  const c = world.creatures[0];
  if (c === undefined) throw new Error("the field is empty");
  return c;
};

describe("what is inside a cloud", () => {
  it("is a real body with a real colour by the time it is on the field", () => {
    const { world } = run(7, TPB * 2);
    const body = only(world);
    expect(body.kind).toBe("veil");
    expect(body.color === "red" || body.color === "cyan").toBe(true);
    expect(veilBecomes(body)).toBe(body.color === "red" ? "slick" : "bulb");
  });

  it("is drawn as that body, so the cloud costs the picture nothing", () => {
    // `wornKind` is the one answer to "what does this look like", and it has
    // to give the slick or the bulb — not "veil", which has no contour.
    const { world } = run(7, TPB * 2);
    const look = wornKind(only(world));
    expect(look === "slick" || look === "bulb").toBe(true);
  });

  it("is rolled rather than authored — two seeds do not agree about it", () => {
    // The randomness rule (docs/spec/structure.md 7.3): the only thing that
    // stays random is what one player knows and the other does not. If a wave
    // could fix this, the pilot would stop announcing it on the fourth run.
    const colours = new Set<string>();
    for (let seed = 0; seed < 40; seed++) colours.add(String(only(run(seed, TPB * 2).world).color));
    expect(colours).toEqual(new Set(["red", "cyan"]));
  });

  it("is the same body twice for the same seed", () => {
    expect(only(run(3, TPB * 2).world).color).toBe(only(run(3, TPB * 2).world).color);
  });
});

describe("the morph", () => {
  it("turns the body over on the beats the shared clock names", () => {
    const period = CFG.veilMorphBeats;
    const { world } = run(7, TPB * 2);
    const first = only(world).color;
    // One full period on, and the colour is the other one. Two, and it is back.
    const { world: half } = run(7, TPB * (2 + period));
    const { world: whole } = run(7, TPB * (2 + period * 2));
    expect(only(half).color).not.toBe(first);
    expect(only(whole).color).toBe(first);
  });

  it("says so, in a colour player 2 is never shown", () => {
    const { events } = run(7, TPB * (CFG.veilMorphBeats + 2));
    const morphs = events.filter((e) => e.type === "veilMorph");
    expect(morphs.length).toBeGreaterThan(0);
  });

  it("counts down to a turn and never to zero", () => {
    // On the beat it turns over, the answer is a whole period again: what is
    // standing there has just arrived and has the full cycle to run.
    for (let beat = 0; beat < CFG.veilMorphBeats * 3; beat++) {
      const left = veilBeatsToMorph(CFG, beat);
      expect(left).toBeGreaterThan(0);
      expect(left).toBeLessThanOrEqual(CFG.veilMorphBeats);
      expect(veilMorphs(CFG, beat + left)).toBe(true);
    }
  });

  it("is one clock for the whole field, so two clouds turn over together", () => {
    const world = createWorld({ ...CFG }, 11, [veil(2), veil(5)]);
    for (let t = 0; t < TPB * 2; t++) step(world, []);
    const before = world.creatures.map((c) => c.color);
    for (let t = 0; t < TPB * CFG.veilMorphBeats; t++) step(world, []);
    const after = world.creatures.map((c) => c.color);
    expect(world.creatures.length).toBe(2);
    for (const [i, colour] of after.entries()) expect(colour).not.toBe(before[i]);
  });
});

describe("a shot into a cloud", () => {
  /** The tick a shot fired at `tick` is resolved on is a beat or so later; the
   * runs below all fire early and then play out long enough to see it land. */
  const FIRE_AT = TPB * 2;

  it("in the matching colour tears it open and kills the body", () => {
    const { world } = run(7, TPB * 2);
    const right = only(world).color as Color;
    const { world: after, events } = run(7, TPB * 6, [aim(5, 5), fire(FIRE_AT, right)]);
    expect(after.creatures.length).toBe(0);
    expect(events.some((e) => e.type === "veilTorn")).toBe(true);
    // The kill rides beside the reveal on the same tick — one score, one
    // burst, one sound for the body going, and the tear on top of it.
    expect(events.some((e) => e.type === "destroy")).toBe(true);
    expect(after.score).toBeGreaterThanOrEqual(CFG.scoreVeilKill);
    expect(after.balance.colorHits).toBe(1);
  });

  it("names the body it was hiding, so the reveal is drawn as the right shape", () => {
    const { world } = run(7, TPB * 2);
    const right = only(world).color as Color;
    const { events } = run(7, TPB * 6, [aim(5, 5), fire(FIRE_AT, right)]);
    const torn = events.find((e) => e.type === "veilTorn");
    expect(torn).toBeDefined();
    if (torn?.type === "veilTorn") {
      expect(torn.color).toBe(right);
      expect(torn.kind).toBe(right === "red" ? "slick" : "bulb");
    }
  });

  it("in the wrong colour shuts it, and that is a colour miss", () => {
    const { world } = run(7, TPB * 2);
    const wrong: Color = only(world).color === "red" ? "cyan" : "red";
    const { world: after, events } = run(7, TPB * 6, [aim(5, 5), fire(FIRE_AT, wrong)]);
    expect(after.creatures.length).toBe(1);
    expect(events.some((e) => e.type === "veilRebuff")).toBe(true);
    expect(after.balance.colorMisses).toBe(1);
    expect(veilIsArmoured(after, only(after))).toBe(true);
  });

  it("bounces off a cloud that is already shut, and that is not a colour miss", () => {
    // The ammunition may have been exactly right and the cloud simply still
    // angry — a failure of the pair's patience rather than of player 2's
    // choice. `claspStruck` and `resolveWarden` make the same argument.
    const { world } = run(7, TPB * 2);
    const wrong: Color = only(world).color === "red" ? "cyan" : "red";
    const right: Color = wrong === "red" ? "cyan" : "red";
    const { world: after, events } = run(7, TPB * 7, [
      aim(5, 5),
      fire(FIRE_AT, wrong),
      // A beat later, in the colour that was right when the first shot left.
      fire(FIRE_AT + TPB, right),
    ]);
    expect(after.creatures.length).toBe(1);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    expect(after.balance.colorMisses).toBe(1);
  });

  it("opens the cloud again once the armour has run out", () => {
    const ticks = veilArmourTicks(CFG);
    expect(ticks).toBeGreaterThan(0);
    const world = createWorld({ ...CFG }, 7, [veil(5)]);
    for (let t = 0; t < TPB * 2; t++) step(world, []);
    const body = only(world);
    body.veilStruckTick = world.tick;
    expect(veilIsArmoured(world, body)).toBe(true);
    for (let t = 0; t < ticks; t++) step(world, []);
    expect(veilIsArmoured(world, body)).toBe(false);
  });
});

describe("two devices playing the same veil", () => {
  it("fingerprint the same run identically, twice", () => {
    // The property that actually matters for lockstep, and the reason it is
    // compared in one process rather than pinned as a constant: every
    // legitimate change to `hashWorld` moves a pinned number, and re-pinning
    // is the motion that blesses a real regression (docs/decisions.md #19).
    const { world } = run(7, TPB * 2);
    const wrong: Color = only(world).color === "red" ? "cyan" : "red";
    const inputs = [aim(5, 5), fire(TPB * 2, wrong), fire(TPB * 5, wrong)];
    const a = run(7, TPB * 9, inputs);
    const b = run(7, TPB * 9, inputs);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });

  it("disagree about the fingerprint when one of them thinks the cloud is open", () => {
    // `veilStruckTick` earns its place in `hashWorld` here: two devices that
    // disagree about it disagree about whether the next shot reaches the body,
    // and one of them is playing a creature the other has already killed.
    const shut = createWorld({ ...CFG }, 7, [veil(5)]);
    const open = createWorld({ ...CFG }, 7, [veil(5)]);
    for (let t = 0; t < TPB * 2; t++) {
      step(shut, []);
      step(open, []);
    }
    expect(hashWorld(shut)).toBe(hashWorld(open));
    only(shut).veilStruckTick = shut.tick;
    expect(hashWorld(shut)).not.toBe(hashWorld(open));
  });
});
