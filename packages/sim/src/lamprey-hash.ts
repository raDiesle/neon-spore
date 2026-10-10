import {
  LAMPREY_ASKS,
  LAMPREY_BUTTONS,
  LAMPREY_FOODS,
  LAMPREY_PHASES,
  type LampreyState,
} from "./lamprey.js";

/**
 * What THE LAMPREY puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The tiles, the teeth and the bitten tiles go in
 * because they are the simulation's own and decide what a thumb lands on; the
 * trail, the meal and the dung because they decide what it eats and what
 * falls; the thumbs because they are heard on the tick — each array with its length
 * ahead of it, THE CAPSTAN's way (`capstan-hash.ts`).
 */
export function lampreyHashParts(s: LampreyState): number[] {
  const out = [
    LAMPREY_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.col,
    s.row,
    s.fromCol,
    s.fromRow,
    s.nextCol,
    s.nextRow,
    s.tailX,
    s.tailY,
    s.trailCol.length,
    ...s.trailCol,
    s.trailRow.length,
    ...s.trailRow,
    s.headBeat,
    s.leg,
    s.roamSide,
    s.served,
    s.prey,
    s.dung.length,
    ...s.dung,
    s.teethOut,
    s.litTooth,
    s.toothTaps,
    s.pulled.length,
    ...s.pulled,
    s.hits,
    s.bitten.length,
    ...s.bitten,
    s.tailDown.length,
    ...s.tailDown.map((d) => (d ? 1 : 0)),
    s.tailMilli.length,
    ...s.tailMilli,
    s.headMilli.length,
    ...s.headMilli,
    s.tapDown.length,
    ...s.tapDown.map((d) => (d ? 1 : 0)),
    s.slipped.length,
    ...s.slipped.map((d) => (d ? 1 : 0)),
    s.towMilli,
    s.towFrom,
    s.towSide,
    s.angered ? 1 : 0,
    s.plugMilli,
    s.plugs.length,
    ...s.plugs,
    s.meal.length,
  ];
  for (const m of s.meal) {
    out.push(LAMPREY_FOODS.indexOf(m.kind) + 1, m.col, m.row ?? -1, m.beat ?? -1, m.tiles ?? -1);
  }
  out.push(s.steps.length);
  for (const step of s.steps) {
    out.push(LAMPREY_ASKS.indexOf(step.ask) + 1);
    out.push(step.holder);
    out.push(step.teeth);
    out.push(step.jump);
    out.push(step.beats);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.taps ?? 0);
    out.push(step.crawl === true ? 1 : 0);
    out.push(step.food === undefined ? 0 : LAMPREY_FOODS.indexOf(step.food) + 1);
    out.push(step.dung === true ? 1 : 0);
    out.push(step.button === undefined ? 0 : LAMPREY_BUTTONS.indexOf(step.button) + 1);
  }
  return out;
}
