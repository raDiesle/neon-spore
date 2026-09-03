/**
 * The transpose of the SHAPES tab: one body, drawn once per option, on one
 * screen — the third and last thing `docs/decisions.md` #24 asked for.
 *
 * This is what SHAPES opens on now. The owner used the sixty-body catalogue
 * beside this grid for an afternoon and said the question they actually open
 * the page to ask is the one this file answers, not that one — so `index.html`
 * shows this grid first, as OVERVIEW, and holds the catalogue and the three
 * axis rows behind `shapes-controls.ts`'s COMPOSE tab. Nothing below changed
 * for that: this file still just fills
 * `shapesAllBody`/`shapesAllSkins`/`shapesAllMotions`/`shapesAllLight`
 * whenever `renderShapes` runs, whether or not they are the visible half.
 *
 * SHAPES draws sixty bodies wearing one skin, which answers "does this skin
 * work on the catalogue." It cannot answer the other question the owner
 * actually has now that there are twenty skins to choose among: does *this*
 * skin beat that one, on the *same* body? Flipping the skin bar back and
 * forth is not a comparison, it is a tournament nobody runs to the end — the
 * same argument `shapes-pair.ts` made for a two-skin card, now made for all
 * twenty at once instead of two at a time.
 *
 * Three grids, not one, because the skins are only the first axis a body can
 * be walked across. A motion can only be seen today by forcing it on the
 * whole catalogue and remembering the last one — there is no page where all
 * eighteen stand still long enough to be told apart. The light is a third,
 * and it is two cards wide, so it rides along for nearly nothing.
 *
 * **One grid, written once, walked per axis.** The card, the clock, the body
 * picker and the size floor are the same in all three; only the list of
 * options and what each hands to `shapeFigure` differ. `grid()` below is that
 * one function, called three times.
 *
 * **Each grid holds the other two axes at whatever `shapes-pair.ts`'s control
 * row currently says**, read through its three getters. A body demonstrating
 * PERISTALSIS while wearing nothing is a contour, not a look, and a skin held
 * still is half of what a skin is — so a grid never shows its own axis
 * against a blank; it shows it against whatever the reader already picked for
 * the other two.
 *
 * **Every figure on every grid is on the one clock `shape-figure.ts` already
 * runs.** Twenty figures on twenty `t` values would be twenty phases of the
 * same animation, and what would be read is the phase rather than the skin —
 * so nothing here starts a second loop; `shapeFigure` is called the same way
 * `shapes-pair.ts` calls it, and the shared `tick` in that file does the rest.
 *
 * **Size floor.** `bun run shapes:report` at the 92 px frame this page uses
 * puts THE WEIGHT at 60.5 × 49.3 px drawn — comfortably clear of the 20–26 px
 * floor `docs/spec/graphics.md` sets, and the frame does not need to shrink to
 * fit twenty across: a row wraps rather than being forced onto one line, the
 * same choice `shapes-pair.ts` made rather than halve a card. Numbers for
 * smaller frames, checked before picking this one: 80 px → 52.6 × 42.9, 70 px
 * → 46.0 × 37.5, 60 px → 39.4 × 32.2, 50 px → 32.9 × 26.8 (short axis just
 * above the floor), 46 px → 30.2 × 24.7 (short axis under 26), 40 px → 26.3 ×
 * 21.4 (long axis barely clears, short does not). 92 — the same frame the
 * cards above already use — is the first of those with no axis near the
 * floor, so nothing here shrinks past it.
 */

import { MOTIONS } from "@neon-spore/shape-sheet";
import { GLOWS } from "./glows/index.js";
import { HITS } from "./hits/index.js";
import { grid } from "./shapes-grid.js";
import {
  currentGlows,
  currentHits,
  currentLit,
  currentMotion,
  currentSkin,
  currentTails,
} from "./shapes-pair.js";
import { bodyPicker, pickedEntry } from "./shapes-picker.js";
import { SKINS } from "./skins/index.js";
import { TAILS } from "./tails/index.js";

/**
 * The taller card the TAIL row draws into.
 *
 * Every other axis draws something that surrounds the body, so the square
 * 92 px card fits it. A tail is entirely *vertical* — two or three
 * body-heights up and nothing sideways — and in a square frame padded for that
 * the body came out around 25 px: right on the legibility floor
 * `docs/spec/graphics.md` sets, and nothing like the size the field shows it
 * at. At 190 the same body draws near 50 px with the whole tail in shot. It is
 * the fix `isWide` already makes for a hull, turned ninety degrees.
 */
const TAIL_BOX = 190;

export function renderShapesAll(): void {
  const bodyHost = document.getElementById("shapesAllBody");
  if (!bodyHost) return;
  bodyPicker(bodyHost, renderShapesAll);

  const entry = pickedEntry();
  const lit = currentLit();
  const motion = currentMotion();
  const skin = currentSkin();
  const glows = currentGlows();
  const hits = currentHits();
  const tails = currentTails();

  grid(
    "shapesAllSkins",
    entry,
    SKINS.map((s) => ({ label: s.label, skin: s.id, lit, motion, glows, hits, tails })),
  );
  grid(
    "shapesAllMotions",
    entry,
    MOTIONS.map((m) => ({ label: m.name, skin, lit, motion: m, glows, hits, tails })),
  );
  // NONE first and then one glow at a time, never the stack the bar is set to.
  // The other three grids hold their own axis against whatever the reader
  // already picked for the rest, which is right for them — a skin under no
  // glow is still that skin. It is wrong here: a grid of seven cells each
  // showing SWARM plus the one value that cell is named after would be seven
  // pictures of SWARM, and the axis would be unreadable exactly where it is
  // being introduced. So this grid is the one place on the page that overrides
  // its own axis rather than composing with it.
  //
  // Every cell is padded for the *widest* glow rather than for its own, so the
  // eight bodies come out the same size. Padded each for its own, SPARKS drew
  // its body two thirds the width of NONE's and the row read as the axis
  // shrinking things — which is the padding being compared rather than the
  // effect.
  const padFor = GLOWS.map((g) => g.id);
  grid("shapesAllGlows", entry, [
    { label: "NONE", skin, lit, motion, glows: [], padFor, hits, tails },
    ...GLOWS.map((g) => ({
      label: g.label,
      skin,
      lit,
      motion,
      glows: [g.id],
      padFor,
      hits,
      tails,
    })),
  ]);
  // One hit per cell, on the page-wide clock, so the whole row flinches
  // together and the seven can be told apart in one glance. Every cell is
  // padded for the widest of them, for the same reason the glow row is: padded
  // each for its own, RING's body would be two thirds the size of DIM's and
  // the row would be comparing frames.
  const hitPad = HITS.map((h) => h.id);
  grid("shapesAllHits", entry, [
    { label: "NONE", skin, lit, motion, glows, hits: [], padForHits: hitPad, tails },
    ...HITS.map((h) => ({
      label: h.label,
      skin,
      lit,
      motion,
      glows,
      hits: [h.id],
      padForHits: hitPad,
      tails,
    })),
  ]);
  // The one grid whose cells are not all proposals: HALOES and WEDGE are what
  // the game draws now, captioned so, and the rest are offers against them.
  const tailPad = TAILS.map((x) => x.id);
  grid(
    "shapesAllTails",
    entry,
    [
      { label: "NONE", skin, lit, motion, glows, hits, tails: [], padForTails: tailPad },
      ...TAILS.map((x) => ({
        label: x.label,
        skin,
        lit,
        motion,
        glows,
        hits,
        tails: [x.id],
        padForTails: tailPad,
        note: x.shipped ? "IN THE GAME" : undefined,
      })),
    ],
    TAIL_BOX,
  );
  grid("shapesAllLight", entry, [
    { label: "LIT", skin, lit: true, motion, glows, hits, tails },
    { label: "UNLIT", skin, lit: false, motion, glows, hits, tails },
  ]);
}
