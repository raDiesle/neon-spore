import { halo } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import * as look from "../../../../../packages/render/src/pod-look.js";
import { patch, type Variant } from "../../../variant.js";
import { blinkAt, drawBack, drawFront, type Moored, type Seed, seedAt, type V } from "../seed.js";

/**
 * **SMART, with sparks circling it** — the same tumbling seed, and three
 * white sparks orbiting it on a tilted ring with tails behind them, passing
 * in front of the sphere and behind it, the way a power-up is circled in a
 * game. They blink on the count (`blinkAt`) and circle faster as the clock
 * runs out.
 */
const SPARKS = 3;
const TAIL = 9;
/** The ring's tilt: its near side dips, so it reads as a ring, not a line. */
const TILT = 0.42;

export const orbitPod: Moored = (ctx, l, x, y, t, beatsLeft) => {
  const s = seedAt(l, x, y, t, beatsLeft);
  const spin = t * (1.6 + 2.6 * s.awake);
  const lit = 0.6 + 0.4 * blinkAt(t, beatsLeft);
  const style = { spike: "cone", skin: "panels" } as const;
  drawBack(ctx, s, style);
  ctx.save();
  sparks(ctx, s, spin, lit, false);
  ctx.restore();
  ctx.save();
  drawFront(ctx, s, style);
  sparks(ctx, s, spin, lit, true);
  ctx.restore();
};

function at(a: number): V {
  return { x: Math.cos(a), y: Math.sin(a) * Math.sin(TILT), z: Math.sin(a) * Math.cos(TILT) };
}

/** The sparks on one side of the sphere — the near side over it, the far under. */
function sparks(ctx: CanvasRenderingContext2D, s: Seed, spin: number, lit: number, near: boolean) {
  const rr = s.R * 1.65;
  ctx.lineCap = "round";
  for (let k = 0; k < SPARKS; k++) {
    const a0 = spin + (k / SPARKS) * Math.PI * 2;
    for (let j = TAIL; j >= 0; j--) {
      const p = at(a0 - j * 0.11);
      if (p.z > 0 !== near) continue;
      const fade = 1 - j / (TAIL + 1);
      const depth = 0.55 + 0.45 * p.z;
      const px = s.x + p.x * rr;
      const py = s.y + p.y * rr;
      ctx.globalAlpha = lit * fade * (near ? 1 : 0.55);
      ctx.fillStyle = j === 0 ? "#FFFFFF" : PALETTE.podRim;
      ctx.beginPath();
      ctx.arc(px, py, s.R * (j === 0 ? 0.3 : 0.2 * fade) * depth, 0, Math.PI * 2);
      ctx.fill();
      if (j === 0 && near) halo(ctx, px, py, s.R * 0.9, "#FFFFFF", 0.5 * lit);
    }
  }
}

export const POD_REAL_ORBIT: Variant = {
  slot: "pod:real",
  name: "orbit",
  sentence:
    "SMART's tumbling seed, panelled like a ball and spiked with cones, circled by three white sparks on a tilted ring, passing in front and behind, blinking on the count like a power-up",
  dir: "tools/versus/candidates/pod-real/orbit",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: orbitPod },
    }),
  ],
};
