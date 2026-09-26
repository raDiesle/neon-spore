import { midCol } from "./config.js";
import {
  DAVIT_UNREAD,
  type DavitState,
  davitBoss,
  davitDraws,
  davitHalf,
  davitLitStep,
  davitSteered,
  davitSteering,
  davitSwipe,
} from "./davit.js";
import { davitLoosed } from "./davit-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/** The furthest a phone leans either way, in thousandths of a degree: gamma's own range. */
const MAX_LEAN_MILLI = 90_000;

const LEANS = { davitSteerLeft: 0, davitSteerRight: 1 } as const;
const DRAWS = { davitLooseLeft: 0, davitLooseRight: 1 } as const;

/**
 * A lean and a draw for each seat on THE DAVIT.
 *
 * **Geometry says whose is whose**, THE MANTLE's rule (`mantle-hand.ts`):
 * `davitSteerLeft` and `davitLooseLeft` answer only Player 1,
 * `davitSteerRight` and `davitLooseRight` only Player 2, and the wrong seat's
 * touch does nothing, silently. Which of a seat's two is *live* is the lit
 * step's: on the left swing the pilot steers and the navigator looses, on the
 * right swing the other way about, and on a reland either seat looses against
 * the other's lean.
 *
 * **A lean is THE PLUMB's reading** (`plumb-hand.ts`): `fromMilli` is the
 * phone's lean, and a lift is a phone that stopped reporting
 * (`DAVIT_UNREAD`). A lean that leaves its target while the boom was following
 * it is the instant heard here: the draws it was steering lose their count
 * (`davitDrift`).
 *
 * **A draw is THE SLING's** (`sling-hand.ts`): `on: true` is the finger down,
 * and the lift carries the swipe's sign on `fromMilli`. A lift lands only
 * when all three hold: the draw was counted its beats, the other seat's lean
 * is on the target *this instant*, and the swipe goes toward the target's
 * half. Any other lift in a step that asked it springs the draw slack
 * (`davitSlack`), the step still lit.
 */
export function davitHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = davitBoss(world);
  if (s === null) return;
  if (command.target === "davitSteerLeft" || command.target === "davitSteerRight") {
    const side = LEANS[command.target];
    if (player === (side === 0 ? 1 : 2)) lean(world, s, side, command.on, command.fromMilli);
    return;
  }
  if (command.target === "davitLooseLeft" || command.target === "davitLooseRight") {
    const side = DRAWS[command.target];
    if (player === (side === 0 ? 1 : 2)) draw(world, s, side, command.on, command.fromMilli);
  }
}

function lean(world: World, s: DavitState, side: 0 | 1, on: boolean, milli: number): void {
  if (!Number.isInteger(milli)) return;
  const drawer: 0 | 1 = side === 0 ? 1 : 0;
  const was = davitSteered(s, drawer);
  s.tiltMilli[side] = on
    ? Math.max(-MAX_LEAN_MILLI, Math.min(MAX_LEAN_MILLI, milli))
    : DAVIT_UNREAD;
  const steer = davitSteering(s);
  if (steer !== null) s.aimMilli = s.tiltMilli[steer];
  if (!was || davitSteered(s, drawer)) return;
  s.drawnBeats[drawer] = 0;
  world.events.push({ type: "davitDrift", side, col: midCol(world.cfg) });
}

function draw(world: World, s: DavitState, side: 0 | 1, on: boolean, milli: number): void {
  if (on) {
    s.holding[side] = true;
    return;
  }
  if (!s.holding[side] || !Number.isInteger(milli)) return;
  s.holding[side] = false;
  const step = davitLitStep(s);
  const drawn = step !== null && s.drawnBeats[side] >= step.beats;
  const asked = davitDraws(s, side);
  s.drawnBeats[side] = 0;
  if (!asked || step === null) return;
  if (drawn && davitSteered(s, side) && davitSwipe(milli) === davitHalf(step.leanMilli)) {
    davitLoosed(world, s, side);
    return;
  }
  world.events.push({ type: "davitSlack", side, col: midCol(world.cfg) });
}
