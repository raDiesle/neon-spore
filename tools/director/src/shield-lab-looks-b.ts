import { halo } from "@neon-spore/render";
import { emblem } from "../../../packages/render/src/action-face.js";
import { drawTargetLock } from "../../../packages/render/src/target-lock.js";
import {
  CY,
  domePath,
  glow,
  inWindow,
  nearness,
  pulse,
  RIM,
  type ShieldLook,
} from "./shield-lab-ink.js";

/**
 * THE SHIELD LAB's last two looks, GHOST and CUE — the first three and the
 * list are `shield-lab-looks.ts`, split at the ceiling.
 */

/** GHOST — the owner's second half: the shield that would turn it, shown turning it. */
export const GHOST: ShieldLook = {
  key: "ghost",
  name: "GHOST",
  sentence:
    "a see-through dome standing in the rock's column; on P1's screen, the last beat before the hull, it swells as SHIELD would and a ghost of the rock bounces off it — the reflection shown before it is needed",
  column(ctx, f, a) {
    if (a.under) return;
    const t = f.l.tile;
    const p = domePath(a.colX, f.l.hullY, t * 1.05, t * 0.62);
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = CY;
    ctx.fill(p);
    ctx.restore();
    glow(ctx, p, CY, 1.4, 0.7, 0.55);
  },
  moment(ctx, f, a, time) {
    if (a.beatsLeft > 1.6) return;
    const t = f.l.tile;
    const swell = Math.min(1, (1.6 - a.beatsLeft) / 1.2);
    const p = domePath(a.colX, f.l.hullY, t * (1.05 + 0.25 * swell), t * (0.62 + 0.5 * swell));
    ctx.save();
    ctx.globalAlpha = 0.16 + 0.2 * swell;
    ctx.fillStyle = CY;
    ctx.fill(p);
    ctx.restore();
    glow(ctx, p, RIM, 1.6 + swell, 1, 0.5 + 0.5 * swell);
    // The ghost rock: off the crown and back, on a loop of its own.
    const k = (time * 1.4) % 1;
    const top = f.l.hullY - t * (0.62 + 0.5 * swell) - a.r;
    const gy = top - Math.sin(k * Math.PI) * t * 2.2;
    const ring = new Path2D();
    ring.arc(a.colX + k * t * 0.4, gy, a.r * 0.9, 0, Math.PI * 2);
    glow(ctx, ring, RIM, 1.4, 0.8, 0.6 * (1 - k * 0.5));
  },
};

/** CUE — a boss's SHIELD cue on an ordinary rock: the scanner box and the button's own face. */
export const CUE: ShieldLook = {
  key: "cue",
  name: "CUE",
  sentence:
    "what a boss's SHIELD cue already draws, on an ordinary rock: the scanner box round it and SHIELD's own face under it; on P1's screen the face fills to the moment",
  column(ctx, f, a, time) {
    const t = f.l.tile;
    drawTargetLock(ctx, a.x, a.y, a.r * 1.5, a.r * 1.5, a.under ? RIM : CY, time, 0.95);
    if (!a.under) emblem(ctx, a.x, a.y + a.r * 1.5 + t * 0.42, t * 0.32, CY, "guard");
  },
  moment(ctx, f, a) {
    const t = f.l.tile;
    const k = nearness(a);
    const r = t * (0.34 + 0.12 * pulse(a));
    halo(ctx, a.x, a.y + a.r * 1.5 + t * 0.42, r * 2.4, CY, 0.2 + 0.5 * k);
    emblem(ctx, a.x, a.y + a.r * 1.5 + t * 0.42, r, inWindow(a) ? RIM : CY, "guard");
  },
};
