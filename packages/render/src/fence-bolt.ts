import { strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **One line of current between the wall and the dome.**
 *
 * Cut out of `fence-arc.ts` when the warning skull took that file past its
 * 250-line limit. Next door is the argument the two of them are having — how
 * broad the fan is, how hard, and what else is drawn while it goes on; this is
 * one bolt of it, and it knows nothing about fences.
 *
 * **The head is the whole of which way round a bolt is.** Half the fan is the
 * wall reaching down and half is the ship reaching back, and nothing in the
 * geometry says which: the two are the same jagged line between the same two
 * points. What separates them is the hue and a bright segment walking from the
 * wire to the skin or from the skin to the wire.
 */

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

export interface Bolt {
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
export function drawBolt(ctx: CanvasRenderingContext2D, l: Layout, b: Bolt): void {
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
