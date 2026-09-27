import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE DAVIT's two looses, as rows of the ON THE FIELD tab.
 *
 * THE SLING's draw, reused whole, on a boom the *other* seat steers: the
 * thumb lands anywhere on the field while the lit step wants this seat's
 * loose, and the lift is judged against the partner's lean. The leans
 * themselves stay off this tab — `davitSteerLeft` and `davitSteerRight` are
 * the phone tilted, not a hand on the glass (`render/davit-grip.ts`,
 * `docs/spec/bosses-choreographed.md` §35).
 */
const LOOSE_DOES =
  "A **draw and loose**, THE SLING's: a thumb down anywhere on the field " +
  "says the draw held, and the lift carries the swipe's side. The draw counts " +
  "its beats only while the partner's lean holds the boom on the lit column, " +
  "and **the loose lands only if the draw was held its beats, the lean is on " +
  "the target the instant it lifts, and the swipe goes toward the lean's " +
  "half**; any other lift springs the draw slack, the step still lit. Asked " +
  "only while the step wants this seat's loose, so a fire step's cannon and " +
  "trigger answer underneath it (sim/davit-hand.ts).";

const SOURCE =
  "handles.ts — davitLooseUnder() under handleUnder(); the swipe's side carried on the lift by touch.ts' swiped set";

export const DAVIT_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE DAVIT'S LEFT LOOSE",
    where: "anywhere on the field, on player 1's screen, while a right swing or a reland is lit",
    seat: "player 1 — the pilot looses on the right swing, while the navigator leans the boom",
    gesture: "grab and drag",
    does: LOOSE_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "davitLooseLeft",
    sends: ["drag"],
    pose: "DAVIT · THE LEFT LOOSE DRAWN",
  },
  {
    name: "THE DAVIT'S RIGHT LOOSE",
    where: "anywhere on the field, on player 2's screen, while a left swing or a reland is lit",
    seat: "player 2 — the navigator looses on the left swing, while the pilot leans the boom",
    gesture: "grab and drag",
    does: LOOSE_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "davitLooseRight",
    sends: ["drag"],
    pose: "DAVIT · THE RIGHT LOOSE DRAWN",
  },
];
