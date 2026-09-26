import type { SimEvent } from "@neon-spore/sim";

/**
 * **The bosses' half of the silent list, the third page** — THE WELL's four,
 * THE GIMBAL's ten, the bosses after it, and THE GAUGE's four, handed across
 * from page two on 25 September 2026.
 *
 * Cut off `effects-ingest-silent-boss-b.ts` on 22 September 2026 along the
 * seam every page of this list is cut on: the order the bosses were built
 * in, with the *last* boss on the full page handed across whole and its own
 * comment with it. THE GIMBAL is on it as well rather than back on page two,
 * which page two's header argues: four rows moved out and ten were coming
 * in, so the hand-across on its own was not enough room and the alternative
 * was tearing a boss out of the middle of a page.
 *
 * `INGEST_SILENT` spreads all three in place, so the guard and the type it
 * narrows by are unchanged, and every row still means what it means there —
 * *this event leaves nothing behind for the next frame*.
 */
export const INGEST_SILENT_BOSS_C = [
  // THE WELL's four, the first events that boss had: the roll, the hold, the
  // far end and the seam coming home are all read off the state the face is
  // drawn from every frame — the phase, `offsetMilli` and `heldBeats`
  // (`render/well.ts`). The picture *is* the report here, because the whole
  // boss is where the picture puts things, so an effect outliving the frame
  // would be a second face disagreeing with the one under the thumb.
  "wellRoll",
  "wellHeld",
  "wellWound",
  "wellHome",
  // THE GIMBAL's ten are one family read above the loop, the way THE
  // FILAMENT's are: the kick of a tooth coming off, the shake of a ring that
  // lost true, the glare of the seam landing, and every burst, are
  // `effects.boss.gimbal`'s (`gimbal-fx.ts`). Where each ring stands, where
  // its mark is this beat, how many teeth are left and whether the seam is
  // leaking stay read off the boss every frame — a burst that outlived the
  // frame would be a second answer to *is it true* beside the rim the thumb
  // is on (`gimbal-draw.ts`, `docs/spec/bosses.md` §11.34).
  "gimbalEnter",
  "gimbalMarks",
  "gimbalTrue",
  "gimbalSlip",
  "gimbalShear",
  "gimbalLeak",
  "gimbalSeamOut",
  "gimbalSeamHit",
  "gimbalHatch",
  "gimbalOut",
  // THE SPOOL's eleven: the line's length, the zone under it, the brake's
  // depth and the four ribs are all read off the boss every frame, and what
  // outlives a frame — the slip, the rib easing, the loosing — is one family
  // read above the loop by spool-fx.ts (`docs/spec/bosses.md` §11.36).
  "spoolEnter",
  "spoolZone",
  "spoolLeg",
  "spoolGrip",
  "spoolLet",
  "spoolSlip",
  "spoolRock",
  "spoolRib",
  "spoolSlack",
  "spoolDrift",
  "spoolOut",
  // THE HASP's fourteen are one family read above the loop, THE GIMBAL's
  // way: the dim of a seize, the flare of a burn, the jolt of a hasp giving
  // and every burst are `effects.boss.hasp`'s (`hasp-fx.ts`), each thrown on
  // the seats shown the half it happened to. How far the wheel has gone
  // round, how hot the latch is, how many clasps are left and whether a bolt
  // is loose stay read off the boss every frame (`hasp-draw.ts`,
  // `docs/spec/bosses.md` §11.37).
  "haspEnter",
  "haspLit",
  "haspGrip",
  "haspLet",
  "haspBurn",
  "haspCool",
  "haspSeize",
  "haspFree",
  "haspOpen",
  "haspBolt",
  "haspBoltOut",
  "haspBoltHit",
  "haspClear",
  "haspOut",
  // THE RATCHET's twelve, one family read above the loop the same way: the
  // jolt and click of a clean tooth, the hull's shudder and every burst are
  // `effects.boss.ratchet`'s (`ratchet-fx.ts`), a set and a let-go thrown on
  // the catch's screens alone. How far the rack has climbed, how many pins
  // are home and whether the catch is set stay read off the boss every frame
  // (`ratchet-draw.ts`, `docs/spec/bosses.md` §11.38).
  "ratchetEnter",
  "ratchetLit",
  "ratchetSet",
  "ratchetLet",
  "ratchetClick",
  "ratchetBurn",
  "ratchetBolt",
  "ratchetBoltOut",
  "ratchetBoltHit",
  "ratchetOpen",
  "ratchetJam",
  "ratchetOut",
  // THE GORGE's and THE TASTER's first halves, which arrived on 24 September
  // 2026 after their own pages had filled: a shot that landed with one more
  // owed. Their bursts are `gorge-fx.ts`' and `taster-fx.ts`', read above the
  // loop with the rest of each boss's; what is owed stays read off the state.
  "gorgeNick",
  "gorgePryFill",
  "tasterPryFill",
  // THE MANTLE's ten: its kick, flare, shock and bursts are `mantle-fx.ts`',
  // read above the loop with the rest of each boss's; how far the shell is
  // pried stays read off the state.
  "mantleEnter",
  "mantleLight",
  "mantleShear",
  "mantleSplit",
  "mantleLeak",
  "mantleSparkOut",
  "mantleSparkHit",
  "mantleBeat",
  "mantleDark",
  "mantleOut",
  // THE KEEL's sixteen, nothing carried into the next frame: only its
  // simulation lane has landed, so there is no picture yet to redraw a
  // transient over. Sound is what these get instead
  // (`packages/audio/src/bind-keel.ts`).
  "keelEnter",
  "keelLight",
  "keelLock",
  "keelMiss",
  "keelSlip",
  "keelSplit",
  "keelSocket",
  "keelShut",
  "keelSocketHit",
  "keelDim",
  "keelRigid",
  "keelThrow",
  "keelRockOut",
  "keelRockHit",
  "keelStraight",
  "keelOut",
  // THE VALVE's thirteen, for the same reason (`packages/audio/src/bind-valve.ts`).
  "valveEnter",
  "valveLight",
  "valveHold",
  "valveSlip",
  "valveLapse",
  "valveFreeze",
  "valveThaw",
  "valvePull",
  "valveSpark",
  "valveSparkOut",
  "valveSparkHit",
  "valveOpen",
  "valveOut",
  // THE SEAM's nine, for the same reason (`packages/audio/src/bind-seam.ts`).
  "seamEnter",
  "seamLight",
  "seamDim",
  "seamSeal",
  "seamRockOut",
  "seamBlock",
  "seamMiss",
  "seamSplit",
  "seamOut",
  // THE OCULUS's twelve, for the same reason (`packages/audio/src/bind-oculus.ts`).
  "oculusEnter",
  "oculusLight",
  "oculusSlip",
  "oculusShut",
  "oculusSpring",
  "oculusBreak",
  "oculusHit",
  "oculusReseal",
  "oculusSwallow",
  "oculusMiss",
  "oculusShatter",
  "oculusOut",
  // THE VISE's twelve, for the same reason (`packages/audio/src/bind-vise.ts`).
  "viseEnter",
  "viseLight",
  "viseSlip",
  "viseCrack",
  "viseSpring",
  "viseBare",
  "viseHit",
  "viseBrace",
  "viseCover",
  "viseMiss",
  "viseSplit",
  "viseOut",
  // THE RIME's twelve, for the same reason (`packages/audio/src/bind-rime.ts`).
  "rimeEnter",
  "rimeLight",
  "rimeShave",
  "rimeClear",
  "rimeFrost",
  "rimeBare",
  "rimeHit",
  "rimeBlock",
  "rimeCloud",
  "rimeMiss",
  "rimeShatter",
  "rimeOut",
  // THE TRIVET's twelve, for the same reason (`packages/audio/src/bind-trivet.ts`).
  "trivetEnter",
  "trivetLight",
  "trivetSlip",
  "trivetPlant",
  "trivetSpring",
  "trivetHub",
  "trivetHit",
  "trivetBrace",
  "trivetRock",
  "trivetMiss",
  "trivetCollapse",
  "trivetOut",
  // THE GAUGE's four, the first events this round has had at all: the needle,
  // the band, the jam and the bind are every one of them world state, read off
  // `needleMilli`, `markMilli`, `jamBeat` and `boundBeat` every frame
  // (`render/gauge.ts`, `docs/queue.md`, 19 September 2026). Sound is what was
  // missing, not a picture — nothing about a mark, a miss, a jam or a bind
  // outlives the frame it happens on.
  "gaugeMark",
  "gaugeMiss",
  "gaugeJam",
  "gaugeBind",
] as const satisfies readonly SimEvent["type"][];
