import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE VALVE's two handles, as rows of the ON THE FIELD tab: the wheel, the
 * pilot's, turned about its hub; and the pin, tapped by the navigator to
 * freeze the wheel and drawn by either thumb, the whole of the story between
 * the pins after it (`render/valve-grip.ts`, `docs/spec/bosses-choreographed.md` §25).
 */
export const VALVE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE VALVE'S WHEEL",
    where:
      "on the wheel in the drum's face, hung over the middle column, on both screens, while a mark is lit and until the wheel is frozen",
    seat: "player 1 only — the wheel is the pilot's; a navigator's thumb on it falls through to whatever is behind",
    gesture: "grab and drag",
    does:
      "A **bearing** about the wheel's hub (`turnAbout`): the press says " +
      "`NO_BEARING` and every move after it turns the wheel by how far round " +
      "the thumb has gone, signed, so the third movement's lap has to be made " +
      "one way round. On its mark the freeze window opens under THE SLOW; " +
      "turned off it again the wheel has slipped and the window shuts " +
      "(sim/valve-hand.ts).",
    source:
      "handles.ts — valveWheelUnder() under handleUnder(); touch-move.ts turnAbout() on the move",
    holdKind: "drag",
    dragTarget: "valveWheel",
    sends: ["drag"],
    pose: "VALVE · THE WHEEL TURNED ONTO ITS MARK",
  },
  {
    name: "THE VALVE'S PIN",
    where:
      "on the socket beside the wheel while it holds on its mark and all through the story; on the long lit pin under the drum as well while the wheel is frozen; both screens",
    seat: "either — only the navigator's tap freezes the wheel, and the pilot's there is taken and does nothing; the draw and the story are anybody's",
    gesture: "grab and drag",
    does:
      "The **tap is an edge**: a thumb already resting on the socket has to " +
      "lift and come down again. The navigator's freezes a wheel held on its " +
      "mark; then a draw **down** of `valvePullMilli`, off the socket or the " +
      "live pin, pulls the pin. Between the pins it is the story: a tap caps " +
      "the jet, both thumbs held ride out the brace and the seal, and a " +
      "rubbing thumb wipes the film, its turns counted by its host " +
      "(sim/valve-hand.ts, render/rub.ts).",
    source: "handles.ts — valvePinUnder() under handleUnder(); a rub hold in the wipe",
    holdKind: "drag",
    dragTarget: "valvePin",
    sends: ["drag"],
    pose: "VALVE · THE LIVE PIN FROZEN",
  },
];
