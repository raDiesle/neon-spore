import { pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { WispFringe } from "../../../../../packages/render/src/wisp-look.js";
import * as wispLook from "../../../../../packages/render/src/wisp-look.js";
import { strandWave } from "../../../../../packages/render/src/wisp-tentacles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:wisp` / `arms` — four oral arms under the bell, each a ruffled
 * ribbon with a width, instead of eight threads with none.
 *
 * **What the shipped side is.** Eight strokes rooted round the hem, half of
 * them behind the bell, each a bezier of one line width. It is a fringe, and it
 * reads as one — but a line has no near side. A strand going round the back
 * can only thin and dim, because there is nothing on it a light could fall
 * across, and so the whole of the fringe's depth is carried by which two
 * strands happen to be thick this second.
 *
 * **What this argues.** That what hangs off a jellyfish is *mass*, and mass is
 * the thing a light can act on. The shapes page has the part: `oral-arm` — *a
 * long ruffled ribbon under the bell; the frill is width, not an edge.* Four of
 * them, because that is how many a medusa carries, rooted close under the
 * middle of the bell rather than at its hem, so they hang from the body's
 * centre of gravity and the hem is left to be a hem. Each arm is a **filled
 * ribbon**: a spine that falls and drifts, and a width that ruffles down its
 * length on a wave that travels *downward* — so the frill is seen to run off
 * the tip and the arm reads as a thing something is passing through, which is
 * what an oral arm does.
 *
 * The four are pinned by longitude on a small circle under the bell and turn
 * on the shipped seven-second clock. An arm at the limb is drawn at a third of
 * its width (`facet`'s own `sx`), an arm behind is drawn first, dim and behind
 * the bell, and an arm square to the light takes the crest colour down one
 * edge — the lit edge is on the key's side, which is what tells a ribbon from
 * a stroke. That is the reveal: an arm goes round the back as a sliver and
 * comes forward as a sheet.
 *
 * The jump does to an arm what it did to a strand — gathered on the crouch,
 * drawn out on the flight, thrown wide on the landing — through the same
 * numbers `drawTentacles` reads, so the two sides of the pair differ in what
 * hangs and never in how the jump moves it.
 *
 * **How it can lose.** *The bell gets heavy.* Four sheets under a dome is more
 * paint than eight lines, and on the one creature whose bell is drawn as a
 * broken signal, a solid mass beneath it may read as the body's real weight and
 * the interference above as a flicker on top — the opposite of what
 * `wisp-static.ts` wants. Watch the dwell: a wisp standing on its tile has to
 * still look received rather than sculpted.
 */

/** Four arms, because a medusa has four. */
const ARMS = 4;
/** How close under the middle they root, as a share of `rx`. */
const ROOT_REACH = 0.62;
/** The shipped turn, `wisp-tentacles.ts`'s seven seconds, so the arms and the
 * thing they replace go round at one rate. */
const SPIN_SECONDS = 7;
/** How narrow an arm is at the limb, as a share of its width facing us. */
const EDGE_WEIGHT = 0.28;
/** What an arm keeps of its light turned fully away. */
const DIM = 0.5;
/** How many ruffles down one arm, and how fast the ruffle travels down it. */
const RUFFLES = 2.6;
const RUFFLE_SPEED = 2.6;
/** How many segments the spine is walked in. */
const STEPS = 12;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

const PINS = Array.from({ length: ARMS }, (_, i) => pin((i / ARMS) * Math.PI * 2, 0, ROOT_REACH));

function arms(f: WispFringe): void {
  const { ctx, rx, ry, t, j, dive, air, heading, noise, haze } = f;
  // The three things the jump does, as `drawTentacles` reads them: short when
  // gathered or splashed, longest at the two ends of the arc; spread on the
  // landing; swept back in flight.
  const len = ry * (1.75 - j.crouch * 0.9 - j.land * 0.8 + dive * 0.55);
  const splay = 1 + j.land * 1.8 + air * 0.2;
  const drag = -heading * rx * 0.5 * (dive * 0.7 + air * 0.35);
  const theta = (t / SPIN_SECONDS) * Math.PI * 2;

  const body = haze(PALETTE.wisp);
  const crest = haze(PALETTE.wispRim);
  const shade = haze(mixHex(PALETTE.wisp, SHADOW, 0.4));

  ctx.save();
  ctx.lineJoin = "round";
  // Far arms first, then near: the near ones come down over the far ones'
  // frills, which is the stacking a flat fringe cannot show.
  for (const want of [false, true]) {
    for (let i = 0; i < ARMS; i++) {
      const p = PINS[i];
      if (!p) continue;
      const a = p.lon + theta;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const near = cosA > 0;
      if (near !== want) continue;
      const face = Math.abs(cosA);
      // The tangent plane's own map, for a feature that is a ribbon rather than
      // a dot: its *width* takes `sx`, its length does not.
      const width = ry * 0.42 * (EDGE_WEIGHT + (1 - EDGE_WEIGHT) * face);
      const lit = surfaceDim(DIM, Math.max(0, sinA * 0.6 + cosA * 0.8));
      // The arm's own share of the signal — the shipped reading, called.
      const hold =
        0.35 + 0.65 * Math.max(0, Math.min(1, 0.7 + strandWave(t, i) * 0.4 - noise * 0.5));

      const rootX = p.k * rx * sinA;
      const rootY = ry * 0.3;
      const sway = Math.sin(t * 1.4 + i * 1.6) * rx * 0.22 * (1 - j.land);
      const tipX = rootX * splay + drag + sway;
      const tipY = rootY + len * (1 - j.land * 0.5);

      // The spine, walked. A bezier evaluated by hand rather than a stroked
      // path, because the ribbon's two edges are built off it point by point.
      const c1x = rootX + sway * 0.6;
      const c1y = rootY + len * 0.35;
      const c2x = tipX - sway * 0.5;
      const c2y = rootY + len * 0.72;
      const left: number[] = [];
      const right: number[] = [];
      for (let s = 0; s <= STEPS; s++) {
        const u = s / STEPS;
        const v = 1 - u;
        const x = v * v * v * rootX + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * tipX;
        const y = v * v * v * rootY + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * tipY;
        // The ruffle: the width breathing down the length, on a wave that runs
        // toward the tip. Widest a third of the way down, gone at the tip.
        const taper = Math.sin(Math.PI * Math.min(1, 0.12 + u * 0.95)) ** 0.6;
        const ruffle = 0.6 + 0.4 * Math.sin(u * RUFFLES * Math.PI * 2 - t * RUFFLE_SPEED + i * 1.3);
        const half = Math.max(0, width * 0.5 * taper * ruffle);
        left.push(x - half, y);
        right.push(x + half, y);
      }

      ctx.globalAlpha = (near ? 1 : 0.7) * hold * (0.75 + 0.25 * lit);
      const fill = ctx.createLinearGradient(rootX - width, 0, rootX + width, 0);
      // Lit edge on the key's side — the left, where `KEY` stands — dark on the
      // other: one light across a sheet, which is the whole difference from a
      // line.
      fill.addColorStop(0, rgba(mixHex(body, crest, 0.3 + lit * 0.7), 1));
      fill.addColorStop(0.5, rgba(mixHex(body, crest, lit * 0.3), 0.95));
      fill.addColorStop(1, rgba(shade, 0.9));
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(left[0] ?? rootX, left[1] ?? rootY);
      for (let k = 2; k < left.length; k += 2) ctx.lineTo(left[k] ?? 0, left[k + 1] ?? 0);
      for (let k = right.length - 2; k >= 0; k -= 2) ctx.lineTo(right[k] ?? 0, right[k + 1] ?? 0);
      ctx.closePath();
      ctx.fill();

      // The frill's lit edge, drawn only where the arm faces us: a ribbon
      // catches the light along one side, and a sliver at the limb has no side
      // to catch it on.
      if (near) {
        ctx.strokeStyle = rgba(crest, 0.5 + 0.5 * lit * face);
        ctx.lineWidth = Math.max(1, ry * 0.06);
        ctx.beginPath();
        ctx.moveTo(left[0] ?? rootX, left[1] ?? rootY);
        for (let k = 2; k < left.length; k += 2) ctx.lineTo(left[k] ?? 0, left[k + 1] ?? 0);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

export const WISP_ARMS: Variant = {
  slot: "creature:wisp",
  name: "arms",
  sentence:
    "four oral arms under the bell, each a ruffled ribbon with a lit edge and a dark one, turning as sheets and going round the back as slivers — a fringe with mass instead of eight threads",
  dir: "tools/versus/candidates/creature-wisp/arms",
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
      fields: { fringe: arms },
    }),
  ],
};
