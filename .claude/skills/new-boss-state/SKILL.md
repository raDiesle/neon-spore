---
name: new-boss-state
description: Add a phase, a gesture or an event to a boss that already ships in Neon Spore — the fourteen registrations outside the simulation that a red test or the typecheck will otherwise hand over one at a time, each with the file, what it wants and what goes red without it. Use when giving a shipped boss a new phase, state, drag target, hold or sound.
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
THE SINEW's catch, the same day, added a predicate and an event and met two
more that nothing on this list had named.

None of it is hard. Every row names its own fix. **Do all fourteen before
the first check**, and the check is one run.

## The fourteen

Twelve of them are THE CANDLE's. Two more came from THE SINEW's catch, which
added a predicate and an event rather than a phase and a target — and both are
**typecheck** failures rather than red tests, which is why the lane that first
wrote this table never met them. They are rows 3 and 4, beside the other
typecheck row.

Work top to bottom: a row's test cannot go red until the rows above it are
done.

| # | File | What it wants | Goes red in |
|---|---|---|---|
| 1 | `packages/sim/src/boss-phases.ts` | the phase's name on the boss's row, if the boss keeps its phases there rather than by hand — **and a state is not only a phase**: any named condition the pair meets a different gesture in is owed a card too, and it arrives as a second table out of the simulation spread onto the row (`SNAKE_GRIPS`, `GAUGE_GRIPS`), never a hand-written list on the director's side | `tools/director/test/boss-states.test.ts` |
| 2 | `packages/sim/src/drag-targets*.ts` | the new gesture as a member of `DragTarget` or `Hold["kind"]` — a gesture not in one of them is a wish, not a `Command` | typecheck, everywhere the union is switched on |
| 3 | `packages/sim/src/bosses-clocks.ts` **and** `boss-surface-clocks.ts` | a re-export of every new **predicate** the boss's own file exports, in **both** hops. `index.ts` reaches one through `boss-surface-clocks.ts`, which imports from `bosses.ts`, which re-exports `bosses-clocks.ts` — so either page alone leaves the predicate invisible outside `sim`, and `surgeWarding` on 19 September 2026 was written into the second and missed in the first | typecheck: `error TS2305: … has no exported member`, naming the file that tried to import it rather than the hop that lacks it |
| 4 | `packages/audio/src/bind-choreographed.ts` | a `case` per new **event**, whether or not it makes a sound. Without one the event falls through `default:` into whichever boss the switch ends on. `bind-choreographed-b.ts` and `-c.ts` carry the same switch for a boss whose cases already live there — the row is whichever of the three pages already holds that boss's, never a fourth | typecheck: `Type '{ type: "…" } & …Event' is not assignable to '…Event'` — a sentence about a boss you never touched |
| 5 | `packages/net/src/command-fields.ts` | which fields the new target's command carries over the wire | `packages/net/test/command-codec.test.ts` |
| 6 | `packages/net/test/command-codec.test.ts` — `ACCEPTED` | one `Command` per new target, `on: true` and `on: false`, with the fields the pilot's hand actually sends | its own round-trip case |
| 7 | `packages/net/test/command-codec.test.ts` — `EVERY_TARGET` | one `true` per new `DragTarget`. A separate list from `ACCEPTED`, and both are hand-kept | its own coverage case |
| 8 | `packages/render/src/effects-ingest-silent-boss*.ts` | one row per new event that leaves nothing behind for the next frame | the silent-effects cases in `packages/render/test` |
| 9 | `packages/render/src/effects-spark-silent-boss*.ts` | the same list for the spark side — **it is a second list, not the same one** | `packages/render/test/effects-spark.test.ts` |
| 10 | `packages/audio/test/bind.test.ts` — `SAMPLES` | one sample event per new event type, keyed by type. The case compares the keys against every event the simulation declares, so a new event with no sample is red whether or not it makes a sound | its own case at the foot of the file |
| 11 | `tools/director/src/sound-link.ts` — `BY_ID`, or `sound-link-none*.ts` — `NO_SUBJECT` | a **picture** per new *bound* sound, and a written reason only where there is nothing to draw. Which of the two is the question the row asks, and the test fails into the exception list either way: a rock the bulb spits is a `METEOR` the sheet has had all along, and only a thing with no contour earns the sentence | `tools/director/test/sound-link.test.ts` |
| 12 | `tools/director/src/poses-bosses-hands-*.ts` | a pose card per new state, on the page for the kind of thing that earns it — a shot, a beat, a handle, a clock | `tools/director/test/poses.test.ts`, `boss-states.test.ts` |
| 13 | `packages/hands/src/boss-hands-*.ts` | the hand that **drives the world into** the new state. Without it `poses.test.ts` throws `the world never reached …` rather than naming a missing card, which is the one failure here that does not read as what it is | `tools/director/test/poses.test.ts` |
| 14 | `tools/director/test/on-field-controls.test.ts` — `documentedDragTarget` | a `case` per new target, with a sentence saying what the seat takes hold of | its own case |

And the counts, which are prose rather than a list and go stale silently:

- `docs/INDEX.md` — run `bun run index` for the new file's row, never write one
  by hand. It **keeps the blurb that is already there**, so a header reworded
  in this lane (a boss's *twelve* becoming its *thirteen*) leaves a stale row
  the generator reports nothing about; that one is fixed in place
- `docs/spec/bosses.md` — the boss's own section, and the fight's description
- `docs/spec/audio.md` — the two counts in its tables, if a sound was added
- `tools/director/src/ship-fields-choreo.ts` and `ship-notes-choreo.ts` — one
  row per new `SimConfig` field, and the fight's note rewritten if the new
  phase changed how it ends. `-choreo-b.ts` once the first page is full — the
  error TypeScript raises names `ship-fields.ts` either way (`FIELD_GROUP`'s
  own header there says which of the four pages a field actually belongs on)

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
