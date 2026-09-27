import { type Creature, queenTorchCol, spanCenterCol } from "@neon-spore/sim";
import type { PartAngles } from "./idle-drift-parts.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import {
  OUTLINE_PARTS,
  outlineBody,
  partMatrix,
  partOn,
  partPoint,
  partRelative,
} from "./outline-parts.js";
import { craneJoints } from "./queen-crane.js";
import { QUEEN_FIGURE } from "./queen-figure.js";
import { type QueenShellParts, type QueenWing, queenShellParts } from "./queen-shell.js";
import { torchRadius } from "./rock-size.js";

/**
 * **THE BULB QUEEN's parts on the idle drift** (`outline-parts.ts`): each wing
 * about its root on the shell (`queenShellParts`), each crane arm's elbow
 * about its shoulder. None carries a mark — hers sit on her body
 * (`queenMarkCenter`) — so each moves its tip `PART.tip` with no hit test to
 * follow it.
 *
 * **Each pair is one part, drawn as a mirror.** The part drift's rule is that
 * the two of a pair are not a mirror; hers overrules it, and is older. Her
 * wings carry the torches on their tips and her arms hold them, and a torch
 * that moves differently from the other one is read as the answer to "which
 * side" (`torchTremor`, `queen-torch-tremor.test.ts`, the owner's own
 * follow-up). So the right of each pair wanders and the left is its
 * reflection about her middle: she stays symmetric, and nothing on either
 * flank says anything the other does not.
 *
 * The arm's wrist stays on its rock, which does not move — it is the creature
 * the torch becomes the beat it breaks off — so only its elbow swings, and the
 * swing dies as the arm straightens to let go (`drawCraneArm`). **The claw
 * stays still**: how far it is open is the drop's *when* (`craneRelease`), and
 * a claw turning on its wrist would open one finger and shut the other.
 */

/** One pair's angles as drawn inside her pose, or `null` for a still one. */
export interface QueenPair {
  readonly right: PartAngles | null;
  readonly left: PartAngles | null;
}

export interface QueenParts {
  readonly wing: QueenPair;
  readonly arm: QueenPair;
}

/** Her parts' indices on her seed: a pair shares one, being one part drawn twice. */
const INDEX = { wing: 0, arm: 1 } as const;

export const pairSide = (p: QueenPair, side: -1 | 1): PartAngles | null =>
  side === 1 ? p.right : p.left;

/**
 * Her parts at `time`, hushed by `hush` (`outlineHush`) and hung on her
 * body's lean about a root `reach` pixels from her farthest point
 * (`queenRoot`), or `null` when none of them moves.
 */
export function queenParts(
  l: Layout,
  queen: Creature,
  time: number,
  hush: number,
  reach: number,
): QueenParts | null {
  if (OUTLINE_PARTS.queen * hush <= 0) return null;
  const tile = l.tile;
  const body = outlineBody("queen", hush, reach, tile);
  const len = queenPartLengths(l, queen);
  const wing = partOn("queen", INDEX.wing, "wing", body, len.wing, hush);
  const arm = partOn("queen", INDEX.arm, "arm", body, len.arm, hush);
  const at = body(time);
  const pair = (part: (t: number) => PartAngles): QueenPair => {
    const a = part(time);
    return { right: partRelative(a, at, 1), left: partRelative(a, at, -1) };
  };
  const parts = { wing: pair(wing), arm: pair(arm) };
  return parts.wing.right === null && parts.arm.right === null ? null : parts;
}

/** How long each of her parts is, joint to tip, in tiles — what scales its wander. */
export function queenPartLengths(l: Layout, queen: Creature): { wing: number; arm: number } {
  const tile = l.tile;
  const f = QUEEN_FIGURE;
  const right = queenShellParts(f.bodyRx * tile, f.bodyRy * tile, 0).right;
  const wing = Math.max(
    ...right.points.map((p) => Math.hypot(p.x - right.joint.x, p.y - right.joint.y)),
  );
  const r = torchRadius(l);
  const bodyX = tileCX(l, queen.col);
  const bodyY = tileCY(l, queen.row) + f.bodyCy * tile;
  const cx = tileCX(l, spanCenterCol("torch", queenTorchCol(queen.col, 1)));
  const j = craneJoints(tile, bodyX, bodyY, 1, cx, tileCY(l, queen.row), r, 0);
  // The wrist stays on its rock, so the arm's moving tip is its elbow.
  const arm = Math.hypot(j.elbow.x - j.shoulder.x, j.elbow.y - j.shoulder.y);
  return { wing: wing / tile, arm: arm / tile };
}

/**
 * Her shell's pieces with each wing's run of vertices turned about its root
 * before they are laid (`queenShellPath`), so the one contour bends at the
 * joint rather than a wing being drawn apart from her back.
 */
export function swingWings(shell: QueenShellParts, wings: QueenPair | null): QueenShellParts {
  if (wings === null) return shell;
  const swing = (w: QueenWing, a: PartAngles | null): QueenWing => {
    if (a === null) return w;
    const m = partMatrix(a, { joint: w.joint, axis: w.side === 1 ? 0 : Math.PI });
    return { ...w, points: w.points.map((p) => partPoint(m, p)) };
  };
  return { ...shell, right: swing(shell.right, wings.right), left: swing(shell.left, wings.left) };
}
