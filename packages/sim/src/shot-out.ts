import { antiphonStruck } from "./antiphon-shot.js";
import { bulletShown } from "./bullet-types.js";
import { curtainStruck } from "./curtain-shot.js";
import { gimbalStruck } from "./gimbal-shot.js";
import { gorgeStruck } from "./gorge-step.js";
import { grindstoneStruck } from "./grindstone-shot.js";
import { haspStruck } from "./hasp-shot.js";
import { hiveStruck } from "./hive-shot.js";
import { keelStruck } from "./keel-shot.js";
import { leadStruck } from "./lead-shot.js";
import { ledgerStruck } from "./ledger-shot.js";
import { mantleStruck } from "./mantle-shot.js";
import { oculusStruck } from "./oculus-shot.js";
import { plumbStruck } from "./plumb-shot.js";
import { ratchetStruck } from "./ratchet-shot.js";
import { rimeStruck } from "./rime-shot.js";
import { nettleStruck } from "./scene-panel.js";
import { scuttleStruck } from "./scuttle-shot.js";
import { seamStruck } from "./seam-shot.js";
import { slingStruck } from "./sling-shot.js";
import { tasterStruck } from "./taster-shot.js";
import { trivetStruck } from "./trivet-shot.js";
import type { Bullet } from "./types.js";
import { valveStruck } from "./valve-shot.js";
import { vaneStruck } from "./vane.js";
import { viseStruck } from "./vise-shot.js";
import { failWave } from "./wave-fail.js";
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
 * THE GORGE's sack, THE CURTAIN's fabric and the rest — are the things in
 * the game that are not on the grid at all (docs/spec/bosses.md §11.5).
 */
export function shotLeaves(world: World, b: Bullet, to: number): void {
  // Asked before the calls, because the last pin out of THE VANE takes the
  // boss off the world in the same breath as the shot that pulled it.
  const taken = skyTaken(world);
  vaneStruck(world, b);
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
  // THE MANTLE's bared-core spark, the same shape and the same either colour
  // (`mantle-shot.ts`).
  mantleStruck(world, b);
  // THE KEEL's socket, in its own colour, and its tail's rock, in either
  // (`keel-shot.ts`).
  keelStruck(world, b);
  // THE VALVE's spark, in either colour (`valve-shot.ts`).
  valveStruck(world, b);
  // THE SEAM's lit point, in its colour, or its rock (`seam-shot.ts`).
  seamStruck(world, b);
  // THE OCULUS's open socket, in its colour (`oculus-shot.ts`).
  oculusStruck(world, b);
  // THE VISE's bared kernel, in its colour (`vise-shot.ts`).
  viseStruck(world, b);
  // THE RIME's bared core, in its colour (`rime-shot.ts`).
  rimeStruck(world, b);
  // THE TRIVET's lit hub, in its colour (`trivet-shot.ts`).
  trivetStruck(world, b);
  // THE PLUMB's lit core, in its colour (`plumb-shot.ts`).
  plumbStruck(world, b);
  // THE SLING's lit yoke, in its colour (`sling-shot.ts`).
  slingStruck(world, b);
  // THE GRINDSTONE's lit axle, in its colour (`grindstone-shot.ts`).
  grindstoneStruck(world, b);
  // THE HASP's loose bolt, the same shape and the same either colour
  // (`hasp-shot.ts`).
  haspStruck(world, b);
  // THE RATCHET's, the same again (`ratchet-shot.ts`).
  ratchetStruck(world, b);
  // THE HIVE's underside: an open breach in the bolt's column and colour is
  // sealed, the wrong colour provokes it (`hive-shot.ts`).
  hiveStruck(world, b);
  // A SHOOT mark on a scene's body over the bolt's column (`scene-panel.ts`).
  nettleStruck(world, b);
  const wasted = wastes(world, taken);
  world.events.push({
    type: "shotOut",
    col: b.col,
    driftMilli: b.driftMilli,
    atMilli: to,
    color: bulletShown(b),
    taken,
    wasted,
  });
  // After the event, so the picture has the shot's own word before the
  // wave's: the bolt that lost it is the one it draws coming back.
  if (wasted) failWave(world);
}

/**
 * The bosses that hang above the field, each with a call above. While one of
 * them is up the sky is its own: a bolt out of the top has gone into it, and
 * whatever it did there is that boss's answer — including, on purpose, no
 * answer at all. THE VANE's shut housing is
 * armour a shot goes into for nothing (`vane.ts`), and a shot a boss swallows
 * says nothing in an event either, so no count of what the calls
 * said could tell a bolt that met one from a bolt that met the sky.
 */
export const SKY_BOSSES: ReadonlySet<string> = new Set([
  "vane",
  "gorge",
  "curtain",
  "taster",
  "ledger",
  "lead",
  "scuttle",
  "antiphon",
  "gimbal",
  "mantle",
  "keel",
  "valve",
  "seam",
  "oculus",
  "vise",
  "rime",
  "trivet",
  "plumb",
  "sling",
  "grindstone",
  "hasp",
  "ratchet",
  "hive",
  "nettle",
]);

/** Whether a boss is hanging above the field to take a bolt out of the top. */
function skyTaken(world: World): boolean {
  return world.boss !== null && SKY_BOSSES.has(world.boss.kind);
}

/**
 * **HARD's rule: a shot that met nothing loses the wave.** The owner, 25
 * September 2026 — *wave is lost, if a shot is hitting nothing, basically
 * wasted and hitting the top line of game screen.* A shot is only ever here if
 * nothing on the grid stopped it, so what is left to ask is whether anything
 * above the grid did, and whether the wave is still being played: a bolt still
 * climbing when the last body went is not a shot at nothing, it is a shot the
 * rest after a clear caught in the air (`clearHolds`). THE WELL is out of it
 * as well: its field is a disc, and a disc has no top line to hit.
 */
function wastes(world: World, taken: boolean): boolean {
  if (!world.cfg.wastedShotFails || taken) return false;
  if (world.boss?.kind === "well") return false;
  return world.restBeat === 0;
}
