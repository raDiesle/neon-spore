import { CONTROL_SETS } from "./control-sets-table.js";
import { type ControlDef, type ControlId, control } from "./controls.js";

// And the one question a *creature* asks of a panel, cut out when THE SCOUT's
// id took this file over the limit (`control-sets-groups.ts`).
export { groupsCoveredBy } from "./control-sets-groups.js";
// And what a panel will *answer*, which is the desk keyboard's gate
// (`control-sets-keys.ts`).
export { panelSends } from "./control-sets-keys.js";
export { CONTROL_SETS } from "./control-sets-table.js";
// The three questions a **wave** asks about a panel are next door
// (`control-sets-waves.ts`), cut out when THE CLAW's set took this file past
// its 250-line limit. They are the only ones in the subject that read `WAVES`,
// which is why the seam is there rather than anywhere else: everything left
// here is pure over a set somebody hands it. Re-exported below so nothing that
// already asked `controlSetForWave` through this file had to move.
export { controlSetForWave, firstOnPanel, wavesUsingSet } from "./control-sets-waves.js";

/**
 * A control set: the **whole** panel, both players at once, for one wave.
 *
 * The word is doing real work here, so it is worth being exact about it. A set
 * is not a list of extras a wave switches on. It is everything the two people
 * have in front of them — player 1's strip and lobes and player 2's strip and
 * lobes, together — and **sets do not compose**. There is no "the usual panel
 * plus the maw": there is a set that has a maw on it and a set that does
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
 * **Every set is a band.** THE GAUGE's panel used to be the exception — built
 * by hand in render/, then registered here as a panel of *slabs* that replaced
 * the band instead of sitting in it. Its three are lobes since 23 September
 * 2026, and the slab form went with them, so a round's set is registered like
 * any other: one `ControlDef` per button and one entry in `CONTROL_SETS`, and
 * no panel re-invented.
 *
 * **The snake is one now, and it is what the shape above was for.** This
 * header used to say there was no snake, and it was right at the time: nothing
 * in the tree moved left and right under a control of its own — THE WARDEN's
 * pupil slides a column a beat and THE VANE's arm sweeps the top row, but both
 * are things the pair *reads*, answered with the ordinary panel and a hand on
 * the field. `snake` is the first set where a control moves a body, and it
 * cost exactly what the paragraph above promises: four `ControlDef`s and one
 * entry.
 *
 * The only boss that touches the controls without a set of its own is still
 * THE MIRROR, and what it does is take all of them away for a few beats
 * (`mirrorHoldsControls`) — the empty set, in time rather than by wave, which
 * is a different mechanism and stays where it is.
 *
 * **`scene` is the empty set by wave**, and it is the first: THE INSTAR has
 * no panel because its body is the panel — every gesture it asks for is a
 * mark drawn on the boss itself and answered where it stands (`sim/instar.ts`).
 * An empty list of controls is a band with nothing on it, and the one test that wanted every seat to hold something
 * names this set as the exception it is (`test/control-sets.test.ts`).
 */

export type ControlSetId =
  | "default"
  | "standard1"
  | "standard2"
  | "standard3"
  | "standard4"
  | "standard5"
  | "gauge"
  | "fleet"
  | "snake"
  | "pinball"
  | "pulse"
  | "splice"
  | "claw"
  | "scout"
  | "scene";

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
  /**
   * Whether **holding** a colour fills the cannon lobe on this panel.
   *
   * The lance rides the two colour buttons rather than a button of its own
   * (`control-sets-table.ts`), so `reduces` cannot hold it back the way it
   * holds back a lobe — there is no `ControlId` to leave out. It is one field
   * instead, false on every rung and absent on `default`, which is the owner's
   * instruction of 14 September 2026: *standard 1 to 5 have no beam shot, and
   * STANDARD itself has everything.*
   *
   * It stays the panel's and not the wave's for the reason a held-back button
   * is. A pair on a rung has never been handed the gesture, so nothing is
   * taken from them and nothing is drawn dead; this used to be a whole-wave
   * fault with an emitter hanging over the field, and a fault is a thing to
   * aim somewhere harmless rather than a thing one has never had.
   */
  lance?: false;
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
 * Whether the cannon lobe fills under a held colour on this panel.
 *
 * Asked rather than the field read, so the absent-means-true spelling lives in
 * one place: the sim is *told* this before the first tick (`startWave`), the
 * director's stage builds a world with it, and a wave's own rehearsal carries
 * it — three callers, one answer.
 *
 * **A panel with no colour on it never has the hold**, declared or not, and
 * that half is derived rather than declared: the gesture rides the two colour
 * buttons, so a panel without them has nowhere to put a thumb. Authoring `lance: false` on THE GAUGE would have been a second
 * copy of something the controls already say.
 */
export function setLance(set: ControlSet): boolean {
  return set.lance !== false && setHas(set, "fireRed") && setHas(set, "fireCyan");
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
