import { choirIsDots, choirIsFusing, type World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";
import { showsCannon } from "./view-role.js";

/**
 * **The instruction over a membrane**: a scan frame around the middle dot with
 * the gesture written under it.
 *
 * The owner asked for this in as many words — a scan box with the text "shake
 * screen" — and it is the one thing this creature genuinely cannot do without.
 * Every other body in the game is answered by something the pair can *see* on
 * their panel: a strip, a lobe, a cord hanging off the thing itself. A phone
 * being shaken is on no panel and hangs off nothing, so a pair meeting one of
 * these with no prompt would sit and watch it fall.
 *
 * **The frame is `drawTargetLock` and not a shape of its own**, which is the
 * reversal that file records the owner making: a pair learning this game was
 * being taught four different pictures for one idea, so the corner brackets
 * are now the shared word for *an instrument has picked this body out and
 * cannot tell you the rest*. That is exactly true here — the machine has found
 * a membrane and has nothing to say about which trigger answers it, because
 * none does yet.
 *
 * **Rock grey, and never an ammunition colour.** Everything else about this
 * body is drawn in the game's own word for *nothing you carry reaches this*
 * (`choir.ts`), and a prompt in red or cyan would be the one part of the
 * picture promising player 2 a shot.
 *
 * **Player 1's screen only.** The pilot is the seat that can shake the phone
 * and the seat the arrows are drawn on (`choir-arrows.ts`); an instruction on
 * the navigator's screen would be telling the wrong person to do something
 * their device will refuse (`choirArrowHeard` refuses seat 2 outright).
 */

/**
 * How far the frame reaches from the body's centre, in tiles: a little wider
 * than the membrane itself, in the one lane it stands in.
 *
 * **Around the whole thing and not around one of the two**, which is the
 * correction a first frame of this earned. A lock the size of one swelling
 * reads as an instrument that has picked *that* one out, and neither of them
 * is the answer on its own — the instruction is about the body, so the frame
 * is the body's.
 */
const FRAME_W = 0.72;
const FRAME_H = 0.66;

export function drawChoirPrompt(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  if (!showsCannon(l.role)) return;
  for (const c of world.creatures) {
    // A membrane already closing is one nobody has to do anything about: the
    // gesture worked, and an instruction still standing over it would be
    // telling the pilot to shake a thing that is halfway shut. The arrows go
    // for the same reason and by the same test (`choirOnField`).
    if (!choirIsDots(c) || choirIsFusing(c)) continue;
    const { x, y } = creatureCenter(l, c, beatPhase);
    // On the tile's own centre, which is where the pair orbits: the two bodies
    // lean about it and neither of them is the middle of anything, so a frame
    // hung off one would swing with that one alone.
    const dot = { x, y };
    const halfW = l.tile * FRAME_W;
    const halfH = l.tile * FRAME_H;
    drawTargetLock(ctx, dot.x, dot.y, halfW, halfH, PALETTE.rock, time, 0.85, c.id);
    // The word under the frame, on the field, because that is where the pilot
    // is already looking. The siren has the short form — SHAKE, one word under
    // a dial (`duty.ts`) — and this is the sentence: the dial says a job is
    // owed and this says what the job is.
    ctx.save();
    ctx.font = '700 11px "Courier New",monospace';
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.rock;
    ctx.globalAlpha = 0.55 + 0.35 * ((Math.sin(time * 4.4) + 1) / 2);
    ctx.fillText("SHAKE SCREEN", dot.x, dot.y + halfH + 18);
    ctx.restore();
    ctx.textAlign = "left";
    // One prompt, however many membranes are up: the gesture is the whole
    // field's and reaches every one of them at once (`mergeChoirs`), so a
    // second frame would be a second thing to do that is really the same one.
    return;
  }
}
