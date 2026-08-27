# Parked

Ideas a session had and did not act on. Optional, every one of them — nobody
owes this file anything.

It exists because both alternatives were worse. A suggestion made in a report
is read once on a phone and scrolled past; a suggestion filed in
`docs/spec/ideas.md` is filed with the design, which is the wrong shelf for
"the director could show this list beside TO CHECK". So it goes here, in the
commit, where a later session with nothing but the clone can pick it up.

It is **not** the outstanding list. `bun run checks` derives that from the
`Check:` trailers, and every row on it is an obligation: work that landed and
that nobody has looked at. A row here is the opposite — work nobody has decided
to do. Keeping the two in one place would make the outstanding list somewhere
that some rows matter and some do not, which is how a list stops being read.

**The format.** One `##` per idea, the date and the branch it came off under
it, then two or three sentences: what it is, why it was not done then, and where to start.

An entry leaves by being **deleted** — done or refused, the history keeps it
either way. Nothing is ticked here. A file of ticked boxes is a file nobody
reads to the bottom of.

## No shape is drawn at any of the twelve interludes

2026-08-27 · claude/game-in-game-mechanics-uxmysp

Every idea in the store has a contour offered to it on the director's SHAPES
tab, joined by name through `suggests` in `tools/shape-sheet/src/drafts/`. The
new INTERLUDES tab therefore shows twelve empty frames, which is the deliberate
"a picture will go here" gap rather than a bug — but it is twelve of them.

Not done here because an interlude is drawn out of `slab` and `glyphed` rather
than out of blobs ([interludes](spec/interludes.md)), and the shape sheet's
subjects are all contours with own-motion. Drawing a dial, a claw on a rail or
a grid of face-down slabs means the sheet learning a second kind of subject,
which is a change to `tools/shape-sheet/src/subjects.ts` and not a drawing
task. Start there, with THE GAUGE, which is one needle and two marks.

## `packages/sim/src/beat.ts` carries three unused imports

2026-08-27 · claude/game-in-game-mechanics-uxmysp

`bun run lint` reports three `noUnusedImports` warnings there, and has done
since before this branch — `bun run check` is green because they are warnings.
They are fixable automatically.

Not done here because this branch touched no simulation code at all, and the
rule is that unrelated work gets its own commit or none. It is one
`bun run lint --write` away for whichever session is next in that file.

## The one-screen tester cannot pull half of THE WARDEN's tethers

2026-08-27 · claude/boss-concepts-implementation-4hri7c

A finger on the field is signed with the seat this device holds, and in the
`test` role that seat is player 1. Half the Warden's cycles clamp player 1, and
you get no leverage on your own tether — so on those cycles a mouse cannot
touch the line at all and the rescue has to go through the **G** key, which is
player 2's hand. That is correct for the finished game (one role per device)
and awkward for the one screen everything is actually tested on.

Not done here because the fix is a choice about the test rig rather than about
the boss: either the field's touch carries a modifier for "the other seat", or
the `test` role signs a finger with whichever seat is *not* currently clamped —
which is a rule that exists only in a view nobody ships. Start at
`field.seat` in `packages/render/src/touch.ts`.

## The Warden's phase table is written twice, in prose and in code

2026-08-27 · claude/boss-concepts-implementation-4hri7c

`WARDEN_PHASES` in `packages/sim/src/warden-cycle.ts` and the table in
`docs/spec/bosses.md` 11.4 carry the same three rows. The director's boss panel
already renders the code's copy rather than a third one, so the tool is honest;
the spec is the copy free to drift. The queen has exactly the same problem one
section up.

Not done here because the general fix is the interesting one: `tools/director`
already parses `## N Title — tail` sections out of the spec (`sections.ts`), so
a check that a spec table matches the constant it describes would cover both
bosses and every one after them. Start at `tools/director/src/roster.ts`, which
already reads `bosses.md`.


## Rendering a theme to a file, so it can be heard away from the director

2026-08-27 · claude/game-music-creation-dzjb8r

The six music candidates can only be listened to by running `bun run dev` and
opening the SOUND sheet, which means the person choosing between them has to be
at a machine. An offline renderer — `PlannedVoice` to samples to a WAV — would
turn a theme into a file that plays on a phone, and would let a cloud session
attach what it wrote rather than describe it.

Not done here because it is a **second synthesiser**. `engine.ts` is the one
place that turns a plan into sound, and a renderer that re-derives its envelope,
its ring modulation and its filters is exactly the drift CLAUDE.md warns about:
the file would stop being what the game plays and nobody would find out by
listening. Start by asking whether `OfflineAudioContext` under a headless
Chromium can drive the real `engine.ts` and hand back the buffer — that keeps
one synthesiser and makes the rendering a harness rather than a rewrite.

## The backdrop tints an act it has to guess at

2026-08-27 · claude/burn-backdrop-b2

`packages/render/src/backdrop.ts` picks its wash and horizon tint from
`world.wave % 5`, because the wave is the finest-grained thing the world
tracks and there is no `Act` anywhere in `sim` or `content` — the spec talks
about ten acts, one boss every ten waves, and nothing in the code knows it.
So the field changes colour every wave rather than every act, which is five
times too often to mean anything.

Not done there because inventing an `Act` type is a change to what a run *is*
— `docs/spec/structure.md` and the wave queue both have an opinion — and a
render lane is the wrong place to decide it. Start by asking whether an act is
a field on the wave or a grouping around the bosses; the tint table in
`backdrop.ts` is then two lines.

## The grip and the lance are controls no wave contains, so no card can find them

2026-08-27 · claude/burn-briefings-b1

A briefing's subjects are derived from what `startWave` was handed — the spawn
queue, the pods, the boss — which is what stops a card going stale when a
creature is swapped out of a wave. THE GRIP and THE LANCE are not in any of
those lists: they are controls the pair has, not things the wave contains, so
the derivation cannot reach them and the two hardest couplings in the game are
the two nobody is taught.

Not done there because the obvious fix is the one `docs/decisions.md` #18 just
argued against — a `briefings:` list grown back onto `Wave` is the placed
version returning through the back door. Start by asking what a control's
first *use* looks like from the sim's side: the first wave whose creatures
make a control visible is derivable too, and that may be the hook.

## The link chip says STALLED while a player is reading

2026-08-27 · claude/burn-briefings-b1

A card freezes the field until both seats dismiss it, and one player reading
theirs while the other has already tapped looks, to `packages/net`, exactly
like a device that has stopped sending — so the network indicator is expected
to go to STALLED during the one moment the game deliberately waits.

Not done there because the lane owned nothing in `net/`, and because the fix
is a judgement about what the indicator is *for*: either it learns that a
briefing is a legitimate wait, or the wait stops looking like silence on the
wire. Start at `packages/net/src/status.ts`, which is deliberately the only
file allowed to say what the indicator may show.

## A subject's bit position is derived by hand in two places

2026-08-27 · claude/burn-briefings-b1

`world.brief.met` is a bitmask over `BRIEFING_SUBJECTS`, and anything that
wants to know whether a subject has been met computes its bit from its index.
`packages/sim/test/purity.test.ts` keeps a table of rules that must be called
rather than re-derived, for exactly this class of mistake, and this one is not
on it.

Not done there because adding a row means editing a shared test file that
another lane was in at the time. It is one row.

## The Throb's swell cannot be judged in the tool built for judging swells

2026-08-27 · claude/burn-shapesheet-b8

The shape sheet now derives its subjects from `CREATURES`, so the Throb is on
it — with the fallback tilt every non-bulb gets, and not with the swell that
is the entire point of the creature. `OwnMotion.poseAt` is a pure function of
seconds and the swell is keyed to `world.beat`, so the tooling has no clock
that could show it.

Not done there because a beat clock in the shape sheet is motion-system work
rather than a derived list, and the lane was scoped to the list. It matters
more than it sounds: one of the two outstanding creature checks asks whether
that swell reads as "wait for it" at tempo, and the tool the check points at
is currently showing the one motion the creature does not have. Start by
asking whether the sheet wants a beat clock or simply a manual open/shut
toggle — the second is much smaller and may answer the check on its own.

## Only one hand in this game can be seen letting go

2026-08-27 · claude/burn-other-hand-b5

THE OTHER HAND shows a partner's thumb on the lance and says nothing about the
other player's, because `prime` is the only control the band emits both a
press and a lift for — the shield strip sends no release, so a resting finger
there is invisible to the simulation. The lane built the honest half and said
so rather than inventing the missing one.

Not done there because a lift edge on the shield strip is a change to
`packages/render/src/touch.ts` and `apps/game/src/input.ts`, neither of which
the lane owned. Start by asking whether a hold is a thing the shield *should*
have — the fork already spends the lance's hold as half of a two-person gate,
and a second holdable control is a second thing that could.

## The roll wants to be a wave before it is ever a boss

2026-08-27 · claude/burn-vane-b7

`docs/spec/transfers-bosses.md` proposed THE VANE as a render-only column
*roll* — one player's column order reversed, so column four on one device is
column eight on the other. The boss was built the other way, folding where
things land in the simulation, because a flip the simulation never hears about
has nothing to hash, nothing to replay and nothing the director can show.

The roll itself is still a good mechanic and it is still unbuilt. What it is
not is a boss: leaning an act on a rule no wave has ever run is how you find
out at the worst possible moment. It belongs at wave scale first, in
`layout.ts` and `touch.ts`, where a bad answer costs one wave. Start there and
let a boss claim it afterwards if it survives.

## Nothing on the field can move between columns

2026-08-27 · claude/burn-vane-b7

THE VANE folds an arrival about the arm's column, and it does it at row 0
precisely so a thrown body is *born* in its landing column and is never seen
to jump. That was the cheap way out of a gap: `Creature` has no `fromCol`, so
there is nothing to interpolate from and no mechanic in this game has ever
moved something sideways once it was falling.

Not done there because it is a wide edit — every construction site of a
`Creature`, plus `hashWorld` — and the boss did not need it. The next mechanic
that wants something to *drift* across columns will, and THE BELT in
`docs/spec/interludes.md` is the one most likely to ask.

## THE CONDUCTOR's slot is spent and the beat is still unbent

2026-08-27 · claude/burn-vane-b7

THE VANE took the act slot that `docs/spec/transfers-bosses.md` drew the
pendulum arm for, and bent the field's geometry rather than its tempo. The
original worry about bending the shared *beat* — that the beat is the one
thing surviving a two-second voice delay, so a boss that moves it attacks the
pair's only reliable ground — is untouched and still deferred.

Worth writing down because the arm is now spent, and the next session reaching
for THE CONDUCTOR will find its picture already in use and should know that is
deliberate rather than an oversight.

## THE VANE is silent

2026-08-27 · claude/burn-vane-b7

A pin coming out and a body being thrown report nothing to `packages/audio`.
The events want to be `pin`, `vaneThrow` and `vaneDown`, and each costs
`events.ts`, `audio/src/bind.ts`, `audio/test/bind.test.ts` and possibly a
sound. Refused shots already report, through the existing `reject`.

Not done there because audio was another lane's ground at the time. That lane
is binding two other silences right now, so whoever picks this up should read
what it decided first — the argument about whether to bind an unbound cue
rather than write a new sound applies here identically.

## An exhaustive switch has just been proved here, and three others have not been looked at

2026-08-27 · claude/burn-audio-b9

`packages/render/src/effects-spark.ts` now covers every `SimEvent` variant
explicitly and ends in `assertNever`, so an event added without a burst fails
the typecheck rather than silently drawing nothing. That change was made
because the silent version had already bitten: an event was renamed, a burst
stopped existing, and everything stayed green.

Nobody has checked whether the same shape is hiding elsewhere. Any `switch`
over a union that ends in `default:` returning a neutral value has the same
property — it turns "somebody forgot" into "deliberately nothing", and the two
are indistinguishable afterwards. `packages/audio/src/bind.ts`,
`packages/render/src/boss-draw.ts` and the mixer are the obvious places to
look first. Start by grepping for `default:` in a `switch` on a `.type` or a
`.kind` and asking, of each, whether a missing case would be visible.

