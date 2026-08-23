# Server — phase 2

One Cloudflare Durable Object per room, over WebSocket, using the hibernation
API. It relays inputs, distributes the beat zero point and answers clock syncs.
Nothing else — the simulation runs on both devices.

Not built yet. Milestone 2, after the prototype port. See
`docs/architecture.md`, section "Network".

Wrangler is Node-oriented; if it misbehaves under Bun, run it through `npx`.
