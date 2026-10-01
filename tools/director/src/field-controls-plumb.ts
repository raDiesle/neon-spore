import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE PLUMB's two stones, as two rows of the ON THE FIELD tab.
 *
 * **Both screens hang the whole bob, and each seat's thumb is taken only on
 * its own stone** — the pilot's the left, the navigator's the right
 * (`render/plumb-grip.ts`, `docs/spec/bosses.md` §11.48). Each step skews
 * the bob further than one pull reaches, so the two are always pulled
 * together. The weights were the phones tilted, with no row, until
 * 29 September 2026.
 */
const does = (side: "left" | "right") =>
  `A **pull**: a thumb on the ${side} stone, held and carried left or right. ` +
  "Each drag says how far across it has come since it went down, held to " +
  "plumbPullReachMilli either way; a pull right shrinks the left stone and " +
  "grows the right, and either tips the bob the way the thumb goes. The bob " +
  "hangs true while the step's skew and both pulls sum inside its range, and " +
  "the lit weight settles once it has hung there for the step's beats. A " +
  "lift is a pull of nought (sim/plumb-hand.ts). While a level is lit and " +
  "the seat is not yet pulling towards true, the stone wears the halo on its " +
  "seat's screen and the partner's ring and clock on the other's; a settle " +
  "or a steady greens, and a drift, a pull through the bleed or a weight " +
  "swung back reddens (render/plumb-verdicts.ts).";

export const PLUMB_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE PLUMB'S LEFT STONE",
    where: "on the left stone under the beam, on both screens, until the bob falls away",
    seat: "player 1",
    gesture: "grab and drag",
    does: does("left"),
    source: "handles.ts — plumbPullUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "plumbLevelLeft",
    sends: ["drag"],
    pose: "PLUMB · THE LEFT WEIGHT PULLED TRUE",
  },
  {
    name: "THE PLUMB'S RIGHT STONE",
    where: "on the right stone under the beam, on both screens, until the bob falls away",
    seat: "player 2",
    gesture: "grab and drag",
    does: does("right"),
    source: "handles.ts — plumbPullUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "plumbLevelRight",
    sends: ["drag"],
    pose: "PLUMB · THE LEFT WEIGHT PULLED TRUE",
  },
];
