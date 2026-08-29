import type { Layout } from "@neon-spore/render";
import { type Creature, isGrippable, NO_GRIP } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The keyboard, for playing both roles alone at a desk. Its own file rather
 * than the tail of `input.ts`: touch is the game's input and this is the test
 * rig's, and the two only ever met in the same file because they push into the
 * same buffer.
 */

export interface KeyBindings {
  buffer: InputBuffer;
  layout: () => Layout;
  isOver: () => boolean;
  /** The field, for G — the grip needs something to take hold of. */
  creatures: () => readonly Creature[];
  /**
   * Whether the guide is up — the only state Space is allowed to put away.
   * The introduction before it passes on its own timer, and a `brief`
   * command sent while it stands is indistinguishable from that timer
   * firing (`sim/step.ts`), which is exactly why the touch dismiss in
   * `briefing.ts` already guards on this before pushing.
   */
  guideHolds: () => boolean;
  onPauseToggle: () => void;
  onWaveStep: (delta: number) => void;
}

/**
 * The creature closest to the hull — the one a pair would actually reach for.
 * Never a boss body, which cannot be gripped (`isGrippable` in sim/types.ts).
 *
 * THE WARDEN's tether wins outright whatever else is falling, because it is
 * the only thing on the field a hand is the *only* answer to: a rock a hand
 * misses is still a rock the shield can meet, and a line nobody pulls costs
 * the hull and the plate both. On one screen this key is the whole of player
 * 2's half of that fight — the finger on the field is signed with this
 * device's seat, and half the cycles hold that seat's own control.
 */
function nearestHull(creatures: readonly Creature[]): number {
  const tether = creatures.find((c) => c.kind === "tether");
  if (tether) return tether.id;
  let best = NO_GRIP;
  let bestRow = -1;
  for (const c of creatures) {
    if (!isGrippable(c.kind) || c.row <= bestRow) continue;
    best = c.id;
    bestRow = c.row;
  }
  return best;
}

/** Ticks (at `cfg.tickHz`, currently 120) before a held move key starts repeating. */
const KEY_REPEAT_DELAY_TICKS = 24;
/** Ticks between repeats once a held move key is repeating. */
const KEY_REPEAT_INTERVAL_TICKS = 8;

/**
 * A/D slide the cannon *and* the shield together, J/L move the shield alone.
 * Holding any of them keeps sliding: one step on keydown, then steps on a
 * repeat timer driven by `tick()` — the sim tick, not wall-clock time, so a
 * held key is exactly as reproducible as everything else in `sim`.
 *
 * F and G are the two keys that are *held* rather than pressed: the lance and
 * the grip. Both send a second command on the keyup, because nothing in the
 * simulation ends either on its own.
 *
 * **The keyboard is not gated by the wave's control set, and that is the same
 * decision the view switch already made.** A wave names one whole panel and
 * the band draws that panel and nothing else (`packages/content/src/control-sets.ts`),
 * so on an ordinary wave there is no lance on screen and no thumb can reach
 * one. This file is the desk rig: one person driving both seats, in every view,
 * including the halves this screen is not showing. Gating it would mean a
 * tester could not open the lance without first finding the wave that carries
 * it, which is the opposite of what the rig is for. What is *shown* and what a
 * single tester can reach have never been the same list here.
 */
export function bindKeys({
  buffer,
  layout,
  isOver,
  creatures,
  guideHolds,
  onPauseToggle,
  onWaveStep,
}: KeyBindings): () => void {
  let cannon = -1;
  let shield = -1;
  const held = new Set<string>();
  const repeatTicks = new Map<string, number>();

  const moveCannon = (delta: number): void => {
    const cols = layout().cols;
    cannon = Math.min(cols - 1, Math.max(0, cannon + delta));
    buffer.push(1, { kind: "cannonCol", col: cannon });
  };
  const moveShield = (delta: number): void => {
    const cols = layout().cols;
    shield = Math.min(cols - 1, Math.max(0, shield + delta));
    buffer.push(2, { kind: "shieldCol", col: shield });
  };
  const moveKeys: Record<string, () => void> = {
    KeyA: () => {
      moveCannon(-1);
      moveShield(-1);
    },
    KeyD: () => {
      moveCannon(1);
      moveShield(1);
    },
    KeyJ: () => moveShield(-1),
    KeyL: () => moveShield(1),
  };

  window.addEventListener("keydown", (e) => {
    if (held.has(e.code)) return;
    held.add(e.code);
    const cols = layout().cols;
    if (cannon < 0) cannon = Math.floor(cols / 2);
    if (shield < 0) shield = Math.floor(cols / 2);

    const moveKey = moveKeys[e.code];
    if (moveKey) {
      moveKey();
      repeatTicks.set(e.code, KEY_REPEAT_DELAY_TICKS);
      return;
    }
    switch (e.code) {
      case "KeyI":
        buffer.push(1, { kind: "guard" });
        break;
      case "KeyS":
        buffer.push(1, { kind: "intake" });
        break;
      // F holds the lance, as player 1. Held, not tapped: the lobe fills for
      // as long as the key is down and empties on the keyup below, which is
      // the same contract the thumb on the band has (`sim/lance.ts`).
      //
      // On a phone this key's button is on one panel only — the LANCE PANEL,
      // which a wave has to name. At a desk it is always here; see the note
      // above `bindKeys`.
      case "KeyF":
        buffer.push(1, { kind: "prime", on: true });
        break;
      case "KeyW":
        buffer.push(2, { kind: "fire", color: "red" });
        buffer.push(1, { kind: "guard" });
        break;
      // Red on its own. W sends red *and* a guard, which is one press for a
      // whole defence and two gestures for THE MIRROR — a sequence asking for
      // a red shot and nothing else cannot be answered with it.
      case "KeyQ":
        buffer.push(2, { kind: "fire", color: "red" });
        break;
      case "KeyE":
        buffer.push(2, { kind: "fire", color: "cyan" });
        break;
      case "ArrowRight":
        e.preventDefault();
        onWaveStep(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        onWaveStep(-1);
        break;
      // G takes hold of whatever is nearest the hull, **as player 2**. On a
      // phone the grip is a finger on the field and either player may use it;
      // at a desk this is the only way to see the half of it that matters —
      // the other player's hand, and the word on the field that names it.
      case "KeyG": {
        const target = nearestHull(creatures());
        if (target !== NO_GRIP) buffer.push(2, { kind: "grip", id: target });
        break;
      }
      // Space puts the guide away, as both seats at once — but only while the
      // guide is actually up. The introduction ahead of it passes on its own
      // timer and is not a thing to dismiss (the owner's own answer), and a
      // `brief` command sent while it stands is indistinguishable from that
      // timer firing (`sim/step.ts`'s `briefingHolds` reads both states the
      // same way), so pressing Space early would skip the introduction before
      // it had been read. `guideHolds` is the same guard the touch dismiss
      // already plays by (`briefing.ts`), just read here instead of there.
      case "Space":
        e.preventDefault();
        if (!guideHolds()) break;
        buffer.push(1, { kind: "brief" });
        buffer.push(2, { kind: "brief" });
        break;
      // THE GAUGE's own three, and they are its own on purpose: a round that
      // is not the field does not borrow the field's verbs
      // (`docs/spec/interludes.md`). Z and X hold the valve as player 1 — held
      // like F, and ended on the keyup below, because nothing in the
      // simulation lets go of it. C calls, as player 2. All three mean nothing
      // while a wave is running, so they cost nothing to send unconditionally.
      case "KeyZ":
        buffer.push(1, { kind: "valve", on: true, dir: -1 });
        break;
      case "KeyX":
        buffer.push(1, { kind: "valve", on: true, dir: 1 });
        break;
      case "KeyC":
        buffer.push(2, { kind: "call" });
        break;
      case "KeyP":
        onPauseToggle();
        break;
      case "Enter":
        if (isOver()) buffer.push(1, { kind: "restart" });
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    repeatTicks.delete(e.code);
    if (e.code === "KeyG") buffer.push(2, { kind: "grip", id: NO_GRIP });
    if (e.code === "KeyF") buffer.push(1, { kind: "prime", on: false });
    if (e.code === "KeyZ") buffer.push(1, { kind: "valve", on: false, dir: -1 });
    if (e.code === "KeyX") buffer.push(1, { kind: "valve", on: false, dir: 1 });
  });

  /** Called once per sim tick to advance held-key repeats. */
  return function tick(): void {
    for (const [code, remaining] of repeatTicks) {
      if (remaining > 1) {
        repeatTicks.set(code, remaining - 1);
        continue;
      }
      moveKeys[code]?.();
      repeatTicks.set(code, KEY_REPEAT_INTERVAL_TICKS);
    }
  };
}
