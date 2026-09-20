import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SimEvent } from "@neon-spore/sim";
import { cueFor, panForCol, pitchForRow } from "../src/bind.js";
import { hasSound } from "../src/catalogue.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/**
 * The `SimEvent` union, read out of the simulation rather than copied here.
 * A copied list is a list that stops being true the day someone adds an event,
 * which is exactly the day the new event silently has no sound.
 *
 * **All three files**, because the union is written in three: what a covering
 * did is `ArmourEvent` in `events-armour.ts`, what a body one of them cannot
 * see did is `CreatureEvent` in `events-creature.ts` — the same two seams this
 * package's own `bind-armour.ts` and `bind-creatures.ts` read on — and
 * `SimEvent` is those two arms plus the ship, the field, the pods and the
 * bosses. Reading only the first would let a creature event ship with no
 * sound, which is the exact failure this test was written for.
 */
async function eventTypes(): Promise<string[]> {
  const found: string[] = [];
  for (const [file, decl] of [
    ["packages/sim/src/events.ts", "export type SimEvent ="],
    ["packages/sim/src/events-creature.ts", "export type CreatureEvent ="],
    // THE CAROM's four, cut out of the file above when they took it over its
    // 250-line limit. Named here rather than globbed for the reason the two
    // above are: a file this test cannot find is a file whose events go
    // silently unheard, so the list has to be a thing somebody adds to on
    // purpose — and forgetting is a failure here rather than a silence.
    ["packages/sim/src/events-carom.ts", "export type CaromEvent ="],
    // And THE CRYSTAL's three, on the same terms, bound beside the carom's.
    ["packages/sim/src/events-crystal.ts", "export type CrystalEvent ="],
    // THE VOLLEY's two, on exactly the same terms and for the same reason.
    ["packages/sim/src/events-volley.ts", "export type VolleyEvent ="],
    // And THE STRAND's three, cut out for the same reason again.
    ["packages/sim/src/events-strand.ts", "export type StrandEvent ="],
    // THE GHOST's three and THE CRAWLER's two, both cut out of
    // `events-creature.ts` on the day THE CRAWLER needed room in it.
    ["packages/sim/src/events-ghost.ts", "export type GhostEvent ="],
    ["packages/sim/src/events-crawler.ts", "export type CrawlerEvent ="],
    // And THE FENCE's two, cut out the day the second one was added.
    ["packages/sim/src/events-fence.ts", "export type FenceEvent ="],
    // And THE MAGNET's two, on the same terms again.
    ["packages/sim/src/events-magnet.ts", "export type MagnetEvent ="],
    // And THE COIL's two, cut out for the same reason once more.
    ["packages/sim/src/events-coil.ts", "export type CoilEvent ="],
    // And THE VEIL's three, cut out on purpose rather than under pressure —
    // `events-creature.ts` was at its limit and grows by an arm per creature
    // (`docs/queue.md`, 6 September 2026).
    ["packages/sim/src/events-veil.ts", "export type VeilEvent ="],
    // THE CHOIR's three, which were cut out of `events-creature.ts` and never
    // named here — so this test has been reading a union with a hole in it
    // since that creature landed, which is the exact silence it exists to
    // catch. Named now, with THE BALLOON's three beside them.
    ["packages/sim/src/events-choir.ts", "export type ChoirEvent ="],
    ["packages/sim/src/events-balloon.ts", "export type BalloonEvent ="],
    ["packages/sim/src/events-gum.ts", "export type GumEvent ="],
    // The two bosses whose arms are files of their own: THE FLEET's five, cut
    // out when `events.ts` came back to its limit, and THE STARE's one, cut
    // out the same day. A boss is worth four or five lines of that file and
    // there are nine more rounds designed, so the next one will be a file too
    // — and a file this test cannot find is a file whose events go silently
    // unheard, which is what the comment at the top of this list is about.
    ["packages/sim/src/events-fleet.ts", "export type FleetEvent ="],
    ["packages/sim/src/events-stare.ts", "export type StareEvent ="],
    ["packages/sim/src/events-queen.ts", "export type QueenEvent ="],
    ["packages/sim/src/events-baton.ts", "export type BatonEvent ="],
    ["packages/sim/src/events-undertow.ts", "export type UndertowEvent ="],
    ["packages/sim/src/events-candle.ts", "export type CandleEvent ="],
    ["packages/sim/src/events-gorge.ts", "export type GorgeEvent ="],
    ["packages/sim/src/events-curtain.ts", "export type CurtainEvent ="],
    ["packages/sim/src/events-taster.ts", "export type TasterEvent ="],
    ["packages/sim/src/events-sinew.ts", "export type SinewEvent ="],
    ["packages/sim/src/events-surge.ts", "export type SurgeEvent ="],
    ["packages/sim/src/events-lead.ts", "export type LeadEvent ="],
    ["packages/sim/src/events-scuttle.ts", "export type ScuttleEvent ="],
    ["packages/sim/src/events-antiphon.ts", "export type AntiphonEvent ="],
    ["packages/sim/src/events-diastole.ts", "export type DiastoleEvent ="],
    ["packages/sim/src/events-warden.ts", "export type WardenEvent ="],
    ["packages/sim/src/events-vane.ts", "export type VaneEvent ="],
    ["packages/sim/src/events-snake.ts", "export type SnakeEvent ="],
    ["packages/sim/src/events-pinball.ts", "export type PinballEvent ="],
    ["packages/sim/src/events-scout.ts", "export type ScoutEvent ="],
    ["packages/sim/src/events-pulse.ts", "export type PulseEvent ="],
    ["packages/sim/src/events-hive.ts", "export type HiveEvent ="],
    ["packages/sim/src/events-instar.ts", "export type InstarEvent ="],
    ["packages/sim/src/events-filament.ts", "export type FilamentEvent ="],
    ["packages/sim/src/events-throat.ts", "export type ThroatEvent ="],
    ["packages/sim/src/events-gauge.ts", "export type GaugeEvent ="],
  ] as const) {
    const src = await Bun.file(join(ROOT, file)).text();
    const start = src.indexOf(decl);
    expect(start, file).toBeGreaterThan(-1);
    const union = src.slice(start);
    found.push(...[...union.matchAll(/type:\s*"([a-zA-Z]+)"/g)].map((m) => m[1] as string));
  }
  return [...new Set(found)];
}

/** One of each event, filled with values a real world would carry. */
const SAMPLES: Record<string, SimEvent> = {
  beat: { type: "beat", beat: 4 },
  waveStart: { type: "waveStart", wave: 0 },
  needWave: { type: "needWave", wave: 1 },
  fire: { type: "fire", col: 3, color: "red", lance: false },
  lanceFull: { type: "lanceFull", col: 3 },
  lanceSpilled: { type: "lanceSpilled", col: 3 },
  destroy: { type: "destroy", col: 3, row: 4, color: "cyan", kind: "bulb" },
  hole: { type: "hole", col: 2, row: 5 },
  reject: { type: "reject", col: 2, row: 5 },
  magnetPlate: { type: "magnetPlate", col: 2, row: 5, color: "cyan" },
  magnetBreak: { type: "magnetBreak", col: 2, row: 5, color: "red", fromLeft: true },
  deflect: { type: "deflect", col: 2, span: 1, kind: "meteor", fromRow: 9, seed: 0, holes: 0 },
  grip: { type: "grip", player: 1, col: 1, row: 3 },
  carry: { type: "carry", player: 2, col: 1, row: 3, dir: 1 },
  podLoose: { type: "podLoose", col: 4, row: 2 },
  podTaken: { type: "podTaken", col: 4, kind: "ward" },
  podLost: { type: "podLost", col: 4 },
  breach: {
    type: "breach",
    col: 5,
    weight: "light",
    span: 1,
    kind: "slick",
    fromRow: 10,
    seed: 0,
    holes: 0,
    color: "red",
    beat: 8,
  },
  petal: { type: "petal", col: 3, row: 1, left: 2 },
  queenDown: { type: "queenDown", col: 3, row: 1 },
  tether: { type: "tether", col: 2, color: "cyan" },
  eyeOpen: { type: "eyeOpen", col: 5, color: "red" },
  plate: { type: "plate", col: 5, row: 2, left: 3, color: "red" },
  wardenDown: { type: "wardenDown", col: 5, row: 2 },
  stareCaught: { type: "stareCaught", player: 1, control: "fire" },
  stareShut: { type: "stareShut", player: 2 },
  stareOpen: { type: "stareOpen", player: 2, forced: true },
  queenFlinch: { type: "queenFlinch", col: 3, row: 2, side: -1 },
  diastoleClamp: { type: "diastoleClamp", col: 4, player: 1 },
  diastoleSpasm: { type: "diastoleSpasm", col: 4 },
  wardenHold: { type: "wardenHold", col: 4 },
  wardenThrow: { type: "wardenThrow", col: 4 },
  wardenSlam: { type: "wardenSlam", col: 4 },
  vanePin: { type: "vanePin", col: 3 },
  vaneSlip: { type: "vaneSlip", col: 3 },
  vaneHaul: { type: "vaneHaul", col: 2 },
  snakePrise: { type: "snakePrise", col: 3, row: 4 },
  snakeLift: { type: "snakeLift", col: 2, row: 6 },
  snakeDrop: { type: "snakeDrop", col: 2, row: 6 },
  pinWind: { type: "pinWind" },
  pinNudge: { type: "pinNudge", way: 1 },
  pinTilt: { type: "pinTilt" },
  scoutReel: { type: "scoutReel" },
  scoutSlip: { type: "scoutSlip" },
  scoutPrime: { type: "scoutPrime" },
  throatCinch: { type: "throatCinch", col: 3 },
  throatSlip: { type: "throatSlip", col: 3 },
  throatHaul: { type: "throatHaul", col: 4 },
  throatInhale: { type: "throatInhale", col: 4 },
  throatChoke: { type: "throatChoke", col: 2 },
  throatSwallow: { type: "throatSwallow", col: 2 },
  throatEvert: { type: "throatEvert", col: 5 },
  pulseBrace: { type: "pulseBrace", player: 1 },
  pulseSlip: { type: "pulseSlip", player: 2 },
  pulseArrest: { type: "pulseArrest" },
  gaugeMark: { type: "gaugeMark" },
  gaugeMiss: { type: "gaugeMiss" },
  gaugeJam: { type: "gaugeJam" },
  gaugeBind: { type: "gaugeBind" },
  batonLaunch: { type: "batonLaunch", col: 3, socket: 2 },
  batonStruck: { type: "batonStruck", col: 3, socket: 2 },
  batonLanded: { type: "batonLanded", col: 3, socket: 3 },
  batonRelit: { type: "batonRelit", col: 3, socket: 2 },
  batonSettled: { type: "batonSettled", col: 3, socket: 0 },
  batonTwin: { type: "batonTwin", col: 3, socket: 0 },
  batonMerged: { type: "batonMerged", col: 3, socket: 10 },
  batonAct: { type: "batonAct", col: 3, act: 4 },
  batonMissed: { type: "batonMissed", col: 3, socket: 0 },
  batonShed: { type: "batonShed", col: 3, row: 1 },
  batonSwell: { type: "batonSwell", col: 3, socket: 1 },
  batonStripped: { type: "batonStripped", col: 3, socket: 1 },
  batonRefused: { type: "batonRefused", col: 3, socket: 1 },
  batonHeld: { type: "batonHeld", col: 3, socket: 9, player: 2 },
  batonParted: { type: "batonParted", col: 3, socket: 0 },
  batonDown: { type: "batonDown", col: 3 },
  undertowBow: { type: "undertowBow", col: 4 },
  undertowLobe: { type: "undertowLobe", col: 4, tall: false },
  undertowTaken: { type: "undertowTaken", col: 4 },
  undertowScar: { type: "undertowScar", col: 4, tall: false },
  undertowWidened: { type: "undertowWidened", col: 5 },
  undertowUnseated: { type: "undertowUnseated", col: 2 },
  undertowClosed: { type: "undertowClosed", col: 2 },
  undertowRise: { type: "undertowRise", col: 5 },
  undertowSwallowed: { type: "undertowSwallowed", col: 5 },
  undertowThrough: { type: "undertowThrough", col: 5 },
  undertowPinned: { type: "undertowPinned", col: 3, on: true },
  undertowFreed: { type: "undertowFreed", col: 3 },
  candleDark: { type: "candleDark" },
  candleDim: { type: "candleDim", col: 3, left: 4 },
  candleMove: { type: "candleMove", col: 4 },
  candleTurn: { type: "candleTurn", col: 1 },
  candleFed: { type: "candleFed", col: 1, left: 3 },
  candleLast: { type: "candleLast", col: 4 },
  candleSmoke: { type: "candleSmoke", col: 4 },
  candleLit: { type: "candleLit", col: 4, left: 2 },
  candleOut: { type: "candleOut" },
  gorgeSettle: { type: "gorgeSettle", col: 2, width: 7 },
  gorgeSwallow: { type: "gorgeSwallow", col: 5, color: "red", beads: 2 },
  gorgeEmptied: { type: "gorgeEmptied", col: 5, beads: 1 },
  gorgeFull: { type: "gorgeFull", col: 5, color: "red" },
  gorgeRupture: { type: "gorgeRupture", col: 5, left: 6 },
  gorgeVent: { type: "gorgeVent", col: 5 },
  gorgeSpit: { type: "gorgeSpit", col: 3, color: "cyan" },
  gorgeMouth: { type: "gorgeMouth", col: 5, color: "cyan" },
  gorgeOut: { type: "gorgeOut", col: 5, beads: 23 },
  gorgePinch: { type: "gorgePinch", col: 2 },
  gorgePry: { type: "gorgePry", col: 5 },
  gorgeClench: { type: "gorgeClench", col: 5 },
  curtainUnroll: { type: "curtainUnroll", col: 2, width: 7 },
  curtainShadow: { type: "curtainShadow", col: 5, color: "red" },
  curtainSoft: { type: "curtainSoft", col: 3 },
  curtainShove: { type: "curtainShove", col: 3, dir: 1, stride: 2 },
  curtainReroll: { type: "curtainReroll", col: 2, dir: -1 },
  curtainLobeOff: { type: "curtainLobeOff", col: 3, left: 6 },
  curtainCoreHit: { type: "curtainCoreHit", col: 5, left: 2 },
  curtainFire: { type: "curtainFire", col: 5 },
  curtainPin: { type: "curtainPin", col: 5, beats: 6 },
  curtainJam: { type: "curtainJam", col: 3, dir: 1 },
  curtainLift: { type: "curtainLift", col: 5 },
  curtainTear: { type: "curtainTear", col: 5 },
  curtainOut: { type: "curtainOut", col: 5 },
  tasterRise: { type: "tasterRise", col: 0, width: 7 },
  tasterGrow: { type: "tasterGrow", col: 3 },
  tasterSet: { type: "tasterSet", col: 3, color: "red" },
  tasterThick: { type: "tasterThick", col: 3, layers: 2 },
  tasterPare: { type: "tasterPare", col: 3, layers: 1 },
  tasterShear: { type: "tasterShear", col: 3, left: 9 },
  tasterCrest: { type: "tasterCrest", col: 3, cuts: 2 },
  tasterLift: { type: "tasterLift" },
  tasterTaste: { type: "tasterTaste", color: "cyan" },
  tasterClose: { type: "tasterClose", col: 2, left: 2 },
  tasterRefused: { type: "tasterRefused", col: 2 },
  tasterPin: { type: "tasterPin", col: 2 },
  tasterWipe: { type: "tasterWipe", col: 2 },
  tasterPry: { type: "tasterPry", col: 2 },
  tasterOut: { type: "tasterOut", col: 2, color: "cyan" },
  sinewSettle: { type: "sinewSettle", col: 5, fibres: 6, row: 5 },
  sinewGrip: { type: "sinewGrip", col: 4, player: 1 },
  sinewRelease: { type: "sinewRelease", col: 6, player: 2 },
  sinewEnter: { type: "sinewEnter", col: 5 },
  sinewLoose: { type: "sinewLoose", col: 5 },
  sinewPart: { type: "sinewPart", col: 5, fibres: 5, row: 6 },
  sinewSnap: { type: "sinewSnap", col: 5, rocks: 1 },
  sinewRock: { type: "sinewRock", col: 5, row: 6 },
  sinewCatch: { type: "sinewCatch", col: 5 },
  sinewSlack: { type: "sinewSlack", col: 5, slackMilli: 60 },
  sinewFall: { type: "sinewFall", col: 5, row: 11 },
  sinewSwing: { type: "sinewSwing", col: 4, dir: -1 },
  sinewOut: { type: "sinewOut", col: 2 },
  sinewCrush: { type: "sinewCrush", col: 5 },
  surgeSettle: { type: "surgeSettle", col: 5, row: 3 },
  surgeGrip: { type: "surgeGrip", col: 5, player: 1 },
  surgeRelease: { type: "surgeRelease", col: 5, player: 2 },
  surgeNear: { type: "surgeNear", col: 5 },
  surgeVent: { type: "surgeVent", col: 5, notches: 1, row: 4 },
  surgeBurst: { type: "surgeBurst", col: 5, gums: 3 },
  surgeGum: { type: "surgeGum", col: 4, row: 4 },
  surgeRock: { type: "surgeRock", col: 4, row: 4 },
  surgeLost: { type: "surgeLost", col: 5 },
  surgeAbsorb: { type: "surgeAbsorb", col: 5, row: 4 },
  surgeClose: { type: "surgeClose", col: 5, notches: 2 },
  surgeEvert: { type: "surgeEvert", col: 5, row: 8 },
  surgeOut: { type: "surgeOut", col: 5 },
  leadEnter: { type: "leadEnter", col: 5, dir: 1 },
  leadPace: { type: "leadPace", col: 6, dir: 1, lean: 1 },
  leadTurn: { type: "leadTurn", col: 10, dir: -1 },
  leadFlight: { type: "leadFlight", col: 7, dueBeat: 12 },
  leadHit: { type: "leadHit", col: 7, segments: 4 },
  leadMiss: { type: "leadMiss", col: 3 },
  leadReverse: { type: "leadReverse", col: 7, dir: -1 },
  leadTorch: { type: "leadTorch", col: 5 },
  leadRock: { type: "leadRock", col: 9 },
  leadStill: { type: "leadStill", col: 4 },
  leadGrip: { type: "leadGrip", col: 4 },
  leadRelease: { type: "leadRelease", col: 4 },
  leadTear: { type: "leadTear", col: 4 },
  leadPass: { type: "leadPass", col: 4, dir: 1 },
  leadWall: { type: "leadWall", col: 10 },
  leadDown: { type: "leadDown", col: 7 },
  leadOut: { type: "leadOut", col: 7 },
  scuttleEnter: { type: "scuttleEnter", col: 5, parts: 21 },
  scuttleLoose: { type: "scuttleLoose", col: 4, socket: 8, live: true, throwBeat: 12 },
  scuttleThrow: { type: "scuttleThrow", col: 4, socket: 8, left: 19 },
  scuttleStruck: { type: "scuttleStruck", col: 4, socket: 8, left: 18 },
  scuttleSwing: { type: "scuttleSwing", col: 5, socket: 8, from: 4 },
  scuttleRebuff: { type: "scuttleRebuff", col: 4 },
  scuttleSlack: { type: "scuttleSlack", col: 6, slack: 1 },
  scuttleWind: { type: "scuttleWind", col: 7, socket: 3, throwBeat: 40 },
  scuttleLast: { type: "scuttleLast", col: 7 },
  scuttleDown: { type: "scuttleDown", col: 7 },
  scuttleOut: { type: "scuttleOut", col: 5 },
  antiphonEnter: { type: "antiphonEnter", col: 5 },
  antiphonGrow: { type: "antiphonGrow", col: 4, shape: 7, organs: 1 },
  antiphonPit: { type: "antiphonPit", col: 4, shape: 7, pits: 3 },
  antiphonHarden: { type: "antiphonHarden", col: 8, rail: 4 },
  antiphonPull: { type: "antiphonPull", col: 3, left: 2 },
  antiphonSink: { type: "antiphonSink", col: 4, fired: true },
  antiphonSpill: { type: "antiphonSpill", col: 2, color: "cyan" },
  antiphonStill: { type: "antiphonStill", col: 5 },
  antiphonShip: { type: "antiphonShip", col: 6 },
  antiphonBurst: { type: "antiphonBurst", col: 6, pits: 6 },
  antiphonOut: { type: "antiphonOut", col: 5 },
  hiveEnter: { type: "hiveEnter", col: 5 },
  hiveSwell: { type: "hiveSwell", col: 3 },
  hiveOpen: { type: "hiveOpen", col: 3, color: "red" },
  hiveSpill: { type: "hiveSpill", col: 3 },
  hiveSkin: { type: "hiveSkin", col: 4 },
  hiveWrong: { type: "hiveWrong", col: 3 },
  hiveSeal: { type: "hiveSeal", col: 3, left: 8 },
  hiveDown: { type: "hiveDown", col: 7 },
  hiveOut: { type: "hiveOut", col: 5 },
  instarEnter: { type: "instarEnter", col: 5 },
  instarMorph: { type: "instarMorph", col: 5, step: 1, pose: "armed" },
  instarShow: { type: "instarShow", col: 5, step: 1 },
  instarRefuse: { type: "instarRefuse", col: 3, mark: 0, player: 2 },
  instarAnswer: { type: "instarAnswer", col: 3, mark: 0, part: "hand" },
  instarDone: { type: "instarDone", col: 3, mark: 0, part: "hand" },
  instarSlip: { type: "instarSlip", col: 7, mark: 1, part: "eggs" },
  instarLand: { type: "instarLand", col: 5, step: 1 },
  instarStrike: { type: "instarStrike", col: 7, part: "eggs" },
  instarDown: { type: "instarDown", col: 5 },
  instarOut: { type: "instarOut", col: 5 },
  filamentEnter: { type: "filamentEnter", col: 5 },
  filamentArm: { type: "filamentArm", col: 5, index: 0 },
  filamentDrawn: { type: "filamentDrawn", col: 5, row: 6 },
  filamentFollowed: { type: "filamentFollowed", col: 5, row: 7 },
  filamentSnap: { type: "filamentSnap", col: 5 },
  filamentRecoil: { type: "filamentRecoil", col: 5 },
  filamentDark: { type: "filamentDark", col: 5 },
  filamentPulled: { type: "filamentPulled", col: 5, index: 2 },
  filamentDown: { type: "filamentDown", col: 5 },
  filamentOut: { type: "filamentOut", col: 5 },
  waveFailed: { type: "waveFailed", wave: 2 },
  quit: { type: "quit", player: 2 },
  mirrorShow: { type: "mirrorShow", step: "guard", index: 1, of: 3, col: 3 },
  mirrorEcho: { type: "mirrorEcho", step: "guard", index: 2, of: 3 },
  mirrorVerdict: { type: "mirrorVerdict", right: false, col: 3, reason: "bait" },
  mirrorDown: { type: "mirrorDown", col: 3 },
  mirrorGrip: { type: "mirrorGrip", col: 3, on: true },
  mazeCommit: { type: "mazeCommit", mouth: 1, col: 5 },
  mazeProbe: { type: "mazeProbe", ring: 1, angleMilli: 2000, of: 3 },
  mazeVerdict: { type: "mazeVerdict", right: false, col: 5, reason: "silence" },
  mazeDown: { type: "mazeDown", col: 5 },
  mazeGrip: { type: "mazeGrip", col: 5, on: true },
  lureHit: { type: "lureHit", col: 3, row: 4, color: "cyan" },
  lureSeen: { type: "lureSeen", col: 3 },
  strandBead: { type: "strandBead", id: 6, col: 2, row: 3, color: "red", left: 2 },
  strandSwell: { type: "strandSwell", id: 6, col: 2, row: 3, color: "cyan", left: 3 },
  fencePass: { type: "fencePass", col: 4, row: 11 },
  fenceBurn: { type: "fenceBurn", col: 3, row: 8 },
  strandBroke: { type: "strandBroke", col: 3, row: 5, beads: [] },
  lureVanished: { type: "lureVanished", col: 3, row: 4, color: "cyan" },
  shellBreak: { type: "shellBreak", col: 3, row: 4, left: 1 },
  shellBare: { type: "shellBare", col: 3, row: 5, color: "cyan" },
  rindShed: { type: "rindShed", col: 3, row: 5, color: "red", left: 1, id: 7 },
  recoilBounce: {
    type: "recoilBounce",
    id: 7,
    col: 3,
    row: 5,
    toCol: 4,
    toRow: 3,
    color: "cyan",
    left: 2,
  },
  caromBounce: { type: "caromBounce", col: 0, row: 5, dir: 1 },
  caromCrack: { type: "caromCrack", col: 3, row: 5, span: 2, color: "red" },
  caromEject: { type: "caromEject", id: 9, col: 3, row: 5, color: "red" },
  chuteOpen: { type: "chuteOpen", col: 3, row: 0, color: "red" },
  chuteCut: { type: "chuteCut", col: 3, row: 6, color: "red", kind: "slick" },
  crystalBounce: { type: "crystalBounce", col: 0, row: 5, dir: 1 },
  crystalCatch: { type: "crystalCatch", col: 4, row: 6 },
  crystalSplit: { type: "crystalSplit", col: 4, row: 5, color: "red" },
  volleyReturn: { type: "volleyReturn", id: 4, col: 2, row: 13, left: 2 },
  volleyHatch: { type: "volleyHatch", col: 2, row: 6, kind: "slick", color: "red" },
  claspBreak: { type: "claspBreak", id: 7, col: 3, row: 5, kind: "bulb", color: "cyan" },
  coilBreak: { type: "coilBreak", id: 8, col: 4, row: 6, ward: true },
  coilJump: { type: "coilJump", id: 9, col: 4, row: 6 },
  choirMerge: { type: "choirMerge", id: 10, col: 3, row: 5, kind: "slick" },
  choirOpen: { type: "choirOpen", id: 10, col: 3, row: 5, kind: "slick", color: "red" },
  choirArm: { type: "choirArm", side: -1 },
  choirSing: { type: "choirSing", col: 3, row: 5 },
  balloonSplit: { type: "balloonSplit", col: 3, row: 5 },
  balloonPop: { type: "balloonPop", col: 3, row: 5 },
  gumFlung: { type: "gumFlung", col: 2, row: 11, span: 1, dir: -1 },
  veilMorph: { type: "veilMorph", col: 3, row: 4, color: "red" },
  veilRebuff: { type: "veilRebuff", col: 3, row: 4 },
  veilTorn: { type: "veilTorn", col: 3, row: 4, color: "cyan", kind: "bulb" },
  wispHop: { type: "wispHop" },
  ghostRelease: { type: "ghostRelease", col: 3, row: 4, color: "red" },
  ghostTurn: { type: "ghostTurn", col: 0, row: 3, laps: 2 },
  ghostCharge: { type: "ghostCharge", col: 0, row: 3 },
  fleetSalvo: { type: "fleetSalvo", col: 4, row: 6 },
  fleetSplash: { type: "fleetSplash", col: 4, row: 6 },
  fleetHit: { type: "fleetHit", col: 4, row: 6 },
  fleetSunk: { type: "fleetSunk", col: 4, row: 6, len: 3, left: 2 },
  fleetDown: { type: "fleetDown", col: 4, row: 6 },
  fleetFlood: { type: "fleetFlood", col: 4, row: 6 },
  fleetBreach: { type: "fleetBreach", col: 4, row: 6, on: true },
  fleetRake: { type: "fleetRake", col: 5, row: 6 },
  fleetPlug: { type: "fleetPlug", col: 4, row: 6 },
  fleetWreck: { type: "fleetWreck", col: 4, row: 6 },
  gyreBroke: { type: "gyreBroke", col: 3, row: 7 },
  crawlerBreak: { type: "crawlerBreak", col: 5, row: 10, color: "cyan" },
  crawlerBeam: { type: "crawlerBeam", col: 6, row: 10 },
  crawlerBurrow: { type: "crawlerBurrow", col: 10, row: 10, links: 4 },
  weightCrushed: { type: "weightCrushed", col: 3, row: 8 },
  cairnPulled: { type: "cairnPulled", player: 1, col: 3, row: 2 },
  cairnShed: { type: "cairnShed", col: 5, row: 2 },
  cairnHeld: { type: "cairnHeld", col: 4, row: 2 },
  balloonTopped: { type: "balloonTopped", col: 4, row: 0 },
  bounce: { type: "bounce", col: 3, row: 6, color: "red" },
  huskRefused: { type: "huskRefused", col: 2, row: 9, kind: "purge" },
  huskSwallowed: { type: "huskSwallowed", col: 2, row: 11, kind: "ward" },
};

describe("bindings", () => {
  it("has a sample for every event the simulation can report", async () => {
    expect(Object.keys(SAMPLES).sort()).toEqual((await eventTypes()).sort());
  });

  // `needWave` is bookkeeping between the host and the sim, with no moment on
  // the field to make a sound about. `choirMerge` is the second and only other
  // deliberate silence: the gesture landing is not yet the body opening, the
  // screen is already shaking from the arrow that started it, and a third
  // sound on top would say the same thing three ways (`bind-choir.ts`).
  const SILENT_BY_DESIGN = new Set(["needWave", "choirMerge"]);

  it("names a sound that exists for every event but the ones that are silent by design", () => {
    for (const [type, e] of Object.entries(SAMPLES)) {
      const cue = cueFor(e, 7, 12);
      if (SILENT_BY_DESIGN.has(type)) {
        expect(cue).toBeNull();
        continue;
      }
      expect(cue, `${type} has no cue`).not.toBeNull();
      expect(hasSound(cue?.id ?? ""), `${type} names a sound that is not in the catalogue`).toBe(
        true,
      );
    }
  });

  /**
   * The one binding in the game whose *absence* of a pan is load-bearing.
   * A crossing ghost turns at a wall, so a cue placed where it happened would
   * tell player 1 — who is never shown the column — which edge of the field
   * it is standing at. Nothing else here needs a test of its own for a
   * missing field, and this one does, because the field being missing is a
   * decision that reads exactly like an oversight.
   */
  it("never places a ghost's turn in the stereo field", () => {
    const cue = cueFor({ type: "ghostTurn", col: 0, row: 3, laps: 1 }, 7, 12);
    expect(cue?.id).toBe("creature.ghostTurn");
    expect(cue?.pan).toBeUndefined();
  });

  it("tells the two colours apart in both directions", () => {
    expect(cueFor({ type: "fire", col: 0, color: "red", lance: false }, 7, 12)?.id).toBe(
      "ship.fireRed",
    );
    expect(cueFor({ type: "fire", col: 0, color: "cyan", lance: false }, 7, 12)?.id).toBe(
      "ship.fireCyan",
    );
    expect(
      cueFor({ type: "destroy", col: 0, row: 0, color: "red", kind: "slick" }, 7, 12)?.id,
    ).toBe("impact.destroyRed");
    expect(
      cueFor({ type: "destroy", col: 0, row: 0, color: "cyan", kind: "bulb" }, 7, 12)?.id,
    ).toBe("impact.destroyCyan");
  });

  it("accents every fourth beat and no other", () => {
    const ids = [0, 1, 2, 3, 4].map((beat) => cueFor({ type: "beat", beat }, 7, 12)?.id);
    expect(ids).toEqual(["beat.accent", "beat.tick", "beat.tick", "beat.tick", "beat.accent"]);
  });

  /**
   * **By the weight the event carries, not by a number.** The split used to
   * be a threshold on the damage in hull points, and it was once in the wrong
   * unit for so long that the heavy cue had never played. The simulation says
   * `heavy` or `light` itself now (`impact.ts`), and there is no line to be on
   * the wrong side of.
   */
  it("splits a breach by its weight, not by what hit", () => {
    const rock = {
      type: "breach",
      col: 0,
      weight: "heavy",
      span: 1,
      kind: "meteor",
      fromRow: 9,
      seed: 0,
      holes: 0,
      color: null,
      beat: 1,
    } as const;
    const body = { ...rock, weight: "light", kind: "slick" } as const;
    expect(cueFor(rock, 7, 12)?.id).toBe("hull.breachHeavy");
    expect(cueFor(body, 7, 12)?.id).toBe("hull.breachLight");
  });

  it("voices a gum's landing as the splash, in place of the tear", () => {
    const gum = {
      type: "breach",
      col: 3,
      weight: "light",
      span: 1,
      kind: "gum",
      fromRow: 10,
      seed: 0,
      holes: 0,
      color: null,
      beat: 1,
    } as const;
    expect(cueFor(gum, 7, 12)?.id).toBe("creature.gumStick");
  });

  it("gives each of THE MIRROR's steps its own sound", () => {
    const steps = ["fireRed", "fireCyan", "guard", "intake", "cannonLeft", "cannonRight"] as const;
    const ids = steps.map(
      (step) => cueFor({ type: "mirrorShow", step, index: 1, of: 1, col: 0 }, 7, 12)?.id,
    );
    expect(new Set(ids).size).toBe(steps.length);
    for (const id of ids) expect(hasSound(id ?? "")).toBe(true);
  });

  it("puts a column across the stereo field without ever reaching the edge", () => {
    expect(panForCol(0, 7)).toBeCloseTo(-0.75, 6);
    expect(panForCol(3, 7)).toBeCloseTo(0, 6);
    expect(panForCol(6, 7)).toBeCloseTo(0.75, 6);
    expect(panForCol(0, 1)).toBe(0);
  });

  it("raises the pitch of something that happened further up the field", () => {
    expect(pitchForRow(0, 12)).toBeCloseTo(1.5, 6);
    expect(pitchForRow(11, 12)).toBeCloseTo(1, 6);
    expect(pitchForRow(0, 1)).toBe(1);
  });
});

/**
 * Which sound each body's events reach for, spelled out.
 *
 * The test above proves every event names *a* sound that exists, which is the
 * check that catches a typo and nothing else: swap two ids and it still
 * passes. These bindings are decisions, and several of them are decisions
 * about telling two things apart — a rind shedding is `impact.split` and not a
 * destroy because the column has not closed; a clasp breaking is
 * `creature.moult` and not a split because it has only ever had one covering.
 * A swap is exactly the change nobody would notice, and it costs the pair the
 * distinction the comment in `bind-creatures.ts` argues for.
 */
const CREATURE_IDS: Record<string, string> = {
  shellBreak: "impact.split",
  shellBare: "creature.moult",
  rindShed: "impact.split",
  recoilBounce: "impact.bounce",
  claspBreak: "creature.moult",
  lureHit: "impact.wrongTarget",
  lureSeen: "signal.lureWarn",
  lureVanished: "creature.lureFold",
  veilMorph: "signal.radarUnknown",
  veilRebuff: "impact.absorb",
  veilTorn: "creature.veilFlash",
  wispHop: "signal.bearing",
  ghostRelease: "creature.ghostRelease",
  ghostTurn: "creature.ghostTurn",
  ghostCharge: "creature.ghostCharge",
  strandBead: "impact.split",
  strandSwell: "impact.wrongTarget",
  magnetPlate: "creature.magnetPlate",
  // A bolt spent on a gum, a clinger or a weight: the plate's own sound,
  // because it is neither a kill nor a wrong colour (`bind-creatures.ts`).
  bounce: "creature.magnetPlate",
  magnetBreak: "creature.magnetBreak",
};

/**
 * The same table for THE CAROM's four, which are bound in `bind-carom.ts` —
 * their own file for their own creature, the way `events-carom.ts` is the
 * simulation's. Kept apart here rather than folded in above so the two source
 * files and the two tables stay one-to-one: a case list checked against the
 * wrong file is a check that passes while saying nothing.
 */
const CAROM_IDS: Record<string, string> = {
  caromBounce: "impact.bounce",
  caromCrack: "impact.split",
  caromEject: "creature.gateLoop",
  chuteOpen: "creature.moult",
  chuteCut: "impact.split",
  // THE CRYSTAL's three, bound in the same file: it crosses on the carom's
  // diagonal and turns at the same walls.
  crystalBounce: "impact.bounce",
  crystalCatch: "creature.crystalFacet",
  crystalSplit: "impact.split",
};

/**
 * And the same table again for THE COIL's two, bound in `bind-coil.ts`. Apart
 * for `CAROM_IDS`' reason: one table per source file, so a case list is always
 * checked against the file it came from.
 */
const COIL_IDS: Record<string, string> = {
  coilBreak: "creature.moult",
  coilJump: "impact.chain",
};

/**
 * And the same table again for THE VOLLEY's two, bound in `bind-volley.ts`.
 * Apart for `CAROM_IDS`' reason: one table per source file, so a case list is
 * always checked against the file it came from.
 */
const VOLLEY_IDS: Record<string, string> = {
  volleyReturn: "impact.bounce",
  volleyHatch: "creature.moult",
};

/**
 * And the same table again for THE FENCE's two, bound in `bind-fence.ts`.
 * Apart for `CAROM_IDS`' reason: one table per source file, so a case list is
 * always checked against the file it came from.
 */
const FENCE_IDS: Record<string, string> = {
  fencePass: "impact.graze",
  fenceBurn: "impact.split",
};

/**
 * And THE GUM's one, bound in `bind-gum.ts`, on the same terms. Its landing
 * is a `breach` and is tested with the breaches below.
 */
const GUM_IDS: Record<string, string> = {
  gumFlung: "impact.deflect",
};

describe("what one body did", () => {
  it("covers every event `creatureCue` names, so a new one cannot be left out", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-creatures.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(CREATURE_IDS).sort());
  });

  it("covers every event `caromCue` names, on the same terms", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-carom.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(CAROM_IDS).sort());
  });

  it("covers every event `coilCue` names, on the same terms", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-coil.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(COIL_IDS).sort());
  });

  it("covers every event `volleyCue` names, on the same terms", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-volley.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(VOLLEY_IDS).sort());
  });

  it("covers every event `fenceCue` names, on the same terms", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-fence.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(FENCE_IDS).sort());
  });

  it("covers every event `gumCue` names, on the same terms", async () => {
    const src = await Bun.file(join(ROOT, "packages/audio/src/bind-gum.ts")).text();
    const cases = [...src.matchAll(/case "([a-zA-Z]+)":/g)].map((m) => m[1] as string);
    expect(cases.sort()).toEqual(Object.keys(GUM_IDS).sort());
  });

  for (const [type, id] of Object.entries({
    ...CREATURE_IDS,
    ...CAROM_IDS,
    ...COIL_IDS,
    ...VOLLEY_IDS,
    ...FENCE_IDS,
    ...GUM_IDS,
  })) {
    it(`plays ${id} for ${type}`, () => {
      const sample = SAMPLES[type];
      expect(sample, `${type} has no sample`).toBeDefined();
      expect(cueFor(sample as SimEvent, 7, 12)?.id).toBe(id);
    });
  }
});
