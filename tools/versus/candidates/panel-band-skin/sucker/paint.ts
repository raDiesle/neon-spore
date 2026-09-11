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
 * The paint SUCKER is made of: a button as the mouth of a sucker — a flat
 * disc of concentric ridges — with an arm trailing off the bottom of it
 * carrying smaller suckers, and a web strung from the roof.
 *
 * Parts off the shape sheet, by name: **rings** are the disc, four ridges
 * each lit on its upper edge and dark on its lower; the **oral-arm** is the
 * tentacle running off the bottom of the disc, a tapered tube with three
 * small suckers along it; **ridge** is the lit lip on the face itself; and
 * what hangs from the roof is **web-fin** — a membrane strung between threads
 * from the seam down to the discs, with dew at its low points. The disc and
 * the arm are baked once per button and held.
 */

const RINGS = [1.16, 1.36, 1.56, 1.76] as const;

interface Disc {
  readonly pad: Path2D;
  readonly ridges: readonly Path2D[];
  readonly arm: Path2D;
  /** The small suckers on the arm, for the light that runs down it. */
  readonly pips: readonly Point[];
}
const discs = new Map<string, Disc>();

function discFor(x: number, y: number, r: number): Disc {
  const key = `${x}|${y}|${r}`;
  const held = discs.get(key);
  if (held) return held;
  if (discs.size > 8) discs.clear();
  const pad = new Path2D();
  pad.ellipse(x, y + r * 0.1, r * 1.84, r * 1.62, 0, 0, Math.PI * 2);
  const ridges = RINGS.map((k) => {
    const p = new Path2D();
    p.ellipse(x, y + r * 0.1, r * k, r * k * 0.88, 0, 0, Math.PI * 2);
    return p;
  });
  const side = hash01(Math.round(x)) < 0.5 ? -1 : 1;
  const from = { x: x + side * r * 0.6, y: y + r * 1.45 };
  const to = { x: x + side * r * 2.6, y: y + r * 2.3 };
  const mid = curve(
    from,
    to,
    { x: x + side * r * 0.5, y: y + r * 2.3 },
    { x: x + side * r * 1.9, y: y + r * 2.4 },
    12,
  );
  const arm = new Path2D(tube(mid, (p) => r * (0.3 - 0.2 * p)));
  const pips = [mid[3], mid[6], mid[9]] as Point[];
  const d = { pad, ridges, arm, pips };
  discs.set(key, d);
  return d;
}

/** Under the face: the arm first, then the pad and its ridges over its root. */
export function rings(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  const disc = discFor(x, y, r);
  const armLight = ctx.createLinearGradient(0, y + r * 1.4, 0, y + r * 3.6);
  armLight.addColorStop(0, rgba(skin.flesh[1], 0.85));
  armLight.addColorStop(1, rgba(skin.flesh[2], 0.6));
  ctx.fillStyle = armLight;
  ctx.fill(disc.arm);
  ctx.strokeStyle = rgba(skin.rim, 0.2);
  ctx.lineWidth = Math.max(0.6, r * 0.03);
  ctx.stroke(disc.arm);
  ctx.fillStyle = rgba(skin.ground[3], 0.7);
  ctx.beginPath();
  for (const [k, p] of disc.pips.entries()) {
    const pr = r * (0.16 - k * 0.03);
    ctx.moveTo(p.x + pr, p.y);
    ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
  }
  ctx.fill();
  const padLight = ctx.createRadialGradient(x, y + r * 0.1, r * 0.9, x, y + r * 0.1, r * 1.84);
  padLight.addColorStop(0, rgba(skin.flesh[1], 0.9));
  padLight.addColorStop(1, rgba(skin.flesh[2], 0.7));
  ctx.fillStyle = padLight;
  ctx.fill(disc.pad);
  // Each ridge: a dark line with a lit one just above it, so the ring stands
  // up off the pad. Light from above, as on the whole panel.
  for (const ridge of disc.ridges) {
    ctx.save();
    ctx.translate(0, r * 0.03);
    ctx.strokeStyle = rgba(skin.ground[3], 0.55);
    ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.stroke(ridge);
    ctx.translate(0, -r * 0.06);
    ctx.strokeStyle = rgba(skin.flesh[0], 0.6);
    ctx.lineWidth = Math.max(0.8, r * 0.04);
    ctx.stroke(ridge);
    ctx.restore();
  }
  // The cavity the face sits in.
  const cavity = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.12);
  cavity.addColorStop(0, rgba(skin.ground[3], 0.85));
  cavity.addColorStop(1, rgba(skin.ground[3], 0));
  ctx.fillStyle = cavity;
  ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
}

/** Over the face: the sucker's own lip — a full lit ring, and a darker one
 * inside it where the cavity turns down. */
export function lip(d: LobeDraw): void {
  const { ctx, x, y, r, skin } = d;
  ctx.strokeStyle = rgba(skin.rim, 0.42);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = rgba(skin.ground[3], 0.35);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
}

/** What moves: a ridge of light moving out across the disc, the small
 * suckers on the arm lighting in turn down its length, and PLASM's cords on
 * up to the organ. */
export function peristalsis(d: NerveDraw, beads: number): void {
  const { ctx, time, skin } = d;
  for (const [i, lobe] of d.lobes.entries()) {
    const { x, y, r } = lobe.circle;
    const disc = discFor(x, y, r);
    const p = (time * 0.4 + i * 0.29) % 1;
    const k = 1.1 + p * 0.75;
    ctx.strokeStyle = rgba(skin.tint, 0.5 * Math.sin(p * Math.PI));
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.1, r * k, r * k * 0.88, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (const [n, pip] of disc.pips.entries()) {
      const lit = Math.max(0, Math.sin((time * 0.4 + i * 0.29 - n * 0.18) * Math.PI * 2)) ** 4;
      const pr = r * (0.16 - n * 0.03);
      halo(ctx, pip.x, pip.y, Math.round((pr * 4) / 2) * 2, skin.tint, lit * 0.45);
      ctx.fillStyle = rgba(skin.rim, 0.15 + lit * 0.7);
      ctx.beginPath();
      ctx.arc(pip.x, pip.y, pr * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  beadedCords(d, beads);
}

/** From the roof: a web — threads from the seam down to the tops of the discs
 * and the floor between them, a membrane filled between neighbours, and dew
 * on the low points. */
export function web(d: SlimeDraw, strands: number): void {
  const { ctx, l, time, skin, lobes } = d;
  const anchors: Point[] = [];
  for (const c of lobes) {
    anchors.push({ x: c.x - c.r * 0.9, y: c.y - c.r * 1.55 });
    anchors.push({ x: c.x + c.r * 0.9, y: c.y - c.r * 1.55 });
  }
  for (let k = 0; k < strands; k++) {
    const x = l.width * ((k + 0.5) / strands + (hash01(k * 7 + 3) - 0.5) * 0.1);
    anchors.push({ x, y: l.bandTop + l.bandHeight * (0.3 + hash01(k * 5 + 1) * 0.15) });
  }
  anchors.sort((a, b) => a.x - b.x);
  const threads = new Path2D();
  const sheet = new Path2D();
  const dew: Point[] = [];
  let prev: Point | null = null;
  for (const [i, a] of anchors.entries()) {
    const top = {
      x: a.x + Math.sin(time * 0.5 + i) * l.tile * 0.05,
      y: seamY(l, a.x, time, lobes),
    };
    threads.moveTo(top.x, top.y - l.tile * 0.2);
    threads.lineTo(a.x, a.y);
    if (prev) {
      // The membrane between two threads: a sag between the anchors, and its
      // shape read off the roof over it.
      const sag = Math.min(l.tile * 0.7, Math.abs(a.x - prev.x) * 0.3);
      const low = { x: (a.x + prev.x) / 2, y: Math.max(a.y, prev.y) + sag };
      const hem = curve(
        prev,
        a,
        { x: prev.x + (low.x - prev.x) * 0.6, y: low.y },
        { x: a.x - (a.x - low.x) * 0.6, y: low.y },
        8,
      );
      const ceiling = curve(
        { x: a.x, y: seamY(l, a.x, time, lobes) },
        { x: prev.x, y: seamY(l, prev.x, time, lobes) },
        { x: low.x + (a.x - low.x) * 0.5, y: seamY(l, low.x, time, lobes) },
        { x: low.x - (low.x - prev.x) * 0.5, y: seamY(l, low.x, time, lobes) },
        6,
      );
      sheet.addPath(
        new Path2D(`${openSmoothPath(hem)} ${openSmoothPath(ceiling).replace(/^M/, "L")} Z`),
      );
      // Two more strands across the span, each sagging less than the hem,
      // so the sheet reads as strung rather than cut from cloth.
      for (const k of [0.62, 0.3]) {
        const mid = { x: low.x, y: Math.min(prev.y, a.y) * (1 - k) + low.y * k - sag * (1 - k) };
        const upper = { x: prev.x, y: seamY(l, prev.x, time, lobes) * (1 - k) + prev.y * k };
        const upperB = { x: a.x, y: seamY(l, a.x, time, lobes) * (1 - k) + a.y * k };
        threads.addPath(
          new Path2D(
            openSmoothPath(
              curve(
                upper,
                upperB,
                { x: upper.x + (mid.x - upper.x) * 0.6, y: mid.y },
                { x: upperB.x - (upperB.x - mid.x) * 0.6, y: mid.y },
                6,
              ),
            ),
          ),
        );
      }
      dew.push(hem[4] as Point);
    }
    prev = a;
  }
  ctx.fillStyle = rgba(skin.flesh[1], 0.16);
  ctx.fill(sheet);
  ctx.strokeStyle = rgba(skin.flesh[0], 0.32);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.025);
  ctx.stroke(sheet);
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.rim, 0.4);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.035);
  ctx.stroke(threads);
  ctx.fillStyle = rgba(skin.hull.edge, 0.7);
  ctx.beginPath();
  for (const [i, p] of dew.entries()) {
    const rr = l.tile * (0.05 + 0.03 * Math.sin(time * 0.9 + i));
    ctx.moveTo(p.x + rr, p.y);
    ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
  }
  ctx.fill();
}
