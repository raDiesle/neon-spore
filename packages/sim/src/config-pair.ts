/**
 * The switch that exists because the game has two people in front of it.
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-boss.ts` already gives: every call site still reads `cfg.briefings`,
 * and the split is about how much of one file a reader has to hold at once,
 * never about introducing a second place a setting can live.
 *
 * It was two switches until THE FORK retired into the ready gate at the end of
 * a guide (`briefing.ts`) — they were the same switch twice, and one of them
 * is now part of the other. What is left is **off in `DEFAULT_CONFIG` and on
 * in the game**, which reads backwards for a rule of the game and is not. A default
 * that needs two people is a default no headless caller can get past — the
 * director's loop watches one wave over and over by answering its own
 * `needWave`, a replay walks several waves on recorded inputs, a determinism
 * run and a shape sheet want the wave rather than the lesson. `apps/game` is
 * the one caller with two thumbs, so it is the one that turns them on.
 *
 * It is not a flag in the app, for the reason `hullInvulnerable` is not one
 * either: it changes whether the world ticks, so a replay has to record that
 * the run was played this way.
 */
export interface PairConfig {
  /**
   * Whether a wave opens on a card for anything the pair has not met yet
   * (`briefing.ts`), and holds the field until both seats have put it away.
   */
  briefings: boolean;
}

/**
 * The pair's switches, on — the configuration the game actually ships with two
 * people in front of it, named for the same reason `DEFAULT_CONFIG` is: so
 * that a caller reaches for a name instead of retyping the pair's own list of
 * fields.
 *
 * `apps/game` still spells its fields out by hand rather than spreading this in — that call site is not this constant's to move. What this buys is
 * the *other* direction: anything that wants "the world with two people in
 * front of it" — today that is only this package's own tests — writes
 * `{ ...DEFAULT_CONFIG, ...PAIR_ON }` and a second field added to `PairConfig`
 * above is on in that world by construction, not by whoever remembers to add
 * a second `true` beside the one that is already here.
 */
export const PAIR_ON: PairConfig = {
  briefings: true,
};
