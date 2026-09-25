import type { Point } from "@neon-spore/content";
import { type Creature, handMeans, isBossBody } from "@neon-spore/sim";
import { flatRadius } from "./creature-place.js";
import { glidePhase } from "./depth.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field } from "./touch-field.js";
import { TAP_TILES } from "./touch-hand.js";
import type { Touch } from "./touch-hold.js";
import { CANNON_R, navigator, pilot, SHIELD_R } from "./touch-ship.js";
import {
  WELL_BODY,
  wellAngle,
  wellAt,
  wellCenter,
  wellHub,
  wellSectorAngle,
  wellSectors,
} from "./well.js";
import { wellBodyAt } from "./well-body.js";

/**
 * THE WELL's screen as a control: the same two questions `touch.ts` asks of
 * the flat field — is this finger on the ship, is it on a body — asked of the
 * circle the well draws instead.
 *
 * Until this file the field answered no finger at all while the well was up,
 * because every hit test in `touch.ts` is a circle cut out of the flat field:
 * the hull's two lobes along the bottom, a body in its column. On this screen
 * the hull is a ring at the middle and the bodies are round it, so each would
 * have been answered somewhere it is not drawn — the one thing that file
 * exists to prevent. The rails and the buttons were never touched and reach
 * everything; this is the second way to the same controls, for a thumb that
 * is already up on the picture (`touch-ship.ts` says the same of the flat
 * hull).
 *
 * **Nothing here decides gameplay, and nothing here is a second projection.**
 * Where a lobe is comes off `wellAngle` and `wellHub`, where a body is off
 * `wellBodyAt`, the call `well-draw.ts` places it by; what a column
 * is under a finger is the hour under it. A second spelling of any of those
 * is how a grab comes to land a lane from the thing it was aimed at.
 *
 * **The seam is a wall.** A finger in the one sector the hours leave empty at
 * twelve answers no column — the cannon it was carrying stays where it is —
 * and a finger that has come out on the far side asks for that side's column
 * outright, which the eased hand reaches the long way round the ring, the way
 * a thumb jumping to the far end of the flat strip does. Eleven and one are
 * the two ends of a rail, not neighbours, and the drag cannot make them so.
 */

/** How far outside the ring the dome's grab circle stands, in tiles — where
 * `drawWellShield` lifts it to when it is resting (`well-ship.ts`). */
const SHIELD_OUT = 0.25;
/** Inside this radius of the centre the angle under a finger says nothing:
 * a thumb on the middle of the ship is over every hour at once. */
const DEAD_TILES = 0.35;

/**
 * The column under a finger on the well, or null in the seam and at the very
 * middle. The angle is the whole answer — a finger near the rim and one near
 * the hub in the same lane are in the same column, as on the flat field a
 * finger high and low in a column is.
 */
export function wellCol(l: Layout, x: number, y: number): number | null {
  const s = wellSectorUnder(l, x, y);
  return s === null || s > l.cols - 1 ? null : s;
}

/** Whether a finger is in the seam — the one sector that holds no column, and
 * the handle this boss is answered by (`sim/well-hand.ts`). */
export function wellOnSeam(l: Layout, x: number, y: number): boolean {
  return wellSectorUnder(l, x, y) === l.cols;
}

/**
 * Which sector of the face a finger is in, `wellAngle` read backwards: the
 * roll is taken off before the angle is cut into sectors, and the result is
 * wrapped rather than clamped, because a face that has turned puts column ten
 * at an angle a square face would call minus two. Clamping there answered the
 * wrong lane; wrapping answers the lane the numeral under the thumb says.
 * The last sector — `l.cols` — is the seam.
 */
function wellSectorUnder(l: Layout, x: number, y: number): number | null {
  const c = wellCenter(l);
  const dx = x - c.x;
  const dy = y - c.y;
  if (Math.hypot(dx, dy) < l.tile * DEAD_TILES) return null;
  // Clockwise from up, the way `wellAngle` reads an hour.
  const angle = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
  const n = wellSectors(l);
  const raw = Math.round(angle / wellSectorAngle(l) - l.wellRoll / 1000) - 1;
  return ((raw % n) + n) % n;
}

/** Where the cannon rides the ring, as something a finger can be inside. */
export function wellCannonGrab(l: Layout, col: number): Circle {
  const at = wellAt(l, wellAngle(l, col), wellHub(l));
  return { x: at.x, y: at.y, r: l.tile * CANNON_R };
}

/** The same for the dome, just outside the ring. */
export function wellShieldGrab(l: Layout, col: number): Circle {
  const at = wellAt(l, wellAngle(l, col), wellHub(l) + l.tile * SHIELD_OUT);
  return { x: at.x, y: at.y, r: l.tile * SHIELD_R };
}

/**
 * A press on the well's screen, above the band. The ship first, then a body,
 * which is the order they are painted in and the order `touchDown` asks on the
 * flat field — a hand goes to whatever is on top.
 */
export function wellUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const ship = wellShipUnder(l, x, y, field);
  if (ship) return ship;
  const held = wellCreatureAt(l, field, x, y);
  if (!held) return wellSeamUnder(l, x, y, field);
  const angle = wellAngleOf(l, x, y);
  return {
    player: field.seat,
    command: { kind: "grip", id: held.id },
    // The hour the hand took hold at, so a hand carried *round* the ring
    // steps the body a column per sector (`touchMove`): on this picture
    // "sideways" is along the circle, and a pixel across means nothing.
    hold: { kind: "grip", id: held.id, player: field.seat, originX: x, well: { angle } },
  };
}

/**
 * THE WELL's own handle, asked for last: the seam is a wall to everything
 * above it — the ship is drawn over it and a body in a column is never in it —
 * so nothing this file already answered loses a finger to it, and a press that
 * found no lobe and no body in the empty sector is a press on the seam and
 * nothing else (`sim/well-hand.ts` says what it means).
 *
 * The pilot's seat only, the seat the projection is drawn on: the navigator
 * has a flat field and no seam in front of her at all, and a press of hers is
 * dropped in the simulation rather than argued about here.
 */
function wellSeamUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.seat !== 1 || !wellOnSeam(l, x, y)) return null;
  const angle = wellAngleOf(l, x, y);
  return {
    player: 1,
    command: { kind: "drag", target: "wellSeam", on: true, fromMilli: 0 },
    hold: {
      kind: "drag",
      target: "wellSeam",
      player: 1,
      originX: x,
      originY: y,
      well: { angle },
    },
  };
}

/** The angle under a point, clockwise from up. */
export function wellAngleOf(l: Layout, x: number, y: number): number {
  const c = wellCenter(l);
  return (Math.atan2(x - c.x, c.y - y) + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * How many columns round the ring a finger has been carried from the hour it
 * took hold at, in thousandths — what a grip's drag reports on this screen.
 * The short way round: a thumb never travels more than half the clock in one
 * frame, and the long way would step a body eleven lanes.
 */
export function wellColsFrom(l: Layout, originAngle: number, x: number, y: number): number {
  let d = wellAngleOf(l, x, y) - originAngle;
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return Math.round((d / wellSectorAngle(l)) * 1000);
}

/**
 * The ship, as `shipUnder` answers it on the flat hull: both circles asked,
 * the nearer hour wins when both hold the finger, and dead level the lobe
 * this seat carries. Then the seat's own half — `pilot` and `navigator` are
 * the flat hull's, handed the hour under the finger for the column.
 */
function wellShipUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  if (field.ship === false) return null; // TOUCH THE SHIP off (`Field.ship`)
  const cannon = wellCannonGrab(l, field.cannonCol);
  const shield = wellShieldGrab(l, field.shieldCol);
  const onCannon = hitCircle(cannon, x, y);
  const onShield = hitCircle(shield, x, y);
  if (!onCannon && !onShield) return null;
  const own: "cannon" | "shield" = field.seat === 1 ? "cannon" : "shield";
  const off = (col: number) => Math.abs(wellColsFrom(l, wellAngle(l, col), x, y));
  const on: "cannon" | "shield" = !onShield
    ? "cannon"
    : !onCannon
      ? "shield"
      : field.cannonCol === field.shieldCol
        ? own
        : off(field.cannonCol) < off(field.shieldCol)
          ? "cannon"
          : "shield";
  // The column the press names is the one under the finger — the lobe's own
  // when the finger is in the seam beside it, so a grab at the end of the rail
  // does not open by sending nothing.
  const col = wellCol(l, x, y) ?? (on === "cannon" ? field.cannonCol : field.shieldCol);
  const touch = field.seat === 1 ? pilot(on, col, { x, y }, field) : navigator(on, col, x, field);
  if (!touch?.hold) return touch;
  // The hold says which picture it was taken on, so the move and the lift read
  // the hour under the finger rather than the column under its x.
  if (touch.hold.kind === "cannon" || touch.hold.kind === "shield") {
    return { ...touch, hold: { ...touch.hold, well: true } };
  }
  return touch;
}

/**
 * The body under **this seat's** finger on the well, or null — `creatureAt`
 * with the well's own placement (`wellBodyAt`, the call `drawWellBodies`
 * draws by) and its footprint at `WELL_BODY` of the flat one. The kinds
 * skipped are the ones that pass skips, for its reasons.
 */
export function wellCreatureAt(l: Layout, field: Field, x: number, y: number): Creature | null {
  let best: Creature | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of field.creatures) {
    if (isBossBody(c.kind) || c.kind === "tether") continue;
    if (c.kind === "gyre" || c.kind === "crawler" || c.kind === "fence") continue;
    if (handMeans(c.kind, field.seat) === null) continue;
    const glide = glidePhase(field.cfg, field.beat, c, field.beatPhase);
    const at = wellBodyAt(l, field.cfg, c, glide);
    const reach = flatRadius(l, field.cfg, c, field.beatPhase) * WELL_BODY * 1.6;
    const d = Math.hypot(x - at.x, y - at.y);
    if (d > reach || d >= bestDist) continue;
    best = c;
    bestDist = d;
  }
  return best;
}

/** Whether a lift on the well's cannon is the tap that swallows: the flat
 * rule's two halves — the hand has not travelled, the cannon has not moved —
 * with the hour under the finger for the column (`sucksOnLift`). */
export function wellSucksOnLift(l: Layout, origin: Point, at: Point | undefined): boolean {
  if (at === undefined) return false;
  const dx = at.x - origin.x;
  const dy = at.y - origin.y;
  if (dx * dx + dy * dy >= (l.tile * TAP_TILES) ** 2) return false;
  return wellCol(l, at.x, at.y) === wellCol(l, origin.x, origin.y);
}
