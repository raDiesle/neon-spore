# Queue

The ordered work an unattended run walks. First in the file is next to be done.

It is not the outstanding list — `bun run checks` derives that from the
`Check:` trailers, and every row of it is an obligation somebody incurred by
landing something. It is not `docs/parked.md` either, which is ideas nobody
has decided on. This is the middle one: **decided, not yet done**.

An entry leaves by being **deleted**, once its branch is on `main`. Nothing
here is ticked, and nothing here records progress — a lane is done when its
branch is an ancestor of the trunk, which git can be asked and a file cannot.
`bun run burn` asks. `docs/autonomous.md` has the rest.

The italic line under each heading is `branch · the paths that lane owns`. Two
lanes may not own the same path. The files everything wants — `config.ts`,
`world.ts`, `canvas2d.ts`, `apps/game/src/main.ts` — are owned by nobody: add
to one in a single contiguous region and expect to replay over somebody else.

## THE BRIEFING BEFORE A WAVE
_claude/burn-briefings-b1 · packages/sim/src/briefing.ts packages/content/src/briefings.ts packages/render/src/briefing.ts docs/spec/briefings.md_

The first time a wave contains a creature or a control the pair has not met,
the round opens on a card that names it and says the one thing about it that
matters — and the card is *split*, so neither player can read the whole of it
alone. `docs/spec/briefings.md` is the design and none of it is built.

Finished when a fresh run of wave 1 shows the card, both players have to
dismiss it, and a second wave with the same creature does not show it again.
The "has met" set is world state, so it is in `hashWorld` or it desyncs.

## A FIELD WITH SOMETHING BEHIND IT
_claude/burn-backdrop-b2 · packages/render/src/backdrop.ts packages/render/src/field.ts docs/spec/graphics.md_

The field is a grid on flat black and it reads as a test rig. Give it a
back: drifting motes at two depths, a slow wash that belongs to the act, and
a horizon the grid pulse travels *over* rather than sits on. Render only —
nothing here may decide anything, and it must cost nothing a phone notices.

Finished when the field has depth at 26 px on a phone and the creatures still
read as the brightest thing on it. That last part is the whole risk, and only
an eye settles it: a `Check:` trailer, not a green tick.

## TWO CREATURES THE WAVES DO NOT HAVE
_claude/burn-creatures-b3 · packages/content/src/creatures.ts packages/sim/src/creature-rules.ts docs/spec/bestiary.md_

Three of twenty are built. Add the **Runt** — the one you must *not* shoot,
which turns a reflex into a decision — and the **Throb**, which answers to
timing rather than to a snap call. Both are in `docs/spec/bestiary.md` 10.1
and both are cheap: a control-visibility entry and a state machine.

Follow `.claude/skills/new-creature` exactly, including the communication test
and the replay test. Finished when both appear in an authored wave and
`bun run check` is green.

## THE FORK — A RUN THAT WAITS FOR BOTH THUMBS
_claude/burn-fork-b4 · packages/sim/src/fork.ts docs/spec/systems.md_

Between waves the run stops and continues only when both thumbs are down. It
is four lines of rule and it changes the shape of a session: the pause belongs
to the pair rather than to the clock, and it is where everything that wants to
be said between waves finally has somewhere to be said.

Finished when a wave cannot start with one thumb down, and the wait is visible
on both devices. It sits next to the briefing card on purpose — the card is
what the pause is *for*.

## THE OTHER HAND
_claude/burn-other-hand-b5 · packages/render/src/other-hand.ts docs/spec/roles.md_

Your hull shows that your partner's thumb is down, and never what it is doing.
A lobe brightens on your side of the ship when a control is held on theirs.
It is the cheapest possible presence — the thing every co-op game of this
shape has and this one does not.

Finished when holding a control on one device brightens a lobe on the other.
Whether it reads as *them* rather than as one more indicator is an eye's
question and gets a trailer.

## THE GAUGE — THE FIRST ROUND THAT IS NOT THE FIELD
_claude/burn-gauge-b6 · packages/sim/src/interlude.ts packages/sim/src/gauge.ts packages/render/src/gauge.ts docs/spec/interludes.md_

The smallest of the twelve interludes, and the one that has to go first
because it drags the shell in with it: a mode that is not the field, with its
own rules, its own controls and its own picture. One needle, two marks, one
player reading and the other turning.

**This lane runs alone**, between batches — it restructures the loop in
`apps/game/src/main.ts` and the world's idea of what a round is. Finished when
a gauge round can be entered, failed, passed and left, and the field comes
back afterwards with the wave intact.
