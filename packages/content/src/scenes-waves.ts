import type { GuideScene } from "./scene-types.js";
import { BULB_QUEEN } from "./scenes/bulb-queen.js";
import { CATCH_AND_AIM } from "./scenes/catch-and-aim.js";
import { HOLD_TOGETHER } from "./scenes/hold-together.js";
import { PINBALL } from "./scenes/pinball.js";
import { SALVAGE } from "./scenes/salvage.js";
import { SNAKE } from "./scenes/snake.js";
import { THE_BALLOON } from "./scenes/the-balloon.js";
import { THE_BEATBOX } from "./scenes/the-beatbox.js";
import { THE_BLISTER } from "./scenes/the-blister.js";
import { THE_CAIRN } from "./scenes/the-cairn.js";
import { THE_CHOIR } from "./scenes/the-choir.js";
import { THE_CLAW } from "./scenes/the-claw.js";
import { THE_COIL } from "./scenes/the-coil.js";
import { THE_FLEET } from "./scenes/the-fleet.js";
import { THE_GAUGE } from "./scenes/the-gauge.js";
import { THE_JAM } from "./scenes/the-jam.js";
import { THE_LANCE } from "./scenes/the-lance.js";
import { THE_LEAK } from "./scenes/the-leak.js";
import { THE_LID } from "./scenes/the-lid.js";
import { THE_MAZE } from "./scenes/the-maze.js";
import { THE_MINE } from "./scenes/the-mine.js";
import { THE_MIRROR } from "./scenes/the-mirror.js";
import { THE_MORSEL } from "./scenes/the-morsel.js";
import { THE_MOULT } from "./scenes/the-moult.js";
import { THE_PULSE } from "./scenes/the-pulse.js";
import { THE_SEEDER } from "./scenes/the-seeder.js";
import { THE_SPLICE } from "./scenes/the-splice.js";
import { THE_WARDEN } from "./scenes/the-warden.js";
import { THE_WELL } from "./scenes/the-well.js";

/**
 * The films of the waves and bosses that are not a family of their own — one
 * per `scenes/` file, in the order they were written.
 *
 * Cut out of `scenes.ts` on 26 September 2026, when ONE LAST CHANCE's film
 * took that file to its 250th line, along the seam `scenes-choreographed.ts`,
 * `scenes-faults.ts` and `scenes-owed.ts` cut before it: the list of ids is one
 * file, and a table of films is another. A new film that belongs to none of
 * those three families is added here — its import, its id and its row;
 * `scenes.ts` spreads this table into `SCENES` and widens `SceneId` by the id.
 */
export type WaveSceneId =
  | "salvage"
  | "catchAndAim"
  | "bulbQueen"
  | "theMirror"
  | "theFleet"
  | "snake"
  | "theLance"
  | "theLeak"
  | "theGauge"
  | "pinball"
  | "theLid"
  | "theMaze"
  | "theWarden"
  | "theCoil"
  | "theClaw"
  | "theChoir"
  | "theJam"
  | "thePulse"
  | "theBalloon"
  | "theBeatbox"
  | "holdTogether"
  | "theCairn"
  | "theWell"
  | "theSplice"
  | "theMoult"
  | "theMorsel"
  | "theSeeder"
  | "theMine"
  | "theBlister";

export const SCENES_WAVES: Record<WaveSceneId, GuideScene> = {
  salvage: SALVAGE,
  catchAndAim: CATCH_AND_AIM,
  bulbQueen: BULB_QUEEN,
  theMirror: THE_MIRROR,
  theFleet: THE_FLEET,
  snake: SNAKE,
  theLance: THE_LANCE,
  theLeak: THE_LEAK,
  theGauge: THE_GAUGE,
  pinball: PINBALL,
  theLid: THE_LID,
  theMaze: THE_MAZE,
  theWarden: THE_WARDEN,
  theCoil: THE_COIL,
  theClaw: THE_CLAW,
  theChoir: THE_CHOIR,
  theJam: THE_JAM,
  thePulse: THE_PULSE,
  theBalloon: THE_BALLOON,
  theBeatbox: THE_BEATBOX,
  holdTogether: HOLD_TOGETHER,
  theCairn: THE_CAIRN,
  theWell: THE_WELL,
  theSplice: THE_SPLICE,
  theMoult: THE_MOULT,
  theMorsel: THE_MORSEL,
  theSeeder: THE_SEEDER,
  theMine: THE_MINE,
  theBlister: THE_BLISTER,
};
