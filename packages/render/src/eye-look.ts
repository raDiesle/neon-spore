import { drawEyeBall } from "./eye-ball.js";
import type { IrisDraw } from "./eye-iris.js";

/**
 * THE ONE RECORD A CANDIDATE **EYE** PATCHES.
 *
 * `magnet-look.ts`'s kind, and the only one on the page whose subject is on two
 * bodies at once: `lid.ts` and `warden-eye.ts` both call `drawEyeLens`, and it
 * calls this. So a candidate here is a candidate for THE LID *and* THE WARDEN,
 * and the slot is `eye:iris` rather than either creature's — a vote that
 * improved one and spoiled the other is a vote nobody can cast, and naming the
 * slot after one of them would have hidden that.
 *
 * **One field, because the inside of an eye is one mark.** The pupil used to be
 * drawn by `eye-lens.ts` after the ring and the spokes, which was fine while
 * every mark was concentric with the socket; it is not fine the moment a look
 * places the iris somewhere on a surface, because the hole would stay behind.
 * They are one function now (`eye-iris.ts`), and what is left next door is the
 * lens itself — the aperture the lids open, which is the *readout* the seat
 * without the cord is reading a number off and which no look may touch.
 */
export interface EyeLook {
  /** Everything inside the aperture: the machinery, and the hole in it. */
  readonly iris: (d: IrisDraw) => void;
}

/**
 * `eye-ball.ts` and not `eye-iris.ts`, since 9 September 2026.
 *
 * The two candidates this record was cut for — `glaze` and `turn` — were the
 * two halves of one disagreement about how to make an eye read as round, and
 * the owner asked for them combined rather than choosing between them. So what
 * ships is the dome, the iris travelling on the ball under it, and the wet
 * point that stays where the light is. `eye-iris.ts` is still the *machinery*
 * — the ring, the six spokes and the hole — drawn wherever the look puts it.
 */
export const EYE_LOOK: EyeLook = { iris: drawEyeBall };
