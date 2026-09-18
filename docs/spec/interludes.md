# Rounds that are not the field

> **Status: four are built and all four are boss waves.** THE GAUGE is
> `packages/sim/src/gauge.ts` (the dial) and `packages/sim/src/gauge-round.ts`
> (its clock), its picture is `packages/render/src/gauge.ts` and
> `gauge-round.ts`, and it is reached by one line in `waves.ts`:
> `boss: { kind: "gauge" }`. SNAKE is `packages/sim/src/snake.ts` and its four
> neighbours, its picture is `packages/render/src/snake-draw.ts` and
> `snake-round.ts`, and it is reached the same way — `boss: { kind: "snake",
> rounds: SNAKE_ROUNDS }`, with the arenas authored in
> `packages/content/src/snake-rounds.ts` and edited on the wave itself in the
> director. PINBALL and THE PULSE are the third and fourth, built the same way
> — `boss: { kind: "pinball", rounds: PINBALL_ROUNDS }` and
> `boss: { kind: "pulse", stages: PULSE_STAGES }` — and THE PULSE is the first
> whose *panel is the same in both seats*, which is not an exception to
> condition 2 below but a different answer to it: the verbs are shared and the
> split is in what each screen can read (`docs/spec/bosses.md` 11.8). The other
> eight candidates are in
> [the idea store](ideas.md#interludes); where they came from is
> [transfers-hazelight](transfers-hazelight.md). One thing in the game already
> had this shape without being called it —
> [THE MIRROR](bosses.md#113-the-mirror--your-own-ship-asking-for-your-moves-back),
> which suspends the field, plays Simon Says on the pair's own controls and
> hands the field back.
>
> **The file is still called `interludes.md`, and the word is history.** These
> were designed as *interludes*: a fourth kind of thing beside the wave, the
> boss and the pod, sitting in the gap between two acts and reached from a
> table of its own. That category was retired by the owner in August 2026 and
> every trace of it is out of the code —
> [`docs/decisions.md` #20](../decisions.md) has the argument and what it cost.
> The page keeps its name so the links into it still work; what it describes is
> a **round**.

## What a round is

A **short encounter with its own rules, its own controls and its own picture**,
in which the field is gone and nothing falls. It has a beginning, one rule,
four or five repetitions of that rule, and an end. It is over in about ninety
seconds. Nothing it teaches is used again.

That last sentence is absolute, and was asked about and left standing on
8 September 2026. Reading the party games raised the case for a return —
a round met in act 2 coming back in act 7 with its clock turned is the one
place a pair could find out they are *good* at something, and it costs a row
in `waves.ts` and a number in `SimConfig`. The owner said never repeat: eleven
rounds, eleven acts, each thrown away. A run is about the field getting harder,
and a round is a break from it. Do not propose a second meeting again.

Three things make it one, and all three are required:

1. **The field is gone.** Not decorated, not re-skinned, not paused behind a
   panel — gone. Eleven columns and fifteen rows are what the pair spends a run
   learning to talk about, and a round that borrowed the grid is a wave with a
   costume on.

   **The field is the grid, not the ship.** The owner drew that line in
   September 2026, looking at THE PULSE: he asked for the round to be *more
   integrated, how a regular game with control panel looks — to see the ship
   and its controls, and buttons in the same style as the default set*. The
   first four rounds all threw the hull and the band away along with the
   columns, and on a rhythm round that made the last boss of an act look like a
   different game. So a round may keep the ship and the panel — they are what
   the pair are holding, not what the pair are reading — and what it may never
   keep is the eleven columns, the bodies falling down them, and the vocabulary
   that hangs on both. THE PULSE keeps the hull, the band, the HUD and the
   backdrop; it has no grid, no radar and no wave of creatures. What falls down
   it *is* the game's own bodies — a slick, a bulb, a meteor and a pod — into
   four sockets cut into the hull, and one nobody answers sinks through the
   ship the way a rock does.

   **PINBALL followed it, and went one step further.** The owner asked for the
   same thing there — *the game area field must look like default game play with
   the ship, and the control set area* — and on that round the ship is not only
   present, it is the mechanism: the thing the ball is fired from and caught with
   is the **cannon**, slid by the ordinary strip at the ordinary speed. The
   table stands in the space the grid would be and is eleven columns wide, so
   the pair may say a column out loud — which is as close to the field's
   vocabulary as a round is allowed to come, and it is close because the ship is
   there rather than because the grid is. There is still no grid, no radar and
   nothing falling down a column on the beat.
2. **Neither player can play it alone.** Each holds half the information or
   half the verbs, and the round does not resolve without both. This is filter
   6 in [transfers-hazelight](transfers-hazelight.md#the-filter) and it is the
   one that most candidates fail.
3. **It is learnt in one sentence.** Its briefing card is that sentence, split
   in half like every other card: no tutorial, no legend. The pair looks at two
   devices, one of them says what they can see, and that is the teaching.

## It is a boss wave, and that is the whole of how it is reached

A round holds a boss slot the way any boss does. `waves.ts` names it,
`startWave` installs it, `world.boss` holds it, and when the round is over the
boss goes and the wave clears on the next beat like an empty field. There is no
gap table, no `cfg.interludes`, no second meaning for `needWave` and no
`interludeDone`.

That is not a small saving and it is the reason the category went. Each of
those was a place the rest of the game had to learn about something it did not
otherwise care about, and each of them would have been paid eleven more times.
What a round costs now:

| Part | Where it goes |
|---|---|
| The wave | one entry in `packages/content/src/waves.ts`, `boss: { kind: … }` |
| What it is made of | `packages/sim/src/<round>.ts`, integers, the seeded `Rng`, the tick counter |
| Its clock and its hull cost | `packages/sim/src/<round>-round.ts` |
| Its numbers | `packages/sim/src/config-<round>.ts`, spread into `DEFAULT_CONFIG` |
| Its panel | one `ControlSet` of slabs in `packages/content/src/control-sets.ts` |
| Its picture | `packages/render/src/<round>.ts`, one file per round |
| Its guide | the `guide:` on that same wave entry, and its rehearsal in `packages/content/src/scenes.ts` |

**Nothing needs a third home.** A round's *tuning* is `SimConfig`, split into a
block of its own; a round's *authored content* — if it has any — is the `boss:`
entry, the way `{ kind: "maze", rounds: MAZE_ROUNDS }` is. THE GAUGE has none:
its entry is `{ kind: "gauge" }` and every number about it is tuning. If a round
seems to want a place that is neither, its data is on the wrong side of that
line.

## The three decisions the shape makes

Settled when THE GAUGE was built, revisited when it became a boss, and the next
eleven inherit them. Each was a real fork; the argument matters more than the
answer.

### A mode of one world, not a world of its own

`world.boss` is a field on `World` and the round is an early return in `step`.
The alternative — a second `World` with its own `step` — was rejected because of
the seam rather than the rules: two worlds need a supervisor holding the switch
between them, and that supervisor is the one piece of state no fingerprint
covers. Two devices could then agree about everything inside a round while
disagreeing about *which round they are in*. One world keeps one `step`, one
`hashWorld`, one replay format and one command stream.

The price — the word "round" meaning two things — is paid where it is
cheapest. `step` returns before it reaches a single rule of the field, so
`bullets.ts`, `beat.ts` and `hull.ts` never learn the round exists.

**The clock keeps running, the wave does not.** `world.beat` advances through a
round exactly as it does through THE FORK — the metronome is the game's
heartbeat and the ear would notice ninety seconds of silence — but `onBeat`'s
field work does not run, so nothing spawns, falls or reaches the hull.
`world.waveBeat` stands still.

It is also the one boss stepped on the **tick** rather than on the beat, and
from `step` rather than from `stepBoss`. A valve that only answered on the beat
would feel like a queue rather than a hand on something.

### A round ends on its own clock, and failing costs the hull

Three phases: a `lead` of four beats so the pair can read two screens that have
just stopped being the field, `play`, and a `verdict` of five beats. Each round
answers one question inside `play` — passed, out of time, or still going.

**Failing breaks the hull.** This is the one rule that was reversed rather than
carried over. The old category said a round may never end the run — *"a run ends
on the field, on a hull that reached zero, in the coordinate system the pair has
been naming out loud all evening"* — and that sentence is **retired**. A boss
that costs nothing is not a boss, it is a screen you wait out. So: the round
does not draw a hull and the hull is still at stake. `world.hullMilli` persists
underneath the round's picture, running out of time takes `cfg.damage<Round>`
off it in the middle column — the round has no columns of its own — and the
scar is still there when the field comes back. A run can end in a round.

What failure costs is a number in `SimConfig` and it is the owner's to turn.

THE GAUGE's own dials are in `packages/sim/src/config-gauge.ts`.
`gaugeRoundBeats` is how many beats the round lasts before time runs out.
`gaugeMarks` is how many marks pass the round — four or five repetitions of one
rule. `gaugeSpanMilli` is half the distance between the two marks, in
thousandths. `gaugeDriftMilli` is how far the band walks each beat, which is the
whole of the pressure. `gaugeTurnMilli` is how far the pilot's valve moves the
needle each tick. `gaugeCallRestBeats` is the beats between two calls, landed or
not, so a held thumb is slower than talking.

### The two states it changes into, and the two thumbs that answer them

*18 September 2026, `.claude/skills/new-boss` §6.2. The simulation is
`packages/sim/src/gauge-hand.ts` and `gauge-band.ts`.*

The round shipped with **one** state in it: turn, talk, call, for ninety
seconds. What it has now is two more, and the point of both is that the pair's
own last answer is what enters them. The round is never in a state the two of
them did not just put it in, and neither seat can see the whole of why.

**The jam, his.** A call that misses sticks the valve — `gaugeJammed`, from
`jamBeat` — and the needle stops answering the thumb he is still holding.
Until the next call lands, the needle is his hand on the needle itself: a drag
at `gaugeNeedle`, read as a **bearing** round the dial (`bearing.ts`), so it
goes where the finger points rather than walking there. That is instant where
the valve is slow, and what it costs is `gaugeSettleBeats` after he lifts, in
which a call is *refused*. The sentence stops being *left — less — less* and
becomes *swing it over — stop — wait — now*. A miss was the one thing in this
round that was free; what it costs now is the control.

**The bind, hers.** Every `gaugeBindMarks` marks the band winds tight to
`gaugeBoundSpanMilli` — under a third of its width — and the one after it lets
go, so the round alternates rather than ending in one state. Her thumb on
`gaugeBand` holds it open: full width, and the walk stopped, for as long as she
keeps it there. **She cannot call while it is down.** That is the whole price,
and it is why the bind is a gesture rather than a button: the pair has to agree
out loud on the moment she lets go, and that moment is the only thing in the
round she does not decide alone.

Both refusals are **refusals and not misses**. A call under her own thumb or
over a needle still settling is turned away without charging her, because both
are the round asking for something else at that moment and the rest between
calls would run as well — a pair doing exactly what was asked would be slowed
for it.

`gaugeSpanNow` is the one number the whole round is judged against, and it is
**called and never re-derived**: the picture draws the band at the width the
judgement uses, so the pair can never call a needle the screen shows between
the marks and be told it was not.

**What the field says** (`render/src/boss-cue-read-e.ts`, 18 September 2026,
`docs/decisions.md` #34). Three words now, two hers and one his.

Hers are her own verbs at the moment each will land: `PRESS` / `CALL` on the
end of the needle while it stands between the marks, and `HOLD` / `OPEN` on the
middle of the band while it is wound and her thumb is off. Both the marks and
the band are drawn on her screen, so each mark stands on something she is
already shown, and each word says what her thumb does rather than where the
needle has to go. The call outranks the band: a needle already seated in the
tight window is a mark she can take without spending the thumb. Neither is the
round's difficulty — the hard half of her job is talking him there before it
arrives, and that happens in the beats when there is no cue at all.

**His is the jam, and it is a correction this reading had to make to itself.**
While the valve answers he is told nothing, on any beat, in any state: the two
marks are not on his screen (`showsGaugeMarks`), so the only word over his
valve would be a direction, which is the answer and hers to say, and there is
no beat when a turn is owed because the needle is parked on purpose while the
band walks toward it. A dead valve is different. It is a fact about **his own
half** — the thing under his thumb has stopped working — which his screen does
not show him and hers cannot. `TURN` over the needle says that and nothing
else: not the direction, not the distance, not that a call is close. It goes
quiet the moment his hand is down, because a word over a needle he is already
swinging is the field narrating him. He still keeps the rehearsal's one page
about his half (`docs/spec/briefings.md`).

**What is not built.** The grip rings and the hit tests for the two thumbs are
the look lane's, and so are the rows in [controls](controls.md) — the
simulation hears both drags and the wire carries them today. The round has no
events and no audio binding at all, which the two new states make worth
fixing; both are in [the queue](../queue.md).

What a round **may** do is give — a pod or two for the act about to start
([systems](systems.md#57-power-ups--the-pod-built)). That is not built. Pods are
wave content and `startWave` replaces `podQueue` wholesale, so the giving needs
a seam into `startWave` that the first round with something to give should cut.

### Its own controls, and not the same ones on both screens

Neither player's band is the answer. A round draws **slabs** instead: whole,
per-seat buttons that replace the band rather than sitting in it.

They are a **control set**, registered in `packages/content/src/control-sets.ts`
beside the field's own. That file used to refuse them, on the ground that the
thing reaching for them was a round and not a wave; a round is a wave now, so
the objection is gone. A set's kind — `band` or `slabs` — is *derived* from the
controls in it (`panelForm`), never declared beside them: the field's own sets
say nothing new, a round's set is a slab panel by virtue of what is in it, and a
set that mixed the two is not a panel and throws.

`slabPanel` in `packages/render/src/slabs.ts` places them, dividing a seat's
width by however many that seat has — so a seat with one button gets one wide
button rather than a gap where two others used to be. **Three readers, one
layout**: the draw, the game's hit test and the director's all ask it, so a
control is never drawn where it is not answered. That property is worth more
than the file it lives in; it was the bug the round shipped with once already.

Two screens showing the same controls would be the field with a different sprite
on it. In THE GAUGE, `showsGaugeMarks` and `showsGaugeValve` are what make them
different, and they are role predicates in render/ for the same reason
`showsQueenHint` is: the information split is a fact about a screen, not about
the world. Which seat may send which command is checked in the simulation.

SNAKE splits both halves at once and it is worth reading as a pattern rather
than as a second example. The **verbs** are split by job: player 2 has the
whole of the steering — two quarter turns, relative, the arcade game's own
controls — and player 1 has the two things the body does when it arrives, a
shot out of the head and a mouth. The **information** is split to match:
`showsSnakeFood` gives player 1 the enemies, the points and both ends of the
body, `showsSnakeBody` gives player 2 the whole length and none of the things
either of them can act on. So the seat that can reach a thing cannot see it and
the seat that can see it cannot reach it, and every verb in the round is
somebody answering a sentence.

**The shot carries three tiles and no further** (`snakeShotTiles`). It used to
carry the width of the arena, which quietly took the steering out of the round:
an enemy eight tiles up column four was answered from the opening square, and
player 2 had nothing to do with it. A spit that reaches three tiles turns the
sentence the pair says most from "it is lined up" into "bring me to it", which
is the sentence the round is for. The picture says so — the venom lands in
mid-air when it found nothing, which is the pair being told the reach ran out
rather than the aim did.

**What the field says** (`render/src/boss-cue-read-g.ts`, 18 September 2026,
`docs/decisions.md` #34). Two words, both player 1's, and the driver is told
nothing at all. `PRESS` / `OPEN` on a point standing in the tile the head is
about to step onto — the mouth is a window rather than a hold, so the word
comes out on the last step before it is owed and never earlier — and `PRESS` /
`FIRE` on the enemy a shot taken this instant would actually reach, which is
`snakeShotStop`'s answer and not a second walk of the arena, so the word cannot
promise a hit a meteor would take. The point comes first, because it expires
first. Both marks stand on things drawn on his screen alone
(`showsSnakeFood`), and both go out with the phase.

**The driver gets no word, and that is the reading rather than a gap in it.**
Her screen is the body and the meteors, so everything that would make a `TURN`
come out is either the half she is not shown or the one thing she is: *which
way* is the answer, and it is his to say. A cue that turned her would be a
second driver.

**The look, rebuilt 18 September 2026.** SNAKE was the last round but THE
GAUGE still drawn as a slab panel over a dark plate with an ember box round
the arena, and the owner asked for it to follow the others: the ship shown,
the buttons like every other button, the box gone and the arena grown to the
whole of what is left. So the ship stands on the screen with its real scars,
the band holds the panel, and the arena is the air above the hull — as wide as
the field's columns, or as tall as the header leaves, whichever the tiles run
out of first — with the three walls as THE SCOUT's hairline and no floor,
because the floor is the hull (`render/snake-draw.ts`, `snakeArena`). The
four presses are lobes on the band (`snake-button.ts`): player 2's two carry
the nose the body is pointed at and the arc of the turn, THE SCOUT's own
glyphs, and light while a turn is queued; player 1's two carry the head
itself — a venom-green one with the chevrons of the shot fading in as the rest
runs out, and an amber-pod one whose jaws open with the mouth's own window.
`touch-lobe.ts` answers all four as one press each, so the round needs no
listener of its own in the app or the director.

**The fold is gone, and the body comes out of the ship instead**
(`render/snake-emerge.ts`). The round used to open with the hull scaled down
into the body's first tile; the owner asked for the ship to stay and for the
body to come *out of it*, out of the cannon's slot, like a worm pushing out of
a cocoon. Over the same six beats (`SNAKE_MORPH_BEATS`) the cannon lobe opens
into the throat a pod is swallowed through — `mood.intake` on the hull's own
frame, the same opening THE SCOUT's ship flies home into — the body rises out
of it in three pushes with a sway, and two threads of slime hold the flanks
until it is clear; then the mouth shuts behind the tail. The body is drawn
*after* the hull and clipped to the sky above its membrane and to the mouth's
own line (`clipAboveHull`), which is what puts the part still inside under the
skin without a second picture of the ship. Nothing in the simulation moved:
the phase, its beats and the body's resting tiles are what they were, and
`render/test/snake-frame.test.ts` draws the emergence on its own and holds the
arena to the field's width or the hull.

**The rest of its numbers are in `packages/sim/src/config-snake.ts`.**
`snakeCols` and `snakeRows` are the arena in tiles, and have nothing to do with
the field's `cols`, because the field is gone. `snakeStartTiles` is how long the
body is when a round opens, and `snakeGrowTiles` how many tiles a point adds —
the body is the obstacle, so that one is the difficulty. `snakeFireRestBeats` is
the beats between two shots, so a held trigger is not a cleared row.
`snakeMawTicks` is how many ticks the mouth stands open on one press, and it is
the one number here that decides how the round feels: the same window is a
smaller share of a tile at a shorter step, so the mouth gets harder to time
exactly as the body gets faster, with nothing authored to make it so.
`snakeMawRestTicks` is the ticks between two openings, never shorter than the
window, or a tapping thumb holds the jaws apart for the whole round.

**A crash is the wave lost, and the round has no second try of its own.** A
wall, its own body, a touched enemy or a point reached with the mouth shut is a
hit on the hull, and since 12 September 2026 every hit fails the wave
(`sim/wave-fail.ts`): the body stops where it stood, the field holds for
`waveFailBeats` so the pair sees where it went wrong, and the whole wave is
played again from the top. The round used to start the attempt over itself —
the body back at the start with the arena standing, after a pause to watch —
and once a hit stopped the field none of that could ever run, so it is gone.
What is left of the pause is its first part, the bump: the head knocks against
whatever stopped it and the body folds up behind it, then stands where it
stopped under the verdict until the wave comes back (`render/snake-crash.ts`).

**The meteors are the exception, and they are what proves the rule.** They can
be neither shot nor swallowed, and a shot stops dead on one, so the only answer
to a meteor is the steering — which means telling player 1 about one would buy
the pair nothing. They are drawn on *both* screens for exactly that reason: an
information split is worth keeping only where the information is worth saying. A round whose two splits pointed in different directions
would be two puzzles played at once.

It also settles a question the first round left open: **a relative control is
worth more here than an absolute one**. "Left" means the same thing to both
players whatever the body is doing, where "column four" needs a screen both of
them can read — and in a round where only one of them can see the arena, that
is the difference between a sentence and a guess.

### THE SCOUT, the round that flies

The owner asked for it on 16 September 2026, in his own words: *the mother ship
spills out another tiny ship, which one player can fly freely around the space.
It must evade enemies, otherwise it damages like hull and wave is lost. It can
collect a specific kind of power up, and it is required to collect all of them
to complete the wave.* On the ordinary field that is the one thing this game
cannot have — **nothing the players control travels** — so it is a round with
its own picture, which is exactly the exemption
[`docs/decisions.md` #21](../decisions.md) describes and the same one SNAKE
uses. It is built as `boss: { kind: "scout", arenas: [...] }` and is the
thirteenth boss.

**The panel is THE CLAW's, because that is where he asked for it.** Player 1
holds the two turns and the burn — the crank that winds the arm home now swings
a nose, and the button that sends the arm now pushes a ship — and **player 2
holds the mouth**. A mote is picked up by flying over it and is not *had* until
the little ship is back at the mother ship with that mouth open, which is THE
CLAW's own rule that nothing is caught by one person alone. The seat that can
see the arena therefore has a thumb in the round as well as a voice.

**The split is the round.** Player 1 is shown the ship and its heading and not
the arena; player 2 is shown every mote and every hazard and cannot move the
ship by a thousandth of a tile. So the flying is done on somebody's word — an
o'clock to point at and how long to burn — which is what keeps a game about
flying a game about talking.

**The motes are the first power-up that is flown to.** A pod comes to the ship
because there was no flying in the game (`sim/pods.ts` says so out loud); a
mote hangs exactly where a person placed it. Every mote in an arena has to be
banked, or the arena is not won.

**Its numbers are in `packages/sim/src/config-scout.ts`**, and all of them are
feel. `scoutTurnMilliDeg` is how far the nose swings in a tick while a turn is
held; `scoutBurnMilli` is what one tick of burn adds to the travel; and
`scoutDragMilli` is what is left of that travel after a tick of nobody pressing
anything — the three together decide whether the thing reads as a ship or as a
cursor, and the drag is the one that matters most: near a thousand it is on
ice, under about nine hundred it hops. `scoutMaxSpeedMilli` is the ceiling, and
it exists so the ship cannot arrive before the sentence that sent it does.
`scoutBounceMilli` is what a wall gives back — a wall is not a hazard and costs
only time. `scoutRadiusMilli`, `scoutMoteRadiusMilli`, `scoutHazardRadiusMilli`
and `scoutHomeRadiusMilli` are what counts as touching each of the four things
in the arena, and home's is the largest because it is the one thing the pair is
aiming at. `scoutMawTicks` is how long the mother ship's mouth stands open on a
press. `scoutLeadBeats` is the quiet before the ship is let go, and
`scoutVerdictBeats` is how long the result stands.

**A hazard's touch is the wave lost**, and so is the clock running out with a
mote still owed: both break the hull through `breachHull`, and since 12
September 2026 every hit fails the wave (`sim/wave-fail.ts`). The round has no
second try of its own, for the reason SNAKE's section gives one page up.

**The first arena's clock is 18 beats, and the figure comes off a flight.** An
autopilot that points, burns and coasts banks all four of its motes in twelve
(`packages/content/test/scout-flight.test.ts`), so the clock is half again the
flight — six beats for the talking a rig does not do. It was 40, which is more
than three times, and at that figure the second of the two failures above could
only fire for a pair who had stopped flying altogether: the clock was a backstop
and not a pressure. The second arena is still at 56 against a flight nobody has
timed, because the autopilot cannot clear it at all — five of its six motes sit
one tile from a hazard's row and a touch reaches 0.88 of one, which is an open
question in `docs/queue.md` rather than a figure waiting to be set.

**The look, landed 18 September 2026.** The field is gone and nothing else
is: the ship stands on the screen with its real scars, the band holds the
panel, and the arena is the field's own columns from the top of the play area
to the hull's surface, with the walls as a hairline the ship genuinely bounces
off (`render/scout-round.ts`, `scout-draw.ts`). The four presses are lobes in
THE CLAW's sockets on the band — the panel the design named, and the band is
that panel — so the round needs no listener of its own in the app or the
director: `touch-lobe.ts` holds the three of player 1's and taps player 2's,
and `scout-button.ts` draws what is on each face. Player 1's three carry the
nose the little ship is actually pointed at, read off the round, with an arc
saying which way each turn swings it and a wake on BURN; player 2's one is the
mouth, drawn by the same call the ship's own intake is drawn by and lit for
as long as it stands open. **The mother ship's mouth is the hull's own
intake**: `scoutHome` stands on the bottom row's middle, which is where the
cannon's socket is when the cannon is over the middle column, so the pose
parks the cannon there and drives `mood.intake` off `scoutMawOpen` — the
hull opens with the same swelling and throat a pod is swallowed through, and
home is a ring on the water in front of it that brightens for the beat the
mouth is open. A mote is a pod and a hazard is a burning rock, the two things
the game already means by *go and get this* and *this costs the hull*; the
little ship is one lobed contour of the hull's own violet at a tile's scale, a
piece of the ship put out. The split is two predicates in `view-role.ts`,
`showsScoutArena` and `showsScoutNose`, obeyed in one place each: the pilot
is shown the ship, its nose and the motes riding its rim and not one mote or
hazard; the navigator every mote and hazard and a ship with no nose on it;
both the place, home, the walls and the count. Nothing outlives a frame.
`packages/render/test/scout-frame.test.ts` draws every phase on all three
screens, set rather than waited for, and proves the split both ways.

**What the field says** (`render/src/boss-cue-read-h.ts`, 18 September 2026,
[`docs/decisions.md`](../decisions.md) #34). One word, the navigator's, and the
pilot gets none. `PRESS` / `OPEN` stands on the mother ship's mouth while the
little ship is on it and the mouth is shut — `scoutAtHome`, the rule the bank
itself is judged by, so the word cannot promise a press the round is about to
refuse, and it goes while the mouth stands open, because that press has already
landed and the mouth shuts on its own. Home and the ship's place are drawn on
all three screens, so the mark stands on nothing she is not shown. It says
nothing about what is aboard: a ship that arrives empty is asked for the press
anyway, and the press costs nothing, which is better than a cue whose appearing
is a report on the pilot's half of the picture.

**The pilot is told nothing, wherever the ship is, and that is the reading
rather than a gap in it.** His screen is the ship, its nose and what rides its
rim, and not one mote or hazard; his three controls are two turns and a burn,
and every word the field could put on them is a direction. The direction is the
answer and hers to say, an o'clock at a time. It is THE GAUGE's finding with
the seats swapped, and it is the third round to come to it.

**The rehearsal** (`content/src/scenes/the-scout.ts`, 18 September 2026)
flies the first arena whole and the second's first trip, its legs searched
for rather than authored (§3.2 of [briefings](briefings.md)); the pilot's
pages are the nose and the burn, the navigator's the hull and the maw.

**What is not built:** nobody has watched it at tempo. Whether a nose on a
button and a ship with none reads as *point it at two o'clock* across a
table is the owner's eye.

## Where they sit in the run

In the act table, as bosses. Ten acts is ten boss slots and twelve rounds is
more than that, so **the run grows more acts** rather than the rounds squeezing
between numbers — which is the other half of what the conversion bought. A
round takes a wave number like anything else, and save points
([structure](structure.md), open question 11) hang off the numbering without
having to know a round is different.

**Wave zero never carries one.** The first thing a pair meets in a run is the
field, or the game has taught them a round whose rules it then throws away.
That is now an authoring rule rather than a check in the simulation, which is
the right place for it: it is a statement about the act table.

THE MIRROR is filed as a boss because it is one — it has a body, it takes
damage, it can kill you — and its Simon Says section is a round *inside* it.
Both readings are true and the distinction is still worth keeping: a boss may
contain a round, and a round is now also a boss.

## The question the whole page hung on, now answered

`CLAUDE.md` rule: **on the field, nothing the players control travels.** No
flight, thrust, dodge or jump. It is the sentence that makes this game the game
it is, and it is the reason the cannon slides along a fixed hull instead of
flying.

Every idea in [the idea store's group](ideas.md#interludes) was written on the
reading that the rule is about **the hull, on the field**, and that a round with
no hull and no field is outside its scope. **That reading is the correct one**,
and [`docs/decisions.md` #21](../decisions.md) says so.

What the rule is for is keeping the field a place where two people talk about
**columns** — everything there has one, and "column four, on the three" is a
complete instruction because of it. None of that reasoning reaches a round with
no columns, and it does not start reaching one because the round is now spelled
`boss:` in the wave list. THE CLAW, THE BELT and THE WELL were not asking for a
relaxation and never were; the first two are outside the sentence. THE WELL is
built ([bosses 11.12](bosses.md#1112-the-well--the-field-turned-inside-out-on-one-phone))
and turned out to be *inside* it: it redraws the field rather than taking it
away, nothing on it travels, and the pair still names columns — as hours.

THE GAUGE still went first, and for a better reason than caution: it is the
smallest, so the shape it dragged in was the visible part of the work.

## What a round is drawn out of

One rule, and it costs no new art: **slabs and glyphs, never blobs.**

The shape catalogue already carries `slab`, a superellipse described as "made
rather than grown", and `glyphed`, a rim of travelling notches
([the asset catalogue](../asset-catalogue.md)). The field is soft closed
contours with lobes; machinery is hard-edged and labelled. A pair that has
spent an act among blobs knows from the first frame that this is a different
kind of thing, and nothing had to say so. The panel is made of the same word:
a round's buttons are `slab`s in `control-sets.ts` too.

The colours stay: violet and white for the ship's own, red and cyan for the two
that a shot can be ([graphics](graphics.md)). THE GAUGE's band is `pod` amber,
which is already what this game spends on "here, this is the thing"; a call
that landed is `good` green and one that did not is `sparkDim`, which are
already right and wrong everywhere else. A round that invented a third pair
would be teaching a colour vocabulary for ninety seconds.

The two hard rules do not soften: `sim` never imports `render`, and nothing in
`sim` or `content` touches a wall clock, `Math.random` or the DOM. A round
whose difficulty is a wobble in wall-clock time cannot exist here — which rules
out the reflex minigames both reference games are full of, and is why every
candidate hangs off the beat.

**The state it keeps is hashed and cleared.** Every field of the round is in
`hashWorld`, under the boss tag, exactly as the queen's and the maze's are. On
the render side there is nothing to clear: the draw is stateless, so
`Effects.reset()` has none of it to lose.

## Answered, now that one exists

- **Does a run see all twelve, or a few?** All of them, in fixed slots. A draw
  from a pool would break the randomness rule
  ([structure](structure.md#73-the-randomness-rule--built)), which is older than
  this page. What *is* drawn from the rng is what one player knows and the other
  does not — in THE GAUGE, where the band lands and which way it drifts.
- **Does the pair keep a record?** No. The round reports how it went in its
  verdict and nothing outlives it but the damage. A per-pair best is still worth
  having and is still one field; a per-player score is the thing
  [transfers-hazelight](transfers-hazelight.md#refused-with-the-reason) refused.
- **Are they optional?** No, and the question dissolved with the category: a
  boss wave is not optional, it is the wave.

## Still open

- **What happens on a disconnect mid-round?** Better than it was, and not
  solved. A round is world state and is in the fingerprint, so two devices in
  lockstep agree about it tick by tick and the desync ledger watches it like
  everything else. What is missing is a resume: a wave has a beat number to come
  back at, and nothing in [net](../architecture.md) knows a boss wave with no
  field in it needs a different one.
- **What does one sound like?** Nothing yet. The catalogue is built and
  [`bind.ts`](../../packages/audio/src/bind.ts) is exhaustive over `SimEvent`,
  so a round that wants a sound has to earn an event first — deliberately,
  because the first one said everything it needed to say through state alone.
  It now also breaks the hull, which does have a sound, so the first thing a
  pair hears from a round may be the thing they did wrong.
- **What is `damageGauge` actually worth?** Twenty points, chosen so the round
  is not free and defended no further. It is the owner's to turn once they have
  lost one. `damageSnake` is the same twenty for the same event — a round the
  pair did not finish — and `damageSnakeRepeat` is eight, which is the number
  with the least behind it on this page: starting over has to cost enough that
  the arena is real and little enough that a round is not over at the first
  mistake.
