# Sound

> **Status: built, unheard.** The engine, the catalogue and the bindings are in
> the running game. Every sound in it was written to numbers and checked by
> `bun test`; **none of them has been listened to**, because the session that
> wrote them had no speakers. Treat every judgement below about how something
> *sounds* as a claim awaiting the first person to press play in the director's
> SOUND tab.

`docs/spec/systems.md` 5.3 asked for two things and nothing else: a sparse
click track below the speech range, and separate tones for the handful of
outcomes that matter. This file is how that was built, and what it grew into.

## 1 · The rule everything else follows

**Talking is the control scheme.** A sound that sits on top of a voice does not
merely annoy — it costs the other player a sentence they have to say twice,
across a channel that already has a delay on it (`latency.md`). That is the
most expensive thing the game can spend.

So the palette is **carved around the voice**. Bodies below 300 Hz, sparkle
above 3 kHz, and only brief transients crossing the middle. A sweep goes
*around* the band rather than through it — which is why so many sounds here are
a low half and a high half with a hole between them, and why that hole is the
game's sonic signature rather than an inconvenience.

`packages/audio/src/band.ts` makes this fail rather than merely be intended. It
measures, per sound, the time spent inside 300–3000 Hz, weighted by how loudly
it is spent, and `packages/audio/test/catalogue.test.ts` refuses anything over
**0.16 s**. Well over half the catalogue reads exactly zero.

**Five sounds are allowed past it**, each carrying a written reason in a
`pierce` field. The reason is never "it should be loud" — it is always *timing*:

| Sound | Why it may cover a voice |
|---|---|
| `hull.alarm` | below a quarter hull there is one thing left to say |
| `hull.dead` | the run is over; there is no sentence to be in the way of |
| `boss.torchWarn` | the torch is the one arrival too fast to be talked about |
| `boss.queenDown` | a boss dying ends the conversation about the boss |
| `mirror.down` | the same, mid-sentence, on purpose |

The ceiling of five is a test, not a convention. A sixth has to be argued past
someone.

## 2 · Nothing is a recording

Every sound is a handful of numbers a synthesiser builds at the moment it
plays. There is no sample pack, no audio sprite, no fetch.

Measured on the build: **190 sounds cost 20.4 kB gzipped**, about 110 bytes
each — roughly what one and a half seconds of compressed audio costs. The same
catalogue as samples would be the largest thing the game ships by a wide
margin, on a portrait mobile web game that currently loads in 57 kB total.

It buys three things beyond the bytes. A sound can be **parameterised at the
moment it plays** — a column becomes a stereo position and a row becomes a
pitch, so where something happened is heard rather than looked up. It can be
**checked**: a recipe is data, so `bun test` can assert the speech-band rule
across all 190 at once, which no waveform allows. And it can be **edited by
argument** — changing a boss's voice is changing a number in a diff.

## 3 · The grains

A sound is a stack of grains, not a hand-built oscillator graph
(`packages/audio/src/grain.ts`). The catalogue holds 190 sounds and they have
to belong to one game: if every sound invents its own bell, the game has 190
bells.

| Grain | What it is | Where it sits |
|---|---|---|
| `sub` | the ship's mass, a soft sine | under the voice |
| `thud` | a pitch dropping through the floor | under |
| `tick` | six milliseconds of noise — the click track's own grain | over |
| `glint` | a bare high sine; neon | over |
| `chime` | a bell with the harmonics knocked off centre | over |
| `air` | a band of noise sweeping | around |
| `spore` | a triangle that cannot hold its pitch; something alive | under |
| `metal` | a sawtooth with its top filtered off; hull and rock | under |
| `swell` | the room breathing | under |

`burst`, `after` and `soft` shape a grain rather than adding one. Adding a
grain changes the game's voice and should be rare; adding a sound is not.

## 4 · The families

| Family | Holds | Bound |
|---|---|---|
| `beat` | the click track | 2 of 7 |
| `ship` | cannon, shield, maw, and THE GRIP | 11 of 17 |
| `impact` | what a shot does when it arrives | 6 of 14 |
| `hull` | the hull taking it | 5 of 10 |
| `pod` | hanging, loose, taken, lost | 5 of 10 |
| `boss` | the Bulb Queen, and nine names holding a slot | 7 of 18 |
| `mirror` | THE MIRROR's half of a sequence, and the verdict | 15 of 17 |
| `ui` | menu, room, banner, balance sheet | 2 of 17 |
| `ambient` | the room; never a foreground sound | 0 of 8 |
| `creature` | the bestiary, built and unbuilt | 0 of 32 |
| `assist` · `signal` | the couplings and the assists | 0 of 20 |
| `swarm` · `motion` · `ruin` | the field, and things ending | 0 of 20 |

Four outcomes the pair must tell apart across a voice channel — destroyed, went
through, wrong colour, deflected — are separated by **shape**, not by pitch: a
burst, a hole, a refusal, a ricochet. Pitch is the first thing a phone speaker
in a noisy room throws away.

## 5 · Built and unspent

137 of the 190 are `spare`: finished, tested, and nothing
plays it. That is deliberate. A creature that is still a name in
`bestiary.md` is easier to argue about once you can hear what it would sound
like, and several idea-store entries stand or fall on exactly that — the
countdown creature is three pips and a hole where the fourth should be, and
either that reads instantly or the mechanic is a guessing game.

**THE SOUND CATALOGUE** is its own sheet in the director — `bun run dev`, then
`♪ SOUND` in the header. A tab per family, a filter for bound or spare, and
three things on every row:

- **What it is attached to**, drawn. A contour out of `shape-sheet` or a
  control glyph out of `render/simon-glyph.ts` — the same geometry the canvas
  draws and the same button the band draws. Nothing on the page invents a
  picture for something the game already knows how to draw, and a subject with
  no drawn contour yet shows a question mark rather than a stand-in.
- **What it sounds like**: press ▶.
- **What it looks like**: time across, frequency up, the speech band shaded in
  red. This is section 1 made visible — a sound either goes through the red or
  around it, and almost all of them go around.

The `BOUND` stamp is not a label anyone maintains: the test reads `bind.ts` and
`mixer.ts` and fails if a sound claims to be wired and is not, or is played and
claims to be spare. Five bound sounds have no subject to draw — the beat, a
hole punched in whatever was hit, a wave opening and closing — and each carries
a written reason in `sound-link.ts`, the same arrangement `pierce` makes here.

## 6 · How a sound reaches the game

`world.events` already said it, before any of this existed: *"render/ and audio
read this; nothing writes back."*

- `bind.ts` turns one `SimEvent` into one cue — an id, a pan, a pitch. Pure, so
  the tests can walk the whole `SimEvent` union and prove nothing is silent by
  accident. The union is read out of `sim/world.ts`, not copied, so a new event
  fails the test the day it is added.
- `mixer.ts` also watches what the simulation does **not** report, because it
  is state rather than an event: the cannon arriving in a column, the guard
  window closing on nothing, the queen's armour opening, the hull passing a
  quarter. That remembered frame is cleared on a restart, for the same reason
  `Effects.reset()` exists — `world.tick` is not monotonic.
- `engine.ts` is the only file with an `AudioContext` in it, and makes no
  decisions.

## 7 · What is not built

- **The click track is on by default and has never been heard against a real
  voice call.** Whether 96 BPM of tick is company or nagging is the first
  question to answer with two phones.
- **No ducking.** A boss arriving does not quiet the field.
- **No silent mode.** 5.3 asks for a pulsing screen border as a visible
  substitute; muting is a keypress and nothing replaces the information.
- **No per-device split.** Both players hear everything, which is what 5.3
  asks for. Whether the navigator should hear the radar and the pilot should
  not is an open question, not a decision.
- **Nothing loops.** The ambience is written as one-shots a host would repeat,
  because a loop that has to be stopped is state, and state in audio is where
  the leaks are.
