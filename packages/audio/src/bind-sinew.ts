import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE SINEW's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one of them is panned, and here the pan is the one thing the ear
 * can add to the picture: the mass hangs in one column and the two handles
 * either side of it, so a grip on the left is a grip on the left. The
 * tendon's own events — the hold counting, the slack creeping, the fibre
 * parting — sit on the mass's column, which is the middle until the fall
 * walks it.
 */
export function sinewCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "sinewSettle"
        | "sinewGrip"
        | "sinewRelease"
        | "sinewEnter"
        | "sinewLoose"
        | "sinewPart"
        | "sinewSnap"
        | "sinewRock"
        | "sinewCatch"
        | "sinewSlack"
        | "sinewFall"
        | "sinewSwing"
        | "sinewOut"
        | "sinewCrush";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "sinewSettle":
      return { id: "boss.sinewSettle", pan };
    case "sinewGrip":
      return { id: "boss.sinewGrip", pan };
    case "sinewRelease":
      return { id: "boss.sinewRelease", pan };
    case "sinewEnter":
      return { id: "boss.sinewEnter", pan };
    case "sinewLoose":
      return { id: "boss.sinewLoose", pan };
    case "sinewPart":
      // A step up per fibre gone, so the rope thinning can be counted by ear.
      return { id: "boss.sinewPart", pan, pitch: 1.2 - e.fibres * 0.04 };
    case "sinewSnap":
      // The last fibre's snap throws three rocks and is the heavier sound.
      return { id: "boss.sinewSnap", pan, pitch: e.rocks > 1 ? 0.85 : 1 };
    case "sinewRock":
      return { id: "boss.sinewRock", pan };
    case "sinewCatch":
      return { id: "boss.sinewCatch", pan };
    case "sinewSlack":
      return { id: "boss.sinewSlack", pan };
    case "sinewFall":
      return { id: "boss.sinewFall", pan };
    case "sinewSwing":
      return { id: "boss.sinewSwing", pan };
    case "sinewOut":
      return { id: "boss.sinewOut", pan };
    case "sinewCrush":
      return { id: "boss.sinewCrush", pan };
  }
}
