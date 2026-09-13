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
say `ASKS THE OWNER`. Write the question so it can be answered in a sentence,
and let the body carry the options it picks between:

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

## `bun run frames` cannot photograph a fault with numbers the wave does not carry

- **Found:** 2026-09-13, claude/handover-window
- **Files:** `tools/frames/flags.ts`, `tools/frames/spec.ts`, `tools/frames/page.ts`, `tools/frames/test/flags.test.ts`

Verifying THE HANDOVER with a cycle meant a scratch script that set
`world.malfunction = { kind: "handover", at, beats, every }` on the page by
hand after `openStage`, because no wave in the tree repeats and the tool has
no way to say so. A `--fault "handover:4,3,6"` flag (kind, then `at`, `beats`,
`every` in that order, the director's three boxes) set on the world straight
after `jumpToWave` and before the opening clears would make the picture a
one-line command anybody can rerun. The same flag covers a runaway cannon or
shield at a period the wave does not name.

## THE HANDOVER's fourth rehearsal page captions over the plate on the lip

- **Found:** 2026-09-13, claude/handover-guide
- **Files:** `packages/render/src/guide-caption.ts`, `packages/render/src/caption-anchor.ts`, `packages/render/src/handover-look.ts`, `packages/render/test/guide-plate-room.test.ts`

The film's fourth page anchors its caption on the cannon strip, and a strip
anchor stands the box `CLEAR_STRIP` (4 px) above its ring — which on this
wave is exactly where `drawHandoverNotice` has put THEIR PANEL — BACK IN N.
Photographed on 13 September 2026 with `bun run frames . --wave "THE
HANDOVER" --opening guide --guide-page 3 --ticks 120 --seat p1`: the caption
covers all of the plate but its first two letters. Two texts in one place is
the defect `guide-plate-room.test.ts` already guards for the round header
and the corner plate. The fix is the caption's own floor rule: export the
plate's box from `handover-look.ts` (the rectangle `drawHandoverNotice`
fills), and in `guide-caption.ts` treat a box that would overlap it the way
one that would cross the banner is treated — put it below the ring instead.
Extend `guide-plate-room.test.ts` with THE HANDOVER's fourth page against the
plate's box.

## The director's MAP view on a phone keeps the desktop two-column frame

- **Found:** 2026-09-13, claude/map-on-a-phone
- **Files:** `tools/director/src/director-phone.css`, `tools/director/src/director-brush.css`, `tools/director/test/stylesheet-order.test.ts`

Seen on a 375-px viewport with playwright (`hasTouch`, `isMobile`) on 13
September 2026: the MAP view shows `section.brush-col` whole, and its
`.column-body` is still the desktop grid `max-content minmax(var(--map-w),
1fr)` with `#brushCol` at its fixed 250 px — so the map gets the ~110 px
that are left, two columns of cells show, and the cell panel, the note and
the row's trash sit off the right edge behind `#mapCol`'s own scroll. The
row verbs themselves are right (the tapped row alone wears the insert lines
and the trash, and the palette is `position: static`). Inside the
`@media (max-width: 700px)` block of `director-phone.css`, give
`main > section.brush-col > .column-body` one track and `#brushCol` `width:
auto`, so the palette stands above the map at the phone's full width and
`#mapCol` scrolls sideways only for the grid. Add a test beside
`stylesheet-order.test.ts` that reads the phone block and finds both rules.

## The built game reaches Google under test, and the frame tests take five minutes

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `tools/frames/capture.ts`, `tools/frames/test/opening.test.ts`, `apps/game/index.html`, `apps/game/src/sign-in.ts`

Since the sign-in landed, loading the built game in a headless Chrome reaches
out to Google — `fonts.googleapis.com`, `accounts.google.com` and
`www.google.com`, 37 refused connections in one run of
`tools/frames/test/opening.test.ts` alone, behind the egress proxy a cloud
session runs under. The file passes: thirteen cases, four minutes forty on this
machine, and `bun run check` is green at about six minutes all told. So this is
not a failure and not a hang — **the first version of this entry said it was
both, on a run cut short at a hundred seconds, and that was wrong.**

What is left is worth doing anyway, and it is cheap: a test about *this*
checkout's frames should not put a single request on the network. One
`page.route` in the capture harness, refusing every host but the preview's own,
and the fonts served out of the bundle. Whoever takes it can settle the open
question with a number rather than a guess — whether those refused connections
are any of the four minutes forty, or whether the file simply costs that much
here. Measure it before and after the route.

## THE LEAK's guide is prose, and what it has to show cannot be asserted

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `packages/content/src/scenes.ts`, `packages/content/src/scenes/the-lance.ts`, `packages/content/src/waves/act-9.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

THE LEAK ships with the three strings and the two circles, which is the sixth
guide to do so (`docs/spec/briefings.md` §3.2). Prose can say *the lobe fills
nothing*; what a pair has to see is the ring round the button **not closing**
under a thumb that stays down, and then the same thumb lifting and a bolt going
out — the two halves that make it a lost weapon rather than a lost trigger.
That is a rehearsal, and it is a short one: one column of three, one held
thumb that never fills, one lift that fires.

The film is a new file in `packages/content/src/scenes/`, named for the wave
the way every other one is, pointed at from the wave's guide and added to
`SCENES`. Follow `scenes/the-lance.ts`, which films
the gesture this one takes away — the two are worth reading side by side, and a film that quotes
its shape will teach the absence faster than one written from nothing. Adding
it means taking THE LEAK out of `STILL_PROSE` and moving §3.2's two counts,
both of which the test names in its failure.

## Unverified at 6ecebe84: THE LEAK watched at tempo: whether a pair can cross the…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bestiary.md`, `docs/spec/briefings.md`, `docs/time-log.md`, `packages/content/src/control-fault.ts`, `packages/content/src/mechanics-wave.ts`, `packages/content/src/waves-demo.ts`

*THE LEAK: the fault that takes the hold, not a button* landed from a session that could not look at it. The commit touched 18 more files. What went unchecked:

- THE LEAK watched at tempo: whether a pair can cross the field and take three bodies at the far wall before they land, with no lance to shorten the column
- THE LEAK's frame cost: its baseline row is UNMEASURED. (The commit's own message says the browser-driven frame tests do not run in this session; that was wrong — they run, they pass, and they take about five minutes. The entry above has the numbers.)

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
