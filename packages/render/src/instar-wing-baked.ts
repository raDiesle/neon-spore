import type { Point } from "./instar-place.js";
import type { WingSkin } from "./instar-wings.js";
import { PALETTE } from "./palette.js";
import { type SpriteSpec, spritePx, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's wing membrane, baked** — the fourth example (`sprite-bake.ts`):
 * the whole membrane's detail painted once, flat, in the wing's own
 * coordinates, and drawn in one `drawImage` under the map the lens gives the
 * flat wing's two axes. The membrane is one plane of the rig (`y = 0` about
 * its shoulder, `instar-wings.ts`), so that map is the plane's own — the
 * `scale(sx, sy)` of `.claude/skills/depth` with a shear — and the detail
 * beats, folds and turns away with the skin it lies on. A sheet has nothing
 * behind it to reveal, so no affine is standing in for a turn here.
 *
 * `drawWing` strokes nine straight veins with a fork each. Here the veins
 * branch from every bone into the skin and thin as they go, a hair of light
 * rides the lit side of each, the skin between the bones is creased toward
 * the hem, and it glows through where it is thinnest, at the scallops.
 *
 * Not drawn by the game: offered in VERSUS on `instar:wing`
 * (`tools/versus/candidates/instar-wing/baked`).
 */

/** The flat wing's bones, in head radii, as `instar-wings.ts` lays them. */
const SHOULDER: Point = { x: 0, y: 0 };
const ELBOW: Point = { x: 0.7, y: -0.75 };
const WRIST: Point = { x: 1.45, y: -1.05 };
const TIPS: readonly Point[] = [
  { x: 2.1, y: -0.05 },
  { x: 1.55, y: 0.6 },
  { x: 0.8, y: 0.8 },
];
const ROOT: Point = { x: 0.15, y: 1.15 };
/** Where the skin between the bones gathers: the veins grow toward it. */
const MIDDLE: Point = { x: 1.0, y: 0.1 };

/** The box the painting covers, in the wing's head radii. */
const LEFT = -0.1;
const TOP = -1.2;
const WIDE = 2.4;
const TALL = 2.5;

type Mark = (g: CanvasRenderingContext2D, a: Point, b: Point, width: number) => void;

/** Veins branching into the skin from every bone, the same on both layers. */
function veins(g: CanvasRenderingContext2D, mark: Mark): void {
  const rnd = spriteRng(23);
  const grow = (from: Point, angle: number, len: number, width: number, depth: number): void => {
    let at = from;
    let a = angle;
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      a += (rnd() - 0.5) * 0.5;
      const to = { x: at.x + Math.cos(a) * (len / steps), y: at.y + Math.sin(a) * (len / steps) };
      mark(g, at, to, width * (1 - i / (steps + 1)));
      if (depth > 0 && rnd() < 0.45)
        grow(
          to,
          a + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.4),
          len * 0.5,
          width * 0.6,
          depth - 1,
        );
      at = to;
    }
  };
  const bones: [Point, Point][] = [
    [SHOULDER, ELBOW],
    [ELBOW, WRIST],
    ...TIPS.map((t): [Point, Point] => [WRIST, t]),
  ];
  for (const [a, b] of bones)
    for (const u of [0.2, 0.4, 0.6, 0.8]) {
      const p = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
      const toMid = Math.atan2(MIDDLE.y - p.y, MIDDLE.x - p.x);
      grow(p, toMid + (rnd() - 0.5) * 0.7, 0.35 + rnd() * 0.3, 0.022, 2);
    }
}

/** The painting's own frame: head radii of the flat wing onto a `w` × `h` box. */
function frame(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.scale(w / WIDE, h / TALL);
  g.translate(-LEFT, -TOP);
  g.lineCap = "round";
}

function paintBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  // Creases: the skin slack between the bones, gathering toward the hem.
  const rnd = spriteRng(7);
  g.strokeStyle = "rgba(0,0,0,0.35)";
  g.lineWidth = 0.008;
  for (const t of [...TIPS, ROOT])
    for (let i = 0; i < 7; i++) {
      const u = 0.25 + i * 0.1 + rnd() * 0.04;
      const a = { x: WRIST.x + (t.x - WRIST.x) * u, y: WRIST.y + (t.y - WRIST.y) * u };
      const b = { x: a.x + (MIDDLE.x - a.x) * 0.35, y: a.y + (MIDDLE.y - a.y) * 0.35 };
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.quadraticCurveTo((a.x + b.x) / 2 + 0.04, (a.y + b.y) / 2 + 0.05, b.x, b.y);
      g.stroke();
    }
  // Mottling: where the skin is thicker it is darker.
  for (let i = 0; i < 26; i++) {
    const x = 0.2 + rnd() * 1.8;
    const y = -0.8 + rnd() * 1.7;
    const s = 0.06 + rnd() * 0.12;
    const blot = g.createRadialGradient(x, y, 0, x, y, s);
    blot.addColorStop(0, "rgba(0,0,0,0.3)");
    blot.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = blot;
    g.fillRect(x - s, y - s, s * 2, s * 2);
  }
  veins(g, (c, a, b, width) => {
    c.strokeStyle = "rgba(0,0,0,0.85)";
    c.lineWidth = width;
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.stroke();
  });
}

function paintLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  // The skin glows through where it is thinnest: in each scallop, at the hem.
  let last = WRIST;
  for (const t of [...TIPS, ROOT]) {
    const x = (last.x + t.x) / 2 + (MIDDLE.x - (last.x + t.x) / 2) * 0.25;
    const y = (last.y + t.y) / 2 + (MIDDLE.y - (last.y + t.y) / 2) * 0.25;
    const glow = g.createRadialGradient(x, y, 0, x, y, 0.4);
    glow.addColorStop(0, "rgba(255,255,255,0.45)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = glow;
    g.fillRect(x - 0.4, y - 0.4, 0.8, 0.8);
    last = t;
  }
  // A hair of light along the lit side of every vein.
  veins(g, (c, a, b, width) => {
    c.strokeStyle = "rgba(255,255,255,0.7)";
    c.lineWidth = width * 0.4;
    c.beginPath();
    c.moveTo(a.x - width * 0.5, a.y - width * 0.5);
    c.lineTo(b.x - width * 0.5, b.y - width * 0.5);
    c.stroke();
  });
}

export const WING_SPRITE: SpriteSpec = {
  name: "instar-wing",
  frames: 1,
  aspect: WIDE / TALL,
  body: paintBody,
  light: paintLight,
};

/** The membrane's detail laid over `skin.membrane`, in the wing's frame: one draw. */
export function drawBakedMembrane(
  ctx: CanvasRenderingContext2D,
  skin: WingSkin,
  dpr: number,
): void {
  const [o, u, v] = skin.frame;
  const ax = u.x - o.x;
  const ay = u.y - o.y;
  const bx = v.x - o.x;
  const by = v.y - o.y;
  // Edge-on, the frame folds flat and there is no skin to see.
  if (Math.abs(ax * by - ay * bx) < 1 || skin.fade <= 0) return;
  const s = tintedSprite(
    WING_SPRITE,
    spritePx(skin.unit * TALL, dpr),
    PALETTE.sheenDeep,
    PALETTE.sheenCold,
  );
  ctx.save();
  ctx.clip(skin.membrane);
  ctx.transform(ax, ay, bx, by, o.x, o.y);
  ctx.globalAlpha *= skin.fade * skin.lit * (0.55 + 0.45 * skin.sheen);
  ctx.drawImage(s.canvas, 0, 0, s.w, s.h, LEFT, TOP, WIDE, TALL);
  ctx.restore();
}
