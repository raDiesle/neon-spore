import {
  type ControlDef,
  type ControlSet,
  controlSetForWave,
  DEFAULT_CONTROL_SET_ID,
  setControls,
} from "@neon-spore/content";
import { mirrorHoldsControls, type World } from "@neon-spore/sim";
import { drawActionButton, drawFireButton } from "./controls.js";
import { halo } from "./glow.js";
import { drawLanceButton } from "./lance.js";
import { bandLobes, type Circle, type Layout, showsCannon, showsShield, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The control band. Two strips over the full width, each snapping to column
 * centres, plus the trigger and the two colours.
 *
 * The split is the game: player 1 slides the cannon and triggers the shield,
 * player 2 slides the shield and fires. Neither can carry a defence alone, and
 * the band shows that by never giving one player both halves of anything.
 *
 * **What is on it is the wave's decision, not this file's.** The wave names a
 * control set — the whole panel, both players, and never a combination — and
 * `packages/content/src/control-sets.ts` says what is in it. This file walks
 * that list. It does not know that the lance exists, only that a set may
 * contain a lobe called `lance` and that `layout.ts` has somewhere to put it.
 * That is what makes a panel something a person can be shown and argued with
 * rather than something implied by the order of the `if`s down here.
 *
 * A screen only draws the half it owns. The test view owns both, which is why
 * the five buttons have to fit beside each other at all.
 *
 * It is drawn on the canvas rather than in the DOM because every element is
 * per-column and has to line up with the grid exactly — see docs/decisions.md.
 */
export function drawBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  armed: boolean,
  open: boolean,
): void {
  // A boss can take the controls away (`mirrorHoldsControls`). When it has,
  // the band is drawn dead and says so: a control that quietly does nothing
  // is indistinguishable from a control that is broken.
  const locked = mirrorHoldsControls(world);
  const set = controlSetForWave(world.wave);
  ctx.save();
  ctx.fillStyle = "#0E0A22";
  ctx.fillRect(0, l.bandTop, l.width, l.bandHeight);
  ctx.strokeStyle = "#33295C";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, l.bandTop);
  ctx.lineTo(l.width, l.bandTop);
  ctx.stroke();

  ctx.font = '9px "Courier New",monospace';
  ctx.textAlign = "center";

  if (showsCannon(l.role)) drawHalf(ctx, l, world, set, 1, armed, open);
  if (showsShield(l.role)) drawHalf(ctx, l, world, set, 2, armed, open);
  if (set.id !== DEFAULT_CONTROL_SET_ID) drawSetName(ctx, l, set);

  ctx.restore();
  if (locked) drawLock(ctx, l);
  ctx.textAlign = "left";
}

/**
 * One seat's half of the panel, in the order the set lists it.
 *
 * `armed` and `open` are handed down rather than read here for the reason they
 * always were: they are windows the host is counting, not world state.
 */
function drawHalf(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  player: 1 | 2,
  armed: boolean,
  open: boolean,
): void {
  for (const c of setControls(set, player)) {
    if (c.form === "strip") drawStripFor(ctx, l, world, c);
  }
  // The lobes come from `bandLobes` rather than from named fields of the
  // layout, and `touchDown` asks it the same question with the same set — so
  // there is one answer to "where is this button", not two that have to agree.
  for (const lobe of bandLobes(l, set, player)) {
    drawLobe(ctx, lobe.circle, lobe.control, world, armed, open);
  }
}

function drawLobe(
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
  drawFireButton(ctx, x, y, r, c.id === "fireRed" ? "red" : "cyan");
}

function drawStripFor(ctx: CanvasRenderingContext2D, l: Layout, world: World, c: ControlDef): void {
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

/**
 * The panel says its own name, but only when it is not the ordinary one.
 *
 * A set is a whole panel and not a button that got added, and the surest way
 * for that to read wrong is for it to read as the usual band with something
 * swapped in while nobody was looking. A named plate on the seam answers that
 * before the first beat. The default stays anonymous on purpose: a label that
 * is always there is furniture, and furniture is not read.
 *
 * Left-aligned against the edge, so it never collides with the strip captions,
 * which are centred.
 */
function drawSetName(ctx: CanvasRenderingContext2D, l: Layout, set: ControlSet): void {
  const y = l.bandTop;
  ctx.font = '700 8px "Courier New",monospace';
  ctx.textAlign = "left";
  const w = ctx.measureText(set.name).width + 12;
  ctx.fillStyle = "#0E0A22";
  ctx.fillRect(4, y - 6, w, 12);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 1;
  ctx.strokeRect(4.5, y - 5.5, Math.max(1, w - 1), 11);
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText(set.name, 10, y + 3);
  ctx.font = '9px "Courier New",monospace';
  ctx.textAlign = "center";
}

/**
 * The band, put out.
 *
 * A scrim over the finished drawing rather than an alpha set before it: every
 * button in here reaches for `halo` or `reticle`, and both of those set
 * `globalAlpha` outright. Canvas alpha does not multiply, so anything set up
 * front is simply overwritten by the first child that has an opinion — which
 * is why the strips dimmed and the buttons did not.
 */
function drawLock(ctx: CanvasRenderingContext2D, l: Layout): void {
  const y = l.bandTop + l.bandHeight / 2;
  ctx.save();
  ctx.fillStyle = "rgba(7,4,15,.78)";
  ctx.fillRect(0, l.bandTop, l.width, l.bandHeight);
  ctx.fillStyle = "rgba(7,4,15,.72)";
  ctx.fillRect(0, y - 15, l.width, 30);
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, y - 15);
  ctx.lineTo(l.width, y - 15);
  ctx.moveTo(0, y + 15);
  ctx.lineTo(l.width, y + 15);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.red;
  ctx.font = '700 12px "Courier New",monospace';
  ctx.fillText("LOCKED — WATCH", l.width / 2, y + 4);
  ctx.restore();
  ctx.textAlign = "left";
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
