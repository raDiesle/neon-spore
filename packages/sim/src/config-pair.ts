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
  /**
   * Whether the gaps between acts may carry an interlude — a round that is not
   * the field, with its own rules, its own controls and its own picture
   * (`interlude.ts`, `docs/spec/interludes.md`).
   *
   * The third switch of the same shape, and it earns its place here for the
   * reason the first two do rather than by resembling them: an interlude stops
   * the run and hands it to two people who hold different halves of it. A
   * headless caller has one thumb at most — the director's loop answers its own
   * `needWave`, a replay walks recorded input, a determinism run wants the wave
   * — and every one of them would sit at a dial nobody can turn.
   */
  interludes: boolean;
}

/**
 * Both switches, on — the configuration the game actually ships with two
 * people in front of it, named for the same reason `DEFAULT_CONFIG` is: so
 * that a caller reaches for a name instead of retyping the pair's own list of
 * fields.
 *
 * `apps/game` still spells its two fields out by hand rather than spreading
 * this in — that call site is not this constant's to move. What this buys is
 * the *other* direction: anything that wants "the world with two people in
 * front of it" — today that is only this package's own tests — writes
 * `{ ...DEFAULT_CONFIG, ...PAIR_ON }` and a third field added to `PairConfig`
 * above is on in that world by construction, not by whoever remembers to add
 * a third `true` beside the two that are already here.
 */
export const PAIR_ON: PairConfig = {
  briefings: true,
  forkBetweenWaves: true,
  interludes: true,
};
