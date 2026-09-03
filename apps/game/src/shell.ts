import type { MechanicId } from "@neon-spore/content";
import type { PlayerId } from "@neon-spore/net";
import type { ViewRole } from "@neon-spore/render";
import type { SimConfig, World } from "@neon-spore/sim";
import { type DemoRow, demoRows } from "./demo-menu.js";
import { bindHoldCard } from "./hold.js";
import { bindInstall } from "./install.js";
import { bindJoinScreen, type JoinScreen, roomRequested } from "./join.js";
import { createLink, type Link } from "./link.js";
import { bindMainMenu, type MainMenu, opensOnMenu } from "./menu.js";
import type { CommandSource } from "./relay.js";
import type { RunState } from "./run-state.js";

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
  /** Switches the run to a demonstration's config and opens its wave. */
  openDemo: (id: MechanicId) => void;
  /**
   * Beat zero. Called after every sheet has been put away and every hold on
   * the world has been let go, so what it does is only the run itself.
   */
  onStart: (player: PlayerId) => void;
}

export function bindShell(p: ShellParts): Link {
  let joinScreen: JoinScreen | null = null;
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

  // The home-screen shortcut (`install.ts`), and the room the address named.
  void bindInstall();
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
      leaveRoom: () => link.leave(),
      openTuning: p.openTuning,
      demos,
      openDemo: p.openDemo,
    });
    // A room link lands on the room screen rather than on the menu behind it,
    // and `invite` has already put that up by the time this runs.
    if (!roomRequested(location.href)) menu.open();
  }

  return link;
}
