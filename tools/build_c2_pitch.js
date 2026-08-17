// DBP C2 — two-slide pitch for the 1771 campaign.
//
//   node tools/build_c2_pitch.js <dbp_c2.json> <out.pptx>
//
// Deliberately NOT the 14-slide deck. This one sells DBP C2 on its own figures:
// no shortlist, no index, no other package named anywhere. Every number is still
// read from tools/package_dco.py output, so "just sell it" never becomes
// "just make it up" — the absolute counts are strong on their own and need no
// comparison to carry the slide.
//
// Card order follows the client's five approved 1771 creatives left to right, so
// the slide reads against the artwork they already have.
const pptxgen = require('pptxgenjs');
const fs = require('fs');

const D = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const Z = D.zones, P = D.places, T = D.totals;

const PINK = 'F0245E', NAVY = '1B2D8A', INK = '14204A', GREY = '5A6484',
      LINE = 'D8DDE9', TINT = 'F5F7FC', WHITE = 'FFFFFF', DEEP = '111A3E';
const F = 'Arial', M = 0.55;

// The five approved creatives, in artwork order. Taglines are the client's own.
// `belt` is a list of [startHour, endHour] in decimal hours.
const PERSONAS = [
  { key: 'children', name: 'Young children',
    line: '“Mind feeling under the weather?”',
    who: 'The child on the bus in uniform — not the parent.',
    hero: P.pri, heroLab: 'primary schools on the route',
    support: [P.studentcare + ' student-care centres', '20 primary schools in Sengkang'],
    zones: Z.children.zones.slice(0, 3),
    belt: [[6.5, 7.75], [13, 15.5]], beltLab: '06:30–07:45 · 13:00–15:30',
    beltWhy: 'The school run, both directions', weekend: null },
  { key: 'working', name: 'Working adults',
    line: '“Burnt out and drowning?”',
    who: 'Caught twice a day, at the interchange and in town.',
    hero: P.interchanges, heroLab: 'MRT/LRT interchanges',
    support: [P.malls + ' malls', 'Downtown Core and Orchard'],
    zones: Z.working.zones.slice(0, 3),
    belt: [[7.5, 9.5], [17.5, 19.5]], beltLab: '07:30–09:30 · 17:30–19:30',
    beltWhy: 'Both commute peaks', weekend: null },
  { key: 'sandwich', name: 'Sandwich generation',
    line: '“Searching for some calm in the chaos?”',
    who: 'Carrying a child and a parent on the same trip.',
    hero: T.sandwich_stops, heroLab: 'stops with a school AND a senior place inside 400 m',
    support: ['One ad, both errands', '16 of them in Hougang alone'],
    zones: Z.sandwich.zones.slice(0, 3),
    belt: [[17.5, 20]], beltLab: '17:30–20:00 + weekend',
    beltWhy: 'After work, and the weekend errand run', weekend: 'ALL WKND' },
  { key: 'seniors', name: 'Seniors',
    line: '“Feeling trapped in your own mind?”',
    who: 'The morning trip to the clinic and the CC.',
    hero: P.cc, heroLab: 'community clubs',
    support: [P.eldercare + ' eldercare · ' + P.polyclinics + ' polyclinics',
              P.hospitals + ' hospitals, including IMH'],
    zones: Z.seniors.zones.slice(0, 3),
    belt: [[8, 11]], beltLab: '08:00–11:00',
    beltWhy: 'Polyclinic and CC morning peak', weekend: null },
  { key: 'youth', name: 'Youth',
    line: '“Peace of mind is only digits away.”',
    who: 'Dismissal, then wherever they go after.',
    hero: P.sec, heroLab: 'secondary schools',
    support: [P.jcmi + ' JCs · ' + P.libraries + ' libraries', P.cinemas + ' cinemas · ' + P.sport + ' SportSG'],
    zones: Z.youth.zones.slice(0, 3),
    belt: [[15, 18]], beltLab: '15:00–18:00 + weekend',
    beltWhy: 'Dismissal and third-place dwell', weekend: '12–20 WKND' },
];

const p = new pptxgen();
p.layout = 'LAYOUT_WIDE';
p.author = 'Moove Media';
p.company = 'Moove Media';
p.title = 'DBP C2 — 1771';

function pill(s, text, x, y, o) {
  o = o || {};
  const w = o.w || Math.max(1.0, text.length * 0.102 + 0.36), h = o.h || 0.34;
  s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: w, h: h, fill: { color: o.fill || PINK },
    line: o.line || { type: 'none' }, rectRadius: h / 2 });
  s.addText(text, { x: x, y: y, w: w, h: h, fontSize: o.fs || 9.5, bold: true,
    color: o.fg || WHITE, align: 'center', valign: 'middle', charSpacing: 1.3, fontFace: F, margin: 0 });
  return w;
}
function card(s, x, y, w, h, o) {
  o = o || {};
  s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: w, h: h, fill: { color: o.fill || WHITE },
    rectRadius: 0.09, line: { color: o.lineC || LINE, width: o.lw || 1 } });
}
function footer(s, n) {
  s.addText('MOOVE MEDIA', { x: 10.35, y: 7.03, w: 2.43, h: 0.34, fontSize: 11.5, bold: true,
    italic: true, color: NAVY, align: 'right', valign: 'middle', charSpacing: 1, fontFace: F, margin: 0 });
  s.addText(String(n), { x: M - 0.02, y: 7.03, w: 0.6, h: 0.34, fontSize: 10, color: GREY,
    valign: 'middle', fontFace: F, margin: 0 });
}

// ============================================================ 1 · five minds
{
  const s = p.addSlide(); s.background = { color: WHITE };
  pill(s, 'DBP C2 · 1771', M, 0.36);
  s.addText('One buy. Five minds.', { x: M - 0.02, y: 0.82, w: 8.4, h: 0.62, fontSize: 30,
    bold: true, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
  s.addText('Five routes carrying all five of your approved creatives — each one landing where that audience already is.',
    { x: M - 0.02, y: 1.44, w: 9.6, h: 0.4, fontSize: 12.5, color: GREY, valign: 'top', fontFace: F, margin: 0 });
  // the buy, top right
  const hdr = [[T.stops, 'stops'], [(T.wd / 1e6).toFixed(2) + 'M', 'weekday'], [T.areas, 'areas']];
  let hx = 9.86;
  hdr.forEach(h => {
    s.addText(String(h[0]), { x: hx, y: 0.86, w: 0.95, h: 0.4, fontSize: 19, bold: true, color: PINK,
      align: 'right', valign: 'middle', fontFace: F, margin: 0 });
    s.addText(h[1], { x: hx, y: 1.24, w: 0.95, h: 0.26, fontSize: 8.5, color: GREY, align: 'right',
      valign: 'middle', fontFace: F, margin: 0 });
    hx += 1.17;
  });

  const CW = 2.31, GAP = 0.17, TOP = 2.05, CH = 4.5;
  PERSONAS.forEach((pa, i) => {
    const x = M + i * (CW + GAP);
    const lead = pa.key === 'sandwich';
    card(s, x, TOP, CW, CH, { fill: lead ? 'FDF0F4' : WHITE, lineC: lead ? PINK : LINE, lw: lead ? 1.5 : 1 });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.24, y: TOP + 0.26, w: 0.16, h: 0.16,
      fill: { color: lead ? PINK : NAVY }, rectRadius: 0.08, line: { type: 'none' } });
    s.addText(pa.name, { x: x + 0.48, y: TOP + 0.16, w: CW - 0.68, h: 0.4, fontSize: 11.5, bold: true,
      color: lead ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(pa.line, { x: x + 0.24, y: TOP + 0.62, w: CW - 0.48, h: 0.66, fontSize: 10.5,
      italic: true, color: INK, valign: 'top', fontFace: F, margin: 0 });
    s.addText(pa.who, { x: x + 0.24, y: TOP + 1.3, w: CW - 0.48, h: 0.5, fontSize: 9, color: GREY,
      valign: 'top', fontFace: F, margin: 0 });
    s.addText(String(pa.hero), { x: x + 0.24, y: TOP + 1.86, w: CW - 0.48, h: 0.62, fontSize: 40,
      bold: true, color: PINK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(pa.heroLab, { x: x + 0.24, y: TOP + 2.5, w: CW - 0.48, h: 0.6, fontSize: 9,
      color: INK, valign: 'top', fontFace: F, margin: 0 });
    s.addShape(p.ShapeType.line, { x: x + 0.24, y: TOP + 3.12, w: CW - 0.48, h: 0,
      line: { color: lead ? PINK : LINE, width: 1 } });
    s.addText(pa.support.join('\n'), { x: x + 0.24, y: TOP + 3.24, w: CW - 0.48, h: 0.66,
      fontSize: 9, color: GREY, valign: 'top', fontFace: F, margin: 0, lineSpacingMultiple: 1.15 });
    s.addText('WHERE', { x: x + 0.24, y: TOP + 3.94, w: CW - 0.48, h: 0.2, fontSize: 7.5, bold: true,
      color: lead ? PINK : NAVY, charSpacing: 1.2, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(pa.zones.map(z => z.area + ' (' + z.places + ')').join(' · '),
      { x: x + 0.24, y: TOP + 4.14, w: CW - 0.48, h: 0.3, fontSize: 8.5, color: INK,
        valign: 'top', fontFace: F, margin: 0 });
  });

  s.addText('Every count is places within 400 m of a stop on the five routes — schools, clinics, community clubs and interchanges the buses actually pass.',
    { x: M, y: 6.66, w: 11.6, h: 0.32, fontSize: 9, italic: true, color: GREY, valign: 'middle', fontFace: F, margin: 0 });
  footer(s, 1);
  s.addNotes('DBP C2 — routes ' + D.routes.join(', ') + '. Creative order matches the five approved 1771 executions.');
}

// ============================================================ 2 · geofence + time belt
{
  const s = p.addSlide(); s.background = { color: WHITE };
  pill(s, 'DBP C2 · 1771', M, 0.36);
  s.addText('The same five buses, five different conversations', { x: M - 0.02, y: 0.82, w: 10.4, h: 0.62,
    fontSize: 28, bold: true, color: NAVY, valign: 'middle', fontFace: F, margin: 0 });
  s.addText('Each creative fires inside its own geofence, in its own time belt. Worked example below — the full zone-by-zone plan is built on confirmation.',
    { x: M - 0.02, y: 1.44, w: 11.6, h: 0.4, fontSize: 12.5, color: GREY, valign: 'top', fontFace: F, margin: 0 });

  // column heads
  const BX = 7.10, BW = 4.90, H0 = 6, H1 = 22;         // time axis 06:00 → 22:00
  const tx = h => BX + (h - H0) * (BW / (H1 - H0));
  s.addText('Creative', { x: M + 0.26, y: 2.02, w: 2.6, h: 0.26, fontSize: 8.5, bold: true, color: GREY, charSpacing: 1, fontFace: F, margin: 0 });
  s.addText('Geofence', { x: 3.65, y: 2.02, w: 3.2, h: 0.26, fontSize: 8.5, bold: true, color: GREY, charSpacing: 1, fontFace: F, margin: 0 });
  s.addText('Time belt', { x: BX, y: 2.02, w: 3.0, h: 0.26, fontSize: 8.5, bold: true, color: GREY, charSpacing: 1, fontFace: F, margin: 0 });
  // hour ticks sit on their own line so they cannot collide with the column head
  [6, 9, 12, 15, 18, 21].forEach(h => {
    s.addText(String(h).padStart(2, '0') + ':00', { x: tx(h) - 0.28, y: 2.14, w: 0.56, h: 0.22,
      fontSize: 7.5, color: GREY, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
  });

  const TOP = 2.36, RH = 0.68, PITCH = 0.78;
  PERSONAS.forEach((pa, i) => {
    const y = TOP + i * PITCH, lead = pa.key === 'sandwich';
    card(s, M, y, 12.23, RH, { fill: lead ? 'FDF0F4' : WHITE, lineC: lead ? PINK : LINE, lw: lead ? 1.5 : 1 });
    s.addText(pa.name, { x: M + 0.26, y: y + 0.07, w: 2.7, h: 0.28, fontSize: 11.5, bold: true,
      color: lead ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(pa.line, { x: M + 0.26, y: y + 0.35, w: 2.9, h: 0.28, fontSize: 8.5, italic: true,
      color: GREY, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(pa.zones.map(z => z.area).join(' · '), { x: 3.65, y: y + 0.07, w: 3.3, h: 0.28,
      fontSize: 10, bold: true, color: INK, valign: 'middle', fontFace: F, margin: 0 });
    s.addText(pa.beltWhy, { x: 3.65, y: y + 0.35, w: 3.3, h: 0.28, fontSize: 8.5, color: GREY,
      valign: 'middle', fontFace: F, margin: 0 });

    // the belt itself — a day rail with the live windows filled
    const rail = y + 0.20;
    s.addShape(p.ShapeType.roundRect, { x: BX, y: rail, w: BW, h: 0.17,
      fill: { color: 'EEF1F8' }, rectRadius: 0.085, line: { type: 'none' } });
    [9, 12, 15, 18, 21].forEach(h => s.addShape(p.ShapeType.line,
      { x: tx(h), y: rail, w: 0, h: 0.17, line: { color: WHITE, width: 0.75 } }));
    pa.belt.forEach(b => {
      s.addShape(p.ShapeType.roundRect, { x: tx(b[0]), y: rail - 0.035, w: tx(b[1]) - tx(b[0]),
        h: 0.24, fill: { color: lead ? PINK : NAVY }, rectRadius: 0.12, line: { type: 'none' } });
    });
    s.addText(pa.beltLab, { x: BX, y: y + 0.42, w: 3.2, h: 0.26, fontSize: 8.5, bold: true,
      color: lead ? PINK : NAVY, valign: 'middle', fontFace: F, margin: 0 });
    if (pa.weekend) {
      s.addShape(p.ShapeType.roundRect, { x: 12.06, y: rail - 0.045, w: 0.66, h: 0.26,
        fill: { color: WHITE }, rectRadius: 0.13, line: { color: lead ? PINK : NAVY, width: 1 } });
      s.addText(pa.weekend, { x: 12.06, y: rail - 0.045, w: 0.66, h: 0.26, fontSize: 6,
        bold: true, color: lead ? PINK : NAVY, align: 'center', valign: 'middle', fontFace: F, margin: 0 });
    }
  });

  const y2 = 6.30;
  card(s, M, y2, 12.23, 0.64, { fill: TINT, lineC: LINE });
  s.addText('Five creatives already exist. Nothing here needs new artwork — only a schedule.',
    { x: M + 0.32, y: y2 + 0.06, w: 11.6, h: 0.28, fontSize: 11, bold: true, color: NAVY,
      valign: 'middle', fontFace: F, margin: 0 });
  s.addText('Geofences are where each audience concentrates on these five routes, measured from the place data. Belts follow when those places are open — tightened stop by stop once the buy is confirmed.',
    { x: M + 0.32, y: y2 + 0.34, w: 11.6, h: 0.26, fontSize: 8.5, italic: true, color: GREY,
      valign: 'middle', fontFace: F, margin: 0 });
  footer(s, 2);
}

p.writeFile({ fileName: process.argv[3] }).then(f => console.log('wrote', f));
