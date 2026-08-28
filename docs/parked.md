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
it, then two or three sentences: what it is, why it was not done then, and where to start.

An entry leaves by being **deleted** — done or refused, the history keeps it
either way. Nothing is ticked here. A file of ticked boxes is a file nobody
reads to the bottom of.

## No shape is drawn at any of the twelve interludes

2026-08-27 · claude/game-in-game-mechanics-uxmysp

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

`world.brief.met` is a bitmask over `BRIEFING_SUBJECTS`, and anything that
wants to know whether a subject has been met computes its bit from its index.
`packages/sim/test/purity.test.ts` keeps a table of rules that must be called
rather than re-derived, for exactly this class of mistake, and this one is not
on it.

Not done there because adding a row means editing a shared test file that
another lane was in at the time. It is one row.

## The Throb's swell cannot be judged in the tool built for judging swells

2026-08-27 · claude/burn-shapesheet-b8

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

THE VANE folds an arrival about the arm's column, and it does it at row 0
precisely so a thrown body is *born* in its landing column and is never seen
to jump. That was the cheap way out of a gap: `Creature` has no `fromCol`, so
there is nothing to interpolate from and no mechanic in this game has ever
moved something sideways once it was falling.

Not done there because it is a wide edit — every construction site of a
`Creature`, plus `hashWorld` — and the boss did not need it. The next mechanic
that wants something to *drift* across columns will, and THE BELT in
`docs/spec/interludes.md` is the one most likely to ask.

## THE CONDUCTOR's slot is spent and the beat is still unbent

2026-08-27 · claude/burn-vane-b7

THE VANE took the act slot that `docs/spec/transfers-bosses.md` drew the
pendulum arm for, and bent the field's geometry rather than its tempo. The
original worry about bending the shared *beat* — that the beat is the one
thing surviving a two-second voice delay, so a boss that moves it attacks the
pair's only reliable ground — is untouched and still deferred.

Worth writing down because the arm is now spent, and the next session reaching
for THE CONDUCTOR will find its picture already in use and should know that is
deliberate rather than an oversight.

## THE VANE is silent

2026-08-27 · claude/burn-vane-b7

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
