import { type SimConfig, type TasterState, tasterPhase, type World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { BLADE_TILES, type BladeLook, drawBlade } from "./taster-blade.js";
import { crestPath, drawNotch, drawSeam } from "./taster-crest.js";
import { paintGum } from "./taster-flesh.js";
import { drawTasterNext, drawTasterTally } from "./taster-read.js";

/**
 * THE TASTER, drawn: a low crest hugging the top of the field with a fan of
 * blades standing out of it, one per column, each edged in the colour the pair
 * has been spending — and each broken only by the colour it is *not*
 * (`sim/taster.ts`, `docs/spec/bosses.md` §11.25).
 *
 * **Everything here is read off the world every frame.** Which blades stand,
 * what each edge is, how thick it is, which columns are soft crest, how far
 * the crest is cut and whether the beam has landed are all `TasterState`'s;
 * the movement is `tasterPhase`. The three things that outlive a frame — a
 * blade coming off, the shiver when the fan re-edges, the crest opening for
 * good — are `taster-fx.ts`'s.
 *
 * **The whole boss is above row 0**, THE GORGE's and THE DIASTOLE's
 * arrangement: nothing of it is among the creatures, and a shot answers it by
 * leaving the field up its own column into whatever stands over it. The field
 * beneath is the ordinary field, and it is where the argument is made — every
 * shot the pair takes at a body down there is a colour in the ledger this boss
 * will read.
 *
 * **Two seats, two halves of one sentence**, and they are `taster-read.ts`'s:
 * the ledger on the navigator's screen, the column the crest opens next on the
 * pilot's.
 */

/** How far above row 0 the crest's underside hangs, in tiles. */
const HANG = 0.42;
/** Blades of the interlock lean this far across, in tiles. */
const LOCK_LEAN = 0.55;
/** And this far the other way once the beam has opened them. */
const OUT_LEAN = 1.1;

/** Where the fan stands this frame: the line every blade's base sits on. */
export function tasterCrestY(l: Layout): number {
  return tileCY(l, 0) - l.tile * HANG;
}

/** The crest's own breath, 0 at the beat and back to it — the gorge's curve. */
function breathOf(beatPhase: number): number {
  return 0.5 - 0.5 * Math.cos(beatPhase * Math.PI * 2);
}

/**
 * How grown a blade is, 0..1, from the beat it came out of the crest.
 *
 * `beatPhase` is in it, so a blade rises smoothly rather than in four steps:
 * the four beats of growth are the design's warning and the pair watches them
 * pass.
 */
function grownOf(growBeat: number, beat: number, beatPhase: number, cfg: SimConfig): number {
  if (growBeat < 0) return 0;
  const since = beat - growBeat + beatPhase;
  return Math.max(0, Math.min(1, since / Math.max(1, cfg.tasterGrowBeats)));
}

/**
 * What every blade of the fan is wearing, in the order they stand.
 *
 * The lean is the whole of how the last two movements are said: **closed** is
 * the surviving blades leaning inward across each other over the body, each
 * one carrying the other colour on its back edge as well, and **out** is that
 * lean thrown the other way and further as the fan unlocks and fades. A shorn
 * blade is an empty look rather than a gap in the array, so the column a blade
 * used to stand in still lines up with its notch.
 */
function looks(world: World, t: TasterState, tile: number, beatPhase: number): BladeLook[] {
  const { cfg, beat } = world;
  const phase = tasterPhase(t, cfg);
  const out =
    phase === "out" ? (beat - t.outBeat + beatPhase) / Math.max(1, cfg.tasterOutBeats) : 0;
  const mid = (t.blades.length - 1) / 2;
  const fan: BladeLook[] = [];
  for (let i = 0; i < t.blades.length; i++) {
    const k = t.blades[i];
    if (k === undefined || k.shorn) {
      fan.push({ color: null, grown: 0, layers: 0, lean: 0, alpha: 0 });
      continue;
    }
    const side = i === mid ? 0 : i < mid ? 1 : -1;
    const lean =
      phase === "out"
        ? -side * OUT_LEAN * Math.min(1, out)
        : phase === "closed" && k.setBeat >= 0
          ? side * LOCK_LEAN
          : 0;
    fan.push({
      color: k.edge,
      grown: k.setBeat >= 0 ? 1 : grownOf(k.growBeat, beat, beatPhase, cfg),
      layers: Math.max(1, k.layers),
      lean: lean * tile,
      alpha: phase === "out" ? Math.max(0, 1 - out) : 1,
      ...(phase === "closed" && k.edge !== null ? { both: k.edge === "red" ? "cyan" : "red" } : {}),
    });
  }
  return fan;
}

/**
 * The ridge this frame: its top, its breath and how thick it is drawn — the
 * three numbers both marks on it hang off (`taster-read.ts`), asked once
 * here so a caption's ring (`caption-anchor-boss.ts`) reads the same ridge
 * the drawing does.
 */
export function tasterRidge(
  l: Layout,
  t: TasterState,
  cfg: SimConfig,
  beatPhase: number,
): { y: number; breath: number; thick: number } {
  const breath = tasterPhase(t, cfg) === "out" ? 0 : breathOf(beatPhase);
  return { y: tasterCrestY(l), breath, thick: l.tile * (0.34 + 0.04 * breath) };
}

export function drawTaster(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  t: TasterState,
  beatPhase: number,
  time: number,
  /** The blow a blade struck off deals the crest, 0..1 (`boss-hurt.ts`). */
  hurt = 0,
): void {
  if (l.tile <= 0) return;
  const { cfg } = world;
  const { y, breath, thick } = tasterRidge(l, t, cfg, beatPhase);
  const left = tileCX(l, t.col) - l.tile * 0.5;
  const right = tileCX(l, t.col + t.blades.length - 1) + l.tile * 0.5;

  // The ridge first, so every blade stands out of it rather than on top of it.
  const crest = crestPath(left, right, y, thick, l.tile, time);
  const roots: number[] = [];
  for (let i = 0; i < t.blades.length; i++) {
    if (t.blades[i]?.shorn === false) roots.push(tileCX(l, t.col + i));
  }
  paintGum(ctx, crest, { left, right, y, thick, tile: l.tile }, roots, breath);
  drawHurt(ctx, crest, hurt);

  // The gaps, and how wet they are: one notch per blade struck off, brighter
  // the nearer the pair is to cutting the crest through. `t.crest` counts the
  // shots into all of them, so the sheen is the fight's own progress rather
  // than any one gap's.
  const wet = Math.min(1, t.crest / Math.max(1, cfg.tasterCrestCuts));
  for (let i = 0; i < t.blades.length; i++) {
    if (t.blades[i]?.shorn !== true) continue;
    drawNotch(ctx, tileCX(l, t.col + i), y, l.tile, thick, wet, breath);
  }
  // Cut through, for good: a lit seam the width of the crest, and the fan can
  // never taste again (`tasterLift`).
  if (t.liftBeat >= 0) drawSeam(ctx, left, right, y, l.tile, time);

  const fan = looks(world, t, l.tile, beatPhase);
  for (let i = 0; i < fan.length; i++) {
    const look = fan[i];
    if (look === undefined) continue;
    drawBlade(ctx, tileCX(l, t.col + i), y, l.tile, look, time);
  }

  drawTasterNext(ctx, l, t, y, breath);
  drawTasterTally(ctx, l, world, t, y, thick);
}

/** The height a full blade reaches over row 0, in tiles: the fan's reach. */
export const TASTER_FAN_TILES = BLADE_TILES + HANG;

/**
 * The whole fan as one box — every blade's column, from the crest's top to a
 * full blade's tip — for a caption about the blades rather than about one
 * of the two marks on the ridge (`caption-anchor-boss.ts`).
 */
export function tasterFanBox(
  l: Layout,
  t: TasterState,
): { x: number; y: number; rx: number; ry: number } {
  const y = tasterCrestY(l);
  const left = tileCX(l, t.col) - l.tile * 0.5;
  const right = tileCX(l, t.col + t.blades.length - 1) + l.tile * 0.5;
  const ry = (l.tile * BLADE_TILES) / 2;
  return { x: (left + right) / 2, y: y - ry, rx: (right - left) / 2, ry };
}
