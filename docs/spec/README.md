# Specification

The design, translated from the German original and split by topic. Read the
two or three parts a task needs, not the whole thing.

**This is design intent, not a description of the running game.** Every file
carries a status line saying how much of it exists. Where the spec and the code
disagree, the order is: `docs/decisions.md` decides, the code is the truth for
numbers, and this spec says what the thing is *for*. If a section turns out to
be wrong rather than merely unbuilt, fix it here in the same commit as the code
and record why in `docs/decisions.md`.

## Status vocabulary

| Marker | Means |
|---|---|
| **built** | it is in the running game |
| **partly built** | some of it runs; the section says which part |
| **not built** | design only |
| **superseded** | decided differently; kept for the reasoning |

## The parts

| File | Covers | Status |
|---|---|---|
| [overview.md](overview.md) | what the game is, the guiding question, the speech rule, the setting | built in outline |
| [roles.md](roles.md) | the two roles and the raster control model | built |
| [couplings.md](couplings.md) | warding, marking, announcing | 1 of 3 built |
| [latency.md](latency.md) | the voice delay and the 4-second rule | built into the timing |
| [systems.md](systems.md) | control visibility, information split, beat, ammunition, weapons, destruction, power-ups, raster behaviour | mixed |
| [assists.md](assists.md) | the three assist forms and their unlock order | not built |
| [structure.md](structure.md) | waves, saving, scoring, the randomness rule | partly built |
| [briefings.md](briefings.md) | what is taught before a wave, and how it is placed | not built |
| [wave-design.md](wave-design.md) | figures, variation, the two filters, the ten acts | partly built |
| [graphics.md](graphics.md) | the visual rules and the fiction | mostly built |
| [audio.md](audio.md) | the speech-band rule, the grains, the catalogue | built, unheard |
| [bestiary.md](bestiary.md) | creatures, rejected creatures, the ceiling | 3 of 20 built |
| [bosses.md](bosses.md) | the eleven bosses | not built |
| [open-questions.md](open-questions.md) | what is undecided, including the move to space | live |
| [ideas.md](ideas.md) | accepted but not worked out | not built |
| [transfers.md](transfers.md) | what the two reference games do, and what of it survives the trip | not built |

## What is not here

Sections 12–14 and 18–20 of the German original — technology, the Claude Code
setup, the state of the prototypes, ways of working, file lists — are
superseded by `docs/decisions.md`, `docs/architecture.md` and
`docs/working-with-claude.md`. They were not translated. Section 16, the name,
is settled in `docs/decisions.md` #1.

## Two things to know before reading

The original was written under the working title **SIGNAL BLOOM** and for an
**ocean** setting, and it presented two control models as an open choice. The
name is now Neon Spore, the setting is space, and the raster model won. Where a
section still leans on the old assumptions, it says so rather than being
quietly rewritten — the reasoning is usually still good even when the fiction
or the gesture is not.

The German original was deleted once the translation was complete, so there is
never a second source of truth. It is in the git history.
