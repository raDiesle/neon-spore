import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type VaneState,
  vaneBearingOpen,
  vaneColor,
  vaneFold,
  vaneOpen,
  vaneOpeningNow,
  vanePhase,
  vanePinned,
  vanePivotCol,
  vaneSplitCol,
  vaneTipCol,
  vaneTipNow,
  type World,
} from "../src/index.js";
import { colSpan } from "../src/types.js";

/**
 * **THE VANE's two hands on the picture**: the pilot's thumb pinning the arm
 * under VEER and the navigator's haul on the seized housing under SEIZE
 * (`docs/spec/bosses.md` §11.5, *Three phases, three gestures*).
 *
 * What is held here is the trade the two phases make. From VEER the cycle
 * stops handing the pair a window at each end of the sweep, and the only way
 * to one is a thumb on the arm — which buys them the thing this boss has never
 * let them have: a **fold line that is standing still** for as long as the
 * thumb is down, so a column named against the arm is still true when the
 * sentence saying it arrives. Under SEIZE that is no longer enough on its own.
 *
 * Nothing here can hurt anybody. Every miss below is a window lost, which is
 * what the boss that attacks nobody is allowed to cost (§11.5).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const PIVOT = vanePivotCol(CFG);

function open(pins: number): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "vane", pins });
  return world;
}

function beats(world: World, n: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < n * TPB; t++) step(world, byTick.get(world.tick) ?? []);
  return world;
}

const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane");
  return b;
};

const arm = (on: boolean): TimedCommand["command"] => ({
  kind: "drag",
  target: "vaneArm",
  on,
  fromMilli: 0,
});

const housing = (milli: number): TimedCommand["command"] => ({
  kind: "drag",
  target: "vaneHousing",
  on: false,
  fromMilli: 0,
  fromYMilli: milli,
});

/** A thumb down on the arm this instant. */
function pin(world: World, player: 1 | 2 = 1): World {
  const at = world.tick;
  return beats(world, 1, [{ tick: at, player, command: arm(true) }]);
}

describe("the pin, under VEER", () => {
  it("is the only thing that splits the housing", () => {
    const world = beats(open(3), 1);
    expect(vanePhase(vane(world).pins).name).toBe("VEER");
    expect(vaneOpen(world)).toBe(false);
    pin(world);
    expect(vanePinned(world, vane(world))).toBe(true);
    expect(vaneOpen(world)).toBe(true);
  });

  it("stops the arm where it stood, and the fold line with it", () => {
    const world = beats(open(3), 1);
    pin(world);
    const held = vane(world).pinCol;
    expect(held).toBe(vaneTipCol(CFG, 3, world.waveBeat));
    // Two beats on, the sweep has moved and the pinned arm has not.
    beats(world, 2);
    expect(vaneTipCol(CFG, 3, world.waveBeat)).not.toBe(held);
    expect(vaneTipNow(world, vane(world))).toBe(held);
  });

  /**
   * And that is what the thumb is *for*. An arrival on a pinned beat is folded
   * about the column the pair are looking at rather than the one the arm has
   * swept on to, which is the whole difficulty of this boss handed back to
   * them for the price of a hand.
   */
  it("folds an arrival about the column it is pinned in", () => {
    const world = createWorld({ ...CFG }, 1);
    startWave(world, 0, [{ beat: 3, col: 0, kind: "meteor", color: null }], [], {
      kind: "vane",
      pins: 3,
    });
    beats(world, 1);
    pin(world);
    const held = vane(world).pinCol;
    beats(world, 3);
    const body = world.creatures[0];
    expect(body).toBeDefined();
    expect(body?.col).toBe(vaneFold(CFG, held, 0, colSpan("meteor")));
  });

  it("puts the split on the side away from the load, as the ends do", () => {
    const world = beats(open(3), 1);
    pin(world);
    expect(vaneSplitCol(world, vane(world))).toBe(PIVOT - vane(world).pinSide);
  });

  it("takes a pin from a shot up the split column in the housing's colour", () => {
    const world = beats(open(3), 1);
    pin(world);
    const at = world.tick;
    beats(world, 2, [
      {
        tick: at,
        player: 1,
        command: { kind: "cannonCol", col: vaneSplitCol(world, vane(world)) },
      },
      {
        tick: at + 2,
        player: 2,
        command: { kind: "fire", color: vaneColor(vaneOpeningNow(world.waveBeat)) },
      },
    ]);
    expect(vane(world).pins).toBe(2);
  });

  it("gives one pin per hold and no more, so a spray cannot skip one", () => {
    const world = beats(open(3), 1);
    pin(world);
    const col = vaneSplitCol(world, vane(world));
    const color = vaneColor(vaneOpeningNow(world.waveBeat));
    const at = world.tick;
    beats(world, 3, [
      { tick: at, player: 1, command: { kind: "cannonCol", col } },
      { tick: at + 2, player: 2, command: { kind: "fire", color } },
      { tick: at + TPB, player: 2, command: { kind: "fire", color } },
    ]);
    expect(vane(world).pins).toBe(2);
  });

  it("is torn free when its beats run out, and the window goes with it", () => {
    const world = beats(open(3), 1);
    pin(world);
    beats(world, CFG.vanePinBeats + 1);
    expect(vanePinned(world, vane(world))).toBe(false);
    expect(vane(world).pinBeat).toBe(-1);
    expect(vaneOpen(world)).toBe(false);
  });

  it("goes the moment the thumb lifts", () => {
    const world = beats(open(3), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 1, command: arm(false) }]);
    expect(vaneOpen(world)).toBe(false);
  });

  /** The pilot's hand and nobody else's: the seat with the cannon is the seat
   * that has to reach the column it pins. */
  it("is the pilot's alone", () => {
    const world = beats(open(3), 1);
    pin(world, 2);
    expect(vane(world).pinBeat).toBe(-1);
  });

  it("does nothing at all while SWING lasts", () => {
    const world = beats(open(CFG.vanePins), 1);
    pin(world);
    expect(vane(world).pinBeat).toBe(-1);
  });
});

describe("the haul, under SEIZE", () => {
  it("leaves a pinned arm shut until the housing comes off it", () => {
    const world = beats(open(1), 1);
    expect(vanePhase(vane(world).pins).name).toBe("SEIZE");
    pin(world);
    expect(vanePinned(world, vane(world))).toBe(true);
    expect(vaneBearingOpen(world, vane(world))).toBe(false);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    expect(vane(world).hauled).toBe(true);
    expect(vaneOpen(world)).toBe(true);
  });

  it("refuses a carry that did not travel far enough", () => {
    const world = beats(open(1), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli - 1) }]);
    expect(vane(world).hauled).toBe(false);
  });

  /** A housing on a moving arm cannot be hauled: the two hands are the phase. */
  it("refuses a haul on an arm nobody is holding", () => {
    const world = beats(open(1), 1);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    expect(vane(world).hauled).toBe(false);
  });

  it("is the navigator's alone", () => {
    const world = beats(open(1), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 1, command: housing(CFG.vaneHaulMilli) }]);
    expect(vane(world).hauled).toBe(false);
  });

  it("comes off with the pin, and has to be made again on the next one", () => {
    const world = beats(open(1), 1);
    pin(world);
    const at = world.tick;
    beats(world, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    beats(world, 1, [{ tick: world.tick, player: 1, command: arm(false) }]);
    expect(vane(world).hauled).toBe(false);
    pin(world);
    expect(vaneBearingOpen(world, vane(world))).toBe(false);
  });
});

describe("the two hands in the fingerprint", () => {
  /**
   * Where the arm is pinned is where every arrival this beat lands, so two
   * devices that disagree about it are two devices putting the same rock in
   * two columns (`vane-hash.ts`).
   */
  it("moves when the arm is pinned, hauled or spent", () => {
    const base = beats(open(1), 1);
    const before = hashWorld(base);
    pin(base);
    const pinned = hashWorld(base);
    expect(pinned).not.toBe(before);
    const at = base.tick;
    beats(base, 1, [{ tick: at, player: 2, command: housing(CFG.vaneHaulMilli) }]);
    expect(hashWorld(base)).not.toBe(pinned);
  });

  it("plays the same fight twice", () => {
    const play = (): World => {
      const world = beats(open(3), 1);
      pin(world);
      return beats(world, 2);
    };
    expect(hashWorld(play())).toBe(hashWorld(play()));
  });
});
