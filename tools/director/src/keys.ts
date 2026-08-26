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
      default:
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    if (e.code === "KeyG") push(2, { kind: "grip", id: NO_GRIP });
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
