import type { Layout, ViewRole } from "@neon-spore/render";
import type { World } from "@neon-spore/sim";
import { bindIntro, type Intro } from "./intro.js";
import { opensOnMenu } from "./menu-door.js";
import type { RunState } from "./run-state.js";
import {
  bindWelcome,
  opensWelcome,
  readWelcomeSeen,
  type Welcome,
  welcomeForced,
} from "./welcome.js";

/**
 * The two pages drawn on the game's own canvas over a frame, with a
 * transparent sheet each to take the press that closes them: the intro
 * (`intro.ts`) and the welcome before a device's first tutorial
 * (`welcome.ts`).
 *
 * Bound here rather than in `shell.ts` because both need the two things only
 * the canvas has — its own context and the frame that has just been painted
 * — and because a build opened with `?play=1` has no shell at all and still
 * has to be able to not show them. Out of `main.ts` because that file was at
 * its ceiling and this is one subject: what is painted *over* the frame.
 */
export interface SheetParts {
  layout: () => Layout;
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  onStage: (
    ctx: CanvasRenderingContext2D,
    draw: (ctx: CanvasRenderingContext2D, layout: Layout) => void,
  ) => void;
  world: World;
  run: RunState;
  role: () => ViewRole;
  url: string;
}

export function bindCanvasSheets(p: SheetParts): { intro: Intro; welcome: Welcome } {
  const intro = bindIntro({
    sheet: document.getElementById("introTap"),
    layout: p.layout,
    inStage: p.inStage,
    onStage: p.onStage,
    // The same hold the menu takes: somebody reading the scene is not
    // somebody who wants a wave arriving underneath them (`run-state.ts`).
    hold: (on) => p.run.hold("menu", on),
  });
  const welcome = bindWelcome({
    sheet: document.getElementById("welcomeTap"),
    onStage: p.onStage,
    world: p.world,
    role: p.role,
    // The menu's hold is exactly "something is covering the game", and the
    // intro takes the same one — so the first guide is not welcomed under
    // either, but on the frame the pair actually meets it.
    covered: () => p.run.held("menu"),
    // Decided once, at the door, for the intro's reason and by the intro's
    // rule: `?play=1` gets no page in front of it unless it asks by name.
    opens: opensWelcome(readWelcomeSeen(), opensOnMenu(p.url), welcomeForced(p.url)),
  });
  return { intro, welcome };
}
