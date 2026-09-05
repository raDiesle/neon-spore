/**
 * The two id-to-id tables `bind.ts` reads, and the only *data* in a file that
 * is otherwise a switch.
 *
 * Lifted out when THE CRAWLER's two cues took that file past its 250-line
 * limit, and along a seam it already had: everything left next door is an
 * argument about which sound one moment on the field deserves, and these two
 * are lookups with no argument in them at all — a step of THE MIRROR's
 * sequence is performed with the sound of the thing it is asking for, and a
 * pod is swallowed with the sound of what it gives.
 */

/** One step of a sequence THE MIRROR is showing, as the sound of the control
 * it is asking the pair to press back. */
export const MIRROR_STEP_SOUNDS: Record<string, string> = {
  fireRed: "mirror.showFireRed",
  fireCyan: "mirror.showFireCyan",
  guard: "mirror.showGuard",
  intake: "mirror.showIntake",
  cannonLeft: "mirror.showCannonLeft",
  cannonRight: "mirror.showCannonRight",
};

/** A pod taken in, by what it gives. */
export const POD_TAKEN_SOUNDS: Record<string, string> = {
  mend: "pod.takenMend",
  purge: "pod.takenPurge",
  ward: "pod.takenWard",
};
