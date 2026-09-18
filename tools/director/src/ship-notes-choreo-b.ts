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
 * *any* page is the same compile error it always was. The next boss's
 * paragraph goes here.
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
    "a burst shuts a notch. The last vent everts it over surgeEvertBeats and " +
    "holds the wave surgeOutBeats more. Nothing about it is authored per " +
    "wave. See sim/surge.ts, sim/config-surge.ts.",
  "THE LEAD — the boss you shoot where it will be":
    "Designed on 17 September 2026 in docs/spec/bosses-choreographed.md §11: " +
    "the boss the pair has to shoot where it is not yet. A body on a stalk of " +
    "leadSegments segments comes in over the middle and paces leadPaceCols a " +
    "beat, turning at the walls. A shot out of the top hangs leadFlightBeats " +
    "and is judged against the column the body is in then; a hit takes a " +
    "segment, one a beat at most, and a beat every shot missed turns it " +
    "round. Every judged beat opens THE SLOW leadSlowBeats. From " +
    "leadFastSegments it runs leadFastCols a beat, dropping a torch behind " +
    "every leadTorchEveryBeats and a rock ahead every leadRockEveryBeats; " +
    "from leadForecastSegments the lean says the beat after next. The last " +
    "segment stops it leadStillBeats, unhittable, the lean giving the pass " +
    "away on the last of them; then it crosses to the farther wall " +
    "leadPassCols a beat, and a wall is another still. Only the beam " +
    "standing in a column the pass goes through takes it, and the wave " +
    "holds leadOutBeats more. Nothing about it is authored per wave. See " +
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
    "breaches the hull. The frame comes down over scuttleOutBeats. Nothing " +
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
    "stops when the thumb lifts. See sim/antiphon.ts, sim/config-antiphon.ts.",
  "THE HIVE — the boss you seal, and every breach you have not sealed yet is spilling":
    "Designed on 16 September 2026 in docs/spec/bosses.md §11.14: the boss " +
    "you seal, on a clock nothing slows. hiveSites sites are sown across the " +
    "inner columns by the seed, each with a colour rolled. After " +
    "hiveLookBeats one opens, and one more every hiveOpenBeats; from the " +
    "hiveTwinFrom-th opening, two at once. hiveSwellBeats before a site " +
    "opens it swells, and only the navigator is shown where; only the pilot " +
    "is shown a breach's colour. Every open breach spills a meteor down its " +
    "column every hiveSpillBeats — warded, never shot. A bolt out of the top " +
    "in an open breach's column and colour seals it for good; the wrong " +
    "colour brings every open breach's next spill hiveProvokeBeats sooner; " +
    "the skin between them swallows a shot. The last seal opens THE SLOW " +
    "hiveSlowBeats and the wave holds hiveOutBeats more. Nothing about it " +
    "is authored per wave. See sim/hive.ts, sim/config-hive.ts.",
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
    "one strike on the hull, which is the wave. The last landing opens THE " +
    "SLOW instarSlowBeats and the body hangs instarOutBeats more. See " +
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
    "dark — each starts that filament again from its free end. Her thumb on " +
    "the root pulls the filament out over filamentPullBeats; the seventh " +
    "opens THE SLOW filamentSlowBeats and the body hangs filamentOutBeats " +
    "more. Nothing strikes the hull. See sim/filament.ts, sim/filament-" +
    "hand.ts, sim/config-filament.ts.",
} satisfies Partial<Record<GroupName, string>>;
