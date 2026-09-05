import { CREATURES } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import type { CreatureKind } from "@neon-spore/sim";

/**
 * What one brush's **card** says: the colour it is stroked in, the shape-sheet
 * subjects it draws, and the one line under its name.
 *
 * Split out of `brushes.ts` when THE RECOIL took that file past its 250-line
 * limit, and along a seam that file already had: next door is what a brush
 * *is* — which kinds are placeable, which rock a rock brush paints, what a
 * brush resolves to as a `CreatureKind` — and this is what one **looks like**
 * in the palette. Both halves grow by a line per creature, and only this one
 * grows by a paragraph.
 */

/** The stroke a living creature's card is drawn in — its own colour, or the
 * neutral one `render/creatures.ts` gives anything that carries none. */
export function livingStroke(kind: CreatureKind): string {
  const color = CREATURES[kind].color;
  if (color === "red") return PALETTE.red;
  if (color === "cyan") return PALETTE.cyan;
  return PALETTE.dim;
}

/**
 * The shape-sheet cards a brush's own card draws. A kind's own name for every
 * kind but three, and all three exceptions are one fact: a lure has no contour
 * of its own — it is drawn as the body it wears — so its card draws both, the
 * way a two-subject brush already means "this resolves to either".
 * `livingKinds` in the sheet leaves it out for the same reason, and a card
 * here naming "LURE" would draw a blank.
 *
 * A clasp and a shell are the others, and both are the same fact again. Each
 * is drawn as the slick or the bulb inside it — a membrane over the top for
 * one, plating for the other — and neither a membrane nor a plate is a
 * contour, so the sheet has no CLASP or SHELL card and a brush asking for one
 * would draw a blank. Which of the two each resolves to is the authored
 * colour, exactly as it is for a lure: `claspBecomes` and `shellBecomes` are
 * the same call.
 */
const TWO_BODIED: readonly CreatureKind[] = [
  "lure",
  "clasp",
  "shell",
  "veil",
  "echo",
  "rind",
  "recoil",
  "gyre",
  "carom",
  "chute",
  "volley",
  "strand",
];

export function cardSubjects(kind: CreatureKind): string[] {
  // A veil is the fourth, and the plainest case of the rule: the cloud is
  // weather laid over a slick or a bulb (`render/veil.ts`), so the sheet has
  // no VEIL contour to draw and the card resolves to the two bodies that can
  // be inside one. Unlike the other three it is not the *wave* that decides
  // which — the roll happens when the arrival enters the field — so "either"
  // is not a shorthand here, it is the whole truth about the brush.
  // THE ECHO is the fifth, and the one with nothing over the body at all: it
  // is a slick or a bulb drawn small (`livingBodyMul` in render/), so the
  // sheet has no ECHO contour either and the card resolves to the two bodies
  // one can be. Which of them is the authored colour, as it is for a lure.
  // THE RIND is the sixth, and the echo's case with the size the other way
  // round: it is a slick or a bulb drawn one footprint per layer it still
  // wears, so the sheet has no RIND contour either and the card resolves to
  // the two bodies one can be. Which of them is the authored colour again.
  // THE RECOIL is the seventh, and the one place "either" is literal rather
  // than shorthand: a slick or a bulb in a cage, arriving in the authored
  // colour and turned over to the other by every bounce (`recoilStruck`).
  // THE GYRE is the eighth, and the only one that is not a body wearing
  // something. It is an armature — a rim, six spokes and a hub, drawn by
  // `render/gyre.ts` — so the sheet has no GYRE contour to draw either, and
  // what the brush actually *places* is six bodies: three slicks and three
  // bulbs, alternating round the rim (`mountColor`). So the card resolves to
  // both for a different reason from the six above, and says the true thing
  // about the brush rather than about the kind.
  //
  // A list rather than a chain of `===`, now that there are eight of them —
  // `UNGRIPPABLE` in sim/kinds.ts made the same move at six, and for the same
  // reason: a chain that long is one somebody extends by pattern instead of by
  // argument, and every one of these eight is an argument.
  if (TWO_BODIED.includes(kind)) return ["SLICK", "BULB"];
  return [kind.toUpperCase()];
}

/**
 * The one line the palette shows under a brush's name: the single thing that
 * tells it apart at a glance, not what it does once it is on the field.
 *
 * A brush's own sentence used to be `CREATURES[kind].blurb`, which is written
 * for the first-appearance preview — three clauses, everything true about the
 * creature. Twenty of those stacked in a strip is a wall nobody reads, and the
 * question being asked of the palette is only ever "which of these is the one
 * I mean". The blurb is still on the hover card (`detail` below), where there
 * is room for it and where somebody has stopped to ask.
 *
 * A kind with no line here falls back to its blurb, so a creature added to
 * `CREATURES` still gets a brush that says something; `brushes.test.ts` fails
 * if that fallback is what the palette ends up drawing, since a long sentence
 * is exactly what this table exists to keep out of it.
 *
 * Keyed by `CreatureKind` rather than by `Brush`, which it used to be. Every
 * key in it is a creature — the pod brushes and ERASE carry their notes inline
 * in `BRUSHES`, because a note about a tool is not a note about a body — so the
 * narrower type is the true one, and it is also what keeps this file from
 * importing `Brush` back out of `brushes.ts` and closing a module cycle.
 */
export const SHORT_NOTE: Partial<Record<CreatureKind, string>> = {
  slick: "shot with the red cannon",
  bulb: "shot with the cyan cannon",
  lure: "do not shoot it",
  strand: "beads on a thread; only p2 sees which end is next",
  crawler: "walks the ship; shoot the colours, ward the plates",
  throb: "half colour, half plating, turning as it falls",
  shell: "shoot the armour away first",
  clasp: "ward it, then shoot",
  dart: "steps sideways; only p2 sees which way next",
  veil: "p2 does not see what is inside",
  wisp: "p1 cannot see it; hops tiles and never falls",
  ghost: "p1 cannot see it — say the column",
  echo: "splits",
  rind: "starts bigger, shrinks when shot",
  recoil: "a hit knocks it back up and flips its colour",
  carom: "bounces off the walls; shoot it, then ward the rock",
  chute: "what a cracked carom throws out — it goes up, then drifts back down",
  volley: "ward it three times, then shoot what hatches",
  gyre: "a wheel of six bodies; the maw slows it",
  lid: "p1 holds its cord open, p2 shoots the lens",
  veer: "a rock that steps a lane 3x; only p1 sees which way",
  torch: "p1 calls the column, p2 wards — the fastest rock",
};
