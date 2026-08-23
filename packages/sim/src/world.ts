import { type SimConfig, ticksPerBeat } from "./config.js";
import { createRng, type Rng } from "./rng.js";
import type { Bullet, Color, Creature, GuardStats, Scar, TimedCommand } from "./types.js";

/**
 * Everything the simulation knows. Integers only — see docs/architecture.md.
 * Sub-tile values are stored in thousandths so two devices can never disagree
 * about a rounding step. Interpolation for the eye happens in render/.
 */
export interface World {
  cfg: SimConfig;
  rng: Rng;
  tick: number;
  beat: number;
  nextId: number;

  cannonCol: number;
  shieldCol: number;
  /** Tick of the most recent shield trigger by player 1. */
  guardTick: number;
  lastFireTick: number;

  creatures: Creature[];
  bullets: Bullet[];
  scars: Scar[];
  /** Hull integrity in thousandths, 0..100000. */
  hullMilli: number;
  guard: GuardStats;

  wave: number;
  waveBeat: number;
  spawned: number;
  queue: SpawnEntry[];

  /** Cleared every tick. render/ and audio read this; nothing writes back. */
  events: SimEvent[];
}

export interface SpawnEntry {
  beat: number;
  col: number;
  kind: Creature["kind"];
  color: Color | null;
}

export type SimEvent =
  | { type: "beat"; beat: number }
  | { type: "fire"; col: number; color: Color }
  | { type: "destroy"; col: number; row: number; color: Color }
  | { type: "reject"; col: number; row: number }
  | { type: "deflect"; col: number }
  | { type: "breach"; col: number; damage: number };

const MILLI = 1000;

export function createWorld(cfg: SimConfig, seed: number): World {
  ticksPerBeat(cfg); // fail loudly at construction, not mid-game
  const mid = Math.floor(cfg.cols / 2);
  return {
    cfg,
    rng: createRng(seed),
    tick: 0,
    beat: 0,
    nextId: 1,
    cannonCol: mid,
    shieldCol: mid,
    guardTick: -1_000_000,
    lastFireTick: -1_000_000,
    creatures: [],
    bullets: [],
    scars: [],
    hullMilli: 100 * MILLI,
    guard: { tries: 0, deflected: 0, mistimed: 0 },
    wave: 0,
    waveBeat: 0,
    spawned: 0,
    queue: [],
    events: [],
  };
}

/** Advance exactly one tick. The only way the world ever changes. */
export function step(world: World, commands: readonly TimedCommand[]): void {
  world.events.length = 0;
  for (const c of commands) applyCommand(world, c);

  world.tick += 1;
  const tpb = ticksPerBeat(world.cfg);
  if (world.tick % tpb === 0) onBeat(world);

  advanceBullets(world);
  regenerateHull(world);
}

function applyCommand(world: World, timed: TimedCommand): void {
  const c = timed.command;
  switch (c.kind) {
    case "cannonCol":
      world.cannonCol = clampCol(world, c.col);
      break;
    case "shieldCol":
      world.shieldCol = clampCol(world, c.col);
      break;
    case "guard":
      world.guardTick = world.tick;
      break;
    case "fire":
      fire(world, c.color);
      break;
  }
}

function fire(world: World, color: Color): void {
  const tpb = ticksPerBeat(world.cfg);
  const cooldown = Math.round(world.cfg.fireEveryBeats * tpb);
  if (world.tick - world.lastFireTick < cooldown) return;
  world.lastFireTick = world.tick;
  world.bullets.push({
    id: world.nextId++,
    col: world.cannonCol,
    row: world.cfg.rows * MILLI,
    color,
  });
  world.events.push({ type: "fire", col: world.cannonCol, color });
}

function onBeat(world: World): void {
  world.beat += 1;
  world.waveBeat += 1;
  world.events.push({ type: "beat", beat: world.beat });

  // Creatures glide exactly one tile per beat. No lane changes for the first
  // two kinds — the lane must stay readable (docs/spec/raster-model.md).
  for (const c of world.creatures) {
    c.fromRow = c.row;
    c.row += 1;
  }

  while (world.spawned < world.queue.length) {
    const q = world.queue[world.spawned]!;
    if (q.beat > world.waveBeat - 1) break;
    world.creatures.push({
      id: world.nextId++,
      kind: q.kind,
      col: q.col,
      row: 0,
      fromRow: -1,
      color: q.color,
    });
    world.spawned += 1;
  }

  resolveHull(world);
}

function resolveHull(world: World): void {
  const survivors: Creature[] = [];
  for (const c of world.creatures) {
    if (c.row < world.cfg.rows) {
      survivors.push(c);
      continue;
    }
    if (c.kind === "meteor") {
      const inColumn = world.shieldCol === c.col;
      const windowTicks = Math.round((world.cfg.guardWindowMs / 1000) * world.cfg.tickHz);
      const inTime = world.tick - world.guardTick <= windowTicks && world.guardTick <= world.tick;
      if (inColumn) world.guard.tries += 1;
      if (inColumn && inTime) {
        world.guard.deflected += 1;
        world.events.push({ type: "deflect", col: c.col });
        continue;
      }
      if (inColumn) world.guard.mistimed += 1;
      breach(world, c.col, world.cfg.damageMeteor);
    } else {
      breach(world, c.col, world.cfg.damageCreature);
    }
  }
  world.creatures = survivors;
}

function breach(world: World, col: number, damage: number): void {
  world.hullMilli = Math.max(0, world.hullMilli - damage * MILLI);
  world.scars.push({ col, beat: world.beat });
  world.events.push({ type: "breach", col, damage });
}

function advanceBullets(world: World): void {
  const tpb = ticksPerBeat(world.cfg);
  const stepMilli = Math.round((world.cfg.bulletTilesPerBeat * MILLI) / tpb);
  const alive: Bullet[] = [];

  for (const b of world.bullets) {
    b.row -= stepMilli;
    if (b.row < -MILLI) continue;

    const hit = world.creatures.find(
      (c) => c.col === b.col && Math.abs(c.row * MILLI - b.row) <= MILLI / 2,
    );
    if (!hit) {
      alive.push(b);
      continue;
    }
    if (hit.kind === "meteor" || hit.color !== b.color) {
      // A rock cannot be broken; a wrong colour bounces off. Both must look
      // different on screen — that is a render/ concern, not a rule.
      world.events.push({ type: "reject", col: hit.col, row: hit.row });
      continue;
    }
    world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: hit.color });
    world.creatures = world.creatures.filter((c) => c.id !== hit.id);
  }
  world.bullets = alive;
}

function regenerateHull(world: World): void {
  if (world.hullMilli <= 0) return;
  const perTick = Math.round((world.cfg.hullRegenPerSecond * MILLI) / world.cfg.tickHz);
  world.hullMilli = Math.min(100 * MILLI, world.hullMilli + perTick);
}

function clampCol(world: World, col: number): number {
  return Math.max(0, Math.min(world.cfg.cols - 1, Math.round(col)));
}

/** Hull integrity as a plain 0..100 number, for display only. */
export function hullPercent(world: World): number {
  return world.hullMilli / MILLI;
}
