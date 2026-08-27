# What the game is

> **Status: built in outline.** The core sentence, the two-player premise and
> the speech rule hold for the running prototype. The setting is space; the
> fiction below is the part that has moved and is not fully worked through —
> see [Open questions](open-questions.md).

A co-op game for **exactly two people on two separate devices** (same room or
remote). Mobile web app, portrait.

Together you steer one fragile shell through a swarm of glowing creatures.
**Neither of you sees everything, neither of you can operate everything.**
Almost every threat demands that both act at the same time, or in a fixed
order.

Reference points: Spaceteam (the order arrives at the wrong person), Lovers in
a Dangerous Spacetime (split roles), Keep Talking and Nobody Explodes
(asymmetric information). Spaceteam is the closest comparison.

**It Takes Two, and its successor Split Fiction**, are a reference for a
different thing, and it is worth naming separately because it is not what the
three above are for. Those three are about two people operating one machine,
which is what this game *is*. Hazelight's two are about never operating the
same machine twice: a level hands the pair a pair of verbs, spends them, and
throws them away, and both games are full of short self-contained rounds —
minigames, side stories — with their own rules, their own controls and their
own picture. Nothing about the swarm, the hull or the columns comes from them.
The shape of a round does. See [transfers-hazelight](transfers-hazelight.md)
for the reading and [interludes](interludes.md) for what this game would do
with it; [THE MIRROR](bosses.md) is the one round the game already has that
works this way, and it was not called that when it was built.

**The core sentence: talking is not a help, it is the control scheme.**

## The setting

Space. Neon Spore is not underwater. The field is the void, the swarm drifts
through it, and the hull is the last thing between the two of you and it.

The forms are **blobs and slimes** — soft, closed contours that wobble and
pulse. The maths is in `packages/content/src/shapes.ts`: `blobPath` builds a
closed Catmull-Rom spline through points whose radius is modulated by a number
of **lobes**, and the hull is the same construction with the cannon and the
shield as bumps on one contour (`hullRadiusMul`, `bumpAdd`). Lobe is the fixed
word for these; do not invent synonyms.

**This is a change of setting, not just of wording.** The German original was
written for an ocean: "you are a bubble in an ocean full of animals", colour is
bioluminescence, the meteor is indestructible because it does not live. Those
justifications were marine, the bestiary is sea life, and
`packages/render/src/field.ts` still calls its background "deep-water". The
design survives the move — the couplings do not care what the backdrop is — but
the fiction has not been rewritten to match. What clashes is listed in
[Open questions](open-questions.md).

## The name

*Neon Spore.* The working title through the whole German original was **SIGNAL
BLOOM**; wherever a historical document says that, it means this game. See
`docs/decisions.md` #1. A trademark and app-store search has still not been
done.

## 1.1 The guiding question for every new idea

Not: "how can an enemy be harder?"

But: **"what do two people have to newly understand about each other in order
to beat this enemy?"**

## 1.2 NON-NEGOTIABLE — speech is never evaluated

The game reads no microphone, recognises no speech, evaluates neither words nor
volume nor tone, and does not check whether anything was said at all. It
processes inputs only: which, from whom, at what local moment, in what order,
in which sync window.

Communication stays human, control stays digital.

**Consequence:** every mechanic and every statistic that would need to know
whether or what was spoken is out of scope. This is rule 4 in `CLAUDE.md` and
it is not up for discussion.
