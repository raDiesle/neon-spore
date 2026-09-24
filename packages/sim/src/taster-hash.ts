import type { TasterState } from "./taster.js";

/**
 * What THE TASTER puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `gorge-hash.ts` is one: `hash-boss.ts` grows by a
 * whole boss at a time.
 *
 * **The blades are the fields that matter most**, all five of each. Two devices
 * that disagreed about one edge would have the navigator calling for the colour
 * that thickens it on the other phone, which is the loudest desync this fight
 * can have — and an edge that is `null` on one device and set on the other is
 * two screens disagreeing about whether the blade has decided yet. The phase is
 * not here because it is not kept: it is read off the count shorn and the out
 * beat, which are. What the pair has *spent* is not here either — it is not the
 * boss's, it is the world's, and `hash.ts` pushes it beside the rng.
 *
 * **The three hands are all six of them here** (`taster-hand.ts`). Two devices
 * that disagreed about the pin would disagree about which beat a blade decides
 * on, which is the same desync as the edge one row up; two that disagreed
 * about the pry would disagree about whether her beam did anything at all.
 * `wiped` is a flag about a carry in progress and goes in for the reason the
 * depths do: it is what says whether the *next* thousandth of that carry is a
 * cut or nothing.
 */
export function tasterHashParts(t: TasterState): number[] {
  const out = [
    t.col,
    t.blades.length,
    t.shorn,
    t.crest,
    t.liftBeat,
    t.edgeBeat,
    t.pin,
    t.pinBeats,
    t.wipe,
    t.wiped ? 1 : 0,
    t.pryMilli,
    t.pryBeat,
    t.pryFills,
    t.outBeat,
  ];
  for (const k of t.blades) {
    out.push(
      k.edge === null ? 0 : k.edge === "red" ? 1 : 2,
      k.layers,
      k.growBeat,
      k.setBeat,
      k.shorn ? 1 : 0,
    );
  }
  return out;
}
