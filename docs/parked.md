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

## Nothing can look at a briefing card twice

2026-08-27 · claude/burn-briefings-b1

The game shows each card exactly once per fresh pair, which is correct and
makes the card the one drawn thing in the repository that cannot be reviewed:
seeing it a second time means a page reload, and seeing all of them means
several. The director has a STATES sheet and a SHAPES sheet for exactly this
problem and neither knows about cards.

Not done there because it is a director panel rather than a game change, and
the lane owned no files under `tools/`. Start at
`tools/director/src/backlog-page.ts` for the tab shape, and note that
`packages/render/src/briefing.ts` already draws a card from nothing but a
subject and a role — which is the whole of what a sheet would need.

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

## Two new creatures move like a slick because there is nothing else to move like

2026-08-27 · claude/burn-creatures-b3

`packages/content/src/own-motion.ts` falls back to `TILT_RIPPLE` for anything
that is not a bulb, so the Runt twitches like a slick and the Throb tilts like
a slick. Both want their own: the Runt is meant to read as small and helpless,
the Throb as breathing, and the Throb's is nearly load-bearing — its swell is
what tells the pair when to fire, and a body that also tilts is a body saying
two things at once.

Not done there because `own-motion.ts` is the one copy of how a body sways and
the lane did not own it. It is a short file and this is two entries in it.

## Shooting the Runt looks exactly like shooting anything else

2026-08-27 · claude/burn-creatures-b3

The Runt is the creature you must not hit, and hitting it spends the ordinary
`destroy` event and the ordinary effect — so the only tell that the pair got it
wrong is the score moving the wrong way, which is the one place neither of them
is looking during a wave. A mistake that announces itself is what makes "leave
that one" a rule they learn in one wave instead of five.

Not done there because a new `SimEvent` fails `packages/audio/test/bind.test.ts`
until `packages/audio/src/bind.ts` names a cue for it, and the audio package was
another lane's ground. Start there; the catalogue already has spare sounds
(`bun run dev`, ♪ SOUND) and this is one of the things they were kept for.
