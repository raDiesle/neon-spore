import type { ControlSet, GuideScene } from "@neon-spore/content";
import type { SceneRun, SimConfig, World } from "@neon-spore/sim";
import { flippedLayout } from "./field-flip.js";
import {
  drawGripThumb,
  fieldThumb,
  gripThumb,
  handleThumb,
  tapThumb,
  tileThumb,
} from "./guide-hand.js";
import { GUIDE_LOOK } from "./guide-look.js";
import { drawGhostThumb, thumbAnchors } from "./guide-thumb.js";
import { computeLayout, computeStage, type Layout, type Stage, type ViewRole } from "./layout.js";

/**
 * Two pieces of the rehearsal's picture that `guide-scene.ts` lays out and
 * does not draw itself: where the film stands, and the hands on it. Split out
 * when that file reached the length ceiling.
 */

/**
 * Where the film stands on the stage it is given, and the layout inside it.
 *
 * The stage minus the nav bar: the film is a whole phone screen, and BACK,
 * the page number and NEXT get their own band under it rather than sitting on
 * the one the film is teaching.
 *
 * And a phone screen is *phone-shaped*: the film is stood in the rectangle the
 * game itself would take on this stage (`computeStage`), for the seat it is
 * showing, and centred. Laid out across the whole box instead, a stage wider
 * than the film's own columns — the director's, whose TEST stage is cut for a
 * taller band, or any viewer squarer than a phone — showed the field short of
 * the box on both sides, with the hull clipped to the field and the band
 * running on under it: the ship's skin cut off square at top-left and
 * top-right (the owner, 12 September 2026). On a phone the box is the phone
 * and the rectangle is the box, less the nav bar's height.
 */
export function filmLayout(box: Layout, cfg: SimConfig, seat: 1 | 2): FilmLayout {
  const role = seatRole(seat);
  const film = computeStage({
    width: box.width,
    height: Math.max(1, box.height - GUIDE_LOOK.navHeight),
    dpr: 1,
  });
  const size = { width: film.width, dpr: 1 };
  return {
    film,
    page: computeLayout({ ...size, height: film.height }, cfg, role),
    l: computeLayout(
      { ...size, height: Math.max(1, film.height - GUIDE_LOOK.bandFoot) },
      cfg,
      role,
    ),
    top: GUIDE_LOOK.bandFoot,
  };
}

/**
 * The film's two layouts, and where the picture stands in the page.
 *
 * `page` is the whole rectangle: the band across the top, the rim round it and
 * the bar's own geometry are laid out in it, and it is what they were always
 * laid out in. `l` is the **picture** — the phone screen the pair is being
 * shown — and it is shorter by the band's foot and drawn `top` below it.
 *
 * **They were one layout until 18 September 2026, and the band covered the top
 * of the field.** A page is the box less the bar's height and the field is
 * anchored to the panel at the bottom, so row 0 stood about the bar's height
 * higher in a page of film than in the wave — under the band, whose foot the
 * seat draw only ever handed the HUD (`ViewState.clearTop`). Anything hung
 * *over* row 0 was drawn there and then covered: THE TASTER's crest and fan in
 * every page of its film, THE GORGE's sack in the first page of its, THE
 * ANTIPHON's body and the navigator's rail in all of its, THE ORRERY's top arc
 * so that its *three rings* showed two and a half — and the boss cue on the
 * marks that stand high (`boss-cue-draw.ts`). A film that hides the thing the
 * page is about is the one picture of it that does not show it.
 *
 * The band's foot comes off the playable height the way the bar's already
 * does, so the picture is **squeezed rather than slid**: nothing moves out of
 * the page and the tile shrinks by the same share the bar already costs it.
 * The other two answers are worse. A narrower stage is close to what the owner
 * refused on 12 September 2026 — the field short of the box on both sides —
 * and starting the field under the band and letting a caption say what is
 * covered is a rehearsal explaining its own furniture.
 */
export interface FilmLayout {
  /** Where the page stands on the stage, and how wide it is. */
  film: Stage;
  /** The page: the band, the rim and the bar are laid out in this. */
  page: Layout;
  /** The picture: the phone screen being shown, `top` below the page's top. */
  l: Layout;
  /** How far under the page's top the picture starts — the band's foot. */
  top: number;
}

export function seatRole(seat: 1 | 2): ViewRole {
  return seat === 1 ? "p1" : "p2";
}

/**
 * The film's layout as one seat's screen would carry it: that seat's role,
 * and the fold on it when this is the screen THE FLIP has turned.
 *
 * The seat drawn is not always the seat laid out for — during the slide the
 * outgoing screen is drawn in the incoming one's rectangle — so the role is
 * set here rather than trusted. And the fold is applied here rather than in
 * `filmLayout`, because a film's caption and hands are laid on the same
 * layout as its bodies, and a ring pointed at a body has to turn with the
 * body it points at. Until 18 September 2026 no film folded at all: the
 * phone mirrored (`canvas2d.ts`) and the rehearsal of the same wave did not,
 * which taught the one wave about a turned screen on a screen that stayed.
 */
export function seatLayout(l: Layout, seat: 1 | 2, world: World): Layout {
  const role = seatRole(seat);
  return flippedLayout(l.role === role ? l : { ...l, role, flip: false }, world);
}

/**
 * The hands: the ghost thumb the script places, the four read off the world —
 * a grip, a press on the ship, a hand on a cord and a thumb on a box — and the
 * one on a bare square, placed from the act because nothing is drawn under it.
 */
export function drawHands(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  run: SceneRun,
  scene: GuideScene,
  set: ControlSet,
  seat: 1 | 2,
  phase: number,
): void {
  drawGhostThumb(ctx, thumbAnchors(scene, set, l, run.world), run.tick, l.lobeR, seat);
  // And the other hand, if this seat has one on the field. It is drawn from
  // the world rather than from the script, so it rides the body it is
  // slowing (`guide-thumb.ts`).
  const held = gripThumb(l, run.world, seat, phase);
  if (held) drawGripThumb(ctx, held, l.lobeR);
  // And the hand on the ship, for a film about reaching a control the other
  // way (`SceneAct.onField`).
  const onShip = fieldThumb(l, run.world, scene, run.tick, seat);
  if (onShip) drawGripThumb(ctx, { ...onShip, r: l.lobeR }, l.lobeR * (onShip.press ? 0.86 : 1));
  // And the hand carrying a cord, a string or a rope (`SceneAct.drag`). Read
  // off the world like the other two, so it rides a handle that is falling.
  const onCord = handleThumb(l, run.world, seat, phase);
  if (onCord) drawGripThumb(ctx, onCord, l.lobeR);
  // And the thumb on a box (`SceneAct.tap`), placed off the world like the
  // three above it so it lands on the body the command lands on.
  const onBox = tapThumb(l, run.world, scene, run.tick, seat, phase);
  if (onBox) drawGripThumb(ctx, onBox, l.lobeR);
  // And the finger on a bare square (`SceneAct.tile`), the one hand placed
  // from the act: the seat pressing is the seat with nothing drawn to press.
  const onTile = tileThumb(l, scene, run.tick, seat);
  if (onTile) drawGripThumb(ctx, onTile, l.lobeR);
}
