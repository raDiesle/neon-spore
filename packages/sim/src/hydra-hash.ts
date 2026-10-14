import { HYDRA_HEADS, HYDRA_PHASES, type HydraState } from "./hydra.js";

/**
 * What THE HYDRA puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE CHRYSALIS's reason
 * (`chrysalis-hash.ts`), each level's counts, ways, laps, columns and colours
 * with their lengths ahead of them. The heads stopped go in because they are
 * the fight; each seat's thumb and its cut because a lift is judged on them;
 * the coil's lever and its laps because the next reading is read against
 * them; and the eyes' lids because a tap is judged against them.
 */
export function hydraHashParts(s: HydraState): number[] {
  const out = [
    HYDRA_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.goneMask,
    s.pieces,
    s.down.length,
    ...s.down.map((d) => (d ? 1 : 0)),
    s.cutMilli.length,
    ...s.cutMilli,
    s.spent.length,
    ...s.spent.map((t) => (t ? 1 : 0)),
    s.turning.length,
    ...s.turning.map((t) => (t ? 1 : 0)),
    s.turnAtMilli.length,
    ...s.turnAtMilli,
    s.unwoundMilli.length,
    ...s.unwoundMilli,
    s.lidOpen.length,
    ...s.lidOpen.map((o) => (o ? 1 : 0)),
    s.blinkBeat.length,
    ...s.blinkBeat,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(HYDRA_HEADS.indexOf(step.head) + 1);
    out.push(step.beats);
    out.push(step.count ?? 0);
    out.push(step.laps ?? 0);
    const ways = step.ways ?? [];
    out.push(ways.length);
    for (const w of ways) out.push(w);
    const offsets = step.offsets ?? [];
    out.push(offsets.length);
    for (const o of offsets) out.push(o);
    const colors = step.colors ?? [];
    out.push(colors.length);
    for (const c of colors) out.push(c === "red" ? 1 : 2);
  }
  return out;
}
