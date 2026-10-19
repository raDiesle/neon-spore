import {
  BROOD_SWAY,
  type BroodState,
  type BroodStep,
  broodCentre,
  broodClampCol,
} from "./brood.js";
import { livingKindForColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import { occupiesCol } from "./span.js";
import { spawnOne } from "./spawn.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **What THE BROOD does besides its buds**: it lays bodies out of its hide,
 * and it sways a column at a time (`brood.ts`). Both are a step's, authored in
 * content (`layEvery`, `swayEvery`), each on a clock the pair can feel.
 *
 * **A body is laid where nothing else is**: over a column under the sac with no
 * bud on its rim, no body already growing toward it, and no body standing just
 * under the belly — so a laid body never stands on a bud's line or on another.
 * Which of those, and which colour, is the seeded rng's.
 */

/**
 * One grown beat's sway: a shudder said, a lurch taken — on the step's own
 * count, so no bud lurches on the beat it began.
 */
export function broodSway(world: World, s: BroodState, step: BroodStep): void {
  const since = world.beat - s.phaseBeat;
  const every = step.swayEvery ?? 0;
  if (since <= 0 || every <= 0) return;
  const k = since % every;
  if (k === every - world.cfg.broodShudderBeats) {
    world.events.push({ type: "broodShudder", col: broodCentre(world.cfg, s) });
  }
  if (k === 0) lurch(world, s);
}

/**
 * One beat's laying, growing or resting: a body begun every `layEvery` beats
 * of the step growing or coming next. **On the field's own beat, not the
 * step's**: a pair that pops a step's buds quickly is still laid at, so the
 * bodies come at the rate the step names however fast its buds go.
 */
export function broodLay(world: World, s: BroodState): void {
  const step = s.steps[s.cursor];
  const every = step?.layEvery ?? 0;
  if (every > 0 && world.beat % every === 0) conceive(world, s);
}

/** The sac lurches to the next place in `BROOD_SWAY`, and all it carries with it. */
function lurch(world: World, s: BroodState): void {
  const to = BROOD_SWAY[s.lurches % BROOD_SWAY.length] ?? 0;
  const by = to - s.sway;
  s.lurches += 1;
  if (by === 0) return;
  s.sway = to;
  for (const b of s.buds) b.col = broodClampCol(world.cfg, b.col + by);
  for (const e of s.eggs) e.col = broodClampCol(world.cfg, e.col + by);
  world.events.push({ type: "broodLurch", col: broodCentre(world.cfg, s), by });
}

/** A body begins inside the sac, over a free column, to be laid `broodLayLeadBeats` on. */
function conceive(world: World, s: BroodState): void {
  const cfg = world.cfg;
  const centre = broodCentre(cfg, s);
  const free: number[] = [];
  for (let col = centre - cfg.broodSpan; col <= centre + cfg.broodSpan; col++) {
    if (col < 0 || col >= cfg.cols) continue;
    if (s.buds.some((b) => b.col === col && !b.popped)) continue;
    if (s.eggs.some((e) => e.col === col)) continue;
    if (world.creatures.some((c) => occupiesCol(c, col) && c.row <= cfg.broodBudRow + 1)) continue;
    free.push(col);
  }
  if (free.length === 0) return;
  const col = free[nextInt(world.rng, free.length)] ?? centre;
  const color: Color = nextInt(world.rng, 2) === 0 ? "red" : "cyan";
  s.eggs.push({ col, color, layBeat: world.beat + cfg.broodLayLeadBeats });
  world.events.push({ type: "broodEgg", col, color });
}

/** Every body due this beat is pushed out of the belly, and falls from the bud row. */
export function broodLayDue(world: World, s: BroodState): void {
  if (s.eggs.length === 0) return;
  const due = s.eggs.filter((e) => e.layBeat <= world.beat);
  if (due.length === 0) return;
  s.eggs = s.eggs.filter((e) => e.layBeat > world.beat);
  for (const e of due) {
    broodSpawnBody(world, e.col, e.color);
    s.laid += 1;
    world.events.push({ type: "broodLay", col: e.col, color: e.color });
  }
}

/**
 * A slick or a bulb, from the bud row rather than the top of the field — or
 * from `row`, for THE MOTH shaking one off its wing (`moth-step.ts`).
 */
export function broodSpawnBody(
  world: World,
  col: number,
  color: Color,
  row = world.cfg.broodBudRow,
): void {
  const before = world.creatures.length;
  spawnOne(world, { beat: world.beat, col, kind: livingKindForColor(color), color });
  for (let i = before; i < world.creatures.length; i++) {
    const c = world.creatures[i];
    if (c === undefined) continue;
    c.row = row;
    c.fromRow = row;
  }
}
