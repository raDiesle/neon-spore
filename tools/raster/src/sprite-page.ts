import { greySprite, spritePx, tintedSprite } from "@neon-spore/render";
import { DEMOS, type SpriteDemo } from "./sprite-demos.js";

/**
 * The sprite sheet's page: bundled for the browser by `sprite.ts` and run
 * there, so the bake, the blits and the encoders are a real browser's canvas.
 *
 * Per sprite: the grey strips as baked and the tinted strip; the shipped
 * drawing and the baked one side by side at play size, per state; the same
 * magnified; and the numbers — what the bake took, what the atlas would weigh
 * if it were shipped as a picture instead, and what one draw costs each way.
 */

/** A head radius in CSS pixels and a phone's density: the size the game plays at. */
const R = 150;
const DPR = 3;
const BG = "#07060F";
const INK = "#9A90C8";

interface Metrics {
  name: string;
  bakeMs: number;
  atlas: string;
  pngBytes: number;
  webpBytes: number;
  opsShipped: Record<string, number>;
  opsBaked: Record<string, number>;
  usShipped: number;
  usBaked: number;
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  const g = c.getContext("2d");
  if (!g) throw new Error("no 2d context");
  return [c, g];
}

const bytesOf = (url: string): number => Math.floor(((url.length - url.indexOf(",") - 1) * 3) / 4);

/** A context that counts the calls made on it and passes each one through. */
function counting(
  ctx: CanvasRenderingContext2D,
): [CanvasRenderingContext2D, Record<string, number>] {
  const counts: Record<string, number> = {};
  const proxy = new Proxy(ctx, {
    get(t, k) {
      const v = Reflect.get(t, k, t);
      if (typeof v !== "function") return v;
      return (...a: unknown[]) => {
        counts[String(k)] = (counts[String(k)] ?? 0) + 1;
        return v.apply(t, a);
      };
    },
    set(t, k, v) {
      return Reflect.set(t, k, v, t);
    },
  });
  return [proxy, counts];
}

function checker(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  for (let j = 0; j < h; j += 12)
    for (let i = 0; i < w; i += 12) {
      g.fillStyle = ((i + j) / 12) % 2 ? "#2a2a2a" : "#3a3a3a";
      g.fillRect(x + i, y + j, Math.min(12, w - i), Math.min(12, h - j));
    }
}

function perDraw(d: SpriteDemo, baked: boolean, threat: number): number {
  const [l, t, r, b] = d.box;
  const [, g] = canvas((r - l) * R * DPR, (b - t) * R * DPR);
  g.scale(DPR, DPR);
  const draw = (i: number): void =>
    baked
      ? d.baked(g, -l * R, -t * R, R, threat, i / 60, DPR)
      : d.shipped(g, -l * R, -t * R, R, threat, i / 60);
  for (let i = 0; i < 30; i++) draw(i);
  const n = 400;
  const t0 = performance.now();
  for (let i = 0; i < n; i++) draw(i);
  return ((performance.now() - t0) * 1000) / n;
}

function section(d: SpriteDemo): [HTMLCanvasElement, Metrics] {
  const px = spritePx(d.playH(R), DPR);
  const t0 = performance.now();
  const tinted = tintedSprite(d.spec, px, d.base, d.glow);
  const bakeMs = performance.now() - t0;
  const grey = greySprite(d.spec, px);
  const [l, t, r, b] = d.box;
  const cw = (r - l) * R * DPR;
  const ch = (b - t) * R * DPR;
  const cells = d.threats.length * 2;
  const zoom = ch < 250 ? 3 : 2;
  const crop = ch < 250 ? 1 : 0.5;
  const zw = cw * crop * zoom;
  const zh = ch * crop * zoom;
  const stripH = tinted.h;
  const width = Math.max(cw * cells, tinted.canvas.width * 3 + 60, zw * 2 + 30) + 40;
  const height = 60 + stripH + 50 + ch + 70 + zh + 40;
  const [c, g] = canvas(width, height);
  g.fillStyle = BG;
  g.fillRect(0, 0, width, height);
  g.fillStyle = "#E8E0FF";
  g.font = "bold 26px monospace";
  g.fillText(`${d.name} — ${d.spec.frames} frames, ${tinted.w}×${tinted.h} px each`, 20, 38);
  g.font = "18px monospace";
  let y = 60;
  let x = 20;
  for (const [label, strip] of [
    ["body (grey)", grey.body.canvas],
    ["light (grey)", grey.light?.canvas],
    ["tinted", tinted.canvas],
  ] as const) {
    if (!strip) continue;
    if (label !== "tinted") checker(g, x, y, strip.width, strip.height);
    g.drawImage(strip, x, y);
    g.fillStyle = INK;
    g.fillText(label, x, y + stripH + 22);
    x += strip.width + 30;
  }
  y += stripH + 50;
  const shots: HTMLCanvasElement[] = [];
  d.threats.forEach((threat, k) => {
    for (const baked of [false, true]) {
      const [cell, cg] = canvas(cw, ch);
      cg.scale(DPR, DPR);
      if (baked) d.baked(cg, -l * R, -t * R, R, threat, 0.4, DPR);
      else d.shipped(cg, -l * R, -t * R, R, threat, 0.4);
      const cx = 20 + (k * 2 + (baked ? 1 : 0)) * cw;
      g.drawImage(cell, cx, y);
      g.strokeStyle = "#241B4F";
      g.strokeRect(cx + 0.5, y + 0.5, cw - 1, ch - 1);
      g.fillStyle = baked ? "#D8E24A" : INK;
      g.fillText(baked ? "baked" : "shipped", cx + 8, y + ch + 22);
      if (!baked) g.fillText(`threat ${threat}`, cx + 8, y + ch + 42);
      shots.push(cell);
    }
  });
  y += ch + 70;
  g.imageSmoothingEnabled = false;
  const last = shots.slice(-2);
  last.forEach((cell, i) => {
    const sx = (cw * (1 - crop)) / 2;
    const sy = (ch * (1 - crop)) / 2;
    g.drawImage(cell, sx, sy, cw * crop, ch * crop, 20 + i * (zw + 30), y, zw, zh);
  });
  g.imageSmoothingEnabled = true;
  g.fillStyle = INK;
  g.fillText(`×${zoom}: shipped, baked`, 20, y + zh + 26);
  const threat = d.threats[d.threats.length - 1] ?? 0;
  const [, sg] = canvas(cw, ch);
  const [ps, opsShipped] = counting(sg);
  d.shipped(ps, -l * R, -t * R, R, threat, 0.4);
  const [pb, opsBaked] = counting(sg);
  d.baked(pb, -l * R, -t * R, R, threat, 0.4, DPR);
  const shipAsPicture = [grey.body.canvas, grey.light?.canvas].filter(
    (s): s is HTMLCanvasElement => !!s,
  );
  return [
    c,
    {
      name: d.name,
      bakeMs,
      atlas: `${tinted.canvas.width}×${tinted.canvas.height}`,
      pngBytes: shipAsPicture.reduce((s, k) => s + bytesOf(k.toDataURL("image/png")), 0),
      webpBytes: shipAsPicture.reduce((s, k) => s + bytesOf(k.toDataURL("image/webp", 0.85)), 0),
      opsShipped,
      opsBaked,
      usShipped: perDraw(d, false, threat),
      usBaked: perDraw(d, true, threat),
    },
  ];
}

const only = (window as unknown as { __only?: string }).__only;
const made = DEMOS.filter((d) => !only || d.name === only).map(section);
const width = Math.max(...made.map(([c]) => c.width));
const [sheet, g] = canvas(
  width,
  made.reduce((s, [c]) => s + c.height, 0),
);
g.fillStyle = BG;
g.fillRect(0, 0, sheet.width, sheet.height);
let at = 0;
for (const [c] of made) {
  g.drawImage(c, 0, at);
  at += c.height;
}
const w = window as unknown as { __sheet: string; __metrics: Metrics[] };
w.__metrics = made.map(([, m]) => m);
w.__sheet = sheet.toDataURL("image/png");
