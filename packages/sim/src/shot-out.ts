import { bulletShown } from "./bullet-types.js";
import { capstanStruck } from "./capstan-shot.js";
import { curtainStruck } from "./curtain-shot.js";
import { flueStruck } from "./flue-shot.js";
import { gallStruck } from "./gall-shot.js";
import { gimbalStruck } from "./gimbal-shot.js";
import { governorStruck } from "./governor-shot.js";
import { grindstoneStruck } from "./grindstone-shot.js";
import { halterStruck } from "./halter-shot.js";
import { haspStruck } from "./hasp-shot.js";
import { hiveStruck } from "./hive-shot.js";
import { keelStruck } from "./keel-shot.js";
import { lampreyStruck } from "./lamprey-shot.js";
import { leadStruck } from "./lead-shot.js";
import { ledgerStruck } from "./ledger-shot.js";
import { mantleStruck } from "./mantle-shot.js";
import { oculusStruck } from "./oculus-shot.js";
import { plumbStruck } from "./plumb-shot.js";
import { ratchetStruck } from "./ratchet-shot.js";
import { rimeStruck } from "./rime-shot.js";
import { instarStruck, nettleStruck } from "./scene-panel.js";
import { scuttleStruck } from "./scuttle-shot.js";
import { seamStruck } from "./seam-shot.js";
import { shotWasted } from "./shot-wasted.js";
import { slingStruck } from "./sling-shot.js";
import { stareStruck } from "./stare-shot.js";
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
 * THE CURTAIN's fabric and the rest — are the things in
 * the game that are not on the grid at all (docs/spec/bosses.md §11.5).
 *
 * **Each call says whether the bolt met anything up there**, which is what
 * HARD asks of it (`shot-wasted.ts`). The owner, 27 September 2026: *on HARD,
 * a shot that meets nothing above a sky boss loses the wave; a shot into
 * armour still costs nothing.* So a call answers true for anything its boss
 * did with the bolt — a hit, a colour billed, a bolt swallowed, rebuffed or
 * put in flight — and for a part of the boss that stands in the bolt's column
 * with its window shut: THE VANE's housing, a core in the middle column
 * before it is bared, a blade, an intake, the scuttle's frame. That is the
 * armour. It answers false for a column with none of the boss in it, or with
 * a part that is only there while it is open: a spark, a seam, a loose bolt,
 * a mark. THE LEAD's flight is judged a beat later, and a flight that comes
 * down where the body is not is the same question then (`lead-step.ts`).
 */
export function shotLeaves(world: World, b: Bullet, to: number): void {
  // Asked before the calls, because the last pin out of THE VANE takes the
  // boss off the world in the same breath as the shot that pulled it.
  const taken = skyTaken(world);
  let met = false;
  met = vaneStruck(world, b) || met;
  // THE CURTAIN's core, if the fabric is shoved clear of it (`curtain-shot.ts`).
  met = curtainStruck(world, b) || met;
  // THE TASTER's fan, where the colour that breaks a blade is the one it is
  // not (`taster-shot.ts`).
  met = tasterStruck(world, b) || met;
  // THE LEDGER's seam, which only the middle column of it is, and only in the
  // colour it is showing (`ledger-shot.ts`).
  met = ledgerStruck(world, b) || met;
  // THE LEAD's air: a bolt out of the top is put in flight above the field,
  // to be judged against the body on a later beat (`lead-shot.ts`).
  met = leadStruck(world, b) || met;
  // THE SCUTTLE's live part, struck off its socket while it hangs if the bolt
  // is in its column and its colour (`scuttle-shot.ts`).
  met = scuttleStruck(world, b) || met;
  // THE GIMBAL's leaking seam, the one thing in that whole fight a cannon has
  // to do, and either colour does it (`gimbal-shot.ts`).
  met = gimbalStruck(world, b) || met;
  // THE MANTLE's bared-core spark, the same shape and the same either colour
  // (`mantle-shot.ts`).
  met = mantleStruck(world, b) || met;
  // THE KEEL's socket, in its own colour, and its tail's rock, in either
  // (`keel-shot.ts`).
  met = keelStruck(world, b) || met;
  // THE VALVE's spark, in either colour (`valve-shot.ts`).
  met = valveStruck(world, b) || met;
  // THE SEAM's lit point, in its colour, or its rock (`seam-shot.ts`).
  met = seamStruck(world, b) || met;
  // THE OCULUS's open socket, in its colour (`oculus-shot.ts`).
  met = oculusStruck(world, b) || met;
  // THE VISE's bared kernel, in its colour (`vise-shot.ts`).
  met = viseStruck(world, b) || met;
  // THE RIME's bared core, in its colour (`rime-shot.ts`).
  met = rimeStruck(world, b) || met;
  // THE TRIVET's lit hub, in its colour (`trivet-shot.ts`).
  met = trivetStruck(world, b) || met;
  // THE PLUMB's lit core, in its colour (`plumb-shot.ts`).
  met = plumbStruck(world, b) || met;
  // THE SLING's lit yoke, in its colour (`sling-shot.ts`).
  met = slingStruck(world, b) || met;
  // THE GRINDSTONE's lit axle, in its colour (`grindstone-shot.ts`).
  met = grindstoneStruck(world, b) || met;
  // THE HALTER's bared centre, in its colour (`halter-shot.ts`).
  met = halterStruck(world, b) || met;
  // THE CAPSTAN's bared core, in its colour (`capstan-shot.ts`).
  met = capstanStruck(world, b) || met;
  // THE GALL's bared root, in its colour (`gall-shot.ts`).
  met = gallStruck(world, b) || met;
  // THE FLUE, which no bolt gets past: taken (`flue-shot.ts`).
  met = flueStruck(world, b) || met;
  // THE GOVERNOR's lit hub, in its colour (`governor-shot.ts`).
  met = governorStruck(world, b) || met;
  // THE LAMPREY's gullet, in its colour (`lamprey-shot.ts`).
  met = lampreyStruck(world, b) || met;
  // THE HASP's loose bolt, the same shape and the same either colour
  // (`hasp-shot.ts`).
  met = haspStruck(world, b) || met;
  // THE RATCHET's, the same again (`ratchet-shot.ts`).
  met = ratchetStruck(world, b) || met;
  // THE STARE's eye, which nothing hurts: met, and armour (`stare-shot.ts`).
  met = stareStruck(world, b) || met;
  // THE HIVE's underside: an open breach in the bolt's column and colour is
  // sealed, the wrong colour provokes it (`hive-shot.ts`).
  met = hiveStruck(world, b) || met;
  // A SHOOT mark on a scene's body over the bolt's column (`scene-panel.ts`).
  met = nettleStruck(world, b) || met;
  met = instarStruck(world, b) || met;
  const wasted = !met && shotWasted(world);
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
 * them is up the sky is its own, and a bolt out of the top is drawn going
 * into it (`taken`) whatever it met there: the boss draws its own answer, and
 * a wasted bolt on HARD is drawn coming back (`render/ricochet.ts`). Whether
 * it met anything is the calls' to say, not this list's.
 */
export const SKY_BOSSES: ReadonlySet<string> = new Set([
  "vane",
  "curtain",
  "taster",
  "ledger",
  "lead",
  "scuttle",
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
  "halter",
  "capstan",
  "gall",
  "flue",
  "governor",
  "lamprey",
  "hasp",
  "ratchet",
  "hive",
  "nettle",
  "instar",
  "stare",
]);

/** Whether a boss is hanging above the field to take a bolt out of the top. */
function skyTaken(world: World): boolean {
  return world.boss !== null && SKY_BOSSES.has(world.boss.kind);
}
