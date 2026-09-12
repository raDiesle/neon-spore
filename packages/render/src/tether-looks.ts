import { cord, grommet } from "./tether-cord.js";
import { STROKE_LOOK, type TetherLook } from "./tether-look.js";
import { sinew, socket } from "./tether-sinew.js";
import { seizing, twist } from "./tether-twist.js";

/**
 * THE FOUR THINGS A ROPE CAN BE, and the one the field draws.
 *
 * `creature:tether` went to VERSUS with three answers to the shipped stroke,
 * and on 12 September 2026 the owner kept all of them: *I like all the
 * alternatives; I will need them for special pull mechanics later on —
 * document it all to be used later on, as real examples, on the
 * documentation's Controls → On the Field; the default is TWIST.* So none of
 * the four is thrown away. TWIST is what THE WARDEN's rope is drawn as;
 * STROKE, CORD and SINEW are here, named, drawn on the director's ON THE FIELD
 * page under THE WARDEN'S TETHER as the real thing rather than a description,
 * and waiting for the mechanic that wants a rope that reads differently.
 *
 * **How a later mechanic switches one on.** `TETHER_LOOK` is the live record
 * `tether.ts` draws every rope from, and `useTetherLook` writes one of these
 * four into it. That is the whole switch — the same move a VERSUS patch makes
 * for the length of one frame, made for good. A rope per *body* would take one
 * more step: `TetherDraw` would carry the look's name, read off the creature,
 * and `drawTether` would ask this table instead of the record. Nothing about
 * that is built, and nothing here stops it.
 *
 * The rule that binds every one of them stands (`tether-look.ts`): the rope
 * is its own gauge, so whatever a look draws changes continuously with the
 * pull, because the seat not holding it reads the tension off the line alone.
 */
export type TetherLookName = "stroke" | "cord" | "sinew" | "twist";

export const TETHER_LOOKS: Readonly<Record<TetherLookName, TetherLook>> = {
  /** One glowing stroke, thinning and brightening as it is pulled. */
  stroke: STROKE_LOOK,
  /** A round cord: a cool shadow its full width, the body colour narrower
   * over it and a highlight along the key side, hardening as it is pulled;
   * it leaves the eye through a grommet. */
  cord: { rope: cord, root: grommet },
  /** A tendon of the boss's own flesh: a translucent sheath, thick at the
   * eye and tapering to the hand, over a bright core with pulses running up
   * it while held; it leaves a puckered socket that draws in with the pull. */
  sinew: { rope: sinew, root: socket },
  /** Two strands wound about the sag, bright in front and dim behind, the
   * lay open and crawling when slack and winding tight as it is pulled;
   * bound at the eye by a seizing that draws in. */
  twist: { rope: twist, root: seizing },
};

/** What a rope reads as when nothing has said otherwise. The owner's pick. */
export const DEFAULT_TETHER_LOOK: TetherLookName = "twist";

/**
 * The live record. `tether.ts` reads its fields on every draw, so writing a
 * look into it changes every rope on the next frame — which is why it is a
 * record with fields and not a constant (`docs/versus.md`).
 */
export const TETHER_LOOK: TetherLook = { ...TETHER_LOOKS[DEFAULT_TETHER_LOOK] };

/** Put one of the four on every rope, from the next frame. */
export function useTetherLook(name: TetherLookName): void {
  const look = TETHER_LOOKS[name];
  TETHER_LOOK.rope = look.rope;
  TETHER_LOOK.root = look.root;
}
