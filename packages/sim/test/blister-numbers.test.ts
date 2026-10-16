import { describe, expect, it } from "bun:test";
import {
  BEARING_TURN,
  type BlisterGesture,
  blisterBlowsLeft,
  blisterIsUp,
  blisterUpBeatsOf,
  type Command,
  type Creature,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  NO_BEARING,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  ticksPerBeat,
} from "../src/index.js";

/**
 * **A blister's three numbers** (`sim/blister-numbers.ts`): beats up, blows
 * to take and one blow's length — the gesture's default in `SimConfig`, or
 * the wave's for one body. The owner, 16 October 2026: *let me able to
 * configure the timings/length/number of action required for each control.*
 *
 * In order: the wave's numbers ride the spawn and only when set; several
 * blows are counted inside the one surfacing and only the last is the body
 * gone; a stroke or a lever hand that dealt one is spent until it lifts, and
 * a COMBO asks for its press again; a length sets how far or how long a blow
 * is; and the numbers are in the fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const body = (gesture: BlisterGesture, more: Partial<SpawnEntry> = {}): SpawnEntry => ({
  beat: 0,
  col: 3,
  kind: "blister",
  color: null,
  row: 3,
  by: 2,
  gesture,
  ...more,
});

function stage(entry: SpawnEntry, cfg: SimConfig = CFG) {
  const world = createWorld({ ...cfg }, 0, [entry]);
  const events: SimEvent[] = [];
  const go = (ticks: number, commands: Command[] = []) => {
    for (let t = 0; t < ticks; t++) {
      step(
        world,
        commands.map((command) => ({ tick: world.tick, player: 2 as const, command })),
      );
      commands = [];
      events.push(...world.events);
    }
  };
  const it = () => world.creatures.find((c) => c.kind === "blister");
  const up = (): Creature => {
    for (let t = 0; t < TPB * 12; t++) {
      const c = it();
      if (c && blisterIsUp(c)) return c;
      go(1);
    }
    throw new Error("the blister never came up");
  };
  const blows = () => events.filter((e) => e.type === "blisterBlow");
  const gone = () => events.some((e) => e.type === "destroy" && e.kind === "blister");
  return { world, go, it, up, blows, gone };
}

const swipe = (id: number, on: boolean, dx: number): Command => ({
  kind: "drag",
  target: "blisterSwipe",
  id,
  on,
  fromMilli: dx,
  fromYMilli: 0,
});

describe("a blister's numbers", () => {
  it("rides the spawn only when the wave set one, and drops a length a gesture has none of", () => {
    const plain = stage(body("tap"));
    const c = plain.up();
    expect(c.blisterUpBeats).toBeUndefined();
    expect(c.blisterBlows).toBeUndefined();
    expect(blisterUpBeatsOf(CFG, c)).toBe(CFG.blisterTapUpBeats);
    const set = stage(body("tap", { upBeats: 3, blows: 2, lengthMilli: 500 }));
    const d = set.up();
    expect(d.blisterUpBeats).toBe(3);
    expect(d.blisterBlows).toBe(2);
    expect(d.blisterLengthMilli).toBeUndefined();
  });

  it("stays up the beats the wave set, then breaks the hull", () => {
    const s = stage(body("tap", { upBeats: 2 }));
    s.up();
    const from = s.world.tick;
    while (s.it()) s.go(1);
    expect(s.world.tick - from).toBe(2 * TPB);
  });

  it("takes a gesture's default blows, every one inside the surfacing", () => {
    const s = stage(body("tap"), { ...CFG, blisterTapBlows: 3 });
    const c = s.up();
    s.go(1, [{ kind: "tap", id: c.id }]);
    s.go(1, [{ kind: "tap", id: c.id }]);
    expect(s.blows().map((e) => e.type === "blisterBlow" && e.left)).toEqual([2, 1]);
    expect(blisterBlowsLeft(s.world.cfg, s.it()!)).toBe(1);
    expect(s.gone()).toBe(false);
    s.go(1, [{ kind: "tap", id: c.id }]);
    expect(s.gone()).toBe(true);
    expect(s.it()).toBeUndefined();
  });

  it("spends a stroke that dealt a blow until it lifts, and counts the next one", () => {
    const s = stage(body("swipe", { blows: 2 }));
    const c = s.up();
    const far = CFG.blisterSwipeMilli;
    s.go(1, [swipe(c.id, true, 0)]);
    s.go(1, [swipe(c.id, true, far)]);
    expect(s.blows()).toHaveLength(1);
    // The thumb still past the reach is the same stroke, not a second blow.
    s.go(1, [swipe(c.id, true, far + 100)]);
    expect(s.blows()).toHaveLength(1);
    s.go(1, [swipe(c.id, false, far + 100)]);
    expect(s.blows()).toHaveLength(1);
    s.go(1, [swipe(c.id, true, 0)]);
    s.go(1, [swipe(c.id, false, far)]);
    expect(s.blows()).toHaveLength(2);
    expect(s.gone()).toBe(true);
  });

  it("asks a COMBO for its press again after a blow that was not the last", () => {
    const s = stage(body("combo", { blows: 2 }));
    const c = s.up();
    const far = CFG.blisterComboMilli;
    s.go(1, [{ kind: "tap", id: c.id }]);
    s.go(1, [swipe(c.id, true, 0)]);
    s.go(1, [swipe(c.id, false, far)]);
    expect(s.blows()).toHaveLength(1);
    expect(s.it()?.blisterPressed).toBeUndefined();
    // A pull without the press counts nothing.
    s.go(1, [swipe(c.id, true, 0)]);
    s.go(1, [swipe(c.id, false, far)]);
    expect(s.blows()).toHaveLength(1);
    s.go(1, [{ kind: "tap", id: c.id }]);
    s.go(1, [swipe(c.id, true, 0)]);
    s.go(1, [swipe(c.id, false, far)]);
    expect(s.gone()).toBe(true);
  });

  it("asks a SWIPE for the stroke length the wave set", () => {
    const s = stage(body("swipe", { lengthMilli: 3000 }));
    const c = s.up();
    s.go(1, [swipe(c.id, true, 0)]);
    s.go(1, [swipe(c.id, false, 2500)]);
    expect(s.blows()).toHaveLength(0);
    s.go(1, [swipe(c.id, true, 0)]);
    s.go(1, [swipe(c.id, false, 3000)]);
    expect(s.blows()).toHaveLength(1);
  });

  it("holds a HOLD as long as its length", () => {
    const s = stage(body("hold", { lengthMilli: 2000 }));
    const c = s.up();
    s.go(1, [{ kind: "grip", id: c.id }]);
    s.go(TPB + 2);
    expect(s.blows()).toHaveLength(0);
    s.go(TPB);
    expect(s.blows()).toHaveLength(1);
  });

  it("turns a TURN as far round as its length", () => {
    const s = stage(body("turn", { lengthMilli: 2000 }));
    const c = s.up();
    const turn = (at: number): Command => ({
      kind: "drag",
      target: "blisterTurn",
      id: c.id,
      on: true,
      fromMilli: at,
    });
    s.go(1, [turn(NO_BEARING)]);
    const eighth = BEARING_TURN / 8;
    for (let i = 0; i <= 8; i++) s.go(1, [turn((i * eighth) % BEARING_TURN)]);
    expect(s.blows()).toHaveLength(0);
    for (let i = 1; i <= 8; i++) s.go(1, [turn((i * eighth) % BEARING_TURN)]);
    expect(s.blows()).toHaveLength(1);
  });

  it("spends a LEVER hand that dealt a blow until it lifts", () => {
    const s = stage(body("lever", { blows: 2 }));
    const c = s.up();
    const band = Math.round((CFG.blisterLeverFromMilli + CFG.blisterLeverToMilli) / 2);
    const knob = (on: boolean, at: number): Command => ({
      kind: "drag",
      target: "blisterLever",
      id: c.id,
      on,
      fromMilli: 0,
      fromYMilli: at,
    });
    s.go(1, [knob(true, 0)]);
    s.go(1, [knob(true, band)]);
    s.go(TPB + 1);
    expect(s.blows()).toHaveLength(1);
    s.go(1, [knob(true, band)]);
    s.go(TPB + 1);
    expect(s.blows()).toHaveLength(1);
    s.go(1, [knob(false, band)]);
    s.go(1, [knob(true, 0)]);
    s.go(1, [knob(true, band)]);
    s.go(TPB + 1);
    expect(s.gone()).toBe(true);
  });

  it("is in the fingerprint: a blow counted on one phone only is two worlds", () => {
    const a = stage(body("tap", { blows: 3 }));
    const b = stage(body("tap", { blows: 3 }));
    const c = a.up();
    b.up();
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
    a.go(1, [{ kind: "tap", id: c.id }]);
    b.go(1);
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
