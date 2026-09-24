import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE SPOOL's brake, as one row of the ON THE FIELD tab.
 *
 * **One row where every other boss on this tab has two**, and that is the
 * boss: there is a single control in the fight, one seat has it, and the other
 * seat's whole half is a reading and a sentence. THE GIMBAL's pair are
 * offered together and THE HASP's are worked at once; this one is never
 * offered to player 2 at all (`sim/spool-hand.ts`).
 *
 * **It is the only row here whose value is the whole of it.** Every other drag
 * on the field is answered by where it ends or by the edge it crosses — a
 * stroke, a pull, a turn. A brake is a **level**: nothing about taking hold of
 * it is ever judged, and what it is worth is the rate the line pays out at for
 * the depth it is sitting at, read a beat at a time (`docs/spec/bosses.md`
 * §11.36, `sim/spool.ts`).
 */
export const SPOOL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE SPOOL'S BRAKE",
    where:
      "on the knob of the rail down the near side of the spool slung across the top of the field, on player 1's screen, from the beat it swings in until the casing goes slack",
    seat: "player 1 — the brake is the pilot's, fixed by the target's name and never negotiated, and his screen is the only one it is drawn on",
    gesture: "grab and drag",
    does:
      "Carries the lever **down** its travel, and the line pays out slower " +
      "the deeper it sits: fully shallow is the fast end, fully deep the " +
      "slow one, straight down the reach. **Letting go is not neutral** — a " +
      "brake with no hand on it reads as fully shallow and runs the line out " +
      "fastest of all, which is what makes the one gesture in this fight a " +
      "hold rather than a press. Nothing about the grab itself is ever " +
      "judged: a brake is a level and not an edge, so the depth is simply " +
      "carried until the thumb moves it, and what it is worth is decided a " +
      "beat at a time against a zone he is never shown (sim/spool-step.ts). " +
      "He is drawn his own grip alone; how much line should be out by now is " +
      "on her screen, and the sentence between them is the fight. No desk " +
      "key: the travel is a carry, not a turn.",
    source: "handles.ts — spoolBrakeUnder() under handleUnder(); spool-grip.ts on the move",
    holdKind: "drag",
    dragTarget: "spoolBrake",
    sends: ["drag"],
    pose: "SPOOL · THE BRAKE UNDER A THUMB",
  },
];
