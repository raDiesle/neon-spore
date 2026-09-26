import type { GuideScene } from "./scene-types.js";
import { BULB_QUEEN } from "./scenes/bulb-queen.js";
import { CATCH_AND_AIM } from "./scenes/catch-and-aim.js";
import { CYAN } from "./scenes/cyan.js";
import { FIRST_STEP } from "./scenes/first-step.js";
import { ONE_LAST_CHANCE } from "./scenes/one-last-chance.js";
import { PINBALL } from "./scenes/pinball.js";
import { SALVAGE } from "./scenes/salvage.js";
import { SNAKE } from "./scenes/snake.js";
import { THE_BALLOON } from "./scenes/the-balloon.js";
import { THE_BEATBOX } from "./scenes/the-beatbox.js";
import { THE_CAIRN } from "./scenes/the-cairn.js";
import { THE_CAROM } from "./scenes/the-carom.js";
import { THE_CHOIR } from "./scenes/the-choir.js";
import { THE_CLASP } from "./scenes/the-clasp.js";
import { THE_CLAW } from "./scenes/the-claw.js";
import { THE_COIL } from "./scenes/the-coil.js";
import { THE_CRAWLER } from "./scenes/the-crawler.js";
import { THE_CROSSING } from "./scenes/the-crossing.js";
import { THE_CRYSTAL } from "./scenes/the-crystal.js";
import { THE_CUT } from "./scenes/the-cut.js";
import { THE_DART } from "./scenes/the-dart.js";
import { THE_ECHO } from "./scenes/the-echo.js";
import { THE_FENCE } from "./scenes/the-fence.js";
import { THE_FLEET } from "./scenes/the-fleet.js";
import { THE_GAP } from "./scenes/the-gap.js";
import { THE_GAUGE } from "./scenes/the-gauge.js";
import { THE_GHOST } from "./scenes/the-ghost.js";
import { THE_GUM } from "./scenes/the-gum.js";
import { THE_GYRE } from "./scenes/the-gyre.js";
import { THE_HAND } from "./scenes/the-hand.js";
import { THE_JAM } from "./scenes/the-jam.js";
import { THE_LANCE } from "./scenes/the-lance.js";
import { THE_LEAK } from "./scenes/the-leak.js";
import { THE_LID } from "./scenes/the-lid.js";
import { THE_LURE } from "./scenes/the-lure.js";
import { THE_MAGNET } from "./scenes/the-magnet.js";
import { THE_MAZE } from "./scenes/the-maze.js";
import { THE_MINE } from "./scenes/the-mine.js";
import { THE_MIRROR } from "./scenes/the-mirror.js";
import { THE_MOULT } from "./scenes/the-moult.js";
import { THE_PULSE } from "./scenes/the-pulse.js";
import { THE_PURGE } from "./scenes/the-purge.js";
import { THE_RECOIL } from "./scenes/the-recoil.js";
import { THE_RIND } from "./scenes/the-rind.js";
import { THE_ROCK } from "./scenes/the-rock.js";
import { THE_SPLICE } from "./scenes/the-splice.js";
import { THE_STRAND } from "./scenes/the-strand.js";
import { THE_THIRD_SHOT } from "./scenes/the-third-shot.js";
import { THE_THROB } from "./scenes/the-throb.js";
import { THE_TORCH } from "./scenes/the-torch.js";
import { THE_VANE } from "./scenes/the-vane.js";
import { THE_VEER } from "./scenes/the-veer.js";
import { THE_VEIL } from "./scenes/the-veil.js";
import { THE_VOLLEY } from "./scenes/the-volley.js";
import { THE_WARD } from "./scenes/the-ward.js";
import { THE_WARDEN } from "./scenes/the-warden.js";
import { THE_WEIGHT } from "./scenes/the-weight.js";
import { THE_WELL } from "./scenes/the-well.js";
import { THE_WISP } from "./scenes/the-wisp.js";
import { TWO_ROCKS } from "./scenes/two-rocks.js";

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
  | "firstStep"
  | "cyan"
  | "theRock"
  | "twoRocks"
  | "theHand"
  | "torch"
  | "oneLastChance"
  | "theLure"
  | "theThrob"
  | "theDart"
  | "theVeil"
  | "salvage"
  | "catchAndAim"
  | "theThirdShot"
  | "theClasp"
  | "theRind"
  | "thePurge"
  | "theWard"
  | "theEcho"
  | "theGhost"
  | "theWisp"
  | "theGyre"
  | "theRecoil"
  | "theVane"
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
  | "theCarom"
  | "theCrystal"
  | "theGum"
  | "theClaw"
  | "theVolley"
  | "theFence"
  | "theGap"
  | "theCut"
  | "theChoir"
  | "theVeer"
  | "theStrand"
  | "theCrawler"
  | "theMagnet"
  | "theJam"
  | "theCrossing"
  | "thePulse"
  | "theBalloon"
  | "theBeatbox"
  | "theWeight"
  | "theCairn"
  | "theWell"
  | "theSplice"
  | "theMoult"
  | "theMine";

export const SCENES_WAVES: Record<WaveSceneId, GuideScene> = {
  firstStep: FIRST_STEP,
  cyan: CYAN,
  theRock: THE_ROCK,
  twoRocks: TWO_ROCKS,
  theHand: THE_HAND,
  torch: THE_TORCH,
  oneLastChance: ONE_LAST_CHANCE,
  theLure: THE_LURE,
  theThrob: THE_THROB,
  theDart: THE_DART,
  theVeil: THE_VEIL,
  salvage: SALVAGE,
  catchAndAim: CATCH_AND_AIM,
  theThirdShot: THE_THIRD_SHOT,
  theClasp: THE_CLASP,
  theRind: THE_RIND,
  thePurge: THE_PURGE,
  theWard: THE_WARD,
  theEcho: THE_ECHO,
  theGhost: THE_GHOST,
  theWisp: THE_WISP,
  theGyre: THE_GYRE,
  theRecoil: THE_RECOIL,
  theVane: THE_VANE,
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
  theCarom: THE_CAROM,
  theCrystal: THE_CRYSTAL,
  theGum: THE_GUM,
  theClaw: THE_CLAW,
  theVolley: THE_VOLLEY,
  theFence: THE_FENCE,
  theGap: THE_GAP,
  theCut: THE_CUT,
  theChoir: THE_CHOIR,
  theVeer: THE_VEER,
  theStrand: THE_STRAND,
  theCrawler: THE_CRAWLER,
  theMagnet: THE_MAGNET,
  theJam: THE_JAM,
  theCrossing: THE_CROSSING,
  thePulse: THE_PULSE,
  theBalloon: THE_BALLOON,
  theBeatbox: THE_BEATBOX,
  theWeight: THE_WEIGHT,
  theCairn: THE_CAIRN,
  theWell: THE_WELL,
  theSplice: THE_SPLICE,
  theMoult: THE_MOULT,
  theMine: THE_MINE,
};
