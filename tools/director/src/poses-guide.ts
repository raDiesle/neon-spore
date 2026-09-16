import { waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, guidePage, lostAsks, startWave } from "@neon-spore/sim";
import { type Pose, run, POSE_TPB as TPB, until } from "./pose-kit.js";

/**
 * A page of a tutorial's film, on player 1's phone.
 *
 * `guide:chrome` is judged here — the band across the top that says
 * TUTORIAL and whose screen this is, the bar the pages are turned by, and the
 * box a page's words stand in (`packages/render/src/guide-look.ts`). None of
 * that is on any other pose: every card in the gallery is the field at play,
 * and the chrome only exists while a guide holds the wave open.
 *
 * The wave is the first one, FIRST STEP, because its film is the one every
 * pair meets first, and the page is its second — PLAYER 1 MOVES CANNON — so
 * that the caption is on a control with a hand on it and the film is one page
 * in: BACK has somewhere to go, and once the page has played out, NEXT is
 * asking to be pressed, which is the state the bar is loudest in. The page is
 * turned by the seat's own `guideStep` command rather than set, the way
 * every pose reaches its state (`pose-kit.ts`).
 */
export const GUIDE_FILM_POSE: Pose = {
  name: "GUIDE · A PAGE OF FILM",
  note: "Player 1's phone on the second page of the first tutorial. The band at the top says TUTORIAL and whose screen this is, the words stand beside the cannon a ghost thumb is sliding, and the bar underneath turns the pages.",
  lookAt:
    "the band across the top, the box of words beside the cannon, and the bar of three buttons at the foot — whether the whole thing reads as a tutorial and not the live game",
  elsewhere: [
    {
      label: "Clash Royale's screens on Game UI Database",
      href: "https://www.gameuidatabase.com/gameData.php?id=1299",
    },
    {
      label: "Clash Royale on Interface In Game",
      href: "https://interfaceingame.com/games/clash-royale/",
    },
    {
      label: "Clash Royale's Training Camp on the wiki",
      href: "https://clashroyale.fandom.com/wiki/Training_Camp",
    },
  ],
  crop: "full",
  role: "p1",
  build: () => {
    const w = createWorld({ ...DEFAULT_CONFIG, hullInvulnerable: true, briefings: true }, 11);
    startWave(w, 0, [], [], null, true, waveGuideSteps(0));
    run(w, TPB, [{ tick: w.tick, player: 1, command: { kind: "guideStep" } }]);
    if (guidePage(w, 1) !== 1) throw new Error("the guide did not turn to its second page");
    return w;
  },
};

/**
 * The screen a lost wave stops on, with the field held under it and the hole
 * the rock made still on the ship.
 *
 * `lost:screen` is judged here, and this is the one pose in the gallery whose
 * *rule* has to be switched on to reach it: every other pose runs with
 * `hullInvulnerable`, which is exactly what stops a wave being lost, so a
 * breach anywhere else in this tool leaves the run standing. Here the hull is
 * live, one rock is left alone in the middle of the ship, and the world is run
 * until the pause has spent itself into the question (`sim/wave-fail.ts`).
 *
 * Nothing is assigned: the wave is lost because a rock was allowed through,
 * and the screen is up because `failTick` ran its own clock out. What the slot
 * is voted on is whether a full-screen statement can be made without covering
 * the breach the pair is meant to be looking at, so the rock goes down at a
 * column off the middle — the cannon and the dome both rest there, and a hole
 * under either of them is a hole nobody can see.
 */
export const LOST_SCREEN_POSE: Pose = {
  name: "LOST · THE WAVE GONE",
  note: "A rock nobody turned goes through the hull, which loses the wave. The field is held where it stood, the hole is still in the ship, and the pair is asked whether to run the wave again or leave.",
  lookAt:
    "whether the screen says the wave is to be played again, and whether the place the ship was broken is still visible under it",
  crop: "full",
  build: () => {
    const w = createWorld({ ...DEFAULT_CONFIG, hullInvulnerable: false }, 11);
    startWave(w, 0, [{ beat: 0, col: 3, kind: "meteorMedium", color: null }], [], null, false, 0);
    until(w, "the lost screen asking the pair", (x) => lostAsks(x));
    return w;
  },
};
