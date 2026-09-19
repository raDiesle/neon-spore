import { describe, expect, it } from "bun:test";
import { curtainHemStruck, curtainStruck } from "../src/curtain-shot.js";
import {
  type Creature,
  CURTAIN_COLS,
  type CurtainState,
  createWorld,
  curtainBoss,
  curtainCoreBare,
  curtainLobesLeft,
  curtainReach,
  curtainStride,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE CURTAIN: the one boss that is in the way, and the pair move it.
 *
 * What these pin is everything the design says and a phone cannot show. That
 * the fabric hangs seven columns wide with a core somewhere under it that
 * cannot be shot while it is covered; that a hand carried across the fabric
 * moves the whole sheet a column, the way the hand went, and may carry it
 * off the wall as far as `curtainKeepCols`; that two thumbs going opposite
 * ways cancel; that only a **soft** lobe comes off to a bolt and the others
 * bounce it; that the core is hurt by its own colour and answers the other
 * one with a rock; that a bare hem tears on the next shove; that the fabric
 * rolls back over the core when nobody holds it; and that the last hit ends
 * the wave a couple of beats later, not at once.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };
const TPB = ticksPerBeat(CFG);

function install(seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "curtain" });
  return world;
}

function curtain(world: World): CurtainState {
  const c = curtainBoss(world);
  if (c === null) throw new Error("the wave installed no curtain");
  return c;
}

const fabric = (world: World): Creature | undefined =>
  world.creatures.find((c) => c.kind === "curtain");
const torches = (world: World): Creature[] => world.creatures.filter((c) => c.kind === "torch");

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});

/** A hand `tiles` from where it grabbed — cumulative, never an increment. */
const push = (tick: number, player: 1 | 2, id: number, tiles: number): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: "gripBody",
    on: true,
    fromMilli: Math.round(tiles * CFG.gripPushMilli),
    id,
  },
});

/** A hand held on the fabric from `at` to `until`, carried `tiles` that way. */
function carry(id: number, at: number, until: number, tiles: number, player: 1 | 2 = 1) {
  const out: TimedCommand[] = [grip(at, player, id)];
  for (let t = at + 1; t < until; t++) out.push(push(t, player, id, tiles));
  return out;
}

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

function shot(world: World, col: number, color: Color = "red"): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/** Every lobe off the hem, by hand: the state the tear is tested from. */
function bareHem(c: CurtainState): void {
  for (let i = 0; i < c.lobes.length; i++) c.lobes[i] = false;
  c.soft = [];
}

describe("the fabric unrolling", () => {
  it("hangs seven wide and centred, on its row, with the core under it", () => {
    const world = install();
    const body = fabric(world) as Creature;
    const c = curtain(world);
    expect(body.col).toBe(Math.floor((CFG.cols - CURTAIN_COLS) / 2));
    expect(body.row).toBe(CFG.curtainRow);
    expect(c.lobes.length).toBe(CURTAIN_COLS);
    expect(curtainLobesLeft(c)).toBe(CURTAIN_COLS);
    expect(c.coreCol).toBeGreaterThanOrEqual(body.col);
    expect(c.coreCol).toBeLessThan(body.col + CURTAIN_COLS);
    expect(curtainCoreBare(world, c)).toBe(false);
    expect(c.soft.length).toBe(CFG.curtainSoftCount);
    expect(world.events.some((e) => e.type === "curtainUnroll")).toBe(true);
    expect(world.events.some((e) => e.type === "curtainShadow")).toBe(true);
  });

  it("redraws which lobes are soft on its count, from the ones over the field", () => {
    const world = install(4);
    const was = [...curtain(world).soft];
    runTo(world, TPB * (CFG.curtainSoftBeats - 1));
    expect(curtain(world).soft).toEqual(was);
    let seen = false;
    for (let seed = 0; seed < 8 && !seen; seed++) {
      const w = install(seed);
      const before = [...curtain(w).soft];
      runTo(w, TPB * CFG.curtainSoftBeats + 2);
      seen = curtain(w).soft.join() !== before.join();
    }
    expect(seen).toBe(true);
  });
});

describe("a hand carried across it", () => {
  it("moves the whole sheet one column the way the hand went", () => {
    const world = install();
    const body = fabric(world) as Creature;
    const from = body.col;
    const seen = runTo(world, TPB * 4, carry(body.id, 2, TPB * 4, 1));
    expect(body.col).toBe(from + 1);
    expect(seen.has("curtainShove")).toBe(true);
    expect(curtain(world).moveBeat).toBeGreaterThan(0);
  });

  it("cannot be walked across the field by one thumb on one beat", () => {
    const world = install();
    const body = fabric(world) as Creature;
    const from = body.col;
    runTo(world, TPB * 2, carry(body.id, 2, TPB * 2, 4));
    expect(body.col).toBe(from + 1);
  });

  it("stands still under two thumbs going opposite ways", () => {
    const world = install();
    const body = fabric(world) as Creature;
    const from = body.col;
    runTo(world, TPB * 4, [...carry(body.id, 2, TPB * 4, 1), ...carry(body.id, 2, TPB * 4, -1, 2)]);
    expect(body.col).toBe(from);
  });

  it("goes off the wall as far as the columns it has to keep on, and no further", () => {
    const world = install();
    const body = fabric(world) as Creature;
    const reach = curtainReach(CFG);
    runTo(world, TPB * 40, carry(body.id, 2, TPB * 40, 40));
    expect(body.col).toBe(reach.max);
    expect(body.col + CURTAIN_COLS - CFG.cols).toBe(CURTAIN_COLS - CFG.curtainKeepCols);
    expect(reach.min).toBe(CFG.curtainKeepCols - CURTAIN_COLS);
  });

  it("uncovers the core once the sheet is past its column", () => {
    const world = install();
    const body = fabric(world) as Creature;
    const c = curtain(world);
    runTo(world, TPB * 40, carry(body.id, 2, TPB * 40, 40));
    expect(body.col).toBeGreaterThan(c.coreCol);
    expect(curtainCoreBare(world, c)).toBe(true);
  });

  it("takes two columns a shove once enough lobes are off", () => {
    const world = install();
    const c = curtain(world);
    expect(curtainStride(c, CFG)).toBe(1);
    for (let i = 0; i < CFG.curtainLightLobes; i++) c.lobes[i] = false;
    expect(curtainStride(c, CFG)).toBe(2);
    const body = fabric(world) as Creature;
    const from = body.col;
    runTo(world, TPB * 4, carry(body.id, 2, TPB * 4, 1));
    expect(body.col).toBe(from + 2);
  });
});

describe("a bolt into the hem", () => {
  it("takes a soft lobe off, and bounces off any other", () => {
    const world = install();
    const body = fabric(world) as Creature;
    const c = curtain(world);
    const soft = c.soft[0] as number;
    const hard = c.lobes.findIndex((up, i) => up && !c.soft.includes(i));
    curtainHemStruck(world, shot(world, body.col + hard), body);
    expect(curtainLobesLeft(c)).toBe(CURTAIN_COLS);
    expect(world.events.some((e) => e.type === "bounce")).toBe(true);
    curtainHemStruck(world, shot(world, body.col + soft), body);
    expect(c.lobes[soft]).toBe(false);
    expect(c.soft.includes(soft)).toBe(false);
    expect(curtainLobesLeft(c)).toBe(CURTAIN_COLS - 1);
    expect(world.events.some((e) => e.type === "curtainLobeOff")).toBe(true);
  });
});

describe("a shot past the core", () => {
  it("is nothing while the fabric covers it", () => {
    const world = install();
    const c = curtain(world);
    curtainStruck(world, shot(world, c.coreCol, c.coreColor));
    expect(c.coreHits).toBe(0);
    expect(torches(world).length).toBe(0);
  });

  it("in its own colour hurts it: the nearest lobe drops and the core drifts", () => {
    const world = install();
    const c = curtain(world);
    const body = fabric(world) as Creature;
    // Shove the sheet clear of the core, then shoot up the core's column.
    runTo(world, TPB * 40, carry(body.id, 2, TPB * 40, 40));
    expect(curtainCoreBare(world, c)).toBe(true);
    const col = c.coreCol;
    curtainStruck(world, shot(world, col, c.coreColor));
    expect(c.coreHits).toBe(1);
    expect(curtainLobesLeft(c)).toBe(CURTAIN_COLS - 1);
    expect(world.events.some((e) => e.type === "curtainCoreHit")).toBe(true);
    expect(c.coreCol).not.toBe(col);
    // It drifts under the fabric, wherever the fabric is over the field — so
    // it is covered again, and the sheet has to be shoved a second time.
    expect(c.coreCol).toBeGreaterThanOrEqual(body.col);
    expect(c.coreCol).toBeLessThan(CFG.cols);
    expect(curtainCoreBare(world, c)).toBe(false);
  });

  it("in the other colour is answered with a rock down the column", () => {
    const world = install();
    const c = curtain(world);
    const body = fabric(world) as Creature;
    runTo(world, TPB * 40, carry(body.id, 2, TPB * 40, 40));
    const other: Color = c.coreColor === "red" ? "cyan" : "red";
    // The bare core has been firing on its own count through the carry, so
    // what is counted is the one rock the wrong colour adds.
    const was = torches(world).length;
    curtainStruck(world, shot(world, c.coreCol, other));
    expect(c.coreHits).toBe(0);
    expect(torches(world).length).toBe(was + 1);
    expect((torches(world).at(-1) as Creature).col).toBe(c.coreCol);
    expect(world.events.some((e) => e.type === "curtainFire")).toBe(true);
  });

  it("fires on its own count while bare, and counts nothing while covered", () => {
    const world = install();
    const c = curtain(world);
    runTo(world, TPB * (CFG.curtainFireBeats + 2));
    expect(torches(world).length).toBe(0);
    const body = fabric(world) as Creature;
    const at = world.tick;
    runTo(world, at + TPB * 40, carry(body.id, at + 2, at + TPB * 40, 40));
    expect(curtainCoreBare(world, c)).toBe(true);
    expect(world.events.some((e) => e.type === "curtainFire") || torches(world).length > 0).toBe(
      true,
    );
  });
});

describe("the sheet tearing", () => {
  it("comes off the rail on the next shove once the hem is bare", () => {
    const world = install();
    const c = curtain(world);
    const body = fabric(world) as Creature;
    bareHem(c);
    const seen = runTo(world, TPB * 4, carry(body.id, 2, TPB * 4, 1));
    expect(fabric(world)).toBeUndefined();
    expect(c.phase).toBe("torn");
    expect(curtainCoreBare(world, c)).toBe(true);
    expect(seen.has("curtainTear")).toBe(true);
  });

  it("leaves the core naked and firing faster", () => {
    const world = install();
    const c = curtain(world);
    bareHem(c);
    runTo(world, TPB * 4, carry((fabric(world) as Creature).id, 2, TPB * 4, 1));
    const torn = c.phaseBeat;
    runTo(world, world.tick + TPB * (CFG.curtainNakedFireBeats + 1));
    expect(torches(world).length).toBeGreaterThanOrEqual(1);
    expect(c.phase).toBe("torn");
    expect(c.phaseBeat).toBe(torn);
  });
});

describe("a sheet nobody holds", () => {
  it("rolls back a column toward the core on its count, and not while held", () => {
    const world = install();
    const c = curtain(world);
    const body = fabric(world) as Creature;
    runTo(world, TPB * 40, carry(body.id, 2, TPB * 40, 40));
    const shoved = body.col;
    // Still held: the clock does not run.
    runTo(world, world.tick + TPB * (CFG.curtainRerollBeats + 2), [
      ...carry(body.id, world.tick, world.tick + TPB * (CFG.curtainRerollBeats + 2), 40),
    ]);
    expect(body.col).toBe(shoved);
    // Let go, and on the count it comes back a column toward the shadow.
    const seen = runTo(world, world.tick + TPB * (CFG.curtainRerollBeats + 1), [
      grip(world.tick, 1, 0),
    ]);
    expect(body.col).toBe(shoved - 1);
    expect(seen.has("curtainReroll")).toBe(true);
    expect(c.moveBeat).toBeGreaterThan(0);
  });
});

describe("the core going out", () => {
  it("holds the wave until the last hit, and lets it go a couple of beats after", () => {
    const world = install();
    const c = curtain(world);
    const body = fabric(world) as Creature;
    // Torn, so the core stays bare through every drift.
    bareHem(c);
    runTo(world, TPB * 4, carry(body.id, 2, TPB * 4, 1));
    expect(fabric(world)).toBeUndefined();
    expect(world.restBeat).toBe(0);
    for (let i = 0; i < CFG.curtainCoreHits; i++) {
      expect(curtainCoreBare(world, c)).toBe(true);
      curtainStruck(world, shot(world, c.coreCol, c.coreColor));
    }
    expect(c.coreHits).toBe(CFG.curtainCoreHits);
    expect(c.phase).toBe("out");
    expect(world.events.some((e) => e.type === "curtainOut")).toBe(true);
    expect(world.boss).not.toBeNull();
    runTo(world, world.tick + TPB * (CFG.curtainOutBeats + 1));
    expect(world.boss).toBeNull();
    expect(fabric(world)).toBeUndefined();
    // And with nothing holding it, the wave is cleared and the next is asked for.
    const seen = runTo(world, world.tick + TPB * (CFG.waveRestBeats + 2));
    expect(seen.has("needWave")).toBe(true);
  });
});

describe("two devices playing it", () => {
  it("fingerprints the same twice over the same inputs", () => {
    const run = (seed: number): number => {
      const world = install(seed);
      const body = fabric(world) as Creature;
      const cmds = [...carry(body.id, 2, TPB * 6, 3), ...carry(body.id, TPB * 6, TPB * 12, -2, 2)];
      runTo(world, TPB * 14, cmds);
      const c = curtain(world);
      if (curtainCoreBare(world, c)) curtainStruck(world, shot(world, c.coreCol, c.coreColor));
      runTo(world, TPB * 20);
      return hashWorld(world);
    };
    expect(run(3)).toBe(run(3));
    expect(run(7)).toBe(run(7));
    expect(run(3)).not.toBe(run(7));
  });
});
