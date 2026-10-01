import { FRONT } from "../../../../../packages/content/src/solid.js";
import * as look from "../../../../../packages/render/src/instar-head-look.js";
import type { Look } from "../../../../../packages/render/src/instar-plate.js";
import {
  drawRigHead,
  drawRigSideHead,
} from "../../../../../packages/render/src/instar-rig-head-draw.js";
import { instarTurn } from "../../../../../packages/render/src/instar-turn.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * RIG — offered 27 September 2026, from `docs/spec/living-bosses.md` §2 (the
 * parked "THE INSTAR's one head, modelled once"). The game draws two heads,
 * a face-on mask turned by two affines and a separate profile, and they meet
 * in a crossfade. This is one head built on the rig (`instar-rig-head.ts`):
 * skull, muzzle, a jaw of two mandibles, horns and brows, turned to the
 * body's own yaw in both views — face-on it is `FRONT` less the turn the
 * wings are seen at, in profile `SIDE` with its eye on the profile's — so the side view is the same head
 * seen round, with depth, and the eyes and lips face-on still sit on the
 * marks a thumb is on.
 */
const front = (ctx: CanvasRenderingContext2D, l: Look) =>
  drawRigHead(ctx, l, FRONT - instarTurn(l.f.side));
const side = drawRigSideHead;
const turned = (ctx: CanvasRenderingContext2D, l: Look, yaw: number) =>
  drawRigSideHead(ctx, l, yaw);

export const INSTAR_HEAD_RIG: Variant = {
  slot: "instar:head",
  name: "rig",
  sentence:
    "rig — THE INSTAR's head is one solid head on the rig, skull, muzzle, two-part jaw and horns, turned with the body instead of a flat mask face-on and a second drawing side-on",
  dir: "tools/versus/candidates/instar-head/rig",
  patches: [
    patch({
      target: look.INSTAR_HEAD,
      reached: () => look.INSTAR_HEAD,
      where: {
        file: "packages/render/src/instar-head-look.ts",
        symbol: "INSTAR_HEAD",
        type: "{ front: (ctx: CanvasRenderingContext2D, look: Look) => void; side: (ctx: CanvasRenderingContext2D, look: Look) => void; turned: (ctx: CanvasRenderingContext2D, look: Look, yaw: number) => void }",
      },
      fields: { front, side, turned },
    }),
  ],
};
