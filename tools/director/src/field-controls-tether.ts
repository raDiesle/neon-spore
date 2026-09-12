import {
  DEFAULT_TETHER_LOOK,
  TETHER_LOOKS,
  type TetherLookName,
  useTetherLook,
} from "@neon-spore/render";
import { frameWorld } from "./pose-art.js";
import { poseNamed } from "./poses.js";

/**
 * THE WARDEN'S rope in each of the four looks the game keeps, drawn under its
 * row on the ON THE FIELD tab.
 *
 * `creature:tether` went to VERSUS with three answers to the shipped stroke
 * and the owner kept all four (12 September 2026): *I like all the
 * alternatives; I will need them for special pull mechanics later on —
 * document it all, as real examples, on the documentation's Controls → On the
 * Field.* So this is not a description of four ropes. It is the same posed
 * world — `TETHER · HELD TAUT`, the rope pulled taut — drawn four times by the
 * shipping renderer, once with each look switched on, and the switch put back
 * afterwards. `render/tether-looks.ts` holds the looks and the switch; the
 * words under each picture say which is on the field and how a mechanic would
 * put another one there.
 */

/** Wide, and cut close: a whole field at a card's width makes every rope a
 * hairline, and four hairlines are one picture. This is the eye's underside
 * — where the four roots differ — and the top four tiles of the line. */
const WIDTH = 330;
const SPAN = 4.5;

/** What each rope is, in a line a reader can hold against the picture. */
const WORDS: Readonly<Record<TetherLookName, string>> = {
  twist:
    "TWIST — two strands wound round each other. Slack, the lay is open and crawls; pulled, it winds tight.",
  stroke:
    "STROKE — one glowing line that thins and brightens as it is pulled. What the rope was before.",
  cord: "CORD — a round rope with a shadow, a body and a highlight, hardening as it is pulled, through a grommet.",
  sinew:
    "SINEW — a tendon of the boss's own flesh, thick at the eye and thin at the hand, with pulses running up it.",
};

const ORDER: readonly TetherLookName[] = ["twist", "stroke", "cord", "sinew"];

export function tetherExamples(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "tether-looks";

  const intro = document.createElement("p");
  intro.className = "note";
  intro.textContent =
    "The rope can be drawn four ways. TWIST is what the field draws now; the " +
    "other three are kept for pull mechanics to come. Same frame, same pull, " +
    "four ropes, cut close under the eye — look at where each line leaves the eye and at the line itself.";
  wrap.appendChild(intro);

  const grid = document.createElement("div");
  grid.className = "tether-looks-grid";
  const world = poseNamed("TETHER · HELD TAUT").build();
  const b = world.boss;
  const at =
    b !== null && b.kind === "warden"
      ? { col: b.pupilCol, row: world.cfg.wardenRow + 2 }
      : { col: 5, row: 4 };
  try {
    for (const name of ORDER) {
      useTetherLook(name);
      const cell = document.createElement("figure");
      const shot = document.createElement("div");
      shot.className = "field-control-shot";
      shot.appendChild(frameWorld(world, "p1", "tile", WIDTH, at, SPAN).canvas);
      const cap = document.createElement("figcaption");
      cap.textContent =
        name === DEFAULT_TETHER_LOOK ? `${WORDS[name]} On the field now.` : WORDS[name];
      cell.append(shot, cap);
      grid.appendChild(cell);
    }
  } finally {
    // Whatever was drawn here, the game's own rope is the owner's pick again.
    useTetherLook(DEFAULT_TETHER_LOOK);
  }
  wrap.appendChild(grid);

  const how = document.createElement("p");
  how.className = "note";
  how.textContent =
    `To put one of these on the field: useTetherLook("${ORDER.join('" | "')}") ` +
    "in packages/render/src/tether-looks.ts changes every rope from the next " +
    "frame. A rope per body would carry the look's name on the creature and " +
    `read it in drawTether — not built yet. ${Object.keys(TETHER_LOOKS).length} looks, all kept.`;
  wrap.appendChild(how);
  return wrap;
}
