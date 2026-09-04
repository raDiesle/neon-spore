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
 */

/** One mini-screen: the layout it was drawn at, and where it was put. */
export interface SceneScreen {
  seat: 1 | 2;
  layout: Layout;
  x: number;
  y: number;
  scale: number;
}

interface Anchor {
  tick: number;
  x: number;
  y: number;
  /** Whether this is a button going down, rather than a strip being dragged. */
  press: boolean;
}

/** How long the hand stays visibly down after a lobe act, in ticks. */
const PRESS_TICKS = 18;

/**
 * Every act as a place on the panel. An act naming a control the seat's screen
 * does not carry is dropped rather than guessed at — `test/scenes.test.ts` in
 * `content` is what keeps a scene from authoring one at all.
 */
export function thumbAnchors(
  scene: GuideScene,
  set: ControlSet,
  screens: readonly SceneScreen[],
): Anchor[] {
  const out: Anchor[] = [];
  for (const act of scene.acts) {
    const def = control(act.control);
    const screen = screens.find((s) => s.seat === def.player);
    if (!screen) continue;
    const point = pointOn(screen.layout, set, act);
    if (!point) continue;
    out.push({
      tick: act.tick,
      x: screen.x + point.x * screen.scale,
      y: screen.y + point.y * screen.scale,
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
): void {
  const first = anchors[0];
  if (!first) return;
  let at = first;
  let x = first.x;
  let y = first.y;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!;
    const b = anchors[i + 1]!;
    if (tick < a.tick || tick > b.tick) continue;
    const span = Math.max(1, b.tick - a.tick);
    const k = smoothstep(Math.min(1, Math.max(0, (tick - a.tick) / span)));
    x = a.x + (b.x - a.x) * k;
    y = a.y + (b.y - a.y) * k;
    at = a;
    break;
  }
  const last = anchors[anchors.length - 1]!;
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
