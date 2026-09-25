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
  | "handoverFault"
  | "flipFault"
  | "darkFault";

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
  flip: "flipFault",
  dark: "darkFault",
  leech: "leech",
  limpet: "limpet",
} as const satisfies Record<MalfunctionKind, MechanicId>;

export const WAVE_MECHANICS = {
  cannonFault: {
    what: "The cannon fires by itself every beat. Player 2 cannot choose colours. Player 1 only aims. Say out loud which columns not to cross.",
    reach: "wave",
  },
  shieldFault: {
    what: "Something hanging from the top takes the shield trigger. The shield comes up every beat, wherever Player 2 left it. It opens every clasp it passes.",
    reach: "wave",
  },
  steerFault: {
    what: "The cannon walks by itself, wall to wall. Player 1 cannot steer it. Player 1 calls the beat it passes under a body, and Player 2 fires.",
    reach: "wave",
  },
  codexFault: {
    what: "Red and cyan swap jobs in slow bands. Nothing on the shot shows it. Only Player 1 sees the bands and must keep saying which way round.",
    reach: "wave",
  },
  flipFault: {
    what: "One screen shows the field mirrored left to right. The other screen says every column out loud. The mirrored one counts from the other wall.",
    reach: "wave",
  },
  darkFault: {
    what: "The field above the ship goes dark on both screens. Touch or swipe it to light it for two beats. Say what you found and where.",
    reach: "wave",
  },
  handoverFault: {
    what: "The two screens swap panels. Every control still works, on the other phone. Say what you know about your half to whoever holds it now.",
    reach: "wave",
  },
} as const;
