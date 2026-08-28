# Parked

Ideas a session had and did not act on. Optional, every one of them — nobody
owes this file anything.

It exists because both alternatives were worse. A suggestion made in a report
is read once on a phone and scrolled past; a suggestion filed in
`docs/spec/ideas.md` is filed with the design, which is the wrong shelf for
"the director could show this list beside TO CHECK". So it goes here, in the
commit, where a later session with nothing but the clone can pick it up.

It is **not** the outstanding list. `bun run checks` derives that from the
`Check:` trailers, and every row on it is an obligation: work that landed and
that nobody has looked at. A row here is the opposite — work nobody has decided
to do. Keeping the two in one place would make the outstanding list somewhere
that some rows matter and some do not, which is how a list stops being read.

**The format.** One `##` per idea, the date and the branch it came off under
it, then one line labelling what kind of thing it is and how far along —
`Kind · Stage` — then two or three sentences: what it is, why it was not
done then, and where to start.

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

Anything labelled Creature is not scattered through the file: it moves to
the bottom, under `### Postponed: creatures and bosses`, which says why.
New enemies and bosses are the least relevant thing to continue right now,
so they wait there rather than sit beside the technical debt above.

An entry leaves by being **deleted** — done or refused, the history keeps it
either way. Nothing is ticked here. A file of ticked boxes is a file nobody
reads to the bottom of.

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

## The grip and the lance are controls no wave contains, so no card can find them

2026-08-27 · claude/burn-briefings-b1

Mechanic · Idea

A briefing's subjects are derived from what `startWave` was handed — the spawn
queue, the pods, the boss — which is what stops a card going stale when a
creature is swapped out of a wave. THE GRIP and THE LANCE are not in any of
those lists: they are controls the pair has, not things the wave contains, so
the derivation cannot reach them and the two hardest couplings in the game are
the two nobody is taught.

Not done there because the obvious fix is the one `docs/decisions.md` #18 just
argued against — a `briefings:` list grown back onto `Wave` is the placed
version returning through the back door. Start by asking what a control's
first *use* looks like from the sim's side: the first wave whose creatures
make a control visible is derivable too, and that may be the hook.

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

## The roll wants to be a wave before it is ever a boss

2026-08-27 · claude/burn-vane-b7

Mechanic · Designed

`docs/spec/transfers-bosses.md` proposed THE VANE as a render-only column
*roll* — one player's column order reversed, so column four on one device is
column eight on the other. The boss was built the other way, folding where
things land in the simulation, because a flip the simulation never hears about
has nothing to hash, nothing to replay and nothing the director can show.

The roll itself is still a good mechanic and it is still unbuilt. What it is
not is a boss: leaning an act on a rule no wave has ever run is how you find
out at the worst possible moment. It belongs at wave scale first, in
`layout.ts` and `touch.ts`, where a bad answer costs one wave. Start there and
let a boss claim it afterwards if it survives.

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

## The card sheet shows a wave as if nobody had played the ones before it

2026-08-27 · claude/burn-card-panel-b13

Tool · Implemented

The CARDS tab's wave picker builds a fresh pair for whichever wave is chosen,
so wave 1 is exactly right and wave 9 shows what a pair *skipping straight to
wave 9* would be told — not what a pair who played one to eight would still
have left to learn. The difference is the whole point of the "has met" set,
and the sheet currently has no memory of it.

Not done there because carrying a cumulative `met` set across the picker is a
different question from drawing a card, and the lane was scoped to the second.
Start at `waveBriefingOrder` in `tools/director/src/card-waves.ts`: it already
builds a real world per wave, so the change is to thread one bitmask through
the loop rather than to reset it. Worth doing — "what does wave 9 actually add"
is the question an author asks, and the sheet answers a different one.

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

### Postponed: creatures and bosses

Grouped here, and last, because the owner asked to postpone them: continuing
the bestiary and the act order the game already ships is less urgent right
now than the technical debt and open design questions above, so anything
whose subject is a new or existing creature or boss goes at the bottom
rather than sitting scattered through the file — postponed, not dropped.

## THE CONDUCTOR's slot is spent and the beat is still unbent

2026-08-27 · claude/burn-vane-b7

Creature · Idea

THE VANE took the act slot that `docs/spec/transfers-bosses.md` drew the
pendulum arm for, and bent the field's geometry rather than its tempo. The
original worry about bending the shared *beat* — that the beat is the one
thing surviving a two-second voice delay, so a boss that moves it attacks the
pair's only reliable ground — is untouched and still deferred.

Worth writing down because the arm is now spent, and the next session reaching
for THE CONDUCTOR will find its picture already in use and should know that is
deliberate rather than an oversight.

### Postponed: proposed by the run, not asked for

The owner's rule, and it applies to everything below this line: work the
autonomous run thought of waits behind work the owner asked for. These
thirteen were written as queue entries — they carry a branch, the paths a lane
would own, a finished-when and a `Check:` — and they are parked whole rather
than summarised, so picking one up is moving it back and nothing else.

None of them is a bad idea. Several are better than the bug reports that
outrank them. That is the point: designing is more enjoyable than fixing, so
work nobody asked for rises on its own unless something holds it down.

## FIVE HUNDRED LINES IN ONE FILE, AND THE DOCUMENT THAT NAMES ITS NEIGHBOURS

2026-08-28 · claude/burn-versus-promptsplit-v3b

Tool · Designed

`tools/versus/prompt.ts` landed at 511 lines against CLAUDE.md's ~250, and it landed that way deliberately: the lane that wrote it could not split it, because the seam files are enumerated by name in `docs/versus.md` **and** inside the prompt's own step 4, and it owned neither. This lane owns both, which is the whole reason it exists.

The seam is already there and needs no invention. `votePrompt` begins at line 195; everything above it — `wrap`, `row`, `named`, `count`, `list`, `quoted`, `show`, `block` — is text formatting that knows nothing about votes, and belongs in `tools/versus/text.ts`. What is left is the template and `changes`, which is the part worth reading as one piece.

Two things this must not break, and both are tested already, so the test suite is the acceptance: the adopt and keep forms still differ in exactly the five ways the template names, and `votePrompt` still throws on a patch under `packages/sim/`. Do not weaken a test to fit a split.

Then update the two places that enumerate the directory — `docs/versus.md` and step 4's own file list — so the prompt keeps telling the truth about the tree it is describing. That is the actual risk here: a prompt that lists files which are no longer there teaches a cold session to distrust it.

Finished when `bun run check` is green, every file is under 250 lines, and no test was changed to make it so.

Model `sonnet`, effort `think`. This is a move with a documentation tail, not a design.


## THE VOTE BUTTONS COPY A RECORD, AND THE PROMPT THEY SHOULD COPY NOW EXISTS

2026-08-28 · claude/burn-versus-wire-v3c

Tool · Designed

Behind v3b, so the split settles before this reads from it.

The pair renderer landed while `prompt.ts` did not yet exist, so its vote buttons put a *record* on the clipboard — slot, winner, loser, the typed reason, every field `old -> new` — under a header saying in plain words that it is not the adoption prompt. That was the right call at the time and it is the wrong thing to ship: it is the expensive half of the vote kept warm, waiting for the cheap half.

`votePrompt(vote)` and `readCurrent(v)` are now on `main`. Replace the record with the real thing, and delete the header that apologises for it. **`readCurrent` must be called before any patch is applied** — the whole refusal mechanism rests on the left-hand values being what the shipped record actually says right now, so reading them off a patched record would emit a prompt that cheerfully reverts nothing and claims it reverted something.

Nothing else in the page changes. The vote box may want its own file — both new director files sit at exactly the 250-line ceiling — and if it does, that is this lane's to make, contiguous and small.

Finished when `bun run check` is green, a vote copies a prompt a cold session could paste, and the commit says which values `readCurrent` was called against.

Model `sonnet`, effort `think hard`. The one thing to get right is the ordering of the read against the patch. Read `tools/versus/prompt.ts` and `variant.ts` first.


## THE CATALOGUE'S ARROW POINTS ONE WAY, AND A TAKEN SHAPE CAN STILL BE WRONG

2026-08-28 · claude/burn-versus-docs-v4

Documentation · Designed

`docs/asset-catalogue.md` says the direction of travel is one way — a draft that is claimed becomes taken, and nothing goes back — which was true while the only open question was what to draw. It is not true any more: the same page already runs NOTCH 1 against NOTCH 2 on one clock and says a single draft in that position quietly becomes the answer by being the only thing on the page, and that argument applies with more force to a shape the game has been drawing for months. Write decision **25** in `docs/decisions.md` (23 and 24 are taken — 24 is the owner's rule that nothing is deleted for being undecided, and this lane must not contradict it) (why a candidate is a patch in `tools/`, why the game's import graph is the enforcement rather than a rule anyone follows, why the vote persists as nothing, and a `Reconsider if:` that names the case where it breaks — more than one person voting, or a look whose difference only shows on a device this machine is not), one `##` section in `docs/asset-catalogue.md` on where a vote sits beside DRAFT / FREE / TAKEN, one paragraph in `docs/verification.md` giving the `Check: versus <slot> — …` trailer its shape at both ends, and in `CLAUDE.md` one `bun run versus` row in Commands plus a short Conventions paragraph saying a replacement look is voted on before it is adopted. Two rules that must land here or they land nowhere. **A slot that is not decided simply stays open** — decision 24 reverses the original design here, so do not write the session-scoped deletion the older draft of this brief asked for: a variant persists until the owner says adopt, keep, reuse or delete, and a session ending is not an event in their day. And a session landing candidates writes the opening `Check:` naming the slot, so a slot's whole life sits on `bun run checks` and `⚑ TO CHECK` rather than on a second list. Finished when `bun run check` is green — and be careful with `asset-catalogue.md`: `tools/shape-sheet/test/drafts.test.ts` reads its status sentence and counts the catalogue, so add a section and touch neither the blockquote nor the counts.

Model `sonnet`, effort `think`. Read `docs/versus.md` first — it is the design this lane implements.


## THE HULL IS ON SCREEN EVERY FRAME AND HAS ONLY EVER HAD ONE ANSWER

2026-08-28 · claude/burn-versus-slots-v5

Graphics · Designed

The mechanism now exists and has been looked through once, so this is the lane that fills it — and it goes last on purpose, because a candidate authored before anybody has watched the pair run is a candidate authored blind. Three slots, all of them things a player looks at constantly and none of them needing a lifting commit: a second candidate in `ship:hull-skin` so the first vote is a genuine three-way (current, warm, and one more), `creature:bulb` and `creature:slick` as separate slots each patching the silhouette record and its own-motion together, and `palette:ammo-pair` patching `PALETTE`'s six red and cyan tokens as one slot because a vote on cyan alone is a vote on something nobody ever sees alone. Think hard about what makes two candidates a real choice rather than a nudge and its twin: each `claim` has to pass the one-sentence test `.claude/skills/new-wave` already applies to a wave, and two candidates whose failure modes are the *same* failure mode teach nothing — the catalogue's own NOTCH pair is the model, where one says the direction with a feature small enough to vanish at 26 px and the other says it with the whole mass, so whichever way it goes the result is a measurement. Every candidate is a directory under `tools/versus/candidates/` holding `variant.ts`, so removal is `git rm -r` regardless of what it grew. Finished when each slot draws two moving phones that differ visibly at 380 px, `bun run versus` lists three open slots with their readers, and the landing commit carries one `Check: versus <slot> — …` per slot pointing at the director's VERSUS tab. Do not open a slot that patches `SWAY_PUMP` or `TILT_RIPPLE` until `claude/burn-own-motion-b10` has landed — that lane owns `own-motion.ts` and a vote taken against a record about to move is a vote against nothing.

**Behind the mechanism lanes, not beside them.** It adds entries to
`tools/versus/candidates/index.ts`, which the first lane creates and owns — a
candidate authored before the registry exists is a candidate authored against
a guess.

Model `sonnet`, effort `think hard`. Read `docs/versus.md` first — it is the design this lane implements.


## THE SPEC SAYS TO BUILD EIGHT PANEL SCENES, AND NOBODY SHOULD

2026-08-28 · claude/burn-teach-spec-t3

Documentation · Designed

Write the design down before it is built, because the thing it replaces is currently an instruction sitting in the spec.

**`docs/spec/calls.md`, new.** THE CALL: a teaching wave is an ordinary `Wave` plus `lesson?: LessonId` from a closed list of three; the script is `CALLS: Record<LessonId, Call[]>` in content, a `Record` over a closed list so a lesson shipping without a script is a type error, exactly the discipline `BRIEFINGS` already uses. A call's `beat` is a **`waveBeat`**, always. The freeze is `onBeat`'s field half, not a fourth early return in `step`, and the reason is that the release is the real play. The `need` vocabulary and the anchor vocabulary, both closed lists. The two escalation stages, 16 beats and 32. And the rule that earns a test: **a call never resolves to the same subject on both screens**, with `beats` the single exemption because systems.md 5.2 lists the shared clock as the row of the split table that is deliberately not split.

**`docs/decisions.md` #23.** Why a lesson is a field on `Wave` against #18 (choreography is not derivable; `boss: { kind: "mirror", rounds }` already sits there; the derivable half — whether a lesson has been taught — stays derived as a bit in `world.brief`). Why the freeze is inside `onBeat`. Why there is no timeout and no SKIP button. A `Reconsider if:` naming the case where it breaks: a pair who reliably lock-pick a `cannonIn` gate by stepping columns, which is cheaper than talking and is not closed by anything here.

**`docs/spec/briefings.md`.** Strike §3.2 — the eight scene functions, the `Field` split out of `Layout`, the panel-sized `hull-frame.ts` — and say what replaced it and why: its own load-bearing requirement is satisfied by never building a diagram. Restate §1's "Before wave" column, now stale by three. Narrow §3.7 to the rail mark. Leave §3.1, §3.3–§3.6 alone: the card survives unchanged.

**`docs/parked.md`, two sections.** First: **waves 1–3 can be cleared in silence.** `drawCreatures` in `canvas2d.ts:188` is unconditional, so once a body is on the field both screens have it in full, and only the 6-beat radar lead is one-sided. The teaching waves are authored so no call ever claims otherwise — every line is about a *strip* or a *control*, never about a body — but the residual is real and the strongest version of this ships with one body in FIRST STEP or TWO COLOURS made genuinely one-sided. That is a change to the shipped information model and it is not decided, so it is parked and not queued. Second: **`forgetBriefings` fires on every room join.** It is called from exactly one place, `startTogether()` in `apps/game/src/main.ts`, which runs on `link.onStart` — so the "returning pair" skip is session-scoped, and a pair who put their phones down and picked them up tomorrow pay the full tax again. The save file briefings.md §3.6 already names is the answer and nothing here builds it.

Finished when `bun run check` is green and `docs/INDEX.md` lists the new page.

Model `sonnet`, effort `think`. The decisions are made in this plan; the work is writing them so a session three months out does not re-open them. Do not invent mechanism the other lanes have not been told to build.

Model `sonnet`, effort `think`. Read `docs/teaching.md` first — it is the design this lane implements.


## THE FIELD STOPS ON AN AUTHORED BEAT AND THE CLOCK DOES NOT

2026-08-28 · claude/burn-teach-call-t4

Mechanic · Designed

The mechanism. Sixteen files, but nine of them are one or two lines each and the mechanism itself is one new file — `packages/sim/src/call.ts`. Read `docs/spec/calls.md` (lane 3) first; it is the design this implements.

**State.** `world.call: { lesson, index, sinceBeat, latch, p1Col, p2Col, stage } | null` — seven integers. `p1Col`/`p2Col` are `cannonCol`/`shieldCol` as they stood at the last beat boundary, and they exist because `cannonIn(n)` means "rested across a beat boundary", which needs a remembered previous column. `stage` is 0 / 1 / 2 for the escalation. Plus `world.lesson: number` (a `LESSONS` index or -1) and a `taught` integer added to the `Briefings` interface — put it there rather than beside it, and `forgetBriefings`, which already does `world.brief = newBriefings()`, clears it for free. Every one of these into `hashWorld`, beside `world.brief` and `world.interlude`, for the identical reason both are there: **a call decides whether the field advances**.

**The freeze.** `callHolds(world)` guards only the spawn/fall/boss/pod/hull block inside `onBeat`; `world.waveBeat` does not increment and `world.beat` does, because `beatMetronome` is already `onBeat`'s first line and was factored out for exactly this. Commands, bullets, grips and the metronome all keep running — the release is the real play. `cleared` gains `&& world.call === null` so a wave whose lesson is unfinished cannot clear out from under it. `startWave` installs the lesson and clears any call.

**The needs.** `cannonIn(col)`, `shieldIn(col)`, `guard`, `fire(color)`, `gone`, `none`. Both halves must be true **on the same tick** — THE FORK's overlap rule, evaluated in sim from the world, not raced between two arrivals. `guard` and `fire` are latched in the bitfield because they are instants; that is why lane 2 had to land first.

**The escalation, and this is where D2's best idea is repurposed.** Split `applyCommand` into a hold check plus `runCommand`. At 16 beats unanswered, `stage` goes to 1 and the other seat's line stops being redacted. At 32, `stage` goes to 2 and the ship **performs the outstanding half itself** through `runCommand`, so it can never demonstrate a gesture a player cannot make and the band draws itself being pressed with no new code. Do **not** add `seatFor`: `applyCommand` ignores `timed.player` for everything but `grip`, the script authors which half is whose, and a `seatFor` in sim would be a second copy of a rule that already lives in `render/src/touch.ts` as a hit test no regex can match.

**The hull, and this is the bug two designs walked into.** `applyHullDamage` honours `cfg.hullInvulnerable`, but `breachHull` pushes the `Scar` and the `breach` event **outside** that guard (`hull.ts:254-255`). So: guard `applyHullDamage` on `world.lesson >= 0` as well — world state, hashed, never a mid-run mutation of `cfg`, which `hashWorld` does not cover at all. Keep pushing the event, so the crack draws and the impact sounds. And clear `world.scars` in `startWave` when entering or leaving a lesson wave, so three teaching cracks do not walk into FIRST STEP.

**Forced tail.** One new `SimEvent`, `{ type: "call"; index: number; open: boolean }`. `packages/audio/test/bind.test.ts` reads the union out of `events.ts` and requires a sound for every member, so this is a checked addition, not an optional one: a cue in `bind.ts`, an entry in `catalogue.ts`, a sample in the test's `SAMPLES` map. Two people looking at two phones need to hear that the other screen changed.

**Purity.** One new `COPIES` row for `callHolds`, so a second hold cannot be spelled out by hand in `beat.ts`.

**Tests.** `packages/sim/test/call.test.ts` runs a whole lesson headless with `{ ...DEFAULT_CONFIG, ...PAIR_ON }` — and note that `test:determinism` does **not** cover this for free: the gate is `cfg.briefings`, off in `DEFAULT_CONFIG`, so the determinism run plays the teaching waves as plain short waves with no call in them. Prove: the field holds and the clock does not; a satisfied need passes without drawing; both halves are needed; a sweep does not trip `cannonIn`; the two escalation stages fire at 16 and 32; the hull takes no damage and leaves no lasting scar; and two worlds disagreeing about a call disagree about their fingerprints.

`startWave` takes `lesson` with a `null` default so no existing call site breaks and this lane stays green on its own. Finished when `bun run check` and `bun run test:determinism` are green.

Model `opus`, effort `ultrathink`. **ultrathink about what two devices can disagree about while a call is open** — that is the part that is expensive to unpick later, and it is why this is the one `ultrathink` in the batch. In particular: whether every field that decides the release is in `hashWorld`, and whether a command already in flight from `inputDelayTicks` ago can land on a tick where one device thinks a call is open and the other does not.

**Behind t1 and t2, not beside them.** The files this lane's work lives in —
`world.ts`, `beat.ts`, `hash.ts` and whatever t1's split leaves behind — are
being reshaped by those two first. It adds to them; it does not own them.
Starting it early means authoring against a layout that is about to change.

Model `opus`, effort `ultrathink`. Read `docs/teaching.md` first — it is the design this lane implements.


## SEVEN WORDS A SCREEN, AND THE THREE WAVES THEY BELONG TO

2026-08-28 · claude/burn-teach-script-t5

Mechanic · Designed

The words and the waves. `theThreeWaves` in the plan this lane came from has every entry, every call, every beat and every line already decided — author them, do not re-decide them.

**`calls.ts`, new.** `CALLS: Record<LessonId, Call[]>` over the closed list in `sim/call.ts`, so a lesson shipping without a script is a type error. `buildLesson(waveIndex)` beside it, the sibling of `buildBoss`, and a `callsFor` that remaps a call's authored columns through **`mapCol`** — a call's `col` and the entry it points at must not be able to land in different columns on an 11-column field, and `mapCol` is called, never re-derived.

**`waves.ts`.** WAVE 0 · ONE OF YOU CAN SEE IT, WAVE 1 · COLUMN AND BEAT, WAVE 2 · WHAT TO CALL THEM, at indices 0, 1, 2. Each has its one sentence (`docs/spec/wave-design.md` 8.3) and none of them is padding. `wave-types.ts` gains `lesson?: LessonId` with the comment saying why it is not the `briefings:` field decision #18 refused.

**`interludes.ts`.** `GAPS[10]` becomes `GAPS[13]`. Three insertions shift every index by three, and `interludeDue` compares `interludeDone !== wave`, so getting this wrong opens THE GAUGE in front of the wrong wave with nothing failing.

**The director is forced, not optional.** `serialize.ts` regenerates `waves.ts` field by field and silently drops anything it does not know, and `serialize.test.ts` compares its output against the real file — so the moment a `lesson:` field exists, that test **fails** until `serializeWave` round-trips it. Match Biome's formatting exactly, the way `textField` already does. Add a rail mark for a teaching wave beside the way `♛` marks a boss, and thread `buildLesson` through `stage.ts` and the two `startWave` calls in `apps/game/src/waves.ts`.

**`packages/content/test/calls.test.ts` is the only defence against this becoming the wall of text it replaces.** Four assertions, three of them lifted straight from `render/test/briefing.test.ts` which already runs them over `BRIEFINGS`: no line over **seven words**; no line empty; no call telling both screens the same thing; and **no call resolving to the same subject on both screens**, with `beats` the single exemption. Plus one of its own: every authored `col` is `<= AUTHORED_COL_MAX`, so nobody types a real column into a call.

Two authoring rules that are not negotiable and are easy to break. **Every line is about a strip or a control, never about a body** — "only your strip has this" stays true forever, "only you can see it" is false in five beats, because `drawCreatures` is unconditional. And **anything both screens would carry belongs in `hint`, not in a call**; the banner already shows `hint` on both for 5.5 s.

Finished when `bun run check` is green, `bun run dev` shows the three waves in the rail with their marks, and a save round-trip through the director leaves `waves.ts` byte-identical.

Model `sonnet`, effort `think hard`. **Think hard about the word count and the anchor rule before you write a single line** — those are the two things that will slip, and the test has to be written first so they cannot.

Model `sonnet`, effort `think hard`. Read `docs/teaching.md` first — it is the design this lane implements.


## A BRACKET, FIVE WORDS, AND A CHEVRON POINTING AT THE OTHER PHONE

2026-08-28 · claude/burn-teach-draw-t6

Graphics · Designed

The picture, and it is small on purpose: **nothing here animates anything the game does not already draw.** The blip hanging on the strip is `drawRadar` with `waveBeat` frozen — `field.ts:135` derives height as `q.beat - (world.waveBeat - 1)`, so the animation *is* the radar, held still, and this lane writes none of it. The lobe sliding under the target is the real membrane, the real `Glide`, the real `blobPath`. The shot, the pop, the crater, the deflection flash and the crack are all real events through the existing `Effects`, because bullets and the hull keep working during a freeze. What this lane draws is the pointer.

**`call.ts`, new, ~120 lines.** `drawCall(ctx, layout, world, role, call)` — a pure function of a `Call`, exactly as `drawBriefing` is a pure function of the world, so it holds nothing across frames, `Effects.reset()` gains nothing to clear and `restart.test.ts` stays green without an edit. Anchor resolution per role against `Layout`: `beats` and `hull` (both screens); `column(n)` and `body` (both — `drawGrid` and `drawCreatures` are not role-gated); `strip` (this screen's own radar strip, role-relative by construction); `radar(n)` (real on the owner's screen); `fire(color)` (p2 and `test`, off `layout.fireButtons`); `trigger`, `maw`, `lance` (p1 and `test`); `cannon`, `shield` (off `showsCannon` / `showsShield`); `mark(n)`, an amber column marker standing on the grid on one named screen only — the `pod` amber this game already spends on "here, this is the thing"; and **`elsewhere`**, which is not a place on this screen at all: a chevron at the stage edge pointing at the other phone, with the other seat's line beneath it as grey word-shaped bars.

**`redact.ts`, new.** Lift `redact()` out of `briefing.ts:146` into its own file with two callers, so they cannot drift. It is the piece the card already invented and explained: a single grey bar says "something is hidden", a row of word-shaped bars says "they are holding a sentence you need", which is the thing that makes somebody read theirs out loud. A chevron turns it into a direction.

**Format discipline, drawn.** One line, in the seat's own colour, beside its bracket — never in a panel, never centred, because the eye has to go to the thing. At 375 px portrait that is one line of 11 px Courier and a 2 px bracket. The bracket breathes on `beatPhase`, which is already in `ViewState` and identical on both devices, so even the pointer is on the beat. On the `test` role, stack both halves prefixed `1·` and `2·` so a desk tester and the director see the whole of what the pair sees between them, and resolve `elsewhere` to nothing there.

**Wiring.** One contiguous line in `canvas2d.ts`, over the pause overlay and under the card, drawn from `CALLS` via the helper the content lane exports. `canvas2d.ts` is owned by nobody — add in one region and expect to replay over somebody else.

**Test.** `packages/render/test/call.test.ts`: every call in the catalogue, every role, through the strict canvas stub that refuses what a real canvas refuses — including a screen too narrow for a word, and a `radar(n)` anchor on the screen that does not own that strip. Build `Call` fixtures by hand so the file is complete before the catalogue is.

**Land after the content lane**, which owns the catalogue the wiring line reads; if both finish together, rebase onto it and the wiring is your last commit.

Finished when `bun run check` is green, `bun run preview` shows a call on both seats at 375 px, and `restart.test.ts` is untouched.

Model `sonnet`, effort `think hard`. **Think hard about `elsewhere`** — it is the one anchor with judgement in it, and it is what turns "my screen is missing something" into "ask them". Everything else on this list is a bracket.

Model `sonnet`, effort `think hard`. Read `docs/teaching.md` first — it is the design this lane implements.


## EVERY BODY MOVES A ROW ON THE SAME INSTANT AND NONE OF THEM ARRIVES

2026-08-28 · claude/burn-body-land-c5

Graphics · Designed

The beat arriving in a body, and the hull's approach arriving with it. Behind lanes 3 and 4.

A new pure file in `content`, so nothing here reads a world: `Drive` (a struct of plain numbers: `beatPhase`, `moved`, `dread`, `held`, `jolt`, `shockX`, `shockY`, `scatter`) and `poseWith(motion, beats, drive)`, which composes an `OwnMotion`'s pose with the impulses. `own-motion.ts` is not touched — lane 3 owns it, and `poseWith` taking an `OwnMotion` is what keeps these two lanes from colliding.

**The landing and the gather.** With `p = beatPhase + (scatter - 0.5) * 0.08`: `land = max(0, 1 - p/0.32)^2`, `gather = max(0, (p - 0.75)/0.25)^2`, and `squash = landGain * (0.18*land - 0.07*gather)` applied volume-preserving as `sx *= 1 + squash`, `sy *= 1 - squash`, plus a small `dy`. Position stays exactly linear — `creatureCenter` is untouched, because "it lands on the three" is a statement both players act on across a two-second delay and the even glide is what makes it one. **The overshoot goes in the pose, never in the position.** `landGain` is a new named field on `OwnMotion`... which lane 3 owns, so take it as a `Record<CreatureKind, number>` in this file instead and say in the comment that it wants to move onto `OwnMotion` once the two lanes are both on `main`. Bulb 1.0, slick 0.6, runt 0.4, **throb 0.0** — and write the reason down as a rule rather than a value, because the next person raising SWAY_PUMP's pump needs it: `throbOpen` is a gameplay signal telling the pair when to fire, so the throb keeps a monopoly on beat-synchronous scale change and no other body may express the beat in size. The slick's 0.6 exists because it is the one kind whose squash could walk it toward the round three; check the direction — at maximum it goes to ~2.24, away from them, not toward.

**Dread.** `dread = clamp01((c.row - (hullRow(cfg) - 3)) / 3)`, zero until three rows out and one at the hull, scaling everything the body already does by `1 + 0.55*dread` and doubling the gather in the last row before impact. No new motion is invented; the existing one gets louder. Amplitude scaling touches no shape parameter, so it is free of nameability risk by construction — and it is not decoration: agitation is a second, peripheral channel telling the pair which lane is about to cost them, readable without reading a row number.

**The elliptical pen, and nobody in three design proposals noticed it.** `drawLiving` composes `ctx.scale(scale * sx, scale * sy)`, so a non-uniform pose strokes the outline with an elliptical pen: apparent line weight varies by direction at exactly the instant the squash peaks. This is already true today at SWAY_PUMP's +/-10%; this lane takes it to 18%, a swing `docs/spec/graphics.md` pins at 1.2-1.8 px cannot absorb. Fix it in the one contiguous region this lane adds to `creatures.ts` — compensate `lineWidth` against the geometric mean of `sx` and `sy`, or stroke outside the non-uniform transform. Say in the commit which, and that it changes the resting look slightly because the bug predates the batch.

The gate from lane 2 must be green with `landGain` at these values and red if any of them is doubled; that is the acceptance test, not an eye.

**That gate has since been built, and it says these values are red on arrival.** `claude/burn-body-gate-c2` landed the three-axis nameability test, and its finding is specifically about this lane: BULB and THROB are held apart by the **lobe axis alone**, and the lobe axis answers to the pose, because a squash is a second harmonic that competes with the nine bumps. The bulb's pump sits exactly on its ceiling — 0.10 passes, 0.11 fails — so the 0.18 squash written above fails the moment it is applied to the bulb. This is not a reason to weaken the gate; the gate is the thing that caught it. Run `bun run shapes:report` and read the TOLD APART BY block before choosing a number. The brief's own fallback is the likely answer and it lands under the ceiling: **halve every `landGain`** — bulb 0.5, slick 0.3, runt 0.2, throb still 0.0 — giving a ~0.09 squash, and let the directional gather carry the beat. If a halved gain reads as nothing, that is the finding, and the choice between a legible landing and nine countable lobes is a decision for the orchestrator, not something to resolve by widening a cap.

Finished when `bun run check` is green, `drive.test.ts` proves every impulse decays to under 1% by mid-beat and that `sx * sy` stays within 1% of 1 at every sample, and the commit carries `Check: does the unison landing read as tempo or as twelve metronomes — a full wave at tempo, then a two-body wave`.

Model `opus`, and think hard about **whether the unison is tempo or a metronome** — it is the one item in the batch with real nameability exposure, D3 itself calls its own hedges "the argument, not the evidence", and the fallback if it reads mechanical is to halve every `landGain` and let the directional gather carry the beat alone.

Model `opus`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.


## A THING DIES AND EVERYTHING AROUND IT CARRIES ON EXACTLY AS BEFORE

2026-08-28 · claude/burn-body-shock-c6

Graphics · Designed

The only change in the batch that makes one creature react to something that happened to another, and the largest visible motion proposed anywhere — up to 0.35 tiles, about 12 px of whole-body translation, at the most-watched instant in the game. Behind lanes 4 and 5.

Right now a kill is a silhouette vanishing behind a particle burst while its neighbours carry on unchanged, which reads as objects being deleted from a list. `Effects.ingest` already receives `destroy`, `runtHit`, `petal`, `queenDown` and `wardenDown`, and **all five already carry `col` and `row`** — check `packages/sim/src/events.ts` and confirm before building. Push `{ x, y, age: 0, life: 0.45, power }` (power 2 for the two boss deaths) into a new list, age it in `update`, and per creature accumulate `k = power * (1 - age/life)^2 * max(0, 1 - dist/(2.6*l.tile))` as a push away from the source, clamped to 0.35 tiles total. Shocks are few and short-lived, so this is a handful of multiplies per body. It feeds lane 5's `Drive` as `shockX`/`shockY`; it is pure translation, no colour and no scale.

**This is new render state that outlives a frame**, and it is the only thing in the batch that is. It goes in a list on `Effects` and **must be cleared in `Effects.reset()`**, which `Canvas2DRenderer.waveRestarted` calls on every way a wave can start over — `packages/render/test/restart.test.ts` compares structurally against a fresh `Effects` and fails if a new field is added and not cleared. That is correct behaviour, not an obstacle; `world.beat`, `world.tick` and `world.nextId` all restart at 0 and state cached against them is read by the next run as its own.

`packages/render/src/effects.ts` is 241 lines and owned by nobody — add the field, the ingest case and the reset line in one contiguous region each, and put the falloff maths in this lane's own `shock.ts` so the region in `effects.ts` stays three lines.

**The risk to watch, and it is the one failure in the batch that misinforms a player rather than looking wrong.** Three bodies flinching when one dies may read as a chain reaction and invite a wasted shot. The mitigations are the short falloff, the pure translation and the absence of any colour change — but they are arguments. This is the first thing to look at on a phone, and if it reads as damage it is worse than nothing, because it lies about the rules.

Finished when `bun run check` is green, `restart.test.ts` passes without being weakened, a test proves the list is empty after `reset()` and that a shock decays to zero within its life, and the commit carries `Check: does a neighbour's flinch read as sympathy or as damage — fire into a cluster and watch what a partner assumes`.

Model `sonnet`, `think hard` — the pattern (an `Effects` field aged in `update` and cleared in `reset`) already exists several times in the file; the hard part is the falloff radius and whether it lies, and that is named above.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.


## A BODY UNDER A HAND SWAYS EXACTLY LIKE A FREE ONE

2026-08-28 · claude/burn-body-held-c7

Graphics · Designed

What the two players do to a body, drawn on the body. Behind lanes 4 and 5.

One new file that reads the `World`, the `SimConfig` and `Effects` and hands lane 5's plain-number `Drive` to `poseWith` — so the direction of flow stays one way, render still decides nothing, and `content` stays pure. Everything it reads exists: `gripsCreature`, `gripCount`, `hullRow`, and `Effects.blocked`, which already holds a per-id countdown from 0.35.

**The hit-stop comes first, and it is the only item in this batch that makes a silhouette *more* legible.** For the first 60 ms of `blocked` — while the countdown is above 0.29 — draw the pose lerped fully to `REST`: no sway, no drift, no impulse, and quantise the `t` fed to `blobPath` so the contour freezes too. That is the clearest, stillest, most canonical look at a shape anywhere in the game, and it happens at the exact moment the player is looking hardest at that one body. D3 wanted to answer a blocked shot with *more* motion; this is the opposite and it is right.

**Then the recoil.** With `b = blocked/0.29` decaying from 1: a volume-preserving squash of about 0.18 scaled by `b*b`, a small upward `dy` because the shot came from the hull below, and amplitude scaled by `1 + 0.6*b`. The existing grey-outline branch stays; it stops being the *whole* response. A wrong-colour hit currently reads as the silhouette going grey behind a particle cloud, and `docs/spec/graphics.md` asks in its own words for a short hit-stop and a reaction proportional to its cause — there is none anywhere in the pipeline today.

**And the grip.** `grip.ts`'s own comment says the entire point of the mechanic is the *other* screen seeing that a hand is on something, and yet a held creature currently sways identically to a free one — the whole mechanic lives in a ring drawn around it. Under a hand: `sy *= 1 + 0.09*held`, `sx *= 1 - 0.09*held`, and own-motion amplitude cut by 35% — the body is stretched between the hand pulling up and the fall pulling down, and pinned rather than free. One consequence falls out for nothing: `grippedFallTiles` returns 0 for a held creature on most beats, so `moved` is 0 and it gets no landing kick — the grip becomes visible as an absence of the field's pulse, a body held out of time.

Add to `creatures.ts` in one contiguous region; it is owned by nobody after lane 4.

Finished when `bun run check` is green, a test proves the pose is exactly `REST` for the first 60 ms of a block and that every reaction returns to within 1% of the canonical pose, and the commit carries `Check: does a held body read as held from the other seat, at arm's length` and `Check: is the hit-stop visible at all, or is 60 ms below the threshold on a phone`.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.


## THE ONE BODY THE FICTION FORBIDS FROM LOOKING ALIVE IS THE ONLY ONE WITH VOLUME

2026-08-28 · claude/burn-body-skin-c8

Graphics · Designed

Last on purpose, and **conditional**: build it only if the field still looks flat once the bodies are behaving. Everything before this is behaviour; this is the only lane that is decoration, and it is also the only one whose premise a judge argued might be wrong — `docs/spec/graphics.md` says liveliness at 20-26 px comes from motion with overshoot and not from detail, and the flat swatch may be a deliberate reading of that line rather than the omission three readers took it for.

The counter-evidence is in the file itself: `drawMeteor` builds a linear gradient, and the indestructible rock — the one body whose fiction requires it to look inert — is the only thing on the field with volume. A viewer currently finds more depth in the meteor than in the bulb beside it.

**Three things, and no more.** (a) `coreFill`: replace the flat `dark` swatch with a cached radial gradient in the shape's local coordinates, offset toward one implied key light shared by every body on the field, with stops `mix(dark, hex, 0.34)` -> `mix(dark, hex, 0.12)` at 0.5 -> `dark` mixed 35% toward `PALETTE.background` at the rim. The outermost stop is the whole point and it is why this is the safest interior item in the exercise: it *darkens* the body at the edge and raises the rim-to-interior contrast the lobe read depends on, instead of eroding it like every other interior proposal. Cache in a `Map` keyed by colour and shape — three colour triples times four silhouettes is at most twelve gradient objects for the life of the process. **Never construct a gradient per frame**, and never build a breathing radius through `halo()`: `haloSprite` keys on `${color}@${radius}` and allocates a canvas on a miss, which is exactly the trap `sheen.ts` guards against with `Math.round(.../4)*4`. (b) One clipped inward membrane stroke, `innerLight`'s technique from `sheen.ts` re-expressed as fractions of the body radius rather than pixel constants, so it survives at 26 px — it follows every lobe and puts a bright inner edge on each one, which should make lobes *easier* to count. (c) Widen `strokeGlow`'s `color` parameter from `string` to `string | CanvasGradient`. It is assigned straight to `ctx.strokeStyle`, so every existing caller is unaffected and there are zero extra draw calls, and a colour gradient around the loop varies apparent line weight — which is what a constant stroke weight all the way round a closed contour costs you: it is the signature of vector clip-art. **The rule is colour only, never alpha**: add named deep swatches (`redDeep`, `cyanDeep`) to `palette.ts` so all three stops are fully opaque and the rule is enforced by the palette rather than by memory, because a stop reaching zero alpha opens a hole in the outline and a silhouette with a missing bottom edge is a different word.

**Explicitly not built**: the travelling gleam (a 9 px additive dot at alpha 0.35 on a 30 px contour looks like a bullet, and D3 admits it); a second organ, or any organ at all on the runt, which draws at about 10 px — below graphics.md's own "at 11 px nothing of a figure survives" line, so everything the runt says it says with tremble amplitude and with the absence of the field's rhythm; iridescence, because a third colour on a body whose red-or-cyan is a gameplay fact the pair says out loud is worse than a body that is merely less alive; and any drifting, unmirroring or breathing of the detail dots, which are 1.0 px in radius with 0.5 px filaments. If the details are worth an entry, the entry is deleting them and letting the gradient carry the interior.

**Budget the brightness, not just the cost.** "Creatures stay the brightest thing on the field" is a ratio, and this adds light inside the rim. Drop `strokeGlow`'s pass count for creatures from 3 to 2 (an optional `passes` argument), since the inner light now carries part of the rim read. Check the result against the hull's five sheen passes and against a Simon round's green, which is the one colour in the game that must never be competed with.

Finished when `bun run check` is green, `frame.test.ts` passes with the new fills through the strict canvas stub, no gradient or halo sprite is allocated after the first frame, and the commit carries `Check: does the interior gradient survive 26 px, or is the spec right that it does not — desaturated shape sheet at 26 px, rim peak at least 2.5x the interior peak`.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.


## ONE PREDICATE STANDS BETWEEN THIRTEEN CREATURES AND A PICTURE

2026-08-28 · claude/burn-drafts-suggest-p1

Tool · Designed

A draft shape names the idea it is offered to through `suggests`, and
`drafts.test.ts` resolves that name against `docs/spec/ideas.md` and
`docs/spec/bosses.md` only. The thirteen unbuilt creatures in the bestiary are
table rows rather than idea-store sections, so a draft cannot legally point at
one — which means the largest undrawn group in the repository is the one group
nobody can draw for.

Found by the lane that drew six shapes ahead of the need and then ran out of
things it was allowed to offer them to. It called it one predicate, and it is:
`roster.ts` already parses the bestiary table into named rows, so the
resolution has a second source waiting for it.

Finished when a draft can name a bestiary creature, when a name that matches
nothing still fails loudly, and when `bun run shapes:report` shows at least one
new contour offered to one of the thirteen. The rule that has to survive: a
`suggests` pointing at nothing must remain an error, because the whole value of
the field is that a drawn shape is joined to the idea it serves.


## A tangle that re-forms while the pair is still reading it

2026-08-28 · claude/burn-boss-maze-b1

Mechanic · Idea

THE MAZE fixes its tangle for the length of a round: the lattice is built once,
the pair reads it, and the answer stays true until somebody fires. The lane
that built it says plainly that the re-tangling version — where the forks
reshuffle while the round runs — is the better *system*, and refused it anyway,
because it is a different round under a 0.5–2 second voice channel. A sentence
that was true when it was started can be false by the time it lands, and that
is either the whole point or a way of making two people feel stupid; nothing in
the tree says which.

Not a defect and not queued. It wants deciding by watching the fixed version
played first, which is the one thing that cannot be done until the round is
drawn.
