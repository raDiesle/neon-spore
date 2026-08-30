import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * Rings leaving the body, over and over, on the page's beat.
 *
 * The fourth answer in the aura-and-halo direction, and the one that puts the
 * glow *in time* rather than in space. AURA is one ring that breathes in
 * place; this is a succession of rings that leave and are replaced, which is
 * the difference between a thing that is charged and a thing that is
 * **emitting**.
 *
 * ## It is deliberately close to HIT's RING, and that is the comparison
 *
 * RING is a shockwave: one ring, triggered, gone. This is the same picture on
 * a loop with nothing triggering it. Having both on the page is how the owner
 * can settle a question the two axes otherwise dodge — whether a repeating
 * pulse reads as *this body is dangerous* or merely as *this body is busy*,
 * and whether it steals the reading of an actual impact when one lands. A
 * creature wearing a permanent pulse and then being hit had better not look
 * the same in both moments.
 *
 * Three rings on one clock at even offsets, so the emission is continuous with
 * no gap where the eye notices the loop restarting. Two was not enough — the
 * gap between the third ring dying and the first being reborn read as a
 * stutter — and four is indistinguishable from three at this size.
 */
const RINGS = 3;
const REACH = 1.75;
/** Beats for one ring to travel from the body to nothing. */
const BEATS = 2;

export const PULSE: Glow<"pulse"> = {
  id: "pulse",
  label: "PULSE",
  hint: "rings leaving the body over and over — a thing emitting, versus AURA's thing charged",
  layer: "under",
  spread: REACH - 1 + 0.05,
  build(ctx) {
    const rings: SVGEllipseElement[] = [];
    for (let i = 0; i < RINGS; i++) {
      const e = document.createElementNS(SVG, "ellipse");
      e.setAttribute("cx", String(ctx.centre.x));
      e.setAttribute("cy", String(ctx.centre.y));
      e.setAttribute("fill", "none");
      e.setAttribute("stroke", ctx.colour);
      e.setAttribute("stroke-opacity", "0");
      ctx.body.appendChild(e);
      rings.push(e);
    }

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;

    ctx.onFrame(({ t, beat }) => {
      // `beat` is the page's shared phase and is what keeps thirty cards
      // pulsing together; `t` carries the slower multi-beat cycle a single
      // ring lives across, which `beat` alone cannot express since it wraps
      // every beat. Both, rather than a private clock.
      void beat;
      for (let i = 0; i < RINGS; i++) {
        const e = rings[i];
        if (!e) continue;
        const p = (((t / (BEATS * 0.625) + i / RINGS) % 1) + 1) % 1;
        const out = 1 + (REACH - 1) * p;
        e.setAttribute("rx", (rx * out).toFixed(2));
        e.setAttribute("ry", (ry * out).toFixed(2));
        // Thins as it goes as well as fading, so a ring reads as a wave
        // spreading rather than as a second outline drifting off the body.
        e.setAttribute("stroke-width", (ctx.weight * 1.6 * (1 - p)).toFixed(2));
        // Born at nothing rather than at full strength: a ring that appears
        // already bright on the contour reads as a flicker in the outline.
        const fade = Math.min(1, p * 6) * (1 - p);
        e.setAttribute("stroke-opacity", (fade * 0.7).toFixed(3));
      }
    });
  },
};
