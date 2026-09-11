import { facet, pin, surfaceDim } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import type { VeilMassDraw } from "./veil-look.js";

/**
 * STRATA — a kept look for THE VEIL's cloud, drawn only on the SHAPES page's
 * LIBRARY.
 *
 * It stood in `creature:veil` on VERSUS, decided 11 September 2026: the owner
 * kept ANVIL (`veil-mass.ts`) and said "move the versus alternatives all to
 * 'Shapes' page". It sits in this package, beside the record it once patched,
 * because it is written against this package's internals; nothing on the
 * field imports it, and the game's bundle drops it. The argument it made,
 * from its VERSUS card:
 *
 * `creature:veil` / `strata` — the cloud is five stacked layers of vapour, each
 * a ring round the mass seen a little from above, with knots on the rings that
 * go round.
 *
 * **What the shipped side is.** Nine heaps on a turning mass, and the turn is
 * carried by which heap is in front. It is a *pile* — the right word for a
 * cumulus — and a pile has no lines in it, so nothing on it says where the axis
 * is or which way round it is going except the heaps' own slow reordering.
 *
 * **What this argues.** That a cloud with a clock over it should look like a
 * thing that turns, and the oldest picture of a turning mass is its *strata*:
 * the bands round a gas planet, the layers of a lenticular cloud, the rings a
 * stack of plates makes. The shapes page has the part — `fold`: *a membrane
 * laid over the rim in a crescent; slides along the body* — and here five of
 * them are laid the whole way round at five latitudes. Each is a circle of
 * latitude on the same six-beat turn the shipped heaps take, drawn as **two
 * arcs**: the far half first, thin and dim, seen through the body of the
 * cloud, and the near half over it, thick and lit, its middle brighter where
 * it squares to the key. The rings are seen a little from above, so the near
 * arc of every ring sags *below* the far arc — a stack of ellipses, which is
 * what a stack of hoops looks like from where a player stands.
 *
 * On each ring ride three knots — denser vapour, drawn as soft heaps about
 * their own origin and squeezed by the tangent plane's `sx` — pinned by
 * longitude, so they come round the near side broad and bright, thin to
 * slivers at the limbs, and cross the back as faint marks behind the mass.
 * That is the reveal, and it is legible from across a room: three marks on
 * five rings going round one axis is a thing turning, and nothing else.
 *
 * Each layer breathes on its own count, off the beat, and the whole stack
 * stands on the shipped gradient's own dark so the field never shows through
 * the middle of the weather.
 *
 * **How it can lose.** *It reads as a machine.* Five parallel rings are the
 * picture of a turbine as readily as of a storm, and the field already has
 * one wheel on it. If the strata read as *built* rather than as weather
 * banding, the pile was the better cloud — the knots are soft and the rings
 * are wide for exactly that reason, and if they still look like rails, drop
 * this one.
 */

/** Five layers, at these latitudes. Kept short of the poles: a ring at one is
 * a dot, and kept off the equator's exact centre so the stack is not
 * symmetric about the middle of the picture. */
const LATS = [-0.55, -0.28, -0.02, 0.24, 0.5];
/** How far out the rings sit, and how much wider the mass is than tall — the
 * cloud is a flat thing, and its inside is an ellipsoid lying down. */
const REACH = 0.74;
const WIDE = 1.35;
/** The view from above: how much lower a ring's near side hangs than its far
 * side, as a share of the cloud's reach. */
const TILT = 0.22;
/** Knots per ring, and how big one is as a share of the cloud's reach. */
const KNOTS = 3;
const KNOT = 0.26;
/** How many beats one turn of the mass takes: the shipped heaps' six
 * (`veil-mass.ts`), so the two sides of the pair turn together. */
const TURN_BEATS = 6;
/** What a ring keeps of its light turned away. */
const DIM = 0.22;
/** The crest a ring takes where it faces the key — `veil.ts`'s `EDGE`. */
const CREST = "#A79EE8";
/** How many points half a ring is walked in. */
const STEPS = 18;

/** The ring itself, sampled once per half at fixed longitudes: its outline does
 * not turn, the knots on it do. The first half is the far one. */
const RING_PINS = LATS.map((lat) =>
  [Math.PI / 2, -Math.PI / 2].map((from) =>
    Array.from({ length: STEPS + 1 }, (_, s) => pin(from + (s / STEPS) * Math.PI, lat, REACH)),
  ),
);
/** The knots, pinned once; `facet` places them per frame. Staggered ring to
 * ring so no two rings show a knot at the same longitude. */
const KNOT_PINS = LATS.map((lat, i) =>
  Array.from({ length: KNOTS }, (_, k) => pin(((k + i * 0.37) / KNOTS) * Math.PI * 2, lat, REACH)),
);

export function strata(d: VeilMassDraw): void {
  const { ctx, r, path, beats } = d;
  const theta = (beats / TURN_BEATS) * Math.PI * 2;
  const crest = d.haze(CREST);

  ctx.save();
  ctx.globalAlpha = d.seeThrough ? 0.66 : 1;
  ctx.clip(path);
  ctx.fillStyle = d.bottom;
  ctx.fill(path, "nonzero");
  ctx.lineCap = "round";

  // Far halves of every ring first, then every near half, so the whole back
  // of the mass is behind the whole front of it.
  for (const near of [false, true]) {
    for (let i = 0; i < LATS.length; i++) {
      const ring = RING_PINS[i]?.[near ? 1 : 0];
      if (!ring) continue;
      // A layer breathes on its own count, off the beat.
      const swell = 1 + 0.06 * Math.sin(beats * 0.8 + i * 1.9);
      // The ring's own light is read at its middle — the point facing us —
      // because a horizontal band has one normal across its whole near arc
      // and `facet` at the meridian is that normal.
      const mid = ring[Math.floor(ring.length / 2)];
      // Wider toward the poles, where a band on a lying ellipsoid is seen
      // more from above and shows more of its face.
      const band = r * (near ? 0.11 + 0.05 * Math.abs(mid?.sinLat ?? 0) : 0.07);
      const lit = mid ? surfaceDim(DIM, facet(mid, 0).lit) : DIM;
      const hex = near ? mixHex(d.top, crest, lit * 0.7) : mixHex(d.bottom, d.top, 0.6);
      ctx.strokeStyle = rgba(hex, near ? 0.5 + 0.4 * lit : 0.3);
      ctx.lineWidth = Math.max(0.8, band);
      ctx.beginPath();
      for (let s = 0; s < ring.length; s++) {
        const p = ring[s];
        if (!p) continue;
        const f = facet(p, 0);
        const x = f.x * r * WIDE * swell;
        const y = f.y * r * swell + TILT * r * f.sx * p.cosLat;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // The knots on this ring, carried round by the turn.
      const knots = KNOT_PINS[i] ?? [];
      for (let k = 0; k < knots.length; k++) {
        const p = knots[k];
        if (!p) continue;
        const f = facet(p, theta);
        if (f.near !== near) continue;
        const klit = surfaceDim(DIM, f.lit);
        const khex = near ? mixHex(d.top, crest, klit * 0.9) : mixHex(d.bottom, d.top, 0.7);
        const rad = r * KNOT * (near ? 1 : 0.7) * (1 + 0.1 * Math.sin(beats * 1.1 + k * 2.2 + i));
        ctx.save();
        ctx.translate(f.x * r * WIDE * swell, f.y * r * swell + TILT * r * f.sx * p.cosLat);
        // The tangent plane's own map: a knot at the limb is a sliver.
        ctx.scale(Math.max(0.1, Math.abs(f.sx)), f.sy);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
        g.addColorStop(0, rgba(khex, near ? 1 : 0.5));
        g.addColorStop(0.6, rgba(khex, near ? 0.65 : 0.25));
        g.addColorStop(1, rgba(khex, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  ctx.restore();
}
