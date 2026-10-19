import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { createWorld } from "@neon-spore/sim";
import { bakedEntries } from "../src/baked.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHAT A CACHE KEYED ON SOMETHING THAT MOVES LOOKS LIKE.
 *
 * The house pattern for drawing something expensive cheaply is everywhere in
 * this package: `glow.ts` keys a halo on `${colour}@${radius}`, `key-light.ts`
 * rounds a radius to four pixels and a spin to a twenty-fourth, `sheen.ts`
 * rounds its bloom radius, `depth.ts` quantises its haze into six steps for
 * exactly this reason and says so. Every one of them exists because the failure
 * is not "a slower frame": it is a cache that never hits, baking a canvas per
 * frame *and keeping all of them*.
 *
 * `frame-budget.test.ts` cannot see that. A cache missing every frame costs
 * precisely what having no cache costs, so the op count is unchanged and the
 * budget stays green while the phone fills up. What gives it away is how many
 * things are being held: a quantised key has a small fixed set of answers
 * however long the game runs, and a key that drifts has one per frame.
 *
 * So this is not a ceiling on how much may be baked — bake as much as the
 * picture wants. It is the distance between those two shapes, and the run is
 * long on purpose: four hundred frames, where a single drifting key would put
 * four hundred entries in on its own.
 */

/** Four hundred frames, at `runFrames`'s one frame every fourth tick. */
const TICKS = 1600;
const FRAMES = TICKS / 4;

function entriesAfter(role: "p1" | "p2"): number {
  installCanvasGlobals();
  runFrames(createWorld(CFG, 7, buildQueue(0, CFG.cols)), role, TICKS);
  return bakedEntries();
}

/**
 * What each seat holds after that run. Exact and measured, not padded, the way
 * `frame-budget.test.ts`'s rows are: a number that is allowed to be "about
 * right" is a number nobody notices doubling. A legitimate new sprite raises
 * one of these by the handful of keys it is baked at — remeasure and move the
 * row in the same commit. A change that puts it into the hundreds has not
 * added sprites, it has added a key that moves.
 */
// Four more on each seat from 10 September 2026, when the slick's own motion
// became BANK: it rolls with its own travel through a wider arc than SWALLOW's
// lean, so `key-light.ts`'s twenty-fourth-of-a-turn spin key takes four more
// distinct values on the first wave's slicks — a bounded set, as the run says.
// One more on each seat from 11 September 2026: the light in the sky's
// bottom-right corner (`corner-light.ts`), baked once per size and act tint —
// one key on one wave.
// Thirty-nine fewer on p1 and thirty-six on p2 from 11 September 2026, when
// the owner took GLAND out of `ship:body`: the membrane's bloom and the wet
// socket under every button were baked sprites, and the wet skin and the organ
// that replaced them draw with paths and gradients and bake nothing
// (`ship-gland.ts`).
// One more on p2 from the same day: an organ button's bed — its veins, its
// swelling, its shoulder and its gloss — is held per button position
// (`gland-organ.ts`), and on the first wave only p2 has a button.
// One fewer on each seat from 12 September 2026, when the owner had the solo
// band cut two tiles shorter (`bandSoloPct`): at this harness's stage the
// field was limited by its height and is limited by its width now, so the tile
// grew, and a hull-coloured halo the first wave baked at 23 px is no longer at
// a size of its own (`glow.ts`).
// Five more on each seat from 13 September 2026, when a lost wave stopped
// asking for itself again and began to ask the pair (`lost-screen.ts`): this
// harness answers nothing, so the screen stands for the rest of the run, and
// its two buttons bake the bar's body at their one size and the beads beside
// each word — one key per button part, the same set on every frame.
// One more on each seat from 16 September 2026, when the ship began to bleed
// down the lost screen. It was one rather than thirteen because the rivulets'
// heads all glowed at the same radius: written at each head's own thickness it
// was thirteen sprites, and this test is what said so. The rivulets went on 22
// September 2026 and the number did not move — the bloom behind WAVE LOST
// takes the key they gave up, at one radius for the three it is drawn at
// (`lost-words.ts`), and the wound's own bloom only bakes on a wave that
// scarred the hull, which this harness's first wave does not (`lost-wound.ts`).
// Four fewer on each seat from 17 September 2026, when the lost screen's two
// buttons became the tutorial's plates (`guide-tide-plate.ts`), which the
// owner asked for by name. Four of the five the entry above counts were the
// grown body and its beads; a plate is a rounded rectangle, a gradient and a
// crest, and none of that is a sprite. The one that is left is the halo under
// RETRY's glow.
// Four more on each seat from 15 October 2026, when every living enemy began
// to glance: the glance layer's two scratch canvases (`glance-layer.ts`), and
// one record for each of the two slicks on the field when the run ends, each
// dropped as its body goes (`creature-glance.ts`).
// Two more on each seat from 15 October 2026, when a pass's turned bodies
// began to be laid down ahead of it (`glance-batch.ts`): three atlases and the
// canvas the pass is first run on, where the two scratch layers were.
// Three more on each seat from 16 October 2026: the deep sky under every sky
// (`sky-depth.ts`) bakes its haze, its near stars and one twinkle.
// Three more again the same day: the first wave is under GIANT, whose ring
// now throws a shadow, whose lit limb has a rim, and which has a moon
// (`sky-giant.ts`) — one bake each.
// One fewer on each seat from 17 October 2026, when FIRST STEP's arrivals were
// spread eight beats apart (`soften-intro.ts`): one slick is on the field when
// the run ends, not two, so one glance record.
// Twenty-three more on each seat from 18 October 2026, when the field grew a
// row (`rows` 15 to 16) and the band gave the hull's row a tile: the slick
// that breaks the hull lands at tick 1274 rather than 1199, and its coin falls
// on the hammer rather than the rend (`breach-either.ts`) — whose white core
// and coloured halo bake twenty-one sizes, stepped by `CORE_STEP` as it shrinks
// (`breach-hammer.ts`). One more is a second slick still on the field when the
// run ends, one glance record; and one a purple halo at a radius of its own on
// the shorter band.
// Twelve more on p1 and one on p2 from 19 October 2026, when FIRST STEP began
// to teach on its own field (`wave-hint.ts`): the caption's halo round its
// subject, one size on each seat, and on p1 — whose hint stands on the cannon
// the slick is falling over — the companion ring's halo, which breathes, and
// so is baked at the eleven radii its breath passes through, the same set the
// film baked before it (`guide-tide-caption.ts`).
// Four more on p1 and one on p2 later the same day, when the first rungs began
// to draw the other phone's controls dead (`band-partner.ts`): on p1 player
// 2's two colour buttons, in player 2's skin, bake their halos; on p2 the
// cannon's strip does, once.
const HELD = { p1: 90, p2: 85 } as const;

describe("what the renderer keeps between frames", () => {
  for (const role of ["p1", "p2"] as const) {
    it(`bakes a bounded set of things over ${FRAMES} frames on ${role}`, () => {
      const held = entriesAfter(role);
      expect(held).toBe(HELD[role]);
      // The claim, rather than the number: whatever is held, it is not one
      // thing per frame. Nothing quantised can approach this line.
      expect(held).toBeLessThan(FRAMES / 4);
    });
  }
});
