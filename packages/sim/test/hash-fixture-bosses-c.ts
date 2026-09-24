import type { BossEntry } from "../src/boss-entries.js";
import type { BossState } from "../src/boss-union.js";

/**
 * **THE LEDGER on: the last page of `hash-fixture.ts`**, and the one a new
 * boss's entry and patch go on — `BOSS_KINDS` is appended to, never inserted
 * into, so the newest boss is always at the end of this file. When it passes
 * 250 lines, a `-d.ts` takes the next boss. What each is authored with and how
 * each is moved off its installed state; the reasons are on `-a.ts` and in
 * `hash-fixture.ts`, which composes the pages.
 */

/** What each is authored with; the keys are the page's share of `BOSS_KINDS`. */
export const BOSS_ENTRIES_C = {
  // THE LEDGER authors nothing either: the body's width, the seam's length and
  // the cadence are tuning (`config-ledger.ts`), and the socket, the colour the
  // seam shows and every return on the cord are what the fixture's world has
  // moved by the time it is fingerprinted (`ledger-hash.ts`).
  ledger: { kind: "ledger" },
  // THE SURGE authors nothing either: the notches and the gauge are tuning
  // (`config-surge.ts`), and the pressure, the thumbs and the lift's tick
  // are what the fixture's world has moved by the time it is fingerprinted
  // (`surge-hash.ts`).
  surge: { kind: "surge" },
  // THE LEAD authors nothing either: the segments, the paces and the flight
  // are tuning (`config-lead.ts`), and the column, the way, the lean, the
  // stalk and every shot in the air are what the fixture's world has moved
  // by the time it is fingerprinted (`lead-hash.ts`).
  lead: { kind: "lead" },
  // THE SCUTTLE authors nothing either: the frame's size and its cadences
  // are tuning (`config-scuttle.ts`), which sockets hold what is the seed's,
  // and every part, the hanging ones, the live one, the slack and the clocks
  // are its own by the time it is fingerprinted (`scuttle-hash.ts`).
  scuttle: { kind: "scuttle" },
  // THE ANTIPHON authors nothing: how many organs and how long they stand is
  // tuning (`config-antiphon.ts`), which shape stands where is the seed's,
  // and the organs, the rail, the pits and the clocks are its own by the
  // time it is fingerprinted (`antiphon-hash.ts`).
  antiphon: { kind: "antiphon" },
  // THE HIVE authors nothing either: how many sites and the clock they open
  // on are tuning (`config-hive.ts`), the order and the colours are the
  // seed's, and which are open, sealed and spilling are its own by the time
  // it is fingerprinted (`hive-hash.ts`).
  hive: { kind: "hive" },
  // THE INSTAR authors the script whole: what poses the body takes, what marks
  // each shows and whose thumb each wants. One step with a mark for each seat
  // is the smallest script that is still the scene — a beat the pair has to
  // land together — and one step is enough, because the fingerprint's job is
  // the cursor and the per-mark counts, not the length of the list
  // (`instar-hash.ts`).
  instar: {
    kind: "instar",
    steps: [
      {
        pose: "gape",
        morphBeats: 2,
        windowBeats: 6,
        landBeats: 2,
        marks: [
          { seat: "p1", part: "jaw", gesture: "pullDown", xMilli: 500, yMilli: 440, need: 1000 },
          { seat: "p2", part: "jaw", gesture: "pullUp", xMilli: 500, yMilli: 240, need: 1000 },
        ],
      },
    ],
  },
  // THE FILAMENT authors the filaments whole, as words walked into tiles at
  // install: two short ones, because the fingerprint's job is every tile of
  // every filament and the two indices along the armed one, not the seven
  // (`filament-hash.ts`).
  filament: {
    kind: "filament",
    filaments: [
      { col: 5, row: 2, moves: "DDR" },
      { col: 3, row: 4, moves: "LD" },
    ],
  },
  // THE GIMBAL authors its alignments whole, for THE FILAMENT's reason above:
  // two of them, because the fingerprint's job is every figure of every
  // alignment and both rings' bearings, not the three (`gimbal-hash.ts`). The
  // second creeps, so the creep is not a column of zeroes the walk cannot tell
  // from an unhashed field.
  gimbal: {
    kind: "gimbal",
    marks: [
      { outerMilli: 250, innerMilli: 250, creepMilli: 0 },
      { outerMilli: 600, innerMilli: 400, creepMilli: 15 },
    ],
  },
  // THE BELLOWS authors nothing at all, which is the entry (`BellowsEntry`):
  // four seams is the silhouette and every window is tuning, so there is no
  // figure here for the walk to vary. What it has to see varied is in
  // `patchBossC` below, and all of it is state (`bellows-hash.ts`).
  bellows: { kind: "bellows" },
  // THE SPOOL authors nothing either (`SpoolEntry`), and for one more reason
  // than THE BELLOWS: the rate each leg asks for is rolled off `world.rng`
  // rather than written, so a pair cannot learn a wave's numbers by heart.
  // Everything the walk must see varied is state, below (`spool-hash.ts`).
  spool: { kind: "spool" },
} satisfies Partial<Record<BossEntry["kind"], BossEntry>>;

/** THE LEDGER on's share of `patchBoss`. */
export function patchBossC(boss: BossState): void {
  if (boss.kind === "ledger") {
    // A seam part way open with a return on the cord and the socket walked off
    // its start, and every clock that only a tear sets given a beat — the walk
    // cannot flip a `-1` it never sees change. The bead is the field that
    // matters: a cord the two devices disagree about is one screen warding an
    // empty socket (`ledger-hash.ts`).
    boss.socket = 4;
    boss.walk = -1;
    boss.want = "cyan";
    boss.seam = 2;
    boss.warded = 1;
    boss.rootBeat = 1;
    boss.outBeat = 5;
    boss.beads = [{ beat: 6, span: 3, last: false, pulled: false }];
  }
  if (boss.kind === "surge") {
    // A notch open, some pressure, both thumbs on, and every clock that only
    // a lift, the band, a burst, the last notch or the end sets given a beat.
    boss.notches = 1;
    boss.pressureMilli = 700;
    boss.heldP1 = true;
    boss.heldP2 = true;
    boss.liftTick = 12;
    boss.nearBeat = 2;
    boss.burstBeat = 3;
    boss.evertBeat = 4;
    boss.outBeat = 5;
  }
  if (boss.kind === "lead") {
    // Off the middle and turned, leaning, a segment down, one shot in the
    // air, and every clock that only the last movement sets given a beat.
    boss.col = 3;
    boss.dir = -1;
    boss.lean = -1;
    boss.segments = 4;
    boss.flights = [{ col: 2, dueBeat: 7 }];
    boss.stillBeat = 2;
    boss.passBeat = 3;
    boss.downBeat = 4;
  }
  if (boss.kind === "scuttle") {
    // One socket empty, one hanging and live, a throw on the clock, a beat
    // of slack bought, and the wind-up and the end given a beat.
    boss.parts = [
      { kind: "rock", color: "red" },
      null,
      { kind: "pod", color: "cyan" },
      { kind: "body", color: "cyan" },
    ];
    boss.loose = [3];
    boss.live = 3;
    boss.lastLive = 0;
    boss.cycleBeat = 6;
    boss.slack = 1;
    boss.windBeat = 7;
    boss.downBeat = 8;
  }
  if (boss.kind === "antiphon") {
    // One organ standing on a rail of three, one pit taken, one wrong answer
    // on record, and every clock given a beat.
    boss.organs = [{ shape: 5, color: "red", col: 3, grownBeat: 6 }];
    boss.rail = [
      { shape: 7, color: "cyan", col: 1 },
      { shape: 5, color: "red", col: 3 },
      { shape: 4, color: "red", col: 5 },
    ];
    boss.pits = [2];
    boss.extra = 1;
    boss.cycleBeat = 6;
    boss.stillBeat = 7;
    boss.downBeat = 8;
  }
  if (boss.kind === "hive") {
    // Three sites: one sealed, one open and one still shut, the clocks on
    // beats of their own, and the end given a beat.
    boss.cols = [2, 5, 8];
    boss.colors = ["red", "cyan", "red"];
    boss.sealed = [true, false, false];
    boss.opened = 2;
    boss.openBeat = 6;
    boss.spillBeat = 7;
    boss.downBeat = 8;
  }
  if (boss.kind === "instar") {
    // The marks up on the first step, one thumb on each, one mark halfway
    // and the other done a beat ago with a bearing remembered.
    boss.phase = "act";
    boss.phaseBeat = 3;
    boss.progress = [500, 1000];
    boss.doneBeat = [-1, 5];
    boss.ref = [-1, 250];
    boss.thumbs = [1, 2];
  }
  if (boss.kind === "filament") {
    // The first filament being traced: three tiles lit, the navigator one
    // behind, the pilot's thumb grabbed at the head and hers at the tail.
    boss.phase = "trace";
    boss.phaseBeat = 3;
    boss.head = 2;
    boss.tail = 1;
    boss.headBeat = 5;
    boss.grab = [2, 1];
  }
  if (boss.kind === "gimbal") {
    // The first alignment up, both rings turned off rest and both thumbs down
    // with a bearing remembered, the hold a beat in, and the seam open with a
    // beat on it — every nullable field given a value, so the walk can tell a
    // hashed one from a field it never sees change (`gimbal-hash.ts`).
    boss.phase = "turn";
    boss.phaseBeat = 3;
    boss.heldBeats = 1;
    boss.atMilli = [240, 260];
    boss.handMilli = [180, 820];
    boss.seamCol = 4;
    boss.seamBeat = 6;
  }
  if (boss.kind === "bellows") {
    // The middle of an exchange, two seams down: his chamber open, her hand
    // part way in, the shared window counted from a beat of its own, the spark
    // leaking in a column with a beat on it, and a lift pending from the seat
    // that let go first — every nullable field given a value, so the walk can
    // tell a hashed one from a field it never sees change (`bellows-hash.ts`).
    boss.phase = "push";
    boss.phaseBeat = 3;
    boss.exchangeBeat = 2;
    boss.exchanged = 1;
    boss.seams = 2;
    boss.handMilli = [1000, 420];
    boss.sparkCol = 4;
    boss.sparkBeat = 6;
    boss.liftTick = 7;
  }
  if (boss.kind === "spool") {
    // Part way down the second movement's second leg: the line paid out past
    // where the zone wants it, a rib already eased, the brake held at a depth
    // that is neither end of its reach, and a rolled rate on the leg — every
    // field given a value the walk could not have got by accident, and the
    // two lengths deliberately different so a hash that dropped one of them
    // would not be covered by the other (`spool-hash.ts`).
    boss.phase = "pay";
    boss.phaseBeat = 4;
    boss.ribs = 3;
    boss.brakeMilli = 430;
    boss.paidMilli = 1820;
    boss.wantMilli = 1640;
    boss.leg = 1;
    boss.legBeat = 6;
    boss.wantRateMilli = 70;
  }
}
