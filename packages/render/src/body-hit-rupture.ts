import { hash01 } from "./backdrop.js";
import type { Strike } from "./body-hit.js";
import { mixHex } from "./hex.js";

/**
 * RUPTURE — the sac tears open along its own veins.
 *
 * The slick is drawn as two sacs with a nucleus and nine veins each
 * (`body-bloom.ts`), and the shipped kill is blind to that: five squares and
 * nine wedges of skin, the same for a body with veins and a body without. This
 * says the shot found the veins. On the beat the outline goes white — the
 * whole contour, once, for a twelfth of a second, which is the instant of the
 * hit — and then the skin peels back along nine seams into nine petals, each
 * a tapered blade of the body's red that swings outward and curls as it goes,
 * a lit midrib down each where the vein was. What is left is a drip: one
 * string of the sac's own gel hangs from where the body was and lengthens
 * toward the ship with a bead at its end, and when the bead meets the skin
 * it spreads into a wet stain in the body's colour and dries away over the
 * last half of the strike.
 *
 * Nothing here is a second colour. The flash is the rim colour pushed to
 * white, the petals are the body's own red and the dark of its cut face, and
 * the stain is the same red at a fraction. A shot only lands on a slick that
 * wears its colour, so the colour of the thing that hit and the colour of the
 * thing it hit are one.
 *
 * **How it can lose.** *Nine petals over nine wedges is two breaks at once.*
 * The shipped pieces still fall under this, and if the petals and the wedges
 * read as one body coming apart twice, the petals should go fewer and the
 * wedges should be turned down in the record's `pieces`. Judge it on whether
 * the eye follows the petals out and the stain down, or stalls in the middle.
 */

const PETALS = 9;
/** How far a petal's tip has travelled by the end, as a share of the body. */
const THROW = 1.7;
/** The flash: how long the whole outline is held white, in seconds. */
const FLASH = 0.08;
/** When the drip reaches the skin, as a share of the strike's life. */
const STAIN_AT = 0.45;

function ease(k: number): number {
  return 1 - (1 - k) * (1 - k);
}

export function rupture(ctx: CanvasRenderingContext2D, s: Strike): void {
  const k = Math.min(1, s.age / s.life);

  // The instant: the contour, white, once.
  if (s.age < FLASH) {
    ctx.beginPath();
    for (let i = 0; i < s.outline.length; i++) {
      const p = s.outline[i] as { x: number; y: number };
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = mixHex(s.rim, "#FFFFFF", 0.7);
    ctx.fill();
    return;
  }

  // The petals: one per vein, peeling outward and curling as they go.
  const out = ease(k);
  const r = Math.max(s.rx, s.ry);
  for (let i = 0; i < PETALS; i++) {
    const a = (i / PETALS) * Math.PI * 2 + hash01(s.seed + i) * 0.3 - Math.PI / 2;
    const swing = (hash01(s.seed + 31 + i) - 0.5) * 1.2 * out;
    const dist = r * (0.55 + THROW * out);
    const len = r * 1.7 * (1 - 0.4 * out);
    const wid = r * 0.95 * (1 - 0.5 * out);
    ctx.save();
    ctx.translate(Math.cos(a) * dist, Math.sin(a) * dist);
    ctx.rotate(a + swing);
    ctx.globalAlpha = 1 - out * out;
    // The blade: a leaf pointing outward, the cut face dark on the trailing
    // half and the skin lit on the leading half.
    ctx.beginPath();
    ctx.moveTo(-len * 0.5, 0);
    ctx.quadraticCurveTo(0, -wid, len * 0.5, 0);
    ctx.quadraticCurveTo(0, wid, -len * 0.5, 0);
    ctx.closePath();
    ctx.fillStyle = s.dark;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-len * 0.5, 0);
    ctx.quadraticCurveTo(0, -wid, len * 0.5, 0);
    ctx.closePath();
    ctx.fillStyle = mixHex(s.hex, s.rim, 0.5);
    ctx.fill();
    // The midrib, where the vein was.
    ctx.lineWidth = Math.max(0.5, wid * 0.12);
    ctx.strokeStyle = s.rim;
    ctx.beginPath();
    ctx.moveTo(-len * 0.45, 0);
    ctx.lineTo(len * 0.45, 0);
    ctx.stroke();
    ctx.restore();
  }

  // What is left: the gel, as one drip. A thin string of it hangs from where
  // the body was and lengthens toward the ship with a bead at its end; when
  // the bead meets the skin it spreads into a stain there and dries away.
  const slide = Math.min(1, k / STAIN_AT);
  const dry = k < STAIN_AT ? 1 : 1 - (k - STAIN_AT) / (1 - STAIN_AT);
  const tip = s.floor * ease(slide);
  const bead = Math.max(1, r * 0.22);
  // Once the bead is down the string lets go of the top and follows it.
  const top = slide < 1 ? 0 : s.floor * (1 - dry);
  ctx.globalAlpha = 0.9 * dry;
  ctx.fillStyle = s.hex;
  ctx.beginPath();
  ctx.moveTo(-r * 0.14 * dry, top);
  ctx.quadraticCurveTo(-r * 0.05, (top + tip) * 0.5, -bead * 0.5, tip - bead);
  ctx.lineTo(bead * 0.5, tip - bead);
  ctx.quadraticCurveTo(r * 0.05, (top + tip) * 0.5, r * 0.14 * dry, top);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, tip - bead * 0.6, bead, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = s.rim;
  ctx.beginPath();
  ctx.arc(-bead * 0.3, tip - bead * 0.9, Math.max(0.5, bead * 0.3), 0, Math.PI * 2);
  ctx.fill();
  if (slide >= 1) {
    // On the skin: spreading, then drying.
    const spread = Math.min(1, (k - STAIN_AT) / 0.25);
    ctx.globalAlpha = 0.6 * dry;
    ctx.fillStyle = mixHex(s.hex, s.dark, 0.2);
    ctx.beginPath();
    ctx.ellipse(0, s.floor, bead + s.rx * 1.3 * spread, Math.max(1, bead * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
