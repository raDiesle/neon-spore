import { type ControlSet, panelSends } from "@neon-spore/content";
import type { Layout } from "@neon-spore/render";
import { type Command, type Creature, midCol, type SimConfig } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";
import { deskGrip } from "./keys-grip.js";
import { guideKeyDown } from "./keys-guide.js";
import { roundKeyDown, roundKeyUp } from "./keys-round.js";
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
  /** Whether SNAKE has the world: the arrows are the body's while it does. */
  snakeHolds: () => boolean;
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
 * A/D slide the cannon *and* the shield together, J/L move the shield alone.
 * Holding any of them keeps sliding: one step on keydown, then steps on a
 * repeat timer driven by `tick()` — the sim tick, not wall-clock time.
 *
 * F and G are the two keys that are *held* rather than pressed: the lance and
 * the grip. Both send a second command on the keyup, because nothing in the
 * simulation ends either on its own. Behind a wave's guide those same two keys
 * are the ready gate's two halves — one seat each — and Space is both at once
 * for the desk player who is both seats.
 *
 * **The keyboard is gated by the wave's control set**, and it used to be the
 * opposite. The argument for leaving it open was that this file is the desk
 * rig — one person driving both seats, in every view — and that gating it
 * would stop a tester reaching the lance without first finding the wave that
 * carries it. The owner reversed it in one sentence: *the active control set
 * also must fit the keyboard bindings, so if no cannon is visible, no cannon
 * shot is possible.* He is right, and THE CLAW is what made it obvious — a
 * panel that trades the gun for an arm is a panel where firing is not a thing
 * the game can do, and a key that still did it was the rig lying about the
 * game rather than standing in for a thumb.
 *
 * The gate is `panelSends`, asked once around the buffer rather than at each
 * of the twenty pushes below, so a key added here cannot forget it. The five
 * commands that are nobody's button — `restart`, the guide's two, the grip and
 * the relief — pass regardless, and that list is `control-sets-keys.ts`'s.
 */
export function bindKeys({
  buffer,
  layout,
  cfg,
  isOver,
  creatures,
  guideHolds,
  snakeHolds,
  onPauseToggle,
  onWaveStep,
  onGuideReplay,
  controls,
}: KeyBindings): () => void {
  /**
   * Every press this file makes, with the wave's own panel in front of it.
   *
   * One gate rather than twenty conditions — see the header — so a key added
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
  /** The four keys that slide a swelling and repeat while held, and nothing
   * else in this file has to know they have a timer (`keys-slide.ts`). */
  const sliding = bindSliding(layout, midCol(cfg), send);

  /** Whatever this key means to a wave's guide, if one is up. `false` when it
   * meant nothing there and the key is still the ship's (`keys-guide.ts`). */
  const guideKey = (code: string): boolean => {
    if (!guideHolds()) return false;
    const presses = guideKeyDown(code);
    for (const p of presses) send(p.player, p.command);
    return presses.length > 0;
  };

  window.addEventListener("keydown", (e) => {
    if (held.has(e.code)) return;
    held.add(e.code);
    // Never the page's scroll: every arrow means something here.
    if (e.code.startsWith("Arrow")) e.preventDefault();
    if (sliding.down(e.code)) return;
    switch (e.code) {
      case "KeyI":
        send(1, { kind: "guard" });
        break;
      case "KeyS":
        send(1, { kind: "intake" });
        break;
      // H holds the wave's malfunction off, and it is sent **as both seats**.
      // A fault hands the relief to one of them and `reliefHeard` drops it
      // from the other (`sim/malfunction.ts`), so one key covers either wave
      // without the desk rig having to know which fault is up — the same
      // reason W sends a shot and a guard in one press. Not R: that is the
      // film's replay and has been since guides had one.
      case "KeyH":
        send(1, { kind: "relief" });
        send(2, { kind: "relief" });
        break;
      // F holds the lance, as player 1. Held, not tapped: the lobe fills for
      // as long as the key is down and empties on the keyup below, which is
      // the same contract the thumb on the band has (`sim/lance.ts`).
      //
      // On a phone this key's button is on one panel only — the LANCE PANEL,
      // which a wave has to name. At a desk it is always here; see the note
      // above `bindKeys`.
      case "KeyF":
        // Behind a guide it is player 1's half of the ready gate (`keys-guide.ts`).
        if (guideKey("KeyF")) break;
        send(1, { kind: "prime", on: true });
        break;
      case "KeyW":
        send(2, { kind: "fire", color: "red" });
        send(1, { kind: "guard" });
        break;
      // Red on its own. W sends red *and* a guard, which is one press for a
      // whole defence and two gestures for THE MIRROR — a sequence asking for
      // a red shot and nothing else cannot be answered with it.
      case "KeyQ":
        send(2, { kind: "fire", color: "red" });
        break;
      case "KeyE":
        send(2, { kind: "fire", color: "cyan" });
        break;
      // G takes hold of whatever is nearest the hull, **as player 2**. On a
      // phone the grip is a finger on the field and either player may use it;
      // at a desk this is the only way to see the half of it that matters —
      // the other player's hand, and the word on the field that names it.
      case "KeyG": {
        // And G is player 2's half, for the same reason F is player 1's.
        if (guideKey("KeyG")) break;
        for (const command of grip.take(creatures())) send(2, command);
        break;
      }
      // THE PUSH, which on a phone is the same thumb sliding sideways and here
      // has to be keys of its own. They sit under the same hand as G and mean
      // nothing without it: one press carries the held body one column further
      // from where it was grabbed (`keys-grip.ts`).
      case "Comma":
        for (const command of grip.carry(-1)) send(2, command);
        break;
      case "Period":
        for (const command of grip.carry(1)) send(2, command);
        break;
      // Space is both seats at once, for the person at a desk playing both of
      // them — the same answer the director's stage gives in `TEST`.
      case "Space":
        e.preventDefault();
        guideKey("Space");
        break;
      // Whichever round has taken the panel away — THE GAUGE's valve and
      // call, THE FLEET's sights and salvo. One table next door rather than a
      // dozen more cases here (`keys-round.ts`).
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
      default: {
        // The arrows are the last word here: SNAKE takes all four while it has
        // the world, and otherwise the sideways two step between waves.
        const round = roundKeyDown(e.code, snakeHolds());
        if (round) send(round.player, round.command);
        // The sideways two turn a guide's pages while one is up, and step
        // between waves otherwise (`keys-guide.ts`).
        else if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
          if (!guideKey(e.code)) onWaveStep(e.code === "ArrowLeft" ? -1 : 1);
        }
        break;
      }
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    sliding.up(e.code);
    // Unconditionally: a release arriving after the wave started is a no-op in
    // the simulation, while one skipped because the guide had *just* gone
    // would leave a thumb pressed on nobody's screen (`sim/briefing.ts`).
    const off = { kind: "brief", on: false } as const;
    if (e.code === "Space" || e.code === "KeyF") send(1, off);
    if (e.code === "Space" || e.code === "KeyG") send(2, off);
    if (e.code === "KeyG") for (const c of grip.release()) send(2, c);
    if (e.code === "KeyF") send(1, { kind: "prime", on: false });
    const round = roundKeyUp(e.code);
    if (round) send(round.player, round.command);
  });

  /** Called once per sim tick to advance held-key repeats. */
  return sliding.tick;
}
