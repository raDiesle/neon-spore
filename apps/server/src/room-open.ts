import { isRoomCode, PROTOCOL_VERSION, VERSION_PARAM } from "@neon-spore/net";
import { refuse } from "./seat.js";

/**
 * Everything that must be true before a socket is worth accepting, in the
 * order it is worth being false in.
 *
 * All of it happens *before* a seat is handed out and before beat zero can be
 * stamped for the peer, because a build that cannot play this protocol must be
 * turned away with nothing spent on it — which is why the version rides the
 * upgrade rather than arriving as a first message. A first message could only
 * be read after all of that had already happened.
 *
 * Answers a `Response` when the upgrade is refused and `null` when it stands.
 * Its own file to keep `room.ts` inside its line limit, along the seam that
 * was already there: nothing here touches storage, sockets or seats.
 */
export function refuseUpgrade(request: Request, code: string, seatCount: number): Response | null {
  if (!isRoomCode(code)) return new Response("bad room code", { status: 400 });
  if (request.headers.get("Upgrade") !== "websocket") {
    return new Response("expected websocket", { status: 426 });
  }
  const version = new URL(request.url).searchParams.get(VERSION_PARAM);
  if (Number(version) !== PROTOCOL_VERSION) {
    return refuse("protocol", `protocol version ${PROTOCOL_VERSION} expected`);
  }
  // A third phone is refused *through* the socket rather than in front of it.
  // A 409 never reaches the page as anything but a socket that would not open,
  // which is indistinguishable from a dead line — so `refuse` completes the
  // upgrade, says the reason in the one vocabulary the indicator reads, and
  // only then closes. It is never given a seat tag, so it is not a seat and
  // `announce` will not count it as one leaving.
  if (seatCount >= 2) return refuse("full", `room ${code} already has two`);
  return null;
}
