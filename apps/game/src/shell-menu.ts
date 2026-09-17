import { demoRows } from "./demo-menu.js";
import type { Installer } from "./install.js";
import type { JoinScreen } from "./join.js";
import type { Link } from "./link.js";
import type { MenuBindings } from "./menu-bindings.js";
import type { ShellParts } from "./shell.js";

/**
 * What the shell hands the menu — beside `shell.ts` rather than inside it.
 *
 * It was the `bindMainMenu({ … })` argument in `bindShell`, forty-five lines
 * of wiring in a file two lines under its ceiling (`docs/queue.md`, 17
 * September 2026). Nothing in it reads the shell's closure but the four
 * things in `MenuDeps`, and nothing in it is *order*: the order the shell
 * keeps — the link built first, the three screens before it reports, the
 * `opensOnMenu` gate below the bind — is the whole reason that file is one
 * knot, and it all stays there. This is the part that is only a shape.
 */
export interface MenuDeps {
  joinScreen: JoinScreen;
  link: Link;
  /** The home-screen offer, read at the press: the browser makes it after
   * the menu is bound (`install.ts`). */
  installer: () => Installer | null;
  leaveRoom: () => void;
}

export function menuWiring(p: ShellParts, deps: MenuDeps): MenuBindings {
  return {
    jumpToWave: p.jumpToWave,
    run: p.run,
    wave: () => p.world.wave,
    seat: p.seat,
    setSeat: p.setSeat,
    openRoom: () => deps.joinScreen.open(true),
    // The way back into a room the pair already share (`pairing.ts`). The
    // room screen opens with it, because the pair still have to press START.
    joinRoom: (room) => {
      deps.joinScreen.open(true);
      deps.link.join(room);
    },
    leaveRoom: deps.leaveRoom,
    settings: {
      setSound: p.setSound,
      // The animations are CSS, so the switch is a class. `data-motion` and
      // not a plain class, so it can win in *both* directions against the
      // phone's own `prefers-reduced-motion` — a player who asked their
      // phone for less motion and wants this one to move must be able to.
      setMotion: (on) => {
        document.body.dataset.motion = on ? "on" : "off";
      },
      install: () => deps.installer()?.offer(),
      canInstall: () => deps.installer()?.available() ?? false,
    },
    openTuning: p.openTuning,
    openIntro: (back) => p.intro.open(back),
    demos: demoRows(),
    openDemo: p.openDemo,
  };
}
