# Between the waves

> **Status: not built.** The rest between one wave and the next exists in the
> simulation and nothing is drawn over it. `wave-end.ts` credits the clear and
> sets `world.restBeat`; three beats later the host is asked for the next wave
> and the guide comes up. In between, the pair watches the field it has just
> emptied. Nothing outside `sim/` reads `restBeat` at all — the grep is the
> whole of the evidence, and the one hit it returns is a test fixture setting a
> field of that name on an undertow.

The owner, 18 September 2026: *"Right now when a wave is finished to the moment
it switches to next wave and starts tutorial/guide (if one exists) is very
boring, so make sure we have some nice fancy success screen if a wave is
finished and the tutorial for new wave is introduced as something to be excited
— so player is thrilled to watch the tutorial and understand before starting to
play it."*

This sheet is the half of that ask which is not the guide's header. The header
shipped on 20 September 2026 (`guide-tide.ts`, `docs/spec/briefings.md` §2).

**It is a look with no shipped alternative**, which is the exemption a lane
building it names in its commit: there is no screen at all between waves today,
so there is nothing for a VERSUS vote to stand against (`docs/looks.md`).

## 1 · What is there now

| Fact | Where |
|---|---|
| The clear is credited once, on the first beat the field is empty | `noteWaveCleared`, `sim/wave-end.ts` |
| The rest is `cfg.waveRestBeats` beats long — **3**, at **96 bpm**, so **1.9 seconds** | `sim/config-run.ts`, `sim/config.ts` |
| `restBeat` is `0` while a wave is live, `beat + 3` through the rest, `-1` once spent | `sim/wave-end.ts`, `sim/wave-start.ts` |
| The host answers `needWave` on the tick it is asked, so the gap is exactly the rest | `apps/game/src/waves.ts` |
| A spent round holds its own picture through the rest rather than dropping back to the field | `endSpentRound`, `docs/spec/interludes.md` |
| Nothing is emitted at the moment of the clear; `needWave` fires at the *end* of the rest and is bookkeeping | `sim/events.ts`, `audio/src/bind.ts` |

So the screen has its state already: `restBeat` and `beat`, both in
`hashWorld`, and **no new field is needed** — the same standing the lost screen
has on `failTick` (`sim/wave-fail.ts`, `render/src/lost-screen.ts`).

## 2 · What it is for

The pair has just finished doing, and the next thing asked of them is to
**read**. That turn is the whole difficulty of the moment. A guide opens on a
rehearsal at full size with words inside the picture, and a pair still braced
for the wave they were playing arrives at it mid-sentence.

The screen's job is therefore not congratulation. It is the **stop** — a beat
that says *that is over, this is the new thing* loudly enough that two people
who have been talking at each other stop talking and look up. What makes it
worth drawing is not the praise but the punctuation.

## 3 · What it says

Three things, in this order, and nothing else:

1. **The wave just cleared**, by number and name, in the vocabulary the guide's
   header now uses — `WAVE 3 · THE GRATE` (`render/src/wave-intro.ts`'s
   `waveName`, which is the one place a wave is named).
2. **What it cost**: the clock and the retries. Those two figures are what a run
   *is* since the point score came out on 12 September 2026
   (`docs/spec/structure.md` §7.2), and both are already formatted —
   `clockText`, `retriesText`, `playSeconds`, all in `sim/wave-fail.ts` and all
   already read by the balance sheet.
3. **The wave coming**, as the hand-off rather than as a second screen — §5.

### What it must not be

- **Not a score.** There is no points currency to report and there must not be
  one; a second number beside the clock counts nothing the clock does not.
- **Not per-seat, ever.** Nothing on it may be read backwards to say who
  missed. That is the rule the balance sheet is built on and the reason it is
  built that way (`render/src/balance.ts`, `docs/spec/structure.md` §7.2), and
  a screen that broke it once a wave would break it ninety-seven times a run.
- **Not the balance sheet early.** The sheet is the *run's*, it is the cheapest
  emotional payoff in the project, and spending its shape between waves spends
  it. SYNC, the wards, the pods and the husks stay where they are.
- **Not a thing to press.** The pair is about to be asked for two thumbs at the
  end of the guide (the ready gate, `docs/spec/briefings.md` §2). A button here
  is a second gate thirty seconds before the first, and the gate stops meaning
  anything.
- **Not a card.** No panel, no border, no frame around text — the rule the whole
  opening was rebuilt on, for the reason `render/src/briefing.ts` states: a
  frame shrinks the game to a thumbnail and puts a paragraph under it.

## 4 · How long, which is the one number to decide

**1.9 seconds is not long enough to read two lines in**, and the drop the owner
asked for takes six tenths of a second of it (`render/src/text-drop.ts`). The
rest was three beats because nothing was in it; a screen makes it a duration
somebody experiences, and it has to be measured against what it asks the eye to
do rather than against what the field needed to settle.

**Raise `cfg.waveRestBeats` to 6** — 3.75 seconds at 96 bpm. It is one named
number in `sim/config-run.ts`, which is where a tunable belongs, and the
comparison that sizes it is the introduction: `INTRO_SECONDS` is 5.5 for three
lines that must be read cold, and this screen has two lines the pair already
knows the answer to. Long enough to land, short enough that a pair clearing
wave after wave is never waiting for the game.

It is a simulation number, so it moves the beat everything else on the rest is
counted in. A lane changing it re-reads `wave-fail.ts`'s `countPlay` first: the
run's clock does **not** run through the rest, so a longer rest does not
inflate the figure the screen is reporting.

## 5 · The hand-off is one movement

The queue entry asked for the close and the open to be *one movement rather
than two screens*, and the pieces for that already exist and already point the
right way:

- The guide's header is a plate that **falls** into the band, once, on a clock
  keyed to the wave rather than to the page (`OpeningFx.waveAge`,
  `guide-tide.ts`).
- So the cleared wave's name **rises** and goes out as the new one falls in —
  the same gesture in opposite directions, on the same kit, at the same place
  on the screen. Nothing is invented; `text-drop.ts` already carries the
  owner's condition on it, in his own emphasis: **the text must be well
  readable**.

That continuity is what makes it one movement. Two entrances of different kinds
in two seconds is what makes it two screens.

## 6 · Where it sits among the three

| The wave | The screen | Drawn from |
|---|---|---|
| cleared | this one | `restBeat` |
| lost | the lost screen, which asks | `failTick` (`lost-screen.ts`) |
| the run over | the balance sheet | `world.over` (`balance.ts`) |

It never stands on a run that is over, and it never stands on the way back into
a **retry**: a wave gone again is not a clear, it reaches `startWave` through a
`needWave` marked `retry`, and the pair has already been asked a question about
it.

## 7 · What the build may and may not add

- **Read `restBeat` through a named predicate in `sim/`**, beside `lostAsks` —
  `render` asks the simulation whether the rest holds rather than re-deriving
  `restBeat > 0 && beat < restBeat`. That is the rule that is called and not
  re-derived, and the row goes in `sim/test/purity.test.ts`'s table.
- **No new world field, and nothing new in `hashWorld`.**
- **The clock in seconds lives on `Effects`** and is cleared by
  `Effects.reset()`, the way `OpeningFx` is — the world's beat is enough to say
  *whether*, never enough to say *how far in*.
- **Anything drawn is drawn again in `render/test/frame.test.ts`.**
- **A sound is the one thing this would add to the simulation.** There is no
  event at the moment of the clear; `needWave` fires at the end of the rest and
  is bound to nothing. A `waveCleared` event in `sim/events.ts` is a cue in
  `audio/src/bind.ts` by the time its test has run — cheap, and worth it, since
  the stop this screen is *for* is heard before it is seen.

## 8 · Order of work

1. The screen on the rest: the cleared wave's name and the two figures, on the
   picture that is already up — field or spent round alike. `waveRestBeats` to
   6 in the same commit, because the screen is what makes the number wrong.
2. The hand-off: the name's exit tied to the header's entrance, one movement.
3. The sound, if the pair watching it says the moment is still quiet.
