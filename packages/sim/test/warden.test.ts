import { describe, expect, it } from "bun:test";
import {
  type Color,
  createRng,
  createWorld,
  DEFAULT_CONFIG,
  hullRow,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  WARDEN_COLS,
  type WardenState,
  type World,
  wardenColor,
  wardenEyeOpen,
  wardenPullMilli,
  wardenTether,
} from "../src/index.js";

/**
 * THE WARDEN: the boss that is a gate on a block and tackle.
 *
 * The whole fight is one rope repeated, so most of what is checked here is that
 * rope keeping its promises — the ones `docs/spec/bosses.md` 11.4 makes and that
 * a pair has to be able to learn on their first pull: the handle hangs under the
 * middle of the ring, the hatch opens *in proportion* to the tension and by
 * nothing else, only the pilot may pull, and a landed shot takes the rope away.
 *
 * The proportionality is the one that matters most and is the easiest to lose.
 * Player 2 cannot feel the rope; how far the hatch has come open is the only
 * thing they have, so a hatch that snapped from shut to open at a threshold
 * would turn the fight into two people reading a number out loud.
 */

/**
 * The defaults with the hull's trickle of regeneration switched off. Every
 * assertion below about what something cost is then an exact number rather than
 * one that drifts by whatever fraction of a second the run took.
 */
const CFG: SimConfig = { ...DEFAULT_CONFIG, hullRegenPerSecond: 0 };
const TPB = ticksPerBeat(CFG);
const TAUT = CFG.wardenTautMilli;
const MIDDLE = Math.floor((CFG.cols - WARDEN_COLS) / 2) + Math.floor(WARDEN_COLS / 2);

interface Run {
  world: World;
  events: SimEvent[];
}

function open(plates?: number, cfg: SimConfig = CFG): Run {
  const world = createWorld({ ...cfg }, 1);
  startWave(world, 0, [], [], { kind: "warden", plates });
  return { world, events: [] };
}

/** Advance `beats` beats, collecting everything reported along the way. */
function beats(run: Run, n: number, inputs: TimedCommand[] = []): Run {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < n * TPB; t++) {
    step(run.world, byTick.get(run.world.tick) ?? []);
    run.events.push(...run.world.events);
  }
  return run;
}

/** One tick, carrying exactly these commands. The rope answers on the tick. */
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

const at = (beat: number, player: 1 | 2, command: TimedCommand["command"]): TimedCommand => ({
  tick: beat * TPB,
  player,
  command,
});

/** A hand on the handle, `fromMilli` from where it grabbed. */
const drag = (player: 1 | 2, on: boolean, fromMilli: number): Omit<TimedCommand, "tick"> => ({
  player,
  command: { kind: "drag", target: "wardenTether", on, fromMilli },
});

/** Grab the handle and haul it `milli` thousandths of a tile aside. Two ticks. */
function haul(run: Run, milli: number, player: 1 | 2 = 1): Run {
  tick(run, drag(player, true, 0));
  tick(run, drag(player, true, milli));
  return run;
}

/** A rope down, grabbed and pulled fully taut, with the hatch standing open. */
function taut(plates?: number): Run {
  const run = open(plates);
  beats(run, 1);
  return haul(run, TAUT);
}

describe("the rope", () => {
  it("comes down out of the middle of the rim, and nowhere else", () => {
    const run = open();
    beats(run, 1);
    expect(wardenTether(run.world)?.col).toBe(MIDDLE);
    // Lowered rather than dropped: it starts at the rim and hangs where it is
    // put, which is what render/ glides over the attach beat.
    expect(wardenTether(run.world)?.fromRow).toBe(CFG.wardenRow);
    expect(wardenTether(run.world)?.row).toBe(CFG.wardenRow + CFG.wardenHangRows);
  });

  it("never falls, never reaches the hull and costs nothing at all", () => {
    const run = open();
    beats(run, CFG.wardenCycleBeats - 1);
    expect(wardenTether(run.world)?.row).toBe(CFG.wardenRow + CFG.wardenHangRows);
    expect(hullRow(CFG) - wardenTether(run.world)!.row).toBeGreaterThan(0);
    expect(run.world.hullMilli).toBe(100_000);
    expect(run.world.scars).toHaveLength(0);
    // And it is not a guard try either — the shield has nothing to do with it.
    expect(run.world.guard.tries).toBe(0);
  });

  it("is replaced once a cycle, in the other colour", () => {
    const run = open();
    beats(run, 1);
    const first = wardenTether(run.world)!.id;
    expect(wardenColor(0)).toBe("red");
    beats(run, CFG.wardenCycleBeats);
    expect(wardenTether(run.world)!.id).not.toBe(first);
    expect(wardenColor(1)).toBe("cyan");
  });

  it("cannot be shot, and does not stop a shot going up its column", () => {
    const run = open();
    beats(run, 1);
    const rope = wardenTether(run.world)!;
    beats(run, 2, [at(1, 2, { kind: "fire", color: "red" })]);
    expect(wardenTether(run.world)?.id).toBe(rope.id);
    expect(wardenTether(run.world)?.holes).toBe(0);
    expect(run.events.some((e) => e.type === "reject")).toBe(true);
  });
});

describe("the pull", () => {
  it("opens the hatch by degrees, in proportion and with nothing eased", () => {
    const run = open();
    beats(run, 1);
    tick(run, drag(1, true, 0));
    expect(wardenPullMilli(run.world, warden(run.world))).toBe(0);
    for (const share of [0.25, 0.5, 0.75, 1]) {
      tick(run, drag(1, true, Math.round(TAUT * share)));
      expect(wardenPullMilli(run.world, warden(run.world))).toBe(Math.round(share * 1000));
    }
  });

  it("opens the eye only when the rope is fully taut, and not a step before", () => {
    const run = open();
    beats(run, 1);
    tick(run, drag(1, true, 0));
    tick(run, drag(1, true, TAUT - 1));
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(false);
    tick(run, drag(1, true, TAUT));
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(true);
    expect(run.events.some((e) => e.type === "eyeOpen")).toBe(true);
  });

  it("does not care which way the hand went", () => {
    const run = open();
    beats(run, 1);
    haul(run, -TAUT);
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(true);
  });

  it("shuts the moment the hand lifts", () => {
    const run = taut();
    tick(run, drag(1, false, 0));
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(false);
    expect(wardenPullMilli(run.world, warden(run.world))).toBe(0);
  });

  it("refuses player 2, who is the one who fires", () => {
    const run = open();
    beats(run, 1);
    haul(run, TAUT, 2);
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(false);
    expect(wardenPullMilli(run.world, warden(run.world))).toBe(0);
  });

  it("measures from the grab, so the hand's own starting place is nothing", () => {
    // The origin is resolved on the pulling device and never crosses the wire;
    // what arrives is a displacement, and a grab far off centre must pull
    // exactly as far as one under the handle (`Command` in `types.ts`).
    const run = open();
    beats(run, 1);
    tick(run, drag(1, true, 9_000));
    expect(wardenPullMilli(run.world, warden(run.world))).toBe(0);
    tick(run, drag(1, true, 9_000 + TAUT));
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(true);
  });

  it("is stored rather than recomputed, so a hand that stops moving holds", () => {
    // A finger held perfectly still sends nothing at all. The gate must stay
    // open across every one of those ticks or the fight is unplayable.
    const run = taut();
    beats(run, 3);
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(true);
  });

  it("draws nothing from the rng — the same fight on both devices", () => {
    const run = taut();
    beats(run, CFG.wardenCycleBeats * 2);
    expect(run.world.rng.state).toBe(createRng(1).state);
  });
});

describe("the ring", () => {
  it("stands dead centre and never moves", () => {
    const run = open();
    const col = () => run.world.creatures.find((c) => c.kind === "warden")?.col;
    const start = col();
    expect(start).toBe(Math.floor((CFG.cols - WARDEN_COLS) / 2));
    beats(run, CFG.wardenCycleBeats * 2);
    expect(col()).toBe(start);
  });

  it("drifts the pupil inside the rim and never out of it, open or shut", () => {
    const run = taut();
    const body = () => run.world.creatures.find((c) => c.kind === "warden")!;
    for (let b = 0; b < CFG.wardenCycleBeats; b++) {
      beats(run, 1);
      expect(warden(run.world).pupilCol).toBeGreaterThanOrEqual(body().col);
      expect(warden(run.world).pupilCol).toBeLessThanOrEqual(body().col + WARDEN_COLS - 1);
    }
  });
});

describe("the shot into the eye", () => {
  const rimColor = (): Color => wardenColor(0);

  function shoot(run: Run, col: number, color: Color): void {
    tick(
      run,
      { player: 1, command: { kind: "cannonCol", col } },
      { player: 2, command: { kind: "fire", color } },
    );
    beats(run, 2);
  }

  it("takes a plate for the rim's colour in the pupil's column", () => {
    const run = taut();
    const before = warden(run.world).plates;
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(warden(run.world).plates).toBe(before - 1);
    expect(run.events.some((e) => e.type === "plate")).toBe(true);
  });

  it("snaps the rope back, in the same breath as the plate", () => {
    const run = taut();
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(wardenTether(run.world)).toBeNull();
    expect(wardenPullMilli(run.world, warden(run.world))).toBe(0);
    expect(warden(run.world).pulling).toBe(false);
  });

  it("makes a hand that never lifted pull again from where it is", () => {
    // The finger is still on the glass after the hit, so its `fromMilli` is
    // still enormous. The next rope must not arrive already taut under it.
    const run = taut();
    shoot(run, warden(run.world).pupilCol, rimColor());
    beats(run, CFG.wardenCycleBeats);
    expect(wardenTether(run.world)).not.toBeNull();
    tick(run, drag(1, true, TAUT));
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(false);
  });

  it("spends the opening on one shot — a spray may not skip a plate", () => {
    const run = taut();
    const before = warden(run.world).plates;
    shoot(run, warden(run.world).pupilCol, rimColor());
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(warden(run.world).plates).toBe(before - 1);
  });

  it("reads a wrong colour as a colour miss and a shut hatch as neither", () => {
    const wrong = taut();
    shoot(wrong, warden(wrong.world).pupilCol, rimColor() === "red" ? "cyan" : "red");
    expect(wrong.world.balance.colorMisses).toBe(1);
    expect(warden(wrong.world).plates).toBe(CFG.wardenPlates);

    const shut = open();
    beats(shut, 2);
    shoot(shut, warden(shut.world).pupilCol, rimColor());
    // The ammunition may have been perfectly right and only the moment wrong.
    expect(shut.world.balance.colorMisses).toBe(0);
    expect(warden(shut.world).plates).toBe(CFG.wardenPlates);
  });

  it("goes down on its last plate, and takes its rope with it", () => {
    const run = taut(1);
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(run.world.boss).toBeNull();
    expect(run.world.creatures.filter((c) => c.kind === "tether")).toHaveLength(0);
    expect(run.events.some((e) => e.type === "wardenDown")).toBe(true);
    expect(run.world.score).toBeGreaterThanOrEqual(CFG.scoreWardenDown);
  });
});

describe("nothing in this fight can hurt the pair", () => {
  it("puts nothing on the field and takes nothing off the hull, all fight", () => {
    // The clamp, the falling line and the vented rock all came off together
    // (docs/spec/bosses.md 11.4). The room that leaves is the owner's to fill.
    const run = open();
    beats(run, CFG.wardenCycleBeats * 3);
    expect(run.world.hullMilli).toBe(100_000);
    expect(run.world.creatures.filter((c) => c.kind !== "warden" && c.kind !== "tether")).toEqual(
      [],
    );
  });
});
