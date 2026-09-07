import { livingPath, livingSilhouette } from "@neon-spore/content";
import { type Color, livingKindForColor } from "@neon-spore/sim";
import { bakedCache } from "./baked.js";
import { drawDetails } from "./creature-detail.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { lobeBlob, paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import { P1_SKIN, type SeatSkin } from "./seat-skin.js";

/**
 * The band's controls, drawn at whatever size is asked for.
 *
 * Their own file because they are drawn in two places now: on the band itself,
 * where a thumb presses them, and in THE MIRROR's sequence, where the pair has
 * to recognise one at a glance. Those two pictures have to be the *same*
 * picture — a sequence that invents its own vocabulary for a control makes the
 * player translate before they can act, which is the one thing a boss about
 * memory under a clock cannot afford.
 *
 * **None of them is a circle.** Every body of every button is `lobe-shell.ts`'s
 * one contour, which is the same kind of shape as everything else on screen —
 * a closed contour with lobes, not an arc.
 *
 * **The body a button is made of is the seat's**, and what is drawn on its face
 * is not. An unlit control is the panel's own flesh — violet on player one's
 * screen, gold on player two's — because it is a swelling of the chamber it
 * stands in. The ammunition colours, the shield's cyan and the maw's amber are
 * the same on both screens, because they say *which control* rather than
 * *whose ship* (`seat-skin.ts`).
 */

/**
 * The silhouette inside a fire button, kept rather than rebuilt.
 *
 * Every argument is a constant of the colour — the shape comes from
 * `livingSilhouette(livingKindForColor(color))` and the path is drawn at the
 * origin, scaled by the transform — so the string and the `Path2D` were the
 * same two objects rebuilt twice a frame on player 2's seat, for as long as
 * the game has run. Keyed on the colour, of which there are two.
 */
const FIRE_BLOBS = bakedCache<Color, Path2D>();

function fireBlob(color: Color, shape: ReturnType<typeof livingSilhouette>): Path2D {
  const held = FIRE_BLOBS.get(color);
  if (held !== undefined) return held;
  const made = new Path2D(livingPath(shape, 0));
  FIRE_BLOBS.set(color, made);
  return made;
}

/**
 * One of player 2's fire buttons: the creature that colour resonates, drawn the
 * way the field draws it, standing on a lobe of the panel's own flesh.
 *
 * The silhouette is the point — the button shows what the colour is *for* —
 * and the owner rebuilt this button around exactly that, in three corrections
 * at once: *remove crosshairs*, *the shape of bulb and slick is in the middle
 * with original appearance, not like now black*, and *around the enemy shape
 * in the circle we need another colour, otherwise it is the same as the enemy*.
 *
 * All three are one change. The old button was the ammunition colour filled
 * edge to edge with the creature punched out of it in near-black, which is a
 * *stencil* of a creature and not the creature: on the field that same body is
 * a dark contour lit by a bright rim of its own colour, and nothing about the
 * flat silhouette said so. Drawing it properly needs the light to have
 * somewhere to fall, so the body under it cannot also be that colour — hence
 * the third correction, and hence `skin.face`, which is the chamber's own
 * flesh raised into a button. The crosshair had to go with them: it was an
 * instrument laid over a stencil, and over a lit body it is a cage.
 *
 * Every appearance below is the field's, called rather than copied —
 * `livingKindForColor` for which creature answers this colour,
 * `livingSilhouette` for its contour, `drawDetails` for what is inside it. A
 * second spelling of any of the three is a button that drifts off the body it
 * is about (`living-draw.ts`).
 */
export function drawFireButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: Color,
  skin: SeatSkin = P1_SKIN,
  /**
   * How full the cannon lobe is under this thumb, 0..1 — the hold that ends in
   * a lance (`lance.ts`). Nought is a button nobody is resting on, which is
   * every frame of every wave until somebody stops tapping and starts holding.
   */
  fill = 0,
): void {
  const hex = color === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const dark = color === "red" ? PALETTE.redDark : PALETTE.cyanDark;
  // The button wears the creature its ammunition answers — through the
  // one mapping that owns it, never a second copy of the pairing.
  const kind = livingKindForColor(color);
  const shape = livingSilhouette(kind);

  // The colour still reaches the eye from outside the button: the halo round
  // it and the line round its contour are what say red or cyan at a glance,
  // now that the face is not spending itself on saying it.
  halo(ctx, x, y, r * 1.6, hex, 0.42);
  ctx.fillStyle = skin.face;
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline + 0.4;
  paintLobe(ctx, x, y, r, "both");

  const s = (r * 0.6) / Math.max(shape.rx, shape.ry);
  const blob = fireBlob(color, shape);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = dark;
  ctx.fill(blob);
  // The pen is scaled by the transform, so the width is divided back out —
  // the same arithmetic `drawLiving` does around its own body.
  strokeGlow(ctx, blob, hex, Math.max(1, r * 0.09) / s, 1);
  drawDetails(ctx, kind === "bulb", shape.rx, shape.ry, rim);
  ctx.restore();

  if (fill <= 0) return;
  // The fill, closing clockwise from the top: a hold has a length and a tap
  // does not, so the one thing this must not read as is a button that is simply
  // lit. It is the ammunition's own colour going white as it closes, for the
  // reason the beam in the column does — that is what the light is about to do
  // to the whole screen (`lance-flash.ts`).
  //
  // **It is the button's own contour, lit part of the way round**, and not a
  // ring laid over it: an arc is a drawn edge round a grown one, and the owner
  // has corrected that shape twice — a mark on a body is cut from that body
  // (`lobe-shell.ts`). So the whole blob is stroked inside a wedge clipped to
  // how full the lobe is, which lights exactly the fraction that has filled and
  // leaves the rest of the contour dark.
  const width = Math.max(2, r * 0.16);
  const lit = mixHex(hex, "#FFFFFF", 0.3 + 0.7 * fill);
  halo(ctx, x, y, r * (1.7 + 0.9 * fill), lit, 0.25 + 0.5 * fill);
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r * 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill);
  ctx.closePath();
  ctx.clip();
  ctx.strokeStyle = lit;
  ctx.lineWidth = width;
  ctx.stroke(lobeBlob(Math.round(r - width * 0.4)));
  ctx.restore();
}

/** Which of player 1's two actions a button is — the ward, or the throat. */
export type ActionKind = "guard" | "intake" | "reach";

/**
 * What is drawn on the face of one of player 1's action buttons, once the body
 * under it has been painted.
 *
 * `label` is the control's own word and is `null` when the button is too small
 * to carry text, which is what happens in a sequence glyph; `kind` says which
 * control it is, for a face that draws the thing rather than naming it.
 */
export type ActionFace = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  kind: ActionKind,
  label: string | null,
) => void;

/**
 * The face, as a record rather than as a branch in the function below.
 *
 * A button that said its name in a word was the first answer and is still the
 * shipped one; a button that shows the ship doing the thing is the obvious
 * second, and the only way to choose between them is to see both at the size a
 * thumb actually meets them. So the drawing is reachable — `variant.ts`'s
 * arrangement, and `STRAND_LOOK`'s exactly (`strand-bead.ts`) — and this
 * record is what a candidate in `tools/versus/` patches for the length of one
 * frame. Nothing about what the game draws depends on the indirection.
 */
export interface ActionLook {
  face: ActionFace;
}

/** The shipped face: the control's own word, in the ink the state gives it. */
const drawActionWord: ActionFace = (ctx, x, y, _r, ink, _kind, label) => {
  if (label === null) return;
  ctx.fillStyle = ink;
  ctx.fillText(label, x, y + 3);
};

export const ACTION_LOOK: ActionLook = { face: drawActionWord };

/**
 * One of the panel's action buttons — the trigger, the maw, or THE CLAW's arm.
 * The same button, different colour and face.
 *
 * The third arrived with a panel that moves the maw to the *other* seat, which
 * is why this takes a colour rather than deciding one from the kind: whose
 * thumb a button is under is a fact about the control set, and this function
 * has never known one.
 *
 * `dead` is what it is made of while it is out: the panel's own flesh, so an
 * unlit button reads as a swelling of the chamber rather than a plate on it.
 */
export function drawActionButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  lit: boolean,
  hex: string,
  litText: string,
  kind: ActionKind,
  label: string | null,
  dead: string = P1_SKIN.dead[0],
): void {
  // The glow goes down first, the way every other lit button in this file
  // lays one — under the body rather than over the outline.
  if (lit) halo(ctx, x, y, r * 1.8, hex, 0.5);
  ctx.fillStyle = lit ? hex : dead;
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  paintLobe(ctx, x, y, r, "both");
  ACTION_LOOK.face(ctx, x, y, r, lit ? litText : hex, kind, label);
}

/**
 * The block that marks a lobe's column on its strip. Drawn as a short length
 * of strip with the block on it, so a cannon step reads as the cannon control
 * rather than as a bare arrow: `w` is how much strip to show either side.
 */
export function drawStripMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hex: string,
  dead: string = P1_SKIN.dead[0],
): void {
  ctx.fillStyle = rgba(dead, 0.55);
  ctx.fillRect(x - w, y - h / 2, w * 2, h);
  halo(ctx, x, y, h * 1.1, hex, 0.5);
  ctx.fillStyle = hex;
  ctx.fillRect(x - w * 0.28, y - h / 2 + 2, w * 0.56, h - 4);
}
