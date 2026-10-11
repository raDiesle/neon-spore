import type { Point } from "@neon-spore/content";
import type { PullKnobDraw } from "@neon-spore/render";
import { noteMark } from "../../../../packages/render/src/mark-spots.js";
import { arrowSize, paintArrow } from "./arrow.js";
import { drop } from "./body.js";
import { paintGoo } from "./drop-look.js";
import { grown } from "./enter.js";
import { type Hold, heldBody, overHeld, pressOf } from "./grab.js";
import { momentOf, SPAWN } from "./moment.js";
import { call } from "./parts.js";
import type { GooStyle } from "./style.js";

/**
 * **The drop under the hand**: OOZE's drop made TAR's slime, wherever the
 * hand has it. Waiting, it breathes and ripples call the thumb; taken, it
 * goes as a SQUISH has it (`grab.ts`) and red as its rim nears the
 * edge of the path.
 * Once counted or refused it is not drawn here — the channel plays the same
 * drop through its ending or its failure (`track.ts`), until it is home.
 */
export function gooKnob(style: GooStyle) {
  return (ctx: CanvasRenderingContext2D, on: Point, r: number, o: PullKnobDraw): void => {
    const m = momentOf(o.held, o.time, o.after, r);
    const at = { x: on.x + m.off.x, y: on.y + m.off.y };
    noteMark(ctx, at.x, at.y, r);
    if (m.owner !== "knob") return;
    const way = o.way ? { x: o.way.dx, y: o.way.dy } : { x: 0, y: 0 };
    // Coming in, the drop and its arrow grow together (`enter.ts`), the arrow ahead (`arrow.ts`).
    const g = grown(m.enter);
    if (g < 0.02) return;
    const rr = r * g;
    ctx.save();
    if (o.theirs) ctx.globalAlpha = 0.4;
    if (!o.held && !o.theirs && m.enter >= SPAWN) call(ctx, at, r, style, o.time);
    const hold: Hold = { at, r: rr, way, near: m.near, grabbed: m.grabbed, time: o.time };
    const body = o.held
      ? heldBody(hold)
      : drop(at, rr, { squash: 1 + 0.07 * Math.sin(o.time * 3.4) });
    const tint = { red: 0.7 * m.near, alpha: o.theirs ? 0.4 : 1 };
    paintGoo(ctx, body, style, o.time, tint, way, o.held ? pressOf(hold) : undefined);
    if (o.held) overHeld(ctx, hold, style);
    if (o.way) {
      const split = o.after?.split ?? (o.either ? 1 : 0);
      const time = o.time;
      paintArrow(ctx, at, arrowSize(r, g), style, { ...o.way, split, held: o.held, time, body });
    }
    ctx.restore();
  };
}
