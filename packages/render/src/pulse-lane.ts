import type { ControlSet } from "@neon-spore/content";
import type { SurfaceY } from "./hull-frame.js";
import { bandLobes, type Layout, type ViewRole } from "./layout.js";
import { pulseLobeIds } from "./pulse-button.js";

/**
 * Where THE PULSE's four lanes are, and where each of them lands.
 *
 * **The lanes are read off the buttons, never laid out beside them.** Four
 * bodies falling onto four buttons is the whole of the round's picture, and a
 * lane whose centre is a pixel off the button under it is a round the pair
 * cannot read. `bandLobes` already answers where a lobe is, and it is the same
 * call the band's draw, the game's hit test and the director's all make — so
 * this takes the x of each and nothing works anything out twice. That is the
 * bug THE GAUGE shipped with once, one level up (`slabs.ts`).
 *
 * **A lane ends at the ship's own skin, and every one of them ends somewhere
 * different.** The placeholders are sunk into the hull — the owner's picture,
 * *half of it goes inside of the ship, like a crater of meteor when hitting
 * the ship* — and the hull is a membrane with swellings on it, so the skin
 * under one lane can be most of a tile higher than under the next. Each lane
 * therefore carries its own `landY`, sampled off the very membrane the hull
 * pass is drawn from. A single flat line across all four would have bodies
 * meeting three of their sockets early or late.
 *
 * **There are no lane wells any more.** Four vertical washes ran from the top
 * of the screen down to the line, and the owner had them out in one line —
 * *remove the vertical background lanes of the arrows falling down so we see
 * full default backgrounds.* He is right: the round sits in the field's own
 * water now, and four painted channels over it were four bars across the
 * light. What says where a body is going is the body, the socket it is falling
 * at, and the button under that.
 *
 * A seat with no buttons on this screen — the other half of a split view —
 * gets an even four across the width instead, so a frame test or a thumbnail
 * with no panel under it still draws a picture rather than nothing.
 */

/** One lane, in screen coordinates. */
export interface PulseLaneBox {
  /** Centre of the lane. */
  x: number;
  /** How wide a body in it may be drawn. */
  w: number;
  /** The ship's skin at this x: where its socket sits and where a body lands. */
  landY: number;
}

export interface PulseField {
  lanes: PulseLaneBox[];
  /** Screen y a body enters at. */
  topY: number;
  /**
   * The nominal landing line — the hull's own flat skin height.
   *
   * Nothing falls to it: a body falls to its lane's `landY`. It is what the
   * things that need *one* number read instead — where a judgement word
   * stands, and how fast a fall is going by the time it reaches the ship.
   */
  lineY: number;
}

export function pulseField(
  l: Layout,
  set: ControlSet,
  role: ViewRole,
  /** The membrane the hull pass was built from, so a socket sits on the skin
   * the eye is looking at rather than on a second one a fraction of a tick
   * away (`hull-frame.ts`). */
  skinAt: SurfaceY,
): PulseField {
  const seat: 1 | 2 = role === "p2" ? 2 : 1;
  const lobes = bandLobes(l, set, seat);
  // The four ids this seat's panel carries, asked of the file that draws them
  // rather than spelled out again — a second copy of how a lane is named is a
  // second copy of the panel (`pulse-button.ts`).
  const wanted = pulseLobeIds(seat);
  const lanes = wanted.map((id, i) => {
    const lobe = lobes.find((s) => s.control.id === id);
    // A lane is as wide as the body that comes down it may be drawn; the
    // button is only where it lands, and is smaller.
    const x = lobe === undefined ? (l.width / 4) * (i + 0.5) : lobe.circle.x;
    const w = lobe === undefined ? (l.width / 4) * 0.82 : lobe.circle.r * 2.3;
    return { x, w, landY: skinAt(x) };
  });
  return { topY: l.playHeight * 0.22, lineY: l.hullY, lanes };
}
