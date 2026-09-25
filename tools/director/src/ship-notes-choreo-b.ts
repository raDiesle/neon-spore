import type { GroupName } from "./ship-groups.js";

/**
 * The paragraph under each **choreographed boss's** card, the second page —
 * THE LEDGER and every boss built after it.
 *
 * Cut out of `ship-notes-choreo.ts` on 17 September 2026 when THE LEAD's
 * paragraph put that file at 240 lines and the next boss's would have landed
 * on the 250-line wall, along the seam `ship-fields-choreo-b.ts` cut the
 * same hour: the order they were built in, which nothing depends on. Spread
 * into `CHOREO_NOTES` in place, so the totality guard over `ROUND_NOTES` is
 * unchanged — a card added to `GroupName` and left without a paragraph on
 * *any* page is the same compile error it always was. THE HASP's went on to
 * a third page on 22 September 2026, for the same reason and along the same
 * seam (`ship-notes-choreo-c.ts`), and the next boss's goes there.
 */
export const CHOREO_NOTES_B = {
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
    "ledgerOutBeats. Every movement has a hand in it: she walks the cord's " +
    "foot along the plating while it roots, plugs the socket to roll a " +
    "return back onto the cord for ledgerPlugBeats of the whole fight, he " +
    "hauls the soonest return a beat down while it whips, and he tears the " +
    "cord out by hand over ledgerHaulMilli once it is taut and the plate " +
    "has left the socket. Nothing about it is authored per wave. See " +
    "sim/ledger.ts, sim/config-ledger.ts, sim/ledger-hand.ts.",
  "THE SINEW — the boss that asks how hard, not when":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §8: " +
    "the boss whose question is a magnitude. A mass sinewMassCols wide hangs " +
    "at sinewMassRow on sinewFibres fibres with a handle either side; each " +
    "seat pulls its own up to sinewReachMilli and the two add into one sum. " +
    "The fibre parts when the sum sits in a band sinewZoneMilli wide, less " +
    "sinewZoneNarrowMilli per fibre gone, rolled from sinewZoneLowMilli up, " +
    "for sinewHoldBeats; over it the fibre snaps, throws the hands off for " +
    "sinewSnapBeats and sheds sinewSnapRocks rocks — sinewSnapRocksLast on " +
    "the last. A hand may land on a whipping handle but cannot pull on it; " +
    "both carried sinewCatchMilli apart catch the tendon and end the swing " +
    "that beat. From sinewDecayFibres gone the rope creeps sinewDecayMilli " +
    "slack a beat under a held hand until both come off. A part opens THE " +
    "SLOW sinewPartSlowBeats. The last part drops the mass over " +
    "sinewFallBeats; both handles swayed sinewSwayMilli the same way walk it " +
    "a column a beat, and sinewClearCols from the middle it lands clear, " +
    "holding the wave sinewOutBeats more; fewer and it lands on the hull. " +
    "Nothing about it is authored per wave. See sim/sinew.ts, " +
    "sim/config-sinew.ts.",
  "THE SURGE — the boss beaten by letting go":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §9: " +
    "the boss whose answer is a release. A bulb surgeBulbCols wide hangs at " +
    "surgeBulbRow with a seam of surgeNotches notches; a thumb from either " +
    "seat charges it surgeChargeMilli a beat, no thumb leaks surgeDecayMilli, " +
    "and surgeBurstMilli is the top of the gauge. Notch k sits at " +
    "surgeNotchMilli plus k times surgeNotchStepMilli, the last one under the " +
    "top less surgeWindowMilli, each with a band surgeWindowMilli either side " +
    "that opens THE SLOW surgeNearSlowBeats as the pressure comes in. Both " +
    "thumbs off inside it within a beat of each other opens the notch and " +
    "sinks the bulb a row; late, alone or short is the charge lost; over it, " +
    "or the top on the beat, bursts — surgeBurstGums gums down its columns " +
    "and surgeBurstBeats in which nothing takes hold. From surgeHoldNotches " +
    "it holds its charge and eats what falls in for surgeAbsorbMilli each, " +
    "from surgeDoubleNotches a thumb charges double, from surgeCloseNotches " +
    "a burst shuts a notch. From surgeRockNotches it spits a rock down its " +
    "own columns every surgeRockBeats beats it has both thumbs on it, which " +
    "only the shield answers — and the shield is on the panel, so the pilot " +
    "wards with his other thumb and neither hand comes off the bulb. The " +
    "last vent everts it over surgeEvertBeats and " +
    "holds the wave surgeOutBeats more. Nothing about it is authored per " +
    "wave. See sim/surge.ts, sim/config-surge.ts.",
  "THE LEAD — the boss you shoot where it will be":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §11: " +
    "the boss the pair has to shoot where it is not yet. A body on a stalk of " +
    "leadSegments segments comes in over the middle and paces leadPaceCols a " +
    "beat, turning at the walls. A shot out of the top hangs leadFlightBeats " +
    "and is judged against the column the body is in then; a hit takes a " +
    "segment, one a beat at most, and a beat every shot missed turns it " +
    "round. From " +
    "leadFastSegments it runs leadFastCols a beat, dropping a torch behind " +
    "every leadTorchEveryBeats and a rock ahead every leadRockEveryBeats; " +
    "from leadForecastSegments the lean says the beat after next. The last " +
    "segment stops it leadStillBeats, unhittable, the lean giving the pass " +
    "away on the last of them. That still is the one thing here a hand can " +
    "reach: the navigator's thumb on the stalk holds it standing for up to " +
    "leadHoldBeats, the fuse not burning while she is on it, and it leans " +
    "from the beat she takes it; it passes the beat she lets go, tears free " +
    "if she holds past leadHoldBeats, and cannot be taken twice in one " +
    "still. Then it crosses to the farther wall " +
    "leadPassCols a beat, and a wall is another still. Only the beam " +
    "standing in a column the pass goes through takes it, leadStillFills " +
    "times: one short of the last stops it dead where it met it, another " +
    "still. THE SLOW runs from each still to the end of its pass, and the " +
    "wave holds leadOutBeats more. Nothing about it is authored per wave. See " +
    "sim/lead.ts, sim/config-lead.ts.",
  "THE SCUTTLE — the boss that throws itself at you, a part at a time":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §15: " +
    "the boss whose body is its ammunition. A frame of scuttleRows by " +
    "scuttleCols sockets hangs over the middle, sown by the seed with rock, " +
    "bodies of both colours and scuttlePods pods. After scuttleLookBeats a " +
    "part comes loose and hangs, and every scuttleThrowBeats it is thrown " +
    "down its column as what it is; a bolt in its column and colour while " +
    "it hangs takes it off instead, and the wrong colour is a rebuff. A pod " +
    "thrown is a real pod, and taken it slackens the next window " +
    "scuttlePodSlackBeats. From scuttleTwinParts left two come loose at " +
    "once, one live; from scuttleFastParts it throws every " +
    "scuttleFastBeats and from the far side. The last part winds up for the " +
    "beam's priming plus scuttleWindSlackBeats under THE SLOW " +
    "scuttleSlowBeats; only the beam in its column takes it, and thrown it " +
    "breaches the hull. The frame comes down over scuttleOutBeats. The one " +
    "hand on it is the pilot's: he may carry one hanging part " +
    "scuttleSwingMilli along the frame, once a cycle and never on the " +
    "wind-up, and it is then thrown down the column he put it in rather " +
    "than its socket's. Nothing " +
    "about it is authored per wave. See sim/scuttle.ts, sim/config-scuttle.ts.",
  "THE ANTIPHON — the boss that grows a thing nobody has a word for":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §12: " +
    "the boss that is a question about describing a thing with no name. A " +
    "smooth body over the middle grows one organ a cycle from a table of " +
    "antiphonShapes contours in families of antiphonFamily, and only the " +
    "pilot sees it; only the navigator sees a rail of antiphonRail " +
    "candidates with a column and a colour each, the organ among them. A " +
    "bolt in the organ's column and colour makes a pit; a decoy's column and " +
    "colour hardens it and adds one to every rail after, up to " +
    "antiphonRailMax. An organ grows for antiphonGrowBeats and stands " +
    "antiphonWindowBeats, then sinks. antiphonPits end it. From " +
    "antiphonTightPits the rail is the organ's family and the window " +
    "antiphonTightWindowBeats; from antiphonSpillPits the rejected fall as " +
    "bodies; from antiphonTwinPits two grow; from antiphonFirePits a sinking " +
    "organ fires; from antiphonEchoPits a pit grows again. Full, it is still " +
    "antiphonStillBeats and grows the ship on a rail of antiphonShipRail; " +
    "the right one bursts it over antiphonOutBeats. A thumb resting on the " +
    "organ turns it in place, a whole turn in antiphonTurnBeats, and it " +
    "stops when the thumb lifts. The navigator carries a candidate " +
    "antiphonPullMilli down off her rail to cross it off: a bolt into its " +
    "column and colour is nothing and it cannot fall on them, but pull off " +
    "the organ and the cycle hardens as a decoy's bolt does. See " +
    "sim/antiphon.ts, sim/config-antiphon.ts.",
  "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling":
    "Designed on 16 September 2026 in docs/spec/bosses.md §11.14: the boss " +
    "you seal, on a clock nothing slows. hiveSites sites are sown across the " +
    "inner columns by the seed, each with a colour rolled. After " +
    "hiveLookBeats one opens, and one more every hiveOpenBeats; from the " +
    "hiveTwinFrom-th opening, two at once. hiveSwellBeats before a site " +
    "opens it swells, and only the navigator is shown where; only the pilot " +
    "is shown a breach's colour. Every open breach spills a meteor down its " +
    "column every hiveSpillBeats — a living body of the breach's own colour, " +
    "so a breach costs two shots. A bolt out of the top " +
    "in an open breach's column and colour seals it for good; the wrong " +
    "colour brings every open breach's next spill hiveProvokeBeats sooner; " +
    "the skin between them swallows a shot. Every hiveClenchEvery seals the " +
    "underside clenches up out of reach for hiveClenchBeats: nothing spills " +
    "and nothing seals, the openings arrive anyway, and the backlog breaks " +
    "the beat it relaxes — unless the pilot drags the mass hiveHaulMilli " +
    "back down first. The navigator holds a swelling lobe hivePinchBeats to " +
    "wring the colour out of it, and it opens taking either colour, at a " +
    "wrong bolt's price. The last seal opens THE SLOW " +
    "hiveSlowBeats and the wave holds hiveOutBeats more. Nothing about it " +
    "is authored per wave. See sim/hive.ts, sim/hive-lobe.ts, " +
    "sim/config-hive.ts.",
  "THE INSTAR — the boss with no panel: its own body is marked where it will hurt you":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §16 " +
    "and docs/spec/bosses.md §11.32: the choreographed scene with no control " +
    "set. The script (packages/content/src/instar-script.ts) is a beat list " +
    "of poses; each pose morphs in over its own beats with the marks hidden, " +
    "then shows its marks — a ring on a part of the body, saying whose thumb " +
    "and what gesture — for its own window, then lands and settles. A mark " +
    "is a drag on instarMark: a tap, a pull, a swipe, a turn or a hold. A " +
    "step with a mark per seat lands only when both are done within " +
    "instarTogetherBeats of each other, else the first slips; a swipe counts " +
    "on a lift past instarSwipeMilli. A window closing on an undone mark is " +
    "one strike on the hull, which is the wave. Every window is THE SLOW: it " +
    "opens when the marks come up and shuts the tick the step is answered or " +
    "missed, so the asking is slowed and the landing is not. The fall opens " +
    "its own, instarSlowBeats, and the body hangs instarOutBeats more. See " +
    "sim/instar.ts, sim/instar-hand.ts, sim/config-instar.ts.",
  "THE FILAMENT — the boss whose line one of you draws while the other follows it":
    "Designed on 18 September 2026 in docs/spec/bosses-choreographed.md §17 " +
    "and docs/spec/bosses.md §11.33: the one boss that is a trace, and the " +
    "trace is not fixed. Seven filaments (packages/content/src/filament-" +
    "script.ts), each a path of tiles from a free end to its root. One is " +
    "armed filamentArmBeats, then both thumbs are one drag on filament: the " +
    "pilot draws it a tile a beat from the free end, the navigator follows " +
    "on the lit part behind him. Two tiles in a beat snap it; her thumb on " +
    "his tile is a recoil; a gap past filamentGapTiles is the filament going " +
    "dark; a line still past filamentStartBeats for the first tile or " +
    "filamentStallBeats after is late — each strikes the hull, which is the " +
    "wave (25 September 2026). Her thumb on " +
    "the root pulls the filament out over filamentPullBeats; the seventh " +
    "opens THE SLOW filamentSlowBeats and the body hangs filamentOutBeats " +
    "more. See sim/filament.ts, sim/filament-turn.ts, sim/filament-" +
    "hand.ts, sim/config-filament.ts.",
  "THE GIMBAL — the boss where the same turn is not the same turn":
    "Designed on 19 September 2026 in docs/spec/bosses-choreographed.md §18 " +
    "and docs/spec/bosses.md §11.34: one wheel gripped from its two opposite " +
    "faces. A sealed drum hangs in two nested rings set at right angles — the " +
    "outer is the pilot's, the inner is the navigator's — and its health is " +
    "six latch-teeth, three to a ring. Three alignments " +
    "(packages/content/src/gimbal-script.ts) come up gimbalStillBeats apart, " +
    "each a bearing per ring; each seat drags round its own rim " +
    "(gimbalOuter, gimbalInner, both BearingDrag) and holds inside " +
    "gimbalTrueMilli of its mark. Both true together for gimbalHoldBeats " +
    "shears a tooth off each; either ring leaving early is a slip and the " +
    "hold starts over. A ring nobody is holding drifts back to the top at " +
    "gimbalDriftMilli a beat. The inner ring is drawn mirrored on its own " +
    "screen, so a turn called across the phone goes the wrong way until the " +
    "pair finds it out — the one departure from the design's row 12, argued " +
    "in §11.34. With gimbalTeeth down to one pair the drum swings loose and " +
    "the seam leaks: a bolt of either colour shuts it, and gimbalSeamBeats " +
    "unanswered is one strike on the hull, which is the wave. The last shear " +
    "opens THE SLOW gimbalSlowBeats and the hatch hangs gimbalOpenBeats " +
    "more. See sim/gimbal.ts, sim/gimbal-hand.ts, sim/config-gimbal.ts.",
} satisfies Partial<Record<GroupName, string>>;
