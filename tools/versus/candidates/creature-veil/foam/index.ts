import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { VeilMassDraw } from "../../../../../packages/render/src/veil-look.js";
import * as veilLook from "../../../../../packages/render/src/veil-look.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:veil` / `foam` — the cloud is a froth of cells, each a thin-walled
 * bubble with a lit rim, packed on a mass that turns.
 *
 * **What the shipped side is.** Nine soft heaps, each a radial gradient with
 * no edge, stacked near over far and lit by where they face. It reads as
 * weather — which is the brief — and as *vapour*: nothing in it has a wall, so
 * nothing in it can catch a light on one side and lose it on the other.
 *
 * **What this argues.** That a thing wrapped round a body in this game is grown
 * rather than condensed. The shapes page has the parts: `cells` — *four
 * chambers packed against the rim; each breathes on its own count* — and
 * `bubble` — *a thin-walled swelling; inflates on a slow count.* Fourteen of
 * them, pinned by longitude and latitude on the same six-beat turn the shipped
 * heaps take, so the two sides of the pair turn together and differ only in
 * what is turning. Each cell is a **wall and an inside**: a faint fill, a rim
 * the whole way round, and a brighter arc of that rim on the key's side — the
 * one mark a soft heap cannot carry. A cell at the limb is squeezed to a lens
 * by the tangent plane's own `sx`; a cell behind is drawn first, small and dim,
 * and is seen through the cells in front. The froth is the reveal: a bubble
 * comes round the shoulder of the mass as a sliver and swells to a ring as it
 * faces us.
 *
 * Every cell breathes on its own count, off the beat, so the foam boils rather
 * than turning as one lump, and the base under all of it is the shipped
 * gradient's own dark — a rotation that carried two cells to one side must not
 * open the field through the middle of a cloud.
 *
 * **How it can lose.** *It stops being weather.* A cloud made of bubbles is a
 * colony, and the pair reads this body as a thunderhead with a clock over it:
 * if the rims are crisp enough that the cloud reads as a clutch of eggs rather
 * than as a storm, the metaphor the lightning depends on is gone. The rims are
 * kept soft for that reason, and if softening them is what it takes to read
 * as weather, the heaps were already right.
 */

/** How many cells the froth is packed from. */
const CELLS = 14;
/** How far out they sit on the mass, and how much wider the mass is than it
 * is tall — the cloud is a flat thing, so its inside is an ellipsoid lying
 * down, which is the same projection at a wider radius. */
const REACH = 0.6;
const WIDE = 1.45;
/** One cell's radius, as a share of the cloud's reach, before it breathes. */
const CELL = 0.27;
/** How many beats one turn of the mass takes: the shipped heaps' six, so the
 * two sides of the pair turn together (`veil-mass.ts`). */
const TURN_BEATS = 6;
/** What a cell keeps of its light turned away. */
const DIM = 0.25;
/** The rim's crest where a cell faces the key — the contour's own edge colour,
 * `veil.ts`'s `EDGE`, so a lit wall is the same weather catching the light. */
const CREST = "#A79EE8";
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const PINS = Array.from({ length: CELLS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 2.1) * LAT_LIMIT * 0.72, REACH),
);

function foam(d: VeilMassDraw): void {
  const { ctx, r, path, beats } = d;
  const theta = (beats / TURN_BEATS) * Math.PI * 2;
  const crest = d.haze(CREST);

  ctx.save();
  ctx.globalAlpha = d.seeThrough ? 0.66 : 1;
  ctx.clip(path);
  ctx.fillStyle = d.bottom;
  ctx.fill(path, "nonzero");

  for (const want of [false, true]) {
    for (let i = 0; i < PINS.length; i++) {
      const p = PINS[i];
      if (!p) continue;
      const f = facet(p, theta);
      if (f.near !== want) continue;
      // Each cell on its own slow count, off the beat.
      const breath = 1 + 0.14 * Math.sin(beats * 0.9 + i * 2.3);
      const lit = surfaceDim(DIM, f.lit);
      const wall = mixHex(d.top, crest, lit * 0.85);
      const inside = mixHex(d.bottom, d.top, lit);
      const rad = r * CELL * breath * (want ? 1 : 0.8);
      ctx.save();
      ctx.translate(f.x * r * WIDE, f.y * r);
      // The tangent plane's own map: a lens at the limb, a ring facing us.
      ctx.scale(Math.max(0.14, Math.abs(f.sx)), f.sy);
      // The inside, faint and lit from the wall inward — a thin skin over
      // nothing, which is what a bubble is.
      const g = ctx.createRadialGradient(0, 0, rad * 0.3, 0, 0, rad);
      g.addColorStop(0, rgba(inside, want ? 0.25 : 0.12));
      g.addColorStop(0.8, rgba(inside, want ? 0.45 : 0.2));
      g.addColorStop(1, rgba(wall, want ? 0.55 : 0.28));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();
      // The wall, the whole way round, soft.
      ctx.strokeStyle = rgba(wall, want ? 0.55 : 0.25);
      ctx.lineWidth = Math.max(0.8, r * 0.035);
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.stroke();
      // And the crest of it: the arc on the key's side — upper left, where
      // `KEY` stands — brighter by how squarely the cell faces the light.
      if (want) {
        ctx.strokeStyle = rgba(crest, 0.35 + 0.55 * lit);
        ctx.lineWidth = Math.max(1, r * 0.05);
        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.92, Math.PI * 1.05, Math.PI * 1.7);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();
}

export const VEIL_FOAM: Variant = {
  slot: "creature:veil",
  name: "foam",
  sentence:
    "the cloud as a froth of fourteen thin-walled cells on a turning mass, each with a rim and a lit arc on the key's side, the ones behind seen through the ones in front — a grown thing wrapped round the body rather than vapour",
  dir: "tools/versus/candidates/creature-veil/foam",
  patches: [
    patch({
      target: veilLook.VEIL_LOOK,
      // No accessor: `veil.ts` reads the export itself, once per cloud per
      // frame. The module namespace is the whole route there is.
      reached: () => veilLook.VEIL_LOOK,
      where: {
        file: "packages/render/src/veil-look.ts",
        symbol: "VEIL_LOOK",
        type: "VeilLook",
      },
      fields: { mass: foam },
    }),
  ],
};
