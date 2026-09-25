import { controlSetForWave } from "@neon-spore/content";
import {
  type Circle,
  cannonGrab,
  DeskSeat,
  type Field,
  flippedLayout,
  handedLayout,
  handedRole,
  type Layout,
  pointerSeat,
  pointerSeats,
  rolledLayout,
  shieldGrab,
  showsWell,
  type ViewRole,
  wellCannonGrab,
  wellShieldGrab,
} from "@neon-spore/render";
import { briefingHolds, faultsNow, guideHolds, handedOver, type World } from "@neon-spore/sim";
import { type BriefingBinding, bindBriefing } from "./briefing.js";
import { bindControls, type Controls, type InputBuffer } from "./input.js";
import { bindLost } from "./lost.js";
import type { RunState } from "./run-state.js";
import { readSettings } from "./settings.js";
import { bindShake } from "./shake.js";

/**
 * Everything a finger on the glass reaches: the field itself, a shake, the
 * guide's pages and a boss round's own buttons.
 *
 * They are one file because they are one knot — four listeners on one canvas,
 * every one of them asking the same four questions (which seat is this, where
 * is the stage, is a guide up, is a round on) and every one of them answering
 * into the same buffer. Wired in `main.ts` that knot was sixty lines of
 * argument objects between the parts being built and the loop being started,
 * and it put the file on its 250-line ceiling exactly, so the next binding
 * anybody added there broke the build. `shell.ts` is the precedent: everything
 * *around* the field is a knot with a name, and this is everything *on* it.
 *
 * The order is not arbitrary. `bindControls` captures the pointer on the
 * stage, so it goes on first and the three after it see what it did not take.
 */
export interface FieldInputOptions {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  world: World;
  run: RunState;
  layout: () => Layout;
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  role: () => ViewRole;
  beatPhase: () => number;
  /** The skin the renderer's last frame stood on (`Canvas2DRenderer.skinY`). */
  skinY: () => Field["skinY"];
  jumpToWave: (wave: number) => void;
  /** The guide, played again from its first page — the renderer owns the
   * playback, so this file only says when. */
  replayGuide: () => void;
  /** A press on the guide's picture, which the bar answers (`briefing.ts`). */
  nudgeGuide: () => void;
}

/** The keyboard's per-tick call and the two things a frame reads off a
 * pointer, plus the two things a headless caller asks of the field: the one
 * way it puts the guide away, and where a swelling on the ship is. */
export interface FieldInput extends Controls {
  dismissBriefing: BriefingBinding["dismiss"];
  /**
   * The grab circle a finger takes hold of the cannon or the shield by, in
   * the frame's own coordinates — the flat hull's or THE WELL's, by which one
   * this screen is drawing (`render/touch-ship.ts`, `render/touch-well.ts`).
   * The circle and never a hold: `bun run frames --hand` presses it with a
   * real pointer, so what the picture shows is what a press there does.
   */
  shipGrab: (on: "cannon" | "shield") => Circle;
}

export function bindFieldInput(o: FieldInputOptions): FieldInput {
  const { canvas, buffer, world, run, inStage, beatPhase } = o;
  /**
   * **The seat the frame was drawn for**, which THE HANDOVER trades for a window
   * in the middle of a wave (`render/handover.ts`). A control is never drawn in
   * one place and answered in another, so every hit test in this knot runs
   * against the same role the renderer seated itself with — the band, the
   * guide's pages and a round's own buttons all follow from these two.
   */
  const role = (): ViewRole => handedRole(o.role(), world);
  /**
   * And THE FLIP over the top of it: on the turned seat the field is drawn
   * about its middle while this band is not, so a hit test that did not fold
   * would answer the column the body *used* to be in — the one failure the
   * layout is shared to prevent (`render/field-flip.ts`).
   *
   * After the trade and not before, so the fold follows the panel this device
   * is playing, which is what every other seat split in `view-role.ts` does.
   *
   * `rolledLayout` rides on the end for the same reason one boss further on:
   * THE WELL's face turns, and a thumb has to be answered by the face it is
   * looking at rather than the one it opened on (`render/well-roll.ts`).
   */
  const layout = (): Layout =>
    rolledLayout(flippedLayout(handedLayout(o.layout(), world), world), world);
  // The desk keys, for the screen that shows both seats: while 1 or 2 is held
  // the mouse is that player's hand on the field, and while 3 is held it is
  // both players' (`render/desk-seat.ts`).
  const desk = new DeskSeat();
  window.addEventListener("keydown", (e) => desk.down(e.code));
  window.addEventListener("keyup", (e) => desk.up(e.code));
  window.addEventListener("blur", () => desk.clear());
  const controls = bindControls({
    canvas,
    buffer,
    layout,
    inStage,
    isOver: () => world.over,
    // The seat decides whose hand a finger on the field is. `test` is both
    // halves on one screen, so it is player 1's unless 1 or 2 is held, and G
    // grips as player 2 without either.
    //
    // **This device's own seat and not the traded one**, unlike everything else
    // here: a hand on the field is signed on the wire, and the simulation gives
    // a grip to the player who sent it. THE HANDOVER moves panels between
    // screens and moves nobody between seats (`sim/handover.ts`).
    player: () => pointerSeat(o.role(), desk.seat()),
    // And with neither key held on the test screen, both — so a press there
    // may take either seat's control first, whichever the tester reaches for
    // (`render/desk-seat.ts`, `render/desk-grab.ts`).
    seats: () => pointerSeats(o.role(), desk.seat()),
    // And `3`, the test screen's one mouse as both hands at once; a seated
    // screen has one seat to give whatever is held.
    both: () => o.role() === "test" && desk.both(),
    handed: () => handedOver(world),
    cfg: world.cfg,
    // **The boss, whatever it is.** Thirteen of them hang a handle on the field —
    // THE MAZE's string, THE WARDEN's rope, THE ORRERY's rings, THE SINEW's two,
    // THE SURGE's bulb, THE ANTIPHON's organ, THE INSTAR's marks, THE
    // FILAMENT's, THE STARE's lid, THE BULB QUEEN's, THE DIASTOLE's clamp, THE
    // MIRROR's lobes, THE GORGE's intakes — and each used to be named here, and three more times in
    // `input.ts`, as `world.boss?.kind === k ? world.boss : null`. The hit test
    // narrows it itself now, where it draws the handle (`render/touch-field.ts`
    // `bossOf`), so a fourteenth costs this file nothing.
    boss: () => world.boss,
    // Which panel is up follows from the wave (`content/control-sets.ts`).
    controls: () => controlSetForWave(world.wave),
    faults: () => faultsNow(world),
    // And whether this screen is drawn as THE WELL, which is a fact about the
    // boss *and* about the seat: the clock is the pilot's picture and the
    // navigator keeps the flat field, so the same world answers this
    // differently on the two phones (`render/src/well.ts`).
    well: () => world.boss?.kind === "well" && showsWell(role()),
    creatures: () => world.creatures,
    // The ship answers a finger where it is drawn, not only on the strips below.
    cannonCol: () => world.cannonCol,
    shieldCol: () => world.shieldCol,
    // Off unless the player turned it on (`settings.ts` `shipTouch`).
    ship: () => readSettings().shipTouch,
    opening: () => briefingHolds(world),
    beatPhase,
    skinY: o.skinY,
    beat: () => world.beat,
    waveBeat: () => world.waveBeat,
    worldTick: () => world.tick,
    // Space at the keyboard must not be able to do what a tap on the field
    // already can't: put the introduction away before its timer does. See the
    // guard in `keys.ts`.
    guideHolds: () => guideHolds(world),
    onPauseToggle: () => run.hold("hand", !run.held("hand")),
    onWaveStep: (delta) => o.jumpToWave(world.wave + delta),
    onGuideReplay: o.replayGuide,
  });

  // THE CHOIR's own control, and the only input in the game that is not a
  // finger on the glass. It is bound unconditionally and never behind a
  // capability check — there is no reliable way to ask a browser whether a
  // shake can be reported, so the game offers this *and* the two arrows on the
  // field and lets the pilot use whichever their phone answers (`shake.ts`).
  bindShake(buffer);

  const brief = bindBriefing({
    canvas,
    buffer,
    world,
    layout,
    inStage,
    role,
    replay: o.replayGuide,
    nudge: o.nudgeGuide,
  });
  // And a lost wave's two, the same way (`lost.ts`).
  bindLost({ canvas, buffer, world, layout, inStage });

  const shipGrab = (on: "cannon" | "shield"): Circle => {
    const l = layout();
    const well = world.boss?.kind === "well" && showsWell(role());
    if (on === "cannon")
      return well ? wellCannonGrab(l, world.cannonCol) : cannonGrab(l, world.cannonCol);
    return well ? wellShieldGrab(l, world.shieldCol) : shieldGrab(l, world.shieldCol);
  };

  return { ...controls, dismissBriefing: brief.dismiss, shipGrab };
}
