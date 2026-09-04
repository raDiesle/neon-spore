import type { ControlDef } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { drawActionButton, drawFireButton } from "./controls.js";
import { drawAimButton, drawSalvoButton } from "./controls-fleet.js";
import { halo } from "./glow.js";
import { guardLapse } from "./guard-lapse.js";
import { drawLanceButton } from "./lance.js";
import type { Circle, Layout } from "./layout.js";
import { drawLobeGloss, drawLobeSocket } from "./lobe-shell.js";
import { PALETTE } from "./palette.js";
import { type SeatSkin, seatSkin } from "./seat-skin.js";

/**
 * One control of the band, drawn — a lobe or a strip, whichever the set says.
 *
 * Split out of `band.ts` when THE FLEET's five buttons pushed that file past
 * its 250-line limit, and along the seam that was already there: next door is
 * the *panel* — the plate, the seam, the two seats, the name and the lock —
 * and this is what one thing on it looks like. The panel grows by a seat's
 * worth of chrome and never again; this file grows by one picture every time a
 * control set is invented, and there are eleven rounds still to come.
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
): void {
  const { x, y, r } = circle;
  const skin = seatSkin(l.role);
  drawLobeSocket(ctx, x, y, r, l.dpr, skin.lip);
  drawFace(ctx, circle, c, world, armed, open, skin);
  drawLobeGloss(ctx, x, y, r, l.dpr);
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
): void {
  const { x, y, r } = circle;
  // The first two are lit for exactly as long as their window is open, so
  // player 1 can see what they are spending.
  if (c.id === "guard") {
    drawActionButton(ctx, x, y, r, armed, PALETTE.shield, "#08131A", c.label, skin.dead[0]);
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
  if (c.id === "intake") {
    drawActionButton(ctx, x, y, r, open, PALETTE.pod, PALETTE.podDark, c.label, skin.dead[0]);
    return;
  }
  // Not a `drawActionButton`: the other two are lit or not, and this one has
  // a length. See `drawLanceButton`.
  if (c.id === "lance") {
    drawLanceButton(ctx, x, y, r, world);
    return;
  }
  // THE FLEET's five. The arrows are one picture with a direction, so they
  // are one call rather than four branches — a fifth direction is not a thing
  // a chart has.
  const arrow = AIM_ARROWS[c.id];
  if (arrow) {
    drawAimButton(ctx, x, y, r, arrow[0], arrow[1], skin.dead[1]);
    return;
  }
  if (c.id === "salvo") {
    drawSalvoButton(ctx, x, y, r, salvoRest(world), r > 16 ? c.label : null, skin.dead[0]);
    return;
  }
  drawFireButton(ctx, x, y, r, c.id === "fireRed" ? "red" : "cyan", skin);
}

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
