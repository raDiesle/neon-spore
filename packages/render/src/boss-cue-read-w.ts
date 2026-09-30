import {
  type GaugeState,
  gaugeBound,
  gaugeJammed,
  gaugeSeated,
  gaugeSettling,
  gaugeToothAsks,
  gaugeWoundOpen,
  type World,
} from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { markAt } from "./boss-cue-frame.js";
import { type Dial, gaugeBandMid, gaugeNeedleTip } from "./gauge.js";
import { rimPoint } from "./gauge-alien.js";
import { gaugeDial } from "./gauge-round.js";
import { toothPoint } from "./gauge-teeth.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GAUGE is asking for** — the readings' page `w`, split off
 * `boss-cue-read-e.ts` on 19 September 2026, which kept THE MIRROR and THE
 * MAZE. This reading grew from one arm to three when the round gained its jam
 * and its bind, and the next round to be read had nowhere to go on a page
 * already carrying two others' (`docs/queue.md`). The letter rather than the
 * next free number is page `s`'s own reason — a sibling lane may be writing
 * another page the same day, and a number here would describe whichever
 * lands first rather than this page.
 *
 * Two words hers, one his — and his is the correction this reading had to
 * make to itself.
 *
 * **It used to say he could be told nothing true**, and while the valve works
 * that is still right: the two marks are not on his screen at all
 * (`showsGaugeMarks`), so the only word over his thumb would be `TURN`, and
 * the moment it wanted would be *which way* and *how far* — the answer, and
 * hers to say. Then the round gained the jam (`sim/gauge-hand.ts`), and a
 * dead valve is a fact about **his own half**: the thing under his thumb has
 * stopped answering, and the needle is his to swing by hand until a call
 * lands. `TURN` over the needle says that and nothing else — not the
 * direction, not the distance, not that a call is close. It is the one beat
 * of the round where the field knows something about his side that his side
 * does not show him, which is exactly when #34 says to speak.
 *
 * It goes quiet the moment his hand is down. A word over a needle he is
 * already swinging is the field narrating him, and the settle it costs is
 * long enough that the word would still be there when he had finished.
 *
 * **Her words are her own verbs, at the moment each will land.** `CALL` /
 * `POSITION` on the wound while the cannon is not yet over it, and `PRESS` /
 * `SHOOT` on the end of the needle once it is — the owner, 29 September 2026:
 * *it does not make sense how it is right now: p2 sees "call" only when the
 * cannon is above the color - this help can just be "Shoot", and before it
 * should say "call position"*. The first is the talking, which is her half of
 * the round; the second is the thumb, once there is nothing left to say. Both
 * stand on things drawn on her screen alone, so the mark stands on something
 * she is already shown, and neither says where the needle has to go. `HOLD` / `OPEN` on the middle of the band while it is
 * wound tight and her thumb is off it: the bind is hers, it is drawn on her
 * screen alone, and the verb is a hold on a thing she can see is narrow. The
 * call outranks it, because a needle already seated in the tight band is a
 * mark she can take without spending the thumb.
 *
 * Neither is the round's difficulty: seeing that the needle is inside the
 * band is the easy half of her job, and the hard half — talking him there
 * before it arrives — happens in the beats when there is no cue at all.
 *
 * **And nothing goes out over a control that is refusing.** Two calls inside
 * `gaugeCallRestBeats` cost the rest between them whether the first landed or
 * not; a call under her own thumb or over a needle still settling is turned
 * away in `stepGauge`. A word over any of the three would be an invitation to
 * press nothing — THE MAZE's argument about a handle the ship has taken away,
 * on a button instead.
 *
 * **The tooth's rest turns the split round** (`sim/gauge-tooth.ts`): the
 * loose tooth is drawn on his screen alone and the hand is hers, so `CALL` /
 * `TOOTH` stands on the loose one over his, and `PULL` over the top of her
 * jaw until a tooth is in her hand. Neither names the tooth: his stands on a
 * thing already drawn for him, and hers is only the verb.
 */
export function gaugeCues(l: Layout, world: World, g: GaugeState): readonly BossCue[] {
  if (g.phase !== "play") return [];
  const dial = gaugeDial(l);
  const out: BossCue[] = [];
  if (callReady(world, g)) {
    const tip = gaugeNeedleTip(dial, g);
    out.push(markAt(2, "PRESS", "SHOOT", tip.x, tip.y, l, 68));
  }
  if (gaugeBound(g) && !g.openThumb) {
    const mid = gaugeBandMid(dial, g);
    out.push(markAt(2, "HOLD", "OPEN", mid.x, mid.y, l, 80));
  }
  if (callDue(g) && !gaugeSeated(world, g)) {
    const mid = gaugeBandMid(dial, g);
    out.push(markAt(2, "CALL", "POSITION", mid.x, mid.y, l, 69));
  }
  if (gaugeToothAsks(g)) out.push(...toothCues(l, dial, g));
  if (gaugeJammed(g) && !g.handOn) {
    const tip = gaugeNeedleTip(dial, g);
    out.push(markAt(1, "TURN", "TURN", tip.x, tip.y, l, 81));
  }
  return out;
}

/** His word on the loose tooth, and her verb over the jaw until one is in hand. */
function toothCues(l: Layout, dial: Dial, g: GaugeState): BossCue[] {
  const his = toothPoint(dial, g.looseTooth);
  const cues = [markAt(1, "CALL", "TOOTH", his.x, his.y, l, 101)];
  if (g.toothHold === -1) {
    const top = rimPoint(dial, 500, -dial.r * 0.2);
    cues.push(markAt(2, "CARRY", "PULL", top.x, top.y, l, 102));
  }
  return cues;
}

/** A wound is up for her to talk him onto: open, with no bolt still out at it. */
function callDue(g: GaugeState): boolean {
  return g.shotTick === -1 && gaugeWoundOpen(g);
}

/** Every way a call can be refused, asked as `stepGauge` asks it. */
function callReady(world: World, g: GaugeState): boolean {
  if (world.beat - g.calledBeat < world.cfg.gaugeCallRestBeats) return false;
  if (!callDue(g)) return false;
  if (g.openThumb || gaugeSettling(world.cfg, g, world.beat)) return false;
  return gaugeSeated(world, g);
}
