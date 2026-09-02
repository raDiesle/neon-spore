import { type ControlDef, type ControlId, control, type PanelForm } from "./controls.js";
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
 * **A set is not always a band, and `gauge` is the proof.** THE GAUGE's panel
 * used to be built by hand in render/, outside this file, on the ground that
 * the thing reaching for it was a *round* and not a wave. It is a wave now, so
 * that objection is gone and the set is registered like any other — but its
 * three controls are not strips and lobes, they are **slabs**: they replace the
 * band instead of sitting in it, they are laid out by dividing a seat's width
 * by however many that seat has, and a seat with one gets one wide button
 * rather than a gap where two others used to be.
 *
 * So a set carries a `PanelForm`, and it is **derived from the controls rather
 * than declared beside them** (`panelForm`). That is the whole boundary, and it
 * is one function: the field's own sets say nothing new and never learn the
 * word, a round's set is a slab panel by virtue of what is in it, and a set
 * that mixed the two would be a panel nobody could draw — so it throws, and
 * `test/control-sets.test.ts` is what makes that a failure rather than an
 * opinion. The eleven rounds still to come cost one `ControlDef` per button
 * and one entry in `CONTROL_SETS`; none of them re-invents a panel.
 *
 * **The snake is one now, and it is what the shape above was for.** This
 * header used to say there was no snake, and it was right at the time: nothing
 * in the tree moved left and right under a control of its own — THE WARDEN's
 * pupil slides a column a beat and THE VANE's arm sweeps the top row, but both
 * are things the pair *reads*, answered with the ordinary panel and a hand on
 * the field. `snake` is the first set where a control moves a body, and it
 * cost exactly what the paragraph above promised the eleven rounds would cost:
 * six `ControlDef`s and one entry, and no panel re-invented.
 *
 * The only boss that touches the controls without a set of its own is still
 * THE MIRROR, and what it does is take all of them away for a few beats
 * (`mirrorHoldsControls`) — the empty set, in time rather than by wave, which
 * is a different mechanism and stays where it is.
 */

export type ControlSetId = "default" | "lance" | "gauge" | "fleet" | "snake";

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
  {
    id: "gauge",
    name: "THE GAUGE",
    why: "The field is gone, so the band is too: two held slabs for the valve, one for the call.",
    controls: ["gaugeLeft", "gaugeRight", "gaugeCall"],
  },
  {
    id: "fleet",
    name: "THE FLEET",
    why: "One trigger against four arrows: the seat that can see the ships cannot move the sights, and the seat that can move them is shown nothing.",
    controls: ["salvo", "aimLeft", "aimUp", "aimDown", "aimRight"],
  },
  {
    id: "snake",
    name: "SNAKE",
    why: "One axis each and a verb beside it, because a body neither of you can turn alone is the round.",
    controls: ["snakeLeft", "snakeRight", "snakeFlip", "snakeUp", "snakeDown", "snakeSlow"],
  },
];

/**
 * Which kind of panel a set is, read off the controls in it.
 *
 * Derived rather than declared, because a declaration is a second copy of
 * something already written down and two copies drift. A set that mixed a slab
 * with a strip has no drawing — the slab panel replaces the band the strip
 * lives in — so it is not a panel with a mistake in it, it is not a panel, and
 * this throws rather than picking one.
 */
export function panelForm(set: ControlSet): PanelForm {
  const forms = new Set(set.controls.map((id) => control(id).form));
  const slabs = forms.has("slab");
  if (slabs && forms.size > 1) throw new Error(`control set ${set.id} mixes slabs with a band`);
  return slabs ? "slabs" : "band";
}

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
