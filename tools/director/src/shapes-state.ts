/**
 * What every card on the SHAPES tab is wearing: one skin, one light, one forced
 * motion, and three stacks of effects — for the whole page rather than per card.
 *
 * **A leaf, and that is the point.** The axes that read and write this state
 * used to reach for it in `shapes-pair.ts`, which re-exports the control bar
 * that builds those axes — a runtime cycle that worked only because everything
 * in it is called after module evaluation, and would have broken the first time
 * anything read a value at module scope. The state moved down here instead, the
 * way `shapes-build-state.ts` already holds BUILD's, so the graph runs one way:
 * the page imports the controls, the controls import the axes, the axes import
 * this, and this imports nothing of the director's but types.
 * `tools/director/test/import-cycles.test.ts` fails if that stops being true.
 *
 * Nothing outside this file may write this state; the setters below are the
 * only way, and the axis rows are the only callers.
 *
 * **Six axes now, and the last three are the odd ones.** GLOW, HIT and TAIL are
 * *sets* rather than picks — a body wears any number of each at once — so they
 * are the state here that is plural, and a `toggle` rather than a setter is how
 * each moves. `glows/index.ts` says why an axis that stacks could not simply
 * have been more skins.
 */

import type { OwnMotion } from "@neon-spore/content";
import type { CatalogueEntry } from "@neon-spore/shape-sheet";
import type { GlowId } from "./glows/index.js";
import type { HitId } from "./hits/index.js";
import type { SkinId } from "./skins/index.js";
import type { TailId } from "./tails/index.js";

/**
 * Which skin every card is wearing. MEMBRANE rather than LINE, because the
 * outline is the control and a control is switched *to*.
 */
let skinA: SkinId = "membrane";

/**
 * Whether the key light is on, for every card at once — orthogonal to the
 * skins. It was once a skin among the others, satisfied by clicking CORE. TURN
 * and CRATER end that: they compose the light into a different base texture,
 * so switching away to see one unlit compares two textures rather than the
 * light.
 */
let lit = true;

/**
 * Which own-motion drives every card, overriding each card's own. `undefined`
 * is a real choice ("OWN") and not the absence of one — it is the behaviour
 * before this bar existed, and it is the default so nothing moves differently
 * until something is picked.
 */
let motion: OwnMotion | undefined;

/**
 * Which glows every card wears — a **set**, not a pick, and the one axis on
 * this page whose state is plural.
 *
 * A skin is exclusive and a glow stacks: BLOOM and TRAIL and AURA are all on
 * at once in any real engine, and the combination is what the owner opens the
 * page to judge. `glows/index.ts` has the whole argument.
 *
 * Empty by default, and that is a real choice rather than the absence of one —
 * the same reasoning `motion` above is `undefined` by default for. Nothing on
 * the sixty-card catalogue may look different until somebody ticks something,
 * and NONE is the picture every value on the axis has to beat.
 */
let glows: GlowId[] = [];

/**
 * Which hits every card wears. A set, like `glows` — an impact is three or
 * four simple layers stacked rather than one picked, which is the received
 * wisdom of the field and is also why this axis is ticks and not buttons.
 *
 * Empty by default. Unlike a glow, a hit draws nothing at all between
 * triggers, so a card wearing the whole stack still looks untouched until
 * `shapes-trigger.ts`'s clock fires — which means the default costs nothing
 * either way and NONE is still the honest starting point.
 */
let hits: HitId[] = [];

/**
 * Which tails every card wears — what it leaves behind on its way down.
 *
 * Empty by default like the other two stacks, and for a sharper reason here:
 * two of the values on that axis are *what the game already draws*, so a
 * default of anything else would be the page quietly proposing a change.
 */
let tails: TailId[] = [];

/** What actually drives a card, so a caption can name it rather than guess. */
export function driving(entry: CatalogueEntry): OwnMotion | undefined {
  return motion ?? entry.motion;
}

/** The skin the whole page is currently wearing. */
export function currentSkin(): SkinId {
  return skinA;
}

/** Whether the key light is currently on. */
export function currentLit(): boolean {
  return lit;
}

/** The motion currently forced on every card, or `undefined` for OWN. */
export function currentMotion(): OwnMotion | undefined {
  return motion;
}

/** Sets the whole page's skin. The only writer besides `controlBar` itself. */
export function setSkin(id: SkinId): void {
  skinA = id;
}

/** Flips the key light for the whole page. */
export function toggleLit(): void {
  lit = !lit;
}

/** Forces (or, given `undefined`, releases back to OWN) the motion driving
 * every card. */
export function setMotion(m: OwnMotion | undefined): void {
  motion = m;
}

/** The glow stack every card is currently wearing, in registry order. */
export function currentGlows(): readonly GlowId[] {
  return glows;
}

/**
 * Turns one glow on or off, leaving the rest of the stack alone.
 *
 * A new array rather than a splice in place, because `currentGlows` hands the
 * array out and `shape-figure.ts` keeps no copy of it — mutating the one the
 * last render read would make a rebuild the only way to tell what changed.
 */
export function toggleGlow(id: GlowId): void {
  glows = glows.includes(id) ? glows.filter((g) => g !== id) : [...glows, id];
}

/** Takes the whole stack off. NONE is a choice, and it is the control. */
export function clearGlows(): void {
  glows = [];
}

/** The hit stack every card is currently wearing, in registry order. */
export function currentHits(): readonly HitId[] {
  return hits;
}

/** Turns one hit on or off, leaving the rest of the stack alone. A new array
 * rather than a splice, for the reason `toggleGlow` gives. */
export function toggleHit(id: HitId): void {
  hits = hits.includes(id) ? hits.filter((h) => h !== id) : [...hits, id];
}

/** Takes the whole stack off. */
export function clearHits(): void {
  hits = [];
}

/** The tail stack every card is currently wearing, in registry order. */
export function currentTails(): readonly TailId[] {
  return tails;
}

/** Turns one tail on or off, leaving the rest alone. */
export function toggleTail(id: TailId): void {
  tails = tails.includes(id) ? tails.filter((x) => x !== id) : [...tails, id];
}

/** Takes the whole stack off. */
export function clearTails(): void {
  tails = [];
}
