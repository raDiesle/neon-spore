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

## THE TORCH's veil is drawn at full strength — `VEIL` has never done anything

- **Found:** 2026-09-09, claude/queue-the-wisp-and-bulb-queen-carry-a-measured-cost-fr
- **Taken:** 2026-09-09, claude/queue-the-torchs-veil-is-drawn-at-full-strength-veil-h
- **Files:** `packages/render/src/torch-fire.ts`,
  `packages/render/src/torch-ball.ts`
- **Asks:** Should the veil over the stone's face be the fifth of a plume the code always said it was, or is what has actually been shipping the right strength?

`fireball` ends with a fourth pass — the nearest plumes again, faintly, over
the rock's face, so the stone reads as being *inside* the fire rather than in
front of it. It sets `ctx.globalAlpha = VEIL` (0.2) and calls `plumes(…,
true)`. **`plumes` then overwrites that alpha rather than multiplying it**, once
per plume, with the plume's own `(near ? 0.34 : 0.24) * heat` — it did so
through `halo`, which assigns `globalAlpha` outright, and the pass that
replaced `halo` with a direct blit kept the behaviour exactly so the speed
change could be proved to draw the same thing.

So the veil has been drawn at the same strength as the main plume pass since
the day it was written, and the near plumes are laid down twice at full value.
The comment beside `VEIL` says what was intended and what it costs to get it
wrong: *"with it any louder, the craters stop being countable, and the craters
are the only readout this body carries."* It is five times louder.

This is not a tuning question and it is not quite a defect either, which is why
it asks rather than states. The picture that has been on the field for the
creature's whole life is the loud one, the owner has looked at THE TORCH and
BULB QUEEN with it, and honouring the constant now would visibly lift the
craters out of the fire on both. Two answers, and the work is three lines
either way:

- **Honour it.** `plumes` takes the caller's alpha as a multiplier — pass a
  `strength` argument defaulting to 1 and multiply, so `ball` is unchanged and
  the veil finally lands at a fifth. The stone gets darker and the craters get
  easier to count, which is what the file says it wanted.
- **Keep what ships.** Delete `VEIL` and the `globalAlpha` line, and say in the
  comment that the veil is the near plumes at their own strength drawn twice.
  A constant that does nothing is worse than no constant, whichever way the
  look goes.

Whichever wins, `packages/render/test/wave-budget.test.ts`'s BULB QUEEN rows
are the proof it changed nothing else, and `bun run frames . --wave 25 --at`
takes the two pictures for the owner to choose between.

## THE CROSSING, THE PULSE and THE BALLOON teach with words and no rehearsal

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Taken:** 2026-09-09, claude/queue-the-crossing-the-pulse-and-the-balloon-teach-wit
- **Files:** `packages/content/src/waves/act-7b.ts`,
  `packages/content/src/scenes.ts`, `packages/content/src/scenes/`

Act 7b's three words-only guides. Give each a `GuideScene` with anchored steps
and short captions, modelled on `scenes/the-rind.ts`, following
`.claude/skills/new-tutorial`. THE PULSE and THE BALLOON are rounds with their
own furniture, so their rehearsals show that furniture rather than the field.

## THE BEATBOX and THE TELL teach with words and no rehearsal

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/content/src/waves/act-8.ts`,
  `packages/content/src/scenes.ts`, `packages/content/src/scenes/`

Act 8's two words-only guides, and the last of the ten. Give each a
`GuideScene` with anchored steps and short captions, modelled on
`scenes/the-rind.ts`, following `.claude/skills/new-tutorial`. THE BEATBOX is a
rhythm round, so its rehearsal has to run at tempo for the pages to mean
anything.

## THE TORCH and THE DART have one look each and no second answer

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/torch-look.ts`,
  `packages/render/src/dart-look.ts`, `tools/versus/candidates/`,
  `tools/director/src/versus-pose.ts`

Open one VERSUS slot per body — `creature:torch` and `creature:dart` — with
three candidates each beside what ships. What the owner asked for on 9
September 2026 is that every enemy read as its own creature and as a solid
thing: depth, interior shading, a light that says which way is up, and motion
that looks grown rather than tweened. `.claude/skills/depth` has the projection
to call rather than re-derive, and a look is assembled from the named parts in
`tools/shape-sheet` rather than invented from nothing. Both bodies already have
a `-look.ts` record to patch. Each slot needs a pose in `versus-pose.ts` in the
same commit, and `bun test` refuses two open slots claiming one field, so run
`bun run versus` first to see what is taken.

## THE WISP and THE VEIL have one look each and no second answer

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/wisp-look.ts`,
  `packages/render/src/veil-look.ts`, `tools/versus/candidates/`,
  `tools/director/src/versus-pose.ts`

One slot per body, `creature:wisp` and `creature:veil`, three candidates each
beside what ships, aimed at depth and at movement that reads as alien and
grown. `.claude/skills/depth` applies, and a look is assembled from the shapes
page rather than invented. THE WISP is already the subject of the open entry
about a measured cost from the adopted looks — read that entry before patching,
because a candidate that makes the tentacles more expensive is a candidate that
has to answer it. Pose in `versus-pose.ts` in the same commit; `bun run versus`
says which fields another open slot has already claimed.

## THE GHOST and THE ECHO have one look each and no second answer

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/ghost-look.ts`,
  `packages/render/src/echo.ts`, `tools/versus/candidates/`,
  `tools/director/src/versus-pose.ts`

One slot per body, three candidates each, aimed at depth and alien motion.
`ghost:tears` is already open on the ghost, so a `creature:ghost` slot must
patch fields that slot does not — `bun run versus` lists them, and `bun test`
refuses an overlap. THE ECHO has no `-look.ts` record at all, so the first job
there is to cut one out of `echo.ts` the way `meteor-look.ts` was cut, which is
also what makes the body tunable at all. `.claude/skills/depth` applies. Pose in
`versus-pose.ts` in the same commit.

## THE GYRE and THE MAGNET have one look each and no second answer

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/gyre-look.ts`,
  `packages/render/src/magnet-look.ts`, `tools/versus/candidates/`,
  `tools/director/src/versus-pose.ts`

One slot per body, `creature:gyre` and `creature:magnet`, three candidates each
beside what ships. Both turn, so both are slots where motion is the thing being
judged and the pair must animate — `docs/versus.md`'s rule about a still is
about surfaces, not about a body whose whole character is how it spins.
`.claude/skills/depth` has what makes a turn read as solid rather than as a
flat shape rotating. Pose in `versus-pose.ts` in the same commit.

## THE WARDEN has one look and no second answer

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/warden-look.ts`,
  `packages/render/src/warden-plates.ts`, `packages/render/src/warden-cilia.ts`,
  `packages/render/src/warden-veins.ts`, `tools/versus/candidates/`

One slot, `creature:warden`, three candidates beside what ships. The warden is
the most built body in the game — plates, cilia and veins are three files of
its own — so it is the one where depth and a natural, unmechanical motion have
the most to work with, and it gets a slot to itself for that reason.
`.claude/skills/depth` applies, and armour on it follows the body's own contour
rather than sitting in a ring around it. Pose in `versus-pose.ts` in the same
commit.

## THE THROB and THE CRAWLER have one look each and no second answer

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/throb-look.ts`,
  `packages/render/src/crawler-look.ts`, `tools/versus/candidates/`,
  `tools/director/src/versus-pose.ts`

One slot per body, three candidates each. The throb turns half a coloured body
and half shell the whole way down, so its slot is about whether the turn reads
as a solid thing rotating — `.claude/skills/depth` is the whole of that
question. The crawler walks, and its slot is about whether the walk looks
grown. Both are motion slots and both sides animate. Pose in `versus-pose.ts`
in the same commit.

## THE QUEEN has one look and no second answer, and no record to patch

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/queen-figure.ts`,
  `packages/render/src/queen-egg.ts`, `packages/render/src/queen-glyph.ts`,
  `tools/versus/candidates/`

The boss of act 4 and the biggest body on any field, drawn from three files
with no `-look.ts` record between them, so a candidate has nothing to patch.
Cut one — the fields `queen-figure.ts` reads for shell, marks and interior —
the way `meteor-look.ts` was cut, then open `creature:queen` with three
candidates on it. Depth matters more here than anywhere: she fills the screen,
and a flat fill at that size is the most visible thing in the game.
`.claude/skills/depth` applies. Pose in `versus-pose.ts` in the same commit.

## THE RIND and THE LID have one look each and no record to patch

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/rind-shed.ts`, `packages/render/src/lid.ts`,
  `packages/render/src/lid-string.ts`, `tools/versus/candidates/`

Neither body has a `-look.ts` record, so the first job is to cut one apiece and
the second is to open `creature:rind` and `creature:lid` with three candidates
each. The rind sheds a layer per hit and is three sizes over its life, so its
candidates are judged on whether the shed reads as a thing losing a skin; the
lid opens, so its candidates are judged on the opening. Both are motion slots.
`.claude/skills/depth` applies. Poses in `versus-pose.ts` in the same commit.

## THE MOUNT and THE RECOIL have one look each and no record to patch

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/recoil.ts`,
  `packages/render/src/recoil-ribs.ts`,
  `packages/render/src/recoil-cage-break.ts`, `tools/versus/candidates/`

Cut a look record for each body, then open `creature:mount` and
`creature:recoil` with three candidates each, aimed at depth and at motion that
reads as grown rather than mechanical. The recoil's cage and ribs are where the
depth is: a cage drawn flat is a stack of lines, and drawn with a light it is a
thing with an inside. `.claude/skills/depth` applies. Poses in `versus-pose.ts`
in the same commit.

## THE CAROM and THE CHUTE have one look each and no record to patch

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/carom.ts`,
  `packages/render/src/carom-window.ts`, `packages/render/src/chute.ts`,
  `packages/render/src/chute-cut.ts`, `tools/versus/candidates/`

Cut a look record for each, then open `creature:carom` and `creature:chute`
with three candidates each. Both bodies are about a path — one bounces, one
drops down a channel — so both slots animate and both are judged on whether the
body looks like a solid thing travelling rather than a sprite being moved.
`.claude/skills/depth` applies. Poses in `versus-pose.ts` in the same commit.

## THE VOLLEY and THE VEER have one look each and no record to patch

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/volley.ts`,
  `packages/render/src/volley-seams.ts`,
  `packages/render/src/volley-cracks.ts`,
  `packages/render/src/veer-clown.ts`, `tools/versus/candidates/`

Cut a look record for each, then open `creature:volley` and `creature:veer`
with three candidates each. The volley already carries seams and cracks, which
is most of a surface a light can act on; the veer arrives from a side wall, so
its candidates are judged as it crosses rather than as it hangs.
`.claude/skills/depth` applies. Poses in `versus-pose.ts` in the same commit.

## THE COIL and THE TETHER have one look each and no record to patch

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/coil.ts`, `packages/render/src/coil-jump.ts`,
  `packages/render/src/tether.ts`, `tools/versus/candidates/`

Cut a look record for each, then open `creature:coil` and `creature:tether`
with three candidates each. Both are long bodies rather than blobs, which is
where a flat fill shows worst — a rope or a coil with no light on it is a
stroke, and with one it is a thing with a near side. `.claude/skills/depth`
applies, and the tether's line to whatever it holds is drawn as a link rather
than as two marks at its ends. Poses in `versus-pose.ts` in the same commit.

## The player's ship has had one hull since the game started

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/hull.ts`,
  `packages/render/src/hull-frame.ts`, `packages/render/src/hull-barrel.ts`,
  `packages/render/src/cannon-maw.ts`, `packages/render/src/shield.ts`,
  `tools/versus/candidates/`

Open `ship:hull-shape` again — it was decided and removed once, and the owner
asked for it back on 9 September 2026, wanting radically different hulls rather
than a reskin: a different silhouette, a different cannon and a different
shield, three of them beside what ships. The constraint that makes this hard is
that the hull is not decoration — the cannon slides along it, the shield sits on
it and every column maps onto it — so a candidate has to keep those attachments
working while changing the shape they hang off. Read `DECIDED.md` on how the
slot left the first time before opening it. Both sides animate, and the pose is
the default: the ship is on every frame.

## The space behind the game has never had a second answer

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/backdrop.ts`,
  `packages/render/src/light-shafts.ts`, `packages/render/src/field.ts`,
  `tools/versus/candidates/`

Everything the two players read sits on one backdrop that has never been argued
with. Open `field:backdrop` with three candidates. The rule that binds this one
hardest is that a decoration is full strength on a menu and much smaller over
the field, which two people are reading at speed — a background that competes
with a body is a defect however handsome it is. So the candidates are judged on
whether the field is easier to read, not on whether the picture is prettier. A
still is enough here unless a candidate moves.

## The band the players actually touch has one look

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/band.ts`,
  `packages/render/src/band-control.ts`, `packages/render/src/band-lobes.ts`,
  `packages/render/src/band-slime.ts`, `packages/render/src/band-seam.ts`,
  `tools/versus/candidates/`

The control band is the half of the screen a player's thumb lives on, and it has
never been offered an alternative. Open `panel:band-skin` with three candidates
on the lobe, the socket and the slime. `panel:ship-join` is already open on
where the band meets the hull, so this slot must not claim its fields —
`bun run versus` says which those are. Any new furniture keeps the grown
contour, the wet socket and the gloss: a flat plate with a stroke around it is
the one thing the panel look is not.

## `versus adopt` refuses fourteen of the fifteen candidates standing

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `tools/versus/decide.ts`, `tools/versus/record-edit.ts`,
  `tools/versus/test/record-edit.test.ts`, `tools/versus/README.md`

`bun run versus adopt` writes a candidate's field values into the shipped
record, and it refuses a field holding a **function**, because `toString` hands
back what the transpiler made rather than how the file spells it. That refusal
is right. What it means in practice was measured the day the command was
written: of the fifteen candidates then open, fourteen patch a whole drawing
function — `paint`, `walls`, `plate`, `pit`, `iris`, `tears` — and exactly one
patches plain numbers. So the command's mechanical half currently reaches one
slot in fifteen, and every other adoption is a lane doing by hand what the
refusal prints as four steps.

Those four steps are themselves the same every time, which is what makes this
drainable rather than a design question. A function-valued candidate keeps its
implementation in `paint.ts` beside its `index.ts`, and taking it is: move that
file into the package the record lives in, rewrite its import specifiers — a
`../../../../../packages/render/src/x.js` becomes `./x.js` and a path into
another package becomes that package's bare specifier — point the record's
field at the moved function, and delete the implementation nothing reads any
more. `byHand` in `decide.ts` already spells all four out and is where the
knowledge is.

Two things have to be decided by the session that does it, and both have an
honest default. The **name** of the moved file: default to the candidate's own
name plus what it draws (`spall` on `crater-look.ts` becomes
`crater-spall.ts`), and let a flag override it. And whether the **old
implementation** goes: it goes when nothing else imports it, which is a `git
grep` the tool can run and refuse on rather than guess. Anything else it cannot
see its way through stays a refusal with the four steps printed, which is what
it does today.

## What a hit on a slick or a bulb looks like is shared with everything else

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/render/src/effects-body.ts`,
  `packages/render/src/sparks.ts`, `packages/render/src/break-look.ts`,
  `packages/render/src/body-interior.ts`, `tools/versus/candidates/`

The owner asked on 9 September 2026 for the slick and the bulb to have very
good graphics **and hit visuals**, because they are on more waves than anything
else. Two thirds of that landed the same day — `creature:slick` and
`creature:bulb` each offer five interiors, and `slick:shape` and `bulb:shape`
each offer five outlines — and the hit did not, because there is nothing
per-body to patch. A shot landing on a slick throws the same sparks and breaks
into the same debris as a shot landing on anything else: `sparks.ts` and
`BREAK_LOOK` are shared by every living body, and `creature:break` is already
open on the second of those.

So this is a seam first and a slot second, and the seam is the one
`body-interior.ts` just cut, one level along: a per-kind record for **what
happens when a shot lands**, reached the way `interiorFor` is reached, with the
shipped behaviour as its default so nothing changes until a candidate patches
it. Three records again — the slick's, the bulb's and every other body's —
because a hit look for the slick must not silently change a dart's.

Then one slot per body with three answers each: what the body does on the beat
it is struck, in its own colour, and what it leaves behind. The rule that binds
it is that an impact is drawn in the colour of the thing that hit, never a
generic damage red, and that the resolution is drawn on the beat the body is
seen to touch rather than the beat the simulation says it arrived.

Wait for `creature:break` to be decided before opening this, or check with
`bun run versus` that the fields do not overlap: `bun test` refuses two open
slots claiming one field, and a body's break and a body's hit are next-door
questions.

## Half the shape collection cannot be offered on a body that ships

- **Found:** 2026-09-09, claude/queue-item-parallel-safety-20f067
- **Files:** `packages/content/src/silhouettes.ts`,
  `packages/content/src/body-path.ts`, `tools/shape-sheet/src/forms/`,
  `tools/versus/variant.ts`

`CLAUDE.md` now says a candidate outline is taken from the unused collection in
`tools/shape-sheet/src/drafts/` rather than invented, and that is right — but
only about half of that collection can be reached from a VERSUS slot today. A
candidate on `SLICK` or `BULB` patches a `CreatureSilhouette`, which is six
numbers: `lobes`, `depth`, `wobble`, `rx`, `ry` and `seed`. Two of the drafts
are plain blobs and can be lifted whole. The rest are **forms** — `cluster` is
five small bodies sharing one skin, `welling` is a torn opening with something
rising in it, `hooked`, `sac`, `glyphed`, `slab` and a dozen more in
`tools/shape-sheet/src/forms/` — and none of those is expressible as six
numbers, so none of them can be offered against a body the game already draws.

The one exception already in the type is `clubs`, the optional `ClubbedRim`
THE THROB carries: present, and `livingPath` in `body-path.ts` *walks* the
contour instead of sampling it by angle. That is the shape of the answer. A
second optional field — a contour the silhouette supplies itself, walked the
way a clubbed rim is walked — would let a draft form be patched onto a shipped
body without every kind growing a branch.

What to decide while doing it: whether the field carries points or a function,
and what a hit test does with it. `creatureRadius` and the thumb's grip ring
both read `rx` and `ry` today, and a form whose reach is not an ellipse needs
those to keep answering something sensible — a bounding ellipse over the walked
contour is the obvious answer and should be computed once rather than per
frame.
