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

## The intro is one scene of two phones and a shout, not six pages and a stepper

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Files:** `packages/content/src/intro.ts`, `packages/render/src/intro-page.ts`, `packages/render/test/intro.test.ts`, `packages/render/test/intro-flash.test.ts`, `apps/game/src/intro.ts`, `apps/game/test/intro.test.ts`, `apps/game/src/settings.ts`

The owner asked for this by name on 14 September 2026, which is the first
exemption under *A look is offered, never replaced* — say so in the commit.

Today the intro is six pages (`INTRO_PAGES`: two, voice, field, panel, boss,
run), each a title, a one-liner, a starburst tag and a figure, drawn on the
canvas by `drawIntroPage` with a nav bar `introHit` answers as `skip`, `back`,
`next` or `page`. Replace it with **one scene and no stepper**: no pages, no
BACK, no NEXT, no page count — one animation that plays through and one press
(or its own end) that closes it.

The scene explains one thing only: **two phones, one game, and the players
talk.** Two people, each holding a phone; the phones show different screens;
the controls are shared between them. One person shouts across, friendly, at
the other; the other listens and then moves a control on their own phone to
match. Two beats of that, in the game's own words: **"SHOOT NOW"** — the
listener presses fire — and **"MOVE THE SHIELD"** — the listener slides the
shield. That is the whole pitch; the field, the panel, the bosses and the
endless run come out (a wave's guide teaches a wave, `HOW TO PLAY` is the
reference — `content/intro.ts`'s own preamble already says the intro is neither).
Keep it on the canvas in the game's parts, as now: the `twoScreens` and
`voice` figures in `intro-page.ts` are the starting material, and the shout
can be the existing speech-bubble treatment rather than a new shape (check
`packages/content/src/silhouettes*.ts` before drawing anything new).

Once shown, the device does not show it again before the menu. That rule is
already there — `INTRO_KEY` / `INTRO_VERSION` and `opensIntro` in
`apps/game/src/intro.ts`, cleared with the other device keys by
`forgetThisDevice` in `settings.ts` — so keep it and **bump `INTRO_VERSION`**
so a device that saw the six pages sees the new scene once. The menu's and the
room screen's *open on demand* stays.

What has to change with it: `INTRO_PAGE_COUNT` and `IntroPage` go or shrink to
the one scene; `introHit` stops answering `back`/`next`/`page`; the `turn`
logic in `apps/game/src/intro.ts` goes; the three intro tests are rewritten to
the one scene (the flash test loses its subject); `settings.ts`'s comment says
"six opening pages" and is reworded. A frame of the scene is drawn in
`packages/render/test/frame.test.ts` like everything else drawn. Prove it with
`bun run check`, and send one PNG of the scene mid-shout.

## HOW TO PLAY leaves the front page, and the tagline says talking is the key

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Files:** `apps/game/src/menu-entries.ts`, `apps/game/src/menu-pages.ts`, `apps/game/src/menu-view.ts`, `apps/game/src/menu.ts`, `apps/game/src/menu.css`, `apps/game/test/menu-front.test.ts`, `apps/game/test/how-to-play.test.ts`, `apps/game/test/menu.test.ts`

Asked for by the owner on 14 September 2026 — the first exemption under *A
look is offered, never replaced*; say so in the commit.

Two changes to the front of the menu:

1. **The HOW TO PLAY row and its page go.** `menuEntries` in
   `menu-entries.ts` lists it second; `menu-pages.ts` builds the page
   (`h2 "HOW TO PLAY"`, the two paragraphs, the seat cards between them —
   `menu.css` around line 745 styles it); `menu-view.ts` opens the intro from
   its top (`menu-view.ts:52`). Remove the row, the page, the `how` member of
   `MenuPage`, its CSS, and the `menu.ts` doc comment that says *the front
   page is four rows*. The intro's own *open on demand* from the menu has to
   survive — put it wherever the front page still has a place for it, or on
   SETTINGS, rather than dropping it with the page. CONTROLS
   (`menu-controls.ts`) is reached from SETTINGS and is not this.

2. **The tagline** under the title (`menu-view.ts:122`) reads
   `TWO PEOPLE · TWO DEVICES · TALKING IS THE CONTROL SCHEME`. The owner wants
   the last part to read something like *talking is the key to success in this
   co-op game* — his words; keep the set-in-caps, middle-dot form the line has
   (`TWO PEOPLE · TWO DEVICES · TALKING IS THE KEY TO WINNING` or as close to
   his sentence as fits one line on a phone). `menu-front.test.ts` holds the
   four rows in order and that WHAT THIS IS sits at the top of HOW TO PLAY;
   `how-to-play.test.ts` holds the page's copy and goes with the page. Update
   the first rather than loosening it.

## The director loses GUIDES, SPEC and DEMOS; TUNING gets a topbar button

- **Found:** 2026-09-14, claude/queued-items-cbcbd8
- **Files:** `tools/director/index.html`, `tools/director/src/documentation-rooms.ts`, `tools/director/src/states-page.ts`, `tools/director/src/guide-sheet.ts`, `tools/director/src/guide-page.ts`, `tools/director/src/guide-gallery.ts`, `tools/director/src/guide-waves.ts`, `tools/director/src/guide-order.ts`, `tools/director/src/spec.ts`, `tools/director/src/docs-api.ts`, `tools/director/src/demo-panel.ts`, `tools/director/src/ship.ts`, `tools/director/src/tuning.ts`, `tools/director/src/main.ts`, `tools/director/test/guide-gallery.test.ts`, `tools/director/test/guide-waves.test.ts`, `tools/director/test/demo-panel.test.ts`, `tools/director/test/sheet.test.ts`

The owner asked for this on 14 September 2026. It is the director, not the
game, so it is not a look and lands as usual.

DOCUMENTATION (`#states`, `states-page.ts`) has nine tabs today, in this
order: STATES, CONTROLS, SHIP, STYLE, WORDINGS, DEMOS, TUNING, GUIDES, SPEC
(`index.html` ~line 297). What he wants:

- **GUIDES goes.** `bindGuidesTab` in `documentation-rooms.ts`, the
  `#mech-guides` page, `guide-sheet.ts`, `guide-page.ts`, `guide-gallery.ts`
  and its test. `guide-waves.ts` and `guide-order.ts` are only reached from
  those — check with `grep -rl` before deleting; `wave-opening.ts` is
  imported by `main.ts` and stays.
- **SPEC goes.** `bindSpecTab`, `#mech-spec`, `spec.ts`. `docs-api.ts`
  (`DOC_ROUTES`, `readSpecFiles`) is what serves `docs/spec/` to it from
  `server.ts` and `build.ts`; if nothing else reads those routes after SPEC is
  gone, they go too, and `build-imports.test.ts` names the file.
- **DEMOS goes.** `#mech-demos`, `demo-panel.ts`, `bindDemoPanel` in
  `main.ts` and the `refreshAll` note beside it, `demo-panel.test.ts`. If a
  demo is reachable by URL (`?sheet=states&inner=demos`) that route goes with
  it.
- **TUNING moves out of DOCUMENTATION to the topbar**: a `menu-item` button of
  its own beside ▣ DOCUMENTATION and ♪ SOUND (`index.html` ~line 48; nine
  buttons today, and `mobile-menu.ts` makes them the phone's menu). It is the
  one page that changes the run rather than describing it, which is the
  reason the HTML comment above `#mech-tuning` already gives for it not
  belonging under a heading that means *reference*. `mountSheet` in
  `session.ts` is how a topbar sheet opens; the pair panel, presets and
  sliders (`tuning.ts`, `main.ts`) move whole.
- **SHIP merges into that TUNING page.** `renderShipSheet` (`ship.ts`) paints
  the ship's own dials — AIM, GUARD, HULL, THE BEAT, the same on every wave —
  read off `SimConfig`; the sliders are tunables of the same `SimConfig`.
  Put them on one page in a sensible order: the sliders first (they act),
  then the ship's cards as the reference for the numbers being moved, with a
  card's fields next to the slider that moves them where one does. The WAVE
  tab's own SHIP card (`renderShip`) is not this and stays.
- **WORDINGS is the first tab and the default** of what is left of
  DOCUMENTATION: STATES, CONTROLS, STYLE, WORDINGS become WORDINGS, STATES,
  CONTROLS, STYLE, with `class="on"` and `renderStates`'s *default tab*
  wiring in `states-page.ts` following it (STATES rendered lazily on its own
  click, the way the other rooms already are).

`sheet.test.ts` and `stylesheet-order.test.ts` know the sheets and the tab
bars; `docs/commands.md` and any `docs/` page that names the GUIDES or SPEC
tab are updated. Prove it with `bun run check` and one PNG of the new TUNING
sheet.

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
