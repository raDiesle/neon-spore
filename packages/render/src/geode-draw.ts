import { type GeodeState, geodeVerdict, type World } from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { coreStopper, type Foot, lowestFoot, outlineFoot } from "./core-stop.js";
import { smoothstep } from "./ease.js";
import type { GeodeFx } from "./geode-fx.js";
import {
  drawCutPiece,
  drawHusk,
  drawWholePiece,
  type Flight,
  type PieceLook,
} from "./geode-piece.js";
import {
  type GeodePose,
  geodeHusks,
  geodePieces,
  geodePose,
  geodeSince,
  type PieceBox,
} from "./geode-place.js";
import { piecePoints } from "./geode-shape.js";
import type { Layout } from "./layout.js";
import { showsGeodeCrack, showsGeodeCrystal } from "./view-role-clocks-c.js";

/**
 * THE GEODE, drawn: a slab of faceted stone as wide as the field, sinking on
 * the ship, cut by the lance into pieces a level at a time until its crystal
 * heart is out.
 *
 * **Crossed, by seat** (`view-role-clocks-c.ts`): the navigator is shown each
 * crack's white-hot line, which says *where*; the pilot is shown the crystal
 * glowing through each piece's pores, which says *which colour*. Neither can
 * burn a crack alone. A cut piece is the same on both screens: its colour
 * is the beam's, said already.
 *
 * **Each cut breaks a piece in two.** The halves part along the crack's
 * jagged line and turn out about their feet, the crystal of the cut faces
 * coming round to the pair (`geode-piece.ts`). When a level's last piece is
 * cut the halves fly apart and fall away, and the next layer of the stone —
 * a little shorter, more pieces — comes up out of them. The heart is crystal
 * in its own column, the hollow rind either side.
 *
 * **Its clock is its sinking**: a level's window brings the stone down a
 * tile, trembling as it runs out (`geode-place.ts`). Run out, it lands on the
 * hull, and that is its blow (`boss-strike-look.ts`).
 *
 * **A bolt stops on it** at the foot of whatever stands over the column, as
 * `body` — a bolt only chips stone (`sim/geode-shot.ts`).
 */

/** Beats the halves of a level's last cut take to fly off: the split, or longer for the heart. */
const HEART_FLY_BEATS = 3;

export function drawGeode(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GeodeState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: GeodeFx,
  stops?: BoltStops,
): void {
  const crack = showsGeodeCrack(l.role);
  const crystal = showsGeodeCrystal(l.role);
  const since = geodeSince(s, beat, beatPhase);
  const lit = s.phase === "crack" || s.phase === "struck";
  const look: PieceLook = { crack, crystal, lit, tile: l.tile, time, beatPhase };
  const feet: Foot[] = [];
  const hurt = (p: Path2D): void => drawHurt(ctx, p, fx.hurt.value);

  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  if (s.phase === "split" || s.phase === "spent") {
    if (s.phase === "split") drawEmerging(ctx, l, world, s, beat, beatPhase, since, look, feet);
    // The last level's halves, flying apart off the layer that came out of them.
    const old = s.cursor - 1;
    const p = geodePose(l, world, s, old, beat, beatPhase);
    const life = s.phase === "spent" ? HEART_FLY_BEATS : world.cfg.geodeSplitBeats;
    const fly = flown(since, life, l.tile);
    // Gone once faded: nothing drawn at nothing's alpha.
    const pieces = fly.alpha > 0 ? geodePieces(l, world, s, old, p, s.cutTick) : [];
    for (const h of geodeHusks(pieces, p, l.tile)) drawHusk(ctx, h, l.tile, { ...fly, open: 0 });
    for (const b of pieces) drawCutPiece(ctx, b, look, fly);
  } else {
    const level = s.phase === "enter" ? 0 : s.cursor;
    const p = geodePose(l, world, s, level, beat, beatPhase);
    ctx.save();
    // Looming in: grown out of its own middle and faded up.
    ctx.globalAlpha *= p.come;
    const grow = 0.6 + 0.4 * p.come;
    ctx.translate(p.c.x, p.c.y);
    ctx.scale(grow, grow);
    ctx.translate(-p.c.x, -p.c.y);
    // The tremble of a window running out.
    ctx.translate(Math.sin(time * 38) * l.tile * 0.05 * smoothstep((p.late - 0.7) / 0.3), 0);
    const pieces = geodePieces(l, world, s, level, p, s.phase === "enter" ? [] : s.cutTick);
    for (const h of geodeHusks(pieces, p, l.tile)) {
      hurt(drawHusk(ctx, h, l.tile, HELD));
      feet.push(outlineFoot(piecePoints(h, l.tile)));
    }
    for (const b of pieces) {
      if (b.cut < 0) {
        hurt(drawWholePiece(ctx, b, look));
        feet.push(outlineFoot(piecePoints(b, l.tile, b.heart)));
      } else {
        drawCutPiece(ctx, b, look, held(b, l.tile));
        feet.push(bandFoot(b));
      }
    }
    ctx.restore();
  }
  ctx.restore();
  fx.draw(ctx, l);
  const verdict = (w: World, col: number, color: Parameters<typeof geodeVerdict>[2]) =>
    geodeVerdict(w, col, color, false);
  // Coming in, it is not yet there to meet a bolt (`geodeVerdict`), so it stops none.
  const there = feet.length > 0 && s.phase !== "enter";
  stops?.aim(there ? coreStopper(world, verdict, 0, lowestFoot(feet)) : null);
}

/** Standing still: nothing parted, nothing faded. */
const HELD: Flight = { open: 0, rot: 0, drop: 0, alpha: 1, turn: 0 };

/** A piece cut while the rest of its level is still whole: its halves eased a little apart. */
function held(b: PieceBox, tile: number): Flight {
  const k = smoothstep(b.cut * 2);
  return { open: k * tile * 0.22, rot: k * 0.05, drop: 0, alpha: 1, turn: k };
}

/** The halves of a level's last cut, `u` beats into flying apart over `life`. */
function flown(u: number, life: number, tile: number): Flight {
  return {
    open: tile * (0.22 + u * 1.1 + u * u * 0.4),
    rot: 0.05 + u * 0.3,
    drop: u * u * tile * 0.6,
    alpha: 1 - smoothstep(u / life),
    turn: 1,
  };
}

/** A cut piece's foot, for a bolt: the bottom of its box across it. */
function bandFoot(b: PieceBox): Foot {
  return (x) => (x >= b.x0 && x <= b.x1 ? b.y1 : null);
}

/** The next layer coming up out of the halves of the last: growing to its size, the stone behind them. */
function drawEmerging(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GeodeState,
  beat: number,
  beatPhase: number,
  since: number,
  look: PieceLook,
  feet: Foot[],
): void {
  const p: GeodePose = geodePose(l, world, s, s.cursor, beat, beatPhase);
  const k = smoothstep(since / 1.5);
  const grow = 0.85 + 0.15 * k;
  ctx.save();
  ctx.globalAlpha *= 0.2 + 0.8 * k;
  ctx.translate(p.c.x, p.c.y);
  ctx.scale(grow, grow);
  ctx.translate(-p.c.x, -p.c.y);
  const pieces = geodePieces(l, world, s, s.cursor, p, []);
  for (const h of geodeHusks(pieces, p, l.tile)) {
    drawHusk(ctx, h, l.tile, HELD);
    feet.push(outlineFoot(piecePoints(h, l.tile)));
  }
  for (const b of pieces) {
    drawWholePiece(ctx, b, look);
    feet.push(outlineFoot(piecePoints(b, l.tile, b.heart)));
  }
  ctx.restore();
}
