import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * CILIA — a hundred short strands at the rim, and a sparser handful over the
 * interior, all swaying and all leaning together.
 *
 * `Fühler`, the owner's own word for it: the edge is not a line, it is a
 * fringe. Everything else in this file exists to get two things right that a
 * grid of identical strokes gets wrong.
 *
 * **Anchoring.** The contour wobbles every frame — three unrelated sine layers,
 * per `shapes-motion.ts` — so a strand's *base* cannot be a coordinate fixed at
 * build time; by the second frame it would be floating off the body or buried
 * inside it. It has to be read off the *live* outline. There is no API on
 * `SkinContext` for that (rule (b)/(d) keep a skin from touching the subject
 * directly), but there does not need to be one: `ctx.contourPath()` hands back
 * a real `<path>` that `shape-figure.ts` re-writes with the current `d` before
 * every `onFrame`. So one extra, invisible contour path is kept purely as a
 * ruler.
 *
 * That ruler used to be asked for a hundred independent points a frame — each
 * strand its own `getPointAtLength`, `<path>`'s most expensive method, called
 * on a `d` just rewritten that same frame, so nothing was cached between the
 * hundred calls either — six thousand calls a frame over sixty cards, CILIA's
 * own cost and not the page's. `SkinContext` has no lower-level access to the
 * contour's points yet — `claude/burn-body-context-s14` closes that gap; once
 * it lands, delete the sample path below and the table it feeds, in favour of
 * whatever that lane hands a skin directly. Until then the ruler is sampled
 * **once** a frame into a small table (`TABLE_SIZE` points, arc-length even),
 * and every strand interpolates out of it with two multiplies — finer than a
 * hundred strands can show as a kink. Hashing every catalogue entry's DOM at
 * several poses proved this draws the same fringe the DOM ruler did.
 *
 * **The ripple, not the unison.** Each rim strand's phase comes from `u`, its
 * own fraction of the way around the perimeter, so the sway is a wave that
 * travels around the rim once every few seconds rather than a hundred strands
 * flexing on the same clock — grass is unison, something alive is offset.
 *
 * **The lean.** `f.pose` is where the own-motion has put this body, in tiles,
 * the same pose `shape-figure.ts` writes onto the group. Differencing it frame
 * to frame gives a velocity; the fringe leans opposite that velocity, smoothed
 * so it does not chatter, and reverses the instant the velocity does — drag,
 * not wind. `ctx.tile` puts it in the contour units everything else here is
 * measured in. This used to read `ctx.body.transform.baseVal.getItem(0).matrix`
 * instead and difference that, which assumed a translate was the first
 * transform item — true, promised nowhere, and silent if it ever stopped.
 */

const RIM_COUNT = 100;
/** Points sampled from the DOM ruler once a frame, see the header. */
const TABLE_SIZE = 64;
const INTERIOR_COUNT = 16;
const RIM_LEN = 0.16;
const RIM_LEN_JITTER = 0.5;
const INTERIOR_LEN = 0.1;
const INTERIOR_R_MIN = 0.15;
const INTERIOR_R_MAX = 0.68;
/** How many ripple wavelengths fit around the whole rim at once. */
const RIPPLE_TURNS = 3.1;
const SWAY_PERIOD = 2.6;
const SWAY_AMOUNT = 0.34;
const CURVE_AMOUNT = 0.16;
/** Smoothing on the lean estimate — a fraction of the gap closed per frame,
 * so a sign flip in the velocity takes a few frames to read, not one jolt. */
const LEAN_SMOOTH = 0.12;
const LEAN_BEND = 0.55;
/** Below this, in contour units a second, travel is noise, not a direction. */
const MOVING = 1e-4;

interface Strand {
  readonly el: SVGPathElement;
  readonly phase: number;
  readonly len: number;
  readonly curve: number;
}

interface RimStrand extends Strand {
  readonly u: number;
}

interface InteriorStrand extends Strand {
  readonly angle: number;
  readonly radius: number;
}

function newStrandPath(ctx: SkinContext, opacity: number, width: number): SVGPathElement {
  const el = document.createElementNS(SVG, "path");
  el.setAttribute("fill", "none");
  el.setAttribute("stroke", ctx.colour);
  el.setAttribute("stroke-linecap", "round");
  el.setAttribute("stroke-opacity", opacity.toFixed(3));
  el.setAttribute("stroke-width", width.toFixed(3));
  return el;
}

/** Base point and tip, curved toward its own sway — what keeps a hundred of
 * these from reading as a hundred identical spokes. */
function draw(
  s: Strand,
  bx: number,
  by: number,
  dx: number,
  dy: number,
  t: number,
  leanX: number,
  leanY: number,
): void {
  const sway = SWAY_AMOUNT * Math.sin(2 * Math.PI * (t / SWAY_PERIOD + s.phase));
  const cos = Math.cos(sway);
  const sin = Math.sin(sway);
  const sx = dx * cos - dy * sin;
  const sy = dx * sin + dy * cos;
  const px = -sy * s.curve;
  const py = sx * s.curve;
  const lx = leanX * LEAN_BEND;
  const ly = leanY * LEAN_BEND;
  const tx = bx + sx * s.len + lx * s.len;
  const ty = by + sy * s.len + ly * s.len;
  const mx = bx + sx * s.len * 0.5 + px * s.len + lx * s.len * 0.4;
  const my = by + sy * s.len * 0.5 + py * s.len + ly * s.len * 0.4;
  s.el.setAttribute(
    "d",
    `M ${bx.toFixed(1)} ${by.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`,
  );
}

function buildRim(ctx: SkinContext, group: SVGGElement): RimStrand[] {
  const rand = streamFor(ctx.name);
  const out: RimStrand[] = [];
  for (let i = 0; i < RIM_COUNT; i++) {
    const u = (i + rand() * 0.4) / RIM_COUNT;
    const el = newStrandPath(ctx, 0.3 + rand() * 0.2, ctx.weight * (0.35 + rand() * 0.3));
    group.appendChild(el);
    out.push({
      el,
      u,
      phase: u * RIPPLE_TURNS,
      len: ctx.reach * RIM_LEN * (1 - RIM_LEN_JITTER / 2 + rand() * RIM_LEN_JITTER),
      curve: (rand() - 0.5) * CURVE_AMOUNT,
    });
  }
  return out;
}

function buildInterior(ctx: SkinContext, group: SVGGElement): InteriorStrand[] {
  const rand = streamFor(ctx.name);
  // Same stream `buildRim` drew from would repeat its exact draws; a second,
  // independently seeded stream keeps the interior from mirroring the rim.
  for (let i = 0; i < RIM_COUNT; i++) rand();
  const out: InteriorStrand[] = [];
  for (let i = 0; i < INTERIOR_COUNT; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = INTERIOR_R_MIN + rand() * (INTERIOR_R_MAX - INTERIOR_R_MIN);
    const el = newStrandPath(ctx, 0.22 + rand() * 0.15, ctx.weight * (0.3 + rand() * 0.25));
    group.appendChild(el);
    out.push({
      el,
      angle,
      radius,
      phase: rand(),
      len: ctx.reach * INTERIOR_LEN * (0.7 + rand() * 0.6),
      curve: (rand() - 0.5) * CURVE_AMOUNT,
    });
  }
  return out;
}

function cilia(ctx: SkinContext): void {
  // The ruler: registered like any other contour path, so it gets the live
  // `d` every frame, and invisible, so it never appears as a second outline.
  const sample = ctx.contourPath();
  sample.setAttribute("fill", "none");
  sample.setAttribute("stroke", "none");
  ctx.body.appendChild(sample);

  const rimGroup = ctx.body;
  const rim = buildRim(ctx, rimGroup);
  const interior = buildInterior(ctx, clipGroup(ctx, "cilia-interior"));

  let leanX = 0;
  let leanY = 0;
  let prevX = 0;
  let prevY = 0;
  let prevT: number | null = null;
  // Reused, filled fresh each frame — `onFrame`'s "allocate nothing" rule
  // applies to a table as much as a gradient.
  const tableX = new Float64Array(TABLE_SIZE);
  const tableY = new Float64Array(TABLE_SIZE);

  ctx.onFrame(({ t, pose }) => {
    const x = pose.dx * ctx.tile;
    const y = pose.dy * ctx.tile;
    if (prevT !== null) {
      const dt = t - prevT;
      if (dt > 0.0001) {
        const vx = (x - prevX) / dt;
        const vy = (y - prevY) / dt;
        const speed = Math.hypot(vx, vy);
        if (speed > MOVING) {
          leanX += (-vx / speed - leanX) * LEAN_SMOOTH;
          leanY += (-vy / speed - leanY) * LEAN_SMOOTH;
        }
      }
    }
    prevX = x;
    prevY = y;
    prevT = t;

    const total = sample.getTotalLength();
    if (total > 0) {
      for (let i = 0; i < TABLE_SIZE; i++) {
        const p = sample.getPointAtLength((i / TABLE_SIZE) * total);
        tableX[i] = p.x;
        tableY[i] = p.y;
      }
      // `u` is a fraction around a closed contour, so the table wraps.
      for (const s of rim) {
        const pos = s.u * TABLE_SIZE;
        const i0 = Math.floor(pos) % TABLE_SIZE;
        const i1 = (i0 + 1) % TABLE_SIZE;
        const frac = pos - Math.floor(pos);
        const x0 = tableX[i0] as number;
        const y0 = tableY[i0] as number;
        const px = x0 + ((tableX[i1] as number) - x0) * frac;
        const py = y0 + ((tableY[i1] as number) - y0) * frac;
        const r = Math.hypot(px, py) || 1;
        draw(s, px, py, px / r, py / r, t, leanX, leanY);
      }
    }
    for (const s of interior) {
      const bx = Math.cos(s.angle) * s.radius * ctx.reach;
      const by = Math.sin(s.angle) * s.radius * ctx.reach;
      draw(s, bx, by, Math.cos(s.angle), Math.sin(s.angle), t + s.phase * 10, leanX, leanY);
    }
  });
}

export const CILIA: Skin<"cilia"> = {
  id: "cilia",
  label: "CILIA",
  hint: "a hundred strands at the rim, leaning against the body's own motion",
  build(ctx) {
    fillPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    cilia(ctx);
  },
};
