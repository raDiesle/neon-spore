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

## PLAY is a list of partners to continue with, and the room is a step-by-step

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Files:** `apps/game/src/menu-entries.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu-seats.ts`, `apps/game/src/menu-rejoin.ts`, `apps/game/src/menu-link.ts`, `apps/game/src/menu.ts`, `apps/game/src/pairing.ts`, `apps/game/src/progress.ts`, `apps/game/src/join.ts`, `apps/game/src/join-words.ts`, `apps/game/src/join-link.ts`, `apps/game/src/join-name.ts`, `apps/game/index.html`, `apps/game/src/link.ts`, `apps/server/src/seat.ts`, `apps/game/test/menu.test.ts`, `apps/game/test/pairing.test.ts`, `apps/game/test/join-words.test.ts`

The owner asked for this on 14 September 2026 — the first exemption under *A
look is offered, never replaced*; say so in the commit. It is one workflow but
several green pieces; land each as it goes green rather than holding the
branch (`docs/git-and-landing.md`). Seat choice reaching the other phone
touches the wire: `.claude/skills/net-change` before that piece.

**Behind PLAY, today** (`playEntries`): CONTINUE, DIFFICULTY, REJOIN, OPEN A
ROOM, and under them three seat cards PILOT / NAVIGATOR / BOTH
(`menu-seats.ts`). **What he wants:**

1. **The PLAY page is first a list of the people this device has played
   with**, one row each, *Continue game with David · wave 7*. `pairing.ts`
   keeps `PARTNERS_KEPT` partner names under `neon-spore.pairs` and nothing
   else; `progress.ts` keeps one `furthest` for the device. The wave number
   needs the progress kept **per partner** — extend what `pairing.ts` stores
   to `{ name, furthest, level }` with `parsePartners` reading the old list
   of strings as furthest 0 — and REJOIN (`menu-rejoin.ts`, `roomForPair`)
   is what the row does. Under the list, one row **NEW GAME** (was OPEN A
   ROOM; `menu-entries.ts:128`). CONTINUE and DIFFICULTY leave this page.
2. **Difficulty is chosen when creating a new game**, on the room screen (see
   5), and for an existing partner behind a **gear icon on the right end of
   that partner's row** — a second press target in the same button, opening
   the three-level list (`levelEntries`) for that pair. The level already
   travels on the wire (`protocol.ts` `t: "level"`).
3. **No seat on the PLAY page.** The seat cards (`menu-seats.ts`) leave it;
   **BOTH is not offered** to a pair at all — one device with both seats stays
   the rig's business behind TESTING, where `testingEntries` already says
   *both seats on this device*.
4. **The TWO DEVICES / room screen becomes steps** (`index.html` `#joinScreen`,
   `join.ts`). Remove SEND LINK (`#joinShare`, `shareRoom` in `join-link.ts`)
   and WHAT THIS IS (`#joinWhat`) — both, everywhere on this screen. Then:
   - **Step 1**: two buttons only, **JOIN** or **CREATE**.
   - **Step 2**: the nickname (`#joinName`, `join-name.ts`), asked once the
     choice is made, skipped when the device already has one.
   - **Step 3, creator**: the code, large, and one sentence: *be on a voice
     call and read this out*. **Step 3, joiner**: the code field
     (`#joinEnter`) and *type in the code you were told*.
   - **Step 4**: waiting for the other phone; then, **on the same screen for
     both**, the room's state: both names, and the creator picks **the seat**
     and **the difficulty** there — the joiner sees the choice made and takes
     the other seat — and each says READY with **the circle hold the guides
     use** (`briefing.ts`, `render/ready-circles.ts`), not a START button
     (`#joinStart`, `startButton` in `join-words.ts`). Who holds which seat is
     today the server's arrival order (`seat.ts`, `link.ts:202`); the
     creator's pick has to reach the other phone, which is one new message or
     a swap — the net-change skill's files move together.
   - The joiner's pages mirror it: JOIN → name → code → the same shared step 4.
5. **The wait for the other player gives up too soon.** Find which timer it
   is before changing one: `SEAT_SILENT_MS` (10 s, `apps/server/src/seat.ts`)
   evicts a seat whose pings stop, which is what a creator's phone does when
   its screen locks while they read the code out; `HOLD_AFTER_MS` (1.2 s,
   `hold.ts`) raises the *gone quiet* card. Reproduce with two browsers
   against a wrangler (`bun run relay:check` has the setup), name the number
   that fired, and raise it for the waiting-for-a-partner state only, with a
   sentence in the constant's comment saying why.

`menu.test.ts` and `menu-front.test.ts` read the rows; `pairing.test.ts`
holds the store's shape; `join-words.test.ts` holds every sentence on the
room screen. Prove with `bun run check`, and for step 4 the two-browser run,
sending one PNG of the shared ready step.

## A tutorial says it is one: the plate is loud, the field is plainly not live

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Taken:** 2026-09-14, claude/queue-a-tutorial-says-it-is-one-the-plate-is-loud-the
- **Files:** `packages/render/src/guide-switch.ts`, `packages/render/src/guide-plate.ts`, `packages/render/src/guide-play.ts`, `packages/render/src/guide-nav.ts`, `apps/game/src/briefing.ts`, `apps/game/src/field-input.ts`, `packages/render/test/guide-plate-room.test.ts`, `packages/render/test/guide-nav.test.ts`, `packages/render/test/frame.test.ts`, `.claude/skills/new-tutorial/SKILL.md`
- **Where:** local

The owner asked for this on 14 September 2026 — the first exemption under *A
look is offered, never replaced*; say so in the commit. **Local only**, his
line: every part of it is judged by an eye on a phone-sized frame, watched at
tempo. Read `.claude/skills/new-tutorial` first; three of its rules are the
ones this touches, and they are corrections he has already made.

Three things, in the order they meet a player:

1. **When a guide is up it must be plain that the picture is not live** —
   that a finger on the field does nothing and the bar is the only way on.
   Today the rehearsal is the real field at full size (the skill's first
   rule: *no card over it*), so the only things saying *this is a tutorial*
   are the small corner plate and the nav bar's slab. `briefing.ts:105`
   already drops every press on a film page; what is missing is the picture
   saying so. Options, in the skill's own terms — nothing may become a panel
   or a scrim over a shrunken picture: dim or desaturate the band's own
   controls while the page plays, since they are the thing a thumb reaches
   for; a lit rim the whole frame inside, in the seat's colour, that the nav
   bar's slab already has; a press on the field answered with a short flash
   at the nav bar rather than silence. Pick one, or two that agree.
2. **The corner plate must be much more prominent.** It is `TUTORIAL` over
   `PLAYER n · SCREEN` at 12 px / 8 px, top left (`guide-switch.ts:68`,
   `BANNER_TOP`), and it was made *smaller* two days ago at his own asking
   because it stood over the body being explained — the comment above
   `TITLE_FONT` quotes him. So not bigger over the field: loud without
   covering. Options: a band the full width of the screen above the HUD's
   rows rather than a lobe in the corner; the same plate at the same size in
   a colour and a pulse nothing else in the frame has; or the plate's body
   stretched across the top with the film's picture starting under it
   (`ViewState.clearTop` already tells a round's header where the plate
   ends — `guide-plate-room.test.ts` holds that no word goes under it).
   Whatever it becomes still flares on a seat switch.
3. **Before the very first tutorial, a welcome page**: *welcome — let's
   start with the tutorial; this is how the stepper works*, showing BACK,
   REPLAY and NEXT and that the field waits. Once per device, so it is the
   app's business and not the sim's (the sim cannot know a device):
   `apps/game/src/intro.ts` is the pattern — a key in `localStorage`, a
   version, `opensIntro`, presses taken by a sheet so nothing under it
   hears them — and `settings.ts`'s `DEVICE_KEYS` gets the new key so
   *forget this device* clears it. It opens over the first page of the first
   guide a device meets, whichever wave that is, and one press closes it.
   Drawn on the canvas in the game's parts, in `packages/render`.

Every frame this changes is drawn again in `frame.test.ts`; the op-count
budgets in `packages/render/test/*-budget.test.ts` are remeasured if a row
moves, with a sentence saying why. Prove with `bun run check` and the guide
watched at tempo on a phone-sized preview; send one PNG of a film page with
the new plate, and one of the welcome page.

## After the intro, a first visit asks for a name and offers a sign-in

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Files:** `apps/game/src/shell.ts`, `apps/game/src/intro.ts`, `apps/game/src/join-name.ts`, `apps/game/src/nickname.ts`, `apps/game/src/menu-sign-in.ts`, `apps/game/src/sign-in.ts`, `apps/game/src/menu-who.ts`, `apps/game/index.html`, `apps/game/test/intro.test.ts`, `apps/server/test/names.test.ts`

The owner asked for this on 14 September 2026 — the first exemption under *A
look is offered, never replaced*; say so in the commit. It follows the intro
entry above in order: the screen it adds opens where the intro closes, so land
that one first, or build this against `Intro.open(after)` as it is today.

**Today:** a device with no name is asked for one on the room screen, the
first time it gets there (`join-name.ts`, `nickname.ts` — *asked once*).
Signing in — Google's popup or an email link, Firebase Auth in the browser
(`sign-in.ts`), verified by the Worker (`apps/server/src/sign-in.ts`) — is a
row under YOUR NAME on SETTINGS (`menu-sign-in.ts`), and `syncName` is what
brings a signed-in person's name onto a new phone. So both halves exist; what
is wrong is *when* they are met: a first-timer sees neither until they are
already opening a room, and the sign-in is on a page nobody opens on the way
to play.

**What he wants:** on the first visit, **right after the intro animation
closes**, one screen that asks for a nickname — the same field, the same
`claimName` and the same wording `join-name.ts` uses, so a name still means
one thing — and, **under it and optional**, *already played? log in to get
your name back*: the Google button and the email field `signInRow` already
builds, followed by `syncName` when it succeeds, which fills the field with
the restored name. One button on, which needs a name; a device that has one
never sees the screen. `shell.ts:243` is where the intro opens on the first
visit (`opensIntro(readIntroSeen(), true)`) and `Intro.open(after)` is the
hook: `after` becomes this screen, and this screen's own `after` is the menu.
Whether it is drawn on the canvas as the intro is or as a DOM sheet like the
room screen is the lane's call; the sign-in buttons are DOM (a popup and an
input), which argues for the sheet. `signInConfigured()` false — a build
with no Firebase project — hides the optional half and leaves the name.

Once this stands, the room screen's own name step (`#joinName`, and step 2 of
the PLAY entry above) is reached only by a device that skipped it — keep it as
the fallback rather than removing it. `menu-who.ts`'s *logged in as* line and
SETTINGS' rows stay as they are: this adds a first meeting, not a second
place to change things. `apps/server/test/names.test.ts` holds the registry's claim; add the rule that
the screen opens once and only with no name stored, the way `intro.test.ts`
holds `opensIntro`. Prove with `bun run check` and send one PNG of the
screen.

## Unverified at 7693db1b: The opening scene watched at tempo on a phone: the shou…

- **Found:** 2026-09-14, claude/queue-tasks-kkqozz
- **Files:** `apps/game/src/intro.ts`, `apps/game/src/settings.ts`, `apps/game/test/intro.test.ts`, `docs/INDEX.md`, `docs/queue.md`, `docs/time-log.md`, `packages/content/src/index.ts`, `packages/content/src/intro.ts`

*The intro is one scene of two phones and a shout, not six pages and a stepper* landed from a session that could not look at it. The commit touched 11 more files. What went unchecked:

- The opening scene watched at tempo on a phone: the shout crossing, the press landing and the shield sliding were corrected off two headless stills, and nobody has seen the scene move.

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at b7c3055e: The three-row front page and SETTINGS' WHAT THIS IS row…

- **Found:** 2026-09-14, claude/queue-tasks-kkqozz
- **Taken:** 2026-09-14, claude/queue-unverified-at-b7c3055e-the-three-row-front-page
- **Files:** `apps/game/src/menu-bindings.ts`, `apps/game/src/menu-entries.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/menu-parts.ts`, `apps/game/src/menu-settings.ts`, `apps/game/src/menu-toggles.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu.css`

*HOW TO PLAY leaves the front page, and the tagline is the owner's own sentence* landed from a session that could not look at it. The commit touched 6 more files. What went unchecked:

- The three-row front page and SETTINGS' WHAT THIS IS row seen on a real phone: the tagline in one line at 360 px and narrower, and the intro opening from that row and putting the menu back

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.

## Unverified at 2c528788: bun run versus:shot through the lifted startDirector —…

- **Found:** 2026-09-14, claude/queue-tasks-kkqozz
- **Files:** `docs/INDEX.md`, `docs/commands.md`, `docs/queue.md`, `docs/time-log.md`, `tools/frames/director-serve.ts`, `tools/frames/shot-flags.ts`, `tools/frames/shot-usage.ts`, `tools/frames/shot.ts`

*`bun run shot --serve` starts the director it photographs, and stops it again* landed from a session that could not look at it. The commit touched 2 more files. What went unchecked:

- bun run versus:shot through the lifted startDirector — no VERSUS slot is open in this tree, so nothing could be photographed to prove the other caller still works

Open each one on a machine that can, and then either take this entry out
with `bun run queue done` or write what you found as an entry of its own.
Nothing here is owed to anybody: it is work nobody has started, which is
what the rest of this file holds.
