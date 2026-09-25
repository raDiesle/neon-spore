import { darkView } from "./dark-field.js";
import type { ViewState } from "./renderer.js";

/**
 * **A frame with the bodies neither screen may draw taken out of it.**
 *
 * THE REPRISE sends a stretch of the wave down again with nothing drawn
 * (`sim/reprise.ts`). Those bodies are on the field in every other respect —
 * they fall, the dome turns them, a bolt of the right colour takes them, one
 * that reaches the hull costs what any other would — and the single thing that
 * is different about them is that no pass in this package may put a mark where
 * they are. They carry `Creature.unseen` and nothing else.
 *
 * **One place, and it has to be one place.** The body pass can skip them in a
 * line, and that was where this started; but a body in this game is drawn by
 * far more than the body pass. A lure's alarm, a veil's marks, a mine's fuses,
 * a wall's arcs, a worm's sweep, a box's row of dots, a wheel's spokes — each
 * is its own pass walking `world.creatures` for its own kind, and there are
 * two dozen of them. Sixteen of those drew an unseen body when this was
 * measured, each one of them a column handed to the pair for free, and the
 * next creature added would have been the seventeenth without anybody meaning
 * it. A rule that has to be remembered at two dozen call sites is not a rule.
 *
 * So the list is filtered once, as the frame arrives, and every pass under it
 * reads a field with nothing on it that may not be seen. That is `handedView`'s
 * arrangement one fact along, and this sits beside it in `canvas2d.ts` for the
 * same reason that one is called there: a frame settles what it is *of* before
 * anything draws.
 *
 * **What is deliberately not filtered:**
 *
 * - **The world the simulation holds.** This is a copy for drawing, made per
 *   frame and thrown away; nothing here is written back, and `hashWorld` never
 *   sees it.
 * - **The effects.** A kill is fed by a `SimEvent` and drawn from the outline
 *   the body had, not from the body (`body-hit.ts`, `body-strike.ts`), which
 *   is what lets an unseen body's death play whole — the pair learns it was
 *   right by seeing the kill and never by seeing the body.
 * - **Input.** A finger is tested against the world the host holds
 *   (`apps/game/src/field-input.ts`), because whether an invisible body can be
 *   taken hold of is the simulation's rule and not the picture's.
 *
 * **How many it took out is kept**, as `ViewState.unseen`: THE REPRISE counts
 * the unseen bodies still falling as hollow rings round its lens
 * (`reprise-brood.ts`) — how many, never where — and the boss pass reads a
 * field this function has already emptied of them.
 *
 * The object itself when there is nothing to take out, which is every wave but
 * one: an ordinary frame allocates nothing here.
 */
export function seenView(view: ViewState): ViewState {
  const { creatures } = view.world;
  // THE DARK takes out every body no light reaches, on the same terms and in
  // the same place, so the rehearsal's seats and the game's screen cannot
  // disagree about it (`dark-field.ts`).
  if (!creatures.some((c) => c.unseen)) return darkView(view);
  const seen = creatures.filter((c) => !c.unseen);
  return darkView({
    ...view,
    unseen: creatures.length - seen.length,
    world: { ...view.world, creatures: seen },
  });
}
