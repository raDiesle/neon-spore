# Art review

The checklist a proposed asset goes through before it is offered. Run it on
anything a player would see: a creature, a boss, a part, a skin, a glow, an
interlude's furniture, an icon, a VERSUS candidate, a NOT BUILT YET card.

`docs/style-guide.md` is what it is checking against. This file is the
questions, in the order that fails cheapest first.

**Two rules about the checklist itself.** A question answered "no" is not a
veto — it is a thing to say out loud in the report, so the owner is deciding
about it rather than discovering it. And a question that had to be *argued*
rather than answered is a rule the style guide is missing; add it there.

## 0 · Before anything is drawn

- **Is this a look that is already shipped?** If something on the field
  already does this job, what you have is an *alternative*, and it goes to
  `tools/versus/candidates/` or a NOT BUILT YET card — not onto the field.
  The three exemptions are in `CLAUDE.md`; name the one you used, in the commit.
- **Does the idea have a sentence?** A wave has a one-sentence test; a body
  should survive one too. "A ball on a stalk that shows which way it is
  pointing" is a creature. "A cool alien thing" is padding.
- **Is there already a shape for this?** `docs/asset-catalogue.md` has three
  dozen drawn contours waiting for an idea, and `bun run shapes:parts` prints
  sixty secondary forms. Spending one costs a card; inventing one costs a
  radius function nobody else can call.

## 1 · Does it read

- **Does the silhouette say one word, filled in solid black?** If the answer
  needs the interior, the interior is doing work the silhouette must do.
- **What is it told apart from, and on which axis?** Lobe count, aspect, drawn
  size — name the neighbour and the axis. Two kinds separated on one axis alone
  is the narrowest margin in the game and `nameability.ts` will say so.
- **Does it survive its own drawn size?** Run `bun run shapes:report` before any
  picture. Under 20 px a figure is not a figure; under 11 px nothing survives.
- **Would the pair say the same word about it on both phones?** They are looking
  at the same body across a two-second delay. A shape that is ambiguous is a
  shape that costs them a turn.

## 2 · Does it belong here

- **Is it a closed contour with lobes**, or has it arrived from a different
  geometry? Corners, straight runs and bilateral symmetry all belong to the
  dead things — rock, crystal, machinery — and to nothing alive.
- **Is it a member of the material language?** Membrane, carapace, glass/nacre,
  flesh, stone, current. A seventh material is a decision to put in the report,
  not a texture to reach for.
- **Is it unfilled and lit from `KEY`?** A solid fill and a private light angle
  are the two things that make a body look like it came from another game.
- **Does the fill stop short of `background`?** A gradient that reaches the
  ground opens a hole in the outline.

## 3 · Colour

- **Is every colour in `PALETTE`?** A hex typed next to a `fillStyle` is a
  colour nobody can find again.
- **If it is a new hue: what angle, and what is on either side of it?** It goes
  in a gap and touches neither neighbour. It arrives as a triad — body, rim,
  deep.
- **Could it be mistaken for ammunition?** Anything near `red` 345° or `cyan`
  186° on something that cannot be shot is a mark saying *load this* on the one
  body nothing can be fired at.
- **Is it green?** Then it needs the owner's name on it. Green is the round
  answered in full, and the three granted exceptions each stay apart by hue and
  by where they appear.
- **Is it a neutral on something a player must describe out loud?** Grey says
  "nothing to report" and is the wrong answer for a body somebody has to name.

## 4 · Light and glow

- **Does the glow carry state, or is it decoration?** If turning it off says
  nothing, it is spending the field's brightness budget for nothing.
- **Would it still read when the light goes out?** A body shot in the wrong
  colour is a grey outline. Anything that only works lit is invisible at the
  moment the pair most needs to see it.
- **Is the aura around the line rather than in it?** Three passes at spread 5,
  never a thicker stroke and never `shadowBlur`.
- **Is it now the brightest thing on the field?** Only creatures may be.
- **If it claims depth, does it have both halves?** A width cosine with no
  shading is a coin; a fixed light on a body that does not move is a still life.
  Neither reads alone, and a session judging one half concludes both fail.
- **Is it lit from `KEY`?** Never a private angle. Six bodies inventing six
  angles is one page lit six ways.
- **If something has to come out from behind, is it placed rather than posed?**
  An affine moves every mark at one rate — 1.10 : 1 against a real turn's
  22.9 : 1 — so a pose cannot reveal anything, at any amplitude. Surface
  features go by longitude and latitude, the way `turn.ts` does it.
- **Does the depth motion eat the nameability axis?** TURN IN DEPTH moves drawn
  aspect ×1.82 and the round kinds differ by less. Fine on a card at 92 px,
  unproven at 26 px, and the gate decides — not the picture.

## 5 · Motion

- **Does it move off `world.beat`?** `performance.now` desyncs two phones.
- **What is in unison and what is offset?** Landing and gather in unison,
  everything else phase-offset per body. All-in-unison is one flat object;
  all-offset is a lie about the game's only rule.
- **Does the contour stay frozen under reaction?** Pose impulses and light may
  move; the six contour numbers may not. A silhouette that changes shape when
  it flinches is a silhouette that means two words.
- **Does a reaction have a cause a player can point at?** And is it proportional
  to it?

## 6 · If anything collides with it

Only for an interlude with physics in it — the field has no travel and nothing
on it bounces.

- **What primitive is it?** A peg or a block. If the answer is "its outline",
  the asset cannot ship: the sim collides in integer thousandths and the drawn
  contour is a float spline.
- **Does the silhouette promise that primitive?** Round reads as a peg, boxy as
  a block. A drawn spike the ball passes through is found out by losing.
- **Does anything drawn move the bounce?** The picture may breathe; the
  half-extents may not. A wobble that changed a deflection is render reaching
  into the sim.
- **Is it drawn thinner than `PIN_THIN_MILLI` lets it collide?** Then it is
  inviting a shot the physics will refuse.
- **Does it say whether it is a target or scenery?** That is colour and glow's
  job, never shape's — scenery still bounces.

## 7 · Complexity and cost

- **Is the detail at a size that resolves?** Interior work on a 26 px creature
  is spent; interior work on a boss is the point.
- **Is anything drawn twice?** A contour comes from `shapes.ts`, a light zone
  from `light.ts`, a part from the parts registry. A second copy drifts.
- **Does it need a `bun run perf` run?** A new shape or a new animation does.
  Measure only the waves it appears in — and never in a cloud session, where it
  does not finish.
- **Does it stay inside the file ceiling?** Past ~250 lines, split.

## 8 · Afterwards

- **Was it actually looked at?** One PNG, rasterised and *read*, not merely
  written. Two or three rounds, stopping when consecutive looks find the same
  thing at different strengths — that is tuning, and tuning is the owner's.
- **Did it settle a rule?** Then `docs/style-guide.md` gets it, in the section
  it belongs to, replacing what it contradicts.
- **Did it need a rule that does not exist?** Say so in the report. That is the
  one thing this checklist cannot decide for itself.
