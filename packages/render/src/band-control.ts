import type { ControlDef } from "@neon-spore/content";
import { controlBroken } from "@neon-spore/content";
import { faultsNow, reachOut, type World } from "@neon-spore/sim";
import { drawBossFace } from "./band-control-bosses.js";
import { drawRoundFace } from "./band-control-rounds.js";
import { drawActionButton, drawFireButton } from "./controls.js";
import { drawCrankDial } from "./crank-dial.js";
import { halo } from "./glow.js";
import { guardLapse } from "./guard-lapse.js";
import { lanceFillFor } from "./lance.js";
import type { Circle, Layout } from "./layout.js";
import { LOBE_LOOK } from "./lobe-look.js";
import { drawFaultOver } from "./malfunction-look.js";
import { PALETTE } from "./palette.js";
import { type SeatSkin, seatSkin } from "./seat-skin.js";

/**
 * One control of the band, drawn — a lobe or a strip, whichever the set says.
 *
 * Split out of `band.ts` when THE FLEET's five buttons pushed that file past
 * its 250-line limit, and along the seam that was already there: next door is
 * the *panel* — the plate, the seam, the two seats, the name and the lock —
 * and this is what one thing on it looks like. The panel grows by a seat's
 * worth of chrome and never again. A control set invented since goes in
 * `band-control-rounds.ts` for a round and `band-control-bosses.ts` for a
 * boss, which were cut out of here when THE THROAT's set brought it to 236
 * lines; this file keeps the ordinary panel's own buttons.
 *
 * Nothing here knows which set it is in or where the button is: `bandLobes`
 * places them and `touchDown` answers them, both off the same list.
 */

/**
 * One control, in the socket the panel grew for it.
 *
 * The socket and the film over the top are the same two calls whatever the
 * button is, so every control on every panel sits in the tissue the same way
 * and nothing here has to know which one it is drawing (`lobe-shell.ts`).
 */
export function drawLobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  circle: Circle,
  c: ControlDef,
  world: World,
  armed: boolean,
  open: boolean,
  time = 0,
  /** This device's own input delay, in ticks, for the one kind of face that
   * has to be drawn ahead of the simulation to be pressed on time
   * (`ViewState.leadTicks`, `pulse-button.ts`). 0 everywhere else, and 0 for
   * every panel with no chart falling at it. */
  lead = 0,
): void {
  const { x, y, r } = circle;
  const skin = seatSkin(l.role);
  LOBE_LOOK.socket({ ctx, x, y, r, dpr: l.dpr, skin });
  drawFace(ctx, circle, c, world, armed, open, skin, time, lead);
  // A control this wave's fault has taken over is drawn and then drawn broken,
  // over the top of its own face — the panel keeps every button where it was
  // and the damage is what is new (`malfunction-look.ts`). It runs for the
  // whole wave: there is no relief to buy a pause with any more.
  if (controlBroken(c.id, faultsNow(world))) {
    drawFaultOver(ctx, circle, time);
  }
  LOBE_LOOK.gloss({ ctx, x, y, r, dpr: l.dpr, skin });
}

/** The button itself, with nothing of the panel around it. */
function drawFace(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  c: ControlDef,
  world: World,
  armed: boolean,
  open: boolean,
  skin: SeatSkin,
  /** The frame clock, in seconds. One control reads it: a crank nobody is
   * turning breathes (`crank-dial.ts`). */
  time: number,
  /** This device's own input delay, in ticks, for the one kind of face that
   * has to be drawn ahead of the simulation to be pressed on time
   * (`ViewState.leadTicks`, `pulse-button.ts`). 0 everywhere else, and 0 for
   * every panel with no chart falling at it. */
  lead = 0,
): void {
  const { x, y, r } = circle;
  // The first two are lit for exactly as long as their window is open, so
  // player 1 can see what they are spending.
  if (c.id === "guard") {
    drawActionButton(ctx, x, y, r, armed, PALETTE.shield, "#08131A", "guard", skin.dead[0]);
    // A press that outlives its own window looks, on this button, exactly
    // like a press that never happened — same dark fill, same outline. Once
    // `armed` drops there is nothing left on screen saying the guard used to
    // be lit a moment ago, which is the whole defect: the button cannot tell
    // "just went out" from "was never on". This fades the same glow the
    // armed button was just showing, so the transition itself becomes the
    // signal, without moving `guardWindowMs` or touching `packages/sim`.
    const lapse = guardLapse(world);
    if (lapse > 0) halo(ctx, x, y, r * 1.8, PALETTE.shield, lapse * 0.55);
    return;
  }
  // THE CLAW's arm, lit for as long as it is out — which is the one thing
  // player 1 needs off this button, because the press is refused while it is
  // (`sim/reach.ts`). The ship's own violet: it is the ship reaching.
  if (c.id === "reach") {
    drawActionButton(ctx, x, y, r, reachOut(world), PALETTE.hull, "#150A22", "reach", skin.dead[0]);
    return;
  }
  // THE CLAW's crank, which is the one control on the band that is *turned*
  // rather than pressed — a handle standing off the middle of it, coming round
  // as the rope comes in (`crank-dial.ts`).
  if (c.id === "crank") {
    drawCrankDial(ctx, circle, world, skin, time);
    return;
  }
  // The maw, and on THE CLAW's panel it is `mawTake` on the other seat — the
  // same button, the same amber and the same window, because it is the same
  // mouth. Two ids and one drawing rather than two drawings, so a change to
  // the mouth cannot land on one seat and not the other.
  if (c.id === "intake" || c.id === "mawTake") {
    drawActionButton(ctx, x, y, r, open, PALETTE.pod, PALETTE.podDark, "intake", skin.dead[0]);
    return;
  }
  // A round's lobes and a boss's own set, each in a file of its own
  // (`band-control-rounds.ts`, `band-control-bosses.ts`).
  if (drawRoundFace(ctx, circle, c, world, skin, lead)) return;
  if (drawBossFace(ctx, circle, c, world, skin)) return;
  // The two colours, and the fill closing round whichever of them a thumb is
  // resting on: a tap is a shot, a hold is a lance, and the ring is the only
  // thing that says which one is happening (`lance.ts`).
  const shot = c.id === "fireRed" ? "red" : "cyan";
  drawFireButton(ctx, x, y, r, shot, skin, lanceFillFor(world, shot));
}
