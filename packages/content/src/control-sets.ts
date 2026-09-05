import { CONTROL_SETS } from "./control-sets-table.js";
import { type ControlDef, type ControlId, control, type PanelForm } from "./controls.js";
import type { ControlGroup } from "./creatures.js";
import { WAVES } from "./waves.js";

export { CONTROL_SETS } from "./control-sets-table.js";

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
 * **The standard ladder is not a counter-example to that**, and `reduces` is
 * why. STANDARD 1 through 4 are whole named panels a wave names one of, like
 * every other set here; what a rung says in addition is which panel it is a
 * *picture of*, so that the buttons it carries can be drawn in the places they
 * will keep. See `control-sets-table.ts`, which is where the rungs live.
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
 * four `ControlDef`s and one entry, and no panel re-invented.
 *
 * The only boss that touches the controls without a set of its own is still
 * THE MIRROR, and what it does is take all of them away for a few beats
 * (`mirrorHoldsControls`) — the empty set, in time rather than by wave, which
 * is a different mechanism and stays where it is.
 */

export type ControlSetId =
  | "default"
  | "standard1"
  | "standard2"
  | "standard3"
  | "standard4"
  | "lance"
  | "gauge"
  | "fleet"
  | "snake"
  | "pinball";

export interface ControlSet {
  id: ControlSetId;
  /** The name a person reads — on the band itself, and on the director's page. */
  name: string;
  /** Why this panel and not the default one. One sentence, like a wave's. */
  why: string;
  /** Everything both players have, in the order it is read out and drawn. */
  controls: readonly ControlId[];
  /**
   * The panel this one is a **reduction of**: every control here is on that
   * one, and the rest are held back.
   *
   * It is the one relation between two sets in the whole file, and it exists
   * for a single reason the owner gave in his own words: the buttons a rung
   * does carry have to stand *exactly* where they will stand on the full
   * panel. A reduced set laid out on its own terms would centre two lobes in
   * a seat's share, and the pair would learn one arrangement in the first
   * waves and have to unlearn it in the fifth — so `bandLobes` reads the slots
   * off `layoutSet` and simply leaves the held-back ones empty.
   *
   * It does **not** make sets compose. There is still no "the standard panel
   * plus a button": a rung is a whole named panel a person can be shown and
   * argued with, and a wave names exactly one of them. What this says is only
   * which panel it is a *picture of*, so the picture lines up.
   */
  reduces?: ControlSetId;
}

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
 * The panel a set is **laid out against**: itself, or the one it reduces.
 *
 * One call, so that "where does this button stand" has a single answer read
 * by everything that asks it — `bandLobes` draws from it, the hit test walks
 * the same list, and the ghost thumb in a rehearsal finds the same circle.
 * Spelled out a second time anywhere, a rung would drift a lobe by half a
 * seat and nothing would say so.
 */
export function layoutSet(set: ControlSet): ControlSet {
  return set.reduces === undefined ? set : controlSet(set.reduces);
}

/**
 * What this rung holds back: the controls on the panel it reduces that are
 * not on it, in that panel's own order.
 *
 * Empty for every set that reduces nothing, which is most of them. It is what
 * a page showing a panel reads to say *what is missing and where* — the
 * director's picker and the game's own CONTROLS page both do — because a
 * reduced panel is only legible beside the thing it is less than.
 */
export function heldBack(set: ControlSet): readonly ControlDef[] {
  if (set.reduces === undefined) return [];
  return controlSet(set.reduces)
    .controls.filter((id) => !setHas(set, id))
    .map(control);
}

/**
 * Which control groups this panel can answer.
 *
 * `ControlGroup` is aim and guard — *the two things a wave may be missing* —
 * and a creature declares which of them it demands (`CreatureDef.controls`).
 * The union rule is that a wave's panel covers every group its creatures
 * demand, and this is the half of it that reads a panel; `controlsForKinds`
 * is the half that reads the creatures, and `test/waves.test.ts` puts them
 * together over every wave.
 *
 * Derived from the controls in the set rather than declared beside them,
 * because a declaration is a second copy of something already written down.
 * Aim is a cannon and something to fire out of it: neither half alone puts a
 * bolt up a column.
 *
 * **Guard is the trigger, and the strip that carries the plate is not part
 * of it.** It used to ask for both, on the argument that either half alone
 * was a group the pair could not use — and STANDARD 3 is the counter-example
 * the ladder was built around. The plate is on the hull whether or not
 * anybody can slide it; without the trigger nothing ever raises it, which is
 * a rock nobody can answer, but with the trigger and no strip a rock in the
 * plate's own column is answered exactly as the wave intends. So coverage is
 * *can this panel answer the group at all*, and where the answer has to
 * happen is the wave author's problem.
 */
export function groupsCoveredBy(set: ControlSet): ControlGroup[] {
  const covered: ControlGroup[] = [];
  const fires = setHas(set, "fireRed") || setHas(set, "fireCyan");
  if (setHas(set, "cannon") && fires) covered.push("aim");
  if (setHas(set, "guard")) covered.push("guard");
  return covered;
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
 * Whether this wave is the **first in the game played on its panel** — the one
 * that has to introduce it.
 *
 * A guide teaches the first wave to carry a creature, a pod, a boss or a
 * mechanic (`test/waves.test.ts`), and a panel was the one new thing that
 * arrived unannounced: a pair reaching STANDARD 3 is handed a button they have
 * never seen, and the wave said nothing about it. The owner named the gap in
 * those terms — a first-time introduction not only for new enemies but for
 * control panels and for the modifications of one — so this is the question a
 * test asks over the whole list and the director asks about one row.
 *
 * **Returning to a panel is not an introduction.** The wave after THE GAUGE is
 * the ordinary field again, and a pair who has played fifteen waves on it does
 * not need to be told what a strip is. So it is the first *sight* of a set that
 * matters, not every change of one.
 *
 * It takes the list rather than reading `WAVES` because the director edits a
 * list that is not on disk yet, and an answer read out of `WAVES` there would
 * be about whatever was last saved.
 */
export function firstOnPanel(
  waves: readonly { controls?: ControlSetId }[],
  index: number,
): boolean {
  const here = controlSet(waves[index]?.controls).id;
  for (let i = 0; i < index; i++) {
    if (controlSet(waves[i]?.controls).id === here) return false;
  }
  return true;
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
