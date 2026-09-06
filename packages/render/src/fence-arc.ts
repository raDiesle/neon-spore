import { fenceIsOpen, fenceSettleTicks, type World } from "@neon-spore/sim";
import { drawnRow } from "./depth.js";
import { drawBolt } from "./fence-bolt.js";
import { drawFenceSkull } from "./fence-skull.js";
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
 * **And when the column is shut, the current draws a skull over the dome.**
 * The fan alone could not say which of the two it was — an unanswered wall and
 * a wrongly answered one look identical from underneath — so a shut column
 * gets a sign of its own, flashing between the strikes a tile above the dome
 * (`fence-skull.ts`). It is the negative of the paragraph below: the arcs
 * stopping is the pair being told they are right, and this is the pair being
 * told they are not, while there is still field left to cross.
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

/** How far over the dome the warning skull hangs, in tiles — *some tile above
 * the shield*, which is the owner's own placement: clear of the swelling so it
 * does not read as something growing out of it, and low enough to be read in
 * the same glance. A ceiling rather than a distance: once the wire is nearer
 * than this, the sign takes the middle of what is left. */
const SKULL_LIFT = 1.15;

/** How much of the fan is there the moment the wall arrives, before the fall
 * has closed any of the distance. Not zero: the owner asked to see the two of
 * them reaching for each other across the whole field, so the current is on
 * from the top and the descent only makes it louder. */
const REACH_FLOOR = 0.28;

/** Bolts at rest and at contact. Both ways at once, so an odd count would
 * always favour one direction. */
const BOLTS_MIN = 4;
const BOLTS_MAX = 12;

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
    const force = REACH_FLOOR + (1 - REACH_FLOOR) * near;
    drawArgument(ctx, l, domeX, wireY, domeY, force, time);
    // And the warning, when the column the dome is standing in has no way
    // through it: a skull struck out of the same current, a tile over the
    // dome, flashing between the bolts (`fence-skull.ts`). It is asked of
    // `fenceIsOpen` rather than of the settle — the pair has to be told the
    // column is wrong while there is still time to move, and the settle is a
    // clock about the dome having *arrived*.
    //
    // It stays lit all the way down, and comes **halfway** once the wire is
    // nearer than a tile: the last beat is when this creature is still
    // answerable and is exactly when the warning must not go out. A sign that
    // faded as the wall closed would be a sign that was only ever there while
    // there was nothing to worry about.
    if (fenceIsOpen(c, world.shieldCol)) continue;
    const lift = Math.min(l.tile * SKULL_LIFT, gap * 0.55);
    if (lift < l.tile * 0.25) continue;
    drawFenceSkull(ctx, l, domeX, domeY - lift, force, time);
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

// **One bolt of the fan, and the head running along it**, is `fence-bolt.ts`
// next door — cut out when the warning skull took this file past its 250-line
// limit. The seam is a real one: what is left here is *the argument* — how many
// bolts there are, how hard, which way round and what else is drawn while it is
// going on — and next door is one line of current, drawn once.
