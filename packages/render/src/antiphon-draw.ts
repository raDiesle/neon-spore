import {
  ANTIPHON_SHIP,
  type AntiphonCandidate,
  type AntiphonState,
  antiphonIsOrgan,
  antiphonTurnMilli,
  type Color,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { budContact, mantleTurn, paintMantleDepth, paintPitLip } from "./antiphon-depth.js";
import { faded, paintBud, paintMantle, paintPit } from "./antiphon-flesh.js";
import type { AntiphonFx } from "./antiphon-fx.js";
import { drawAntiphonGrip } from "./antiphon-grip.js";
import { drawAntiphonRailGrip } from "./antiphon-rail-grip.js";
import {
  antiphonBodyPath,
  antiphonBox,
  antiphonCentre,
  antiphonContourPath,
  antiphonDecoyLobes,
  antiphonFade,
  antiphonGrowPhase,
  antiphonHemLobes,
  antiphonOrganCircle,
  antiphonPerch,
  antiphonPitSpot,
  antiphonStill,
  antiphonWindowLeft,
  ORGAN_R,
  PIT_R,
  RAIL_R,
} from "./antiphon-shape.js";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsAntiphonOrgan, showsAntiphonRail } from "./view-role-clocks-b.js";

/**
 * **THE ANTIPHON**: a smooth violet body hung over the top of the field
 * above row 0, the pits of the shapes already named sunk into it in the
 * order they were taken, and — on one screen — the organ it has grown
 * hanging under its middle in the body's own violet, turned the way the
 * pilot's thumb has turned it with its grip under it, on the other every
 * candidate on the rail hanging under its column in its colour, with the
 * window running out along the underside (§11.31).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the body, the pits, the organs or the rail, the window last. Its health
 * is its silhouette: a pit a shape named, and the body goes glassy and
 * still when they are all there. Down, the body closes in on its middle and
 * fades over `antiphonOutBeats` while the pits erupt. What outlives a frame
 * — the push of a growth, the shrivel to a pit, the eruption, the blow a
 * pit deals — is
 * `effects.boss.antiphon` (`antiphon-fx.ts`).
 *
 * **The organ is drawn on the screen shown the organ, the rail on the
 * screen shown the rail** (`view-role-clocks-b.ts`). On the pilot's the
 * organ hangs under the middle whatever its column, twins a gap apart by
 * index, and their own ship is drawn true; on the navigator's every
 * candidate hangs at its column, the ship's decoys with the wrong number of
 * lobes, and nothing says which is the organ.
 */
export function drawAntiphon(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: AntiphonState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: AntiphonFx,
): void {
  const cfg = world.cfg;
  const fade = antiphonFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const still = antiphonStill(s);
  const grow = antiphonGrowPhase(s, cfg, beat, beatPhase);
  fx.note(s.pits);

  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  const body = drawBody(ctx, l, cfg, time, fade, still, fx.hurt.value);
  for (let i = 0; i < s.pits.length; i++) {
    drawPit(ctx, l, cfg, i, s.pits[i] ?? 0, time, fade);
  }
  if (showsAntiphonOrgan(l.role)) {
    // The turn under a hand: the organ faces the way the thumb has turned
    // it, the twins together, and never on the rail (`antiphon-grip.ts`).
    const turn = (antiphonTurnMilli(s, cfg) / 1000) * Math.PI * 2;
    const n = s.organs.length;
    for (let i = 0; i < n; i++) {
      const o = s.organs[i];
      if (o === undefined) continue;
      const at = antiphonOrganCircle(l, cfg, i, n);
      drawContour(
        ctx,
        l,
        o,
        at,
        ORGAN_R * grow,
        body,
        PALETTE.hull,
        PALETTE.hullRim,
        time,
        fade,
        undefined,
        turn,
      );
    }
    if (n > 0) drawAntiphonGrip(ctx, l, cfg, s, time, fade);
  }
  if (showsAntiphonRail(l.role)) {
    let decoy = 0;
    for (const c of s.rail) {
      const organ = antiphonIsOrgan(s, c);
      const lobes = c.shape === ANTIPHON_SHIP && !organ ? antiphonDecoyLobes(decoy++) : undefined;
      const [hex, rim] = tone(c.color);
      const at = antiphonPerch(l, c.col);
      drawContour(ctx, l, c, at, RAIL_R * grow, body, hex, rim, time, fade, lobes);
    }
    drawWindow(ctx, l, cfg, antiphonWindowLeft(s, cfg, beat, beatPhase), fade);
    // Her rings on the rail, over the candidates so each stands on its own
    // (`antiphon-rail-grip.ts`).
    drawAntiphonRailGrip(ctx, l, cfg, s, time, fade);
  }
  ctx.restore();
}

/** A colour's fill and rim. */
function tone(color: Color): [string, string] {
  return color === "red" ? [PALETTE.red, PALETTE.redRim] : [PALETTE.cyan, PALETTE.cyanRim];
}

/**
 * The body: a mantle of membrane breathing, glassier once it is still,
 * closing in on its way out (`antiphon-flesh.ts`), bowed and turning in
 * depth (`antiphon-depth.ts`). Returns its outline, for what grows out of it.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
  fade: number,
  still: boolean,
  hurt: number,
): Path2D {
  const box = antiphonBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * fade;
  const path = antiphonBodyPath(l, cfg, fade, time, still ? 0 : 1);
  const mantle = {
    left: mid - hw,
    right: mid + hw,
    top: box.top,
    bottom: box.bottom,
    tile: l.tile,
    lobes: antiphonHemLobes(cfg),
  };
  const turn = mantleTurn(time, still);
  paintMantle(ctx, path, mantle, fade, still, turn);
  paintMantleDepth(ctx, path, mantle, turn, fade);
  drawHurt(ctx, path, hurt * fade);
  return path;
}

/** A pit: the shape that made it, sunk into the body small and dark, a wet socket. */
function drawPit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  i: number,
  shape: number,
  time: number,
  fade: number,
): void {
  const at = antiphonPitSpot(l, cfg, i);
  const r = l.tile * PIT_R * fade;
  const pit = antiphonContourPath(shape, at, r, time);
  paintPit(ctx, pit, at.y, r, l.tile, fade);
  paintPitLip(ctx, pit, at.y, r, l.tile, fade);
}

/**
 * An organ or a candidate hanging off the underside: its contour, a bud of
 * `hex` lit inside in `rim`, breathing, in a contact shadow on the `body`
 * it grows out of.
 */
function drawContour(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: AntiphonCandidate,
  at: { x: number; y: number },
  rTiles: number,
  body: Path2D,
  hex: string,
  rim: string,
  time: number,
  fade: number,
  lobes?: number,
  turn = 0,
): void {
  if (rTiles <= 0) return;
  const r = l.tile * rTiles * (1 + 0.03 * Math.sin(time * 4));
  const p = antiphonContourPath(c.shape, at, r, time * 0.3, lobes, turn);
  budContact(ctx, body, at.x, at.y, r, fade);
  paintBud(ctx, p, at.x, at.y, r, l.tile, hex, rim, fade);
}

/** The window: a thread along the underside of the body, shortening from both ends as the beats run out. */
function drawWindow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  left: number,
  fade: number,
): void {
  if (left <= 0) return;
  const c = antiphonCentre(l, cfg);
  const half = ((cfg.cols - 1) * l.tile * 0.5 + l.tile * 0.3) * left;
  const y = l.gridTop - l.tile * 0.08;
  const p = new Path2D();
  p.moveTo(c.x - half, y);
  p.lineTo(c.x + half, y);
  strokeGlow(ctx, p, faded(PALETTE.shieldRim, fade), STROKE.outline, 0.7 * fade);
}
