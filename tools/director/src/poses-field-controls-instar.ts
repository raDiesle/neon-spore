import { INSTAR_SCRIPT } from "@neon-spore/content";
import { instarActing, instarBoss, type TimedCommand } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil } from "./pose-kit.js";

/**
 * THE INSTAR in its first pose, the gape, with the pilot's thumb halfway
 * down the lower jaw.
 *
 * The ninth pose the ON THE FIELD tab needed, in a file of its own because
 * `poses-field-controls.ts` is at its limit. It is player 1's screen: what
 * the reader is asking is what a mark looks like when it is *yours* and
 * half answered — the ring bright under a thumb, its arc half filled, the
 * word PULL DOWN over it, the window ring closing in — and, beside it, the
 * navigator's mark on the upper jaw dim, with P2'S over it and its
 * arc empty, because she has not pulled yet (`render/instar-marks.ts`).
 *
 * VERSUS judges `instar:hide` here: head-down and face-on, the skull, the
 * chin and the body's bands all carry the scales `drawScales` lays. And
 * `instar:wing`: both wings hang spread either side of the head, face to us.
 */
export const INSTAR_PULL: Pose = {
  name: "INSTAR · THE JAW HALF PULLED",
  note: "THE INSTAR hung head-down over the field in the gape, the lower jaw dragged half its way by a thumb on the pilot's mark — ring bright, arc half round, PULL DOWN in its box — and the navigator's mark on the upper jaw dim, P2'S over it, arc empty. The window ring stands partway in on both. Player 1's screen.",
  lookAt:
    "whether the two marks read as his and hers at a glance, whether the jaw reads as pulled by the thumb rather than open on its own, and whether the closing ring reads as time running out",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "instar", steps: INSTAR_SCRIPT });
    runUntil(w, "the marks up", [], (world) => {
      const s = instarBoss(world);
      return s !== null && instarActing(s);
    });
    const need = INSTAR_SCRIPT[0]?.marks[0]?.need ?? 1000;
    const on: TimedCommand = {
      tick: w.tick,
      player: 1,
      command: { kind: "drag", target: "instarMark", on: true, fromMilli: 0, fromYMilli: 0, id: 0 },
    };
    const pulled: TimedCommand = {
      tick: w.tick + 1,
      player: 1,
      command: {
        kind: "drag",
        target: "instarMark",
        on: true,
        fromMilli: 0,
        fromYMilli: Math.floor(need / 2),
        id: 0,
      },
    };
    run(w, 3, [on, pulled]);
    return w;
  },
};
