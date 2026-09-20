import {
  type BatonState,
  batonActor,
  batonDrawing,
  batonLead,
  batonLocked,
  batonMergeSocket,
  type World,
} from "@neon-spore/sim";
import { beadPoint } from "./baton-bead-draw.js";
import { socketPoint, socketRoomBelow } from "./baton-socket-draw.js";
import type { BossCue } from "./boss-cue.js";
import { batonPassingCues } from "./boss-cue-read-i-b.js";
import { type Layout, tileCX } from "./layout.js";
import { podCenter } from "./pods.js";

/**
 * **What THE BATON is asking for** — page nine of the readings, and the first
 * one opened for a boss that was already read.
 *
 * It lived on page two with THE TASTER, THE UNDERTOW and THE VANE and said
 * two words: `LAUNCH` on a bead in its socket and `FIRE` on one in the air.
 * Those two are the arm's own beat and they are a third of the fight. The
 * rest of it — the cannon the flight has to be met in, the crossing's act a
 * beat, and the pod at the end — was answered on a field that said nothing,
 * which is what the standing brief is about (`.claude/skills/new-boss` §6.1).
 * Four stages' worth of reading is a page, not a paragraph, so it is here and
 * page two is back to the three it was written for.
 *
 * **Every stage of this fight is a different pair of thumbs**, which is the
 * whole of why the reading is a switch:
 *
 * - `unfolding` — eleven beats of arm and nothing to press. No word.
 * - `passing` — the arm's own alternation: his trigger, her shot, the cannon
 *   he has to have under the flight for her shot to meet it, and — on the arm
 *   itself — the shell coming away that the locked-out seat may strip. It is
 *   half a page on its own and is the next file over (`boss-cue-read-i-b.ts`),
 *   which is the readings' only cut *within* a boss.
 * - `merging` — a thumb each on the two beads, and neither of them the ship's.
 * - `crossing` — one act a beat, in turn, and the turn is `batonActor`.
 * - `falling` — the bead is a pod, the catch is his, and both locks are open
 *   (`sim/baton-cross.ts`, `drop`).
 *
 * **What is deliberately never marked** is the shell once it has *fallen*
 * (`batonShed`): it is a rock down the arm's column then, and a rock is warded
 * by the ship's ordinary two hands, taught eleven waves before this one. A
 * frame around it would be the field marking the field. The socket it is
 * coming off, before it falls, is a different thing — it is a handle, on one
 * screen, for one beat at a time (`sim/baton-hand.ts`).
 */

/** THE CHOIR's frame, in tiles — the same as the eight pages before. */
const HALF_W = 0.72;
const HALF_H = 0.66;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
  roomBelow?: number,
): BossCue {
  const halfW = l.tile * HALF_W;
  return { seat, kind, word, x, y, halfW, halfH: l.tile * HALF_H, seed, roomBelow };
}

/**
 * The drawing together: one word on each screen, on the bead that seat's thumb
 * is for, and gone from a screen whose thumb is already down.
 *
 * `HOLD` and not `PRESS`, because the count runs only while **both** are down
 * and either letting go puts it back to nought (`sim/baton-pair.ts`). Neither
 * mark says whether the other is down — that is the one sentence this fight
 * has never made them say, and the state exists to make them say it.
 *
 * **The pilot's word is capped and the navigator's is not**, and the asymmetry
 * is the arm's: his bead is the second socket from the end and hers is the
 * last, so only his has a ring standing under it (`socketRoomBelow`).
 */
function merging(l: Layout, world: World, b: BatonState): readonly BossCue[] {
  const out: BossCue[] = [];
  for (const seat of [1, 2] as const) {
    if (batonDrawing(b, seat)) continue;
    const socket = batonMergeSocket(world.cfg, seat);
    const at = socketPoint(l, world.cfg, b, socket);
    out.push(
      markAt(
        seat,
        "HOLD",
        "HOLD",
        at.x,
        at.y,
        l,
        92 + seat,
        socketRoomBelow(l, world.cfg, b, socket),
      ),
    );
  }
  return out;
}

/**
 * The crossing: one word, on the seat whose act is due.
 *
 * `batonActor` is the turn and there is nothing else to read — act `n` is
 * his on the even counts and hers on the odd, and a beat that ends one act
 * short puts the bead back at the top of a whole arm (`sim/baton-cross.ts`).
 * His is `SEND` and not `LAUNCH`: the same thumb on the same trigger, but
 * nothing is being launched out of a socket any more, and the eleven beats
 * are one long shove down the column.
 *
 * **No `MOVE` stands here**, and that is a choice rather than an oversight.
 * The drop is straight down the column the last socket hangs in, so the
 * cannon is where the fight has already put it; and a seat is locked through
 * the beat after its own act (`batonLockBeats`), so the only beat he could
 * move in is the beat his act is due in. A screen carrying two words on the
 * one beat that has an act in it is a beat spent reading.
 */
function crossing(l: Layout, world: World, b: BatonState): readonly BossCue[] {
  const bead = batonLead(b);
  if (bead === null) return [];
  const seat = batonActor(b);
  if (batonLocked(b, seat, world.beat)) return [];
  const { x, y } = beadPoint(l, world.cfg, b, bead, world.tick);
  return [markAt(seat, "PRESS", seat === 1 ? "SEND" : "FIRE", x, y, l, 84 + seat)];
}

/**
 * The drop, which is the fight: the bead is a loose pod and the whole of
 * what is left is the pilot's two hands on it — under it, and the maw open
 * when it arrives (`sim/pod-intake.ts`). Both locks opened at the drop, so
 * nothing here asks whether he may act.
 *
 * `OPEN` stands for as long as the cannon is under the pod rather than at the
 * moment it arrives. **The moment is his**: a word that appeared on the beat
 * to press would be the catch made for him, and the maw's window is the one
 * clock this game has always left in a thumb (`docs/decisions.md` #34).
 */
function falling(l: Layout, world: World, b: BatonState): readonly BossCue[] {
  const pod = world.pods.find((p) => p.id === b.podId);
  if (pod === undefined) return [];
  if (world.cannonCol !== Math.round(pod.colMilli / 1000)) {
    return [markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 87)];
  }
  const at = podCenter(l, pod);
  return [markAt(1, "PRESS", "OPEN", at.x, at.y, l, 88)];
}

/** Every word THE BATON says, most urgent first, by the stage it is in. */
export function batonCues(l: Layout, world: World, b: BatonState): readonly BossCue[] {
  switch (b.stage) {
    case "passing":
      return batonPassingCues(l, world, b);
    case "merging":
      return merging(l, world, b);
    case "crossing":
      return crossing(l, world, b);
    case "falling":
      return falling(l, world, b);
    default:
      return [];
  }
}
