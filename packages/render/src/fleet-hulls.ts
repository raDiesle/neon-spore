import {
  type FleetShip,
  type FleetState,
  shipCol,
  shipCovers,
  shipRow,
  type World,
} from "@neon-spore/sim";
import { type Chart, chartOf, chartX, chartY } from "./fleet-chart.js";
import { halo } from "./glow.js";
import { type Layout, showsFleetHulls } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE FLEET's ships, and the one thing in this game that is drawn on one
 * screen and not on the other for the whole length of a fight.
 *
 * **The pilot sees every hull; the navigator sees none of them.** Not a
 * question mark in their place and not a smudge — nothing at all, water like
 * any other water. That is the whole fight: the seat holding the map cannot
 * move the sights, so the map has to leave their mouth to be worth anything
 * (`docs/spec/systems.md` 5.2).
 *
 * **The exception is a ship going down, and both screens carry it.** A hull
 * that has taken its last square rolls, slides under and is gone, in front of
 * both of them — because the sinking is the pair's receipt. The navigator has
 * spent the whole fight firing at squares somebody else named; the one moment
 * they get to see what they were shooting at is the moment it stops existing.
 *
 * The silhouette is the reference sheet's: a flat-sided hull with a cut bow
 * and stern, a spine down the middle, and a light at the head. It is drawn
 * from the ship's own length and heading rather than from five named classes,
 * for the reason `FLEET_LEN_MIN` gives — the class is what a length *means*,
 * and nothing acts on the meaning.
 */

/** Beats a sinking hull takes to go under. Long enough to be watched. */
const FLEET_SINK_BEATS = 3;

/** The two colours a fleet is drawn in, alternating down the list. */
const HULLS = [
  { body: PALETTE.hull, rim: PALETTE.hullRim, dark: "#1B0A2E" },
  { body: PALETTE.shield, rim: PALETTE.shieldRim, dark: PALETTE.cyanDark },
] as const;

/**
 * How far through its sinking a ship is: 0 the beat it went down, 1 when it is
 * gone, and -1 for one still afloat.
 *
 * Derived from `sunkBeat` and the beat phase, never stored. `Effects` is where
 * anything that outlives a frame belongs, and this outlives nothing: a restart
 * builds a fresh world whose `sunkBeat` is all -1, so there is no way for last
 * run's sinking to be drawn over this one's chart.
 */
function sinkPhase(world: World, boss: FleetState, at: number, beatPhase: number): number {
  const beat = boss.sunkBeat[at] ?? -1;
  if (beat === -1) return -1;
  return Math.min(1, (world.beat - beat + beatPhase) / FLEET_SINK_BEATS);
}

/** Every hull this screen is allowed to show, drawn on the chart. */
export function drawFleetHulls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  boss: FleetState,
  beatPhase: number,
): void {
  const c = chartOf(l, world);
  if (c.tile <= 0) return;
  const seen = showsFleetHulls(l.role);
  for (let at = 0; at < boss.ships.length; at++) {
    const sinking = sinkPhase(world, boss, at, beatPhase);
    if (sinking >= 1) continue;
    // Afloat and this is the navigator's screen: there is nothing here.
    if (sinking < 0 && !seen) continue;
    drawHull(ctx, c, boss, boss.ships[at]!, at, sinking);
  }
}

/**
 * One hull. `sinking` is -1 for afloat, otherwise 0..1 through going under.
 *
 * The roll and the slide are one quantity between them, so there are not two
 * things to keep in step: the further under it is, the further over it has
 * gone and the less of it is left to see.
 */
function drawHull(
  ctx: CanvasRenderingContext2D,
  c: Chart,
  boss: FleetState,
  ship: FleetShip,
  at: number,
  sinking: number,
): void {
  const skin = HULLS[at % HULLS.length]!;
  const head = { x: chartX(c, ship.col), y: chartY(c, ship.row) };
  const tail = {
    x: chartX(c, shipCol(ship, ship.len - 1)),
    y: chartY(c, shipRow(ship, ship.len - 1)),
  };
  const long = (Math.abs(tail.x - head.x) + Math.abs(tail.y - head.y)) / 2 + c.tile * 0.42;
  const across = c.tile * 0.34;
  const cx = (head.x + tail.x) / 2;
  const cy = (head.y + tail.y) / 2;

  ctx.save();
  if (sinking >= 0) {
    ctx.globalAlpha = Math.max(0, 1 - sinking);
    ctx.translate(0, sinking * sinking * c.tile * 1.3);
  }
  ctx.translate(cx, cy);
  if (ship.dir === "v") ctx.rotate(Math.PI / 2);
  if (sinking >= 0) ctx.rotate(sinking * 0.34);

  const nose = Math.min(long * 0.35, c.tile * 0.42);
  ctx.beginPath();
  ctx.moveTo(-long, 0);
  ctx.lineTo(-long + nose, -across);
  ctx.lineTo(long - nose * 0.7, -across);
  ctx.lineTo(long, 0);
  ctx.lineTo(long - nose * 0.7, across);
  ctx.lineTo(-long + nose, across);
  ctx.closePath();
  ctx.fillStyle = skin.dark;
  ctx.fill();
  halo(ctx, 0, 0, long * 0.9, skin.body, sinking >= 0 ? 0.5 : 0.3);
  ctx.strokeStyle = skin.body;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();

  // The spine, and a light at the head — the two details the reference sheet
  // gives every class, and the only things that say which end is the bow.
  ctx.strokeStyle = skin.rim;
  ctx.globalAlpha *= 0.55;
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  ctx.moveTo(-long + nose, 0);
  ctx.lineTo(long - nose, 0);
  ctx.stroke();
  ctx.globalAlpha /= 0.55;
  ctx.fillStyle = skin.rim;
  ctx.beginPath();
  ctx.arc(long - nose * 0.9, 0, Math.max(1, across * 0.24), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawScars(ctx, c, boss, ship, skin.rim);
}

/**
 * Where this hull has already been holed, drawn on the hull itself and only on
 * the screen that can see it.
 *
 * The pilot's picture has to answer a question the shared marks cannot: not
 * "which squares have been fired at" — both screens carry that — but "how much
 * of *this* ship is left", which is the sentence they have to say next.
 */
function drawScars(
  ctx: CanvasRenderingContext2D,
  c: Chart,
  boss: FleetState,
  ship: FleetShip,
  hex: string,
): void {
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.inner;
  const r = c.tile * 0.16;
  for (const at of boss.struck) {
    const col = at % c.cols;
    const row = Math.floor(at / c.cols);
    if (!shipCovers(ship, col, row)) continue;
    const x = chartX(c, col);
    const y = chartY(c, row);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
