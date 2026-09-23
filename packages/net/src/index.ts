// The one name this package re-exports from the simulation, and it is on the
// wire: a `welcome` carries the difficulty the pair plays at, and `apps/server`
// — which depends on `@neon-spore/net` and deliberately not on the rules — has
// to be able to name the thing it is storing and handing back.
export { type Difficulty, isDifficulty } from "@neon-spore/sim";
export { type ClockSample, ClockSync } from "./clock.js";
export { decodeCommands, MAX_COMMANDS_PER_FRAME } from "./command-codec.js";
// The drag vocabulary the decoder accepts, which `tools/frames` holds `--hold` to.
export { DRAG_TARGETS } from "./command-fields.js";
export { InputDelay, type InputDelayOptions } from "./delay.js";
export { HashLedger, type HashVerdict } from "./desync.js";
export { Lockstep } from "./lockstep.js";
export { AHEAD_LIMIT_SECONDS, type LockstepOptions } from "./lockstep-options.js";
export {
  isName,
  NAME_MAX,
  NAME_MIN,
  nameFromWire,
  normalizeName,
  TAKEN_MESSAGE,
} from "./nickname.js";
export {
  type ClientMessage,
  encode,
  NAME_MINE_ROUTE,
  NAME_PARAM,
  NAME_ROUTE,
  otherPlayer,
  type PlayerId,
  PROTOCOL_VERSION,
  type RefusalCode,
  type RunMark,
  type ServerMessage,
  VERSION_PARAM,
} from "./protocol.js";
export { decodeClient, decodeServer } from "./protocol-decode.js";
export {
  isRoomCode,
  normalizeRoomCode,
  ROOM_ALPHABET,
  ROOM_CODE_LENGTH,
  roomCodeFromBytes,
} from "./room-code.js";
export { SEAT_HELD_MS } from "./seat-hold.js";
export {
  type LinkState,
  type LinkStatus,
  linkIsFault,
  linkLabel,
  SOLO_STATUS,
} from "./status.js";
