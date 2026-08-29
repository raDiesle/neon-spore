# Briefings

> **Status: the introduction and the guide are built; the animation is not.** A
> wave opens on its number, its name and its sentence — plain text on the
> field, no panel — and then, if it carries one, on a split **guide** that
> waits for both seats. What §3.2 asks for, the demonstration drawn with the
> game's own geometry, is still a plan.
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

1. **The introduction.** `WAVE 4`, the wave's name, its one sentence. Plain
   text on the field — no panel, no border, nothing to press. It stands for a
   few seconds and passes on its own. Every wave has one, because every wave
   has a name and a sentence.
2. **The guide.** A concrete instruction about the control or the concept the
   pair is about to meet: what the thing is, what he does about it, what she
   does about it. Split across the two screens, and it ends on **the ready
   gate**: two circles, one per seat, each filling while that seat holds and
   saying READY when it is full. The wave starts when both say READY. Only a
   wave that introduces something new carries one — sixteen of twenty-six
   today, and a wave with no guide has no circles either.

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

The second rule is unchanged and is the game's own: **neither player is told
the other's half.** Every guide carries three lines — one both screens read,
and one for each device. A guide that put all of it on both screens would have
taught the pair, in the first ten seconds, that they do not need to talk to
each other, which is the one thing the game cannot survive. So this screen gets
its own half in words and the other player's half as blocks: visibly there,
plainly not yours to read.

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
now: placing a guide did not solve it, it only moved where the hole is. It is
written up in `docs/parked.md`.

### The gap the merge left

Where two or more subjects first landed on the *same* wave, their words were
merged into that wave's single guide rather than dropped: `THE WARDEN` carries
the ring and its line, `THE VANE` carries the arm and the quicker rock, `THE
WARD` carries the pod and all three rock speed tiers, and `FIRST STEP` carries
the split itself and the slick. Nothing was deleted; four moments were.
`docs/parked.md` names it, and the fix if it turns out to matter is a wave
each, not a second guide on one wave.

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
  §3.2 is what would add the first one.
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

### 3.2 The animations — `packages/render` · not built

`packages/render/src/briefing.ts` draws the guide and nothing that moves;
`wave-intro.ts` draws the introduction and nothing that moves either.

The load-bearing requirement: **the demonstration is drawn with the game's own
geometry, not a diagram of it.** A guide that shows a simplified hull teaches a
shape the game does not have, and goes on being wrong until somebody changes
the lobe.

Concretely, that means splitting the tile-and-hull part of `Layout` out as a
`Field` (`tile`, `gridLeft`, `gridTop`, `gridWidth`, `gridHeight`, `hullY`) so a
few-hundred-pixel panel can be one, and `hull-frame.ts` can sample the real
membrane inside it. Everything else — creatures, rocks, pods, bullets, the band
strips — already draws from column and row.

Each scene is a pure function of `(ctx, panel, t, role)`. No state, so the same
scene can be stepped by the game loop, by the director's preview, and by a
test, and look the same in all three.

**Where it goes when it arrives:** a key on `WaveGuide`, beside the three
strings, on the waves that want one. Not every wave, not a second table, and
not a replacement for the words — a guide with a scene still says its three
lines, because the split is what makes the pair talk and a picture is not
split.

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

The hit area is the whole stage, and it answers only the **guide**. A press
during the introduction is dropped, because the introduction is not a thing to
dismiss and a player who has just picked the phone up is exactly the person who
would tap through the wave's name.

**The circles are indicators, never buttons.** A thumb anywhere on the screen
fills this seat's own — shrinking the target to the drawn ring would be a
regression dressed as precision. Both circles are drawn on both screens, which
is what makes it a two-player gesture rather than two solo ones: you can see
your partner is still reading.

Keyboard: space, as both seats at once, for a desk — one person at a desk is
both seats, so it fills both circles, which is the same answer the director's
`TEST` role gives.

There is no SKIP. A guide one player skips past is a sentence the pair never
finished reading, so both seats have to hold their own circle and neither can
do it for the other.

### 3.4 Where it hooks into the game · built

`startWave` opens the wave last, after the boss is installed, and is told
whether the wave carries a guide — a boolean, not the words: the simulation
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
waits for. `cfg.readyHoldMs` beside it is how long a circle takes to fill.

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

One ack does not carry from the introduction into the guide. The bits are
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
3. **The animation** — §3.2's `Field` split, the scenes, and the key on
   `WaveGuide` that carries one.
4. **The gaps**, if looking at it says they matter: the grip and the lance,
   which no wave contains, and the four waves whose guides carry two subjects'
   words at once.

Deliberately not in scope: figures (`wave-design.md` 8.1), an unlockable
bestiary screen, and anything that reads a microphone — rule 4 stands.
