import { type Creature, chuteIsOpen, type SimConfig } from "@neon-spore/sim";
import { CHUTE_LOOK, type ChuteDraw } from "./chute-look.js";
import { creatureRadius } from "./creature-place.js";
import { hazed } from "./depth.js";
import { sinHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CHUTE, drawn: the thrust that throws a body out of a cracked carom, and
 * the canopy it comes back down under.
 *
 * The body itself is not drawn here. `wornKind` answers "slick" or "bulb" for
 * a chute, so `creatures.ts` draws the ordinary living body in its ordinary
 * colour with its ordinary own-motion — the same drawing it was making a
 * moment earlier through the carom's window, which is the point. What this
 * file adds is the thing attached to it, and which thing that is depends on
 * the one piece of state the creature carries.
 *
 * **Stowed: a column of fire underneath.** The body is being *thrown*, and
 * upward motion is the one thing this game has never drawn — everything else
 * on the field falls, so an ascent with nothing pushing it would read as a
 * mistake in the physics rather than as an ejection. THE DART's jet is the
 * precedent (`dart-path.ts` draws one under a body under thrust) and this is
 * the same idea pointed the other way and made larger, because a dart is
 * holding station and this is leaving.
 *
 * **Open: a canopy above it.** A dome and four shroud lines, swaying slowly on
 * the wall clock. It is drawn as a *membrane* rather than as fabric — the
 * body's own colour at low alpha with a bright rim — because everything in
 * this game that is not rock is grown rather than made, and a nylon parachute
 * over a slime would be a picture from a different game. The sway is the whole
 * of what says "drifting": the body holds its lane exactly (`chute.ts` moves
 * only its row), so the lane the pair name stays true, and the canopy is what
 * carries the drift that would otherwise have to be real.
 *
 * Nothing here is remembered between frames. `chuteIsOpen` is read off the
 * world and the sway off the wall clock spread by the body's own id, so a
 * restart cannot leave a canopy behind and two chutes never sway together
 * (`restart.test.ts` is the gate).
 *
 * **Both attachments are drawn through `CHUTE_LOOK`**, which is where their
 * code now lives: `chute-look.ts` is the one record a candidate chute patches,
 * and this file decides *which* of the two is wanted and hands the record a
 * `ChuteDraw`. The dome's own shape is in `chute-canopy.ts`, which the record
 * and `chute-cut.ts` both read: the pair must recognise a cut canopy as the one
 * they have been watching.
 */

/**
 * The canopy or the plume, over a body that is already drawn. `time` is
 * seconds, for the sway and the flame; `near` is `nearness`, so the far rows
 * dim with everything else.
 */
export function drawChute(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  beatPhase: number,
  near: number,
): void {
  const r = creatureRadius(l, c, beatPhase, cfg);
  const d: ChuteDraw = {
    ctx,
    cfg,
    r,
    glow: hazed(cfg, c.color === "cyan" ? PALETTE.cyan : PALETTE.red, near),
    rim: hazed(cfg, c.color === "cyan" ? PALETTE.cyanRim : PALETTE.redRim, near),
    ember: hazed(cfg, PALETTE.ember, near),
    near,
    time,
    phase: sinHash(c.id) * 6.3,
  };

  ctx.save();
  ctx.translate(x, y);
  // `chuteOpen` is the whole of this creature's state and the whole of this
  // branch: stowed is a body being thrown, out is a body coming down. Read
  // through `chuteIsOpen` and never off the field, for the reason `sim/chute.ts`
  // gives.
  if (chuteIsOpen(c)) CHUTE_LOOK.canopy(d);
  else CHUTE_LOOK.plume(d);
  ctx.restore();
}
