// mindline.sg route-package sell-in deck — one generator, all three packages.
//
//   node tools/build_package_deck.js <dco.json> <out.pptx>
//
// Every figure comes out of tools/package_dco.py, so a slide cannot drift from the
// data. Only the NARRATIVE below is written by hand, and it is keyed by package
// because the argument genuinely differs: DBP C1 is the recommendation, DBP L2 the
// alternative, DBP C2 the third option — and running the recommendation's copy over
// a package that did not win would produce a deck that lies politely.
//
// Brand constants are the repo's own (index.html BRAND): pink F0245E, navy 1B2D8A,
// wordmark MOOVE MEDIA. Body face is Arial rather than the app's Inter so the deck
// renders true-to-width everywhere and on any client machine without a font install.
const pptxgen = require('pptxgenjs');
const fs = require('fs');

const D = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const CODE = D.package;

const PINK = 'F0245E', NAVY = '1B2D8A', INK = '14204A', GREY = '5A6484',
      LINE = 'D8DDE9', TINT = 'F5F7FC', WHITE = 'FFFFFF', DEEP = '111A3E';
const F = 'Arial';
const fmt = n => n.toLocaleString('en-US');
const pct = v => (v || 0).toFixed(1) + '%';
// every deck compares against the recommendation, except the recommendation itself,
// which compares against the runner-up
const other = CODE === 'DBP C1' ? 'DBP L2' : 'DBP C1';
const otherRow = D.comparison.find(c => c.code === other);
const meRow = D.comparison.find(c => c.is_this);
// a row is labelled by its package code wherever it has one, so two decks side by
// side never call the same row different things
const label = c => c.code || c.set;

const NARRATIVE = {
  'DBP C1': {
    coverPill: 'RECOMMENDED BUY',
    coverSub: 'Five routes for the mindline.sg hotline',
    coverNote: 'Chosen from four candidate sets, scored against the five audiences the campaign named.',
    shortlistNote: 'DBP L2 scores within half a point of DBP C1 — and on the index alone the two swap places '
      + 'depending on how you weight them. The score does not separate them. Slide 8 does.',
    s5mode: 'losers',
    coverageTitle: 'A national hotline needs national coverage',
    coverageSub: 'The audience index counts seniors — but not where they live. This is what it could not see.',
    coverageNote: 'Only two routes in the entire twenty-route pool reach the North: 117 and 85. Sets 3 and 4 '
      + 'contain neither — so Woodlands, Sembawang and Yishun would see nothing. DBP C1 carries 85. '
      + 'That, not the score, is why it is the recommendation.',
    sandwichClose: CODE + ' carries 0.250 caregiving stops per stop bought — the highest of the four sets, and 34% ahead of ' + other + '.',
    limits: [
      ['DBP C1 has no East Region coverage',
       'No Bedok, Tampines or Pasir Ris. It is the mirror image of DBP L2’s northern gap. If the campaign runs two flights, DBP C1 then Set 1 covers the country far better than DBP C1 twice.'],
      ['Boardings are not impressions',
       'The volume data counts people boarding at a stop. A bus ad is seen along the whole corridor by people who never board. It is a sound basis for comparing sets — it is not a reach guarantee, and we will not quote it as one.'],
      ['Cohort shares are area averages',
       'They say a stop sits in a senior-dense town, not that the queue at that stop is old.'],
      ['Dayparts are assumptions, not measurements',
       'Set from institution operating hours. If hourly boarding data can be licensed from LTA, these windows should be re-derived from it before the second flight.'],
    ],
    next: [
      ['Confirm the flight', 'Six-week minimum on all five routes; weekend weight held at parity with weekday.'],
      ['Brief five creative variants', 'One per audience, per the dayparting on slide 11. Seniors and youth are the two that cannot share artwork.'],
      ['Fill the East gap', 'Either add Set 1 as a second flight, or swap one route to pick up Bedok and Tampines.'],
      ['Re-derive dayparts', 'If hourly boarding data can be licensed, replace the assumed windows before flight two.'],
    ],
  },
  'DBP L2': {
    coverPill: 'ALTERNATIVE PACKAGE',
    coverSub: 'The alternative five for the mindline.sg hotline',
    coverNote: 'Second of four on the index, and the strongest of all four on seniors. What it trades away is on slide 8.',
    shortlistNote: 'DBP L2 lands within half a point of DBP C1, and beats it outright once the weighting leans on '
      + 'impressions or on seniors. The index does not settle this. Coverage does — slide 8.',
    s5mode: 'versus',
    coverageTitle: 'Strong in the East, blind in the North',
    coverageSub: 'The audience index counts seniors — but not where they live. This is the trade DBP L2 makes.',
    coverageNote: 'DBP L2 is the only package of the four that pairs heavy Central weight with real East reach — '
      + 'Bedok, Tampines and Pasir Ris, none of which DBP C1 touches. It pays for that with the North: '
      + 'zero. Woodlands, Sembawang and Yishun see nothing on this buy.',
    versusFooter: 'DBP L2 and DBP C1 both beat Set 1 and DBP C2 under every weighting tested. '
      + 'The choice is only ever between these two.',
    sandwichClose: CODE + ' posts the highest sandwich index of the four (' + D.index.sandwich.toFixed(1)
      + ') on impressions, though ' + other + ' passes more caregiving corridors outright.',
    gains: [
      ['Seniors', meRow.audiences.seniors.toFixed(1) + ' vs ' + otherRow.audiences.seniors.toFixed(1),
       'The strongest senior delivery of all four sets — Bukit Merah, Ang Mo Kio, Kallang.'],
      ['East Region', pct(meRow.region['East Region']) + ' vs ' + pct(otherRow.region['East Region'] || 0),
       'Bedok, Tampines and Pasir Ris. ' + other + ' does not touch the East at all.'],
      ['Scale', fmt(D.totals.wd) + ' weekday',
       meRow.stops + ' stops against ' + otherRow.stops + ' — the largest package of the four.'],
    ],
    costs: [
      ['North Region', pct(meRow.region['North Region'] || 0) + ' vs ' + pct(otherRow.region['North Region']),
       'Nothing at all in Woodlands, Sembawang or Yishun.'],
      ['Working adults', meRow.audiences.working.toFixed(1) + ' vs ' + otherRow.audiences.working.toFixed(1),
       '13 interchanges against ' + other + '’s 21 — residential, not employment, catchments.'],
      ['Duplicate stops', meRow.dup_stops + ' vs ' + otherRow.dup_stops,
       'Six per cent of the buy is roadside paid for twice, through the Toa Payoh–Bukit Merah spine.'],
    ],
    limits: [
      ['DBP L2 reaches none of the North Region',
       'Zero, not "a little". Neither 117 nor 85 — the only two routes in the twenty-route pool that go north — is in this package, so Woodlands, Sembawang and Yishun are not covered at all. For a national service this is the reason DBP C1 was recommended over it.'],
      ['28 of its stops are duplicates',
       'Six per cent of the inventory: stops served by more than one of the five routes, so the same roadside is paid for twice. DBP C1 wastes five. The routes overlap through the Toa Payoh–Bukit Merah spine.'],
      ['Weakest of the contenders on working adults',
       'Index 86.8 against DBP C1’s 92.9. It is the largest package by stops, but those stops sit in residential rather than employment catchments — 13 interchanges to DBP C1’s 21.'],
      ['Boardings are not impressions',
       'The volume data counts people boarding at a stop. A bus ad is seen along the whole corridor by people who never board. It is a sound basis for comparing sets — it is not a reach guarantee, and we will not quote it as one.'],
      ['Dayparts are assumptions, not measurements',
       'Set from institution operating hours, not from an hourly boarding curve, which this dataset does not carry.'],
    ],
    next: [
      ['Decide the trade first', 'DBP L2 buys the East and the strongest senior delivery of the four. It cannot cover the North. If national reach is a requirement, it needs a partner.'],
      ['Pair it with a northern route', 'Adding 117 or 85 is the cheapest fix — they are the only two northern routes in the pool.'],
      ['Trim the duplicate spine', 'Twenty-eight stops are double-served through Toa Payoh–Bukit Merah. Swapping one route recovers that inventory.'],
      ['Brief five creative variants', 'One per audience, per the dayparting on slide 11 and the vehicle split on slide 12.'],
    ],
  },
  'DBP C2': {
    coverPill: 'THIRD OPTION',
    coverSub: 'The breadth five for the mindline.sg hotline',
    coverNote: 'Third of four on the index. Bought for schools and spread, not for seniors — the trade is on slide 5.',
    shortlistNote: 'DBP C2 sits roughly eleven points behind the two contenders and loses to both under every '
      + 'weighting tested. It is on the table for what it covers, not for what it scores — slide 5.',
    s5mode: 'versus',
    coverageTitle: 'The widest spread of the four — but not the North',
    coverageSub: 'The audience index counts seniors — but not where they live. This is the trade DBP C2 makes.',
    coverageNote: 'DBP C2 touches 28 planning areas, more than any other package, and carries the heaviest '
      + 'North-East weight of the four at 36.0%. But the North Region is 0.3% — effectively nothing in '
      + 'Woodlands, Sembawang or Yishun.',
    versusFooter: 'DBP C2 trails both contenders on the index under all six weightings. It is on the '
      + 'shortlist for what it covers — schools, spread, and the only IMH corridor of the four.',
    sandwichClose: CODE + ' passes ' + D.totals.sandwich_stops + ' caregiving corridors against ' + other
      + '’s ' + otherRow.sandwich_stops + ', on a larger buy — the weaker of the two on the audience that '
      + 'most needs the message.',
    gains: [
      ['Schools', D.places.pri + ' + ' + D.places.sec + ' vs ' + '45 + 33',
       'The most primary and secondary schools of any of the four, plus ' + D.places.jcmi + ' junior colleges. A schools-led brief is where this package earns its place.'],
      ['Breadth', D.totals.areas + ' areas · ' + D.places.malls + ' malls',
       'The widest geographic spread of the four and the most retail — ' + (D.places.malls - 114) + ' more malls than ' + other + '.'],
      ['Clean inventory', D.totals.dup_stops + ' duplicate stops vs ' + otherRow.dup_stops,
       'Zero-point-seven per cent of the buy is double-served — the least wasted roadside of any package.'],
    ],
    costs: [
      ['Seniors', meRow.audiences.seniors.toFixed(1) + ' vs ' + otherRow.audiences.seniors.toFixed(1),
       'Nineteen eldercare facilities against ' + other + '’s 37, and 27 community clubs to 39. This is the weakest senior delivery on the shortlist.'],
      ['Sandwich generation', meRow.audiences.sandwich.toFixed(1) + ' vs ' + otherRow.audiences.sandwich.toFixed(1),
       D.totals.sandwich_stops + ' caregiving corridors against ' + otherRow.sandwich_stops + ' — on a buy that is 51 stops larger.'],
      ['Overall', meRow.overall.toFixed(1) + ' vs ' + otherRow.overall.toFixed(1),
       'It loses to both contenders under all six weightings tested. Choose it for coverage, never on the score.'],
    ],
    limits: [
      ['DBP C2 is the weakest of the four on seniors',
       'Index 70.4. Nineteen eldercare facilities and 27 community clubs, against DBP C1’s 37 and 39. If seniors are a priority audience — and for a mental-health hotline they usually are — this package does not serve them.'],
      ['It loses to both contenders under every weighting',
       'Overall 82.9 against DBP C1’s 93.8 and DBP L2’s 93.3, under all six weightings tested. There is no way of scoring the brief that puts DBP C2 first.'],
      ['Effectively no North Region coverage',
       '0.3% of weekday boardings. Like DBP L2 it carries neither 117 nor 85, the only two northern routes in the pool.'],
      ['Boardings are not impressions',
       'The volume data counts people boarding at a stop. A bus ad is seen along the whole corridor by people who never board. It is a sound basis for comparing sets — it is not a reach guarantee, and we will not quote it as one.'],
      ['Dayparts are assumptions, not measurements',
       'Set from institution operating hours, not from an hourly boarding curve, which this dataset does not carry.'],
    ],
    next: [
      ['Only take this if the brief is schools-led', 'DBP C2 is the strongest of the four on primary, secondary and junior colleges. On seniors it is the weakest. That is the whole decision.'],
      ['Pair it with a senior package', 'DBP L2 is the natural partner — it leads the four on seniors exactly where DBP C2 trails.'],
      ['Use the IMH corridor deliberately', 'DBP C2 is the only package with a stop within 400 m of the Institute of Mental Health. Creative there should assume an audience already in care, not one being introduced to the service.'],
      ['Brief five creative variants', 'One per audience, per the dayparting on slide 11 and the vehicle split on slide 12.'],
    ],
  },
}[CODE];

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';            // 13.33 x 7.5 — must precede any addSlide
p.author = 'Moove Media';
p.company = 'Moove Media';
p.title = CODE + ' — mindline.sg hotline';

const M = 0.55;
let pageNo = 0;

// ---- the motif: a pink pill carrying the package code, on every slide ----
function pill(s, text, x, y, opts) {
  opts = opts || {};
  const fill = opts.fill || PINK, fg = opts.fg || WHITE;
  const w = opts.w || Math.max(1.0, text.length * 0.102 + 0.36);
  const h = opts.h || 0.34;
  s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: w, h: h, fill: { color: fill },
    line: opts.line || { type: 'none' }, rectRadius: h / 2 });
  s.addText(text, { x: x, y: y, w: w, h: h, fontSize: opts.fs || 9.5, bold: true, color: fg,
    align: 'center', valign: 'middle', charSpacing: 1.3, fontFace: F, margin: 0 });
  return w;
}

// route-number plate — the domain's own object, reused as a visual unit
function plate(s, num, x, y, o) {
  o = o || {};
  const w = o.w || 0.78, h = o.h || 0.44;
  s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: w, h: h,
    fill: { color: o.fill || WHITE }, line: { color: o.line || PINK, width: 1.25 }, rectRadius: 0.07 });
  s.addText(num, { x: x, y: y, w: w, h: h, fontSize: o.fs || 15, bold: true,
    color: o.fg || PINK, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
  return w;
}

function footer(s, dark) {
  s.addText('MOOVE MEDIA', { x: 10.35, y: 7.03, w: 2.43, h: 0.34, fontSize: 11.5, bold: true,
    italic: true, color: dark ? WHITE : NAVY, align: 'right', valign: 'middle',
    charSpacing: 1, fontFace: F, margin: 0 });
  s.addText(String(pageNo), { x: M - 0.02, y: 7.03, w: 0.6, h: 0.34, fontSize: 10,
    color: dark ? '7C87BC' : GREY, valign: 'middle', fontFace: F, margin: 0 });
}

function chrome(s, eyebrow, title, sub) {
  pageNo++;
  pill(s, eyebrow, M, 0.36);
  s.addText(title, { x: M - 0.02, y: 0.82, w: 11.6, h: 0.62, fontSize: 30, bold: true,
    color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
  if (sub) s.addText(sub, { x: M - 0.02, y: 1.44, w: 11.4, h: 0.4, fontSize: 12.5,
    color: GREY, valign: 'top', fontFace: F, margin: 0 });
  footer(s);
}

function card(s, x, y, w, h, o) {
  o = o || {};
  s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: w, h: h,
    fill: { color: o.fill || WHITE }, rectRadius: 0.09,
    line: o.line === false ? { type: 'none' } : { color: o.lineC || LINE, width: 1 } });
}

// ============================================================ 1 · cover
{
  const s = p.addSlide(); s.background = { color: NAVY };
  pageNo++;
  s.addShape(p.ShapeType.roundRect, { x: 8.55, y: -1.6, w: 6.6, h: 6.6,
    fill: { color: DEEP }, rectRadius: 3.3, line: { type: 'none' } });
  pill(s, NARRATIVE.coverPill, M, 0.95);
  s.addText(CODE, { x: M - 0.03, y: 1.5, w: 8.4, h: 1.5, fontSize: 76, bold: true,
    color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
  s.addText(NARRATIVE.coverSub, { x: M - 0.02, y: 3.0, w: 8.0, h: 0.5,
    fontSize: 19, color: 'CBD3F2', valign: 'middle', fontFace: F, margin: 0 });
  let x = M;
  D.routes.forEach(r => { x += plate(s, r, x, 3.72, { fill: WHITE, line: WHITE, fg: NAVY, w: 1.02, h: 0.62, fs: 21 }) + 0.16; });
  s.addText(NARRATIVE.coverNote,
    { x: M - 0.02, y: 4.66, w: 7.6, h: 0.6, fontSize: 13, color: '9BA7D8', fontFace: F, margin: 0 });

  const stats = [[fmt(D.totals.stops), 'bus stops'],
                 [(D.totals.wd / 1e6).toFixed(2) + 'M', 'weekday boardings'],
                 [String(D.totals.areas), 'planning areas'],
                 [String(D.totals.sandwich_stops), 'caregiving corridors']];
  let sx = M;
  stats.forEach(st => {
    s.addText(st[0], { x: sx, y: 5.45, w: 2.0, h: 0.5, fontSize: 25, bold: true, color: PINK, fontFace: F, margin: 0 });
    s.addText(st[1], { x: sx, y: 5.95, w: 2.0, h: 0.34, fontSize: 10, color: '9BA7D8', fontFace: F, margin: 0 });
    sx += 2.05;
  });
  footer(s, true);
  s.addNotes(CODE + ' is ' + D.set + ' of the Five-route sets product: ' + D.routes.join(', ') + '.');
}

// ============================================================ 2 · the brief
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · MINDLINE.SG', 'Five audiences, one hotline',
    'The campaign named five audiences. Each one is reached in a different place, at a different hour.');
  const auds = [
    ['Young children', 'Reached through the adult at the school gate — not the child.', 'a0–14'],
    ['Seniors', 'Polyclinic and senior-activity mornings, in the mature estates.', 'a65+'],
    ['Working adults', 'Interchange and CBD commute, twice a day.', 'a25–64'],
    ['Sandwich generation', 'Caring for a child and a parent at once. No layer maps them.', 'the gap'],
    ['Youth', 'Secondary and IHL dismissal, then the third places after.', 'a15–24']];
  let y = 2.05;
  auds.forEach((a, i) => {
    card(s, M, y, 12.23, 0.86, { fill: i === 3 ? 'FDF0F4' : WHITE, lineC: i === 3 ? PINK : LINE });
    s.addShape(p.ShapeType.roundRect, { x: M + 0.26, y: y + 0.22, w: 0.42, h: 0.42,
      fill: { color: i === 3 ? PINK : NAVY }, rectRadius: 0.21, line: { type: 'none' } });
    s.addText(String(i + 1), { x: M + 0.26, y: y + 0.22, w: 0.42, h: 0.42, fontSize: 12, bold: true,
      color: WHITE, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
    s.addText(a[0], { x: M + 0.86, y: y + 0.1, w: 3.3, h: 0.35, fontSize: 14.5, bold: true,
      color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(a[1], { x: M + 0.86, y: y + 0.44, w: 8.2, h: 0.33, fontSize: 11.5, color: GREY,
      valign: 'middle', fontFace: F, margin: 0 });
    s.addText(a[2], { x: 10.9, y: y + 0.23, w: 1.7, h: 0.4, fontSize: 12, bold: true,
      color: i === 3 ? PINK : NAVY, align: 'right', valign: 'middle', fontFace: F, margin: 0 });
    y += 0.98;
  });
}

// ============================================================ 3 · method
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · METHOD', 'How the four sets were scored',
    'Every set measured the same way, on the atlas’s own 400 m rule — so these counts match the map.');
  const boxes = [
    ['PLACES', 'Is the ad where this audience gathers?',
     'Counted from 37 place layers — schools, eldercare, polyclinics, community clubs, interchanges. Deduplicated across the five routes: a school two buses both pass is one school.'],
    ['IMPRESSIONS', 'How many of that audience actually see it?',
     'Weekday boardings at each stop, weighted by that cohort’s share of the stop’s planning area.'],
  ];
  let x = M;
  boxes.forEach((b, i) => {
    card(s, x, 2.15, 5.94, 2.25);
    pill(s, b[0], x + 0.3, 2.42, { fill: i ? NAVY : PINK, fs: 9 });
    s.addText(b[1], { x: x + 0.3, y: 2.88, w: 5.34, h: 0.38, fontSize: 14, bold: true, color: NAVY, fontFace: F, margin: 0 });
    s.addText(b[2], { x: x + 0.3, y: 3.28, w: 5.34, h: 0.95, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
    x += 6.29;
  });
  card(s, M, 4.62, 12.23, 1.12, { fill: TINT, lineC: LINE });
  s.addText('Why both halves', { x: M + 0.32, y: 4.78, w: 3.0, h: 0.32, fontSize: 12.5, bold: true, color: NAVY, fontFace: F, margin: 0 });
  s.addText('Places alone would rank ten quiet schools above one packed interchange. Boardings alone would put every CBD route on top and ignore the brief entirely. Each audience is scored 50 / 50, and the best set in each column is indexed to 100.',
    { x: M + 0.32, y: 5.1, w: 11.6, h: 0.56, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
  s.addText('Sources — LTA DataMall passenger volume · SingStat Census 2020 · MOE school registry · 5,880 places across 37 layers, verified 13 Aug 2026.',
    { x: M, y: 6.0, w: 11.6, h: 0.4, fontSize: 9.5, italic: true, color: GREY, fontFace: F, margin: 0 });
}

// ============================================================ 4 · the comparison
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · SHORTLIST', 'Four sets, scored side by side',
    'Overall index — the mean of the five audience columns. Best set in each column = 100.');
  // bar chart plots first category at the bottom, so feed it reversed
  const rev = D.comparison.slice().reverse();
  s.addChart(p.ChartType.bar, [{ name: 'Overall index',
      labels: rev.map(c => c.is_this ? CODE + ' (' + c.set + ')' : label(c)),
      values: rev.map(c => c.overall) }],
    { x: M, y: 2.05, w: 6.5, h: 4.0, barDir: 'bar',
      chartColors: rev.map(c => c.is_this ? PINK : NAVY),
      showTitle: false, showLegend: false, showValue: true, dataLabelPosition: 'outEnd',
      dataLabelFormatCode: '0.0',
      dataLabelColor: INK, dataLabelFontSize: 11, dataLabelFontBold: true, dataLabelFontFace: F,
      valAxisMaxVal: 105, valAxisMinVal: 0, catAxisLabelColor: INK, catAxisLabelFontSize: 11,
      catAxisLabelFontFace: F, valAxisLabelColor: GREY, valAxisLabelFontSize: 9.5,
      valAxisLabelFontFace: F, valGridLine: { color: LINE, size: 1 },
      catGridLine: { style: 'none' }, barGapWidthPct: 55 });

  const AUD = ['children', 'seniors', 'working', 'sandwich', 'youth'];
  const head = ['', 'Child', 'Senior', 'Work', 'Sand.', 'Youth'];
  const tx = 7.35, colW = [1.35, 0.92, 0.98, 0.9, 0.9, 0.93];
  let ty = 2.05;
  [head].concat(D.comparison.map(c =>
    [label(c)].concat(AUD.map(a => c.audiences[a].toFixed(1))))).forEach((r, ri) => {
    const hl = ri > 0 && D.comparison[ri - 1].is_this;
    if (hl) s.addShape(p.ShapeType.roundRect, { x: tx - 0.1, y: ty - 0.03, w: 5.85, h: 0.46,
      fill: { color: 'FDF0F4' }, rectRadius: 0.07, line: { color: PINK, width: 1 } });
    let cx = tx;
    r.forEach((c, ci) => {
      s.addText(c, { x: cx, y: ty, w: colW[ci], h: 0.4,
        fontSize: ri === 0 ? 9.5 : 11.5, bold: ri === 0 || hl,
        color: ri === 0 ? GREY : (hl ? PINK : INK),
        align: ci === 0 ? 'left' : 'center', valign: 'middle', fontFace: F, margin: 0 });
      cx += colW[ci];
    });
    if (ri === 0) s.addShape(p.ShapeType.line, { x: tx, y: ty + 0.41, w: 5.65, h: 0,
      line: { color: LINE, width: 1 } });
    ty += ri === 0 ? 0.5 : 0.52;
  });
  card(s, tx - 0.1, 4.8, 5.85, 1.25, { fill: TINT, lineC: LINE });
  s.addText(NARRATIVE.shortlistNote,
    { x: tx + 0.12, y: 5.0, w: 5.4, h: 0.9, fontSize: 11, color: GREY, fontFace: F, margin: 0 });
}

// ============================================================ 5 · rejected / versus
if (NARRATIVE.s5mode === 'losers') {
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · REJECTED', 'Why the other three lost',
    'A winner with no losers is a sales claim. Here is what each rejected set actually fails at.');
  const losers = [
    ['Set 1', 'Seniors 67.4 — the weakest column in the whole evaluation. Passes 19 eldercare facilities against DBP C1’s 37, barely half. Its one virtue is balance: it is the most evenly spread set of the four.'],
    ['Set 3', 'Scores level with DBP C1 and leads on senior volume. But it reaches no part of the North Region at all, and 6% of its stops are duplicates — inventory paid for twice.'],
    ['Set 4', 'Seniors 70.4 and the fewest caregiving corridors relative to its size. Carries the most malls (129) but the thinnest daytime corridors. Reaches the North at 0.3%.']];
  let x = M;
  losers.forEach(l => {
    const row = D.comparison.find(c => c.set === l[0]);
    const nm = label(row);
    card(s, x, 2.15, 3.94, 3.3);
    s.addText(nm, { x: x + 0.3, y: 2.4, w: 2.2, h: 0.42, fontSize: 20, bold: true, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(row.overall.toFixed(1), { x: x + 2.3, y: 2.4, w: 1.34, h: 0.42, fontSize: 16, bold: true, color: GREY, align: 'right', valign: 'middle', fontFace: F, margin: 0 });
    s.addShape(p.ShapeType.line, { x: x + 0.3, y: 2.94, w: 3.34, h: 0, line: { color: LINE, width: 1 } });
    s.addText(l[1], { x: x + 0.3, y: 3.08, w: 3.34, h: 2.1, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
    x += 4.15;
  });
  card(s, M, 5.68, 12.23, 0.78, { fill: TINT, lineC: LINE });
  s.addText('Tested under six different weightings. Sets 1 and 4 lose under all six — that part is settled, not a judgement call.',
    { x: M + 0.32, y: 5.82, w: 11.6, h: 0.5, fontSize: 11.5, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
} else {
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · THE TRADE', CODE + ' against ' + other,
    'The only question worth asking about an alternative: what does it buy you, and what does it cost you.');
  [['WHAT YOU GAIN', NARRATIVE.gains, PINK], ['WHAT YOU GIVE UP', NARRATIVE.costs, NAVY]].forEach((col, ci) => {
    const x = M + ci * 6.29;
    card(s, x, 2.15, 5.94, 3.95, { fill: ci ? WHITE : 'FDF0F4', lineC: ci ? LINE : PINK });
    pill(s, col[0], x + 0.3, 2.4, { fill: col[2], fs: 9 });
    let y = 2.98;
    col[1].forEach(item => {
      s.addText(item[0], { x: x + 0.3, y: y, w: 2.6, h: 0.32, fontSize: 13, bold: true, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
      s.addText(item[1], { x: x + 2.9, y: y, w: 2.74, h: 0.32, fontSize: 12, bold: true, color: col[2], align: 'right', valign: 'middle', fontFace: F, margin: 0 });
      s.addText(item[2], { x: x + 0.3, y: y + 0.34, w: 5.34, h: 0.56, fontSize: 10.5, color: GREY, fontFace: F, margin: 0 });
      y += 1.03;
    });
  });
  card(s, M, 6.28, 12.23, 0.62, { fill: TINT, lineC: LINE });
  s.addText(NARRATIVE.versusFooter,
    { x: M + 0.32, y: 6.38, w: 11.6, h: 0.42, fontSize: 11, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 6 · audience delivery
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · DELIVERY', 'What ' + CODE + ' delivers, audience by audience',
    'Index out of 100, and the places on the ground that carry it.');
  let y = 2.1;
  ['children', 'seniors', 'working', 'sandwich', 'youth'].forEach(k => {
    const z = D.zones[k];
    card(s, M, y, 12.23, 0.82);
    s.addText(z.label, { x: M + 0.32, y: y + 0.2, w: 3.1, h: 0.42, fontSize: 14, bold: true, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
    const bw = 3.5 * (z.index / 100);   // zero-based, so the length is honest
    s.addShape(p.ShapeType.roundRect, { x: M + 3.5, y: y + 0.32, w: 3.5, h: 0.18,
      fill: { color: 'EBEFF7' }, rectRadius: 0.09, line: { type: 'none' } });
    s.addShape(p.ShapeType.roundRect, { x: M + 3.5, y: y + 0.32, w: bw, h: 0.18,
      fill: { color: PINK }, rectRadius: 0.09, line: { type: 'none' } });
    s.addText(z.index.toFixed(1), { x: M + 7.12, y: y + 0.2, w: 0.72, h: 0.42, fontSize: 12.5, bold: true, color: PINK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(z.detail, { x: M + 7.95, y: y + 0.2, w: 4.1, h: 0.42, fontSize: 10.5, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    y += 0.9;
  });
  s.addText('Index is relative: 100 = the best of the four sets in that column, not a percentage of the audience reached.',
    { x: M, y: 6.62, w: 11.6, h: 0.35, fontSize: 9.5, italic: true, color: GREY, fontFace: F, margin: 0 });
}

// ============================================================ 7 · sandwich generation
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · SANDWICH GEN', 'The sandwich generation, actually measured',
    'No place layer maps "adult with a child in school and a parent in a clinic". So we measured the corridor instead.');
  const others = D.comparison.filter(c => !c.is_this)
    .sort((a, b) => b.sandwich_stops - a.sandwich_stops)
    .map(c => label(c) + ': ' + c.sandwich_stops)
    .join('   ·   ');
  card(s, M, 2.2, 4.3, 3.3, { fill: NAVY, line: false });
  s.addText(String(D.totals.sandwich_stops), { x: M + 0.3, y: 2.55, w: 3.7, h: 1.3, fontSize: 76, bold: true, color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
  s.addText('stops on ' + CODE + ' with BOTH a child place and a senior place within 400 m',
    { x: M + 0.3, y: 3.9, w: 3.7, h: 1.0, fontSize: 13, color: 'CBD3F2', fontFace: F, margin: 0 });
  s.addText(others, { x: M + 0.3, y: 4.85, w: 3.7, h: 0.35, fontSize: 11, bold: true, color: PINK, fontFace: F, margin: 0 });

  card(s, 5.2, 2.2, 7.58, 3.3);
  s.addText('Why this is the number to trust', { x: 5.52, y: 2.45, w: 6.9, h: 0.36, fontSize: 15, bold: true, color: NAVY, fontFace: F, margin: 0 });
  s.addText(NARRATIVE.sandwichNote, { x: 5.52, y: 2.88, w: 6.9, h: 0.8, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
  s.addText('It is also the only audience of the five that is defined by a behaviour rather than an age band — the caregiving trip, run after work and at the weekend. That is why it drives the dayparting on slide 11.',
    { x: 5.52, y: 3.72, w: 6.9, h: 0.7, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
  s.addText(NARRATIVE.sandwichClose, { x: 5.52, y: 4.5, w: 6.9, h: 0.7, fontSize: 12, bold: true, color: NAVY, fontFace: F, margin: 0 });

  card(s, M, 5.68, 12.23, 0.78, { fill: TINT, lineC: LINE });
  const topZones = D.zones.sandwich.zones.slice(0, 5).map(z => z.area + ' (' + z.places + ')').join(' · ');
  s.addText('Top caregiving zones — ' + topZones,
    { x: M + 0.32, y: 5.82, w: 11.6, h: 0.5, fontSize: 11.5, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 8 · coverage
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · COVERAGE', NARRATIVE.coverageTitle, NARRATIVE.coverageSub);
  const regs = ['Central', 'East', 'North', 'North-East', 'West'];
  const cx0 = 2.5, cw = 2.0, ch = 0.62;
  regs.forEach((r, i) => s.addText(r, { x: cx0 + i * cw, y: 2.05, w: cw, h: 0.36, fontSize: 10.5,
    bold: true, color: GREY, align: 'center', valign: 'middle', fontFace: F, margin: 0 }));
  D.comparison.forEach((row, ri) => {
    const y = 2.5 + ri * (ch + 0.12);
    const mine = row.is_this;
    s.addText(label(row), { x: M, y: y, w: 1.8, h: ch, fontSize: 13, bold: mine,
      color: mine ? PINK : INK, valign: 'middle', fontFace: F, margin: 0 });
    regs.forEach((rg, ci) => {
      const v = row.region[rg + ' Region'] || 0, zero = v < 1;
      const tint = zero ? WHITE : (v >= 35 ? NAVY : v >= 22 ? '4A5BB0' : v >= 12 ? '9AA5D6' : 'DDE2F2');
      s.addShape(p.ShapeType.roundRect, { x: cx0 + ci * cw + 0.06, y: y, w: cw - 0.12, h: ch,
        fill: { color: tint }, rectRadius: 0.07,
        line: zero ? { color: PINK, width: 1.5, dashType: 'dash' } : { type: 'none' } });
      s.addText(v.toFixed(1) + '%', { x: cx0 + ci * cw + 0.06, y: y, w: cw - 0.12, h: ch,
        fontSize: 12, bold: zero || v >= 22, color: zero ? PINK : (v >= 22 ? WHITE : INK),
        align: 'center', valign: 'middle', fontFace: F, margin: 0 });
    });
  });
  card(s, M, 5.52, 12.23, 0.95, { fill: 'FDF0F4', lineC: PINK });
  s.addText(NARRATIVE.coverageNote,
    { x: M + 0.32, y: 5.66, w: 11.6, h: 0.68, fontSize: 12, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 9 · DCO framework
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · DCO', 'One buy, five conversations',
    'The same five buses carry a different message depending on where they are and what hour it is.');
  const steps = [['GEOFENCE', 'Where', 'Each audience has zones along the route where it actually concentrates. Derived from the place data, not drawn by hand — every zone is named and its anchors listed.'],
    ['DAYPART', 'When', 'Each audience is reachable in a different window, set by when the institutions around it are open — school dismissal, polyclinic mornings, commute peaks.'],
    ['CREATIVE', 'What', 'A different line and call-to-action per audience. Seniors get large type and a phone number; youth get a QR to chat.']];
  let x = M;
  steps.forEach((st, i) => {
    card(s, x, 2.2, 3.94, 2.75);
    s.addShape(p.ShapeType.roundRect, { x: x + 0.3, y: 2.48, w: 0.46, h: 0.46,
      fill: { color: i === 1 ? NAVY : PINK }, rectRadius: 0.23, line: { type: 'none' } });
    s.addText(String(i + 1), { x: x + 0.3, y: 2.48, w: 0.46, h: 0.46, fontSize: 13, bold: true,
      color: WHITE, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
    s.addText(st[0], { x: x + 0.92, y: 2.5, w: 2.4, h: 0.28, fontSize: 11, bold: true,
      color: PINK, charSpacing: 1.2, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(st[1], { x: x + 0.92, y: 2.76, w: 2.4, h: 0.28, fontSize: 15, bold: true,
      color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(st[2], { x: x + 0.3, y: 3.25, w: 3.34, h: 1.5, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
    x += 4.15;
  });
  card(s, M, 5.2, 12.23, 1.3, { fill: TINT, lineC: LINE });
  s.addText('What is measured, and what is assumed', { x: M + 0.32, y: 5.34, w: 6.0, h: 0.32,
    fontSize: 12.5, bold: true, color: NAVY, fontFace: F, margin: 0 });
  s.addText('Geofence zones are measured — they come straight from the stop and place data. Dayparts are planning assumptions: this dataset carries weekday and weekend boarding totals, not an hourly curve, so the windows are set from when the institutions in each zone are open. Every daypart slide is marked accordingly.',
    { x: M + 0.32, y: 5.68, w: 11.6, h: 0.7, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
}

// ============================================================ 10 · geofence
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · GEOFENCE', 'Where each audience concentrates',
    'Top zones per audience along ' + CODE + ', derived from the place data. Anchors are the actual sites inside them.');
  pill(s, 'MEASURED', 11.35, 0.36, { fill: NAVY, fs: 9 });
  let y = 2.05;
  ['children', 'seniors', 'working', 'sandwich', 'youth'].forEach(k => {
    const z = D.zones[k];
    card(s, M, y, 12.23, 0.82, { fill: k === 'sandwich' ? 'FDF0F4' : WHITE, lineC: k === 'sandwich' ? PINK : LINE });
    s.addText(z.label, { x: M + 0.28, y: y + 0.08, w: 2.5, h: 0.34, fontSize: 12.5, bold: true,
      color: k === 'sandwich' ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(z.zones.slice(0, 4).map(r => r.area + ' (' + r.places + ')').join('   ·   '),
      { x: M + 0.28, y: y + 0.42, w: 5.3, h: 0.32, fontSize: 10.5, color: INK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText('Anchors — ' + (z.zones[0] ? z.zones[0].anchors.slice(0, 3).join(' · ') : ''),
      { x: 6.3, y: y + 0.2, w: 6.4, h: 0.42, fontSize: 10, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    y += 0.92;
  });
  s.addText('Number in brackets = places of that audience within 400 m of a ' + CODE + ' stop in that planning area.',
    { x: M, y: 6.6, w: 8.4, h: 0.34, fontSize: 9.5, italic: true, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 11 · dayparting
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · DAYPARTING', 'What runs, and when',
    'One creative rotation per audience, set by when the places around the stop are actually open.');
  pill(s, 'PLANNING ASSUMPTION', 10.42, 0.36, { fill: WHITE, fg: GREY, fs: 9, line: { color: GREY, width: 1 } });
  let y = 2.05;
  [['Audience', M + 0.28, 2.3], ['Window', 3.35, 3.0], ['Creative', 6.6, 6.1]].forEach(h =>
    s.addText(h[0], { x: h[1], y: y, w: h[2], h: 0.3, fontSize: 9.5, bold: true, color: GREY, charSpacing: 0.8, fontFace: F, margin: 0 }));
  y += 0.34;
  ['seniors', 'children', 'youth', 'working', 'sandwich'].forEach(k => {
    const z = D.zones[k];
    card(s, M, y, 12.23, 0.72, { fill: k === 'sandwich' ? 'FDF0F4' : WHITE, lineC: k === 'sandwich' ? PINK : LINE });
    s.addText(z.label, { x: M + 0.28, y: y + 0.17, w: 2.6, h: 0.38, fontSize: 12, bold: true,
      color: k === 'sandwich' ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(z.daypart, { x: 3.35, y: y + 0.06, w: 3.15, h: 0.3, fontSize: 10.5, bold: true, color: INK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(z.daypart_why, { x: 3.35, y: y + 0.36, w: 3.15, h: 0.3, fontSize: 9, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(z.creative, { x: 6.6, y: y + 0.17, w: 6.1, h: 0.38, fontSize: 11, color: INK, valign: 'middle', fontFace: F, margin: 0 });
    y += 0.78;
  });
  card(s, M, 6.34, 12.23, 0.56, { fill: TINT, lineC: LINE });
  s.addText('Weekend is not a throwaway: ' + CODE + ' carries ' + (D.totals.we / 1e6).toFixed(2)
    + 'M weekend boardings against ' + (D.totals.wd / 1e6).toFixed(2) + 'M weekday — '
    + Math.round(100 * D.totals.we / D.totals.wd) + '% of the weekday figure.',
    { x: M + 0.32, y: 6.42, w: 11.6, h: 0.4, fontSize: 11, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 12 · by vehicle
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · BY VEHICLE', 'Each bus already leans to an audience',
    'One audience per vehicle, assigned to the bus that carries the largest share of it — so all five are briefed.');
  const AUDK = [['children', 'Chld'], ['seniors', 'Snr'], ['working', 'Wrk'], ['youth', 'Yth'], ['sandwich', 'Sand']];
  const GMAX = Math.max(...D.routes.map(r => Math.max(...Object.values(D.routes_detail[r].profile))));
  let y = 2.15;
  D.routes.forEach(r => {
    const d = D.routes_detail[r], pr = d.profile;
    card(s, M, y, 12.23, 0.80);
    plate(s, r, M + 0.26, y + 0.18, { w: 0.86, h: 0.44, fs: 15 });
    s.addText(d.name, { x: M + 1.26, y: y + 0.08, w: 4.3, h: 0.3, fontSize: 10.5, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(d.lead.label, { x: M + 1.26, y: y + 0.40, w: 2.4, h: 0.32, fontSize: 12.5, bold: true, color: PINK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(d.lead.count + ' places · ' + Math.round(d.lead.share * 100) + '% of the package',
      { x: M + 3.7, y: y + 0.40, w: 3.1, h: 0.32, fontSize: 10, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    let bx = 7.5;
    AUDK.forEach(kk => {
      const v = pr[kk[0]], hgt = Math.max(0.05, 0.40 * v / GMAX);
      s.addShape(p.ShapeType.rect, { x: bx, y: y + 0.16 + (0.40 - hgt), w: 0.42, h: hgt,
        fill: { color: kk[0] === d.lead.audience ? PINK : NAVY }, line: { type: 'none' } });
      s.addText(String(v), { x: bx - 0.09, y: y + 0.57, w: 0.6, h: 0.2, fontSize: 8, color: GREY, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
      s.addText(kk[1], { x: bx - 0.09, y: y + 0.01, w: 0.6, h: 0.16, fontSize: 7, color: GREY, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
      bx += 0.62;
    });
    s.addText(d.stops + ' stops', { x: 11.35, y: y + 0.23, w: 1.35, h: 0.34, fontSize: 10.5, bold: true, color: INK, align: 'right', valign: 'middle', fontFace: F, margin: 0 });
    y += 0.88;
  });
  s.addText('Bars are place counts within 400 m of that route’s stops, on one scale across all five. Pink marks the audience that bus is briefed for.',
    { x: M, y: 6.6, w: 9.9, h: 0.34, fontSize: 9.5, italic: true, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 13 · limits
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, CODE + ' · LIMITS', 'What we are not claiming',
    'Where this plan is weak, on the same slide that says it is strong.');
  const items = NARRATIVE.limits;
  const pitch = items.length > 4 ? 0.94 : 1.16, boxH = items.length > 4 ? 0.86 : 1.06;
  let y = 2.1;
  items.forEach((it, i) => {
    card(s, M, y, 12.23, boxH, { fill: i === 0 ? 'FDF0F4' : WHITE, lineC: i === 0 ? PINK : LINE });
    s.addText(it[0], { x: M + 0.32, y: y + 0.1, w: 11.5, h: 0.32, fontSize: 12.5, bold: true,
      color: i === 0 ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(it[1], { x: M + 0.32, y: y + 0.42, w: 11.5, h: boxH - 0.5, fontSize: 10.5, color: GREY, valign: 'top', fontFace: F, margin: 0 });
    y += pitch;
  });
}

// ============================================================ 14 · next steps
{
  const s = p.addSlide(); s.background = { color: NAVY };
  pageNo++;
  s.addShape(p.ShapeType.roundRect, { x: 9.1, y: 2.3, w: 6.6, h: 6.6, fill: { color: DEEP }, rectRadius: 3.3, line: { type: 'none' } });
  pill(s, CODE + ' · NEXT', M, 0.55);
  s.addText((D.stance === 'recommended' ? 'Recommended: ' : 'The alternative: ') + CODE,
    { x: M - 0.02, y: 1.1, w: 9.5, h: 0.85, fontSize: 40, bold: true, color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
  let x = M;
  D.routes.forEach(r => { x += plate(s, r, x, 2.15, { fill: WHITE, line: WHITE, fg: NAVY, w: 0.92, h: 0.55, fs: 19 }) + 0.14; });
  let y = 3.1;
  NARRATIVE.next.forEach((st, i) => {
    s.addShape(p.ShapeType.roundRect, { x: M, y: y, w: 0.44, h: 0.44, fill: { color: PINK }, rectRadius: 0.22, line: { type: 'none' } });
    s.addText(String(i + 1), { x: M, y: y, w: 0.44, h: 0.44, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
    s.addText(st[0], { x: M + 0.62, y: y - 0.02, w: 7.6, h: 0.32, fontSize: 14, bold: true, color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(st[1], { x: M + 0.62, y: y + 0.3, w: 7.6, h: 0.5, fontSize: 11, color: '9BA7D8', valign: 'top', fontFace: F, margin: 0 });
    y += 0.92;
  });
  s.addText('Reproduce every figure in this deck — python3 tools/mindline_eval.py · tools/package_dco.py "' + CODE + '"',
    { x: M, y: 6.58, w: 8.8, h: 0.34, fontSize: 9.5, italic: true, color: '7C87BC', valign: 'middle', fontFace: F, margin: 0 });
  footer(s, true);
}

p.writeFile({ fileName: process.argv[3] }).then(f => console.log('wrote', f));
