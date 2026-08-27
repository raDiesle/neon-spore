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
