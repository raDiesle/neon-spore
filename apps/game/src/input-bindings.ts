import type { ControlSet } from "@neon-spore/content";
import type { Field, Layout } from "@neon-spore/render";
import type { BossState, Creature, PlacedFault, SimConfig } from "@neon-spore/sim";
import type { InputBuffer } from "./input-buffer.js";

/**
 * **What the pointer rig is handed.** Split out of `input.ts` when the ship
 * itself became touchable and that file reached its length limit, along the
 * seam `render/touch-field.ts` was cut on: this is a *shape*, and next door is
 * the listener that reads one. Every field on it arrived one at a time with a
 * paragraph saying why it is read fresh rather than captured, or required
 * rather than defaulted — which is the half a reader scrolls past.
 *
 * Re-exported from `input.ts`, so nothing that already reached for `Bindings`
 * through that file had to move.
 */
export interface Bindings {
  canvas: HTMLCanvasElement;
  buffer: InputBuffer;
  /** Read fresh on every event — the layout changes when the screen does. */
  layout: () => Layout;
  /**
   * A pointer event in the coordinates the picture was drawn in, or null when
   * it landed beside the phone-shaped rectangle the game is drawn into.
   *
   * Handed in rather than worked out here for the reason
   * `render/stage-point.ts` gives: a second copy of where a finger lands
   * drifts. This file had one of five in `apps/game` alone (`viewport.ts`).
   */
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  isOver: () => boolean;
  /**
   * Which seat this device holds. The field belongs to both players, so a
   * finger on a creature has to be signed with whoever is sitting here — the
   * strips below can be told apart by where they are, and this cannot.
   */
  player: () => 1 | 2;
  /**
   * The seats this device's one pointer may speak for, most preferred first
   * (`render/desk-seat.ts` `pointerSeats`). One on a phone and one on a seated
   * screen; both on the test screen with no seat key held, where a press picks
   * between them by what is under it (`render/desk-grab.ts`).
   */
  seats: () => readonly (1 | 2)[];
  /**
   * Whether the desk's `3` is held: a press is every seat's that finds
   * something under it (`render/desk-seat.ts` `bothKey`). Never on a phone.
   */
  both: () => boolean;
  /**
   * Whether THE HANDOVER has the two panels traded this beat
   * (`sim/handover.ts`).
   *
   * The band is answered against the seat the *frame* was drawn for, which is
   * the other one while the fault holds — so a press on it comes back signed as
   * the other player, and this is what says to sign it as this device instead.
   * The two identities on the wire never trade and must not: the simulation
   * gives a grip, a balloon's pull or a tap on a box to whoever sent it, and a
   * lockstep refuses a press attributed to the peer outright
   * (`packages/net/src/lockstep.ts`).
   */
  handed: () => boolean;
  /** The numbers the hit test needs: a tether's row, a drum's width. */
  cfg: SimConfig;
  /** Whether this screen is drawn as THE WELL (`render/src/well.ts`). */
  well: () => boolean;
  /**
   * **The boss running**, read fresh on every event and stated rather than
   * defaulted, for the reason `Field` gives at length: a handle that is drawn
   * and answers nothing is the one failure the hit test exists to prevent.
   *
   * It was thirteen getters — one per boss a thumb can reach — and each of them
   * was `world.boss?.kind === k ? world.boss : null`, which is this field with
   * the narrowing done early. Done late instead, in `bossOf` beside the hit
   * test that wants it, a fourteenth boss costs nothing here at all.
   */
  boss: () => BossState | null;
  /**
   * The panel this wave is played on, read fresh: a control the wave's set does
   * not name has no button and must not answer a thumb (`render/touch.ts`).
   */
  controls: () => ControlSet;
  /**
   * The fault the wave in front of the pair is played under, or `null`. Read
   * every frame rather than once, for `controls`' reason: a wave ends and the
   * next one may be played straight (`sim/malfunction.ts`).
   */
  faults: () => readonly PlacedFault[];
  /** The field, for hit-testing a finger against what is falling. */
  creatures: () => readonly Creature[];
  /**
   * Where the two lobes are standing. The ship is touchable where it is drawn
   * — slide the cannon, press the shield, swipe the muzzle — so the hit test
   * has to be told which columns those swellings are over
   * (`render/touch-ship.ts`).
   */
  cannonCol: () => number;
  shieldCol: () => number;
  /**
   * Whether the wave's opening is up. Only the ring reads it, and only to stay
   * dark: while a wave is held the simulation drops every press but the
   * opening's own and, under the introduction, the two that aim (`sim/step.ts`),
   * so a swelling that lit under a thumb could be feedback for a press that
   * never happened — the exact lie this whole ring exists to avoid. The ship
   * sliding is the aim's own answer.
   */
  opening: () => boolean;
  /** 0..1 within the beat, so a grab lands on the creature as drawn, not as
   * it stood on the last beat. */
  beatPhase: () => number;
  /** The ship's skin the last frame stood on, so a landing body is answered
   * where it was drawn in the plating (`render/touch-field.ts`). */
  skinY: () => Field["skinY"];
  /** The beat the field is standing on. THE BEATBOX's hit test reaches as far
   * as the body is *drawn*, and how big that is depends on whether this beat
   * has already been tapped (`render/beatbox-tap.ts`). */
  beat: () => number;
  /** The beat this *wave* is standing on. THE VANE's arm sweeps on a cycle
   * counted from the wave's own first beat, and the tip's column is what the
   * pilot's thumb lands on (`render/vane-grip.ts`). */
  waveBeat: () => number;
  /** The tick the world is on, for the things that move between beats: SNAKE's
   * head and tail slide the whole way to the tile they are entering
   * (`render/snake-grip.ts`). Named for the world rather than called `tick`,
   * because `Controls.tick` next door is the keyboard's per-tick call and one
   * file reads both. */
  worldTick: () => number;
  /**
   * Whether the guide is up — passed straight through to the keyboard rig,
   * which needs it to keep Space from skipping the introduction ahead of the
   * guide (`keys.ts`).
   */
  guideHolds: () => boolean;
  onPauseToggle: () => void;
  /** Wave step, for the test keys. Positive is forwards. */
  onWaveStep: (delta: number) => void;
  /** R, behind a guide: play its page of film again (`render/guide-nav.ts`). */
  onGuideReplay: () => void;
}

/**
 * The `Field` a hit test is asked with, read off the bindings at this press.
 * Built fresh every time, because every one of these moves between two
 * presses; beside the bindings it reads so that a field added to `Field` is
 * added here and to `Bindings` in one file, not copied through a destructure.
 */
export function fieldFrom(b: Bindings, seat?: 1 | 2): Field {
  return {
    creatures: b.creatures(),
    cannonCol: b.cannonCol(),
    shieldCol: b.shieldCol(),
    beatPhase: b.beatPhase(),
    skinY: b.skinY(),
    beat: b.beat(),
    waveBeat: b.waveBeat(),
    tick: b.worldTick(),
    // The seat asked for, where a press is trying each of them in turn
    // (`render/desk-grab.ts`); this device's own otherwise.
    seat: seat ?? b.player(),
    cfg: b.cfg,
    boss: b.boss(),
    controls: b.controls(),
    faults: b.faults(), // in force this beat; the well's clock is one seat's (`render/well.ts`)
    well: b.well(),
  };
}
