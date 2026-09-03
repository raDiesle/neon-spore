import { type ControlSet, setHas } from "@neon-spore/content";
import type {
  Command,
  Creature,
  DragTarget,
  MazeState,
  SimConfig,
  WardenState,
} from "@neon-spore/sim";
import { NO_GRIP } from "@neon-spore/sim";
import { creatureAt } from "./creature-place.js";
import { handleUnder } from "./handles.js";
import { bandLobes, colFromX, hitCircle, type Layout, showsCannon, showsShield } from "./layout.js";
import { lobeMeans } from "./touch-lobe.js";

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
 * **A value and not a name, and that is the decision the eleven rounds still
 * to come inherit.** The press is the only moment anything knows *where* it
 * landed, so what a later move needs has to be handed back by it. `drag`
 * carries its origin for that reason: a string is turned by how far the hand
 * has come from where it grabbed, and once the hand has moved there is nothing
 * left to ask.
 *
 * So being draggable is a property of **the hold**, settled at the press — not
 * of the creature kind, since THE MAZE's string is not a creature, and not of
 * the drawing, which does not get to decide the control scheme. `id` is the
 * same argument one step further on: THE LID's cord *is* on a creature and a
 * wave may send three of them down at once, so which body the press landed on
 * is the second thing only the press can know. A draggable
 * element answers where the hand went; everything else answers only that a
 * hand is there. Whoever owns the canvas keeps this between the press and the
 * lift and hands it back untouched, so none of them learns what any of it
 * means and a new draggable element costs them nothing.
 *
 * `lance` follows nothing sideways — it is here because the *lift* matters:
 * the lobe fills for exactly as long as the thumb stays down, and nothing in
 * the simulation empties it on its own (`sim/lance.ts`).
 */
export type Hold =
  | { kind: "cannon" }
  | { kind: "shield" }
  | { kind: "grip" }
  | { kind: "lance" }
  | { kind: "drag"; target: DragTarget; player: 1 | 2; originX: number; id?: number };

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
   * The numbers a hit test needs: the row THE WARDEN's rim hangs its tether
   * from (`creatureAt`), and how wide THE MAZE's drum stands. The whole config
   * rather than the one number picked out of it, which is what this was — the
   * second thing to want one would have been a second field to copy across.
   */
  cfg: SimConfig;
  /**
   * THE MAZE, if it is the boss running, `null` otherwise. **Required, and
   * stated rather than defaulted**, for the reason the comment under
   * `controls` gives: a caller that quietly meant `null` would leave the pilot
   * pressing a handle that is drawn and answers nothing.
   */
  maze: MazeState | null;
  /**
   * THE WARDEN, if it is the boss running, `null` otherwise. **Required, and
   * stated rather than defaulted**, for the same reason `maze` is: a caller
   * that quietly meant `null` would leave the pilot pressing a handle that is
   * drawn and answers nothing, which is the one failure this whole file exists
   * to prevent.
   */
  warden: WardenState | null;
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
    // Asked first, because a handle hangs over the field the creatures fall
    // through and a hand on it is not a hand on whatever is behind it
    // (`handles.ts`).
    const handle = handleUnder(l, x, y, field);
    if (handle) return handle;
    const held = creatureAt(l, field.creatures, x, y, field.beatPhase);
    if (!held) return null;
    return { player: field.seat, command: { kind: "grip", id: held.id }, hold: { kind: "grip" } };
  }

  if (showsCannon(l.role)) {
    // The strip is answered only when the wave's panel actually has one, and
    // that is the repair the lobes already had: `bandLobes` walks the set, so
    // a button the set left out has no circle to be answered at — while these
    // two strips were still answered by position whatever the set said. THE
    // FLEET is the first panel with no strip on it at all, and without this
    // its arrows would sit under a cannon nobody can see and nothing can move.
    if (
      setHas(field.controls, "cannon") &&
      Math.abs(y - l.cannonStrip.y) <= l.cannonStrip.height * 0.75
    ) {
      return {
        player: 1,
        command: { kind: "cannonCol", col: colFromX(l, x) },
        hold: { kind: "cannon" },
      };
    }
    const lobe = lobeUnder(l, field.controls, 1, x, y);
    if (lobe) return lobe;
  }
  if (showsShield(l.role)) {
    if (
      setHas(field.controls, "shield") &&
      Math.abs(y - l.shieldStrip.y) <= l.shieldStrip.height * 0.75
    ) {
      return {
        player: 2,
        command: { kind: "shieldCol", col: colFromX(l, x) },
        hold: { kind: "shield" },
      };
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
 * The same finger, moved, and the two kinds of answer it can have.
 *
 * The strips are **absolute**: the finger's x is a column and where the press
 * began does not matter. A drag is a **displacement**, and this is the last
 * place a pixel is legal, so it becomes thousandths of a tile before it goes
 * anywhere — the tile being the only length two phones share.
 *
 * A grip still answers nothing, deliberately: a hand on something falling only
 * slows it, and that is all a grip has ever been (`sim/grip.ts`). Nothing that
 * cared only that a hand was there has to learn that some hands now report
 * where they went. And there is still no `y`, because nothing is dragged up the
 * screen yet — THE WARDEN's rope is pulled *aside*, which is what clears the
 * shot lane its own column was standing in.
 */
export function touchMove(l: Layout, hold: Hold, x: number): Touch | null {
  if (hold.kind === "cannon") {
    return { player: 1, command: { kind: "cannonCol", col: colFromX(l, x) }, hold };
  }
  if (hold.kind === "shield") {
    return { player: 2, command: { kind: "shieldCol", col: colFromX(l, x) }, hold };
  }
  if (hold.kind === "drag") {
    const fromMilli = Math.round(((x - hold.originX) * 1000) / l.tile);
    return { player: hold.player, command: dragging(hold, fromMilli, true), hold };
  }
  return null;
}

/**
 * One `drag` message for a hold that is already under way.
 *
 * The `id` rides along only for a handle that hangs off a creature, and it is
 * carried from the press because that is the one moment anything knew which
 * body it was. Written once and called twice: a move and a lift say the same
 * thing about *which* handle, and two spellings of that is how a lift comes to
 * let go of a different cord than the one the hand was on.
 */
function dragging(hold: Extract<Hold, { kind: "drag" }>, fromMilli: number, on: boolean): Command {
  const { target, id } = hold;
  return { kind: "drag", target, on, fromMilli, ...(id === undefined ? {} : { id }) };
}

/**
 * The finger lifted. Only the holds that are *held* have anything to say, and
 * all three of them are: each lasts exactly as long as the finger does and
 * nothing in the simulation decays any of them, so the lift has to be sent.
 */
export function touchUp(hold: Hold, field: Field): Touch | null {
  if (hold.kind === "lance") {
    return { player: 1, command: { kind: "prime", on: false }, hold: null };
  }
  if (hold.kind === "drag") {
    return { player: hold.player, command: dragging(hold, 0, false), hold: null };
  }
  if (hold.kind !== "grip") return null;
  return { player: field.seat, command: { kind: "grip", id: NO_GRIP }, hold: null };
}
