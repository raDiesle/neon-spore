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

## Unverified at bc3a3b7d: A partner's row pressed, and a wave written against a…

- **Found:** 2026-09-15, claude/queue-tasks-kkqozz
- **Files:** `apps/game/src/menu.ts`, `apps/game/src/menu-entries.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/pairing.ts`, `apps/game/src/partners.ts`, `apps/game/src/waves.ts`

*The PLAY page is a list of the people this device has played with* landed from
a session that could not put two phones in a room. The page itself was
photographed — `bun run menu-shot out.png --page PLAY --partners "David:7"` — so
what the rows say is seen. What went unchecked:

- A partner's row pressed, and the two phones landing in the same room: `rejoinWith` reads the index off the list it was drawn from and `roomForPair` derives the code, and neither has been pressed in a browser (apps/game/src/menu.ts, apps/game/src/menu-entries.ts)
- A wave written against the person in the other seat: `reachedWith` takes the partner from the last status the room screen painted, and nothing has run a two-device wave to see the row afterwards say a number it did not say before (apps/game/src/pairing.ts, apps/game/src/waves.ts)

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## PLAY is a list of partners to continue with, and the room is a step-by-step

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Taken:** 2026-09-15, claude/queue-play-is-a-list-of-partners-to-continue-with-and
- **Files:** `apps/game/src/menu-entries.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu-seats.ts`, `apps/game/src/menu-rejoin.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/menu.ts`, `apps/game/src/pairing.ts`, `apps/game/src/progress.ts`, `apps/game/src/join.ts`, `apps/game/src/join-steps.ts`, `apps/game/src/join-step-view.ts`, `apps/game/src/join-words.ts`, `apps/game/src/join-link.ts`, `apps/game/src/join-name.ts`, `apps/game/index.html`, `apps/game/src/link.ts`, `apps/server/src/seat.ts`, `apps/game/test/menu.test.ts`, `apps/game/test/pairing.test.ts`, `apps/game/test/join-words.test.ts`

The owner asked for this on 14 September 2026 — the first exemption under *A
look is offered, never replaced*; say so in the commit. It is one workflow but
several green pieces; land each as it goes green rather than holding the
branch (`docs/git-and-landing.md`). Seat choice reaching the other phone
touches the wire: `.claude/skills/net-change` before that piece.

**The stepping itself — step 4's first four pages — landed on 15 September
2026.** The room screen is `join-steps.ts`'s four steps and each asks one
thing: JOIN or CREATE, the name, the code, the room. SEND LINK and WHAT THIS
IS are gone, markup and bindings both, and `shareRoom`/`roomLink` with them —
a link *into* a room still opens one, because somebody was sent one yesterday.
`bun run menu-shot out.png --page "PLAY > NEW GAME > CREATE" --element
"#joinScreen"` photographs the creator's code page; the trail walks off the
menu onto the screen a press opened now (`tools/frames/menu-press.ts`), which
it could not before. **What is left of 4 is the shared room page itself** —
the creator's seat and difficulty reaching the other phone, and the two
READY circle holds in place of START — and that is the half that wants two
browsers against a wrangler.

**Steps 1, 3 and the gear half of 2 landed on 15 September 2026.** The PLAY
page is the list, NEW GAME is under it, REJOIN is gone, a partner is a record
of a name, the wave the two of them reached and the tempo they played it at
(`apps/game/src/partners.ts`), the seat cards are off the page, and every
partner's row carries a gear that opens the three tempi *for that pair*
(`bun run menu-shot out.png --page "PLAY > ⚙" --partners "Ada:6"` photographs
it). **Step 4 is what is left**, plus step 2's other half — the difficulty offered
while a game is being *created* — which has no home until 4 builds the room
screen. It wants a session that can put two devices in one room against a
wrangler, and **a cloud session is now one**: `bun run relay:check:all` starts
the relay and stops it again, and 5 below was found and fixed that way on 15
September 2026 (`docs/cloud-session.md`).

**What the gear turned out to need, for whoever works 4.** A tempo is not a
thing a device holds. The room keeps its own level in Durable Object storage
(`room-tally.ts`) and hands it to both phones on `welcome`, and `onStart` uses
*that* and not `b.level()` — so a choice made on the PLAY page, where there is
no socket, is a wish until somebody carries it in. `link.join(room, wanted)`
is where it is carried: the tempo travels with the join and is sent once, on
the welcome, and only when it differs from what the room holds
(`apps/game/test/pair-tempo.test.ts`). The creator's pick on the room screen
is the same shape and should use the same door rather than a second one.

**Behind PLAY, today** (`playEntries`): the partners, each with a gear, then
NEW GAME, CONTINUE and DIFFICULTY. **What he wants:**

1. ~~**The PLAY page is first a list of the people this device has played
   with**~~ — landed. What is left of it: CONTINUE and DIFFICULTY still sit
   under the list, and they leave it when 4 below gives them their homes.
2. **Difficulty is chosen when creating a new game**, on the room screen (see
   5) — *not done, and waiting on 4*. ~~And for an existing partner behind a
   gear icon on the right end of that partner's row, opening the three-level
   list for that pair~~ — landed: the gear is a second press target beside the
   row's own button (`menu-rows.ts`'s `aside`; a button inside a button is not
   a thing), the page it opens says TEMPO WITH ADA and marks that pair's level,
   and the answer goes to their record (`menu-tempo.ts`, `pairing.ts`).
3. ~~**No seat on the PLAY page.**~~ — landed. The cards (`menu-seats.ts`) are
   drawn under the rig's rows now, which is where the one person who can press
   them is; a pair reads its seat off the room screen's own pills
   (`join-words.ts` `seatWord`), and BOTH was never offered to a pair at all.
4. **The TWO DEVICES / room screen becomes steps** (`index.html` `#joinScreen`,
   `join.ts`). ~~Remove SEND LINK (`#joinShare`, `shareRoom` in
   `join-link.ts`) and WHAT THIS IS (`#joinWhat`) — both, everywhere on this
   screen.~~ — done. Then:
   - ~~**Step 1**: two buttons only, **JOIN** or **CREATE**.~~ — done.
   - ~~**Step 2**: the nickname (`#joinName`, `join-name.ts`), asked once the
     choice is made, skipped when the device already has one.~~ — done, and it
     is asked over the top of a room rather than before one: the device that
     reaches that field walked in on a link and never passed the menu.
   - ~~**Step 3, creator**: the code, large, and one sentence: *be on a voice
     call and read this out*. **Step 3, joiner**: the code field
     (`#joinEnter`) and *type in the code you were told*.~~ — done. The two
     modes leave step 3 at different moments and that is the design: a joiner
     leaves on the join, a creator on the second seat arriving.
   - **Step 4** — *the page is there, and what is on it is not*. Waiting for
     the other phone; then, **on the same screen for
     both**, the room's state: both names, and the creator picks **the seat**
     and **the difficulty** there — the joiner sees the choice made and takes
     the other seat — and each says READY with **the circle hold the guides
     use** (`briefing.ts`, `render/ready-circles.ts`), not a START button
     (`#joinStart`, `startButton` in `join-words.ts`). Who holds which seat is
     today the server's arrival order (`seat.ts`, `link.ts:202`); the
     creator's pick has to reach the other phone, which is one new message or
     a swap — the net-change skill's files move together.
   - The joiner's pages mirror it: JOIN → name → code → the same shared step 4.
5. ~~**The wait for the other player gives up too soon.**~~ — landed on 15
   September 2026, and **it was neither of the two timers this entry named**.
   Reproduced against a live relay: `SEAT_SILENT_MS` never fires, because the
   room only evicts while it is computing its seats and a silent seat with
   nobody else pinging is never looked at — a device was left silent for 24
   seconds and kept its seat. `HOLD_AFTER_MS` cannot fire either: `troubleOf`
   answers only for `lost` and `stalled`, and a phone waiting for a partner is
   `waiting`. What fired is `RECONNECT_TRIES` (6) at `RECONNECT_MS` (900) in
   `link-socket.ts` — the client gives up **5.4 seconds** after its line goes,
   and abandons a seat the room holds for ten. It is patient until a welcome
   says the room is full now (`WAITING_TRIES`, 108 s).

`menu.test.ts` and `menu-front.test.ts` read the rows; `pairing.test.ts`
holds the store's shape; `join-words.test.ts` holds every sentence on the
room screen. Prove with `bun run check`, and for step 4 the two-browser run,
sending one PNG of the shared ready step.

## Unverified at 7693db1b: The opening scene watched at tempo on a phone: the shou…

- **Found:** 2026-09-14, claude/queue-tasks-kkqozz
- **Files:** `apps/game/src/intro.ts`, `apps/game/src/settings.ts`, `apps/game/test/intro.test.ts`, `docs/INDEX.md`, `docs/queue.md`, `docs/time-log.md`, `packages/content/src/index.ts`, `packages/content/src/intro.ts`

*The intro is one scene of two phones and a shout, not six pages and a stepper* landed from a session that could not look at it. The commit touched 11 more files. What went unchecked:

- The opening scene watched at tempo on a phone: the shout crossing, the press landing and the shield sliding were corrected off two headless stills, and nobody has seen the scene move.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## The tagline wraps on a 360 px phone, which is most Android phones

- **Found:** 2026-09-14, claude/queue-tasks-kkqozz
- **Files:** `apps/game/src/menu-view.ts`, `apps/game/src/menu.css`, `apps/game/test/menu-front.test.ts`
- **Asks:** Loosen the letter-spacing, drop the type a point, cut the sentence shorter, or let it wrap on purpose?

`Unverified at b7c3055e` asked for the tagline seen in one line *at 360 px and
narrower*. It is not. `TWO PEOPLE · TWO DEVICES · TALKING IS THE KEY` is 325 px
of text, and the box it sits in is the viewport less 36 px — so it is one line
at 390 px and at 375 px, and two lines at 360 px and below. The comment above
it in `menu-view.ts:127` says *this one is 325 px and is the first version of
it a phone reads in one line*, which is true of the owner's phone and of no
Android in the top ten. Measured off the preview at six widths.

The string's width does not change with the viewport, so one line at a width
is one number against another:

| | text | one line at |
|---|---|---|
| as it is today, 0.22em / 10px | 325 px | 390 px and 375 px only |
| letter-spacing 0.20em | 316 px | 352 px and wider |
| letter-spacing 0.18em | 307 px | 343 px and wider |
| letter-spacing 0.14em | 289 px | 325 px and wider |
| font-size 9px | 293 px | 329 px and wider |
| font-size 8px | 260 px | 296 px and wider |
| `… · TALKING IS KEY` | 296 px | 332 px and wider |
| `TWO PEOPLE · TWO DEVICES · TALK` | 227 px | 263 px and wider |

**What the answer picks between.** 360 px is the width that matters — it is
every Galaxy and every Pixel — and *any* row above the last two clears it.
320 px, the oldest iPhone SE and the narrowest thing still sold, is cleared
only by 8px type or by a sentence cut to a third fewer characters. So:

1. **`letter-spacing: 0.18em`** in `menu.css:238`. One number, nothing else
   moves, 360 px fixed with 17 px to spare and 320 px still wrapping. The
   spacing is what makes the line read as a strapline rather than a sentence,
   and 0.18em is a fifth less of it.
2. **`font-size: 9px`** in `menu.css:237`. Same shape, one point smaller, and
   the same 320 px left over. 9 px letter-spaced caps at `--ink-faint` is at
   the floor of what `menu-contrast.test.ts` is watching.
3. **A shorter sentence.** His words, so his call: `TALKING IS KEY` for 360 px,
   or something nearer `TWO PEOPLE · TWO DEVICES · TALK` to clear 320 px as
   well. The string is in `menu-view.ts:127` and quoted in
   `menu-front.test.ts:74`.
4. **Let it wrap, deliberately.** `text-wrap: balance` and a line-height, so
   two lines look meant rather than broken. Nothing shrinks and nothing is
   cut, and the front page grows by about 12 px under the wordmark.

A fifth — scaling the type with the viewport — is not on the list: a strapline
whose size changes by phone is a different size on every device the pair is
holding, which is the one thing a two-device game should not do.

Not done here because it is a look on the front page, and the sentence is the
owner's own. Whichever he picks is one line of CSS or one string, plus the
quoted copy in `menu-front.test.ts`.
## A malfunction is a pencil on the map, with a beat it starts and one it ends

- **Found:** 2026-09-14, claude/queue-backlog-604107
- **Files:** `packages/sim/src/malfunction.ts`, `packages/sim/src/world.ts`, `packages/sim/src/wave-start.ts`, `packages/sim/src/handover.ts`, `packages/sim/src/hash.ts`, `packages/content/src/wave-types.ts`, `packages/content/src/waves/*.ts`, `packages/content/src/mechanics.ts`, `tools/director/src/brushes.ts`, `tools/director/src/rail.ts`, `tools/director/src/rail-marks.ts`, `tools/director/src/rail-filter.ts`, `tools/director/src/fault-fields.ts`, `tools/director/src/serialize.ts`, `tools/director/src/stage-world.ts`
- **Where:** local

The owner asked for this on 14 September 2026, mid-turn, in three sentences.
It is director work with a change to the wave's shape under it, so it lands as
one lane in two commits — the shape first, the director on top — and the
director's authoring is updated in the same pass as the content
(`director-sync-on-content-changes`).

1. **Every malfunction is a pencil placed on the map, not a field on the
   wave.** Today `Wave.malfunction` is one fault for the whole wave, read once
   at `startWave` into `world.malfunction`, and only THE HANDOVER carries
   numbers (`at`, `beats`, `every`). His line: *all malfunctions are not
   attached to the wave, but a pencil to be placed on the map, so I can define
   when it enters the wave (what beat row) and when it ends.* So a fault
   becomes an entry on a beat row like a creature is — `{ kind, at, beats }`,
   any of the six kinds, more than one per wave, on the map beside the
   creatures — and the wave-wide field goes. In `sim` that means the fault is
   *active* for a window of beats (`handover.ts` already has the window; the
   other five need one), `faultSwallows` and `stepMalfunction` read the
   window, and `hashWorld` still covers whatever state the window adds. In
   `content` every wave that carries a fault today (`grep malfunction
   packages/content/src/waves`) is rewritten as a placed entry with the same
   effect — THE HANDOVER's `at`/`beats`/`every` become the entry's own rows —
   and `mechanicsInWave` finds the fault the new way. The director gets one
   brush per fault kind on the palette (`brushes.ts`), the fault's fields
   (`fault-fields.ts`) move under the map to the placed entry like a rock's
   speed does, and `serialize.ts` writes the entry the way the waves are
   written.
2. **An icon beside a wave that carries any malfunction**, in the rail, as
   one more span in `rail-marks.ts` — the file says a fourth mark is one more
   block there. Its title names the kinds.
3. **A compact filter of the wave list by its symbols.** The rail's marks are
   boss, panel, guide and (now) malfunction; he wants to narrow the list to
   waves carrying any of a chosen set — *either or is enough*, so the chosen
   symbols are ORed with each other, and ANDed with whatever is typed. The
   WAVES column is 210px and `rail-filter.ts` explains why it has one text
   field and nothing beside it, so the compact form is the marks themselves
   made pressable in a single row above or inside the field — press ♛ and the
   list is the boss waves; press ⎈ too and it is both. Nothing stored.

Prove it with `bun run check`, the director's own tests under
`tools/director/test`, and the director opened on a wave with a placed fault
— the map shows the pencil on its rows, the rail shows the icon, the filter
narrows to it.

## THE LEECH: a malfunction harpooned onto the cannon, kept off by moving it

- **Found:** 2026-09-14, claude/queue-backlog-604107
- **Files:** `packages/sim/src/cling.ts`, `packages/sim/src/config-cling.ts`, `packages/sim/src/events-cling.ts`, `packages/render/src/cling.ts`, `packages/render/src/cling-fuse.ts`, `packages/content/src/creatures-cling.ts`, `packages/sim/src/malfunction.ts`, `packages/sim/src/config-malfunction.ts`, `packages/sim/src/fault-clock.ts`, `packages/sim/src/magnet.ts`, `packages/sim/src/bullet-hit.ts`, `packages/sim/src/events.ts`, `packages/sim/src/hash.ts`, `packages/content/src/mechanics.ts`, `packages/render/src/malfunction-look.ts`, `packages/render/src/fault-emitter.ts`, `packages/render/src/siren.ts`, `packages/render/src/siren-seats.ts`, `packages/render/src/radar-blip.ts`, `packages/render/src/codex.ts`, `packages/render/src/magnet-bounce.ts`, `packages/render/src/deflect.ts`, `packages/render/src/hull-mood.ts`, `packages/render/src/cannon-maw.ts`, `tools/director/src/brushes.ts`, `tools/director/src/fault-fields.ts`
- **Where:** local

The owner asked for it on 14 September 2026, mid-turn, by name — so it is a
look he asked for and not one to offer — and it is one more kind under the
malfunction brush the entry above this one makes, so it comes after that
entry lands and is placed on the map the same way (`{ kind: "leech", at,
beats }`). THE LEECH ships today as a *creature* — `sim/cling.ts`, one lane, a
fuse counted in beats, drawn in `render/cling.ts` — and this entry moves that
body under the malfunction brush and gives it the behaviour below; what the
creature had that the malfunction drops (the fall down a lane, `limpetShakeMoves`)
goes on the NOT BUILT YET → MECHANICS page rather than being deleted. Its
words, in the order he said them:

1. **It is a malfunction**, the same alien at the top middle as the other
   kinds (`fault-emitter.ts`, `malfunction-look.ts`), and it fires the leech
   *very fast, like a harpoon*, at the cannon, where it sticks. The siren
   sounds and shows as it always does (`siren.ts`); under the siren it says
   **MOVE CANNON!** — player two's screen, because player two is the one who
   has to tell player one to keep the cannon moving.
2. **On the cannon it is marked the way a codex is**: its code written above
   it (`codex.ts`), the radar square round it (`radar-blip.ts`,
   `caption-anchor.ts`), and MOVE CANNON! above the square.
3. **The cannon must keep moving.** A cannon that has not moved for one and a
   half beats (`SimConfig`, named, not a literal) loses the round: the leech
   damages the cannon and the hull — drawn on the part hit *and* across the
   hull in the leech's colour, the way every ship damage is drawn.
4. **It is invulnerable, and visibly so.** A shot at it does not go through:
   it is deflected the way the plate under a magnet turns a shot away
   (`magnet-bounce.ts`, `deflect.ts`, `sim/magnet.ts`), with that look.
5. **A timer above it says how long it stays.** When the timer runs out it is
   *reeled in like a fishing line* back to the alien — the leech leaves, the
   effect ends, the malfunction is over.
6. **The cannon turns a dangerous colour while it is stuck**: each time the
   move-timer restarts after a move, the cannon's glow starts from the
   beginning and grows toward a colour that says *about to explode*; a move
   resets the glow to the start (`hull-mood.ts`, `cannon-maw.ts`; painted from
   the seat's own `HullSkin`, never `PALETTE`).

Prove it with `bun run check`, a wave carrying a placed leech drawn in
`packages/render/test/frame.test.ts` at the moment it sticks, the moment a
shot deflects off it, and the frame the round is lost; the director's brush
and fields under `tools/director/test`; and one PNG of the cannon under the
leech with the square, the code and MOVE CANNON! on it.

## THE LIMPET: THE LEECH's entry again, for the shield instead of the cannon

- **Found:** 2026-09-14, claude/queue-backlog-604107
- **Files:** `packages/sim/src/cling.ts`, `packages/sim/src/config-cling.ts`, `packages/sim/src/events-cling.ts`, `packages/sim/src/malfunction.ts`, `packages/sim/src/config-malfunction.ts`, `packages/render/src/cling.ts`, `packages/render/src/cling-fuse.ts`, `packages/render/src/malfunction-look.ts`, `packages/render/src/siren.ts`, `packages/render/src/siren-seats.ts`, `packages/render/src/radar-blip.ts`, `packages/render/src/magnet-bounce.ts`, `packages/render/src/hull-mood.ts`, `packages/content/src/creatures-cling.ts`, `tools/director/src/brushes.ts`, `tools/director/src/fault-fields.ts`
- **Where:** local

The owner added it on 14 September 2026, in one sentence: *the same described
applies to the limpet, just that here the shield must move and not the
cannon; all other requirements and behaviours should be the same as for the
leech.* So everything in THE LEECH's six points holds here with the control
swapped: a malfunction kind `limpet` under the same brush, the same alien at
the top middle, harpooned onto the **shield's plate**, the siren with **MOVE
SHIELD!** under it on **player one's** screen (player one is the seat that
has to tell player two), the code and the radar square on the plate with MOVE
SHIELD! above, the round lost when the plate has not moved for the same one
and a half beats (the same `SimConfig` field, not a second literal), the
shot deflected off it with the magnet's look, the timer above and the reel
back to the alien when it runs out, and the plate turning the dangerous
colour whose glow restarts on every move — painted from player two's own
`HullSkin`, so it is amber and never purple.

Done in the same lane as THE LEECH, because `cling.ts` already says the two
differ only in which column is read, and a malfunction written twice would be
two places for that rule to drift. Proved the same way, with the limpet's
own frame in `frame.test.ts` at the moment it sticks and one PNG of the
plate under it.

## THE BALLOON enters at a wall, never sinks, and is a torch at the top

- **Found:** 2026-09-14, claude/queue-backlog-604107
- **Files:** `packages/sim/src/balloon.ts`, `packages/sim/src/balloon-rub.ts`, `packages/sim/src/balloon-clock.ts`, `packages/sim/src/spawn.ts`, `packages/sim/src/spawn-fields.ts`, `packages/sim/src/entries.ts`, `packages/sim/src/config-balloon.ts`, `packages/sim/src/coil.ts`, `packages/sim/src/events-balloon.ts`, `packages/sim/src/hash-creature-late.ts`, `packages/render/src/balloon.ts`, `packages/render/src/balloon-alive.ts`, `packages/render/src/effects-spark-handed.ts`, `packages/render/src/sprite-burst.ts`, `packages/content/src/balloon-shape.ts`, `packages/content/src/balloon-parts.ts`, `tools/director/src/brush-cards.ts`
- **Where:** local

The owner asked for it on 14 September 2026, mid-turn, for a local session
only — never a cloud one — as four sentences about the one body that does not
come down. Each is a look or a rule he asked for by name, so it lands on the
field and the commit says so.

1. **The burst is a balloon coming apart.** Today `balloonBurst` and
   `balloonPop` are a 26px spark in the pod's amber
   (`effects-spark-handed.ts`). He wants it *realistic, like a balloon
   becoming many pieces blowing up*: the skin torn into shreds that fly out
   and fall, built from the balloon's own contour (`content/balloon-shape.ts`,
   `balloon-parts.ts`) and the shapes page, not invented — a baked strip in
   `sprite-burst.ts` if the pieces are too many to draw live, and either way
   drawn again in `frame.test.ts` at its loudest frame.
2. **At the top it is a torch, at once.** `stepBalloon` reaching row 0 calls
   `burstBalloon`, which charges the hull with `breachUnscarred`. Instead the
   body **turns into a `torch` there and drops immediately** — the handoff
   `coil.ts` already makes when a dome opens (a torch at thirteen rows a beat),
   called rather than written again — so the top of the field stops being a
   silent bill and starts being a body the pair has to answer. The hull damage
   at the top goes; what a torch does when it lands is what it always does.
3. **A balloon never goes downwards.** `balloonSinks` and the sinking half of a
   split (`balloon-rub.ts`, the vertical split whose lower half goes to the
   ship's row) go: both halves of a split rise. `hashWorld` loses the field;
   `hash-creature-late.ts` says so.
4. **It does not start at the hull.** `balloonEntryRow` puts it one row above
   the ship, out of nothing. Instead it **enters from the left or right wall,
   one or two tiles above the shield** (a `SimConfig` field for the rows, the
   `Rng` for which of the two and which wall), announced by an arrow at that
   wall the way every sideways arrival is; it **glides in to somewhere around
   the middle**, the column drawn from the `Rng` inside a middle band named in
   config, and from there **rises slowly in the climb it already has**
   (`balloonClimbs`, the carom at the walls). The swell (`balloonSwellBeats`)
   happens on the glide or at its end, whichever reads better at tempo. The
   director's balloon card and `entries.ts`'s `rise` follow.

Prove it with `bun run check`, every wave that carries a balloon (`grep
balloon packages/content/src/waves`) watched at tempo for the entry, the
glide and a split, one frame of the burst and one of the torch leaving the
top in `frame.test.ts`, and two PNGs: the burst mid-flight and the torch on
its first row down.

## Two arrows at the top of the WAVE column open the previous and the next wave

- **Found:** 2026-09-14, claude/queue-backlog-604107
- **Files:** `tools/director/index.html`, `tools/director/src/rail.ts`, `tools/director/src/keys.ts`, `tools/director/src/state.ts`, `tools/director/test/rail-list.test.ts`, `tools/director/test/keys.test.ts`
- **Where:** local

The owner asked for it on 14 September 2026, mid-turn: *on the wave details
right to the wave list, I want arrows at the top to navigate to the next or
previous row to open.* Opening a wave today is one press on its row in the
WAVES column; reading through the waves in order is a press per wave, back in
the list each time, with the editor's own column scrolled to wherever it was.

So the WAVE column (`data-column="editor"`, the `#tabs` bar with its one
WAVE button) gets **two arrows at its top, ‹ and ›**, that open the wave
before and the wave after the one open — `store.index ∓ 1`, then the same
`onSelect()` a row press makes in `rail.ts`, so the list, the map and the
stage follow exactly as they do for a press. The first wave's ‹ and the last
wave's › are disabled rather than wrapping; each arrow's title says which
wave it opens by number and name. They step through the **whole list, not
the filtered one** — a filter narrows what is shown, and the row it lands on
is kept visible in the list by the rule already there. If `keys.ts` has no
key for this yet, the same two go on `[` and `]` in the same commit (one
place decides the step; the arrows and the keys both call it). No new
element look: the arrows are buttons in the bar the tab already stands in.

Prove it with `bun run check`, a test beside `rail-list.test.ts` that presses
each arrow through the fake DOM and reads `store.index` and the disabled
state at both ends, and one PNG of the director's WAVE column head with the
arrows.

## A shot never goes through a body: what it cannot break, it hits and marks

- **Found:** 2026-09-14, claude/queue-backlog-604107
- **Files:** `packages/sim/src/shot-reach.ts`, `packages/sim/src/bullet-hit.ts`, `packages/sim/src/gum.ts`, `packages/sim/src/cling.ts`, `packages/sim/src/weight.ts`, `packages/sim/src/cairn.ts`, `packages/sim/src/gyre.ts`, `packages/sim/src/balloon.ts`, `packages/sim/src/magnet.ts`, `packages/sim/src/events.ts`, `packages/render/src/effects-spark.ts`, `packages/render/src/effects-spark-handed.ts`, `packages/render/src/magnet-bounce.ts`, `packages/render/src/deflect.ts`, `packages/render/src/crater-look.ts`, `packages/render/src/crater-geom.ts`, `packages/content/src/mechanics.ts`, `docs/spec/graphics.md`
- **Where:** local

The owner's rule, 14 September 2026, mid-turn: *shots with the cannon,
generally speaking, should never go through enemies, but should hit with no
effect if the body cannot be destroyed with the cannon's colour. Reflect, like
the magnet, or mark it, like the meteor, or something else — whatever is
suitable. Shots should not go through the gum, the leech, the limpet.*

`shot-reach.ts` is the one place a shot's reach is decided, and today it
`continue`s past five kinds by name — THE GYRE's hub, THE GUM, THE LIMPET and
THE LEECH, THE WEIGHT, THE CAIRN — each with a paragraph saying a bolt goes
past it *to whatever is above*. That paragraph is the thing he is
overruling: **a body a shot cannot answer still stops the shot.** So:

1. **In `sim`, the skips go.** Every creature in a column stops the sweep at
   its box; `resolve` in `bullet-hit.ts` gets a branch per kind that says
   *hit, no effect*, the way a rock already does — `holes` and a `hole`
   event for a body a crater suits, a `deflect` event for one a bounce suits,
   `balloonStruck`'s shape for the rest. One rule, called: a shot that meets
   a body it cannot break is spent on it. THE GYRE's hub is the exception to
   argue in the entry's own commit — the tile at the middle of a wheel is
   empty and a wall there is five columns wide — and if it stays a pass-
   through the comment says it is the *only* one and why.
2. **In `render`, each refused hit is drawn as what it is**, per body: THE
   GUM and the two clingers deflect the bolt the way the plate under a
   magnet does (`magnet-bounce.ts`, `deflect.ts` — the same look, called),
   THE CAIRN takes a crater like the rocks it is made of (`crater-look.ts`),
   THE WEIGHT whatever reads best of the two, decided by drawing both in
   `frame.test.ts` and keeping one. Nothing invented: every mark is one the
   game already draws for a refused shot.
3. **`docs/spec/graphics.md`'s rule for a rock** — *the shot leaves a crater
   and nothing else, the rule made visible* — is widened to every body a shot
   cannot break, and `mechanics.ts`'s sentence for each of the five says the
   shot stops on it rather than passes it.

The frame test draws each of the five taking a shot. A wave watched at
tempo checks that a bolt fired up a lane under a gum, a leech, a limpet, a
weight and a cairn is seen to stop on it and never to reach the body above.

## THE LEAK is a rung of the standard ladder, not a malfunction

- **Found:** 2026-09-14, claude/gum-swipe
- **Files:** `packages/content/src/control-sets-table.ts`, `packages/content/src/control-sets.ts`, `packages/content/src/control-sets-waves.ts`, `packages/content/src/waves/act-9.ts`, `packages/content/src/waves/*.ts`, `packages/content/src/mechanics-wave.ts`, `packages/content/src/wave-types.ts`, `packages/sim/src/malfunction.ts`, `packages/sim/src/lance.ts`, `packages/sim/src/wave-start.ts`, `packages/sim/src/world.ts`, `packages/sim/src/hash.ts`, `packages/render/src/fault-beam-ends.ts`, `packages/render/src/lance.ts`, `tools/director/src/fault-fields.ts`, `packages/content/test/waves.test.ts`, `docs/spec/systems.md`
- **Asks:** Is the beamless full panel STANDARD 5 (the ladder has four rungs today, so it is the next one) or STANDARD 6 (a fifth rung sits between the plate and the maw, and what does it add)?

The owner's instruction, 14 September 2026, mid-turn, and it belongs beside
*A malfunction is a pencil on the map* above: **`leak` is not a malfunction
but a modifier of STANDARD.** In his words: standard 1–5 have no beam shot; a
new STANDARD 6 has the maw and everything else *except* the lance; and
STANDARD itself has everything, the lance included. So the hold that fills
the cannon lobe becomes a thing a rung of the ladder holds back, the way the
ladder already holds back a button (`ControlSet.reduces`), and stops being a
fault an emitter hangs over one wave.

What that is in the tree:

1. **A set says whether the hold fills anything.** The lance is not a
   `Control` — it rides the two colour buttons as a hold
   (`control-sets-table.ts`'s preamble) — so `reduces` cannot hold it back by
   name. One field on `ControlSet`, `lance: false` on every numbered rung and
   absent (true) on `default`, read by the same three questions the ladder
   already answers. The new rung is the full panel with that one field, and
   `firstOnPanel` gives the first wave played on it a guide as it does every
   rung (`control-sets-waves.ts`, `waves.test.ts`'s panel test).
2. **The sim is told, the way it is told the fault today.** `startWave` takes
   the fact beside `malfunction` — the host reads it off
   `controlSetForWave(wave)` where it already reads the panel
   (`apps/game/src/field-input.ts`) — into one `World` field, in `hashWorld`;
   `lanceLeaks(world)` (`lance.ts`) reads that field instead of
   `world.malfunction?.kind === "leak"`, and nothing else in `sim` changes: the
   fill, the ring and the shaft are already asked through it.
3. **`leak` leaves `MALFUNCTION_KINDS`** — `malfunction.ts`, the director's
   fault brush and its note (`fault-fields.ts`), the emitter's both-colour
   beam (`fault-beam-ends.ts`), and `mechanics-wave.ts`'s `leakFault` row —
   and THE LEAK (`waves/act-9.ts`) is pinned to the new rung with its guide
   rewritten: no thing hangs over the field any more, the wave is simply
   played on a panel whose hold fills nothing, and its sentence still holds.
4. **Every wave between the ladder's top and THE LANCE** (`waves/act-3b.ts`,
   where the hold is introduced) plays on the default panel today and so has
   the lance before it is taught; each is pinned to the new rung, and every
   wave after THE LANCE that should stay beamless is the owner's call wave by
   wave — the entry lands with the ones before THE LANCE moved and the rest
   untouched.

Prove it with `bun run check`: the panel tests in `packages/content/test`,
`lance.test.ts` in `sim` on a world started with the field off, and the
director opened on THE LEAK showing the rung on its panel row and no fault.

## The Bash tool refuses a long quoted heredoc: a long edit script goes in by path

- **Found:** 2026-09-14, claude/gum-swipe
- **Files:** `.claude/skills/lane/SKILL.md`, `docs/working-with-claude.md`
- **Where:** local

A command that failed and was worked around. THE GUM's director pass was one
Python edit script of about 190 lines, sent through the Bash tool as
`cat > director.py <<'PY' ... PY` the way every shorter one has been. The
tool answered *unexpected EOF while looking for matching `''* before a line
of it ran — the shell inside the tool had lost the quote pairing somewhere
in the script's own `'''` triple-quoted blocks — and the same script written
to the scratchpad with the Write tool and run by path went through
unchanged. A shorter script with the same quoting had gone through the
heredoc a minute earlier, so the size of the block is the trigger, not its
contents: the tool reads the heredoc before the shell does, and at some
length its reading disagrees with the shell's.

`.claude/skills/lane/SKILL.md` already carries one rule of this kind — a
commit message with a dash or a quote goes through `git commit -F <file>`,
because `-m "$(cat <<'EOF' ...)"` hangs the tool — and this belongs on the
sentence after it: **an edit script longer than a screen is written to the
scratchpad with the Write tool and run by path, never sent through a
heredoc**, with what the failure looks like, so the next lane recognises it
on sight instead of retrying with the quotes changed. A paragraph in
`docs/working-with-claude.md`'s *who answered?* section says why — the
message names the shell, and the shell was never given the script.

Prove it with `bun run check` (the skill and the document are read by
nothing that runs) and by reading the two edits once.

## Unverified at a80777a5: The sign-in half of the first meeting actually signing…

- **Found:** 2026-09-15, claude/queue-tasks-kkqozz
- **Files:** `apps/game/src/game.css`, `apps/game/src/hello.ts`, `apps/game/src/join-name.ts`, `apps/game/src/menu.css`, `apps/game/src/nickname.ts`, `apps/game/src/shell.ts`, `apps/game/test/hello.test.ts`, `apps/game/test/intro.test.ts`

*After the intro, a first visit is asked what it is called* landed from a session that could not look at it. The commit touched 5 more files. What went unchecked:

- The sign-in half of the first meeting actually signing somebody in: LOG IN WITH GOOGLE opens a popup and the email link needs a mailbox, so syncName filling the field with a restored name was read off the code and never seen happen (apps/game/src/hello.ts)
- The first meeting on a real phone with the keyboard up: the field is deliberately not focused on arrival so the optional half is not covered, and nobody has seen what the sheet does when a thumb does focus it (apps/game/src/hello.ts, apps/game/src/menu.css)

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 1b4ca9f8: Two phones in one room seeing the gear's tempo arrive:…

- **Found:** 2026-09-15, claude/queue-tasks-kkqozz
- **Files:** `apps/game/src/confirm.ts`, `apps/game/src/link-types.ts`, `apps/game/src/link.ts`, `apps/game/src/menu-bindings.ts`, `apps/game/src/menu-entries.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/menu-rows.ts`

*The tempo is on the pair's row, behind a gear* landed from a session that could not look at it. The commit touched 13 more files. What went unchecked:

- Two phones in one room seeing the gear's tempo arrive: link.join carries it and sends it on the welcome, proved only against a socket the test speaks through

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at a2d84afd: Two phones in one room stepping through the new room sc…

- **Found:** 2026-09-15, claude/queue-tasks-kkqozz
- **Files:** `apps/game/index.html`, `apps/game/src/game.css`, `apps/game/src/join-link.ts`, `apps/game/src/join-name.ts`, `apps/game/src/join-step-view.ts`, `apps/game/src/join-steps.ts`, `apps/game/src/join.ts`, `apps/game/src/shell.ts`

*The room screen is four steps, and a step asks one thing* landed from a session that could not look at it. The commit touched 7 more files. What went unchecked:

- Two phones in one room stepping through the new room screen: a creator on step 3 seeing the page turn when the joiner arrives, and the joiner's own JOIN → name → code → room walk

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
