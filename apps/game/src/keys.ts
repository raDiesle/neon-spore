import type { Layout } from "@neon-spore/render";
import { type Creature, isGrippable, NO_GRIP } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";
import { roundKeyDown, roundKeyUp } from "./keys-round.js";

/**
 * The keyboard, for playing both roles alone at a desk. Its own file rather
 * than the tail of `input.ts`: touch is the game's input and this is the test
 * rig's, and the two only met because they push into the same buffer.
 */

export interface KeyBindings {
  buffer: InputBuffer;
  layout: () => Layout;
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
}

/**
 * The creature closest to the hull — the one a pair would actually reach for.
 * Never a boss body, which cannot be gripped (`isGrippable` in sim/types.ts).
 *
 * THE WARDEN's tether wins outright whatever else is falling, because it is
 * the only thing on the field a hand is the *only* answer to: a rock a hand
 * misses is still a rock the shield can meet, and a line nobody pulls costs
 * the hull and the plate both. On one screen this key is the whole of player
 * 2's half of that fight.
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
 * repeat timer driven by `tick()` — the sim tick, not wall-clock time.
 *
 * F and G are the two keys that are *held* rather than pressed: the lance and
 * the grip. Both send a second command on the keyup, because nothing in the
 * simulation ends either on its own. Behind a wave's guide those same two keys
 * are the ready gate's two halves — one seat each — and Space is both at once
 * for the desk player who is both seats.
 *
 * **The keyboard is not gated by the wave's control set**, the same decision
 * the view switch already made. A wave names one panel and the band draws that
 * and nothing else (`packages/content/src/control-sets.ts`), so no thumb can
 * reach a lance on an ordinary wave. This file is the desk rig: one person
 * driving both seats, in every view. Gating it would mean a tester could not
 * open the lance without first finding the wave that carries it, which is the
 * opposite of what the rig is for.
 */
export function bindKeys({
  buffer,
  layout,
  isOver,
  creatures,
  guideHolds,
  snakeHolds,
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

    // Never the page's scroll: every arrow means something here.
    if (e.code.startsWith("Arrow")) e.preventDefault();
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
        // Behind a guide, F is player 1's half of the ready gate instead:
        // nothing else reaches the ship there (`sim/step.ts`), so the key is
        // free, and it is already that seat's one *held* key.
        if (guideHolds()) {
          buffer.push(1, { kind: "brief", on: true });
          break;
        }
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
      // G takes hold of whatever is nearest the hull, **as player 2**. On a
      // phone the grip is a finger on the field and either player may use it;
      // at a desk this is the only way to see the half of it that matters —
      // the other player's hand, and the word on the field that names it.
      case "KeyG": {
        // And G is player 2's half, for the same reason F is player 1's.
        if (guideHolds()) {
          buffer.push(2, { kind: "brief", on: true });
          break;
        }
        const target = nearestHull(creatures());
        if (target !== NO_GRIP) buffer.push(2, { kind: "grip", id: target });
        break;
      }
      // Space is both seats at once, for the person at a desk playing both of
      // them — the same answer the director's stage gives in `TEST`. F and G
      // above are the two seats separately, for a desk beside a phone.
      //
      // **Held, not tapped.** All three send `on: true` here and `on: false`
      // on the keyup below, so a key tapped and let go empties its circle the
      // way a thumb lifted off the glass does (`sim/briefing.ts`).
      //
      // Only while the guide is up: the introduction passes on its own timer
      // and is not a thing to dismiss (the owner's own answer), so Space
      // pressed early would skip the wave's name before it had been read.
      case "Space":
        e.preventDefault();
        if (!guideHolds()) break;
        buffer.push(1, { kind: "brief", on: true });
        buffer.push(2, { kind: "brief", on: true });
        break;
      // Whichever round has taken the panel away — THE GAUGE's valve and
      // call, THE FLEET's sights and salvo. One table next door rather than a
      // dozen more cases here (`keys-round.ts`).
      case "KeyP":
        onPauseToggle();
        break;
      case "Enter":
        if (isOver()) buffer.push(1, { kind: "restart" });
        break;
      default: {
        // The arrows are the last word here: SNAKE takes all four while it has
        // the world, and otherwise the sideways two step between waves.
        const round = roundKeyDown(e.code, snakeHolds());
        if (round) buffer.push(round.player, round.command);
        else if (e.code === "ArrowRight") onWaveStep(1);
        else if (e.code === "ArrowLeft") onWaveStep(-1);
        break;
      }
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    repeatTicks.delete(e.code);
    // Unconditionally: a release arriving after the wave started is a no-op in
    // the simulation, while one skipped because the guide had *just* gone
    // would leave a thumb pressed on nobody's screen (`sim/briefing.ts`).
    const off = { kind: "brief", on: false } as const;
    if (e.code === "Space" || e.code === "KeyF") buffer.push(1, off);
    if (e.code === "Space" || e.code === "KeyG") buffer.push(2, off);
    if (e.code === "KeyG") buffer.push(2, { kind: "grip", id: NO_GRIP });
    if (e.code === "KeyF") buffer.push(1, { kind: "prime", on: false });
    const round = roundKeyUp(e.code);
    if (round) buffer.push(round.player, round.command);
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
