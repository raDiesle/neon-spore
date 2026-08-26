/**
 * A room code is read aloud before anything else in this game is — it is the
 * first thing the two players say to each other, over the same voice channel
 * they will play on. So the alphabet is chosen for the ear and not for
 * entropy: every character that has a lookalike is dropped along with its
 * twin, so O and 0, I and 1, S and 5, B and 8, Z and 2 are all simply absent.
 * A code can then be misheard but never mistyped into a different valid room.
 */
export const ROOM_ALPHABET = "ACDEFGHJKLMNPQRTUVWXY3479";

export const ROOM_CODE_LENGTH = 4;

/**
 * A code from raw bytes. The randomness is the caller's — `crypto` in the
 * browser, the Durable Object's own in the room — because a package that
 * feeds a lockstep simulation holds no source of randomness at all.
 */
export function roomCodeFromBytes(bytes: ArrayLike<number>): string {
  let out = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    const byte = bytes[i] ?? 0;
    out += ROOM_ALPHABET[byte % ROOM_ALPHABET.length];
  }
  return out;
}

/**
 * What someone typed, turned into what was meant: upper case, and everything
 * the alphabet does not carry thrown away. Spaces, dashes and a stray comma
 * are what a person reading a code back over a bad line actually produces.
 */
export function normalizeRoomCode(input: string): string {
  let out = "";
  for (const ch of input.toUpperCase()) {
    if (!ROOM_ALPHABET.includes(ch)) continue;
    out += ch;
    if (out.length === ROOM_CODE_LENGTH) break;
  }
  return out;
}

export function isRoomCode(code: string): boolean {
  return code.length === ROOM_CODE_LENGTH && normalizeRoomCode(code) === code;
}
