import { bossScript, bossScriptNames, type World } from "@neon-spore/sim";
import type { JumpResult, StageJump } from "./stage-jump.js";

/**
 * **◀, the list of steps and ▶**, under the step readout in RUN
 * (`docs/spec/living-bosses.md` §3). Hidden on a wave whose boss has no
 * script, as the readout is. The list is written again only when the script
 * changes — a new wave, a new build — and its choice follows the step that is
 * up, so a frame that moved nothing costs two compares.
 *
 * A jump that could not reach its step says so under the row, and says
 * nothing once the next jump has gone where it was asked.
 */
export function bindStageJumpRow(doc: Document, jump: StageJump): (world: World) => void {
  const row = doc.getElementById("stepJump");
  const list = doc.getElementById("stepList") as HTMLSelectElement | null;
  const note = doc.getElementById("stepJumpNote");
  const say = (r: JumpResult | null): void => {
    if (!note || r === null) return;
    note.textContent =
      r.reached < r.asked ? `AUTO GOT TO STEP ${r.reached + 1} OF ${r.asked + 1}, NO FURTHER` : "";
  };
  doc.getElementById("stepBack")?.addEventListener("click", () => say(jump.back()));
  doc.getElementById("stepNext")?.addEventListener("click", () => say(jump.forward()));
  list?.addEventListener("change", () => say(jump.to(Number(list.value))));

  let written = "";
  let at = -1;
  return (world) => {
    if (!row || !list) return;
    const names = bossScriptNames(world);
    const key = names === null ? "" : names.join("\u0001");
    if (key !== written) {
      written = key;
      row.hidden = names === null;
      list.replaceChildren(
        ...(names ?? []).map((name, i) => {
          const o = doc.createElement("option");
          o.value = String(i);
          o.textContent = name === null ? `${i + 1}` : `${i + 1} · ${name.toUpperCase()}`;
          return o;
        }),
      );
      at = -1;
    }
    const s = bossScript(world);
    const now = s === null ? -1 : Math.min(s.at, s.of - 1);
    if (now !== at) {
      at = now;
      list.value = String(now);
    }
  };
}
