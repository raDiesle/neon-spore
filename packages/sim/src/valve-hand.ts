import { MAX_BEARING_STEP, NO_BEARING, TURN } from "./bearing.js";
import { midCol } from "./config.js";
import { closeSlow, openSlow } from "./slow.js";
import type { Command } from "./types.js";
import { VALVE_PINS, valveBoss, valveOnMark, valveTurning } from "./valve.js";
import { valveCheckMark, valveLeak, valvePullBeats } from "./valve-step.js";
import type { World } from "./world.js";

/**
 * THE VALVE's two handles: the wheel, the pilot's, and the pin, which the
 * navigator taps to freeze the wheel and either thumb then draws out.
 *
 * **The split is the freeze.** Only the pilot turns the wheel and only the
 * navigator's tap stops it; neither can do the other's half, and the tap only
 * lands while the wheel is on its mark, which only the pilot can put it on.
 * The pull is anybody's — by then the question has been asked.
 */
export function valveHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target === "valveWheel" && player === 1) wheelHeard(world, command);
  if (command.target === "valvePin") pinHeard(world, player, command);
}

/**
 * The pilot's hand on the rim, read by bearing — THE HASP's wheel
 * (`hasp-hand.ts`), with the travel kept signed so the third movement's lap
 * has to be made one way round.
 *
 * A wheel held on its mark and turned off it again has slipped: the freeze
 * window shuts and the turning goes on.
 */
function wheelHeard(world: World, command: Extract<Command, { kind: "drag" }>): void {
  const s = valveBoss(world);
  if (s === null) return;
  if (!command.on || command.fromMilli < 0) {
    s.handMilli = NO_BEARING;
    return;
  }
  const at = ((command.fromMilli % TURN) + TURN) % TURN;
  const was = s.handMilli;
  s.handMilli = at;
  if (was === NO_BEARING || !valveTurning(s)) return;
  const step = (at - was + TURN) % TURN;
  if (step === 0) return;
  const turned = step <= MAX_BEARING_STEP ? step : step - TURN;
  s.wheelMilli = (((s.wheelMilli + turned) % TURN) + TURN) % TURN;
  s.travelMilli += turned;
  if (s.phase === "hold" && !valveOnMark(s, world.cfg)) {
    s.phase = "turn";
    s.phaseBeat = world.beat;
    closeSlow(world);
    world.events.push({ type: "valveSlip", col: midCol(world.cfg) });
    return;
  }
  valveCheckMark(world, s);
}

/**
 * The pin: a tap from the navigator while the wheel is held freezes it, and
 * then a draw from either seat, deep enough, pulls it.
 *
 * **The tap is an edge.** `pinDown` is the navigator's thumb on it, so a thumb
 * already resting on the pin when the window opens has to lift and come down
 * again — the tap is an answer to the mark, never a thumb parked in advance.
 */
function pinHeard(world: World, player: 1 | 2, command: Extract<Command, { kind: "drag" }>): void {
  const s = valveBoss(world);
  if (s === null) return;
  const cfg = world.cfg;
  const mid = midCol(cfg);
  if (!command.on) {
    if (player === 2) s.pinDown = false;
    return;
  }
  const edge = player === 2 && !s.pinDown;
  if (player === 2) s.pinDown = true;
  if (s.phase === "hold" && edge) {
    s.phase = "frozen";
    s.phaseBeat = world.beat;
    openSlow(world, valvePullBeats(world, s) + 1, "ask");
    world.events.push({ type: "valveFreeze", col: mid });
    return;
  }
  if (s.phase !== "frozen" || (command.fromYMilli ?? 0) < cfg.valvePullMilli) return;
  s.pins -= 1;
  closeSlow(world);
  world.events.push({ type: "valvePull", pins: s.pins, col: mid });
  if (s.pins === VALVE_PINS - 1) valveLeak(world, s);
  if (s.pins > 0 && s.movement < 3) s.movement = (s.movement + 1) as 2 | 3;
  s.phase = "list";
  s.phaseBeat = world.beat;
}
