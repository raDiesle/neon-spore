# Briefings

> **Status: the guide, the introduction and the first rehearsal are built, in
> that order.** A wave with a guide opens on it: for FIRST STEP that is a
> **rehearsal** — the game's own screen at full size, playing the wave the pair
> is about to meet, one device at a time, with the words inside the picture
> beside the things they explain. It ends on the ready gate. *Then* the wave's
> number, name and sentence, plain text on the field, which passes on a timer.
> Then the wave. A wave with no guide opens straight on its introduction.
> One rehearsal exists; §3.2 says what is deliberately still missing.
>
> **Three decisions below have been overturned on the way in**, and the
> paragraphs that made them are rewritten rather than left standing beside code
> that contradicts them: help is **placed, not derived** (and this file said the
> opposite for a while — see the next section, which is about why it changed its
> mind twice); the "already seen" set is **gone**, having been world state and
> before that `localStorage`; and a wave now opens on something *before* any
> help at all.

A wave's **opening** is what stands between the pair pressing play and the
first creature falling. It has two states and the second is optional:

1. **The guide**, if the wave carries one — and it is *first*. A concrete
   instruction about the control or the concept the pair is about to meet:
   what the thing is, what he does about it, what she does about it. On a wave
   that names a scene it is a rehearsal at full size instead of a panel of
   prose (§3.2). Either way it ends on **the ready gate**: two circles, one per
   seat, each filling while that seat holds and saying READY when it is full.
   The guide passes when both say READY. Only a wave that introduces something
   new carries one — sixteen of twenty-six today, and a wave with no guide has
   no circles either.
2. **The introduction.** `WAVE 4`, the wave's name, its one sentence. Plain
   text on the field — no panel, no border, nothing to press. It stands for a
   few seconds and passes on its own. Every wave has one, because every wave
   has a name and a sentence.

**Teaching first and naming second is the owner's order, and it was the other
way round to begin with.** What decided it is what each state is *for*: the
introduction names the wave the pair is about to play, so it wants to be the
last thing before the field rather than a title card standing in front of a
tutorial. It also means the tutorial is what a pair sees the instant a wave
starts, which is what the owner asked for in those words.

Then the wave. [systems](systems.md) 5.9 has the gate's own rules — no
timeout, no free repair bay, and what letting go does.

## The rule it is built on, which is the opposite of the rule it used to be

Help is **placed, not derived**. A guide is written inside the wave that plays
it, in `packages/content/src/waves/act-*.ts`, directly under `sentence`.

This file has now argued both sides, so both arguments belong here.

**The first draft placed it**, on the reasoning that a wave dragged around in
the director should take its teaching with it — otherwise the rock is taught on
wave 9, three waves after the rock arrived.

**The build derived it**, on the reasoning that a hand-kept list beside a wave
is itself the thing that goes stale, and that reading the subject off the
wave's own entries cannot be forgotten. That was true, and it produced a closed
list of subjects in `packages/sim/src/briefing.ts` and a catalogue in
`packages/content/src/briefings.ts` that was a `Record` over it.

**It is placed again now, and the reason is not that the derivation broke.** It
is that a derived card can only ever be about a *creature*, in the abstract,
because a subject is a kind and not a wave. The owner asked for the help to be
part of the wave's own configuration, under its sentence, and the thing that
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
| 2 | **The two colours** | red answers red, cyan answers cyan; a wrong colour is *spent*, not missed | p1 the column, p2 the colour | 2 · TWO COLOURS |
| 3 | **The rock** | cannot be shot; shield in the column **and** triggered at contact | p2 slides, p1 triggers | 4 · THE ROCK |
| 4 | **The torch** | two columns wide, the fastest thing in the field, and only on p1's strip | p1 sees it coming, p2 must cover both columns | 7 · TORCH |
| 5 | **The pod** | shooting it loose is half of getting it; then it sinks and drifts | p2 frees it, p1 chases and opens the maw | 13 · SALVAGE |
| 6 | **The queen** | two marks, one real; she opens for two beats; a torch drops every eight | p1 sees *what*, p2 sees *where* | 15 · BULB QUEEN |
| 7 | **The bosses** | the mirror, the maze, the gauge, the warden and its line, the vane | one guide each, on their own wave | 16–19, 23 |
| 8 | **The rest of the bestiary** | the runt, the throb, the shell, the pods, the rock speed tiers | one guide each | 20–26 |

**The grip and the lance are still the odd ones out**, and neither has a guide.
They are controls no wave *contains*, so no wave is the first to carry them and
nothing places them. That was true when help was derived and it is still true
now: placing a guide did not solve it, it only moved where the hole is.

### The gap the merge left

Where two or more subjects first landed on the *same* wave, their words were
merged into that wave's single guide rather than dropped: `THE WARDEN` carries
the ring and its line, `THE VANE` carries the arm and the quicker rock, `THE
WARD` carries the pod and all three rock speed tiers, and `FIRST STEP` carries
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

### A guide with a rehearsal is a stack of pages

A guide that carries a scene is not a film any more. It is **pages**, one per
step of the rehearsal, and each seat has its own cursor into them
(`world.brief.stepP1` / `stepP2`, both in the hash). A page repeats its own
animation and its own words, with a short pause on the end of each turn, until
the seat reading it presses NEXT; BACK goes back a page; the bar under the film
says which page this is and how many there are.

That is the owner's own arrangement, and the reasons are his: the film ran once
at a tempo nobody could keep up with, and *every player has their own time to go
through the tutorial, and just at the end both need to say they are ready.*

**The last page is the gate, and it is the introduction.** Its picture is the
game's own screen with the wave's number, its name and its sentence over it, and
the READY button under them — so a guided wave has no separate introduction
behind it, and crossing the gate starts the field. The line that says who has not
answered yet is the loudest thing on that page after the wave's name, because
two people reading at their own speeds means one of them is nearly always
waiting.

A guide made of prose — the other sixteen — is unchanged: one panel, the whole
screen is the button, and the wave's introduction still stands behind it.
`world.brief.steps` is what tells the two apart, and it is a count handed to
`startWave` from `content`, never a scene: the simulation still never reads one.

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

The beat, the hull bar and the score are still explained nowhere. The voice
channel is deliberately not explained here either — that belongs to the menu,
before a room is even joined.

---

## 3 · What is required

### 3.1 Data — `packages/content` · built

- `wave-types.ts`: a `WaveGuide` is `{ both, p1, p2 }`, and `Wave.guide` is an
  optional one, written directly under `sentence`.
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

### 3.2 The rehearsals — one specimen built

A guide that names a `scene` does not draw a panel of prose at all. It plays a
**rehearsal**: the game's own screen at full size, one device at a time, with
a red slick falling, a hand walking the cannon into its column, a slide across
to the other player's screen, RED pressed, the shot taking it — and then a
second slick nobody answers, so the last thing the pair is shown is the hull
bar dropping. About five seconds, looping. FIRST STEP has the only one; every
other guide is still the three strings and the two circles.

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
would be taught wrongly if it were. Two things about the *world* are the
scene's own and named as fields rather than hidden in a drawing: the tempo
(`bpm`, quicker, because a film with five things to get through at the game's
own beat is a film nobody watches twice) and `hullRegenPerSecond: 0`, because
the last step shows what a miss costs and at three percent a second the bar had
crept back to full inside the same loop.

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
around. The hull bar's position comes from `hullBarBox` in `hud.ts` for the
same reason.

Text is as short as it will go. `SLICK`, `P1 · SLIDE TO ITS COLUMN`,
`P2 · FIRE RED`, `MISS ONE`, `AND THE HULL TAKES IT`.

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
- **A running preview in the director.** The `✎ GUIDES` sheet draws a
  rehearsal as a still, because it draws through the shipping renderer; there
  is no way to watch a loop at tempo while authoring one.
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
**420 ms**. It was 1200, which is long enough to feel like a penalty on the
second run of a wave and long enough that a thumb put down and taken off again
reads as a control that did not work. The gate's job is to prove the pair
looked at the screen, and a fifth of a second of contact does that; the reading
time is bought by the guide standing in front of them, not by the length of the
hold. `packages/sim/src/ready-gate.ts` is where the gate's rules now live.

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

One seat's hold does not carry from the guide into the introduction. Both fills
and both ack bits are cleared when a state passes, or a fast device would put
away a screen its player never looked at.

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

- **The GUIDE section**, three fields, in the WAVE tab directly under
  SENTENCE — the owner's own placement. `guide-fields.ts` builds it;
  `serialize.ts` writes it back out under `sentence` in the act file.
- **A mark in the wave rail**, the way `♛` marks a boss wave: `✎` on every wave
  that carries a guide. It is a lookup now rather than a derivation, which is
  the whole of what moving the help into the wave bought.
- **A note above the fields** saying what the pair will actually meet — the
  introduction, and then the guide or nothing.
- **`✎ GUIDES`**, a full-screen sheet of every wave that carries one, drawn by
  the game's own renderer at the phone's real width.
- **`◇ NOT BUILT YET → GUIDES`**, which holds both halves of every guide side
  by side and a wave picker that shows the introduction and the guide in order.
  What it no longer holds is a list of help nothing reaches: a guide lives in a
  wave, so a guide with no wave cannot be expressed.
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
4. **The gaps**, if looking at it says they matter: the grip and the lance,
   which no wave contains, and the four waves whose guides carry two subjects'
   words at once.

Deliberately not in scope: figures (`wave-design.md` 8.1), an unlockable
bestiary screen, and anything that reads a microphone — rule 4 stands.
