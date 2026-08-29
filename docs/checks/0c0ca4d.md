## `0c0ca4d` — judge the band by which pixels moved, not by how much

> on the alternatives page, does a change that looks the same to both players now show just two screens — and does one that really differs per player still show four?

- **badge** implementation
- **subject** `tools/director/src/versus-seat.ts`'s `seatsDiffer`, and its new
  `tools/director/test/versus-seat.test.ts`
- **changed** below the control band's own top row, the seat comparison now
  hashes *which* pixels a candidate's patch touched (`touchFootprintHash`)
  instead of *how much* they moved (`absDiffHash`), so a translucent effect
  whose alpha blend depends on the differing band background no longer
  reports a false seat difference. Above the band — the field — the exact
  pixel-value hash is unchanged
- **before** ran the unmodified `seatsDiffer` against all five open
  candidates on this worktree's own director (`DIRECTOR_HOST=127.0.0.1`,
  confirmed from its startup line) and logged both seats' raw hash
  sequences: `warm`, `streak`, `pip`, `heave`, and `tick` all came back
  seat-identical already — two screens each
- **after** same five candidates, same method, with the fix in place: still
  two screens each. No candidate's count moved, because `drawBand` paints
  the whole band with an opaque fill after bullets are drawn, so `streak`'s
  translucent tail is fully overwritten before any frame is read — the leak
  the queue entry described cannot currently reach a final pixel, and its
  own tail never reaches the band row at all at the sampled ticks in this
  probe (row 561 against a `bandTop` of 598.6)
- **where** director → ALTERNATIVES; `versus-seat.test.ts` proves the
  mechanism directly with synthetic pixel buffers, since `bun test` carries
  no real canvas to render against

**What the numbers actually show.** This lane does not change any of the
five candidates' screen counts today — the specific failure the queue entry
describes does not currently reproduce, for two independent reasons that
have nothing to do with this fix: an opaque band fill drawn after every
bullet, and a shot that does not travel far enough in the sampled window to
reach the band regardless. The fix is real anyway: it replaces a
measurement that would misfire the moment either of those facts changes —
a shot with more reach, an overlay drawn after the band, a translucent
patch to the band itself — with one that would not, and the synthetic test
demonstrates the exact case (a role-blind blend over two different
backgrounds) where the old exact hash disagreed with itself and the new
footprint hash does not, alongside the case (content only one seat draws)
where both agree it is real.
