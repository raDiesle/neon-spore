import { ROUND_CONTROLS } from "./controls-round.js";

/**
 * Every button either player can be given, one row each, listed rather than
 * switched on.
 *
 * Split out of `control-sets.ts` on line count, and the seam is the honest
 * one: this file is the *vocabulary* — what a thing on a panel is called, whose
 * half it is drawn in, what shape it takes and what it does — and the file next
 * door is which of them a wave is played with. A page that wants to show a
 * panel reads this; nothing has to know the drawing code to say what a panel
 * contains.
 *
 * **A round's own buttons are next door**, in `controls-round.ts`, spread into
 * `CONTROLS` below — the same split `keys-round.ts` made and for the same
 * reason. `ControlId` stays whole here, because the vocabulary is one list
 * however many files the rows live in.
 */

/** Every control either player can be given. One name per thing on a panel. */
export type ControlId =
  | "cannon"
  | "guard"
  | "intake"
  | "lance"
  | "shield"
  | "fireRed"
  | "fireCyan"
  | "gaugeLeft"
  | "gaugeRight"
  | "gaugeCall"
  | "salvo"
  | "aimLeft"
  | "aimRight"
  | "aimUp"
  | "aimDown"
  | "snakeLeft"
  | "snakeRight"
  | "snakeFire"
  | "snakeMaw"
  | "pinLeft"
  | "pinRight"
  | "pinLatch"
  | "pinLaunch";

/**
 * What a whole panel *is*, rather than what is on it.
 *
 * `band` is the field's: a strip that snaps to a column and lobes beside it,
 * drawn under a grid the pair is playing. `slabs` is a round's: the band is
 * not there at all and the seat's own buttons are squared off against its
 * share of the width. Never a field of a `ControlSet` — `panelForm` reads it
 * off the controls, so the two can never disagree.
 */
export type PanelForm = "band" | "slabs";

export interface ControlDef {
  id: ControlId;
  /** Whose half of the band it is drawn in. The split is never crossed. */
  player: 1 | 2;
  /**
   * A strip snaps to a column across the width; a lobe is a round button; a
   * slab is neither, and is what a round's panel is made of — see `PanelForm`.
   */
  form: "strip" | "lobe" | "slab";
  /** What the panel says, or would say — the fire lobes are named by colour. */
  label: string;
  /** One line, for somebody reading a list of panels rather than the code. */
  does: string;
  /**
   * Which swelling on the hull *also* reaches this control, where one does.
   *
   * The ship is a second way in for six of the seven standard controls
   * (`render/src/touch-ship.ts`): the cannon carries itself, the maw on a lift
   * that went nowhere, and — on player 2's screen — a colour on a lift that
   * went sideways; the plate carries its own aim and the other seat's trigger.
   * The lance has no gesture on the ship, and a round's own slabs are a panel
   * and nothing else.
   *
   * It is here rather than in a switch beside the hit test because three
   * places now ask it: the hit test, the hand a guide's rehearsal draws when a
   * film is *about* these gestures, and the caption that points at one. A
   * control that gained a gesture and not this line would be one the film
   * could point at the wrong swelling for.
   */
  ship?: "cannon" | "shield";
}

/**
 * The controls themselves, listed rather than switched on. A page that wants
 * to show a set reads this; nothing has to know the drawing code to say what a
 * panel contains.
 */
export const CONTROLS: readonly ControlDef[] = [
  {
    id: "cannon",
    player: 1,
    form: "strip",
    label: "PLAYER 1 · CANNON",
    does: "Slides the cannon along the hull. It only ever fires straight up.",
    ship: "cannon",
  },
  {
    id: "guard",
    player: 1,
    form: "lobe",
    label: "SHIELD",
    does: "Triggers the shield wherever player 2 has left it. Half of every ward.",
    ship: "shield",
  },
  {
    id: "intake",
    player: 1,
    form: "lobe",
    label: "SUCK",
    does: "Opens the maw, which takes in a pod and whatever is falling with it.",
    ship: "cannon",
  },
  {
    id: "lance",
    player: 1,
    form: "lobe",
    label: "LANCE",
    does: "Held, not tapped. Fills the cannon lobe for as long as the cannon stays still.",
  },
  {
    id: "shield",
    player: 2,
    form: "strip",
    label: "PLAYER 2 · SHIELD",
    does: "Slides the shield along the hull. It does nothing until player 1 triggers it.",
    ship: "shield",
  },
  {
    id: "fireRed",
    player: 2,
    form: "lobe",
    label: "RED",
    does: "Fires red up whichever column player 1 is standing in.",
    ship: "cannon",
  },
  {
    id: "fireCyan",
    player: 2,
    form: "lobe",
    label: "CYAN",
    does: "Fires cyan up whichever column player 1 is standing in.",
    ship: "cannon",
  },
  ...ROUND_CONTROLS,
];

export function control(id: ControlId): ControlDef {
  const found = CONTROLS.find((c) => c.id === id);
  if (!found) throw new Error(`no control named ${id}`);
  return found;
}
