import {
  ANTIPHON_SHIP,
  type AntiphonState,
  antiphonIsOrgan,
  antiphonTurnMilli,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { mantleTurn, paintMantleDepth, paintPitLip } from "./antiphon-depth.js";
import { faded, paintMantle, paintPit } from "./antiphon-flesh.js";
import type { AntiphonFx } from "./antiphon-fx.js";
import { drawAntiphonGrip } from "./antiphon-grip.js";
import { drawAntiphonRailGrip, drawAntiphonVerdict } from "./antiphon-rail-grip.js";
import {
  antiphonBodyPath,
  antiphonBox,
  antiphonBudR,
  antiphonCandidateAt,
  antiphonContourPath,
  antiphonDecoyLobes,
  antiphonFade,
  antiphonGrowPhase,
  antiphonHemLobes,
  antiphonOrganCircle,
  antiphonPitSpot,
  antiphonStill,
  ORGAN_R,
  PIT_R,
  RAIL_R,
} from "./antiphon-shape.js";
import { antiphonStopper } from "./antiphon-stop.js";
import { drawAntiphonUnknown, drawAntiphonVeins } from "./antiphon-veins.js";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsAntiphonOrgan, showsAntiphonRail } from "./view-role-clocks-b.js";

/**
 * **THE ANTIPHON**: a smooth violet body hung over the top of the field
 * above row 0, the pits of the shapes already named sunk into it in the
 * order they were taken; under it, on the explainer's screen, the organ it
 * has grown standing in the middle, turned the way their thumb has turned
 * it with its grip under it, and on the chooser's every candidate on the
 * rail a third of the way down, one of them carried down its vein toward
 * the organ's place, where the unknown turns (§11.31). Organ and candidates
 * alike are flat green, a colour no control wears; the window's clock is
 * the standard slow meter and nothing here.
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the body, the pits, the veins, the organ or the unknown, the rail. Its health
 * is its silhouette: a pit a shape named, and the body goes glassy and
 * still when they are all there. Down, the body closes in on its middle and
 * fades over `antiphonOutBeats` while the pits erupt. What outlives a frame
 * — the push of a growth, the shrivel to a pit, the eruption, the blow a
 * pit deals — is `effects.boss.antiphon` (`antiphon-fx.ts`).
 *
 * **The organ is drawn on the screen shown the organ, the rail on the
 * screen shown the rail** (`view-role-clocks-b.ts`), and which seat is which
 * swaps every level. Their own ship is drawn true on the explainer's; on the
 * chooser's the ship's decoys have the wrong number of lobes, and nothing
 * says which is the organ.
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
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const fade = antiphonFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const still = antiphonStill(s);
  const grow = antiphonGrowPhase(s, cfg, beat, beatPhase);
  fx.note(s.pits);

  const shift = fx.hurt.shakeX(time, l.tile);
  stops?.aim(antiphonStopper(l, world, s, { shift, fade }));
  ctx.save();
  ctx.translate(shift, 0);
  drawBody(ctx, l, cfg, time, fade, still, fx.hurt.value);
  for (let i = 0; i < s.pits.length; i++) {
    drawPit(ctx, l, cfg, i, s.pits[i] ?? 0, time, fade);
  }
  const organShown = showsAntiphonOrgan(l.role, s);
  const railShown = showsAntiphonRail(l.role, s);
  // The veins under everything on both screens: the chooser's road, and on
  // the explainer's the knots and the bead in hand (`antiphon-veins.ts`).
  drawAntiphonVeins(ctx, l, cfg, s, grow, time, fade, railShown);
  if (organShown && s.organ !== null) {
    // The turn under a hand: the organ faces the way the thumb has turned
    // it, and never on the rail (`antiphon-grip.ts`).
    const turn = (antiphonTurnMilli(s, cfg) / 1000) * Math.PI * 2;
    const at = antiphonOrganCircle(l, cfg);
    drawContour(ctx, l, s.organ.shape, at, ORGAN_R * grow, time, fade, undefined, turn);
    drawAntiphonGrip(ctx, l, cfg, s, time, fade);
  } else if (s.organ !== null) {
    // The screen not shown the organ is shown the unknown in its place.
    drawAntiphonUnknown(ctx, l, cfg, grow, time, fade);
  }
  if (railShown) {
    let decoy = 0;
    // The carried one last, so it passes over the rest on its way down.
    const order = s.rail
      .map((_, i) => i)
      .sort((a, b) => (a === s.carried ? 1 : b === s.carried ? -1 : 0));
    const lobesOf = s.rail.map((c, i) =>
      c.shape === ANTIPHON_SHIP && !antiphonIsOrgan(s, i) ? antiphonDecoyLobes(decoy++) : undefined,
    );
    for (const i of order) {
      const c = s.rail[i];
      if (c === undefined) continue;
      const at = antiphonCandidateAt(l, cfg, s, i);
      drawContour(ctx, l, c.shape, at, RAIL_R * grow, time, fade, lobesOf[i]);
    }
    // The rings on the rail, over the candidates so each stands on its own
    // (`antiphon-rail-grip.ts`).
    drawAntiphonRailGrip(ctx, l, cfg, s, beat, time, fade);
  }
  drawAntiphonVerdict(ctx, l, cfg, fx.marks.verdicts);
  ctx.restore();
}

/**
 * The body: a mantle of membrane breathing, glassier once it is still,
 * closing in on its way out (`antiphon-flesh.ts`), bowed and turning in
 * depth (`antiphon-depth.ts`).
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
  fade: number,
  still: boolean,
  hurt: number,
): void {
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
 * An organ or a candidate: its contour, flat green with one light rim,
 * breathing — no sheen and no shading, so the outline is the whole of what
 * the eye reads (the owner, 5 October 2026: the depth made the form *too
 * hard to distinguish*).
 */
function drawContour(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  shape: number,
  at: { x: number; y: number },
  rTiles: number,
  time: number,
  fade: number,
  lobes?: number,
  turn = 0,
): void {
  if (rTiles <= 0) return;
  const r = antiphonBudR(l, rTiles, time);
  const p = antiphonContourPath(shape, at, r, time * 0.3, lobes, turn);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.organ, fade);
  ctx.fill(p);
  ctx.strokeStyle = faded(PALETTE.organRim, fade);
  ctx.lineWidth = Math.max(1.5, l.tile * CONTOUR_W);
  ctx.lineJoin = "round";
  ctx.stroke(p);
  ctx.restore();
}

/** The rim round an organ or a candidate, in tiles. */
const CONTOUR_W = 0.07;
