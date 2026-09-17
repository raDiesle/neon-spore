import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each **round's** card.
 *
 * Split out of `ship-notes.ts` when THE TELL's took that file past its
 * 250-line limit — a file that had been sitting exactly on the ceiling and
 * paying for it (`docs/queue.md`). The seam is the one `ship-fields-round.ts`
 * already cut next door and for the same reason: a round is a whole second
 * game with its own picture, its own panel and its own numbers, there are nine
 * more of them designed, and everything left in `ship-notes.ts` is a dial on
 * the field.
 *
 * Spread into `GROUP_NOTE` rather than read beside it, so the totality guard
 * still holds: a card added to `GroupName` and left without a paragraph in
 * *either* file is the same compile error it always was.
 */
export const ROUND_NOTES = {
  "THE GAUGE — a round with no field in it":
    "A boss wave with no field under it — off for the same reason as the one " +
    "above, since a headless caller has no second thumb to answer it with. On, " +
    "the gaps between acts may carry a round that is not the field: a needle " +
    "walked by drift and corrected by a valve. See gauge.ts, gauge-round.ts.",
  "THE FLEET — a chart only one of you can read":
    "A lattice of squares with ships hidden in it. Player 1 sees every hull and " +
    "holds the only trigger; player 2 walks the sights a square at a time and is " +
    "shown nothing but water. The clock is the whole of the danger — running out " +
    "of it breaks the hull. See fleet.ts, config-fleet.ts.",
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
    "two dials are under THE BEAT. Nothing about it is authored per wave. " +
    "See sim/diastole.ts, sim/config-diastole.ts, docs/decisions.md #33.",
  "THE BATON — a bead passed down an arm, one seat a beat":
    "Designed on 16 September 2026 in docs/spec/bosses-choreographed.md §10: " +
    "an arm of batonSockets sockets hangs from the top of the middle column " +
    "with one bead in the topmost, and the bead is passed down it by strict " +
    "alternation. Player 1's trigger launches it, and it is in the air for " +
    "batonFlightBeats — THE DRAG, not THE SLOW: the clock never bends, the " +
    "bead is slow — during which a shot of its colour up its column from " +
    "player 2 lands it a socket lower and darkens the one it left. The seat " +
    "that acted is locked out of every control for batonLockBeats. A bead " +
    "nobody hits lands back where it was and relights the socket; a bead left " +
    "sitting batonTurnBeats (batonTightTurnBeats once batonTightenAfter " +
    "handovers are made) settles back to the top. After batonSwingAfter dark " +
    "sockets the arm swings a column either side of the middle; after " +
    "batonShedAfter it sheds its topmost dark socket as a rock every " +
    "batonShedBeats. Out of the last socket the bead falls as a pod, the maw " +
    "takes it, and the arm folds away in batonDownBeats. Nothing about it is " +
    "authored per wave. See sim/baton.ts, sim/config-baton.ts.",
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
    "cannon, which has undertowUnseatBeats to slide off or is unseated for " +
    "undertowUnseatedBeats. Last, the whole edge lifts for undertowRiseBeats " +
    "and one lobe rises in the middle: the maw held open under it for " +
    "undertowHoldBeats takes the body down in undertowDownBeats, and " +
    "undertowLastBeats standing sends it through the hull instead. " +
    "undertowRestBeats of quiet sit between pushes; the rise and the body " +
    "passing through each open undertowSlowBeats of THE SLOW. Nothing about " +
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
    "candleLastSteps it stops moving, turning and eating, and the last shot " +
    "puts it out, holding the wave candleOutBeats more. Nothing about it is " +
    "authored per wave. See sim/candle.ts, sim/config-candle.ts.",
  "THE GORGE — the boss you hurt by not shooting":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §3: " +
    "the one boss whose health runs backwards. A sack gorgeIntakes wide sits " +
    "under the top of the frame and swallows every shot that reaches it, one " +
    "bead per shot, in the colour of the first; the wrong colour lets a bead " +
    "go. At gorgeFullBeads an intake is full, and the next shot into it " +
    "ruptures it for good — or, left gorgeVentBeats, it vents a torch down " +
    "its column. From gorgeSpitRuptures ruptures it spits a swallowed bead " +
    "back as a body every gorgeSpitBeats; at gorgeMouthRuptures the last " +
    "whole intake becomes the mouth, fills itself, and only the beam in its " +
    "colour while it is full ends it, holding the wave gorgeOutBeats more. " +
    "gorgeSinkPer is the look's: a bead of sag per that many held. Nothing " +
    "about it is authored per wave. See sim/gorge.ts, sim/config-gorge.ts.",
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
    "once; curtainCoreHits end it, holding the wave curtainOutBeats more. A " +
    "hem with no lobe left tears off at the next shove and the naked core " +
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
    "shots into the gaps open the crest and stop it. With tasterClosedBlades " +
    "left the fan closes over the body and only the beam in the colour they " +
    "have spent least of opens it, holding the wave tasterOutBeats more. " +
    "Nothing about it is authored per wave. See sim/taster.ts, " +
    "sim/spend.ts, sim/config-taster.ts.",
  "THE LEDGER — the boss that bills your own hull for every shot":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §5: " +
    "the first boss whose damage travels the other way. A body ledgerCols " +
    "wide stands over the middle of the field with a cord out of its " +
    "underside rooted in the hull, and the seam down its middle takes " +
    "ledgerSeamHits hits — each one in the colour the seam is showing, and " +
    "each one sending the same damage back down the cord into the socket " +
    "ledgerCadenceBeats beats later, one beat less per hit and never under " +
    "ledgerCadenceMinBeats. The plate in the socket's column with the " +
    "trigger on that beat wards it; nobody there and the hull takes it, " +
    "which loses the wave. Every return walks the root ledgerSocketStep " +
    "columns along the hull. From ledgerWhipSeam hits the cord bills every " +
    "shot the cannon takes and a warded return is thrown back up it, " +
    "widening the seam for nothing. The last return is the one to let " +
    "through: unwarded it tears the cord out and the halves part over " +
    "ledgerOutBeats. Nothing about it is authored per wave. See " +
    "sim/ledger.ts, sim/config-ledger.ts.",
  "THE SINEW — the boss that asks how hard, not when":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §8: " +
    "the boss whose question is a magnitude. A mass sinewMassCols wide hangs " +
    "at sinewMassRow on sinewFibres fibres with a handle either side; each " +
    "seat pulls its own up to sinewReachMilli and the two add into one sum. " +
    "The fibre parts when the sum sits in a band sinewZoneMilli wide, less " +
    "sinewZoneNarrowMilli per fibre gone, rolled from sinewZoneLowMilli up, " +
    "for sinewHoldBeats; over it the fibre snaps, throws the hands off for " +
    "sinewSnapBeats and sheds sinewSnapRocks rocks — sinewSnapRocksLast on " +
    "the last. From sinewDecayFibres gone the rope creeps sinewDecayMilli " +
    "slack a beat under a held hand until both come off. A part opens THE " +
    "SLOW sinewPartSlowBeats. The last part drops the mass over " +
    "sinewFallBeats; both handles swayed sinewSwayMilli the same way walk it " +
    "a column a beat, and sinewClearCols from the middle it lands clear, " +
    "holding the wave sinewOutBeats more; fewer and it lands on the hull. " +
    "Nothing about it is authored per wave. See sim/sinew.ts, " +
    "sim/config-sinew.ts.",
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
    "alone. Nothing about it is authored per wave.",
  "THE SCOUT — a little ship one of you flies":
    "The round the owner asked for on 16 September 2026, and the first thing " +
    "in the game that flies. The ship opens and puts a little one out: player " +
    "1 turns its nose and burns, and coasts — the drag is what makes it read " +
    "as a ship rather than a cursor. Player 2 is shown every mote and every " +
    "hazard and has no button at all, so the flying is done on their word. " +
    "Collect every mote and the wave is over; a hazard's touch or the clock " +
    "running out costs the hull, which is the wave lost. The arenas are " +
    "authored in packages/content/src/scout-arenas.ts; these dials are how it " +
    "flies, and the top three are the whole feel of it.",
  "SNAKE — a round the ship is the body of":
    "The other built round, and the first control that moves something. The " +
    "ship shrinks into a snake that never stops: player 2 turns it a quarter " +
    "turn at a time and is shown nothing standing in the arena, player 1 has a " +
    "shot and a mouth and cannot steer. Shoot every enemy and swallow every " +
    "point and the round is won; touch an enemy, take a point with the mouth " +
    "shut, hit a wall or your own back, and it starts over for a few points of " +
    "hull. The arenas are a map per round, edited on the wave that carries it " +
    "and stored in packages/content/src/snake-rounds.ts. See snake.ts, " +
    "snake-move.ts.",
  "PINBALL — a table the ship's cannon fires up into":
    "The third built round, and the first body in the game under an " +
    "acceleration. The ship stays a ship and its cannon is both the gun and " +
    "the glove: player 1 slides the cannon on the ordinary strip and stops the " +
    "needle, player 2 picks the strength and fires — and then the same cannon " +
    "has to be under the ball when it falls back. A dropped ball costs the " +
    "hull where it fell; the clock running out costs it more. The ball is " +
    "stepped on the tick in thousandths of a tile, so every number here is " +
    "per tick.",

  "THE PULSE — the same song on two screens":
    "Four lanes of arrows onto four buttons, and both seats have the same four. " +
    "The two windows say how forgiving a thumb on glass is; the meter numbers say " +
    "how many misses a stage survives. The chart itself is not here — it is bars of " +
    "text in packages/content/src/pulse-stages.ts.",
} satisfies Partial<Record<GroupName, string>>;
