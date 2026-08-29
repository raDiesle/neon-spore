import { type Command, type Creature, NO_GRIP, type TimedCommand } from "@neon-spore/sim";

/**
 * Both roles on one keyboard, so a wave can be tried the moment it is placed.
 *
 * The same keys as the game's desk layout (`apps/game/src/input.ts`), typed
 * out again rather than imported: `apps/game` is an application and a tool that
 * reached into its source would be a dependency the workspace does not offer.
 * If the two ever disagree, the game is right.
 */
export interface Keys {
  drain(tick: number): TimedCommand[];
  /**
   * A command from somewhere other than the keyboard — the stage's own pointer.
   * Both land in one buffer because the world takes one list per tick, and
   * because a mouse and a key held at once are two hands, not two games.
   */
  push(player: 1 | 2, command: Command): void;
}

/** Whose hand a key is, for the help modal to group by. `"both"` is one press
 * that reaches both seats at once (A/D move both slides; W fires and guards). */
export type KeySeat = 1 | 2 | "both";

export interface KeyBinding {
  /** `KeyboardEvent.code`, matched in the switch below. */
  code: string;
  /** The letter shown on the key, for the help modal. */
  key: string;
  seat: KeySeat;
  /** What pressing it does, in words a player would use. */
  does: string;
}

/**
 * The one table this file's `switch` is a hand-written copy of. `key-help.ts`
 * renders this rather than a second list, so a key added to the switch and
 * forgotten here is a key the modal cannot lie about — it just won't show.
 */
export const KEY_BINDINGS: readonly KeyBinding[] = [
  { code: "KeyA", key: "A", seat: "both", does: "slide the cannon and the shield left" },
  { code: "KeyD", key: "D", seat: "both", does: "slide the cannon and the shield right" },
  { code: "KeyJ", key: "J", seat: 2, does: "slide the shield left, on its own" },
  { code: "KeyL", key: "L", seat: 2, does: "slide the shield right, on its own" },
  { code: "KeyI", key: "I", seat: 1, does: "guard" },
  { code: "KeyS", key: "S", seat: 1, does: "open the maw" },
  { code: "KeyW", key: "W", seat: "both", does: "fire red, and guard, together" },
  { code: "KeyE", key: "E", seat: 2, does: "fire cyan" },
  { code: "KeyG", key: "G", seat: 2, does: "grab the creature nearest the hull" },
  { code: "KeyZ", key: "Z", seat: 1, does: "hold THE GAUGE's valve one way" },
  { code: "KeyX", key: "X", seat: 1, does: "hold THE GAUGE's valve the other way" },
  { code: "KeyC", key: "C", seat: 2, does: "call — THE GAUGE's own signal" },
];

export function bindKeys(cols: () => number, creatures: () => readonly Creature[]): Keys {
  let pending: { player: 1 | 2; command: Command }[] = [];
  let cannon = -1;
  let shield = -1;
  const held = new Set<string>();

  const push = (player: 1 | 2, command: Command): void => {
    pending.push({ player, command });
  };

  window.addEventListener("keydown", (e) => {
    // A wave is named by typing, and the name field is two panels from the
    // stage. Without this the letters of "TWO ROCKS" would fire the cannon.
    if (isTyping(e.target)) return;
    if (held.has(e.code)) return;
    held.add(e.code);

    const n = cols();
    if (cannon < 0) cannon = Math.floor(n / 2);
    if (shield < 0) shield = Math.floor(n / 2);
    const moveCannon = (delta: number): void => {
      cannon = Math.min(n - 1, Math.max(0, cannon + delta));
      push(1, { kind: "cannonCol", col: cannon });
    };
    const moveShield = (delta: number): void => {
      shield = Math.min(n - 1, Math.max(0, shield + delta));
      push(2, { kind: "shieldCol", col: shield });
    };

    switch (e.code) {
      case "KeyA":
        moveCannon(-1);
        moveShield(-1);
        break;
      case "KeyD":
        moveCannon(1);
        moveShield(1);
        break;
      case "KeyJ":
        moveShield(-1);
        break;
      case "KeyL":
        moveShield(1);
        break;
      case "KeyI":
        push(1, { kind: "guard" });
        break;
      case "KeyS":
        push(1, { kind: "intake" });
        break;
      case "KeyW":
        push(2, { kind: "fire", color: "red" });
        push(1, { kind: "guard" });
        break;
      case "KeyE":
        push(2, { kind: "fire", color: "cyan" });
        break;
      // The grip, as player 2 — the mouse on the stage is player 1's hand, so
      // this is the only way to see the half that matters: the other player's.
      case "KeyG": {
        const target = nearestHull(creatures());
        if (target !== NO_GRIP) push(2, { kind: "grip", id: target });
        break;
      }
      // THE GAUGE's own three. A round that is not the field does not
      // borrow the field's verbs (`docs/spec/interludes.md`), so these are its
      // own commands and mean nothing while a wave runs — which is why they
      // cost nothing to send unconditionally. Z and X hold the pilot's valve
      // and are let go on the keyup below, because nothing in the simulation
      // lets go of it; C is the navigator's call, the half the mouse is not
      // holding. Same keys as the game (`apps/game/src/keys.ts`).
      case "KeyZ":
        push(1, { kind: "valve", on: true, dir: -1 });
        break;
      case "KeyX":
        push(1, { kind: "valve", on: true, dir: 1 });
        break;
      case "KeyC":
        push(2, { kind: "call" });
        break;
      default:
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    if (e.code === "KeyG") push(2, { kind: "grip", id: NO_GRIP });
    if (e.code === "KeyZ") push(1, { kind: "valve", on: false, dir: -1 });
    if (e.code === "KeyX") push(1, { kind: "valve", on: false, dir: 1 });
  });

  return {
    drain(tick: number): TimedCommand[] {
      const out = pending.map((p) => ({ tick, player: p.player, command: p.command }));
      pending = [];
      return out;
    },
    push,
  };
}

/** The creature closest to the hull. Never the queen, who cannot be gripped. */
function nearestHull(creatures: readonly Creature[]): number {
  let best = NO_GRIP;
  let bestRow = -1;
  for (const c of creatures) {
    if (c.kind === "queen" || c.row <= bestRow) continue;
    best = c.id;
    bestRow = c.row;
  }
  return best;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA";
}
