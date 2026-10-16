import { bakedCache } from "./baked.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * **The light a lit siren throws round itself** — the owner, 16 October 2026:
 * *the siren's light could shine over more of the area around it when the
 * alarm is on.* A dial with a glow two radii wide was a lamp on the panel; a
 * siren is a lamp that lights the room. So a lit dial throws two beams turning
 * like a rotating beacon and a wide wash under them, and a torch on its way —
 * the one call that cannot start late (`comms.ts`) — turns them faster, wider
 * and in the torch's own ember.
 *
 * The beams are one sprite baked per colour and reach and turned with the
 * context, so a frame pays one `drawImage` for them however wide they reach.
 * Additive, like `halo`: they lift what is under them and never cover it.
 */

/** How far the beams reach, from the dial's middle, for a call and for a torch. */
const CALL_REACH = 96;
const TORCH_REACH = 150;
/** Turns a second. A beacon, not a fan: slow enough to be followed by eye. */
const CALL_TURN = 0.35;
const TORCH_TURN = 0.8;
/** Half the angle of one beam, in radians. */
const BEAM_HALF = 0.32;

const beamCache = bakedCache<string, HTMLCanvasElement>();

/** Both beams, pointing left and right, faded with distance from the middle. */
function beamSprite(color: string, reach: number): HTMLCanvasElement {
  const key = `${color}@${reach}`;
  const cached = beamCache.get(key);
  if (cached) return cached;
  const size = reach * 2;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const grad = g.createRadialGradient(reach, reach, 0, reach, reach, reach);
    grad.addColorStop(0, `${color}cc`);
    grad.addColorStop(0.35, `${color}55`);
    grad.addColorStop(1, `${color}00`);
    g.fillStyle = grad;
    g.beginPath();
    for (const a of [0, Math.PI]) {
      g.moveTo(reach, reach);
      g.arc(reach, reach, reach, a - BEAM_HALF, a + BEAM_HALF);
      g.closePath();
    }
    g.fill();
  }
  beamCache.set(key, c);
  return c;
}

/**
 * The beams and the wash, round a dial standing at (cx, cy). `torch` is
 * whether a torch is on its way, which is the alarm at its loudest.
 */
export function drawSirenShine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  torch: boolean,
): void {
  const reach = torch ? TORCH_REACH : CALL_REACH;
  const color = torch ? PALETTE.ember : PALETTE.text;
  const sprite = beamSprite(color, reach);
  const turn = time * Math.PI * 2 * (torch ? TORCH_TURN : CALL_TURN);
  const flare = 0.5 + 0.5 * Math.sin(time * (torch ? 9 : 4));

  // No save of its own: `drawSiren` holds one round the whole cluster, and a
  // second would be one more on every frame a siren is lit, which the wave
  // budgets count (`wave-budget.test.ts`). So the turn is undone by hand.
  halo(
    ctx,
    cx,
    cy,
    reach * 0.75,
    torch ? PALETTE.ember : PALETTE.cyan,
    torch ? 0.22 + 0.14 * flare : 0.16 + 0.06 * flare,
  );
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = torch ? 0.42 + 0.2 * flare : 0.34 + 0.08 * flare;
  ctx.translate(cx, cy);
  ctx.rotate(turn);
  ctx.drawImage(sprite, -reach, -reach);
  ctx.rotate(-turn);
  ctx.translate(-cx, -cy);
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
}
