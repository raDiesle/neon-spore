/**
 * The two switches that exist because the game has two people in front of it.
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-boss.ts` already gives: every call site still reads `cfg.briefings`,
 * and the split is about how much of one file a reader has to hold at once,
 * never about introducing a second place a setting can live.
 *
 * They are here together because they are the same switch twice. Both stop the
 * run and hand it to the pair; both are **off in `DEFAULT_CONFIG` and on in the
 * game**, which reads backwards for rules of the game and is not. A default
 * that needs two people is a default no headless caller can get past — the
 * director's loop watches one wave over and over by answering its own
 * `needWave`, a replay walks several waves on recorded inputs, a determinism
 * run and a shape sheet want the wave rather than the lesson. `apps/game` is
 * the one caller with two thumbs, so it is the one that turns them on.
 *
 * Neither is a flag in the app, for the reason `hullInvulnerable` is not one
 * either: both change whether the world ticks, so a replay has to record that
 * the run was played this way.
 */
export interface PairConfig {
  /**
   * Whether a wave opens on a card for anything the pair has not met yet
   * (`briefing.ts`), and holds the field until both seats have put it away.
   */
  briefings: boolean;
  /**
   * THE FORK: whether the rest between waves ends in a wait rather than in the
   * next wave, crossed only when player 1 is holding the lance and player 2
   * presses a colour. There is no number beside it because there is no
   * timeout, and `fork.ts` says why that is the mechanic rather than an
   * omission.
   */
  forkBetweenWaves: boolean;
}
