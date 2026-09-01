import { authorsBodyColor, CREATURES } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";
import {
  type Color,
  type CreatureKind,
  type PodKind,
  SHELL_INTACT,
  type World,
} from "@neon-spore/sim";
import { type Brush, LIVING_BRUSH_KINDS } from "./brushes.js";
import { frameWorld } from "./pose-art.js";
import { aim, fresh, living, rock, run, runUntil, shoot, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * A brush button's own picture, drawn the way the field draws it — a settled
 * frame of the real renderer, cropped to one tile, exactly what `pose-art.ts`
 * already gives the states page. `silhouette.ts`'s plain contour told a wave
 * author which shape a brush was; it never told them what colour it fills, what
 * it glows, or what a shield or a plate looks like laid over it, so a brush
 * whose whole point is a colour or an overlay (the shell's armour, the clasp's
 * bubble, the lure's alarm) read the same as one with neither.
 *
 * A brush this module has no builder for — `THROB`, whose settled shape says
 * less than its outline already does, and `ERASE`, which paints nothing at
 * all — falls back to the plain contour; `palette.ts` is what does the
 * falling back.
 *
 * Built once per brush and cached: a settled frame costs dozens of simulation
 * ticks and a full render pass, which is fine once but not on every wave edit
 * — `palette.ts` re-renders the bar on every one.
 */

const COL = 3;
const TILE_WIDTH = 40;
const SKIP: ReadonlySet<Brush> = new Set(["erase", "throb"]);

const cache = new Map<Brush, HTMLCanvasElement | null>();

function creatureAt(world: World, kind?: CreatureKind): { col: number; row: number } {
  const c = (kind ? world.creatures.find((x) => x.kind === kind) : undefined) ?? world.creatures[0];
  return c ? { col: c.col, row: c.row } : { col: COL, row: 7 };
}

function podAt(world: World): { col: number; row: number } {
  const p = world.pods[0];
  return p ? { col: p.colMilli / 1000, row: p.rowMilli / 1000 } : { col: COL, row: 3 };
}

function tile(
  world: World,
  at: { col: number; row: number },
  span = 2.6,
  role: ViewRole = "test",
): HTMLCanvasElement {
  return frameWorld(world, role, "tile", TILE_WIDTH, at, span).canvas;
}

/** A settled rock, of either tier — the same pose `poses-field.ts` uses for
 * the states page. */
function rockArt(kind: "meteor" | "torch"): HTMLCanvasElement {
  const world = fresh([rock(COL, kind)]);
  run(world, TPB * 2);
  return tile(world, creatureAt(world, kind), kind === "torch" ? 3.4 : 2.6);
}

/** THE LURE, disguised as a bulb — the only body the owner asked to see —
 * drawn from player 2's own screen, since the ring and the label
 * (`lure-alarm.ts`) are the one thing that screen carries and the other does
 * not. Wider than a single tile so the ring and "LURE — DO NOT SHOOT" both
 * fit in frame. */
function lureArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "lure", color: "cyan", wears: "bulb" }]);
  run(world, TPB * 2);
  // Wide enough that "LURE — DO NOT SHOOT" clears the crop's own edge — the
  // label picks whichever side of the ring keeps it on the *phone's* width,
  // which is wider than a brush button's crop unless the crop leaves it room.
  return tile(world, creatureAt(world, "lure"), 6.5, "p2");
}

/** THE SHELL, a bulb inside it, one plate already off — a resting shell reads
 * as a plain armoured body with no reason to be feared twice as much as a
 * bare one; the reversal the creature exists for is the moment a column
 * stands open beside a column that still does not. */
function shellArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "shell", color: "cyan" }]);
  run(world, TPB);
  runUntil(
    world,
    "one shell piece off",
    [aim(world.tick, COL), shoot(world.tick + TPB, "red")],
    (w) => {
      const c = w.creatures.find((x) => x.kind === "shell");
      return !!c && c.shell !== SHELL_INTACT && c.shell !== 0;
    },
  );
  return tile(world, creatureAt(world, "shell"), 3.4);
}

/** THE CLASP, a bulb held inside its shield — `clasp.ts` draws the bubble the
 * moment a clasp is on the field, so nothing has to be struck to see it. */
function claspArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "clasp", color: "cyan" }]);
  run(world, TPB * 2);
  return tile(world, creatureAt(world, "clasp"), 3.2);
}

/** THE DART, hanging and taking aim — `dart-path.ts` already draws the arrow
 * and the dotted legs the instant a dart is on the field with nowhere yet to
 * run, so a settled frame carries them for free. */
function dartArt(): HTMLCanvasElement {
  const world = fresh([{ beat: 0, col: COL, kind: "dart", color: "red" }]);
  run(world, TPB * 2);
  return tile(world, creatureAt(world, "dart"), 3.4);
}

/** A pod, moored — `mend`, `purge` and `ward` are three marks on the one
 * shape (`pods.ts`), never the torch. */
function podArt(kind: PodKind | undefined): HTMLCanvasElement {
  const world = fresh([], [{ beat: 0, col: COL, row: 3, kind }]);
  run(world, TPB * 2);
  return tile(world, podAt(world), 2.2);
}

/** Every living kind this module has no special picture for — a settled body,
 * its own colour where it has one and a bulb where the wave has to say. */
function livingArt(kind: CreatureKind): HTMLCanvasElement {
  const def = CREATURES[kind];
  const world = fresh([
    def.color
      ? living(def.color, COL)
      : { beat: 0, col: COL, kind, color: authorsBodyColor(kind) ? ("cyan" as Color) : null },
  ]);
  run(world, TPB * 3);
  return tile(world, creatureAt(world, kind), 2.6);
}

const BUILDERS: Partial<Record<Brush, () => HTMLCanvasElement>> = {
  rock: () => rockArt("meteor"),
  torch: () => rockArt("torch"),
  lure: lureArt,
  shell: shellArt,
  clasp: claspArt,
  dart: dartArt,
  mend: () => podArt(undefined),
  purge: () => podArt("purge"),
  ward: () => podArt("ward"),
};

/** A brush's own picture, or null when this module has none — either it
 * paints nothing (`erase`) or it was asked to be skipped (`throb`). */
export function brushArt(brush: Brush): HTMLCanvasElement | null {
  if (SKIP.has(brush)) return null;
  if (!cache.has(brush)) {
    let canvas: HTMLCanvasElement | null = null;
    try {
      const special = BUILDERS[brush];
      canvas = special
        ? special()
        : LIVING_BRUSH_KINDS.includes(brush as CreatureKind)
          ? livingArt(brush as CreatureKind)
          : null;
    } catch {
      // A pose that cannot be built (a future kind this module has not been
      // taught yet) falls back to the plain contour rather than breaking the
      // palette that shows it.
      canvas = null;
    }
    cache.set(brush, canvas);
  }
  return cache.get(brush) ?? null;
}
