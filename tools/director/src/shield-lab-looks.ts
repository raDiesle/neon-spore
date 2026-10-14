import { halo } from "@neon-spore/render";
import {
  CY,
  dashed,
  domePath,
  glow,
  inWindow,
  nearness,
  RIM,
  type ShieldLook,
  stringPath,
} from "./shield-lab-ink.js";
import { CUE, GHOST } from "./shield-lab-looks-b.js";

/**
 * **THE SHIELD LAB's looks** — five answers to *when is the shield wanted*,
 * the owner, 14 October 2026: *a unique visualizer when something needs to be
 * a) below … shield … or b) reflected by active shield in the moment it would
 * hit ship … logically it is similar than the "cannon" crosshair*.
 *
 * Each look has the two halves the shield is split into across the seats:
 * **`column`** on player 2's screen, who slides the dome — *stand here* — and
 * **`moment`** on player 1's, who presses SHIELD — *now*. The moment is the
 * half the owner wants once, for the first of each kind in a wave; the lab's
 * FIRST OF A KIND decides whether `moment` is called at all.
 *
 * Shield colour throughout, and drawn in the shield's own shape — a dome —
 * wherever it can be: cyan is also a fire button's colour, and a ring with
 * arrows in it is EMBER, which already means *shoot this*.
 */

/** TETHER — the owner's thread: from the rock to the dome, slack until the dome is under it. */
const TETHER: ShieldLook = {
  key: "tether",
  name: "TETHER",
  sentence:
    "a thread from the rock to the dome, slack while the dome is in the wrong column, pulled straight when it is under; on P1's screen the thread runs down to SHIELD and tightens to the moment",
  column(ctx, f, a, time) {
    const off = f.domeX - a.colX;
    const slack = a.under ? 0 : Math.min(f.l.tile * 2.2, Math.abs(off) * 0.5) * Math.sign(off || 1);
    const p = stringPath(a.x, a.y + a.r, f.domeX, f.domeY, slack, time);
    glow(ctx, p, a.under ? RIM : CY, a.under ? 2.2 : 1.4, a.under ? 1 : 0.6, a.under ? 1 : 0.7);
    halo(ctx, f.domeX, f.domeY, f.l.tile * (a.under ? 0.9 : 0.5), CY, a.under ? 0.55 : 0.25);
  },
  moment(ctx, f, a, time) {
    if (!f.button) return;
    const k = nearness(a);
    const slack = (1 - k) * f.l.tile * 1.6;
    const hot = inWindow(a);
    const p = stringPath(a.x, a.y + a.r, f.button.x, f.button.y - f.button.r, slack, time);
    glow(ctx, p, hot ? RIM : CY, 1.2 + k * 1.6, 0.5 + k * 0.5, 0.4 + k * 0.6);
  },
};

/** LANDING — where it will land, drawn as the dome it wants; a dome closing in on it for the moment. */
const LANDING: ShieldLook = {
  key: "landing",
  name: "LANDING",
  sentence:
    "a dashed dome on the hull under the rock, where the shield must stand, and on P1's screen a dome that closes in on it and lands on the moment",
  column(ctx, f, a) {
    const t = f.l.tile;
    const p = domePath(a.colX, f.l.hullY, t * 1.05, t * 0.62);
    if (a.under) {
      glow(ctx, p, RIM, 2.4, 1, 0.9);
      return;
    }
    dashed(ctx, p, CY, 1.8, 0.85);
    // An arrow along the hull from the dome to the place.
    const dir = Math.sign(a.colX - f.domeX);
    const y = f.l.hullY + t * 0.18;
    const x0 = f.domeX + dir * t * 0.6;
    const x1 = a.colX - dir * t * 0.6;
    if ((x1 - x0) * dir <= 0) return;
    const arrow = new Path2D();
    arrow.moveTo(x0, y);
    arrow.lineTo(x1, y);
    arrow.moveTo(x1 - dir * t * 0.22, y - t * 0.16);
    arrow.lineTo(x1, y);
    arrow.lineTo(x1 - dir * t * 0.22, y + t * 0.16);
    glow(ctx, arrow, CY, 1.6, 0.8, 0.8);
  },
  moment(ctx, f, a) {
    const t = f.l.tile;
    const s = 1 + Math.min(4, a.beatsLeft) * 0.55;
    const p = domePath(a.colX, f.l.hullY, t * 1.05 * s, t * 0.62 * s);
    const hot = inWindow(a);
    glow(ctx, p, hot ? RIM : CY, hot ? 3 : 1.6, 1, 0.35 + nearness(a) * 0.65);
    if (hot) halo(ctx, a.colX, f.domeY, t * 1.1, CY, 0.5);
  },
};

/** LANE — the rock's column lit down to the hull in the shield's colour: the gunsight turned over. */
const LANE: ShieldLook = {
  key: "lane",
  name: "LANE",
  sentence:
    "the rock's own column lit from the rock down to the hull, rails and down-chevrons, solid once the dome stands in it; on P1's screen a mark on every beat still to fall, counted down to the dome",
  column(ctx, f, a) {
    const t = f.l.tile;
    const top = a.y + a.r;
    const bottom = f.domeY;
    if (bottom <= top) return;
    const half = t * 0.48;
    ctx.save();
    ctx.globalAlpha = a.under ? 0.22 : 0.1;
    ctx.fillStyle = CY;
    ctx.fillRect(a.colX - half, top, half * 2, bottom - top);
    ctx.restore();
    const rails = new Path2D();
    rails.moveTo(a.colX - half, top);
    rails.lineTo(a.colX - half, bottom);
    rails.moveTo(a.colX + half, top);
    rails.lineTo(a.colX + half, bottom);
    glow(ctx, rails, CY, a.under ? 1.6 : 1, 0.6, a.under ? 0.9 : 0.5);
    const chev = new Path2D();
    for (let y = bottom - t * 0.5; y > top + t * 0.3; y -= t) {
      chev.moveTo(a.colX - t * 0.2, y - t * 0.12);
      chev.lineTo(a.colX, y + t * 0.08);
      chev.lineTo(a.colX + t * 0.2, y - t * 0.12);
    }
    glow(ctx, chev, a.under ? RIM : CY, 1.4, 0.7, a.under ? 0.9 : 0.55);
  },
  moment(ctx, f, a) {
    const t = f.l.tile;
    const n = Math.ceil(a.beatsLeft);
    const step = (f.domeY - (a.y + a.r)) / Math.max(1e-3, a.beatsLeft);
    ctx.save();
    ctx.font = `700 ${Math.round(t * 0.42)}px system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let i = 1; i <= Math.min(4, n); i++) {
      const y = a.y + a.r + step * (i - (n - a.beatsLeft));
      if (y > f.domeY + 1) continue;
      const last = i === n;
      const bar = new Path2D();
      bar.moveTo(a.colX - t * 0.42, y);
      bar.lineTo(a.colX + t * 0.42, y);
      glow(ctx, bar, last ? RIM : CY, last ? 2.4 : 1.4, 1, 0.55 + (last ? 0.45 : 0));
      ctx.fillStyle = last ? RIM : CY;
      ctx.fillText(String(n - i + 1), a.colX + t * 0.55, y);
    }
    ctx.restore();
    if (inWindow(a)) halo(ctx, a.colX, f.domeY, t * 1.2, CY, 0.55);
  },
};

export const SHIELD_LOOKS: readonly ShieldLook[] = [TETHER, LANDING, LANE, GHOST, CUE];

export function shieldLook(key: string): ShieldLook {
  return SHIELD_LOOKS.find((l) => l.key === key) ?? TETHER;
}
