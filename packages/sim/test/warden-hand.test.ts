import { describe, expect, it } from "bun:test";
import {
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  WARDEN_COLS,
  WARDEN_PHASES,
  type WardenState,
  type World,
  wardenColor,
  wardenCycle,
  wardenEyeOpen,
  wardenHatchMilli,
  wardenLidsMilli,
  wardenPhase,
  wardenTether,
  wardenThrown,
} from "../src/index.js";

/**
 * THE WARDEN's second and third hands (`warden-hand.ts`): what NARROW adds
 * to the rope and what GLARE puts in its place. The rope's own promises are
 * `warden.test.ts`'s; this file proves the two phases keep theirs —
 * `docs/spec/bosses.md` §11.4, *Three phases, three gestures*.
 *
 * Under NARROW: the lids behind the hatch part only under player 2's thumb,
 * the pupil stands still under it, the shot counts only with the rope taut
 * **and** the thumb down, and the thumb goes with the line. Under GLARE: no
 * line comes down, the pupil stares from the middle, the hatch is thrown by
 * player 1's swipe and only a swipe, it stays open `wardenThrowBeats` and
 * slams, and the shot inside the window ends the fight. Neither hand answers
 * the other seat, or outside its phase.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const TAUT = CFG.wardenTautMilli;
const MIDDLE = Math.floor((CFG.cols - WARDEN_COLS) / 2) + Math.floor(WARDEN_COLS / 2);
/** The plates each phase starts on: the bound the phase before is still over. */
const NARROW = WARDEN_PHASES[0]!.above;
const GLARE = WARDEN_PHASES[1]!.above;

interface Run {
  world: World;
  events: SimEvent[];
}

function open(plates: number): Run {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "warden", plates });
  return { world, events: [] };
}

function beats(run: Run, n: number): Run {
  for (let t = 0; t < n * TPB; t++) {
    step(run.world, []);
    run.events.push(...run.world.events);
  }
  return run;
}

function tick(run: Run, ...commands: Omit<TimedCommand, "tick">[]): Run {
  step(
    run.world,
    commands.map((c) => ({ ...c, tick: run.world.tick })),
  );
  run.events.push(...run.world.events);
  return run;
}

const warden = (world: World): WardenState => {
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("no warden on the field");
  return b;
};

const rope = (on: boolean, milli: number): Omit<TimedCommand, "tick"> => ({
  player: 1,
  command: { kind: "drag", target: "wardenTether", on, fromMilli: 0, fromYMilli: milli },
});

const eye = (player: 1 | 2, on: boolean): Omit<TimedCommand, "tick"> => ({
  player,
  command: { kind: "drag", target: "wardenEye", on, fromMilli: 0, fromYMilli: 0 },
});

const hatch = (player: 1 | 2, on: boolean, milli: number): Omit<TimedCommand, "tick"> => ({
  player,
  command: { kind: "drag", target: "wardenHatch", on, fromMilli: milli, fromYMilli: 0 },
});

/** A rope down, grabbed and hauled fully taut. */
function taut(plates: number): Run {
  const run = open(plates);
  beats(run, 1);
  tick(run, rope(true, 0));
  tick(run, rope(true, TAUT));
  return run;
}

/** A swipe across the hatch: press, then a lift `milli` away. */
function swipe(run: Run, milli = CFG.wardenThrowMilli, player: 1 | 2 = 1): Run {
  tick(run, hatch(player, true, 0));
  tick(run, hatch(player, false, milli));
  return run;
}

const rimColor = (): Color => wardenColor(0);

function shoot(run: Run, col: number, color: Color): void {
  tick(
    run,
    { player: 1, command: { kind: "cannonCol", col } },
    { player: 2, command: { kind: "fire", color } },
  );
  beats(run, 2);
}

const heard = (run: Run, type: SimEvent["type"]) => run.events.filter((e) => e.type === type);

describe("the phase table", () => {
  it("asks for a new hand per phase and never takes the first away", () => {
    expect(wardenPhase(CFG.wardenPlates).asks).toBe("pull");
    expect(wardenPhase(NARROW).asks).toBe("hold");
    expect(wardenPhase(GLARE).asks).toBe("throw");
    expect(wardenPhase(GLARE).drift).toBe(0);
  });
});

describe("under NARROW, the thumb on the eye", () => {
  it("parts the lids only while it is down, and the hatch stays the rope's", () => {
    const run = taut(NARROW);
    const b = () => warden(run.world);
    expect(wardenHatchMilli(run.world, b())).toBe(1000);
    expect(wardenLidsMilli(run.world, b())).toBe(0);
    expect(wardenEyeOpen(run.world, b())).toBe(false);
    tick(run, eye(2, true));
    expect(b().eyeHeld).toBe(true);
    expect(wardenLidsMilli(run.world, b())).toBe(1000);
    expect(wardenEyeOpen(run.world, b())).toBe(true);
    expect(heard(run, "wardenHold")).toHaveLength(1);
    expect(heard(run, "eyeOpen")).toHaveLength(1);
    tick(run, eye(2, false));
    expect(b().eyeHeld).toBe(false);
    expect(wardenLidsMilli(run.world, b())).toBe(0);
    expect(wardenEyeOpen(run.world, b())).toBe(false);
  });

  it("opens the eye in whichever order the two hands arrive", () => {
    const run = open(NARROW);
    beats(run, 1);
    tick(run, eye(2, true));
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(false);
    tick(run, rope(true, 0));
    tick(run, rope(true, TAUT));
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(true);
    expect(heard(run, "eyeOpen")).toHaveLength(1);
  });

  it("pins the pupil while it stays, and lets it walk again when it lifts", () => {
    const run = taut(NARROW);
    tick(run, eye(2, true));
    const pinned = warden(run.world).pupilCol;
    beats(run, 3);
    expect(warden(run.world).pupilCol).toBe(pinned);
    tick(run, eye(2, false));
    beats(run, 1);
    expect(warden(run.world).pupilCol).not.toBe(pinned);
  });

  it("is player 2's alone, and nothing under WATCH or GLARE", () => {
    const run = taut(NARROW);
    tick(run, eye(1, true));
    expect(warden(run.world).eyeHeld).toBe(false);
    const watch = taut(CFG.wardenPlates);
    tick(watch, eye(2, true));
    expect(warden(watch.world).eyeHeld).toBe(false);
    const glare = open(GLARE);
    beats(glare, 1);
    tick(glare, eye(2, true));
    expect(warden(glare.world).eyeHeld).toBe(false);
  });

  it("lets a shot count only with the rope taut and the thumb down", () => {
    const shut = taut(NARROW);
    shoot(shut, warden(shut.world).pupilCol, rimColor());
    expect(warden(shut.world).plates).toBe(NARROW);
    expect(heard(shut, "reject").length).toBeGreaterThan(0);
    const held = taut(NARROW);
    tick(held, eye(2, true));
    shoot(held, warden(held.world).pupilCol, rimColor());
    expect(warden(held.world).plates).toBe(NARROW - 1);
  });

  it("goes with the line: a hit cuts the rope and the thumb together", () => {
    const run = taut(NARROW);
    tick(run, eye(2, true));
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(wardenTether(run.world)).toBeNull();
    expect(warden(run.world).eyeHeld).toBe(false);
  });
});

describe("under GLARE, the thrown hatch", () => {
  it("lowers no line, and stares from the middle column", () => {
    const run = open(GLARE);
    beats(run, CFG.wardenCycleBeats + 1);
    expect(wardenTether(run.world)).toBeNull();
    expect(heard(run, "tether")).toHaveLength(0);
    expect(warden(run.world).pupilCol).toBe(MIDDLE);
  });

  it("is thrown by a swipe that travelled, and not by a tap", () => {
    const tap = open(GLARE);
    beats(tap, 1);
    swipe(tap, CFG.wardenThrowMilli - 1);
    expect(wardenThrown(tap.world, warden(tap.world))).toBe(false);
    expect(wardenHatchMilli(tap.world, warden(tap.world))).toBe(0);
    const thrown = open(GLARE);
    beats(thrown, 1);
    swipe(thrown, -CFG.wardenThrowMilli);
    const b = warden(thrown.world);
    expect(wardenThrown(thrown.world, b)).toBe(true);
    expect(wardenEyeOpen(thrown.world, b)).toBe(true);
    expect(wardenHatchMilli(thrown.world, b)).toBe(1000);
    expect(wardenLidsMilli(thrown.world, b)).toBe(1000);
    expect(heard(thrown, "wardenThrow")).toHaveLength(1);
    expect(heard(thrown, "eyeOpen")).toHaveLength(1);
  });

  it("stays open wardenThrowBeats and then slams, once", () => {
    const run = open(GLARE);
    beats(run, 1);
    swipe(run);
    beats(run, CFG.wardenThrowBeats - 1);
    expect(wardenThrown(run.world, warden(run.world))).toBe(true);
    expect(heard(run, "wardenSlam")).toHaveLength(0);
    beats(run, 1);
    expect(wardenThrown(run.world, warden(run.world))).toBe(false);
    expect(warden(run.world).throwBeat).toBe(-1);
    expect(heard(run, "wardenSlam")).toHaveLength(1);
    beats(run, 3);
    expect(heard(run, "wardenSlam")).toHaveLength(1);
  });

  it("is not thrown again while it stands open", () => {
    const run = open(GLARE);
    beats(run, 1);
    swipe(run);
    const first = warden(run.world).throwBeat;
    beats(run, 1);
    swipe(run);
    expect(warden(run.world).throwBeat).toBe(first);
    expect(heard(run, "wardenThrow")).toHaveLength(1);
  });

  it("is player 1's alone, and nothing under WATCH or NARROW", () => {
    const run = open(GLARE);
    beats(run, 1);
    swipe(run, CFG.wardenThrowMilli, 2);
    expect(wardenThrown(run.world, warden(run.world))).toBe(false);
    for (const plates of [CFG.wardenPlates, NARROW]) {
      const early = open(plates);
      beats(early, 1);
      swipe(early);
      expect(warden(early.world).throwBeat).toBe(-1);
    }
  });

  it("ends the fight on a shot inside the window, and refuses one after the slam", () => {
    const late = open(GLARE);
    beats(late, 1);
    swipe(late);
    beats(late, CFG.wardenThrowBeats);
    shoot(late, MIDDLE, rimColor());
    expect(late.world.boss?.kind).toBe("warden");
    const inside = open(GLARE);
    beats(inside, 1);
    swipe(inside);
    shoot(inside, MIDDLE, rimColor());
    expect(inside.world.boss).toBeNull();
    expect(heard(inside, "wardenDown")).toHaveLength(1);
  });
});

describe("the whole fight", () => {
  it("is won with five hits, each phase by its own hand", () => {
    const run = taut(CFG.wardenPlates);
    const rim = (): Color => wardenColor(wardenCycle(CFG, run.world.waveBeat));
    const hit = (): void => shoot(run, warden(run.world).pupilCol, rim());
    // WATCH: the rope alone, twice. Each hit cuts the line; wait for the next
    // and haul it taut again.
    const again = (): void => {
      while (wardenTether(run.world) === null) beats(run, 1);
      tick(run, rope(true, 0));
      tick(run, rope(true, TAUT));
    };
    hit();
    expect(warden(run.world).plates).toBe(4);
    again();
    hit();
    expect(warden(run.world).plates).toBe(NARROW);
    // NARROW: the rope and the thumb, twice.
    again();
    tick(run, eye(2, true));
    hit();
    expect(warden(run.world).plates).toBe(NARROW - 1);
    again();
    tick(run, eye(2, true));
    hit();
    expect(warden(run.world).plates).toBe(GLARE);
    // GLARE: no rope; a swipe and a shot inside three beats.
    beats(run, 1);
    expect(wardenTether(run.world)).toBeNull();
    swipe(run);
    shoot(run, MIDDLE, rim());
    expect(run.world.boss).toBeNull();
  });
});
