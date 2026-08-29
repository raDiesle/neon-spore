## `4f3ee5c` — Remove cast and contact shadows from the field

> with the shadows gone, does the field read as cleaner — and does anything look flat that used to look round?

- **badge** implementation
- **subject** `packages/render/src/cast-shadow.ts` and `packages/render/src/contact-shadow.ts` (both removed), their two `SimConfig` fields, their rows in `ship-fields.ts`, and the FALLING SHADOW panel on the STATES page
- **changed** the shadow a body throws onto another body, and the shadow a falling body throws onto the hull ahead of contact, are both gone. The key light, the glow, the light shafts, and every skin's own surface modelling (`crater`, `pore`, `mounted`, `light`) are untouched — those use "shadow" for the dark side of a body's own form, not a shadow cast onto another surface
- **before** `docs/checks/4f3ee5c-before.png` — wave "THE ROCK", tick 1130, the meteor an instant from the hull with a dark smudge sitting on the hull directly beneath it
- **after** `docs/checks/4f3ee5c-after.png` — the same wave, the same tick, the same rock — no smudge, a clean bright rim under it
- **where** `bun run preview`, wave "THE ROCK" (wave 4), tick 1130 from the wave's own start

**What the picture actually shows.** The two frames are close — this was always a subtle effect, which is part of why it was taken out — but the hull directly under the meteor reads muddier and darker in the before frame and cleaner in the after one. Nothing else in the frame moved: the key light on the hull, the light shafts, and the meteor's own rendering are identical between the two.
