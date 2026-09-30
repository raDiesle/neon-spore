import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE DAVIT's two steers and two looses, as rows of the ON THE FIELD tab.
 *
 * A steer is THE CAPSTAN's carry: a thumb on the boom, and how far it has
 * come across swings the boom (`render/davit-grip.ts`). It was the phone
 * tilted until 30 September 2026. A loose is THE SLING's draw, reused whole,
 * on a boom the *other* seat steers: the thumb lands anywhere on the field
 * while the lit step wants this seat's loose, and the lift is judged against
 * the partner's steer (`docs/spec/bosses-choreographed.md` §35).
 */
const STEER_DOES =
  "A **carried handle**, THE CAPSTAN's: a thumb down on the boom takes it, and " +
  "how far the thumb has come across since swings it — " +
  "`davitSteerDegreesPerTile` degrees a tile, either way. The partner's draw " +
  "counts only while the boom stands on the lit column, and a steer that " +
  "leaves it costs that draw its count (`davitDrift`); a lift lets the boom " +
  "swing back toward hanging. Asked only while the step wants this seat's " +
  "steer; anywhere else on the panel is the draw's (sim/davit-hand.ts).";

const LOOSE_DOES =
  "A **draw and loose**, THE SLING's: a thumb down anywhere on the field " +
  "says the draw held, and the lift carries the swipe's side. The draw counts " +
  "its beats only while the partner's steer holds the boom on the lit column, " +
  "and **the loose lands only if the draw was held its beats, the boom is on " +
  "the target the instant it lifts, and the swipe goes toward the target's " +
  "half**; any other lift springs the draw slack, the step still lit. Asked " +
  "only while the step wants this seat's loose, so a fire step's cannon and " +
  "trigger answer underneath it (sim/davit-hand.ts).";

const SOURCE =
  "handles.ts — davitLooseUnder() under handleUnder(); the swipe's side carried on the lift by touch.ts' swiped set";

export const DAVIT_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE DAVIT'S LEFT STEER",
    where: "on the boom, on player 1's screen, while a left swing or a reland is lit",
    seat: "player 1 — the pilot steers the left swing, while the navigator draws",
    gesture: "grab and drag",
    does: STEER_DOES,
    source: "handles.ts — davitSteerUnder() under handleUnder(), before davitLooseUnder()",
    holdKind: "drag",
    dragTarget: "davitSteerLeft",
    sends: ["drag"],
    pose: "DAVIT · THE LEFT STEER CARRIED",
  },
  {
    name: "THE DAVIT'S RIGHT STEER",
    where: "on the boom, on player 2's screen, while a right swing or a reland is lit",
    seat: "player 2 — the navigator steers the right swing, while the pilot draws",
    gesture: "grab and drag",
    does: STEER_DOES,
    source: "handles.ts — davitSteerUnder() under handleUnder(), before davitLooseUnder()",
    holdKind: "drag",
    dragTarget: "davitSteerRight",
    sends: ["drag"],
    pose: "DAVIT · THE RIGHT STEER CARRIED",
  },
  {
    name: "THE DAVIT'S LEFT LOOSE",
    where: "anywhere on the field, on player 1's screen, while a right swing or a reland is lit",
    seat: "player 1 — the pilot looses on the right swing, while the navigator steers the boom",
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
    seat: "player 2 — the navigator looses on the left swing, while the pilot steers the boom",
    gesture: "grab and drag",
    does: LOOSE_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "davitLooseRight",
    sends: ["drag"],
    pose: "DAVIT · THE RIGHT LOOSE DRAWN",
  },
];
