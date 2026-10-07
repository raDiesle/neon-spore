import { at, BEZEL, BLADES, CURL, glyph, SEAM_STEPS, seamAt, unit } from "./governor-face-geom.js";
import { paintAlloy, paintGloss } from "./governor-face-paint.js";
import { type Dial, TRACK_IN } from "./governor-shape.js";
import { PALETTE } from "./palette.js";
import {
  type Sprite,
  type SpriteSpec,
  screenDpr,
  spritePx,
  spriteRng,
  tintedSprite,
} from "./sprite-bake.js";

/**
 * **THE GOVERNOR's face, baked** (`sprite-bake.ts`): the detail that takes
 * the flywheel from a flat brass ring round a black disc to a made thing from
 * somewhere else — asked for by the owner by name, 7 October 2026.
 *
 * Painted once from straight above, in reaches of the radius, and blitted
 * under the dial's own `scale(1, tilt)`, so every seam and glyph foreshortens
 * with the marks and the needle (`governor-shape.ts`). Two sprites, because
 * they are two colours and one of them breathes:
 *
 * - **the alloy** in the brass: the face sunk as a dish, cut into an iris of
 *   seven curved blades with a lit edge on each, a bezel of rivets round the
 *   hub, a ring of engraved glyphs, the track's fine graduations in a groove,
 *   and the rim as riveted segments no two of them alike — with a film of
 *   gloss over the far side in its light layer;
 * - **the veins** in `governorGlow`: a living thing's light in the blades'
 *   seams and under the glyphs, faint, and pulsed by the frame on the beat.
 *
 * Nothing on either is placed by the world: the marks, the studs, the needle
 * and the hub are drawn over them as before.
 */

/** The bake's screen density at most: a 700-pixel disc carries every line here, and a 1000 one costs twice the memory. */
const DPR_CAP = 2;

/** The veins: light in the seams, branching off them, and under every glyph. */
function paintVeins(g: CanvasRenderingContext2D, w: number, h: number): void {
  const px = unit(g, w, h);
  const rnd = spriteRng(120);
  g.lineCap = "round";
  g.lineJoin = "round";
  const vein = new Path2D();
  for (let i = 0; i < BLADES; i++) {
    // Beside the seam rather than in it, and never quite straight: grown, not cut.
    const wander = (j: number) => 0.014 + 0.007 * Math.sin(j * 0.6 + i * 2.3);
    vein.moveTo(...seamAt(i, 0, wander(0), 0.03));
    for (let j = 1; j <= SEAM_STEPS; j++)
      vein.lineTo(...seamAt(i, j / SEAM_STEPS, wander(j), 0.03));
    for (let b = 0; b < 3; b++) {
      const f = 0.25 + 0.22 * b + 0.08 * rnd();
      const lap = i / BLADES + CURL * f * f;
      const k = BEZEL + (TRACK_IN - BEZEL) * f;
      let [x, y] = at(k, lap);
      vein.moveTo(x, y);
      const dir = rnd() < 0.5 ? -1 : 1;
      for (let s = 1; s <= 4; s++) {
        [x, y] = at(k + 0.02 * s, lap + dir * 0.008 * s + (rnd() - 0.5) * 0.004);
        vein.lineTo(x, y);
      }
    }
  }
  for (const [width, alpha] of [
    [8, 0.08],
    [3.5, 0.2],
    [1.2, 0.8],
  ] as const) {
    g.strokeStyle = `rgba(255,255,255,${alpha})`;
    g.lineWidth = width * px;
    g.stroke(vein);
  }
  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.lineWidth = 1.3 * px;
  const cut = spriteRng(7);
  for (let i = 0; i < 40; i++) glyph(g, cut, (i + 0.5) / 40);
  for (let i = 0; i < 9; i++) {
    const [x, y] = at(0.28 + 0.4 * rnd(), rnd());
    const pore = g.createRadialGradient(x, y, 0, x, y, 0.025);
    pore.addColorStop(0, "rgba(255,255,255,0.7)");
    pore.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = pore;
    g.fillRect(x - 0.025, y - 0.025, 0.05, 0.05);
  }
}

const ALLOY: SpriteSpec = {
  name: "governor-alloy",
  frames: 1,
  aspect: 1,
  body: paintAlloy,
  light: paintGloss,
};

const VEINS: SpriteSpec = { name: "governor-veins", frames: 1, aspect: 1, body: paintVeins };

/** How bright the veins are on a beat: a slow swell after the downbeat, never dark. */
export function governorVeinPulse(beatPhase: number): number {
  return 0.45 + 0.35 * Math.sin(Math.PI * beatPhase) ** 2;
}

function blit(ctx: CanvasRenderingContext2D, s: Sprite, d: Dial, alpha: number): void {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(d.cx, d.cy);
  ctx.scale(1, d.tilt);
  ctx.drawImage(s.canvas, 0, 0, s.w, s.h, -d.r, -d.r, d.r * 2, d.r * 2);
  ctx.restore();
}

/** Lays the face's alloy over the flat face and rim. */
export function drawGovernorAlloy(ctx: CanvasRenderingContext2D, d: Dial): void {
  const px = spritePx(d.r * 2, Math.min(DPR_CAP, screenDpr()));
  blit(ctx, tintedSprite(ALLOY, px, PALETTE.governorBrass, PALETTE.governorSheen), d, 1);
}

/** Lays the veins over the face, at `pulse`'s brightness. */
export function drawGovernorVeins(ctx: CanvasRenderingContext2D, d: Dial, pulse: number): void {
  const px = spritePx(d.r * 2, Math.min(DPR_CAP, screenDpr()));
  blit(ctx, tintedSprite(VEINS, px, PALETTE.governorGlow, PALETTE.governorGlow), d, pulse);
}
