---
name: new-boss-more
description: The three standing briefs for enhancing a boss that already ships in Neon Spore — its words, its states and gestures, its picture — asked for by the owner on 18 September 2026 for every boss wave in the game. Use when a queue entry points at `.claude/skills/new-boss` section 6.1, 6.2 or 6.3.
---

# 6. Enhancing a boss that already shipped

Three standing briefs, asked for by the owner on 18 September 2026 for **every
boss wave in the game**. `docs/queue.md` carries one entry per boss per brief;
this is what each of them means, written once so it can be corrected once.

## 6.1 The words, and the briefing that comes down behind them

> *Add the explanations in game screen of 1-2 words, so we can get rid of
> tutorial/guides.*

Put the cue on every moment the fight asks for something: a scan frame on the
mark, the verb beside it, the kind of action above it, drawn on the seat that
can act, and never a column, a colour or a count (`docs/decisions.md` #34,
`render/src/boss-cue.ts`). Three rules it inherits are in that decision and the
fourth is in `boss-cue-read.ts`: **a mark stands only on something this seat is
already shown.**

**A boss's words are `boss-cue.ts`'s or its own drawing's**, and a handle's are
the drawing's — the mark rides a whip or a swell `World` does not keep, so
`sinew-handles.ts`, `surge-grip.ts` and `antiphon-grip.ts` call `drawCueText`
with no `case` next door. Grep the boss's own `*-draw.ts`, `*-handles.ts` and
`*-grip.ts` before concluding it says nothing: on THE SURGE that absence cost a
reading page, written and thrown away.

Then take the wave's briefing down to what the fight cannot say — which half of
the picture is on which phone, what a mistake costs, and the sentence the pair
has to say to each other — and if nothing is left, take the film off the wave
and put the wave on `STILL_PROSE` (`content/test/scenes-prose.test.ts`). A page
that only names a verb loses the verb rather than the page wherever its
neighbours are the other seat; `.claude/skills/new-tutorial` has why. **The
three prose halves stay either way**: the owner keeps them as the director's
own reference (`content/src/wave-types.ts`).

## 6.2 Several states, and a gesture that is not on the panel

> *Bosses' states should change several times between the different gestures,
> and have tasks to do some additional gestures on the game screen.*

Most shipped bosses ask for one gesture repeated until a count is reached. Give
this one several states, a different gesture in each, and at least one of them
reached on the picture rather than on the panel. THE INSTAR is the shape
(`sim/instar.ts`): a pose, the marks it shows in that pose, and three clocks —
how long the body takes to get there with the marks hidden, how long the window
stays open, and what the undone part does when it closes.

Every gesture is a member of `DragTarget` or `Hold["kind"]` or it does not
exist (`docs/spec/bosses-choreographed.md`, filter 9), and **the wire drops a
target `net/src/command-fields.ts` does not list, silently** — so the codec test
is part of the lane and not a follow-up. Every new field is in `hashWorld`, and
the cue gets an arm per state.

**Exemptions, decided by the owner, one boss at a time — check here before
reopening a queue entry that asks this question again:**

- **THE SPLICE**, 20 September 2026. `docs/spec/bosses.md` §11.13's own closing
  argument is four silences built to keep either seat from being handed the
  other's half of the sentence; a gesture on the picture is the exact thing
  those silences rule out, so the fight is exempted outright rather than given
  one.

## 6.3 A picture that looks like something real

> *I would like to enhance the graphics of each boss wave, so it looks like
> something real — a living thing or a space ship with details, such as BULB
> QUEEN, THE WARDEN, or THE INSTAR — and skipping each different picture state
> of each, just the current state of each boss, which is single.*

**So this is detail and not choreography**, and it is the one place
`.claude/skills/new-boss` §5's standard is deliberately not asked for: no pose
per state, no morph, no change of perspective. The state the boss has today is the state to draw, drawn until
it reads as a made thing — a grown contour out of `blobPath` with lobes rather
than an outline, a material that reads as shell or plate or skin, wet sockets,
a film of gloss over the curve, slime feeding it, and the parts a thumb reaches
for drawn where they are reached. Never a filled rectangle with a stroke round
it.

A new shape is never one the game already draws: check
`content/src/silhouettes.ts`, then take one from `tools/shape-sheet/src/drafts/`
or combine two, naming it. The lane lands under **a look the owner asked for by
name** and says so in the commit; it is proved by `render/test/frame.test.ts`;
and it goes to him as one PNG, never a description.
