import type { SnakeState, World } from "@neon-spore/sim";
import { drawBand } from "./band.js";
import { drawBackground } from "./field.js";
import { drawHud } from "./hud.js";
import { drawHull } from "./hull.js";
import { frame } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShipAir } from "./ship-air.js";
import { drawSnakeBody, snakeSlide } from "./snake-body.js";
import { emerge01, flick, gape } from "./snake-clock.js";
import { crash01, drawSnakeCrash } from "./snake-crash.js";
import {
  type Arena,
  drawArena,
  drawSnakeItems,
  drawSnakeRocks,
  SNAKE_HEADER,
  SNAKE_NAME_Y,
  snakeArena,
} from "./snake-draw.js";
import { clipAboveHull, drawEmergeSlime, emergeOffset } from "./snake-emerge.js";
import { drawSnakeGrips } from "./snake-grip.js";
import { drawSnakeGate, snakeIntake } from "./snake-home.js";
import { drawTally, drawTitle, drawVerdict } from "./snake-panel.js";
import { drawSnakeShot } from "./snake-shot.js";

/**
 * SNAKE over the whole stage.
 *
 * **The ship is on the screen and the panel is the band**, the way PINBALL,
 * THE PULSE and THE SCOUT were rebuilt to be and for the reasons
 * `pinball-round.ts` writes out: what a round takes away is the *field*, and
 * the hull and the band are not the field. The owner asked for this round to
 * follow (18 September 2026) — the hull shown, the four presses as lobes like
 * every other button, the box round the arena gone and the arena grown to
 * the whole of what is left. So the arena is the air above the hull, as wide
 * as the field's columns (`snake-draw.ts`); the four presses are lobes on the
 * band (`snake-button.ts`); and the body comes out of the hull's own mouth
 * rather than the hull folding into it (`snake-emerge.ts`).
 *
 * **The order is the picture.** Background, ship air, the header, the
 * arena's lines and what stands in them, then the hull — and *then* the body,
 * clipped to the sky above the ship's skin (`clipAboveHull`), so a body still
 * inside the ship is under its skin and shows only where it has climbed out
 * of the throat. The band and the HUD go over everything, and the verdict
 * over them.
 *
 * This file is the arena: what is standing in it and the body in it.
 * Everything *around* it — the name, the line under it, the clock and the
 * verdict — is `snake-panel.ts`, which is the half that says which screen
 * this is.
 */

/**
 * The ship stands still with its cannon over the middle column, which is the
 * column the body starts in; the shield stays where the wave left it. The
 * intake is the mouth the body comes out of, open for the emergence, shut
 * once the tail is clear, and open again for the way home (`snake-home.ts`).
 */
function stillPose(world: World, round: SnakeState, beatPhase: number) {
  const open = snakeIntake(world, beatPhase, round);
  return {
    at: {
      cannon: (world.cfg.cols - 1) / 2,
      shield: [{ col: world.shieldCol, weight: 1, halfMul: 1 }],
    },
    mood: { armed: 0, intake: open, chew: 0, charge: 0 },
  };
}

export function drawSnakeRound(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const boss = view.world.boss;
  if (boss === null || boss.kind !== "snake") return;
  const world = view.world;
  const skin = seatSkin(view.role);
  const { at, mood } = stillPose(world, boss, view.beatPhase);
  const f = frame(l, view.time, mood, at);

  drawBackground(ctx, l, world.wave, view.time);
  drawShipAir(ctx, l, view.time, skin);

  ctx.textAlign = "center";
  // The header hugs the arena. On a screen where the width is what limits the
  // tiles, the arena is shorter than the air it was given and stands on the
  // hull, so the name comes down to meet it rather than leaving the gap at
  // the top (`snakeArena`).
  const arena = snakeArena(l, world.cfg);
  const top = Math.max(l.playHeight * SNAKE_NAME_Y, arena.y - SNAKE_HEADER);
  drawTitle(ctx, l, view.role, boss, top);
  drawTally(ctx, l, view, boss, top + 30);
  drawArena(ctx, arena);
  drawStanding(ctx, arena, view, boss);

  drawHull(
    ctx,
    l,
    world.scars,
    view.time,
    mood,
    at,
    () => true,
    () => true,
    skin.hull,
    { x: 0, y: 0 },
    f,
  );
  ctx.save();
  clipAboveHull(ctx, l, f, mood.intake);
  const emerging = drawBody(ctx, l, arena, view, boss);
  ctx.restore();
  if (emerging !== null) drawEmergeSlime(ctx, l, arena, boss, emerging);
  // The two hands the body grows: over it and outside the clip, because a ring
  // is a thing to reach for and not a part of the animal (`snake-grip.ts`).
  // Nothing is drawn under `morph` or after a crash, which is the gate the
  // controls themselves are held to.
  drawSnakeGrips(ctx, l, world.cfg, boss, world.tick, view.time);
  drawBand(ctx, l, world, false, false, view.time, view.controls);
  drawHud(ctx, l, view);
  ctx.textAlign = "center";
  // The verdict stands through `spent` too: the round is over and holding
  // its own picture until the next wave arrives (`sim/wave-end.ts`).
  if (boss.phase === "verdict" || boss.phase === "spent") drawVerdict(ctx, l, boss);
  ctx.textAlign = "left";
}

/**
 * What is standing in the arena before the body arrives: the meteors, the
 * enemies and the points, on both screens. Under the hull, because nothing of
 * it is ever inside the ship.
 */
function drawStanding(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  view: ViewState,
  round: SnakeState,
): void {
  const pulse = Math.abs(0.5 - view.beatPhase) * 2;
  drawSnakeRocks(ctx, arena, round);
  drawSnakeItems(ctx, arena, round, pulse);
  drawSnakeGate(ctx, arena, view.world, round, pulse);
}

/**
 * The body, and the shot that has just been taken. Over the hull, inside
 * `clipAboveHull`.
 *
 * While the body is emerging it is drawn on its resting tiles and translated
 * down into the ship by however much of it is still inside; the clip keeps
 * that part under the skin. What comes back is that offset, for the slime to
 * be drawn over the hull's lip, or null once the body is out.
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  arena: Arena,
  view: ViewState,
  round: SnakeState,
): { dx: number; dy: number; rise: number } | null {
  const t = emerge01(view.world, view.beatPhase, round);
  // The bump after a crash. While it runs the body is drawn folding up
  // against what stopped it, in place of itself; once it is spent the body
  // is drawn as ever, standing where it stopped, for as long as the field
  // holds (`snake-crash.ts`).
  const crash = crash01(round, view.world.tick);
  if (crash !== null) {
    drawSnakeCrash(ctx, arena, round, crash);
    return null;
  }
  const at = t < 1 ? emergeOffset(l, arena, round, t) : null;
  const slide = snakeSlide(view.world.cfg, round, view.world.tick);
  ctx.save();
  if (at !== null) ctx.translate(at.dx, at.dy);
  drawSnakeBody(
    ctx,
    arena,
    round,
    slide,
    gape(view.world.cfg, view.world.tick, round),
    flick(view.world.tick),
  );
  ctx.restore();
  // One beat of afterglow, and no state kept for it: the world says which beat
  // the shot left on, so the fade is that number against this one.
  const since = view.world.beat - round.shotBeat + view.beatPhase;
  if (since < 1.2) {
    drawSnakeShot(ctx, arena, round, 1 - since / 1.2, slide);
  }
  return at;
}
