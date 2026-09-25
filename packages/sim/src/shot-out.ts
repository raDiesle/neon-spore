import { antiphonStruck } from "./antiphon-shot.js";
import { bulletShown } from "./bullet-types.js";
import { candleStruck } from "./candle-step.js";
import { curtainStruck } from "./curtain-shot.js";
import { diastoleStruck } from "./diastole-step.js";
import { gimbalStruck } from "./gimbal-shot.js";
import { gorgeStruck } from "./gorge-step.js";
import { haspStruck } from "./hasp-shot.js";
import { hiveStruck } from "./hive-shot.js";
import { leadStruck } from "./lead-shot.js";
import { ledgerStruck } from "./ledger-shot.js";
import { orreryStruck } from "./orrery-shot.js";
import { ratchetStruck } from "./ratchet-shot.js";
import { scuttleStruck } from "./scuttle-shot.js";
import { tasterStruck } from "./taster-shot.js";
import type { Bullet } from "./types.js";
import { vaneStruck } from "./vane.js";
import type { World } from "./world.js";

/**
 * **A shot gone past the top of the field**, and everything up there that may
 * take it.
 *
 * Out of `bullets.ts`, where it was the tail of `sweep`, when that file was
 * fifteen lines off its limit and the shot needed to say it had left. That is
 * `shotOut`: the grid ends at row 0, but the screen does not — on a phone
 * upright there are several tiles of sky between the top row and the top of
 * the picture, and the owner, 25 September 2026: *let it fly to the very top
 * and disappear when screen ends.* The simulation is done with the bolt here;
 * the rest of its flight is drawn (`render/shot-out.ts`).
 *
 * `to` is where the sweep would have put it, in thousandths of a row, and it
 * is negative — past the centre of row 0 — so the picture carries on from
 * exactly where the last frame of the bolt stood.
 *
 * Every call below is a no-op unless its own boss is installed and its own
 * window is open. The bosses that hang above the field — THE VANE's bearing,
 * THE DIASTOLE's twin lobe, THE ORRERY's rings and the rest — are the things in
 * the game that are not on the grid at all (docs/spec/bosses.md §11.5).
 */
export function shotLeaves(world: World, b: Bullet, to: number): void {
  const said = world.events.length;
  vaneStruck(world, b);
  diastoleStruck(world, b, world.beat);
  // THE ORRERY's core, which is three rings up: a bolt that got here on a
  // beat every gap is at the bottom of its orbit takes the outermost ring
  // still standing (`orrery-shot.ts`).
  orreryStruck(world, b, world.beat);
  // THE CANDLE's glow, a step dimmer for any colour up its own column.
  candleStruck(world, b);
  // THE GORGE's sack, which swallows the shot as a bead (`gorge-step.ts`).
  gorgeStruck(world, b);
  // THE CURTAIN's core, if the fabric is shoved clear of it (`curtain-shot.ts`).
  curtainStruck(world, b);
  // THE TASTER's fan, where the colour that breaks a blade is the one it is
  // not (`taster-shot.ts`).
  tasterStruck(world, b);
  // THE LEDGER's seam, which only the middle column of it is, and only in the
  // colour it is showing (`ledger-shot.ts`).
  ledgerStruck(world, b);
  // THE LEAD's air: a bolt out of the top is put in flight above the field,
  // to be judged against the body on a later beat (`lead-shot.ts`).
  leadStruck(world, b);
  // THE SCUTTLE's live part, struck off its socket while it hangs if the bolt
  // is in its column and its colour (`scuttle-shot.ts`).
  scuttleStruck(world, b);
  // THE ANTIPHON's rail: a bolt out of the top is a colour in a column, which
  // is one candidate or none (`antiphon-shot.ts`).
  antiphonStruck(world, b);
  // THE GIMBAL's leaking seam, the one thing in that whole fight a cannon has
  // to do, and either colour does it (`gimbal-shot.ts`).
  gimbalStruck(world, b);
  // THE HASP's loose bolt, the same shape and the same either colour
  // (`hasp-shot.ts`).
  haspStruck(world, b);
  // THE RATCHET's, the same again (`ratchet-shot.ts`).
  ratchetStruck(world, b);
  // THE HIVE's underside: an open breach in the bolt's column and colour is
  // sealed, the wrong colour provokes it (`hive-shot.ts`).
  hiveStruck(world, b);
  world.events.push({
    type: "shotOut",
    col: b.col,
    driftMilli: b.driftMilli,
    atMilli: to,
    color: bulletShown(b),
    // **Whether something above the field answered it**, read as whether any
    // of the calls above said anything. Every one of them that takes a bolt
    // says so in an event; a bolt that met nothing up there is the only kind
    // the picture carries on to the top of the screen, because one that
    // struck a boss hanging there stopped where it struck.
    taken: world.events.length !== said,
  });
}
