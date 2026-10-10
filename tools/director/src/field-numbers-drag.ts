import type { SimConfig } from "@neon-spore/sim";

/**
 * The `SimConfig` fields that decide whether a **drag** row's gesture counts —
 * how far, how long, how near — read off the row's own handler in
 * `packages/sim/src/<boss>-hand.ts` and the step and story files beside it.
 * `field-numbers.ts` holds the rest and draws them. Names only: the values
 * are `DEFAULT_CONFIG`'s, read when the card is drawn, so a retune shows here
 * the moment it lands.
 */
export const DRAG_NUMBERS: Readonly<Record<string, readonly (keyof SimConfig)[]>> = {
  // Pull past a distance.
  "THE BLISTER'S SWIPE": ["blisterSwipeMilli", "blisterUpBeats", "blisterBlows"],
  "THE WARDEN'S TETHER": ["wardenTautMilli", "wardenCycleBeats"],
  "THE WARDEN'S SWIPE": ["wardenThrowMilli", "wardenThrowBeats"],
  "THE ANTIPHON'S RAIL": [
    "antiphonReachMilli",
    "antiphonVeinSlackMilli",
    "antiphonWindowBeats",
    "antiphonTightWindowBeats",
  ],
  "THE GAUGE'S TOOTH": ["gaugeToothPullMilli", "gaugeTeethToPull", "gaugeToothBeats"],
  "THE GAUGE'S TONGUE": ["gaugeTongueTwistMilli", "gaugeTongueBeats"],
  "THE CURTAIN'S HEM": ["curtainLiftMilli", "curtainPinBeats"],
  "THE LAMPREY'S HEAD": ["lampreyHeadPullMilli", "lampreyTailPullMilli"],
  "THE LAMPREY'S HEAD, TOWED": [
    "lampreyTowMilli",
    "lampreyTowAngerMilli",
    "lampreyTowBackMilli",
    "lampreyTailPullMilli",
  ],
  "THE HIVE'S HAUL": ["hiveHaulMilli", "hiveClenchBeats"],
  "THE VANE'S HOUSING": ["vaneHaulMilli", "vanePinBeats"],
  "PINBALL'S PLUNGER": ["pinballWindMilli", "pinballHardMilli"],
  "THE TASTER'S WIPE": ["tasterWipeMilli"],
  "THE TASTER'S PRY": ["tasterPryMilli", "tasterPryBeats"],
  "THE LEDGER'S PULL": ["ledgerWhipSeam"],
  "THE STARE'S LASHES": [
    "stareLashPullMilli",
    "stareLashesFirst",
    "stareChargeBeats",
    "stareLashBeatsMilli",
  ],
  "THE LEDGER'S HAUL": ["ledgerHaulMilli"],
  "THE FLEET'S WRECK": ["fleetWreckPullMilli", "fleetWreckBeats"],
  "THE TRAPEZE'S LEFT ZONE": ["trapezeSwipeMilli", "trapezePushMilli", "trapezeBrakeMilli"],
  "THE TRAPEZE'S RIGHT ZONE": ["trapezeSwipeMilli", "trapezePushMilli", "trapezeBrakeMilli"],
  "THE BASTION'S LEFT SLAB": ["bastionPullMilli", "bastionSnapMilli"],
  "THE BASTION'S RIGHT SLAB": ["bastionPullMilli", "bastionSnapMilli"],
  // A lever: carried to a depth and held.
  "THE LID'S CORD": ["lidTautMilli", "lidCordMilli"],
  "THE BALLOON'S LEFT HANDLE": ["balloonTautMilli", "balloonHoldBeats"],
  "THE BALLOON'S RIGHT HANDLE": ["balloonTautMilli", "balloonHoldBeats"],
  "THE SINEW'S LEFT HANDLE": [
    "sinewReachMilli",
    "sinewZoneMilli",
    "sinewZoneNarrowMilli",
    "sinewZoneLowMilli",
    "sinewHoldBeats",
    "sinewCatchMilli",
    "sinewSnapBeats",
  ],
  "THE SINEW'S RIGHT HANDLE": [
    "sinewReachMilli",
    "sinewZoneMilli",
    "sinewZoneNarrowMilli",
    "sinewZoneLowMilli",
    "sinewHoldBeats",
    "sinewCatchMilli",
    "sinewSnapBeats",
  ],
  "THE SPOOL'S BRAKE": [
    "spoolReachMilli",
    "spoolRateFastMilli",
    "spoolRateSlowMilli",
    "spoolZoneWideMilli",
    "spoolZoneNarrowMilli",
    "spoolGraceBeats",
  ],
  "THE HASP'S LATCH": ["haspReachMilli", "haspGripMilli", "haspHoldBeats", "haspBurnBeats"],
  "THE RATCHET'S CATCH": ["ratchetReachMilli", "ratchetGripMilli", "ratchetWindSets"],
  "THE MANTLE'S LEFT KNOB": ["mantleFloorMilli", "mantleBraceBeats", "mantleLastBeats"],
  "THE MANTLE'S RIGHT KNOB": ["mantleFloorMilli", "mantleBraceBeats", "mantleLastBeats"],
  "THE PLUMB'S LEFT STONE": ["plumbPullReachMilli", "plumbGraceBeats"],
  "THE PLUMB'S RIGHT STONE": ["plumbPullReachMilli", "plumbGraceBeats"],
  "THE VISE'S LEFT LOBE": ["viseOpenMilli", "viseShutMilli", "viseGraceBeats"],
  "THE VISE'S RIGHT LOBE": ["viseOpenMilli", "viseShutMilli", "viseGraceBeats"],
  "THE CAPSTAN'S PULL": ["capstanPullMilli", "capstanHoldBeats"],
  "THE LATCH'S LEFT GRIP": ["latchReachMilli", "latchStrokeMilli", "latchKnotMilli"],
  "THE LATCH'S RIGHT GRIP": ["latchReachMilli", "latchStrokeMilli", "latchKnotMilli"],
  // Carried to a place.
  "THE SCUTTLE'S PART": ["scuttleSwingMilli", "scuttleThrowBeats"],
  "THE LEDGER'S FOOT": ["ledgerRootBeats"],
  "THE MAZE'S STRING": ["mazeLeverOutMilli", "mazeSnapMilli", "mazeDragBreakMilli"],
  "THE WELL'S WIND": ["wellRollSectors"],
  "THE THROAT'S MOUTH": ["throatSideMarginMilli", "throatTopMarginMilli"],
  // Rubbed.
  "THE CAPSTAN'S RUB": ["capstanWearThreshold", "capstanHoldBeats"],
  "THE MAZE'S HEART": ["mazeHeartFreeMilli", "mazeShakeWidths", "mazeGripBeats"],
  "THE THROAT'S PUMP": [
    "throatStrokeMilli",
    "throatPumpGainMilli",
    "throatPumpDecayMilli",
    "throatMinRadiusMilli",
    "throatMaxRadiusMilli",
  ],
  "THE BLISTER'S RUB": ["blisterUpBeats", "blisterBlows"],
  // Drawn, then swiped.
  "THE SLING'S LEFT CORD": ["slingGraceBeats", "slingCoolBeats", "slingCoolSnaps"],
  "THE SLING'S RIGHT CORD": ["slingGraceBeats", "slingCoolBeats", "slingCoolSnaps"],
  // A wheel turned.
  "THE GIMBAL'S OUTER RING": ["gimbalCarryPct", "gimbalLetGoTicks", "gimbalDriftMilli"],
  "THE GIMBAL'S INNER RING": ["gimbalLetGoTicks", "gimbalDriftMilli"],
  "THE HASP'S WHEEL": ["haspWindMilli", "haspWindStepMilli", "haspWindTravelMilli"],
  "THE VALVE'S WHEEL": ["valveNearMilli", "valveLapMilli", "valveFreezeBeats", "valveKickMilli"],
  "THE BASTION'S RIM": ["bastionRimMilli", "bastionFrontMilli"],
  "THE BLISTER'S TURN": ["blisterUpBeats", "blisterBlows"],
  // Traced along a line.
  "THE FILAMENT'S LINE": ["filamentGapTiles", "filamentStartBeats", "filamentStallBeats"],
  "THE FLEET'S RAKE": ["fleetRakeBeats", "fleetFloodBeats"],
};
