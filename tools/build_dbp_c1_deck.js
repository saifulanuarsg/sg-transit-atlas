// DBP C1 — mindline.sg hotline sell-in deck.
// Brand constants are the repo's own (index.html BRAND): pink F0245E, navy 1B2D8A,
// wordmark MOOVE MEDIA. Body face is Arial rather than the app's Inter so the deck
// renders true-to-width everywhere and on any client machine without a font install.
const pptxgen = require('pptxgenjs');
const fs = require('fs');

const D = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

const PINK = 'F0245E', NAVY = '1B2D8A', INK = '14204A', GREY = '5A6484',
      LINE = 'D8DDE9', TINT = 'F5F7FC', WHITE = 'FFFFFF', DEEP = '111A3E';
const F = 'Arial';

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';            // 13.33 x 7.5 — must precede any addSlide
p.author = 'Moove Media';
p.company = 'Moove Media';
p.title = 'DBP C1 — mindline.sg hotline';

const W = 13.33, H = 7.5, M = 0.55;
let pageNo = 0;

// ---- the motif: a pink pill carrying the package code, on every slide ----
function pill(s, text, x, y, opts) {
  opts = opts || {};
  const fill = opts.fill || PINK, fg = opts.fg || WHITE;
  const w = opts.w || Math.max(1.0, text.length * 0.102 + 0.36);
  const h = opts.h || 0.34;
  const shape = { x: x, y: y, w: w, h: h, fill: { color: fill }, line: opts.line || { type: 'none' }, rectRadius: h / 2 };
  s.addShape(p.ShapeType.roundRect, shape);
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

function chrome(s, eyebrow, title, sub, dark) {
  pageNo++;
  pill(s, eyebrow, M, 0.36);
  s.addText(title, { x: M - 0.02, y: 0.82, w: 11.6, h: 0.62, fontSize: 30, bold: true,
    color: dark ? WHITE : NAVY, valign: 'middle', fontFace: F, margin: 0 });
  if (sub) s.addText(sub, { x: M - 0.02, y: 1.44, w: 11.4, h: 0.4, fontSize: 12.5,
    color: dark ? 'B9C2E8' : GREY, valign: 'top', fontFace: F, margin: 0 });
  s.addText('MOOVE MEDIA', { x: 10.35, y: 7.03, w: 2.43, h: 0.34, fontSize: 11.5, bold: true,
    italic: true, color: dark ? WHITE : NAVY, align: 'right', valign: 'middle',
    charSpacing: 1, fontFace: F, margin: 0 });
  s.addText(String(pageNo), { x: M - 0.02, y: 7.03, w: 0.6, h: 0.34, fontSize: 10,
    color: dark ? '7C87BC' : GREY, valign: 'middle', fontFace: F, margin: 0 });
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
  pill(s, 'RECOMMENDED BUY', M, 0.95, { fill: PINK });
  s.addText('DBP C1', { x: M - 0.03, y: 1.5, w: 8.4, h: 1.5, fontSize: 76, bold: true,
    color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
  s.addText('Five routes for the mindline.sg hotline', { x: M - 0.02, y: 3.0, w: 8.0, h: 0.5,
    fontSize: 19, color: 'CBD3F2', valign: 'middle', fontFace: F, margin: 0 });
  let x = M;
  D.routes.forEach(r => { x += plate(s, r, x, 3.72, { fill: WHITE, line: WHITE, fg: NAVY, w: 1.02, h: 0.62, fs: 21 }) + 0.16; });
  s.addText('Chosen from four candidate sets, scored against the five audiences the campaign named.',
    { x: M - 0.02, y: 4.66, w: 7.4, h: 0.6, fontSize: 13, color: '9BA7D8', fontFace: F, margin: 0 });

  const stats = [[D.totals.stops.toLocaleString(), 'bus stops'],
                 [(D.totals.wd / 1e6).toFixed(2) + 'M', 'weekday boardings'],
                 [String(D.totals.areas), 'planning areas'],
                 [String(D.totals.sandwich_stops), 'caregiving corridors']];
  let sx = M;
  stats.forEach(st => {
    s.addText(st[0], { x: sx, y: 5.45, w: 2.0, h: 0.5, fontSize: 25, bold: true, color: PINK, fontFace: F, margin: 0 });
    s.addText(st[1], { x: sx, y: 5.95, w: 2.0, h: 0.34, fontSize: 10, color: '9BA7D8', fontFace: F, margin: 0 });
    sx += 2.05;
  });
  s.addText('MOOVE MEDIA', { x: 10.35, y: 7.03, w: 2.43, h: 0.34, fontSize: 11.5, bold: true,
    italic: true, color: WHITE, align: 'right', valign: 'middle', charSpacing: 1, fontFace: F, margin: 0 });
  s.addText(String(pageNo), { x: M - 0.02, y: 7.03, w: 0.6, h: 0.34, fontSize: 10, color: '7C87BC', valign: 'middle', fontFace: F, margin: 0 });
  s.addNotes('DBP C1 is Set 2 of the Five-route sets product: 190, 70, 133, 198, 85.');
}

// ============================================================ 2 · the brief
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · MINDLINE.SG', 'Five audiences, one hotline',
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
  chrome(s, 'DBP C1 · METHOD', 'How the four sets were scored',
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
  chrome(s, 'DBP C1 · SHORTLIST', 'Four sets, scored side by side',
    'Overall index — the mean of the five audience columns. Best set in each column = 100.');
  s.addChart(p.ChartType.bar, [{ name: 'Overall index',
      labels: ['Set 4', 'Set 3', 'DBP C1 (Set 2)', 'Set 1'], values: [82.9, 93.3, 93.8, 80.9] }],
    { x: M, y: 2.05, w: 6.5, h: 4.0, barDir: 'bar', chartColors: [NAVY, NAVY, PINK, NAVY],
      showTitle: false, showLegend: false, showValue: true, dataLabelPosition: 'outEnd',
      dataLabelFormatCode: '0.0',
      dataLabelColor: INK, dataLabelFontSize: 11, dataLabelFontBold: true, dataLabelFontFace: F,
      valAxisMaxVal: 105, valAxisMinVal: 0, catAxisLabelColor: INK, catAxisLabelFontSize: 11,
      catAxisLabelFontFace: F, valAxisLabelColor: GREY, valAxisLabelFontSize: 9.5,
      valAxisLabelFontFace: F, valGridLine: { color: LINE, size: 1 },
      catGridLine: { style: 'none' }, barGapWidthPct: 55 });

  const rows = [['', 'Child', 'Senior', 'Work', 'Sand.', 'Youth'],
    ['Set 1', '92.7', '67.4', '82.2', '74.8', '87.2'],
    ['DBP C1', '96.5', '90.6', '92.9', '92.7', '96.4'],
    ['Set 3', '95.2', '97.7', '86.8', '93.9', '92.7'],
    ['Set 4', '92.2', '70.4', '88.9', '77.8', '85.2']];
  const tx = 7.35, colW = [1.35, 0.92, 0.98, 0.9, 0.9, 0.93];
  let ty = 2.05;
  rows.forEach((r, ri) => {
    const hl = ri === 2;
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
  s.addText('Set 3 scores within half a point of DBP C1 — and on the index alone the two swap places depending on how you weight them. The score does not separate them. Slide 8 does.',
    { x: tx + 0.12, y: 5.0, w: 5.4, h: 0.9, fontSize: 11, color: GREY, fontFace: F, margin: 0 });
}

// ============================================================ 5 · why the others lost
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · REJECTED', 'Why the other three lost',
    'A winner with no losers is a sales claim. Here is what each rejected set actually fails at.');
  const losers = [
    ['Set 1', '80.9', 'Seniors 67.4 — the weakest column in the whole evaluation. Passes 19 eldercare facilities against DBP C1’s 37, barely half. Its one virtue is balance: it is the most evenly spread set of the four.'],
    ['Set 3', '93.3', 'Scores level with DBP C1 and leads on senior volume. But it reaches no part of the North Region at all, and 6% of its stops are duplicates — inventory paid for twice.'],
    ['Set 4', '82.9', 'Seniors 70.4 and the fewest caregiving corridors relative to its size. Carries the most malls (129) but the thinnest daytime corridors. Reaches the North at 0.3%.']];
  let x = M;
  losers.forEach(l => {
    card(s, x, 2.15, 3.94, 3.3);
    s.addText(l[0], { x: x + 0.3, y: 2.4, w: 2.2, h: 0.42, fontSize: 20, bold: true, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(l[1], { x: x + 2.3, y: 2.4, w: 1.34, h: 0.42, fontSize: 16, bold: true, color: GREY, align: 'right', valign: 'middle', fontFace: F, margin: 0 });
    s.addShape(p.ShapeType.line, { x: x + 0.3, y: 2.94, w: 3.34, h: 0, line: { color: LINE, width: 1 } });
    s.addText(l[2], { x: x + 0.3, y: 3.08, w: 3.34, h: 2.1, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
    x += 4.15;
  });
  card(s, M, 5.68, 12.23, 0.78, { fill: TINT, lineC: LINE });
  s.addText('Tested under six different weightings. Sets 1 and 4 lose under all six — that part is settled, not a judgement call.',
    { x: M + 0.32, y: 5.82, w: 11.6, h: 0.5, fontSize: 11.5, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 6 · by audience
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · DELIVERY', 'What DBP C1 delivers, audience by audience',
    'Index out of 100, and the places on the ground that carry it.');
  const rows = [
    ['Young children', '96.5', '45 primary schools · 67 student-care centres'],
    ['Seniors', '90.6', '37 eldercare · 39 community clubs · 9 polyclinics'],
    ['Working adults', '92.9', '21 MRT/LRT interchanges · 114 malls'],
    ['Sandwich generation', '92.7', '99 stops with a school and a senior place inside 400 m'],
    ['Youth', '96.4', '33 secondary · 3 JCs · 19 SportSG · 18 cinemas · 14 libraries']];
  let y = 2.1;
  rows.forEach(r => {
    card(s, M, y, 12.23, 0.82);
    s.addText(r[0], { x: M + 0.32, y: y + 0.2, w: 3.1, h: 0.42, fontSize: 14, bold: true, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
    // index bar — zero-based, so the length is honest
    const bw = 3.5 * (parseFloat(r[1]) / 100);
    s.addShape(p.ShapeType.roundRect, { x: M + 3.5, y: y + 0.32, w: 3.5, h: 0.18,
      fill: { color: 'EBEFF7' }, rectRadius: 0.09, line: { type: 'none' } });
    s.addShape(p.ShapeType.roundRect, { x: M + 3.5, y: y + 0.32, w: bw, h: 0.18,
      fill: { color: PINK }, rectRadius: 0.09, line: { type: 'none' } });
    s.addText(r[1], { x: M + 7.12, y: y + 0.2, w: 0.72, h: 0.42, fontSize: 12.5, bold: true, color: PINK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(r[2], { x: M + 7.95, y: y + 0.2, w: 4.1, h: 0.42, fontSize: 10.5, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    y += 0.9;
  });
  s.addText('Index is relative: 100 = the best of the four sets in that column, not a percentage of the audience reached.',
    { x: M, y: 6.62, w: 11.6, h: 0.35, fontSize: 9.5, italic: true, color: GREY, fontFace: F, margin: 0 });
}

// ============================================================ 7 · sandwich
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · SANDWICH GEN', 'The sandwich generation, actually measured',
    'No place layer maps "adult with a child in school and a parent in a clinic". So we measured the corridor instead.');
  card(s, M, 2.2, 4.3, 3.3, { fill: NAVY, line: false });
  s.addText('99', { x: M + 0.3, y: 2.55, w: 3.7, h: 1.3, fontSize: 76, bold: true, color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
  s.addText('stops on DBP C1 with BOTH a child place and a senior place within 400 m',
    { x: M + 0.3, y: 3.9, w: 3.7, h: 1.0, fontSize: 13, color: 'CBD3F2', fontFace: F, margin: 0 });
  s.addText('Set 3: 87   ·   Set 4: 84   ·   Set 1: 77',
    { x: M + 0.3, y: 4.85, w: 3.7, h: 0.35, fontSize: 11, bold: true, color: PINK, fontFace: F, margin: 0 });

  card(s, 5.2, 2.2, 7.58, 3.3);
  s.addText('Why this is the number to trust', { x: 5.52, y: 2.45, w: 6.9, h: 0.36, fontSize: 15, bold: true, color: NAVY, fontFace: F, margin: 0 });
  s.addText([
    { text: 'A long route cannot fake it. ', options: { bold: true, breakLine: false } },
    { text: 'Coverage metrics reward length — run a bus far enough and it passes more of everything. This one does not work that way: the two land uses have to physically coincide at the same stop.', options: { breakLine: true } },
  ], { x: 5.52, y: 2.88, w: 6.9, h: 0.8, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
  s.addText('It is also the only audience of the five that is defined by a behaviour rather than an age band — the caregiving trip, run after work and at the weekend. That is why it drives the dayparting on slide 11.',
    { x: 5.52, y: 3.72, w: 6.9, h: 0.7, fontSize: 11.5, color: GREY, fontFace: F, margin: 0 });
  s.addText('DBP C1 carries 0.250 caregiving stops per stop bought — the highest of the four sets, and 34% ahead of Set 3.',
    { x: 5.52, y: 4.5, w: 6.9, h: 0.7, fontSize: 12, bold: true, color: NAVY, fontFace: F, margin: 0 });

  card(s, M, 5.68, 12.23, 0.78, { fill: TINT, lineC: LINE });
  // derived, not typed — slide 10 lists the same zones and the two must not disagree
  const topZones = D.zones.sandwich.zones.slice(0, 5).map(z => z.area + ' (' + z.places + ')').join(' · ');
  s.addText('Top caregiving zones — ' + topZones,
    { x: M + 0.32, y: 5.82, w: 11.6, h: 0.5, fontSize: 11.5, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 8 · the decider
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · COVERAGE', 'A national hotline needs national coverage',
    'The audience index counts seniors — but not where they live. This is what it could not see.');
  const regs = ['Central', 'East', 'North', 'North-East', 'West'];
  const data = [['Set 1', [24.0, 28.9, 13.6, 23.0, 10.5]], ['DBP C1', [39.0, 0.0, 7.8, 26.1, 27.1]],
                ['Set 3', [46.2, 28.8, 0.0, 12.5, 12.6]], ['Set 4', [37.5, 11.7, 0.3, 36.0, 14.6]]];
  const cx0 = 2.5, cw = 2.0, ch = 0.62;
  regs.forEach((r, i) => s.addText(r, { x: cx0 + i * cw, y: 2.05, w: cw, h: 0.36, fontSize: 10.5,
    bold: true, color: GREY, align: 'center', valign: 'middle', fontFace: F, margin: 0 }));
  data.forEach((row, ri) => {
    const y = 2.5 + ri * (ch + 0.12);
    const isC1 = ri === 1;
    s.addText(row[0], { x: M, y: y, w: 1.8, h: ch, fontSize: 13, bold: isC1,
      color: isC1 ? PINK : INK, valign: 'middle', fontFace: F, margin: 0 });
    row[1].forEach((v, ci) => {
      const zero = v < 1;
      const tint = zero ? 'FFFFFF' : (v >= 35 ? NAVY : v >= 22 ? '4A5BB0' : v >= 12 ? '9AA5D6' : 'DDE2F2');
      s.addShape(p.ShapeType.roundRect, { x: cx0 + ci * cw + 0.06, y: y, w: cw - 0.12, h: ch,
        fill: { color: tint }, rectRadius: 0.07,
        line: zero ? { color: PINK, width: 1.5, dashType: 'dash' } : { type: 'none' } });
      s.addText(v.toFixed(1) + '%', { x: cx0 + ci * cw + 0.06, y: y, w: cw - 0.12, h: ch,
        fontSize: 12, bold: zero || v >= 22, color: zero ? PINK : (v >= 22 ? WHITE : INK),
        align: 'center', valign: 'middle', fontFace: F, margin: 0 });
    });
  });
  card(s, M, 5.52, 12.23, 0.95, { fill: 'FDF0F4', lineC: PINK });
  s.addText('Only two routes in the entire twenty-route pool reach the North: 117 and 85. Sets 3 and 4 contain neither — so Woodlands, Sembawang and Yishun would see nothing. DBP C1 carries 85. That, not the score, is why it is the recommendation.',
    { x: M + 0.32, y: 5.66, w: 11.6, h: 0.68, fontSize: 12, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 9 · DCO framework
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · DCO', 'One buy, five conversations',
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

// ============================================================ 10 · geofence zones
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · GEOFENCE', 'Where each audience concentrates',
    'Top zones per audience along DBP C1, derived from the place data. Anchors are the actual sites inside them.');
  pill(s, 'MEASURED', 11.35, 0.36, { fill: NAVY, fs: 9 });
  const order = ['children', 'seniors', 'working', 'sandwich', 'youth'];
  let y = 2.05;
  order.forEach(k => {
    const z = D.zones[k];
    card(s, M, y, 12.23, 0.82, { fill: k === 'sandwich' ? 'FDF0F4' : WHITE, lineC: k === 'sandwich' ? PINK : LINE });
    s.addText(z.label, { x: M + 0.28, y: y + 0.08, w: 2.5, h: 0.34, fontSize: 12.5, bold: true,
      color: k === 'sandwich' ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    const zs = z.zones.slice(0, 4).map(r => r.area + ' (' + r.places + ')').join('   ·   ');
    s.addText(zs, { x: M + 0.28, y: y + 0.42, w: 5.3, h: 0.32, fontSize: 10.5, color: INK, valign: 'middle', fontFace: F, margin: 0 });
    const anch = (z.zones[0] ? z.zones[0].anchors.slice(0, 3).join(' · ') : '');
    s.addText('Anchors — ' + anch, { x: 6.3, y: y + 0.2, w: 6.4, h: 0.42, fontSize: 10,
      color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    y += 0.92;
  });
  s.addText('Number in brackets = places of that audience within 400 m of a DBP C1 stop in that planning area.',
    { x: M, y: 6.6, w: 8.4, h: 0.34, fontSize: 9.5, italic: true, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 11 · dayparting
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · DAYPARTING', 'What runs, and when',
    'One creative rotation per audience, set by when the places around the stop are actually open.');
  pill(s, 'PLANNING ASSUMPTION', 10.42, 0.36, { fill: WHITE, fg: GREY, fs: 9, line: { color: GREY, width: 1 } });
  const order = ['seniors', 'children', 'youth', 'working', 'sandwich'];
  let y = 2.05;
  s.addText('Audience', { x: M + 0.28, y: y, w: 2.3, h: 0.3, fontSize: 9.5, bold: true, color: GREY, charSpacing: 0.8, fontFace: F, margin: 0 });
  s.addText('Window', { x: 3.35, y: y, w: 3.0, h: 0.3, fontSize: 9.5, bold: true, color: GREY, charSpacing: 0.8, fontFace: F, margin: 0 });
  s.addText('Creative', { x: 6.6, y: y, w: 6.1, h: 0.3, fontSize: 9.5, bold: true, color: GREY, charSpacing: 0.8, fontFace: F, margin: 0 });
  y += 0.34;
  order.forEach(k => {
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
  s.addText('Weekend is not a throwaway: DBP C1 carries 1.18M weekend boardings against 1.19M weekday — 99% of the weekday figure.',
    { x: M + 0.32, y: 6.42, w: 11.6, h: 0.4, fontSize: 11, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 12 · creative by vehicle
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · BY VEHICLE', 'Each bus already leans to an audience',
    'Place counts differ sharply by route, so the lead creative can be assigned per vehicle rather than per campaign.');
  const lead = { '190': ['Working adults', 'CBD corridor · 62 workplace places'],
                 '70': ['Youth', 'Yio Chu Kang–Shenton Way · 23 youth'],
                 '133': ['Seniors', 'Ang Mo Kio spine · 27 senior places'],
                 '198': ['Sandwich generation', 'Boon Lay–Bt Merah · 26 caregiving'],
                 '85': ['Young children', 'Punggol–Yishun · 33 child, 28 caregiving'] };
  // one scale across all five routes — a per-route scale would draw 33 as tall as 62
  const GMAX = Math.max(...D.routes.map(r => Math.max(...Object.values(D.routes_detail[r].profile))));
  let y = 2.15;
  D.routes.forEach(r => {
    const d = D.routes_detail[r], pr = d.profile;
    card(s, M, y, 12.23, 0.80);
    plate(s, r, M + 0.26, y + 0.18, { w: 0.86, h: 0.44, fs: 15 });
    s.addText(d.name, { x: M + 1.26, y: y + 0.08, w: 4.3, h: 0.3, fontSize: 10.5, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(lead[r][0], { x: M + 1.26, y: y + 0.40, w: 2.4, h: 0.32, fontSize: 12.5, bold: true, color: PINK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(lead[r][1], { x: M + 3.7, y: y + 0.40, w: 3.1, h: 0.32, fontSize: 10, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    // profile bars
    const keys = [['children', 'Chld'], ['seniors', 'Snr'], ['working', 'Wrk'], ['youth', 'Yth'], ['sandwich', 'Sand']];
    let bx = 7.5;
    keys.forEach(kk => {
      const v = pr[kk[0]], hgt = Math.max(0.05, 0.40 * v / GMAX);
      s.addShape(p.ShapeType.rect, { x: bx, y: y + 0.16 + (0.40 - hgt), w: 0.42, h: hgt,
        fill: { color: kk[0] === 'sandwich' ? PINK : NAVY }, line: { type: 'none' } });
      s.addText(String(v), { x: bx - 0.09, y: y + 0.57, w: 0.6, h: 0.2, fontSize: 8, color: GREY, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
      s.addText(kk[1], { x: bx - 0.09, y: y + 0.01, w: 0.6, h: 0.16, fontSize: 7, color: GREY, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
      bx += 0.62;
    });
    s.addText(d.stops + ' stops', { x: 11.35, y: y + 0.23, w: 1.35, h: 0.34, fontSize: 10.5, bold: true, color: INK, align: 'right', valign: 'middle', fontFace: F, margin: 0 });
    y += 0.88;
  });
  s.addText('Bars are place counts within 400 m of that route’s stops, on one scale across all five. Lead creative = the audience that route over-indexes on.',
    { x: M, y: 6.6, w: 9.4, h: 0.34, fontSize: 9.5, italic: true, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 13 · caveats
{
  const s = p.addSlide(); s.background = { color: WHITE };
  chrome(s, 'DBP C1 · LIMITS', 'What we are not claiming',
    'Where this plan is weak, on the same slide that says it is strong.');
  const items = [
    ['DBP C1 has no East Region coverage', 'No Bedok, Tampines or Pasir Ris. It is the mirror image of Set 3’s northern gap. If the campaign runs two flights, DBP C1 then Set 1 covers the country far better than DBP C1 twice.'],
    ['Boardings are not impressions', 'The volume data counts people boarding at a stop. A bus ad is seen along the whole corridor by people who never board. It is a sound basis for comparing sets — it is not a reach guarantee, and we will not quote it as one.'],
    ['Cohort shares are area averages', 'They say a stop sits in a senior-dense town, not that the queue at that stop is old.'],
    ['Dayparts are assumptions, not measurements', 'Set from institution operating hours. If hourly boarding data can be licensed from LTA, these windows should be re-derived from it before the second flight.']];
  let y = 2.1;
  items.forEach((it, i) => {
    card(s, M, y, 12.23, 1.06, { fill: i === 0 ? 'FDF0F4' : WHITE, lineC: i === 0 ? PINK : LINE });
    s.addText(it[0], { x: M + 0.32, y: y + 0.14, w: 11.5, h: 0.34, fontSize: 13, bold: true,
      color: i === 0 ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(it[1], { x: M + 0.32, y: y + 0.48, w: 11.5, h: 0.48, fontSize: 11, color: GREY, valign: 'top', fontFace: F, margin: 0 });
    y += 1.16;
  });
}

// ============================================================ 14 · next steps
{
  const s = p.addSlide(); s.background = { color: NAVY };
  pageNo++;
  s.addShape(p.ShapeType.roundRect, { x: 9.1, y: 2.3, w: 6.6, h: 6.6, fill: { color: DEEP }, rectRadius: 3.3, line: { type: 'none' } });
  pill(s, 'DBP C1 · NEXT', M, 0.55);
  s.addText('Recommended: DBP C1', { x: M - 0.02, y: 1.1, w: 9.5, h: 0.85, fontSize: 40, bold: true, color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
  let x = M;
  D.routes.forEach(r => { x += plate(s, r, x, 2.15, { fill: WHITE, line: WHITE, fg: NAVY, w: 0.92, h: 0.55, fs: 19 }) + 0.14; });
  const steps = [['Confirm the flight', 'Six-week minimum on all five routes; weekend weight held at parity with weekday.'],
    ['Brief five creative variants', 'One per audience, per the dayparting on slide 11. Seniors and youth are the two that cannot share artwork.'],
    ['Fill the East gap', 'Either add Set 1 as a second flight, or swap one route to pick up Bedok and Tampines.'],
    ['Re-derive dayparts', 'If hourly boarding data can be licensed, replace the assumed windows before flight two.']];
  let y = 3.1;
  steps.forEach((st, i) => {
    s.addShape(p.ShapeType.roundRect, { x: M, y: y, w: 0.44, h: 0.44, fill: { color: PINK }, rectRadius: 0.22, line: { type: 'none' } });
    s.addText(String(i + 1), { x: M, y: y, w: 0.44, h: 0.44, fontSize: 12, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
    s.addText(st[0], { x: M + 0.62, y: y - 0.02, w: 7.6, h: 0.32, fontSize: 14, bold: true, color: WHITE, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(st[1], { x: M + 0.62, y: y + 0.3, w: 7.6, h: 0.5, fontSize: 11, color: '9BA7D8', valign: 'top', fontFace: F, margin: 0 });
    y += 0.92;
  });
  s.addText('Reproduce every figure in this deck — python3 tools/mindline_eval.py · tools/dbp_c1_dco.py',
    { x: M, y: 6.58, w: 8.6, h: 0.34, fontSize: 9.5, italic: true, color: '7C87BC', valign: 'middle', fontFace: F, margin: 0 });
  s.addText('MOOVE MEDIA', { x: 10.35, y: 7.03, w: 2.43, h: 0.34, fontSize: 11.5, bold: true, italic: true,
    color: WHITE, align: 'right', valign: 'middle', charSpacing: 1, fontFace: F, margin: 0 });
  s.addText(String(pageNo), { x: M - 0.02, y: 7.03, w: 0.6, h: 0.34, fontSize: 10, color: '7C87BC', valign: 'middle', fontFace: F, margin: 0 });
}

p.writeFile({ fileName: process.argv[3] }).then(f => console.log('wrote', f));
