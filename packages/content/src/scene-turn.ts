import {
  BEARING_TURN,
  type DragTarget,
  gimbalTurnPerTickMilli,
  NO_BEARING,
  type SceneCommand,
  type SimConfig,
  windPerTickMilli,
} from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";

/**
 * **A hand that turns rather than carries**: THE CLAW's crank on the panel.
 *
 * Cut off `scene-drag.ts` when a turning hand's own stream would have taken that
 * file over its 250-line limit, along the seam its heading already drew: next door
 * is a hand *carried* somewhere, which is a displacement and a distance it
 * stops at, and everything here is a hand going round a circle, which is a
 * **bearing** and has no destination at all (`sim/bearing.ts`).
 *
 * A film has no finger, so the rehearsal turns on the ghost hand's behalf: the
 * grab, a bearing every few ticks, and the hand coming off. **The rate is asked
 * for in every case and chosen in none** — `windPerTickMilli` for the crank,
 * which is the speed the arm used to come home under its own power. The desk
 * keyboard asks the same function, so every rig turns the arm at the rate the
 * picture is already going at.
 */

/**
 * How often a film reports where the hand has got to, in ticks.
 *
 * Few enough that one sample is nowhere near the half turn the ratchet reads
 * as a hand jumping backwards (`sim/bearing.ts`), and enough of them that what
 * is turning comes round smoothly rather than in steps a pair can count.
 */
const SAMPLE_TICKS = 6;

/**
 * The stream itself, and the only thing the caller below adds to it is
 * *which* circle and how fast.
 *
 * The bearings start from nought, exactly as the keyboard's and the frame
 * tool's do, because the grab reports `NO_BEARING` and the reference is the
 * last bearing *this* hand gave: a hand that pretended to start at the top of
 * the circle would turn by up to half a lap that no finger ever travelled.
 */
function turning(
  target: DragTarget,
  player: 1 | 2,
  from: number,
  until: number,
  perTickMilli: number,
  way: -1 | 1,
  stop = Number.POSITIVE_INFINITY,
): SceneCommand[] {
  const grab = { kind: "drag", target, on: true, fromMilli: NO_BEARING } as const;
  const out: SceneCommand[] = [{ tick: from, player, command: grab }];
  const step = perTickMilli * SAMPLE_TICKS;
  let travelled = 0;
  for (let tick = from; tick <= until; tick += SAMPLE_TICKS) {
    // Positive and inside one turn either way round: a bearing is where on the
    // circle the hand *is*, so a hand going the other way counts down through
    // the modulus rather than into negative numbers.
    const at = (((way * travelled) % BEARING_TURN) + BEARING_TURN) % BEARING_TURN;
    out.push({ tick, player, command: { kind: "drag", target, on: true, fromMilli: at } });
    travelled = Math.min(stop, travelled + step);
  }
  out.push({
    tick: until,
    player,
    command: { kind: "drag", target, on: false, fromMilli: NO_BEARING },
  });
  return out;
}

/**
 * THE CLAW's crank, wound for as long as the act lasts.
 *
 * It is authored as an ordinary press on the crank (`{ tick, control: "crank",
 * until }`) rather than as a `drag`, and that is deliberate: the ghost hand is
 * placed from `act.control` (`render/guide-thumb.ts`), so a film that authored
 * this as a handle would wind the arm home with no hand anywhere on the
 * screen — a page about a gesture, showing nobody making it.
 *
 * One way round only. Paying rope out is a thing the pair does and not a thing
 * a page about winding the arm home would show.
 */
export function crankCommands(act: SceneAct, player: 1 | 2, cfg: SimConfig): SceneCommand[] {
  const until = act.until ?? act.tick + SAMPLE_TICKS;
  return turning("crank", player, act.tick, until, windPerTickMilli(cfg), 1);
}

/**
 * THE GIMBAL's ring, turned **a set distance and then held** — authored as a
 * `drag` on `gimbalOuter` or `gimbalInner`, with `toMilli` the distance round
 * the hand's own face, clockwise positive, and `until` the lift.
 *
 * The crank has no destination; a ring has exactly one, its mark, and the
 * whole of the lesson is the hand that stops on it and stays. So the stream
 * stops advancing at the distance and keeps reporting the same bearing until
 * the lift: a hand still on the rim, which is what keeps the ring off its
 * drift (`sim/gimbal-step.ts`). The distance is the face's and not the
 * wheel's, because the navigator's ring is gripped from the far side and the
 * same number goes in mirrored (`sim/gimbal-hand.ts`) — a film writes what
 * the thumb does and the simulation says what that turns.
 *
 * The rate is the desk key's, `gimbalTurnPerTickMilli`, for the crank's
 * reason: asked for, not chosen.
 */
export function ringCommands(act: SceneAct, player: 1 | 2, cfg: SimConfig): SceneCommand[] {
  const target = act.drag as DragTarget;
  const until = act.until ?? act.tick + SAMPLE_TICKS;
  const travel = act.toMilli ?? 0;
  const perTick = gimbalTurnPerTickMilli(cfg);
  return turning(target, player, act.tick, until, perTick, travel < 0 ? -1 : 1, Math.abs(travel));
}
