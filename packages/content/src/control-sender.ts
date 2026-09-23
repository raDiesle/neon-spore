import type { Command } from "@neon-spore/sim";
import { controlPress } from "./control-command.js";
import type { ControlId } from "./controls.js";

/**
 * **Which control sent this command** — the table next door read backwards.
 *
 * `control-command.ts` says what a press *says*; this says which press could
 * have said it. It is a file of its own because that file was at 222 of its
 * 250 lines with a switch that grows by an entry every time a round is added,
 * and because the two are asked by different callers: the forward direction is
 * asked by anything with a thumb, and this one by a picture holding a command
 * and wanting the button it came through.
 *
 * THE STARE's catch is the first caller (`render/src/stare-fx.ts`). The event
 * carries the command the eye punished, and the flash has to land on the
 * circle the thumb was on — so the answer is derived from the table rather
 * than written out again. A map from command kinds to buttons kept in
 * `render/` would be a second copy of the panel's plan, which is the
 * re-derivation `packages/sim/test/purity.test.ts` keeps a table against.
 *
 * **Nothing here knows about panels.** A caller asks about the controls it has
 * drawn — `bandLobes` — and a command no
 * control of theirs sent gets no answer at all, which is the honest one: a
 * swipe on the hull and a drag on a boss are presses with no button.
 */

/**
 * Three fields a control is **not** told apart from another one by. `on` is
 * which end of a hold this is, and both ends came through the same thumb;
 * `col` is where a strip was standing; `fromMilli` is where round the crank a
 * hand went on. Everything else — a colour, a lane, a direction — is exactly
 * what tells two controls that share a verb apart, and the two colours are why
 * this cannot be a comparison of `kind` alone.
 */
const NOT_THE_CONTROL = new Set(["on", "col", "fromMilli"]);

/** Whether `id` is a control that sends `c`, either going down or coming up. */
export function controlSays(id: ControlId, c: Command): boolean {
  const { down, up } = controlPress(id);
  return sameVerb(down, c) || (up !== undefined && sameVerb(up, c));
}

function sameVerb(a: Command, b: Command): boolean {
  if (a.kind !== b.kind) return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].every((key) => NOT_THE_CONTROL.has(key) || left[key] === right[key]);
}
