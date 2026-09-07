# A look is offered, never replaced

The rule and its three exemptions are in `CLAUDE.md`. This is the owner's
reasoning for it, in their own words, and the mechanism a look is offered
through.


**Nothing run unattended changes what the game already draws.** A new colour, a
new animation, a rounder rock, a different fire opening: every one of them is
an *alternative*, offered beside the shipped look on the NOT BUILT YET pages,
and the owner decides. Throw it away, improve it, or adopt it and retire the
old one — that is their call and it is made by looking, which is the one thing
no session can do.

The owner said why, and it is not caution about quality:

> whenever i asked for generic alternative graphics or animations, my idea was
> to document them in "not done yet" so i can evaluate them and then decide
> myself if we take it to override with current defaults. […] i dont want to
> make visuals worse. when i finegrain improve visuals myself after collecting
> ideas and variants, i will do this in non autonomous burn queued way and step
> by step.

So the run's job is to *collect* looks, not to pick between them. A batch that
lands four visual changes has spent the owner's four decisions for them, and
the only evidence it had was that each one seemed better to the session that
wrote it.

**The test is what a player would see.** If a change would show up in a frame
of the running game — the hull, a creature, a rock, a shot, the shield, a
colour, the timing of an animation — it is a look, and it goes to VERSUS or to
a NOT BUILT YET card, never straight onto the field. If it would not show up in
a frame — a refactor, a speed fix, a test, a tool, the director — the rule does
not apply and the work lands as usual.

**Three things this does not forbid**, because a rule that blocks them would be
read around within a day:

- **A look the owner asked for by name.** They asked for shadow and light in
  the game; that is a decision they have already made, and it lands. The rule
  is about looks a *session* decided to change.
- **A look with no shipped alternative.** Something being drawn for the first
  time is not replacing anything, and there is nothing to compare it against.
- **A fix to something that is wrong rather than to something that is
  unlovely.** A highlight glued to a spinning rock, a fringe that has come off
  its body, a shape that clips its own frame — these are defects, and a defect
  is repaired rather than offered as an option beside itself. Say in the commit
  which of the two you decided it was; that sentence is the whole guard against
  this exemption eating the rule.

**Where an alternative goes.** `tools/versus/candidates/` when the shipped
thing is a record the draw path reads — the pair draws both on two phones at
tempo and the vote emits a prompt that applies the winner. A NOT BUILT YET card
when it is not yet that concrete. `docs/versus.md` has the mechanism.

**And a lane that finds itself about to improve a look mid-task stops.** That
is a second lane and an owner decision, not a tidy-up on the way past. Put it
in the report.


## A drawn picture is built by looking at it

**SVG written blind comes out thin, every time.** A session cannot see what it
wrote, so it stays inside the shapes it can predict from the coordinates
alone — four or five paths, one gradient, two keyframes — because without a
look every extra element is a risk rather than an improvement. The owner named
it on 7 September 2026, holding a picture drawn here beside an SVG another
model had given him: much more detailed, and drawn by something that was not
being more careful, only less blind. Nothing about file size or frame cost is
at stake. A phone renders far more than any of these files contain.

So a picture is rendered and corrected rather than emitted once. Numbers first,
because `bun run shapes:report` catches a clipped contour or a bad proportion
for a fraction of what an image costs; then one still through `bun run png`,
**read** and not merely written; then a correction, and a second look. Two or
three rounds, and stop — the returns fall off and the cost does not.

**A reference in the conversation is the density to meet.** If the owner has
attached an SVG, count what it actually contains before drawing beside it.

`.claude/skills/svg-look` holds the loop and the craft.
`tools/hooks/after-svg-edit.ts` says so at the moment a drawing file is edited,
once per file per session, and it cannot tell a picture from an explanatory
diagram — a diagram is exempt and plain is right for it. The skill's own
description is what a session sees first, which is why the rule lives here and
in that description rather than in `CLAUDE.md`, whose size ceiling it does not
fit under.
