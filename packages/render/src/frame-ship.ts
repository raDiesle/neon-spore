import { setHas } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { bandControlSet, drawBand } from "./band.js";
import { bandLobes } from "./band-lobes.js";
import { drawWaveOpening } from "./briefing.js";
import type { Effects } from "./effects.js";
import { drawFaultBeam, faultBeamEnds } from "./fault-emitter.js";
import { drawFenceArcs } from "./fence-arc.js";
import type { GuideStage } from "./guide-scene.js";
import { drawControlHover } from "./hover.js";
import { drawHud, drawOverlay } from "./hud.js";
import { drawHull, type HullMood, hullSkinY, type LobePositions, surfaceSampler } from "./hull.js";
import { frame, type HullFrame } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { drawMagnetAlarm } from "./magnet-alarm.js";
import { drawMazeDrips } from "./maze-drips.js";
import type { OpeningFx } from "./opening-fx.js";
import { drawOtherHand } from "./other-hand.js";
import { hullShake, torchTremor } from "./queen.js";
import { drawReachArm } from "./reach-arm.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShipHand } from "./ship-hand.js";
import { drawCommsSiren } from "./siren.js";
import { drawTorchAlarm } from "./torch-alarm.js";
import { showsCannon, showsShield } from "./view-role.js";

/**
 * **The two passes that are about the ship**: the hull with its controls, and
 * the overlays laid over a finished frame.
 *
 * `frame-field.ts` next door is the other half, and the note at the top of it
 * says why the cut is here. `frame-passes.ts` is still what a caller reaches
 * for.
 */

/** The player's own hull, its controls, and the transients glued to them. */
export function drawShip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  effects: Effects,
  mood: HullMood,
  at: LobePositions,
  // Built once for the whole ship pass: `drawHull`, `drawOtherHand` and the
  // rock-impact overlay below all sample the same breathing membrane this
  // tick, and `frame()` is not free — see hull-frame.ts. The caller passes one
  // in when it built the same frame a pass earlier, which it does the moment
  // anything on the *field* has to stand on this ship: a worm walks the hull
  // and its cannon (`frame-field.ts`), and two frames of one membrane a
  // fraction of a tick apart would put the ground under it in one place and
  // the ship in another.
  f: HullFrame = frame(l, view.time, mood, at),
): void {
  // Whether the swelling player 1 slides is a **hand** rather than a gun. It
  // is the panel's answer and not the world's — an arm at home looks like no
  // arm at all — and it is asked once here for the two passes that need it:
  // the hull leaves the gun's own mouth undrawn, and the arm is drawn folded
  // on the crown where that mouth used to sit (`reach-arm.ts`).
  const arm = setHas(bandControlSet(view.controls, world.wave), "reach");
  // Queen boss only: the ship's own render-only echo of her torch tremor
  // (queen.ts's `hullShake`); undefined everywhere else, so `drawHull` falls
  // back to its own no-shake default.
  const shake =
    world.boss?.kind === "queen"
      ? hullShake(torchTremor(l.tile, world.boss, world.beat, view.time))
      : undefined;
  drawHull(
    ctx,
    l,
    world.scars,
    view.time,
    mood,
    at,
    (x) => !effects.rockImpact.coversCrater(x, l.tile),
    (col, beat) => effects.arrivals.has(col, beat),
    // Whose ship this is. Violet on player one's screen, amber on player two's
    // — the one thing on either screen that says which of the two it is without
    // being read (`seat-skin.ts`).
    seatSkin(view.role).hull,
    shake,
    f,
    arm,
  );
  // **THE FENCE's current, jumping between a wall on its way down and the dome
  // under it** — here rather than in the field pass, because that pass runs
  // under the hull and a bolt drawn there would be painted over at exactly the
  // end that matters (`fence-arc.ts`). Off the same membrane the hull was drawn
  // from, so it lands on the skin the eye is looking at.
  drawFenceArcs(ctx, l, world, at, surfaceSampler(f), view.beatPhase, view.time);
  // THE CLAW's arm, out of the swelling that was the gun and up its column. In
  // the ship pass rather than the field one, and after the hull: it *is* the
  // ship on this panel, and an arm drawn under the membrane would come out
  // from behind the thing it is part of (`reach-arm.ts`).
  drawReachArm(ctx, l, world, surfaceSampler(f), arm, f.cannonX);
  // A hand on the lance, read straight off the world both devices share (other-hand.ts).
  drawOtherHand(ctx, l, world, view.time, mood, at, f);
  // In front of the hull, unlike the rest of Effects.draw() — `Effects.rockImpact`.
  effects.rockImpact.draw(ctx, l, view.time, (x) => hullSkinY(l, view.time, mood, at, x, f));
  effects.drawBanner(ctx, l);
  if (world.boss?.kind === "mirror") {
    effects.mirror.draw(ctx, l, world.cfg, world.boss, world.beat, view.beatPhase);
  }
  // Last of the ship pass and over all of it: a ring that says which swelling
  // this phone's own finger has hold of. It is drawn from the world's columns
  // rather than from `at`, because that is where the press was answered — a
  // ring that followed the eased lobe would drift off its own hit region
  // (`touch-ship.ts`).
  drawShipHand(ctx, l, world.cannonCol, world.shieldCol, view.hand, view.time);
}

/** The frame's two windows, and whatever the wave's opening needs drawing. */
export interface OverlayState {
  armed: boolean;
  open: boolean;
  /** The membrane the ship pass was drawn from, so anything laid on the hull
   * here lies on the skin the eye is looking at rather than on a flat line. */
  surfaceY?: (x: number) => number;
  /** A rehearsal the caller owns, on a host that has one. */
  scene?: GuideStage;
  /** The opening's own clock (`opening-fx.ts`). */
  fx?: OpeningFx;
}

/** What sits on top of a finished frame: HUD, alarms and the wave's opening. */
export function drawOverlays(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  state: OverlayState,
): void {
  const { armed: isArmed, open: isOpen, scene, fx, surfaceY } = state;
  drawHud(ctx, l, view);
  drawTorchAlarm(ctx, l, world, view.time);
  // And the pilot's own call, on the pilot's screen alone (`magnet-alarm.ts`).
  drawMagnetAlarm(ctx, l, world, view.time);
  // Over the HUD and under the band: the one instrument that says *talk*, for
  // every creature that needs it. It is an overlay rather than part of the
  // field because it is about the pair rather than about anything standing in
  // a column (`siren.ts`).
  drawCommsSiren(ctx, l, world, view.time);
  drawBand(
    ctx,
    l,
    world,
    isArmed,
    isOpen,
    view.time,
    view.controls,
    view.leadTicks ?? 0,
    surfaceY ?? null,
  );
  // Over the finished band, from the emitter at the top of the field down to
  // the button the fault has taken on this screen (`fault-emitter.ts`).
  drawFaultBeams(ctx, l, world, view);
  // Over the finished band: whichever control a desk's mouse is resting on.
  drawControlHover(ctx, l, view);
  drawOverlay(ctx, l, view);
  // Over the band, because it runs down the front of it: what a shot the
  // heart refused threw at the ship (`maze-drips.ts`). It is the one thing on
  // a frame that is meant to be above the pair's own controls, which is why it
  // is here and not with the rest of THE MAZE's picture.
  drawMazeDrips(ctx, l, world, world.beat, view.beatPhase, surfaceY);
  // Over the pause overlay and everything else: while a wave's introduction or
  // its guide is up the world is not ticking, so nothing under it is doing
  // anything worth seeing.
  drawWaveOpening(ctx, l, world, {
    role: view.role,
    scene,
    time: view.time,
    fx,
    names: view.names,
    pointer: view.pointer,
  });
}

/** The fault's beam ends are the band's own circles, read off the same set
 * the band was drawn from, plus the dome or the muzzle for the seat that has
 * the thing and not its button. */
function drawFaultBeams(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
): void {
  if (world.malfunction === null) return;
  const set = bandControlSet(view.controls, world.wave);
  const lobes = [...bandLobes(l, set, 1), ...bandLobes(l, set, 2)].map((b) => ({
    id: b.control.id,
    x: b.circle.x,
    y: b.circle.y,
    r: b.circle.r,
  }));
  const ends = faultBeamEnds(l, world, lobes, showsCannon(view.role), showsShield(view.role));
  drawFaultBeam(ctx, l, world, ends, view.beatPhase, view.time);
}
