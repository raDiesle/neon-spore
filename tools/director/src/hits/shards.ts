import { streamFor } from "../skins/seed.js";
import { SVG } from "../skins/types.js";
import type { Hit } from "./types.js";

/**
 * A burst of short strokes thrown outward and falling away.
 *
 * The aftermath as debris rather than as light — the *coin burst* half of what
 * the owner called juice, and the thing that says a hit took something off
 * rather than merely landing on it.
 *
 * Strokes and not dots, which is the one decision in the file. SPARKS on the
 * GLOW axis is already a field of round motes, and a second field of round
 * motes on a different axis would be the same picture twice. A short line has
 * a *direction*, so a shard reads as having been thrown from somewhere, which
 * is what separates debris from a particle system.
 *
 * Seeded from the name, and nothing is allocated per frame: twelve lines and
 * three plain arrays, built once. Rule (b) and rule (d) both.
 */
const SHARDS_N = 12;
const BORN = 0.7;
const DIES = 1.75;

export const SHARDS: Hit<"shards"> = {
  id: "shards",
  label: "SHARDS",
  hint: "short strokes thrown outward on impact — debris with a direction, not more sparks",
  phase: "after",
  spread: DIES - 1 + 0.08,
  build(ctx) {
    const rand = streamFor(ctx.name);
    const lines: SVGLineElement[] = [];
    const angle: number[] = [];
    const speed: number[] = [];
    const len: number[] = [];
    for (let i = 0; i < SHARDS_N; i++) {
      const l = document.createElementNS(SVG, "line");
      l.setAttribute("stroke", ctx.colour);
      l.setAttribute("stroke-linecap", "round");
      l.setAttribute("stroke-width", String(ctx.weight * 0.9));
      l.setAttribute("stroke-opacity", "0");
      ctx.body.appendChild(l);
      lines.push(l);
      // Spread evenly and then jittered, rather than twelve free angles: pure
      // randomness clumps, and a clumped burst reads as the body leaking from
      // one side.
      angle.push((i / SHARDS_N) * Math.PI * 2 + (rand() - 0.5) * 0.5);
      speed.push(0.75 + rand() * 0.5);
      len.push(0.12 + rand() * 0.16);
    }

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;

    ctx.onFrame(({ hit }) => {
      const s = hit.shock;
      for (let i = 0; i < SHARDS_N; i++) {
        const l = lines[i];
        const a = angle[i];
        const v = speed[i];
        const ln = len[i];
        if (!l || a === undefined || v === undefined || ln === undefined) continue;
        if (s <= 0) {
          l.setAttribute("stroke-opacity", "0");
          continue;
        }
        const p = Math.min(1, (1 - s) * v);
        const at = BORN + (DIES - BORN) * p;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        l.setAttribute("x1", (ctx.centre.x + ca * rx * at).toFixed(2));
        l.setAttribute("y1", (ctx.centre.y + sa * ry * at).toFixed(2));
        l.setAttribute("x2", (ctx.centre.x + ca * rx * (at + ln)).toFixed(2));
        l.setAttribute("y2", (ctx.centre.y + sa * ry * (at + ln)).toFixed(2));
        l.setAttribute("stroke-opacity", (s * 0.9).toFixed(3));
      }
    });
  },
};
