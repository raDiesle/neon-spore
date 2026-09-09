import {
  type ControlSet,
  control,
  controlPress,
  type DeskKey,
  deskKey,
  deskKeys,
  deskStepSeats,
  keyLabel,
  panelSends,
} from "@neon-spore/content";
import {
  type Command,
  type Creature,
  midCol,
  NO_GRIP,
  nearestHull,
  type SimConfig,
  type TimedCommand,
} from "@neon-spore/sim";

/**
 * Both roles on one keyboard, so a wave can be tried the moment it is placed.
 *
 * **It no longer knows a letter per control**, and that is the whole shape of
 * this file now. It used to carry the game's desk layout typed out by hand — a
 * `KEY_BINDINGS` table and a `switch` that was a second copy of it — on the
 * argument that `apps/game` is an application a tool may not reach into. That
 * argument was true while the answer lived there. It does not: a key is a seat
 * and a slot on the wave's panel, `content/src/keys-desk.ts` is the one table
 * that says which, and `tools/director` already depends on `@neon-spore/content`.
 *
 * So the panel is asked, one question per press, the way `apps/game/src/keys.ts`
 * asks it. What the hand-typed copy had drifted into by the time it was
 * replaced is the argument for never having made it: THE GAUGE was on Z/X/C
 * and THE FLEET on U/H/N/K, neither of which the game has answered for some
 * time, and THE CLAW, PINBALL and SNAKE had no keys here at all.
 *
 * **What is left is everything that is nobody's button.** W is red and a guard
 * in one press, for the person at a desk who is both seats; G takes hold of
 * the body nearest the hull, as player 2, because the mouse on the stage is
 * player 1's hand and the other seat's grip is the half worth seeing. Neither
 * is a control on any panel, so neither has a slot to be read out of.
 *
 * **Which body `G` takes hold of is not typed out twice either.** This file
 * kept its own `nearestHull` once, differing from the game's in a branch it
 * never had; the answer moved to where neither rig owns it and both may ask —
 * `sim/grip.ts`, beside the `setGrip` that would refuse a wrong one.
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
  /** `KeyboardEvent.code`. */
  code: string;
  /** The letter shown on the key, for the help modal. */
  key: string;
  seat: KeySeat;
  /** What pressing it does, in words a player would use. */
  does: string;
}

/**
 * The two keys that belong to the host rather than to a seat's panel, and the
 * only ones still written out by hand here. Everything else on the keyboard is
 * whatever the wave's own panel put in its slot.
 */
const HOST_KEYS: readonly KeyBinding[] = [
  { code: "KeyW", key: "W", seat: "both", does: "fire red, and guard, together" },
  { code: "KeyG", key: "G", seat: 2, does: "grab the creature nearest the hull" },
];

/**
 * The keys this panel answers, for the modal that lists them.
 *
 * `deskKeys` rather than a table of this file's own, so the modal prints the
 * keyboard of the panel actually on the stage: pick a wave played on THE CLAW
 * and the list changes with it. A strip takes both keys of its seat's sideways
 * pair, and both of them read as one row, because "A / D" is what a person
 * has under their hand — and A/D is marked as both seats, since player 1's
 * pair carries player 2's strip along with it below.
 */
export function keyBindings(set: ControlSet): readonly KeyBinding[] {
  const keys = deskKeys(set);
  const seen = new Set<string>();
  const rows: KeyBinding[] = [];
  for (const k of keys) {
    if (seen.has(k.control)) continue;
    seen.add(k.control);
    const pair = keys.filter((other) => other.control === k.control);
    const def = control(k.control);
    rows.push({
      code: k.code,
      key: pair.map((other) => keyLabel(other.code)).join(" / "),
      seat: k.player === 1 && k.step !== undefined ? "both" : k.player,
      does: def.does,
    });
  }
  return [...rows, ...HOST_KEYS];
}

export function bindKeys(
  cfg: SimConfig,
  creatures: () => readonly Creature[],
  /**
   * The panel this wave is played on. A call rather than a set, and read fresh
   * on every press: the director edits a *draft* list, and a wave picked in the
   * rail changes the panel under this same listener — a set captured at bind
   * time would gate the whole session by whichever wave was open first.
   */
  controls: () => ControlSet,
): Keys {
  let pending: { player: 1 | 2; command: Command }[] = [];
  /** Where each seat's strip stands, as this rig believes it. The middle, so
   * the first press is a step from where the ship actually is. */
  const col: Record<1 | 2, number> = { 1: midCol(cfg), 2: midCol(cfg) };
  const held = new Set<string>();

  const push = (player: 1 | 2, command: Command): void => {
    pending.push({ player, command });
  };

  /**
   * Every press this file makes, with the wave's own panel in front of it —
   * the same gate `apps/game/src/keys.ts` puts around its buffer, for the same
   * reason. A panel that has taken the gun away is a panel where the gun is
   * gone, and a rig that still fired one would be lying about the game.
   */
  const send = (player: 1 | 2, command: Command): void => {
    if (!panelSends(controls(), command.kind)) return;
    push(player, command);
  };

  const stepStrip = (key: DeskKey): void => {
    col[key.player] = Math.min(cfg.cols - 1, Math.max(0, col[key.player] + (key.step ?? 0)));
    send(key.player, controlPress(key.control, col[key.player]).down);
  };

  /** A strip key, and every seat it moves — `deskStepSeats` is the rule, this
   * is the stepping. */
  const stepAll = (key: DeskKey): void => {
    for (const k of deskStepSeats(controls(), key)) stepStrip(k);
  };

  window.addEventListener("keydown", (e) => {
    // A wave is named by typing, and the name field is two panels from the
    // stage. Without this the letters of "TWO ROCKS" would fire the cannon.
    if (isTyping(e.target)) return;
    if (held.has(e.code)) return;
    held.add(e.code);

    const key = deskKey(controls(), e.code);
    if (key !== undefined) {
      // A strip names a column somebody has to count; everything else says the
      // whole thing in one press.
      if (key.step !== undefined) stepAll(key);
      else send(key.player, controlPress(key.control).down);
      return;
    }

    switch (e.code) {
      // Red *and* a guard, in one press: one whole defence for the person at a
      // desk playing both seats. Not a button on any panel, and on a panel
      // carrying neither it says nothing — `send` sees to that.
      case "KeyW":
        send(2, { kind: "fire", color: "red" });
        send(1, { kind: "guard" });
        break;
      // The grip, as player 2 — the mouse on the stage is player 1's hand, so
      // this is the only way to see the half that matters: the other player's.
      case "KeyG": {
        const target = nearestHull(creatures(), 2);
        if (target !== NO_GRIP) send(2, { kind: "grip", id: target });
        break;
      }
      default:
        break;
    }
  });
  window.addEventListener("keyup", (e) => {
    held.delete(e.code);
    if (e.code === "KeyG") send(2, { kind: "grip", id: NO_GRIP });
    // And whatever this panel puts on this key, let go — present on exactly
    // the controls a thumb stays on (`content/src/control-command.ts`). A
    // strip has no release: a column is a place that stays where it was put.
    const key = deskKey(controls(), e.code);
    const release = key === undefined ? undefined : controlPress(key.control).up;
    if (key !== undefined && release !== undefined) send(key.player, release);
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

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA";
}
