/**
 * **The metaball trace, which lives in `packages/content` now.**
 *
 * It was this file, and it moved the day the game itself needed it: THE CHOIR
 * is two bodies in one membrane on the field, and the owner asked for the
 * *Symbiosis graphic* rather than something that looked a bit like it. A
 * contour the game draws and the sheet draws is `content`'s, the way
 * `livingPoints` already is — one description, two drawings — and a copy on
 * each side is the drift `CLAUDE.md` bans by name.
 *
 * Every name it used to export comes back through here, so nothing in this
 * tool moved. `Bounds` comes back too and `metrics.ts` re-exports it from
 * here, because a box is part of what a trace is asked for.
 */

export {
  type Bounds,
  type Field,
  isoLoops,
  perimeter,
  resample,
  resampleAll,
} from "@neon-spore/content";
