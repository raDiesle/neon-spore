import type { GuideScene } from "./scene-types.js";
import { BULB_QUEEN } from "./scenes/bulb-queen.js";
import { PINBALL } from "./scenes/pinball.js";
import { SNAKE } from "./scenes/snake.js";
import { THE_CAIRN } from "./scenes/the-cairn.js";
import { THE_CLAW } from "./scenes/the-claw.js";
import { THE_FLEET } from "./scenes/the-fleet.js";
import { THE_GAUGE } from "./scenes/the-gauge.js";
import { THE_MAZE } from "./scenes/the-maze.js";
import { THE_MIRROR } from "./scenes/the-mirror.js";
import { THE_PULSE } from "./scenes/the-pulse.js";
import { THE_SPLICE } from "./scenes/the-splice.js";
import { THE_WARDEN } from "./scenes/the-warden.js";
import { THE_WELL } from "./scenes/the-well.js";

/**
 * The films of the waves and bosses that are not a family of their own — one
 * per `scenes/` file, in the order they were written.
 *
 * Cut out of `scenes.ts` on 26 September 2026, when ONE LAST CHANCE's film
 * took that file to its 250th line, along the seam `scenes-choreographed.ts`,
 * the faults' table and `scenes-owed.ts` cut before it: the list of ids is one
 * file, and a table of films is another. A new film that belongs to none of
 * those three families is added here — its import, its id and its row;
 * `scenes.ts` spreads this table into `SCENES` and widens `SceneId` by the id.
 */
export type WaveSceneId =
  | "bulbQueen"
  | "theMirror"
  | "theFleet"
  | "snake"
  | "theGauge"
  | "pinball"
  | "theMaze"
  | "theWarden"
  | "theClaw"
  | "thePulse"
  | "theCairn"
  | "theWell"
  | "theSplice";

export const SCENES_WAVES: Record<WaveSceneId, GuideScene> = {
  bulbQueen: BULB_QUEEN,
  theMirror: THE_MIRROR,
  theFleet: THE_FLEET,
  snake: SNAKE,
  theGauge: THE_GAUGE,
  pinball: PINBALL,
  theMaze: THE_MAZE,
  theWarden: THE_WARDEN,
  theClaw: THE_CLAW,
  thePulse: THE_PULSE,
  theCairn: THE_CAIRN,
  theWell: THE_WELL,
  theSplice: THE_SPLICE,
};
