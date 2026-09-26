import type { Command } from "@neon-spore/sim";
import type { Hold } from "./touch-hold.js";

/**
 * **`ChordHold` from several fingers** — the second gesture in the game read
 * off more than one touch at once, after the pinch (`pinch.ts`), first spent
 * by THE TRIVET's feet (§30).
 *
 * A chord is one seat's pads held down together, and what each finger sends
 * is *which pad* it is. `touch.ts` answers one finger at a time and keeps no
 * state, so it cannot count them: a press on a chord body only takes hold,
 * flagged `chord`, and says nothing, and its move and its lift say nothing
 * either. **Which pad a finger is, is the order it landed in** — the first
 * finger down on a body is pad nought, the next the lowest pad not already
 * under a finger — and that is whoever owns the pointers' business
 * (`apps/game/src/chord.ts`); what a finger on a pad *says* is this page's.
 *
 * **Why the order and not the place.** A foot's sockets are drawn a third of
 * a tile apart — two millimetres on a phone — and three strips laid across a
 * seat's half of the field would each be narrower than a thumb. Counted by
 * order, any two fingers on your own side are a chord of two, and the lit
 * sockets say how many to put down, never where.
 */

/** Whether a hold is one finger of a chord, answered by the host that counts them. */
export function chordFinger(hold: Hold): hold is Extract<Hold, { kind: "drag" }> & { chord: true } {
  return hold.kind === "drag" && hold.chord === true;
}

/** What a finger on a chord body says: pad `pad` down, or — with `on` false — lifted. */
export function chordSays(
  hold: Extract<Hold, { kind: "drag" }>,
  pad: number,
  on: boolean,
): Command {
  return { kind: "drag", target: hold.target, on, fromMilli: 0, fromYMilli: 0, id: pad };
}
