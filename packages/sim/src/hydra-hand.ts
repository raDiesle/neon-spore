import { midCol } from "./config.js";
import {
  type HydraState,
  hydraBoss,
  hydraEyeOpen,
  hydraHeadOf,
  hydraLapsOf,
  hydraLitStep,
  hydraSideCol,
  hydraUnwindWay,
  hydraWayOf,
} from "./hydra.js";
import { hydraEyeShut, hydraTakes } from "./hydra-step.js";
import { type Pull, pullHeard } from "./pull.js";
import { rimLapMilli } from "./rim-turn.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE HYDRA's hands: a side each, `hydraNeckLeft`, `hydraCoilLeft` and
 * `hydraEyeLeft` the pilot's, the `Right` three the navigator's.
 *
 * **A neck is cut by a swipe across it**, the one generic PULL (`pull.ts`)
 * sideways: `fromMilli` how far across the thumb has come since it went down,
 * counted the way the neck's arrow points (`hydraWayOf`) and cut at
 * `hydraCutMilli`. Let go short and the neck swings on (`hydraGlance`): only
 * that neck is still to cut, and the next swipe starts it fresh.
 *
 * **A coil is turned off by THE MAZE's lever** (`rim-turn.ts`): `fromMilli`
 * how far round the coil's ring the thumb has come since it took hold,
 * clockwise positive, the step from the last reading taken the short way
 * round. Round the way it unwinds it comes off; round the other way it winds
 * back on, never past where it began. **A coil keeps its laps when the thumb
 * lifts** — the owner's rule for a boss's own count, 2 October 2026.
 *
 * **An eye is tapped while it is open**, an edge like THE GOVERNOR's tap
 * (`governor-hand.ts`): a thumb resting on it has to lift and come down
 * again. On a shut eye the tap is refused aloud (`hydraMiss`).
 *
 * **A thumb on the partner's head** takes hold of nothing and is said
 * (`hydraWrong`), THE CHRYSALIS's reason.
 */
export function hydraHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = hydraBoss(world);
  if (s === null || s.phase === "spent" || s.phase === "struck") return;
  const seat: 0 | 1 = player === 1 ? 0 : 1;
  const hand = handOf(command.target);
  if (hand === null) return;
  if (hand.side !== seat) {
    if (command.on && command.fromMilli === 0 && (command.fromYMilli ?? 0) === 0) {
      wrong(world, seat);
    }
    return;
  }
  if (hand.part === "eye") tapped(world, s, seat, command.on);
  else if (hand.part === "coil") turned(world, s, seat, command.on, command.fromMilli);
  else swiped(world, s, seat, command.on, command.fromMilli);
}

/**
 * A seat's swipe across its neck: cut at the reach the way its arrow points,
 * once a press; a lift short of it a glance.
 */
function swiped(world: World, s: HydraState, seat: 0 | 1, on: boolean, x: number): void {
  const i = hydraHeadOf(s, seat);
  const biting = hydraLitStep(s)?.head === "bite" && i >= 0;
  if (!on) {
    const was = s.cutMilli[seat];
    const spent = s.spent[seat];
    s.down[seat] = false;
    s.spent[seat] = false;
    s.cutMilli[seat] = 0;
    if (!biting) return;
    const rope = neckRope(world, s, i);
    // The kept cut is the travel along the arrow; the lift is read as the carry it came from.
    if (pullHeard(rope, spent, false, was * (rope.sign ?? 1)).heard !== "short") return;
    world.events.push({ type: "hydraGlance", seat, piece: i, col: hydraSideCol(world, seat) });
    return;
  }
  s.down[seat] = true;
  if (s.spent[seat] || !biting) return;
  const { travelMilli, heard } = pullHeard(neckRope(world, s, i), false, true, x);
  s.cutMilli[seat] = travelMilli;
  if (heard !== "counted") return;
  s.cutMilli[seat] = 0;
  s.spent[seat] = true;
  world.events.push({ type: "hydraCut", seat, piece: i, col: hydraSideCol(world, seat) });
  hydraTakes(world, s, i);
}

/** A neck's cut as the one generic PULL, signed the way its arrow points. */
function neckRope(world: World, s: HydraState, i: number): Pull {
  const step = hydraLitStep(s);
  const sign = step === null ? -1 : hydraWayOf(step, i);
  return { way: "signed", sign, reachMilli: world.cfg.hydraCutMilli };
}

/**
 * A seat's thumb on its coil's lever. Taking hold marks where; carried, the
 * coil comes off by the way round it has come the way it unwinds, and winds
 * back on the other way, kept through every lift.
 */
function turned(world: World, s: HydraState, seat: 0 | 1, on: boolean, from: number): void {
  if (!on) {
    s.turning[seat] = false;
    return;
  }
  if (!s.turning[seat]) {
    s.turning[seat] = true;
    s.turnAtMilli[seat] = from;
    return;
  }
  const lap = rimLapMilli(world.cfg.hydraCoilRimMilli);
  let moved = (from - s.turnAtMilli[seat]) % lap;
  if (moved > lap / 2) moved -= lap;
  if (moved < -lap / 2) moved += lap;
  s.turnAtMilli[seat] += moved;
  const i = hydraHeadOf(s, seat);
  if (hydraLitStep(s)?.head !== "coil" || i < 0) return;
  const need = hydraLapsOf(s) * lap;
  const was = s.unwoundMilli[seat];
  const now = Math.max(0, Math.min(need, was + moved * hydraUnwindWay(seat)));
  s.unwoundMilli[seat] = now;
  const laps = Math.floor(now / lap);
  if (laps > Math.floor(was / lap) && now < need) {
    world.events.push({ type: "hydraLap", seat, laps, col: hydraSideCol(world, seat) });
  }
  if (now < need) return;
  world.events.push({ type: "hydraUncoil", seat, piece: i, col: hydraSideCol(world, seat) });
  hydraTakes(world, s, i);
}

/** A seat's tap on its eye: open, it is shut for good; shut, the tap is refused. */
function tapped(world: World, s: HydraState, seat: 0 | 1, on: boolean): void {
  if (!on) {
    s.down[seat] = false;
    return;
  }
  const edge = !s.down[seat];
  s.down[seat] = true;
  const i = hydraHeadOf(s, seat);
  if (!edge || hydraLitStep(s)?.head !== "eye" || i < 0) return;
  const col = hydraSideCol(world, seat);
  if (!hydraEyeOpen(s, seat)) {
    world.events.push({ type: "hydraMiss", seat, col });
    return;
  }
  world.events.push({ type: "hydraPoke", seat, piece: i, col });
  hydraEyeShut(world, s, seat);
  hydraTakes(world, s, i);
}

type HydraHandPart = "neck" | "coil" | "eye";

function handOf(target: string): { part: HydraHandPart; side: 0 | 1 } | null {
  if (target === "hydraNeckLeft") return { part: "neck", side: 0 };
  if (target === "hydraNeckRight") return { part: "neck", side: 1 };
  if (target === "hydraCoilLeft") return { part: "coil", side: 0 };
  if (target === "hydraCoilRight") return { part: "coil", side: 1 };
  if (target === "hydraEyeLeft") return { part: "eye", side: 0 };
  if (target === "hydraEyeRight") return { part: "eye", side: 1 };
  return null;
}

function wrong(world: World, seat: 0 | 1): void {
  world.events.push({ type: "hydraWrong", seat, col: midCol(world.cfg) });
}
