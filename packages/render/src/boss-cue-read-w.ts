import {
  type GaugeState,
  gaugeBound,
  gaugeGape,
  gaugeSeated,
  gaugeSpanNow,
  gaugeTongueAsks,
  gaugeToothAsks,
  gaugeWoundOpen,
  type World,
} from "@neon-spore/sim";
import { aimRound } from "./aim-fit.js";
import type { BossCue } from "./boss-cue.js";
import { markAt } from "./boss-cue-frame.js";
import { type Dial, gaugeBandMid, gaugeNeedleTip, showsGaugeMarks } from "./gauge.js";
import { rimPoint } from "./gauge-alien.js";
import { gaugeOpenDial } from "./gauge-gape.js";
import { gaugeWoundColor } from "./gauge-load.js";
import { gaugeDial } from "./gauge-round.js";
import { toothPoint } from "./gauge-teeth.js";
import { gaugeTongueGrip } from "./gauge-tongue.js";
import { gaugeTongueHeld } from "./gauge-tongue-grip.js";
import { gaugeWoundCorners } from "./gauge-wound.js";
import type { Layout } from "./layout.js";

/**
 * **What THE GAUGE is asking for** — the readings' page `w`, split off
 * `boss-cue-read-e.ts` on 19 September 2026, which kept THE MIRROR and THE
 * MAZE. This reading grew from one arm to three when the round gained its bind
 * and its rests, and the next round to be read had nowhere to go on a page
 * already carrying two others' (`docs/queue.md`). The letter rather than the
 * next free number is page `s`'s own reason — a sibling lane may be writing
 * another page the same day, and a number here would describe whichever
 * lands first rather than this page.
 *
 * **His screen is told nothing while the valve works**: the two marks are not
 * on it at all (`showsGaugeMarks`), so the only word over his thumb would be
 * `TURN`, and the moment it wanted would be *which way* and *how far* — the
 * answer, and hers to say. The word it once had, `TURN` over a jammed needle,
 * went with the jam on 2 October 2026, when a mistake began to lose the round
 * instead (`sim/gauge-hand.ts`). His words now are the rests' alone.
 *
 * **Her words are her own verbs, at the moment each will land.** `CALL` /
 * `POSITION` on the wound while the cannon is not yet over it, and `PRESS` /
 * `SHOOT` on the end of the needle once it is — the owner, 29 September 2026:
 * *it does not make sense how it is right now: p2 sees "call" only when the
 * cannon is above the color - this help can just be "Shoot", and before it
 * should say "call position"*. The first is the talking, which is her half of
 * the round; the second is the thumb, once there is nothing left to say. Both
 * stand on things drawn on her screen alone, so the mark stands on something
 * she is already shown, and neither says where the needle has to go. `HOLD` / `KEEPS IT OPEN` on the middle of the band while it is
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
 * not; a call under her own thumb or while a bolt is still out is turned away
 * in `gaugeCalled`. A word over any of them would be an invitation to
 * press nothing — THE MAZE's argument about a handle the ship has taken away,
 * on a button instead.
 *
 * **The tooth's rest turns the split round** (`sim/gauge-tooth.ts`): the
 * loose tooth is drawn on his screen alone and the hand is hers, so `CALL` /
 * `TOOTH` stands on the loose one over his, and `PULL` over the top of her
 * jaw until a tooth is in her hand. Neither names the tooth: his stands on a
 * thing already drawn for him, and hers is only the verb.
 *
 * **The tongue's rest has no secret** (`sim/gauge-tongue.ts`): both hands are
 * wanted and the tongue is drawn on both screens, so each seat gets `TURN` /
 * `TWIST` on its own place on it until its hand is down. The word is the verb
 * alone and never the way — which way each of them wrings it is the thing
 * they have to agree out loud.
 */
export function gaugeCues(l: Layout, world: World, g: GaugeState): readonly BossCue[] {
  if (g.phase !== "play") return [];
  const dial = gaugeOpenDial(gaugeDial(l), gaugeGape(g));
  const out: BossCue[] = [];
  if (callReady(world, g)) {
    const tip = gaugeNeedleTip(dial, g);
    // Round the whole wound, which the needle is seated in, in the colour it
    // wants on her screen — the one that draws it (`gauge-wound.ts`).
    const aim = aimRound(gaugeWoundCorners(dial, g.markMilli, gaugeSpanNow(world.cfg, g)));
    const shows = showsGaugeMarks(l.role) ? gaugeWoundColor(g) : undefined;
    out.push({ ...markAt(2, "PRESS", "SHOOT", tip.x, tip.y, l, 68), aim, shows });
  }
  if (gaugeBound(g) && !g.openThumb) {
    const mid = gaugeBandMid(dial, g);
    out.push({ ...markAt(2, "HOLD", "HOLD", mid.x, mid.y, l, 80), why: "KEEPS IT OPEN" });
  }
  if (callDue(g) && !gaugeSeated(world, g)) {
    const mid = gaugeBandMid(dial, g);
    out.push(markAt(2, "CALL", "POSITION", mid.x, mid.y, l, 69));
  }
  if (gaugeToothAsks(g)) out.push(...toothCues(l, dial, g));
  if (gaugeTongueAsks(g)) out.push(...tongueCues(l, dial, g));
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

/** Each seat's verb on its own place on the tongue, until its hand is on it. */
function tongueCues(l: Layout, dial: Dial, g: GaugeState): BossCue[] {
  const cues: BossCue[] = [];
  for (const seat of [1, 2] as const) {
    if (gaugeTongueHeld(g, seat)) continue;
    const at = gaugeTongueGrip(dial, seat);
    cues.push(markAt(seat, "TURN", "TWIST", at.x, at.y, l, seat === 1 ? 103 : 104));
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
  if (g.openThumb) return false;
  return gaugeSeated(world, g);
}
