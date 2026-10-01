import { type UndertowLobe, type UndertowState, undertowEbbing, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { markAt } from "./boss-cue-frame.js";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";

/**
 * **What THE UNDERTOW is asking for** — page ten of the readings, its own
 * page for THE BATON's reason (`boss-cue-read-i.ts`).
 *
 * Every rule is `boss-cue.ts`'s, and the one that decides every line below is
 * the first: **a cue is drawn on the seat that can act.** A lobe's colour is
 * its answer (`sim/undertow-press.ts`): a yellow one is taken by the maw open
 * under it, which is the pilot's column and the pilot's press; a cyan one by
 * the shield armed under it, which is the navigator's column and the pilot's
 * press. A tall one is either seat's tap.
 *
 * **A bowing plate says nothing.** It is a warning and not yet a question —
 * the lobe it becomes stands for `undertowStandBeats` — and nobody is held in
 * place while it bows, so there is no thumb to ask for. **Nor does the ebb**:
 * the level is won, and what is left is shrinking back without anyone.
 *
 * The words are the buttons' own (`content/controls.ts`): `SUCK`, `SHIELD`,
 * and `TAP` for the lobe itself, which has no button.
 */

/**
 * **`MOVE`, on the carriage where it stands** — never on the place it is
 * wanted. The lobe is drawn on both screens, and a frame saying `MOVE` beside
 * it would be the field answering *which column*, the sentence the pair says
 * out loud (#34).
 */
function moveCannon(l: Layout, world: World, seed: number): BossCue {
  return markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, seed);
}

function moveShield(l: Layout, world: World, seed: number): BossCue {
  return markAt(2, "CARRY", "MOVE", tileCX(l, world.shieldCol), l.hullY, l, seed);
}

export function undertowCues(
  l: Layout,
  world: World,
  u: UndertowState,
  skinY: SurfaceY,
): readonly BossCue[] {
  if (undertowEbbing(u)) return [];
  const out: BossCue[] = [];
  for (const b of u.lobes) {
    if (b.stage === "bowing") continue;
    // A tall one first: it is the one about to burst and take the level.
    if (b.stage === "tall") out.unshift(...tall(l, b, skinY));
    else out.push(standing(l, world, b, skinY));
  }
  return out;
}

/** A tall lobe: the tap, on its crown's foot, to both seats — either may bring it down. */
function tall(l: Layout, b: UndertowLobe, skinY: SurfaceY): BossCue[] {
  const x = tileCX(l, b.col);
  const y = skinY(x);
  return [
    markAt(1, "PRESS", "TAP", x, y, l, 60 + b.col),
    markAt(2, "PRESS", "TAP", x, y, l, 80 + b.col),
  ];
}

/**
 * A standing lobe: the carriage its colour asks for, then the press. On the
 * skin the lobe comes through, which is the place the word is about
 * (`BossCue.wordFloor` keeps the verb out of the plating).
 */
function standing(l: Layout, world: World, b: UndertowLobe, skinY: SurfaceY): BossCue {
  const x = tileCX(l, b.col);
  const y = skinY(x);
  if (b.answer === "maw") {
    return world.cannonCol === b.col
      ? markAt(1, "HOLD", "SUCK", x, y, l, 44 + b.col)
      : moveCannon(l, world, 44 + b.col);
  }
  return world.shieldCol === b.col
    ? markAt(1, "PRESS", "SHIELD", x, y, l, 44 + b.col)
    : moveShield(l, world, 44 + b.col);
}
