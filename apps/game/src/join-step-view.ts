import type { LinkStatus } from "@neon-spore/net";
import { type JoinMode, type JoinStep, stepBack, stepLede, stepTitle } from "./join-steps.js";

/**
 * The chrome around whichever of the room screen's four steps is up: the four
 * blocks, the heading and sentence over them, and the one way back off the
 * step.
 *
 * Its own file because `join.ts` is the room — the link, the code, the seats
 * and the press — and this is the sheet the room is drawn on. That file has
 * hit its ceiling twice now, and both times the seam was the same one: a thing
 * that knows what a `LinkStatus` means, and a thing that knows which elements
 * exist. This is the second.
 *
 * The presses stay in `join.ts`, which is where the bindings they call live.
 * This only ever shows and hides.
 */
export function bindStepView(): (step: JoinStep, mode: JoinMode, status: LinkStatus) => void {
  const title = document.getElementById("joinTitle");
  const lede = document.getElementById("joinLede");
  const code = document.getElementById("joinCode");
  const enter = document.getElementById("joinEnter");
  const close = document.getElementById("joinClose");
  const back = document.getElementById("joinBack");
  const leave = document.getElementById("joinLeave");
  const blocks: [JoinStep, HTMLElement | null][] = [
    ["pick", document.getElementById("joinPick")],
    ["name", document.getElementById("joinStepName")],
    ["code", document.getElementById("joinStepCode")],
    ["room", document.getElementById("joinStepRoom")],
  ];

  return (step, mode, status) => {
    for (const [which, node] of blocks) {
      if (node) node.hidden = which !== step;
    }
    if (title) title.textContent = stepTitle(step, mode);
    if (lede) lede.textContent = stepLede(step, mode, status);
    // The creator's own code is drawn large; the joiner's field is where the
    // one they were told goes. Both are step 3 and only one of them is it.
    if (code) code.hidden = mode !== "create";
    if (enter) enter.hidden = mode === "create";
    // Only one of the three ways off a step is ever offered, and which one is
    // the step's own rule: backing out of a room hangs up on somebody.
    const out = stepBack(step, status);
    if (close) close.hidden = out !== "menu";
    if (back) back.hidden = out !== "back";
    if (leave) leave.hidden = out !== "leave";
  };
}
