import type { Vec3 } from "./solid.js";
import type { Ring } from "./solid-tube.js";

/**
 * A PART THAT HANGS OFF ANOTHER: a jaw hinged on the skull, a wing on the
 * shoulder, a claw on the wing. The part is authored about its own hinge, as
 * if the hinge were the origin and nothing were turned, and an `Anchor` says
 * where that hinge sits on its parent and how far it is turned there. The
 * jaw opens by turning its anchor, not by moving every ring; the skull turns
 * and the jaw goes with it, because the jaw's anchor hangs off the skull's.
 *
 * Turns are in the rig's own model space (`solid.ts`) and are applied roll,
 * then pitch, then yaw:
 *
 * - **`roll`** about `x`, the body's length: a wing lifting off the back.
 *   Positive lifts the near flank, `+z`, up the screen.
 * - **`pitch`** about `z`, toward the viewer: a nod in the side plane, the
 *   jaw dropping open. Positive turns `+x` toward `+y`, down the screen.
 * - **`yaw`** about `y`, the vertical, in the view's own sense: a head
 *   turning to look at the player.
 *
 * Pure arithmetic, for `solid.ts`'s reason. A pose is resolved once per part
 * per frame, before the view sees it, so the painter's sort still runs on
 * where the part actually is.
 */

export interface Anchor {
  /** Where the hinge sits, in the parent's space (the rig's, with no parent). */
  readonly at: Vec3;
  readonly yaw?: number;
  readonly pitch?: number;
  readonly roll?: number;
  readonly parent?: Anchor;
}

/** A resolved hinge, a turn and a shift: `m` row-major, a point goes to `m · p + t`. */
export interface Hinge {
  readonly m: readonly number[];
  readonly t: Vec3;
}

const IDENTITY: Hinge = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: { x: 0, y: 0, z: 0 } };

function mul(a: readonly number[], b: readonly number[]): number[] {
  const out: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      out.push(
        (a[r * 3] as number) * (b[c] as number) +
          (a[r * 3 + 1] as number) * (b[3 + c] as number) +
          (a[r * 3 + 2] as number) * (b[6 + c] as number),
      );
    }
  }
  return out;
}

function rotate(m: readonly number[], p: Vec3): Vec3 {
  return {
    x: (m[0] as number) * p.x + (m[1] as number) * p.y + (m[2] as number) * p.z,
    y: (m[3] as number) * p.x + (m[4] as number) * p.y + (m[5] as number) * p.z,
    z: (m[6] as number) * p.x + (m[7] as number) * p.y + (m[8] as number) * p.z,
  };
}

/** The anchor's own turn, roll then pitch then yaw. */
function local(a: Anchor): number[] {
  const [cr, sr] = [Math.cos(a.roll ?? 0), Math.sin(a.roll ?? 0)];
  const [cp, sp] = [Math.cos(a.pitch ?? 0), Math.sin(a.pitch ?? 0)];
  const [cy, sy] = [Math.cos(a.yaw ?? 0), Math.sin(a.yaw ?? 0)];
  const roll = [1, 0, 0, 0, cr, -sr, 0, sr, cr];
  const pitch = [cp, -sp, 0, sp, cp, 0, 0, 0, 1];
  // The view's yaw (`turn` in `solid.ts`): x' = x cos + z sin, z' = −x sin + z cos.
  const yaw = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  return mul(yaw, mul(pitch, roll));
}

/** The anchor resolved into rig space, through every parent it hangs off. */
export function poseOf(a: Anchor | undefined, cache?: Map<Anchor, Hinge>): Hinge {
  if (!a) return IDENTITY;
  const held = cache?.get(a);
  if (held) return held;
  const up = poseOf(a.parent, cache);
  const at = rotate(up.m, a.at);
  const pose = {
    m: mul(up.m, local(a)),
    t: { x: at.x + up.t.x, y: at.y + up.t.y, z: at.z + up.t.z },
  };
  cache?.set(a, pose);
  return pose;
}

/** A point authored about the hinge, in rig space. */
export function hang(pose: Hinge, p: Vec3): Vec3 {
  const q = rotate(pose.m, p);
  return { x: q.x + pose.t.x, y: q.y + pose.t.y, z: q.z + pose.t.z };
}

/** A tube authored about the hinge, in rig space: the centres move, the radii do not. */
export function hangRings(pose: Hinge, rings: readonly Ring[]): Ring[] {
  return rings.map((r) => ({ c: hang(pose, r.c), r: r.r }));
}
