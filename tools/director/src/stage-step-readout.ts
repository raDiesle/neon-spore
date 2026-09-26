import { bossScript, bossScriptLabel, type World } from "@neon-spore/sim";

/**
 * **Which step of its choreography a boss is on**, in RUN beside `↺ WAVE`:
 * `STEP 7 / 25 · 18 TO GO · CURL` (`docs/spec/living-bosses.md` §3). Hidden on
 * every wave whose boss has no script, which is most of them.
 *
 * The count is the sim's own (`packages/sim/src/boss-script.ts`), the one the
 * game's HUD reads too, so the director and the phone cannot disagree about
 * which step is up. Painted from the frame rather than from the tick: the text
 * is only written when it changes, so a frame that moved nothing costs one
 * string compare.
 */
export function bindStageStepReadout(doc: Document): (world: World) => void {
  const el = doc.getElementById("stepReadout");
  let shown: string | null = "";
  return (world) => {
    if (!el) return;
    const script = bossScript(world);
    const text = script === null ? null : bossScriptLabel(script);
    if (text === shown) return;
    shown = text;
    el.hidden = text === null;
    el.textContent = text ?? "";
  };
}
