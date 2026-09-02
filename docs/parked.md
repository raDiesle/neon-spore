# Parked

Ideas a session had and did not act on. Optional, every one of them — nobody
owes this file anything.

It exists because both alternatives were worse. A suggestion made in a report
is read once on a phone and scrolled past; a suggestion filed in
`docs/spec/ideas.md` is filed with the design, which is the wrong shelf for
"the director could show this list beside the release notes". So it goes here,
in the commit, where a later session with nothing but the clone can pick it up.

It is **not** `docs/release-notes.md`, which records what already landed and is
closed. A row here is the other thing: an idea nobody has committed to. Keeping
the two in one place is how the second one stops being read — there was once a
third file between them, `docs/queue.md`, for work that had been decided on and
not yet started, and it went when the work stopped being queued at all.

**The format.** One `##` per idea, the date and the branch it came off under
it, then one line labelling what kind of thing it is and how far along —
`Kind · Stage` — then two or three sentences: what it is, why it was not
done then, and where to start.

Both of those lines are load-bearing: the director reads this file straight
onto the PARKED page, one entry after another with its whole argument open
under it, and an entry missing either line is an entry nobody can date or
sort. Where the branch was never written down and cannot be recovered, the
commit that added the entry stands in its place — `2026-08-28 · cc7a74f`.
`tools/director/test/parked.test.ts` fails on an entry with no argument, no
origin, no label, or a title the file already carries.

**Kind** is one of a closed list, picked by hand — nothing here can be
derived, the category lives in the prose and nowhere else: Mechanic,
Creature (a new or existing creature or boss), Graphics, Sound, Tool (or the
director), Performance, Correctness, Documentation. Eight is deliberate — a
ninth invented for one entry is the flat list again with an extra word, so a
genuine misfit is the nearest of these eight rather than a new one.

**Stage** is one of three: Idea (nobody has designed a solution yet),
Designed (a design worked out and unbuilt), or Implemented (something
already built that wants improving). The two axes are independent — a
Graphics entry can be any of the three stages, and the difference decides
whether picking it up is a session or a week.

An entry leaves by being **deleted** — done or refused, the history keeps it
either way. Nothing is ticked here. A file of ticked boxes is a file nobody
reads to the bottom of.

**Nothing adds to this file automatically any more, and that is the point.**
A rule in `CLAUDE.md` once told every cloud session to park what it noticed
and skipped. It had no budget: sixty-two entries arrived in six days, most of
them off the parallel `burn` lanes, in the shape of whole queue entries rather
than the two or three sentences asked for above — and the bottom section that
held them, written when `docs/queue.md` and `bun run burn` still existed, was
a board for a machine that has since been deleted. It went with them. What is
left below is the part that was worth keeping: ideas somebody would still pick
up, each readable on its own. A new entry is welcome and is now a decision
rather than a reflex — the owner asking for one, or a session judging an idea
good enough to spend a heading on.

## Three private copies of a hex mix

2026-09-01 · claude/veil-ui-improvements-c66ef8

Correctness · Implemented

`mixHex` now lives in `packages/render/src/hex.ts`, and `veil.ts` and
`siren.ts` call it. `depth.ts` and `sheen.ts` still each carry their own
private `mix`, written before there was anywhere to put one. Nothing is broken
— all three agree today — but they are three copies of the same arithmetic and
the one rule this repository keeps repeating is that a second copy drifts. It
is a five-line edit to two files; it was left out of the lane that made the
shared one because that lane had no other business in either of them, and a
diff that wanders is a diff nobody reviews.

## Nothing can photograph the two seats side by side

2026-09-01 · claude/thundercloud-enemy-morphing-g6a3it

Tool · Idea

`bun run frames` takes one picture of one screen, and the game now has three
creatures whose whole design is that the two screens differ — THE LURE, THE
DART and THE VEIL. Judging one of those from a single frame is judging half of
it, and the half that is *withheld* is the half nobody can see in a picture of
the other seat. A veil was landed by writing a throwaway script that opened the
preview twice with `localStorage["neon-spore.view"]` set to `p1` and then `p2`,
drove both to the same tick, screenshotted `#stage` at each and stitched the two
into one labelled PNG; it took ten minutes and was deleted afterwards, which is
the tell that it should be a command. `bun run frames <sha> --seats` is the
shape: the same capture twice with the seat set in an init script, and one
picture out. Start in `tools/frames/capture.ts`, which already does everything
but the seat and the stitch.

## A baked burst is one colour, and this game has two

2026-08-31 · claude/neon-spore-animated-graphics-1wgyyn

Graphics · Implemented

The atlas in `assets/raster/` is violet, and the field's whole colour rule is
red against cyan. A hit on a red creature drawing a violet burst is the one
thing on the RASTER page that is obviously wrong about the game rather than
about the picture. Three ways out and none of them was this lane's to pick: a
second and third atlas, which triples 94 kB; a greyscale atlas tinted through
`globalCompositeOperation`, which is one file and loses the painted colour
that was the reason for baking it; or a burst that is deliberately colourless
because the *thing it happened to* carries the colour. Start at
`tools/raster/src/burst-art.ts`, where the two gradients are four lines apart.

## Nothing baked can be seen before it is generated

2026-08-31 · claude/neon-spore-animated-graphics-1wgyyn

Tool · Idea

`bun run raster` writes an asset and says how many bytes it is, which is the
wrong sense. A generator whose whole output is a look should show the look:
sixteen frames as a contact sheet, the way `bun run shapes` does for contours,
so that changing `spikes` from 26 to 18 is a picture rather than a number.
`tools/frames/svg.ts` already rasterises and `bun run shot` already
photographs an element, so the parts exist.

## The frame count was chosen, not measured

2026-08-31 · claude/neon-spore-animated-graphics-1wgyyn

Performance · Implemented

Sixteen frames of 96 px is 590 kB of texture memory decoded and 94 kB on the
wire, and nobody has looked at whether twelve reads the same. A burst is over
in 640 ms and the eye is not counting; if twelve holds up, every future atlas
is a quarter cheaper for free. It wants one look at both on a phone, not an
argument.

## No shape is drawn at any of the twelve interludes

2026-08-27 · claude/game-in-game-mechanics-uxmysp

Tool · Designed

Every idea in the store has a contour offered to it on the director's SHAPES
tab, joined by name through `suggests` in `tools/shape-sheet/src/drafts/`. The
new INTERLUDES tab therefore shows twelve empty frames, which is the deliberate
"a picture will go here" gap rather than a bug — but it is twelve of them.

Not done here because an interlude is drawn out of `slab` and `glyphed` rather
than out of blobs ([interludes](spec/interludes.md)), and the shape sheet's
subjects are all contours with own-motion. Drawing a dial, a claw on a rail or
a grid of face-down slabs means the sheet learning a second kind of subject,
which is a change to `tools/shape-sheet/src/subjects.ts` and not a drawing
task. Start there, with THE GAUGE, which is one needle and two marks.

## The one-screen tester cannot pull half of THE WARDEN's tethers

2026-08-27 · claude/boss-concepts-implementation-4hri7c

Tool · Idea

A finger on the field is signed with the seat this device holds, and in the
`test` role that seat is player 1. Half the Warden's cycles clamp player 1, and
you get no leverage on your own tether — so on those cycles a mouse cannot
touch the line at all and the rescue has to go through the **G** key, which is
player 2's hand. That is correct for the finished game (one role per device)
and awkward for the one screen everything is actually tested on.

Not done here because the fix is a choice about the test rig rather than about
the boss: either the field's touch carries a modifier for "the other seat", or
the `test` role signs a finger with whichever seat is *not* currently clamped —
which is a rule that exists only in a view nobody ships. Start at
`field.seat` in `packages/render/src/touch.ts`.

## The Warden's phase table is written twice, in prose and in code

2026-08-27 · claude/boss-concepts-implementation-4hri7c

Correctness · Designed

`WARDEN_PHASES` in `packages/sim/src/warden-cycle.ts` and the table in
`docs/spec/bosses.md` 11.4 carry the same three rows. The director's boss panel
already renders the code's copy rather than a third one, so the tool is honest;
the spec is the copy free to drift. The queen has exactly the same problem one
section up.

Not done here because the general fix is the interesting one: `tools/director`
already parses `## N Title — tail` sections out of the spec (`sections.ts`), so
a check that a spec table matches the constant it describes would cover both
bosses and every one after them. Start at `tools/director/src/roster.ts`, which
already reads `bosses.md`.


## Rendering a theme to a file, so it can be heard away from the director

2026-08-27 · claude/game-music-creation-dzjb8r

Sound · Idea

The six music candidates can only be listened to by running `bun run dev` and
opening the SOUND sheet, which means the person choosing between them has to be
at a machine. An offline renderer — `PlannedVoice` to samples to a WAV — would
turn a theme into a file that plays on a phone, and would let a cloud session
attach what it wrote rather than describe it.

Not done here because it is a **second synthesiser**. `engine.ts` is the one
place that turns a plan into sound, and a renderer that re-derives its envelope,
its ring modulation and its filters is exactly the drift CLAUDE.md warns about:
the file would stop being what the game plays and nobody would find out by
listening. Start by asking whether `OfflineAudioContext` under a headless
Chromium can drive the real `engine.ts` and hand back the buffer — that keeps
one synthesiser and makes the rendering a harness rather than a rewrite.

## The backdrop tints an act it has to guess at

2026-08-27 · claude/burn-backdrop-b2

Graphics · Idea

`packages/render/src/backdrop.ts` picks its wash and horizon tint from
`world.wave % 5`, because the wave is the finest-grained thing the world
tracks and there is no `Act` anywhere in `sim` or `content` — the spec talks
about ten acts, one boss every ten waves, and nothing in the code knows it.
So the field changes colour every wave rather than every act, which is five
times too often to mean anything.

Not done there because inventing an `Act` type is a change to what a run *is*
— `docs/spec/structure.md` and the wave queue both have an opinion — and a
render lane is the wrong place to decide it. Start by asking whether an act is
a field on the wave or a grouping around the bosses; the tint table in
`backdrop.ts` is then two lines.

## The grip and the lance are controls no wave contains, so no wave teaches them

2026-08-29 · claude/burn-wave-guide

Mechanic · Idea

THE GRIP and THE LANCE are controls the pair has rather than things a wave
puts on the field, so no wave is the first to carry either — and the test that
makes every other mechanic get a guide (`packages/content/test/waves.test.ts`)
cannot see them. The two hardest couplings in the game are the two nobody is
taught. The move from derived cards to placed guides did not fix this and did
not make it worse; it only moved the hole from "the derivation cannot reach
them" to "no wave introduces them".

Not done there because the honest answer is probably a wave apiece — THE LANCE
already has one, wave 24, and it carries no guide because `lance` is a `run`
mechanic that every wave technically reaches. Start by asking whether a wave
may *name* the run mechanic it is about, which is one optional field and would
let the existing test cover both.

## The link chip says STALLED while a player is reading

2026-08-27 · claude/burn-briefings-b1

Correctness · Idea

A card freezes the field until both seats dismiss it, and one player reading
theirs while the other has already tapped looks, to `packages/net`, exactly
like a device that has stopped sending — so the network indicator is expected
to go to STALLED during the one moment the game deliberately waits.

Not done there because the lane owned nothing in `net/`, and because the fix
is a judgement about what the indicator is *for*: either it learns that a
briefing is a legitimate wait, or the wait stops looking like silence on the
wire. Start at `packages/net/src/status.ts`, which is deliberately the only
file allowed to say what the indicator may show.

## A subject's bit position is derived by hand in two places

2026-08-27 · claude/burn-briefings-b1

Correctness · Implemented

`world.brief.met` is a bitmask over `BRIEFING_SUBJECTS`, and anything that
wants to know whether a subject has been met computes its bit from its index.
`packages/sim/test/purity.test.ts` keeps a table of rules that must be called
rather than re-derived, for exactly this class of mistake, and this one is not
on it.

Not done there because adding a row means editing a shared test file that
another lane was in at the time. It is one row.

## The Throb's swell cannot be judged in the tool built for judging swells

2026-08-27 · claude/burn-shapesheet-b8

Tool · Idea

The shape sheet now derives its subjects from `CREATURES`, so the Throb is on
it — with the fallback tilt every non-bulb gets, and not with the swell that
is the entire point of the creature. `OwnMotion.poseAt` is a pure function of
seconds and the swell is keyed to `world.beat`, so the tooling has no clock
that could show it.

Not done there because a beat clock in the shape sheet is motion-system work
rather than a derived list, and the lane was scoped to the list. It matters
more than it sounds: one of the two outstanding creature checks asks whether
that swell reads as "wait for it" at tempo, and the tool the check points at
is currently showing the one motion the creature does not have. Start by
asking whether the sheet wants a beat clock or simply a manual open/shut
toggle — the second is much smaller and may answer the check on its own.

## Only one hand in this game can be seen letting go

2026-08-27 · claude/burn-other-hand-b5

Mechanic · Idea

THE OTHER HAND shows a partner's thumb on the lance and says nothing about the
other player's, because `prime` is the only control the band emits both a
press and a lift for — the shield strip sends no release, so a resting finger
there is invisible to the simulation. The lane built the honest half and said
so rather than inventing the missing one.

Not done there because a lift edge on the shield strip is a change to
`packages/render/src/touch.ts` and `apps/game/src/input.ts`, neither of which
the lane owned. Start by asking whether a hold is a thing the shield *should*
have — the fork already spends the lance's hold as half of a two-person gate,
and a second holdable control is a second thing that could.

## Nothing on the field can move between columns

2026-08-27 · claude/burn-vane-b7

Mechanic · Idea

THE VANE folds an arrival about the arm's column, and it does it at row 0
precisely so a thrown body is *born* in its landing column and is never seen
to jump. That was the cheap way out of a gap: `Creature` has no `fromCol`, so
there is nothing to interpolate from and no mechanic in this game has ever
moved something sideways once it was falling.

Not done there because it is a wide edit — every construction site of a
`Creature`, plus `hashWorld` — and the boss did not need it. The next mechanic
that wants something to *drift* across columns will, and THE BELT in
`docs/spec/interludes.md` is the one most likely to ask.

## THE VANE is silent

2026-08-27 · claude/burn-vane-b7

Sound · Designed

A pin coming out and a body being thrown report nothing to `packages/audio`.
The events want to be `pin`, `vaneThrow` and `vaneDown`, and each costs
`events.ts`, `audio/src/bind.ts`, `audio/test/bind.test.ts` and possibly a
sound. Refused shots already report, through the existing `reject`.

Not done there because audio was another lane's ground at the time. That lane
is binding two other silences right now, so whoever picks this up should read
what it decided first — the argument about whether to bind an unbound cue
rather than write a new sound applies here identically.

## An exhaustive switch has just been proved here, and three others have not been looked at

2026-08-27 · claude/burn-audio-b9

Correctness · Idea

`packages/render/src/effects-spark.ts` now covers every `SimEvent` variant
explicitly and ends in `assertNever`, so an event added without a burst fails
the typecheck rather than silently drawing nothing. That change was made
because the silent version had already bitten: an event was renamed, a burst
stopped existing, and everything stayed green.

Nobody has checked whether the same shape is hiding elsewhere. Any `switch`
over a union that ends in `default:` returning a neutral value has the same
property — it turns "somebody forgot" into "deliberately nothing", and the two
are indistinguishable afterwards. `packages/audio/src/bind.ts`,
`packages/render/src/boss-draw.ts` and the mixer are the obvious places to
look first. Start by grepping for `default:` in a `switch` on a `.type` or a
`.kind` and asking, of each, whether a missing case would be visible.

## A round that is not the field makes no sound at all

2026-08-27 · claude/burn-gauge-b6

Sound · Idea

THE GAUGE adds no `SimEvent`. Half of that is deliberate — the picture derives
from state, the way THE FORK's does — and half is that `packages/audio` was
another lane's ground and `bind.test.ts` is exhaustive over the event union,
so a new event fails until a cue names it. The metronome runs through a round
and nothing else does.

A mark landing and a call missing are the two moments that want a sound, and
they are the two the pair will be talking across. Start by reading what the
audio lane decided today about binding a spare cue rather than writing a new
sound; the argument applies here unchanged.

## Whether the no-travel rule is about the field or about the game

2026-08-27 · claude/burn-gauge-b6

Documentation · Idea

`CLAUDE.md` says nothing the players control travels the field, and
`docs/spec/interludes.md` asks for a `docs/decisions.md` entry saying whether
that scopes to the field or to the whole game. THE GAUGE did not need it — a
needle is a number in thousandths, not a thing that travels — and the lane
said so in the spec rather than treating the silence as settlement.

It is still open, and it is not open in the abstract: THE CLAW, THE BELT and
THE WELL all move something, and each is cheaper to design after the rule is
written than to design twice. Whoever takes the second interlude should settle
it first, in `docs/decisions.md`, before choosing which one to build.

## A swept worktree can survive its own removal on Windows

2026-08-27 · claude/pull-remote-master-132f48

Tool · Implemented

`bun run checks --clean` unregisters a worktree and then deletes its
directory, and on Windows the delete can half-succeed: `node_modules` holds
open handles, `rm` stops part way, and what is left is a directory git no
longer knows about containing some of a checkout. The next sweep then reports
it as dirty — `docs/` is gone, so every tracked file in it reads as modified —
and refuses forever, with git's original "Directory not empty" as the reason,
which points at the wrong thing entirely.

Not fixed here because the sweep had already run and three trees needed
clearing by hand more than they needed a design. The fix is small and in
`removeWorktree` in `tools/checks/repo.ts`: check the directory is actually
gone after the delete, retry once, and if it still stands say *that* rather
than re-raising the original git error. A tree that git has forgotten is not
dirty, it is litter, and the two want different sentences.

## Laser barriers, and a thing pushed up between them

2026-08-27 · main

Mechanic · Idea

Beams strung across the field, each one anchored between two emitters, and
something the pair has to get from the hull to the top edge without letting it
touch one. Taken from the mobile shooters' barrier rounds: the beam is a line
with a node at each end, it reads at a glance, and the whole round is the gap
between two of them. The split writes itself — one player can see which beams
are live and when they blink, the other is the one pushing — and it lands on
the game's own sentence, "column four, now", with a deadline attached.

Nothing forbids it: `docs/decisions.md` #21 scopes the no-travel rule to the
field, so an interlude may move something, and THE CLAW and THE BELT both
already say they need no relaxation. What is undecided is the verb. Every
control the pair has fires or covers, and this round asks them to **push** —
so either the cannon's bolt is what nudges the thing along, which makes the
beams a reason to *not* fire, or the round hands out a control that exists
nowhere else and has to be taught in one screen. That is the question to
answer before drawing anything. Start at `docs/spec/interludes.md`; the beam
itself is `slab` plus a node at each end rather than any contour the shape
sheet has.

## A ball that falls, breaks things, and is picked up again

2026-08-27 · main

Mechanic · Idea

Peggle's verb, borrowed: the cannon launches a ball instead of a bolt, and
from then on the pair only watches — it falls, bounces off what it hits,
breaks what it touches, and comes to rest somewhere on the hull to be
collected and fired again. One shot becomes a sentence with a long tail, which
is the opposite of every control the game has now, and that is the appeal:
the navigator can read the whole path before it happens and has the length of
the fall to say so, so aiming becomes the pair's only decision and everything
after it is watching a prediction come true.

Not started here because the physics is the whole risk and it lands squarely
on rule 3: the ball's position, its bounce and the angle it leaves a rock at
are all sub-tile, they all have to live in integer thousandths, and two
devices that round one bounce differently diverge for the rest of the fall
rather than for a frame. That is a determinism problem before it is a game
one, and `packages/sim/test/determinism.test.ts` is where the answer gets
proven. Start by deciding whether the ball reflects off the **column grid**
rather than off a real contour — a grid bounce is exact, and the game is
already a raster.

## A pod could be a bubble with a mark in it, and the rim could be the clock

2026-08-27 · main

Graphics · Idea

The mobile shooters draw a timed pickup as a soft glowing sphere with one flat
symbol floating inside it and a countdown written on the rim — the sphere says
"catch me", the symbol says which one it is, and the rim says how long is
left. Three facts, one object, no HUD row. The pod is already the thing this
game hands the pair, already round, and already has to be *told about* across
two devices, which is exactly the case where a mark beats a colour: "the one
with the arrows" survives a two-second delay and "the blue one" does not.

Not done here because the pod currently carries no state worth a symbol —
there is one kind, it is eaten, and that is the whole interaction. This is
therefore a drawing waiting on a design: it is worth doing on the day pods
differ from each other, and it would be a good reason to make them differ.
Start at `packages/render/src/pods.ts` and `POD` in
`packages/content/src/silhouettes.ts`, and note that the shield is a lobe of
the hull contour rather than a bubble, so a sphere here would not collide with
it visually.

## Per-pixel surface shading without a second renderer

2026-08-28 · cc7a74f

Graphics · Designed

If surface detail is ever wanted on a body *in the game* rather than on a
catalogue card, the reflex is WebGL and the reflex is wrong here.

Bake a height or normal map once at load, run the lambert dot product in a
single `ImageData` pass, cache the result as a sprite and blit it — exactly the
way `glow.ts`'s `haloSprite` already caches. That is genuine per-pixel shading
with no second renderer, no second code path, and nothing new for
`packages/render/test/frame.test.ts` to fail to cover, because the output is
still a sprite drawn onto a 2D context.

The cost is that the light direction freezes into the bake. That is free under
the arrangement the skin block is building, where the light is a constant by
design and a parameter is the named failure mode.

WebGL earns its keep only in two cases, and neither is here yet: the light has
to move per frame, or iridescence ships to the field — and `docs/alive.md`
currently forbids the second, because a creature's red-or-cyan is a gameplay
fact the pair says out loud.

Not queued, because nothing has decided that the game wants interior detail at
all; `docs/spec/graphics.md` says the opposite, and `burn-body-skin-c8` is the
lane that argues with it. Pick this up only after that argument is settled by
an eye, and only if the answer was yes.

## The versus pair shows one slot, one role, and cannot be told otherwise

2026-08-28 · claude/burn-versus-pair-v2

Tool · Idea

The VERSUS tab draws the first open slot and no other. The page names how many
there are, so a reader can see that it is holding something back, but there is
no switcher — and the moment a second slot exists, half the mechanism is
unreachable through the interface built for it.

Two smaller ones came off the same lane. The pose is fixed to
`pose.role ?? "p1"`, so a candidate that reads differently from the two seats
can only ever be judged from one of them — which matters for anything touching
the hull, since the pilot and the navigator are looking at different halves of
it. And both `versus-page.ts` and `versus-pair.ts` sit at exactly the 250-line
ceiling `packages/sim/test/limits.test.ts` enforces, so the vote box wants its
own file before either grows again.

Not queued because a slot switcher is only worth building once there is more
than one slot to switch to, and today there is exactly one. The lane that
opens the second is the lane that should carry this.

## The contour is written twice, and the game and the sheet each read a different copy

2026-08-28 · claude/burn-body-gate-c2

Correctness · Idea

`blobRadiusMul` and `hullRadiusMul` are byte-identical. The game strokes one
and the shape sheet measures the other, so every judgement made on the sheet
is a judgement about a copy of the thing that ships. Nothing keeps them equal;
they are equal because nobody has edited one yet.

That is the exact failure `packages/sim/test/purity.test.ts`'s COPIES table
exists to refuse — a rule spelled out twice drifts the first time somebody
changes the copy in front of them — and it is not covered, because the two are
in different packages and neither is a re-derivation of a *rule*, only of a
formula.

Second, smaller: `packages/render` exports no `throbSwell`, so the shape
sheet's nameability axes transcribe the 1.3 / 0.7 swell by hand. The lane that
found it deliberately added no COPIES row, on the grounds that any pattern
loose enough to catch a bare `[0.7, 1.3]` would be a guard in name only. It is
still a second copy of a number the game owns.

Not queued because the fix is a decision about which package owns the contour
and which imports it, and that is a bigger question than either lane had room
for.

## Three skins carry a private copy of something `parts.ts` should own

2026-08-28 · claude/burn-skin-volume-s2

Graphics · Implemented

`clipGroup` gained a `name` parameter after two skins had already hand-rolled
private copies of it — `insideBody` in `light.ts` and `proudGroup` in
`vein-pulse.ts`. Both are now byte-identical to `clipGroup(ctx, name)` and both
say so in a comment. They were left alone deliberately: swapping them edits
pictures that are still waiting on an eye, and both files carry `Check:`
trailers nobody has answered.

The third is newer and has no such excuse. `light.ts` keeps `addStops`
private, so `turn.ts` exported a second one rather than reach into a file it
did not own. That is a helper for writing gradient stops — the least
skin-specific thing in the directory — and it belongs in `parts.ts` with one
caller each.

All three go together in one pass, and the right moment is the day the PULSE
and LIGHT checks are decided: after that the pictures are settled, and a
change that cannot alter them is safe to make and easy to review. Doing it
before means an unanswered check whose subject has moved underneath it.

Not queued as its own lane because it is fifteen minutes of work that wants to
ride along with whichever lane next opens `parts.ts` — most likely the soft
group or the fringe, both of which will want a second clip.

## The skin registry is a shared append point, and it has cost a rebase per lane

2026-08-28 · the burn-skin block

Tool · Idea

`tools/director/src/skins/index.ts` holds an import line and a `SKINS` entry
for every skin. Each lane adds one of each, at the same end, and by the fourth
skin lane that had produced three rebase conflicts in a row — SCALE/CARAPACE
against TURN/CRATER, TURN/CRATER against the trunk, then CILIA against both.
Every one resolved by keeping everything, which is the tell: there is no
disagreement here, only a file two writers touch in the same place.

This is the same disease `docs/checks/restated.md` has, and that one already
has a lane against it (`burn-restated-split-p2`, a file per commit instead of
a line in a shared one). The registry cannot take that exact cure — something
has to enumerate the skins — but the append point can move. Options worth
weighing rather than one worth committing to now: one entry per line already
helps and Biome has forced that; a directory read at build time removes the
list entirely but the director is bundled, so it would need a generated file;
or each skin file self-registers on import and `index.ts` becomes imports
only, which halves the conflict surface rather than removing it.

Not queued because the block is nearly finished — three skin lanes remain —
and the cure costs more than the remaining disease. Worth doing before the
next block of skins, not during this one. The cost is real but bounded: a
rebase is a message to a lane and about a minute.

## CILIA reads a transform nothing promises it

2026-08-28 · claude/burn-skin-fringe-s3

Graphics · Implemented

`SkinFrame` carries `{ t, beat }` and no pose, deliberately — `docs/skins.md`
leaves it for whichever skin needs it first. CILIA needed the body's velocity
to lean its fringe against the direction of travel, and rather than add a
field outside its owned paths it read
`ctx.body.transform.baseVal.getItem(0).matrix`, differencing the translate
frame to frame.

It works, and it avoided a second copy of `poseAtSecond`, which was the right
instinct. But it couples the fringe to `shape-figure.ts` writing a translate
as the *first* transform item on that group — true today, promised nowhere. If
that write ever changes shape, the fringe stops leaning, no test fails, and
the failure is a skin that looks slightly less alive.

The answer is a velocity or pose field on `SkinFrame`, added once and read by
CILIA and by anything after it — the iridescence lane will want the same
thing, since its shift has to ride the body's motion. Do it when a second skin
needs it, which is the next lane that does.

## The catalogue page is now tens of thousands of SVG elements, and nobody has felt it

2026-08-28 · the burn-skin block

Performance · Idea

Element counts over the sixty cards, as each lane measured them: CILIA 123 per
card; CARAPACE about 1,600 page-wide; SCALE about 10,600; SUCKER about 15,600;
**PORE about 38,200**. PORE is roughly 640 elements per card, three and a half
times SCALE and three hundred times LINE.

Every one of those was verified as a *count*, never as a frame rate, because
`requestAnimationFrame` has not fired once in the sandbox's browser pane all
day — a lane proved it by awaiting a frame that timed out. So the page has
grown two orders of magnitude in DOM size across one session and no session
has watched it move.

The risk is not that one skin is slow. It is that the SHAPES tab becomes
sluggish enough to distort the judgement of *every* skin, including the ones
that are cheap — a fringe that stutters reads as a bad fringe rather than as a
busy page, and the whole point of the tab is comparing looks fairly. That
would quietly invalidate a dozen outstanding checks rather than failing
anything.

Cheap things to try first, in order, if it does drag on a phone or a laptop:
draw the scatter skins at a lower count for the small cards and full count
only for the one being looked at; or render a skin's static texture once to a
`<pattern>` or an offscreen canvas and reuse it per card, since the bumps do
not move with the contour the way the clipped groups do. Neither is worth
building before somebody says the page is slow.

Not queued, because it may be nothing — sixty small SVGs is not obviously too
much for a desktop browser, and the numbers above are the only evidence there
is. The first person to open the tab settles it in five seconds.

## A count of motions is typed into a heading, and it has been wrong twice

2026-08-28 · claude/burn-skin-depth-motion-s2b

Correctness · Implemented

`tools/director/shapes-page.ts:159` says *"nine ways a body moves"* under the
Spare motions heading. There were eleven when the lane found it and there are
fifteen now, so the sentence has been false for two separate reasons without
anybody noticing either.

`MOTIONS.length` is right there and the heading should derive from it. This is
the same failure `docs/asset-catalogue.md`'s draft count already had — two
sessions each incrementing the number they found instead of counting — and
that one was fixed by making a test read the sentence. A derived heading is
cheaper and cannot go stale at all.

## `drafts.test.ts` calls a motion still when it moves only in `dy` and `sy`

2026-08-28 · claude/burn-skin-depth-motion-s2b

Correctness · Implemented

The "actually moves" assertion samples `dx`, `rot` and `sx`. A motion whose
whole signature is vertical — a body pivoting on its base, or one receding —
reads as not moving at all. PITCH tripped it and now passes honestly, because
a body going over does recede and that is a real uniform-scale term; but the
test would let a genuinely motionless motion through in the other direction,
which is the case it exists to catch.

The fix is to sample all five components of the pose rather than three. It is
small, and it is not urgent, because the failure mode is a false pass rather
than a false failure — nothing is blocked by it today.

## Four skin files sit exactly on the 250-line ceiling at once

2026-08-28 · claude/burn-skin-mounted-s7

Graphics · Implemented

`pore.ts`, `light.ts` and `vein-pulse.ts` are at exactly 250 lines and
`mounted.ts` at 248, with `packages/sim/test/limits.test.ts` enforcing the
ceiling. The next lane to touch any of them pays a split before it can add a
line, and it will discover that at the moment it is trying to do something
else.

The obvious extraction is already visible: `poissonScatter` and
`ScatterOptions` live in `pore.ts` and are used by `sucker.ts` as well. They
are a shared scatter engine with a pluggable density field, not a property of
pores, and they belong in a file of their own beside `parts.ts` and `seed.ts`.
That alone takes `pore.ts` well clear.

Not queued on its own because it is the kind of work that should ride along
with whichever lane next needs the room, rather than being a commit that moves
code and changes nothing.

## `spin` writes an opacity every frame that has usually not changed

2026-08-28 · claude/burn-skin-mounted-s7

Performance · Implemented

One `spin`-shaped pass over the whole SHAPES tab under MOUNTED PORE is 6,227
groups and 5.72 ms of attribute writes — inside a frame, with repaint
unaccounted for. Most of those writes are the same value again: a feature's
opacity does not change materially during the 0.26x dwell at each end of the
turn's sweep, which is where the motion spends much of its time.

Skipping a write when the value has not materially changed would roughly halve
the per-frame writes. It was not done because it needs a mutable field per
feature and the file had no line budget left — which is the same finding as
the ceiling note above, arriving from a different direction.

Worth doing only if the page turns out to be slow in motion, which nobody has
been able to see yet: `requestAnimationFrame` has not fired once in the
sandbox all day, so every performance number in this block is a count or a
synchronous timing and never a frame rate.

## A skin is told its reach and never its shape

2026-08-28 · claude/burn-skin-wind-s8, claude/burn-skin-fringe-s3

Graphics · Implemented

`shape-figure.ts` computes `reach = max(w, h) / 2` and throws the aspect away,
so `SkinContext` carries no extent. Two skins have now had to reach around the
interface for something about their own body:

- WIND needs to know which way a body is long, so it looks the subject back up
  in `CATALOGUE` by `ctx.name` — and falls back silently to "tall" for any
  contour the catalogue does not reach.
- CILIA needs the body's velocity to lean its fringe, so it reads
  `ctx.body.transform.baseVal.getItem(0).matrix` and differences it, which
  assumes `shape-figure.ts` writes a translate as the first transform item.

Neither is wrong and both were the right call under their ownership, but twice
is a pattern. One optional `extent: { w, h }` on `SkinContext` removes WIND's
lookup entirely, and a velocity field removes CILIA's. Add them when a third
skin wants either — the iridescence lane will want the velocity, because its
shift has to ride the body's motion.

## TURN and WIND draw two surfaces where one would prove more

2026-08-28 · claude/burn-skin-wind-s8

Graphics · Implemented

`turn.ts` keeps `surface()` — its meridian bands and patches — private, so
WIND drew its own banded surface rather than reach into a file it did not own.
The two skins therefore differ in their surface *and* in their phase, which is
one difference too many for the comparison they exist to support.

Exporting `surface()` would let WIND and TURN share literally the same marks
and differ in exactly one `sin`. Then the check — *does it read as one body
twisting, or as two halves disagreeing* — is answered against a genuine
control instead of against a second drawing. `turn.ts` has about 129 lines of
headroom while four skins sit on the ceiling, so there is room to do it there.

Small, and worth its own lane rather than a footnote, because it strengthens
an outstanding check rather than adding a look.

## The cold pass, and the frame loop, are the two costs left on the shapes tab

2026-08-28 · claude/burn-shapes-rebuild-s11

Performance · Implemented

Memoising the frame fit took a skin switch from ~6.5 s to ~240 ms. What
remains, measured by the same lane and deliberately left alone:

Opening the tab still costs about 5.5 s once, and the first press of each of
the fifteen motion buttons about 4.7 s — those are fits nobody has computed
yet, and a second press of the same motion is 209 ms. A cheap halving is
available and named: `transformedBounds` in `shapes-motion.ts` scans `pointsAt`
over the same 133 samples **twice** when a motion is present, once to find
`still` and once for the main loop, and `still` is already computed by the
caller and passed in as `tile`/`centre`. Passing the box too would roughly
halve the cold fit.

And `tick()` in `shape-figure.ts` calls `contourAt` for all sixty figures every
frame — about 13.5 ms a pass measured headless — including cards scrolled far
off screen. **That** is where an `IntersectionObserver` would actually pay, and
it pays in frame rate rather than in switch latency. It needs a machine that
composites to judge, which this sandbox is not.

## `bun --hot` in the director breaks after a git stash

2026-08-28 · claude/burn-shapes-rebuild-s11

Tool · Idea

Twice, a `git stash` under a running director left the hot reload in a broken
state — `renderShapes is not a function`, blank tab — and only a full server
restart cleared it. Worth knowing for any lane that stashes while previewing,
which is a normal thing to do when measuring before and after.

## Three more places show one look at a time

2026-08-28 · claude/burn-shapes-pair-s12

Tool · Idea

Decision 24 says every alternative is comparable in the director at once. The
SHAPES tab now is. Three other surfaces are not, and each is a separate small
lane rather than one big one:

- `tools/director/src/shapes-page-app.ts` — the self-contained catalogue
  written by `bun run shapes:page` and mailed to a phone. It carries its own
  copy of the fitting and drawing and still shows one skin at a time. This is
  the reader who most needs pairing, because they are the one who *cannot*
  flip: they have a file, not an application.
- `tools/director/src/concept-art.ts` — draft figures beside their idea, fixed
  skin, no pairing. The same problem in a second place.
- The control row is now 58 buttons. Decision 24 anticipated this and named the
  answer: the director learns to organise them, rather than the repository
  throwing variants away. Three tagged segments helped; real grouping is its
  own lane.

## A narrow window squeezes a paired card's prose

2026-08-28 · claude/burn-shapes-pair-s12

Tool · Implemented

`.shape` has the default `flex-shrink: 1`, so below about 900 px the card
squeezes to ~250 px and the text column stretches to 700 px tall. The frames
themselves hold at 92 px because `.shape svg` is `flex: 0 0 auto`, so the
nameability floor is not at risk — only the reading is. The fix is
`flex-shrink: 0` in `tools/director/index.html`, which the lane that found it
did not own.

## The nameability gate cannot be failed by a size change alone

2026-08-28 · claude/burn-depth-field-d1

Tool · Implemented

The gate has three axes — aspect, lobe count and effective drawn radius — and
`confusable` requires an overlap on **all three at once**, which was the right
fix for a guard that was otherwise unsatisfiable. The depth lane then measured
what that costs: **no uniform row multiplier turns the gate red at any value.**
Not at 1.125, not at 1.25, not at 2x, not at 100x.

The reason is that every pair on the living roster is disjoint on the *lobe*
axis as well, so the size axis is load-bearing for no pair today. A change that
moves only drawn size therefore cannot be refused, however far it moves it —
the axis it touches is exactly the one the pass/fail is not watching.

That is not an argument for weakening the conjunction, which exists because
three kinds are already the same aspect. It is an argument for the report
saying *which* axis is holding each pair apart and by how much, so a change
that erodes the margin on the one axis that matters is visible before it
becomes a collision. `TOLD APART BY` already names the axis; what it does not
do is apply a proposed multiplier and print the gap that would remain.

## Adding a `SimConfig` field is never a one-file change

2026-08-28 · claude/burn-depth-field-d1

Documentation · Designed

`docs/queue.md`'s own header calls `config.ts` a file "owned by nobody" that a
lane adds to in one contiguous region. True as far as it goes, and incomplete:
`FIELD_GROUP` in `tools/director/src/ship-fields.ts` is a
`Record<keyof SimConfig, GroupName>`, so **a new config field is a hard
typecheck failure until the director is told which group it belongs to.**

The depth lane discovered this by hitting it and added two lines as
`PLUMBING`. It is a good coupling — it means no tunable can be added and left
unreachable in the tool that tunes it — but it should be known before a lane
plans its ownership rather than after, because it drags a director file into
what looked like a `packages/sim` change.

## Rocks and torches recede in size and order, but not in colour

2026-08-28 · claude/burn-depth-field-d1

Graphics · Implemented

The row haze is applied to living bodies only. `torch.ts` sets
`globalAlpha = 1` mid-draw, so an outer alpha is clobbered, and hazing the
inert bodies properly means editing their own files. So a rock on the top row
is relatively *brighter* than a creature on the same row — the one place the
new depth is inconsistent with itself.

Also from the same lane: `grip.ts` calls `creatureRadius` without the new
optional `beatPhase`/`cfg`, so the grip ring lands about 0.9% — a quarter of a
pixel — off the body it circles, which is under what its own `RING_MUL`
spends. It has `world` in scope, so `creatureRadius(l, c, beatPhase, world.cfg)`
fixes it whenever that file is next open.

## The fit lives in the director and the shape sheet now reaches up for it

2026-08-28 · claude/burn-shapes-floor-s13

Tool · Implemented

`tools/shape-sheet/src/drawn-size.ts` imports `FIT_TIMES` and `isWide` from
`tools/director/src/shape-figure.ts`, and `tilePixels`/`transformedBounds` from
`shapes-motion.ts`. That is backwards: the director depends on the shape sheet,
not the other way round.

It was the right call anyway, and the alternative was worse. The lane's whole
purpose was a floor that cannot drift from the thing it describes, and a
re-derived fit is a floor about nothing. Importing is honest; copying would
have been a second copy of a rule, which is what `purity.test.ts`'s COPIES
table exists to refuse.

The proper fix is to move the fitting *down* — into `tools/shape-sheet`, where
the contours and the metrics already live — and let the director import it like
everything else. Confined to one file today and no runtime cycle, so it is not
urgent; it becomes urgent the moment a second thing wants the fit, or the
director's fit code moves.

Worth knowing alongside it: the lane found that the reported drawn size is the
*whole-sway* fit scale applied to the *still* rest-pose bounds. A shape that
sways wide is fitted small, so its resting body reads smaller than its frame
suggests — which is exactly the case the floor exists to catch, and would have
been missed by measuring either pose alone.

## Two wobble sample sets disagree about one body

2026-08-28 · claude/burn-body-context-s14

Correctness · Idea

The frame fit samples a wobble at five moments (`FIT_TIMES`); WIND's extent
measurement used six. ECHO is the one catalogue entry the two disagree about —
wide under one set, round under the other. The lane kept both rather than
merging them, because reusing `FIT_TIMES` for the extent would have changed
ECHO's picture, and a lane proving that nothing changed is not the place to
change something.

So there are two sample sets, and either that is right — the fit and the
classification are different questions and may honestly want different
samples — or one of them is wrong. Nobody has decided which. One body is
affected, which is why it is parked rather than queued.

## `poseAt` stays callable, which is how `axis` can be ignored

2026-08-28 · claude/burn-body-context-s14

Correctness · Idea

`OwnMotion.axis` declares how a motion was written, and `poseOn(motion, t,
long)` does the turning at the drawing site. But `poseAt(t)` still exists and
still answers, so a caller that forgets gets a pose that quietly ignores the
axis — the one failure mode the design leaves open, and the lane said so
rather than leaving it to be found.

A `COPIES` row in `purity.test.ts` is the mechanism for "called, not
re-derived" and would catch it. It cannot be added today: `render/creatures.ts`
calls `poseAt` directly and that call is correct, because no shipped motion
declares an axis. The row becomes possible the day one does — and that is
also the day it starts mattering.

## Cannon wind-up is an animation question, not a balance one

2026-08-29 · claude/burn-windup-alternative

Mechanic · Idea

The owner's own words: "so 'Cannon wind-up' idea is just for a cool
animation, so half a beat is too much probably. can be less, maybe 1/4
beat. you could give me control input to play around for testing only. so
keep delay for 'not build yet' for the time being and keep current as it is
for now." So `shotChargeBeats` (`packages/sim/src/config-shot.ts`) is not up
for a side-by-side vote yet — it is a number to feel out by hand first, and
`apps/game/src/testing.ts`'s own test panel already carries a "Shot lay"
slider for exactly that, in eighth-beat steps from 0 to 1. Nothing shipped
moves: `DEFAULT_CONFIG` stays at 0 and `apps/game`'s own `0.5` is untouched;
the slider only ever reaches that panel's own live `cfg`, the same one `apps/game/src/main.ts` builds — no second control was added beside it.

Two forces pull on the number in opposite directions, and both are the
owner's own. Too long and the shot itself feels sluggish — a press that
takes a noticeable while to become a bullet. Too short and the *animation*
the delay was bought to show cannot be seen at all: "for sure the best is to
have this nice animation to poop out an egg like a chicken. if its too fast,
the player might not see it." A lane built that egg-laying animation today
as the `mouth` candidate — the mouth strains, the egg emerges, the mouth
relaxes — and that sequence, not the bullet, is the thing a value this short
has to leave room for.

So the question the slider answers is about the *mouth*, not the shot:
watch the egg candidate's own laying while dragging, not the bullet's
departure, and find the shortest value at which the eye can still follow the
whole sequence — that is the floor `1/4 beat` was a guess at, not a number
to reason out in the abstract.

And the third force, which is the one nobody watching the animation will
think to weigh: the delay was not put there for looks in the first place.
`shot-charge.ts`'s own reasoning is a two-device one — a shot laid over half
a beat is a press player 1 can *see happening*, where a press that was
instantly a bullet reached him only as a result. Shortening it for the
animation's sake is trading against that tell, and whoever picks a final
value should know that is the trade being made, not just the framerate one.

Not done as a versus candidate because a config value that changes when a
bullet starts existing is simulation, not a draw-time patch, and the honest
way to show it side by side is two independently stepped worlds — real
work, and premature before the owner has even settled on a value to compare
against 0.5. Start by dragging the slider through 0.125 and 0.25 with the
`mouth` candidate's egg running, watching the mouth rather than the bullet,
and only reach for VERSUS once a number is worth arguing for.

## PARTS as a fifth axis on the SHAPES page

2026-08-31 · claude/space-game-shape-variants-wlmn6m

Tool · Designed

SKIN, GLOW, HIT and TAIL are each a row where one body is drawn under every
value of an axis, and `parts/` is the same shape of thing: one base blob under
every part in the registry, fifty-one cells, animating. The static sheet
`bun run shapes:parts` answers what each piece looks like and cannot answer
whether a tentacle's sway reads at tempo, which is the only question worth an
eye on a part that moves.

Not done in this lane because the lane was the library and the axes are the
director's, and `shapes-all.ts` already walks six grids through one card
implementation — a seventh is a change to that walk rather than a file beside
it. Start at `shapes-effect-axes.ts` and ask whether a part axis wants the same
`Cell` or a cell that carries a recipe.

## A part is drawn in the tool and nothing in the game can wear one

2026-08-31 · claude/space-game-shape-variants-wlmn6m

Graphics · Idea

`grown()` lives in `tools/shape-sheet/` because content is what the game ships
and a combination nothing carries is not content. The day a card is claimed,
though, the game needs a way to draw it: `packages/render` draws a creature
from `blobPath` and a radius function, and a body wearing three loops is not
that. Either the parts follow into `content` as data the renderer walks, or a
claimed recipe is baked down to a contour and loses its per-part motion.

Not done because nothing has claimed one yet and the answer depends on which
card does. Start by asking whether the claimed body's parts need to move
independently — if they do, the renderer needs the loops; if they do not, a
baked contour is cheaper everywhere.

## A bell has no hollow, because a radius cannot have one

2026-08-31 · claude/space-game-shape-variants-wlmn6m

Graphics · Designed

`bell` in `parts/base.ts` cuts a body's underside flat, and that is as far as
a contour marched one radius per angle can go: a concave underside needs the
ray to cross the outline twice. So the eight jellies are domes with a straight
edge underneath, and what they cannot show is the one thing that reads as
*hollow* — the far inside of the bell visible through the near side, which is
most of what a photographed jellyfish looks like.

Not done because it is not a bigger number, it is a second loop: an inner
outline, drawn under `fill-rule: evenodd` so it becomes a hole, the way
`ring.ts` already does for THE WARDEN. Start there — it is the one shape in
the catalogue that has solved this — and ask first whether the hollow survives
at 26 px or is a thing only the card ever sees.

## The swim sheet fits every row to its own body

2026-08-31 · claude/space-game-shape-variants-wlmn6m

Tool · Idea

`swim-sheet.ts` fits each row over its own cycle, so the squeeze inside a row
is honest and sizes *between* rows are not: THIMBLE and PARASOL are drawn the
same height on the page and are nothing like the same size in tiles. Every
sheet in this tool has the same property and it has never mattered, because
the game derives a body's size from the tile rather than from the drawing.

It might matter here. Whether a bell reads as a bell is partly a question of
how big it is against the things hanging off it, and a page that normalises
that away is answering a slightly different question from the one an eye asks.
Start by drawing the eight at one shared scale and seeing whether the small
ones become unreadable — if they do, the current fit is right and this entry
is refused.
