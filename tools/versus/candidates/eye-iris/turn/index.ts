import * as eyeLook from "../../../../../packages/render/src/eye-look.js";
import { patch, type Variant } from "../../../variant.js";
import { turn } from "./paint.js";

/**
 * `eye:iris` / `turn` — the eye looks somewhere, instead of being an eye whose
 * whole picture has been translated.
 *
 * **This slot is on two bodies at once, and the pair must judge it on both.**
 * `lid.ts` and `warden-eye.ts` both call `drawEyeLens`, which calls the record
 * this patches, so a vote here moves THE LID *and* THE WARDEN. That is why the
 * slot is `eye:iris` rather than either creature's: a look that improved the
 * small body and spoiled the big one is a vote nobody can cast, and a slot
 * named after one of them would have hidden the question. The pose is a lid,
 * where the eye is the whole picture and the difference is largest;
 * `WARDEN · ARMOURED` in the gallery is the second picture, and it should be
 * opened before this is voted on.
 *
 * **What the shipped side is.** The roundest thing in the game, drawn with no
 * depth on it at all. The iris is concentric with the socket and every mark on
 * it sits at a fixed screen offset, so an eye that is *looking somewhere* would
 * be an eye whose entire picture had been slid sideways — which is why it never
 * looks anywhere. It opens and shuts, and that is the whole of what it does.
 *
 * **What this argues.** An eye is the textbook case for a placed surface. The
 * iris is a disc pinned at a longitude on a ball and carried round by a slow
 * sweep: `facet` puts it where the sphere puts it, `scale(sx, sy)` is the
 * tangent plane's own map — so the disc squashes to an ellipse toward the edge
 * rather than shrinking, and the spokes squash with it — and `surfaceDim`
 * takes the light off it as it turns away. Then the wet film's catchlight is
 * drawn **outside that transform**, at `KEY`, where it stays while the iris
 * travels under it.
 *
 * That contrast is the whole claim: a mark that moves against a mark that does
 * not is the cheapest solid-looking thing there is (`docs/dimensional.md`), and
 * it is being spent here on one record that draws two of the biggest bodies in
 * the game.
 *
 * **The readout is untouched, and it had to be.** The height of the aperture is
 * what the seat without the cord reads the tension off, and none of this
 * reaches it — the lens, its two lids and the number they carry are
 * `eye-lens.ts`, next door, and a candidate here cannot patch them. What moves
 * is only what is *inside* the gap.
 *
 * **How it can lose, and the pair should watch for exactly this.** *A warden
 * with a wandering eye is a boss that looks distracted.* On THE LID the sweep
 * reads as a body searching; on a boss the pair are trying to shoot, the same
 * motion may read as the target moving, and the one thing a fixture must not
 * do is look like it is dodging — this game's whole field rule is that nothing
 * the players control travels, and a boss that appears to is a lie about the
 * fight. If the warden's eye starts feeling like something to lead a shot on,
 * that is this look. And the catchlight is a second bright mark inside an
 * aperture the pair are already reading a colour and a height off; if the eye
 * gets busier to look at rather than easier, that is the same defect from the
 * other side.
 */
export const EYE_TURN: Variant = {
  slot: "eye:iris",
  name: "turn",
  sentence:
    "the iris travels across the eye as a disc on a ball — squashing toward the edge and losing the light as it goes — under a catchlight that stays exactly where the light is",
  dir: "tools/versus/candidates/eye-iris/turn",
  patches: [
    patch({
      target: eyeLook.EYE_LOOK,
      // No accessor: `eye-lens.ts` reads the export itself, inside the clip it
      // has already opened. The module namespace is the whole route there is.
      reached: () => eyeLook.EYE_LOOK,
      where: {
        file: "packages/render/src/eye-look.ts",
        symbol: "EYE_LOOK",
        type: "EyeLook",
      },
      fields: { iris: turn },
    }),
  ],
};
