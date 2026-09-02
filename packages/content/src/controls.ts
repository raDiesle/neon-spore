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
  | "snakeMaw";

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
  },
  {
    id: "guard",
    player: 1,
    form: "lobe",
    label: "SHIELD",
    does: "Triggers the shield wherever player 2 has left it. Half of every ward.",
  },
  {
    id: "intake",
    player: 1,
    form: "lobe",
    label: "SUCK",
    does: "Opens the maw, which takes in a pod and whatever is falling with it.",
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
  },
  {
    id: "fireRed",
    player: 2,
    form: "lobe",
    label: "RED",
    does: "Fires red up whichever column player 1 is standing in.",
  },
  {
    id: "fireCyan",
    player: 2,
    form: "lobe",
    label: "CYAN",
    does: "Fires cyan up whichever column player 1 is standing in.",
  },
  {
    id: "gaugeLeft",
    player: 1,
    form: "slab",
    label: "LEFT",
    does: "Held. Turns THE GAUGE's needle down the dial for as long as a thumb is on it.",
  },
  {
    id: "gaugeRight",
    player: 1,
    form: "slab",
    label: "RIGHT",
    does: "Held. Turns THE GAUGE's needle up the dial for as long as a thumb is on it.",
  },
  {
    id: "gaugeCall",
    player: 2,
    form: "slab",
    label: "CALL",
    does: "Says the needle is between the marks. The only thing in the round that can be wrong.",
  },
  {
    id: "salvo",
    player: 1,
    form: "lobe",
    label: "SALVO",
    does: "Fires into whichever square of THE FLEET's chart the sights are standing in.",
  },
  {
    id: "aimLeft",
    player: 2,
    form: "lobe",
    label: "◀",
    does: "Carries the sights one square left. A step, never a place — a place would need no telling.",
  },
  {
    id: "aimUp",
    player: 2,
    form: "lobe",
    label: "▲",
    does: "One square up the chart.",
  },
  {
    id: "aimDown",
    player: 2,
    form: "lobe",
    label: "▼",
    does: "One square down the chart.",
  },
  {
    id: "aimRight",
    player: 2,
    form: "lobe",
    label: "▶",
    does: "One square right.",
  },
  {
    id: "snakeLeft",
    player: 2,
    form: "slab",
    label: "◀",
    does: "Turns the snake a quarter turn anticlockwise. Player 2 does all the driving.",
  },
  {
    id: "snakeRight",
    player: 2,
    form: "slab",
    label: "▶",
    does: "A quarter turn clockwise, under the same hand. There is no up and down: a heading is not a place.",
  },
  {
    id: "snakeFire",
    player: 1,
    form: "slab",
    label: "FIRE",
    does: "A shot straight out of the head. It is the only thing that takes an enemy off the arena.",
  },
  {
    id: "snakeMaw",
    player: 1,
    form: "slab",
    label: "MAW",
    does: "Opens the mouth for a moment. A point driven over with it shut starts the round again.",
  },
];

export function control(id: ControlId): ControlDef {
  const found = CONTROLS.find((c) => c.id === id);
  if (!found) throw new Error(`no control named ${id}`);
  return found;
}
