import {
  scuttleBoss,
  scuttleLeft,
  scuttlePartCol,
  scuttleShootable,
  scuttleSocketCol,
  scuttleWinding,
} from "./scuttle.js";
import { scuttleDown } from "./scuttle-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **A shot that nothing on the field stopped, leaving through the top** under
 * THE SCUTTLE. Called by `bullets.ts` and `lance-burn.ts` beside
 * `leadStruck`, and a no-op unless THE SCUTTLE is the boss.
 *
 * Its own file beside `scuttle-step.ts` for `lead-shot.ts`' reason: next
 * door is the fight's **clock**, and this happens on the **tick**, where a
 * bolt leaves the field. The judgment is the whole of it — a bolt in the
 * live part's column and its colour while it hangs takes it off the frame
 * without a throw; the other colour is nothing, said; any other column is
 * nothing, unsaid, because the part hanging beside the live one is a part
 * the design says cannot be taken (`docs/spec/bosses-choreographed.md` §15,
 * step 6).
 *
 * **The beam is the last part's alone.** A beam standing in the last part's
 * column while the frame winds up is the end of it; a beam up any column
 * before that burns the column and touches nothing, because the design's
 * beam is the answer to the wind-up and a beam that took a part earlier
 * would make the wind-up one more cycle. The hanging parts are for bolts,
 * which is the pair's cadence against the frame's.
 *
 * **A bolt reads the part's column, not the socket's** (`scuttlePartCol`): a
 * part the pilot swung a column along the frame is shot where it now hangs,
 * and shooting a swung part where its socket is would be the picture and the
 * simulation disagreeing. The beam is read off the socket instead, and may
 * be: nothing is ever swung while the frame winds up (`scuttleSwingable`).
 */
export function scuttleStruck(world: World, b: Bullet): void {
  const s = scuttleBoss(world);
  if (s === null) return;
  const cfg = world.cfg;
  if (b.lance) {
    if (scuttleWinding(s) && b.col === scuttleSocketCol(cfg, s.live)) scuttleDown(world, s);
    return;
  }
  if (!scuttleShootable(s)) return;
  const socket = s.live;
  const col = scuttlePartCol(s, cfg, socket);
  const p = s.parts[socket];
  if (b.col !== col || p === null || p === undefined) return;
  if (b.color !== p.color) {
    world.events.push({ type: "scuttleRebuff", col });
    return;
  }
  s.parts[socket] = null;
  s.loose = s.loose.filter((i) => i !== socket);
  s.live = -1;
  // The thumb loses what it was on, and nothing else: the swing itself stands
  // until the next detachment, so a strike is not a second swing in a cycle.
  if (s.held === socket) s.held = -1;
  world.events.push({ type: "scuttleStruck", col, socket, left: scuttleLeft(s) });
}
