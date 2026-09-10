import { facet, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { WispFringe } from "../../../../../packages/render/src/wisp-look.js";
import * as wispLook from "../../../../../packages/render/src/wisp-look.js";
import { strandWave } from "../../../../../packages/render/src/wisp-tentacles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:wisp` / `skirt` — one continuous veil hanging from the whole hem,
 * scalloped at its foot, with folds that go round.
 *
 * **What the shipped side is.** Eight separate threads. Between any two of
 * them is field, so the fringe is *mostly gap*, and the thing that tells the
 * eye there is a body under the bell is the count of the threads rather than
 * anything the threads enclose.
 *
 * **What this argues.** That a bell has an underside, and the honest way to
 * show one is to hang a surface off it. Two parts from the shapes page, laid
 * one over the other: `veil` — *a thin skirt inside the rim; fills out on the
 * glide and flattens on the squeeze* — and `lappet` — *a blunt flap of the
 * bell's own margin.* The skirt is a translucent curtain from the hem to a
 * scalloped foot, the scallops being the lappets, and it is drawn as **two
 * halves of a ring**: the far half first, short and dim, and the near half
 * over it, long and lit. The hem it hangs from is a circle of latitude seen a
 * little from above, so the near foot hangs *lower* than the far foot — the
 * oldest cue there is that a ring is going round something rather than lying
 * flat on the picture.
 *
 * Ten folds run down the curtain, pinned by longitude and turning on the
 * shipped seven-second clock. A fold facing us is a pale line; a fold at the
 * limb is nothing; a fold behind is a dim line seen through the front of the
 * curtain. That is the reveal — a fold goes round the back and another comes
 * forward — and it is what a stroke-only fringe cannot do, because a thread
 * either is or is not there.
 *
 * The jump does to the skirt what a jump does to a real one: it flattens
 * against the body on the crouch, streams and lengthens through the flight,
 * and *bells out* on the landing, wider at the foot than at the hem for an
 * instant, through the same four numbers `drawTentacles` reads.
 *
 * **How it can lose.** *The wisp stops being see-through.* A curtain under the
 * bell is a second surface on the one creature whose body is drawn as a
 * received signal with bands missing from it, and a skirt that holds steady
 * while the bell above it drops out may read as the solid part of a body whose
 * top is flickering — which inverts the picture `wisp-static.ts` is drawing.
 * The skirt's own alpha follows the signal for that reason, and if it still
 * reads as cloth rather than as light, this is the wrong answer.
 */

/** Where the hem is, in shares of `ry`, and how wide, in shares of `rx`. Just
 * under the bell's own foot (`drawWispBody` lifts the bell to `-0.16 ry` and
 * draws it `0.76 ry` tall), so the curtain comes out from under it. */
const HEM_Y = 0.44;
const HEM_K = 0.98;
/** How far below the hem the foot hangs, in shares of `ry`, standing. */
const DROP = 0.95;
/** The view from above: how much lower the near side of a circle of latitude
 * hangs than the far side, as a share of `rx`. Small — this is a level field
 * seen by a level player — and never nought. */
const TILT = 0.16;
/** How many lappets round the foot, and how deep a scallop is. */
const LAPPETS = 8;
const SCALLOP = 0.16;
/** How many folds down the curtain. */
const FOLDS = 10;
/** The shipped turn, `wisp-tentacles.ts`'s seven seconds. */
const SPIN_SECONDS = 7;
/** How many points each half of the ring is walked in. */
const STEPS = 22;
/** What a fold keeps of its light where the curtain has turned away. */
const DIM = 0.35;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

/** The folds, pinned once at the hem's own latitude and reach; `facet` places
 * them per frame. */
const FOLD_PINS = Array.from({ length: FOLDS }, (_, i) => pin((i / FOLDS) * Math.PI * 2, 0, HEM_K));
/** The ring itself, sampled once per half at fixed longitudes — the curtain's
 * outline does not turn, the folds on it do. The first half is the far one. */
const RING_PINS = [Math.PI / 2, -Math.PI / 2].map((from) =>
  Array.from({ length: STEPS + 1 }, (_, s) => pin(from + (s / STEPS) * Math.PI, 0, HEM_K)),
);

function skirt(f: WispFringe): void {
  const { ctx, rx, ry, t, j, dive, air, heading, noise, haze } = f;
  // The jump, as the shipped fringe reads it: flattened on the crouch and the
  // landing, longest at the two ends of the arc, thrown out at the foot on the
  // landing and swept back in flight.
  const drop = ry * (DROP - j.crouch * 0.55 - j.land * 0.5 + dive * 0.5);
  const flare = 1 + j.land * 0.9 + air * 0.12 - j.crouch * 0.2;
  const drag = -heading * rx * 0.45 * (dive * 0.7 + air * 0.35);
  const theta = (t / SPIN_SECONDS) * Math.PI * 2;
  // The curtain's share of the signal: one surface, so one reading, and it is
  // the shipped strand's own wave on the first strand rather than a new one.
  const hold = 0.45 + 0.55 * Math.max(0, Math.min(1, 0.7 + strandWave(t, 0) * 0.3 - noise * 0.6));

  const body = haze(PALETTE.wisp);
  const crest = haze(PALETTE.wispRim);
  const shade = haze(mixHex(PALETTE.wisp, SHADOW, 0.45));

  // A point on the hem ring and its foot, from a pin and the turn it is seen
  // at. `facet` is the projection; the one thing added to it is `TILT`, the
  // view from a little above, which `facet` — a level view of a vertical axis
  // — does not carry, and which is what makes the ring an ellipse.
  const hemAt = (
    p: ReturnType<typeof pin>,
    turn: number,
  ): { x: number; y: number; fx: number; fy: number } => {
    const f = facet(p, turn);
    const x = f.x * rx;
    const y = ry * HEM_Y + TILT * rx * f.sx;
    // Lappets: the foot is scalloped round the ring and the scallops travel
    // slowly, so the hem is seen to ripple rather than to hang dead.
    const a = p.lon + turn;
    const scallop = 1 + SCALLOP * Math.sin(a * LAPPETS + t * 1.3);
    const sway = Math.sin(t * 1.6 + a * 2) * rx * 0.06 * (1 - j.land);
    return { x, y, fx: x * flare + drag + sway, fy: y + drop * scallop * (1 - j.land * 0.35) };
  };

  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  // Far half first, then near. Each half is one closed polygon: along the hem
  // one way and back along the foot, so the curtain is a filled surface and
  // not a stroke that happens to be wide.
  for (const near of [false, true]) {
    const ring = RING_PINS[near ? 1 : 0] ?? [];
    const alpha = (near ? 0.5 : 0.3) * hold;
    if (alpha <= 0.01) continue;

    const top = ctx.createLinearGradient(0, ry * HEM_Y, 0, ry * HEM_Y + drop * 1.1);
    top.addColorStop(0, rgba(near ? body : shade, 0.9));
    top.addColorStop(0.55, rgba(near ? body : shade, 0.45));
    top.addColorStop(1, rgba(near ? crest : body, 0.12));
    ctx.fillStyle = top;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    const feet: number[] = [];
    for (let s = 0; s < ring.length; s++) {
      const p = ring[s];
      if (!p) continue;
      const h = hemAt(p, 0);
      if (s === 0) ctx.moveTo(h.x, h.y);
      else ctx.lineTo(h.x, h.y);
      feet.push(h.fx, h.fy);
    }
    for (let k = feet.length - 2; k >= 0; k -= 2) ctx.lineTo(feet[k] ?? 0, feet[k + 1] ?? 0);
    ctx.closePath();
    ctx.fill();

    // The foot: the scalloped edge, lit on the near side and a dim line behind.
    ctx.strokeStyle = near ? crest : body;
    ctx.lineWidth = Math.max(0.8, ry * (near ? 0.055 : 0.035));
    ctx.globalAlpha = (near ? 0.85 : 0.35) * hold;
    ctx.beginPath();
    for (let k = 0; k < feet.length; k += 2) {
      if (k === 0) ctx.moveTo(feet[k] ?? 0, feet[k + 1] ?? 0);
      else ctx.lineTo(feet[k] ?? 0, feet[k + 1] ?? 0);
    }
    ctx.stroke();

    // The folds, pinned by longitude and carried round by the turn. A fold's
    // weight is how squarely it faces us: full on the meridian, gone at the
    // limb, which is the tangent plane's own `sx` for a line that has no
    // width to foreshorten — and its light is `facet`'s own, against the key.
    for (const p of FOLD_PINS) {
      const f = facet(p, theta);
      if (f.near !== near) continue;
      const face = Math.abs(f.sx);
      if (face < 0.12) continue;
      const h = hemAt(p, theta);
      const lit = surfaceDim(DIM, f.lit);
      ctx.strokeStyle = near ? crest : body;
      ctx.lineWidth = Math.max(0.6, ry * 0.045 * face);
      ctx.globalAlpha = (near ? 0.65 : 0.25) * face * lit * hold;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y + drop * 0.08);
      ctx.quadraticCurveTo((h.x + h.fx) * 0.5, h.y + drop * 0.55, h.fx, h.fy - drop * 0.04);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export const WISP_SKIRT: Variant = {
  slot: "creature:wisp",
  name: "skirt",
  sentence:
    "one translucent curtain hanging from the whole hem to a scalloped foot, the near half lower and lit, the far half short and dim behind it, ten folds going round — a bell with an underside instead of threads with gaps",
  dir: "tools/versus/candidates/creature-wisp/skirt",
  patches: [
    patch({
      target: wispLook.WISP_LOOK,
      // No accessor: `wisp-body.ts` reads the export itself, once per wisp per
      // frame. The module namespace is the whole route there is.
      reached: () => wispLook.WISP_LOOK,
      where: {
        file: "packages/render/src/wisp-look.ts",
        symbol: "WISP_LOOK",
        type: "WispLook",
      },
      fields: { fringe: skirt },
    }),
  ],
};
