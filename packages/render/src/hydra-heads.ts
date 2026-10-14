import {
  type HydraState,
  type HydraStep,
  hydraGone,
  hydraHeadOf,
  hydraNext,
  hydraPerSide,
  hydraPieceCount,
  hydraRank,
  type SimConfig,
} from "@neon-spore/sim";
import { drawSerpentHead, drawStumpEnd, glow } from "./hydra-head.js";
import { drawNeck, type Neck, neckAngle, neckAt } from "./hydra-neck.js";
import type { HydraPose } from "./hydra-pose.js";
import {
  type At,
  CUT_ALONG,
  hydraBiteAt,
  hydraMawAt,
  hydraRoot,
  hydraSideSign,
} from "./hydra-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **THE HYDRA's biting necks and its maws** (§11.64), the first and the last
 * kind of head; the coils are `hydra-coil.ts` and the eyes `hydra-eyes.ts`.
 *
 * **A bite** swings down on its neck toward the hull on its own side, lower
 * and wider-jawed the longer the window runs; a cut going in is a gash across
 * the neck at the depth the swipe has reached, and a neck cut is a seared
 * stump, its head gone falling (`hydra-fx.ts`).
 *
 * **A maw** hangs over the column it opens on. The one open is drawn open —
 * jaws gaping and a white heat in it — on the navigator's screen alone
 * (`showsHydraMaw`); the pilot sees every maw smouldering the same and the
 * fire's colour in the body's throat instead (`hydra-body.ts`).
 */

/** What every head drawer is handed this frame. */
export interface HeadsFrame {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  cfg: SimConfig;
  s: HydraState;
  /** The level whose heads are out, or growing. */
  step: HydraStep;
  p: HydraPose;
  time: number;
  /** The beat and how far through it, as one number: an eye's lids are timed on it. */
  now: number;
  /** Whether this screen is shown which maw is open. */
  showMaw: boolean;
  /** The fire's colour, on a screen shown it, or null. */
  fire: string | null;
  /** Where piece `i`'s head is this frame, for the receipts to start from. */
  note: (i: number, at: At, angle: number) => void;
}

/** A head on the way out of the body, `grow` of the way from its root. */
export function grown(root: At, at: At, grow: number): At {
  return { x: root.x + (at.x - root.x) * grow, y: root.y + (at.y - root.y) * grow };
}

export function drawBites(f: HeadsFrame): void {
  const { l, cfg, s, step, p, time } = f;
  const n = hydraPerSide(step);
  const tile = l.tile;
  for (let i = 0; i < hydraPieceCount(step); i++) {
    const seat = i < n ? 0 : 1;
    const rank = hydraRank(step, i);
    const side = hydraSideSign(l, cfg, seat);
    const root = hydraRoot(p.c, p.rx, side, rank, n);
    const fell = hydraBiteAt(l, cfg, step, i, p.threat);
    const swing = Math.sin(time * 1.9 + rank * 1.3) * tile * 0.14;
    const at = grown(root, { x: fell.x + side * swing, y: fell.y }, p.grow);
    const neck: Neck = {
      from: root,
      to: at,
      out: { x: side * tile * (0.6 + 0.5 * rank), y: tile * 0.7 },
      into: { x: -side * tile * 0.35, y: -tile * 1.3 },
      w0: tile * 0.56,
      w1: tile * 0.36,
    };
    if (hydraGone(s, i)) {
      drawNeck(f.ctx, neck, tile, time, CUT_ALONG);
      drawStumpEnd(f.ctx, neckAt(neck, CUT_ALONG), tile * 0.2);
      continue;
    }
    const mine = hydraHeadOf(s, seat) === i && s.down[seat];
    const gash = mine ? Math.max(0, Math.min(1, s.cutMilli[seat] / cfg.hydraCutMilli)) : 0;
    drawNeck(f.ctx, neck, tile, time, 1, gash, CUT_ALONG);
    const angle = neckAngle(neck, 1);
    const gape = 0.3 + 0.45 * p.threat + 0.25 * p.pulse;
    drawSerpentHead(f.ctx, at, angle, tile * 1.35 * p.grow, gape, 0.4 + 0.6 * p.threat);
    f.note(i, at, angle);
  }
}

export function drawMaws(f: HeadsFrame): void {
  const { l, cfg, s, step, p, time } = f;
  const tile = l.tile;
  const open = s.phase === "heads" ? hydraNext(s) : -1;
  for (let i = 0; i < hydraPieceCount(step); i++) {
    const hang = hydraMawAt(l, cfg, step, i);
    const root = { x: p.c.x + (hang.x - p.c.x) * 0.6, y: p.c.y + p.ry * 0.82 };
    const at = grown(root, hang, p.grow);
    const neck: Neck = {
      from: root,
      to: at,
      out: { x: 0, y: tile * 0.6 },
      into: { x: (root.x - at.x) * 0.2, y: -tile * 0.7 },
      w0: tile * 0.52,
      w1: tile * 0.42,
    };
    if (hydraGone(s, i)) {
      drawNeck(f.ctx, neck, tile, time, 0.55);
      const end = neckAt(neck, 0.55);
      drawStumpEnd(f.ctx, end, tile * 0.2);
      smoke(f, end, i, 0.5);
      continue;
    }
    drawNeck(f.ctx, neck, tile, time);
    const angle = neckAngle(neck, 1);
    const gaping = f.showMaw && i === open;
    const gape = gaping ? 0.85 + 0.15 * p.pulse : 0.1;
    drawSerpentHead(f.ctx, at, angle, tile * 1.05 * p.grow, gape, gaping ? 1 : 0.35);
    if (gaping) {
      const mouth = {
        x: at.x + Math.cos(angle) * tile * 0.35,
        y: at.y + Math.sin(angle) * tile * 0.35,
      };
      fireIn(f, mouth);
    } else smoke(f, at, i, 1);
    f.note(i, at, angle);
  }
}

/** The fire in the open maw: a white heat, or in its colour on a screen shown both. */
function fireIn(f: HeadsFrame, mouth: At): void {
  const t = f.l.tile;
  const flick = 0.85 + 0.15 * Math.sin(f.time * 23);
  glow(f.ctx, mouth, t * 1.4 * flick, f.fire ?? PALETTE.hydraFire, 0.5);
  glow(f.ctx, mouth, t * 0.7 * flick, PALETTE.hydraFire, 0.9);
  f.ctx.fillStyle = f.fire ?? PALETTE.hydraFire;
  f.ctx.beginPath();
  f.ctx.ellipse(mouth.x, mouth.y, t * 0.2 * flick, t * 0.26 * flick, 0, 0, Math.PI * 2);
  f.ctx.fill();
}

/** A wisp of smoke off a maw shut or a stump: every live maw the same on every screen. */
function smoke(f: HeadsFrame, at: At, i: number, alpha: number): void {
  const t = f.l.tile;
  for (let j = 0; j < 3; j++) {
    const k = (f.time * 0.6 + j / 3 + i * 0.27) % 1;
    const x = at.x + Math.sin(k * 6 + i) * t * 0.15;
    const y = at.y - t * 0.2 - k * t * 1.1;
    glow(f.ctx, { x, y }, t * (0.25 + 0.35 * k), PALETTE.hydraSmoke, alpha * 0.35 * (1 - k));
  }
}
