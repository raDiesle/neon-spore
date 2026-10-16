import { broodBelly, type SacBox } from "./brood-place.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **The machine THE BROOD hangs in** — the owner, 16 October 2026: *it should
 * look like something what is producing enemies. can also be like a
 * producing machine instead which looks complex.* So the sac is a womb in a
 * rig: hung on cables from above the frame (which is why it can sway), a
 * pump-head clamped on its crown working on the beat, and feed tubes wrapped
 * round its body from the head to the belly, carrying lit pulses down into it.
 *
 * - **The harness** (`drawBroodHarness`) is drawn *behind* the flesh: the
 *   cables and the pump-head stand above the sac and the lobes along its top
 *   — its health — stay in front of them, never covered.
 * - **The feed tubes** (`drawBroodTubes`) are drawn *on* it. Each is a
 *   longitude of the sac's own outline, placed by angle round its upright
 *   axis, so a rest's half turn carries the near ones round and away and
 *   brings the far ones forward — the sac is seen to turn, not to squash. A
 *   far tube is seen faintly through the slime. While it lays they clamp:
 *   thicker and brighter, the pulses faster.
 */

/** Longitudes of the feed tubes round the sac, at no turn. */
const TUBES = [-1.15, -0.4, 0.4, 1.15, Math.PI - 0.75, Math.PI + 0.75];
/** Points down a tube, top to belly. */
const STEPS = 14;
const METAL = PALETTE.rockDark;
/** How far up the cables are seen before the dark takes them, in tiles. */
const CABLE_TILES = 1.6;
const METAL_LIT = PALETTE.rock;

/**
 * The cables and the pump-head, behind the sac. `beatPhase` drives the two
 * pistons, which strike in turn on the beat; `work` (0..1) is how hard the
 * machine is labouring — laying or about to lurch.
 */
export function drawBroodHarness(
  ctx: CanvasRenderingContext2D,
  sac: SacBox,
  tile: number,
  beatPhase: number,
  work: number,
  spent: boolean,
): void {
  // Over the lobes along its top, so the health they show is never behind it.
  const headY = sac.y - sac.ry - tile * 0.5;
  ctx.save();
  ctx.lineCap = "round";
  // Two cables up into the dark, and a thin one between them — fading out
  // two tiles up, because no boss touches the top of the screen (the owner,
  // 29 September 2026; `render/test/boss-top.test.ts`).
  const reach = tile * CABLE_TILES;
  for (const side of [-1, 0, 1]) {
    const x0 = sac.x + side * tile * 0.9;
    const x1 = sac.x + side * tile * 1.05;
    const fade = ctx.createLinearGradient(0, headY, 0, headY - reach);
    const hex = side === 0 ? PALETTE.dim : METAL_LIT;
    fade.addColorStop(0, rgba(hex, side === 0 ? 0.5 : 0.75));
    fade.addColorStop(1, rgba(hex, 0));
    ctx.strokeStyle = fade;
    ctx.lineWidth = tile * (side === 0 ? 0.06 : 0.11);
    ctx.beginPath();
    ctx.moveTo(x0, headY);
    ctx.lineTo(x1, headY - reach);
    ctx.stroke();
  }
  // The feed pipe from the head down into the crown, where the tubes meet.
  ctx.strokeStyle = rgba(METAL, 1);
  ctx.lineWidth = tile * 0.42;
  ctx.beginPath();
  ctx.moveTo(sac.x, headY);
  ctx.lineTo(sac.x, sac.y - sac.ry + tile * 0.3);
  ctx.stroke();
  ctx.strokeStyle = rgba(METAL_LIT, 0.7);
  ctx.lineWidth = tile * 0.12;
  ctx.beginPath();
  ctx.moveTo(sac.x - tile * 0.08, headY);
  ctx.lineTo(sac.x - tile * 0.08, sac.y - sac.ry + tile * 0.3);
  ctx.stroke();
  // The pistons, each a rod out of the head, struck in turn on the beat.
  for (const side of [-1, 1]) {
    const phase = (beatPhase + (side > 0 ? 0.5 : 0)) % 1;
    const stroke = spent ? 0 : Math.abs(Math.sin(phase * Math.PI)) * (0.6 + 0.4 * work);
    const x = sac.x + side * tile * 0.7;
    const y = headY - tile * (0.45 + 0.45 * stroke);
    ctx.fillStyle = rgba(METAL, 1);
    ctx.strokeStyle = rgba(METAL_LIT, 0.8);
    ctx.lineWidth = Math.max(1, tile * 0.05);
    ctx.fillRect(x - tile * 0.12, y, tile * 0.24, headY - y);
    ctx.strokeRect(x - tile * 0.12, y, tile * 0.24, headY - y);
    ctx.beginPath();
    ctx.ellipse(x, y, tile * 0.26, tile * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // The head: a squat drum clamped over the crown, lit from above-left.
  const w = tile * 2.3;
  const h = tile * 0.75;
  const g = ctx.createLinearGradient(sac.x - w / 2, 0, sac.x + w / 2, 0);
  g.addColorStop(0, mixHex(METAL_LIT, METAL, 0.35));
  g.addColorStop(0.35, METAL_LIT);
  g.addColorStop(1, mixHex(METAL, PALETTE.background, 0.4));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(sac.x, headY, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(METAL, 1);
  ctx.lineWidth = Math.max(1.5, tile * 0.07);
  ctx.stroke();
  // Its lamp, which beats with the pump and burns while it works.
  const lamp = spent ? PALETTE.dim : PALETTE.organRim;
  ctx.fillStyle = rgba(lamp, spent ? 0.4 : 0.45 + 0.4 * Math.max(work, 1 - beatPhase));
  ctx.beginPath();
  ctx.arc(sac.x, headY - h * 0.05, tile * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The feed tubes on the sac, inside its outline: `clip` is the body. `time`
 * runs the pulses down them; `work` clamps them.
 */
export function drawBroodTubes(
  ctx: CanvasRenderingContext2D,
  clip: Path2D,
  sac: SacBox,
  tile: number,
  time: number,
  work: number,
  spent: boolean,
): void {
  ctx.save();
  ctx.clip(clip);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < TUBES.length; i++) {
    const a = (TUBES[i] ?? 0) + sac.turn;
    const facing = Math.cos(a);
    const across = Math.sin(a);
    const near = Math.max(0, facing);
    const pts: { x: number; y: number }[] = [];
    for (let j = 0; j <= STEPS; j++) {
      // From the crown (straight up) round the right side to the belly's bottom.
      const p = broodBelly(sac, -Math.PI / 2 + (Math.PI * j) / STEPS, 0.97);
      pts.push({ x: sac.x + (p.x - sac.x) * across, y: p.y });
    }
    const path = new Path2D();
    pts.forEach((p, j) => {
      if (j === 0) path.moveTo(p.x, p.y);
      else path.lineTo(p.x, p.y);
    });
    const width = tile * (0.24 + 0.06 * work) * (0.55 + 0.45 * near);
    // A far tube, faint through the slime; a near one, a lit metal pipe.
    ctx.globalAlpha = sac.alpha * (facing > 0 ? 1 : 0.22);
    ctx.strokeStyle = rgba(spent ? PALETTE.rockDark : METAL, 1);
    ctx.lineWidth = width;
    ctx.stroke(path);
    if (facing <= 0) continue;
    ctx.strokeStyle = rgba(mixHex(METAL, METAL_LIT, 0.45), near);
    ctx.lineWidth = width * 0.6;
    ctx.stroke(path);
    ctx.strokeStyle = rgba(mixHex(METAL_LIT, PALETTE.organRim, work), 0.8 * near);
    ctx.lineWidth = width * 0.18;
    ctx.stroke(path);
    // The clamps that hold it to the skin, across it every few points.
    ctx.strokeStyle = rgba(METAL, near);
    ctx.lineWidth = width * 0.35;
    for (let j = 3; j < STEPS; j += 4) {
      const p = pts[j];
      const q = pts[j + 1];
      if (p === undefined || q === undefined) continue;
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * width * 0.9;
      const ny = (dx / len) * width * 0.9;
      ctx.beginPath();
      ctx.moveTo(p.x - nx, p.y - ny);
      ctx.lineTo(p.x + nx, p.y + ny);
      ctx.stroke();
    }
    if (spent) continue;
    // Two lit pulses running down it, faster while it works.
    for (const off of [0, 0.5]) {
      const u = (time * (0.35 + 0.5 * work) + off + i * 0.17) % 1;
      const at = pts[Math.min(STEPS, Math.floor(u * STEPS))];
      if (at === undefined) continue;
      ctx.fillStyle = rgba(PALETTE.organRim, 0.85 * near);
      ctx.beginPath();
      ctx.arc(at.x, at.y, width * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
