import type { MechanicId } from "@neon-spore/content";
import type { PlayerId } from "@neon-spore/net";
import type { ViewRole } from "@neon-spore/render";
import type { SimConfig, World } from "@neon-spore/sim";
import { type DemoRow, demoRows } from "./demo-menu.js";
import { bindHoldCard } from "./hold.js";
import { bindInstall, type Installer } from "./install.js";
import { type Intro, opensIntro, readIntroSeen } from "./intro.js";
import { bindJoinScreen, type JoinScreen, roomRequested } from "./join.js";
import { createLink, type Link } from "./link.js";
import { bindMainMenu, type MainMenu, opensOnMenu } from "./menu.js";
import type { CommandSource } from "./relay.js";
import type { RunState } from "./run-state.js";
import { hasMotionChoice, readSettings } from "./settings.js";

/**
 * Everything around the field: the menu, the room screen, the bad-line card
 * and the link they all report.
 *
 * They are one file because they are one knot — the link's status goes to all
 * three, the menu opens the room screen, the room screen goes back to the
 * menu, and every one of them can end the run. Wiring that in `main.ts` put
 * four mutually-recursive `let`s at the top of the file that starts the game,
 * and pushed it past the 250-line ceiling; here the recursion is local and the
 * knot has a name.
 *
 * The order below is the only one that works. The link reports a status the
 * moment it is built, so the three screens must exist first — and each of them
 * needs the link, which is why they reach it through the closure rather than
 * through an argument.
 */
export interface ShellParts {
  cfg: SimConfig;
  world: World;
  buffer: CommandSource;
  run: RunState;
  jumpToWave: (wave: number) => void;
  /** The view switch, which the room overrules the moment it hands out a seat. */
  seat: () => ViewRole;
  setSeat: (role: ViewRole) => void;
  openTuning: () => void;
  /** The mixer's mute, for the settings page's SOUND switch. */
  setSound: (on: boolean) => void;
  /** Switches the run to a demonstration's config and opens its wave. */
  openDemo: (id: MechanicId) => void;
  /**
   * Beat zero. Called after every sheet has been put away and every hold on
   * the world has been let go, so what it does is only the run itself.
   */
  onStart: (player: PlayerId) => void;
  /**
   * The six pages that say what this game is (`intro.ts`). The shell decides
   * *when*: on a device that has never seen them they are the front door, and
   * the menu comes up behind them when they are done.
   */
  intro: Intro;
}

/**
 * The motion choice, put on the body before anything animates.
 *
 * Only when this device has actually made one: with nothing stored the phone's
 * own `prefers-reduced-motion` decides, which is what decided before the
 * switch existed. See `hasMotionChoice`.
 */
function applyMotion(): void {
  if (!hasMotionChoice()) return;
  document.body.dataset.motion = readSettings().motion ? "on" : "off";
}

export function bindShell(p: ShellParts): Link {
  applyMotion();
  let joinScreen: JoinScreen | null = null;
  /** The home-screen offer, once the browser has made one. See `install.ts`. */
  let installer: Installer | null = null;
  let menu: MainMenu | null = null;

  const link = createLink({
    cfg: p.cfg,
    world: p.world,
    buffer: p.buffer,
    onStart: (player) => {
      // The room hands out the seat, so the view follows it rather than
      // whatever this device was last left on.
      p.setSeat(player === 1 ? "p1" : "p2");
      // Beat zero is not a moment to argue with: whatever was holding the
      // world — the menu, a thumb, the panel — lets go, on both devices.
      menu?.close();
      joinScreen?.open(false);
      p.run.release();
      p.onStart(player);
    },
    onStatus: (status) => {
      joinScreen?.update(status);
      menu?.update(status);
      hold.update(status);
    },
  });

  const hold = bindHoldCard({ leave: () => link.leave() });
  joinScreen = bindJoinScreen({
    join: (room) => link.join(room),
    leave: () => link.leave(),
    ready: () => link.ready(),
    back: () => menu?.open(),
  });

  /**
   * WHAT THIS IS, from the room screen — bound here rather than in `join.ts`
   * because it is a move *between* screens, which is this file's whole job,
   * and because that one is at its line limit.
   *
   * It is the one place in the app where somebody meets the game without
   * having passed the menu: they were sent a link and they are looking at a
   * four-character code. The screen steps aside while the pages are up — it is
   * opaque, and they are drawn on the canvas underneath it — and comes back.
   */
  document.getElementById("joinWhat")?.addEventListener("click", () => {
    joinScreen?.open(false);
    p.intro.open(() => joinScreen?.open(true));
  });

  // The home-screen shortcut (`install.ts`), and the room the address named.
  void bindInstall().then((made) => {
    installer = made;
  });
  joinScreen.invite();

  /**
   * The menu is the front door: a plain address lands on it and the field is
   * one press away. `?play` is the way past it — for `tools/frames` and for a
   * tester opening one wave — and that build binds no menu at all, so nothing
   * of it is on the screen either.
   */
  if (opensOnMenu(location.href)) {
    const demos: DemoRow[] = demoRows();
    menu = bindMainMenu({
      jumpToWave: p.jumpToWave,
      run: p.run,
      wave: () => p.world.wave,
      seat: p.seat,
      setSeat: p.setSeat,
      openRoom: () => joinScreen?.open(true),
      // The way back into a room the pair already share (`pairing.ts`). The
      // room screen opens with it, because the pair still have to press START.
      joinRoom: (room) => {
        joinScreen?.open(true);
        link.join(room);
      },
      leaveRoom: () => link.leave(),
      settings: {
        setSound: p.setSound,
        // The animations are CSS, so the switch is a class. `data-motion` and
        // not a plain class, so it can win in *both* directions against the
        // phone's own `prefers-reduced-motion` — a player who asked their
        // phone for less motion and wants this one to move must be able to.
        setMotion: (on) => {
          document.body.dataset.motion = on ? "on" : "off";
        },
        install: () => installer?.offer(),
        canInstall: () => installer?.available() ?? false,
      },
      openTuning: p.openTuning,
      openIntro: (back) => p.intro.open(back),
      demos,
      openDemo: p.openDemo,
    });
    // A room link lands on the room screen rather than on the menu behind it,
    // and `invite` has already put that up by the time this runs.
    if (roomRequested(location.href)) return link;
    // The first visit reads the intro and lands on the menu afterwards; every
    // visit after that lands on the menu, which is where the intro is asked
    // for again by name (`menu-entries.ts`).
    const toMenu = (): void => menu?.open();
    if (opensIntro(readIntroSeen(), true)) p.intro.open(toMenu);
    else toMenu();
  }

  return link;
}
