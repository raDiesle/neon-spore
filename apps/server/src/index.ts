import {
  isRoomCode,
  NAME_PARAM,
  NAME_ROUTE,
  normalizeRoomCode,
  VERSION_PARAM,
} from "@neon-spore/net";

export { Names } from "./names.js";
export { Room } from "./room.js";

export interface Env {
  ROOMS: DurableObjectNamespace;
  NAMES: DurableObjectNamespace;
}

const ROOM_PATH = /^\/room\/([^/]+)$/;

/**
 * The percent-escapes a path can carry, undone — or the raw text where it
 * cannot be. `%E0` is not valid UTF-8 and `decodeURIComponent` throws
 * `URIError` on it, which unhandled is a 500 saying nothing about a request
 * that was simply malformed. `normalizeRoomCode` drops a `%` anyway, so a path
 * that does not decode fails the code check a line later, which is the 400 the
 * next line always meant.
 */
function decoded(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * The whole worker. Static assets are served by the assets binding before this
 * ever runs, so everything arriving here is either a room or a mistake.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // The counterpart of `/__preview`: proof of which server answered, so a
    // check against a relay cannot quietly be a check against something else.
    if (url.pathname === "/net/health") {
      return Response.json({ app: "neon-spore-relay", ok: true });
    }

    // Claiming a name is not a room and not lockstep: it happens once, before
    // a room exists, and the relay stays a dumb relay that never looks inside
    // anything. So it is a plain HTTP route to the one registry object —
    // `idFromName("names")` is what makes it the one.
    if (url.pathname === NAME_ROUTE) {
      const registry = env.NAMES.get(env.NAMES.idFromName("names"));
      return registry.fetch(new Request("https://names/", request));
    }

    const match = ROOM_PATH.exec(url.pathname);
    if (!match) return new Response("not found", { status: 404 });

    const code = normalizeRoomCode(decoded(match[1] ?? ""));
    if (!isRoomCode(code)) return new Response("bad room code", { status: 400 });

    // The protocol version travels with the upgrade so the room can refuse a
    // build it cannot play with *before* handing out a seat. Passed through as
    // it arrived, digits or nonsense alike: judging it is the room's job.
    const version = url.searchParams.get(VERSION_PARAM) ?? "";

    // The name travels with the upgrade for the same reason the version does,
    // and is passed through as it arrived: judging it is the room's job, and
    // the room does that with the same rule both clients use.
    const name = url.searchParams.get(NAME_PARAM) ?? "";

    // `idFromName` is what makes the code the room: two phones typing the same
    // four characters reach the same object, wherever in the world they are.
    const room = env.ROOMS.get(env.ROOMS.idFromName(code));
    const to =
      `https://room/?code=${code}&${VERSION_PARAM}=${encodeURIComponent(version)}` +
      `&${NAME_PARAM}=${encodeURIComponent(name)}`;
    return room.fetch(new Request(to, request));
  },
};
