import { facet, KEY, pin, surfaceDim } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { drawIrisMarks, type IrisDraw } from "./eye-iris.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * The inside of an eye as a **ball**: lit across its whole face, with the iris
 * placed somewhere on it and travelling, under a highlight that does not move.
 *
 * **Two candidates, taken together.** This was `eye:iris` / `glaze` and
 * `eye:iris` / `turn` on the ALTERNATIVES page, and they were the two halves of
 * one disagreement about what to spend to make an eye read as round. TURN spent
 * *motion*: the iris pinned at a longitude and swept across the surface,
 * squashing toward the limb and losing the light as it goes. GLAZE spent
 * *nothing that moves*: the iris left dead centre, and the ball made entirely
 * out of a wash and one wet point. Each card argued the other's weakness
 * honestly — a light with no motion is half a cue and reads as a painted
 * button, and a mark travelling with no light on it is a disc sliding about
 * inside a flat hole. The owner read both on 9 September 2026 and asked for
 * them combined, which is the answer: the two cues are not alternatives, they
 * are the two halves of a surface.
 *
 * So the order below is the whole of it. The **dome** goes down first, under
 * the machinery, so the ring, the spokes and the hole keep the values the game
 * gives them and the colour a pair matches a shot against is untouched. The
 * **iris** rides the sphere on top of it. The **wet point** goes over
 * everything, at `KEY`, and stays there while the iris travels beneath it — a
 * mark that moves against a mark that does not, which `docs/dimensional.md`
 * calls the cheapest solid-looking thing there is.
 *
 * **It is on two bodies at once**, which is why the slot was never named after
 * either. `lid.ts` and `warden-eye.ts` both reach `EYE_LOOK` through
 * `drawEyeLens`, so this paints the small body whose whole picture is an eye
 * and the biggest fixture the game ever draws.
 *
 * **The readout is untouched, and it had to be.** The height of the aperture is
 * what the seat without the cord reads the tension off, and none of this
 * reaches it — the lens, its two lids and the number they carry are
 * `eye-lens.ts`. What is repainted is only what is inside the gap.
 *
 * **What to watch for, because both cards named it.** A warden with a
 * wandering eye is a boss that looks like it is dodging, in a game whose field
 * rule is that nothing the players control travels; if the pair start leading
 * shots on it, the sweep is why. And the dome is a second value laid over the
 * one colour they are matching a shot to: if a lid's cyan starts reading as a
 * different cyan from a slick's beside it, this has cost the field the one
 * thing it must never cost.
 */

/** Where the dome's bright side sits, as a share of the aperture's half-width,
 * along `KEY`. Well inside the rim: a highlight *on* the edge reads as the
 * edge being lit, which is the failure `docs/dimensional.md` names — a light
 * that follows the outline instead of falling on the surface. */
const DOME_AT = 0.5;

/** How far the wash reaches from that point before it is all shade. Larger
 * than the aperture, because a ball is lit across its whole face and only a
 * sticker has an edge. */
const DOME_R = 1.5;

/** How much of the eye's own colour the lit side takes, and how much of the
 * background the far side does. The shade is the smaller of the two on
 * purpose: this is a wet eye catching a light, not a body half in the dark. */
const DOME = 0.3;
const SHADE = 0.42;

/** How far the eye looks either side of straight ahead, in radians. Two thirds
 * of a right angle: far enough that the disc is squashed to under half its
 * width at the extremes, and short of the limb, where an iris would vanish and
 * the body would read as blind rather than as looking away. */
const SWEEP = 1.05;

/** Turns of the sweep per beat. Slower than the spokes by a long way — the
 * spokes are a mechanism idling and this is the thing *looking*, and a body
 * that scanned as fast as its own machinery turns would read as twitching. */
const RATE = 0.09;

/** How far out on the ball the iris sits, as a share of the aperture's own
 * half-width. Under one, because an eye's iris is a disc on a sphere rather
 * than a cap over its pole — at the ends of the sweep it has to still be
 * inside the lids the reading is taken off. */
const TRAVEL = 0.5;

/** What the iris keeps of its colour where it has turned furthest from the
 * light. Not zero: a mark that reaches nothing at the terminator reads as a
 * hole rather than as a thing on a surface (`surfaceDim`). */
const DIM = 0.55;

/** The wet point: where it sits along `KEY` as a share of the half-width, how
 * wide it is, and how bright. Tighter and nearer the rim than the dome, which
 * is what makes the two read as a surface and a reflection rather than as one
 * blur. */
const WET_AT = 0.62;
const WET_R = 0.26;
const WET = 0.6;

/**
 * How much the wet point swells with the eye's own breath.
 *
 * Read off `pr`, never restated: the pupil's pulse is `eye-lens.ts`'s rule and
 * a second copy of its frequency here would be exactly the drift the COPIES
 * sweep exists to catch. `pr / reach` *is* that pulse, already computed by the
 * caller, so the highlight tightens and swells with the hole at the middle of
 * the eye.
 */
const BREATH = 0.9;

/** The iris's home on the ball: straight ahead, on the equator. An eye looks
 * side to side far more than up and down, and a latitude of nought is what
 * keeps the disc off the poles, where `LAT_LIMIT` says a mark is a hairline
 * whatever the rotation does. */
const HOME = pin(0, 0, 1);

/**
 * The dome, baked once per colour and size and blitted after that.
 *
 * A radial gradient built per eye per frame is the shape of every performance
 * complaint in this repository (`.claude/skills/render-perf`), and an eye is
 * drawn on the biggest fixture in the game and on a creature a wave may send
 * several of. Every stop's alpha here is linear in `openness`, so the sprite is
 * baked wide open and the caller multiplies — which is what makes the key hold
 * still while the lids move.
 *
 * The key is the two colours and the aperture rounded to whole pixels. A key
 * that moves is a cache that never hits and grows without a ceiling
 * (`baked.ts`, `test/baked-growth.test.ts`); `reach` comes off a layout and
 * changes only when the phone does, and rounding it is what makes that certain.
 */
const domeCache = bakedCache<string, HTMLCanvasElement>();

/** How far past the aperture the sprite reaches, each way. The wash falls to
 * the ground colour well before its own edge, so this is the box it needs and
 * not the box it fills. */
const SPRITE_MUL = 3.2;

function domeSprite(rim: string, hex: string, reach: number): HTMLCanvasElement {
  const key = `${rim}|${hex}@${reach}`;
  const cached = domeCache.get(key);
  if (cached) return cached;

  const size = Math.max(2, Math.ceil(reach * SPRITE_MUL));
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (g) {
    const mid = size / 2;
    const lx = mid + KEY.x * reach * DOME_AT;
    const ly = mid + KEY.y * reach * DOME_AT;
    const dome = g.createRadialGradient(lx, ly, 0, lx, ly, reach * DOME_R);
    dome.addColorStop(0, rgba(rim, DOME));
    dome.addColorStop(0.45, rgba(hex, DOME * 0.35));
    dome.addColorStop(1, rgba(PALETTE.background, SHADE));
    g.fillStyle = dome;
    g.fillRect(0, 0, size, size);
  }
  domeCache.set(key, c);
  return c;
}

export function drawEyeBall(d: IrisDraw): void {
  const { ctx, cx, cy, pr, reach, rx, ry, ink, openness, t } = d;
  if (pr <= 0 || openness <= 0) return;

  const squash = ry / rx;
  const span = reach * SPRITE_MUL;

  // **The dome**, under the machinery. One wash across the whole opening, in
  // the socket's own squashed frame — so it is the shape of THE LID's almond or
  // THE WARDEN's round hole rather than a circle pasted into either — falling
  // from the eye's own colour where the light is to the cool ground at the far
  // rim. Blitted, never built: see `domeSprite`.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, squash);
  ctx.globalAlpha = openness;
  ctx.drawImage(domeSprite(ink.rim, ink.hex, Math.round(reach)), -span / 2, -span / 2, span, span);
  ctx.restore();

  // **The iris**, riding the surface. On the beat clock, like everything else
  // inside an eye, so two phones draw one picture. `x` is the sphere's own
  // arithmetic and never a fraction of the angle, and `scale(sx, sy)` is the
  // tangent plane's own map — which is why the disc squashes to an ellipse
  // toward the edge rather than shrinking, and why the spokes squash with it
  // instead of being redrawn shorter.
  const theta = SWEEP * Math.sin(t * RATE * Math.PI * 2);
  const f = facet(HOME, theta);
  ctx.save();
  ctx.translate(cx + f.x * reach * TRAVEL, cy + f.y * reach * TRAVEL);
  ctx.scale(f.sx, f.sy);
  ctx.globalAlpha = surfaceDim(DIM, f.lit);
  drawIrisMarks(ctx, 0, 0, pr, ink, openness, t);
  ctx.restore();

  // **The wet point, over everything and outside that transform.** A film has
  // one bright reflection, it is where the light is, and it does not go
  // anywhere — the iris travels under it, and that contrast is the claim. What
  // it does do is breathe with the pupil, the one motion this eye already has,
  // so a wide open eye is never a still picture.
  //
  // `halo` rather than a gradient of its own, for `domeSprite`'s reason and one
  // more: a soft additive point is exactly what that sprite already is, and it
  // rounds its own radius, so the breathing cannot turn the key into something
  // that moves every frame.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, squash);
  halo(
    ctx,
    KEY.x * reach * WET_AT,
    KEY.y * reach * WET_AT,
    reach * WET_R * (1 + BREATH * (pr / reach)),
    PALETTE.text,
    WET * openness,
  );
  ctx.restore();
}
