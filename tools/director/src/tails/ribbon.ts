import { SVG } from "../skins/types.js";
import type { Tail } from "./types.js";

/**
 * One continuous stroke tapering away above the body — the classic trail
 * renderer, and the owner's *Ribbon* by name.
 *
 * This is what every engine gives you for free: a strip that follows the
 * object, narrow at the far end, at the object's own colour. Unity calls it a
 * Trail Renderer and Unreal calls it a Ribbon; the shape is the same and the
 * received advice about it is the same too — keep it short and thin, because
 * an over-long trail looks messy.
 *
 * ## What it is really being asked
 *
 * `docs/tower-defence.md` reads the opposite claim off Neon Pulsefire: that
 * game's projectile leaves **separating dots**, and the argument there is that
 * the *gaps* are what read as speed. GLOW's `TRAIL` is built on that reading.
 * This value is the other answer, on the axis where it belongs — a body
 * actually travelling rather than swaying in place — so the two can finally be
 * argued with pictures.
 *
 * Drawn as a tapering polygon rather than a stroked line with a width ramp,
 * because SVG has no variable-width stroke and faking one with three
 * overlapping strokes is how a ribbon ends up with a seam down it.
 */
const REACH = 1.9;
const WIDE = 0.34;

export const RIBBON: Tail<"ribbon"> = {
  id: "ribbon",
  label: "RIBBON",
  hint: "one continuous stroke tapering to nothing — the classic trail renderer, versus TRAIL's dots",
  reachUp: REACH,
  build(ctx) {
    const grad = document.createElementNS(SVG, "linearGradient");
    grad.setAttribute("id", `${ctx.uid}-ribbon`);
    grad.setAttribute("x1", "0");
    grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0");
    grad.setAttribute("y2", "1");
    for (const [offset, alpha] of [
      ["0%", "0"],
      ["55%", "0.28"],
      ["100%", "0.7"],
    ] as const) {
      const s = document.createElementNS(SVG, "stop");
      s.setAttribute("offset", offset);
      s.setAttribute("stop-color", ctx.colour);
      s.setAttribute("stop-opacity", alpha);
      grad.appendChild(s);
    }
    ctx.defs.appendChild(grad);

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const { x, y } = ctx.centre;
    const top = y - ry * REACH * 2;
    const ribbon = document.createElementNS(SVG, "path");
    ctx.body.appendChild(ribbon);
    ribbon.setAttribute("fill", `url(#${ctx.uid}-ribbon)`);
    ribbon.setAttribute("stroke", "none");

    ctx.onFrame(({ t }) => {
      // A slow lateral drift along its length, so the ribbon reads as
      // *trailing* rather than as a fin bolted to the body. The far end lags
      // the near one, which is the whole reason a real trail curves.
      const sway = Math.sin(t * 1.4) * rx * 0.5;
      const mid = Math.sin(t * 1.4 - 0.7) * rx * 0.25;
      const w = rx * WIDE;
      ribbon.setAttribute(
        "d",
        `M ${x - w} ${y} L ${x + w} ${y}` +
          ` Q ${x + mid + w * 0.4} ${(y + top) / 2} ${x + sway} ${top}` +
          ` Q ${x + mid - w * 0.4} ${(y + top) / 2} ${x - w} ${y} Z`,
      );
    });
  },
};
