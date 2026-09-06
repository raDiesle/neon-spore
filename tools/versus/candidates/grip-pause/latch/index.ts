import * as grip from "../../../../../packages/render/src/grip.js";
import { patch, type Variant } from "../../../variant.js";
import { latch } from "./paint.js";

/**
 * `grip:ring-pause` / `latch` — the held ring stops turning while the body
 * cannot be carried.
 *
 * The slot asks what the field says about THE PUSH's beat of quiet. A hand that
 * has just carried a body a column cannot carry it again until a beat has
 * passed (`sim/grip-push.ts`), and today nothing says so: the ring turns at the
 * same rate either way, so a player who pulls again in that beat gets no answer
 * at all. A control that quietly does nothing is indistinguishable from one
 * that is broken, which is the failure `drawLock` was written to avoid one
 * mechanic over.
 *
 * What ships is the left-hand side and it is a real answer, not an omission:
 * the pause is one beat, the body is visibly moving under the finger, and a
 * picture that changed twice a second on every held rock is a picture with a
 * flicker in it. The pair may simply learn the rhythm.
 *
 * LATCH is the other answer. It adds nothing — same four arcs, same colour,
 * same beam — and spends the one channel the ring is not using: whether it is
 * turning. See `paint.ts` for what it costs.
 */
export const GRIP_LATCH: Variant = {
  slot: "grip:ring-pause",
  name: "latch",
  sentence:
    "the four arcs stop square and close while the body is in its beat of pause — and turn again the moment it may be carried",
  dir: "tools/versus/candidates/grip-pause/latch",
  patches: [
    patch({
      target: grip.GRIP_LOOK,
      // No accessor: `drawGrips` reads the record itself on every call, which
      // is the whole reason the ring was lifted into one. The module namespace
      // is the route there is.
      reached: () => grip.GRIP_LOOK,
      where: {
        file: "packages/render/src/grip.ts",
        symbol: "GRIP_LOOK",
        type: "GripLook",
      },
      fields: { ring: latch },
    }),
  ],
};
