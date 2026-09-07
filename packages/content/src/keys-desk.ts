import { controlPress } from "./control-command.js";
import { type ControlSet, layoutSet, setControls } from "./control-sets.js";
import type { ControlId } from "./controls.js";

/**
 * **The desk keyboard is a panel too**, and this is where a key finds out what
 * it means.
 *
 * A key used to belong to a *control*: `KeyF` was the lance's, `KeyZ` was THE
 * GAUGE's valve, `KeyM` was THE CLAW's arm, and every panel invented since had
 * cost a fresh letter nobody could remember. The owner ended that in one
 * sentence — *the game control keys should reuse the existing primary keys, so
 * each key has several actions depending on the active control set* — and this
 * is that rule, written once. There are eleven more rounds designed; not one of
 * them may add a letter.
 *
 * **What a key is, is a seat and a slot.** Player 1 has a sideways pair and two
 * press keys; player 2 has the same; the arrows are whatever four-way or turn
 * the panel carries. A panel fills those slots with its own controls, in its
 * own order, and a key means whatever landed in its slot:
 *
 * | key | STANDARD | LANCE PANEL | THE CLAW | THE GAUGE | PINBALL |
 * |---|---|---|---|---|---|
 * | A / D | the cannon | the cannon | the arm's column | the valve | the bucket |
 * | I | guard | guard | reach | — | set the needle |
 * | S | the maw | the lance | — | — | — |
 * | J / L | the plate | the plate | — | — | — |
 * | Q | red | red | the mouth | call | fire |
 * | E | cyan | cyan | — | — | — |
 *
 * S carrying the maw on one panel and the lance on the next is the rule
 * working rather than a collision: they are the same opening, and the LANCE
 * PANEL exists because one button empties what the other fills
 * (`control-sets-table.ts`).
 *
 * **Slots are counted on the panel a set is laid out against**, `layoutSet`,
 * for exactly the reason `bandLobes` reads that same function: a rung of the
 * standard ladder must not put red on a different key from the full panel, or
 * a pair would learn one keyboard in the first waves and unlearn it in the
 * fifth.
 *
 * **What is not here is not a control.** The grip and its two carry keys, the
 * ready gate's F, G and Space, pause, replay and restart are the host talking
 * to a run rather than a seat talking to a ship — the same four kinds
 * `panelSends` lets past its gate (`control-sets-keys.ts`) — so they keep
 * fixed keys and are `apps/game/src/keys.ts`'s own business.
 */

/** One key, and the control it stands for on the panel it was asked about. */
export interface DeskKey {
  /** `KeyboardEvent.code`. */
  code: string;
  player: 1 | 2;
  control: ControlId;
  /**
   * Which way this key moves a **strip**, where the control is one.
   *
   * A strip names a column rather than a direction, so it takes both keys of
   * its seat's sideways pair and each of them is a step — which is the one
   * thing a caller cannot read off `controlPress`, because that answer is a
   * column somebody else has to count (`keys-slide.ts`). Absent on every other
   * control, the held sideways ones included: those name their own direction
   * and one press of them says the whole thing.
   */
  step?: -1 | 1;
}

/**
 * The keys each seat has, by slot. Two rows and nothing else: a seat's
 * sideways pair, and the presses beside it.
 *
 * They are the keys the desk already had — A/D and J/L slid the two swellings,
 * I guarded, S opened the maw, Q and E were the two colours — so the panel
 * almost every wave is played on keeps every key it ever had, and a new panel
 * borrows them rather than asking for more.
 */
const SEAT_KEYS: Record<1 | 2, { slide: readonly [string, string]; press: readonly string[] }> = {
  1: { slide: ["KeyA", "KeyD"], press: ["KeyI", "KeyS"] },
  2: { slide: ["KeyJ", "KeyL"], press: ["KeyQ", "KeyE"] },
};

/** A direction a control names, or `"column"` for a strip, which names none. */
type Way = "left" | "right" | "up" | "down";
type Aim = Way | "column" | null;

/** The four-way, for whichever seat's panel carries one — a chart's sights,
 * a snake's two turns. Never a seat's own: only one panel at a time has it. */
const ARROWS: Record<Way, string> = {
  left: "ArrowLeft",
  right: "ArrowRight",
  up: "ArrowUp",
  down: "ArrowDown",
};

/**
 * Which way a control points, read off what pressing it *says* rather than
 * declared beside it.
 *
 * A second table of directions here would be a copy of `controlPress`, and the
 * pair would drift the first time a round turned its needle the other way —
 * the drift `purity.test.ts` keeps a table against. `null` is a control that
 * points nowhere and belongs in its seat's press row.
 */
function aimOf(id: ControlId): Aim {
  const { down } = controlPress(id);
  switch (down.kind) {
    case "cannonCol":
    case "shieldCol":
      return "column";
    case "slide":
    case "valve":
      return down.dir < 0 ? "left" : "right";
    case "snakeTurn":
      return down.dir;
    case "aim":
      if (down.dcol !== 0) return down.dcol < 0 ? "left" : "right";
      if (down.drow !== 0) return down.drow < 0 ? "up" : "down";
      return null;
    default:
      return null;
  }
}

/**
 * Whether this control is one of the four-way's — a *step* across a chart or a
 * quarter turn — rather than a thing that slides along the hull.
 *
 * The two are told apart by whether the panel is the field's at all: a strip
 * and a held valve move something that is *on the ship*, which is what the
 * seat's own sideways pair is under the hand for, and an `aim` or a
 * `snakeTurn` walks something out on the field, which is what the arrows have
 * always been.
 */
function onArrows(id: ControlId): boolean {
  const { kind } = controlPress(id).down;
  return kind === "aim" || kind === "snakeTurn";
}

/**
 * Every key this panel answers, in no order a caller should depend on.
 *
 * Built from the controls rather than listed, so a set invented tomorrow is
 * playable at a desk the moment it is written down and a control that gained a
 * key it should not have has nowhere to hide. A control the rows cannot seat —
 * a seat with three presses on it — is simply absent, and
 * `test/keys-desk.test.ts` is what turns that into a failure rather than a
 * button nobody can reach.
 */
export function deskKeys(set: ControlSet): readonly DeskKey[] {
  const layout = layoutSet(set);
  const keys: DeskKey[] = [];
  for (const player of [1, 2] as const) {
    // The slot a control stands in is its place on the panel this set is laid
    // out against, so a rung of the ladder keeps its buttons on the keys the
    // full panel will put them on. `press` counts only the controls that
    // landed in the press row, which is why it is a counter here rather than
    // the loop's own index.
    let press = 0;
    for (const def of setControls(layout, player)) {
      if (!set.controls.includes(def.id)) {
        // Held back by this rung: it keeps its slot and answers nothing.
        if (aimOf(def.id) === null) press++;
        continue;
      }
      const aim = aimOf(def.id);
      if (aim === "column") {
        const [left, right] = SEAT_KEYS[player].slide;
        keys.push({ code: left, player, control: def.id, step: -1 });
        keys.push({ code: right, player, control: def.id, step: 1 });
        continue;
      }
      if (aim === null) {
        const code = SEAT_KEYS[player].press[press++];
        if (code !== undefined) keys.push({ code, player, control: def.id });
        continue;
      }
      if (onArrows(def.id)) {
        keys.push({ code: ARROWS[aim], player, control: def.id });
        continue;
      }
      // A sideways control that names its own direction — a valve, a bucket —
      // takes the one key of its seat's pair that points the same way.
      const slide = SEAT_KEYS[player].slide[aim === "left" ? 0 : 1];
      keys.push({ code: slide, player, control: def.id });
    }
  }
  return keys;
}

/** What one key means on this panel, or nothing when the panel does not
 * answer it. The question `apps/game/src/keys.ts` asks per press. */
export function deskKey(set: ControlSet, code: string): DeskKey | undefined {
  return deskKeys(set).find((k) => k.code === code);
}

/**
 * Every key of one seat's sideways pair that this panel answers, both
 * directions of a strip included.
 *
 * The repeat timer is the caller's (`keys-slide.ts`) and it needs the pair as
 * a pair: a held key that keeps stepping is a different thing from a held key
 * that stays down, and only these two rows can contain either.
 */
export function deskSlideKeys(set: ControlSet, player: 1 | 2): readonly DeskKey[] {
  const pair = SEAT_KEYS[player].slide;
  return deskKeys(set).filter((k) => k.player === player && pair.includes(k.code));
}
