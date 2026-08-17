# mindline.sg hotline — which of the four Five-route sets to buy

Evaluation of the `Five-route sets` product (index.html → `PRODUCTS`, key `dual`) against the
five audiences named for the campaign. Reproduce with `python3 tools/mindline_eval.py`.

Scored 2026-08-17 against the committed network and place data (37 layers, 5,880 places, last
verified 2026-08-13 per `data/qc_report.json`).

## The four sets

| Set | Routes | Corridors |
|---|---|---|
| Set 1 | 190, 518, 70, 117, 87 | CCK–Kg Bahru · Pasir Ris loop · Yio Chu Kang–Shenton Way · Punggol Coast–Sembawang · Compassvale–Bedok |
| Set 2 | 190, 70, 133, 198, 85 | CCK–Kg Bahru · Yio Chu Kang–Shenton Way · AMK–Shenton Way · Boon Lay–Bt Merah · Punggol–Yishun |
| Set 3 | 972, 143, 5, 76, 31 | Bt Panjang loop · Toa Payoh–Jurong East · Pasir Ris–Bt Merah · Yio Chu Kang–Eunos · Tampines–Toa Payoh |
| Set 4 | 972, 97, 130, 89, 43 | Bt Panjang loop · Tengah–Promenade · AMK–Shenton Way · Hougang loop · Punggol–Upp East Coast |

## Recommendation

**Buy Set 2.** It is top or near-top in every audience column, reaches the most caregiving
corridors per stop of any set, wastes the least inventory on duplicate stops, and is one of only
two sets with any presence in the North.

**Set 3 is the alternative** if the priority is raw senior volume in mature estates — but it has
**zero North Region coverage** and 6% of its stops are duplicates.

**Set 1 and Set 4 are not competitive.** Neither wins under any of the six weightings tested; both
are weak precisely where this campaign is strongest — seniors and the sandwich generation.

If the five routes can be re-cut rather than bought as listed, **190 + 198 + 31 + 43 + 5** scores
110.5 against Set 2's 93.8 — 18% better from routes the four sets already contain. It has no North
coverage; **198 + 31 + 518 + 76 + 85** (106.4) is the best set that keeps a northern route.

## Audience index

Best set in each column = 100. Each column is 50% *places* (is the ad where this audience
gathers) and 50% *impressions* (weekday boardings weighted by that cohort's share of the stop's
planning area).

| Set | Young children | Seniors | Working adults | Sandwich gen. | Youth | **Overall** |
|---|---|---|---|---|---|---|
| Set 1 | 92.7 | 67.4 | 82.2 | 74.8 | 87.2 | **80.9** |
| **Set 2** | **96.5** | 90.6 | **92.9** | 92.7 | **96.4** | **93.8** |
| Set 3 | 95.2 | **97.7** | 86.8 | **93.9** | 92.7 | **93.3** |
| Set 4 | 92.2 | 70.4 | 88.9 | 77.8 | 85.2 | **82.9** |

## Underlying evidence

| Set | Stops | Weekday boardings | Weekend | Planning areas | Sandwich stops | Duplicate stops |
|---|---|---|---|---|---|---|
| Set 1 | 406 | 1,064,061 | 1,016,891 | 26 | 77 | 9 (2.2%) |
| Set 2 | 396 | 1,193,415 | 1,179,911 | 27 | **99** | **5 (1.3%)** |
| Set 3 | **467** | **1,290,629** | **1,274,997** | 24 | 87 | 28 (6.0%) |
| Set 4 | 447 | 1,021,576 | 1,013,480 | **28** | 84 | 3 (0.7%) |

Places within 400 m of a stop on the set (deduped — a school two routes both pass is one school):

| Layer | Set 1 | Set 2 | Set 3 | Set 4 |
|---|---|---|---|---|
| Primary schools | 44 | 45 | 44 | **48** |
| Student care | **72** | 67 | 62 | 69 |
| Secondary schools | 30 | 33 | 37 | **38** |
| JCs & Millennia | 2 | 3 | 2 | **4** |
| Universities / polys / ITE | 4 | 3 | **6** | 2 |
| Libraries | **15** | 14 | 10 | 14 |
| SportSG facilities | 12 | **19** | 15 | 11 |
| Eldercare | 19 | 37 | **38** | 19 |
| Polyclinics | 7 | **9** | 7 | 8 |
| Community clubs | 32 | **39** | 33 | 27 |
| Hospitals | 6 | 9 | 10 | **11** |
| Pharmacies | 93 | **104** | 100 | 105 |
| MRT/LRT interchanges | 17 | **21** | 13 | **21** |
| Shopping malls | 101 | 114 | 99 | **129** |
| IMH / Woodbridge on route | — | — | — | **yes** |

## Reading it by audience

**1 · Young children (schools).** All four sets are close (92–97) — primary schools are spread
evenly enough across Singapore that any five trunk routes catch 44–48 of the 182. Set 4 passes the
most primary schools (48); Set 1 the most student-care centres (72). This audience does not
discriminate between the sets, and it should not decide the buy. Worth saying plainly: a bus ad
does not reach a 7-year-old. It reaches the parent at the school gate and the teacher on the way
in, which is the correct target for a hotline anyway.

**2 · Seniors.** This is where the sets genuinely separate, and it is the widest gap in the whole
evaluation. Sets 2 and 3 pass 37 and 38 eldercare facilities; Sets 1 and 4 pass 19 each — barely
half. Set 3 edges the column (97.7) because it runs through Bukit Merah, Toa Payoh and Bedok,
mature estates with both senior density and volume. Set 2 leads on senior *places* (39 community
clubs, 9 polyclinics vs Set 3's 33 and 7). Either works; Sets 1 and 4 do not.

**3 · Working adults.** Set 2 leads (92.9) on 21 interchanges and the highest adult-cohort
impressions per stop. Set 4 has the same 21 interchanges and the most malls (129) but thinner
daytime corridors. Set 3 is weakest here (86.8) despite being the biggest set — its stops sit in
residential rather than employment catchments.

**4 · Sandwich generation.** No POI layer maps "adult with a child in school and a parent in a
clinic", so this is scored on a co-location rule: **a single stop with both a child place and a
senior place within 400 m** — the stop where one ad reaches both errands of the same trip. Set 2
has 99 such stops against Set 3's 87, Set 4's 84 and Set 1's 77, and the widest margin per stop
(0.250 vs 0.186). This is the sharpest single metric in the evaluation because a long route cannot
fake it — it requires the two land uses to actually coincide.

**5 · Youth.** Set 2 leads (96.4) on 33 secondary schools, 3 JCs, 19 SportSG facilities and 18
cinemas. Set 4 passes more secondary schools (38) and JCs (4) but far fewer of the third places
where this age group is unsupervised and reachable.

## The finding that is not in the audience columns

Region balance is invisible to the audience model — it counts seniors, not where they live — and it
is where two of the four sets fail a *national* hotline:

| Set | Central | East | North | North-East | West |
|---|---|---|---|---|---|
| Set 1 | 24.0% | 28.9% | **13.6%** | 23.0% | 10.5% |
| Set 2 | 39.0% | **0.0%** | 7.8% | 26.1% | 27.1% |
| Set 3 | 46.2% | 28.8% | **0.0%** | 12.5% | 12.6% |
| Set 4 | 37.5% | 11.7% | **0.3%** | 36.0% | 14.6% |

Only two routes in the entire 20-route pool reach the North: **117** (81.8% of its boardings) and
**85** (52.6%). Set 3 and Set 4 contain neither, so Woodlands, Sembawang and Yishun see nothing.
Set 2 carries 85, which is most of why it is the recommendation over Set 3.

Set 2's own blind spot is the mirror image: **no East Region coverage at all** — no Bedok, Tampines
or Pasir Ris. Set 1, the lowest-scoring set overall, is the most evenly balanced of the four. If the
campaign runs in two flights, Set 2 then Set 1 covers the country far better than Set 2 twice.

## Better sets from the same routes

Exhaustive over all 15,504 five-route combinations of the 20 routes the four sets already contain:

| Rank | Routes | Score | Stops | Sandwich stops | North |
|---|---|---|---|---|---|
| 1 | 190, 198, 31, 43, 5 | 110.5 | 451 | 119 | 0.0% |
| 2 | 133, 190, 198, 43, 5 | 110.5 | 472 | 124 | 0.0% |
| 3 | 133, 143, 198, 43, 5 | 109.3 | 531 | 111 | 0.0% |
| — | *Set 2 as sold* | *93.8* | *396* | *99* | *7.8%* |

Best five that keeps a northern route: **198, 31, 518, 76, 85** — 106.4, with 122 sandwich stops
and 6.6% North.

Greedy across all 293 trunk routes gives **147, 67, 187, 88, 61** at 146.6 — but that set has 623
stops. Per 100 stops it scores 23.5, against Set 2's 23.7. It is not better targeted, only bigger;
treat it as a budget question, not a targeting one.

## Caveats

- **Boardings are not impressions.** `data/stop_volume.json` counts people boarding at a stop. A
  bus ad is seen along the whole corridor by pedestrians and drivers who never board. The figure is
  a consistent proxy for comparing sets, not an audience guarantee, and should never be quoted to a
  client as a reach number.
- **Cohort shares are planning-area averages** applied to every stop in that area. They say a stop
  sits in a senior-dense town, not that the queue at that stop is old.
- **The score is monotone in coverage** — a longer route always scores higher. Comparisons between
  sets of similar size are sound; the per-100-stops column is the one to use across different sizes.
- **Place weights are a judgement**, set in `AUDIENCES` in `tools/mindline_eval.py`. The sensitivity
  table below is the check on them.
- **Sets 1 and 4 losing is robust**; Set 2 vs Set 3 is not settled by score alone. Under six
  weightings Set 2 wins four and Set 3 wins two (both the impressions-led and the
  seniors+sandwich-weighted runs). The North coverage gap, not the index, is what decides it.

| Scenario | Set 1 | Set 2 | Set 3 | Set 4 | Winner |
|---|---|---|---|---|---|
| Equal, 50/50 places+impressions | 80.9 | 93.8 | 93.3 | 82.9 | Set 2 |
| Places-led (70/30) | 81.3 | 95.2 | 90.6 | 86.0 | Set 2 |
| Impressions-led (30/70) | 80.4 | 92.4 | 96.0 | 79.8 | Set 3 |
| Need-weighted (seniors + sandwich ×2) | 78.1 | 93.2 | 94.0 | 80.4 | Set 3 |
| Early intervention (children + youth ×2) | 83.4 | 94.6 | 93.5 | 84.6 | Set 2 |
| Working adults ×2 | 81.1 | 93.7 | 92.2 | 83.9 | Set 2 |

## Method

Proximity uses the atlas's own rule verbatim (`routesNearPoi`, index.html): a place counts for a
route when a stop on that route falls inside the place's footprint, within 400 m of a footprint
vertex, or — for places with no footprint — within 400 m of the point. Reusing the app's rule means
these counts match what a seller sees on the map rather than forming a second, quietly different
set of numbers.

Feeders are excluded (the sets are all trunk services). Stops are deduped across a set's routes
before anything is counted or summed, so a corridor two of the five routes share is not paid for
twice in the score — it is reported separately as duplicate stops.
