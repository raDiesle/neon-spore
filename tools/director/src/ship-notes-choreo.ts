import type { GroupName } from "./ship-groups.js";
import { CHOREO_NOTES_B } from "./ship-notes-choreo-b.js";
import { CHOREO_NOTES_C } from "./ship-notes-choreo-c.js";

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
  "THE DIASTOLE — two hearts on two cadences, one each":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §7, " +
    "and the safe version of the boss THE CONDUCTOR was deferred for: the " +
    "tempo never bends, but there are two counts on it and neither player can " +
    "see both. The left chamber contracts every diastoleLeftBeats and is " +
    "player 1's; the right every diastoleRightBeats and is player 2's; the " +
    "far chamber is a still grey mass on the other screen, and geometry says " +
    "whose. Three against five meet every fifteen beats and on no beat " +
    "between — a pair of numbers that stopped being coprime would quietly " +
    "stop being the boss. While the left beats alone an ordinary shot of its " +
    "colour takes it on one of its contractions; from the moment the right " +
    "wakes the only thing that lands is the LANCE beam standing in the " +
    "bridge column on a beat every standing chamber is contracting on. " +
    "diastoleChamberHits is each chamber's health and the fight's shape. The " +
    "coincidence and the burst both open one of THE SLOW's windows, whose own " +
    "two dials are under THE BEAT. Alone, the right chamber's beat has to be " +
    "held as well: player 2 sees it and says now, player 1 clamps the chamber " +
    "on it — a thumb held on it, diastoleChamber — and the beam lands under " +
    "the clamp for diastoleClampBeats. A clamp on the wrong beat, or one held " +
    "past its window, is a spasm: diastoleSpasmBeats in which nothing lands. " +
    "Nothing about it is authored per wave. " +
    "See sim/diastole.ts, sim/diastole-hand.ts, sim/config-diastole.ts, docs/decisions.md #33.",
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
    "nobody hits lands back where it was and relights the socket; a bead left " +
    "sitting batonTurnBeats (batonTightTurnBeats once batonTightenAfter " +
    "handovers are made) settles back to the top. After batonSwingAfter dark " +
    "sockets the arm swings a column either side of the middle; after " +
    "batonShedAfter it sheds its topmost dark socket as a rock every " +
    "batonShedBeats. After batonTwinAfter dark sockets a second bead lights " +
    "at the top in the other colour, and the two merge in the last socket. " +
    "Down to one lit socket, the arm hangs by a thread — the picture thins " +
    "it over batonThreadBeats, and a miss grows it back. " +
    "The merged bead's flight out of it is the crossing, batonFinalBeats " +
    "long, owing an act a beat in turn — a miss sends it back to the top of " +
    "a relit arm. Made whole, the bead falls as a pod, the maw takes it, and " +
    "the arm folds away in batonDownBeats. THE SLOW spans the asks alone: a " +
    "shell swelling for its batonSwellStrips, the draw's " +
    "batonMergeWindowBeats and the crossing, each shut on its own end " +
    "(sim/baton-slow.ts). Nothing about it is authored per " +
    "wave. See sim/baton.ts, sim/baton-cross.ts, sim/config-baton.ts.",
  "THE THROAT — the boss you answer by feeding it":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §1, " +
    "and the only boss in the game answered by GIVING it something. A gullet " +
    "of throatRings ring muscles hangs from the top of the field to " +
    "throatMouthRow, ending in a mouth one column wide that slides its own " +
    "row — throatSlideCols a beat, and throatQuickCols once two rings are " +
    "slack. Every throatInhaleBeats it inhales: whatever stands in the mouth " +
    "is swallowed and everything else in the column is hauled a row closer, " +
    "which is THE DRAG and not THE SLOW, so a braking hand has a whole " +
    "inhale to arrive. A swallowed creature RE-TIGHTENS a slack ring, so the " +
    "wave's own arrivals are the boss's dinner and a pair who lets the field " +
    "run is fighting something that heals. The only thing that hurts it is a " +
    "gum a hand has flung, level along the mouth's row, into the mouth. " +
    "Shots pass through the tube on purpose: that is player 2's answer to a " +
    "creature about to be eaten. Nothing is authored per wave. " +
    "See sim/throat.ts, sim/config-throat.ts, sim/throat-pull.ts.",
  "THE ORRERY — three orbits, and neither of you can see all three":
    "Three rings about a core in the middle column, coming round every " +
    "orreryOuterOrgans, orreryMiddleOrgans and orreryInnerOrgans beats — one " +
    "organ a beat, so the count is the cadence. Every ring is anchored so all " +
    "three gaps first stand at the bottom of their orbits orreryFirstBeats " +
    "after the install, and after that whenever the three come round " +
    "together. A shot up the middle column on such a beat, in the colour the " +
    "core is showing, takes the outermost ring still standing and sheds " +
    "orreryDebris of its organs as rocks. From the first break the core " +
    "spits a rock every orrerySpitBeats down the column its innermost ring " +
    "is pointing at, never its own and never on a beat the shaft is open. An " +
    "alignment opens orrerySlowBeats of THE SLOW as it comes up; the naked " +
    "core takes the beam alone and goes out over orreryOutBeats. Nothing " +
    "about it is authored per wave. See sim/orrery.ts, sim/config-orrery.ts.",
  "THE UNDERTOW — the boss under the floor, answered downward":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §13: " +
    "the one boss that comes up through the hull. A plate bows for " +
    "undertowBowBeats — seen on player 1's screen alone — and a lobe stands " +
    "through it for undertowStandBeats. The maw opened under it from the " +
    "cannon's own column takes it; a tall one only the LANCE beam takes; one " +
    "left standing withdraws and the column is a scar. While it stands the " +
    "breach widens undertowWidenMilli a beat with no plate on it, and at " +
    "undertowWideMilli a second lobe comes through next door. It pushes " +
    "undertowSingles times alone, undertowPairs times in pairs " +
    "undertowPairGap apart, undertowTalls times tall, then once under the " +
    "cannon, which has undertowUnseatBeats to slide off undertowUnseatSlides " +
    "times — the floor follows every slide short of the last — or is unseated for " +
    "undertowUnseatedBeats. Last, the whole edge lifts for undertowRiseBeats " +
    "and one lobe rises in the middle: the maw held open under it for " +
    "undertowHoldBeats takes the body down in undertowDownBeats, and " +
    "undertowLastBeats standing sends it through the hull instead. " +
    "undertowRestBeats of quiet sit between pushes. THE SLOW spans every ask " +
    "— a lobe standing, the floor under the cannon, the last lobe — and the " +
    "body passing through opens undertowSlowBeats of its own. Nothing about " +
    "it is authored per wave. See sim/undertow.ts, sim/config-undertow.ts.",
  "THE CANDLE — the boss fought in the dark":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §14: " +
    "the one boss fought in the dark. The sim does not know the field is " +
    "black — darkness and the per-seat light are the look's. The boss is a " +
    "glow of candleGlowSteps that any colour dims a step, from the cannon's " +
    "column or the beam's. It arrives dark for candleDarkBeats, then drifts " +
    "a column every candleMoveBeats and turns to face a column every " +
    "candleTurnBeats, seen by player 1 alone. At candleEatSteps left it eats " +
    "the shot from the column it faces and re-brightens a step; at " +
    "candleLastSteps it stops moving, turning and eating, and no shot counts " +
    "at all: player 1 pulls the flame candlePinchMilli down off the wick, and " +
    "player 2 has candleSmokeBeats to stand the beam in that column before it " +
    "lights again a step brighter. That puts it out, holding the wave " +
    "candleOutBeats more. Nothing about it is authored per wave. See " +
    "sim/candle.ts, sim/config-candle.ts.",
  "THE GORGE — the boss you hurt by not shooting":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §3: " +
    "the one boss whose health runs backwards. A sack gorgeIntakes wide sits " +
    "under the top of the frame and swallows every shot that reaches it, one " +
    "bead per shot, in the colour of the first; the wrong colour lets a bead " +
    "go. At gorgeFullBeads an intake is full, and gorgeVentShots more shots " +
    "into it rupture it for good — or, left gorgeVentBeats, it vents a torch down " +
    "its column. From gorgeSpitRuptures ruptures it spits a swallowed bead " +
    "back as a body every gorgeSpitBeats; at gorgeMouthRuptures the last " +
    "whole intake becomes the mouth, fills itself, and only the beam in its " +
    "colour while it is full ends it, holding the wave gorgeOutBeats more. " +
    "Two thumbs on it since 18 September 2026 (sim/gorge-hand.ts): player 1's " +
    "pinch on a full intake holds its vent off while it stays, the count " +
    "restarting from the lift; player 2's pry on the mouth is a window of " +
    "gorgePryBeats that gorgePryFills beams end it in — unpried it clenches on the beam, " +
    "and held past the window it clenches on the thumb, throwing the pry off " +
    "with a bead spat. Both windows doubled and both needs raised to two on " +
    "24 September 2026, on the owner's rule; THE SLOW spans each ask (sim/gorge-slow.ts). " +
    "gorgeSinkPer is the look's: a bead of sag per that many held. " +
    "Nothing about it is authored per wave. See sim/gorge.ts, sim/config-gorge.ts.",
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
  "THE STARE — an eye that freezes whoever it looks at":
    "The owner asked for this on 16 September 2026: when the boss looks at " +
    "you, you may not shoot, move or use the shield. The eye is away for " +
    "stareAwayBeats, turns for stareTellBeats — that turn is the whole " +
    "fairness of it, and it is one spoken sentence long — then watches one " +
    "seat, rolled from the wave's own rng and shown only to the *other* " +
    "screen. A watched seat that presses anything breaks the hull, which is " +
    "the wave lost. Every look is stareLookGrowBeats longer than the last, to " +
    "stareLookMaxBeats. It is not the whole wave: the arrivals underneath are " +
    "the ones its author wrote, and the seat that is not watched plays on " +
    "alone. Since 18 September 2026 the eye has a lid, and the free seat may " +
    "pull it down stareLidPullMilli to shut it, which frees the watched seat " +
    "at once; the eye forces it up after stareLidHoldBeats or when the thumb " +
    "lifts, rises for stareReopenBeats, and then looks at whoever pulled it " +
    "for a whole look. Nothing about it is authored per wave.",
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
    "pair cannot learn a wave by heart. Four ribs, and the line then goes " +
    "slack and the spool drifts free under THE SLOW — the only boss whose " +
    "finish is calm. Nothing about it is authored per wave. See sim/spool.ts, " +
    "sim/spool-step.ts, sim/spool-hand.ts, sim/config-spool.ts.",
} satisfies Partial<Record<GroupName, string>>;
