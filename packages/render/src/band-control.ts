import type { ControlDef } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { drawActionButton, drawAimButton, drawFireButton, drawSalvoButton } from "./controls.js";
import { halo } from "./glow.js";
import { guardLapse } from "./guard-lapse.js";
import { drawLanceButton } from "./lance.js";
import { type Circle, type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

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

export function drawLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  c: ControlDef,
  world: World,
  armed: boolean,
  open: boolean,
): void {
  const { x, y, r } = circle;
  // The first two are lit for exactly as long as their window is open, so
  // player 1 can see what they are spending.
  if (c.id === "guard") {
    drawActionButton(ctx, x, y, r, armed, PALETTE.shield, "#08131A", c.label);
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
    drawActionButton(ctx, x, y, r, open, PALETTE.pod, PALETTE.podDark, c.label);
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
    drawAimButton(ctx, x, y, r, arrow[0], arrow[1]);
    return;
  }
  if (c.id === "salvo") {
    drawSalvoButton(ctx, x, y, r, salvoRest(world), r > 16 ? c.label : null);
    return;
  }
  drawFireButton(ctx, x, y, r, c.id === "fireRed" ? "red" : "cyan");
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

export function drawStripFor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: ControlDef,
): void {
  const cannon = c.id === "cannon";
  const s = cannon ? l.cannonStrip : l.shieldStrip;
  strip(
    ctx,
    l,
    s.y,
    s.height,
    cannon ? world.cannonCol : world.shieldCol,
    cannon ? PALETTE.hull : PALETTE.shield,
    c.label,
  );
}

function strip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  h: number,
  col: number,
  hex: string,
  label: string,
): void {
  ctx.fillStyle = hex;
  ctx.fillText(label, l.width / 2, y - h / 2 - 4);
  ctx.fillStyle = "rgba(36,27,79,.55)";
  ctx.fillRect(l.gridLeft, y - h / 2, l.gridWidth, h);

  for (let c = 0; c < l.cols; c++) {
    const x = tileCX(l, c);
    if (c === col) {
      halo(ctx, x, y, h * 1.1, hex, 0.5);
      ctx.fillStyle = hex;
      ctx.fillRect(x - l.tile * 0.4, y - h / 2 + 2, l.tile * 0.8, h - 4);
    } else {
      ctx.fillStyle = "#3B3163";
      ctx.fillRect(x - 1, y - h * 0.22, 2, h * 0.44);
    }
  }
}
