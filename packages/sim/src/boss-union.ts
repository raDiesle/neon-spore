import type { AntiphonState } from "./antiphon.js";
import type { BatonState } from "./baton.js";
import type { FleetState, QueenState, VaneState, WardenState } from "./boss-state.js";
import type { CairnState } from "./cairn.js";
import type { CurtainState } from "./curtain.js";
import type { CystState } from "./cyst.js";
import type { DavitState } from "./davit.js";
import type { FilamentState } from "./filament.js";
import type { GaugeState } from "./gauge.js";
import type { GimbalState } from "./gimbal.js";
import type { GorgeState } from "./gorge.js";
import type { GrindstoneState } from "./grindstone.js";
import type { HalterState } from "./halter.js";
import type { HaspState } from "./hasp.js";
import type { HiveState } from "./hive.js";
import type { InstarState, NettleState } from "./instar.js";
import type { KeelState } from "./keel.js";
import type { LeadState } from "./lead.js";
import type { LedgerState } from "./ledger.js";
import type { MantleState } from "./mantle.js";
import type { MazeState } from "./maze-state.js";
import type { OculusState } from "./oculus.js";
import type { PinballState } from "./pinball.js";
import type { PlumbState } from "./plumb.js";
import type { PulseState } from "./pulse.js";
import type { RatchetState } from "./ratchet.js";
import type { RepriseState } from "./reprise-state.js";
import type { RimeState } from "./rime.js";
import type { ScoutState } from "./scout.js";
import type { ScuttleState } from "./scuttle.js";
import type { SeamState } from "./seam.js";
import type { MirrorState } from "./simon.js";
import type { SinewState } from "./sinew.js";
import type { SlingState } from "./sling.js";
import type { SnakeState } from "./snake.js";
import type { SpliceState } from "./splice.js";
import type { SpoolState } from "./spool.js";
import type { StareState } from "./stare.js";
import type { SurgeState } from "./surge.js";
import type { TasterState } from "./taster.js";
import type { ThroatState } from "./throat.js";
import type { TrivetState } from "./trivet.js";
import type { UndertowState } from "./undertow.js";
import type { ValveState } from "./valve.js";
import type { ViseState } from "./vise.js";
import type { WellState } from "./well.js";

/**
 * The boss a wave installed, whichever one it is. A tagged union rather than
 * one widening interface: the bosses share the slot and nothing else, and a
 * single struct carrying every set of fields would let `boss.ts` read a
 * `tellColor` off a mirror and get `undefined` at runtime with a clean type
 * check behind it.
 *
 * **Its own file, and the seam is which half grows.** It sat at the foot of
 * `boss-state.ts` until one more boss would have taken that file to 252
 * lines against a rule this page already states — and the two halves grow at
 * completely different rates. Next door is the state of the **four oldest
 * bosses**, the ones that landed before a fight kept its own fields beside its
 * own rules: the queen's petals, the warden's plates, the vane's stage, the
 * fleet's board. That list has not gained a member in months and never will
 * again. This list gains one every time a boss lands, and it is one import and
 * one line each time, which is exactly what a file should be made of if it is
 * going to grow forever.
 *
 * `WellState` is the one member with no fields at all, and it is in `well.ts`
 * for `CairnState`'s reason with nothing left over: a fight's state lives
 * beside its rules, and THE WELL's rules are that nothing about the simulation
 * changes. The tag earns its place in the union because `bossHashParts` pushes
 * it and two devices have to agree which picture they are drawing.
 *
 * `CairnState` was the first to *leave* `boss-state.ts` rather than never
 * arrive in it — THE CAIRN's four integers took that file over its limit the
 * first time, in the same way and for the same reason as this cut.
 */
export type BossState =
  | QueenState
  | MirrorState
  | WardenState
  | CairnState
  | VaneState
  | MazeState
  | GaugeState
  | FleetState
  | SnakeState
  | PinballState
  | PulseState
  | WellState
  | RepriseState
  | SpliceState
  | ScoutState
  | StareState
  | BatonState
  | ThroatState
  | UndertowState
  | GorgeState
  | CurtainState
  | TasterState
  | LedgerState
  | SinewState
  | SurgeState
  | LeadState
  | ScuttleState
  | AntiphonState
  | HiveState
  | InstarState
  | FilamentState
  | GimbalState
  | SpoolState
  | HaspState
  | RatchetState
  | NettleState
  | MantleState
  | KeelState
  | ValveState
  | SeamState
  | OculusState
  | ViseState
  | RimeState
  | TrivetState
  | PlumbState
  | SlingState
  | GrindstoneState
  | CystState
  | DavitState
  | HalterState;
