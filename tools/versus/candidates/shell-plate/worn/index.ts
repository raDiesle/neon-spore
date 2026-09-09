import * as shellLook from "../../../../../packages/render/src/shell-look.js";
import { patch, type Variant } from "../../../variant.js";
import { worn, wornRim } from "./paint.js";

/**
 * `shell:plate` / `worn` — the armour is a lid a size too big, and what says it
 * is a solid is the dark in the gaps it leaves rather than the light on its
 * face.
 *
 * **What the shipped side is.** `drawPlate` cuts the body's contour in half,
 * fills it in one flat grey, strokes a hard rim round the outer arc and lights
 * three splits with the colour underneath. It is a good picture of the *rule* —
 * armour over a body, opening where it cracks — and it is the one hard surface
 * in the game with no thickness at all.
 *
 * **What this argues, and why it is not SLAB with the numbers turned down.**
 * SLAB and WORN agree that the plate has a thickness and disagree about which
 * end of the light to draw it with. SLAB adds: a wall, a face lit by its own
 * normal, and a specular that stays put while the body sways beneath it — three
 * marks, two of them bright. WORN adds nothing bright at all. The plate keeps
 * the flat dead fill it has today, and every mark this look makes is a
 * **shadow**, in the two places an oversize lid must have one.
 *
 * Under the rim: plating that stands off the body cannot let light in under
 * its own lip, so a band of dark hugs the outer edge from inside, deeper on
 * the half turned away from the key. And down the middle: if each half is a
 * size too big, the straight edge between them is a *gap* rather than a seam,
 * so the same dark is laid along the split — under the body's own light, which
 * then reads as something coming up out of a hole instead of a line drawn on a
 * plate.
 *
 * **The reason this can win a fight SLAB cannot.** Three of them, and they are
 * all about the field rather than about taste.
 *
 * At 26 px a bright mark and a dark mark are not the same size of risk. The
 * pair reads a colour off this creature — the cyan or the red coming out of the
 * splits is the thing a shot has to match — and SLAB's own card names the
 * danger that a specular starts competing for the eye with it. A shadow cannot
 * compete with a colour, because it is not one. It can only make the thing
 * beside it read louder, which here is exactly the split.
 *
 * It costs less. SLAB draws a linear gradient across the plate and a radial
 * one inside a second clip, per plate, per body, per frame; WORN draws two
 * strokes. This creature can be on the field several at a time with both halves
 * armoured, and a look that is two strokes is a look nobody has to measure.
 *
 * And it is the picture that survives being small. A gradient across a
 * twenty-six pixel plate is four or five distinguishable values; a dark band
 * two pixels wide against a flat plate is the same mark at any size, which is
 * the whole of what a phone asks of a look.
 *
 * The bared half comes with it, and it has to: the grey edge a chipped half
 * keeps is the same material as the plate beside it, so a look that moved one
 * and not the other would put a body on the field wearing two answers. Under
 * this account nothing is standing on the bare rim to cast into a gap, so it
 * keeps the dark line the departed plate wore into the body and loses the hard
 * grey it had while something bore on it — which is also the honest picture of
 * a half with no armour left.
 *
 * **How it can lose, and the pair should watch for exactly this.** *The body
 * gets muddy.* Every mark here subtracts, on a creature that is already the
 * darkest thing on the field — a dead grey plate on a near-black ground — and
 * three bands of shadow may turn a shell from a hard shape into a smudge with
 * a bright crack in it. The test is the silhouette: if the pair start finding
 * this body by its splits rather than by its outline, WORN has eaten the shape
 * it was meant to give thickness to. And a plate with no highlight anywhere on
 * it may simply read as *unfinished* beside every other hard surface the game
 * has adopted — `warden:plates` / `bevel` went into the game with a lit rim,
 * and a shell that refuses one is either a quieter answer or an inconsistent
 * one, which is a thing only a person looking at both can say.
 */
export const SHELL_WORN: Variant = {
  slot: "shell:plate",
  name: "worn",
  sentence:
    "the plating is a size too big — a band of shadow under its rim where no light gets in, and a gap down the middle the body's light comes up out of, with nothing bright added anywhere",
  dir: "tools/versus/candidates/shell-plate/worn",
  patches: [
    patch({
      target: shellLook.SHELL_LOOK,
      // No accessor: `shell-draw.ts` reads the export itself, twice per body
      // per frame. The module namespace is the whole route there is.
      reached: () => shellLook.SHELL_LOOK,
      where: {
        file: "packages/render/src/shell-look.ts",
        symbol: "SHELL_LOOK",
        type: "ShellLook",
      },
      fields: { plate: worn, bareRim: wornRim },
    }),
  ],
};
