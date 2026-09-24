/**
 * **What a wave authors when it wants a boss that is a clock** — the five
 * from `docs/spec/bosses-choreographed.md` and THE STARE before them, and
 * every one of them authors nothing at all.
 *
 * Cut out of `boss-entries.ts` when THE UNDERTOW took that file nine lines
 * over its limit, along the seam `bosses-clocks.ts` and
 * `config-boss-clocks.ts` cut the same day: next door is a boss with a
 * *place* a wave has to give it — a column, a wheel, a row — and this is a
 * boss whose whole difficulty is a beat count the pair says out loud, which
 * is tuning rather than authoring. Five interfaces of one line each and a
 * paragraph over every one saying why the line is all there is; the
 * paragraphs are the file, and they are what would not fit.
 *
 * THE HIVE's went across to `boss-entries-clocks-b.ts` on 22 September 2026,
 * when THE BELLOWS took this page two lines over its limit, and THE BELLOWS's
 * own followed it the same day under THE HASP — the *last* boss on a full
 * page goes, never the boss being worked on, whose paragraph stays under the
 * boss it explains.
 *
 * Every name is re-exported from `boss-entries.ts` and from `entries.ts`
 * after it, so nothing that already reached for one through either had to
 * move.
 */

/**
 * What a wave authors when it wants THE STARE, which is nothing at all — THE
 * WELL's entry one boss along, and for a related reason.
 *
 * No column: the eye is in the sky rather than in a lane, and one placed over
 * a column would be a boss the pair could answer by standing somewhere else.
 * No health and no rounds: there is nothing to shoot. And no length either,
 * because the wave underneath is the wave its author wrote — the eye bends
 * what that wave costs rather than being the encounter (`bossFillsWave`), so
 * how long it runs is how long the entries take.
 *
 * Everything about its rhythm is tuning (`config-stare.ts`): a wave whose
 * warning was authored per encounter would be several different bosses
 * wearing one name, and the length of the warning is the whole fairness of it.
 */
export interface StareEntry {
  kind: "stare";
}

/**
 * What a wave authors when it wants THE DIASTOLE, which is nothing at all —
 * THE STARE's entry one boss along, and for three reasons rather than one.
 *
 * No column: the twin lobe hangs dead centre above the grid, and one placed off
 * centre would have a long side and a short one, so the cannon would be a
 * different distance from the bridge depending on which way it came — the one
 * thing this fight must not add to its arithmetic (`diastoleBridgeCol`).
 *
 * No health: it is two chambers of `diastoleChamberHits` each, and the number
 * is the fight's shape rather than its length — the left gives two of them up
 * to ordinary shots before the right ever wakes, which is how the pair learns
 * that a cadence has to be counted rather than watched.
 *
 * And no cadences, which is the one that had to be argued: **they are the boss
 * and they are tuning anyway** (`config-diastole.ts`). Three against five is a
 * coincidence every fifteen beats and on no beat between; a wave that authored
 * its own pair would be several different bosses wearing one name, and worse
 * than that, a boss nobody could ever have learned to count.
 */
export interface DiastoleEntry {
  kind: "diastole";
}

/**
 * What a wave authors when it wants THE BATON, which is nothing at all —
 * THE STARE's entry one boss along. No column: the arm hangs dead centre for
 * THE DIASTOLE's reason. No health: it is `batonSockets` sockets and the
 * fight's length is the pair's own alternation. And no cadence, because the
 * cadence *is* the boss and is tuning (`config-baton.ts`): a wave that
 * authored its own flight length would be several different bosses wearing
 * one name.
 */
export interface BatonEntry {
  kind: "baton";
}

/**
 * What a wave authors when it wants THE THROAT, which is nothing at all — THE
 * DIASTOLE's entry one boss along, and for its three reasons said about a tube.
 *
 * No column: the gullet hangs dead centre and its mouth walks the field from
 * there (`throatHomeCol`). No health: it is `throatRings` ring muscles, and the
 * count is the silhouette rather than a difficulty dial. And no clocks — the
 * inhale and the mouth's stride are the two numbers the pair *says out loud*,
 * so a wave that authored its own pair would be a boss nobody could ever have
 * learned to talk about (`config-throat.ts`).
 */
export interface ThroatEntry {
  kind: "throat";
}

/**
 * What a wave authors when it wants THE UNDERTOW, which is nothing at all —
 * the fourth boss in a row to author nothing. No column: it pushes where the
 * seeded rng says and, once, where the cannon is standing. No health: the
 * fight is a fixed number of pushes and the last of them is a hold, not a
 * hit (`undertow.ts`). Every count is tuning (`config-undertow.ts`), for
 * THE BATON's reason: a boss whose pushes differed by wave would be several
 * bosses wearing one name, and none of them learnable.
 */
export interface UndertowEntry {
  kind: "undertow";
}

/**
 * What a wave authors when it wants THE ORRERY, which is nothing at all — the
 * fifth in a row, and the first where the *place* is not merely unauthorable
 * but is the whole of what the design had to give up. No column: the rings are
 * concentric about a core in the middle of the field, so the one column a shot
 * can ever reach it up is the middle one, and a wave that moved it would move
 * the cannon's home rather than the boss. No health: it is three rings and a
 * core, and which beat each of them can be taken on is arithmetic over three
 * orbits (`orrery-beat.ts`). The three orbits and the beat they first meet on are
 * tuning (`config-orrery.ts`), for THE DIASTOLE's reason said about three
 * cadences instead of two: the pair's job is to *count* them, and a boss whose
 * arithmetic changed per wave is a boss nobody could ever have learned.
 */
export interface OrreryEntry {
  kind: "orrery";
}

/**
 * What a wave authors when it wants THE CANDLE, which is nothing at all —
 * the sixth. No column: the glow starts dead centre and drifts where the
 * seeded rng says. No health: the glow is five steps and five is the number
 * a pair can tell apart in the dark (`candle.ts`, `config-candle.ts`).
 */
export interface CandleEntry {
  kind: "candle";
}

/**
 * What a wave authors when it wants THE GORGE, which is nothing at all — the
 * seventh. No column: the sack is seven intakes wide and centred. No health:
 * it starts empty, and the pair's own shots are what fill it
 * (`gorge.ts`, `config-gorge.ts`).
 */
export interface GorgeEntry {
  kind: "gorge";
}

/**
 * What a wave authors when it wants THE CURTAIN: nothing, the eighth. The
 * fabric is seven columns wide and centred, its hem full; where the core
 * hangs behind it and in what colour is the seeded rng's, so a wave cannot
 * author the answer the pair has to say (`curtain.ts`, `config-curtain.ts`).
 */
export interface CurtainEntry {
  kind: "curtain";
}

/**
 * What a wave authors when it wants THE TASTER, which is nothing at all — the
 * ninth. No column: the crest is as wide as the field and hugs its top row.
 * No health either, and none is authorable: the fan is eleven blades and the
 * colour of every one of them is read off what the pair has spent, so a wave
 * that set its own would be a boss with the one thing about it that is not the
 * pair's own doing (`taster.ts`, `config-taster.ts`).
 */
export interface TasterEntry {
  kind: "taster";
}

/**
 * What a wave authors when it wants THE SINEW: nothing, the tenth. The
 * tendon hangs dead centre with every fibre whole; where the strain zone
 * sits for each fibre is the seeded rng's, so a wave cannot author the
 * number the pair has to say (`sinew.ts`, `config-sinew.ts`).
 */
export interface SinewEntry {
  kind: "sinew";
}

/**
 * What a wave authors when it wants THE LEDGER: nothing, the eleventh. The
 * body stands over the middle of the field and the cord goes into the hull
 * under it; where the socket walks to is the fight's own arithmetic and the
 * colour the seam shows is the seeded rng's, so a wave that authored either
 * would be answering the question the pair is there to be asked
 * (`ledger.ts`, `config-ledger.ts`).
 */
export interface LedgerEntry {
  kind: "ledger";
}

/**
 * What a wave authors when it wants THE SURGE: nothing, the twelfth. The
 * bulb hangs dead centre with its seam shut; where the notches sit on the
 * gauge is tuning, and what the pair lifts on is the number the beat left
 * (`surge.ts`, `config-surge.ts`).
 */
export interface SurgeEntry {
  kind: "surge";
}

/**
 * What a wave authors when it wants THE LEAD: nothing, the thirteenth. The
 * body comes in over the middle column facing right with every segment on
 * the stalk; how far ahead a shot has to be put is tuning, and where it
 * will be is the pair's sum (`lead.ts`, `config-lead.ts`).
 */
export interface LeadEntry {
  kind: "lead";
}

/**
 * What a wave authors when it wants THE SCUTTLE: nothing, the fourteenth.
 * The frame comes in full over the middle columns; which sockets hold pods
 * and which parts are rock is the seed's, and how many parts there are and
 * the cadence they go on is tuning (`scuttle.ts`, `config-scuttle.ts`).
 */
export interface ScuttleEntry {
  kind: "scuttle";
}

/**
 * What a wave authors when it wants THE HASP: nothing, the twentieth.
 *
 * No hasps, though they are the health: three clasps down the centre line is
 * the *silhouette*, and a door sealed with four would be a different door
 * (`hasp.ts`, `HASP_COUNT`). No fuse and no winding, because both are things
 * the pair has to feel their way to — how long a grip lasts before it burns
 * and how far a wheel has to go round — and a wave that authored its own
 * would be several different bosses wearing one name, `SpoolEntry`'s
 * reason next door (`boss-entries-clocks-b.ts`).
 *
 * And nothing about which hand is whose: the latch is the pilot's and the
 * wheel the navigator's, which is the encounter rather than a figure
 * (`hasp-hand.ts`).
 */
export interface HaspEntry {
  kind: "hasp";
}
