import { midCol } from "./config.js";
import { slingAsks, slingBoss, slingLitStep, slingSwipe } from "./sling.js";
import { slingLoosed } from "./sling-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two draws on THE SLING, one arm each.
 *
 * **Geometry says whose arm is whose**, THE MANTLE's rule
 * (`mantle-hand.ts`): `slingDrawLeft` answers only Player 1 and
 * `slingDrawRight` only Player 2, and the wrong seat's hold does nothing,
 * silently.
 *
 * **A draw is one drag**, `DrawRelease`, §32's primitive: `on: true` is the
 * finger down anywhere on the seat's own panel, and the lift (`on: false`)
 * carries the way it left on `fromMilli` — its sign alone, left below nought
 * and right above, nought a lift with no swipe. A second `on: true` while the
 * finger is already down is the same hold and changes nothing.
 *
 * How long a draw has been held is counted on the beat (`sling-step.ts`);
 * what is judged here is the one instant the beat cannot see — **the lift**.
 * In a step that asks this seat, a lift that has held the step's beats and
 * swipes toward its aim is a true loose; any other lift springs the arm
 * slack, the count gone and the step still lit to be drawn again. A lift
 * outside such a step only lets go.
 */
export function slingHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "slingDrawLeft" && command.target !== "slingDrawRight") return;
  const s = slingBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "slingDrawLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  if (command.on) {
    s.holding[side] = true;
    return;
  }
  if (!s.holding[side] || !Number.isInteger(command.fromMilli)) return;
  s.holding[side] = false;
  const step = slingLitStep(s);
  const drawn = step !== null && s.drawnBeats[side] >= step.beats;
  const asked = slingAsks(s, side);
  s.drawnBeats[side] = 0;
  if (!asked || step === null) return;
  if (drawn && slingSwipe(command.fromMilli) === step.aim) {
    slingLoosed(world, s, side);
    return;
  }
  world.events.push({ type: "slingSlack", side, col: midCol(world.cfg) });
}
