# The basemap

The atlas has two basemaps, and `BASEMAP_KEY` decides which one you get.

| `BASEMAP_KEY` | What renders | Street detail |
|---|---|---|
| empty (today) | the built-in Singapore map — coastline + road network | centrelines only, no names |
| a valid CARTO key | CARTO Positron, as originally designed | yes |

Spec: [`specs/015-basemap-watermark/`](../specs/015-basemap-watermark/spec.md)

## Why there are two

**Symptom:** every tile stamped `API KEY REQUIRED · carto.com/basemaps/apikey`.

**Cause:** CARTO's raster basemaps became key-gated in 2026. The atlas had used them keyless
since it was built, so nothing in this repository changed — the tiles did.

**What was wrong with only having one:** the fix below (set a key) was correct and is still the
intended end state, but until someone applies it the product had no acceptable appearance at
all. A watermark tiled thirty times across the viewport is not something you can put in front of
a beta tester or a client, and the same state returns on any future expiry, quota exhaustion,
revocation or tile-host outage. So the app no longer *has* a watermarked state: with no key it
does not request those tiles, and draws its own ground instead.

## The keyless fallback

Singapore, drawn from two files the app already fetches on every load:

- **The coastline** from `data/planning_areas.geojson` — the 55 URA Master Plan 2019 planning
  areas the demographics layers use. Near-white land, slightly bluer water, hairline edges.
- **The road network** from `data/network.json`. All 612 bus services in it are road-aligned
  (33,025 polyline points), so their union *is* the road network — drawn pale and thin under
  everything else. Feeders are included on purpose: they are the estate streets the trunk
  services skip, and they are what makes an estate look like an estate. Stroke width scales with
  zoom, because a width that reads at street level is a smear at island level.

The coastline alone was tried first and was not enough — it told you the shape of Singapore and
nothing else. Roads are what make it a map you can orient on.

- No third-party host, no key, no new file, no new dependency, no build step.
- The routes, rail lines, stops, places, shading and density surface all draw over it unchanged.
- Export captures it like anything else — and with no cross-origin tile in the frame, the
  tainted-canvas risk that would break export outright goes away entirely.

**What you lose: everything that is not a road centreline.** No street names, no buildings, no
parks or water bodies inland, and no minor road the bus network never touches. A seller drilling
into one stop's surroundings sees the road pattern but cannot read off a street name. That is the
cost, and it is why this is a fallback rather than a replacement.

It also catches failure, not just absence: if a key is set and the tiles come back an error —
revoked, expired, over quota, host unreachable — the app drops to the same ground rather than
leaving a grey void. One case it cannot catch is a host that answers `200 OK` with a watermarked
*image*, which is indistinguishable from a working tile without sampling pixels. That is exactly
what CARTO does for an unkeyed request, which is why the keyless path does not make the request
at all.

## Getting the streets back

Get a free key at [carto.com](https://carto.com) and set it in `index.html`:

```js
const BASEMAP_KEY='';   // <-- paste it here
```

That is the only edit. Free tier is 5 million tile requests a month; a tool gated to ~50 sellers
will not approach it. Clearing the key returns you to the silhouette, also with no other edit.

## Is the key a secret?

No, and this is worth being precise about because this repo is public and other credentials here
are handled very differently.

A CARTO basemap key is a **publishable client-side key**, like a Google Maps JS key. It is sent
by every browser that loads the map, so it cannot be hidden, and CARTO's model expects that —
you restrict it by domain rather than by secrecy. It belongs in `index.html`.

The Cloudflare API token in `docs/access-setup.md` is the opposite: a real secret that grants
account access, read from the environment, never committed. Do not treat the two the same way.

## Why CARTO rather than another keyed or keyless source

The external keyless options were assessed and each costs more than the key does.

| Option | Why not |
|---|---|
| **OpenStreetMap standard** (`tile.openstreetmap.org`) | Keyless and reaches z19, but the OSMF tile usage policy is explicit that it is for OSM's own community, not production or commercial apps — and this is a commercial sales tool. The style is also full-colour, which is the bigger problem: sixteen route colours have to stay distinguishable on top of it. |
| **Esri light-gray** (`services.arcgisonline.com`) | The right *look*, but Esri moved to access tokens, its commercial terms for the free service are unclear, and its native tiles stop at z16 while this map drills to individual bus stops. Upscaled tiles would be visibly soft exactly where a seller zooms in. |
| **OpenFreeMap Positron** | Genuinely free, keyless and unlimited, and the correct style. But it is **vector** — adopting it means replacing Leaflet with MapLibre and rewriting the canvas export that produces the JPG and the deck. That is a rebuild, not a basemap change. |
| **Stadia / Geoapify / MapTiler / Thunderforest** | All need a key anyway, so no advantage over CARTO — and each would change the look. |

The finding underneath all of that: in 2026 there is no keyless, raster, light-styled basemap
from a third party that is safe for commercial use. Keyless and commercially-supported have
stopped overlapping — which is what pushed the fallback to be drawn from data the atlas already
ships rather than fetched from anyone.

Given a key is unavoidable for streets, CARTO is the one that costs nothing else:

- **Zero visual change.** Every deck, screenshot and export already shipped keeps its look.
- **Export keeps working.** Same host, same CORS behaviour, so the canvas capture behind the JPG
  and PPTX is untouched.
- **One line.** No library swap, no new dependency, no build step.

## Verifying

### Keyless (the state today)

Verifiable in the sandbox, and covered by the headless run recorded in
[`docs/user-stories.md`](user-stories.md):

1. Load with `BASEMAP_KEY=''` and confirm the island renders with no watermark, and that the
   network log shows **zero** requests to `basemaps.cartocdn.com`. Zero requests is the
   assertion — "no watermark visible" is weaker.
2. Confirm you can orient on it with no layers on: expressways, town centres, the CBD.
3. Zoom island → street level and confirm roads stay legible at both ends without swamping the
   route colours.
4. Export a JPG and a deck and confirm the ground is in the image.

### Keyed

**This cannot be checked from the Claude Code sandbox** — its proxy blocks every tile host, so
the map renders grey and a keyed run is indistinguishable from a failure. Check it in a browser:

1. Set `BASEMAP_KEY`, reload, and confirm the real streets are back and the built-in ground —
   coastline *and* roads — is gone.
2. Zoom to street level over a town centre and confirm tiles stay sharp.
3. Export a JPG with routes selected and confirm the basemap is *in* the image — if export
   silently produces a blank or route-only image, the basemap is tainting the canvas.
4. Clear the key, reload, and confirm you are back on the built-in ground.

Until a key is set the console carries an informational line naming the trade and the fix, so
running on the fallback is visible to whoever maintains the tool — and to nobody else. Nothing
about which basemap is in use is drawn on the map, in the sidebar, or in any export.
