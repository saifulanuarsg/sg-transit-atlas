# The basemap

**Symptom:** every tile stamped `API KEY REQUIRED · carto.com/basemaps/apikey`.

**Cause:** CARTO's raster basemaps became key-gated in 2026. The atlas had used them keyless
since it was built, so nothing in this repository changed — the tiles did.

**Fix:** get a free key at [carto.com](https://carto.com) and set it in `index.html`:

```js
const BASEMAP_KEY='';   // <-- paste it here
```

Free tier is 5 million tile requests a month. A tool gated to ~50 sellers will not approach it.

## Is the key a secret?

No, and this is worth being precise about because this repo is public and other credentials here
are handled very differently.

A CARTO basemap key is a **publishable client-side key**, like a Google Maps JS key. It is sent
by every browser that loads the map, so it cannot be hidden, and CARTO's model expects that —
you restrict it by domain rather than by secrecy. It belongs in `index.html`.

The Cloudflare API token in `docs/access-setup.md` is the opposite: a real secret that grants
account access, read from the environment, never committed. Do not treat the two the same way.

## Why a key rather than a keyless source

The keyless options were assessed and each costs more than the key does.

| Option | Why not |
|---|---|
| **OpenStreetMap standard** (`tile.openstreetmap.org`) | Keyless and reaches z19, but the OSMF tile usage policy is explicit that it is for OSM's own community, not production or commercial apps — and this is a commercial sales tool. The style is also full-colour, which is the bigger problem: sixteen route colours have to stay distinguishable on top of it. |
| **Esri light-gray** (`services.arcgisonline.com`) | The right *look*, but Esri moved to access tokens, its commercial terms for the free service are unclear, and its native tiles stop at z16 while this map drills to individual bus stops. Upscaled tiles would be visibly soft exactly where a seller zooms in. |
| **OpenFreeMap Positron** | Genuinely free, keyless and unlimited, and the correct style. But it is **vector** — adopting it means replacing Leaflet with MapLibre and rewriting the canvas export that produces the JPG and the deck. That is a rebuild, not a basemap change. |
| **Stadia / Geoapify / MapTiler / Thunderforest** | All need a key anyway, so no advantage over CARTO — and each would change the look. |

The finding underneath all of that: in 2026 there is no keyless, raster, light-styled basemap
that is safe for commercial use. Keyless and commercially-supported have stopped overlapping.

Given a key is unavoidable, CARTO is the one that costs nothing else:

- **Zero visual change.** Every deck, screenshot and export already shipped keeps its look.
- **Export keeps working.** Same host, same CORS behaviour, so the canvas capture behind the JPG
  and PPTX is untouched. A cross-origin basemap without CORS headers would taint the canvas and
  break export outright — the product's main deliverable.
- **One line.** No library swap, no new dependency, no build step.

## Verifying

This cannot be checked from the Claude Code sandbox — its proxy blocks every tile host, which is
why screenshots taken there render the map grey. Check it in a browser:

1. Set `BASEMAP_KEY`, reload, and confirm no watermark.
2. Zoom to street level over a town centre and confirm tiles stay sharp.
3. Export a JPG with routes selected and confirm the basemap is *in* the image — if export
   silently produces a blank or route-only image, the basemap is tainting the canvas.

Until a key is set the console carries a warning naming the fix, so this fails loudly rather than
being mistaken for a rendering bug.
