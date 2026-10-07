import {
  type HiveState,
  hiveOnWall,
  hiveVerdict,
  hiveWallVerdict,
  type World,
} from "@neon-spore/sim";
import type { BoltHit, Stopper } from "./bolt-stop.js";
import { type Foot, lowestFoot, roundFoot } from "./core-stop.js";
import { hiveBox, hiveSite, type Point, SITE_HANG, SITE_R } from "./hive-shape.js";
import {
  hiveWallLay,
  hiveWallSide,
  hiveWallSpan,
  WALL_SITE,
  type WallSpan,
  wallFace,
} from "./hive-walls.js";
import { type Layout, tileCX } from "./layout.js";

/** How a site's lobe hangs as drawn: `drop` below the underside, `open` of its width, and leaning `lean` across per pixel down (`hive-sway.ts`). */
export interface HiveHang {
  drop: number;
  open: number;
  lean?: number;
}

/**
 * **Where a bolt meets THE HIVE**, for `BoltStops` (`bolt-stop.ts`): the
 * lowest of the underside and the lobe hanging at each site, moved `shift`
 * as drawn, and what the simulation will say of it (`hiveVerdict`) — a burst
 * on an open breach in its colour, a scuff on one in the other, and the skin
 * anywhere else, which spans the field — and the lowest cocoon on a wall,
 * which stands in front of the rest of it. `hangs` holds a swelling site's
 * lobe; every other hangs `open` wide and no lower.
 *
 * A lobe is taken as half an ellipse from its shoulders to its tip, which is
 * where `hiveSitePath`'s curves run within a few pixels.
 */
export function hiveStopper(
  l: Layout,
  world: World,
  s: HiveState,
  shift: { x: number; y: number },
  open: number,
  hangs: readonly (HiveHang | undefined)[],
): Stopper {
  const box = hiveBox(l, world.cfg);
  const mid = (box.left + box.right) * 0.5 + shift.x;
  const hw = (box.right - box.left) * 0.5 * open;
  const under = box.bottom + shift.y;
  const feet: Foot[] = [(x) => (Math.abs(x - mid) < hw ? under : null)];
  const walls = hiveWallSpan(l, s);
  if (walls !== null) {
    const xs = s.cols.filter((_, i) => !hiveOnWall(s, i)).map((c) => tileCX(l, c));
    for (const f of hiveCornerFeet(l, world.cfg.cols, walls, box.bottom, xs, open))
      feet.push((x) => {
        const y = f(x - shift.x);
        return y === null ? null : y + shift.y;
      });
  }
  for (let i = 0; i < s.cols.length; i++) {
    const c = hiveSite(l, s, i);
    const hang = hangs[i] ?? { drop: 0, open };
    const r = l.tile * SITE_R * hang.open;
    if (r <= 0) continue;
    const at = { x: c.x + shift.x, y: c.y + shift.y };
    // A wall's cocoon lies on its side, so its drop is a reach across, not down.
    if (hiveOnWall(s, i))
      feet.push(hiveWallFoot(at, s.cols[i] ?? 0, r, r * 0.3, r * SITE_HANG + hang.drop));
    else {
      const lean = hang.lean ?? 0;
      const top = at.y - r * 0.3;
      const ry = r * (0.3 + SITE_HANG) + hang.drop;
      feet.push(lean === 0 ? roundFoot(at.x, top, r, ry) : shornFoot(at, top, r, ry, lean));
    }
  }
  const foot = lowestFoot(feet);
  return (col, x, color) => {
    const y = foot(x);
    if (y === null) return null;
    // A wall's column stops a bolt at the lowest cocoon on it, and that
    // cocoon is what it is judged by (`sim/hive-wall.ts`).
    const v = hiveWallVerdict(world, col, color) ?? hiveVerdict(world, col, color);
    const hit: BoltHit = v === "target" || v === "wrong" ? v : "body";
    return { y, hit };
  };
}

/**
 * Where a bolt meets a wall cocoon hung at `c` off the wall in `col`, its drop
 * `r` wide and `long` from its back to its tip in its own frame: the lower
 * half of the ellipse it lies in on its side, `WALL_SITE` of the size.
 */
export function hiveWallFoot(c: Point, col: number, r: number, back: number, long: number): Foot {
  const side = hiveWallSide(col);
  const half = ((back + long) * WALL_SITE) / 2;
  return roundFoot(c.x + side * (half - back * WALL_SITE), c.y, half, r * WALL_SITE);
}

/**
 * Where a bolt meets the two corners at rest, under `under`: the fillet from
 * the face down to the scallops is a quadratic with its control level with
 * its end and plumb over its start, so its height over x is solved outright.
 */
export function hiveCornerFeet(
  l: Layout,
  cols: number,
  w: WallSpan,
  under: number,
  siteXs: readonly number[],
  open: number,
): Foot[] {
  const { e, X, y0, firstX, lastX } = hiveWallLay(l, cols, w, siteXs, open);
  const level = under - l.tile * 0.2;
  const corner =
    (faceX: number, endX: number): Foot =>
    (x) => {
      const k = (x - faceX) / (endX - faceX);
      if (k <= 0 || k >= 1) return null;
      const u = 1 - Math.sqrt(k);
      return u * u * y0 + (1 - u * u) * level;
    };
  return [
    corner(X(e.right - wallFace(l, w, y0, 0, -1)), X(firstX)),
    corner(X(e.left + wallFace(l, w, y0, 0, 1)), X(lastX)),
  ];
}

/**
 * The lower edge of a drop leaning `lean` about its site `at`, as
 * `drawHive` shears it: the half ellipse `roundFoot` takes, centred `top`,
 * with each point moved `lean` across per pixel below the site. Its lowest
 * point over x is the larger root of the sheared ellipse's quadratic.
 */
function shornFoot(at: Point, top: number, rx: number, ry: number, lean: number): Foot {
  const cx = at.x + lean * (top - at.y);
  const a = (lean * lean) / (rx * rx) + 1 / (ry * ry);
  return (x) => {
    const dx = x - cx;
    const b = (-2 * lean * dx) / (rx * rx);
    const c = (dx * dx) / (rx * rx) - 1;
    const disc = b * b - 4 * a * c;
    if (disc <= 0) return null;
    const v = (-b + Math.sqrt(disc)) / (2 * a);
    return v <= 0 ? null : top + v;
  };
}
