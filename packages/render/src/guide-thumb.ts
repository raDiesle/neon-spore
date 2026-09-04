import {
  type ControlSet,
  control,
  type GuideScene,
  mapCol,
  type SceneAct,
} from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { bandLobes, type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The hand a guide's rehearsal is driven by, and the one rule it plays by:
 * **it is derived, never authored.**
 *
 * A scene names a control and a column and nothing else (`SceneAct`). Where
 * that control *is* comes from `bandLobes` for a lobe and from the strip and
 * `tileCX` for a strip — the same two answers the band is drawn from and a
 * finger is hit-tested against. So the hand cannot disagree with the panel it
 * is pressing, and it cannot disagree with the world either: the same act is
 * what `sceneCommand` turns into the press the rehearsal actually feels.
 *
 * The alternative was a list of coordinates beside the list of presses, which
 * is a second copy of where the buttons are — the exact failure `Layout.lobeY`
 * exists to prevent one level down.
 *
 * The hand is drawn only on the screen it belongs to. The film shows one device
 * at a time (`guide-scene.ts`), and a hand carried over from the other one
 * would be a finger pressing a button that is not on this screen.
 */

interface Anchor {
  tick: number;
  /** Which screen this press happens on. The hand is only drawn on that one. */
  seat: 1 | 2;
  x: number;
  y: number;
  /** Whether this is a button going down, rather than a strip being dragged. */
  press: boolean;
}

/** How long the hand stays visibly down after a lobe act, in ticks. */
const PRESS_TICKS = 18;
/** How far ahead of its first act a hand appears. Long enough to be seen
 * arriving, short enough that it is not a thumb resting on nothing. */
const LEAD_TICKS = 24;
/**
 * And how long after its last act it stays, for the same reason turned round.
 *
 * A hand used to stay for the rest of the loop, which was invisible while the
 * loop ran on to its end a moment later. A page outlives its last press by
 * whole seconds — FIRST STEP's last two are a miss and a hull taking it, and
 * neither has a press in it — so the hand sat on the cannon strip pressing
 * nothing for as long as the pair read the words. It leaves instead.
 */
const TRAIL_TICKS = 60;

/**
 * Every act as a place on the panel. An act naming a control the seat's screen
 * does not carry is dropped rather than guessed at — `test/scenes.test.ts` in
 * `content` is what keeps a scene from authoring one at all.
 */
export function thumbAnchors(scene: GuideScene, set: ControlSet, l: Layout): Anchor[] {
  const out: Anchor[] = [];
  for (const act of scene.acts) {
    const def = control(act.control);
    const point = pointOn(l, set, act);
    if (!point) continue;
    out.push({
      tick: act.tick,
      seat: def.player,
      x: point.x,
      y: point.y,
      press: def.form === "lobe",
    });
  }
  return out;
}

function pointOn(l: Layout, set: ControlSet, act: SceneAct): { x: number; y: number } | null {
  const def = control(act.control);
  if (def.form === "lobe") {
    const lobe = bandLobes(l, set, def.player).find((b) => b.control.id === act.control);
    return lobe ? { x: lobe.circle.x, y: lobe.circle.y } : null;
  }
  if (def.form !== "strip") return null;
  // `Strip.y` is the strip's *centre* and not its top — `touch.ts` hit-tests a
  // finger against `|y - strip.y|`, so a hand drawn half a strip below it would
  // be a hand outside the region it is supposedly inside.
  const strip = act.control === "shield" ? l.shieldStrip : l.cannonStrip;
  return { x: tileCX(l, mapCol(act.col ?? 0, l.cols)), y: strip.y };
}

/**
 * The hand at this tick of the loop. Between two acts it travels — including
 * the long, empty travel from one screen to the other, which is the part of
 * the guide the words cannot say: nothing moves while it crosses, and that gap
 * is the sentence one player has to speak out loud.
 */
export function drawGhostThumb(
  ctx: CanvasRenderingContext2D,
  anchors: readonly Anchor[],
  tick: number,
  radius: number,
  seat: 1 | 2,
): void {
  // Only the hand belonging to the screen that is showing. The film moves
  // between two devices; a hand from the other one would be a finger pressing
  // a button that is not there.
  const anchors2 = anchors.filter((a) => a.seat === seat);
  const first = anchors2[0];
  if (!first || tick < first.tick - LEAD_TICKS) return;
  if (tick > anchors2[anchors2.length - 1]!.tick + TRAIL_TICKS) return;
  let at = first;
  let x = first.x;
  let y = first.y;
  for (let i = 0; i < anchors2.length - 1; i++) {
    const a = anchors2[i]!;
    const b = anchors2[i + 1]!;
    if (tick < a.tick || tick > b.tick) continue;
    const span = Math.max(1, b.tick - a.tick);
    const k = smoothstep(Math.min(1, Math.max(0, (tick - a.tick) / span)));
    x = a.x + (b.x - a.x) * k;
    y = a.y + (b.y - a.y) * k;
    at = a;
    break;
  }
  const last = anchors2[anchors2.length - 1]!;
  if (tick >= last.tick) {
    x = last.x;
    y = last.y;
    at = last;
  }

  const down = at.press && tick - at.tick >= 0 && tick - at.tick < PRESS_TICKS;
  const r = Math.max(4, radius) * (down ? 0.86 : 1.05);

  // The flare a press leaves, under the hand and spreading out of it.
  if (down) {
    const k = (tick - at.tick) / PRESS_TICKS;
    ctx.globalAlpha = 0.5 * (1 - k);
    ctx.strokeStyle = PALETTE.hullRim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + r * 1.4 * k, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = down ? 0.5 : 0.32;
  ctx.fillStyle = PALETTE.text;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
