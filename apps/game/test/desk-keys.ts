import { type ControlSetId, controlSet, DEFAULT_CONTROL_SET_ID } from "@neon-spore/content";
import type { Layout } from "@neon-spore/render";
import { type Command, DEFAULT_CONFIG } from "@neon-spore/sim";
import { bindKeys } from "../src/keys.js";

/**
 * **A desk keyboard that can be typed on**, for the tests that drive keys
 * rather than reading the source.
 *
 * `bun test` carries no DOM, so the game's screens are mostly asserted against
 * their own text — and that is not enough for a key: the bug the first of these
 * files was written for is a key that sends the hold and never the release,
 * which reads perfectly well in the source and leaves a PC player's circle
 * filling with nobody's finger on it. `bindKeys` only ever touches
 * `window.addEventListener`, so a six-line stub is enough to press a key for
 * real and watch what comes out.
 *
 * Here rather than in either file, because there are two of them now: the ready
 * gate (`keys-gate.test.ts`) and the two keys that turn something
 * (`keys-turn.test.ts`). The second one was written by copying this rig, which
 * is the point at which it stops being one file's scaffolding.
 *
 * The caller puts the real `window` back — `bun test` shares one process across
 * files, so a stub left on `globalThis` is read by every file after this one.
 */

interface Listeners {
  [type: string]: ((e: unknown) => void)[];
}

export interface Desk {
  /** Every command that reached the buffer, in order. */
  sent: { player: 1 | 2; command: Command }[];
  down: (code: string, shift?: boolean) => void;
  up: (code: string) => void;
  /** One sim tick of whatever is still held (`keys-slide.ts`, `keys-turn.ts`). */
  tick: () => void;
  /** Every `brief` sent for one seat, in order, as its `on` flags. */
  briefs: (player: 1 | 2) => (boolean | undefined)[];
}

/**
 * The panel the rig is played on. The default one unless a test says
 * otherwise, because that is the panel almost every wave carries — and the
 * keyboard is gated by it now, so a rig that named none would answer nothing
 * (`content/src/control-sets-keys.ts`).
 */
export function desk(guideUp: boolean, panel: ControlSetId = DEFAULT_CONTROL_SET_ID): Desk {
  const listeners: Listeners = {};
  (globalThis as { window?: unknown }).window = {
    addEventListener(type: string, fn: (e: unknown) => void) {
      listeners[type] ??= [];
      listeners[type].push(fn);
    },
  };
  const sent: { player: 1 | 2; command: Command }[] = [];
  const tick = bindKeys({
    buffer: {
      push(player: 1 | 2, command: Command) {
        sent.push({ player, command });
      },
    } as never,
    layout: () => ({ cols: DEFAULT_CONFIG.cols }) as Layout,
    cfg: DEFAULT_CONFIG,
    isOver: () => false,
    creatures: () => [],
    guideHolds: () => guideUp,
    onPauseToggle: () => {},
    onWaveStep: () => {},
    onGuideReplay: () => {},
    controls: () => controlSet(panel),
  });
  const fire = (type: string, code: string, shiftKey = false): void => {
    for (const fn of listeners[type] ?? []) fn({ code, shiftKey, preventDefault() {} });
  };
  return {
    sent,
    down: (code, shift = false) => fire("keydown", code, shift),
    up: (code) => fire("keyup", code),
    tick,
    briefs: (player) =>
      sent
        .filter((c) => c.player === player && c.command.kind === "brief")
        .map((c) => (c.command as { on?: boolean }).on),
  };
}
