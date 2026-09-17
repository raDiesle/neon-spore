# Queue

Work a session found and did not do. Every entry here is waiting for a session
of its own, and most of them drain without the owner deciding anything — the
ones that do not say so on their own line.

**What belongs here.** A refactor stepped around, a rule re-derived instead of
called, a file grown past ~250 lines, dead code, a slow path, a missing test, a
document that no longer describes the code, a tool that would have helped, and
**a command that failed and was worked around** — retried, slept past, run
twice. Working around one is what keeps it, and every later session pays the
same tax in minutes and in tokens. The test is one question: **could a fresh session finish this alone and prove it
with `bun run check`?** Yes — it goes here, in the same commit as the work that
found it, without asking first.

**A `Files:` line names files the tree already has.** `tools/test/doc-drift.test.ts`
holds every entry to it, and holds every document to naming no path in backticks
that does not exist — so a file an entry proposes to *create* is described in
the body, unbackticked, rather than listed as a file. An entry that names the
file it is about to write is red on `bun run check`.

**And a landing that could not check itself writes one, without being asked.**
`bun run land --unverified "<what>"` puts an `## Unverified at <sha>:` entry
here at the moment the trunk moves, and a cloud session uses it every time it
lands something it could not look at — a wave never watched at tempo, a shape
never seen to move, a frame cost the sandbox is too slow to take. It is an
ordinary entry: claimed, opened on a machine that can look, and removed with
`queue done`. `docs/cloud-session.md` has why the alternative — leaving it in a
report that ends with the session — was the half of that arrangement that never
worked.

**And a topic that asks the owner something belongs here too**, on an
`- **Asks:** <question>` line. That is a change the owner made on 6 September
2026, and it reverses the paragraph this file used to carry. What it fixes is
where such a thing was going instead: a question filed in `docs/spec/` is on a
page nobody opens on the way to work, so it was read the day it was written and
never again. Here it is in front of whoever runs `bun run queue`, the listing
marks it `ASKS THE OWNER`, and `next` hands the session a prompt that puts the
question first and says to build nothing until it is answered.

Such an entry is otherwise an ordinary one and is held to the same test — it is
claimed, worked in its own lane and removed by `queue done` — so the body still
has to say what to change and still has to **name the options the answer picks
between**. "What should this look like?" is not an entry. "Three places it
could be drawn, and here is what each costs" is.

**And nowhere else.** Not the report, which scrolls away — the next session
clones `origin` and sees only files. Not a suggested background task either:
this file *is* the mechanism, and a chip is a popup the owner has to dismiss
that says nothing `bun run queue` does not already say to whoever asks it. A
finding written here is read by every session that comes after; a finding
offered as a chip is read once, by the one person the queue exists to spare.

**What still does not.** A thing the game could be — a creature, a mechanic, a
control, a weapon, a boss, a round — goes in `docs/spec/`, where the director's
`◇ NOT BUILT YET` sheet reads it next to the built things it would sit beside.
A *look* with a shipped alternative is offered in `tools/versus/`, because the
only way to choose between two is to see both.

The line between those and an `Asks:` entry is **whether there is work waiting
on the answer**. A creature nobody has built is a page in the spec: there is no
lane held up by it, and the owner picks from that sheet when he opens a session
to. A control that is drawn but says the wrong word is an entry here: the work
is decided, sized and sitting in named files, and the only thing missing is one
sentence from him. Filing the first kind here is what buried the queue last
time under sixty-two entries nobody could face, and that has not stopped being
true — the new rule widens the door by one hinge, not off them.

**Every path an entry names is a path the tree has**, on the `Files:` line and
in the body alike — `tools/test/doc-drift.test.ts` holds both, and it is the
same rule every document here obeys. So an entry that proposes a **new** file
cannot spell it out: name the directory on `Files:` and call the file *a
`sheet.ts` beside `crop.ts`* in the body. A path that goes red is a document
naming something nobody can open.

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on. **It also
says when an entry has gone stale** — a file its `Files:` line names was
changed on `main` by a commit dated after the entry, or is not on `main` any
more — with the commit's sha and subject, so the session that claims it
re-reads before it works; the entry itself is left as it was.
`bun run queue next` *hands out* the first free one: it creates that item's
branch, writes a `Taken:` line into the entry on `main` and pushes it, then
prints a prompt naming the branch. The session checks that branch out in its own
worktree, does the item, removes the entry with `bun run queue done <n|title>`,
and lands; the entry goes and the branch goes with it, which releases the item
at the moment the work reaches `main`. If a handed-out item is never started,
`bun run queue release <n|title>` gives it back — the line comes off `main` and
the branch is deleted.

**Marking one ongoing without opening a lane.** A session already in a worktree
that picks an item up itself — draining several in one sitting, rather than
being handed one — says `bun run queue take <n|title>`. That makes the same
claim `next` would have made, branch and `Taken:` line both, and stops there: no
prompt, no worktree. `bun run queue done` drops the claim along with the entry,
so an item stops reading as ongoing at the moment it stops being in the file.

**Is anything still being worked on.** `bun run queue status` answers in one
word — `DONE` when nothing is left at all, `IDLE` when items are waiting and
nobody is on one, `BUSY` when somebody is, naming the items and the branches
holding them. It exists to be asked of a machine that is about to be turned
off: "is the queue finished" is a question about claims, not about whether the
last command printed something.

**A claim is written twice, because neither half reaches everybody.** The branch
is the gate: worktrees of one repository share their refs, so `claude/queue-…`
is visible to the next `bun run queue` with no commit and no push, and two
sessions cannot be handed the same item because the second `git branch` fails.
The `Taken:` line is the half a local ref cannot do — a session working in its
own clone sees only what `origin` carries, and on 3 September 2026 two sessions
did the same six items in parallel for exactly that reason. So the line is
committed straight to `main` and pushed, where it is the first thing anybody
reads. `next` then moves the branch onto that commit, so a lane starts from a
trunk that already carries its own mark and its `queue done` removes the whole
entry without a conflict.

A clone with nothing on `main` — every cloud session, where the one checkout
stands on the lane and the trunk is a ref beside it — gets the same line by a
different route: the commit is written onto the ref directly, without a
checkout, and the lane's own working tree is not touched. The one thing a
claim still cannot do is said out loud rather than guessed at: if the trunk's
copy of this file has uncommitted changes in it, the branch is made and a `⚑`
line says the entry went unmarked.

An entry that is not on `main` yet — the owner asked for it to be queued and
worked in the same sitting, so it is in the lane's working tree and nowhere
else — is marked where it is: the branch is made, the line goes into the
working copy, and the lane commits it with the work that queued it. And a
claim that fails between the branch and the line takes the branch back down
with it, so the next `take` starts from nothing rather than from a ghost
that says the item is already taken.

A claim carries no commits, so it points at `main` and reads as fully merged.
`bun run land` sweeps merged branches, and for one day it swept other lanes'
claims along with its own — both sessions running on 3 September 2026 lost every
claim they held and then did the same item twice. `partitionMerged` in
`tools/land/claims.ts` now leaves a claim standing unless it is the branch being
landed, which is the one case where deleting it is the release.

**The format**, one `##` per item, and both fields are required because the
session that picks it up has read nothing else:

```
## One line saying what to change

- **Found:** 2026-09-03, claude/some-lane
- **Files:** `packages/sim/src/step.ts`, `packages/sim/test/step.test.ts`

What is wrong, what to do about it, and anything the code does not already
say. Written for somebody who was not there.
```

`- **Taken:** 2026-09-04, claude/queue-one-line-saying-what` sits between the
two while somebody is on it. Nobody writes or deletes it by hand:
`bun run queue next` puts it there and `release` or `done` takes it away, and an
entry that already has one is refused rather than overwritten.

`- **Asks:** <question>` is the fourth line, and it is the only one a finder
writes on purpose. It goes under `Files:`, it has to end in a question mark —
the parser refuses one that does not, because an `Asks:` reading like a task is
a line the owner agrees with and still cannot answer — and it makes the listing
say `ASKS THE OWNER`. **The title does not say it too**, any more than a
`Where:` entry's title says `LOCAL ONLY`: the listing hangs both off the
fields, and a title that shouts one carries it twice — into the string `take`,
`release` and `done` are matched on. The parser refuses that as well. Write the
question so it can be answered in a sentence, and let the body carry the
options it picks between:

```
## A button says two words where a sentence was asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** `packages/content/src/controls.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
```

`- **Where:** cloud` or `- **Where:** local` reserves an entry for one kind of
session, and it is the owner's line rather than the finder's. He asked for it
on 13 September 2026, the day a local session re-watched four waves a cloud
session had built: some work can only be done on a machine with a screen and a
real frame budget — a wave watched at tempo, a `bun run perf` — and some he
wants handed to a cloud session on purpose, from his phone, so the session on
his own machine stays free. The listing marks such an entry `CLOUD ONLY` or
`LOCAL ONLY`, `bun run queue next` passes over one kept for the other kind,
and `next <n>` or `take <n>` naming it is refused with the reason. A session
knows which kind it is by `CLAUDE_CODE_REMOTE`, the signal the web image sets
(`tools/queue/where.ts`). Without the line an entry is anybody's, which is
still what nearly every entry is.

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim;
`tools/queue/test/where.test.ts` holds the reservation.

## THE SCOUT's second arena leaves the scout nowhere to stop

- **Found:** 2026-09-17, claude/queue-unverified-at-ce8a2324-the-scouts-arenas-were-ne
- **Taken:** 2026-09-17, claude/queue-the-scouts-second-arena-leaves-the-scout-nowhere
- **Files:** `packages/content/src/scout-arenas.ts`, `packages/sim/src/config-scout.ts`
- **Asks:** Move the motes off the hazards' rows, move the hazards, or make a hazard's touch smaller?

Five of the second arena's six motes sit exactly one tile from a hazard's row
— motes on rows 8.5, 6.5, 4.5 and 2.5 against hazards on 7.5 and 3.5 — and a
touch reaches `scoutRadiusMilli + scoutHazardRadiusMilli`, which is 0.88 of a
tile. So a scout parked on any of the five has 0.12 of a tile of room when the
hazard sweeps underneath it, and a scout coasting on to one has none: rows are
not remapped, so those figures are the shipped ones on any field.

The first arena has 2.12 tiles of room on every mote, which is what the
difference looks like. An autopilot that points, burns and coasts cleared the
first arena eight times out of eight when it waited hazards out, and the second
none out of eight — it is caught on the approach every time, at every one of
the eight beats it was started on. That is not proof a pair cannot fly it,
because a pair crosses between sweeps rather than stopping on the mote; it is
proof that *stopping on a mote is never safe here*, which is the one thing the
arena's own comment assumes when it says the column of motes is the line a
ship takes on its own.

The options the answer picks between: move the five motes half a tile off the
hazards' rows, which keeps both hazards where they are and costs the tidy
two-tile spacing; move the two hazards to rows nothing is on — 9.5 and 5.5 are
free — which keeps the motes' column and changes which gap the pair is
waiting for; or cut `scoutHazardRadiusMilli` from 460, which is a change to
every arena and to any arena written later. Measured by flying the shipped
arenas in `tools/probe/`; nothing here was watched, because nothing of the
round is drawn yet (`docs/spec/interludes.md`).

## THE SCOUT's arenas give three to five times the beats a flight takes

- **Found:** 2026-09-17, claude/queue-unverified-at-ce8a2324-the-scouts-arenas-were-ne
- **Files:** `packages/content/src/scout-arenas.ts`, `docs/spec/interludes.md`
- **Asks:** Should the two arena clocks come down to something a pair can run out of?

The first arena is authored at 40 beats and the second at 56. An autopilot
that points, burns and coasts collects all four of the first arena's motes and
banks them in 7 to 14 beats depending on where the hazard is when it sets off,
and 9 to 16 when it waits the hazard out. So the clock is three to five times
the flight, and `ranOut` in `sim/scout-arena.ts` — one of the two ways this
round breaks the hull, and half of what the spec's section promises — can only
fire for a pair who have stopped flying altogether.

The options the answer picks between: bring the two numbers down to about
twice a clean flight, 18 and 24, so the clock is a thing that can be felt and
the round has the second failure the spec describes; leave them and say in
§*THE SCOUT, the round that flies* that the clock is a backstop against a pair
who are lost rather than a pressure, which is a true sentence about the
numbers as they stand; or leave the first generous and tighten only the
second, which is where the difficulty is meant to be. Whichever it is, the
figure wants to be chosen against a measured flight rather than against
nothing, which is what it was chosen against.

## THE STARE's warning is under the spec's own four-second rule

- **Found:** 2026-09-17, claude/queue-unverified-at-805b6376-the-stares-rhythm-was-nev
- **Files:** `packages/sim/src/config-stare.ts`, `docs/spec/bosses.md`, `docs/spec/latency.md`
- **Asks:** Should the tell be six beats, seven, or four with the reason it is exempt written down?

`stareTellBeats` is 4, and at 96 bpm a beat is 0.625s, so the warning is 2.50
seconds. `config-stare.ts` called it three and `docs/spec/bosses.md` said the
same; both now say two and a half. What the figure has to clear is on one page:
`docs/spec/latency.md` puts the announcement chain at 2.1–3.6 seconds and then
sets a rule — *every creature whose defeat requires an announcement needs at
least 4 seconds from becoming visible to impact, better 5–6*. The tell requires
an announcement by construction: the seat is rolled at the top of the turn and
shown only to the seat that is **not** about to be frozen, so the whole of the
warning is one player saying YOU or THEM. At 2.50s a pair at the slow end of
their own band has not finished the sentence when the look lands.

The options the answer picks between: **6 beats**, which is 3.75s — the top of
the exchange band, still under the four-second rule, and one bar of the game's
own counting; **7 beats**, 4.38s, which is the first value that meets the rule
as written and makes the cycle an odd length; or **4 beats kept**, with a
sentence in `latency.md` saying why a freeze is exempt from a rule written for
a body that has to be shot — the honest case being that nothing is aimed at
here and a seat that hears the word late loses a press rather than the hull.
The last is a real answer and the one that costs nothing, but it has to be
written down rather than left as the silence it is now.

## THE STARE's longest look is a number no pair has seen

- **Found:** 2026-09-17, claude/queue-unverified-at-805b6376-the-stares-rhythm-was-nev
- **Files:** `packages/sim/src/config-stare.ts`, `packages/content/src/waves/act-7c.ts`
- **Asks:** Lengthen the wave, grow the look faster, or bring `stareLookMaxBeats` down to ten?

The looks are 6, then 8, then 10, then 12 and 12 thereafter, and the eye turns
on beats 12, 36, 62 and 90 — a cycle is 18 beats plus its own look, so it
lengthens as it goes. THE STARE's wave sends its last rock on beat 72 and a
rock falls a tile a beat from row 0 to the hull's 14, so the wave is over by
about beat 86. The fourth look begins at 94. **`stareLookMaxBeats` is a number
the shipped game never reaches**, and the comment that set it — *reaches the
maximum in four looks, which is about the length of a wave* — was out by about
twenty beats.

The looks that do happen are survivable, and that was the other half of what
this entry's own unverified item asked: every rock the wave sends is authored
inside a look and every colour inside a working window, and the tightest of
them, the rock on beat 67 under the ten-beat look, still has six clear beats
after the eye turns away.

The options the answer picks between: **lengthen the wave** past beat 94 with
two or three more arrivals, so the longest look is a thing a pair meets and the
wave earns its ceiling; **grow faster** — `stareLookGrowBeats` 3 makes the
looks 6, 9 and 12, so the third look is the ceiling and the wave as authored
reaches it; or **bring the ceiling down to 10**, which changes nothing about
how the game plays and makes the config describe it. The middle one is the only
one that changes what a pair feels, and the third is the only one that is free.
