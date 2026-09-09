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

**Draining it.** `bun run queue` lists what is waiting, half-done work from
`docs/parked.md` first, and says which items somebody is already on.
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

The two things a claim cannot always do are said out loud rather than guessed
at: if no worktree has `main` checked out, or the trunk's copy of this file has
uncommitted changes in it, the branch is still made and a `⚑` line says the
entry went unmarked.

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
say `ASKS THE OWNER`. Write the question so it can be answered in a sentence,
and let the body carry the options it picks between:

```
## A button says two words where a sentence was asked for

- **Found:** 2026-09-06, claude/some-lane
- **Files:** `packages/content/src/controls.ts`
- **Asks:** Leave the two words, hang a caption over the band, or widen the lobe?

Why the short label is what fits today, and what each of the three costs.
```

`tools/queue/test/queue.test.ts` holds that format and fails on an entry a cold
session could not act on; `tools/queue/test/taken.test.ts` holds the claim.

## `docs/party-games.md` links to nine screenshots it could not embed

- **Found:** 2026-09-08, claude/party-minigames-research-udjn67
- **Files:** `docs/party-games.md`

`docs/tower-defence.md` sets the house rule for a study of other games: the art
is not ours and the repository is public, so a picture is written as
`![a sentence saying what it shows](https://…)` and **linked**, never copied in.
`packages/…` never sees it; `tools/director/src/markdown.ts` renders it and
honours `https://` only.

The party-games study could not follow it. Every host those links would point
at is refused by the network policy a cloud session runs under —
`www.mariowiki.com`, `mario.fandom.com`, `rabbids.fandom.com`,
`raving-rabbids.fandom.com`, `raymanpc.com`, `en.wikipedia.org` and
`static.wikia.nocookie.net` all answered `connect_rejected`, through `curl` and
through the fetch tool alike. Writing an `![…](…)` from memory would have put
nine unchecked URLs in a public file, so each row carries a **link to the wiki
page that holds its screenshot** instead, and the page says so in *What the
pictures are, and are not*.

The work: from a session that can reach those hosts, open the eleven pages
listed under *Sources* and in the two tables, take the direct image URL for each
minigame's screenshot, and rewrite the rows as linked images with a caption
written as a sentence — the way `docs/tower-defence.md` does throughout, so that
a failed load still says what it showed. The rows most worth a picture are
Torpedo Targets, Bowser's Big Blast, Hexagon Heat, Look Away and the Rabbids
dance battle; the refused rows need none. Then delete the *What the pictures
are, and are not* section's second and third paragraphs, which exist only to
explain the absence.

## THE TELL's last rung was designed as three throws and ships as one

- **Found:** 2026-09-08, claude/rock-paper-scissors-boss-sn9ful
- **Files:** `packages/sim/src/tell.ts`, `packages/sim/src/tell-round.ts`,
  `packages/content/src/tell-rungs.ts`, `packages/render/src/tell-body.ts`

`docs/spec/bosses.md` 11.9 ends the ladder on a rung with **no guess in it at
all**: three throws on three consecutive beats, every one of them shown
outright, no feint. Nothing about it is a reading test — it is the pair finding
out whether it can say three words in four seconds without talking over itself,
and it is there because a ladder that ends on a coin toss ends on somebody
else's decision.

What shipped asks for one throw a rung. `TellRung` has `beats`, `feint` and
`answers`, and the fifth rung is `{ beats: 2, feint: true }` — a hard rung, and
the same kind of hard as the fourth.

It is a second mode inside the round rather than a number, which is why it was
left rather than half-built: a rung of three would need a list of boss throws
instead of one `bossThrow`, a list of the ship's instead of one `thrown`, and a
reveal that plays three scenes in a row rather than one. The seam is `openRung`
and `reveal` in `tell-round.ts`, which already do exactly this once. Add
`throws?: number` to `TellRung`, let the two `number` fields become the first
entry of a fixed-length array when it is set, and the picture follows — the
ring already draws one node lit at a time and would light them in turn.

## THE TELL's baseline row was measured on a busy container

- **Found:** 2026-09-08, claude/rock-paper-scissors-boss-sn9ful
- **Files:** `tools/perf/baseline.json`

`CLAUDE.md` says a cloud session skips the performance run. This one could not:
adding a wave adds a row `tools/perf/test/baseline.test.ts` requires, and the
test is what keeps the baseline from comparing today against a game that no
longer exists — so `bun run perf --wave "THE TELL" --save` was run rather than
the row being invented.

It came back honest and flagged. THE TELL measures 5.43 ms raw and merges at
1.35 ms on the baseline's footing, which is 33% of a 60 Hz frame and the
cheapest wave in the run — plausible for a round with no bodies on the field.
But the whole run moved +256% against the baseline and **THE WISP, a reference
wave, came back flagged at 114% of a frame**, which `docs/performance.md` says
means the machine was busy and the run says nothing. The scaling that produced
1.35 was read off those same references.

So the row is a placeholder with a real measurement in it rather than a
measurement to trust. Re-take it on the owner's own machine —
`bun run perf --wave "THE TELL" --save` — and this entry goes.

**And the general case is the interesting half**: a cloud session adding a wave
cannot pass `bun run check` without running perf, and running perf there is
what `CLAUDE.md` tells it not to do. Either the baseline test should tolerate a
row marked unmeasured, or `CLAUDE.md`'s rule needs the exception written into
it. That is the owner's call and this entry is where it is waiting.

## A contour candidate cannot be measured before it is voted on

- **Found:** 2026-09-08, claude/visual-system-style-guide-rdti4j
- **Files:** `tools/shape-sheet/src/drafts/index.ts`, `tools/versus/variant.ts`, `tools/shape-sheet/src/nameability.ts`

`creature:slick` / `pinch` and `creature:bulb` / `six` patch a
`CreatureSilhouette`, and the two questions this repo insists on about a
silhouette cannot be asked of either of them. `bun run shapes:report` prints
geometry for the records in `packages/content`, and a candidate is not one —
it is a set of fields held for the length of one `draw()`. So *does it survive
its own drawn size* (the 20 px floor, the 11 px cliff) and *does the
nameability gate still separate it from its neighbours* are both unanswerable
until the candidate has won and been adopted, which is precisely backwards:
they are the cheap disqualifiers `docs/art-review.md` puts first, and the vote
is the expensive step they exist to save.

The mechanism for it already exists next door. `tools/shape-sheet/src/drafts/`
holds shapes that are not shipped and draws them on the sheet beside the ones
that are, which is where a *draft* contour is judged. What is missing is one
join: a `Variant` whose patched record is a `CreatureSilhouette` should be
readable as a draft, so `bun run shapes` puts it on the sheet and
`bun run shapes:report` measures it, under the candidate's own name.

Derive it rather than authoring it twice — a draft written by hand beside a
candidate is a second copy of the numbers, and the two would drift the first
time either moved. The join is a function over `VARIANTS` that keeps the
patches whose `where.file` is `packages/content/src/silhouettes.ts`, applies
each one's `fields` to a copy of its target, and hands the result back as a
draft. `tools/shape-sheet/test/` is the guard: every contour candidate open in
`tools/versus/candidates/index.ts` appears on the sheet, and a candidate whose
patched shape falls under the drawn-size floor fails there rather than at the
pair.

## THE CLASP's bubble has no place a candidate look can live

- **Found:** 2026-09-09, claude/enemy-graphics-animations-versus-3mjjv7
- **Files:** `packages/render/src/clasp.ts`, `packages/render/src/clasp-lattice.ts`,
  `tools/versus/README.md`

This lane went looking for bodies with no VERSUS slot and picked the clasp's
honeycomb sphere first: `drawClaspLattice` is a warped hexagon grid that already
argues it is a ball, and turning it into a *placed* surface — cells at real
longitudes and latitudes, half of them round the back — is the same work
`crawler:skin` / `pearl` did for a worm. It was dropped before a line was
written, because of `drawClaspShield`'s first branch: when `image !== null` the
hand-painted strip is drawn and **the whole procedural floor, lattice included,
is skipped**. `assets/raster/green-shield-strip.webp` is committed and is what a
phone loads, so the lattice is only ever seen when the raster fails — a
candidate patching it would have been a slot whose difference nobody could see
in the shipping game, which is precisely the defect the entry above this one is
about.

Two things to do, and they are independent. **Say it where the next session
looks**: `clasp.ts`'s own doc comment describes the procedural path as "the
floor" without saying it is unreachable with the assets loaded, and
`tools/versus/README.md`'s "Writing one" section has no line about a record that
sits behind an asset branch. **Then decide what the floor is for**: either it is
a genuine fallback worth keeping — in which case a seam for it has to patch both
halves or neither, and the honest slot is the *strip*, which VERSUS cannot offer
because a candidate cannot repaint a webp — or it is dead paint on every device
that ever loads, and `clasp-lattice.ts` is 134 lines of it. `raster-probe.ts`
and `raster-caps.ts` are where the answer to "does a phone ever miss" lives.

## The slot-to-creature map in `versus-pose.test.ts` is kept by hand

- **Found:** 2026-09-09, claude/enemy-graphics-animations-versus-3mjjv7
- **Files:** `tools/director/test/versus-pose.test.ts`

`each creature slot's pose actually puts that creature on the field` is the
guard for the owner's complaint that every slot showed a slick, and it reads
from a literal `Record<string, string>` of four — now seven — slots. A slot
missing from that object is not a failure and not a warning: it is simply not
checked, so the guard covers whichever slots somebody remembered to add and
silently exempts the rest. This lane added three rows to it by hand, which is
the second time the same list has been extended by hand.

Most of it derives. A slot is `area:thing`, and where the area is `creature` the
thing **is** the `CreatureKind` for every slot on the page today — so the check
can walk `slots(VARIANTS)`, take the ones whose prefix is `creature:` and assert
the kind is on the field, with a small explicit table left for the ones that do
not follow the rule (`crawler:pulse`, `crawler:skin`, `warden:plates`). Then a
new creature slot is covered the moment it is registered. The test that proves
it is the one already there, plus an assertion that the derived set is not
empty — a derivation that quietly matches nothing is the same silence in a
different place.
