import {
  type ControlDef,
  type ControlSet,
  layoutSet,
  setControls,
  setHas,
} from "@neon-spore/content";
import type { Circle, Layout } from "./layout.js";
import { showsCannon, showsShield } from "./view-role.js";

/**
 * Where the round buttons on the band stand, for one seat and one panel.
 *
 * Split out of `layout.ts` when that file crossed its 250-line limit, and the
 * seam is the honest one: next door is the *screen* — the grid, the hull line,
 * the band's own rectangle, everything that follows from a viewport and a
 * config and nothing else — and this is the one thing on it that follows from
 * the **wave**. `layout.ts` re-exports both names, so nothing that asked the
 * layout where a button is had to move.
 *
 * `Layout` and `Circle` come back the other way as types only, which is the
 * arrangement `controls.ts` and `controls-round.ts` already have.
 */

/**
 * A round button on the band, and the control it is. There is no `guardButton`
 * on the layout any more, and that is the point: a control the wave's set does
 * not name has no circle at all, so nothing can hit-test one that was never
 * drawn. See `bandLobes`.
 */
export interface Lobe {
  control: ControlDef;
  circle: Circle;
}

/**
 * Where one seat's lobes sit, and there is a row here for every seat on every
 * screen rather than a fixed list of named circles.
 *
 * A seat owns a share of the band and its lobes are **centred in that share**,
 * however many the wave's control set gives it — the same rule `slabPanel`
 * uses for a panel that is slabs rather than a band. That
 * is what the fixed list could not do: with the lance off the panel, player 1
 * had two buttons standing in the first two of three slots and a hole where
 * the third had been, which reads as a control that failed to draw rather than
 * as a panel with two controls on it.
 *
 * `maxPitch` is what keeps the ordinary panels where they have always been.
 * Spreading two buttons evenly across a whole share would fling them to its
 * edges, so the spacing is capped: at the sizes the game actually ships —
 * three lobes for player 1 in the test view, two for player 2 — the cap wins
 * and every circle lands on the pixel it landed on before. It only gives way
 * for a set with more lobes than a row can hold at that spacing.
 *
 * It is a function of the *set* rather than a field of `Layout` because the
 * panel changes with the wave and the layout does not: the wave is known where
 * the band is drawn and where a finger is answered, and both ask here.
 *
 * **A rung of the ladder is laid out against the panel it reduces, not
 * against itself** (`ControlSet.reduces`). The slots come from `layoutSet` and
 * the held-back ones are dropped afterwards, so STANDARD 3's single trigger
 * stands on the pixel STANDARD's trigger stands on and the maw's place beside
 * it is simply empty. Laying the survivors out on their own would centre one
 * lobe in the seat's share, and a pair would learn an arrangement in the first
 * waves that moves under them in the fifth — which is the whole of what the
 * owner asked for when he asked for a reduced panel.
 */
export function bandLobes(l: Layout, set: ControlSet, player: 1 | 2): Lobe[] {
  // A seat this screen does not carry has no buttons on it at all — not
  // buttons somewhere off to one side. A solo view gives its one seat the
  // whole width, so the absent seat's circles would otherwise land on top of
  // the present one's and both would claim the same thumb.
  if (player === 1 ? !showsCannon(l.role) : !showsShield(l.role)) return [];
  const controls = setControls(layoutSet(set), player).filter((c) => c.form === "lobe");
  if (controls.length === 0) return [];
  const solo = l.role !== "test";
  // Each seat's share of the width, and the middle of it. In the test view the
  // two seats stand side by side and neither may reach into the other's half.
  const centre = solo ? 0.5 : player === 1 ? 0.23 : 0.72;
  const maxPitch = solo ? (player === 1 ? 0.28 : 0.32) : player === 1 ? 0.15 : 0.24;
  const share = solo ? 1 : 0.46;
  const pitch = Math.min(maxPitch, share / controls.length);
  const first = centre - ((controls.length - 1) / 2) * pitch;
  return (
    controls
      .map((control, i) => ({
        control,
        circle: { x: l.width * (first + i * pitch), y: l.lobeY, r: l.lobeR },
      }))
      // The slot is kept and the button is not: a control the wave's own set has
      // not got is drawn nowhere and answered nowhere, exactly as it was before
      // the ladder existed. Filtered after the placement rather than before it,
      // which is the whole difference.
      .filter((lobe) => setHas(set, lobe.control.id))
  );
}
