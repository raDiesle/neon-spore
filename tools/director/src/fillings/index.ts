import type { SkinContext } from "../skins/types.js";
import { BLOOM } from "./bloom.js";
import { CHAMBERS } from "./chambers.js";
import { FILAMENT } from "./filament.js";
import { GUT } from "./gut.js";
import { HELIX } from "./helix.js";
import { HOLLOW } from "./hollow.js";
import { LANTERN } from "./lantern.js";
import { LATTICE } from "./lattice.js";
import { NUCLEUS } from "./nucleus.js";
import { ORBIT } from "./orbit.js";
import { ROE } from "./roe.js";
import { SEDIMENT } from "./sediment.js";
import { SPORES } from "./spores.js";
import { VENT } from "./vent.js";
import { VORTEX } from "./vortex.js";
import { YOLK } from "./yolk.js";

/**
 * Everything a body can have **in** it.
 *
 * The seventh axis on SHAPES, and the owner asked for it by name on
 * 9 September 2026: he read eight interiors on the ALTERNATIVES page, took one
 * of each pair into the game, and said of the rest that he liked them a lot and
 * wanted them moved to the shapes page — *maybe new category like filling*.
 * `types.ts` has the argument for why it is its own axis and not eight more
 * skins; the short version is that SKIN is what a body is *made of* and this is
 * what it *contains*, which is the same line `body-interior.ts` draws in the
 * game.
 *
 * ## Three of these are the game
 *
 * `SPORES`, `BLOOM` and `ORBIT` carry `shipped`: they are what a bulb, a slick
 * and the gyre's organelle wear on the field, each taken there the day the
 * answers beside it came here. They are on the axis **as controls**, because a
 * proposal judged against a memory of the shipped look wins every time.
 *
 * ## The order
 *
 * The two shipped first, then the four written for a round body, then the four
 * written for a two-sac one — which is roughly least to most furniture, and
 * puts the pairs that argue with each other next to each other. CHAMBERS and
 * NUCLEUS disagree about whether an interior is a population or one object;
 * ROE and GUT disagree about whether a body is contents or anatomy; LATTICE
 * disagrees with all four about whether it is wet at all. Last, the two that
 * came from the ghost on 11 September 2026 — LANTERN and HOLLOW, the same body
 * as a solid and as a shell, bright toward the key and bright away from it —
 * which disagree about whether the body has an inside to see at all. Then
 * the four from the gyre, the same day: the owner liked every answer to that
 * slot *and* the one it had, and wanted all of them kept *to create new
 * upcoming enemies with this inside effect* — ORBIT, the one he took, with
 * YOLK, HELIX and VORTEX after it.
 *
 * ## NONE is a value and is not in here
 *
 * Most bodies in this game have never been drawn with anything inside them, and
 * that is the picture every value here has to beat. The switcher spells it out
 * (`shapes-axes.ts`); an empty id is what it sets.
 */
export const FILLINGS = [
  SPORES,
  BLOOM,
  CHAMBERS,
  NUCLEUS,
  VENT,
  FILAMENT,
  ROE,
  GUT,
  SEDIMENT,
  LATTICE,
  LANTERN,
  HOLLOW,
  ORBIT,
  YOLK,
  HELIX,
  VORTEX,
] as const;

/** The id of a filling that exists, derived from the registry and never typed. */
export type FillingId = (typeof FILLINGS)[number]["id"];

export type { Filling, FillingContext, FillingFrame } from "./types.js";

/**
 * Build the picked filling into the figure, or nothing at all.
 *
 * One pick and not a stack, so this takes an id rather than a list: a body has
 * one inside. Called after the skin and before the glows that go over it —
 * what is in a body is under its own wall in every value here, and the clip
 * each one opens is to the same contour.
 */
export function buildFilling(id: FillingId | undefined, ctx: SkinContext): void {
  if (id === undefined) return;
  for (const f of FILLINGS) if (f.id === id) f.build(ctx);
}
