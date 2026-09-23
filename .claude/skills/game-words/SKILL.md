---
name: game-words
description: Write the English a player reads in Neon Spore — a wave's guide, a mechanic's sentence, a menu button, a message when the line drops — so that it is short, plain and sayable out loud by someone who is not reading in their first language. Use when writing or changing any text a player sees, when a guide reads badly, or when the owner corrects a word.
---

# Writing the words a player reads

Two people read this game's text on two phones, under a beat, and then **say it
to each other**. Neither of them is necessarily reading in their first
language. A sentence they have to read twice is a wave lost; a clause they
cannot repeat from memory never reaches the other phone at all.

That is the whole brief, and it is why the limits here are tighter than a style
guide would ask for. `bun run words` is the same brief as numbers.

## 1 · What this covers

| Where | Field | Drawn on |
|---|---|---|
| `packages/content/src/waves/act-*.ts` | `guide.both`, `guide.p1`, `guide.p2` | the guide screen a wave opens on |
| `packages/content/src/waves/act-*.ts` | `name`, `sentence` | the HUD, the wave list, the guide's last page |
| `packages/content/src/mechanics-*.ts` | `what` | **a menu button** — the DEMOS page (`apps/game/src/demo-menu.ts`) |
| `packages/content/src/screen-words.ts` | `LINK_WORDS[].what` | the card when the line to the other phone drops (`apps/game/src/hold.ts`) |
| `packages/content/src/screen-words.ts` | `SCREEN_WORDS[].what` | the menu's screen chooser (`apps/game/src/menu-seats.ts`) |

**A caption is not here.** `GuideScene.steps[].text` is held to 28 characters
and to the present tense by `packages/content/test/scenes.test.ts`, and the
voice for one is `.claude/skills/new-tutorial`. Call that rule, do not
re-derive it.

**The check reaches every row.** `tools/words` imports `@neon-spore/content`
and may not import `apps/game`, which pulls in the DOM — so a sentence the game
draws outside a wave is written in `screen-words.ts`, never beside the code
that draws it.

## 2 · The six rules

Every one of them is a row in `tools/words/measure.ts` and fails
`bun test tools/words`. The numbers were read off the shipped text, not chosen:
on the day they were written, **290 of 717 lines failed and 29 of 189 subjects
passed**, and the 29 are almost all boss guides — the ones written as numbered
steps. The register already exists in this game. It just is not everywhere.

### A semicolon and an em dash are banned outright

This is the rule that fires most. Both join two complete thoughts into one
breath, which is exactly what a player repeating a line out loud cannot carry.
A full stop costs one character and splits the thought where the voice already
splits it.

> *— and in between it hangs for one beat, already aimed.*
> **In between it hangs for one beat.**

### One line, one budget

`name` 4 words · `sentence` 20 · `both` 30 · `half` 18 · `what` 30.

`half` is tightest because it is the one a player reads **and then says**. A
`\n` ends a line, so a numbered list spends the budget per step, not per field
— which is the other half of why the numbered guides pass.

### One sentence, 18 words

Longer than that is two sentences. Put the full stop where you would breathe.

### Two clause marks to a sentence

Commas and colons. A list a player says in one breath (`LEFT, RIGHT, UP, DOWN`,
`three, two, one, zero`) does not count — the check only counts a mark with
three or more words before it.

### Say who does it

`is held`, `are thrown`, `is being reached for`. A passive hides the actor, and
the actor is the thing the player needs: is it them, their partner, or the
game?

> *A rock is shielded, not shot.*
> **You put the shield under a rock. You never shoot it.**

### One word per thing

Section 3. The check names the word to use instead of the one it found.

## 3 · The vocabulary

**Settled, and enforced** — each was already fixed somewhere and then
contradicted in text a player reads:

| Never write | Write | Why |
|---|---|---|
| lane | **column** | `CLAUDE.md` fixes it, and the strip is drawn in columns |
| bolt | **shot** | the player presses a trigger; what leaves is a shot |
| pilot | **Player 1** | no screen anywhere shows a player the word *pilot* |
| navigator | **Player 2** | the same |
| seat | **screen** | *seat* is the code's word; a player has a screen |
| ward, plate, guard | **shield** | the owner's word, 21 September 2026 — the button a thumb is on already says it |

**Shield is a noun and this game has no verb for it.** That is the cost the
owner picked it knowing: *shield the torch* reads as a noun, so the line says
what a hand does instead — **put the shield under it**, **move the shield
there**, **trigger the shield**. Reach for one of those three before inventing
a fourth. `guard` stays as the control's id in the code and reaches no screen.

**No line a player reads says ward, plate or guard** since 23 September 2026.
A plate that is a boss's own armour is not the shield: THE WARDEN's rim says
*piece*. `CEILING` went up rather than down on the day this row was added, the
one thing that may raise it, and the sweep brought it back down.

**A `name` is a proper noun and no row in this table reaches it.** The wave
`THE WARD` keeps its name: renaming one reaches the director, the perf rows and
the baselines, and a title is not the word a player reads for the object.

## 4 · The loop

1. `bun run words "<WAVE NAME>"` — every line of that subject, passing ones
   included, with the rule and the word for each failure.
2. Rewrite. Reach for the numbered-step shape first: it is what the boss guides
   already do and it is why they pass.
3. `bun run words "<WAVE NAME>"` again, until every line is `✓`.
4. Add the subject to `CLEAN` in `tools/words/clean.ts`, **in sort order**, and
   lower `CEILING` to what `bun run words --clean` now prints. A lane that has
   added a *rule* remeasures it instead, and says in `clean.ts` which rule and
   how much.
5. `bun test tools/words`.

`CLEAN` only grows, and `CEILING` only falls unless a new rule went in with it. `CLEAN` catches a rewritten wave
sliding back; `CEILING` catches a *new* wave written in the old register, which
`CLEAN` cannot see. `tools/words/clean.ts` says why the contract is that way
round rather than a list of what is waived.

## 5 · Three rewrites, checked

Each of these passes `findings`; the tests in `tools/words/test` hold two of
them by name.

**THE SHELL, `both` — 49 words, three clauses, no main verb for 34 of them**

> *A slick or a bulb in plating a size too big for it, split down the middle:
> one piece in front of each of its two columns, and its colour showing through
> the cracks. Any colour chips a piece. Only when both are off does that colour
> finish it.*

> **A slick or a bulb inside armour, in two pieces, one per column. Any colour
> chips a piece off. Only when both are gone does its own colour kill it.**

**THE COUNT, `both` — 47 words, a semicolon, and a metaphor where a mechanic
is meant**

> *A round body with an eye shut by blades of its own flesh, one blade fewer
> each beat. It can only be hit while the eye is open; a shot on any other beat
> loses the wave and the body stays. Only one screen shows the blades.*

> **A round body with an eye. Petals close it, one fewer each beat. Shoot only
> on the beat the eye opens. Any other beat loses the wave.**

**THE VEIL, `p2` — 42 words in one breath, for the player who has to act on it**

> *You have a corner frame around it and nothing else, so ask. Fire on what you
> are told, not on what you last heard — a wrong colour shuts the cloud for two
> seconds and the answer changes while it is shut.*

> **1. You have only a corner frame, so ask.**
> **2. Fire on what you are told now, not on what you heard before.**
> **3. A wrong colour shuts the cloud for two beats.**

## 6 · When the owner corrects a line

**Write the correction into this file in the same turn, in his own words, and
do not only apply it to the line he was looking at.** That is why section 1 of
`.claude/skills/new-tutorial` is the skill people actually follow: every
heading in it is a quotation.

Then make it bind. A correction that stays prose gets forgotten; a correction
that becomes a row in section 3 or a rule in `tools/words/measure.ts` fails a
test the third time somebody repeats it. If it can be measured, measure it.

### Corrections

*Nothing yet. The first one goes here, dated, with the line before and after.*

## 7 · The checklist

1. Which of the five rows in section 1 is this? That fixes the budget.
2. Can a player say it to the other phone from memory? If not, split it.
3. Is every word in section 3's left column gone?
4. `bun run words "<subject>"` — every line `✓`.
5. `CLEAN` and `CEILING` updated, `bun test tools/words` green.
