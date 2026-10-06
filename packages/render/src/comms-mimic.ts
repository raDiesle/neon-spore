import { type MimicStep, mimicBoss, type World } from "@neon-spore/sim";
import type { CommsCall } from "./comms.js";
import type { ViewRole } from "./view-role.js";

/**
 * **THE MIMIC's siren**, top right (the owner, 6 October 2026: *add "Tiles"
 * "Tell P2 Where" to the top right to the siren*). The words were the box
 * round the frame (`boss-cue-read-zt.ts`), which went so a picture has the
 * room to grow; they are the same words, said where every other boss whose
 * split is the whole fight says its jobs (`comms-boss.ts`).
 *
 * The call lights the seat that sees the picture — both on a split, where
 * each reads the half the other paints. It is up from the mimic's arrival
 * until it is spent, and through a roll or a bare core it already names the
 * next picture's reader, so the swap between movements is read before the
 * picture comes.
 */

/** The picture the siren speaks for: the step lit, or the next to ask for one. */
function picture(world: World): MimicStep | null {
  const s = mimicBoss(world);
  if (s === null || s.phase === "spent") return null;
  return (
    s.steps.slice(s.cursor).find((step) => step.ask === "sign" || step.ask === "split") ?? null
  );
}

/** Whether THE MIMIC is up and has a picture still to ask for. */
export function mimicSirenUp(world: World): boolean {
  return picture(world) !== null;
}

/** The reader's chip lit — both on a split — or null with no picture to come. */
export function mimicCall(world: World): CommsCall | null {
  const step = picture(world);
  if (step === null) return null;
  if (step.ask === "split") return { p1: true, p2: true };
  return { p1: step.reader === 1, p2: step.reader === 2 };
}

/** Seat `seat`'s job: say where, tap where told, or on a split both. */
function job(step: MimicStep, seat: 1 | 2): string {
  const other = seat === 1 ? 2 : 1;
  const tell = `TELL P${other} WHERE`;
  const tap = `TAP WHERE P${other} SAYS`;
  if (step.ask === "split") return `${tell} · ${tap}`;
  return step.reader === seat ? `TILES · ${tell}` : tap;
}

/** This screen's job under the dial, or null with no picture to come. */
export function mimicDuty(role: ViewRole, world: World): string | null {
  const step = picture(world);
  if (step === null) return null;
  if (role === "p1") return job(step, 1);
  if (role === "p2") return job(step, 2);
  return `${job(step, 1)} · ${job(step, 2)}`;
}
