import type { SimConfig } from "./config.js";
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
 * **The pump is player 1's**, a rub on a handle of his own: what it sends is
 * how many times his thumb has turned back since it went down, counted by the
 * host as every rub is (`render/rub-turns.ts`, which keeps jitter from
 * pumping), and every fresh turn adds `throatPumpGain` to the pump; the suck
 * takes a little back every tick (`throat-suck.ts`), so the circle is as wide
 * as the turns are quick.
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
  if (command.target === "throatPump" && player === 1) pumpTurned(world, b, command);
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

/** What one turn of the rub adds to the pump, out of 1000. */
export function throatPumpGain(cfg: SimConfig): number {
  return Math.ceil(1000 / Math.max(1, cfg.throatPumpTurns));
}

/**
 * How full the pump is, in turns of `throatPumpTurns`: rounded up, so one turn
 * reads as one until the drain has taken it all back, and a full pump reads
 * full. What the picture lights the rub's strokes by (`render/boss-cue-read-k.ts`).
 */
export function throatPumpDone(cfg: SimConfig, b: ThroatState): number {
  return Math.min(cfg.throatPumpTurns, Math.ceil(b.pumpMilli / throatPumpGain(cfg)));
}

/**
 * One message of the pump: the turns the thumb has made since it went down.
 * The first of a hold is where its count starts, so a thumb that only goes
 * down has not pumped, and a message coalesced away is made good by the next.
 */
function pumpTurned(world: World, b: ThroatState, command: Drag): void {
  if (!command.on) {
    b.pumpHeard = -1;
    return;
  }
  const count = Math.max(0, command.id ?? 0);
  if (b.pumpHeard < 0) {
    b.pumpHeard = count;
    return;
  }
  const fresh = count >= b.pumpHeard ? count - b.pumpHeard : count;
  b.pumpHeard = count;
  b.pumpMilli = Math.min(1000, b.pumpMilli + fresh * throatPumpGain(world.cfg));
}
