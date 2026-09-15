import type { MalfunctionKind } from "@neon-spore/sim";
import type { MechanicId } from "./mechanics.js";

/**
 * **The six mechanics a wave turns on without putting a body on the field**,
 * and the whole of `reach: "wave"`: a control that has stopped answering the
 * seat that owns it.
 *
 * Lifted out of `mechanics-table.ts` the way `mechanics-rocks.ts` and
 * `mechanics-run.ts` were before it, and along the seam the `reach` field
 * already names. Every row in that table is a body or a boss the pair is
 * *shown*; a fault is a fact about the panel, and the bestiary reads better
 * without one in the middle of it.
 *
 * **One row per `Malfunction`**, and `mechanics.ts` argues that at length: they
 * are five rules, each with its own first wave and its own guide. THE CODEX is
 * the odd one and it earns the row twice over — it takes no control away at all,
 * and it is the only fault the seat it acts on is not shown. THE HANDOVER takes
 * none either and is the only one that *ends* before the wave does.
 *
 * **There were six, and `leakFault` was the one that left.** THE LEAK took away
 * a gesture rather than a control, which turned out to be the argument against
 * its being a fault at all: a fault is aimed somewhere harmless by the seat
 * that still works, and a weapon the panel never offered is nothing to aim. It
 * is a rung of the standard ladder now — STANDARD 5, whose hold fills nothing
 * (`control-sets-table.ts`) — and a panel arriving is introduced by
 * `firstOnPanel` rather than by a row here.
 *
 * `as const` rather than a type annotation, for `RUN_MECHANICS`' reason:
 * `MECHANICS` next door is `as const satisfies` and `WaveKind` is read back out
 * of it, so a spread that widened a literal would quietly change that union.
 */

/**
 * The five ids, **declared beside the rows they name** rather than in
 * `mechanics.ts`, which re-exports it. The union and the table below have to
 * agree exactly, and a fifth fault is what made that worth moving: they were in
 * two files importing each other to say so.
 */
export type WaveMechanicId =
  | "cannonFault"
  | "shieldFault"
  | "steerFault"
  | "codexFault"
  | "handoverFault";

/**
 * Which row a fault is, by kind — a table rather than a chain, and `satisfies`
 * makes a new fault a build error here instead of one that quietly reads as a
 * steer. It has earned that three times now: THE LEAK was written in the
 * simulation first and this line is where the compiler asked for the rest of
 * it, it asked again when the owner took THE LEAK back off the list, and it
 * asked a third time when THE LEECH and THE LIMPET joined.
 *
 * **Those two point at a creature's row rather than a fault's**, and that is
 * the whole of what moving them under the malfunction brush means: the body is
 * the same body and the bestiary already says what it is
 * (`creatures-cling.ts`). What changed is how it arrives, which is not a thing
 * a mechanic row describes.
 */
export const FAULT_MECHANIC = {
  cannon: "cannonFault",
  shield: "shieldFault",
  steer: "steerFault",
  codex: "codexFault",
  handover: "handoverFault",
  leech: "leech",
  limpet: "limpet",
} as const satisfies Record<MalfunctionKind, MechanicId>;

export const WAVE_MECHANICS = {
  cannonFault: {
    what: "A thing hanging from the top of the field has the gun: its beam is on the two colour lobes and on the muzzle, in the colour of the next shot, and the cannon fires by itself, up whatever column the pilot is standing in, on every beat. Both colours go dead on the navigator's panel, nothing brings them back and nothing reaches the thing holding them. So the pilot is not choosing when to shoot any more, only what the shot is pointed at — and crossing a column a shot must not go up is something they have to ask for out loud.",
    reach: "wave",
  },
  shieldFault: {
    what: "A thing hanging from the top of the field has the trigger: its beam is on GUARD and on the plate, and the dome comes up by itself, over whatever column the navigator has left it in, on every beat. The trigger goes dead on the pilot's panel and stays dead, and nothing reaches the thing holding it. Every rock the plate is standing under is warded without anybody asking — and every clasp it passes is opened without anybody asking either, whether or not the cannon is ready for the body inside.",
    reach: "wave",
  },
  steerFault: {
    what: "A thing hanging from the top of the field has the steering: its beam is on the cannon strip, and the cannon walks by itself, a column a beat, wall to wall and back, for the whole wave. The strip goes dead on the pilot's panel and stays dead, and nothing reaches the thing holding it. The trigger still works, so the navigator goes on firing from wherever the cannon happens to be standing — and the shot that lands is the one fired on the beat the cannon passes under a body, which the pilot, who can see where it is going, has to call.",
    reach: "wave",
  },
  codexFault: {
    what: "A thing hanging from the top of the field has the *key*: the air over the field travels in slow bands, and while it does, the two colours have each other's job. A bolt fired red kills what cyan kills and cyan kills what red kills — and nothing about the shot says so. The bolt that leaves the muzzle is the colour that was pressed, it sounds like that colour, and the lobe lights like that colour, so the navigator finds out by watching a body refuse a colour that should have taken it. Only the pilot can see the bands, and the key turns over every codexHoldBeats — so the pilot has to keep saying which way round it is, to a partner who is already mid-shot, and the shot that lands is the one fired on the reading that was still true when the thumb went down.",
    reach: "wave",
  },
  handoverFault: {
    what: "A thing hanging from the top of the field has both panels, and a few beats into the wave it trades them: the pilot's phone comes up in the navigator's colours with the navigator's buttons in it, and the navigator's comes up as the pilot's. Every control still works and nothing is taken away — what has moved is whose screen each one is on, the radar and the hidden reads with it. Both of them are counted down to it on the lip of the band and counted back out of it, and in between the only thing either of them can do with what they know about their own half is say it out loud to the person now holding it. It is the one fault that ends before the wave does.",
    reach: "wave",
  },
} as const;
