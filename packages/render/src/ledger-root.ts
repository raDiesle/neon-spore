import { ledgerBoss, ledgerPhase, type World } from "@neon-spore/sim";
import type { SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { drawLedgerSocket } from "./ledger-cord.js";
import { drawLedgerLock } from "./ledger-read.js";
import { ledgerTaut } from "./ledger-shape.js";
import { showsLedgerSocket } from "./view-role-clocks.js";

/**
 * **The navigator's half of THE LEDGER, on the finished ship** — the grommet
 * the cord is rooted in and the white lock around the column it is in.
 *
 * Its own pass, and it has to be: both marks were drawn with the body, in the
 * field pass, and **the ship pass paints over the field** (`frame-on-ship.ts`).
 * The grommet survived as a smudge on the hull's rim and the lock did not
 * survive at all — the one mark on the screen that tells her which column the
 * plate has to be in, buried under the plating it is about. It cost one
 * capture to find and nothing in the suite could have said it: the stub
 * canvas records that the calls were made, and they were.
 *
 * So the two of them are where THE UNDERTOW's plating and THE SINEW's shock
 * are: on the ship, after it is drawn, sitting on the **real** surface rather
 * than on the hull line the cord is drawn to (`surfaceSampler`) — which is
 * also truer, because the plating bows and a socket is a hole in the plating.
 *
 * The cord still ends at the hull line in the field pass, so it passes *into*
 * the ship and the grommet is where it goes through: the order is the picture.
 */
export function drawLedgerRoot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  surfaceY: SurfaceY,
): void {
  const t = ledgerBoss(world);
  if (t === null || l.tile <= 0 || !showsLedgerSocket(l.role)) return;
  const { cfg } = world;
  // Nothing while the cord is still paying out, and nothing once it has torn
  // out of the ship: there is no socket either side of the fight.
  const phase = ledgerPhase(t, cfg, world.beat);
  if (phase === "rooting" || phase === "out") return;
  const x = tileCX(l, t.socket);
  const at = { x, y: surfaceY(x) };
  drawLedgerSocket(ctx, l, at, ledgerTaut(cfg, t));
  drawLedgerLock(ctx, l, cfg, t, at, beatPhase);
}
