import { undertowBoss, type World } from "@neon-spore/sim";
import { fourBeatsIn, type Row } from "./boss-hurt-rows.js";

/**
 * **The blow's rows from THE UNDERTOW on** — the second page of
 * `boss-hurt-rows.ts`, cut on build order, and the page a new boss's row is
 * added to.
 */
export const HURT_ROWS_B: Row[] = [
  {
    boss: "undertow",
    land: [
      { type: "undertowTaken", col: 3 },
      { type: "undertowSwallowed", col: 5 },
    ],
    part: [{ type: "undertowBow", col: 3 }],
    hurt: (fx) => fx.boss.undertow.hurt,
    world: undertowStanding,
  },
  {
    boss: "antiphon",
    land: [
      { type: "antiphonPit", shape: 0, pits: 1, col: 3 },
      { type: "antiphonBurst", pits: 4, col: 5 },
    ],
    part: [{ type: "antiphonGrow", shape: 0, organs: 1, col: 3 }],
    hurt: (fx) => fx.boss.antiphon.hurt,
  },
  {
    boss: "ledger",
    land: [
      { type: "ledgerSeam", seam: 1, color: "red", col: 5 },
      { type: "ledgerWhip", seam: 2, col: 5 },
      { type: "ledgerTear", col: 5 },
    ],
    part: [
      { type: "ledgerWard", col: 5 },
      { type: "ledgerRefused", col: 5 },
    ],
    hurt: (fx) => fx.boss.ledger.hurt,
  },
  {
    boss: "lead",
    land: [
      { type: "leadHit", segments: 3, col: 5 },
      { type: "leadDown", col: 5 },
    ],
    part: [
      { type: "leadFlight", dueBeat: 9, col: 5 },
      { type: "leadMiss", col: 5 },
    ],
    hurt: (fx) => fx.boss.lead.hurt,
  },
  {
    boss: "curtain",
    land: [
      { type: "curtainCoreHit", left: 2, col: 5 },
      { type: "curtainOut", col: 5 },
    ],
    part: [
      { type: "curtainLobeOff", left: 6, col: 5 },
      { type: "curtainShove", dir: 1, stride: 1, col: 3 },
    ],
    hurt: (fx) => fx.boss.curtain.hurt,
  },
  {
    boss: "scuttle",
    land: [
      { type: "scuttleStruck", socket: 0, left: 3, col: 4 },
      { type: "scuttleDown", col: 5 },
    ],
    part: [{ type: "scuttleRebuff", col: 4 }],
    hurt: (fx) => fx.boss.scuttle.hurt,
  },
  {
    boss: "fleet",
    land: [
      { type: "fleetWreck", col: 3, row: 2 },
      { type: "fleetSunk", col: 3, row: 2, len: 3, left: 2 },
    ],
    part: [
      { type: "fleetRake", col: 3, row: 2 },
      { type: "fleetHit", col: 3, row: 2 },
    ],
    hurt: (fx) => fx.boss.fleet.hurt,
  },
  {
    boss: "queen",
    land: [{ type: "petal", col: 5, row: 2, left: 3 }],
    part: [{ type: "queenFlinch", col: 4, row: 2, side: -1 }],
    hurt: (fx) => fx.ship.queenHurt,
  },
  {
    boss: "throat",
    land: [
      { type: "throatChoke", col: 3 },
      { type: "throatEvert", col: 3 },
    ],
    part: [
      { type: "throatCinch", col: 3 },
      { type: "throatHaul", col: 3 },
    ],
    hurt: (fx) => fx.boss.blows.throat,
  },
  {
    boss: "baton",
    land: [
      { type: "batonLanded", col: 3, socket: 1 },
      { type: "batonDown", col: 3 },
    ],
    part: [
      { type: "batonLaunch", col: 3, socket: 0 },
      { type: "batonStruck", col: 3, socket: 0 },
    ],
    hurt: (fx) => fx.boss.blows.baton,
  },
  {
    boss: "cairn",
    land: [{ type: "cairnPulled", player: 1, col: 3, row: 2 }],
    part: [{ type: "cairnHeld", col: 3, row: 2 }],
    hurt: (fx) => fx.boss.blows.cairn,
  },
  {
    boss: "vane",
    // A pin knocked out, and the last one too: the one event says both.
    land: [
      { type: "vaneKnock", pins: 2, col: 3 },
      { type: "vaneKnock", pins: 0, col: 3 },
    ],
    part: [{ type: "vanePin", col: 3 }],
    hurt: (fx) => fx.boss.blows.vane,
  },
];

/** THE UNDERTOW with a lobe up in a breach: nothing of it shows otherwise. */
function undertowStanding(): World {
  const world = fourBeatsIn("undertow")();
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow wave installed no floor");
  u.breaches.push({
    col: 3,
    stage: "standing",
    stageBeat: world.beat - 2,
    tall: false,
    widthMilli: 0,
    widened: false,
  });
  return world;
}
