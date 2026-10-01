import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE RIME's two halves, as rows of the ON THE FIELD tab.
 *
 * **The first rub**, the primitive THE GRINDSTONE's flats later spent again:
 * both screens draw the whole frosted lens, and whose half is whose is
 * geometry — the left the pilot's, the right the navigator's — so a thumb on
 * the other seat's side of the spine falls through (`render/rime-grip.ts`,
 * `docs/spec/bosses-choreographed.md` §29).
 */
const HALF_DOES =
  "A **rub**: a thumb anywhere on the seat's half of the lens, out to half a " +
  "tile past the rim, held and turned back and forth. Each drag says how " +
  "many times it has turned back since it went down, and **every fresh " +
  "reversal shaves frost** off the half while its step — or a whiteout, " +
  "which asks both — is lit; a beat nobody rubbed grows frost back, and a " +
  "half rubbed to nothing is the wipe. A lift sets the count back to nought " +
  "(sim/rime-hand.ts, packages/render/src/rub.ts). While a wipe or the " +
  "whiteout is lit on a half with frost still on it, the half wears the halo " +
  "on its seat's screen and the partner's ring and clock on the other's; a " +
  "half wiped clear greens, and one frosting back reddens " +
  "(render/rime-verdicts.ts).";

const WHERE_UNTIL = "on both screens, from the drop into frame until the lens shatters";
const SOURCE =
  "handles.ts — rimeHalfUnder() under handleUnder(); the half is the seat's side of the lens's spine";

export const RIME_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE RIME'S LEFT HALF",
    where: `on the lens's left half, ${WHERE_UNTIL}`,
    seat: "player 1 — the left half is the pilot's, by geometry, on both phones",
    gesture: "grab and drag",
    does: HALF_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "rimeHalfLeft",
    sends: ["drag"],
    pose: "RIME · THE LEFT HALF RUBBED",
  },
  {
    name: "THE RIME'S RIGHT HALF",
    where: `on the lens's right half, ${WHERE_UNTIL}`,
    seat: "player 2 — the right half is the navigator's, by geometry, on both phones",
    gesture: "grab and drag",
    does: HALF_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "rimeHalfRight",
    sends: ["drag"],
    pose: "RIME · THE RIGHT HALF RUBBED",
  },
];
