import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
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
 * The paint VESICLE is made of: a glass blister raised on the flesh, a ring of
 * tissue round its foot, veins running under it, and curtains from the roof.
 *
 * Parts off the shape sheet, by name: the **vesicle** is the blister itself,
 * a dome the face shows through; the **node-ring** is the swollen ring the
 * dome stands in; the **vein** is what runs out from under it across the
 * flesh; and what hangs from the roof is **veil** — wide sheets with a
 * scalloped hem, not threads and not pendants. The ring and the veins are
 * baked once per button and held.
 */

interface Blister {
  readonly veins: Path2D;
  readonly ring: Path2D;
}
const blisters = new Map<string, Blister>();

function blisterFor(x: number, y: number, r: number): Blister {
  const key = `${x}|${y}|${r}`;
  const held = blisters.get(key);
  if (held) return held;
  if (blisters.size > 8) blisters.clear();
  let veins = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4 + (hash01(i * 5 + 1) - 0.5) * 0.5;
    const bend = (hash01(i * 7 + 2) - 0.5) * 3.2;
    const len = r * (1.5 + hash01(i * 11 + 3) * 0.6);
    const from = { x: x + Math.cos(a) * r * 0.5, y: y + Math.sin(a) * r * 0.5 };
    const to = { x: x + Math.cos(a + bend * 0.4) * len, y: y + Math.sin(a + bend * 0.4) * len };
    const mid = curve(
      from,
      to,
      { x: x + Math.cos(a - bend * 0.3) * r * 1.1, y: y + Math.sin(a - bend * 0.3) * r * 1.1 },
      {
        x: x + Math.cos(a + bend * 0.6) * len * 0.75,
        y: y + Math.sin(a + bend * 0.6) * len * 0.75,
      },
      10,
    );
    veins += tube(mid, (p) => r * (0.13 - 0.11 * p ** 0.7));
  }
  const ring = new Path2D();
  ring.ellipse(x, y + r * 0.12, r * 1.34, r * 1.2, 0, 0, Math.PI * 2);
  ring.ellipse(x, y + r * 0.1, r * 1.06, r * 0.98, 0, 0, Math.PI * 2, true);
  const b = { veins: new Path2D(veins), ring };
  blisters.set(key, b);
  return b;
}

/** Under the face: the veins across the flesh, and the ring of tissue the
 * blister is raised on, lit on top and in shadow below. */
export function blister(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  const b = blisterFor(x, y, r);
  ctx.fillStyle = rgba(skin.flesh[1], 0.8);
  ctx.fill(b.veins);
  ctx.save();
  ctx.translate(0, -r * 0.03);
  ctx.strokeStyle = rgba(skin.tint, 0.35);
  ctx.lineWidth = Math.max(0.6, r * 0.025);
  ctx.stroke(b.veins);
  ctx.restore();
  const ringLight = ctx.createLinearGradient(0, y - r * 1.2, 0, y + r * 1.35);
  ringLight.addColorStop(0, rgba(skin.flesh[0], 0.95));
  ringLight.addColorStop(0.45, rgba(skin.flesh[1], 0.9));
  ringLight.addColorStop(1, rgba(skin.ground[3], 0.9));
  ctx.fillStyle = ringLight;
  ctx.fill(b.ring, "evenodd");
  ctx.strokeStyle = rgba(skin.rim, 0.28);
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  ctx.stroke(b.ring);
  // The pool the dome sits over: the face reads as under glass because the
  // ground behind it is darker than the flesh round it.
  const pool = ctx.createRadialGradient(x, y + r * 0.2, r * 0.2, x, y + r * 0.1, r * 1.06);
  pool.addColorStop(0, rgba(skin.ground[2], 0.4));
  pool.addColorStop(1, rgba(skin.ground[3], 0.95));
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.1, r * 1.06, r * 0.98, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Over the face: the glass — a broad specular up and to the left, a fine
 * rim light along the bottom right where the dome curves away, and a haze of
 * reflection across the whole of it. */
export function glass(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  const haze = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, 0, x, y, r * 1.02);
  haze.addColorStop(0, "rgba(255,255,255,0.28)");
  haze.addColorStop(0.5, "rgba(255,255,255,0.06)");
  haze.addColorStop(0.85, "rgba(255,255,255,0)");
  haze.addColorStop(1, rgba(skin.rim, 0.25));
  ctx.fillStyle = haze;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(x - r * 0.42, y - r * 0.5, r * 0.26, r * 0.15, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.hull.edge, 0.5);
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.94, Math.PI * 0.15, Math.PI * 0.6);
  ctx.stroke();
}

/** What moves: a light going round the ring, a drop sliding down the glass,
 * and PLASM's cords on up to the organ. */
export function sliding(d: NerveDraw, beads: number): void {
  const { ctx, time, skin } = d;
  ctx.lineCap = "round";
  for (const [i, lobe] of d.lobes.entries()) {
    const { x, y, r } = lobe.circle;
    // The light in the ring: a bright arc a fifth of the way round, turning.
    const a = time * 1.1 + i * 2.1;
    ctx.strokeStyle = rgba(skin.tint, 0.55);
    ctx.lineWidth = Math.max(1.5, r * 0.14);
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.11, r * 1.2, r * 1.09, 0, a, a + Math.PI * 0.4);
    ctx.stroke();
    halo(
      ctx,
      x + Math.cos(a + 0.6) * r * 1.2,
      y + r * 0.11 + Math.sin(a + 0.6) * r * 1.09,
      Math.round((r * 0.9) / 2) * 2,
      skin.tint,
      0.3,
    );
    // The drop: it forms at the top of the dome and slides down the right
    // side, growing as it goes, and is gone at the foot.
    const p = (time * 0.22 + hash01(i * 9 + 4)) % 1;
    const da = -Math.PI * 0.5 + p * Math.PI * 1.05;
    const dx = x + Math.cos(da) * r * 0.86;
    const dy = y + Math.sin(da) * r * 0.86;
    const dr = r * (0.05 + p * 0.07);
    ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - p * 0.6)})`;
    ctx.beginPath();
    ctx.ellipse(dx, dy, dr * 0.8, dr * 1.2, da + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  beadedCords(d, beads);
}

/** From the roof: veils — wide translucent sheets between the buttons with a
 * hem that ripples, one fill and one stroke for all of them. */
export function veils(d: SlimeDraw, count: number): void {
  const { ctx, l, time, skin, lobes } = d;
  let s = "";
  let deepest = l.bandTop;
  for (let k = 0; k < count; k++) {
    const cx = l.width * ((k + 0.5) / count + (hash01(k * 13 + 2) - 0.5) * 0.1);
    const half = l.width * (0.5 / count) * (0.7 + hash01(k * 7 + 1) * 0.35);
    let room = l.bandHeight * 0.35;
    for (const c of lobes) {
      if (Math.abs(c.x - cx) < half + c.r) room = Math.min(room, c.y - c.r * 1.7 - l.bandTop);
    }
    const drop = Math.max(l.tile * 0.4, room);
    const pts: Point[] = [];
    const left = cx - half;
    for (let i = 0; i <= 10; i++) {
      const u = i / 10;
      const x = left + half * 2 * u;
      const top = seamY(l, x, time, lobes);
      const hem =
        drop * (0.55 + 0.45 * Math.sin(u * Math.PI)) +
        Math.sin(u * Math.PI * 4 + time * 1.4 + k) * l.tile * 0.12;
      pts.push({ x, y: top + hem });
      deepest = Math.max(deepest, top + hem);
    }
    const topL = seamY(l, left, time, lobes) - l.tile * 0.3;
    const topR = seamY(l, left + half * 2, time, lobes) - l.tile * 0.3;
    s += `M${left} ${topL} L${left + half * 2} ${topR} ${openSmoothPath(pts.reverse()).replace(/^M/, "L")} Z`;
  }
  const body = new Path2D(s);
  const grad = ctx.createLinearGradient(0, l.bandTop, 0, deepest);
  grad.addColorStop(0, rgba(skin.flesh[0], 0.4));
  grad.addColorStop(0.6, rgba(skin.flesh[1], 0.22));
  grad.addColorStop(1, rgba(skin.tint, 0.32));
  ctx.fillStyle = grad;
  ctx.fill(body);
  ctx.strokeStyle = rgba(skin.rim, 0.3);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.03);
  ctx.stroke(body);
}
