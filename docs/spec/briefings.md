# Briefings

> **Status: the guide, the introduction and the rehearsals are built, in that
> order.** A wave with a guide opens on it, and on all but four of them that is
> a **rehearsal** — the game's own screen at full size, playing the wave the
> pair is about to meet, one device at a time, with the words inside the picture
> beside the things they explain. It ends on the ready gate, whose page is the
> wave's number and name, and crossing it starts the wave. A wave
> with no guide — and a wave gone again, which skips its guide — opens instead
> on its introduction: those two lines alone, plain text on the field, which
> pass on a timer.
> §3.2 says which four are still prose and why the count is a test rather than
> a sentence anybody has to remember.
>
> **Three decisions below have been overturned on the way in**, and the
> paragraphs that made them are rewritten rather than left standing beside code
> that contradicts them: help is **placed, not derived** (and this file said the
> opposite for a while — see the next section, which is about why it changed its
> mind twice); the "already seen" set is **gone**, having been world state and
> before that `localStorage`; and a wave now opens on something *before* any
> help at all.

A wave's **opening** is what stands between the pair pressing play and the
first creature falling. It is one of two states, never both:

1. **The guide**, if the wave carries one — and it is *first*. A concrete
   instruction about the control or the concept the pair is about to meet:
   what the thing is, what he does about it, what she does about it. On a wave
   that names a scene it is a rehearsal at full size instead of a panel of
   prose (§3.2). Either way it ends on **the ready gate**: two circles, one per
   seat, each filling while that seat holds and saying READY when it is full.
   The guide passes when both say READY. Only a wave that introduces something
   new carries one — ninety-one of the hundred and two waves today, and a wave
   with no guide has no circles either.
2. **The introduction**, if it has no guide. `WAVE 4`, the wave's name, its
   one sentence. Plain text on the field — no panel, no border, nothing to
   press. It stands for a few seconds and passes on its own. A guided wave has
   said those three lines on its gate already, and the owner, 20 September
   2026: *skip the wave information on the game screen after the "ready?"
   page, as it is not required and we showed it already.* A wave gone again
   skips its guide, so it gets the introduction — the one guided opening where
   the lines have not been on screen.

**Teaching first and naming second is the owner's order, and it was the other
way round to begin with.** What decided it is what each state is *for*: the
introduction names the wave the pair is about to play, so it wants to be the
last thing before the field rather than a title card standing in front of a
tutorial. It also means the tutorial is what a pair sees the instant a wave
starts, which is what the owner asked for in those words.

Then the wave. [systems](systems.md) 5.9 has the gate's own rules — no
timeout, no free repair bay, and what letting go does.

**What stands before the opening is not this file's.** A wave that was cleared
rests for three beats before the next one is asked for, and what is drawn over
that rest — the wave just finished, what it cost, and the hand-off into the
guide as one movement — is [between-waves](between-waves.md).

## The rule it is built on, which is the opposite of the rule it used to be

Help is **placed, not derived**. A guide is written inside the wave that plays
it, in `packages/content/src/waves/act-*.ts`, directly under `name`.

This file has now argued both sides, so both arguments belong here.

**The first draft placed it**, on the reasoning that a wave dragged around in
the director should take its teaching with it — otherwise the rock is taught on
wave 9, three waves after the rock arrived.

**The build derived it**, on the reasoning that a hand-kept list beside a wave
is itself the thing that goes stale, and that reading the subject off the
wave's own entries cannot be forgotten. That was true, and it produced a closed
list of subjects in `packages/sim/src/briefing.ts` and a catalogue in
`packages/content` that was a `Record` over it.

**It is placed again now, and the reason is not that the derivation broke.** It
is that a derived card can only ever be about a *creature*, in the abstract,
because a subject is a kind and not a wave. The owner asked for the help to be
part of the wave's own configuration, under its name, and the thing that
buys is a guide that can speak about *this wave* — the three rocks and the pod
that arrive together, not "a rock is dead rock". It also gives the help
somewhere to grow: a guide is an object with named parts, so a picture, a scene
or a step list is a key added beside the words rather than a new table
somewhere else.

**And the staleness the derivation guarded against has a stronger guard than
the derivation was.** The owner's own answer to "who writes the guide for a new
creature", translated:

> Every creature gets its guide automatically, because Claude has to know that
> a new enemy needs a new wave — so the thing is visible and can be tested at
> once. And in that same moment Claude should know to author a guide briefing
> for that wave, because that wave is the first one carrying the new enemy or
> mechanic.

That is stronger, not weaker. The derivation could only put a card in front of
a wave that already existed; this says the wave and its guide are part of what
shipping a creature *means*. It is written into `.claude/skills/new-creature`
and `.claude/skills/new-wave`, and the half that can be enforced is enforced:
`packages/content/test/waves.test.ts` fails when the first wave to carry
anything new has no guide, and fails the other way too, when a wave that
introduces nothing carries one.

The second rule is the game's own and it has **one deliberate exception now**:
**neither player is told the other's half.** Every guide carries three lines —
one both screens read, and one for each device. A guide that put all of it on
both screens would have taught the pair, in the first ten seconds, that they do
not need to talk to each other, which is the one thing the game cannot survive.
So this screen gets its own half in words and the other player's half as
blocks: visibly there, plainly not yours to read.

**The rehearsal breaks that on purpose, and only there.** A guide's scene draws
*both* screens side by side (§3.2), which is the one place in the game where a
player sees the other device. The rule is about **play**, and during play it is
untouched: on the field each seat is shown only what it holds. The tutorial is
the one moment it cannot hold, because the thing that has to be learned is
precisely that the other screen exists and carries the answer — a pair shown
one screen learns a control, and a pair shown both, once, before their first
wave, learns the game. The asymmetry is kept in the framing instead: yours is
bright and labelled YOUR SCREEN, theirs is dimmed and labelled THEIR SCREEN.
Legible, and plainly not the screen you are holding. The **words** are still
split exactly as before, and that is what carries the rule the rest of the way.

---

## 1 · What has to be taught

Everything below is *built*. The right-hand column is a record of where each
block was expected to land, and it is now also where its guide actually is —
the two can be compared by opening the wave.

| # | Block | What is new | Who holds what | Wave |
|---|---|---|---|---|
| 1 | **The opening** | two devices, one ship; the cannon; the colour | see §2 | 1 · FIRST STEP |
| 2 | **The two colours** | red answers red, cyan answers cyan; a wrong colour is *spent*, not missed, and the body it was spent on refuses everything for `colourArmourMs` | p1 the column, p2 the colour | 2 · CYAN |
| 3 | **The rock** | cannot be shot; shield in the column **and** triggered at contact | p2 slides, p1 triggers | 5 · THE ROCK |
| 4 | **The torch** | two columns wide, the fastest thing in the field, and only on p1's strip | p1 sees it coming, p2 must cover both columns | 8 · TORCH |
| 5 | **The push** | the shield sends a creature back up once and never kills it; the rim goes red and the body carries ONE LAST CHANCE | p1 triggers, p2 shoots it on its second fall | 9 · ONE LAST CHANCE |
| 6 | **The pod** | shooting it loose is half of getting it; then it sinks and drifts | p2 frees it, p1 chases and opens the maw | 15 · SALVAGE |
| 7 | **The lock** | player 1's hand on a body steers every shot into it, from whatever column the cannon is in; it says nothing about the colour | p1 holds and keeps the cannon on the pod, p2 fires the colour | 16 · CATCH AND AIM |
| 8 | **The queen** | two marks, one real; she opens for two beats; a torch drops every eight | p1 sees *what*, p2 sees *where* | 18 · BULB QUEEN |
| 9 | **The bosses** | the mirror, the maze, the gauge, the warden and its line, the vane | one guide each, on their own wave | 19 · THE MIRROR, 20 · THE MAZE, 21 · THE GAUGE, 22 · THE WARDEN, 31 · THE VANE |
| 10 | **The rest of the bestiary** | the lure that took the runt's place, the throb, the count, the shell, the pods, the rock speed tiers | one guide each | 24 · THE LURE, 25 · THE THROB, 26 · THE COUNT, 27 · THE SHELL, 33 · THE PURGE, 34 · THE WARD |

**The grip is still the odd one out**, and it has no guide. It is a control no
wave *contains*, so no wave is the first to carry it and nothing places it.
That was true when help was derived and it is still true now: placing a guide
did not solve it, it only moved where the hole is.

The lance used to sit beside it and no longer does. It lost its own button on
7 September 2026 and became a thing the two colours do when they are held, and
wave 32 — THE LANCE, three cyan in one column and three red in the next — is
the wave that carries it and the guide that teaches it.

### The gap the merge left

Where two or more subjects first landed on the *same* wave, their words were
merged into that wave's single guide rather than dropped: `THE WARDEN` carries
the ring and its line, `THE VANE` carries the arm and the quicker rock, `THE
WARD` carries the pod and the rock speed tiers, and `FIRST STEP` carries
the split itself and the slick. Nothing was deleted; four moments were.
The fix, if it turns out to matter, is a wave each rather than a second
guide on one wave.

---

## 2 · The opening, in detail

### The introduction

Three lines, and it is the same on both screens because all three are the same
on both devices:

```
WAVE 4
THE ROCK
The one where neither of you can do it alone.
```

Plain text, centred in the play area, nothing behind it and nothing around it.
A frame says "press me"; text on the field says "read this, it is about to
start". Nothing *is* pressed: it passes on a timer.

**The timer is counted in the app, and the world is what holds the wave.**
`packages/sim` may not read a wall clock — that is what makes lockstep
possible — so the introduction is a state in `world.brief` like the guide, and
`apps/game/src/waves.ts` counts the five and a half seconds and then sends the
same `brief` command a thumb sends, one per seat. Two devices leave the
introduction a few frames apart and agree about it anyway, because the acks
travel the wire every other press travels.

The director's stage is the one place a press *does* carry the introduction
past, and that is a tool decision rather than a game one: it is where somebody
restarts a wave twenty times in an afternoon, and making them sit out the timer
each time is what would get the whole opening switched off.

### Every guide is a stack of pages

Each page repeats on its own — it plays, pauses for a moment, and plays again,
and it is **that page** that repeats rather than the film from the top. NEXT
begins to glow once a page has played through once, which is the only pacing
advice the film gives: the page goes on repeating either way.

A guide is **pages**, and each seat has its own cursor into them
(`world.brief.stepP1` / `stepP2`, both in the hash). BACK goes back a page, NEXT
goes on, and the bar at the bottom says which page this is and how many there
are. A guide that carries a scene has one page per step of the rehearsal, and
each of those repeats its own animation and its own words with a short pause on
the end of every turn until the seat reading it presses NEXT. A guide made of
prose has two: the line both screens carry, then the split.

**There is no card.** The bordered panel those sixteen used to be is gone, on
the owner's instruction — *I don't want to show old cards any longer* — and
their words are plain type on the game's own screen now, arriving the way the
wave's own name does (`render/guide-prose.ts`, `render/text-drop.ts`).

That is the owner's own arrangement, and the reasons are his: the film ran once
at a tempo nobody could keep up with, and *every player has their own time to go
through the tutorial, and just at the end both need to say they are ready.*

**The last page is the gate, and it is the introduction.** Its picture is the
game's own screen with the wave's number and its name over it, and
the two circles under them — so a guided wave has no separate introduction
behind it, and crossing the gate starts the field. The whole column sits at the
top of the screen, over the sky rather than over the ship.

**The circle is the control, and there is no button.** There was one, filling as
it was held, and it was one gauge too many — *we don't need button and circle to
have progress, only stay with the circle*. So the circles are big, a thumb
presses its own one, and above them the word **READY?** pulses instead of
offering something to press. It is still a hold: a lift before the ring closes
empties it. The one waiting for its player breathes in that seat's own colour;
the line that says who has not answered yet is the loudest thing on the page
after the wave's name, because two people reading at their own speeds means one
of them is nearly always waiting. When both rings close, the two colours run out
of the middle of the screen as rings of their own and the wave is behind them.

`world.brief.steps` is the count, handed to `startWave` from `content` — never
a scene and never the words: the simulation still reads neither. `guideSteps`
takes the guide rather than a wave's number, because the director edits a wave
that is not on disk yet.

Replaying a page rebuilds the rehearsal's world and runs the ticks before the
page silently (`SceneRun.restart`). There is no rewind, for the same reason
there was none when the loop wrapped: a world is a large mutable thing with a
random stream in it, and putting one back is a second definition of what a world
is made of.

### Wave 1's guide, which is about the split

`FIRST STEP` carries the guide the old catalogue called `opening` — the one
subject that was in no wave's contents, raised before the pair's first wave and
never again. It is a wave's guide now like any other, which is one special case
gone:

Both: *One ship, two screens — and the two screens do not show the same thing.
What is coming is on one of them; the control that answers it is on the other.
This first one is flat, wide and always red.*
P1: *Yours is the cannon, the shield's trigger and the maw. Slide your strip
until the cannon stands in its column, and say which column.*
P2: *Yours is the shield itself, and the two colours. Press red — nothing
leaves the hull until you do.*

The beat and the run line are still explained nowhere. The voice
channel is deliberately not explained here either — that belongs to the menu,
before a room is even joined.

---

## 3 · What is required

### 3.1 Data — `packages/content` · built

- `wave-types.ts`: a `WaveGuide` is `{ both, p1, p2 }`, and `Wave.guide` is an
  optional one, written directly under `name`. (`sentence` stood between the
  two until the owner took it off every wave, 25 September 2026.)
- **It is an object with named parts, and that is the whole point.** Never
  three loose fields on `Wave` and never a bare string. The owner has said
  plainly that a guide may one day be more than words — a guidance animation,
  built step by step — and an object is the shape that takes a `scene`, a
  `picture` or a `steps` key without a single wave file moving. Anything added
  is optional, so the sixteen waves that carry words keep carrying only words.
  §3.2 added the first one, and it cost exactly what this paragraph promised:
  one optional key, and no wave file moved.
- **`WaveGuide.scene` is a name, not the choreography.** It points at an entry
  in `packages/content/src/scenes.ts`, the way `Wave.controls` points at a
  control set, and for the same reasons `control-sets.ts` argues at the top of
  itself: a named thing is something a person can be shown and told to change,
  the director writes it back out as one line rather than needing a serializer
  for a command track, and a hundred lines of timing in the middle of a list of
  arrivals is not a wave file anybody can read.
- The heading a guide is drawn under is the wave's own `name`. A guide has no
  title of its own; it belongs to one wave and that wave is already named on
  the introduction the pair read ten seconds ago.
- There is no catalogue and no subject list. `BRIEFING_SUBJECTS`,
  `MAX_BRIEFING_SUBJECTS`, `subjectIndex`, `BRIEFINGS` and `BriefingCard` are
  all gone, and so is `Wave.card`, which named one of them.
- `Wave.hint` is gone too. It was a line under the wave's name in a banner over
  a *running* field; the introduction says what it said, before the field runs.
- The one-sentence recognisable description of each creature, pod and boss
  survives, in `packages/content/src/mechanics-table.ts`, where the bestiary
  and the mechanic sheet read it. That is a different sentence from a guide: it
  says what a slick *is*, where a guide says what this pair does next.
- Purity applies unchanged — it is content, so no clock, no randomness, no DOM.

### 3.2 The rehearsals — all but four of them

A guide that names a `scene` does not draw a panel of prose at all. It plays a
**rehearsal**: the game's own screen at full size, one device at a time. FIRST
STEP's is still the shape of every one after it — a red slick falling, a hand
walking the cannon into its column, a slide across to the other player's screen,
RED pressed, the shot taking it, and then a second slick nobody answers, so the
last thing the pair is shown is the hull bar dropping. About five seconds,
looping.

**There are eighty-seven of them now**, one per guided wave bar four, and
each is authored in `packages/content/src/scenes/` as a page of choreography
rather than a page of prose. The four that are still the three strings
and the two circles are **THE HASP, THE RATCHET, THE NETTLE and THE MANTLE** — and
that list is held by
`test/scenes-prose.test.ts` rather than by this paragraph, so a film written
for one of them fails a test here instead of leaving a sentence quietly wrong,
which is what happened to the line this one replaced.

**Every one of those four is a film nobody has written, and since THE
HIVE's they are owed by the lanes that draw them.** THE GORGE's was the
first of the boss films written after its look landed rather than with it
(17 September 2026), every column authored because the sack does
not move, and the film ends two ruptures short of the mouth: what it teaches
is the restraint, and the mouth is the prose. THE CURTAIN's, the same day
again, is the first film whose every act is the pilot's hand on the boss —
the grip and the carry (`gripBody`) — with the cannon standing still the
whole way; its seed is the one thing about it that is chosen rather than
authored, because the core has to start under the cannon and the lobe over
it has to be soft when the film says so. THE TASTER's, the same day, is the
first whose arithmetic is authored: no arrivals, so every bolt loads the
ledger, and the reds and cyans are spaced so the count is never level and
every edge sets red — the seed decides nothing. The second blade stands over
a column no authored strip reaches, so its shot is an `atBoss` act
(`boss-answer.ts`); the film takes no hit, and the hurrying, the crest cut
and the beam are the prose. THE SINEW's, the same day, is the second film
with a hand on both phones at once: every pull is carried to a written
number rather than to taut, because the sum of two hands is the lesson and
the seed's zone is what the numbers are authored against; it ends on the
snap and the rock the shield turns, with the fall, the sway and the slack
left to the prose — and its guide rewritten 19 September 2026, when the
handles started saying *PULL*, *HOLD*, *SWAY* and *LIFT* themselves: each
half now opens on the gauge only that seat can see and spends a step on the
half of the fight the field is not allowed to say, his on what *LIFT* means
and hers on the tell nobody else has, a sum sliding with her hand still. THE LEDGER's guide was rewritten 19 September 2026, when the seam's column
went onto the field: it had told the **pilot** to fire at nothing else once the
split was open, which is a press he does not have, and had told nobody that
from the second hit every shot is billed and every ward widens the split for
free. Each half now opens on the gauge only that seat can see — his the return
coming down, hers the socket — and its cadence says *four beats, a beat sooner
each time after, down to two* rather than four flat. Its film, the same day, is
two hits and two returns, both warded:
the colours are the seed's, the second socket is a column no authored strip
reaches and the plate is carried there by `atBoss` — the one boss answered
with the plate rather than the cannon — and the bill for every shot and the
fifth return the plate must step out from under are the prose, because a
thumb lifting off is the one gesture a film shows badly. THE SURGE's guide was rewritten 19
September 2026, when the bulb learnt to say `HOLD` and `LIFT`: both halves had
spent their first step on *put your thumb on the bulb and keep it there*, word
for word, and neither had ever named the three things the notches change — from
the second the bulb keeps its charge with no hand on it and eats what the wave
sends, from the third a thumb charges at double and a burst shuts a notch again.
Each half now opens on the gauge only that seat can see. Its film, the
same day, is three holds on one handle both seats hold — the first film
whose acts say whose hand each is (`SceneAct.hand`), because the bulb is one
`DragTarget` for either thumb — and the middle hold is the mistake, a thumb
off alone with the charge lost under the other; the burst, its gums and the
eversion at the fifth notch are the last two pages' words and the prose.
THE LEAD's guide was rewritten 19 September 2026, when the field learnt to say
`STILL` and `BURN`: the pilot's half had told him to *say the turn a beat early*
from the second segment, and `leadForecastSegments` is 2, so the stalk had
already started doing it for him and he was being asked to double-count; the
shared line named neither the pace change at the first hit nor the still at all.
It is the one guide in the game with no word to lean on for *where it will be*,
because the pilot is never shown the column and a cue that appeared only
sometimes would be the column by its own absence — so the pilot's half carries
the arithmetic itself, two ahead at a walk and four at a run, inside the 220
characters a half is allowed (`content/test/guides.test.ts`). Its film, the
same day, is the mistake first — a shot at where the body
is, missed and turned round — and then four at where it will be, every one
an `atBoss` strip answered by the sum itself (`leadLead`, two beats on);
the run's litter is laid around, since a rock stands in its column for the
fourteen beats of its fall, and the beam is held three beats early so it is
standing when the pass comes through.
THE SCUTTLE's guide was rewritten 19 September 2026, when the field learnt to
send the pilot to the last part's column: its first step for him had been *say
the count down to the throw*, and the hanging parts slide down their threads on
both screens, so the countdown was never his to say — the count of plates left
is, because her slab is blind, and with it when the twins begin and when the
cadence tightens. Her last step told her to hold the live part's colour for the
beam, and the beam's colour is never read at all. Its film, the next day, lets
its first part go and is the cost of that
— a rock thrown, warded thirteen beats on — then strikes nineteen where
they hang, every column an `atBoss` strip (`scuttleNextCol`) because the
seed hangs them over columns no authored column reaches; the twins are
shot at the top of their columns between strikes, the pods struck on the
frame rather than thrown, and the seed is chosen so that neither is.
THE ANTIPHON's guide was rewritten 19 September 2026, when the body learnt to
say `STILL`: three steps and a one-line shared half for the boss with the
longest rehearsal in the game, and between them they had never named the turn
the pilot's one handle makes — the field has said `TURN` since the handle
shipped — nor the window she alone is shown, nor that a wrong answer widens the
rail for good, nor that the last organ is their own ship. All four are written
now, and the arithmetic stays in the briefing because the field says no shape,
no colour and no column in either direction. Its film, the same day, is the
wrong candidate first — a decoy's colour
in the decoy's column, and the rail one wider for the rest of the fight —
then six organs taken where they stand, every column an `atBoss` strip
(`sim/boss-answer.ts`) because the rail is laid on any of the eleven, the
fire the colour only the navigator is shown; from the third pit what the
rail rejected falls as bodies and each is taken by `atBody` two beats apart,
the twins one and then the other, and their own ship last among ships.
THE SPOOL's (24 September 2026) is the fight's one exchange played wrong and
then right: the pilot takes the brake at the top, the line gains on the
navigator's bracket until the first movement slips — the one slip that costs
nothing — her page says *slower*, and his carries the knob 520 deep in the
slip and holds it through the next movement until a rib eases. The rates are
the seed's, so the depth is written against them and
`scene-spool.test.ts` holds both; the hand is on the brake before the first
zone opens, so the knob's `HOLD` never stands and no page says it.
THE SCOUT's, the same day, is the first film of a round flown rather than
shot, and the first whose acts were searched for rather than authored: a
burn is a push that keeps going and a turn does nothing to the drift, so
each leg — a wait, a turn, a burn of so many ticks — was found by re-running
the film and keeping the first that reached its mote and did not drift into
the hazard after. The first arena is flown whole, four motes in a loop and
home with the maw tapped on the tick the hull is touched; the second opens
and its first trip comes back with three, and the mote hanging on the
hazard's own row (`docs/queue.md`) is left where it is. Every page is a
seat's control or the hull, because the arena the navigator reads has no
anchor; the pilot's pages never say where a mote is. THE STARE's, the same
day, is the film of a thumb **not** landing, which the list above said was
the hardest to choreograph: a rehearsal is a thumb on a named control, so
the film is shaped around what the *other* seat does while one is frozen,
and the frozen seat's page carries no act — the pilot watched and the
navigator firing up the column the pilot parked under, then the navigator
watched and the pilot guarding a rock alone. Which look is whose is the
rng's, so the seed is chosen and held by a test (`scene-stare.test.ts`);
the cost is the last page, because a caught press stops the world.
THE REPRISE's, the same day, is the film of a stretch the pair can no longer
see: three bodies fall seen and are taken, the field goes dark with the tear
counting them, and two of the three come back down the same columns at the
same spacing and are taken by a cannon slid to a column somebody said and a
beat somebody counted — the kill drawn whole over nothing (`render/unseen.ts`).
The third is the one nobody said, and it lands with the tear already shut,
which is the last page; `scene-reprise.test.ts` is the receipt that the two
kills after the dark are of bodies nothing drew.
THE FLIP's, the same day, is a screen that turns, shown by turning: a cyan
body comes down the pilot's second column and on the seventh beat is against
the far wall instead, same row, still falling, the walls lit; then the
navigator's page says the true column, the pilot carries the cannon to that
number and not the one their eyes give and the bolt lands; the middle is
shot to say the fold has a centre; and last, on the pilot's own page, a
body drawn in the second column is fired at in the second column and lands
in the sixth. Writing it found that no film folded at all — `guide-scene.ts`
laid its seats out without asking whose screen was turned — so the film of
the mirror was a film of nothing happening; `guide-film.ts`'s `seatLayout`
now folds the turned seat's layout, caption and hands with it
(`render/test/guide-flip.test.ts`), and `scene-flip.test.ts` is the receipt
that the bolt sent to the called column lands and the one sent to the seen
column does not.
THE HUSK's, the same day, is a mark drawn on one seat's screen and not the
other's, and a thumb that must not land. Three pods hang from the first
beat, two hollow, framed in white on the navigator's screen alone
(`render/husk-mark.ts`); the first two pages are the same beat from each
side, the frame on one and three pods alike on the other, and nothing in
the film says the mark is missing — the rehearsal draws every page on the
seat whose screen it is, so the absence is the picture. The maw left shut
is THE STARE's problem a second time and takes THE STARE's answer: the
real one is named, shot and taken at an open maw; the framed one is shot
and left, the pilot's page pointing at the intake with the hand off it, and
the husk deflates against the shut maw; and last, the one nobody named is
shot and opened for, swallowed, and the wave with it. `scene-husk.test.ts`
is the receipt for what the maw was doing when each pod arrived. Its film
took `scenes.ts` past its limit, so the films this paragraph lists as owed
now sit in `scenes-owed.ts`, beside the faults' (`scenes-faults.ts`) and
the choreographed bosses' (`scenes-choreographed.ts`).
THE HIVE's (21 September 2026) is the last film this paragraph was owed by a
look lane, and it is written against a fight that had been fixed and never
watched. The seed is chosen for two accidents — the first two breaches open
in different colours, so the second cannot be answered by repeating the
first, and the twins at the fifth opening land on adjacent columns one red
and one cyan — and most of its shots come in pairs, because a spill is a
living body and a bolt of the breach's own colour is spent killing one: it
is *clear it, then seal it*, twice. One column is sealed before it ever
spills, one is answered in the wrong colour and spills a beat early for it,
and the last page is one twin sealed with the other spilling beside it,
since a bolt cannot pass a falling body and no film can clear one column and
ward another in the same beats. Its two split pages point at things
`caption-anchor-boss.ts` had no line for — every open breach at once, and
the swell, which is no ring at all on the pilot's screen because his screen
does not draw one.
THE MINE stood on this list as the one that *could not* have a film — every act of a
rehearsal was a thumb landing on a named control (`scene-script.ts`,
`controlPress`), and that creature's whole answer is a finger on a bare square
of the field. Since 17 September 2026 an act may be a **tile** — a column, a
row and the seat whose finger it is, the one gesture whose seat is authored
because which seat is blind to a mine is the arrival's (`SceneAct.tile`) — and
the ghost hand for it is placed from the act rather than from the world,
because on the seat that presses there is nothing drawn to place it by. The
hand coming down on nothing turned out to be the picture, not the problem: it
is what the blind seat's screen looks like.
THE SPLICE's guide was rewritten 19 September 2026, when the field learnt to say
`WAIT`: it had spent a step on each of the two gestures and named **neither the
clock nor the rounds at all**, on the one boss in the game where the clock is
drawn to one seat only and a spent one costs the hull exactly as a wrong feed
does. The shared line now says which half of the picture is on which phone,
which button is on which panel and what a mistake costs; hers opens on the clock
nobody else can see and carries the arithmetic — eight beats a straw, two of them
the number's own travel and spent from the same clock — and his on the ring that
marks the mouth he is under and the two beats that are his to spend rather than
wait through. Only one page of its film changed, because the field names neither
of this fight's gestures: the last one said *SUCK. ONE COMES DOWN*, which the
falling number says for itself, and it says the cost instead. (The `WAIT` went
on 25 September 2026, the owner's word: *for the player it is clear to wait*.) Writing the words
found the boss's own file (`sim/splice.ts`) and the film's own paragraph
describing the panel backwards — the navigator with no SUCK and the pilot holding
both buttons — against `["cannon", "mawTake"]`, which is what a lane deciding
whose glass a word goes on reads first.

THE INSTAR's guide was rewritten 19 September 2026, when its own scanner box
learnt to say the kind of action over the gesture, the two lines `boss-cue.ts`'s
readings draw everywhere else. That box predates #34 — the owner's own brief for
it asked for both lines from 17 September 2026 (`bosses.md` §11.32), and only
the gesture ever landed — so the guide had been carrying the line the box now
says on its own: *find the bright mark with a word over it*. With the box
naming what and how, the guide only needs to say that a bright mark is the
pair's own and a dim one is watched, and drops from three steps to two on each
phone. **On 25 September 2026 it came off altogether**, in the owner's words:
*the boss is self explanatory, because it contains in game text descriptions
and visual helps, so remove completely the guide/tutorial stepper part with its
text.* THE INSTAR is one of two waves first on a panel with no guide
(`test/waves.test.ts`, `SAYS_ITSELF`); it opens on its number, name and
sentence like any unguided wave. THE FILAMENT is the other, the same day:
asked whether it wanted a film, the owner answered *both guides go*, since
its rings say whose move is open and its pips the window.

**A wave with a film carries no prose.** Until 25 September 2026 this said a
filmed wave kept its three strings as well, for a phone that had already
watched the film once — but the game never drew them once a film was up, and
the director showed them as dimmed fields nobody read. The owner's word that
day: a wave is a plain wave that shows its name, *or* a guide that explains in
the game step by step, not both. So `WaveGuide` is a film or words
(`content/wave-types.ts`), the eighty-two filmed guides lost their strings, and
the ten still in words each have a `docs/queue.md` entry to become a film.
Where a paragraph in §3.2 says something *is the prose*, read it as what the
film leaves out.

**It was a card first, and the card is what the owner rejected.** The first
build drew both devices as thumbnails above a block of prose. What came back
was the shape of the thing now: give the tutorial the whole screen so the text
and the graphics are not tiny; show one device at a time so it is unmistakable
whose it is; put the words *inside* the picture in the position where they are
explaining, because a paragraph under a shrunken picture is two things to look
at and the eye reading the paragraph is not watching the thing it describes;
and when the film moves to the other seat, **slide** there so the pair can
follow the move. So: no card, no text block, one screen, a switch you can see.

The load-bearing requirement is unchanged, and everything below follows from
it: **the demonstration is drawn with the game's own geometry, not a diagram of
it.** A guide that shows a simplified hull teaches a shape the game does not
have, and goes on being wrong until somebody changes the lobe.

#### It is a real simulation, and a painted scene is forbidden

This section used to ask for "a pure function of `(ctx, panel, t, role)`", and
that was the wrong shape. A function that draws where a creature *would be* at
`t` is a second copy of where a creature lands and of what a shot does — the
exact class of drift `packages/sim/test/purity.test.ts` keeps a table against.
It would have been correct on the day it was written and quietly wrong the day
the fall speed changed, and nothing tests a painting.

So a scene is **played**. `SceneScript` (`packages/sim/src/scene.ts`) carries
what `startWave` already takes — a queue, pods, a boss — plus a command track
of `{tick, player, command}` and a length in ticks. `SceneRun` builds a world
from it, steps it with the real `step`, and rebuilds it from the same seed when
the loop wraps. The spawn is `spawnArrivals`, the fall is `onBeat`, the shot is
`fire` and the hit is `resolve`; change any of those and the rehearsal changes
with them.

#### Who owns what, and why

Three packages, and the split follows two precedents that were already here.

- **`packages/content` owns the data.** A scene is authored in the game's own
  vocabulary: arrivals are `WaveEntry`s in the same seven columns every wave is
  written in, put through the same `queueFromWave`, and a press names a
  `ControlId` and nothing else. `sceneScript` turns that into the sim-shaped
  script.
- **`packages/sim` owns the runner**, and is *handed* the built script — the
  `startWave` precedent exactly. It never reads `content`, so the direction
  stays `content -> sim`.
- **`packages/render` owns the clock and the drawing.** `GuideStage`
  (`guide-scene.ts`) turns wall-clock seconds into a number of ticks, asks the
  runner for them, and draws what comes back twice. It contains no rule. The
  rehearsal world is never hashed, never on the wire and never read back by
  anything but a draw, which is why a picture is allowed to hold one at all.

#### The `Field` split turned out to be unnecessary

This section used to call for splitting the tile-and-hull part of `Layout` out
as a `Field` (`tile`, `gridLeft`, `gridTop`, `gridWidth`, `gridHeight`,
`hullY`), so that a few-hundred-pixel panel could be one. **It is not needed
and was not done**, and a full-size film needs it even less than a thumbnail
did: a rehearsal is `computeLayout` at the stage's own size for the seat that
is showing, and every pass then draws exactly as it does on a phone — the
backdrop, the radar, the membrane sampled by `hull-frame.ts`, the band with its
strips and lobes — because it *is* the phone draw.

Two things did have to move. `FieldPose` (`field-pose.ts`) is the eased pose
and the hull mood lifted out of `canvas2d.ts`, so the renderer and each seat's
view share one copy of the easing instead of two. And each seat owns its own
`Effects`, cleared when the loop wraps — a rebuilt world starts `beat`, `tick`
and `nextId` at 0 again, so anything cached against them would be read by the
next turn as its own (CLAUDE.md, `render/test/restart.test.ts`).

**A rehearsal's field is the game's field.** Same columns, same rows, same
hull: there is nothing to be gained by shrinking it at full size and a shape
would be taught wrongly if it were. One thing about the *world* is the
scene's own and named as a field rather than hidden in a drawing: the tempo
(`bpm`, quicker, because a film with five things to get through at the game's
own beat is a film nobody watches twice). There was a second, the hull's
regeneration held at zero so the last step's cost stayed visible; the hull has
no points to mend now, and a miss's cost is the wave itself.

#### The screen it shows, and the switch between them

A step owns a seat (`SceneStep`). While the seat does not change, one screen is
drawn; the moment it does, the outgoing screen slides off to the left, the
incoming one follows it in from the right with a lit seam on the join, and a
banner names the screen that has arrived (`guide-switch.ts`). The hand is drawn
only on the screen it belongs to — a thumb carried over from the other device
would be a finger pressing a button that is not there.

The gate is a strip **under** the film rather than a bar over it, and the film
is laid out in the stage minus that strip. The band — the strips and the two
lobes — is one of the things being taught, and a gate drawn on top of the lobes
would hide the button the ghost thumb is pressing.

#### The captions

A step's words name a subject and the drawing finds it: a body on the field, a
control on the band, the hull, or the bar that says what the hull has left
(`SceneAnchor`, `guide-caption.ts`). Nothing is placed by coordinate, so a
caption cannot come off its subject when the layout changes — the rule the
ghost thumb already plays by. A body's ring is placed from `creatureCenter`,
the one place the between-beats glide is written down, because a ring placed
from the tile alone lands a whole row behind the shape it is meant to be
around. The run line's position comes from `runLineBox` in `hud.ts` for the
same reason.

Text is as short as it will go. `SLICK`, `P1 · SLIDE TO ITS COLUMN`,
`P2 · FIRE RED`, `MISS ONE`, `AND THE HULL TAKES IT`.

#### A page the fight now speaks for loses its verb

*17 September 2026.* Twelve of the choreographed bosses carry a **cue** in the
fight itself: a scan frame on the mark where the action is wanted, one word
beside it — the verb — and above it whether that is a press, a carry, a turn or
a hold (`render/src/boss-cue.ts`, `docs/decisions.md` #34). The owner's rule
came with it: *what is explained during the boss game wave must be skipped in
the tutorial briefing of the boss wave.*

So a rehearsal page whose whole payload is a gesture the fight names at that
same moment is teaching the player what they are about to be told. **The verb
comes out; the page only comes out with it when the film can spare the seat.**
That second half is not a softening, it is the film's own machinery: the page's
`seat` is which screen the film is showing, and a ghost hand is drawn only for
acts belonging to that seat (`guide-hand.ts`). Take a pilot's page away between
two of the navigator's and his slide, his grip or his trigger still happens —
on her screen, with no hand on it and no cue either, because the cue is drawn on
the seat that can act. The gesture would not have been handed to the fight; it
would have been deleted.

Five pages across the nine films had nothing but a verb in them. Four kept their
tick, their seat and their anchor and were rewritten to the half a cue may never
carry; one came out whole, because the page before it is the same seat and the
hand still draws.

THE CANDLE's and THE ORRERY's rows, and the paragraphs after the table about
them and THE DIASTOLE, are the record of three bosses taken out of the game on
25 September 2026 (now under *Retired* in [bosses](bosses.md)). The lessons
stand; the films and the files they name do not.

| Film | What it said | What it says now | The cue that took the verb |
|---|---|---|---|
| THE CANDLE | `PLAYER 1 SLIDES CLEAR OF IT` | `PLAYER 1 CALLS ITS COLUMN` | `CARRY` / `MOVE` on the cannon, his alone — while it was eating his column until 19 September 2026, and whenever it is off the glow's column since |
| THE CURTAIN | `PLAYER 1 SHOVES IT ONE OVER` | `A SHOVE IS ONE COLUMN` | `CARRY` / `SHOVE` on the membrane |
| THE UNDERTOW | `PLAYER 2 MOVES THE PLATE OFF` | `A SHIELD HERE BLOCKS SUCK` | `CARRY` / `MOVE` on the plate standing where the maw is coming |
| THE BATON | `PLAYER 1 PULLS THE TRIGGER` | `PLAYER 1 GREYS FOR A BEAT` | `PRESS` / `LAUNCH` on the bead in its socket |
| THE LEDGER | `GUARD AS IT LANDS` | — the page is gone | `PRESS` / `SHIELD` on the bead riding down the cord |
| THE STARE | `WATCHED · TOUCH NOTHING` | — the page is gone | `STILL` at the foot of the gaze, on the watched seat, once the look lands |
| THE STARE | `WATCHED NEXT · HANDS OFF` | `NO WARNING HERE · ONLY THERE` | the same, two beats on — the tell has no cue, by design |
| THE STARE | `A BODY · STILL NOTHING` | — the page is gone | the same |
| THE MIRROR | `NOTHING COUNTS YET` | — the page is gone | none: the band is drawn dead while it holds the controls, and the cue is silent there on purpose |
| THE MIRROR | `NOW GIVE IT BACK IN ORDER` | `THE ORDER IS THE TEST` | `PRESS` / `REPEAT` on the mirror's cannon for the whole of `listen`, on both screens |
| THE MAZE | `PLAYER 1 TURNS THE WHEEL` | — the page is gone | `CARRY` / `TURN` on the string's handle, his alone, while nothing has clicked |
| THE MAZE | `PLAYER 2 FIRES UP THE COLUMN` | `THE HEART TAKES ONE COLOUR` | `PRESS` / `FIRE` on the lit doorway, hers alone, for as long as one stands |
| THE GAUGE | `PLAYER 1 TURNS THE VALVE` | — merged into the page above it | none: the field can tell the pilot nothing true, and says so |
| THE GAUGE | `PLAYER 2 CALLS IT` | `EACH HIT MOVES THE WOUND` | `PRESS` / `CALL` on the end of the needle, hers alone, while it is seated and the call is armed |
| THE WARDEN | `PULL IT AND KEEP PULLING` | — the page is gone | `CARRY` / `PULL` on the handle once his hand is on it, then `HOLD` when the line goes taut, his alone |
| THE WARDEN | `ONLY WHILE IT IS OPEN` | `THE SHOT IS THE RIM'S COLOUR` | `PRESS` / `FIRE` on the pupil, hers alone, for exactly the beats the eye stands open |
| THE WARDEN | — the guide teaches WATCH only | — | `HOLD` / `HOLD` on the shut eye, hers, under NARROW while a line hangs and her thumb is not down; `CARRY` / `SWIPE` on the hatch, his, under GLARE until it is thrown — one word for each of the two later hands, said by the cue and never by the ring (`warden-grip.ts`) |
| THE FLEET | `PLAYER 1 FIRES THE SALVO` | `THE SHELL IS THE RELOAD` | `PRESS` / `FIRE` on the sights, his alone, while they stand on a hull nobody has fired at |
| THE VANE | `PLAYER 2 FIRES RED` | `THE COLUMN MUST BE CLEAR` | `PRESS` / `FIRE` on the mouth of the split, hers, and `CARRY` / `MOVE` on his cannon |
| SNAKE | `AND THE NEXT ONE` | `A METEOR STOPS THE SHOT` | `SHOOT` on an enemy and `EAT` on a point, on the one item the head looks at or is nearest to, on both screens; `PRESS` over it only on the step a press lands |
| PINBALL | `PLAYER 1 SLIDES THE CANNON` | `THE CANNON ALSO CATCHES` | `CARRY` / `MOVE` on the cannon, his alone, while a ball in the air is coming down somewhere else |
| THE SCOUT | `AT HOME, PLAYER 2 OPENS MAW` | `ONLY THE MAW TAKES A MOTE` | `PRESS` / `OPEN` on the mother ship's mouth, hers alone, while the little ship stands on it and the mouth is shut |
| THE UNDERTOW | `PLAYER 1 SLIDES UNDER IT` | `THE CANNON MUST BE UNDER IT` | `CARRY` / `MOVE` on the cannon, his alone, while a lobe stands in a column he is not in |
| THE UNDERTOW | `THE MAW TAKES IT AGAIN` | `PLAYER 1 SEES NO SHIELD` | `HOLD` / `SUCK` on the lobe standing over his own column |
| THE UNDERTOW | `THE MAW TAKES THE NEAR ONE` | `PLAYER 1 CANNOT REACH BOTH` | the same, on the one of the pair he is under — and nothing on the other |
| THE THROAT | `PLAYER 2 CLEARS IT WITH RED` | `A SHOT STILL KILLS IT THERE` | `PRESS` / `FIRE` on a living body standing in the mouth, hers, while his carriage is in the mouth's column |
| THE THROAT | `SWIPED LEVEL INTO THE MOUTH` | `IT FLIES THE WAY YOU SWIPE` | `CARRY` / `FLING` on a gum, his alone, on the one beat it is on the mouth's row |
| THE ORRERY | `NAKED · HOLD RED · THE BEAM` | `NAKED · A SHOT IS SPENT` | `HOLD` / `BURN` on the core, hers alone, once every ring is off and no lobe is already filling |
| THE ORRERY | `HOLD THE MIDDLE · IT STANDS` | `THE BEAM USES YOUR COLUMN` | `CARRY` / `MOVE` on the cannon, his alone, whenever it is off the core's column — in every phase the fight has one |
| THE CANDLE | `PLAYER 2 FIRES · IT DIMS` | `EITHER COLOUR DIMS IT` | `PRESS` / `FIRE` on the glow, hers alone, while the cannon is under it |
| THE CANDLE | `IT DRIFTS · PLAYER 1 FOLLOWS` | `IT DRIFTS EVERY FEW BEATS` | `CARRY` / `MOVE` on the cannon, his alone, whenever it is off the glow's column |
| THE CANDLE | `PLAYER 2 FIRES WHERE HE SAYS` | `FOUR MORE PUT IT OUT` | both of the above at once — her verb stands on the glow and goes quiet the moment his cannon leaves its column |
| THE CANDLE | `PLAYER 2 FIRES · CLEAR` | `OFF ITS FACE · IT DIMS` | the same `PRESS` / `FIRE`; the clearing is the half it cannot say, because only he is drawn the cone |
| THE GORGE | `ONE MORE · IT BURSTS` | `FOUR BEATS OR IT TORCHES` | `PRESS` / `PIERCE` on the intake, hers alone, while the cannon is under it — beside `HOLD` / `PINCH` on his |
| THE CURTAIN | `HOLD IT · CARRY IT FOUR OVER` | `FOUR OVER AND IT IS CLEAR` | `CARRY` / `SHOVE` on the sheet — `CARRY` is the kind line, so the page was saying the field's word to get to its count |
| THE CURTAIN | `FIRE ITS COLOUR AS IT BARES` | `ITS COLOUR OR IT FIRES BACK` | `PRESS` / `FIRE` on the core, hers alone, once the cannon is in its column |
| THE TASTER | `PLAYER 1 HOLDS THE NEXT ONE` | `EVERY SHOT FEEDS THE COUNT` | `CARRY` / `MOVE` on the cannon, his alone, while the column he is in has nothing that can be answered |
| THE CAIRN | `A STILL THUMB MOVES NOTHING` | `NO SHOT REACHES THIS PILE` | `CARRY` / `PULL` on the stack, either seat's — `CARRY` is the kind line, so the page was saying *a thumb carried across the field* in its own words |
| THE CAIRN | `CARRIED RIGHT · ONE FALLS` | `THE WAY YOU GO IS ITS COLUMN` | the same word; the side is the silence it leaves, and the one thing about this fight either of them decides |
| THE REPRISE | `DARK · THE TEAR COUNTS THEM` | `DARK · SAY THE COLOURS NOW` | `CARRY` / `MOVE` on his cannon from the beat the tear opens — and the count the rest of the page named is drawn on both screens anyway |
| THE REPRISE | `SAID · SLIDE AND FIRE BLIND` | `RED BECAUSE THEY SAID SO` | `PRESS` / `FIRE` on the tear, hers, for the whole of the echo — and the `SLIDE` was never hers to do, which is the guide's own defect in a caption |

**One other film of the twelve had nothing to take, and that is the useful half
of the result.** THE DIASTOLE spends its pages on a colour, a count or which
screen holds which half — `PLAYER 2 HOLDS RED · ON 15` — and a cue may never say
any of those (#34's *reconsider if*). THE TASTER was a second here and gave up
one page on 19 September 2026, to the column rather than to a verb; `THE OTHER
COLOUR · ALWAYS` is still the shape of the nine that stayed. THE GORGE was a
third here and gave up one page on
19 September 2026, which is the whole of what its reading could take: twelve
of its thirteen pages are the colour, the count, the wrong colour's cost or
which screen holds which half, and `FOUR CYAN · IT GOES CLEAR` is still one of
them. THE THROAT was a fourth here until 19 September 2026: its film was unprunable against a reading that
said one word, and two of its pages became verbs the moment the fight learnt
the other two (its rows above; `ONLY PLAYER 2 SEES THE COUNT` is still one of
the six that stayed). A film that reads as unprunable against this rule is a film
already teaching the split rather than the verb, which is what the checklist's
first question has been asking for all along.

THE ORRERY was read that way on 18 September 2026 and re-read on the 19th,
and the second reading is why it has rows above. The first one looked at a
fight that said `BURN` once and concluded the prose was safe, because every
sentence in it that names the beam names the column or the colour with it.
What that missed is that the *column* was the silence: a bolt and the beam
both leave the cannon's own column, the core hangs over one column for the
whole fight, and `spitting` spends itself trying to drive the pilot off it —
so `1. Keep the cannon in the middle column` was a step the field could say
and did not (boss-cue-read-l.ts). It says it now, and both of the pages
above went with it, and so did the navigator's fourth step, which named the
beam that `BURN` now names. What is left of the two halves is the split
picture, the sentence each seat has to say and what a wrong colour costs. **A prose half is only safe against the reading the fight
currently has**, which is the lesson of this row and of THE THROAT's.
THE LEAD's, THE SCUTTLE's and THE ANTIPHON's films came on 17 and 18 September
2026 with no page that is the cue's verb alone: their holds name the column or
the colour.

THE CANDLE's four later rows are 19 September 2026, and they are the second
case of the lesson above. Its first reading said `FIRE` on the glow and `MOVE`
on the cannon while the flame was turned at the pilot's own column, which is
the fight's one mistake said out loud — and it left the *drift* silent, though
the drift is the pilot's whole job and the guide's first line. Worse than
silent: where the flame is turned at the glow's own column the old word walked
him off the only column a shot lands from. `MOVE` is the glow's column now and
nothing else (boss-cue-read-m.ts), which covers every beat the old word was
right in, and the faced column stays the one sentence the pair must say — the
cone is on his screen alone, and a word that went quiet on her trigger there
would be that cone read out for her. Three of the four pages kept their tick,
their seat and their anchor and took the half a cue may never carry: the colour
rule, the drift, the count. Both prose halves changed with them, because the
pilot's second step — *keep the cannon off that column while it eats* — was
the field's old defect written down.

THE GORGE's one row is 19 September 2026 as well, and it is the *opposite*
failure to THE CANDLE's: nothing on the field was wrong, there was simply no
word for the pilot at all. Its reading said `PIERCE` and `PINCH` over a full
intake and `BURN` or `PRY` over the mouth — every gesture the fight has — and
never once named the column those gestures have to be taken in, though a bolt
and the beam both leave the cannon's own (`fire.ts`) and `gorgeStruck` is a
no-op outside it. So `MOVE` stands on his cannon wherever the column is *not*
his own choice, which is a full intake and the mouth and nowhere else: while an
intake is merely filling the column is his to pick and say, and a word there
would overrule the one decision this boss exists to hand him. The page that
came off is the pierce beat, and what it took is the clock a cue may never
carry — `gorgeVentBeats` is four, and it is the only warning the pair gets.
Both prose halves changed with it: the pilot's *hold the cannon there* is the
field's now, and neither half had caught up with the pinch and the pry the
fight grew the day before.

THE CURTAIN's two later rows are the same morning and the same finding a third
time: two words that named a gesture each and no lane for either. `MOVE` is on
his cannon now — the core's column while it is bare, a soft lobe's while it is
covered (`boss-cue-read.ts`) — and the hem is still not on her screen, which is
BULB QUEEN's arrangement and the sentence this fight is made of. Its film had
kept ten of ten pages through the first pass and gave up two here, one to the
kind line rather than the verb: `CARRY` over `SHOVE` was what
`HOLD IT · CARRY IT FOUR OVER` was repeating, and the count was all the page was
ever for. His third prose step was the field's word outright — *when they say
BARE, put the cannon in the core's column* — and takes the roll-back clock in
its place; hers takes the column she has to name and the lobe each hit drops.

THE TASTER's one row is the same morning and the fourth reading to find the same
thing. Every shot into that fan is read off the column it leaves in, and the
crest has three of them: a standing blade to shear, the soft crest where one
used to be, and a blade still growing where the shot is spent. The middle one
had no word at all, and it is the answer to the fight's third movement — four
shots into the gaps and the fan can never re-edge — so the reading gained `CUT`
and the pilot gained `MOVE` for the column that answers nothing. His page went
with it: the field says his column now, and what it cannot say is the trap, that
the ledger counted the colour of every shot before it got anywhere, the gaps
included.

**And this lane found a briefing that was not stale but wrong.** Both of THE
TASTER's prose halves said *never shoot a column whose blade is gone*, which is
the flat opposite of the rule — those shots are the only thing that stops the
re-edge (`sim/taster-step.ts`, `reEdge`). A page the field has taken over is
read again by whoever takes it over, which is how this was found at all, and it
is the strongest argument for doing these lanes that has come out of them.

THE UNDERTOW's three later rows are 18 September 2026, when its reading grew
from four moments to all five of the fight's phases (`boss-cue-read-j.ts`) and
learnt the column the maw and the beam both fire up. Its film kept all twelve
of its pages: not one of the three could come out, because each is the only
page of its seat standing over an act of its seat, and a deleted one would have
left the ghost hand to be drawn on the other screen. What the three say instead
is the fight's own split said three ways — the column the maw reaches, the plate
he is not drawn (`showsShield`), and the second lobe one carriage cannot be at.
The row above them, 17 September 2026, is the same page on her side.

THE THROAT's two rows are 19 September 2026, when its reading grew from the
fling alone to the three moments the fight has (`boss-cue-read-k.ts`) and
learnt the row that makes a fling worth anything. Both pages kept their tick,
their seat and their anchor for THE UNDERTOW's reason — each is the only page
of its seat over an act of its seat — and both say a rule the cue is forbidden
from carrying: that the mouth is not a ward, so an ordinary kill still works in
it, and that the swipe is a *direction* and the row it leaves on is the line it
flies along. The fight's own two numbers, the mouth's column and the beats to
the inhale, stay on the four pages that were already about them.

THE STARE's cue came on 18 September 2026 and is the one the four kinds did
not cover: `STILL`, the non-gesture the fight charges for (`decisions.md`
#34, *a fifth kind*). Three of its twelve pages were the verb alone. Two came
out whole — each next to a page of its own seat, so the hand still draws — and
the one in the second tell, between two of the pilot's, was rewritten to the
fact the cue is forbidden from saying: that the warning is on the other
screen alone. The guide halves lost *hands off* the same day, for *a touch
breaks the hull* and *your screen is not told*.

THE MIRROR's two rows are 18 September 2026, the first round to carry a cue
(`render/src/boss-cue-read-e.ts`). Its film went from three pages to two: the
middle page was the dead band said twice, and the last page's verb is the cue's
— one word for the whole of the pair's turn, read off the phase and never off
the step the mirror is waiting for, because *which move comes next* is the
memory game. Its first page changed too, from the picture (`IT PERFORMS YOUR
MOVES`) to the split (`CALL EACH MOVE AS IT COMES`), which is the sentence
neither the mirror nor a cue can say.

THE MAZE's two rows are the same day and the same shape, and its film went from
three pages to two as well. Both of the pages that named a verb are gone into
the cue, which says each seat's own on the thing it acts with. What is left is
the rule that outlives the first drum — `ONE WAY THROUGH THE MAZE`, moved onto
his screen so that each of them still has a page — and, in place of her verb,
the one fact no picture on either screen announces: the heart in the middle
takes its own colour and only its own, so a shot of the other one arriving is a
wrong answer that looks like a right one.

THE GAUGE's two rows are the same day and go the other way about it. Its film
came down from four pages to three, and the page that went was the *pilot's*
verb rather than a page the cue replaced: `PLAYER 1 CANNOT SEE THEM` moved off
the hull and onto the valve, which is where his thumb goes, so one page now says
both the split and the slab. He gets no cue at all — the field cannot name a
direction without saying the thing she is there to say — so his page is the only
thing that tells him anything, and it tells him the half that matters. Hers lost
its verb to the cue and gained what a call costs: `EACH GOOD CALL MOVES THEM`.

THE WARDEN's two rows are the same day and are the first for a boss whose
handle is **on the field**, which is what makes them different from the eleven
above. A handle already draws a word of its own while nobody is holding it —
`PULL` on the seat whose it is, `P1'S` on the other (`handle-draw.ts`) — so
his page was the third copy of one word, and it came out whole rather than
being rewritten: the cue speaks only *after* the grab, `CARRY` / `PULL` while
the line is short and `HOLD` once it is taut, which is the half no picture was
saying. Hers said `ONLY WHILE IT IS OPEN`, and the cue says that by appearing
and going out; what the page carries instead is the one thing a cue may never
say, that the bolt has to be the rim's own colour. Its first page changed seat
rather than words — `A RING WITH A HOLE IN IT` moved onto his screen, because
after the cut he had no page at all.

THE FLEET's one row is the same day and is the first where a page **could not
come out**, which is the rule of this section arriving as a real constraint
rather than a caveat. His salvo is the last act of the film; a page is what
puts his screen in front of the reader and what draws the ghost hand, so
deleting the page that names his verb would have deleted the gesture instead of
handing it to the fight. It was rewritten to the one rule of his half no
picture states — the trigger comes back when the shell lands — and the film
stayed at four pages. The navigator's two pages were never candidates: the
field says nothing to her at all in this round, on purpose.

THE VANE's one row is the same day and the same shape as THE FLEET's: the page
could not come out, because her trigger is the last act of the film. What it
said was her verb *and* her colour, and the mouth of the split wears both —
the cue writes `FIRE` on it and it has been that colour since the arm stopped.
So the page carries the half of the shot nothing draws: the bearing hangs above
the field, the bolt has to leave through the split to reach it, and a shot
stops at the first body in its way. Its other two pages are about the fold,
which is the one thing the field will never say a word about.

SNAKE's one row is the same day and is the third page in a row that stayed
because a film's last act belongs to the seat whose page it is. What it said
was the second shot; what it says now is why a shot needs the steering at all,
which is the rule underneath both of his words and the one thing neither screen
draws. Its other three pages are what each seat holds and her turn — no cue
takes any of them, because the field says nothing to the driver.

PINBALL's one row is the same day and is the first where the **round itself
already talks**: its header writes a whole sentence, addressed, on both
screens, every tick — *you fire on the bar*, *they stop the needle*, *get the
cannon under it*. So the page that came down is not one the cue repeats but one
it makes redundant from the other end: `PLAYER 1 SLIDES THE CANNON` was the
seat named on a screen whose own band already names it, over a gesture the next
page teaches and the field now writes `MOVE` on. What stands there instead is
the round's own design, which neither screen states — the thing you fire from
is the thing you have to catch it with. The navigator's page stays and is the
only thing that tells her anything: the sentence says her verb for every tick
of her phase, so a cue could only add *when*, and *when* is the answer.

THE SCOUT's one row is the same day and is the first where the **navigator**
is the seat the field speaks to. The rule is the same one as everywhere else —
a mark stands only on something this seat is shown — and here it points the
other way: the pilot has three controls and cannot see one mote or one hazard,
so every word the field could write over his crank is a direction, and the
direction is hers to say. Her page could not come out, because the tap it sits
over is the first arena's last act, so it carries the rule underneath her
thumb that neither screen draws: flying over a mote is not having it. His two
pages are the nose and the burn, and no cue takes either.

THE PULSE has **no row, and that is the entry**. It was read on the same day as
the rest and came back with nothing the field may say: its four verbs are four
lanes, both seats hold all four, and the round's only question is which lane and
now — the lane being the word a veiled seat has to be given out loud and the
moment being what the judgement is made of. So none of its four pages could come
down, and they are the split and the timing rather than a verb: *press it as it
lands*, *the same four are yours*, *grey · they must name it*, *say it early, say
it once*. It is the fifth film to read as unprunable against this rule and the
first where the reason is the round rather than the prose
([bosses](bosses.md) §11.8).

THE DIASTOLE's cue was **widened** on 18 September 2026 and still takes no page
([bosses](bosses.md) §11.17). It had said `BURN` on the bridge for the whole of
the endgame; it now follows the pilot's thumb — `CLAMP` to him with no clamp on,
`BURN` to her under an open window, nothing to either once the window has
lapsed. Every page of its film is a count or a colour, so there was nothing for
a wider verb to take, and that is the second way this rule can come back empty:
the first is a film already teaching the split, and this is a fight whose whole
content is the number neither cue may say.

THE CAIRN's two rows are 19 September 2026, and it is the first boss in this
section that said **nothing at all** — its reading fell through `cuesOf`'s
default, on the one fight where both bands are dead: no bolt reaches the pile
and the shield has nothing to turn on a thing that is not falling, so the only
answer to it is a grip carried sideways across the stack, and that gesture is
the boss's whole name. `CARRY` / `PULL` stands on it now, either seat's, for as
long as there is a pile (`boss-cue-read-q.ts`). **What the field must not say is
the clock**, and that is why this boss gets one word and not two: the pile lets a
rock go by itself after eight beats, and the column, its lane and the ring on the
stone that is going are the pilot's picture alone (`showsCairnSettle`) — so a
word that arrived or hurried as the patience ran out would be his gauge read out
on her glass by its own arrival, which is THE LEAD's finding one boss on. The
word is identical on beat one and beat seven, on both screens.

**And this lane found a briefing that was not stale but backwards**, which is THE
TASTER's case a second time. The navigator's second step read *move the plate
under the rock your partner calls first, then under the one you pulled* — and the
order is the other way round by twelve beats against twenty. Every departure
resets the shed clock and redraws the column (`letGo` in `sim/cairn.ts`), so the
called rock is eight beats from even starting while the rock already in the air
is twelve from the hull: a dome sent to the announced lane first stands in an
empty column for eight beats and the rock they pulled themselves lands. Her half
says the pulled one first now and carries both numbers. His had spent a step on
*take hold of the pile and drag sideways*, which the field says, and it carries
the patience and the redraw instead — the column is drawn again every time a rock
leaves, either way, which neither half had ever said. The film's first two pages
went with it (its rows above); the dome page kept its verb, because the ward is
one of the reading's own silences — what comes away is an ordinary rock, and no
boss's reading cues one.

THE WELL has **no row either, and it is the second entry of that kind** — THE
PULSE's above is the first. Read 19 September 2026 and left silent on purpose
(`boss-cue-read-r.ts`, [bosses](bosses.md) §11.12): this boss has no state, no
step, no clock, no phase and no gesture, so there is no moment for a word to
stand on, and on the clock a mark's own angle *is* its hour — `well-face.ts`
prints that lane's numeral on the ring just outside the rim — so every word it
could say would carry a column, which is what #34 forbids first. The difference
from THE PULSE is where the reason sits: there it is the round's design, here it
is the boss, and THE WELL is the only one in the game that could not have had a
word whatever it was built out of. So none of its four film pages came down, and
they are the split and the seam rather than a verb: *player 2 sees the flat
field*, *player 1 sees four o'clock*, *player 2 fires the same lane*, *one to
eleven · the long way*. It is the sixth film to read as unprunable against this
rule.

**THE WELL's guide was rewritten 19 September 2026 anyway, and that is the
result worth having.** The rule cuts both ways: a fight that says nothing has to
be carried entirely by the briefing, and this one's was three steps of what the
pair could already see. The pilot's half had told him to *slide it to the hour
your partner says* — which the shared line says — and to *say the hour you are
on*, a number the navigator is drawn outright: the cannon's own swelling is on
the hull on both screens (`drawHull` takes `LobePositions`, no role gate) and her
two colours fire up his column by definition. Meanwhile **neither half had said
the one thing that is actually asymmetric**: the pilot's clock carries no warning
marks at all. Every body a well wave sends is a `slick` or a `bulb`, both
`radar: "p2"`, and `radarBlips` gates on `showsRadar` while the well is drawn on
`showsCannon` — so the ring `well-arrivals.ts` bends round his rim is empty for
the whole wave, and the navigator's strip carries all of it
(`render/test/boss-cue-well.test.ts` counts sixty-four against nought). His half
opens on that now, and on the crowd at the rim: four beats of a fall over the rim
move a body a third of a tile, and the last beat before the hull moves it that
far by itself (`BEND` in `render/well.ts`). Hers opens on holding the only strip
and on *how soon* being hers alone, and her last step says her plate is **dead**
this wave — nothing it sends is wardable, and `hull.ts` says in as many words
that the shield has nothing to say to a slick. It had read *move the plate and
fire as usual*.

THE REPRISE's guide was rewritten 19 September 2026, when the field learnt to
say two words over a screen with nothing on it. It had said nothing at all — its
own drawing calls no `drawCueText` and the reading fell through `cuesOf`'s
default — and this is the one fight where that costs the most, because a field
with no body drawn on it asks for nothing by its own picture and the instinct it
meets is to wait. `CARRY` / `MOVE` on the pilot's cannon and `PRESS` / `FIRE` on
the tear, hers, both standing for exactly as long as `repriseEchoing` and not one
beat longer (`boss-cue-read-s.ts`). The gate is the whole licence: the tear is
drawn on **both** seats with no `showsX` near it and is shut to a seam while a
stretch runs seen, so the word's arrival and its absence each say a thing both
screens are already shown. What it must not say is the column — the mark for the
press stands on the tear, which hangs on `midCol` and does not move sideways for
anything — nor the colour, nor the count the teeth already draw, nor the beat the
swallow already twitches on.

**And the defect here is the whole answering half of the briefing.** Both seats
were sent to the plate: *trigger the plate on your count* and *move the plate and
fire on those columns*. Nothing in this wave can be warded. Every one of its
seven entries carries a colour, so every body is a `slick` or a `bulb`
(`livingKindForColor`), and `isWardable` is the meteor kinds and `volley` —
`sim/hull.ts` puts it in as many words, *the shield has nothing to say to a
slick*. Two of the guide's six steps were spent on a control that cannot touch
this fight, and a pair holding the dome under a remembered column watches the
body fall through it onto the hull, which fails the whole wave
(`sim/wave-fail.ts`; `scene-reprise.test.ts` watches it happen at beat 33). The
cannon, meanwhile — the only strip in the game that picks a column, and player
1's — was not in his half at all, and *fire on those columns* put the choosing of
one on the seat that holds neither the strip nor a picture of it (`showsCannon`).
The halves now follow the panel: she keeps the columns and says them, he keeps
the colours and says them, and each holds the half the other has to be told. The
film had known all along — its ten acts are `cannon`, `fireRed` and `fireCyan`
and it never touches `guard` or `shield` — except on one page, which told the
navigator to slide.

**A second number went with it.** The pilot's half had read *say the gaps out
loud: two beats, then three*. The wave's first stretch is authored at beats 0, 3
and 6, so its gaps are three and three; the second stretch's are two, four and
three. Neither of the guide's numbers is a gap this wave has, and the film had
the right one on its own page (`THREE BEATS ON · THE MIDDLE`). The line is gone
rather than corrected: the tear twitches on every echoed arrival, on both
screens, so the gaps between arrivals are a thing the picture now draws and the
half worth keeping for him is the colour.

THE HIVE's guide was rewritten 19 September 2026, when the field learnt to say
`CARRY` and `PRESS` for the reach and the shot (`render/boss-cue-read-v.ts`).
Its pilot's second step had read *slide the cannon under the breach your
partner names* — a column he was already shown, in the colour only he reads,
so naming it was never hers to do. `CARRY` / `MOVE` stands on his own strip
whenever an open breach waits unsealed and he has not reached it yet;
`PRESS` / `FIRE` replaces it on the breach itself, hers, the beat his cannon
does. Neither word says the colour, nor which of two twinned breaches to take
first — that pair of sentences is the fight, and stays his and hers to say.
The step that named the breach for him is gone; the three that are still
theirs — the colour as it opens, the swell three beats ahead, and getting
there before it does — are unchanged, because none of them is a place the
field may mark.

#### The ghost thumb is derived, never authored

A scene names a control and, for a strip, a column. Where that control *is*
comes from `bandLobes` for a lobe and from the strip and `tileCX` for a strip —
the same two answers the band is drawn from and a finger is hit-tested against.
The same act is what becomes the press the world actually feels. So the hand
cannot disagree with the panel it is pressing, and it cannot disagree with the
world either. A list of coordinates beside the list of presses would have been
a second copy of where the buttons are, which is what `Layout.lobeY` exists to
prevent one level down.

`packages/content/test/scenes.test.ts` holds the half of that which can be
tested without eyes: a scene only ever presses a control the wave's own panel
carries, a strip act carries a column and a lobe act does not, every act is
inside its own loop, and the tempo divides the tick rate.

#### What a frame of it costs

While a rehearsal is up, `canvas2d.ts` **stops drawing the real field behind
it**: the film is the whole stage, so a field nobody can see is pure waste.
One screen is drawn per frame, and two only for the twenty-six ticks of a
switch. Measured on a 390×844 stage, 400 painted frames each: a guide frame
with no scene is 0.5 ms, a guide frame with the rehearsal is 1.6 ms, and the
playing field, for scale, is 2.5 ms — so a tutorial frame is cheaper than a
frame of the game it is teaching. Playing frames are untouched: the stage is
inactive and costs one `guideHolds` check.

#### Deliberately not built

The specimen stops here. Each of these is a decision the owner has already made
about what comes next, rather than something forgotten:

- **Step pips.** The film has steps and a caption each, but nothing on screen
  says how many there are or which one this is.
- **A countdown on the wave text.** The introduction still passes on a plain
  timer with nothing drawn to say how long is left.
- **Wave 2's bulb scene**, and every scene after it. One rehearsal is what is
  being judged, and every other guide is still words.
- ~~**A running preview in the director**~~ — **built.** The stage plays an
  opening at tempo through the shipping renderer (`stage-opening.ts`), and
  since 16 September 2026 it plays the guide standing in the three fields
  rather than the one the act file was last saved with (`ViewState.guide`), so
  a rehearsal is watched as it is typed. The `✎ GUIDES` sheet that drew every
  rehearsal as a still is gone; the owner took it off DOCUMENTATION on 14
  September 2026, and there is nothing left for it to have done.
- **The TUTORIALS menu page**, gated on `progress.furthest`, where a pair could
  watch a rehearsal again without playing the wave.
- **`prefers-reduced-motion`**: a held pose instead of a loop, for a player who
  has asked for less movement.

**Where it goes:** a key on `WaveGuide`, beside the three strings, on the waves
that want one. Not every wave, not a second table, and not a replacement for
the words — a guide with a scene still says its three lines, because the split
is what makes the pair talk and a picture is not split.

### 3.3 Playback · built, without the player

There is no player and no presentation state: which state a wave is in is
`world.brief.phase` (`OPENING_INTRO`, `OPENING_GUIDE`, `OPENING_PLAY`), whether
the wave carries a guide at all is `world.brief.guide`, who has acked the
introduction is `world.brief.ack`, and how far each circle of the ready gate
has filled is `world.brief.fillP1` / `fillP2`, in ticks, in the hash.
`drawWaveOpening` is a pure function of
the world and the role, so it survives a restart by having nothing to survive —
`Effects.reset()` has nothing of its own to clear, and §3.8 says that must stay
true.

The hit area answers only the **guide**. A press during the introduction is
dropped, because the introduction is not a thing to dismiss and a player who has
just picked the phone up is exactly the person who would tap through the wave's
name.

**On a guide made of prose the whole stage is the button, and the circles are
indicators.** A thumb anywhere on the screen fills this seat's own — shrinking
the target to the drawn ring would be a regression dressed as precision. On a
**paged** guide it cannot be: BACK and NEXT are on the same screen, and a press
anywhere that meant NEXT would put BACK out of reach on half of it. So there the
targets are the drawn ones, and they come from `navButtons` and
`readyButtonBox` — the same geometry the drawing uses, so a button is never
answered where it is not drawn.

Both circles are drawn on both screens either way, which is what makes it a
two-player gesture rather than two solo ones: you can see your partner is still
reading.

Keyboard: space, as both seats at once, for a desk — one person at a desk is
both seats, so it fills both circles, which is the same answer the director's
`TEST` role gives.

There is no SKIP. A guide one player skips past is a sentence the pair never
finished reading, so both seats have to hold their own circle and neither can
do it for the other.

### 3.4 Where it hooks into the game · built

`startWave` opens the wave last, after the boss is installed, and is told
whether the wave carries a guide and how many pages that guide has — a boolean
and a count, not the words and not the scene: the simulation
decides how many states hold the field and never reads one of them. `step` then
refuses everything but the ack — the same rule THE MIRROR plays by while it is
presenting — and the wave stands frozen on its first beat behind the opening.
It is also what keeps the ready gate from being a repair bay: `step` returns
before it reaches the hull's regeneration, so nothing mends behind an opening.

**The clock is not what stands still.** A press is scheduled `inputDelayTicks`
into the future on both devices at once, so a world that froze its tick counter
would be waiting for an ack it had arranged never to reach itself. The tick
counts; the wave does not.

The gate is `cfg.briefings`, off in `DEFAULT_CONFIG` and on in `apps/game`, and
it gates the **whole opening**, introduction included. That is why it kept the
name: it is the switch on a feature that wants two people, not on one card. A
determinism run, a shape sheet, `relay:check` and every sim test play with it
off, and none of them has anything that would send the two acks a held wave
waits for. `cfg.readyHoldMs` beside it is how long a circle takes to fill, and it is
**150 ms**. It was 1200, which is long enough to feel like a penalty on the
second run of a wave and long enough that a thumb put down and taken off again
reads as a control that did not work; then 420, which the owner still found
slow to say READY under a thumb (13 September 2026). The gate's job is to
prove the pair looked at the screen, and that much contact does that; the
reading time is bought by the guide standing in front of them, not by the
length of the hold. `packages/sim/src/ready-gate.ts` is where the gate's rules
now live.

### 3.5 Two devices · built

`docs/spec/structure.md` calls for a "both ready" signal, and this is it: a
`brief` command from each seat, no protocol change, and the same command for
both states. Leaning on delayed lockstep instead — a device holding a guide
simply sends nothing — was the first plan and is not enough, because it says
nothing about *whether it was read*; it only says a device is quiet.

Both devices push both acks and let the lockstep scheduler drop the half this
device is not sitting in, which is the contract the keyboard already plays by.
Solo, both land, and one tap is the whole of it.

The guide shows two pips, one per seat, lit as each ack lands. Without them a
player who has tapped is looking at a guide that did nothing and has no way to
tell whether it is their screen that is stuck or their partner.

Nothing of one opening carries into the next. Both fills and both ack bits are
cleared when a state passes, or a fast device would put away a screen its
player never looked at.

Still open: the link chip reads `STALLED` while one player is reading. Worth
suppressing while the wave is held.

### 3.6 Seen once · retired, and it was wrong twice

There is no memory. A wave shows its opening on **every** start.

It began as `localStorage`, which could not work: the wave is held, so two
devices that disagree about whether it is up disagree about whether the world
ticked at all. It became a bitmask in `World`, one bit per subject index, in
`hashWorld` and watched by the desync ledger. That was correct and it is now
gone with the subjects it was over.

Three reasons, and none of them is that the bitmask was broken:

- A wave carries its own help, so "have they met this" is not a question with
  an answer any more. The question would be "have they played wave 19", which
  is a different fact and nobody has asked for it.
- The director restarts a wave twenty times an afternoon and wants to see the
  opening every time. Under the met set it saw it once per rebuilt world, which
  worked only because the director rebuilds the world.
- A run restarted after the hull went costs one press. That is the whole price.

If it turns out to grate, the answer is a memory over *wave indices* — and that
is its own decision, with a save file behind it (spec 7.1), rather than a field
added quietly back here.

### 3.7 The director · built, except the animation

- **No GUIDE section.** The WAVE tab carried one directly under NAME — three
  fields, then the film's pages as buttons — until the owner took it off on 25
  September 2026: *it is enough to navigate in the game itself and see it.* A
  guide is written in `packages/content` and read on the stage with BRIEFINGS
  on. `serialize.ts` still writes a wave's guide back out as it was loaded.
- **A mark in the wave rail**, the way `♛` marks a boss wave: `✎` on every wave
  that carries a guide. It is a lookup now rather than a derivation, which is
  the whole of what moving the help into the wave bought.
- **No sheet of its own.** `✎ GUIDES` was a full-screen sheet of every wave
  that carries one, and `◇ NOT BUILT YET → GUIDES` held both halves of each
  side by side; the owner took both off on 14 September 2026, when the words
  moved into the WAVE tab. The stage is where a guide is watched.
- `refuse()` rejects a wave with no name and no sentence, and does **not**
  reject a wave with no guide. A wave that introduces nothing is supposed to
  have none; the test in `content` is what holds the other direction, because
  it is the only place that can see the whole list in order.

### 3.8 Tests · built

- `packages/content/test/waves.test.ts`: the first wave to carry anything new
  has a guide, a wave that carries nothing new has none, and every guide it
  does carry writes all three halves. This is the guarantee that replaced the
  derivation, and it is the reason placing the help is safe.
- `packages/sim/test/briefing.test.ts`: the three states in order, the field
  holds behind the first two, both seats are needed for each, an ack does not
  carry from one state to the next, and two worlds in different states disagree
  about their fingerprints.
- `packages/render/test/briefing.test.ts`: both states of every wave, every
  role, through the strict canvas stub, including a screen too narrow for a
  word — plus the prose itself, which may not tell both players the same thing.
- `render/test/restart.test.ts` is unaffected, and must stay that way: the
  opening is drawn from the world and holds no state of its own.
- `tools/director/test/serialize.test.ts`: the round trip now has a guide in
  it, so a wave saved from the director has to come back byte for byte.

---

## 4 · Order of work

1. ~~The machinery, with one block only~~ — **done, as an introduction and a
   guide rather than a demonstration.** Every wave that introduces something
   carries words; what is not built is the picture.
2. **Look at it.** Still the step the plan is shaped around: how the
   introduction reads at tempo, and whether the guide behind it still lands as
   two halves that have to be spoken across, is what decides what the animated
   version looks like. Nothing in §3.2 should be started until a pair has read
   one on two phones.
3. ~~**The animation**~~ — **one of it, built.** FIRST STEP's guide plays a
   rehearsal; the key on `WaveGuide` is there, the `Field` split turned out to
   be unnecessary, and §3.2 lists the five pieces deliberately left for after
   the owner has looked at the specimen.
4. **The gaps**, if looking at it says they matter: the grip, which no wave
   contains, and the four waves whose guides carry two subjects' words at once.

Deliberately not in scope: figures (`wave-design.md` 8.1), an unlockable
bestiary screen, and anything that reads a microphone — rule 4 stands.

---

## The two seats do not look alike

Player one's ship is violet and player two's is amber
(`packages/render/src/seat-skin.ts`). It reaches the hull **and everything the
control panel is made of**: the chamber under the ship, its cells and veins, the
light spilling off the membrane into it, the slime hanging from that membrane,
the feeders running down to each control, the socket a button stands in, the
body of a button that is not lit, and the trough a strip slides along. The owner
asked for exactly that reach — *the control set must be also fully in this
golden design colour set* — and it is the honest one, because the panel is the
ship seen from inside and all of that is the ship's own flesh.

It deliberately does not reach the ammunition, a strip's own signal colour or
what is drawn on a control's face: red is red and cyan is cyan on both screens,
the cannon's rail is the cannon's colour and the shield's is the shield's, and a
pair with two vocabularies for one game is the thing `docs/spec/controls.md`
exists to prevent.

The owner asked for it while looking at the tutorial — *give player 2 another
colour of the ship as well, then we can easily distinguish* — and it is why the
guide's announcement of whose screen is showing can be a word that arrives and
leaves rather than a band across the top: once the colour has been named, the
colour carries it.

Amber is `ship:hull-skin` / `warm`, which sat in `tools/versus/candidates/` as a
question about replacing violet. It was answered by being given a seat instead,
and the candidate is gone.

**Nothing is drawn along the join between the ship and the panel.** The membrane
had a lit rim traced along it, and the chamber below opened on a colour of its
own; together they were a bright line with a step in value under it, which is
three separate ways of saying *the ship stops here and a box begins*. The owner
asked for none of them — *remove the line, and then the ship should feel like
part of the control panel* — so the contour survives only as the shape the
tissue is cut to, and the chamber's first colour **is** the hull's last one
(`SeatSkin.ground[0]` is `SeatSkin.hull.body[3]`). What says where the ship ends
is light falling through the membrane into the top of the panel, and nothing
else (`packages/render/src/band-seam.ts`).
