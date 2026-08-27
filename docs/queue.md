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

## THE VANE — THE BOSS THAT BENDS THE FIELD
_claude/burn-vane-b7 · packages/sim/src/vane.ts packages/render/src/vane-draw.ts docs/spec/transfers-bosses.md_

The one boss whose body is already drawn and whose mechanic nothing has spent:
an open contour with no inside, a pendulum arm sweeping the top of the field,
bending where a column *lands* rather than when it arrives. Every other boss
argues with the beat; this one argues with the geometry, which is the one
axis the pair has no vocabulary for yet.

`docs/spec/transfers-bosses.md` has the body and `docs/spec/bosses.md` the act
slot. Finished when a wave can carry it, its cycle is a table in code that the
director's boss panel reads, and a replay test pins a full cycle. Whether the
arm reads as a mechanism sweeping the top rather than as a weapon is an eye's
question and already has an outstanding check against it.

## THE OTHER HAND
_claude/burn-other-hand-b5 · packages/render/src/other-hand.ts docs/spec/roles.md_

Your hull shows that your partner's thumb is down, and never what it is doing.
A lobe brightens on your side of the ship when a control is held on theirs.
It is the cheapest possible presence — the thing every co-op game of this
shape has and this one does not.

Finished when holding a control on one device brightens a lobe on the other.
Whether it reads as *them* rather than as one more indicator is an eye's
question and gets a trailer.

**Behind THE FORK, not beside it.** "Whose thumb is down" is the state the
fork lane is putting in the world, and two lanes inventing it separately would
land two answers to one question.

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
