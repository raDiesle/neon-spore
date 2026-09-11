import { blobPath, openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { seamY } from "../../../../../packages/render/src/band-seam.js";
import { beadedCords } from "../../../../../packages/render/src/gland-cord.js";
import { curve, tube } from "../../../../../packages/render/src/gland-tube.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { LobeDraw } from "../../../../../packages/render/src/lobe-look.js";
import type { NerveDraw } from "../../../../../packages/render/src/ship-nerves.js";
import type { SlimeDraw } from "../../../../../packages/render/src/slime-look.js";

/**
 * The paint POLYP is made of: a button held up on a stalk out of the floor,
 * in a cup of coral with cilia round its lip.
 *
 * Parts off the shape sheet, by name: the **stub** is the stalk, a tapered
 * tube rising from under the band's floor and bending a little as it comes;
 * the **coral** is the cup, a nine-lobed ring the button sits in; the
 * **cilia** are the short hairs round the cup's lip; and what hangs from the
 * roof is **filament** — threads, not pendants. Everything that does not move
 * is baked once per button and held, the way `gland-organ.ts` holds its beds.
 */

interface Stalk {
  readonly stem: Path2D;
  readonly cup: Path2D;
  readonly cilia: Path2D;
  /** Where each cilium leaves the lip, for the light that walks them. */
  readonly lip: readonly Point[];
}
const stalks = new Map<string, Stalk>();
const CILIA = 16;

function stalkFor(x: number, y: number, r: number): Stalk {
  const key = `${x}|${y}|${r}`;
  const held = stalks.get(key);
  if (held) return held;
  if (stalks.size > 8) stalks.clear();
  const foot = { x: x + r * 0.8, y: y + r * 2.3 };
  const neck = { x, y: y + r * 0.6 };
  const mid = curve(
    foot,
    neck,
    { x: x + r * 1.0, y: y + r * 1.7 },
    { x: x - r * 0.15, y: y + r * 1.2 },
    10,
  );
  const stem = new Path2D(tube(mid, (p) => r * (0.5 - 0.14 * p)));
  const cup = new Path2D(blobPath(x, y + r * 0.08, r * 1.3, r * 1.22, 9, 0.16, 0.03, 0, 5, 54));
  const cilia = new Path2D();
  const lip: Point[] = [];
  for (let i = 0; i < CILIA; i++) {
    const a = (i / CILIA) * Math.PI * 2 + hash01(i * 3 + 1) * 0.2;
    const from = { x: x + Math.cos(a) * r * 1.28, y: y + r * 0.08 + Math.sin(a) * r * 1.2 };
    const len = r * (0.28 + hash01(i * 11 + 2) * 0.22);
    const tip = { x: from.x + Math.cos(a) * len, y: from.y + Math.sin(a) * len };
    const c = {
      x: from.x + Math.cos(a + 0.7) * len * 0.5,
      y: from.y + Math.sin(a + 0.7) * len * 0.5,
    };
    cilia.addPath(new Path2D(openSmoothPath(curve(from, tip, c, tip, 5))));
    lip.push(from);
  }
  const s = { stem, cup, cilia, lip };
  stalks.set(key, s);
  return s;
}

/** Under the face: the stalk, then the coral cup over its neck. */
export function stalk(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  const s = stalkFor(x, y, r);
  // Lit on its left flank, in shadow on its right — across the stem, which
  // leans right as it goes down, so the run is from the stem's own edges.
  const stemLight = ctx.createLinearGradient(x - r * 0.1, 0, x + r * 1.3, 0);
  stemLight.addColorStop(0, rgba(skin.flesh[0], 0.9));
  stemLight.addColorStop(0.5, rgba(skin.flesh[1], 0.85));
  stemLight.addColorStop(1, rgba(skin.flesh[2], 0.75));
  ctx.fillStyle = stemLight;
  ctx.fill(s.stem);
  ctx.strokeStyle = rgba(skin.rim, 0.18);
  ctx.lineWidth = Math.max(0.6, r * 0.03);
  ctx.stroke(s.stem);
  // The cilia before the cup, so their roots are under its lip.
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[0], 0.55);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.stroke(s.cilia);
  const cupLight = ctx.createRadialGradient(
    x - r * 0.3,
    y - r * 0.4,
    r * 0.4,
    x,
    y + r * 0.1,
    r * 1.32,
  );
  cupLight.addColorStop(0, rgba(skin.flesh[0], 0.85));
  cupLight.addColorStop(0.7, rgba(skin.flesh[1], 0.8));
  cupLight.addColorStop(1, rgba(skin.flesh[2], 0.75));
  ctx.fillStyle = cupLight;
  ctx.fill(s.cup);
  ctx.strokeStyle = rgba(skin.rim, 0.3);
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke(s.cup);
  // The button sinks into the cup: a dark throat round it.
  const throat = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.18);
  throat.addColorStop(0, rgba(skin.ground[3], 0.8));
  throat.addColorStop(1, rgba(skin.ground[3], 0));
  ctx.fillStyle = throat;
  ctx.fillRect(x - r * 1.3, y - r * 1.3, r * 2.6, r * 2.6);
}

/** Over the face: the wet lip of the cup, and a bead of light on every lobe
 * of it — a comb-row round the mouth. */
export function mouth(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.rim, 0.5);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.arc(x, y, r * 1.06, Math.PI * 1.05, Math.PI * 1.6);
  ctx.stroke();
  ctx.fillStyle = rgba(skin.hull.edge, 0.55);
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const a = ((i + 0.5) / 9) * Math.PI * 2;
    const px = x + Math.cos(a) * r * 1.3;
    const py = y + r * 0.08 + Math.sin(a) * r * 1.22;
    ctx.moveTo(px + r * 0.05, py);
    ctx.arc(px, py, r * 0.05, 0, Math.PI * 2);
  }
  ctx.fill();
}

/** What moves: light climbing the stalk, a bright bead walking the cilia, and
 * PLASM's cords on up to the organ. */
export function waving(d: NerveDraw, beads: number): void {
  const { ctx, time, skin } = d;
  for (const [i, lobe] of d.lobes.entries()) {
    const { x, y, r } = lobe.circle;
    const s = stalkFor(x, y, r);
    // Two pulses of light going up the stem, each a halo on its centreline.
    for (let k = 0; k < 2; k++) {
      const p = (time * 0.35 + k * 0.5 + hash01(i * 5 + k)) % 1;
      const px = x + r * 0.8 * (1 - p) ** 1.4;
      const py = y + r * 0.6 + (1 - p) * r * 1.7;
      halo(
        ctx,
        px,
        py,
        Math.round((r * 0.9) / 2) * 2,
        skin.tint,
        0.12 + 0.18 * Math.sin(p * Math.PI),
      );
    }
    // One bead walking the lip, lighting the cilium it passes.
    const at = (time * 0.6 + i * 0.37) % 1;
    const c = s.lip[Math.floor(at * CILIA) % CILIA] as Point;
    halo(ctx, c.x, c.y, Math.round((r * 0.6) / 2) * 2, skin.tint, 0.4);
    ctx.fillStyle = rgba(skin.rim, 0.85);
    ctx.beginPath();
    ctx.arc(c.x, c.y, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  beadedCords(d, beads);
}

/** From the roof: filaments hanging over each polyp, swaying, a drop at the
 * end of some of them. One stroke for all of them. */
export function filaments(d: SlimeDraw, perLobe: number): void {
  const { ctx, l, time, skin, lobes } = d;
  const path = new Path2D();
  const tips: Point[] = [];
  const hang = (x: number, seed: number, down: number) => {
    const top = seamY(l, x, time, lobes);
    const sway = Math.sin(time * 0.8 + seed) * l.tile * 0.12;
    const pts = curve(
      { x, y: top - l.tile * 0.2 },
      { x: x + sway, y: top + down },
      { x: x - sway * 0.4, y: top + down * 0.4 },
      { x: x + sway * 1.2, y: top + down * 0.8 },
      6,
    );
    path.addPath(new Path2D(openSmoothPath(pts)));
    if (hash01(seed) < 0.5) tips.push(pts[6] as Point);
  };
  for (const [i, c] of lobes.entries()) {
    for (let k = 0; k < perLobe; k++) {
      const u = (k + 0.5) / perLobe - 0.5;
      const x = c.x + u * c.r * 2.2;
      const room = c.y - c.r * 1.5 - seamY(l, x, time, lobes);
      hang(x, i * 7 + k * 3 + 1, Math.max(l.tile * 0.3, room * (0.55 + hash01(i * 3 + k) * 0.4)));
    }
  }
  for (let k = 0; k < 3; k++) {
    const x = l.width * ((k + 0.5) / 3 + (hash01(k * 17 + 5) - 0.5) * 0.15);
    hang(x, 40 + k, l.tile * (0.6 + hash01(k * 9 + 2) * 0.8));
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[0], 0.55);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke(path);
  ctx.strokeStyle = rgba(skin.rim, 0.25);
  ctx.lineWidth = Math.max(0.5, l.tile * 0.018);
  ctx.stroke(path);
  ctx.fillStyle = rgba(skin.tint, 0.8);
  ctx.beginPath();
  for (const t of tips) {
    ctx.moveTo(t.x + l.tile * 0.06, t.y);
    ctx.ellipse(t.x, t.y, l.tile * 0.06, l.tile * 0.08, 0, 0, Math.PI * 2);
  }
  ctx.fill();
}
