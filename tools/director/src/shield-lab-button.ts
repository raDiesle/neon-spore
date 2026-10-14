import { halo } from "@neon-spore/render";
import { CY, domePath, glow, inWindow, nearness, RIM } from "./shield-lab-ink.js";
import type { SeatFrame, ShieldAsk } from "./shield-lab-scene.js";

/**
 * **THE SHIELD LAB's marks on the band** — the owner, 14 October 2026: *when
 * something on the field … requires shield or relates to it — we also colour
 * highlight the control set shield button, like we do for cannon shot
 * helpers* (`fire-button-mark.ts`, EMBER on the fire button).
 *
 * The shield is two controls on two screens, so it is two marks:
 *
 * - **P1's SHIELD button** glows for as long as a rock is coming. With the
 *   moment shown, a dome closes down onto the button and lands on it on the
 *   beat to press, and flashes inside the window.
 * - **P2's strip** glows at the knob, with a chevron pointing the way to the
 *   rock's column, and a ring round the knob once it stands there.
 *
 * Drawn in the shield's own dome rather than EMBER's ring and arrows: those
 * already mean *shoot this*, in the cyan a fire button is drawn in too.
 */

/** P1's SHIELD button, and with `moment` the dome closing to the press. */
export function markButton(
  ctx: CanvasRenderingContext2D,
  f: SeatFrame,
  a: ShieldAsk,
  moment: boolean,
  time: number,
): void {
  const b = f.button;
  if (!b) return;
  const breath = 0.5 + 0.5 * Math.sin(time * 4);
  const hot = moment && inWindow(a);
  halo(ctx, b.x, b.y, b.r * (1.7 + 0.2 * breath), CY, hot ? 0.75 : 0.3 + 0.15 * breath);
  const rim = new Path2D();
  rim.arc(b.x, b.y, b.r * 1.08, 0, Math.PI * 2);
  glow(ctx, rim, hot ? RIM : CY, hot ? 3 : 1.8, 1, hot ? 1 : 0.55 + 0.25 * breath);
  if (!moment) return;
  const s = 1.15 + Math.min(4, a.beatsLeft) * 0.45;
  const dome = domePath(b.x, b.y + b.r * 0.35, b.r * 2 * s, b.r * 1.35 * s);
  glow(ctx, dome, hot ? RIM : CY, hot ? 2.6 : 1.6, 1, 0.3 + 0.7 * nearness(a));
}

/** P2's strip: a glow at the knob and a chevron the way to the rock; a ring once it is there. */
export function markStrip(
  ctx: CanvasRenderingContext2D,
  f: SeatFrame,
  a: ShieldAsk,
  time: number,
): void {
  const s = f.strip;
  if (!s) return;
  const t = f.l.tile;
  const breath = 0.5 + 0.5 * Math.sin(time * 4);
  halo(ctx, s.x, s.y, t * (1 + 0.15 * breath), CY, a.under ? 0.55 : 0.3 + 0.15 * breath);
  if (a.under) {
    const ring = new Path2D();
    ring.arc(s.x, s.y, t * 0.6, 0, Math.PI * 2);
    glow(ctx, ring, RIM, 2.2, 1, 0.9);
    return;
  }
  const dir = Math.sign(a.colX - s.x);
  const reach = Math.min(Math.abs(a.colX - s.x), t * 1.6);
  const chev = new Path2D();
  for (let i = 0; i < 3; i++) {
    const x = s.x + dir * (t * 0.75 + i * t * 0.32);
    if (Math.abs(x - s.x) > reach + t * 0.75) break;
    chev.moveTo(x - dir * t * 0.14, s.y - t * 0.22);
    chev.lineTo(x + dir * t * 0.08, s.y);
    chev.lineTo(x - dir * t * 0.14, s.y + t * 0.22);
  }
  glow(ctx, chev, CY, 2, 1, 0.55 + 0.4 * breath);
}
