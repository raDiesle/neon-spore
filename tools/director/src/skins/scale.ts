import { contactPass, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { type Mounted, mount, spin } from "./mounted.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { turnAngle } from "./turn.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * SCALE — many small, soft plates, laid in offset rows around the body's own
 * centre and shrinking toward the rim.
 *
 * The hard part is shared with CARAPACE and is the whole job: a lattice drawn
 * once, in fixed pixel coordinates, slides off a body that wobbles. Nothing
 * here is baked that way. A scale's *position* is polar — an angle and a
 * radius, both fractions of `ctx.reach` — so it scales with whatever body it
 * is given rather than with one screen size, and the *group* holding every
 * scale is clipped by `clipGroup`, whose clip path is one of
 * `ctx.contourPath()`'s paths: `shape-figure.ts` hands that path a fresh `d`
 * every frame, the same `d` the outline itself wears. So the lattice is laid
 * out once in `build()` — nothing here allocates per frame — and it is the
 * *clip*, re-evaluated every frame against the live silhouette, that keeps a
 * scale from ever being visible past the edge the body actually has this
 * instant. A row that would sit outside a lobe is simply trimmed there and
 * uncovered where the lobe grows past it next frame.
 *
 * Fish and snake scales are the same lattice at two densities; the brief asks
 * for one and a reason. Fish reads at the sizes this catalogue actually shows
 * (20–26 px up through a boss-sized card): a snake density fine enough to look
 * like snake scale becomes a stipple noise at fish density's shrink rate, and
 * `docs/spec/graphics.md`'s own rule against relying on sub-pixel detail is
 * the reason to not ship the finer one. So this is the fish reading: a
 * handful of rows, larger plates.
 */

const ROWS = 6;
const R_MIN = 0.08;
const ROW_STEP = 0.24;
/** How far a lattice must reach to cover an elongated body once clipped. */
const R_COVER = 1.55;
const LEN_START = 0.3;
const LEN_SHRINK = 0.6;
const LEN_MIN = 0.07;
const ASPECT = 1.2;

interface Scale {
  cx: number;
  cy: number;
  dx: number;
  dy: number;
  len: number;
  width: number;
}

/** One petal per scale: a rounded base curving out to a point, pointing
 * outward along the body's own radius — the "soft" half of the pair. */
function scalePath(s: Scale): string {
  const nx = -s.dy;
  const ny = s.dx;
  const w = s.width / 2;
  const bl = { x: s.cx + nx * w, y: s.cy + ny * w };
  const br = { x: s.cx - nx * w, y: s.cy - ny * w };
  const tip = { x: s.cx + s.dx * s.len, y: s.cy + s.dy * s.len };
  const cl = {
    x: s.cx + nx * w * 0.4 + s.dx * s.len * 0.55,
    y: s.cy + ny * w * 0.4 + s.dy * s.len * 0.55,
  };
  const cr = {
    x: s.cx - nx * w * 0.4 + s.dx * s.len * 0.55,
    y: s.cy - ny * w * 0.4 + s.dy * s.len * 0.55,
  };
  return (
    `M ${bl.x.toFixed(1)} ${bl.y.toFixed(1)} ` +
    `Q ${cl.x.toFixed(1)} ${cl.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} ` +
    `Q ${cr.x.toFixed(1)} ${cr.y.toFixed(1)} ${br.x.toFixed(1)} ${br.y.toFixed(1)} ` +
    `Q ${s.cx.toFixed(1)} ${s.cy.toFixed(1)} ${bl.x.toFixed(1)} ${bl.y.toFixed(1)} Z`
  );
}

/**
 * The rows themselves, in contour-relative polar space — an angle and a
 * fraction of `reach`, never a pixel. Row phase and count both take a little
 * jitter from the shape's own seed, so two shapes never tile identically.
 */
function scales(name: string, reach: number): Scale[] {
  const rand = streamFor(name);
  const out: Scale[] = [];
  for (let i = 0; i < ROWS; i++) {
    const r = (R_MIN + i * ROW_STEP) * reach;
    const frac = i / (ROWS - 1);
    const len = Math.max(LEN_MIN, LEN_START * (1 - frac * LEN_SHRINK)) * reach;
    const width = len * ASPECT;
    const spacing = Math.max(width * 0.8, reach * 0.05);
    const count = Math.max(6, Math.round((2 * Math.PI * r) / spacing));
    const stagger = (i % 2) * (Math.PI / count);
    const jitter = rand() * (Math.PI / count) * 0.6;
    for (let j = 0; j < count; j++) {
      const a = (j / count) * Math.PI * 2 + stagger + jitter;
      out.push({
        cx: Math.cos(a) * r,
        cy: Math.sin(a) * r,
        dx: Math.cos(a),
        dy: Math.sin(a),
        len,
        width,
      });
    }
    if (r > reach * R_COVER) break;
  }
  return out;
}

function scalePlates(ctx: SkinContext): void {
  const g = clipGroup(ctx, "scale");
  const rand = streamFor(ctx.name);
  for (const s of scales(ctx.name, ctx.reach)) {
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("d", scalePath(s));
    p.setAttribute("fill", ctx.colour);
    p.setAttribute("fill-opacity", (0.16 + rand() * 0.1).toFixed(3));
    p.setAttribute("stroke", ctx.colour);
    p.setAttribute("stroke-opacity", "0.35");
    p.setAttribute("stroke-width", String(ctx.weight * 0.35));
    g.appendChild(p);
  }
}

export const SCALE: Skin<"scale"> = {
  id: "scale",
  label: "SCALE",
  hint: "overlapping plates in offset rows, shrinking toward the rim",
  build(ctx) {
    fillPass(ctx);
    scalePlates(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};

/**
 * The same rows, on a ball instead of on a picture.
 *
 * A row above is a circle of *radius* about the picture's centre; a row here is
 * a circle of *latitude* about the axis the body turns on, half a row in from
 * either pole. That is the one honest reading of "the same lattice" — the
 * alternative, keeping the rosette and putting its crown on the point facing
 * the viewer, has a singular antipode where a whole row's worth of plates
 * collapses onto one point, and `SWING` is wide enough to bring that point into
 * view. Latitude rows have no such knot, and `count` from the ring's
 * circumference stops being an approximation and becomes exactly right.
 *
 * **A scale is not a dot, and this is where that is paid for.** Its plates are
 * drawn about their own origin in tangent coordinates — east right, south down
 * — pointing at the south pole, so `mounted.ts`'s `scale(cos α, cos lat)` acts
 * on a shape with an orientation rather than on a disc. `ASPECT` is 1.2, so a
 * plate is *wider than it is long*: its long axis lies east–west, exactly the
 * axis the projection eats. Past `cos α < 1/1.2`, which is 33.6° from the
 * facing meridian, the long axis flips to north–south and the plate reads as a
 * vertical spike narrowing to nothing at the limb. A flat decal squashed by one
 * body-wide `sx` keeps its proportions and its axis the whole way across, which
 * is what "it slides" looks like.
 */
function mountedRows(
  name: string,
  reach: number,
): { lon: number; lat: number; len: number; width: number }[] {
  const rand = streamFor(name);
  const out: { lon: number; lat: number; len: number; width: number }[] = [];
  const widest = Math.sin(Math.PI / 2 - Math.PI / (2 * ROWS));
  for (let i = 0; i < ROWS; i++) {
    const lat = Math.PI / 2 - (Math.PI * (i + 0.5)) / ROWS;
    const frac = Math.abs(Math.sin(lat)) / widest;
    const len = Math.max(LEN_MIN, LEN_START * (1 - frac * LEN_SHRINK)) * reach;
    const width = len * ASPECT;
    const spacing = Math.max(width * 0.8, reach * 0.05);
    const count = Math.max(6, Math.round((2 * Math.PI * reach * Math.cos(lat)) / spacing));
    const stagger = (i % 2) * (Math.PI / count);
    const jitter = rand() * (Math.PI / count) * 0.6;
    for (let j = 0; j < count; j++) {
      out.push({ lon: (j / count) * Math.PI * 2 + stagger + jitter, lat, len, width });
    }
  }
  return out;
}

function mountedPlates(ctx: SkinContext): Mounted[] {
  const g = clipGroup(ctx, "scale-mounted");
  const rand = streamFor(ctx.name);
  // The per-feature lambert is a light, so it goes off with the light. The
  // vanishing at the limb is not, and stays either way.
  const dim = ctx.lit ? 0.22 : 1;
  const out: Mounted[] = [];
  for (const s of mountedRows(ctx.name, ctx.reach)) {
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("d", scalePath({ cx: 0, cy: 0, dx: 0, dy: 1, len: s.len, width: s.width }));
    p.setAttribute("fill", ctx.colour);
    p.setAttribute("fill-opacity", (0.16 + rand() * 0.1).toFixed(3));
    p.setAttribute("stroke", ctx.colour);
    p.setAttribute("stroke-opacity", "0.35");
    p.setAttribute("stroke-width", String(ctx.weight * 0.35));
    const el = document.createElementNS(SVG, "g");
    el.appendChild(p);
    g.appendChild(el);
    out.push(mount(el, s.lon, s.lat, ctx.reach, dim));
  }
  return out;
}

export const MOUNTED_SCALE: Skin<"scale-mounted"> = {
  id: "scale-mounted",
  label: "MOUNTED SCALE",
  hint: "the same rows of plates, carried round a turning body instead of laid on it",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    const skin = mountedPlates(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
    spin(skin, turnAngle(0));
    ctx.onFrame(({ t }) => spin(skin, turnAngle(t)));
  },
};
