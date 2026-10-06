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
| Its panel | one `ControlSet` in `packages/content/src/control-sets.ts`, its buttons lobes in the band's sockets |
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
The round is **`gaugeLevels` levels**, each harder (the owner, 29 September
2026: *add more levels (at least 3 and it should become harder)*).
`gaugeLevelBeats` is how many beats one level lasts before time runs out, and
`gaugeLevelMarks` is how many marks finish it — three repetitions of one rule.
Each level up walks the band `gaugeLevelDriftMilli` further a beat and opens
the mouth a step, and between two levels the rim stands
bare for `gaugeLevelRestBeats` with the next level's clock held full, under
the words `LEVEL N`. The rule never changes from one level to the next; how
long "now" lasts does (`packages/sim/src/gauge-level.ts`). `gaugeSpanMilli` is half the distance between the two marks, in
thousandths. `gaugeDriftMilli` is how far the band walks each beat, which is the
whole of the pressure. `gaugeTurnMilli` is how far the pilot's valve moves the
needle each tick. `gaugeCallRestBeats` is the beats between two calls, landed or
not, so a held thumb is slower than talking.

**The mouth opens, and a miss loses** (2 October 2026). The owner: *when
hitted wrong, the wave is lost. What about different levels and idea to
increase distance of cannon to teeth (so more opened mouth)?* Each level up
opens the mouth a step: the opening is the level (`gaugeGape`), and each step
cuts the band's half-width by `gaugeGapeSpanMilli` — the same tear further off
is a narrower angle (`packages/sim/src/gauge-gape.ts`). On both screens the
rim stands `RIM_STEP` of the dial further off the cannon a step, gulping out
past it on the landing of the mark that opened it (`render/gauge-gape.ts`), so
the teeth, the wound and every thumb on the rim move out with it.

**Every mistake loses the round**, the owner's rule the same
day: *a miss makes the boss wave fail and requires retry*. A call that
misses, a tooth pulled wrong, and a tooth or the tongue still in when its rest
runs out each count in `misses`, and the first ends the play on that tick:
the round lost and the hull struck, exactly as the clock running out does,
and the wave offered again. The jam those mistakes used to cost — a dead
valve and a needle swung by hand — went with them, and so did the misses
opening the mouth, which stood for half a day between the two.

**What he sees while she calls** (2 October 2026). The owner: *for p1 to
indicate he is waiting for player to call … very fast rotating teeths …
colouring left to right, then right to left, in random cyan and red and in
some visual that it's hallucination not real*. While his hand is off the valve
in the play — a wound open, no bolt out, nothing loose — a sweep races along
his teeth and back, each lit tooth a ghost split in two and floating off its
socket, red or cyan by a hash of the pass and the tooth and never by the
wound. Her screen never shows it (`render/gauge-mirage.ts`).

**The loose tooth** (30 September 2026). The owner: *add some intermediate
choreographed on screen gesture events, e.g. pull teeth out ( p1 needs to tell
p2 which one to pull out.)*. The rest after the first level is
`gaugeToothBeats` long and spent on `gaugeTeethToPull` teeth of `GAUGE_TEETH`,
one loose at a time (three since 2 October 2026, the owner: *increase number of
teeth require to pull out*), and the split is turned round for it: the pilot's
screen shows which tooth is loose, the navigator's hand pulls — a drag of
`gaugeToothPullMilli` from the tooth she pressed. The next comes loose the
moment the last is out; the last right one ends the rest early, after
`gaugeRegrowBeats`; any other
comes out anyway and loses the round, and a rest that runs out with the loose
one still in costs the same. The pulled teeth stay out for
the round (`packages/sim/src/gauge-tooth.ts`, THE GAUGE'S TOOTH in
`controls.md`).

**The twisted tongue** (30 September 2026). The owner, in the same sentence:
*or to rotate the tongue that it gets twisted by both players*. The rest after
the second level is `gaugeTongueBeats` long, and the tongue lolls out of the
mouth on both screens. There is no split in it: each seat takes a side and
drags, and it is wrung only when both hands are on it and dragged opposite
ways by `gaugeTongueTwistMilli` or more each — so the talking is a count, *three,
two, one, now*, rather than a description. Wrung, the rest ends early after
`gaugeRegrowBeats`; a hand let go unwinds its half, and a rest that runs out
with the tongue still out loses the round
(`packages/sim/src/gauge-tongue.ts`, THE GAUGE'S TONGUE in `controls.md`).

**The crown and the gashes** (29 September 2026). The owner: *remove the
permanent text … show the default bosses time remaining bar top of boss …
add some siren which tells that p2 needs to inform p1 about position … the
dotted lives … show big wounds on the boss instead, so no exact number
visible*. So the title and the pips are gone. The level's clock is THE
SLOW's fuse over the alien's head, held full between levels, and the siren
lights the navigator's chip while a wound is open, with AIM POSITION under
it on her screen (`render/gauge-crown.ts`). Every mark landed tears an ember
gash in the alien's shoulders and it stays for the round
(`render/gauge-hurt.ts`); the later ones tear into the earlier, so a pair
sees it getting worse and counts nothing.

A call is judged **where the bolt lands**, not where it left (the owner, 29
September 2026: *first shot must reach the coloured area, and then destroyed if
correct colour*). `gaugeShotTicks` is the bolt's flight, and the band stands
still while it is in the air, so the shot is judged against the wound it was
fired at. A hit shoots the wound out, and the rim stands bare for
`gaugeRegrowBeats` before the next one opens, somewhere else. A call made
while a bolt is out or the rim is bare is refused, never counted as a miss.

### The state it changes into, and the thumb that answers it

*18 September 2026, `.claude/skills/new-boss` §6.2. The simulation is
`packages/sim/src/gauge-hand.ts` and `gauge-band.ts`.*

The round shipped with **one** state in it: turn, talk, call, for ninety
seconds. It gained two, and the point of both was that the pair's own last
answer is what enters them. **The jam**, his — a dead valve and the needle
swung by hand, with a settle after it in which her call was refused — went on
2 October 2026, when a mistake began to lose the round instead: nothing could
reach it any more. The bind remains, and the round is never in a state the two
of them did not just put it in.

**The bind, hers.** Every `gaugeBindMarks` marks the band winds tight to
`gaugeBoundSpanMilli` — under a third of its width — and the one after it lets
go, so the round alternates rather than ending in one state. Her thumb on
`gaugeBand` holds it open: full width, and the walk stopped, for as long as she
keeps it there. **She cannot call while it is down.** That is the whole price,
and it is why the bind is a gesture rather than a button: the pair has to agree
out loud on the moment she lets go, and that moment is the only thing in the
round she does not decide alone.

The refusal is **a refusal and not a miss**. A call under her own thumb is
turned away without charging her, because it is the round asking for
something else at that moment and the rest between calls would run as well —
a pair doing exactly what was asked would be slowed for it.

`gaugeSpanNow` is the one number the whole round is judged against, and it is
**called and never re-derived**: the picture draws the band at the width the
judgement uses, so the pair can never call a needle the screen shows between
the marks and be told it was not.

**What the field says** (`render/src/boss-cue-read-w.ts`, 18 September 2026,
`docs/decisions.md` #34). Three words in the play, all hers; the rests have
their own.

Hers are her own verbs at the moment each will land: `CALL` / `POSITION` on
the wound while it is open and the cannon is not yet over it, `PRESS` /
`SHOOT` on the end of the needle once it stands between the marks, and
`HOLD` / `OPEN` on the middle of the band while it is wound and her thumb is
off. The first two were `PRESS` / `RED` or `CYAN` alone, on a seated needle,
until the owner, 29 September 2026: *it does not make sense how it is right
now … this help can just be "Shoot", and before it should say "call
position"*. `CALL` is the one kind line that is not a thumb: talking is her
half of the round, and the field says so at the moment it is due. Both the marks and
the band are drawn on her screen, so each mark stands on something she is
already shown, and each word says what her thumb does rather than where the
needle has to go. The call outranks the band: a needle already seated in the
tight window is a mark she can take without spending the thumb. Neither is the
round's difficulty — the hard half of her job is talking him there before it
arrives, and that happens in the beats when there is no cue at all.

**His screen is told nothing in the play**, on any beat: the two marks are
not on it (`showsGaugeMarks`), so the only word over his valve would be a
direction, which is the answer and hers to say, and there is no beat when a
turn is owed because the needle is parked on purpose while the band walks
toward it. The `TURN` he was given over a jammed needle went with the jam. He
still keeps the rehearsal's one page about his half
(`docs/spec/briefings.md`).

**The look.** The bind puts a ring on the half of the picture her seat is
shown, and the ring is the game's own — breathing until a thumb lands, filled
once one has (`render/gauge-grip.ts`, `grip-rings.ts`). It stands in the
middle of the band while it is wound, on the only screen the band is drawn
on. The circle a thumb is answered at is the circle
the ring is drawn from, which is the one thing a control on a picture has to
get right.

**Its band answers a touch the way every mark does, as far as the split lets
it** (28 September 2026, `render/gauge-marks.ts`;
`mark-feedback.ts`, `grip-verdict.ts`). Whether it is asked is the
simulation's (`gaugeBandAsks`, `sim/gauge-hand.ts`). On the screen that shows
it, the band asked wears the halo under its ring until the
thumb is down, and the thumb landing washes it **green** (`gaugeHold`, silent:
the ring filling already says it). **Half the convention is missing on
purpose.** Every other mark wears the partner's turning ring and clock on the
other screen, and a press from the wrong seat is refused red; here the band is
never drawn on his screen, so either would tell him the one thing the round
keeps from him. A wrong seat's thumb still falls
through, and nothing is refused. A round ingests no effects of its own, so the
takeover feeds these verdicts (`canvas2d-takeover.ts`).

**And a button goes faint where the round would refuse it**, asked the way
the simulation asks it and never guessed at (`gaugeLobeArmed`): the call under
her own thumb. His two turns always answer. The rest
between two calls is not in it — two beats, and a button that blinked every
time she pressed would read as a fault rather than a rhythm. The rows
are in [controls](controls.md); the director's are in
`tools/director/src/field-controls-gauge.ts`.

**The picture, 23 September 2026.** The owner, 20 September: *the control
idea should stay, but the visual a lot.* The milled plate, the glass, the
bezel and the notched dial of 18 September are gone, and so is the round's
"slabs and glyphs, never blobs" for the one body the owner named. What stands
in their place is the ship: a stretch of the hull across the stage with the
cannon lobe at its middle, and on its crown **THE CLAW's own hand**, turning
on a joint through the half-round the needle swept rather than sliding along
the hull (the claw's own file, since deleted, the fingers `reach-arm.ts`'s). A line of
dots runs out of its fingertips to say where it will grab — that line is the
needle now, on both screens — and on the navigator's screen alone a **pod**
stands where the band was.

**The pod's width is the span.** The call is one comparison, the needle within
`gaugeSpanNow` of the mark, and about the pivot that is an angle either side
of the mark's; the pod is drawn at `R·tan θ` either side of its middle, so the
dotted line passes inside it on exactly the calls that land, and a band wound
tight is a smaller pod. Its height follows from its width, and it is held at
one instant of the moored pod's contour so the width it is judged by does not
breathe. A test held that, and that the pod is on
her screen and never on his. **Not one number of the round moved**: the claw
and the pod stand at `gauge.ts`'s readings about `gaugeDial`'s pivot, where
the needle and the band always did.

**A call is the claw reaching** (23 September 2026). The owner, 20 September:
*a very clear visual whether the claw was successful to catch the pod or
whether it was not within the open area.* On the call the arm runs out along
its dotted line and shuts. A catch is a body: a pod stands where it was
called, the hand closes on it in a green ring, carries it home and the ship
swallows it at the crown, while the navigator's next pod swells in where the
band has gone. A miss is an absence: the hand shuts on the dark in a grey
puff and comes back closed and rattling.
Both screens — the pod in the hand is where the pilot stopped, and it is the
one way he learns his stop was right (the catch's own file, since deleted). It is timed
from `calledTick`, the one field the simulation gained, and it is over inside
the rest between two calls.

**Its words and its buttons** (23 September 2026). The owner, 20 September:
*change the wordings, improve the buttons a lot so they fit the regular ship
hull and control set visuals.* The header said YOU CANNOT SEE THE MARKS and
YOU CANNOT TURN IT — a dial nobody draws any more, and what a seat lacks
rather than what it does. It says *swing the claw where they tell you* and
THE POD IS ON THEIR SCREEN now, and the navigator's mirror of it. The
header is gone since 29 September 2026, at the owner's word, with the pips
under it: the siren and the fuse stand there now (`render/gauge-crown.ts`). The three bare rectangles are gone: THE GAUGE's
three are lobes in the band's own sockets, the fifth round to move there
after THE PULSE, PINBALL, THE SCOUT and SNAKE. The pilot's two turns carry
the claw's heading and the arc a turn swings it through, SNAKE's wheel on
THE SCOUT's nose; the navigator's call is THE CLAW's REACH, lit while the arm
is out (`render/gauge-button.ts`). `touchDown` answers them like any other
lobe, so the round's listeners in the game and the director were deleted.

**The alien, the wound and the cannon** (25 September 2026). The owner: *the
area of acceptance to activate the needle is not clear enough … show a big
alien ship, and the line where needle is correct is the visual of an open
wound … replace this needle claw with the regular cannon, cyan or red … also
remove the pods.* The claw, the pod and the catch above are gone
(their three files deleted). Behind the
hull stands THE MOTHER's shape from the shape collection, centred on the
pivot, with its mouth open round our crown (`render/gauge-alien.ts`). The
mouth's rim is armour everywhere, grey plates, and on the navigator's screen
alone a **wound** is torn in it (`render/gauge-wound.ts`): its two ends are
cut square along the rays at `mark ± gaugeSpanNow`, so a shot lands in the
flesh on exactly the calls that land. A band wound tight is the wound sewn
shut from both ends. On the crown the ship's own cannon turns through the
half-round (`render/gauge-cannon.ts`), in the colour of her last call
(`render/gauge-load.ts`). The aim ring lights on her screen while the needle
is seated (`gaugeSeatedBy`). A call is a shot: a burst and a green ring in
the wound, or grey sparks off the armour and a rattling cannon
(`render/gauge-shot.ts`).

**The colour is a rule** (the owner, 27 September 2026; built 29 September).
The wound is red or cyan, drawn from the `Rng` with every band (`drawBand`)
and hashed, and only she sees it. Her CALL is gone: she has a RED and a CYAN
fire button in its place, and a shot lands only in the wound and in the
wound's colour. A shot in the other colour, on a seated needle, is a miss like
one on the armour — and the round is lost (`sim/gauge-call.ts`). He cannot see the
colour at all, so it adds nothing to say; it is one more thing she must not
get wrong while she is saying *left, left, stop*.

**The round has sound now** (19 September 2026): `gaugeMark`, `gaugeMiss`
and `gaugeBind`, in `packages/sim/src/events-gauge.ts`, pushed from
`gaugeHeard` — a call answers with a mark or a miss, and a mark beside it can
wind the band. All three are bound in `packages/audio/src/bind-gauge.ts`,
panned to the middle: the needle and the band are both drawn on the plate
rather than over a column, so there is no lane for either sound to stand in.
The picture needed nothing beside them — the needle, the band and the bind are
all read off the round's own state every frame already (`render/gauge.ts`),
so all three are on the render silent list rather than drawing anything new.
A fourth, `gaugeJam`, went with the jam on 2 October 2026.

What a round **may** do is give — a pod or two for the act about to start
([systems](systems.md#57-power-ups--the-pod-built)). That is not built. Pods are
wave content and `startWave` replaces `podQueue` wholesale, so the giving needs
a seam into `startWave` that the first round with something to give should cut.

### Its own controls, and not the same ones on both screens

A round's buttons are its own, and they stand on the ship's band: a
**control set** registered in `packages/content/src/control-sets.ts` beside the
field's own, whose controls are lobes in the band's sockets. `bandLobes` places
them and `touchDown` answers them, so a control is never drawn where it is not
answered — the bug THE GAUGE and PINBALL both shipped with, while each round
drew **slabs** of its own that replaced the band and needed a listener of its
own to answer them.

Every round has moved off slabs at the owner's request, THE GAUGE last on 23
September 2026, and the owner's rule is what is left: a round is free to take
the field away, and not free to invent a second kind of button while it is
there. The slab machinery — `panelForm`, `slabs.ts` — went the same day, with
nothing left using it.

Two screens showing the same controls would be the field with a different sprite
on it. In THE GAUGE, `showsGaugeMarks` and `showsGaugeValve` are what make them
different, and they are role predicates in render/ for the same reason
`showsQueenHint` is: the information split is a fact about a screen, not about
the world. Which seat may send which command is checked in the simulation.

SNAKE splits both halves at once and it is worth reading as a pattern rather
than as a second example. The **verbs** are split by job: player 2 has the
whole of the steering — two quarter turns, relative, the arcade game's own
controls — and player 1 has the two things the body does when it arrives, a
shot out of the head and a mouth. The **information** used to be split to
match — player 1 shown the enemies, the points and both ends of the body,
player 2 the whole length and nothing in the arena — and on 25 September 2026
the owner asked for it to be one picture: *all is seen by both*. Both screens
now carry the whole body and everything standing in the arena, and the split
is the hands alone. The seat with the wheel cannot shoot or eat, and the seat
with the trigger cannot turn.

**A turn is taken the tick it is pressed** (`turnSnake`), on the tile the
head is nearer to: the one it stands on in the first half of a step, the one
ahead in the second, where that step is taken at once. It used to wait for the
next step, and the owner found the wheel laggy (29 September 2026): the body
slides into the tile ahead all through a step, so a queued turn was seen going
on and then snapping round.

**The shot carries ten small tiles and no further** (`snakeShotTiles`). It used
to carry the width of the arena, which quietly took the steering out of the
round: an enemy eight tiles up column four was answered from the opening square,
and player 2 had nothing to do with it. Then it carried three of the old big
tiles, and the owner asked for more (25 September 2026). Ten small tiles is five
big ones, still short of the arena, so the sentence the pair says most is still
"bring me to it", which is the sentence the round is for.

**The arena is 17x21 small tiles** (`snakeCols`, `snakeRows`), where it was 9x11
big ones. The owner asked for four small tiles to one big one, because a body
that jumped a big tile per step felt clumsy to steer, and for a slower body. The
old tile (c, r) is the small tile (2c, 2r), so the authored maps doubled and the
arena stayed the same size on the screen. Every length doubled with it, and each
step is a small tile at 45, 36 and 28 ticks, a third slower across the screen
than before. The picture says so — the venom lands in
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
first. Both go out with the phase.

**The driver gets no word, and that is the reading rather than a gap in it.**
She sees what he sees since 25 September 2026, and *which way* is still the
answer the two of them agree out loud. A cue that turned her would be a
second driver.

### Three shots, three hands

*18 September 2026, `.claude/skills/new-boss` §6.2. The simulation is
`packages/sim/src/pinball-hand.ts`, and the two numbers are
`config-pinball-hand.ts`.*

PINBALL already changed state three times a shot — `aim`, `power`, `flight`,
each waiting on a different thumb, which is what makes the round a conversation
rather than three people's worth of buttons on two devices. What it did not
have was a hand on **the table**: every verb was on the panel or on the strip,
and through a flight the navigator had nothing at all. Both of the new ones are
on the picture, and both are entered by the pair's **own last answer** — THE
GAUGE's shape for the same brief, and for the same reason: the round is never
in a state the two of them did not just put it in.

| Shot | Waiting on | What is new |
|---|---|---|
| `aim` | player 1's latch | nothing: the needle sweeps and the pair talks over it |
| `power` | player 2's launch | **the spring may be slack.** A launch above `pinballHardMilli` leaves it so, and the bar does not run at all until player 1 carries the plunger back (`pinPlunger`, `pinballWindMilli`) |
| `flight` | nobody — the ball is out of their hands | **the nudge.** Either player may shove the table sideways (`pinTable`, `pinballNudgeMilli`), three times between them, and the ball takes `pinballNudgeShoveMilli` the way it was shoved. The shove after that **tilts** it and both hands are dead for the rest of the flight |

**The wind is the price of the shot they just took.** A launch at the top of
the bar is the one that reaches the far corner of the board, and the top tenth
is about a tenth of a second wide at each end of a cycle that runs in 2.1 s —
so it is a thing the pair *aims* for rather than drifts into. The round charges
for it on the shot after, in the seat that owns *where from*: he wound it, he
winds it back. The aim is untouched, because the needle is still latched where
he left it — what a hard shot costs is the moment and the strength, which are
hers.

**The nudge is the one thing she has while a ball falls.** This round's own
header says nothing either of them presses reaches a ball in the air, and the
strip is the only control that answers — which leaves her watching. One shove a
flight, in a direction and not to a place: `pinballNudgeShoveMilli` is enough
to move a ball a peg over by the time it has fallen a third of the table and
nowhere near enough to place it, because a nudge that could aim would make the
needle and the bar into decoration. `pinballNudges` is how many
the table takes before the next one tilts it, and it is **one** — two would
make the nudge a second steering control and nought would make it a rule with
nothing on the other side. The shove after it is a **tilt**, which is the
arcade's own rule and the reason the nudge is worth a sentence: *not yet* is
now a thing the pair has to say to each other.

**Either seat's, three between them, 1 October 2026.** The owner: *add also
that any player can bump the ball to lead a little bit the direction while
flying.* The table is now both seats' — nothing refuses player 1, and the
ring is bright on both screens — and `pinballNudges` is three. **One count,
shared**, rather than three each: two counts would be two players shoving
without a word between them, and one is a thing they spend together, so *not
yet — mine* is the sentence. The gesture is still the ring's carry, not a
swipe anywhere on the table, because the pilot's thumb is on the cannon
through a flight and a table-wide swipe would take his slide from under it.
What is written above about her hand is the round as it was before.

**Nothing new can hurt them.** A wind too short, a shove too short, a shove
off a flight, a shove after the tilt — each does nothing. A tilt costs a hand
and never the hull; the hull is still broken by a dropped ball and by the
clock, in `pinball-round.ts`, exactly as it was.

**Where the hands live.** `pinball-hand.ts` hears both, from
`pinball-controls.ts` beside the three verbs, and refuses each to the seat it
does not belong to — the rule of the simulation those three are already held
to. `PinballState` gained `slack`, `nudges` and `tilted`, all hashed
(`pinball-hash.ts`, cut off `pinball-board.ts` the same day for its limit);
`resetShot` clears the last two, because a table tilted on one ball may be
nudged again on the next. The three events — `pinWind`, `pinNudge`, `pinTilt`
— are `events-pinball.ts`, the round's first, cued by `bind-pinball-hand.ts`
and voiced by `sounds/boss-pinball-hand.ts`. They are the first cues in the
game with **no column**: the table is drawn whole on both screens and the
round has thrown the field away.

**The STATES sheet now names all three shots**, with a card and a hand each
(`poses-bosses-rounds.ts`, `pinballHand`) — the first round whose second axis
of state is fully posed.

**The picture, 22 September 2026.** Both hands have a ring now
(`render/pinball-grip.ts`), and where they go was decided by the one thing
that is true of this pair and of no other in the game: **they cannot be on the
screen together.** The wind is offered through `power` and the shove through
`flight`, which are two shots of one ball — so both stand in the band of clear
air a tile and a half above the ship, the band the strength bar runs in, and
each has the whole of it. His is at its right-hand end and hers at its left,
which is the one arbitrary thing about them and worth being arbitrary about: a
round that put two different hands in one place would teach the pair that *the
handle is over there*. Each is drawn on both screens, bright on the seat it
belongs to and dim on the other, because neither can feel the other's thumb —
a navigator who could not see the spring is slack would fire on a bar that is
not going to run. **The shove's dial is the count**, so a full ring is *the
next one tilts it*, and the tilt takes the ring off the table altogether: her
hand is dead and a handle that answered nothing would be worse than none. The
plunger's ring carries no dial, because `windHeard` remembers nothing about a
thumb on the way down — the bar starting to run is the answer. The two gates
are `pinWindable` and `pinNudgeable`, called by the rule and by the picture
alike, so the ring cannot outlive the gesture.

**Both answer a touch the way THE INSTAR's marks do, 28 September 2026**
(`render/pinball-marks.ts`; the owner, 27 September: *the consistent visual
across all waves*). Whether each is asked is the simulation's —
`pinPlungerAsks` and `pinTableAsks`, the two gates and the play. The part
asked of this seat wears the halo for as long as it is asked, since both
gestures are lifts and nothing says a thumb is down; the part asked of the
partner wears their turning ring and the clock. The wind and the shove wash
the ring green, and the tilt washes the table red — her own thumb, and the
wrong one. A press from the other seat on an asked part is refused once
(`pinRefuse`, the press and never its lift) and washes it red too. A desk
press is signed with the part's seat (`pinballGripSeat`), and the takeover
feeds the verdicts (`effects-round-marks.ts`).

**And the dim copy punches no hole, 22 September 2026.** The first frame ever
taken of the shove on the *pilot's* screen came back with a flat black disc in
the board — `drawHandleRing` fills its circle in `PALETTE.background` before
anything else, so a ring drawn over a lit surface reads as a hole cut in it,
and the 0.18-alpha dim wash on top is not enough to say *handle*. This is the
one wave in the game whose handles stand on a lit surface rather than in air,
so it is where the defect shows worst. **The shove stays on his screen**: the
dial is the count, a second nudge tilts the table and kills her hand for the
flight, and *not yet* is a sentence he cannot say without the number. What he
may not be shown is a hole. So a ring drawn for the other seat fills nothing
now and is its rim and its wash over whatever is behind it (`theirs`,
`handle-draw.ts`); `render/test/handle-hole.test.ts` counts the discs punched
out of each screen and this round's is nought on his. Nine more bosses draw a
dim ring and each is ruled on in its own section as a lane reaches it
(`docs/queue.md`).

**The top of the table says nothing, 30 September 2026.** The owner: *remove
all the wave text above, and show the regular boss (choreographed) time
indicator, but on top of screen.* The name, whose press it is, and the tally
of targets, board, drops and beats are gone. What stands in the clear air
above the first row is THE SLOW's fuse, drawn by the same function in the same
colours, burning in from both ends over the board's beats and only while a
board is being played (`render/pinball-fuse.ts`). Whose press it is was
already said by the band and the asked parts; the drop count is said by the
scars.

**A catch says YEAH, 30 September 2026.** The owner: *make a nicer success
yeah animation when ball was collected correct again with cannon.* A catch had
no picture of its own — the ball simply reappeared in the muzzle. Now the
mouth flashes green, two rings and a spray of sparks go up out of it, and the
word jumps out, overshoots, settles and floats off, in under a second and
held inside the table (`render/pinball-catch.ts`, off the sim's `catchTick`).

**What is not built**: the three events are still on both silent lists, and a
tilt is still said by the ring going out rather than by a sound or a mark of
its own. *Never watched at tempo*: whether a shove is a gesture a thumb can
make on a phone while the other hand is nowhere, and whether one nudge is too
few.

### Two bodies, two gestures

The round as first built asked the same four things of the pair from the first
tile to the last, and a pair that had learned it in round one had learned the
whole of it (`docs/queue.md`, *SNAKE changes state more than once, and asks for
more than one gesture*). Since 18 September 2026 the **body** is a second state
beside the clock, and it follows from the one number that was already the
difficulty and the health bar at once: how long the body is. So the round
escalates *on the way to being won* — you cannot win without eating the points,
and the points are what make it harder — rather than on the way to running out
of beats. `SNAKE_GRIPS` in `snake.ts` is the table and `snakeGrip` reads it.

| Body | Tiles | What is new | Whose hand |
|---|---|---|---|
| `crawl` | up to `snakeGorgeTiles` | the four verbs as the round was built | both, on the panel |
| `gorge` | past it | **the jaws stick.** EAT is a dead button, and its face drops the light that says press me (`snakeMawLit`); player 1 prises them apart on the head itself (`snakeJaws`, `snakeJawsMilli`) | player 1, on the body |

**The jaws are the same window under another hand.** A prise opens the mouth
for `snakeMawTicks` and rests for `snakeMawRestTicks`, exactly as the press
did — what changes is the gesture, from a button on the band to a carry of a
tile and a half on the head. It costs player 1 the thumb he fires with, so from
`gorge` the two things he does stop being two taps and start being a choice.

**The tail is no longer held, 6 October 2026** (the owner). A third body,
`shed`, from eight tiles, let player 2 lift the tail's last tiles clear with a
thumb on them (`snakeTail`, `tailHeld`, `snakeLifted`) so the head could pass
through where they stood. The owner took the hold out of the round: past
`snakeGorgeTiles` the body stays `gorge` however long it grows, the tail is
always on the board, and a head driven into it is a crash like any other.

**Nothing new can lose the round.** A prise too short, a prise while the mouth
is still open, a thumb on the neck from the driver — each does nothing
at all. The four ways to crash are the four there were.

**Where the hand lives.** `snake-controls.ts` hears the prise beside the four
verbs, and refuses it to the driver — the same rule of the simulation, and
for the same reason. Its events — `snakePrise`, and `snakeRefuse` for the
driver's thumb — are `events-snake.ts`, the round's first; the prise is cued
by `bind-snake-body.ts` and voiced by `sounds/boss-snake-body.ts`.

**What is not built: the body under the hands** (read against the tree 23
September 2026). The ring ships (below), shown only while its grip is live,
and the director's STATES sheet poses both `crawl` and `gorge` — `OWED` is
empty. Two things remain. The head's own jaws are drawn the same whether they
stick or not — only the ring on the neck and the field's `CARRY` say so
(`boss-cue-read-g.ts`); and `snakePrise` is on both silent lists
(`effects-ingest-silent-boss-b.ts`, `effects-spark-silent-boss-b.ts`). *Never
watched at tempo*: whether a carry on the head is a gesture a thumb can make
while the body is moving at under half a second a tile.

**The ring ships, and the other seat's copy fills nothing, 22 September
2026** (`render/snake-grip.ts`). His on the neck one tile behind the head,
sliding with the body and drawn on both screens — the open mouth is a thing
the driver is waiting on, and she cannot feel his thumb. (Hers on the tail's
last joint went with the hold, 6 October 2026.) What the dim copy may not do
is **cut**: a ring fills its circle in the background colour before its own,
so on a round whose handle is on the animal itself the copy came out a bite
taken out of the snake, which is the one thing a gap in this body could
mean. It fills nothing now (`theirs`, `handle-draw.ts`), and
`render/test/handle-hole-bosses.test.ts` counts the discs punched on each
screen.

**It answers a touch the way THE INSTAR's marks do, 28 September 2026**
(`render/snake-marks.ts`; the owner, 27 September: *the consistent visual
across all waves*). Whether the jaws are asked is the simulation's —
`snakeJawsAsks`, past `crawl` with the mouth's rest run out — and they are
always the pilot's. On his screen they wear the halo until the prise, which
starts the rest; on hers his turning ring and the clock. The prise washes the
ring green, and her press on it is refused once (`snakeRefuse`, the press and
never its lift) and washes it red — the ring is drawn on both screens, so her
thumb can land on it. A desk press is signed with the pilot's seat
(`snakeGripSeat`). A round frame skips `Effects.ingest`,
so the takeover feeds the verdicts (`effects-round-marks.ts`).

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
glyphs, and light from a turn until the next step; player 1's two carry the head
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

**A cleared arena is not a round won until the body is home**
(`sim/snake-home.ts`, the owner, 25 September 2026). Once every enemy is down
and every point is swallowed, the clock stops and the ship's mouth opens again.
The floor stays a wall everywhere but one tile: the one under the middle
column. Player 2 steers the body onto it, heading down, and a chevron on the
last tile of the floor shows where. Past that tile nothing is steered: the head
goes straight down into the ship on a quicker step (`snakeHomeStepTicks`), and
once the whole body is inside, the next arena opens and the body comes out of
the same open mouth. After the last arena the mouth closes behind the tail
under the verdict. Missing the mouth is a crash like any other wall.

**The hull and the band stand at half their height in this round**
(`snakeHullPct`, `render/snake-layout.ts`, the owner, 25 September 2026: the
round's buttons are fewer and smaller). The field moves down into the room
they give up. The arena is as wide as the field already, so on a phone it keeps
its size and comes down with the hull. The frame and the finger read one layout
(`render/world-layout.ts`), so a lobe is pressed where it is drawn.

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
`snakeGorgeTiles` is the length the second body begins at, and
`snakeJawsMilli` is how far a thumb has to carry the head for a prise to
count.

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

**The seats swap on every level** — the owner, 29 September 2026: *every level
next, the controls swap with other player*. Player 1 flies the first arena,
player 2 the second, player 1 the third (`scoutPilot`); the panel, the split
picture, the hands and a rehearsal's thumbs all follow the same rule
(`content/src/control-seats.ts`).

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
press. `scoutLadenMotes` and `scoutHeavyMotes` are the loads above,
`scoutReelMilli` is how fast the line pulls, and `scoutPrimeMilli` and
`scoutPrimeTicks` are how far a prime is carried and how long it lasts.
`scoutLeadBeats` is the quiet before the ship is let go — none since 29
September 2026 — and `scoutVerdictBeats` is how long the result stands.

**The trip, as the owner re-cut it on 29 September 2026**
(`packages/sim/src/config-scout-trip.ts`). The ship goes out on the first tick,
`scoutLaunchMilli` above the cannon. A turn steps the nose 45° at once, the
cannon's feel, and a held turn steps again every `scoutTurnRepeatTicks`. The
ship holds `scoutCarryMax` motes — one, so each is fetched and sucked home
before the next, unless an arena names its own `carry` (`scoutCarryLimit`),
which is how a round reaches `laden` and `heavy` — and an open mouth takes a carrying ship from anywhere inside
`scoutSuckRadiusMilli` of the cannon, drawing it in at `scoutSuckMilli` a beat
with the pilot's hands dead until it is home. The pilot is shown the arena
`scoutRevealFirstTicks` after the ship is let go, and again every
`scoutRevealEveryTicks`, for `scoutRevealTicks` each time. The four levels
carry one mote more each, from one, and **all four have the same clock** —
208 beats, eight times a clean flight of the longest — the owner, 2 October
2026: *the same time for every level, not different*
(`packages/content/src/scout-arenas.ts`).

**How it looks** (`packages/render/src/scout-look.ts`, `scout-ship.ts`). The
little ship is an alien pacman — a lobed violet round with a chomping mouth, a
slit-pupilled green eye and two feelers — and the mouth, which is the heading,
is drawn only on the pilot's screen. Two rings come off it each time it is let
go. The mouth's reach is dashed round home while a mote is aboard, and a
stream of amber runs into the mouth while it sucks. The pilot's glimpse tears
in and out with THE FLIP's projection tear, and the hazard that caught the
ship is shown on both screens. No words stand over the arena while it is
flown; its clock is the slow's fuse across the top.

**Three bars, three hands** (18 September 2026, `.claude/skills/new-boss`
§6.2; the simulation is `packages/sim/src/pulse-hand.ts`). THE PULSE splits
nothing in its verbs — both panels carry the same four arrows and a press is
judged the same way whichever thumb it came from — so the state it gained is
not a seat's. It is the **meter's**: the one number that was already the whole
of whether a stage is lost, and the one object in this game the pair owns
together.

| Bar | Meter | What is new | Whose hand |
|---|---|---|---|
| `steady` | above `pulseFlutterMilli` | the four arrows on both panels, as the round was built | both, on the panel |
| `flutter` | under it | **the brace.** Either seat may hold the bar (`pulseMeter`): its own notes are passed over rather than missed, nothing it presses counts, and the other seat's misses cost `pulseBracePermille` of what they did | either seat, on the picture |
| `arrest` | under `pulseArrestMilli` | one thumb is not enough to hold on with. **Both** at once put `pulseArrestGainMilli` a beat back, up to `pulseFlutterMilli` and no further | both seats, together |

**The brace is one of them carrying the pair**, which is the sentence this
round has always been about said with a thumb. The seat holding the bar is out
of the song in both directions — its arrows are not charged and its presses do
not count — so what the pair buys is *one* player's arrows at nearly full
value against *two* players' arrows at none. Whether that is worth it depends
on how the chart is going, which is the only thing either of them can see and
the thing neither can see all of.

**`arrest` is the first gesture in a round that takes both seats at once**, and
it is THE INSTAR's *together means together* arriving here. A bar held by the
pair climbs a beat at a time — on the beat, never on the tick, because a gain
per tick would fill it inside a step — and stops where the hand was first
offered. So it buys the stage back out of danger and never fills the bar: the
song is still the only thing that can, and every beat spent holding it is a
beat of arrows going past both of them.

**Nothing new can lose a stage.** A thumb on a steady bar does nothing, and a
brace is never worse than not bracing — what it passes over are notes that seat
was not going to be judged on either way.

**Where the hand lives.** `pulse-hand.ts` hears it, from `pulse-round.ts`
beside the four verbs and **in the count as well**, so a stage opened on a bar
the last one left fluttering is one the pair may take hold of before the first
arrow lands. `PulseState` gained `brace1` and `brace2`, both hashed;
`pulseHeart` is the reading and `pulseMissCost` is the one place a miss's price
is decided. The three events — `pulseBrace`, `pulseSlip`, `pulseArrest` — are
`events-pulse.ts`, the round's first, cued by `bind-pulse-hand.ts` and voiced
by `sounds/boss-pulse-hand.ts`.

**All three bars are posed** (`poses-bosses-rounds-b.ts`): a round nobody plays
drains its own meter, so the gallery reaches `flutter` and `arrest` by waiting
— which none of the other three rounds' second axes can say.

**What is not built** (sim lane, 18 September 2026): the picture. The bar is
drawn the same in all three states, nothing marks it as a thing a thumb may
take hold of, a braced seat's passed-over arrows look like arrows it missed,
and the three events are on both silent lists. *Never watched at tempo*:
whether a thumb can be got onto the bar and off it inside a bar of the song,
and whether a seat that has stopped playing can tell that the other one is
still going.

**The bar answers a touch the way THE INSTAR's marks do, 28 September
2026** (`render/pulse-marks.ts`; the owner, 27 September: *the consistent
visual across all waves*). Each seat's mark is its own end of the bar — the
pilot's the left, the navigator's the right — and whether it is asked is the
simulation's, `pulseBarAsks`: the count or the play, a bar not steady, and that
seat's thumb not on it yet. The halo stands under this seat's end until its
thumb is down. The partner's end wears their turning ring and the clock only
under `arrest` and only once this seat is holding, the one moment the round
waits on the other thumb. A brace washes that end green and the arrest both.
There is no red: either seat may take the bar, so no thumb is the wrong one.
The takeover feeds the verdicts (`effects-round-marks.ts`).

**Three loads, three hands** (18 September 2026, `.claude/skills/new-boss`
§6.2; the simulation is `packages/sim/src/scout-hand.ts`). The round asked the
same four things of the pair from the first mote to the last, and the seat that
could see the arena had one press in it. It has a second state now, and it is
the **load** — how many motes are aboard, which is the number the pair is
already deciding about every time they pass one, because a mote is not had
until it is banked.

| Load | Motes aboard | What is new | Whose hand |
|---|---|---|---|
| `light` | 0–3 | the three verbs and the mouth as the round was built | both, on the panel |
| `laden` | 4 | **the line.** Player 2 may put a thumb on the little ship (`scoutLine`) and it is pulled straight home at `scoutReelMilli`, with player 1's turn and burn dead while it runs | player 2, on the picture |
| `heavy` | 5+ | **the prime.** The thruster labours, and a burn does nothing at all outside `scoutPrimeTicks` of a carry on the ship (`scoutPrime`) | player 1, on the picture |

**The loads are the price of hoarding**, which is the decision this round was
always about. A pair that banks each mote as it takes it never leaves `light`
and plays the round it always played; a pair that sweeps an arena before going
home meets both of the others. The first arena has four motes, so it can reach
`laden` and can never reach `heavy`; the second has six and can reach both.

**The line does not break the split.** Player 2 cannot move the ship by a
thousandth of a tile and still cannot: the line goes **home** and nowhere else,
at under half the ship's own top speed, so she chooses *when* and never
*where*. What makes it a sentence rather than a button is that it drags the
ship along a straight line through whatever is in the way — and she is the only
one who can see what that is.

**The prime is the pilot's**, on the one thing his screen shows him. Three
motes aboard and the burn stops answering until he has carried the ship; it
costs him the hand that holds the burn, on the load where every burn matters
most.

**Nothing new can lose an arena.** A carry too short, a line on a ship that is
not laden, a prime on one that is not heavy — each does nothing, and the wave
is still lost only by a hazard's touch and by the clock.

**And the shipped figures did not move.** The first arena's twelve-beat flight
and its clock of eighteen are what they were: an autopilot that sweeps all four
motes goes `laden` on the way home, which takes nothing away, and never reaches
`heavy` at all (`packages/content/test/scout-flight.test.ts`).

**Where the hands live.** `scout-hand.ts` hears both and carries `scoutLoad`
and `scoutPrimed`, the two readings the flight and the picture must not
disagree about; `stepScoutReel` runs from `stepScoutFlight` and replaces it on
the ticks the line is on. `ScoutState` gained `reeling` and `primeTick`, both
hashed. The three events — `scoutReel`, `scoutSlip`, `scoutPrime` — are
`events-scout.ts`, the round's first, cued by `bind-scout-hand.ts` and voiced
by `sounds/boss-scout-hand.ts`.

**The picture, 22 September 2026** (`packages/render/src/scout-grip.ts`): two
rings on the one little ship, and the round's own split is what keeps them
apart. Hers is the ship's middle — her screen draws it with no nose and none
of the beads it carries, so a ring there covers nothing she reads — and it
appears the moment the load is past `scoutLadenMotes`, goes `held` while the
line runs, and draws the line itself from the ship to the mother ship's mouth.
His stands off the stern at 2.2 ship radii, along the heading, clear of the
beads on the rim and in the air the wake takes up; it appears at `heavy` only,
and its dial is what is left of `scoutPrimeTicks`, draining, so the seat
holding the burn watches the window go rather than finding out by pressing.
Each is drawn on both screens, bright on the seat it belongs to and dim on the
other, since neither can feel the other's thumb. The wake now asks
`scoutPrimed` as well: a burn held on a heavy ship outside the window adds
nothing to the flight and no longer draws as though it did.

**And the dim copy fills nothing, 22 September 2026.** A ring fills its circle
in the background colour before its own so it reads over whatever it hangs on,
and hers hangs on the **ship** — the one thing either seat watches for the
whole round — so the pilot was shown his little ship with a hole through the
middle of it from `scoutLadenMotes` on. His stands off the stern in empty air
and never cost anything, and is dimmed on her screen by the same line. Both
fill nothing on the seat that may not press them now (`theirs`,
`handle-draw.ts`). This is the one of the seven this rule reached that could
not be **photographed** — `bun run frames` knows no verb that flies the round
(`docs/queue.md`) — and the ruling stood on the same argument the other six
took a picture for; `render/test/handle-hole-rulings.test.ts` counts the discs,
which needs no verb.

**The rings answer a touch the way THE INSTAR's marks do, 28 September
2026** (`render/scout-marks.ts`; the owner, 27 September: *the consistent
visual across all waves*). Whether each is asked is the simulation's,
`scoutLineAsks` and `scoutPrimeAsks`: the line on offer with no thumb on it,
the prime on offer with no window running. The halo stands under this seat's
ring while it is asked. **The partner's clock stands on the prime alone**:
her burn waits on his prime, and nobody waits on the line, which is hers to put
on when she chooses — a clock over the middle of the pilot's own ship would be
the hole the paragraph above took out of it. The reel and the prime wash their
ring green. A press from the other seat on a ring on offer is handed through
with no hold and refused once as `scoutRefuse`, which washes it red and knocks
*not yours*; at a desk the press is signed with the ring's seat
(`scoutGripSeat`). The takeover feeds the verdicts (`effects-round-marks.ts`).

**What is not built** (18 September 2026 for the sim, and the events since):
the three events are still on both silent lists — each stands on a ring that
is already saying it. The director's STATES sheet has a card for `light` and
owes two — no hand flies the little ship to a mote — so `laden` and `heavy`
are on `OWED`. *Never watched at tempo*: whether a reeled ship reads as being
pulled or as being flown badly, and whether a prime is a gesture a thumb can
make while the other hand is on the crank.

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
and not a pressure. **The second arena's is 24, against a flight of fourteen**:
the same autopilot, taught only to hold its burn until the next two legs are
clear, banks its six in two trips of three. Its column of motes was moved onto
a pitch of two and a half tiles on the owner's answer of 19 September 2026, so
a scout at rest on any mote has 0.37 of a tile to spare from the hazard sweeping
the row beside it rather than 0.12 — room to stop and be told *now*. The
waiting rig clears the two-tile column too, in thirteen, so what the pitch
bought is the stop, not the arena.

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
