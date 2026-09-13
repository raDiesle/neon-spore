import type { MalfunctionKind } from "@neon-spore/sim";
import type { WaveMechanicId } from "./mechanics.js";

/**
 * **The four mechanics a wave turns on without putting a body on the field**,
 * and the whole of `reach: "wave"`: a control that has stopped answering the
 * seat that owns it.
 *
 * Lifted out of `mechanics-table.ts` the way `mechanics-rocks.ts` and
 * `mechanics-run.ts` were before it, and along the seam the `reach` field
 * already names. Every row in that table is a body or a boss the pair is
 * *shown*; a fault is a fact about the panel, and the bestiary reads better
 * without one in the middle of it.
 *
 * **Four rows for one `Malfunction`**, and `mechanics.ts` argues that at length:
 * they are four rules, each with its own first wave and its own guide. THE CODEX
 * is the odd one and it earns the row twice over — it takes no control away at
 * all, and it is the only fault the seat it acts on is not shown.
 *
 * `as const` rather than a type annotation, for `RUN_MECHANICS`' reason:
 * `MECHANICS` next door is `as const satisfies` and `WaveKind` is read back out
 * of it, so a spread that widened a literal would quietly change that union.
 */
/**
 * Which row a fault is, by kind — a table rather than a chain now that there are
 * four of them, and `satisfies` makes a fifth fault a build error here instead of
 * one that quietly reads as a steer. Beside the rows it names rather than in
 * `mechanics.ts`, which was at its 250-line limit and is about what a *wave*
 * holds rather than about what a fault is called.
 */
export const FAULT_MECHANIC = {
  cannon: "cannonFault",
  shield: "shieldFault",
  steer: "steerFault",
  codex: "codexFault",
} as const satisfies Record<MalfunctionKind, WaveMechanicId>;

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
} as const;
