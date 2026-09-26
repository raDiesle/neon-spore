import type { TimedCommand, World } from "@neon-spore/sim";

/**
 * **A hand on the controls, reading the field as it goes**: what the pair
 * presses this tick, given the world as it stands.
 *
 * A fixed list of timed commands is enough for a state the clock brings on by
 * itself, and for a handle in a known place. It is not enough for the states
 * a hand has to *earn* — the column THE WARDEN's pupil has drifted to, the
 * column THE THROAT's mouth hangs over — because each of those is a fact the
 * pair reads off the field and answers, and no list written beforehand can
 * know it. So a hand is a function of the world, called every tick, and its
 * commands are sent on that tick — which is exactly what a device does. The
 * hands themselves are `boss-hands-*.ts`.
 *
 * A package of its own, moved out of `tools/director` on 26 September 2026,
 * because the game's TEST panel wants the same hands and `apps/game` cannot
 * import from `tools/`. Not `sim`: a hand is a player's input fed through
 * `step`, not a rule of the game.
 */
export type Hand = (world: World) => Omit<TimedCommand, "tick">[];
