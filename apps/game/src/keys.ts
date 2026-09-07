import { type ControlSet, controlPress, deskKey, panelSends } from "@neon-spore/content";
import type { Layout } from "@neon-spore/render";
import { type Command, type Creature, midCol, type SimConfig } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";
import { deskGrip } from "./keys-grip.js";
import { guideKeyDown } from "./keys-guide.js";
import { bindSliding } from "./keys-slide.js";

/**
 * The keyboard, for playing both roles alone at a desk. Its own file rather
 * than the tail of `input.ts`: touch is the game's input and this is the test
 * rig's, and the two only met because they push into the same buffer.
 */

export interface KeyBindings {
  buffer: InputBuffer;
  layout: () => Layout;
  /** For `midCol`: where the ship stands before either player has moved. */
  cfg: SimConfig;
  isOver: () => boolean;
  /** The field, for G — the grip needs something to take hold of. */
  creatures: () => readonly Creature[];
  /**
   * Whether the guide is up — the only state the desk's three gate keys answer.
   * The introduction before it passes on its own timer, and a `brief` sent
   * while it stands is indistinguishable from that timer firing
   * (`sim/step.ts`); the touch dismiss guards on this for the same reason.
   */
  guideHolds: () => boolean;
  onPauseToggle: () => void;
  onWaveStep: (delta: number) => void;
  /** R, behind a guide: the desk's REPLAY (`render/guide-nav.ts`). */
  onGuideReplay: () => void;
  /**
   * The panel this wave is played on. Read fresh rather than captured: a wave
   * step changes it under the same listener, and a set captured at bind time
   * would gate the whole run by wave one's buttons.
   */
  controls: () => ControlSet;
}

/**
 * **A key belongs to the panel, not to a control**, and that is the whole
 * shape of this file now.
 *
 * It used to be a switch with a case per button, and a second switch next door
 * with a case per *round's* button — so every panel invented since had cost a
 * letter of its own, and THE CLAW's arm and mouth had ended up on M and O,
 * which nobody could be expected to find. The owner ended it: *the game
 * control keys should reuse the existing primary keys, so each key has several
 * actions depending on the active control set.* `content/src/keys-desk.ts` is
 * that rule — a seat's sideways pair, its two press keys, and the arrows for
 * whatever a panel walks across the field — and this file asks it one question
 * per press.
 *
 * What is left here is everything that is **nobody's button**. The grip and
 * the two keys that carry a held body, the ready gate's F, G and Space, pause,
 * replay, restart and the wave step are the host talking to a run rather than
 * a seat talking to a ship, so they keep fixed keys — the same four kinds
 * `panelSends` lets past its own gate (`control-sets-keys.ts`). W is the one
 * survivor of the old switch and it is not a button either: it is red and a
 * guard in one press, for the person at a desk who is both seats, and on a
 * panel carrying neither it says nothing.
 *
 * **The keyboard is gated by the wave's control set**, and it used to be the
 * opposite. The argument for leaving it open was that this file is the desk
 * rig — one person driving both seats, in every view — and that gating it
 * would stop a tester reaching a control without first finding the wave that
 * carries it. The owner reversed it in one sentence: *the active control set
 * also must fit the keyboard bindings, so if no cannon is visible, no cannon
 * shot is possible.* He is right, and THE CLAW is what made it obvious — a
 * panel that trades the gun for an arm is a panel where firing is not a thing
 * the game can do, and a key that still did it was the rig lying about the
 * game rather than standing in for a thumb.
 *
 * The gate is `panelSends`, asked once around the buffer rather than at each
 * of the pushes below, so a key added here cannot forget it.
 */
export function bindKeys({
  buffer,
  layout,
  cfg,
  isOver,
  creatures,
  guideHolds,
  onPauseToggle,
  onWaveStep,
  onGuideReplay,
  controls,
}: KeyBindings): () => void {
  /**
   * Every press this file makes, with the wave's own panel in front of it.
   *
   * One gate rather than a condition per key — see the header — so a key added
   * below cannot forget it, and a key that means nothing on this panel sends
   * nothing rather than something invisible. `send` and not `buffer.push`
   * everywhere in here, deliberately: the only way to reach the buffer
   * ungated is to type the longer name, which is a thing a reader notices.
   */
  const send = (player: 1 | 2, command: Command): void => {
    if (!panelSends(controls(), command.kind)) return;
    buffer.push(player, command);
  };

  const grip = deskGrip(cfg);
  const held = new Set<string>();
  /** The two keys under each hand that carry something sideways, and nothing
   * else in this file has to know they have a timer (`keys-slide.ts`). */
  const sliding = bindSliding(layout, midCol(cfg), send, controls);

  /** Whatever this key means to a wave's guide, if one is up. `false` when it
   * meant nothing there and the key is still the ship's (`keys-guide.ts`). */
  const guideKey = (code: string): boolean => {
    if (!guideHolds()) return false;
    const presses = guideKeyDown(code);
    for (const p of presses) send(p.player, p.command);
    return presses.length > 0;
  };

  /**
   * Whatever this panel puts on this key, pressed. `false` when the panel puts
   * nothing there and the key is one of the host's below.
   *
   * The sideways pairs are `sliding`'s and are asked first: a strip is a
   * column somebody has to count and a held direction has a release, neither
   * of which is one press of one command.
   */
  const panelKey = (code: string): boolean => {
    const key = deskKey(controls(), code);
    if (key === undefined) return false;
    send(key.player, controlPress(key.control).down);
    return true;
  };

  window.addEventListener("keydown", (e) => {
    if (held.has(e.code)) return;
    held.add(e.code);
    // Never the page's scroll: every arrow means something here, and Space is
    // the ready gate rather than a page jump.
    if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault();
    // A guide is up, and it owns its own keys before the ship gets them: F and
    // G are the ready gate's two halves, one seat each, Space is both at once
    // for the desk player who is both seats, and the sideways arrows turn its
    // pages (`keys-guide.ts`).
    if (guideKey(e.code)) return;
    if (sliding.down(e.code)) return;
    if (panelKey(e.code)) return;
    switch (e.code) {
      // Red *and* a guard, in one press. Not a button on any panel: it is one
      // whole defence for the person at a desk playing both seats, and two
      // gestures for THE MIRROR, which is why Q on its own is still red alone.
      case "KeyW":
        send(2, { kind: "fire", color: "red" });
        send(1, { kind: "guard" });
        break;
      // G takes hold of whatever is nearest the hull, **as player 2**. On a
      // phone the grip is a finger on the field and either player may use it;
      // at a desk this is the only way to see the half of it that matters —
      // the other player's hand, and the word on the field that names it.
      //
      // On THE WARDEN it is the rope instead, and that one is player 1's: the
      // seat is whatever `keys-grip.ts` says it is, per press.
      case "KeyG":
        for (const p of grip.take(creatures(), 2)) send(p.player, p.command);
        break;
      // THE PUSH, which on a phone is the same thumb sliding sideways and here
      // has to be keys of its own. They sit under the same hand as G and mean
      // nothing without it: one press carries the held body one column further
      // from where it was grabbed — or, with a rope in hand, the rope one step
      // further down (`keys-grip.ts`).
      case "Comma":
        for (const p of grip.carry(-1)) send(p.player, p.command);
        break;
      case "Period":
        for (const p of grip.carry(1)) send(p.player, p.command);
        break;
      // THE CHOIR's shake, at a desk, where nothing can be shaken. It is one
      // of the four kinds no panel may refuse (`control-sets-keys.ts`), so it
      // needs no set to carry it — and on a field with no membrane on it the
      // simulation does nothing with it (`choirShaken`).
      case "KeyK":
        send(1, { kind: "shake" });
        break;
      case "KeyP":
        onPauseToggle();
        break;
      // R plays the page of film again, which is the middle button on the bar
      // under it. Never a command: the film's clock is render state and the
      // two devices have one each (`render/guide-play.ts`).
      case "KeyR":
        if (guideHolds()) onGuideReplay();
        break;
      case "Enter":
        if (isOver()) send(1, { kind: "restart" });
        break;
      // The sideways arrows are the last word here, and only on a panel that
      // walks nothing across the field: a chart's sights and a snake's turns
      // took them above, the way the band takes them from the thumb.
      case "ArrowLeft":
        onWaveStep(-1);
        break;
      case "ArrowRight":
        onWaveStep(1);
        break;
      default:
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    // Unconditionally: a release arriving after the wave started is a no-op in
    // the simulation, while one skipped because the guide had *just* gone
    // would leave a thumb pressed on nobody's screen (`sim/briefing.ts`).
    const off = { kind: "brief", on: false } as const;
    if (e.code === "Space" || e.code === "KeyF") send(1, off);
    if (e.code === "Space" || e.code === "KeyG") send(2, off);
    if (e.code === "KeyG") for (const p of grip.release()) send(p.player, p.command);
    if (sliding.up(e.code)) return;
    // And whatever this panel puts on this key, let go — present on exactly
    // the controls a thumb stays on (`content/src/control-command.ts`).
    const key = deskKey(controls(), e.code);
    const release = key === undefined ? undefined : controlPress(key.control).up;
    if (key !== undefined && release !== undefined) send(key.player, release);
  });

  /** Called once per sim tick to advance held-key repeats. */
  return sliding.tick;
}
