import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * AURORA — curtains of light hang across the top of the sky and ripple.
 *
 * Three curtains — a faint violet one high and far, a rose one, and the
 * green nearest — each a row of tall soft rays laid so close that they
 * melt into one sheet. A curtain is brightest along its lower hem, a pale
 * line almost white, and fades upward into a second colour, the way a real
 * aurora goes from green to rose at its top. The hem is a slow wave that
 * travels sideways; the rays grow taller where it folds, and the light
 * gathers and thins along the curtain in broad slow swells, never ray by
 * ray. A pale green that is not the shield's cyan, warmed toward the act's
 * colour, over a starry black. The field's lower half is left to the
 * stars, where the bodies are thickest near the hull.
 *
 * Under them the sky itself glows green, breathing as the curtains brighten.
 *
 * The owner found the first aurora *pixeled* on 16 October 2026: sixty
 * strips each with its own flicker read as columns, and a 16-by-256 strip
 * and a 256 glow were stretched up to seven times on a phone. Now the rays
 * overlap four deep, their brightness changes only slowly along the
 * curtain, and every sheet is baked at the size it is drawn.
 *
 * One ray sprite baked per curtain, tint and size; a frame is the deep sky,
 * the glow and about a hundred rays.
 */

interface Curtain {
  /** The hem's height as a share of the sky. */
  readonly hem: number;
  /** Tallest ray, as a share of the sky. */
  readonly reach: number;
  /** The hem's sway, as a share of the sky. */
  readonly sway: number;
  readonly speed: number;
  readonly phase: number;
  readonly alpha: number;
  readonly rays: number;
  /** The colour along the hem, and the one it fades into at the top. */
  readonly colour: string;
  readonly crown: string;
}

const GREEN = "#B4F08C";
const ROSE = "#E08CF0";
const VIOLET = "#A8A0F8";
/** Rays overlap this many deep, so no single one can be seen. */
const OVERLAP = 3;

const CURTAINS: readonly Curtain[] = [
  {
    hem: 0.17,
    reach: 0.16,
    sway: 0.03,
    speed: 0.13,
    phase: 4.4,
    alpha: 0.3,
    rays: 22,
    colour: VIOLET,
    crown: "#7C8CF8",
  },
  {
    hem: 0.3,
    reach: 0.26,
    sway: 0.05,
    speed: 0.22,
    phase: 0,
    alpha: 0.5,
    rays: 34,
    colour: ROSE,
    crown: VIOLET,
  },
  {
    hem: 0.44,
    reach: 0.34,
    sway: 0.07,
    speed: -0.17,
    phase: 2.1,
    alpha: 0.85,
    rays: 44,
    colour: GREEN,
    crown: ROSE,
  },
];

/** Fine streaks inside one ray: where across it each sits, and how bright. */
const STREAKS = [
  [0.36, 0.7],
  [0.5, 1],
  [0.63, 0.55],
] as const;

/** How much of a ray is across `x` (0 to 1): a bell, grained by the streaks. */
function across(x: number): number {
  const bell = Math.exp(-(((x - 0.5) / 0.26) ** 2));
  let grain = 0;
  for (const [at, a] of STREAKS) grain += a * Math.exp(-(((x - at) / 0.05) ** 2));
  return bell * (0.55 + 0.45 * Math.min(1, grain));
}

/** One ray: a bright hem a little above its foot, fading up into `crown`,
 * with sides that fall off as a bell so neighbours blend, and a few fine
 * streaks in it — the grain an aurora has, soft enough to stay smooth. */
function raySheet(colour: string, crown: string, h: number): HTMLCanvasElement {
  return baked(`aurora-ray${colour}${crown}`, 96, Math.min(1024, h), (g, w, ph) => {
    const hem = mixHex(colour, "#FFFFFF", 0.45);
    const up = g.createLinearGradient(0, ph, 0, 0);
    up.addColorStop(0, withAlpha(colour, 0));
    up.addColorStop(0.03, withAlpha(colour, 0.35));
    up.addColorStop(0.07, withAlpha(hem, 1));
    up.addColorStop(0.13, withAlpha(colour, 0.75));
    up.addColorStop(0.35, withAlpha(colour, 0.4));
    up.addColorStop(0.65, withAlpha(crown, 0.2));
    up.addColorStop(0.85, withAlpha(crown, 0.07));
    up.addColorStop(1, withAlpha(crown, 0));
    g.fillStyle = up;
    g.fillRect(0, 0, w, ph);
    const side = g.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 48; i++) side.addColorStop(i / 48, `rgba(0,0,0,${across(i / 48)})`);
    g.globalCompositeOperation = "destination-in";
    g.fillStyle = side;
    g.fillRect(0, 0, w, ph);
  });
}

export function skyAurora(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 61_000, far: 190 });

  lighter(ctx, () => {
    // The sky under the curtains, lit green and breathing.
    const glow = l.width * 1.6;
    ctx.globalAlpha = 0.14 + 0.05 * Math.sin(time * 0.3);
    ctx.drawImage(
      skyGlow(mixHex(GREEN, actTint(d), 0.3), Math.min(1024, glow / 2), [0, 0.35, 1]),
      l.width / 2 - glow / 2,
      height * 0.4 - glow / 2,
      glow,
      glow,
    );
    for (const [j, c] of CURTAINS.entries()) {
      const reach = c.reach * height;
      const sheet = raySheet(
        mixHex(c.colour, actTint(d), 0.25),
        mixHex(c.crown, actTint(d), 0.25),
        reach,
      );
      const rw = (l.width / c.rays) * OVERLAP;
      const t = time * c.speed + c.phase;
      for (let i = 0; i <= c.rays; i++) {
        const s = i / c.rays;
        const fold = Math.sin(s * 7.5 + t * 2.3) * 0.6 + Math.sin(s * 3.1 - t * 1.4) * 0.4;
        const hem = (c.hem + fold * c.sway) * height;
        const rise = 0.5 + 0.5 * Math.sin(s * 5.3 + t);
        const tall = reach * (0.6 + 0.4 * rise * rise);
        // The curtain thins out at both ends of the sky.
        const ends = Math.sin(Math.PI * Math.min(1, Math.max(0, s * 1.15 - 0.05)));
        // Broad swells of light along the curtain, never ray by ray.
        const swell = 0.75 + 0.25 * Math.sin(s * 4.2 - t * 1.7);
        ctx.globalAlpha = c.alpha * ends * swell;
        // Each ray its own width and a nudge off the even spacing, so the
        // grain in neighbouring rays never lines up into a grating.
        const w = rw * (0.85 + 0.4 * hash01(62_000 + j * 100 + i));
        const nudge = (hash01(63_000 + j * 100 + i) - 0.5) * 0.4 * (l.width / c.rays);
        const x = s * l.width + nudge + Math.sin(s * 4 + t) * l.width * 0.04;
        ctx.drawImage(sheet, x - w / 2, hem - tall, w, tall);
      }
    }
  });
}
