import { waveGuideSteps } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, guidePage, startWave } from "@neon-spore/sim";
import { type Pose, run, POSE_TPB as TPB } from "./pose-kit.js";

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
