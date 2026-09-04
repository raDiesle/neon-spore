import { type ControlSet, control, type SceneAnchor, type SceneStep } from "@neon-spore/content";
import { type Creature, gripCount, type World } from "@neon-spore/sim";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { BANNER_H, BANNER_TOP } from "./guide-switch.js";
import { hullBarBox } from "./hud.js";
import { bandLobes, type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { radarBlips } from "./radar-blip.js";
import { wrapText } from "./wrap-text.js";

/**
 * A step's words, drawn beside the thing they are about.
 *
 * **There is no text block under the picture, and that is the point.** The
 * owner asked for the tutorial to be the real screen at full size with the
 * words *inside* it, in the position where they are explaining — a paragraph
 * below a shrunken picture is two things to look at, and the eye that is
 * reading the paragraph is not watching the thing it describes.
 *
 * So a caption names a subject (`SceneAnchor`) and this finds it: a body on
 * the field, a control on the band, whatever a hand is holding, a mark on the
 * warning strip, the hull, the bar that says what the hull has left. Nothing is
 * placed by coordinate, so a caption cannot come off its subject when the
 * layout changes — the same rule the ghost thumb plays by (`guide-thumb.ts`).
 *
 * **It is loud now, and that was the owner's second answer to watching it.**
 * The first version was thirteen-point type in a box at three-quarters opacity
 * over a field with a blob falling through it, and the instruction was that the
 * text has to be more visible. So: bigger type, a solid ground under it, a
 * two-pixel edge in the subject's own colour, and it wraps rather than being
 * pushed off the side of a narrow screen.
 */

/** Ticks the caption takes to fade in, so a step arrives rather than blinks. */
const FADE_TICKS = 10;
const PAD = 13;
/**
 * How far the box stands off its subject, and how far off a *strip*.
 *
 * A strip is the bottom edge of the ship's own picture, so a box holding the
 * full clearance above one covers the hull it is drawn on — *the box overlaps
 * the cannon, can we move it more down, so we see the ship more, just some.*
 * It only moves as far as the strip's own ring, which is the thing it is
 * pointing at and the one place it may not cover.
 */
const CLEAR = 16;
const CLEAR_STRIP = 4;
/** One line's height, and the type it is set in. */
const LINE = 21;
const FONT = '700 16px "Courier New",monospace';

export function drawCaption(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  set: ControlSet,
  step: SceneStep,
  tick: number,
  beatPhase: number,
): void {
  const point = anchorPoint(l, world, set, step.anchor, beatPhase);
  if (!point) return;
  const k = Math.min(1, Math.max(0, (tick - step.tick) / FADE_TICKS));
  if (k <= 0) return;

  // The ring first, under the words: it is the subject being pointed at, and a
  // label over its own highlight would be a label nobody could read.
  if (step.anchor.at !== "hull" && step.anchor.at !== "health") {
    ctx.globalAlpha = 0.75 * k;
    ctx.strokeStyle = PALETTE.pod;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.r + 4 - 2 * k, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.font = FONT;
  // Wrapped rather than clamped: a caption wider than the screen used to be
  // shoved sideways until it was no longer beside the thing it was about.
  const lines = wrapText(ctx, step.text, l.width - 24 - PAD * 2);
  const h = lines.length * LINE + 12;
  let w = 0;
  for (const line of lines) w = Math.max(w, ctx.measureText(line).width);
  w += PAD * 2;
  // Above its subject when there is room above, below it when there is not:
  // the one thing a caption may never do is sit off the top of the screen. The
  // floor is the banner rather than the edge, because the banner is the other
  // thing that has to stay readable (`guide-switch.ts`).
  const floor = BANNER_TOP + BANNER_H + 8;
  const below = point.y - point.r - point.clear - h < floor;
  const y = below
    ? Math.max(floor, point.y + point.r + point.clear)
    : point.y - point.r - point.clear - h;
  const x = Math.max(8, Math.min(Math.max(8, l.width - w - 8), point.x - w / 2));

  ctx.globalAlpha = k;
  ctx.fillStyle = "rgba(9,7,20,.96)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // A short leader, so a label pushed sideways to stay on screen still says
  // which thing it belongs to.
  ctx.beginPath();
  ctx.moveTo(Math.max(x + 6, Math.min(x + w - 6, point.x)), below ? y : y + h);
  ctx.lineTo(point.x, below ? point.y + point.r + 2 : point.y - point.r - 2);
  ctx.stroke();

  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  ctx.font = FONT;
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, y + 22 + i * LINE);
  });
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

/** Where a caption's subject is, how big a ring around it has to be, and how
 * far the box has to stand off it. */
interface AnchorPoint {
  x: number;
  y: number;
  r: number;
  clear: number;
}

function anchorPoint(
  l: Layout,
  world: World,
  set: ControlSet,
  anchor: SceneAnchor,
  beatPhase: number,
): AnchorPoint | null {
  if (anchor.at === "body") {
    // The newest body on the field — the one nearest the top — because a
    // caption about an arrival is about the thing that has just arrived.
    let top: Creature | null = null;
    for (const c of world.creatures) {
      if (!top || c.row < top.row) top = c;
    }
    if (!top) return null;
    // Where it is *drawn*, not the tile it is logically on: a body glides
    // between rows, and `creatureCenter` is the one place that glide is
    // written down — a ring placed from the tile alone lands a whole row
    // behind the shape it is meant to be around.
    const at = creatureCenter(l, top, beatPhase);
    return { x: at.x, y: at.y, r: creatureRadius(l, top, beatPhase, world.cfg) + 6, clear: CLEAR };
  }
  if (anchor.at === "held") {
    // Whatever a hand is on. Either seat's: the page names which of them is
    // holding it, and a body with two hands on it is one body either way.
    for (const c of world.creatures) {
      if (!gripCount(world, c.id)) continue;
      const at = creatureCenter(l, c, beatPhase);
      return {
        x: at.x,
        y: at.y,
        r: creatureRadius(l, c, beatPhase, world.cfg) + 6,
        clear: CLEAR,
      };
    }
    return null;
  }
  if (anchor.at === "radar") {
    // The soonest blip this screen carries, or the middle of the strip when it
    // carries none — which is the picture "player 2 sees nothing" is about.
    // `radar-blip.ts` owns both, so the ring lands on the mark the strip is
    // really drawing rather than on a second guess at where one goes.
    const blip = radarBlips(l, world)[0];
    // A blip six beats out sits within a few pixels of the top edge, so the
    // ring round it is pushed down far enough to stay on the screen: a ring
    // half off the top says less about what it is round than a ring that is
    // near it and whole.
    if (blip) {
      const r = blip.s + 6;
      return { x: blip.x, y: Math.max(blip.y, r + 3), r, clear: CLEAR };
    }
    return emptyStrip(l);
  }
  if (anchor.at === "control") {
    const def = control(anchor.control);
    if (def.form === "lobe") {
      const lobe = bandLobes(l, set, def.player).find((b) => b.control.id === anchor.control);
      return lobe ? { x: lobe.circle.x, y: lobe.circle.y, r: lobe.circle.r, clear: CLEAR } : null;
    }
    const strip = anchor.control === "shield" ? l.shieldStrip : l.cannonStrip;
    const col = anchor.control === "shield" ? world.shieldCol : world.cannonCol;
    return { x: tileCX(l, col), y: strip.y, r: strip.height * 0.7, clear: CLEAR_STRIP };
  }
  if (anchor.at === "hull") return { x: l.width / 2, y: l.hullY, r: l.tile, clear: CLEAR };
  // `drawHud` owns where the bar is; this asks it rather than knowing.
  const bar = hullBarBox(l);
  return { x: bar.x + bar.w / 2, y: bar.y + bar.h / 2, r: 12, clear: CLEAR };
}

/**
 * Where to point when the strip is empty, which is a page in its own right —
 * *player 2 sees nothing*.
 *
 * Right of centre and low on the strip, for two reasons that are both about
 * what else is up there: the tutorial's own corner plate holds the left of it
 * (`guide-switch.ts`), and a ring drawn round the strip's true middle would be
 * half off the top of the screen. It is a place rather than a subject — there
 * is nothing there, and saying so is the point.
 */
function emptyStrip(l: Layout): AnchorPoint {
  const r = Math.max(9, l.radarHeight * 0.32);
  return { x: l.width * 0.7, y: Math.max(r + 3, l.gridTop - r), r, clear: CLEAR };
}
