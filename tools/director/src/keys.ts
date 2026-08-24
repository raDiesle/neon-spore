import type { Command, TimedCommand } from "@neon-spore/sim";

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
}

export function bindKeys(cols: () => number): Keys {
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
      default:
        break;
    }
  });
  window.addEventListener("keyup", (e) => held.delete(e.code));

  return {
    drain(tick: number): TimedCommand[] {
      const out = pending.map((p) => ({ tick, player: p.player, command: p.command }));
      pending = [];
      return out;
    },
  };
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA";
}
