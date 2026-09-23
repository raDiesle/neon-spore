# Every file a field boss is a name in

The registrations of `.claude/skills/new-boss` §4, lane one. Its own page so
the skill stays under the 250-line ceiling `packages/sim/test/limits.test.ts`
holds it to; a row added for the next boss goes here.

A phase or gesture added to a boss that already ships has its own list:
`.claude/skills/new-boss-state`.

Every file a field boss is a name in, from THE GORGE's landing (`fb63f2ab`);
a round adds its own `*-round.ts` and its controls, a scene its beat list.

| Where | What |
|---|---|
| `sim/src/<boss>.ts`, `<boss>-step.ts`, `<boss>-hash.ts`, `config-<boss>.ts`, `events-<boss>.ts` | the state, the step, its hash, its `SimConfig` fields (`*_DEFAULTS`), its events — every tunable a named field, never a literal |
| `sim/src/boss-kinds.ts`, `boss-union.ts`, `boss-entries.ts`, `boss-others.ts`, `bosses.ts`, `wave-boss-clocks.ts`, `entries.ts`, `events.ts` | the kind, the union, install (a clock boss's branch and its `kind` on `CLOCK_KINDS` there, not in `wave-boss.ts`), step dispatch, the events union — `events.ts` is at 250 lines, so a comment goes for every line added |
| `sim/src/boss-surface-clocks.ts`, `boss-entries-clocks.ts`, `bosses-clocks.ts`, `config-boss-clocks.ts`, `hash-boss-clocks.ts` | the clock tables, if the boss has a beat count |
| `sim/src/bullets.ts`, `lance-burn.ts` | the hook, if a shot leaving the top of the field answers it |
| `sim/test/<boss>.test.ts`, `hash-fixture-bosses-c.ts` (its entry and its `patchBossC` branch — the last page, where a new boss goes) | one test per receipt, the wave held, hash determinism, install; every nullable boss field given a value in the fixture or `hash-coverage` fails |
| `content/src/waves/act-*.ts`, `queue-boss.ts`, `mechanics-bosses.ts`, `mechanics-table.ts`, `waves-demo.ts` | the wave with its guide (each half ≤ 220 characters), the one-sentence mechanic |
| `content/test/guided-entries.test.ts` `THE_LESSON_KEEPS` | every kind the guide does not introduce, with the reason |
| `audio/src/bind-<boss>.ts`, `sounds/boss-<boss>.ts`, `bind-choreographed.ts`, `catalogue.ts`; `test/bind.test.ts` SAMPLES, `test/catalogue.test.ts` WIRING | one cue per event, panned to its column; every sound under `VOICE_BUDGET_SECONDS` in the 300–3000 Hz band — sweeps above ~4200 Hz or below ~300 Hz |
| `render/src/effects-ingest-silent-boss-b.ts`, `effects-spark-silent-boss-b.ts` | every event listed silent **until the look lane draws it** — the boss families live in the `-boss` files, and the rows go on the **second page** of each: the first pages are full and the field's own lists were at their limit before them |
| `net/src/command-fields.ts` `DRAG_TARGETS`, `net/test/command-codec.test.ts` `EVERY_TARGET` + one accepted example; `tools/director/test/on-field-controls.test.ts` `documentedDragTarget` | if the boss adds a `DragTarget`: the wire **drops a target it does not list, silently** — the codec test is what says so (THE SINEW, `command-fields.ts`) |
| `tools/director/src/boss-nothing.ts`, `serialize-boss.ts`, `ship-fields-round.ts`, `ship-groups.ts`, `ship-notes-round.ts`, `sound-link-none.ts` | the director's sheet: the group, the fields, the notes, the sounds with no subject |
| `sim/src/boss-phases.ts` or `tools/director/src/boss-states.ts` `BY_HAND`; `tools/director/src/poses-bosses-*.ts` | **the STATES sheet's BOSSES category** (the owner, 18 September 2026): a boss with a phase table lists it in `BOSS_PHASES`, one without names its states by hand from its own predicates; every state is a `bossPose` run to, never set — `test/boss-states.test.ts` is red for a kind with no states, a state with no pose that is not on its `OWED` list, and a pose naming a state the boss no longer has. A phase renamed, added or removed is this test red until the cards follow |
| `docs/spec/bosses.md` §11.n, `docs/spec/audio.md` counts, `docs/spec/briefings.md`, `tools/perf/baseline.json` (`bun run baseline:blank`) | the write-up: the rule in one sentence, **every departure from the design argued by name**, *What is not built*, *Never watched at tempo* |
