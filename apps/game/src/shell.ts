import type { MechanicId } from "@neon-spore/content";
import type { PlayerId } from "@neon-spore/net";
import type { ViewRole } from "@neon-spore/render";
import type { Difficulty, SimConfig, World } from "@neon-spore/sim";
import { type DemoRow, demoRows } from "./demo-menu.js";
import { openHello } from "./hello.js";
import { bindHoldCard } from "./hold.js";
import { bindInstall, type Installer } from "./install.js";
import { type Intro, opensIntro, readIntroSeen } from "./intro.js";
import { bindJoinScreen, type JoinScreen } from "./join.js";
import { roomRequested } from "./join-link.js";
import { forgetRoom, rememberRoom } from "./last-room.js";
import { createLink, type Link } from "./link.js";
import { bindMainMenu, type MainMenu, opensOnMenu } from "./menu.js";
import { onQuit } from "./quit.js";
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
  onStart: (player: PlayerId, wave: number, level: Difficulty) => void;
  /** The difficulty this device last played at, and the way to change it —
   * the run starts again at the first wave when it does (`main.ts`). */
  level: () => Difficulty;
  setLevel: (level: Difficulty) => void;
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
  /** Whether the last status said the run had parted — see `onStatus`. */
  let parted = false;

  const link = createLink({
    cfg: p.cfg,
    world: p.world,
    buffer: p.buffer,
    onStart: (player, wave, level) => {
      // The room hands out the seat, so the view follows it rather than
      // whatever this device was last left on.
      p.setSeat(player === 1 ? "p1" : "p2");
      // Beat zero is not a moment to argue with: whatever was holding the
      // world — the menu, a thumb, the panel — lets go, on both devices.
      menu?.close();
      joinScreen?.open(false);
      p.run.release();
      p.onStart(player, wave, level);
    },
    onStatus: (status) => {
      // **Where this device was, written down on every status the room sends.**
      // A phone that reloads loses the socket and the seat and keeps nothing
      // else; the other phone loses nothing and goes on waiting in the room.
      // The stamp is *when this device was last in it* rather than when it
      // arrived, so a pair an hour into a session still gets the offer back
      // (`last-room.ts`, and the button it feeds in `menu-rejoin.ts`).
      //
      // `Date.now` and not the tick counter: this is wall-clock time between
      // two page loads, which the simulation's clock says nothing about.
      if (status.state !== "solo" && status.room !== "") {
        rememberRoom(status.room, Date.now());
      }
      joinScreen?.update(status);
      menu?.update(status);
      hold.update(status);
      // **The two worlds have parted.** Nothing either phone is looking at is
      // the game the other one is playing, so the field is not worth drawing
      // over any more: the menu comes up on the PLAY page, where CONTINUE is,
      // and the pair start again together the moment both of them press it
      // (`menu.ts`, `link-run.ts`). It happens on both phones because both
      // exchange fingerprints and both notice.
      //
      // On the *edge* and not on the state, so a menu the player then closed to
      // look at the field does not come straight back up under their thumb.
      // The room screen goes down first: it sits over the menu, and a pair
      // who had it up would be looking at a START that cannot be pressed with
      // the press that can under it.
      if (status.state === "desync" && parted !== true) {
        joinScreen?.open(false);
        menu?.open("play");
      }
      parted = status.state === "desync";
    },
  });
  // **One seat pressed QUIT on a lost wave.** The same door as the parted run,
  // for the same reason: there is no field worth looking at under it any more,
  // on either phone, and the PLAY page is where the way back in is — with the
  // room's line saying whose press it was (`quit.ts`, `menu-link.ts`).
  onQuit(() => menu?.open("play"));

  /**
   * Somebody said they were done, so there is nothing to offer them back into.
   * All three leaves go through here — the card that comes up when the other
   * phone goes quiet, the room screen's own, and the menu's LEAVE ROOM — because
   * a device that kept the room after a deliberate leave would put BACK INTO
   * THE GAME in front of the person who had just pressed the way out of it.
   */
  const leaveRoom = (): void => {
    forgetRoom();
    link.leave();
  };

  const hold = bindHoldCard({ leave: leaveRoom });
  // The room's level where there is a room, and this device's where there
  // is not. Setting it tells the room — which hands it back to both phones
  // on the next welcome — and starts the run again here
  // (`packages/sim/src/difficulty.ts`, `main.ts`).
  const level = (): Difficulty => link.status().level ?? p.level();
  const setLevel = (next: Difficulty): void => {
    link.setLevel(next);
    p.setLevel(next);
  };
  joinScreen = bindJoinScreen({
    join: (room) => link.join(room),
    leave: leaveRoom,
    ready: () => link.ready(),
    pickSeat: (seat) => link.pickSeat(seat),
    setLevel,
    level,
    back: () => menu?.open(),
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
      leaveRoom,
      // CONTINUE in a room is the room's own START, sent through the same door
      // the room screen's button uses — the only press on one phone that may
      // begin a wave on two (`menu.ts`, `link.ts`).
      ready: () => link.ready(),
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
    // The first visit reads the intro, is asked what it is called, and lands on
    // the menu; every visit after lands straight on it. Each step is skipped on
    // its own terms and hands on to the next rather than being sequenced here.
    const hold = (on: boolean): void => p.run.hold("menu", on);
    const onward = (): void => openHello(hold, () => menu?.open());
    if (opensIntro(readIntroSeen(), true)) p.intro.open(onward);
    else onward();
  }

  return link;
}
