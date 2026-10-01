import {
  type ThroatMode,
  type ThroatState,
  throatAimAt,
  throatBoss,
  throatMouthCol,
} from "./throat.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE THROAT's three hands**: the carry, the pump and the colour
 * (`throat.ts`, `docs/spec/bosses.md` §11.19).
 *
 * Heard on the tick from `bossHandsHeard`, because all three are a thumb that
 * is down *now* and the mouth answers it now — a mouth that waited for the
 * beat to follow a finger would be a mouth that lags a finger, which is the
 * one thing a carried thing must never do.
 *
 * **The carry is player 2's.** A drag on the mouth reports how far the thumb
 * has come from where it went down (`render/touch-move.ts`), so the first
 * sample of a hold anchors the mouth where it stands and every sample after
 * puts it at anchor plus displacement, kept inside the box (`throatAimAt`).
 * A lifted thumb leaves the mouth where it was.
 *
 * **The pump is player 1's**, a drag on a handle of his own, and only its
 * height matters. A stroke is the thumb carried `throatStrokeMilli` the other
 * way from the last turn, and every stroke adds `throatPumpGainMilli` to the
 * pump; the suck takes a little back every tick (`throat-suck.ts`), so the
 * circle is as wide as the strokes are quick. A thumb that drifts back by less
 * than a stroke has not turned, which is what keeps jitter from pumping.
 *
 * **The colour is each seat's own two**: red and cyan are player 2's, as the
 * two shots are on the ordinary panel, and SHIELD and SUCK are player 1's, as
 * the shield and the maw are. A press on the other seat's colour is refused
 * aloud and changes nothing — the mouth's colour is the pair's sentence and
 * neither may say the other's half.
 *
 * Nothing here can hurt the pair.
 */
export function throatHeard(world: World, player: 1 | 2, command: Command): void {
  const b = throatBoss(world);
  if (b === null || b.phase !== "sucks") return;
  if (command.kind === "throatMode") modeHeard(world, b, player, command.mode);
  if (command.kind !== "drag") return;
  if (command.target === "throatAim" && player === 2) aimHeard(world, b, command);
  if (command.target === "throatPump" && player === 1) pumpHeard(world, b, command);
}

/** Which seat sets which colour: the shots are the navigator's, the shield
 * and the maw the pilot's — the ordinary panel's own split. */
export function throatModeSeat(mode: ThroatMode): 1 | 2 {
  return mode === "red" || mode === "cyan" ? 2 : 1;
}

function modeHeard(world: World, b: ThroatState, player: 1 | 2, mode: ThroatMode): void {
  const col = throatMouthCol(b);
  if (throatModeSeat(mode) !== player) {
    world.events.push({ type: "throatRefuse", col, part: mode, player });
    return;
  }
  if (b.mode === mode) return;
  b.mode = mode;
  world.events.push({ type: "throatMode", col, mode });
}

type Drag = Extract<Command, { kind: "drag" }>;

function aimHeard(world: World, b: ThroatState, command: Drag): void {
  if (!command.on) {
    b.aimFromXMilli = -1;
    b.aimFromYMilli = -1;
    return;
  }
  if (b.aimFromXMilli < 0) {
    b.aimFromXMilli = b.aimXMilli;
    b.aimFromYMilli = b.aimYMilli;
  }
  throatAimAt(
    world.cfg,
    b,
    b.aimFromXMilli + command.fromMilli,
    b.aimFromYMilli + (command.fromYMilli ?? 0),
  );
}

/**
 * One sample of the pump, at the thumb's height `y` from where it went down.
 *
 * `pumpDir` is the way the current stroke is going and `pumpFromYMilli` the
 * furthest the thumb has got along it: a sample further the same way moves
 * that mark, and one a whole stroke back from it is a turn — a stroke counted.
 * The first stroke of a hold is free of the gain, so a thumb that only goes
 * down once has not pumped.
 */
function pumpHeard(world: World, b: ThroatState, command: Drag): void {
  if (!command.on) {
    b.pumpDir = 0;
    b.pumpFromYMilli = 0;
    return;
  }
  const y = command.fromYMilli ?? 0;
  const stroke = world.cfg.throatStrokeMilli;
  const d = y - b.pumpFromYMilli;
  if (b.pumpDir === 0) {
    // Measured from where the thumb went down, which a lift reset to nought.
    if (Math.abs(d) < stroke) return;
    b.pumpDir = Math.sign(d);
    b.pumpFromYMilli = y;
    return;
  }
  if (Math.sign(d) === b.pumpDir) {
    b.pumpFromYMilli = y;
    return;
  }
  if (Math.abs(d) < stroke) return;
  b.pumpDir = -b.pumpDir;
  b.pumpFromYMilli = y;
  b.pumpMilli = Math.min(1000, b.pumpMilli + world.cfg.throatPumpGainMilli);
}
