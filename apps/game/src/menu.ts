import { WAVES } from "@neon-spore/content";
import type { ViewRole } from "@neon-spore/render";
import { buildMenu } from "./menu-view.js";

/**
 * The main menu.
 *
 * It is not on the way in. A tester opens the game a hundred times a day to
 * look at one wave, and a title screen in front of that is a tap between the
 * person and the thing they came to see — so the menu appears only when the
 * address asks for it, and the plain URL still lands on the field.
 *
 * The door is the director: `tools/director` serves the game at `/game` and
 * links to it with the flag already set. Anything else that wants the menu —
 * the preview an agent verifies against, a phone somebody is holding — adds
 * `?menu` itself.
 */
const MENU_PARAM = "menu";

/** Pure, so the rule that keeps the menu out of the way can be tested. */
export function menuRequested(url: string): boolean {
  const parsed = new URL(url, "http://game.invalid/");
  return parsed.searchParams.has(MENU_PARAM) || parsed.hash.replace(/^#/, "") === MENU_PARAM;
}

export interface MenuBindings {
  jumpToWave: (wave: number) => void;
  setRunning: (running: boolean) => void;
  /** The seat the view switch is on, and the way to move it. */
  seat: () => ViewRole;
  setSeat: (role: ViewRole) => void;
  openRoom: () => void;
  openTuning: () => void;
}

export function bindMainMenu(b: MenuBindings): void {
  const isOpen = (): boolean => dom.root.classList.contains("on");

  const close = (): void => {
    dom.root.classList.remove("on");
    dom.animate(false);
  };
  const open = (): void => {
    dom.show("root");
    dom.paintSeat(b.seat());
    dom.root.classList.add("on");
    dom.animate(true);
  };
  /** Every way out of the menu into the field is the same three things. */
  const play = (wave: number): void => {
    b.jumpToWave(wave);
    b.setRunning(true);
    close();
  };

  const dom = buildMenu({
    entries: [
      {
        label: "PLAY",
        desc: "Start at the first wave, both seats on this device.",
        run: () => play(0),
      },
      {
        label: "WAVES",
        desc: `All ${WAVES.length} authored waves, each by the sentence it exists for.`,
        run: () => dom.show("waves"),
      },
      {
        label: "TWO DEVICES",
        desc: "Open a room and read the code out, or type in the one you were told.",
        run: () => {
          close();
          b.openRoom();
        },
      },
      {
        label: "TUNING",
        desc: "Tempo, the guard window, the intake window — the sliders, while it runs.",
        run: () => {
          close();
          b.openTuning();
        },
      },
      {
        label: "CONTROLS",
        desc: "The keys, for one person at a desk playing both halves.",
        run: () => dom.show("keys"),
      },
    ],
    onWave: play,
    onSeat: (role) => {
      b.setSeat(role);
      dom.paintSeat(role);
    },
  });

  // The gear and the pause button shuffle one place along to make room — see
  // menu.css. Nothing moves in a build that was not asked for the menu.
  document.body.classList.add("has-menu");
  const chip = document.getElementById("menuChip");
  chip?.classList.add("on");
  chip?.addEventListener("click", () => (isOpen() ? close() : open()));

  window.addEventListener("keydown", (e) => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    if (isOpen()) close();
    else open();
  });

  open();
}
