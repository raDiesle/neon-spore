import type { GroupName } from "./ship-groups.js";
import { CHOREO_NOTES_B } from "./ship-notes-choreo-b.js";
import { CHOREO_NOTES_C } from "./ship-notes-choreo-c.js";
import { CHOREO_NOTES_D } from "./ship-notes-choreo-d.js";

/**
 * The paragraph under each **choreographed boss's** card.
 *
 * Cut out of `ship-notes-round.ts` when THE SURGE's took that file seventeen
 * lines over its 250-line limit, along the seam `ship-fields-choreo.ts` cut
 * the same day for THE LEDGER's dials: next door is whichever **round** has
 * taken the field away, and everything here is a boss from
 * `docs/spec/bosses-choreographed.md` — a body or a fixture over the ordinary
 * field. Twelve are built and three more are designed, and each brings a
 * paragraph, so this is the half that grows. THE STARE is in it for the
 * fields file's reason.
 *
 * Spread into `ROUND_NOTES` in place, so the totality guard still holds: a
 * card added to `GroupName` and left without a paragraph in *any* of the
 * pages is the same compile error it always was. **From THE LEDGER on the
 * paragraphs are on a second page** (`ship-notes-choreo-b.ts`), spread in
 * here before THE STARE's, cut when THE LEAD's put this one at 240 and the
 * next boss's would have landed on the wall.
 */
export const CHOREO_NOTES = {
  "THE BATON — a bead passed down an arm, one seat a beat":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §10: " +
    "an arm of batonSockets sockets hangs from the top of the middle column " +
    "with one bead in the topmost, and the bead is passed down it by strict " +
    "alternation. Player 1's trigger launches it, and it is in the air for " +
    "batonFlightBeats — THE DRAG, not THE SLOW: the clock never bends, the " +
    "bead is slow — during which a shot of its colour up its column from " +
    "player 2 lands it a socket lower and darkens the one it left. The seat " +
    "that acted is locked out of every control for batonLockBeats: his on the " +
    "trigger, hers on any shot that leaves — at the bead, at a creature, at " +
    "nothing, or the beam, which meets the bead the way a bolt does. A bead " +
    "nobody hits lands back where it was and relights the socket; one hit with " +
    "the wrong colour is knocked back two sockets; a bead left sitting longer " +
    "than its socket's turn — batonTurnTopBeats at the top, down to " +
    "batonTurnBottomBeats at the bottom — settles back one. After batonSwingAfter dark " +
    "sockets the arm swings a column either side of the middle; after " +
    "batonShedAfter it sheds its topmost dark socket as a rock every " +
    "batonShedBeats. After batonTwinAfter dark sockets a second bead lights " +
    "at the top in the other colour, and the two merge in the last socket. " +
    "Down to one lit socket, the arm hangs by a thread — the picture thins " +
    "it over batonThreadBeats. " +
    "The merged bead's flight out of it is the crossing, batonFinalBeats " +
    "long, owing acts in turn on no beat in particular — a gap longer than " +
    "batonTurnBottomBeats puts it back in the last socket. Made whole, the bead falls as a pod, the maw takes it, and " +
    "the arm folds away in batonDownBeats. THE SLOW spans the asks alone: a " +
    "shell swelling for its batonSwellStrips, the draw's " +
    "batonMergeWindowBeats and the crossing, each shut on its own end " +
    "(sim/baton-slow.ts). Nothing about it is authored per " +
    "wave. See sim/baton.ts, sim/baton-cross.ts, sim/config-baton.ts.",
  "THE THROAT — the boss you answer by feeding it":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §1 " +
    "and reworked on 1 October 2026: the gullet stands where the cannon does, " +
    "joined to the hull, and its mouth is the only weapon in the wave. Player " +
    "2 carries the mouth anywhere on the field, kept throatSideMarginMilli " +
    "off the walls and throatTopMarginMilli off the top. Player 1 pumps a " +
    "handle up and down: every stroke of throatStrokeMilli adds " +
    "throatPumpGainMilli and every tick takes throatPumpDecayMilli back, and " +
    "the circle round the mouth is throatMinRadiusMilli to " +
    "throatMaxRadiusMilli as wide as the pump is full. The mouth has four " +
    "colours, two a seat: red and cyan are player 2's and swallow a slick and " +
    "a bulb of their colour, SHIELD and SUCK are player 1's and swallow a rock " +
    "and a pod. A body in the wrong colour is refused, shakes and stays, " +
    "once per throatRefuseTicks; nothing is lost. Each right swallow slackens " +
    "one of throatRings rings, and the last turns the tube through its own " +
    "mouth over throatEvertBeats. Nothing is authored per wave. " +
    "See sim/throat.ts, sim/throat-hand.ts, sim/throat-suck.ts.",
  "THE UNDERTOW — the boss under the floor, answered downward":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §13: " +
    "the one boss that comes up through the hull, reworked on 1 October " +
    "2026. A plate bows for undertowBowBeats — seen on player 1's screen " +
    "alone — and a lobe stands through it, yellow or cyan. Yellow is the " +
    "maw's: the cannon under it and SUCK. Cyan is the shield's: the shield " +
    "under it, armed. One left standing for undertowStandBeats grows tall, " +
    "and a tap from either seat puts it back; left tall for " +
    "undertowTallBeats it bursts, scars the hull and loses the wave. Each " +
    "of the three levels lasts undertowLevelBeats and stands " +
    "undertowOneLobes, undertowTwoLobes and undertowThreeLobes at once, " +
    "with undertowRestBeats between lobes; at the clock the rest shrink " +
    "back over undertowEbbBeats. Lasting out the third clock wins. Nothing " +
    "about it is authored per wave. See sim/undertow.ts, sim/config-undertow.ts.",
  "THE GORGE — bubbles one of you counts and the other colours":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §3, " +
    "reworked on 1 October 2026 on the owner's words: a sack of bubbles " +
    "hung mid-field on gorgeRow, five authored levels, and each bubble wants " +
    "a rolled number of shots of a colour. Player 1 sees the numbers and, " +
    "from level two, the order; player 2 sees the colours. A wrong colour " +
    "takes a shot back out. From level three the bubbles stand round a ring " +
    "gorgeRingRows tiles out that turns every gorgeTurnBeats, and only the " +
    "bottom one takes a shot, once player 1 has tapped it gorgeOpenTaps " +
    "times (sim/gorge-hand.ts); levels four and five ask for both colours " +
    "in one bubble. gorgeLevelGapBeats between levels; the last one sated " +
    "holds the wave gorgeOutBeats more. The levels are authored in " +
    "content/gorge-levels.ts; see sim/gorge.ts, sim/config-gorge.ts.",
  "THE CURTAIN — the boss that is in the way":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §6: " +
    "the boss that is not the threat but the thing hiding it. A sheet seven " +
    "columns wide hangs at curtainRow with a lobe under each column and the " +
    "core behind one of them, firing a torch down its column every " +
    "curtainFireBeats while it is bare. A hand carried across the fabric " +
    "moves the whole sheet a column, opposite hands hold it, and at least " +
    "curtainKeepCols of it stay on the field; left unheld curtainRerollBeats " +
    "it rolls a column back over the core. Every curtainSoftBeats, " +
    "curtainSoftCount lobes go soft and a shot into one takes it off; at " +
    "curtainLightLobes off it slides two columns a shove. A bare core hit in " +
    "its colour drops its nearest lobe and drifts; the wrong colour fires at " +
    "once; curtainCoreHits end it, holding the wave curtainOutBeats more. " +
    "A hit that does not end it jams the rail for curtainPinBeats: no shove " +
    "moves the sheet at all, and the way back to the core is the hem, " +
    "carried up curtainLiftMilli and held, which bares it while it is held. " +
    "A hem with no lobe left tears off at the next shove and the naked core " +
    "fires every curtainNakedFireBeats. Nothing about it is authored per " +
    "wave. See sim/curtain.ts, sim/config-curtain.ts.",
  "THE TASTER — the boss that grows its armour in the colour you have been spending":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §4: " +
    "the first boss in the game with a memory of the pair rather than of " +
    "itself. A crest of tasterBlades blades stands across the top of the " +
    "field, and each one grows out of it over tasterGrowBeats and then sets " +
    "its edge to whichever colour the pair has spent more of over the last " +
    "tasterWindowBeats — and a blade is struck off only by the colour it is " +
    "not. Its own colour thickens it instead, up to tasterThickMax. From " +
    "tasterFanShorn gone it grows tasterFanBlades at a time; from " +
    "tasterHurryShorn the window shortens to tasterFastWindowBeats and every " +
    "standing blade re-edges every tasterEdgeBeats, until tasterCrestCuts " +
    "cuts into the gaps open the crest and stop it. With tasterClosedBlades " +
    "left the fan closes over the body and nothing reaches it until player 1 " +
    "has carried the interlock tasterPryMilli apart; it stands open " +
    "tasterPryBeats, and tasterPryFills beams in the colour they have spent " +
    "least of end it inside that, holding the wave tasterOutBeats more. THE " +
    "SLOW spans the pry exactly (doubled on the owner's rule, 24 September " +
    "2026). Three of its " +
    "movements are answered on the fan itself: player 1 holds a growing blade " +
    "out of its decision for tasterPinBeats, after which it sets thick, and " +
    "player 2 carries a thumb tasterWipeMilli across a soft column to cut the " +
    "crest without spending a colour. Nothing about it is authored per wave. " +
    "See sim/taster.ts, sim/taster-hand.ts, sim/spend.ts, sim/config-taster.ts.",
  // THE LEDGER and everything after it (`ship-notes-choreo-b.ts`).
  ...CHOREO_NOTES_B,
  ...CHOREO_NOTES_C,
  ...CHOREO_NOTES_D,
  "THE STARE — an eye that opens on the beat":
    "Rebuilt on the owner's word on 29 September and 2 October 2026: every " +
    "level is a beat pattern the pair learns, authored in " +
    "content/src/stare-levels.ts. A level opens after stareRestBeats with a " +
    "blue pass that plays the pattern once and costs nothing, then plays it " +
    "for real stareTurns times. On an open beat both seats touch nothing, or " +
    "the laser strikes the column the cannon was sent to and the wave is " +
    "lost. After every live pass the eye charges under THE SLOW for " +
    "stareChargeBeats plus stareLashBeatsMilli a lash: both seats pull its " +
    "lashes up, stareLashPullMilli of thumb each, stareLashesFirst on the " +
    "first level and twice as many on each after, or the beam comes down " +
    "the middle. The eye cannot be hurt: stareTurns turns survived, it rises " +
    "to the next level after stareRiseBeats; the last level survived, it " +
    "closes after stareCalmBeats and the wave is won. Nothing else falls in " +
    "its wave.",
  "THE SPOOL — the boss where the line runs out at the speed one of you reads":
    "A thread-spool slung sideways across the top of the field, its line run " +
    "to the hull and taut. The pilot holds the brake at a depth: shallow pays " +
    "line out at spoolRateFastMilli a beat, deep at spoolRateSlowMilli, and a " +
    "brake nobody is holding pays fastest of all — letting go is a choice and " +
    "never a neutral. He is shown the mark's own grip and no number ever. The " +
    "navigator is shown how much line should be out by now against how much " +
    "is, in a band spoolZoneWideMilli across that narrows by a rib to " +
    "spoolZoneNarrowMilli. Held inside the band for a whole movement — one " +
    "leg of spoolLegBeats, then two, then three, then one on the narrowest " +
    "band — a rib eases open. Leaving the band starts the movement again, and " +
    "from the second rib on it also throws a rock down the column the cannon " +
    "is standing in, which is the fight's one hull cost. The rate each leg " +
    "asks for is rolled off the wave's own rng between the two ends, so a " +
    "pair cannot learn a wave by heart. Between the ribs, a story under THE " +
    "SLOW, each state answered on the same brake: after the first the line " +
    "snags, freed by letting the brake right off spoolSnagBeats and gripping " +
    "again; after the second it whips, damped by holding it past " +
    "spoolWhipDeepMilli for spoolWhipBeats; after the third it frays, held " +
    "by a grip no deeper than spoolFrayLightMilli for spoolFrayBeats. A state " +
    "run out is the spool's blow at the hull, which is the wave. Four ribs, " +
    "and the line then goes slack and the spool drifts free under THE SLOW — " +
    "the only boss whose finish is calm. Nothing about it is authored per " +
    "wave. See sim/spool.ts, sim/spool-step.ts, sim/spool-story.ts, " +
    "sim/spool-hand.ts, sim/config-spool.ts.",
} satisfies Partial<Record<GroupName, string>>;
