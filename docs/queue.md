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
- **Taken:** 2026-09-09, claude/queue-docs-party-games-md-links-to-nine-screenshots-it
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

## THE GHOST's camouflage is laid out in picture space

- **Found:** 2026-09-09, claude/enemy-graphics-animations-versus-3mjjv7
- **Files:** `packages/render/src/ghost.ts`, `packages/render/src/ghost-glitch.ts`,
  `tools/versus/candidates/`, `tools/director/src/poses-casing.ts`

`slabs(id, time, rage)` hands back horizontal bands with a `shift`, and
`drawTears` fills each one as a rectangle across the body at `-GHOST.rx + shift
* GHOST.rx`. Every mark on this creature is therefore decided by how far down
the picture it is, which is the exact failure `docs/style-guide.md`'s Depth
section names: a body's silhouette may be posed, and anything *on* its surface
is placed. A ghost's whole subject is a surface coming apart, and it comes apart
on a flat plane.

There is no record to patch, so the work is a seam first — `ghost-look.ts` of
`magnet-look.ts`'s kind, holding `tears` and nothing else, with the shipped
`drawTears` moved through it and not one pixel changed — and then a candidate
beside it. The candidate worth writing: the bands are strips of *latitude* on a
turning body, so a tear that slides off one limb comes back at the other, and
the fragments over the far side are drawn dim behind the interior gradient
rather than clipped away. `packages/content/src/surface.ts` is the arithmetic
and `limbX` is the call for an outline that spans more than one tangent plane.
The pose is the part to be careful about: this body is drawn on player 2's
screen only, so a pose has to hand the pair a seat that can see it — `WISP ·
STANDING` in `poses-surface.ts` is the worked example of a one-seat pose.

Watch the temper: `ghostRage` already drives how far a band shifts, so a turn
must not become a second reading of the same number. The candidate's own file
has to say which of the two the pair is being asked about.

## THE SHELL's plating is a flat lid over a round body

- **Found:** 2026-09-09, claude/enemy-graphics-animations-versus-3mjjv7
- **Files:** `packages/render/src/shell-plate.ts`, `packages/render/src/shell-draw.ts`,
  `tools/versus/candidates/`

`drawPlate` cuts the body's own contour in half, fills it in `PLATE` grey and
lights three splits with the colour underneath. It is a good picture of the
*rule* — armour over a body, opening where it cracks — and it is the one hard
surface in the game with no highlight, no bevel and no thickness at all, sitting
directly over a body that has both. Beside `warden:plates` / `bevel`, which this
lane wrote, the shell is the obvious second subject: same question, smaller
body, and a plate that is *shaped* to a contour rather than swept round a rim.

The seam is a `shell-look.ts` holding `plate` and `bareRim` — both, because the
grey edge a bared half keeps is the same material and a vote that moved one and
not the other would be a body wearing two answers. Note before starting that
`shell-plate.ts` is 224 lines and the ceiling is ~250, so the candidate's paint
does not go in it and the record does not either.

The candidate to write: the plate as a slab with an inner wall, its face shaded
by its own normal against `KEY` — a plate over the left half faces up and left
and takes nearly all of the light, the right half almost none — and a specular
that stays put while the body sways underneath, which is the cue that says the
armour is a hard thing and the body is not. `key-light.ts`'s `litRound` is the
shipped light for a round body and it is cached; do not write a second one.
`BODIES · FOUR KINDS AT ONCE` is the wrong pose (no shell on it) — a shell pose
belongs in `poses-casing.ts` beside the three that are there, and it wants a
body with one half chipped, because that state is half the picture.

## The eye THE LID and THE WARDEN share is a disc

- **Found:** 2026-09-09, claude/enemy-graphics-animations-versus-3mjjv7
- **Files:** `packages/render/src/eye.ts`, `packages/render/src/eye-iris.ts`,
  `packages/render/src/eye-lens.ts`, `tools/versus/candidates/`

One eye is drawn on two bodies — `lid.ts` and `warden-eye.ts` both call
`drawEyeFluid`, `drawEyeFringe` and `drawEyeLens` — and it is the roundest thing
in the game drawn with no depth on it at all: the iris is concentric with the
socket and every mark on it is at a fixed screen offset, so an eye that is
looking somewhere is an eye whose *whole picture* has been translated.

A real eye is the textbook case for `surface.ts`: the iris is a disc placed at a
longitude and latitude on a ball, foreshortened by `scale(sx, sy)` as it turns
toward the edge, with the wet film's catchlight staying exactly where the light
is while the iris travels under it. That contrast — a mark that moves and a
highlight that does not — is the cheapest solid-looking thing there is, and this
is one record on two of the biggest bodies in the game.

Work it as a seam (`eye-look.ts`, holding `iris`) plus one candidate, and open
the slot as `eye:iris` rather than as a creature's, because both bodies get it
at once — say so in the candidate's own file, since a vote that improved a lid
and spoiled a warden is a vote nobody can cast. `WARDEN · ARMOURED` in
`poses-casing.ts` already puts one on screen; a lid pose has to be found or
written. Check `warden-eye.ts`'s `HATCH` gating first: the lens is drawn only
past an openness, and a candidate that ignored that would draw an iris through a
shut door.

## No interlude round has ever been offered a look

- **Found:** 2026-09-09, claude/enemy-graphics-animations-versus-3mjjv7
- **Files:** `packages/render/src/maze-draw.ts`, `packages/render/src/pinball-table.ts`,
  `packages/render/src/snake-draw.ts`, `tools/director/src/versus-pose.ts`

Every VERSUS slot that has ever been opened is a creature, the ship, a control
or a boss's armour — the field. The interludes are whole screens with their own
walls, tables, ribbons and pieces, they are what a pair looks at for a minute at
a time with nothing falling, and not one of them has ever had a second answer
offered to anything it draws. That is not because they are finished; it is
because `versus-pose.ts` maps a slot to a *field* pose and nobody has built one
that hands the pair a round instead.

The first half is the work: a pose that builds a world already inside an
interlude, so the pair draws the round rather than the field. `poses-mechanics.ts`
is the closest existing shape and none of its entries leave the field.
`maze-stage.ts` and `pinball-round.ts` are where a round's own state is set up,
and `bossCycles` in `tools/director/src/boss-cycles.ts` already reaches one for
the sheets — read it before writing a pose by hand.

The second half is one slot, chosen small so the mechanism is proved rather than
argued about: THE MAZE's walls are the candidate this entry recommends, because
`maze-walls.ts` draws circles with gaps cut in them and a corridor's *depth* —
which wall is nearer — is a thing a player has to read at speed and the picture
currently says nothing about. Do the pose first and check the pair actually
draws a round before writing a line of paint; if it does not, that finding is
worth more than the candidate and should replace this entry.

## THE WISP and BULB QUEEN carry a measured cost from the adopted looks

- **Found:** 2026-09-09, claude/game-visual-assets-21ed8c
- **Files:** `packages/render/src/wisp-tentacles.ts`,
  `packages/render/src/torch-ball.ts`, `packages/render/src/torch-fire.ts`,
  `tools/perf/baseline.json`

Ten looks came out of VERSUS on 9 September 2026 and two waves report dearer
against the 2026-09-09 baseline afterwards. `bun run perf` puts BULB QUEEN
between +25% and +56% of the share it had depending on how busy the machine is,
and THE WISP at about +21%. Neither is a defect: the worst frame in the game is
between 5.7 and 7.1 ms against a 16.7 ms budget, and both costs are things the
owner chose to look at.

The queen's is six fireballs at once — a torch stands in each of her sockets —
and it has already been through one pass: the shells are contours held per
radius and per thirty-second of a turn, a tongue is a baked sprite under a
`globalAlpha`, and that took the wave from +71% to where it is. What is left is
eighteen tongue blits and eleven halo blits per rock, and the obvious next move
is to bake the *whole ball* — halo, shells and plumes — as one sprite per radius
and per phase, so a burning rock is one `drawImage` and the tongues alone stay
live. Weigh that against the memory: a ball sprite is about 4.3 radii square,
which is a quarter of a megabyte at a two-tile torch, so the phase count is the
whole design and 16 may be enough where 32 is not affordable.

THE WISP's is eight bezier strands where there were five, each stroked once
(`wisp-tentacles.ts`). There is a cheaper shape available: the shipped fringe
draws every strand into one `Path2D` and strokes it twice, and this one strokes
per strand because each carries its own width and alpha. Grouping them into two
or three buckets by weight would get most of it back.

Prove it with `bun run perf --wave "BULB QUEEN" --wave "THE WISP"`, and read the
five reference waves the narrow run carries before believing either number.
Take a fresh full-sweep baseline with `--save` **only** once neither is flagged
— a baseline saved on a busy machine is worse than a stale one, which this lane
did once and reverted.

## Two Bun versions disagree, and the cloud doc names neither

- **Found:** 2026-09-09, main
- **Files:** `docs/cloud-session.md`, `.bun-version`, `package.json`,
  `tools/hooks/session-start.ts`, `tools/test/bun-version.test.ts`

`tools/hooks/session-start.ts` already fixes the old-Bun problem: on the web
image it fetches `@oven/bun-linux-x64` from npm, caches it under
`~/.cache/neon-spore-bun` and puts it first on `PATH` through
`$CLAUDE_ENV_FILE`, so the three failures the doc describes — the silent
`lockfileVersion` 2→1 downgrade, `--frozen-lockfile` stopping `land` before the
check runs, and twenty-five timed-out websocket tests in `apps/server` — never
happen. `docs/cloud-session.md` does not know that. It still tells a cloud
session to diagnose all three by hand and then run
`npm install bun@latest --prefix /tmp/bun`, which is a second, different
mechanism aimed at the same thing. Rewrite that section to say what the hook
does, what its one stderr line looks like when it could not pin a binary, and
that the manual `PATH=` command is the fallback for that case only.

The second half is a real disagreement rather than stale prose. `.bun-version`
says `1.4.0`, and `package.json` and CI are held equal to it by
`tools/test/bun-version.test.ts`. The hook's floor is `WANTED = "1.4.2"`,
documented as *the lowest bun this repo's lockfile and workerd tests are known
to want*. Both cannot be right: either CI installs a Bun below the floor the
workerd suite needs, or the floor is set higher than anything requires. Find out
which by running `apps/server`'s suite on 1.4.0 — if it is green, lower `WANTED`
to match `.bun-version`; if it is red, raise `.bun-version` (and with it the two
declarations the test holds in step) to 1.4.2. Then add the hook's constant to
that test as a fourth reader, so the next raise cannot leave it behind — which
is how the two numbers parted in the first place.
