import type { Point } from "@neon-spore/content";
import { stream } from "./hash.js";
import type { Fracture, Shard } from "./shatter.js";
import { reachAt } from "./shatter.js";

/**
 * The splinters a break throws off the faces it opened.
 *
 * `systems.md` 5.6 asks for three to six of them off the broken edge, and the
 * fracture is what made them possible: cutting a body into pieces that tile it
 * exactly opens surfaces that were *inside* the body, and a splinter is a
 * sliver off one of those. Nothing in the game throws any — `BREAK_LOOK` ships
 * with `splinters: 0`, which is the honest spelling of a look nobody has taken
 * (`break-look.ts`) — and this file returns an empty list until a candidate
 * asks for a number.
 *
 * **A splinter is a `Shard` and not a new kind of thing.** It carries an
 * outline, it is thrown, it turns and it fades, which is every field `Shard`
 * already has — so `shardAt` flies it, `facet` paints it and `Debris` keeps it
 * in the same list as the wedges, and none of this is a second particle
 * system. What makes it read as a splinter rather than as a small piece is the
 * shape and the timing: a long thin sliver, pointed the way it is going, out
 * ahead of the wedges and gone before they have landed.
 *
 * **It starts on the skin, with its tip exactly on the contour.** A sliver
 * placed at a share of the body's widest ray would stand off a slick — half as
 * tall as it is wide — like a spine at the instant of the break, and the body
 * has to be whole on the frame it dies. `reachAt` is the contour's own ray, the
 * one `shatter.ts` cuts every wedge with, called rather than re-derived.
 *
 * **Nothing here is random.** `stream` off the caller's seed, for `shatter.ts`'s
 * reason: two phones watching one body die must watch the same splinters leave
 * it.
 */

/** A sliver's length and its half-width, both shares of the contour's own reach
 * at that angle. Long enough to read as a direction at 26 px, thin enough that
 * six of them are not a second body. */
const LONG = 0.5;
const THIN = 0.022;
/** How much faster than a piece it leaves. A splinter travelling with the
 * wedges would read as one more wedge. */
const SPEED_MUL = 1.6;

/**
 * `count` slivers, evenly spread and jittered, in the same body-local units the
 * outline is in. An empty list at fewer than one, which is the shipped case and
 * the reason every caller may call this unconditionally.
 */
export function splinters(
  outline: readonly Point[],
  cut: Fracture,
  count: number,
  seed: number,
): Shard[] {
  if (count < 1 || outline.length < 3) return [];
  // A stream of its own off the same seed: sharing the cut's would move every
  // wedge the moment a candidate changed the splinter count.
  const rnd = stream(seed ^ 0x5f1e);
  const out: Shard[] = [];
  for (let i = 0; i < count; i++) {
    const a = ((i + 0.5 + (rnd() - 0.5) * 0.7) / count) * Math.PI * 2;
    const jitter = 0.7 + rnd() * 0.6;
    const wobble = rnd() - 0.5;
    const rim = reachAt(outline, cut.ox, cut.oy, a);
    if (rim <= 0) continue;
    const len = rim * LONG * jitter;
    const w = rim * THIN;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    // Turned to point the way it flies: `shardAt` rotates a piece about its own
    // middle from zero, so a sliver built along the x axis would leave sideways.
    const turn = (x: number, y: number): Point => ({
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    });
    out.push({
      points: [turn(len / 2, 0), turn(-len / 2, -w), turn(-len / 2, w)],
      // Its tip on the contour, so the body is whole on the frame it dies.
      x: cut.ox + cos * (rim - len / 2),
      y: cut.oy + sin * (rim - len / 2),
      vx: cos * cut.speed * SPEED_MUL,
      vy: sin * cut.speed * SPEED_MUL,
      // Barely turning: a sliver that spins reads as a chip, and what this is
      // for is the direction the face it came off was pointing.
      spin: cut.spin * 0.15 * wobble,
      // It was the outside of the body, so it keeps the rim's lit edge —
      // `break-piece.ts`'s depth rule, which is the only thing that says which
      // side of a piece used to face out.
      depth: 1,
    });
  }
  return out;
}
