import type { ControlDef } from "@neon-spore/content";
import {
  mimicBoss,
  mimicPaintMode,
  type ThroatMode,
  throatBoss,
  type World,
} from "@neon-spore/sim";
import { drawActionButton, drawFireButton } from "./controls.js";
import { drawAimButton, drawSalvoButton } from "./controls-fleet.js";
import type { Circle } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * **A boss's own buttons on the band**: the control sets a fight brings
 * with it in place of the ordinary panel — THE THROAT's four colours and
 * THE FLEET's five. The next boss with a set of its own adds its branch here.
 *
 * Cut out of `band-control.ts` when THE THROAT's set took that file to 236
 * lines, along the seam it already had: the panel's own buttons there, a
 * round's in `band-control-rounds.ts`, a boss's here.
 *
 * Draws the face and answers true when the control is one of these, and
 * answers false having drawn nothing when it is not.
 */
export function drawBossFace(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  c: ControlDef,
  world: World,
  skin: SeatSkin,
): boolean {
  const { x, y, r } = circle;
  // THE THROAT's four colours, each the ordinary panel's own face for what
  // it swallows — the shield's for a rock, the maw's for a pod, the two shots
  // for their two kinds — lit while it is the mouth's colour, because which
  // one is set is the one thing a seat needs off its own two buttons.
  const mode = THROAT_LOBES[c.id];
  if (mode !== undefined) {
    // THE MIMIC's brush is set by the same four, and lit the same way.
    const lit = (throatBoss(world)?.mode ?? mimicBrushMode(world)) === mode;
    if (mode === "shield") {
      drawActionButton(ctx, x, y, r, lit, PALETTE.shield, "#08131A", "guard", skin.dead[0]);
    } else if (mode === "suck") {
      drawActionButton(ctx, x, y, r, lit, PALETTE.pod, PALETTE.podDark, "intake", skin.dead[0]);
    } else {
      ctx.save();
      if (!lit) ctx.globalAlpha = 0.45;
      drawFireButton(ctx, x, y, r, mode, skin);
      ctx.restore();
    }
    return true;
  }
  // THE FLEET's five. The arrows are one picture with a direction, so they
  // are one call rather than four branches — a fifth direction is not a thing
  // a chart has.
  const arrow = AIM_ARROWS[c.id];
  if (arrow) {
    drawAimButton(ctx, x, y, r, arrow[0], arrow[1], skin.dead[1]);
    return true;
  }
  if (c.id === "salvo") {
    drawSalvoButton(ctx, x, y, r, salvoRest(world), r > 16 ? c.label : null, skin.dead[0]);
    return true;
  }
  return false;
}

/** Which of THE THROAT's colours each of its four buttons sets. */
const THROAT_LOBES: Partial<Record<ControlDef["id"], "red" | "cyan" | "shield" | "suck">> = {
  throatRed: "red",
  throatCyan: "cyan",
  throatShield: "shield",
  throatSuck: "suck",
};

/** Which way each of player 2's four arrows points. */
const AIM_ARROWS: Partial<Record<ControlDef["id"], readonly [number, number]>> = {
  aimLeft: [-1, 0],
  aimRight: [1, 0],
  aimUp: [0, -1],
  aimDown: [0, 1],
};

/**
 * How much of the rest between two salvoes is still to run, 0..1.
 *
 * Read off the world every frame rather than eased, for the reason THE
 * WARDEN's hatch is: it is the pilot's only readout of whether the next press
 * will do anything, and a button that lied about that for a quarter of a beat
 * would lie at exactly the moment somebody is deciding to fire.
 */
function salvoRest(world: World): number {
  const boss = world.boss;
  if (boss === null || boss.kind !== "fleet") return 0;
  const rest = world.cfg.fleetSalvoRestBeats;
  if (rest <= 0) return 0;
  return Math.max(0, Math.min(1, (rest - (world.beat - boss.firedBeat)) / rest));
}

/** THE MIMIC's brush as one of the four, or null with no mimic up (`sim/mimic-hand.ts`). */
function mimicBrushMode(world: World): ThroatMode | null {
  const s = mimicBoss(world);
  return s === null ? null : mimicPaintMode(s.brush);
}
