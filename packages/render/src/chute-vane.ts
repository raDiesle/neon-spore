import { facet, KEY, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { CANOPY_HALF, CANOPY_LIFT, canopyPath } from "./chute-canopy.js";
import { bellyAt, type ChuteDraw, swayAt } from "./chute-look.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * VANE — the canopy turns slowly as it comes down, and its surface goes
 * round.
 *
 * A canopy on a still day turns: the shrouds wind and unwind, and the dome
 * yaws about its own axis while it sways. The shipped dome cannot show that
 * — a dome is the same silhouette from every bearing, so a yaw has nothing
 * to turn — which is exactly why it is the reveal to reach for: nothing
 * about the outline changes, and everything on the surface does. This keeps
 * the shipped `canopyPath`, so the cut canopy is still the one the pair
 * watched, and places eight marks on the dome by longitude and latitude —
 * the pores every grown thing in this game carries — projected by `facet`
 * about the canopy's own vertical axis. The dome yaws at a slow steady rate
 * with a twist from the sway on top, so a mark arrives thin at one limb,
 * crosses the front full and lit, and thins away at the other; the far ones
 * are not drawn. Under the marks the dome is lit as a shell from the key,
 * the shrouds are the shipped four, and the plume on the climb is the
 * shipped `column`.
 *
 * **How it can lose.** *Eight dots sliding across a flat shape.* If the
 * marks read as moving *over* the dome rather than *with* it — because the
 * foreshortening at the limbs is lost at the size the game draws a chute —
 * the reveal has become a decal scrolling. Judge it at a limb, where a mark
 * should be a sliver before it is a mark.
 */

/** How many marks, and where their ring sits on the dome: a little above
 * the hem, where the dome is widest and a mark crossing has the furthest
 * to go. */
const MARKS = 8;
const MARK_LAT = 0.5;
/** A mark's own radius as a share of the body's. */
const MARK = 0.16;
/** One turn of the dome, in seconds, and how much twist a full sway adds. */
const TURN_SECONDS = 7;
const TWIST = 2.5;
/** What a mark keeps of its colour in full shadow. */
const FLOOR = 0.35;
const SHADOW = "#0B1024";
const SHEEN = "#F4F1EA";

/** The dome as a squashed ball: the hem's half-width across, and the
 * crown's height over the hem as a share of it — `canopyPath`'s own
 * proportions, so the marks sit on the surface the outline draws. */
const CAP = 0.75;

let pins: Pin[] | undefined;
function markPins(): Pin[] {
  if (pins) return pins;
  pins = [];
  for (let i = 0; i < MARKS; i++) {
    // Negative latitude is up in `facet`'s frame: the marks sit above the
    // hem, on the crown side.
    pins.push(pin((i / MARKS) * Math.PI * 2, -MARK_LAT, 1));
  }
  return pins;
}

export function vane(d: ChuteDraw): void {
  const { ctx, cfg, r, glow, rim, near, time, phase } = d;
  const line = hazed(cfg, PALETTE.dim, near);
  const sway = swayAt(time, phase);
  const belly = bellyAt(time, phase);
  const lift = -r * CANOPY_LIFT;
  const half = r * CANOPY_HALF;
  const crown = r * 1.125 * belly;
  const dark = mixHex(glow, SHADOW, 0.7);

  ctx.save();
  ctx.rotate(sway);
  const dome = canopyPath(r, belly);

  // The shell's light: pale on the key's shoulder, dark toward the far hem.
  const top = lift - crown;
  const grad = ctx.createLinearGradient(
    KEY.x * half,
    top + crown * 0.3 + KEY.y * crown * 0.4,
    -KEY.x * half,
    lift + r * 0.2,
  );
  grad.addColorStop(0, rgba(mixHex(glow, SHEEN, 0.3), 0.5));
  grad.addColorStop(0.55, rgba(glow, 0.28));
  grad.addColorStop(1, rgba(mixHex(dark, glow, FLOOR), 0.45));
  ctx.fillStyle = grad;
  ctx.fill(dome);

  // The marks, placed: the dome's axis is vertical through the hem's middle,
  // and the yaw is the clock plus the sway's twist.
  const theta = (time / TURN_SECONDS) * Math.PI * 2 + phase + sway * TWIST;
  ctx.save();
  ctx.clip(dome);
  ctx.translate(0, lift);
  for (const p of markPins()) {
    const f = facet(p, theta);
    if (!f.near) continue;
    const edge = Math.min(1, f.sx * 2);
    const lit = surfaceDim(FLOOR, f.lit);
    ctx.save();
    ctx.translate(f.x * half * 0.92, f.y * half * CAP * 0.92);
    ctx.scale(Math.max(0.05, f.sx), f.sy);
    ctx.beginPath();
    ctx.arc(0, 0, r * MARK, 0, Math.PI * 2);
    ctx.fillStyle = rgba(mixHex(dark, rim, lit), 0.85 * edge);
    ctx.fill();
    // A pore's rim, lit toward the key: what makes it a hole in the skin.
    ctx.strokeStyle = rgba(mixHex(dark, SHEEN, lit * 0.6), 0.6 * edge);
    ctx.lineWidth = STROKE.inner * 0.8;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  ctx.strokeStyle = rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(dome);

  // The shrouds, as they ship.
  ctx.beginPath();
  for (let k = 0; k < 4; k++) {
    const t = -1 + (k * 2) / 3;
    ctx.moveTo(half * t, lift + r * 0.42 * (1 - t * t));
    ctx.lineTo(0, -r * 0.45);
  }
  ctx.strokeStyle = line;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke();
  ctx.restore();

  halo(ctx, 0, -r * CANOPY_LIFT * 0.5, r * 1.4, glow, 0.1);
}
