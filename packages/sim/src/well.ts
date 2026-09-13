import type { World } from "./world.js";

/**
 * THE WELL: the field turned inside out, and **nothing else**.
 *
 * The hull is drawn at the centre, the far row becomes a rim around it, and
 * the eleven columns become the eleven hours of a clock face — so "column
 * four" and "four o'clock" name the same lane, and on the field the game ships
 * they are the same number (`render/src/well.ts` is the whole projection).
 * `docs/spec/ideas.md` asked for exactly that and left two things open: whether
 * it is a round or a modifier, and whether both phones flip or only one. The
 * owner asked for a boss wave, and the second answer is in `showsWell` — one
 * phone, the pilot's, because a well on both is a skin on the field and
 * nothing for the pair to say.
 *
 * **There is no state, and that is the boss.** Every other fight in this file's
 * neighbourhood keeps integers between beats; this one keeps none, because the
 * promise the idea is built on is that the *simulation does not change*. A
 * creature falls a row a beat, the cannon slides a column a press, the shield
 * covers a column, a bolt climbs a lane — all of it exactly as the flat field
 * runs it, all of it fingerprinting exactly as it did. What changed is where
 * the picture puts it, and the picture is not the simulation's business.
 *
 * So `WellState` is the tag and nothing more, `stepWell` does not exist, and
 * `bossHashParts` needs no branch: `BOSS_KINDS.indexOf("well") + 1` is the
 * whole of what two devices have to agree about.
 *
 * **What the pair has to learn is one thing the picture does not say.** Rolled
 * into a circle, the field's two walls meet at twelve o'clock — so eleven
 * o'clock and one o'clock are drawn a sector apart and are the two ends of the
 * field. Crossing costs the simulation nothing (`cannonCol` names a column and
 * the cannon is there), so what it costs is the hand and the eye: one hour of
 * apparent movement over the top of the clock is the whole width of the rail
 * under it. Like THE VANE it attacks nobody — a well wave is as dangerous as
 * the wave its author wrote (`bossFillsWave`) — and, further than THE VANE, it
 * does not even decide where an arrival lands. It is the first boss in this
 * game that changes **nothing but the picture**.
 */
export interface WellState {
  kind: "well";
}

/**
 * THE WELL takes the field as a projection, not as a body. No creature, no
 * row, no column and no health — there is nothing of it for the fall loop, the
 * hull or a hand to find, which is one step further than THE VANE's nothing:
 * the arm at least decides where an arrival lands.
 *
 * It takes the world only so that the signature matches every other install
 * and a later one can keep something if it ever has to.
 */
export function installWell(_world: World): WellState {
  return { kind: "well" };
}
