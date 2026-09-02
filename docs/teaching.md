# The first words

> **What this file is, in three parts, and they must not be read as one.**
> (1) What the game does today belongs to `docs/spec/briefings.md`, which owns
> that question — this file cross-references it and does not restate it.
> (2) Everything below the next heading is **THE CALL**, a design scored on 27
> August 2026 and never built. It is written throughout in the present tense it
> was designed in, which is a description of a mechanism, not a claim about
> the shipped game. (3) The owner's own direction for where the guide goes
> next, quoted in their words, is its own section near the end — read that one
> if you are about to touch a guide.

## What shipped

A wave opens on its number, its name and its sentence, then — if it introduces
something new — on a **guide**: three lines, split across the two screens,
that name what the pair is about to meet and what each of them does about it.
No dealt cards, no subject catalogue, no `taught` memory, no ordering rule.
That is the whole of it, and `docs/spec/briefings.md` is where it is specified
in full — the states, the two devices, the tests, the director panel. Nothing
in this section is repeated there beyond this paragraph, and if the two ever
disagree, `briefings.md` is right and this file is stale.

**Why the game went the other way.** THE CALL, below, gates a wave behind a
live two-hand puzzle the field freezes for — the pair has to *do* something
together before play resumes. What shipped instead is text the pair *reads*
together before play starts, with no gate and no freeze. The simpler shape
was buildable in one pass and is exactly what the owner's own direction (see
below) asks to keep improving; THE CALL's gate was designed, scored well
against its alternatives, and was still the road not taken.

---

## THE CALL — a design scored and never built

Everything from here to "What this plan could not decide" is the design as it
was written on 27 August 2026, kept because the reasoning inside it — three
independent shapes, scored by three judges against three questions — is work
nobody should have to redo if a gated call is ever picked back up. Read it as
an argument on file, not as a description of anything a player can open today.

How a new pair would be taught, and why it would be taught by playing rather
than by watching. Designed from three independent shapes — teaching waves,
demonstration rounds, interludes — scored by three judges: does it teach the
split, does it survive two devices, would a real pair enjoy it.

The owner's brief, verbatim, for this design: explain by example, with
animations and short text, (1) the basic principle, (2) how the first controls
and the radar work, (3) the first enemies — each shown before the relevant
wave, as a technically separate wave.

The thing that decided it: this game is not learned by learning which button
does what. It is learned in the moment one player discovers the other can see
something they cannot. A tutorial that teaches the buttons and not the split
has taught the wrong game — so the lesson has to be a gate that only two
complementary hands can open, and only a live wave has two live hands in it.

### The decision

Build **DESIGN 1 — THE FIRST WORDS (THE CALL)**, with six grafts taken off the
losing designs and two of its own claims corrected. Six lanes: three run at
the head, then a chain, because the brief's own ordering rule ("anything the
teaching waves are built ON must land before the waves themselves") is a
chain.

Two judges of three pick D1, and the third's case for D2 — pace and
distribution — does not survive D2's own fatal: pass B appends the *identical*
entry (same authored column, same colour) fourteen beats after both players
watched the game slide the cannon there and fire into it. The pair is tested
on memory of a demonstration, not on an exchange, in all three of its waves,
and its risks section never names it. D3 is refused on an entry point that
does not exist: `startTogether()` (`apps/game/src/main.ts:125`) calls
`jumpToWave(0)`, which calls `startWave` directly and emits no `needWave`, so
its two opening drills would fire after every death and never on a fresh
start — and D3 quotes that same fact as a feature elsewhere.

**Grafts taken.** (1) D2's `applyCommand` → hold-check + `runCommand` split,
repurposed as D1's *escalation*: at 32 beats unanswered the ship performs the
missing half itself, in the player's own command vocabulary, so it can never
demonstrate a gesture a player cannot make. `seatFor` is **not** taken —
`applyCommand` ignores `timed.player` for everything but `grip`, and the call
script authors which half is whose, so it would be a second copy of a rule
that already lives in `render/src/touch.ts`. (2) D2's scar catch:
`applyHullDamage` honours `cfg.hullInvulnerable`, but `breachHull` pushes the
`Scar` and the `breach` event *outside* that guard (`hull.ts:254-255`). (3)
D3's THE MUSTER figure A — an amber column marker on one screen only — as wave
1's first call, pointed p1→p2 so it does not repeat wave 0's direction. (4)
D3's attempt-based termination, as a beat floor and a beat ceiling on every
call. (5) D2's caption-catalogue test, plus D1's own untested rule that a call
never resolves to the same subject on both screens. (6) D2's `test`-role
stacking, `1·` / `2·`.

**Graft refused: D3's crossed half-reading** (colour-no-column on p1,
column-no-colour on p2). `docs/decisions.md` #15 rejected exactly that
split — "the information and the action would have sat on the same screen,
which needs no voice channel at all." A slick is p2's radar kind and p1's
cannon answers it; handing p1 the colour moves information onto the acting
screen. The queen's `showsQueenShape`/`showsQueenHint` is the *opposite*
assignment and is licensed for a different reason (p2 holds the ammunition).
Judge 1 is right; Judge 2 is not.

**Two D1 claims corrected before anything is written.** The "airtight"
paragraph is false: `canvas2d.ts:162-163` runs
`this.shield.update(world.shieldCol, view.dt)` and passes `at` into `drawHull`
with no role gate, so p1 watches the shield body crawl along the hull. The
gate still holds, on the other half of the argument — p2 has no way to *learn*
the column. Verification is not information, and the spec must rest on the
second sentence. And a call's `beat` is a **`waveBeat`**, everywhere, without
exception: D1's wave 0 read two of its three calls off two different clocks.

### Why this shape, and what was grafted

**Why THE CALL and not a demonstration.** Only a gate that needs two
complementary hands can make two people talk, and only a live wave has two
live hands in it. THE MIRROR is the repo's only watch-then-repeat machinery
and nothing it shows requires anybody to have said anything. More decisive:
§3.2's own load-bearing requirement (`docs/spec/briefings.md`) — "the
demonstration is drawn with the game's own geometry, not a diagram of it" — is
satisfied by never building a diagram. A teaching wave *is* the geometry, at
full stage size, with the real `Glide`, the real `Effects`, the real 26 px
silhouettes; the `Field` split out of `Layout` and the eight
`(ctx, panel, t, role)` scene functions disappear. Eight scene functions are
eight places the game can change while the lesson goes on being wrong. A wave
cannot rot, because it is the thing it teaches.

**What it costs in new drawing: almost nothing, and I checked.** `drawRadar`
derives blip height as `inBeats = q.beat - (world.waveBeat - 1)`
(`render/src/field.ts:135`). Freeze `waveBeat` and the blip stops where it is —
the animation *is* the radar, held still. `beatMetronome` is already factored
out as `onBeat`'s first line, for exactly this cut; `interlude.ts` already
makes the same split in prose ("the clock keeps running, the wave does not").
One new render file, ~120 lines.

**Why the freeze is inside `onBeat` and not a fourth early return in `step`.**
`briefingHolds` and `interludeHolds` return before anything; a call must let
commands apply, bullets fly, grips hold and the metronome run, because *the
release is the real play* — p2's cyan bolt actually travels and actually pops
the frozen bulb, and a red one is actually rejected by `bullet-hit.ts:48`. So
`callHolds(world)` guards only the spawn/fall/boss/pod/hull block. `fork.ts`'s
"they cannot deadlock" paragraph is about `step`-level holds and is untouched,
which is materially safer than D1 itself claimed.

**Why a field on `Wave` against #18.** #18 refused a second copy of a
*derivable* fact. A call script is choreography, and authored choreography
already sits on `Wave` as `boss: { kind: "mirror", rounds }`. The derivable
part stays derived: whether a lesson has been taught is a bit in `world.brief`,
never re-authored. And #18's own "Reconsider if" — "something has to be taught
that no wave contains… That wants a third mechanism" — is the door this walks
through.

**Lane shape, against `docs/choosing-a-model.md`.** Section 10's measured fact
is that model tier explained almost none of the spread across thirteen lanes;
scope and repeat turns explained nearly all of it. So the batch is cut by
seam, not by size: two pre-existing defects cleared first, each its own
commit, then the mechanism, then the words, then the picture.
The two files everything wants — `world.ts` and `beat.ts` — are **both exactly
249 lines** against CLAUDE.md's ~250 ceiling, and all three designs edit both
without mentioning it. That is lane 1, it lands before anything else, and §6
has the precedent verbatim: `sonnet`, `think`, behaviour must not change.

`opus` is spent in exactly two places, both by the unpick test in §5: the
fingerprint (a field added to a hash two devices compare) and the mechanism (a
fourth hold in the file two devices must agree about). Everything else is
`sonnet` with the hard part named, which §5's second rule says beats `opus`
told nothing.

**Ordering.** Round 1 runs three lanes wide — `sim/world.ts+beat.ts`,
`sim/hash.ts`, `docs/` — with no shared path between them. Rounds 2, 3 and 4
are single because each is genuinely built on the one before: the script needs
the `Call` type, the picture needs the script. `startWave` takes `lesson` with
a `null` default so lane 3 stays green with no call site touched, and lane 4
threads `buildLesson` through the two hosts.

### The three waves, as designed

None of this exists in `packages/content`. All three would have gone at the
head of `WAVES`, in front of FIRST STEP. Columns below are given twice:
**authored** (against 7, what would go in the file) and **real** (after
`mapCol(c, 11)`, which is `0→0, 1→2, 2→3, 3→5, 4→7, 5→8, 6→10` — call `mapCol`,
never re-derive it). Every `beat` in a wave entry and every `beat` on a call is
a **`waveBeat`**. Defaults: 96 BPM (0.625 s/beat), 11 columns, 15 rows, hull at
row 14, `radarLead` 6, `guardWindowMs` 900 (1.44 beats). An entry at beat *n*
stands at row 0 on `waveBeat n+1` and reaches the hull 14 beats later; its
blip is on the strip from `waveBeat n-5`.

A call would open when `world.waveBeat` reaches its beat. While it is open
`world.waveBeat` stops, `world.beat` does not, and commands, bullets and grips
keep working. It would close when both halves of `need` are true **on the same
tick** — THE FORK's overlap rule, evaluated in sim from the world, not raced
between two arrivals. `cannonIn(n)` / `shieldIn(n)` mean the slider has stood
in column *n* across one beat boundary, so a sweep never trips it. A call
whose need is already true when its beat arrives would pass in the same tick
and never draw.

---

#### 0 · ONE OF YOU CAN SEE IT — *the principle*

`sentence`: "The one where the thing on your screen is not on theirs."
`hint`: "Say what you can see. Do what you are told."
`lesson: "principle"`

`entries`:
- `{ beat: 10, col: 4, color: "cyan" }` → **bulb**, authored 4 → **real column
  7**. Blip on **p2's** strip from waveBeat 5; stands at row 0 on waveBeat 11.
- `{ beat: 24, col: 1, color: "red" }` → **slick**, authored 1 → **real column
  2**. Blip on **p2's** strip from waveBeat 19; row 0 on waveBeat 25; hull on
  waveBeat 39.

Both are `aim` kinds, so both announce on p2 and neither on p1. **Cards
first**, derived by `openBriefings` from the queue and dealt in catalogue
order: `opening`, `slick`, `bulb`. This entire card mechanism —
`openBriefings`, the queue, catalogue order, `BRIEFINGS` — belongs to an
intermediate design that was itself replaced before it shipped; see
"Where THE CALL now sits" below. (The slick's card precedes the bulb's
although the bulb arrives first — catalogue order is the rule and it is what
makes two devices deal the same cards. Do not special-case it.)

**Call 1 — waveBeat 1. The clock.** Field empty, both strips empty. Floor 4
beats, `need: { p1: none, p2: none }`, so it passes on the floor.
- p1, anchor `beats`: **THIS IS THE CLOCK.**
- p2, anchor `beats`: **COUNT IT OUT LOUD.**
Four HUD dots stepping off `world.beat % 4`, one per beat, bracketed on both
screens. This is the one call whose halves share an anchor, and the exemption
is principled: systems.md 5.2 lists the beat as the row of the split table
that is deliberately *not* split. 2.5 s. No panel.

**Call 2 — waveBeat 6. The discovery.** The bulb's blip is five beats out on
p2's strip. Freeze.
- p2, anchor `radar(7)` — bracket on the diamond climbing their strip: **ONLY
  YOUR STRIP HAS THIS.**
- p1, anchor `elsewhere` — a chevron at the stage edge pointing at the other
  phone, and beneath it p2's line as grey word-shaped bars: **THEIRS IS NOT
  EMPTY. ASK.**
- `need: { p1: cannonIn(7), p2: none }`.
p2 must say a number out loud. p1 slides. The instant the cannon has rested in
real column 7 across one beat boundary, the freeze lifts and the blip resumes
climbing at tempo. **This is the moment the whole design exists for**: a
player stopped by the absence of information their partner holds, in the
game's own geometry, on the game's own controls. Note the copy is about the
*strip*, never about the body — "only your strip has this" stays true forever,
where "only you can see it" would be false in five beats.

**Call 3 — waveBeat 16. Whose hands.** The bulb spawned at waveBeat 11 and
hangs mid-air at row 5.
- p1, anchor `body` — bracket on the bulb with the cannon lobe standing under
  it: **YOU ARE UNDER IT.** Plus a second, dimmed bracket around p1's three
  buttons carrying no text at all; the dimming says it.
- p2, anchor `fire("red")` + `fire("cyan")` — bracket on both colour buttons:
  **ONLY YOU CAN FIRE.**
- `need: { p1: none, p2: gone }` — the frozen body off the field.
Bullets advance during a freeze, so p2's shot is a real shot. Cyan pops it and
the call lifts. **Red does not**: `bullet-hit.ts:48` rejects the colour,
`reject` fires, the bolt is spent, the bulb is still hanging there and the
call is still up. `BRIEFINGS.bulb` currently *asserts* "a wrong colour is
spent, not missed" and no new pair can test that claim without losing
something. Here it costs nothing and no sentence is spent on it. **The
mistake is offered and never gated on.**

**Then nothing.** waveBeat 19: the slick's blip appears on p2's strip at real
column 2. waveBeat 25: it spawns. waveBeat 39: hull — fourteen beats of fall,
8.75 s, the latency budget with room. No bracket, no freeze. p2 reads, says,
p1 stands, p2 fires red. If they miss, the crack draws at column 2 and the
impact sounds and the hull bar does not move: they have seen what losing looks
like and it cost nothing.

≈ 39 waveBeats of field (24 s) plus 4 beats of Call 1 and however long Calls 2
and 3 take.

---

#### 1 · COLUMN AND BEAT — *the controls and the radar*

`sentence`: "The one where the warning is on his screen and the control is on
hers."
`hint`: "He reads the strip, she stands in the column, he triggers on the
landing."
`lesson: "grammar"`

`entries`:
- `{ beat: 10, col: 3, kind: "meteor", color: null }` → **rock**, authored 3 →
  **real column 5**. Blip on **p1's** strip from waveBeat 5; row 0 on waveBeat
  11; hull on waveBeat 25. (`fallTilesPerBeat("meteor")` is 1: tier index 0,
  +1.)
- `{ beat: 32, col: 5, kind: "meteor", color: null }` → **rock**, authored 5 →
  **real column 8**. Blip from waveBeat 27; row 0 on waveBeat 33; hull on
  waveBeat 47.

Card due: `meteor`. **This wave has to contain a rock and that is forced, not
chosen.** `radarOwner` gives p1 nothing but `guard` kinds, so there is no way
to put information on p1's strip at all without one. Every design that cut the
rock had to invent a split to replace it, and every such split is one
`decisions.md` #15 turned down.

**Call 1 — waveBeat 2. Say a number.** Field empty, both strips empty.
- p1, anchor `mark(8)` — an amber column marker standing on the grid, **drawn
  on p1's screen only**: **SAY THIS COLUMN OUT LOUD.**
- p2, anchor `shield` — bracket on their own strip in the band: **SLIDE WHERE
  HE SAYS.**
- `need: { p1: none, p2: shieldIn(8) }`.
Nothing on p2's screen carries the marker and p1 has no shield. This is the
cheapest airtight gate in the batch and it deliberately has *no blip to
read*, so it isolates "say a number" from "read a strip" — which the next call
then adds.

**Call 2 — waveBeat 6. Read a strip.** The rock's blip is four beats out on
p1's strip.
- p1, anchor `radar(5)` — bracket on the grey blip: **GREY. ONLY YOUR
  STRIP.**
- p2, anchor `elsewhere` — chevron off the stage edge, p1's line redacted
  beneath it: **ASK HIM WHAT IS COMING.**
- `need: { p1: none, p2: shieldIn(5) }`.
p1 now has to *interpret* — a diamond's column and its height — and turn it
into a sentence, where Call 1 only asked them to read a mark. **The gate holds
in the direction that matters and the argument is not the one D1 wrote.** p1
*can* watch the shield body arrive: `canvas2d.ts` passes `at.shield` into
`drawHull` for every role. But nothing anywhere on p2's screen carries the
rock, so p2 cannot *learn* the column from anything but a voice. Verification
is not information, and the whole gate rests on the second sentence.

**Call 3 — waveBeat 24. Two hands, one beat.** The rock hangs at row 13, one
row above the hull.
- p2, anchor `body` — bracket on the shield sitting under it: **IN PLACE. NOT
  ARMED YET.**
- p1, anchor `trigger` — bracket on the SHIELD button: **ARM IT. IT LASTS ONE
  BEAT.**
- `need: { p1: guard, p2: shieldIn(5) }`, both true on the same tick.
On release the rock falls its last row into an armed shield and `deflect`
fires for real, with the real flare. **The rule is not bent**: contact is one
beat later, 0.625 s, and `guardWindowMs` is 900 ms. This is the only mechanic
in the built game where two seats must agree on one beat, and it is taught by
being performed rather than described.

**Then nothing.** waveBeat 27: rock two on p1's strip at real column 8.
waveBeat 33: it spawns. waveBeat 47: hull. p1 reads it, says "eight, lands on
the four", p2 slides, p1 triggers on the landing. Miss and the crack draws,
the impact sounds, the bar holds.

≈ 47 waveBeats (29 s) plus the three calls.

---

#### 2 · WHAT TO CALL THEM — *the first enemies*

`sentence`: "The one where the three things you will be naming for the next
hour stand still and get named."
`hint`: "Flat and red is a slick. Round and cyan is a bulb. Grey is a rock and
cannot be shot."
`lesson: "bestiary"`

`entries` — three together, then three at tempo:
- `{ beat: 0, col: 1, color: "red" }` → slick, **real column 2**
- `{ beat: 0, col: 3, kind: "meteor", color: null }` → rock, **real column 5**
- `{ beat: 0, col: 5, color: "cyan" }` → bulb, **real column 8**
- `{ beat: 24, col: 4, color: "cyan" }` → bulb, **real column 7** — blip on p2
  from waveBeat 19
- `{ beat: 28, col: 2, color: "red" }` → slick, **real column 3** — blip on p2
  from waveBeat 23
- `{ beat: 32, col: 6, kind: "meteor", color: null }` → rock, **real column
  10** — blip on **p1** from waveBeat 27

**No cards are due**, because all three subjects were met on waves 0 and 1 —
and that is correct: the card machinery says there is nothing new and the
lesson runs anyway off its own `taught` bit. This is the wave that pays for a
voice-first game and that no single-screen game needs. A pair cannot say "the
flat red one on four" until they have been handed the words *flat*, *red* and
*slick* while looking at one. You name a shape after you have met it, which is
why this is third.

The first three spawn at row 0 on waveBeat 1 and all three calls sit at
**waveBeat 2**, with the bodies frozen at row 1 — 26 px apart at a column's
pitch, the shape sheet's own picture at full size, in the game. Three calls on
one beat is not a special case: `world.call.index` advances and the next
call's beat has already passed, so it opens on the same frozen `waveBeat` and
the three bodies never move for the whole lesson.

**Call 1 — the slick.**
- p1, anchor `body` on the flat red one: **FLAT AND RED. A SLICK.**
- p2, anchor `fire("red")`: **RED ANSWERS RED.**
- `need: { p1: cannonIn(2), p2: fire("red") }` — both halves of a kill, named,
  with the clock off. It dies.

**Call 2 — the rock.**
- p1, anchor `body` on the grey one: **GREY. A ROCK.**
- p2, anchor `fire("red")` + `fire("cyan")`, both crossed through: **NEITHER
  COLOUR WORKS. TRY IT.**
- `need: { p1: guard, p2: shieldIn(5) }`.
The invitation is an invitation and **never a gate**. If p2 fires, the shot
lands, `hole` fires, a crater appears and the rock keeps standing there — the
rule drawn instead of stated. If they refuse, nothing is lost and the call is
unaffected. Never gate on a mistake; only offer one.

**Call 3 — the bulb.**
- p1, anchor `body` on the round cyan one: **ROUND AND CYAN. A BULB.**
- p2, anchor `fire("cyan")`: **CYAN ANSWERS CYAN.**
- `need: { p1: cannonIn(8), p2: fire("cyan") }`.

On release the rock resumes from row 1 and reaches the hull on waveBeat 15 —
thirteen beats, unbracketed, the deflection they were taught on wave 1 asked
for once quietly before it is asked for loudly.

**Then the exam, with no grade.** waveBeats 25 / 29 / 33: a bulb at real
column 7, a slick at real column 3, a rock at real column 10 — different
order, different columns, four beats apart, overlapping in flight, one of them
a rock. **Both strips carry something in the same wave for the first time**:
p2 is calling the bulb and the slick while p1 is reading a rock. No brackets.
Nine beats in which they have to say which is which and who is taking what.
Whatever happens, the wave ends and THE FORK opens.

≈ 47 waveBeats (29 s) plus three calls.

---

### The three things that would make it terminate

**No timeout, for THE FORK's reason** — a clock that eventually opened the
gate anyway would make the wait decorative. Instead the call **escalates**,
off `world.beat - world.call.sinceBeat`, in two stages, and D1's thresholds
are wrong and are corrected here. Eight beats is 5.0 s at 96 BPM, against a
0.5–2 s channel plus reading and sliding: a pair doing it *right* would trip
it on their first attempt and be handed the answer, and the tutorial would
teach that waiting works.
- **16 beats (10 s):** each screen gains the other seat's line, no longer
  redacted. The game says what the other screen says, once it is clear nobody
  asked.
- **32 beats (20 s):** the ship **performs the outstanding half itself**,
  through `runCommand`, in the game's own command vocabulary — the strip block
  slides on the band, `world.cannonCol` or `world.shieldCol` moves, the lobe
  glides. The call passes. It is visibly the game doing your talking for you,
  which is not a thing a pair enjoys twice, and because it performs a
  `Command` it can never demonstrate a gesture a player cannot make.
Both thresholds respect rule 4 completely: the game never knows whether they
spoke, only that they did not act.

**It cannot be failed.** While a lesson is unfinished the hull takes no
damage — a guard in `applyHullDamage` reading `world.lesson`, which *is* in
`hashWorld`, never a mid-run mutation of `cfg.hullInvulnerable`, which is not.
The `breach` event still fires, the crack still draws and the impact still
sounds. And the scars do not survive: `startWave` clears `world.scars` on
entering or leaving a lesson wave, so three teaching cracks never walk into
FIRST STEP.

**Skipping, in three layers, none of them a setting.** (1) Playing correctly
is the skip button: a call whose need is already satisfied when its beat
arrives passes in the same tick and never draws, so an expert pair pays only
Call 1's four-beat floor. (2) `world.brief.taught`, three bits beside `met`,
set when a lesson's last call is answered — on the same "met on dismissal"
reasoning, and cleared by the same `forgetBriefings`. (3) The menu lists every
wave by name and sentence, and `jumpToWave` leaves the bits alone.

### Where THE CALL now sits, beside two systems it was written against

This section describes integrating THE CALL with `openBriefings`,
`packages/content/src/briefings.ts` and `BRIEFINGS`, the card-dealing system
that existed on 27 August 2026. **That system is itself gone.** By the time
`docs/spec/briefings.md` shipped, the derived-card approach this section reads
was replaced a second time by the placed-guide approach described there — so
every mention below of a card, `BRIEFING_SUBJECTS` or `openBriefings` is a
reference to a system two generations removed from what runs today, not one.
It is kept because the *shape* of the argument — a call and a card are
different registers and neither should absorb the other's job — still applies
to whatever THE CALL would sit beside if it were built now; the current
partner would be the guide, not the card.

**The card is used, unchanged, and one unbuilt half of it is replaced. Nothing
is taught twice.**

**Used.** Not one line of `packages/content/src/briefings.ts` or
`packages/sim/src/briefing.ts` moves. `opening`, `slick` and `bulb` come due on
wave 0 and `meteor` on wave 1 — derived by `openBriefings` from the waves' own
queues, with no list, no rule and nobody remembering. Putting a wave containing
a bulb in front of FIRST STEP moves the bulb card onto it for free, which is
precisely what decision #18's derivation bought.

**They cannot collide, and nothing arranges it.** `briefingHolds` early-returns
from `step` before anything, so a call cannot open behind a card; a call lives
only inside a running wave, and `startWave` opens the cards *after* installing
the lesson, so a card cannot open over a call. `fork.ts`'s ordering already
gives commit → card → wave. Three gestures in three registers, none of them
adjacent duplicates.

**The division of labour is a rule, not a habit.** The card says what a thing
*is*, in sentences, before the wave. The call says *where to look*, in at most
seven words beside a bracket, during it — never in a panel, never centred,
because the eye has to go to the thing. Deleting the card would push its prose
into the overlay and produce exactly the wall of text this design exists to
avoid; adding sentences to a call would do the same from the other end.

**Partly replaced: the demonstration requirement, and only that.** The eight
scene functions (`hail`, `field`, `cannon`, `colour`, `rock`, `torch`, `pod`,
`queen`), the `Field` split out of `Layout`, and `hull-frame.ts` sampling a
few-hundred-pixel panel are struck. §3.2's load-bearing requirement — "the
demonstration is drawn with the game's own geometry, not a diagram of it" — is
satisfied by never building a diagram: a teaching wave is the geometry, at
real stage size, at 26 px, with the real membrane, the real `Glide` and the
real `Effects`. A second renderer of the game rots; a wave cannot, because it
is the thing it teaches.

**Two subjects the derivation still cannot reach** — the grip and the
lance — are untouched by this batch. Decision #18's own "Reconsider if" names
them and says they want a third mechanism rather than a `briefings:` list
grown back onto `Wave`. THE CALL *is* that third mechanism and could carry
them later; it did not here.

**One bookkeeping consequence, and it is silent if missed.** Three waves
inserted at index 0 shift every index by three, so `GAPS[10]` becomes
`GAPS[13]` or THE GAUGE opens in front of the wrong wave with nothing failing.

**And one honest cost.** After this, FIRST STEP, TWO COLOURS and ALTERNATING
would have had their teaching taken off them and become pacing — one easy red
thing at your own tempo is a relief beat rather than a lesson. That is a
legitimate price for putting the ramp at the front, and those three would want
retuning a notch faster once somebody had watched it.

### What this plan could not decide

**1. A frozen field is, honestly, a lie about this game — and this design is
only two thirds free of it.** Neon Spore's whole difficulty is that the clock
does not stop while two people negotiate across a two-second delay. Stop it
and you teach the coordination while hiding the pressure. Every lesson ends
with an uncalled figure at tempo and the three together never freeze for more
than about half their length, but that mitigates rather than answers. It is
the reason a demonstration was refused, and it is the one thing `bun test`
cannot settle. **Watch a real pair before tuning anything else.**

**2. Every real two-phone session re-teaches, and none of the three designs
solved it.** `forgetBriefings` is called from exactly one place —
`startTogether()` at `apps/game/src/main.ts:125`, which runs on `link.onStart`,
i.e. every time two devices join a room. So the `taught` bits, like `met`,
clear on every join. The pair a skip protects is only a pair who stayed in one
session; two people who put their phones down and pick them up tomorrow pay
the full ninety seconds again. The answer is a save file and nothing here
builds one. Parked, and said out loud rather than claimed as a skip.

**3. Brute force is not closed and I am not pretending it is.** Eleven columns
at one beat each is ~6.9 s to lock-pick a `cannonIn` gate, against a 2 s voice
round trip plus reading. The one-beat rest defeats a sweeping drag, not a
patient pair stepping. The repo accepts the same about THE FORK and the
anti-cheese there is social — but a pair who *discovers* stepping has been
taught the wrong lesson by the tutorial itself, which is worse than learning
it later from a wave. If it shows up in play, the cheapest fix is that a
failed rest costs a beat before the next one counts.

**4. The escalation thresholds are guesses.** 16 beats (10 s) to un-redact and
32 (20 s) to have the ship perform the half are chosen to sit clear of a
correct pair's own loop — 5 s was demonstrably inside it. Too low and this
degrades into a briefing card with extra steps and a longer runtime; too high
and somebody sits there. Two phones decide it, nothing else can.

**5. Gate density before FIRST STEP: fifteen stops.** Three cards and three
calls on wave 0, one card and three calls on wave 1, three calls on wave 2,
two forks between. `fork.ts` is explicit that stacking "both of you press
something" gates is how a gesture stops meaning anything. The counters are
real — calls are short, they end on the pair's own action, a satisfied need
never freezes, and the cards *moved* rather than multiplied — but the density
is the density, and the first thing to cut if it reads as a queue is wave 2's
Call 2 (the rock, whose invitation is not a gate anyway).

**6. Whether wave 1's marker call earns its place.** It is grafted from D3's
THE MUSTER figure A, turned p1→p2 so it does not repeat wave 0's direction,
and its argument is that it isolates "say a number" from "read a strip". If
wave 1 reads as three stops in a row, this is the one to drop — it is one call
and one anchor.

**7. The residual nobody designed, and it was never queued.** Waves 1–3 (now
4–6, in a numbering that has since shifted again) can in principle be cleared
in silence: `drawCreatures` at `canvas2d.ts:188` is unconditional, so once a
body is on the field both screens have it in full, and only the 6-beat radar
lead is one-sided. The calls are authored so no line ever claims otherwise —
every line is about a strip or a control, never about a body — which removes
the lie without touching the shipped game. The stronger fix, one body in
FIRST STEP or TWO COLOURS made genuinely one-sided, is a change to the
information model and needs its own decision, which nobody has taken.

**8. One thing every design shares and none names.** All three stop or steer
the field from state two devices must agree about, and all three are
*entered* from the host — `apps/game/src/waves.ts` reacting to a `needWave`.
That handler is not in `hashWorld` and never has been. It is safe today
because the events are deterministic and both hosts see the same ones. THE
CALL adds the least there, because a lesson is a field on a `Wave` decided
inside `startWave` rather than a new branch in the handler — which is one more
reason it won — but the observation is worth a sentence in a future spec and
it was not something this design fixed.

---

## The direction, in the owner's own words

Asked whether to retire this file or reconcile it with what shipped, the
owner chose to reconcile, and said where the guide goes from here:

> yes reconcile teaching.md
>
> In the future, i plan to create nicer guide introduction in waves with nice
> animations and less text.

**This is why `Wave.guide` is already shaped the way it is.** It is an object
with named parts (`both`, `p1`, `p2`) rather than three loose fields or a bare
string — see the doc comment on `WaveGuide` in
`packages/content/src/wave-types.ts` and §3.1 of `docs/spec/briefings.md`. An
animation, a picture or a step list arrives later as *another key beside these
three*, and no wave file has to move to make room for it. THE CALL's own
`§3.2` — "the demonstration is drawn with the game's own geometry, not a
diagram of it" — is still the load-bearing constraint on whatever that key
turns out to hold, whether or not it ever arrives by the route THE CALL
describes.

**And today's words are a first draft, not a settled text.** The sixteen
guides that ship today are prose because the design they replaced dealt prose
cards; under the owner's direction they are the first pass at something
shorter, meant to sit beside a picture rather than carry the whole idea in
words. Shortening them, and building what sits beside them, is the owner's own
step-by-step work — this file does not do it and no wave's guide text changes
here.

## Which file owns which question

`docs/spec/briefings.md` owns what the game does: the introduction, the
guide, its two states, the two devices, the tests. This file owns two other
things — a design for a different mechanism that was scored and not
taken, kept so the reasoning is not redone, and the owner's direction for
where the shipped guide goes next. Read `briefings.md` for the feature; read
this file for the road not taken and the road ahead of it.
