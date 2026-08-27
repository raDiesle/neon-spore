# Briefings

> **Status: the card is built; the animation is not.** A wave opens on a split
> card for anything the pair has not met, and the field waits behind it until
> both of them have put it away. What §3.2 asks for — the demonstration drawn
> with the game's own geometry — is still a plan, and so is the director panel
> in §3.7.
>
> Two decisions below were overturned on the way in, and the paragraphs that
> made them have been rewritten rather than left standing beside the code that
> contradicts them: a briefing is **derived**, not placed, and the "already
> seen" set is **world state**, not `localStorage`. The arguments are in place.

A **briefing** is a demonstration with words, shown before a wave that asks
something new of the pair. It stops the field, says what the thing is and what
each of the two devices has to do about it, and gets out of the way when both
of them say so.

## The rule it is built on

A briefing is **derived, never placed**. The card follows from what the wave
actually contains: the simulation reads the queue it was handed, the pods, and
the boss, and asks which of those subjects the pair has never met.

This was the other way round in the first draft of this file, and the argument
for placing it was that a wave dragged around in the director should take its
teaching with it — otherwise the rock gets taught on wave 9, three waves after
the rock arrived. That is the right worry and the wrong fix. A hand-kept list
beside a wave is *itself* the thing that goes stale; deriving the subject from
the wave's own entries cannot, and a new creature gets its card the first time
it appears without anybody remembering to arrange it. `packages/sim/src/briefing.ts`
holds the closed subject list, and it is closed so that a creature shipping
without a card is a type error rather than a blank card in front of a new pair.

What the derivation cannot reach is a subject no wave *contains* — the grip,
the lance, the split itself. The split is handled by being a subject that comes
due before the pair's first wave and never again. The other two are not built.

The second rule is the game's own: **neither player is told the other's half.**
Every card carries three lines — one both screens read, and one for each
device. A card that put all of it on both screens would have taught the pair,
in the first ten seconds, that they do not need to talk to each other, which is
the one thing the game cannot survive. So this screen gets its own half in
words and the other player's half as blocks: visibly there, plainly not yours
to read.

---

## 1 · What has to be taught

Everything below is *built* today. The right-hand column is no longer an
instruction — a card arrives at the first wave that contains its subject, and
the wave list is `packages/content/src/waves.ts` — but it is still worth
reading as a record of where each block was expected to land, and as the check
that the derivation puts it there.

| # | Block | What is new | Who holds what | Before wave |
|---|---|---|---|---|
| 1 | **The opening** | two devices, one ship; the beat; the cannon | see §2 | 1 · FIRST STEP |
| 2 | **The two colours** | red answers red, cyan answers cyan; a wrong colour is *spent*, not missed | p1 the column, p2 the colour | 2 · TWO COLOURS |
| 3 | **The rock** | cannot be shot; shield in the column **and** triggered at contact | p2 slides, p1 triggers | 4 · THE ROCK |
| 4 | **The grip** | a finger held on anything falling drags at it; two hands compound; the price is the hand itself | either player, on either half — the only gesture that is not split | 6 · THE HAND |
| 5 | **The torch** | two columns wide, the fastest thing in the field, and only on p1's strip | p1 sees it coming, p2 must cover both columns | 7 · TORCH |
| 6 | **The pod** | shooting it loose is half of getting it; then it sinks and drifts | p2 frees it, p1 chases and opens the maw | 13 · SALVAGE |
| 7 | **The queen** | two marks, one real; she opens for two beats; a torch drops every eight | p1 sees *what*, p2 sees *where* | 15 · BULB QUEEN |

Seven blocks, fourteen or so steps. That is the whole built game.

**The grip is the odd one out**, and its block has to say so in one line: it is
the only thing in the game both players can do, on the same part of the screen,
at the same time. Every other block teaches a split. This one teaches that
there is a third pair of hands and it costs whichever control that hand was
on — which is why its two waves are a pair. `THE HAND` is the arithmetic
(three rocks, one shield, one beat), and `IN ITS SHADOW` is the one that only
makes sense once: a rock stops your own shot too, so the way to shoot the thing
behind it is to hold that thing back until the rock is gone.

### Gaps this list exposes

Worth knowing before authoring, not worth blocking on:

- **Pod kinds.** `mend`, `purge` and `ward` land three different receipts
  (`+HULL`, `SWEPT`, `WARDED`) and no wave places anything but `mend`. When a
  wave places one, it needs a block.
- **Rock speed tiers.** `meteorMedium` … `meteorFastest` are brushes in the
  director and appear in no wave. A tier that ships needs one line, not a block.
- **The hull, the score, the balance sheet.** Never explained anywhere. The
  opening should name the hull bar; the sheet is after the run and is its own
  question.

---

## 2 · The opening, in detail

The one that matters most, because it is the only one shown to a pair who have
never played. Three steps.

**Step 1 — "Neither of you sees all of it."**
Picture: two phone outlines side by side, showing genuinely different things —
a mark on the left one's strip, a shield and two colour buttons on the right
one's. A pulse travels from one to the other.
Both: *One ship, two screens — and the two screens do not show the same thing.
What is coming is on one of them; the control that answers it is on the other.*
P1: *Yours is the cannon, the shield's trigger and the maw.*
P2: *Yours is the shield itself, and the two colours.*

**Step 2 — "Everything falls on the beat."**
Picture: the field, creatures stepping down one row per beat, the four HUD dots
lighting in time, the hull bar at the top right.
Both: *One row per beat, on the four dots you both watch. That is what makes a
sentence like "it lands on the fourth" something the other one can act on.*
P1: *Dead rock announces itself on your strip, before it is on the field.*
P2: *Living creatures announce themselves on yours.*

**Step 3 — "The cannon fires straight up."**
Picture: a red slick in a column; a hand drags the cannon strip until the lobe
is under it; a colour button presses; the shot goes up; it pops.
Both: *It slides along the hull and never aims sideways. Standing in the column
is the whole of aiming — and the one who stands there is not the one who
shoots.*
P1: *Drag your strip until the cannon is under it. Say the column.*
P2: *Press a colour. Nothing leaves the hull until you do.*

The voice channel itself is **not** explained here — that belongs to the menu,
before a room is even joined, and is being written separately.

---

## 3 · What is required

### 3.1 Data — `packages/content` · built

- `briefings.ts`: the catalogue. A `BriefingCard` is `{ title, both, p1, p2 }`,
  and `BRIEFINGS` is a `Record` over the closed subject list in
  `packages/sim/src/briefing.ts` — so every subject has a card and no card
  belongs to nothing.
- The eleven creature kinds and the three pod kinds are spelled exactly as
  their kinds are, so a wave's own entries name their subjects and nothing
  keeps a second table of names in step. `opening` is the only id that is not
  also a kind.
- Ids are stable: renaming one is a migration, because the id's *index* is the
  bit the met set remembers.
- There is no `Wave.briefings` field. See "derived, never placed" above.
- Purity applies unchanged — it is content, so no clock, no randomness, no DOM.

A card is not authored as steps, because it does not animate yet. When §3.2
lands, a step is what carries a scene, and the card becomes the first step.

### 3.2 The animations — `packages/render/src/briefing/` · not built

`packages/render/src/briefing.ts` today draws the card and nothing that moves.
The rest of this section stands as written.


The load-bearing requirement: **the demonstration is drawn with the game's own
geometry, not a diagram of it.** A briefing that shows a simplified hull teaches
a shape the game does not have, and goes on being wrong until somebody changes
the lobe.

Concretely, that means splitting the tile-and-hull part of `Layout` out as a
`Field` (`tile`, `gridLeft`, `gridTop`, `gridWidth`, `gridHeight`, `hullY`) so a
few-hundred-pixel panel can be one, and `hull-frame.ts` can sample the real
membrane inside it. Everything else — creatures, rocks, pods, bullets, the band
strips — already draws from column and row.

Each scene is a pure function of `(ctx, panel, t, role)`. No state, so the same
scene can be stepped by the game loop, by the director's preview, and by a
test, and look the same in all three.

Scenes needed: `hail`, `field`, `cannon`, `colour`, `rock`, `torch`, `pod`,
`queen`.

### 3.3 Playback · built, without the player

There is no `BriefingPlayer` and no presentation state at all: which card is
showing is `world.brief.due[0]`, and whether it has been read is
`world.brief.ack`. `drawBriefing` is a pure function of the world and the role,
so it survives a restart by having nothing to survive — `Effects.reset()` has
nothing of its own to clear, and §3.8 says that must stay true.

The hit area is the whole stage. With a card up there is exactly one thing to
do and nowhere else to press, so a target the size of the screen is one nobody
has to look for. Keyboard: space, as both seats at once, for a desk.

There is no SKIP. "Either player can skip it" was written before the card was
split; a card one player skips past is a sentence the pair never finished
reading, so both seats have to dismiss it and neither can do it for the other.

### 3.4 Where it hooks into the game · built

`startWave` opens the cards last, after the boss is installed, so it can read
what the wave actually contains. `step` then refuses everything but the
dismissal — the same rule THE MIRROR plays by while it is presenting — and the
wave stands frozen on its first beat behind the card.

**The clock is not what stands still.** A press is scheduled `inputDelayTicks`
into the future on both devices at once, so a world that froze its tick counter
would be waiting for a dismissal it had arranged never to reach itself. The
tick counts; the wave does not.

The gate is `cfg.briefings`, off in `DEFAULT_CONFIG` and on in `apps/game`. A
determinism run, a shape sheet, `relay:check` and the director all want the
wave rather than the lesson, and the game is the only caller with two people in
front of it.

### 3.5 Two devices · built

`docs/spec/structure.md` calls for a "both ready" signal, and this is it,
spelled out: a `brief` command from each seat, no protocol change. Leaning on
delayed lockstep instead — a device holding a card simply sends nothing — was
the first plan and is not enough, because it says nothing about *whether the
card was read*; it only says a device is quiet.

Both devices push both acks and let the lockstep scheduler drop the half this
device is not sitting in, which is the contract the keyboard already plays by.
Solo, both land, and one tap is the whole of it.

The card shows two pips, one per seat, lit as each dismissal lands. Without
them a player who has tapped is looking at a card that did nothing and has no
way to tell whether it is their screen that is stuck or their partner.

Still open: the link chip reads `STALLED` while one player is reading. Worth
suppressing while a card is up.

### 3.6 Seen once · built, and not where this said

**World state, not `localStorage`.** The set cannot live in the app: the card
stops the wave, so two devices that disagree about whether one is up disagree
about whether the world ticked at all. It is a bitmask in `World`, one bit per
subject index, and it is in `hashWorld` — the desync ledger watches it like
everything else. Spec 7.1's "the previews already seen" is a save-file
question, and a save file will write this integer out rather than a second
list beside it.

The consequence to know: **a restart does not forget.** `resetRun` leaves the
met set alone, because a run restarted after the hull went is the same two
people and re-teaching them the rock is an insult with a tap attached. The one
thing that forgets is two devices agreeing to start together at beat zero,
which is the only moment in the game that is a genuinely fresh pair. A reload
does too, by building a fresh `World`.

### 3.7 The director · not built

The original request here was **a fixed block of category description you can
move to the right place before a specific wave**, and half of it has gone away:
there is nothing to move, because a wave's cards follow from its contents. What
is left is looking at them.

- **A PREVIEW button on the stage.** The director is where these get judged, so
  it has to be able to show one. Without it every review is a round trip
  through the game, and the game shows a card exactly once per fresh pair.
- A mark in the wave rail, the way `♛` marks a boss wave, so a reviewer can see
  which waves *will* open on a card without stepping through them. Derived, not
  stored: the director already builds the queue, and that is all it takes.
- No `serialize.ts` change and nothing for `refuse()` to reject. There is no
  hand-editable field, which is one fewer way for a wave to teach nothing.

### 3.8 Tests · built

- `packages/sim/test/briefing.test.ts`: the field holds, both seats are needed,
  the met set does not teach twice, and two worlds that disagree about a card
  disagree about their fingerprints. Also that the subject list still fits in
  the 31 bits the met set has.
- `packages/render/test/briefing.test.ts`: every card, every role, through the
  strict canvas stub, including a screen too narrow for a word — plus the
  catalogue itself, which may not hold an empty line or tell both players the
  same thing.
- `render/test/restart.test.ts` is unaffected, and must stay that way: the card
  is drawn from the world and holds no state of its own.
- `serialize.test.ts`: nothing to do. There is no wave field to round-trip.

---

## 4 · Order of work

1. ~~The machinery, with one block only~~ — **done, as a card rather than a
   demonstration.** All sixteen subjects are authored, because a `Record` over
   a closed list is authored in full or it does not type-check; what is not
   built is the picture.
2. **Look at it.** This is still the step the plan is shaped around: the card
   is what decides what the animated version looks like, and nothing in §3.2
   should be started until a pair has read one on two phones.
3. **The animation** — §3.2's `Field` split, the eight scenes, and the step
   structure that turns a card into the first of several.
4. **The director panel** (§3.7), which becomes worth building once there is
   something to preview that a `bun test` cannot judge.

Two subjects the derivation cannot reach and nobody has placed: **the grip**
and **the lance**. Both are controls no wave *contains*, so neither has a card
today. They are the case the placed version of this file existed to serve, and
whatever answers them should be a third thing rather than a `briefings:` list
grown back onto `Wave`.

Deliberately not in scope: figures (`wave-design.md` 8.1), an unlockable
bestiary screen, and anything that reads a microphone — rule 4 stands.
