import type { HintAnchor, SceneAnchor } from "@neon-spore/content";
import type { Creature, World } from "@neon-spore/sim";
import { showsBlisterBulge } from "./blister.js";
import { showsGhostBody } from "./ghost.js";
import type { Layout } from "./layout.js";
import { showsMine } from "./mine.js";
import { showsWisp } from "./wisp.js";

/**
 * **What a hint may know about the screen it is drawn on** — which bodies it
 * shows, and whose secret it is drawn. Split from `wave-hint.ts` at its length
 * ceiling, along the one seam in it that asks the drawing rather than the world.
 *
 * Which seat is shown what is each body's own file's answer; this only asks
 * them, so a line can never know more than the screen it stands on.
 */

/**
 * The world as this screen draws it: a body the seat is not shown is taken
 * out, so no ring lands on it — round it, or round it as the body over the
 * cannon (`guide-tide-companion.ts`). A film could ring the place a ghost was,
 * and say so; a live ring round it would hand player 1 the column he has to be
 * told.
 */
export function seenOn(l: Layout, world: World): World {
  const shown = (c: Creature) => bodyShown(l, world, c);
  if (world.creatures.every(shown)) return world;
  return { ...world, creatures: world.creatures.filter(shown) };
}

function bodyShown(l: Layout, world: World, c: Creature): boolean {
  if (c.kind === "ghost") return showsGhostBody(l, world.cfg, c);
  if (c.kind === "wisp") return showsWisp(l);
  if (c.kind === "mine") return showsMine(l, c);
  return true;
}

/**
 * Whether this screen is drawn the thing about `c` one seat has to say — the
 * body itself where only one seat sees it, a blister's bulge — or `null` for a
 * body with no such thing, which is the same on both screens.
 */
export function secretShown(l: Layout, world: World, c: Creature): boolean | null {
  if (c.kind === "blister") return showsBlisterBulge(l, c);
  if (c.kind === "ghost" || c.kind === "wisp" || c.kind === "mine") return bodyShown(l, world, c);
  return null;
}

/**
 * A line's subject on this screen, and the world to find it in. `fire` is the
 * button in the next body's colour; `secret` is the lowest body with a secret
 * this screen draws or keeps, found in a world of that body alone, so a ring
 * meant for a blister cannot land on the bulb above it. Nothing, where there
 * is no such thing on the field. Every other subject is a film's.
 */
export function hintSubject(
  l: Layout,
  seen: World,
  anchor: HintAnchor,
  next: Creature | null,
): { anchor: SceneAnchor; world: World } | null {
  if (anchor.at === "fire") {
    if (next === null) return null;
    const control = next.color === "red" ? "fireRed" : "fireCyan";
    return { anchor: { at: "control", control }, world: seen };
  }
  if (anchor.at === "secret") {
    let low: Creature | null = null;
    for (const c of seen.creatures) {
      if (secretShown(l, seen, c) !== null && (!low || c.row > low.row)) low = c;
    }
    if (low === null) return null;
    return { anchor: { at: "body" }, world: { ...seen, creatures: [low] } };
  }
  return { anchor, world: seen };
}
