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

## PLAY is a list of partners to continue with, and the room is a step-by-step

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Files:** `apps/game/src/menu-entries.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu-seats.ts`, `apps/game/src/menu-rejoin.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/menu.ts`, `apps/game/src/pairing.ts`, `apps/game/src/progress.ts`, `apps/game/src/join.ts`, `apps/game/src/join-steps.ts`, `apps/game/src/join-step-view.ts`, `apps/game/src/join-words.ts`, `apps/game/src/join-link.ts`, `apps/game/src/join-name.ts`, `apps/game/index.html`, `apps/game/src/link-ask.ts`, `apps/game/src/link-report.ts`, `apps/server/src/room-seat.ts`, `apps/game/test/menu.test.ts`, `apps/game/test/pairing.test.ts`, `apps/game/test/join-words.test.ts`

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
NEW GAME and CONTINUE. **What he wants:**

1. ~~**The PLAY page is first a list of the people this device has played
   with**~~ — landed. ~~DIFFICULTY still sits under the list~~ — left on 15
   September 2026, with step 4. **CONTINUE is still there**, and only a third
   of it has a home: its START answer is the READY hold on the room screen
   now, but its other two — the way back to a field open under the menu, and
   the mend of a parted run, which `shell.ts` brings the menu up for and
   `join-words.ts`'s desync sentence sends people to — have none. Two ways:
   the room screen opens on a parting too and the circles mend it, and a
   menu opened over a running field closes on its own chip, so CONTINUE goes;
   or the row stays under NEW GAME with those two answers and a new name.
   `menu.ts` `carryOn`, `menu-link.ts` `continueLine`, `shell.ts`, and the
   CONTINUE cases in `menu-front.test.ts`.
   - **Asks:** Does CONTINUE leave the PLAY page, the room screen taking the parted run and the chip taking the way back, or stay for those two?
2. ~~**Difficulty is chosen when creating a new game**, on the room screen~~
   — landed on 15 September 2026: three tempi on step 4, the host's to press
   (`join-room-step.ts`), the other phone reading the pick off its welcome.
   ~~And for an existing partner behind a
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
     (`#joinStart`, `startButton` in `join-words.ts`). ~~Who holds which seat is
     today the server's arrival order (`seat.ts`, `link.ts:202`); the
     creator's pick has to reach the other phone, which is one new message or
     a swap — the net-change skill's files move together.~~ **The wire half
     landed on 15 September 2026**: a `seat` message (`protocol.ts`), honoured
     only from the host and before beat zero (`apps/server/src/room-seat.ts`),
     turns one persisted swap bit that every seat lookup reads through
     (`seat.ts` `seatTag`); the welcome carries `host` and is re-sent to both
     on a swap and on a `level`, so the joiner sees the pick made; the client
     has `Link.pickSeat` and `LinkStatus.host` (`link-ask.ts`,
     `link-report.ts`). Proved by `apps/server/test/room-seat.test.ts` and
     `relay:check:all`. **The screen half landed the same day**: the pills are
     the host's presses (`join-room.ts` `mayShape`), the three tempi sit under
     them, and two READY circles in DOM replace `#joinStart` — the own one
     fills under a thumb over `readyHoldMs`, both are drawn on both phones,
     the one waiting on this phone breathes (`join-room-step.ts`,
     `join-room.test.ts`). `tools/frames/room-phones.ts` `holdReady` is the
     press a walk cannot do. Seen on two browsers against a wrangler: the
     swap, the joiner's press ignored, HARD on both, both holds, beat zero at
     120 bpm on both.
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

## The Husk, his way: a fake pod player 2 sees through, deflating when refused

- **Found:** 2026-09-15, claude/bosses-splice-wave-088f34
- **Files:** `packages/sim/src/pods.ts`, `packages/sim/src/pod-types.ts`, `packages/sim/src/wave-fail.ts`, `packages/sim/src/bullet-hit-lure.ts`, `packages/content/src/wave-types.ts`, `packages/render/src/pods.ts`, `packages/render/test/frame.test.ts`, `packages/audio/src/catalogue.ts`, `tools/director/src/brush-cards.ts`, `docs/spec/ideas.md`

The owner redesigned the *Husk* (`ideas.md`, Creatures) on 15 September
2026: it is a lure among pods. A third `PodKind` in `pod-types.ts` that
**hangs at a column and row like a pod and looks like one** — purge or ward
on player 1's screen, taut, its core beating. **Player 2 (the navigator)
sees that it is a fake** — the lie is drawn on that seat only, the way
`bullet-hit-lure.ts` gives the lure's truth to one seat — and has to stop
it being taken: say so before it is shot loose, or have the maw kept shut
when it arrives.

- **Freed like a pod** — a shot knocks it loose and it sinks to the maw.
- **Sucked in, the wave is lost**, as it is for a lure that is hit.
- **Refused — the maw shut when it reaches the ship — it goes the way of a
  balloon let go**: it does not break on the skin, it shrinks and shrinks,
  flying about the hull as the air leaves it, with a funny sound in the
  catalogue (`packages/audio/src/catalogue.ts`), and is gone. No damage.
- Never shot loose, it hangs; it never holds the wave open (`beat.ts`
  counts real pods only) and never blocks its end.

The deflation is the destruction skill's business (`.claude/skills/destruction`)
and the balloon's own fall is the nearest shipped motion — reuse it. Authored
on the wave's `pods` list (`wave-types.ts` `PodEntry`) with the kind it
pretends to be, and a brush in the director. Drawn again in `frame.test.ts`
on both seats and mid-deflation.

Prove it with `bun run check`, a replay test, and the wave watched at tempo
through a husk sucked and a husk refused.

## THE ECHO, his way: the wave sent again unseen, and a count on the boss

- **Found:** 2026-09-16, claude/bulb-queen-crane
- **Files:** `packages/sim/src/boss-entries.ts`, `packages/sim/src/boss-kinds.ts`, `packages/sim/src/boss-state.ts`, `packages/sim/src/boss.ts`, `packages/sim/src/hash-boss.ts`, `packages/sim/src/config-boss.ts`, `packages/sim/src/spawn.ts`, `packages/sim/src/creature-types.ts`, `packages/sim/src/boss-surface.ts`, `packages/content/src/queue-boss.ts`, `packages/content/src/mechanics-bosses.ts`, `packages/render/src/boss-draw.ts`, `packages/render/src/creature-body.ts`, `packages/render/src/body-hit.ts`, `packages/render/src/radar-blip.ts`, `packages/render/test/frame.test.ts`, `tools/director/src/boss.ts`, `tools/shape-sheet/src/drafts/creatures.ts`, `docs/spec/bosses.md`, `docs/spec/ideas.md`, `docs/asset-catalogue.md`

The owner took the *Reverse wave* idea (`ideas.md`, Mechanics) on 16 September
2026 and asked for it built **his way**, which replaces the from-below design
written there. It is a **boss wave**, and the boss is a memory test.

**The wave falls as usual**, the arrivals its author wrote, both seats seeing
everything. Then, at a **defined point in wave time** (a beat authored on the
entry, like the queen's cycle), **the arrivals since the wave's start — or
since the last echo ended — are sent again**: the same kinds, the same order,
the same columns and colours, at the same spacing, offset to now. **Every one
of them is invisible, on both screens.** The pair has to remember what came,
and defend the columns from memory. The wave's own arrivals pause while the
echo plays and take up again after it, so a wave alternates seen stretch,
unseen echo, seen stretch, unseen echo, until the queue is spent; the last
echo repeats the last stretch. An echoed body that reaches the hull unshielded
is a hit like any other (`hull-damage.ts`, `wave-fail.ts`), nothing new.

**A body is seen at the moment it is beaten, and only then.** A correct shot,
a deflection, a destruction — whichever the kind's own rule is — plays the
kind's own hit look (`body-hit.ts`, `hitFor`) and the shield's flash exactly
where the invisible body was, so the pair learns it was right by seeing the
kill and never by seeing the body. THE GHOST's `ghostRelease` is the shipped
precedent for a body shown to a seat only as it dies.

**The boss is at the top middle**, where the queen stands, and it does two
things: it **shows the number of bodies still to come** in the running echo,
and it **moves each time a new echoed body enters the field** — a pulse, a
twitch, a swallow — so the pair knows *something* has arrived and *how many*
are left, and nothing about where. The radar strip stays blank for an echoed
body (`radar-blip.ts`): a blip would give the column away and there would be
nothing to remember. The count is read as a shape on the body, not as a digit
(`beatbox-count.ts` is the precedent).

Build it as a boss that does not fill the wave, like THE VANE and THE WELL
(`bossFillsWave` false): a `EchoEntry` beside `WellEntry` with the beat the
first echo starts on, `"echo"` **appended** to `BOSS_KINDS`, an `EchoState`
counting the stretch's start, the echo's cursor and the bodies left, hashed
in `hash-boss.ts`. **The echo is derived, never appended to `world.queue`**:
the queue is the wave's script and is outside the hash on purpose
(`hash.ts`), so `spawnArrivals` reads the echoed entry back off the queue by
index — the entry the stretch sent *n* beats after its start — and stamps the
body `unseen: true` (`creature-types.ts`); `creature-body.ts` draws nothing
for an unseen body and `body-hit.ts` plays its hit whole. No physics of its
own — the echoed body is the same kind on the same movement and resolution
paths. The body at the top is **the draft `creatures.ts` already offers for
*Reverse wave*** (`suggests: "Reverse wave"`) or one combined with it,
never a shape the game draws. A boss panel in the director with the echo
beat on it; the sentence in `mechanics-bosses.ts`; `bosses.md` §11.13; the
BOSSES page then shows it built.

**Then the idea goes**: the *Reverse wave* entry in `ideas.md` comes out as
built, the draft's `suggests` is retired the way a shipped one is, and the
sentence in `asset-catalogue.md` that counts it among the three still waiting
is corrected. The name is a working one — THE ECHO — and the owner may
rename it in `bosses.md` when he sees it.

Prove it with `bun run check`, a replay test that fingerprints two echoes,
`frame.test.ts` with an unseen body mid-fall and one at its kill on both
seats, and the wave watched at tempo through one full stretch and its echo.

## THE BALLOON's wave tells the pair three things the game stopped doing

- **Found:** 2026-09-15, claude/queued-tasks-51d8f9
- **Files:** `packages/content/src/waves/act-7b.ts`, `packages/content/src/scenes/`, `packages/render/test/briefing.test.ts`

The owner ruled on 14 September 2026 that a balloon **never goes downwards**
and that the top of the field is a body the pair has to answer rather than a
bill on the hull (`sim/balloon.ts` `topOut`, `sim/balloon-rub.ts`). The wave's
own guide was written before that and still says all three of the things that
went:

- *"Reach the top and one goes off and the hull pays for it"* — it turns into a
  torch there now and the hull pays nothing.
- *"one climbs on, one sinks"* — both halves climb, and the lane between them
  and the carom each takes at its own wall is what makes them two problems.
- *"a half that reaches the ship goes off like the top"* — nothing sinks, so
  nothing reaches the ship.

Player 2's half then names the sinking half again — *"or down into you"* — so
the seat with no reason to watch the bottom of the field is told to. This is
the one screen in the game whose whole job is telling two people what a body
does, and it is describing a creature that has not existed for a day.

Rewriting it is three sentences in `guide.both` and one clause in `guide.p2`,
and the scene beside it is worth reading for the same drift. **`both` and each
half are capped at 220 characters** (`briefing.test.ts`), and the present
`both` is already at the cap, so this is a rewrite rather than an edit. Prove
it with `bun run check` and one frame of the opening.

## THE FLIP, his way: a malfunction that mirrors the field for one seat

- **Found:** 2026-09-16, claude/queued-tasks-51d8f9
- **Files:** `packages/sim/src/malfunction.ts`, `packages/sim/src/fault-placed.ts`, `packages/sim/src/fault-surface.ts`, `packages/sim/src/config-malfunction.ts`, `packages/sim/src/hash.ts`, `packages/content/src/wave-types.ts`, `packages/content/src/mechanics-table.ts`, `packages/render/src/malfunction-look.ts`, `packages/render/src/layout.ts`, `packages/render/src/touch.ts`, `packages/render/src/creatures.ts`, `tools/director/src/fault-fields.ts`, `tools/director/src/paint-fault.ts`, `tools/director/src/brushes.ts`, `docs/spec/ideas.md`, `docs/spec/transfers.md`

The owner asked for **The Flip** (`ideas.md`, and `transfers.md` §The Flip)
built on 16 September 2026, and his shape is not the one written there. It is
**a malfunction**, not a mechanic of its own: a sixth `MalfunctionKind`
alongside `cannon`, `shield`, `steer`, `codex` and `leech`, painted with the
malfunction brush the director already has (`paint-fault.ts`), carrying the
common malfunction graphics every fault wears — that blue — over the ship and
the game area, so a pair that has met one fault recognises this one as the
same family before reading a word.

**What it does.** Bodies on the field are *drawn* in one column and *are* in
its mirror about the vertical middle of the play area: a meteor drawn falling
in column 0 is really falling in the last column, at the same row and the same
speed. Nothing else changes — not the fall, not the beat, not the colour. So
the shield goes to the **far right** for a body the seat can see on the left,
and every column said out loud has to be turned around by whoever is holding
the mirrored screen.

**Which seat sees it is authored**, like `sees` on THE MINE
(`packages/sim/src/mine.ts`, `SpawnEntry.sees`): the wave says whether the
pilot's screen is flipped, the navigator's, or both. A flip on both is the
wave it already was and the director should say so rather than allow it
quietly (`docs/spec/bosses.md` line 1348 makes exactly this argument about
THE MIRROR).

**Where the flip lives decides whether it is a mechanic or a bug**, and
`ideas.md` already holds the answer THE VANE learned the hard way: *a flip the
simulation never hears about has nothing to hash, nothing to replay and
nothing the director can show*. So the fold is in the **simulation's** placed
fault (`fault-placed.ts`, in `hashWorld`), and render reads it — not a
transform quietly applied in `layout.ts` on one device.

**Four things must be visible**, and they are the whole of the owner's ask:

- **A help text explaining the mirrored screen**, in the guide, in those words.
- **A drawn mirror line down the middle of the field**, so the reflection is
  something the picture states rather than something the pair infers.
- **The moment the truth and the picture meet**: when a body is shielded,
  destroyed, or takes the hull, that is shown *in the real column*, so the
  pair sees where it actually was.
- **The other seat is told its partner's picture is turned.** The seat whose
  screen did not flip needs to know it is now the odd one out — the condition
  `transfers.md` puts on the whole idea.

Unworked out, for whoever takes it: whether the flip holds for the whole wave
(every other malfunction does, and the owner removed the brake on 6 September
2026) or runs on `fault-clock.ts`'s beats; and whether the cannon and shield
strips are mirrored with the field or left alone — mirroring the strip as well
turns the finger the same way as the eye and may cancel the whole mechanic
out.

Build it through the malfunction paths that exist rather than beside them:
a kind in `MALFUNCTION_KINDS`, a brush in the director, a field in
`hashWorld`, a wave of its own with a three-part guide, a replay test, and
`frame.test.ts` on both seats — flipped and not — in one picture. Prove it
with `bun run check` and the wave watched at tempo through a shielded body, a
destroyed one and a hull hit. Then take the idea out of `ideas.md` and update
`transfers.md`'s table row, which still says "new — see **The Flip**".

## A rehearsal cannot show a finger on a bare tile, so THE MINE has no film

- **Found:** 2026-09-16, claude/queued-tasks-51d8f9
- **Files:** `packages/content/src/scene-script.ts`, `packages/content/src/scene-types.ts`, `packages/content/src/scenes/`, `packages/render/src/guide-hand.ts`, `packages/content/test/scenes-prose.test.ts`, `docs/spec/briefings.md`

Every act a film can carry is a thumb on something the panel draws: a control
press (`controlPress`), a hold, a drag, a turn, a shake, or `tap` — which is
THE BEATBOX's and is fixed to the navigator and named by column alone. There
is no act that says **a finger on a square of the field**, which is the whole
of THE MINE's answer (`packages/sim/src/mine.ts`, the `tapTile` command), so
that wave shipped with the three strings and the two circles and no rehearsal
at all. It is the only guided wave in the game that cannot have one rather
than merely not having one yet, and `scenes-prose.test.ts` and §3.2 of
`briefings.md` both say so in those words today.

What it needs is one more act shape: a **tile** act carrying `col`, `row` and
the **seat** — unlike `tap`, whose seat is fixed, because which seat is blind
is the wave's on this creature (`SpawnEntry.sees`) — producing a `tapTile`
command; and the ghost hand drawn at the tile's centre rather than at a
control's, which is the part `guide-hand.ts` has no case for. The film itself
is then the ordinary five acts: the body standing on one screen, the other
screen empty, the count coming down, the hand landing on the square, the
contour closing.

Worth doing only if the creature survives being played. Do it with the wave
in front of you, not before. When it lands, take THE MINE out of
`STILL_PROSE`, off §3.2's list and out of the paragraph under it — all three
are named in the test's own failure message.

## ship-notes.ts is one line under its limit, and it grows with every creature

- **Found:** 2026-09-16, claude/queued-tasks-51d8f9
- **Files:** `tools/director/src/ship-notes.ts`, `tools/director/src/ship-groups.ts`, `tools/director/src/ship-fields.ts`

THE MOULT's note took this file to **249 lines of its 250**, so the next
creature that wants a paragraph in the director's ship panel fails
`packages/sim/test/limits.test.ts` before it has said anything. It is legal
today and it has no headroom at all, which is the one state worth writing down:
whoever adds the next note will otherwise spend the first half of their lane
doing this refactor with an unrelated diff already open.

The seam the file already has is its own `GROUP_NOTE` spread: `HIDDEN_NOTES`
and `MOULT_NOTE` are each a const built somewhere and folded in at the bottom,
so the cut is to take a group of notes out whole rather than to split the file
down the middle. Nothing here is decided by the shape of the code — every note
is a paragraph about one group of fields — so the only question is which
grouping reads best next door, and any of them is an improvement on none.

Do it with the next creature that needs a note, not before: a refactor of prose
with no new prose to place is a diff nobody can review against anything.

## One new fact, four tables, found one red test at a time

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Taken:** 2026-09-16, claude/queue-one-new-fact-four-tables-found-one-red-test-at-a
- **Files:** `tools/director/src/concepts.ts`, `tools/director/src/backlog.ts`, `tools/director/src/concept-art.ts`, `tools/director/src/scene-world.ts`, `tools/director/test/concepts.test.ts`, `tools/director/test/backlog.test.ts`, `tools/director/test/concept-art.test.ts`, `tools/director/test/scenes.test.ts`, `docs/asset-catalogue.md`

A lane on 16 September lost twenty minutes to **four tests going red in
sequence, each one a different copy of the same fact** — the group set in
`concepts.test.ts`, the name in `backlog.test.ts`, the shape join in
`concept-art.test.ts`, the scene join in `scenes.test.ts`, and then the draft
count in `docs/asset-catalogue.md`. Six lanes and 165 friction minutes in
`docs/time-log.md` have this shape. None of the four checks is wrong; what
costs the minutes is that the fifth place is only ever learned from the fourth
red run, one process start at a time.

The fix is not to merge the tests, which check different things about the same
name. It is to make the *list of places* a thing the tree states once: one
module naming every table a new concept has to enter, the four tests reading
their row from it, and one test that fails with **all** the missing places
named in a single message rather than the first one. The draft count in
`docs/asset-catalogue.md` is the odd row — it is prose, and `doc-drift.test.ts`
is where a number in prose is already held to the tree.

The seam to check first, because it may make this much smaller: whether the
four joins are really four lists or one list read four ways. If it is one, this
is a module and four imports; if it is four, it is the aggregating test and
nothing else.

Provable with `bun run check`: add a concept to a fixture with one row missing
and expect the message to name every place it is missing from.

## The ledger estimates its minutes; the trunk knows them

- **Found:** 2026-09-16, claude/task-performance-optimization-f1bfqf
- **Files:** `tools/land/run.ts`, `tools/land/notes.ts`, `tools/land/note-commit.ts`, `docs/time-log.md`, `docs/lane-speed.md`, `tools/land/test/`

`docs/time-log.md`'s five rows are what a session estimates about itself,
rounded to five, and they do not agree with the trunk: 3 385 logged minutes on
15 September against an 860-minute span of that day's own commits, 2 395
against 969 on the 14th, 1 790 against 634 on the 16th. It is not parallel
sessions — six of 204 work landings since 13 September landed more than ten
minutes after they were written, and the author dates run strictly forward. The
ratio is the estimate, and it is between two and a half and four.

The shares survive that (the tail is still the tail), the minutes do not, and
**every speed question this repository will ask next is asked in minutes** —
whether a lane split in two is shorter than the sitting it replaces, whether
the line-ceiling hook took its 375 minutes off, whether fast mode is worth
turning on. Each of those is currently settled by the same instrument that is
out by a factor of three.

`bun run land` is already holding both ends of the measurement at the moment it
writes the release note: the branch's first commit and the fast-forward. So it
can stamp one line into the entry — the elapsed, in minutes, from the lane's
first commit to the trunk moving — and the session's own rows stay exactly as
they are beside it, which is the point: an estimate next to a measurement is
how the estimate gets better rather than replaced.

Two things to decide, neither of which needs the owner. Whether the stamp goes
in the entry the session writes (simplest: `land` appends the line to the last
`##` block) or in a table of its own that nothing hand-written can drift from —
prefer the entry, because a reader of one lane wants both accounts in one
place. And whether `land` should also **prefill the table's skeleton** — the
heading, the date, the branch and the five empty rows — which is the other half
of the same minute: a lane writes the same eleven lines of scaffolding every
time, and only the cells are its own.

Provable with `bun run check`: `tools/land`'s own tests already exercise the
note-writing path against a temporary repository, so the stamp is a case
beside them, and a rounding rule is a pure function with a table.

## `bun run shot --open` and `--tab` together wait thirty seconds and fail

- **Found:** 2026-09-16, claude/task-queue-work-5f529c
- **Files:** `tools/frames/shot-state.ts`, `tools/frames/shot-usage.ts`, `tools/frames/test/shot-flags.test.ts`

`--tab` opens NOT BUILT YET itself — `reachState` presses the header button by
role before it presses the tab — so a caller who also passes
`--open "◇ NOT BUILT YET"`, which is the flag's own documented job, presses that
button a second time with the sheet already covering it. Playwright then retries
for thirty seconds and fails with
*`<span class="sub">…</span>` from `<div class="on" id="backlog">` intercepts
pointer events*, which names neither flag and reads as a broken page rather than
as two flags that mean the same press. The contents-menu lane lost a shot to it
twice before dropping `--open`.

Two fixes, and they are not exclusive: `reachState` can skip its own
NOT BUILT YET press when `open` already named that sheet, and `readShotFlags`
can refuse the pair outright with a sentence saying `--tab` opens it. The
second is the cheaper one to prove — `shot-flags.test.ts` is pure and already
holds the flag reader — and the first is what makes the pair simply work.

## The build-stamp scan walks the whole tree inside a 5-second test

- **Found:** 2026-09-16, claude/task-queue-work-5f529c
- **Files:** `tools/test/build-stamp.test.ts`

*is read through BUILD\_STAMP, never through the raw identifier* reads every
`.ts` file in the repository — `sources(root)` recurses from the root and
`readFileSync`s each one — and `bun run check` runs it while twelve other
shards are reading the same disk. On 16 September 2026 it timed out at 5001 ms
and turned a green lane red; run alone the same file passes in 475 ms. Its
own doc comment already records one environment-dependent failure of the same
walk, a `.wrangler` directory a bundler was deleting under it.

The scan is worth keeping — it is the only thing holding `__BUILD_DATE__` to
one reader — so the fix is to make it cost less rather than to widen the
timeout: `Glob("**/*.ts").scanSync` the way `packages/sim/test/limits.test.ts`
does, and grep the file list rather than reading every file whole. If that is
still near the limit under thirteen shards, the test may name its own with
`it(…, { timeout })`, which is the smaller change and the one to keep in
reserve.
