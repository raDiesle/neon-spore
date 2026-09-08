import type { PulseLane, SimConfig } from "@neon-spore/sim";
import { type PulseState, pulseNoteTick } from "@neon-spore/sim";
import { hullBottom } from "./band-seam.js";
import { strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { pulseLaneColor, pulseLaneRim } from "./pulse-shape.js";
import { splinePath, splineSkirt } from "./spline.js";

/**
 * **The whole ship lit, by the one body that got past.**
 *
 * A body answered too late is not answered: it goes past its socket and sinks
 * into the hull (`pulse-drop.ts`), and until now the only sign of it was a
 * bloom the width of two sockets at the place it went in. The owner asked for
 * the rest — *when hit too late, the animation flash must be also for the full
 * ship visible flashing* — and this is it: for about half a second the entire
 * membrane carries the colour of the thing that hit it, from the skin down to
 * the band.
 *
 * **It is a wash and not a shock**, and that is the owner's choice between the
 * two. `hull-shock.ts` — the arcs that crawl the ship when a fence earths
 * through the dome — was the other option and he did not take it: a discharge
 * is what a live wire does, and a body falling through the skin is a thing
 * being absorbed. So the light comes from inside the hull rather than running
 * along it, brightest at the skin and thinning towards the bottom, which is
 * how everything else in this ship is lit (`hull.ts`, `sheen.ts`).
 *
 * **In the body's own colour**, never a damage red — the rule the game has
 * followed since the first crater.
 *
 * **There is no state here and there must not be.** A drop is a note this seat
 * judged as a miss, expiring on a tick the chart already fixes, so how bright
 * the ship is now is a function of `world.tick` and nothing else. Two devices
 * flash together without a message, and a round that restarts cannot leave the
 * hull lit (`render-state.ts`).
 */

/** Ticks the ship carries the colour. Long enough to be read as the ship being
 * hit, short enough that a bar with three misses in it is three flashes rather
 * than one long glow. It is the same seventy the body itself sinks for
 * (`pulse-drop.ts`), so the light goes out with the thing that caused it. */
const LIFE = 70;

/** Ticks it takes to come up. Short — the light arrives with the body, and a
 * hull that brightened slowly would read as a thing being lit rather than as
 * a thing being struck. */
const RISE = 4;

/** How strong the light is at its brightest, as an alpha on the fill. */
const PEAK = 0.62;

/** One wash: what colour, and how hard. */
export interface PulseWash {
  lane: PulseLane;
  /** 0 when the ship is quiet, 1 the moment the body goes through. */
  force: number;
}

/**
 * The wash this seat's screen owes right now, or none.
 *
 * The freshest drop wins outright rather than the strengths adding up: two
 * bodies through the skin a step apart is the ship struck twice, and a sum
 * would light it brighter than either and in a colour that belongs to neither.
 */
export function pulseWash(
  cfg: SimConfig,
  boss: PulseState,
  seat: 1 | 2,
  tick: number,
): PulseWash | null {
  const judged = seat === 1 ? boss.judged1 : boss.judged2;
  const from = seat === 1 ? boss.from1 : boss.from2;
  // Backwards from the cursor, the same walk `pulse-drop.ts` makes: the notes
  // are in step order, so the first one still inside its life is the freshest.
  for (let i = from - 1; i >= 0; i--) {
    const note = boss.notes[i];
    if (note === undefined) continue;
    const gone = pulseNoteTick(cfg, boss.startTick, note) + cfg.pulseGoodTicks + 1;
    const age = tick - gone;
    if (age > LIFE) return null;
    if (judged[i] !== 3 || age < 0) continue;
    const force = age < RISE ? age / RISE : 1 - (age - RISE) / (LIFE - RISE);
    return { lane: note.lane, force: Math.max(0, Math.min(1, force)) };
  }
  return null;
}

/**
 * The ship, washed. Drawn over the hull and under whatever is still falling.
 *
 * The membrane is rebuilt from the same sampler the hull pass was drawn from,
 * so the lit shape is the ship as the eye has it this tick and not a second
 * one a fraction of a frame away.
 */
export function drawPulseWash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  surfaceY: SurfaceY,
  wash: PulseWash | null,
): void {
  if (wash === null || wash.force <= 0) return;
  const bottom = hullBottom(l);
  const left = l.gridLeft;
  const right = l.gridLeft + l.gridWidth;
  const steps = 48;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = left + ((right - left) * i) / steps;
    pts.push({ x, y: surfaceY(x) });
  }
  let top = Number.POSITIVE_INFINITY;
  for (const p of pts) if (p.y < top) top = p.y;

  const body = splineSkirt(pts, right, bottom, left, bottom);
  const light = ctx.createLinearGradient(0, top, 0, bottom);
  light.addColorStop(0, pulseLaneRim(wash.lane));
  light.addColorStop(0.3, pulseLaneColor(wash.lane));
  // Not to nothing: the bottom of the hull is the part furthest from the skin
  // the body came through, and a wash that reached zero there lit a band along
  // the membrane rather than the ship. It ends dim, not absent.
  light.addColorStop(1, `${pulseLaneColor(wash.lane)}66`);

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, 0, right - left, bottom);
  ctx.clip();
  ctx.globalAlpha = PEAK * wash.force;
  ctx.fillStyle = light;
  ctx.fill(body);
  ctx.restore();

  // The skin itself, brightest of all: a hull lit from within still has an
  // edge, and without it the wash reads as fog over the ship rather than as
  // the ship being the thing that is lit.
  const edge = splinePath(pts, false);
  strokeGlow(ctx, edge, pulseLaneRim(wash.lane), Math.max(1.2, l.tile * 0.05), wash.force);
}
