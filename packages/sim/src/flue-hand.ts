import { midCol } from "./config.js";
import {
  FLUE_TAPS,
  FLUE_VENTS,
  type FlueState,
  flueBoss,
  flueEmberCol,
  flueLitStep,
  flueResters,
  flueSeatIndex,
  flueSteady,
  flueTapper,
} from "./flue.js";
import { flueAnswered } from "./flue-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Every command either seat sends while THE FLUE is up — **all of them**,
 * THE HALTER's reading (`halter-hand.ts`): `RestraintGate` counts beats with
 * nothing in them, so it has to hear a drag, a press, the cannon slid and a
 * colour primed alike. Each one zeroes its seat's rest and marks the beat it
 * arrived in as not counted (`flue-step.ts`).
 *
 * **The coupling is heard here**, at the instant the beat cannot see: the lit
 * vent's rester sending anything costs the taps already landed, all of them,
 * and the ember drifts on from where it sat. A rester who had steadied it and
 * stirs before a tap is only said to have stirred.
 *
 * **The tap is `flueTap`**, an edge like THE VALVE's pin (`valve-hand.ts`),
 * with `id` the column it went down on — the ember moves between taps, so
 * where the thumb came down is the whole of the answer. It lands only from
 * the lit vent's tapper, only while the ember is steady, and only on the
 * column it sits over; any other tap from that seat skids. Three landed spend
 * the vent, and the second vent spent bares the core.
 */
export function flueHeard(world: World, player: 1 | 2, command: Command): void {
  const s = flueBoss(world);
  if (s === null) return;
  const i = flueSeatIndex(player);
  const steadyWas = flueSteady(world, s);
  s.restBeats[i] = 0;
  s.stirred[i] = true;
  const vent = flueLitStep(s)?.ask === "vent";
  if (vent && flueResters(s).includes(player)) {
    const col = flueEmberCol(world.cfg, s);
    if (s.taps > 0) {
      world.events.push({ type: "flueLapse", side: i, taps: s.taps, col });
      s.taps = 0;
    } else if (steadyWas) world.events.push({ type: "flueStir", side: i, col });
  }
  if (command.kind === "drag" && command.target === "flueTap") {
    tap(world, s, player, command.on, command.id ?? -1);
  }
}

function tap(world: World, s: FlueState, player: 1 | 2, on: boolean, col: number): void {
  const i = flueSeatIndex(player);
  if (!on) {
    s.tapDown[i] = false;
    return;
  }
  const edge = !s.tapDown[i];
  s.tapDown[i] = true;
  if (!edge || flueTapper(s) !== player) return;
  if (!flueSteady(world, s) || col !== flueEmberCol(world.cfg, s)) {
    world.events.push({ type: "flueSkid", side: i, col: flueEmberCol(world.cfg, s) });
    return;
  }
  s.taps += 1;
  world.events.push({ type: "flueTick", side: i, taps: s.taps, col });
  if (s.taps < FLUE_TAPS) {
    const notch = flueLitStep(s)?.notches[s.taps - 1] ?? 0;
    const span = world.cfg.flueSpanMilli;
    s.emberMilli = Math.max(-span, Math.min(span, notch * 1000));
    return;
  }
  s.vents = Math.min(FLUE_VENTS, s.vents + 1);
  world.events.push({ type: "flueVent", vents: s.vents, col });
  if (s.vents >= FLUE_VENTS && !s.bared) {
    s.bared = true;
    world.events.push({ type: "flueBare", col: midCol(world.cfg) });
  }
  flueAnswered(world, s);
}
