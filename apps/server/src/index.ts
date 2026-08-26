import { isRoomCode, normalizeRoomCode } from "@neon-spore/net";

export { Room } from "./room.js";

export interface Env {
  ROOMS: DurableObjectNamespace;
}

const ROOM_PATH = /^\/room\/([^/]+)$/;

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

    const match = ROOM_PATH.exec(url.pathname);
    if (!match) return new Response("not found", { status: 404 });

    const code = normalizeRoomCode(decodeURIComponent(match[1] ?? ""));
    if (!isRoomCode(code)) return new Response("bad room code", { status: 400 });

    // `idFromName` is what makes the code the room: two phones typing the same
    // four characters reach the same object, wherever in the world they are.
    const room = env.ROOMS.get(env.ROOMS.idFromName(code));
    return room.fetch(new Request(`https://room/?code=${code}`, request));
  },
};
