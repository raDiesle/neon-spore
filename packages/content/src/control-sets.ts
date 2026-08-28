import { WAVES } from "./waves.js";

/**
 * A control set: the **whole** panel, both players at once, for one wave.
 *
 * The word is doing real work here, so it is worth being exact about it. A set
 * is not a list of extras a wave switches on. It is everything the two people
 * have in front of them — player 1's strip and lobes and player 2's strip and
 * lobes, together — and **sets do not compose**. There is no "the usual panel
 * plus the lance": there is a set that has a lance in it and a set that does
 * not, and a wave names exactly one of them. Naming none means the default.
 *
 * That rule is the whole reason this file exists rather than a boolean on
 * `Wave`. A boolean is an addition, and an addition invites a second one, and
 * two additions are four panels nobody ever drew or played. A named set is a
 * thing a person can be shown, argued with, and told to remove a button from.
 *
 * **The gauge is one of these already, under another name.** The interlude
 * draws no band at all: `interludeControls` in `packages/render/src/interlude.ts`
 * builds the round's own three slabs, LEFT and RIGHT for the pilot and CALL for
 * the navigator, and divides the width by however many that seat has — so a
 * seat with one button gets one wide button rather than a gap where two others
 * used to be. That is a control set in every respect except the name: whole,
 * per-seat, enumerable, and un-composable with the band. It is deliberately not
 * registered here, because the thing that reaches for it is a *round*, not a
 * wave, and every set in this file must be reachable by naming it on a wave.
 * The shape below is the shape the gauge's panel would take if a later lane
 * ever wants both lists on one page.
 *
 * **The snake is not one, because there is no snake.** Nothing in the tree
 * moves left and right under a control of its own: THE WARDEN's pupil slides a
 * column a beat and THE VANE's arm sweeps the top row, but both are things the
 * pair *reads*, answered with the ordinary panel and a hand on the field. The
 * only boss that touches the controls is THE MIRROR, and what it does is take
 * all of them away for a few beats (`mirrorHoldsControls`) — the empty set, in
 * time rather than by wave, which is a different mechanism and stays where it
 * is.
 */

/** Every control either player can be given. One name per thing on a panel. */
export type ControlId = "cannon" | "guard" | "intake" | "lance" | "shield" | "fireRed" | "fireCyan";

export interface ControlDef {
  id: ControlId;
  /** Whose half of the band it is drawn in. The split is never crossed. */
  player: 1 | 2;
  /** A strip snaps to a column across the width; a lobe is a round button. */
  form: "strip" | "lobe";
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
];

export function control(id: ControlId): ControlDef {
  const found = CONTROLS.find((c) => c.id === id);
  if (!found) throw new Error(`no control named ${id}`);
  return found;
}

export type ControlSetId = "default" | "lance";

export interface ControlSet {
  id: ControlSetId;
  /** The name a person reads — on the band itself, and on the director's page. */
  name: string;
  /** Why this panel and not the default one. One sentence, like a wave's. */
  why: string;
  /** Everything both players have, in the order it is read out and drawn. */
  controls: readonly ControlId[];
}

/**
 * Every panel in the game.
 *
 * `default` is the ordinary field: slide, trigger, swallow, fire. It used to
 * carry the lance as well, which meant every wave in the game shipped a button
 * for a coupling only one of them asks for.
 *
 * `lance` is that coupling's own panel, and the interesting part is what it
 * gives up. It is **not** the default with a button added: the maw is gone.
 * That is not tidiness, it is the simulation's own arithmetic — the maw *is*
 * the cannon lobe turned inside out (docs/spec/systems.md 5.7), so `intake`
 * empties a fill (`applyCommand` in `packages/sim/src/commands.ts`). A panel
 * carrying both puts two buttons on one opening and one of them undoes the
 * other. Warding stays, because a rock has no other answer and a panel that
 * could never carry one would not be a panel, it would be a demonstration.
 */
export const CONTROL_SETS: readonly ControlSet[] = [
  {
    id: "default",
    name: "STANDARD",
    why: "The field as it is taught: slide, trigger, swallow, fire.",
    controls: ["cannon", "guard", "intake", "shield", "fireRed", "fireCyan"],
  },
  {
    id: "lance",
    name: "LANCE PANEL",
    why: "The maw traded for the lance, because they are the same opening and one empties the other.",
    controls: ["cannon", "guard", "lance", "shield", "fireRed", "fireCyan"],
  },
];

/** What a wave gets when it names nothing at all. */
export const DEFAULT_CONTROL_SET_ID: ControlSetId = "default";

export function controlSet(id: ControlSetId | undefined): ControlSet {
  const wanted = id ?? DEFAULT_CONTROL_SET_ID;
  const found = CONTROL_SETS.find((s) => s.id === wanted);
  if (!found) throw new Error(`no control set named ${wanted}`);
  return found;
}

/** One seat's half of a panel, in order. Enumerable — never a switch in a drawing. */
export function setControls(set: ControlSet, player: 1 | 2): readonly ControlDef[] {
  return set.controls.map(control).filter((c) => c.player === player);
}

export function setHas(set: ControlSet, id: ControlId): boolean {
  return set.controls.includes(id);
}

/**
 * The panel a wave is played on. The one place that turns a wave index into a
 * set, so nothing else has to remember that a missing field means the default —
 * including everything past the end of `WAVES`, which is generated and gets the
 * ordinary panel.
 */
export function controlSetForWave(waveIndex: number): ControlSet {
  return controlSet(WAVES[waveIndex]?.controls);
}

/**
 * Which waves are played on a set, by name. A set no wave reaches is a panel
 * nobody can see, which is the same failure as a creature no wave spawns —
 * `test/control-sets.test.ts` is what makes that a failure rather than an
 * opinion, and this is what a director page would list under each panel.
 */
export function wavesUsingSet(id: ControlSetId): readonly string[] {
  return WAVES.filter((w) => (w.controls ?? DEFAULT_CONTROL_SET_ID) === id).map((w) => w.name);
}
