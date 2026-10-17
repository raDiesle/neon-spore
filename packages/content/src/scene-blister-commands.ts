import {
  type Command,
  NO_BEARING,
  NO_GRIP,
  type SceneCommand,
  type SimConfig,
} from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";
import {
  blisterHandAt,
  blisterLift,
  blisterTarget,
  COMBO_GAP,
  RUB_TICKS,
  SAMPLE_TICKS,
} from "./scene-blister.js";
import type { GuideScene } from "./scene-types.js";

/**
 * **What a hand on a blister sends**: `scene-blister.ts`' path, sampled into
 * the commands a real thumb would send. Cut from it along the seam the two
 * readers already make — the path is drawn as well as sent, and the drawing
 * has no use for a command.
 */

/**
 * What the path sends, sampled the way a real thumb is read: a tap and a hold
 * are the box's tap and the grip (`blister.ts`, `blister-hold.ts`), and the
 * other five are a `drag` on the body's own target, every few ticks down and
 * once on the lift. The body is found by the runner from the column at the
 * moment each message goes (`sim/scene-aim.ts`), as a lid's cord is.
 */
export function blisterCommands(act: SceneAct, scene: GuideScene, cfg: SimConfig): SceneCommand[] {
  const t = blisterTarget(scene, act, cfg);
  const player = act.blister;
  if (!t || player === undefined) return [];
  const col = t.col;
  const lift = blisterLift(act, t);
  if (t.gesture === "tap") return [tap(act.tick, player, col)];
  if (t.gesture === "hold") {
    return [
      { tick: act.tick, player, command: { kind: "grip", id: NO_GRIP }, gripCol: col },
      { tick: lift, player, command: { kind: "grip", id: NO_GRIP } },
    ];
  }
  const out: SceneCommand[] = [];
  if (t.gesture === "combo") out.push(tap(act.tick, player, col));
  if (t.gesture === "rub") {
    // A `RubCount`: how many times the thumb has turned back since it went
    // down, one more at every turn of the path (`sim/blister-rub.ts`).
    let count = 0;
    out.push(drag("blisterRub", act.tick, player, col, { id: 0 }));
    for (let at = act.tick + RUB_TICKS / 2; at < lift; at += RUB_TICKS) {
      count += 1;
      out.push(drag("blisterRub", at, player, col, { id: count }));
    }
    out.push(drag("blisterRub", lift, player, col, { id: count }, false));
    return out;
  }
  if (t.gesture === "turn") {
    // The crank's stream: the grab says only that a hand is on, every sample
    // after it where round the ring the thumb is (`sim/blister-turn.ts`).
    out.push(drag("blisterTurn", act.tick, player, col, { fromMilli: NO_BEARING }));
    for (let at = act.tick + SAMPLE_TICKS; at < lift; at += SAMPLE_TICKS) {
      const bearing = blisterHandAt(act, t, at)?.bearing ?? 0;
      out.push(drag("blisterTurn", at, player, col, { fromMilli: bearing }));
    }
    out.push(drag("blisterTurn", lift, player, col, { fromMilli: NO_BEARING }, false));
    return out;
  }
  // A swipe, a combo's pull and a lever: the displacement from the grab.
  const target = t.gesture === "lever" ? "blisterLever" : "blisterSwipe";
  const from = t.gesture === "combo" ? act.tick + COMBO_GAP : act.tick;
  let last = { fromMilli: 0, fromYMilli: 0 };
  for (let at = from; at < lift; at += SAMPLE_TICKS) {
    const h = blisterHandAt(act, t, at);
    if (!h?.down) continue;
    last = { fromMilli: h.xMilli, fromYMilli: h.yMilli };
    out.push(drag(target, at, player, col, last));
  }
  out.push(drag(target, lift, player, col, last, false));
  return out;
}

function tap(tick: number, player: 1 | 2, col: number): SceneCommand {
  return { tick, player, command: { kind: "tap", id: NO_GRIP }, tapCol: col };
}

function drag(
  target: "blisterSwipe" | "blisterTurn" | "blisterRub" | "blisterLever",
  tick: number,
  player: 1 | 2,
  col: number,
  carry: { fromMilli?: number; fromYMilli?: number; id?: number },
  on = true,
): SceneCommand {
  const command: Command = {
    kind: "drag",
    target,
    on,
    fromMilli: carry.fromMilli ?? 0,
    fromYMilli: carry.fromYMilli ?? 0,
    ...(carry.id === undefined ? {} : { id: carry.id }),
  };
  return { tick, player, command, dragCol: col };
}
