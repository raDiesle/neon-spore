import { withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter } from "./sky-kit.js";

/**
 * AURORA — curtains of light hang across the top of the sky and ripple.
 *
 * Two curtains, one far and one nearer, each a row of tall thin strips that
 * are brightest along their lower hem and fade upward, the hem a slow wave
 * that travels sideways, the strips taller where the wave folds. A pale
 * green that is not the shield's cyan, warmed toward the act's colour, over
 * a starry black. The field's lower half is left to the stars, where the
 * bodies are thickest near the hull.
 *
 * One strip sprite baked per tint; a frame is the stars and about ninety
 * blits of it.
 */

interface Curtain {
  /** The hem's height as a share of the sky. */
  readonly hem: number;
  /** Tallest strip, as a share of the sky. */
  readonly reach: number;
  /** The hem's sway, as a share of the sky. */
  readonly sway: number;
  readonly speed: number;
  readonly phase: number;
  readonly alpha: number;
  readonly strips: number;
  readonly colour: string;
}

const GREEN = "#B4F08C";
const ROSE = "#E08CF0";

const CURTAINS: readonly Curtain[] = [
  {
    hem: 0.3,
    reach: 0.26,
    sway: 0.05,
    speed: 0.22,
    phase: 0,
    alpha: 0.38,
    strips: 22,
    colour: ROSE,
  },
  {
    hem: 0.44,
    reach: 0.34,
    sway: 0.07,
    speed: -0.17,
    phase: 2.1,
    alpha: 0.6,
    strips: 26,
    colour: GREEN,
  },
];

function stripSheet(colour: string): HTMLCanvasElement {
  return baked(`aurora-strip${colour}`, 16, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, withAlpha(colour, 0));
    grad.addColorStop(0.04, withAlpha(colour, 1));
    grad.addColorStop(0.25, withAlpha(colour, 0.5));
    grad.addColorStop(1, withAlpha(colour, 0));
    g.fillStyle = grad;
    // Soft sides, so neighbouring strips blend into a sheet.
    const side = g.createLinearGradient(0, 0, w, 0);
    g.fillRect(0, 0, w, h);
    side.addColorStop(0, "rgba(0,0,0,1)");
    side.addColorStop(0.5, "rgba(0,0,0,0)");
    side.addColorStop(1, "rgba(0,0,0,1)");
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = side;
    g.fillRect(0, 0, w, h);
  });
}

export function skyAurora(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 61_000, far: 190 });

  lighter(ctx, () => {
    for (const c of CURTAINS) {
      const sheet = stripSheet(mixHex(c.colour, actTint(d), 0.25));
      const sw = (l.width / c.strips) * 2.2;
      for (let i = 0; i <= c.strips; i++) {
        const s = i / c.strips;
        const t = time * c.speed + c.phase;
        const fold = Math.sin(s * 7.5 + t * 2.3) * 0.6 + Math.sin(s * 3.1 - t * 1.4) * 0.4;
        const hem = (c.hem + fold * c.sway) * height;
        const tall = c.reach * height * (0.55 + 0.45 * Math.abs(Math.sin(s * 5.3 + t)));
        // The curtain thins out at both ends of the sky.
        const ends = Math.sin(Math.PI * Math.min(1, Math.max(0, s * 1.15 - 0.05)));
        ctx.globalAlpha = c.alpha * ends * (0.7 + 0.3 * Math.sin(s * 19 + t * 3));
        const x = s * l.width + Math.sin(s * 4 + t) * l.width * 0.04;
        ctx.drawImage(sheet, x - sw / 2, hem - tall, sw, tall);
      }
    }
  });
}
