import { inZone, type LabLever, leverValue } from "./lever-lab-rule.js";
import { depthOf, type LeverSetup, mineShape } from "./lever-lab-setup.js";

/** THE LEVER LAB's readout on its bar (`lever-lab.ts`): no word is drawn on the field. */

const VERDICT_WORDS: Readonly<Record<string, string>> = {
  counted: "COUNTED",
  refused: "LET GO EARLY · REFUSED",
  strayed: "OFF THE PATH",
};

/** The bar's readout: the state, the depth and the value, and what the lifts have come to. */
export function leverReadout(f: { setup: LeverSetup; lever: LabLever }): string {
  const { setup, lever } = f;
  const p = lever.mine;
  const held = p.phase === "held" || p.phase === "full";
  const zone = setup.ask.zone;
  const state = p.verdict
    ? VERDICT_WORDS[p.verdict]
    : !held
      ? "WAITING"
      : !zone
        ? "HELD"
        : inZone(setup, lever)
          ? "IN THE ZONE"
          : "OUT OF THE ZONE";
  const pc = (v: number): string => `${Math.round(v * 100)}%`;
  const depth = depthOf(mineShape(setup), p.at);
  const side = mineShape(setup).origin > 0 && p.sign !== 0 ? (p.sign > 0 ? " RIGHT" : " LEFT") : "";
  const parts = [state, `DEPTH ${pc(depth)}${side}`];
  if (setup.pair !== "one") parts.push(`PARTNER ${pc(lever.theirs)}`);
  if (setup.pair === "summed") parts.push(`SUM ${pc(leverValue(setup, lever))}`);
  if (zone) parts.push(`HOLD ${pc(lever.fill)}`, `COUNTED ${p.counted}`, `REFUSED ${p.refused}`);
  parts.push(`OFF PATH ${p.strayed}`);
  return parts.join(" · ");
}
