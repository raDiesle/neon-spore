import type { MagnetDraw } from "./magnet.js";
import { coil } from "./magnet-coil.js";

/**
 * THE ONE RECORD A CANDIDATE MAGNET LOOK PATCHES.
 *
 * A file of its own, and not the bottom of `magnet.ts`, because the paint
 * needs that file's paths and this needs the paint: a record living beside the
 * geometry would make the two import each other. `dart-look.ts` sits beside
 * `dart-torch.ts` for exactly this reason.
 *
 * The draw goes through a record for `STRAND_LOOK`'s: a candidate look is a
 * field patched onto it for the length of one `draw()`, and a call site that
 * named the function would never see one (`docs/versus.md`).
 */
export const MAGNET_LOOK: { body: (d: MagnetDraw) => void } = { body: coil };
