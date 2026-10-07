import {
  angleOf,
  at,
  BEZEL,
  BLADES,
  CURL,
  GLYPH_IN,
  GLYPH_OUT,
  glyph,
  RIM_IN,
  RIM_PLATES,
  ring,
  rivet,
  SEAM_STEPS,
  seam,
  seamAt,
  TAU,
  unit,
} from "./governor-face-geom.js";
import { TRACK_IN, TRACK_OUT } from "./governor-shape.js";
import { spriteRng } from "./sprite-bake.js";

/**
 * **THE GOVERNOR's alloy, painted** once for `governor-face-baked.ts`: the
 * brass layer in greys, and the gloss over it in white.
 */

export function paintAlloy(g: CanvasRenderingContext2D, w: number, h: number): void {
  const px = unit(g, w, h);
  const rnd = spriteRng(43);
  // The face is sunk: its far wall in shadow, the near one catching the key.
  const dish = g.createRadialGradient(-0.25, -0.25, 0.1, 0, 0, RIM_IN);
  dish.addColorStop(0, "rgba(255,255,255,0)");
  dish.addColorStop(0.7, "rgba(255,255,255,0.03)");
  dish.addColorStop(1, "rgba(255,255,255,0.12)");
  g.fillStyle = dish;
  ring(g, RIM_IN);
  g.fill();

  // The iris: each blade its own shade, a dark seam and a lit lip.
  for (let i = 0; i < BLADES; i++) {
    seam(g, i, 0);
    g.arc(0, 0, TRACK_IN, angleOf(i / BLADES + CURL), angleOf((i + 1) / BLADES + CURL));
    for (let j = SEAM_STEPS; j >= 0; j--) g.lineTo(...seamAt(i + 1, j / SEAM_STEPS, 0));
    g.closePath();
    g.fillStyle = `rgba(255,255,255,${(0.02 + 0.07 * rnd()).toFixed(3)})`;
    g.fill();
  }
  g.lineCap = "round";
  for (let i = 0; i < BLADES; i++) {
    seam(g, i, 0);
    g.strokeStyle = "rgba(0,0,0,0.85)";
    g.lineWidth = 5 * px;
    g.stroke();
    seam(g, i, 0.004);
    g.strokeStyle = "rgba(255,255,255,0.32)";
    g.lineWidth = 1.5 * px;
    g.stroke();
  }

  // The bezel round the hub: a raised collar and its rivets.
  ring(g, BEZEL);
  g.strokeStyle = "rgba(255,255,255,0.55)";
  g.lineWidth = 0.025;
  g.stroke();
  ring(g, BEZEL + 0.014);
  g.strokeStyle = "rgba(0,0,0,0.7)";
  g.lineWidth = 3 * px;
  g.stroke();
  for (let i = 0; i < 14; i++) rivet(g, at(BEZEL, (i + 0.5) / 14), 0.008);

  // The glyphs, engraved: a dark cut with the light's edge beside it.
  const glyphs = 40;
  g.lineCap = "round";
  g.lineJoin = "round";
  for (const [style, width, dx] of [
    ["rgba(0,0,0,0.8)", 3.2, 0],
    ["rgba(255,255,255,0.4)", 1.2, 1.2],
  ] as const) {
    const cut = spriteRng(7);
    g.save();
    g.translate(dx * px, dx * px);
    g.strokeStyle = style;
    g.lineWidth = width * px;
    for (let i = 0; i < glyphs; i++) glyph(g, cut, (i + 0.5) / glyphs);
    g.restore();
  }
  for (const k of [GLYPH_IN - 0.015, GLYPH_OUT + 0.015]) {
    ring(g, k);
    g.strokeStyle = "rgba(255,255,255,0.18)";
    g.lineWidth = 1.2 * px;
    g.stroke();
  }

  // The track: a groove, its fine graduations, and rivets on its inner lip.
  const groove = g.createRadialGradient(0, 0, TRACK_IN, 0, 0, TRACK_OUT);
  groove.addColorStop(0, "rgba(0,0,0,0.5)");
  groove.addColorStop(0.5, "rgba(0,0,0,0)");
  groove.addColorStop(1, "rgba(255,255,255,0.1)");
  g.fillStyle = groove;
  ring(g, TRACK_OUT);
  g.arc(0, 0, TRACK_IN, 0, TAU, true);
  g.fill();
  g.beginPath();
  for (let i = 0; i < 96; i++) {
    const [ax, ay] = at(TRACK_OUT - 0.035, i / 96);
    const [bx, by] = at(TRACK_OUT, i / 96);
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
  }
  g.strokeStyle = "rgba(255,255,255,0.3)";
  g.lineWidth = 1 * px;
  g.stroke();
  for (let i = 0; i < 32; i++) rivet(g, at(TRACK_IN - 0.02, i / 32), 0.006);

  // The rim: segments, each its own wear, cut apart and pinned.
  for (let i = 0; i < RIM_PLATES; i++) {
    g.beginPath();
    g.arc(0, 0, 1, angleOf(i / RIM_PLATES), angleOf((i + 1) / RIM_PLATES));
    g.arc(0, 0, RIM_IN, angleOf((i + 1) / RIM_PLATES), angleOf(i / RIM_PLATES), true);
    g.closePath();
    const v = rnd();
    g.fillStyle =
      v < 0.5
        ? `rgba(0,0,0,${(0.3 * v).toFixed(3)})`
        : `rgba(255,255,255,${(0.25 * (v - 0.5)).toFixed(3)})`;
    g.fill();
  }
  g.beginPath();
  for (let i = 0; i < RIM_PLATES; i++) {
    const [ax, ay] = at(RIM_IN, i / RIM_PLATES);
    const [bx, by] = at(1, i / RIM_PLATES);
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
  }
  g.strokeStyle = "rgba(0,0,0,0.9)";
  g.lineWidth = 2.5 * px;
  g.stroke();
  for (let i = 0; i < RIM_PLATES; i++)
    rivet(g, at((RIM_IN + 1) / 2, (i + 0.5) / RIM_PLATES), 0.007);
  ring(g, RIM_IN);
  g.strokeStyle = "rgba(0,0,0,0.9)";
  g.lineWidth = 3 * px;
  g.stroke();
}

/** The gloss: a film over the far half of the face, and the rim's lit shoulder. */
export function paintGloss(g: CanvasRenderingContext2D, w: number, h: number): void {
  const px = unit(g, w, h);
  const film = g.createRadialGradient(-0.35, -0.45, 0.05, -0.35, -0.45, 0.75);
  film.addColorStop(0, "rgba(255,255,255,0.22)");
  film.addColorStop(0.6, "rgba(255,255,255,0.06)");
  film.addColorStop(1, "rgba(255,255,255,0)");
  g.save();
  ring(g, TRACK_IN);
  g.clip();
  g.fillStyle = film;
  g.fillRect(-1, -1, 2, 2);
  g.restore();
  g.lineCap = "round";
  for (const [k, width, alpha] of [
    [0.995, 6, 0.18],
    [0.995, 2, 0.7],
    [RIM_IN + 0.005, 1.5, 0.35],
  ] as const) {
    g.beginPath();
    g.arc(0, 0, k, Math.PI * 1.05, Math.PI * 1.45);
    g.strokeStyle = `rgba(255,255,255,${alpha})`;
    g.lineWidth = width * px;
    g.stroke();
  }
}
