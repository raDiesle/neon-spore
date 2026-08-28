import type { ControlId, ControlSet } from "@neon-spore/content";
import { type Command, type Creature, NO_GRIP } from "@neon-spore/sim";
import { creatureAt } from "./creature-place.js";
import { bandLobes, colFromX, hitCircle, type Layout, showsCannon, showsShield } from "./layout.js";

/**
 * The control scheme as a pure function: a point on the layout, and what the
 * ship should be told about it.
 *
 * It lives beside `layout.ts` for the reason that file already gives — a
 * control is never drawn in one place and answered in another — and it is here
 * rather than in `apps/game` because it has two callers: the game, and the
 * director's stage, which is the same picture and has to answer a finger the
 * same way. A tool cannot import an application, so the alternative was a
 * second hand-typed copy of the decision table, and a control scheme that
 * disagrees with itself on the screen it is being judged on is worse than no
 * editor at all.
 *
 * No DOM, no pointer, no state: the plumbing of pointers, capture and which
 * finger is which belongs to whoever owns the canvas.
 */

/**
 * What a drag and a lift continue to mean, after the press that started them.
 *
 * `lance` follows nothing sideways — it is here because the *lift* matters:
 * the lobe fills for exactly as long as the thumb stays down, and nothing in
 * the simulation empties it on its own (`sim/lance.ts`).
 */
export type Hold = "cannon" | "shield" | "grip" | "lance";

export interface Touch {
  player: 1 | 2;
  command: Command;
  /** Null for a press that is over the moment it happens — a shot, a guard. */
  hold: Hold | null;
}

export interface Field {
  creatures: readonly Creature[];
  /** 0..1 within the beat, so a grab lands on the creature as drawn. */
  beatPhase: number;
  /**
   * Whose hand a touch on the *field* is. The strips below say who they belong
   * to by where they are; the field belongs to both players, so it can only be
   * signed by the seat this screen holds.
   */
  seat: 1 | 2;
  /**
   * The row THE WARDEN's rim sits on, so a hand anywhere along a tether counts
   * as a hand on it (`creatureAt`). It is on the field rather than read off a
   * config here because `touch.ts` is handed a field, never a world.
   */
  wardenRow: number;
  /**
   * The whole panel this wave is played on — both seats at once, never a
   * combination (`packages/content/src/control-sets.ts`).
   *
   * It is on the field for the same reason `wardenRow` is: this file is handed
   * a field, never a world, and which panel is up is a fact about the wave.
   *
   * It is **required** rather than defaulted, and that is the whole repair.
   * The band learned to walk a set and this file did not, so it went on
   * answering a fixed `l.lanceButton` whatever the wave said — the lance was
   * invisible on every ordinary wave and still primed under the thumb. A
   * default would put that back the first time a caller forgot to pass one;
   * a required field makes the compiler ask.
   */
  controls: ControlSet;
}

/** A press. Null where nothing is. */
export function touchDown(l: Layout, x: number, y: number, field: Field): Touch | null {
  // Above the band is the field, and the field answers both players: a finger
  // held on something falling drags at it (`grip` in sim/grip.ts).
  if (y < l.bandTop) {
    const held = creatureAt(l, field.creatures, x, y, field.beatPhase, field.wardenRow);
    if (!held) return null;
    return { player: field.seat, command: { kind: "grip", id: held.id }, hold: "grip" };
  }

  if (showsCannon(l.role)) {
    if (Math.abs(y - l.cannonStrip.y) <= l.cannonStrip.height * 0.75) {
      return { player: 1, command: { kind: "cannonCol", col: colFromX(l, x) }, hold: "cannon" };
    }
    const lobe = lobeUnder(l, field.controls, 1, x, y);
    if (lobe) return lobe;
  }
  if (showsShield(l.role)) {
    if (Math.abs(y - l.shieldStrip.y) <= l.shieldStrip.height * 0.75) {
      return { player: 2, command: { kind: "shieldCol", col: colFromX(l, x) }, hold: "shield" };
    }
    const lobe = lobeUnder(l, field.controls, 2, x, y);
    if (lobe) return lobe;
  }
  return null;
}

/**
 * A finger against one seat's lobes, and there is no list of them in here.
 *
 * `bandLobes` is asked for the circles with the wave's own set, which is the
 * same call `band.ts` makes to draw them — so a button is answered exactly
 * where it was drawn, and a control the set left out has no circle to be
 * answered at. That is the whole reason this is a call and not five `if`s
 * against named fields of the layout: five `if`s were a second, older list of
 * what is on a panel, and it went on including the lance after the panel
 * stopped.
 */
function lobeUnder(l: Layout, set: ControlSet, player: 1 | 2, x: number, y: number): Touch | null {
  for (const lobe of bandLobes(l, set, player)) {
    if (!hitCircle(lobe.circle, x, y)) continue;
    const said = lobeMeans(lobe.control.id);
    if (said) return { player: lobe.control.player, ...said };
  }
  return null;
}

/**
 * What pressing a lobe says. A lookup, not a rule — every entry is the command
 * that control has always sent, and the two strips are not lobes so they say
 * nothing here.
 */
function lobeMeans(id: ControlId): { command: Command; hold: Hold | null } | null {
  switch (id) {
    case "guard":
      return { command: { kind: "guard" }, hold: null };
    case "intake":
      return { command: { kind: "intake" }, hold: null };
    case "lance":
      return { command: { kind: "prime", on: true }, hold: "lance" };
    case "fireRed":
      return { command: { kind: "fire", color: "red" }, hold: null };
    case "fireCyan":
      return { command: { kind: "fire", color: "cyan" }, hold: null };
    default:
      return null;
  }
}

/**
 * The same finger, moved. Only the two strips follow it, and only sideways —
 * a grip stays on the creature it took hold of, which is falling away from the
 * finger anyway, so there is no field to test against and no `y` to read.
 */
export function touchMove(l: Layout, hold: Hold, x: number): Touch | null {
  if (hold === "cannon") {
    return { player: 1, command: { kind: "cannonCol", col: colFromX(l, x) }, hold };
  }
  if (hold === "shield") {
    return { player: 2, command: { kind: "shieldCol", col: colFromX(l, x) }, hold };
  }
  return null;
}

/**
 * The finger lifted. Only the two holds that are *held* have anything to say:
 * both last exactly as long as the finger does and nothing in the simulation
 * decays either, so the lift has to be sent.
 */
export function touchUp(hold: Hold, field: Field): Touch | null {
  if (hold === "lance") return { player: 1, command: { kind: "prime", on: false }, hold: null };
  if (hold !== "grip") return null;
  return { player: field.seat, command: { kind: "grip", id: NO_GRIP }, hold: null };
}
