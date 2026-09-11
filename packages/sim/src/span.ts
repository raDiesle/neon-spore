import type { CreatureKind } from "./creature-kinds.js";
import { SHELL_COLS } from "./shell.js";
import type { Creature } from "./types.js";

/**
 * **How wide a body is, and which columns it therefore covers.**
 *
 * Split out of `kinds.ts` when THE GYRE arrived and that file was already six
 * lines under its limit — the same seam `creature-kinds.ts` was cut along, one
 * question further on. `kinds.ts` next door answers *what a kind means*: which
 * colour goes with which body, how fast one falls, whether a hand may be put
 * on it. This answers a question about the body actually standing in the
 * field, which stopped being the same question the day a rock's width became
 * an authored number (`RockSize`) rather than a fact about its kind.
 *
 * Everything here is a rule the rest of the simulation must call rather than
 * re-derive, and `purity.test.ts` holds `occupiesCol` to it by name: a column
 * test written as `c.col === col` silently misses the second column of every
 * wide body, and it does so while passing every type check.
 */

/**
 * Columns the Warden's ring covers. Odd, so the body has a whole column at its
 * centre and "dead centre" is a place rather than a rounding — and five rather
 * than three because the pupil's travel is the fight: a hole with one column
 * either side of home is a hole that twitches, not one that looks around.
 */
export const WARDEN_COLS = 5;

/**
 * How wide a rock arrives, in tiles. Two is a rock that fills a 2x2 square —
 * the same geometry the torch has always had, offered to the plain tiers as an
 * authored choice rather than as a sixth kind.
 *
 * A number rather than a kind on purpose. Speed *is* the kind here — five
 * tiers, `meteor` through `meteorFastest` — and crossing that with two widths
 * would be ten entries in the bestiary for one new fact. Size is the fact, so
 * it is a field.
 */
export type RockSize = 1 | 2;

/**
 * Columns wide a kind occupies. Every kind is one tile except the torch,
 * which is two — twice a plain rock's width — and the Warden, which is five:
 * a fixture rather than an arrival, and wide enough that the column its pupil
 * is in is a thing the pair has to name (docs/spec/bosses.md 11.4).
 *
 * THE GYRE is deliberately **one**, for all that its rim reaches two columns
 * either side. A span is a solid block of columns and a wheel is not one —
 * there is nothing at all in the tile beside the hub — so a five-wide span
 * would stop shots in three columns that are empty. The rim is six separate
 * one-tile bodies, each of which answers for its own column (`gyre-rim.ts`).
 */
export function colSpan(kind: CreatureKind): number {
  if (kind === "warden") return WARDEN_COLS;
  // THE SHELL's width and its number of pieces are the same number, and
  // `shell.ts` owns it: every column of the body carries exactly one piece, so
  // a width set here and a count set there could disagree and leave a column
  // with nothing in front of it -- or a piece with no column to be shot in.
  if (kind === "shell") return SHELL_COLS;
  // THE CAROM is two as well, and it is the torch's number arrived at from
  // the other side: a torch is wide because it is twice a rock, and a carom is
  // wide because it has to be *seen* crossing four lanes a beat. A one-tile
  // body at that speed is a flicker between columns rather than a thing with a
  // path, and the path is the whole creature. The rock it becomes keeps the
  // width — `caromStruck` writes it onto the body — so the shield covers what
  // the pair has been watching rather than half of it.
  // THE CRYSTAL is three, and the number is the creature: a body on the left,
  // a body on the right and the one tile between them that a shot can break.
  // Odd on purpose, so the middle *is* a column (`crystalMiddleCol`) rather
  // than a seam between two — the shield and the cannon both have to be said
  // to be in it.
  if (kind === "crystal") return 3;
  return kind === "torch" || kind === "carom" ? 2 : 1;
}

/**
 * How many columns this body actually occupies: what it was built with, or
 * failing that its kind's own width.
 *
 * **Call this, never `c.span ?? colSpan(c.kind)` by hand.** `colSpan` alone
 * answers a question about a *kind*, and since a rock's width became an
 * authored number that is no longer the same question as how wide the thing
 * standing in the field is — a hit test written against the kind lets a shot,
 * a shield or a hull impact miss the second column of a big meteor while every
 * type check passes.
 *
 * It takes the parts rather than a whole `Creature` so that a `Scar` and a
 * breach event — both of which carry the same two fields and neither of which
 * is a creature — are answered by the same rule.
 */
export function spanOf(body: { kind: CreatureKind; span?: number }): number {
  return body.span ?? colSpan(body.kind);
}

/**
 * How wide a body is **on this field** — `spanOf`, plus the one kind whose
 * width is the field's own.
 *
 * THE FENCE is a line across every column there is, so its width is not a fact
 * about its kind and cannot be answered by `colSpan`, which is handed no
 * configuration. It is written onto the body at the moment it arrives
 * (`spawnArrivals`), and from then on `spanOf` answers for it like anything
 * else — so this is only ever asked of a thing that is not on the field yet:
 * an arrival being built, and the blip on the strip that warns about one.
 *
 * **Call this, never `kind === "fence" ? cols : …` by hand.** Two spellings of
 * it is a warning strip drawn one tile wide over a wall that covers eleven.
 */
export function spawnSpan(cols: number, body: { kind: CreatureKind; span?: number }): number {
  return body.kind === "fence" ? cols : spanOf(body);
}

/**
 * The tile column at a body's visual centre — `spanCenterCol` for something
 * that may be carrying a width of its own. `col` is passed separately because
 * render/ asks about a body part-way through a move.
 */
export function bodyCenterCol(body: { kind: CreatureKind; span?: number }, col: number): number {
  return col + (spanOf(body) - 1) / 2;
}

/**
 * Whether a creature occupies the given column — true for every column its
 * span covers, not only `col` itself. Call this instead of `c.col === col`
 * wherever a column test decides a hit, a hull impact or a shield match: a
 * one-column comparison silently misses the torch's second column.
 *
 * `c.col` is always the *leftmost* column a creature occupies — a span wider
 * than one tile has no single integer column at its centre, so there is
 * nothing else `col` could consistently mean once a kind spans an even
 * number of tiles. See `spanCenterCol` for where the centre is needed.
 */
export function occupiesCol(c: Creature, col: number): boolean {
  return occupiesLane(c.col, spanOf(c), col);
}

/**
 * The same test, asked of a **lane and a width** rather than of a body.
 *
 * It exists because a body is not always standing in the column it is standing
 * in. A carom crosses three lanes a beat and a dart two, and render glides
 * both between `fromCol` and `col` (`drawnCol`) — so for most of every beat
 * the thing a player is aiming at is not in the column the simulation has
 * written down, and a shot fired at what is drawn misses what is there.
 * `bullets.ts` asks this about the lane the body is *nearest* on the tick the
 * shot sweeps past, which is the same correction `creatureMilli` next door
 * already makes to the row and for exactly the same reason.
 *
 * `occupiesCol` above is the ordinary form and everything that is not testing
 * a body mid-move should use it: the span is read off the creature there, and
 * a caller that passed a width by hand could pass the wrong one.
 */
export function occupiesLane(leftCol: number, span: number, col: number): boolean {
  return col >= leftCol && col < leftCol + span;
}

/**
 * Clamp a spawn column so a wide body's whole span stays on the field. It
 * takes the span rather than the kind, because a rock's width is authored
 * now (`RockSize`) and a kind no longer answers the question on its own —
 * `spanOf` is what the caller asks first.
 */
export function clampSpanCol(col: number, cols: number, span: number): number {
  return Math.max(0, Math.min(cols - span, Math.round(col)));
}

/**
 * The tile column at a creature's visual centre, in tile units. Needed
 * anywhere a wide creature (only the torch, today) must be drawn or reported
 * as one thing rather than as its leftmost column — a two-wide creature's
 * centre sits half a tile past it.
 *
 * `col` is an integer everywhere the simulation reads it. render/ passes a
 * fractional one on purpose, out of `drawnCol`, for a dart part-way through
 * the diagonal it is crossing — the offset added here is a constant, so the
 * centre of a body mid-glide is the same thing as the centre of one standing
 * still.
 */
export function spanCenterCol(kind: CreatureKind, col: number): number {
  return col + (colSpan(kind) - 1) / 2;
}
