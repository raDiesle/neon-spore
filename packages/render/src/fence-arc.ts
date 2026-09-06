import { fenceIsOpen, fenceSettleTicks, type World } from "@neon-spore/sim";
import { drawnRow } from "./depth.js";
import { fenceLineY, GAUGE } from "./fence-wire.js";
import { halo, strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import type { LobePositions, SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The wall and the dome, arguing.**
 *
 * A fence is the one arrival the trigger cannot answer: it comes down across
 * every column at once and either the shield is standing in a way through it
 * or it is not (`sim/fence.ts`). Until the last beat that is a fact with no
 * picture — the wall fell, the wall stopped, and the pair found out afterwards
 * from a banner. The owner asked for the moment itself: *when the fence is
 * nearest to the ship, big electric animations, the fence's current flowing to
 * the shield and back the other way, so we see they disturb each other.*
 *
 * So this: bolts jumping between the wire and the dome in both directions at
 * once, the wall's own blue going down and the shield's white-cyan coming up,
 * with the wire above the dome burning brighter for it and the ship's own line
 * lit where the current is earthing into it. It reaches **the full height of
 * the field from the beat the wall arrives** — the owner asked for that by
 * name — and builds all the way down, loudest on the beat the wall comes to
 * rest, which is the beat the answer lands on.
 *
 * **And it goes out when the dome has settled in a way through.** A gap is a
 * hole in a circuit: there is nothing over the dome to earth into, so the
 * current stops, and that is the pair's own confirmation that the number they
 * said was the right one. It waits `fenceSettleTicks` — half a tile of this
 * wall's fall — before it believes the dome has arrived, or sliding the shield
 * across the field would strobe the arc a column at a time and read as a
 * fault. The cost is that the navigator can now *probe* for a way through by
 * standing in columns, which is a real change to what this creature keeps
 * back; the owner asked for the confirmation knowing the wire is the same
 * picture on both screens until it goes out.
 *
 * **It is drawn in the ship's pass, not the field's.** Everything here starts
 * on the wire and ends on the membrane, and the field pass runs *under* the
 * hull — a bolt drawn there would be painted over at exactly the end that
 * matters. `frame-ship.ts` calls it straight after the hull, so the current
 * reaches the thing it is earthing into.
 *
 * **What is drawn is the same on both screens**, gap or no gap, until the
 * settle passes — one clock off the world (`World.shieldSinceTick`) and one
 * question asked of the world (`fenceIsOpen`), so two phones stop arcing on
 * the same tick rather than a frame apart on each device's own timer.
 */

/** How much of the fan is there the moment the wall arrives, before the fall
 * has closed any of the distance. Not zero: the owner asked to see the two of
 * them reaching for each other across the whole field, so the current is on
 * from the top and the descent only makes it louder. */
const REACH_FLOOR = 0.28;

/** Bolts at rest and at contact. Both ways at once, so an odd count would
 * always favour one direction. */
const BOLTS_MIN = 4;
const BOLTS_MAX = 12;

/** Kinks in one bolt, and how far it strays sideways at the middle of its
 * flight, as a share of the gap it is crossing — capped in tiles as well, or a
 * bolt crossing the whole field would swing half of it sideways and the fan
 * would read as a scribble rather than as current. The kink count grows with
 * the length: five across most of the field is a bent line, and what a bolt
 * has to read as is a thing that found its own way down. */
const KINKS_MIN = 5;
const KINKS_MAX = 13;
const STRAY = 0.16;

/** How wide the two ends of the fan are, in tiles: broad on the wire, narrow
 * where it gathers on the dome. A current earthing looks like this — many
 * places to leave from and one to arrive at. */
const FAN_WIRE = 2.2;
const FAN_DOME = 0.7;

/** Times a second the bolts are struck again. Fast enough to read as current
 * and slow enough that the eye catches one shape before the next. */
const STRIKE_HZ = 22;

/** Every fence on the field, drawn arguing with the dome. Called once per frame
 * from `frame-ship.ts`, over the finished hull. */
export function drawFenceArcs(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  at: LobePositions,
  surfaceY: SurfaceY,
  beatPhase: number,
  time: number,
): void {
  // The dome as it is *drawn* — the eased head of the chain, not the column
  // the world snapped it to. The current has to land on the swelling the
  // player can see sliding, and the two are a fraction of a column apart while
  // it travels (`shield.ts`).
  const head = at.shield[0]?.col;
  const domeCol = head !== undefined && Number.isFinite(head) ? head : world.shieldCol;
  const domeX = tileCX(l, domeCol);
  const domeY = surfaceY(domeX);
  // Whether the dome has been still long enough for a way through under it to
  // count as found. One question off the world, asked once for the frame:
  // every wall on the field is answered by the same dome standing in the same
  // column for the same length of time.
  const settled = world.tick - world.shieldSinceTick >= fenceSettleTicks(world.cfg);

  for (const c of world.creatures) {
    if (c.kind !== "fence") continue;
    // The circuit is broken here: a hole over the dome has nothing to earth
    // into, and the pair watching the current stop is the pair being told the
    // number was right.
    if (settled && fenceIsOpen(c, world.shieldCol)) continue;
    const row = drawnRow(c, beatPhase);
    const wireY = fenceLineY(l, row, domeX, surfaceY) + (l.tile * GAUGE) / 2;
    const gap = domeY - wireY;
    if (gap <= 0) continue;
    // How near it is, over the whole drop rather than over the last couple of
    // tiles: `REACH_FLOOR` at the top of the field and 1 where the wire is on
    // the ship, so the fan is there the moment the wall is and only grows.
    const near = 1 - Math.min(1, gap / Math.max(1, l.gridHeight));
    drawArgument(ctx, l, domeX, wireY, domeY, REACH_FLOOR + (1 - REACH_FLOOR) * near, time);
  }
}

/** One wall and one dome, at one distance apart. */
function drawArgument(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  domeX: number,
  wireY: number,
  domeY: number,
  force: number,
  time: number,
): void {
  ctx.save();
  // The wire directly over the dome, burning. Drawn again here rather than
  // brightened where it was drawn: the field pass is finished and under the
  // hull by now, and what this says is that *this stretch* of the wall is the
  // stretch the ship is pulling on.
  const hot = new Path2D();
  const half = l.tile * 0.75;
  for (let i = 0; i <= 8; i++) {
    const x = domeX - half + (2 * half * i) / 8;
    const y = wireY + signedHash(i, 3, Math.floor(time * STRIKE_HZ)) * l.tile * 0.05 * force;
    if (i === 0) hot.moveTo(x, y);
    else hot.lineTo(x, y);
  }
  strokeGlow(ctx, hot, PALETTE.arcRim, Math.max(2, l.tile * 0.07), 1.2 + 1.4 * force);

  // The ship's line answering, along the membrane either side of the dome: the
  // shield's own colour, so the two currents in the picture are told apart by
  // hue before they are told apart by direction.
  halo(ctx, domeX, domeY, l.tile * (0.7 + 0.7 * force), PALETTE.shieldRim, 0.3 * force);
  halo(ctx, domeX, wireY, l.tile * (0.5 + 0.5 * force), PALETTE.arc, 0.34 * force);

  // Squared, so the fan thickens as the two close rather than filling the
  // field with a net the moment the wall arrives: four bolts reaching the
  // whole height, a dozen in the last tile.
  const bolts = Math.round(BOLTS_MIN + (BOLTS_MAX - BOLTS_MIN) * force * force);
  const strike = Math.floor(time * STRIKE_HZ);
  for (let b = 0; b < bolts; b++) {
    // Alternating, so half the fan is the wall reaching down and half is the
    // ship reaching back. Colour and direction of travel both flip with it.
    const up = b % 2 === 1;
    drawBolt(ctx, l, {
      domeX,
      wireY,
      domeY,
      force,
      up,
      seed: b,
      strike,
      phase: (time * (up ? 3.1 : 2.7) + b * 0.37) % 1,
    });
  }
  ctx.restore();
}

interface Bolt {
  domeX: number;
  wireY: number;
  domeY: number;
  force: number;
  up: boolean;
  seed: number;
  strike: number;
  /** 0..1 along the bolt, where the bright head of the flow is sitting. */
  phase: number;
}

/** One bolt, and the bright head running along it the way the current is
 * going. The head is the whole of *which way round this one is*. */
function drawBolt(ctx: CanvasRenderingContext2D, l: Layout, b: Bolt): void {
  const spread = signedHash(b.seed, 1, b.strike);
  const xWire = b.domeX + spread * l.tile * (FAN_WIRE / 2);
  const xDome = b.domeX + signedHash(b.seed, 2, b.strike) * l.tile * (FAN_DOME / 2);
  const span = b.domeY - b.wireY;
  // One kink every tile and a half or so, between the two bounds: a bolt from
  // the top of the field has ten and one jumping the last of the gap has five,
  // so both read as the same material at two lengths.
  const kinks = Math.max(
    KINKS_MIN,
    Math.min(KINKS_MAX, Math.round(Math.abs(span) / (l.tile * 1.5))),
  );
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= kinks; i++) {
    const t = i / kinks;
    const straight = xWire + (xDome - xWire) * t;
    // Pinned at both ends and loosest in the middle: a bolt that wandered
    // where it meets the wire or the skin would read as one that had come
    // away from whatever it is arcing between. The stray is capped in tiles as
    // well as in span, or a bolt crossing the whole field would swing half of
    // it sideways.
    const belly = Math.sin(t * Math.PI);
    const reach = Math.min(Math.abs(span) * STRAY, l.tile * 0.7);
    const sway = signedHash(b.seed, 4 + i, b.strike) * reach * belly;
    pts.push({ x: straight + sway, y: b.wireY + span * t });
  }

  const hex = b.up ? PALETTE.shieldRim : PALETTE.arc;
  const path = new Path2D();
  path.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) path.lineTo(pts[i]!.x, pts[i]!.y);
  strokeGlow(ctx, path, hex, Math.max(1.2, l.tile * 0.03 * (0.6 + b.force)), 0.8 + b.force);

  // The head: one segment of the same path, redrawn white-hot. It walks from
  // the wire to the dome on a blue bolt and from the dome to the wire on a
  // cyan one, which is the only thing in the picture that says the two
  // currents are going opposite ways.
  const t = b.up ? 1 - b.phase : b.phase;
  const at = Math.min(kinks - 1, Math.floor(t * kinks));
  const head = new Path2D();
  head.moveTo(pts[at]!.x, pts[at]!.y);
  head.lineTo(pts[at + 1]!.x, pts[at + 1]!.y);
  strokeGlow(ctx, head, PALETTE.arcRim, Math.max(1.6, l.tile * 0.045), 1.4 + b.force);
}
