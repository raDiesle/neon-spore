---
name: new-boss-state
description: Add a phase, a gesture or an event to a boss that already ships in Neon Spore — the twelve registrations outside the simulation that a red test will otherwise hand over one at a time, each with the file, what it wants and the test that goes red without it. Use when giving a shipped boss a new phase, state, drag target, hold or sound.
---

# Adding a state to a boss that already ships

The simulation is the afternoon. The registrations are the rest of the day,
and they are the reason this file exists.

THE CANDLE gained two phases and one drag target on 19 September 2026
(`516ba5f9`). The simulation for that was five files. Getting `bun run check`
green afterwards was **twelve further registrations in eleven files**, every
one found by a red test rather than by reading anything — and they are only
discoverable *from one another*: the pose card cannot go red until the hand
can drive the world into the new phase, and the hand cannot be written until
the phase exists. So a lane meets them one `bun run check` at a time, minutes
a round, and the four runs that lane paid are what the list below buys back.

None of it is hard. Every red test names its own fix. **Do all twelve before
the first check**, and the check is one run.

## The twelve

Work top to bottom: a row's test cannot go red until the rows above it are
done.

| # | File | What it wants | Goes red in |
|---|---|---|---|
| 1 | `packages/sim/src/boss-phases.ts` | the phase's name on the boss's row, if the boss keeps its phases there rather than by hand | `tools/director/test/boss-states.test.ts` |
| 2 | `packages/sim/src/drag-targets*.ts` | the new gesture as a member of `DragTarget` or `Hold["kind"]` — a gesture not in one of them is a wish, not a `Command` | typecheck, everywhere the union is switched on |
| 3 | `packages/net/src/command-fields.ts` | which fields the new target's command carries over the wire | `packages/net/test/command-codec.test.ts` |
| 4 | `packages/net/test/command-codec.test.ts` — `ACCEPTED` | one `Command` per new target, `on: true` and `on: false`, with the fields the pilot's hand actually sends | its own round-trip case |
| 5 | `packages/net/test/command-codec.test.ts` — `EVERY_TARGET` | one `true` per new `DragTarget`. A separate list from `ACCEPTED`, and both are hand-kept | its own coverage case |
| 6 | `packages/render/src/effects-ingest-silent-boss*.ts` | one row per new event that leaves nothing behind for the next frame | the silent-effects cases in `packages/render/test` |
| 7 | `packages/render/src/effects-spark-silent-boss*.ts` | the same list for the spark side — **it is a second list, not the same one** | `packages/render/test/effects-spark.test.ts` |
| 8 | `packages/audio/test/bind.test.ts` — `SAMPLES` | one sample event per new event type, keyed by type. The case compares the keys against every event the simulation declares, so a new event with no sample is red whether or not it makes a sound | its own case at the foot of the file |
| 9 | `tools/director/src/sound-link-none.ts` — `NO_SUBJECT` | one reason per new *bound* sound that has nothing to draw. A sentence, not a placeholder: the rule is that every bound sound gets a picture, and this is the written exception | `tools/director/test/sound-link.test.ts` |
| 10 | `tools/director/src/poses-bosses-hands-*.ts` | a pose card per new state, on the page for the kind of thing that earns it — a shot, a beat, a handle, a clock | `tools/director/test/poses.test.ts`, `boss-states.test.ts` |
| 11 | `tools/director/src/boss-hands-*.ts` | the hand that **drives the world into** the new state. Without it `poses.test.ts` throws `the world never reached …` rather than naming a missing card, which is the one failure here that does not read as what it is | `tools/director/test/poses.test.ts` |
| 12 | `tools/director/test/on-field-controls.test.ts` — `documentedDragTarget` | a `case` per new target, with a sentence saying what the seat takes hold of | its own case |

And the counts, which are prose rather than a list and go stale silently:

- `docs/INDEX.md` — run `bun run index`, never edit it by hand
- `docs/spec/bosses.md` — the boss's own section, and the fight's description
- `docs/spec/audio.md` — the two counts in its tables, if a sound was added
- `tools/director/src/ship-fields-choreo.ts` and `ship-notes-choreo.ts` — one
  row per new `SimConfig` field, and the fight's note rewritten if the new
  phase changed how it ends

## The page you are adding a row to is probably full

Four of these files sat at or within three lines of the 250-line ceiling when
THE CANDLE's rows went in, and all four went over. **Each gives a boss back
rather than grow**, and the seam is build order: it is the *last* boss on the
page that moves to the `-b` page, never the boss being worked on, whose rows
stay with the comment that explains them. `effects-ingest-silent-boss.ts`,
`effects-spark-silent-boss.ts`, `sound-link-none.ts` and the queen's poses
page all carry that rule in their own headers.

`tools/hooks/after-edit-size.ts` says so at the moment of the edit, through
Bash as well as through the edit tools, so the seam can be chosen while the
diff is still about the file. Take it when it speaks.

## Then

The look is a second lane that lands separately — the picture of the new
phase, the cue's word on the field — and a cloud session cannot judge it.
`new-boss` has the rest: the three kinds, what every kind must pass, and the
claim on the table.
