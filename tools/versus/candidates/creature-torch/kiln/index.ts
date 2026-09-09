import { facet, LAT_LIMIT, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { ball, EMBER_FLOOR, flicker } from "../../../../../packages/render/src/torch-ball.js";
import * as torchLook from "../../../../../packages/render/src/torch-look.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:torch` / `kiln` — the heat is **inside** the stone, and what shows
 * on its face is where the rock has split.
 *
 * **What the shipped side is.** Fire lying on the skin: eighteen tongues at
 * fixed longitudes, turning with the rock, hidden for half of every turn. Every
 * mark is something *on* the stone, so what the pair reads is a rock covered in
 * flame.
 *
 * **What this argues.** That the more solid picture is a rock burning from
 * within. The tongues become **seams**: seven long thin cracks, placed at
 * longitudes and latitudes exactly as before and foreshortened by the same
 * tangent plane, but drawn as pale slits with a dim wash around each rather
 * than as tongues laid over the surface. A seam near the meridian is a bright
 * line across the face; a seam near the limb is a hairline crawling; a seam on
 * the far side is gone, because the rock is in the way. The turn is untouched —
 * this is the shipped rotation with a different thing riding it.
 *
 * And a **key light**: one warm bloom up and to the left of the stone's centre,
 * additive like everything else here, so the rock has a top. The shipped fire
 * is even the whole way round, which is honest about a body that is its own
 * light source and is also why a torch reads flatter than a plain meteor three
 * columns away — a meteor has `key-light.ts` on it and this creature has been
 * lit from nowhere.
 *
 * **How it can lose.** *It stops being a fireball.* The owner asked for the
 * fire much bigger, more like a big fireball, and a stone whose face carries
 * seven thin lines instead of nine broad tongues gives the near hemisphere far
 * less light. At twenty-six pixels the seams may vanish altogether and leave a
 * grey rock in a ring of fire — which is the look this creature was moved away
 * from. Judge it small before judging it large.
 */

/** Seams, and where they sit. Seven rather than eighteen: a crack is a long
 * mark, and a face crossed by nine of them is a net rather than a broken rock. */
const SEAMS = 7;
const REACH = 1.02;
const SPIN_SECONDS = 4.5;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** How long a seam is along the surface and how wide, as shares of the radius.
 * Long and very thin — the aspect is what makes it read as a split rather than
 * as a smear. */
const SEAM_LONG = 0.62;
const SEAM_WIDE = 0.055;

/** The wash around a seam: the same mark, wider and dimmer, so the light looks
 * like it is coming *out* of the crack rather than painted along it. */
const WASH = 3.4;

/** Where the light stands, in stone radii from the centre, and how far it
 * reaches. Up and to the left, which is where every other lit thing in this
 * game is lit from (`key-light.ts`). */
const KEY_X = -0.34;
const KEY_Y = -0.4;
const KEY_REACH = 0.62;

const PINS = Array.from({ length: SEAMS }, (_, i) =>
  pin(i * GOLDEN * 2, Math.sin(i * 2.3) * LAT_LIMIT * 0.7, REACH),
);

export const TORCH_KILN: Variant = {
  slot: "creature:torch",
  name: "kiln",
  sentence:
    "the heat is inside the rock and shows through where it has split — seven turning seams instead of tongues laid on the skin, and one warm light so the stone has a top",
  dir: "tools/versus/candidates/creature-torch/kiln",
  patches: [
    patch({
      target: torchLook.TORCH_LOOK,
      reached: () => torchLook.TORCH_LOOK,
      where: {
        file: "packages/render/src/torch-look.ts",
        symbol: "TORCH_LOOK",
        type: "TorchLook",
      },
      fields: {
        flame: (d) => {
          const { ctx, r, time } = d;
          const theta = (time / SPIN_SECONDS) * Math.PI * 2;
          ball(ctx, r, theta, time);
          d.stone();
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          // The light first, so the seams are read against a stone that already
          // has a top rather than over a flat one.
          halo(ctx, r * KEY_X, r * KEY_Y, r * KEY_REACH, PALETTE.emberRim, 0.2);
          for (let i = 0; i < PINS.length; i++) {
            const p = PINS[i];
            if (!p) continue;
            const f = facet(p, theta);
            if (!f.near) continue;
            const edge = Math.abs(f.sx);
            const heat = flicker(i, time) * surfaceDim(EMBER_FLOOR, edge);
            ctx.save();
            ctx.translate(f.x * r, f.y * r);
            // The tangent plane's own map. A seam laid out in picture
            // coordinates and squashed as a picture would read as a sticker
            // shrinking (`.claude/skills/depth`).
            ctx.scale(Math.max(0.06, edge), f.sy);
            // Each seam lies at its own angle on the surface, so seven of them
            // never read as one combed texture.
            ctx.rotate(i * 1.31);
            ctx.fillStyle = rgba(PALETTE.ember, 0.3 * heat);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * SEAM_LONG * 0.6, r * SEAM_WIDE * WASH, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(PALETTE.emberRim, 0.95 * heat);
            ctx.beginPath();
            ctx.ellipse(0, 0, r * SEAM_LONG * 0.5, r * SEAM_WIDE, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        },
      },
    }),
  ],
};
