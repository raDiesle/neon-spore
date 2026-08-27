import { describe, expect, it } from "bun:test";
import {
  type Color,
  createRng,
  createWorld,
  DEFAULT_CONFIG,
  fallTilesPerBeat,
  hullRow,
  NO_GRIP,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  WARDEN_COLS,
  type WardenState,
  type World,
  wardenClamp,
  wardenClampedControl,
  wardenColor,
  wardenCycleBeat,
  wardenEyeOpen,
  wardenReachBeats,
  wardenRescuer,
  wardenTether,
} from "../src/index.js";

/**
 * THE WARDEN: the boss that takes a hand off you.
 *
 * The whole fight is one cycle repeated, so most of what is checked here is
 * that cycle keeping its promises — the ones `docs/spec/bosses.md` 11.4 makes
 * in a table and that a pair has to be able to learn on their first turn:
 * the line lands where the control was standing, the clamp alternates, the
 * clock never moves, the vent arrives exactly one cycle later.
 */

/**
 * The defaults with the hull's trickle of regeneration switched off. Every
 * assertion below about what something cost is then an exact number rather
 * than one that drifts by whatever fraction of a second the run took.
 */
const CFG: SimConfig = { ...DEFAULT_CONFIG, hullRegenPerSecond: 0 };
const TPB = ticksPerBeat(CFG);
const REACH = wardenReachBeats(CFG);
const CENTRE = Math.floor(CFG.cols / 2);

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

/** A hand on whatever line is hanging, held from `beat` for `hold` beats. */
function pull(run: Run, beat: number, player: 1 | 2, hold: number): TimedCommand[] {
  beats(run, beat);
  const tether = wardenTether(run.world);
  if (!tether) throw new Error(`no tether at beat ${beat}`);
  return [
    at(beat, player, { kind: "grip", id: tether.id }),
    at(beat + hold, player, { kind: "grip", id: NO_GRIP }),
  ];
}

describe("the cycle", () => {
  it("puts a line on the control where it stands, and nowhere else", () => {
    const run = open();
    beats(run, 1);
    const tether = wardenTether(run.world);
    // Cycle 0 clamps the cannon, and the cannon starts in the middle.
    expect(wardenClampedControl(0)).toBe("cannon");
    expect(tether?.col).toBe(CENTRE);
    expect(wardenClamp(run.world)).toBe("cannon");
  });

  it("alternates cannon, shield, cannon — so the pair always knows whose turn it is", () => {
    const run = open();
    const seen: (string | null)[] = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      beats(run, cycle === 0 ? 1 : CFG.wardenCycleBeats);
      seen.push(wardenClamp(run.world));
    }
    expect(seen).toEqual(["cannon", "shield", "cannon"]);
  });

  it("stands the ring dead centre and never moves it", () => {
    const run = open();
    const col = () => run.world.creatures.find((c) => c.kind === "warden")?.col;
    const start = col();
    expect(start).toBe(Math.floor((CFG.cols - WARDEN_COLS) / 2));
    beats(run, CFG.wardenCycleBeats * 2);
    expect(col()).toBe(start);
  });

  it("drifts the pupil inside the rim and never out of it", () => {
    const run = open();
    const body = () => run.world.creatures.find((c) => c.kind === "warden")!;
    for (let b = 0; b < CFG.wardenCycleBeats * 2; b++) {
      beats(run, 1);
      const lo = body().col;
      expect(warden(run.world).pupilCol).toBeGreaterThanOrEqual(lo);
      expect(warden(run.world).pupilCol).toBeLessThanOrEqual(lo + WARDEN_COLS - 1);
    }
  });

  it("draws nothing from the rng — the same fight on both devices", () => {
    const run = open();
    beats(run, CFG.wardenCycleBeats * 3);
    expect(run.world.rng.state).toBe(createRng(1).state);
  });
});

describe("a clamped control", () => {
  it("takes no column, and does not queue the one it refused", () => {
    const run = open();
    beats(run, 1);
    beats(run, 2, [at(1, 1, { kind: "cannonCol", col: 0 })]);
    expect(run.world.cannonCol).toBe(CENTRE);
    // The line reaches the hull on the reach beat and lets go; the cannon is
    // still where it was, not where the thumb wandered while it was held.
    beats(run, REACH);
    expect(wardenClamp(run.world)).toBeNull();
    expect(run.world.cannonCol).toBe(CENTRE);
  });

  it("leaves the other control alone", () => {
    const run = open();
    beats(run, 2, [at(1, 2, { kind: "shieldCol", col: 1 })]);
    expect(run.world.shieldCol).toBe(1);
  });

  it("leaves the trigger and the maw working — it is the sliding that stops", () => {
    const run = open();
    beats(run, 2, [at(1, 1, { kind: "guard" })]);
    expect(run.world.guardTick).toBeGreaterThan(0);
  });
});

describe("the rescue", () => {
  it("refuses the hand of the player it is holding", () => {
    const run = open();
    const held = pull(run, 1, 1, 4); // cycle 0 clamps the cannon, so player 1
    beats(run, 4, held);
    expect(warden(run.world).tornBeat).toBe(-1);
    expect(wardenTether(run.world)).not.toBeNull();
  });

  it("tears on `wardenPullBeats` of hold by the other player, and opens the eye", () => {
    const run = open();
    expect(wardenRescuer(0)).toBe(2);
    const held = pull(run, 1, 2, CFG.wardenPullBeats);
    beats(run, REACH - 1, held);
    expect(wardenTether(run.world)).toBeNull();
    expect(run.events.some((e) => e.type === "tetherTorn")).toBe(true);
    // The clock never moves: torn early or late, the pupil opens on the same
    // beat it always opens on.
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(false);
    beats(run, 1);
    expect(wardenCycleBeat(CFG, run.world.waveBeat)).toBe(REACH);
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(true);
  });

  it("accumulates the hold rather than demanding it unbroken", () => {
    const run = open();
    beats(run, 1);
    const id = wardenTether(run.world)!.id;
    const half = CFG.wardenPullBeats / 2;
    beats(run, 4, [
      at(1, 2, { kind: "grip", id }),
      at(1 + half, 2, { kind: "grip", id: NO_GRIP }),
      at(2 + half, 2, { kind: "grip", id }),
      at(2 + CFG.wardenPullBeats, 2, { kind: "grip", id: NO_GRIP }),
    ]);
    expect(warden(run.world).tornBeat).not.toBe(-1);
  });

  it("saves the hull but opens nothing when the pull lands late", () => {
    // A hold longer than the line's whole fall, so the hand is still on it
    // when the pupil would have opened. The hand slows the line all the way
    // (`gripSlowPermille`), which is what makes a late pull a real trade: the
    // hull is saved and the cycle opens nothing.
    const slow: SimConfig = { ...CFG, wardenPullBeats: REACH + 2 };
    const run = open(undefined, slow);
    const held = pull(run, 1, 2, REACH + 2);
    beats(run, REACH + 1, held);
    expect(run.world.hullMilli).toBe(100_000);
    expect(warden(run.world).tornBeat).toBe(-1);
    expect(warden(run.world).openBeat).toBe(-1);
    expect(wardenEyeOpen(run.world, warden(run.world))).toBe(false);
  });

  it("costs the hull and a scar when it gets all the way down, and nothing else", () => {
    const run = open();
    beats(run, REACH + 1);
    expect(run.world.hullMilli).toBe((100 - CFG.damageWarden) * 1000);
    expect(run.world.scars.map((s) => s.kind)).toEqual(["tether"]);
    // No compounding: the plate the opening would have taken is simply not
    // taken, and the guard balance never saw a try it could not have answered.
    expect(warden(run.world).plates).toBe(CFG.wardenPlates);
    expect(run.world.guard.tries).toBe(0);
  });
});

describe("the open eye", () => {
  /** Tear the line and stand the cannon under the pupil, ready to fire. */
  function opened(plates?: number): Run {
    const run = open(plates);
    const held = pull(run, 1, 2, CFG.wardenPullBeats);
    beats(run, REACH, held);
    return run;
  }

  const rimColor = (): Color => wardenColor(0);

  function shoot(run: Run, col: number, color: Color): void {
    const beat = Math.round(run.world.tick / TPB);
    beats(run, 2, [at(beat, 1, { kind: "cannonCol", col }), at(beat, 2, { kind: "fire", color })]);
  }

  it("takes a plate for the rim's colour in the pupil's column", () => {
    const run = opened();
    const before = warden(run.world).plates;
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(warden(run.world).plates).toBe(before - 1);
    expect(run.events.some((e) => e.type === "plate")).toBe(true);
  });

  it("spends the opening on one shot — a spray may not skip a plate", () => {
    const run = opened();
    const before = warden(run.world).plates;
    shoot(run, warden(run.world).pupilCol, rimColor());
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(warden(run.world).plates).toBe(before - 1);
  });

  it("reads a wrong colour as a colour miss and a shut iris as neither", () => {
    const wrong = open();
    const held = pull(wrong, 1, 2, CFG.wardenPullBeats);
    beats(wrong, REACH, held);
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

  it("goes down on its last plate, and takes its line with it", () => {
    const run = opened(1);
    shoot(run, warden(run.world).pupilCol, rimColor());
    expect(run.world.boss).toBeNull();
    expect(run.world.creatures.filter((c) => c.kind === "tether")).toHaveLength(0);
    expect(run.events.some((e) => e.type === "wardenDown")).toBe(true);
    expect(run.world.score).toBeGreaterThanOrEqual(CFG.scoreWardenDown);
  });
});

describe("the vent", () => {
  it("squeezes a rock out of the pupil's column whether the line was torn or not", () => {
    const run = open();
    beats(run, REACH + 3);
    expect(wardenCycleBeat(CFG, run.world.waveBeat)).toBe(REACH + 2);
    const rock = run.world.creatures.find((c) => c.kind === "meteor");
    // The column the iris shut on, which is where the rock was standing all
    // along — it is squeezed out, not spawned above the field.
    expect(rock?.col).toBe(warden(run.world).pupilCol);
    expect(rock?.row).toBe(CFG.wardenRow);
    expect(rock?.fromRow).toBe(CFG.wardenRow);
  });

  it("lands on the vent beat of the next cycle — a whole cycle of warning", () => {
    const run = open();
    beats(run, REACH + 3);
    const rocks = (): SimEvent[] =>
      run.events.filter((e) => e.type === "breach" && e.kind === "meteor");
    // A whole cycle in the air, and nothing of it lands early. The next
    // cycle's own tether comes down in the middle of that, which is the point:
    // the pair has to have parked the shield in this column a cycle ago while
    // one of them was busy being held.
    beats(run, CFG.wardenCycleBeats - 1);
    expect(rocks()).toHaveLength(0);
    beats(run, 1);
    expect(wardenCycleBeat(CFG, run.world.waveBeat)).toBe(REACH + 2);
    expect(rocks()).toHaveLength(1);
  });
});

describe("the line itself", () => {
  it("cannot be shot, and does not stop a shot going up its column", () => {
    const run = open();
    beats(run, 1);
    const tether = wardenTether(run.world)!;
    beats(run, 2, [at(1, 2, { kind: "fire", color: "red" })]);
    // Still hanging, no crater on it, and the shot went past it to the ring.
    expect(wardenTether(run.world)?.id).toBe(tether.id);
    expect(wardenTether(run.world)?.holes).toBe(0);
    expect(run.events.some((e) => e.type === "reject")).toBe(true);
  });

  it("is not a guard try — the shield has nothing to do with it", () => {
    const run = open();
    beats(run, REACH + 1, [
      at(1, 2, { kind: "shieldCol", col: CENTRE }),
      at(REACH, 1, { kind: "guard" }),
    ]);
    expect(run.world.guard.tries).toBe(0);
    expect(run.world.hullMilli).toBe((100 - CFG.damageWarden) * 1000);
  });

  it("reaches the hull from the rim in exactly the beats the table says", () => {
    const run = open();
    beats(run, 1);
    expect(wardenTether(run.world)?.row).toBe(CFG.wardenRow);
    // One beat short of the reach it is still one step above the hull; on the
    // reach beat it arrives, and `resolveHull` takes it off the field.
    beats(run, REACH - 1);
    expect(hullRow(CFG) - wardenTether(run.world)!.row).toBe(fallTilesPerBeat("tether"));
    beats(run, 1);
    expect(wardenTether(run.world)).toBeNull();
    expect(run.world.hullMilli).toBe((100 - CFG.damageWarden) * 1000);
  });
});
