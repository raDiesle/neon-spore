import type { World } from "@neon-spore/sim";
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
 * So this: bolts jumping the last of the gap in both directions at once, the
 * wall's own blue going down and the shield's white-cyan coming up, with the
 * wire above the dome burning brighter for it and the ship's own line lit
 * where the current is earthing into it. It builds as the two close and is at
 * its loudest on the beat the wall comes to rest, which is the beat the answer
 * lands on.
 *
 * **It is drawn in the ship's pass, not the field's.** Everything here starts
 * on the wire and ends on the membrane, and the field pass runs *under* the
 * hull — a bolt drawn there would be painted over at exactly the end that
 * matters. `frame-ship.ts` calls it straight after the hull, so the current
 * reaches the thing it is earthing into.
 *
 * **It is the same picture on both screens, and that is a rule rather than a
 * convenience.** Nothing here asks whether the wall is open over the dome:
 * the bolts jump whether the dome is standing in a gap or in the wire, at the
 * same size and in the same colours. A version that fizzled out over a gap
 * would hand the navigator — the one seat not shown where the gaps are — the
 * answer, a beat before the wall arrives and with the shield still in their
 * hand. What both of them are watching is two things fighting; which of them
 * won is the banner afterwards.
 */

/** How far above the ship the wall starts arcing, in tiles. */
const REACH = 2.9;

/** Bolts at rest and at contact. Both ways at once, so an odd count would
 * always favour one direction. */
const BOLTS_MIN = 4;
const BOLTS_MAX = 12;

/** Kinks in one bolt, and how far it strays sideways at the middle of its
 * flight, as a share of the gap it is crossing. */
const KINKS = 5;
const STRAY = 0.42;

/** How wide the two ends of the fan are, in tiles: broad on the wire, narrow
 * where it gathers on the dome. A current earthing looks like this — many
 * places to leave from and one to arrive at. */
const FAN_WIRE = 2.2;
const FAN_DOME = 0.7;

/** Times a second the bolts are struck again. Fast enough to read as current
 * and slow enough that the eye catches one shape before the next. */
const STRIKE_HZ = 22;

/** Every fence close enough to the ship to be reaching it, drawn arguing with
 * the dome. Called once per frame from `frame-ship.ts`, over the finished
 * hull. */
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

  for (const c of world.creatures) {
    if (c.kind !== "fence") continue;
    const row = drawnRow(c, beatPhase);
    const wireY = fenceLineY(l, row, domeX, surfaceY) + (l.tile * GAUGE) / 2;
    const gap = domeY - wireY;
    const force = Math.max(0, Math.min(1, 1 - gap / (REACH * l.tile)));
    if (force <= 0) continue;
    drawArgument(ctx, l, domeX, wireY, domeY, force, time);
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

  const bolts = Math.round(BOLTS_MIN + (BOLTS_MAX - BOLTS_MIN) * force);
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
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= KINKS; i++) {
    const t = i / KINKS;
    const straight = xWire + (xDome - xWire) * t;
    // Pinned at both ends and loosest in the middle: a bolt that wandered
    // where it meets the wire or the skin would read as one that had come
    // away from whatever it is arcing between.
    const belly = Math.sin(t * Math.PI);
    const sway = signedHash(b.seed, 4 + i, b.strike) * Math.abs(span) * STRAY * belly;
    pts.push({ x: straight + sway, y: b.wireY + span * t });
  }

  const hex = b.up ? PALETTE.shieldRim : PALETTE.arc;
  const path = new Path2D();
  path.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) path.lineTo(pts[i]!.x, pts[i]!.y);
  strokeGlow(ctx, path, hex, Math.max(1.2, l.tile * 0.03 * (0.6 + b.force)), 0.8 + b.force);

  // The head: two segments of the same path, redrawn white-hot. It walks from
  // the wire to the dome on a blue bolt and from the dome to the wire on a
  // cyan one, which is the only thing in the picture that says the two
  // currents are going opposite ways.
  const t = b.up ? 1 - b.phase : b.phase;
  const at = Math.min(KINKS - 1, Math.floor(t * KINKS));
  const head = new Path2D();
  head.moveTo(pts[at]!.x, pts[at]!.y);
  head.lineTo(pts[at + 1]!.x, pts[at + 1]!.y);
  strokeGlow(ctx, head, PALETTE.arcRim, Math.max(1.6, l.tile * 0.045), 1.4 + b.force);
}
