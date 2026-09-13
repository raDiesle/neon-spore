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

## A lost wave stops on a friendly screen: RETRY WAVE or QUIT

- **Found:** 2026-09-13, claude/queue-a-player-signs-in-with-google-or-by-an-email-lin — asked for by the owner
- **Taken:** 2026-09-13, claude/queue-a-lost-wave-stops-on-a-friendly-screen-retry-wav
- **Files:** `packages/sim/src/wave-fail.ts`, `packages/sim/src/config-run.ts`, `packages/sim/src/command-types.ts`, `packages/sim/src/commands.ts`, `apps/game/src/waves.ts`, `packages/render/src/wave-intro.ts`, `packages/render/src/frame-passes.ts`, `apps/game/src/field-input.ts`, `docs/spec/structure.md`
- **Decided:** 2026-09-13, by the owner — either phone's press restarts the wave, first one wins; QUIT on one phone ends the run for both, and the room stays.

The owner's words, 13 September 2026: *when the hull is damaged, immediately
show the damage, then pause the game with a grey overlay saying the round is
lost, and ask to retry the wave or quit — a nice, friendly visual screen,
something about co-op and communication and a friendly message to try again.
Quit goes back to the menu.*

What ships today: a hit fails the wave at once (`failWave`), the breach is
drawn where it happened, the field holds for `waveFailBeats` (2), and then
the host asks for the same wave again by itself (`stepFailHold` → `needWave`
with `retry`, answered in `waves.ts`'s `handle`). There is no screen, no
choice and no way to the menu but the ☰.

What to build. **Sim:** the hold no longer times out into a retry — after
`waveFailBeats` it waits for an answer, and the answer is a command
(`command-types.ts`: `{ kind: "retry" }` and `{ kind: "quit" }`, beside
`restart`), so both devices agree about it in lockstep; `quit` ends the run
(`world.over`, the way the last wave does) and the app takes that to the
menu. `failTick`'s `ASKED` state already exists for the wait.
**Render:** the screen is drawn on the canvas over the held field —
the field greyed, the damage still visible under it as the owner asked,
`WAVE LOST` and `TRY n` the way `wave-intro.ts` writes them, and one short
friendly line about the two of you (the register of the room's greeting and
the balance sheet: *"one of you saw it — say it sooner next time"* is the
kind of thing). Two buttons, RETRY WAVE and QUIT, drawn with the shipped
control-panel look (grown contour, wet socket, gloss — never a flat plate:
`new-buttons-reuse-the-panel-look`), placed where a thumb reaches, with
`field-input.ts` turning the press into the command.
**Look:** this changes what the game draws, and it is the exemption *a look
the owner asked for by name* — say so in the commit. The words go through
`bun run frames` as a PNG for the owner. **Spec:** `structure.md`'s
paragraph on the hit and the retry says the retry is automatic; it is not
any more.

So: one `retry` command, first one wins, the other phone sees the field
reopen — the way the ☰'s pause already works. One `quit` command ends the
run for both; the app puts both phones on the menu with the room kept, and
the room's greeting says who quit.

## Unverified at dcf8328c: THE HANDOVER watched at tempo: whether two beats of war…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `apps/game/src/field-input.ts`, `apps/game/src/input-bindings.ts`, `apps/game/src/input.ts`, `docs/INDEX.md`, `docs/asset-catalogue.md`, `docs/queue.md`, `docs/spec/bestiary.md`, `docs/spec/ideas.md`

*THE HANDOVER: the two panels change screens, and nobody changes seats* landed from a session that could not look at it. The commit touched 28 more files. What went unchecked:

- THE HANDOVER watched at tempo: whether two beats of warning is enough to arrange two pairs of hands, whether the trade reads as exciting rather than as simply losing the wave, and whether a pair can find its own controls again when they come back
- bun run perf on THE HANDOVER: the wave went in with --unmeasured, and a frame that draws the other seat's band over this seat's field is a path nothing has measured

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at f91ad6ab: Two phones actually parting and finding their way back:…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `apps/game/src/link-types.ts`, `apps/game/src/link.ts`, `apps/game/src/main.ts`, `apps/game/src/menu-bindings.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/menu.ts`, `apps/game/src/shell.ts`, `apps/game/test/link-life.test.ts`

*Two phones that have parted start again together, on the wave the room kept* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- Two phones actually parting and finding their way back: the parting has to be provoked, and a cloud session cannot hold two handsets — what is proven is the room in miniflare and the wiring in the app
- bun run relay:check against a running wrangler: the room's restart is covered by apps/server/test/room.test.ts and by nothing else

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 091f7df2: The two people's names on a phone: whether a name at th…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `apps/game/src/menu-link.ts`, `apps/game/src/menu-seats.ts`, `apps/game/src/menu-view.ts`, `apps/game/test/menu-front.test.ts`, `docs/queue.md`, `docs/time-log.md`, `packages/net/src/nickname.ts`, `packages/net/test/nickname.test.ts`

*The two people's names, in the three places the game wrote P1 and P2* landed from a session that could not look at it. The commit touched 11 more files. What went unchecked:

- The two people's names on a phone: whether a name at the siren chip's full width reads as fast as P1 did at a glance, and whether the cluster over the field's top row is affordable while a call is on

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at a3703115: THE HANDOVER on a wave that names its own window, and o…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `docs/queue.md`, `docs/spec/bestiary.md`, `docs/time-log.md`, `packages/content/src/waves/act-8.ts`, `packages/sim/src/handover.ts`, `packages/sim/src/malfunction.ts`, `packages/sim/test/handover.test.ts`, `tools/director/src/fault-fields.ts`

*THE HANDOVER's window is the wave's to name, and it may repeat* landed from a session that could not look at it. The commit touched 2 more files. What went unchecked:

- THE HANDOVER on a wave that names its own window, and one that keeps trading: whether a cycle reads as a fault or as noise, and whether the countdown plate is right as permanent furniture

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 47007bd2: THE HANDOVER's rehearsal watched at tempo: whether the…

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `docs/INDEX.md`, `docs/queue.md`, `docs/spec/bestiary.md`, `docs/time-log.md`, `packages/content/src/scenes.ts`, `packages/content/src/scenes/the-handover.ts`, `packages/content/src/waves/act-8.ts`, `packages/render/src/guide-scene.ts`

*THE HANDOVER's guide is a rehearsal, and a film's page is a device* landed from a session that could not look at it. The commit touched 2 more files. What went unchecked:

- THE HANDOVER's rehearsal watched at tempo: whether the trade reads as the panels changing screens rather than as the film moving to the other player, and whether four pages is enough before the wave

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## `main`'s four column tracks are written out twice, and nothing checks they agree

- **Found:** 2026-09-13, claude/scheduler-tests-two-devices-klxkyt
- **Files:** `tools/director/src/columns.ts`, `tools/director/src/director-columns.css`, `tools/director/test/columns.test.ts`

`OPEN_TRACKS` in `columns.ts` and `main { grid-template-columns: … }` in
`director-columns.css` are the same four track definitions, in two files, and
they have to stay identical: the stylesheet is what a fresh page lays out with
and `relayout()` rewrites the inline copy on every collapse and every drag. So
a track changed in one place is a column that is one width until somebody
collapses something and another width afterwards — which is a bug nothing
fails on and nobody sees until they happen to click a column head.

Widening the map track from 560 to 600 needed both edited by hand today, and
the comment saying why lives in only one of them. `columns.ts` already holds
the ids and `columns.test.ts` already reads the real markup for them, so the
fix is the same shape as `test/map-width.test.ts` next door: parse the four
tracks out of the stylesheet and expect them to equal the `OPEN_TRACKS` values
in DOM order. One test, no code moved.
