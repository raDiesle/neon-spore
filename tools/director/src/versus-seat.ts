import {
  Canvas2DRenderer,
  computeLayout,
  computeStage,
  type ViewRole,
  type ViewState,
} from "@neon-spore/render";
import { type SimConfig, ticksPerBeat } from "@neon-spore/sim";
import { seedRandom } from "../../versus/seed.js";
import { apply, restore, type Variant } from "../../versus/variant.js";
import type { Pose } from "./pose-kit.js";
import { advance } from "./versus-pair.js";

/**
 * Whether a candidate needs the other seat drawn beside it — decided once,
 * honestly, rather than guessed.
 *
 * The seat dropdown is gone; this is what replaces the looking it used to
 * stand in for, and it is not a plain "does p1's whole screen match p2's".
 * It never does: `showsCannon`/`showsShield` (`layout.ts`) mean the control
 * band always shows one player a lobe to aim and the other a shield to arm,
 * never both — that difference exists on every wave the game has ever drawn,
 * has nothing to do with any candidate, and comparing whole frames would
 * report every single slot as seat-dependent, which is the same failure the
 * queue entry names for a naive compare taken mid-animation, just from a
 * different cause. What the vote is actually about is whether **the patch's
 * own effect** looks the same from both seats — so this hashes the
 * *difference* the patch makes (current minus candidate, pixel for pixel) at
 * `p1` and again at `p2`, with the same seeded random stream both times, and
 * compares those two difference-pictures rather than the two raw frames. A
 * candidate confined to a fixed, opaque record — `ship:hull-skin`'s four body
 * stops — draws that difference identically from either seat: the field
 * itself is not seat-gated, only the band around it is, and an opaque patch
 * replaces pixels outright, so the seat-varying band underneath never enters
 * the subtraction.
 *
 * **The field and the band are judged differently, and that is the one line
 * of the argument above this lane overturns.** `cannon:shot`'s `streak` grows
 * a translucent tail long enough to blend over the strip where the band
 * begins, and alpha compositing is not linear in what sits behind it: the
 * *magnitude* of the difference a translucent layer adds depends on the
 * background it lands on, so an exact pixel-value hash of that magnitude
 * prints a different number over `p1`'s band content than over `p2`'s even
 * though the patch itself never reads `role` and draws the identical tail at
 * the identical column both times. Read narrowly that used to mean "a real
 * second screen". By the owner's rule it is not: it is the same tail on both
 * sides, and the only thing that differs is a strip of panel they were never
 * looking at (`docs/queue.md`, "A CANDIDATE THAT CHANGES THE SAME THING FOR
 * BOTH SEATS GETS ONE SCREEN, NOT TWO").
 *
 * So below `bandTop` — the play area's own boundary, computed the same way
 * the renderer computes it, never re-derived by hand — the two
 * difference-pictures are compared by **where they changed**, not by how
 * much. `touchFootprintHash` reduces every pixel to one bit: did this patch
 * move this pixel at all, past a threshold wide enough to swallow the
 * rounding an alpha blend leaves on two different backgrounds, but nowhere
 * near wide enough to swallow an actual stroke or lobe. A translucent tail on
 * the same column and rows regardless of seat lights the same bits on both
 * sides — same footprint, no seat difference reported — even though the exact
 * shade differs. A patch that genuinely draws something only one seat ever
 * shows — a lobe shape on the cannon strip `p2` never draws at all — lights a
 * footprint that exists on one seat and not the other, still caught, because
 * the *set* of touched pixels is what differs, not their brightness. Above
 * `bandTop`, on the field, the exact value hash from before is unchanged: a
 * field candidate is judged exactly as strictly as it always was.
 *
 * Samples several ticks across a full loop of the pose — long enough to
 * cross a rebuild and catch a transient event, not only the instant the pose
 * is named after — so a transient that only reads on one seat is not missed
 * because the sample landed elsewhere. Runs once, synchronously, when a
 * candidate's row is built, not on the animated loop, because the answer
 * does not change while the page is open.
 */
const PROBE_PHONE = { width: 380, height: 820 } as const;
/** How many ticks apart each sample is, and how many samples are taken —
 * `SAMPLES * SAMPLE_EVERY` ticks is comfortably past one `waveRestBeats`
 * rebuild at the default tempo, so a transient tied to the pose's opening
 * moment is not the only thing this ever looks at. */
const SAMPLE_EVERY = 6;
const SAMPLES = 24;

/**
 * How far a channel has to move, on a 0-255 scale, before a band pixel counts
 * as "touched" by the patch. `cannon:shot`'s `streak` blends at a constant
 * `tailAlpha: 0.8` — nowhere near this threshold's neighbourhood — so this
 * exists for the few pixels right at a translucent shape's own edge, where an
 * anti-aliased fringe can round to a ±1 or ±2 difference on one background and
 * not on the other. Real drawn content — a stroke, a fill, a lobe — moves a
 * channel by tens of levels at least, so this stays far below anything a
 * genuine panel redraw would produce.
 */
const BAND_TOUCH_THRESHOLD = 10;

/**
 * Where the play area ends and the control band begins, in the probe
 * canvas's own device pixels — computed the same two calls the renderer
 * itself makes (`computeStage` then `computeLayout`) rather than re-derived,
 * per `purity.test.ts`'s table of things that must be called and not copied.
 * `computeStage`'s `top` is always `0`, so the stage's own vertical offset
 * never enters this, and `bandSoloPct` (not `bandPct`) governs both `p1` and
 * `p2` alike — a solo seat's band, whichever half it is — so this returns the
 * same row for both, which is exactly why the two seats' stages are
 * pixel-identical in extent and only their content differs.
 */
export function bandTopPx(cfg: SimConfig, role: ViewRole): number {
  const viewport = { ...PROBE_PHONE, dpr: 1 };
  const stage = computeStage(viewport, cfg, role);
  const layout = computeLayout({ width: stage.width, height: stage.height, dpr: 1 }, cfg, role);
  return Math.round(stage.top + layout.bandTop);
}

/** FNV-1a over the absolute per-channel difference of two same-sized pixel
 * buffers, restricted to rows `[y0, y1)` — the pixel signature of exactly how
 * much changed between them in that band of rows, not of either picture on
 * its own. */
export function absDiffHash(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  width: number,
  y0: number,
  y1: number,
): string {
  const rowBytes = width * 4;
  let h = 0x811c9dc5;
  for (let y = Math.max(0, y0); y < y1; y++) {
    const base = y * rowBytes;
    for (let i = base; i < base + rowBytes; i++) {
      h ^= Math.abs((a[i] ?? 0) - (b[i] ?? 0));
      h = Math.imul(h, 0x01000193);
    }
  }
  return (h >>> 0).toString(16);
}

/** FNV-1a over a one-bit-per-pixel footprint of *which* pixels changed by
 * more than `threshold` on any channel, restricted to rows `[y0, y1)` —
 * where the patch touched something, not how far it moved a value. This is
 * what makes the band comparison blind to a translucent layer's dependence on
 * the background underneath it while staying alert to content that only one
 * seat ever draws at all. */
export function touchFootprintHash(
  a: Uint8ClampedArray,
  b: Uint8ClampedArray,
  width: number,
  y0: number,
  y1: number,
  threshold: number,
): string {
  const rowBytes = width * 4;
  let h = 0x811c9dc5;
  for (let y = Math.max(0, y0); y < y1; y++) {
    const base = y * rowBytes;
    for (let x = 0; x < width; x++) {
      const p = base + x * 4;
      let touched = 0;
      for (let c = 0; c < 4; c++) {
        if (Math.abs((a[p + c] ?? 0) - (b[p + c] ?? 0)) > threshold) {
          touched = 1;
          break;
        }
      }
      h ^= touched;
      h = Math.imul(h, 0x01000193);
    }
  }
  return (h >>> 0).toString(16);
}

/** One sample's signature: an exact value hash of the field rows, and a
 * touched-footprint hash of the band rows — the two different tests this
 * lane's brief asks for, joined so the existing sequence-equality check below
 * needs no change. */
function sampleSignature(
  current: HTMLCanvasElement,
  candidate: HTMLCanvasElement,
  bandTop: number,
): string {
  const ca = current.getContext("2d");
  const cb = candidate.getContext("2d");
  if (!ca || !cb) return "";
  const { width, height } = current;
  const da = ca.getImageData(0, 0, width, height).data;
  const db = cb.getImageData(0, 0, width, height).data;
  const field = absDiffHash(da, db, width, 0, bandTop);
  const band = touchFootprintHash(da, db, width, bandTop, height, BAND_TOUCH_THRESHOLD);
  return `${field}:${band}`;
}

/** The patch's own difference from the shipped look, sampled across one loop
 * of the pose, at one seat. */
function diffSequence(pose: Pose, role: ViewRole, variant: Variant): string[] {
  const current = document.createElement("canvas");
  const candidate = document.createElement("canvas");
  const renderCurrent = new Canvas2DRenderer(current);
  const renderCandidate = new Canvas2DRenderer(candidate);
  renderCurrent.resize({ ...PROBE_PHONE, dpr: 1 });
  renderCandidate.resize({ ...PROBE_PHONE, dpr: 1 });
  let world = pose.build();
  const bandTop = bandTopPx(world.cfg, role);
  let events = [...world.events];
  const view: ViewState = { world, beatPhase: 0, role, time: 0, dt: 1 / 60, events, running: true };
  const hashes: string[] = [];
  try {
    for (let tick = 0; tick < SAMPLES * SAMPLE_EVERY; tick++) {
      const next = advance(world, () => pose.build());
      world = next.world;
      events = next.events;
      if (tick % SAMPLE_EVERY !== 0) continue;
      const tpb = ticksPerBeat(world.cfg);
      view.world = world;
      view.beatPhase = (world.tick % tpb) / tpb;
      view.time = tick / 60;
      view.events = events;

      const unseedA = seedRandom(tick + 1);
      try {
        renderCurrent.draw(view);
      } finally {
        unseedA();
      }
      const unseedB = seedRandom(tick + 1);
      const applied = apply(variant);
      try {
        renderCandidate.draw(view);
      } finally {
        restore(applied);
        unseedB();
      }
      hashes.push(sampleSignature(current, candidate, bandTop));
    }
  } finally {
    renderCurrent.dispose();
    renderCandidate.dispose();
  }
  return hashes;
}

function sameSequence(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((h, i) => h === b[i]);
}

/** `true` when the patch's own effect is not the same picture at `p1` and at
 * `p2`, anywhere across the sampled loop — on the field exactly, on the band
 * only where the patch touches different pixels rather than the same pixels
 * more or less brightly. */
export function seatsDiffer(pose: Pose, variant: Variant): boolean {
  return !sameSequence(diffSequence(pose, "p1", variant), diffSequence(pose, "p2", variant));
}
