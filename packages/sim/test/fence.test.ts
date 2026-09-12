import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, midCol, ticksPerBeat } from "../src/config.js";
import {
  fenceGapCols,
  fenceGapSeen,
  fenceIsBurnt,
  fenceIsOpen,
  fenceMask,
  fenceSettleTicks,
} from "../src/fence.js";
import { fenceCrackAt, fenceCrackCols } from "../src/fence-crack.js";
import { isGrippable } from "../src/grippable.js";
import { hashWorld } from "../src/hash.js";
import { fallTilesPerBeat, isMeteorKind, isWardable } from "../src/kinds.js";
import { spanOf, spawnSpan } from "../src/span.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE FENCE: a live wire the width of the field, with gaps burnt through it.
 *
 * What is worth pinning here is the half a reader of `fence.ts` cannot check
 * by eye — that it really does cover every column, that it comes down at
 * twice a slick's speed, that the **column alone** answers it with the trigger
 * making no difference either way, that a dome in a gap costs the hull nothing
 * and a dome in the way costs it `fenceDamage`, that a call landing on the last
 * possible beat still saves the ship, that a bolt cuts a way through in the
 * cannon's own column and is stopped by every column that is still shut, that
 * a burnt hole is on both screens and an authored one is not, and that a
 * second device walking the same beats arrives at the same fingerprint.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
/** Where the shield answers, written out by hand for `guard.test.ts`'s reason:
 * a test that asks the rule where the rule is cannot fail when the rule is
 * wrong. */
const SHIELD = HULL - 1;

const fence = (
  gaps: number[],
  cracksRed: number[] = [],
  cracksCyan: number[] = [],
): SpawnEntry => ({
  beat: 0,
  col: 0,
  kind: "fence",
  color: null,
  gaps,
  ...(cracksRed.length ? { cracksRed } : {}),
  ...(cracksCyan.length ? { cracksCyan } : {}),
});
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

interface Run {
  world: World;
  events: SimEvent[];
  /** The fence's row after each beat it was still on the field for. */
  rows: number[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = [], seed = 0): Run {
  const world = createWorld({ ...CFG }, seed, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  const rows: number[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
    const body = world.creatures.find((c) => c.kind === "fence");
    if (body && (t + 1) % TPB === 0) rows.push(body.row);
  }
  return { world, events, rows };
}

/** The fence on the field, or undefined once it is gone. */
const fenceOf = (w: World): Creature | undefined => w.creatures.find((c) => c.kind === "fence");

describe("THE FENCE, as a kind", () => {
  it("is not a rock, so the cannon is never offered a crater in it", () => {
    expect(isMeteorKind("fence")).toBe(false);
    expect(isWardable("fence")).toBe(false);
  });

  it("refuses a hand: a fence has no column for one to be on", () => {
    expect(isGrippable("fence")).toBe(false);
    expect(isGrippable("meteor")).toBe(true);
  });

  it("comes down two rows a beat — twice a slick, and the second tier's own", () => {
    expect(fallTilesPerBeat("fence")).toBe(fallTilesPerBeat("meteorMedium"));
    expect(fallTilesPerBeat("fence")).toBe(2 * fallTilesPerBeat("slick"));
  });

  it("is as wide as the field before it arrives and after", () => {
    expect(spawnSpan(CFG.cols, { kind: "fence" })).toBe(CFG.cols);
    const { world } = run([fence([2])], TPB * 2);
    expect(spanOf(fenceOf(world) as Creature)).toBe(CFG.cols);
  });
});

describe("where a fence is open", () => {
  it("opens exactly the columns it was given, and nothing either side", () => {
    const mask = fenceMask(CFG, [0, 5]);
    const body = { fenceGaps: mask } as Creature;
    expect(fenceGapCols(CFG, body)).toEqual([0, 5]);
  });

  it("drops a gap off the end of the field rather than wrapping it round", () => {
    const body = { fenceGaps: fenceMask(CFG, [CFG.cols + 3]) } as Creature;
    // Not column 3, which is what a mask taken modulo the width would give —
    // and a way through nobody was shown is worse than none at all.
    expect(fenceGapCols(CFG, body)).toEqual([]);
  });

  it("leaves a fence with no authored gaps solid", () => {
    // It used to be given one in the middle. The cannon can cut one now, so a
    // solid fence is the hardest this creature gets rather than an impossible
    // one — and it is a shape a wave may author on purpose.
    const body = { fenceGaps: fenceMask(CFG, []) } as Creature;
    expect(fenceGapCols(CFG, body)).toEqual([]);
    expect(fenceIsOpen(body, midCol(CFG))).toBe(false);
  });

  it("is open in the gap and shut everywhere else", () => {
    const { world } = run([fence([4])], TPB * 2);
    const body = fenceOf(world) as Creature;
    for (let col = 0; col < CFG.cols; col++) {
      expect(fenceIsOpen(body, col)).toBe(col === 4);
    }
  });
});

/** Beats from the wave's start to the beat a fence stands at or past the
 * shield's row. It enters on row 0 at beat 1 and takes two rows a beat. */
const beatsToShield = 1 + Math.ceil(SHIELD / fallTilesPerBeat("fence"));
const ticksPast = TPB * (beatsToShield + 2);

describe("a fence reaching the ship", () => {
  it("goes over the ship when the dome is in the gap, with no trigger at all", () => {
    const { world, events } = run([fence([4])], ticksPast, [shieldTo(TPB, 4)]);
    expect(fenceOf(world)).toBeUndefined();
    expect(world.retries).toBe(0);
    expect(events.some((e) => e.type === "fencePass")).toBe(true);
    expect(world.guard.deflected).toBe(1);
  });

  it("breaks the hull when the dome is not, however hard the trigger is pressed", () => {
    // The trigger held down through the whole descent. A rock would be turned
    // by this; a fence does not care, and that is the creature.
    const presses: TimedCommand[] = [];
    for (let t = 0; t < ticksPast; t += 10) presses.push(guard(t));
    const { world, events } = run([fence([4])], ticksPast, [shieldTo(TPB, 0), ...presses]);
    expect(fenceOf(world)).toBeUndefined();
    // A fence lands heavy: it is a rock's arrival, not a body's brush.
    const breach = events.find((e) => e.type === "breach");
    expect(breach && breach.type === "breach" && breach.weight).toBe("heavy");
    expect(world.retries).toBe(1);
    expect(world.guard.deflected).toBe(0);
    // Right column, wrong moment is a failure class this creature has not got.
    expect(world.guard.mistimed).toBe(0);
    expect(world.guard.tries).toBe(1);
  });

  it("breaks the hull in the shield's own column and nowhere else", () => {
    const { events } = run([fence([4])], ticksPast, [shieldTo(TPB, 2)]);
    const breaches = events.filter((e) => e.type === "breach");
    expect(breaches.map((e) => e.type === "breach" && e.col)).toEqual([2]);
  });

  it("leaves no scar in the plating: a wire earths, it does not strike", () => {
    // What a wall costs is `fenceDamage` and the shield's own line put out in
    // places (`render/shield-outage.ts`), and the owner asked for exactly that
    // — no cracks on the ship. `breachUnscarred` is where the two halves meet:
    // the points and the event, and nothing for `scars.ts` to tear open.
    const { world } = run([fence([4])], ticksPast, [shieldTo(TPB, 2)]);
    expect(world.retries).toBe(1);
    expect(world.scars).toEqual([]);
  });

  it("stays on the field until it is drawn resting on the ship", () => {
    // It used to be taken off a whole tile short of the hull the moment the
    // dome was standing in a gap, so the last frame of a wall was in mid-air.
    // Both answers are given on the same beat now — the one the pair watches
    // the wire come down on them.
    const { rows } = run([fence([4])], ticksPast, [shieldTo(TPB, 4)]);
    expect(rows.at(-1)).toBe(HULL);
  });

  it("is still answerable on the beat it lands: a late call saves the ship", () => {
    // Nothing moves until the fence is already standing at the shield's row —
    // the one beat of grace every arrival gets, and the reason a number that
    // crossed the room late is still worth saying.
    const late = TPB * beatsToShield;
    const { world } = run([fence([4])], ticksPast, [shieldTo(late, 4)]);
    expect(world.retries).toBe(0);
    expect(world.guard.deflected).toBe(1);
  });

  it("passes through a fence with two gaps by either of them", () => {
    for (const col of [1, 6]) {
      const { world } = run([fence([1, 6])], ticksPast, [shieldTo(TPB, col)]);
      expect(world.retries).toBe(0);
    }
  });
});

describe("a bolt and a fence", () => {
  /** Put the cannon in `col` and fire a few ticks later. The colour is the
   * other half of the answer now: only the one the crack carries opens it. */
  const shootAt = (col: number, tick: number, color: "red" | "cyan" = "red"): TimedCommand[] => [
    { tick, player: 1, command: { kind: "cannonCol", col } },
    { tick: tick + 8, player: 2, command: { kind: "fire", color } },
  ];

  it("cuts a way through at a crack, in the crack's own colour", () => {
    // The only place a bolt opens a wall, and the only colour that opens it.
    const { world, events } = run([fence([], [7])], TPB * 4, shootAt(7, TPB));
    const body = fenceOf(world) as Creature;
    expect(fenceIsBurnt(body, 7)).toBe(true);
    expect(fenceIsOpen(body, 7)).toBe(true);
    expect(events.some((e) => e.type === "fenceBurn" && e.col === 7)).toBe(true);
    // And nowhere else, and no crater either: a fence is not a rock, so a shot
    // does not dent it — it changes what it is.
    expect(fenceIsBurnt(body, 6)).toBe(false);
    expect(body.holes).toBe(0);
  });

  it("refuses every column that is not cracked", () => {
    // The owner's rule: only on the breaking point can you shoot through. A
    // cannon that could open a column wherever it liked would turn every wall
    // into the same wall — point at the dome, fire, done.
    const { world, events } = run([fence([4], [2])], TPB * 4, shootAt(7, TPB));
    const body = fenceOf(world) as Creature;
    expect(fenceCrackAt(body, 7)).toBe(null);
    expect(fenceIsBurnt(body, 7)).toBe(false);
    expect(events.some((e) => e.type === "fenceBurn")).toBe(false);
    // The bolt is spent all the same — the wire took it — and says so, because
    // a shot that vanished with nothing to show reads as a missed press.
    expect(events.some((e) => e.type === "reject" && e.col === 7)).toBe(true);
  });

  it("refuses a crack shot in the other colour", () => {
    // The crack is a place *and* a colour, which is what makes it a sentence
    // rather than a mark: the pilot who can see it holds neither trigger.
    const { world, events } = run([fence([], [], [7])], TPB * 4, shootAt(7, TPB, "red"));
    const body = fenceOf(world) as Creature;
    expect(fenceCrackAt(body, 7)).toBe("cyan");
    expect(fenceIsBurnt(body, 7)).toBe(false);
    expect(events.some((e) => e.type === "reject" && e.col === 7)).toBe(true);
  });

  it("opens every crack it carries, so a wrong column is not final", () => {
    const { world } = run([fence([], [7, 2])], TPB * 5, [
      ...shootAt(7, TPB),
      ...shootAt(2, TPB * 3),
    ]);
    const body = fenceOf(world) as Creature;
    expect(fenceIsBurnt(body, 7)).toBe(true);
    expect(fenceIsBurnt(body, 2)).toBe(true);
  });

  it("cracks a wall the wave left solid and uncracked, in the cell it was painted in", () => {
    // `queueFromWave`'s default, checked here because it is the one thing
    // standing between the brush and a wall nobody can pass or cut.
    const { world } = run(
      [{ beat: 0, col: 0, kind: "fence", color: null, gaps: [], cracksRed: [5] }],
      TPB,
      [],
    );
    const body = fenceOf(world) as Creature;
    expect(fenceCrackCols(CFG, body)).toEqual([{ col: 5, color: "red" }]);
  });

  it("counts the dome settled after half a tile of this wall's own fall", () => {
    // What the arc between the wall and the dome waits for before it goes out
    // (`render/fence-arc.ts`). Half a tile at two tiles a beat is a quarter of
    // one, and the rule is called rather than written out at the draw site.
    expect(fenceSettleTicks(CFG)).toBe(Math.round(TPB / 4));
  });

  it("saves the ship from a fence with no authored gaps at all", () => {
    // The whole of the second answer, and the reason a wave may author none:
    // the pilot holds the cannon and the navigator holds the shield, so a hole
    // over the dome takes one of them saying where it is and the other putting
    // the cannon there.
    const { world, events } = run([fence([], [2])], ticksPast, [
      shieldTo(TPB, 2),
      ...shootAt(2, TPB * 2),
    ]);
    expect(world.retries).toBe(0);
    expect(events.some((e) => e.type === "fencePass")).toBe(true);
  });

  it("costs the hull when nobody cuts one", () => {
    // The same solid fence, left alone. Without the cannon there is no answer
    // at all, which is what makes authoring no gaps a decision.
    const { world } = run([fence([], [2])], ticksPast, [shieldTo(TPB, 2)]);
    expect(world.retries).toBe(1);
  });

  it("goes through a way that is already open, rather than dying on it", () => {
    // A hole is a hole. A bolt fired up a gap reaches whatever is above it, so
    // a shot spent on a column the pair has already opened is not a shot
    // thrown away — which is what keeps the two answers from fighting.
    const queue: SpawnEntry[] = [
      { beat: 0, col: 0, kind: "fence", color: null, gaps: [4] },
      { beat: 0, col: 4, kind: "slick", color: "red" },
    ];
    const { world } = run(queue, TPB * 5, shootAt(4, TPB));
    expect(world.creatures.some((c) => c.kind === "slick")).toBe(false);
  });

  it("stops a bolt in a column it is still shut in", () => {
    // The same shot one lane over. The body above lives, because the wire took
    // the bolt — and that is what a cannon spent on a fence costs.
    const queue: SpawnEntry[] = [
      { beat: 0, col: 0, kind: "fence", color: null, gaps: [4] },
      { beat: 0, col: 6, kind: "slick", color: "red" },
    ];
    const { world } = run(queue, TPB * 5, shootAt(6, TPB));
    expect(world.creatures.some((c) => c.kind === "slick")).toBe(true);
  });
});

describe("what each screen is shown", () => {
  it("keeps an authored gap from the seat that holds the shield", () => {
    const body = { fenceGaps: fenceMask(CFG, [4]) } as Creature;
    expect(fenceGapSeen(body, 4, true)).toBe(true);
    expect(fenceGapSeen(body, 4, false)).toBe(false);
    expect(fenceGapCols(CFG, body, false)).toEqual([]);
  });

  it("shows a burnt one to both, because they watched it happen", () => {
    const body = { fenceGaps: fenceMask(CFG, [4]), fenceBurns: 1 << 7 } as Creature;
    expect(fenceGapSeen(body, 7, true)).toBe(true);
    expect(fenceGapSeen(body, 7, false)).toBe(true);
    expect(fenceGapCols(CFG, body, false)).toEqual([7]);
    expect(fenceGapCols(CFG, body, true)).toEqual([4, 7]);
  });
});

describe("two devices", () => {
  it("fingerprint the same run identically", () => {
    const inputs = [shieldTo(TPB, 4), guard(TPB * 3), shieldTo(TPB * 4, 2)];
    const a = run([fence([4, 0])], TPB * 14, inputs, 5);
    const b = run([fence([4, 0])], TPB * 14, inputs, 5);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });

  it("notices a fence opened somewhere else", () => {
    const a = run([fence([4])], TPB * 4, [], 5);
    const b = run([fence([2])], TPB * 4, [], 5);
    expect(hashWorld(a.world)).not.toBe(hashWorld(b.world));
  });
});
