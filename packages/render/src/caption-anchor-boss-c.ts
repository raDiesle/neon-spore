import type { BossPart } from "@neon-spore/content";
import { type BatonState, batonBoss, type SimConfig, type World } from "@neon-spore/sim";
import { socketPoint, socketReach } from "./baton-socket-draw.js";
import type { AnchorPoint } from "./caption-anchor.js";
import { bossAnchorD } from "./caption-anchor-boss-d.js";
import { around } from "./caption-anchor-box.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE BATON's fixtures are** — the third of `caption-anchor-boss.ts`,
 * split off `-b` on line count, and read the same way: each line asks the
 * boss's own draw file, and a part a screen does not draw is no ring at all.
 *
 * It came in the sweep that took the forty-three hull pages off the hull
 * (`docs/queue.md`, 18 September 2026). The film said *one sends and the other
 * shoots* at the middle of the hull, because a ring is only as good as the
 * thing it can be put round and there was nothing else nameable.
 */

export function bossAnchorC(
  l: Layout,
  world: World,
  part: BossPart | undefined,
  beatPhase: number,
): AnchorPoint | null {
  const cfg = world.cfg;
  const baton = batonBoss(world);
  if (baton !== null) return batonArm(l, cfg, baton);
  // The four of the fourth file, on the same line-count argument.
  return bossAnchorD(l, world, part, beatPhase);
}

/**
 * THE BATON: the arm, from the base socket to the last one still on it — the
 * thing that is sent, and the whole of what *one sends, the other shoots* is
 * about. A shed socket is still drawn as a husk on the thread, so the ring
 * does not shrink up the arm as the fight is won (`baton-socket-draw.ts`).
 */
function batonArm(l: Layout, cfg: SimConfig, b: BatonState): AnchorPoint | null {
  return around(
    b.sockets.map((_, i) => socketPoint(l, cfg, b, i)),
    socketReach(l),
  );
}
