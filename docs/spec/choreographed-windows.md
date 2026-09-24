# The doubled window, boss by boss

The owner, 22 September 2026, generic to every choreographed boss: *double
the time what players have time to do the action, and let it require some
more clicks*. THE INSTAR carried it the same day (`ca4b0723`), and SPOOL and
RATCHET were authored to it. Every other boss keeps its window in a figure of
its own in `packages/sim/src/config-<boss>.ts`, so there is no one number and
no sed. This page is the decision, per boss; the application is three lanes in
`docs/queue.md`, each titled *The doubled window: …*.

**THE INSTAR's came back down on 24 September 2026**, the owner: *the time
players have is huge, it's too much.* It is the one boss whose whole window
is played inside THE SLOW, and the slow went to a quarter rate the same day,
so its twenty-four beats were a minute in the hand; they are eight now,
twenty seconds (`content/instar-script.ts`). The other bosses' windows run
at the ordinary rate and were not asked about.

## What counts as a window in his sense

**A step's deadline**: something comes up — a mark, a vent, a still body, a
soft lobe — and a clock closes on it; answered inside, it lands; not, it is a
strike. That is the time *to do the action*, and it doubles, with the need
beside it raised, because a longer window with the old count is a step that
lands itself (`bosses-choreographed.md`, the `BossSequenceStep` row).

**Not a window**: a boss's **cadence** — the loop's own tempo, which the fight
*is* (THE THROAT's inhale, THE LEDGER's returns, THE SCUTTLE's throws); a
figure fixed by **measured latency** (THE BATON's flight and turn,
`latency.md`); a **hold** the pair sustains rather than reaches; a
**tolerance** or a **distance**. Doubling a cadence does not give a pair more
time to act, it halves the fight's pressure, and the configs argue each one on
that ground. They are left alone, named below, for the owner to overrule.

**Where the need is one shot or one fill fixed in code**, it becomes a named
`SimConfig` field at two — the same shape as INSTAR's slaps and swipes. The
lance's own fill (`lancePrimeBeats`) is every wave's and never changes for one
boss.

## Doubled

| Boss | Window now → doubled | Need now → raised |
|---|---|---|
| THE GORGE | `gorgeVentBeats` 4 → 8; `gorgePryBeats` 4 → 8 | the vent's one pierce shot → two (`gorgeVentShots`); the pry's fill → two fills (`gorgePryFills`) |
| THE TASTER | `tasterPryBeats` 6 → 12 | one fill → two (`tasterPryFills`) |
| THE LEAD | `leadStillBeats` 4 → 8, and `leadHoldBeats` 8 → 16, argued as twice the still | one fill → two (`leadStillFills`) |
| THE CURTAIN | `curtainSoftBeats` 6 → 12; `curtainPinBeats` 6 → 12 | `curtainSoftCount` 2 → 3; `curtainLiftMilli` 1250 → 2500 |
| THE SINEW | `sinewFallBeats` 4 → 8 | `sinewClearCols` 3 → 4 — the three-wide mass is kept on an eleven-column field, so four from the middle is the wall; the five first written here could not be walked |
| THE CANDLE | `candleSmokeBeats` 6 → 12 | `candlePinchMilli` 1500 → 3000 |
| THE ANTIPHON | `antiphonWindowBeats` 14 → 28; `antiphonTightWindowBeats` 8 → 16 | `antiphonPullMilli` 400 → 800 |
| THE UNDERTOW | `undertowStandBeats` 5 → 10; `undertowUnseatBeats` 2 → 4; `undertowLastBeats` 10 → 20 | `undertowHoldBeats` 6 → 12; the unseat's one slide → two (`undertowUnseatSlides`) |
| THE HASP | `haspHoldBeats` 6 → 12; `haspLastHoldBeats` 4 → 8 | `haspWindMilli` 800 → 1600; `haspWindStepMilli` 400 → 800 |
| THE BATON | `batonSwellBeats` 3 → 6; `batonMergeWindowBeats` 6 → 12; `batonFinalBeats` 11 → 22 | the swell's one strip → two (`batonSwellStrips`); `batonMergeBeats` 2 → 4; the final is one act a beat, so its need doubles with it |

## Left alone, and why

| Boss | Figure | Why |
|---|---|---|
| THE THROAT | `throatInhaleBeats` 6, `throatTightBeats` 4 | the inhale is *the pair's whole rhythm* (`config-throat.ts`), a cadence — and THE DRAG, not a deadline: a hand has six real beats to arrive every time |
| THE LEDGER | `ledgerCadenceBeats` 5 → 2 | the returns are the fight's tempo, and their falling is the fight getting harder |
| THE SCUTTLE | `scuttleThrowBeats` 3, `scuttleFastBeats` 2 | a boss racing the pair to its own death; the cadence is the race |
| THE BATON | `batonFlightBeats` 3, `batonTurnBeats` 2 / 1 | measured against the wire's latency (`latency.md`), not authored |
| THE ORRERY, THE DIASTOLE | — | the alignment and the coincidence are arithmetic off the rings and the cadences, not a figure; there is nothing to double |
| THE SURGE | `surgeWindowMilli` 250 | half the band's width — a tolerance, not a time |
| THE FILAMENT, THE GIMBAL | — | no deadline: the line is drawn a tile a beat, and the alignments wait as long as it takes |
| THE HIVE | `hiveOpenBeats` 8, `hiveClenchBeats` 6, `hivePinchBeats` 2 | the openings are a cadence, the clench is waited out or hauled, and the pinch is a hold — no clock closes on an ask |
| THE CLAW | — | a control set on the ordinary field, not a boss (`config-claw.ts`) |
| THE INSTAR, THE SPOOL, THE RATCHET | — | already to the rule |

## The second half: the window is THE SLOW

The same item carries `docs/decisions.md` #33: a step's window *is* THE SLOW,
opened on the tick the ask comes up and shut by `closeSlow(world)` on both
exits, the step answered or missed. THE INSTAR and THE RATCHET do it. Every
boss in **Doubled** does it in its lane, in the same commit as its figures:

- **Moved to the ask** where the boss opens THE SLOW today at another moment —
  THE TASTER, THE LEAD, THE SINEW, THE CANDLE, THE UNDERTOW, THE HASP
  (`<boss>-step.ts`).
- **Opened for the first time** where it opens none — THE GORGE, THE CURTAIN,
  THE ANTIPHON, THE BATON.

Every plain `openSlow` left over — a death, a fall, an arrival, which asks for
nothing — is kept, and every boss under **Left alone** keeps what it has.

## What each lane owes besides the figures

- **The film.** Every boss above but HASP has one in
  `packages/content/src/scenes/the-<boss>.ts`, timed in literal ticks and
  captioned with the old numbers (*FOUR BEATS OR IT TORCHES*), and replayed
  against `DEFAULT_CONFIG` by its `scene-<boss>.test.ts`. It is re-timed, not
  loosened.
- **The guide.** A guide half that says a count says the new one.
- **The director's rehearsals.** `poses-bosses-hands-*.ts` carry fixed
  `budgetBeats`; a pose that no longer reaches its state inside one is given
  room, not a shorter path.
- **The relations the tests hold**: THE TASTER's pry longer than a fill
  (`taster-hand.test.ts`), THE UNDERTOW's breach wide before the stand runs
  out (`undertow.test.ts`), THE BATON's acts equal to its final beats
  (`baton.test.ts`).
- **`docs/spec/bosses.md` §11.n**, one line per boss: doubled on the owner's
  rule, with the date.
