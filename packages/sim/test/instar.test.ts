import { describe, expect, it } from "bun:test";
import { NO_BEARING, TURN } from "../src/bearing.js";
import {
  type BossSequenceStep,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type InstarGesture,
  type InstarSeat,
  type InstarState,
  instarBoss,
  instarMarkDone,
  instarSwipeAlong,
  NOT_DONE,
  type SimConfig,
  slowing,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE INSTAR: the scene with no control set, answered on its own body.
 *
 * What these pin is the engine every step of it runs on and a phone cannot
 * show: that a step morphs for its own beats with the marks hidden and then
 * shows them; that a beat with a mark for each seat lands only when both
 * are done together, and a tap that got there alone slips after
 * `instarTogetherBeats`; that a pull stands where the thumb is and is let go
 * of by the lift; that a swipe counts on the lift and only past the line;
 * that a turn winds clockwise and nothing else; that a hold is both thumbs
 * and time; that the wrong seat is refused and moves nothing; that the
 * window closing on an undone mark is one strike and the wave; that THE SLOW
 * is open for exactly the beats the pair is being asked for something and
 * shuts on the tick they answer or miss; and that the last landing is the
 * body down, out, and the wave cleared.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MORPH = 2;
const WINDOW = 8;
const LAND = 2;

function mark(seat: InstarSeat, gesture: InstarGesture, need: number) {
  return { seat, part: "hand" as const, gesture, xMilli: 500, yMilli: 400, need };
}

function scripted(...marks: ReturnType<typeof mark>[]): BossSequenceStep {
  return {
    pose: "breath",
    arrive: "approach",
    morphBeats: MORPH,
    windowBeats: WINDOW,
    landBeats: LAND,
    marks,
  };
}

function install(steps: BossSequenceStep[], seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "instar", steps });
  return world;
}

function instar(world: World): InstarState {
  const s = instarBoss(world);
  if (s === null) throw new Error("the wave installed no instar");
  return s;
}

/** A thumb on mark `id`, or off it, with a depth and a bearing. */
const thumb = (
  tick: number,
  player: 1 | 2,
  id: number,
  on: boolean,
  fromYMilli = 0,
  fromMilli = -1,
): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "instarMark", on, fromMilli, fromYMilli, id },
});

/** Step to a tick, feeding commands on the tick they are stamped for, and
 * say which event types went by — `world.events` is one tick's worth. */
function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
  return seen;
}

/** Past the morph: the marks up, on the tick after the beat that showed them. */
function shown(world: World): Set<string> {
  return runTo(world, TPB * MORPH + 1);
}

/** A press and a lift on the same tick, one tick on. */
function tap(world: World, player: 1 | 2, id: number): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [thumb(t, player, id, true), thumb(t, player, id, false)]);
}

describe("THE INSTAR comes in", () => {
  it("over the middle, morphing into its first pose with the marks hidden", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    const s = instar(world);
    expect(s.phase).toBe("morph");
    expect(s.cursor).toBe(0);
    expect(world.events.some((e) => e.type === "instarEnter")).toBe(true);
    expect(world.events.some((e) => e.type === "instarMorph" && e.pose === "breath")).toBe(true);
    const seen = runTo(world, TPB * MORPH - 1);
    expect(seen.has("instarShow")).toBe(false);
    expect(s.phase).toBe("morph");
  });

  it("shows the marks once the morph's beats have run, and a thumb before that is nothing", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    const s = instar(world);
    tap(world, 1, 0);
    expect(s.progress[0]).toBe(0);
    const seen = shown(world);
    expect(seen.has("instarShow")).toBe(true);
    expect(s.phase).toBe("act");
    expect(s.progress).toEqual([0]);
  });
});

describe("a step with a mark for each seat", () => {
  it("lands when both pulls stand at their depth, and settles into the next morph", () => {
    const world = install([
      scripted(mark("p1", "pullDown", 1000), mark("p2", "pullUp", 1000)),
      scripted(mark("both", "hold", 2)),
    ]);
    const s = instar(world);
    shown(world);
    const t = world.tick;
    let seen = runTo(world, t + 2, [thumb(t, 1, 0, true, 0), thumb(t + 1, 1, 0, true, 1000)]);
    expect(seen.has("instarDone")).toBe(true);
    expect(seen.has("instarLand")).toBe(false);
    expect(instarMarkDone(s, 0)).toBe(true);
    const u = world.tick;
    seen = runTo(world, u + 2, [thumb(u, 2, 1, true, 0), thumb(u + 1, 2, 1, true, -1000)]);
    expect(seen.has("instarLand")).toBe(true);
    expect(s.phase).toBe("land");
    // Landed is full rate, on the tick it landed: the window belonged to the
    // asking and the asking is over (`slow.ts` `closeSlow`).
    expect(slowing(world)).toBe(false);
    seen = runTo(world, world.tick + TPB * LAND + TPB);
    expect(seen.has("instarMorph")).toBe(true);
    expect(s.cursor).toBe(1);
    expect(s.phase).toBe("morph");
  });

  it("lets a pull that stands alone wait — letting go is what undoes it", () => {
    const world = install([scripted(mark("p1", "pullDown", 1000), mark("p2", "tap", 1))]);
    const s = instar(world);
    shown(world);
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 1, 0, true, 1000)]);
    expect(instarMarkDone(s, 0)).toBe(true);
    let seen = runTo(world, world.tick + TPB * (CFG.instarTogetherBeats + 2));
    expect(seen.has("instarSlip")).toBe(false);
    expect(instarMarkDone(s, 0)).toBe(true);
    const u = world.tick;
    seen = runTo(world, u + 1, [thumb(u, 1, 0, false)]);
    expect(seen.has("instarSlip")).toBe(true);
    expect(s.progress[0]).toBe(0);
    expect(s.doneBeat[0]).toBe(NOT_DONE);
  });

  it("slips a tap done alone once its partner is more than the together beats late", () => {
    const world = install([scripted(mark("p1", "tap", 1), mark("p2", "tap", 1))]);
    const s = instar(world);
    shown(world);
    tap(world, 1, 0);
    expect(instarMarkDone(s, 0)).toBe(true);
    const seen = runTo(world, world.tick + TPB * (CFG.instarTogetherBeats + 2));
    expect(seen.has("instarSlip")).toBe(true);
    expect(instarMarkDone(s, 0)).toBe(false);
    expect(s.progress[0]).toBe(0);
  });

  it("lands a tap and a tap inside the together beats", () => {
    const world = install([scripted(mark("p1", "tap", 1), mark("p2", "tap", 1))]);
    const s = instar(world);
    shown(world);
    tap(world, 1, 0);
    runTo(world, world.tick + TPB);
    const seen = tap(world, 2, 1);
    expect(seen.has("instarLand")).toBe(true);
    expect(s.phase).toBe("land");
  });

  it("never slips a mark that is the only one on its step", () => {
    const world = install([scripted(mark("p1", "tap", 2))]);
    const s = instar(world);
    shown(world);
    tap(world, 1, 0);
    const seen = runTo(world, world.tick + TPB * (CFG.instarTogetherBeats + 2));
    expect(seen.has("instarSlip")).toBe(false);
    expect(s.progress[0]).toBe(1);
  });
});

describe("the gestures", () => {
  it("count a tap on the press and not the hold: a thumb held down is one slap", () => {
    const world = install([scripted(mark("p1", "tap", 3))]);
    const s = instar(world);
    shown(world);
    const t = world.tick;
    runTo(world, t + 4, [
      thumb(t, 1, 0, true),
      thumb(t + 1, 1, 0, true),
      thumb(t + 2, 1, 0, true),
      thumb(t + 3, 1, 0, false),
    ]);
    expect(s.progress[0]).toBe(1);
    const seen = tap(world, 1, 0);
    expect(s.progress[0]).toBe(2);
    expect(seen.has("instarAnswer")).toBe(true);
  });

  it("read a pull in its own direction only, standing where the thumb is", () => {
    const world = install([scripted(mark("p1", "pullDown", 1000))]);
    const s = instar(world);
    shown(world);
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 1, 0, true, -800)]);
    expect(s.progress[0]).toBe(0);
    runTo(world, t + 2, [thumb(t + 1, 1, 0, true, 600)]);
    expect(s.progress[0]).toBe(600);
    runTo(world, t + 3, [thumb(t + 2, 1, 0, true, 300)]);
    expect(s.progress[0]).toBe(300);
  });

  it("count a swipe on the lift, and only one carried past the line", () => {
    const world = install([scripted(mark("p2", "swipeDown", 2))]);
    const s = instar(world);
    shown(world);
    const short = CFG.instarSwipeMilli - 1;
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 2, 0, true, short)]);
    // On its way, and said so before the lift (`instarSwipeAlong`).
    expect(instarSwipeAlong(s, CFG, 0)).toBe(Math.floor((short * 1000) / CFG.instarSwipeMilli));
    runTo(world, t + 2, [thumb(t + 1, 2, 0, false)]);
    expect(s.progress[0]).toBe(0);
    expect(instarSwipeAlong(s, CFG, 0)).toBe(0);
    const u = world.tick;
    runTo(world, u + 1, [thumb(u, 2, 0, true, CFG.instarSwipeMilli * 2)]);
    expect(s.progress[0]).toBe(0);
    expect(instarSwipeAlong(s, CFG, 0)).toBe(1000);
    // Carried back up, it stays armed: the furthest the carry went is kept.
    runTo(world, u + 2, [thumb(u + 1, 2, 0, true, 0)]);
    expect(instarSwipeAlong(s, CFG, 0)).toBe(1000);
    const seen = runTo(world, u + 3, [thumb(u + 2, 2, 0, false)]);
    expect(s.progress[0]).toBe(1);
    expect(s.ref[0]).toBe(NO_BEARING);
    expect(seen.has("instarAnswer")).toBe(true);
  });

  it("wind a turn clockwise like the crank, and anticlockwise not at all", () => {
    const world = install([scripted(mark("p1", "turn", 1000))]);
    const s = instar(world);
    shown(world);
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 1, 0, true, 0, -1)]);
    expect(s.ref[0]).toBe(NO_BEARING);
    runTo(world, t + 2, [thumb(t + 1, 1, 0, true, 0, 0)]);
    expect(s.progress[0]).toBe(0);
    runTo(world, t + 3, [thumb(t + 2, 1, 0, true, 0, 200)]);
    expect(s.progress[0]).toBe(200);
    runTo(world, t + 4, [thumb(t + 3, 1, 0, true, 0, 100)]);
    expect(s.progress[0]).toBe(200);
    const seen = runTo(world, t + 5, [thumb(t + 4, 1, 0, true, 0, TURN - 100)]);
    expect(s.progress[0]).toBe(200);
    expect(seen.has("instarAnswer")).toBe(false);
    runTo(world, t + 6, [thumb(t + 5, 1, 0, true, 0, 300)]);
    expect(s.progress[0]).toBe(600);
  });

  it("count a hold by the beat with both thumbs on, and break it on a lift", () => {
    const world = install([scripted(mark("both", "hold", 3))]);
    const s = instar(world);
    shown(world);
    const t = world.tick;
    runTo(world, t + TPB * 2, [thumb(t, 1, 0, true)]);
    expect(s.progress[0]).toBe(0);
    const u = world.tick;
    runTo(world, u + TPB * 2, [thumb(u, 2, 0, true)]);
    expect(s.thumbs[0]).toBe(3);
    expect(s.progress[0]).toBe(2);
    const v = world.tick;
    const seen = runTo(world, v + 1, [thumb(v, 2, 0, false)]);
    expect(seen.has("instarSlip")).toBe(true);
    expect(s.progress[0]).toBe(0);
  });

  it("refuse the wrong seat, once per press, and move nothing", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    const s = instar(world);
    shown(world);
    const t = world.tick;
    let seen = runTo(world, t + 1, [thumb(t, 2, 0, true)]);
    expect(seen.has("instarRefuse")).toBe(true);
    expect(s.progress[0]).toBe(0);
    expect(s.thumbs[0]).toBe(0);
    seen = runTo(world, t + 2, [thumb(t + 1, 2, 0, false)]);
    expect(seen.has("instarRefuse")).toBe(false);
    expect(s.phase).toBe("act");
  });
});

describe("the window", () => {
  it("closes on an undone mark with one strike, and the wave is lost", () => {
    const world = install([scripted(mark("p1", "tap", 1), mark("p2", "tap", 1))]);
    const s = instar(world);
    shown(world);
    tap(world, 2, 1);
    const seen = runTo(world, TPB * (MORPH + WINDOW) + 1);
    expect(seen.has("instarStrike")).toBe(true);
    expect(seen.has("breach")).toBe(true);
    expect(seen.has("waveFailed")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
    expect(s.phase).toBe("act");
  });

  it("never strikes twice: the held field does not run the clock", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    shown(world);
    runTo(world, TPB * (MORPH + WINDOW) + 1);
    const seen = runTo(world, TPB * (MORPH + WINDOW + 4));
    expect(seen.has("instarStrike")).toBe(false);
  });

  it("does not close under the invulnerable hull either: the strike is still said", () => {
    const world = createWorld({ ...CFG, hullInvulnerable: true }, 0);
    startWave(world, 0, [], [], { kind: "instar", steps: [scripted(mark("p1", "tap", 1))] });
    shown(world);
    const seen = runTo(world, TPB * (MORPH + WINDOW) + 1);
    expect(seen.has("instarStrike")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the window is the slow", () => {
  it("opens at a third rate the beat the marks come up, for the window's own beats", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    const s = instar(world);
    expect(slowing(world)).toBe(false);
    shown(world);
    expect(slowing(world)).toBe(true);
    // The same span `instarStrikeBeat` counts: the rate is a third for exactly
    // as long as the pair is being asked for something.
    expect(world.slowFromBeat).toBe(s.phaseBeat);
    expect(world.slowToBeat).toBe(s.phaseBeat + WINDOW);
  });

  it("shuts on the tick the step is answered", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    shown(world);
    expect(slowing(world)).toBe(true);
    const seen = tap(world, 1, 0);
    expect(seen.has("instarLand")).toBe(true);
    expect(slowing(world)).toBe(false);
  });

  it("shuts on the strike, so a failed step is not played slowly either", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    shown(world);
    expect(slowing(world)).toBe(true);
    const seen = runTo(world, TPB * (MORPH + WINDOW) + 1);
    expect(seen.has("instarStrike")).toBe(true);
    expect(slowing(world)).toBe(false);
  });
});

describe("the last step", () => {
  it("landed is THE SLOW, the body down, then out, and the wave cleared", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    const s = instar(world);
    shown(world);
    let seen = tap(world, 1, 0);
    expect(seen.has("instarLand")).toBe(true);
    seen = runTo(world, world.tick + TPB * LAND + TPB);
    expect(seen.has("instarDown")).toBe(true);
    expect(s.phase).toBe("down");
    // The body going down is its own dramatic beat and not an action window,
    // so it opens a fresh one of `instarSlowBeats` from the down — the step's
    // own window shut on the landing, beats earlier.
    expect(world.slowFromBeat).toBe(s.phaseBeat);
    expect(world.slowToBeat).toBe(s.phaseBeat + CFG.instarSlowBeats);
    expect(world.restBeat).toBe(0);
    seen = runTo(world, world.tick + TPB * (CFG.instarOutBeats + 1));
    expect(seen.has("instarOut")).toBe(true);
    expect(world.boss).toBeNull();
    runTo(world, world.tick + TPB);
    expect(world.restBeat).not.toBe(0);
  });

  it("holds the wave open until the body is out", () => {
    const world = install([scripted(mark("p1", "tap", 1))]);
    shown(world);
    runTo(world, world.tick + TPB * 3);
    expect(world.restBeat).toBe(0);
  });
});

describe("the fingerprint", () => {
  it("is the same for the same script and thumbs, and moves with the cursor", () => {
    const steps = [
      scripted(mark("p1", "tap", 1), mark("p2", "tap", 1)),
      scripted(mark("both", "hold", 1)),
    ];
    const a = install(steps, 3);
    const b = install(steps, 3);
    const at = TPB * MORPH + 2;
    const cmds = [thumb(at, 1, 0, true), thumb(at, 1, 0, false)];
    runTo(a, at + 1, cmds);
    runTo(b, at + 1, cmds);
    expect(hashWorld(a)).toBe(hashWorld(b));
    const before = hashWorld(a);
    tap(a, 2, 1);
    expect(hashWorld(a)).not.toBe(before);
    expect(a.tick).toBe(b.tick + 1);
  });
});
