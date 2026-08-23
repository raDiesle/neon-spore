# Specification

The full design lives in `legacy/spec-de-original.md` (German, ~1000 lines).
It is the source of truth until it has been translated and split.

Do not load the whole file into a session. Split it once, then read the two or
three parts a task actually needs.

## The split

| File | Covers (section of the original) |
|---|---|
| `overview.md` | what the game is, the guiding question, the speech rule (1) |
| `roles.md` | roles and the raster control model (2, 5.8) |
| `couplings.md` | the three couplings (3) |
| `latency.md` | the speech-delay constraint and the 4-second rule (4) |
| `systems.md` | control visibility, information split, beat, ammunition, weapons, destruction, power-ups (5) |
| `assists.md` | assist mechanics and their unlock order (6) |
| `structure.md` | waves, saving, scoring, the randomness rule (7) |
| `wave-design.md` | figures, variation, the two filters, the ten acts (8) |
| `graphics.md` | the visual rules (9) |
| `bestiary.md` | creatures, rejected creatures, the ceiling (10) |
| `bosses.md` | bosses (11) |
| `open-questions.md` | what is still undecided (15) |
| `ideas.md` | accepted but not worked out (17) |

Sections 12–14 and 18–20 of the original are superseded by `docs/decisions.md`,
`docs/architecture.md` and `docs/working-with-claude.md`. Do not translate them.

## Status

Nothing translated yet. Translate a part when a task needs it, and delete the
corresponding section from the German original in the same commit so there is
never a second source of truth.
