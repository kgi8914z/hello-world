const pptxgen = require("pptxgenjs");

/* ── Palette: graphite substrate + copper interconnect ─────────────── */
const INK      = "12161F";   // dark slide background (substrate)
const INK_CARD = "1E2431";   // card on dark
const PAPER    = "FFFFFF";
const MUTE     = "F1F2F5";   // card on light
const LINE     = "D5D9E0";
const COPPER   = "B25A22";   // accent  (Cu interconnect)
const COPPER_L = "E09A5F";
const SLATE    = "3F5A6B";   // silicon / interposer
const SLATE_L  = "7C97A6";
const TXT      = "232834";
const TXT2     = "6B7381";
const D_TXT    = "E7EAF0";
const D_TXT2   = "97A0B0";

const TF = "Arial";      // headings (latin)
const BF = "Calibri";    // body (latin); Hangul falls back to the theme CJK face

const W = 13.333, H = 7.5, M = 0.7;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Chiplet Overview";
pres.title  = "칩렛(Chiplet) 기술 개요";

/* fresh object every call — pptxgenjs mutates option objects in place */
const sh = (o = 0.09) => ({ type: "outer", angle: 90, blur: 8, offset: o, color: "8892A0", opacity: 0.28 });

let pageNo = 0;
function newSlide(dark) {
  const s = pres.addSlide();
  s.background = { color: dark ? INK : PAPER };
  pageNo += 1;
  if (pageNo > 1) {
    s.addText(String(pageNo).padStart(2, "0"), {
      x: W - 1.0, y: H - 0.55, w: 0.5, h: 0.3, margin: 0,
      fontFace: TF, fontSize: 10, bold: true, color: dark ? D_TXT2 : TXT2, align: "right",
    });
  }
  return s;
}

/* eyebrow (EN) + title (KR) */
function head(s, en, kr, dark) {
  s.addText(en.toUpperCase(), {
    x: M, y: 0.42, w: 11.5, h: 0.26, margin: 0,
    fontFace: TF, fontSize: 10.5, bold: true, charSpacing: 2.6,
    color: dark ? COPPER_L : COPPER,
  });
  s.addText(kr, {
    x: M, y: 0.72, w: 11.9, h: 0.55, margin: 0,
    fontFace: TF, fontSize: 29, bold: true, color: dark ? PAPER : TXT,
  });
}

/* the repeating motif: a small copper "die" glyph */
function glyph(s, x, y, size, color) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: size, h: size, rectRadius: 0.2,
    fill: { color: color || COPPER }, line: { color: color || COPPER, width: 0 },
  });
}

function card(s, x, y, w, h, dark) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: dark ? INK_CARD : MUTE },
    line: { color: dark ? "2C3444" : LINE, width: 0.75 },
  });
}

/* ── drawing primitives for the package cross-sections ─────────────── */
function bar(s, x, y, w, h, fill, lineC) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color: fill },
    line: { color: lineC || fill, width: 0.5 },
  });
}
function dieBox(s, x, y, w, h, fill, label, labelColor, fs) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12,
    fill: { color: fill }, line: { color: "FFFFFF", width: 0.75 },
  });
  if (label) {
    s.addText(label, {
      x, y, w, h, margin: 0, align: "center", valign: "middle",
      fontFace: TF, fontSize: fs || 8.5, bold: true, color: labelColor || PAPER,
    });
  }
}
/* a row of n bumps spanning [x, x+w] */
function bumps(s, x, y, w, n, d, color) {
  const step = w / n;
  for (let i = 0; i < n; i++) {
    s.addShape(pres.shapes.OVAL, {
      x: x + step * i + step / 2 - d / 2, y, w: d, h: d,
      fill: { color }, line: { color, width: 0 },
    });
  }
}
/* vertical TSV hairlines through a bar */
function tsvs(s, x, y, w, h, n, color) {
  const step = w / (n + 1);
  for (let i = 1; i <= n; i++) {
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + step * i - 0.011, y: y + 0.03, w: 0.022, h: h - 0.06,
      fill: { color }, line: { color, width: 0 },
    });
  }
}

/* ══════════════════════════════════════════════════════════════════
   1. TITLE
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(true);
  s.addText("CHIPLET TECHNOLOGY OVERVIEW", {
    x: 0.9, y: 2.25, w: 6.6, h: 0.3, margin: 0,
    fontFace: TF, fontSize: 12, bold: true, charSpacing: 3.4, color: COPPER_L,
  });
  s.addText("칩렛 기술 개요", {
    x: 0.9, y: 2.61, w: 6.6, h: 0.85, margin: 0,
    fontFace: TF, fontSize: 44, bold: true, color: PAPER,
  });
  s.addText("모놀리식 SoC의 한계와 분할 다이 · 어드밴스드 패키징", {
    x: 0.9, y: 3.55, w: 6.6, h: 0.4, margin: 0,
    fontFace: BF, fontSize: 17, color: D_TXT,
  });
  s.addText("Beyond the Monolithic SoC — Disaggregated Dies and Advanced Packaging", {
    x: 0.9, y: 3.97, w: 6.6, h: 0.35, margin: 0,
    fontFace: BF, fontSize: 12.5, italic: true, color: D_TXT2,
  });
  glyph(s, 0.9, 4.8, 0.18);
  s.addText("대상: 반도체 설계 · 패키징 엔지니어    |    2026. 08", {
    x: 1.22, y: 4.71, w: 6.3, h: 0.32, margin: 0,
    fontFace: BF, fontSize: 12, color: D_TXT2,
  });

  /* package cross-section illustration */
  const ox = 7.55, ow = 5.0;
  const dieW = 1.42, dieY = 3.12, dieH = 0.66;
  const dies = [["CPU\nN3", COPPER], ["GPU\nN3", SLATE], ["I/O · SerDes\nN6", "56707E"]];
  dies.forEach((d, i) => {
    const dx = ox + 0.32 + i * (dieW + 0.24);
    dieBox(s, dx, dieY, dieW, dieH, d[1], d[0], PAPER, 8);
    bumps(s, dx, dieY + dieH + 0.02, dieW, 7, 0.075, COPPER_L);
  });
  bar(s, ox + 0.14, 3.92, ow - 0.28, 0.24, SLATE, SLATE_L);
  tsvs(s, ox + 0.14, 3.92, ow - 0.28, 0.24, 10, "6E8A99");
  bumps(s, ox + 0.14, 4.20, ow - 0.28, 12, 0.1, "C9CFD8");
  bar(s, ox, 4.36, ow, 0.36, "2B3444", "4A566B");
  bumps(s, ox + 0.2, 4.74, ow - 0.4, 14, 0.13, "8A94A6");
  s.addText("Die  ·  µBump  ·  Interposer(TSV)  ·  C4  ·  Substrate  ·  BGA", {
    x: ox - 0.2, y: 5.05, w: ow + 0.4, h: 0.3, margin: 0, align: "center",
    fontFace: BF, fontSize: 10, color: D_TXT2,
  });
  s.addNotes("이 발표는 칩렛을 '왜 하게 되었는가 → 무엇인가 → 무엇을 얻고 잃는가 → 어떻게 붙이는가 → 실제 사례 → 남은 과제' 순서로 다룹니다. 표지 그림은 전형적인 2.5D 패키지 단면으로, 뒤에서 나오는 모든 용어(다이, 마이크로범프, 인터포저, TSV, C4, 기판)가 여기 다 들어 있습니다.");
}

/* ══════════════════════════════════════════════════════════════════
   2. WHY — reticle limit + yield
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(false);
  head(s, "Motivation", "왜 칩렛인가", false);

  const stats = [
    ["858 mm²", "레티클 한계 (Reticle Limit)", "26 × 33 mm. 단일 다이는 물리적으로 이보다 커질 수 없다.\nHigh-NA EUV는 하프필드로 429 mm²까지 축소된다."],
    ["59 %", "800 mm² 다이의 수율", "D₀ = 0.07/cm² 가정. 같은 조건의 100 mm² 다이는 88 %.\n면적에 대해 수율은 지수적으로 무너진다."],
    ["× 2 ~ 3", "노드당 웨이퍼 단가 상승", "N7 → N5 → N3로 갈수록 mm²당 원가가 오른다.\nSRAM · 아날로그 · I/O는 미세화 이득이 거의 없다."],
  ];
  const cw = 5.45, cx = M;
  let cy = 1.5;
  stats.forEach((t) => {
    card(s, cx, cy, cw, 1.62, false);
    s.addText(t[0], {
      x: cx + 0.32, y: cy + 0.16, w: 2.05, h: 0.62, margin: 0,
      fontFace: TF, fontSize: 30, bold: true, color: COPPER,
    });
    s.addText(t[1], {
      x: cx + 2.42, y: cy + 0.26, w: 2.8, h: 0.4, margin: 0,
      fontFace: TF, fontSize: 12.5, bold: true, color: TXT,
    });
    s.addText(t[2], {
      x: cx + 0.32, y: cy + 0.82, w: cw - 0.62, h: 0.66, margin: 0,
      fontFace: BF, fontSize: 11.5, color: TXT2, lineSpacingMultiple: 1.05,
    });
    cy += 1.78;
  });

  /* yield chart */
  const D1 = 0.07, D2 = 0.15;
  const areas = [50, 100, 200, 300, 400, 500, 600, 700, 858];
  const murphy = (a_mm2, d) => { const A = a_mm2 / 100, x = A * d; return Math.round(Math.pow((1 - Math.exp(-x)) / x, 2) * 1000) / 10; };
  s.addChart(pres.charts.LINE, [
    { name: "D₀ = 0.07 /cm²", labels: areas.map(String), values: areas.map((a) => murphy(a, D1)) },
    { name: "D₀ = 0.15 /cm²", labels: areas.map(String), values: areas.map((a) => murphy(a, D2)) },
  ], {
    x: 6.55, y: 1.5, w: 6.1, h: 4.7,
    showTitle: true, title: "다이 면적 vs. 수율 (Murphy 모델)", titleFontSize: 13, titleColor: TXT, titleFontFace: TF,
    chartColors: [COPPER, SLATE_L], lineSize: 3, lineSmooth: true,
    showLegend: true, legendPos: "b", legendFontFace: BF, legendFontSize: 10, legendColor: TXT2,
    catAxisTitle: "다이 면적 (mm²)", showCatAxisTitle: true, catAxisTitleFontSize: 10, catAxisTitleColor: TXT2,
    valAxisTitle: "수율 (%)", showValAxisTitle: true, valAxisTitleFontSize: 10, valAxisTitleColor: TXT2,
    catAxisLabelColor: TXT2, valAxisLabelColor: TXT2, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
    catAxisLabelFontFace: BF, valAxisLabelFontFace: BF,
    valAxisMinVal: 0, valAxisMaxVal: 100,
    valGridLine: { color: "E4E7EC", size: 1 }, catGridLine: { style: "none" },
  });
  s.addNotes("핵심 논지: 다이를 키워서 성능을 올리는 길이 세 방향에서 동시에 막혔다. (1) 레티클이라는 물리적 상한, (2) 면적에 지수적으로 반응하는 수율, (3) 선단 노드의 mm²당 원가. Murphy 모델 Y = ((1-e^-AD)/AD)². 800 mm² 다이 하나 대신 100 mm² 다이 8개로 쪼개면 웨이퍼당 양품 실리콘 면적이 크게 늘어난다. 여기에 더해 SRAM과 아날로그/IO는 노드를 내려도 면적이 거의 안 줄기 때문에, 이들을 선단 노드에 태울 이유가 없다는 점이 칩렛의 두 번째 동기다.");
}

/* ══════════════════════════════════════════════════════════════════
   3. WHAT — monolithic vs disaggregated
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(false);
  head(s, "What is a Chiplet", "칩렛이란 무엇인가", false);
  s.addText("하나의 SoC가 담당하던 기능을 여러 개의 작은 다이로 분할하고, 이를 한 패키지 안에서 고밀도 인터커넥트로 다시 이어 붙인 것.", {
    x: M, y: 1.32, w: 11.9, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, color: TXT2,
  });

  const cw = 5.79;
  const L = M, R = M + cw + 0.35, cy = 1.78, ch = 4.3;
  card(s, L, cy, cw, ch, false);
  card(s, R, cy, cw, ch, false);

  s.addText("모놀리식 SoC", { x: L + 0.35, y: cy + 0.22, w: 3.4, h: 0.32, margin: 0, fontFace: TF, fontSize: 15, bold: true, color: TXT });
  s.addText("Monolithic SoC", { x: L + 0.35, y: cy + 0.55, w: 3.4, h: 0.26, margin: 0, fontFace: BF, fontSize: 10.5, color: TXT2 });
  s.addText("칩렛 (분할 다이)", { x: R + 0.35, y: cy + 0.22, w: 3.4, h: 0.32, margin: 0, fontFace: TF, fontSize: 15, bold: true, color: COPPER });
  s.addText("Disaggregated Chiplets", { x: R + 0.35, y: cy + 0.55, w: 3.4, h: 0.26, margin: 0, fontFace: BF, fontSize: 10.5, color: TXT2 });

  /* left: one big die, every block on one node */
  const bx = L + 0.62, by = cy + 1.0, bw = cw - 1.24, bh = 1.8;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: bw, h: bh, rectRadius: 0.05, fill: { color: SLATE }, line: { color: "2C4351", width: 1 } });
  const blocks = ["CPU", "GPU", "NPU", "I/O", "SerDes", "Memory Ctrl"];
  blocks.forEach((b, i) => {
    const c = i % 3, r = Math.floor(i / 3);
    dieBox(s, bx + 0.18 + c * ((bw - 0.36) / 3), by + 0.18 + r * 0.8, (bw - 0.36) / 3 - 0.14, 0.66, "56707E", b, PAPER, 9);
  });
  s.addText("전 블록이 하나의 공정 노드 · 하나의 다이", {
    x: bx, y: by + bh + 0.08, w: bw, h: 0.26, margin: 0, align: "center", fontFace: BF, fontSize: 10.5, italic: true, color: TXT2,
  });
  ["다이가 커질수록 수율 하락 · 원가 급증", "아날로그 / I/O도 선단 노드 비용을 그대로 부담", "제품 파생마다 전체 다이를 새로 설계"].forEach((t, i) => {
    glyph(s, L + 0.38, cy + 3.49 + i * 0.24, 0.09, SLATE_L);
    s.addText(t, { x: L + 0.58, y: cy + 3.42 + i * 0.24, w: cw - 0.95, h: 0.24, margin: 0, fontFace: BF, fontSize: 10.5, color: TXT });
  });

  /* right: four dies on an interposer */
  const rx = R + 0.62, rw = cw - 1.24;
  const cdies = [["CPU 코어", "N3", COPPER], ["GPU / NPU", "N3", COPPER], ["I/O · 아날로그", "N6", "56707E"], ["SRAM 캐시", "N5", SLATE]];
  cdies.forEach((d, i) => {
    const c = i % 2, r = Math.floor(i / 2);
    const dx = rx + c * ((rw + 0.16) / 2), dw = (rw - 0.16) / 2;
    dieBox(s, dx, cy + 1.0 + r * 0.94, dw, 0.8, d[2], "", PAPER);
    s.addText(d[0], { x: dx, y: cy + 1.12 + r * 0.94, w: dw, h: 0.26, margin: 0, align: "center", fontFace: TF, fontSize: 10, bold: true, color: PAPER });
    s.addText(d[1], { x: dx, y: cy + 1.38 + r * 0.94, w: dw, h: 0.24, margin: 0, align: "center", fontFace: BF, fontSize: 9.5, color: "F0DCCB" });
    bumps(s, dx, cy + 1.0 + r * 0.94 + 0.82, dw, 8, 0.06, COPPER_L);
  });
  bar(s, rx - 0.12, cy + 2.92, rw + 0.24, 0.22, "2C4351", SLATE_L);
  s.addText("Interposer / Substrate  —  D2D 인터커넥트", {
    x: rx - 0.12, y: cy + 2.92, w: rw + 0.24, h: 0.22, margin: 0, align: "center", valign: "middle",
    fontFace: BF, fontSize: 9, color: "CFDBE2",
  });
  ["기능별로 최적 노드를 따로 선택 (이종 집적)", "검증된 다이를 여러 제품에 재사용", "다이 수 조합만 바꿔 SKU 파생"].forEach((t, i) => {
    glyph(s, R + 0.38, cy + 3.49 + i * 0.24, 0.09, COPPER);
    s.addText(t, { x: R + 0.58, y: cy + 3.42 + i * 0.24, w: cw - 0.95, h: 0.24, margin: 0, fontFace: BF, fontSize: 10.5, color: TXT });
  });
  s.addNotes("칩렛은 '작게 만든 칩'이 아니라 '패키지 안에서 재조립하는 설계 방법론'입니다. 분할 경계를 어디에 두느냐가 설계의 핵심 — 대역폭 요구가 낮고 지연에 둔감한 경계를 찾아야 합니다. 통상 코어/캐시 사이보다는 코어 클러스터와 I/O 사이, 혹은 메모리 컨트롤러 앞단이 분할선이 됩니다. 오른쪽 그림처럼 노드를 섞는 것(이종 집적, heterogeneous integration)이 칩렛의 가장 큰 실익입니다.");
}

/* ══════════════════════════════════════════════════════════════════
   4. BENEFITS
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(false);
  head(s, "Benefits", "무엇을 얻는가", false);

  const items = [
    ["수율 · 원가", "Yield & Cost", "면적을 8배 줄이면 다이 수율이 59 % → 88 %로. 결함 다이 폐기 손실이 작아지고 웨이퍼당 양품 실리콘이 늘어난다."],
    ["이종 집적", "Heterogeneous Integration", "로직은 N3, I/O · 아날로그는 N6, 캐시는 N5. 미세화 이득이 없는 블록에 선단 노드 비용을 쓰지 않는다."],
    ["레티클 초과 확장", "Beyond-Reticle Scaling", "858 mm² 상한을 다이 개수로 우회. 인터포저는 이미 레티클 3.3배급, 5.5배급으로 확대 중."],
    ["IP 재사용", "Design Reuse", "검증된 실물 다이를 그대로 다음 제품에 태운다. 마스크 세트와 실리콘 검증 비용을 세대 간에 분할 상각."],
    ["제품 파생", "SKU Derivation", "동일 다이의 개수 조합만 바꿔 라인업 구성. 서버 8~96코어를 하나의 CCD 설계로 커버."],
    ["개발 기간", "Time-to-Market", "다이별 병렬 설계 · 병렬 테이프아웃. 문제가 난 다이만 리스핀하면 되므로 리스크가 국소화된다."],
  ];
  const cw = 3.777, chh = 2.32;
  items.forEach((it, i) => {
    const c = i % 3, r = Math.floor(i / 3);
    const x = M + c * (cw + 0.3), y = 1.5 + r * (chh + 0.3);
    card(s, x, y, cw, chh, false);
    glyph(s, x + 0.32, y + 0.34, 0.22);
    s.addText(it[0], { x: x + 0.68, y: y + 0.26, w: cw - 0.98, h: 0.34, margin: 0, fontFace: TF, fontSize: 15, bold: true, color: TXT });
    s.addText(it[1], { x: x + 0.32, y: y + 0.66, w: cw - 0.64, h: 0.26, margin: 0, fontFace: BF, fontSize: 10, italic: true, color: COPPER });
    s.addText(it[2], { x: x + 0.32, y: y + 1.0, w: cw - 0.64, h: 1.1, margin: 0, fontFace: BF, fontSize: 11.5, color: TXT2, lineSpacingMultiple: 1.12 });
  });
  s.addNotes("여섯 가지 중 실무에서 가장 크게 체감되는 것은 '이종 집적'과 '제품 파생'입니다. 수율 이득은 다이가 충분히 클 때만 유의미하고, 작은 다이를 더 쪼개면 인터커넥트 오버헤드가 이득을 잡아먹습니다. AMD가 하나의 CCD 설계로 데스크톱부터 96코어 서버까지 커버한 것이 파생 효과의 대표 사례입니다.");
}

/* ══════════════════════════════════════════════════════════════════
   5. TRADE-OFFS  (dark)
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(true);
  head(s, "Trade-offs", "무엇을 잃는가", true);
  s.addText("공짜가 아니다. 다이 경계를 하나 만들 때마다 전력 · 지연 · 원가 · 테스트에서 대가를 치른다.", {
    x: M, y: 1.32, w: 11.9, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, color: D_TXT2,
  });

  const items = [
    { kr: "인터커넥트 전력", en: "Interconnect Power", num: "0.25 – 0.5", unit: "pJ/bit",
      desc: "온다이 배선은 0.05 pJ/bit 수준. 다이 경계를 넘는 순간 5~10배가 된다. TB/s급 대역폭에서는 수 W~수십 W의 추가 전력이다." },
    { kr: "지연", en: "Latency", num: "+ 2 – 10", unit: "ns",
      desc: "다이 경계 통과 지연이 더해지며 접근 지연이 비균일해진다(NUMA 유사). 캐시 코히런시 프로토콜과 스케줄러가 이를 인지해야 한다." },
    { kr: "패키지 원가 · 캐파", en: "Package Cost", num: "2.5D / 3D", unit: "package",
      desc: "실리콘 인터포저 · 하이브리드 본딩은 공정 단가가 높고 CoWoS급 캐파는 공급 병목이다. 패키지가 BOM의 지배 항목이 될 수 있다." },
    { kr: "테스트 부담", en: "KGD & Test", num: null, unit: "곱셈 수율",
      desc: "조립 후 한 다이만 불량이어도 패키지 전체가 손실. 사전 선별(Known Good Die)과 다이별 DFT · 리페어 전략이 필수가 된다." },
  ];
  const cw = 5.79, chh = 2.25;
  items.forEach((it, i) => {
    const c = i % 2, r = Math.floor(i / 2);
    const x = M + c * (cw + 0.35), y = 1.72 + r * (chh + 0.28);
    card(s, x, y, cw, chh, true);
    s.addText(it.kr, { x: x + 0.34, y: y + 0.2, w: cw - 0.68, h: 0.3, margin: 0, fontFace: TF, fontSize: 14, bold: true, color: PAPER });
    s.addText(it.en, { x: x + 0.34, y: y + 0.5, w: cw - 0.68, h: 0.24, margin: 0, fontFace: BF, fontSize: 10, italic: true, color: COPPER_L });
    const big = { fontFace: TF, fontSize: 26, bold: true, color: COPPER_L };
    const runs = it.num
      ? [{ text: it.num, options: { ...big } }]
      : [{ text: "Y", options: { ...big } }, { text: "N", options: { ...big, superscript: true } }];
    runs.push({ text: "   " + it.unit, options: { fontFace: BF, fontSize: 12, color: D_TXT2 } });
    s.addText(runs, { x: x + 0.34, y: y + 0.8, w: cw - 0.68, h: 0.5, margin: 0, valign: "middle" });
    s.addText(it.desc, { x: x + 0.34, y: y + 1.34, w: cw - 0.68, h: 0.8, margin: 0, fontFace: BF, fontSize: 11.5, color: D_TXT, lineSpacingMultiple: 1.12 });
  });
  s.addNotes("분할 판단의 실질적 기준: 경계를 넘는 대역폭 × pJ/bit 가 감당 가능한 전력 예산 안에 들어오는가. 코어와 L2 사이처럼 대역폭이 수십 TB/s인 경계는 절대 쪼갤 수 없고, 코어 클러스터와 메모리 컨트롤러 사이처럼 수 TB/s 수준이면 검토 대상이 됩니다. 수율 항목의 Yᴺ은 다이 N개가 모두 양품이어야 패키지가 살아남는다는 뜻으로, KGD 선별 정확도가 곧 패키지 수율입니다.");
}

/* ══════════════════════════════════════════════════════════════════
   6. PACKAGING
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(false);
  head(s, "Advanced Packaging", "어떻게 붙이는가 — 패키징 기술", false);
  s.addText("다이 사이의 배선 밀도(= 범프 피치)가 곧 사용할 수 있는 D2D 대역폭을 결정한다.", {
    x: M, y: 1.32, w: 11.9, h: 0.3, margin: 0, fontFace: BF, fontSize: 13, color: TXT2,
  });

  const colW = 2.893, gap = 0.22, top = 1.78, chh = 4.45;
  const subY = 3.68;                       // top edge of the package substrate
  const cols = [
    { kr: "2D 유기 기판", en: "Organic Substrate", cap: "기판 배선", pitch: "범프 피치  ~130 µm",
      note: "기판 배선으로만 연결. 가장 싸고 단순하지만 배선 밀도가 낮아 D2D 대역폭이 제한된다.", ex: "AMD EPYC (CCD ↔ IOD)" },
    { kr: "2.5D 인터포저", en: "Si Interposer / CoWoS", cap: "TSV 인터포저", pitch: "범프 피치  40 – 55 µm",
      note: "실리콘 인터포저 전면에 다이를 얹고 TSV로 기판과 연결. HBM 집적의 사실상 표준.", ex: "NVIDIA GPU + HBM" },
    { kr: "임베디드 브리지", en: "EMIB / Si Bridge", cap: "매립 실리콘 브리지", pitch: "범프 피치  ~45 µm",
      note: "필요한 다이 사이에만 작은 실리콘 브리지를 기판에 매립. 인터포저 면적 비용을 피한다.", ex: "Intel Sapphire Rapids" },
    { kr: "3D 하이브리드 본딩", en: "Hybrid Bonding", cap: "Cu–Cu 직접 접합면", pitch: "본드 피치  < 10 µm",
      note: "범프 없이 Cu–Cu를 직접 접합. 배선 밀도가 자릿수로 뛰지만 열 · 평탄도 관리가 어렵다.", ex: "AMD 3D V-Cache, Foveros Direct" },
  ];

  cols.forEach((c, i) => {
    const x = M + i * (colW + gap);
    card(s, x, top, colW, chh, false);
    s.addText(c.kr, { x: x + 0.24, y: top + 0.2, w: colW - 0.48, h: 0.3, margin: 0, fontFace: TF, fontSize: 13.5, bold: true, color: TXT });
    s.addText(c.en, { x: x + 0.24, y: top + 0.51, w: colW - 0.48, h: 0.26, margin: 0, fontFace: BF, fontSize: 10, italic: true, color: COPPER });

    /* ── cross-section, all four bottom-aligned on the substrate ── */
    const gx = x + 0.24, gw = colW - 0.48;
    const subH = 0.22, dW = gw / 2 - 0.17;

    if (i === 0) {          /* 2D — dies straight onto the substrate */
      bar(s, gx, subY, gw, subH, "2C4351", SLATE_L);
      bumps(s, gx, subY - 0.13, gw, 10, 0.11, "9AA6B2");
      dieBox(s, gx, subY - 0.68, dW, 0.54, SLATE, "Die A", PAPER, 8);
      dieBox(s, gx + gw - dW, subY - 0.68, dW, 0.54, "56707E", "Die B", PAPER, 8);
      s.addShape(pres.shapes.RECTANGLE, { x: gx + 0.3, y: subY + 0.09, w: gw - 0.6, h: 0.035, fill: { color: COPPER_L }, line: { width: 0 } });
    } else if (i === 1) {   /* 2.5D — full silicon interposer with TSVs */
      bar(s, gx, subY, gw, subH, "2C4351", SLATE_L);
      bumps(s, gx + 0.05, subY - 0.13, gw - 0.1, 10, 0.1, "9AA6B2");
      bar(s, gx + 0.05, subY - 0.36, gw - 0.1, 0.21, SLATE, SLATE_L);
      tsvs(s, gx + 0.05, subY - 0.36, gw - 0.1, 0.21, 11, "6E8A99");
      bumps(s, gx + 0.1, subY - 0.48, gw - 0.2, 16, 0.065, COPPER_L);
      dieBox(s, gx + 0.1, subY - 1.02, dW, 0.52, SLATE, "Die A", PAPER, 8);
      dieBox(s, gx + gw - dW - 0.1, subY - 1.02, dW, 0.52, "56707E", "Die B", PAPER, 8);
    } else if (i === 2) {   /* EMIB — bridge embedded in the substrate */
      bar(s, gx, subY, gw, subH, "2C4351", SLATE_L);
      bumps(s, gx, subY - 0.13, gw, 10, 0.11, "9AA6B2");
      s.addShape(pres.shapes.RECTANGLE, {
        x: gx + gw / 2 - 0.52, y: subY - 0.01, w: 1.04, h: 0.15,
        fill: { color: COPPER }, line: { color: "FFFFFF", width: 0.75 },
      });
      bumps(s, gx + gw / 2 - 0.5, subY - 0.12, 1.0, 8, 0.062, COPPER_L);
      dieBox(s, gx, subY - 0.68, dW, 0.54, SLATE, "Die A", PAPER, 8);
      dieBox(s, gx + gw - dW, subY - 0.68, dW, 0.54, "56707E", "Die B", PAPER, 8);
    } else {                /* 3D — Cu–Cu, no bumps at the die interface */
      bar(s, gx, subY, gw, subH, "2C4351", SLATE_L);
      bumps(s, gx + 0.25, subY - 0.13, gw - 0.5, 8, 0.11, "9AA6B2");
      dieBox(s, gx + 0.25, subY - 0.58, gw - 0.5, 0.44, SLATE, "", PAPER, 8);
      tsvs(s, gx + 0.25, subY - 0.58, gw - 0.5, 0.44, 7, "6E8A99");
      s.addText("Base Die", { x: gx + 0.25, y: subY - 0.58, w: gw - 0.5, h: 0.44, margin: 0, align: "center", valign: "middle", fontFace: TF, fontSize: 8, bold: true, color: PAPER });
      s.addShape(pres.shapes.RECTANGLE, { x: gx + 0.35, y: subY - 0.62, w: gw - 0.7, h: 0.045, fill: { color: COPPER }, line: { width: 0 } });
      dieBox(s, gx + 0.35, subY - 1.08, gw - 0.7, 0.46, "56707E", "Top Die", PAPER, 8);
    }
    s.addText(c.cap, { x: gx, y: subY + subH + 0.04, w: gw, h: 0.24, margin: 0, align: "center", fontFace: BF, fontSize: 9, color: COPPER });

    s.addText(c.pitch, { x: x + 0.24, y: top + 2.5, w: colW - 0.48, h: 0.28, margin: 0, fontFace: TF, fontSize: 11, bold: true, color: COPPER });
    s.addText(c.note, { x: x + 0.24, y: top + 2.84, w: colW - 0.48, h: 1.15, margin: 0, fontFace: BF, fontSize: 10.5, color: TXT2, lineSpacingMultiple: 1.1 });
    s.addText("예:  " + c.ex, { x: x + 0.24, y: top + 3.85, w: colW - 0.48, h: 0.4, margin: 0, fontFace: BF, fontSize: 10, italic: true, color: TXT });
  });
  s.addText("피치가 좁아질수록 mm당 배선 수가 늘어 대역폭 밀도가 오르고 pJ/bit는 내려간다 — 오른쪽으로 갈수록 공정 난이도와 원가도 함께 오른다.", {
    x: M, y: 6.42, w: 11.2, h: 0.32, margin: 0, fontFace: BF, fontSize: 11, italic: true, color: TXT2,
  });
  s.addNotes("범프 피치가 이 슬라이드의 축입니다. 피치가 절반이 되면 단위 길이당 배선 수는 2배, 단위 면적당은 4배가 됩니다. 2D 유기 기판(~130 µm)에서 하이브리드 본딩(<10 µm)까지 한 자릿수 이상 차이가 나고, 이것이 다음 장 UCIe 표준 패키지 / 어드밴스드 패키지 구분의 물리적 근거입니다. EMIB는 인터포저 전면을 실리콘으로 깔지 않고 필요한 구간만 브리지로 처리해 대면적 인터포저의 원가와 휨(warpage) 문제를 피하는 접근입니다. 하이브리드 본딩은 표면 평탄도(CMP)와 접합 정렬 정밀도, 그리고 적층 시 열 배출이 핵심 난제입니다.");
}

/* ══════════════════════════════════════════════════════════════════
   7. D2D INTERFACE
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(false);
  head(s, "Die-to-Die Interface", "다이 간 인터페이스 표준", false);
  s.addText("UCIe (Universal Chiplet Interconnect Express) — PCIe · CXL 프로토콜을 다이 경계로 옮긴 개방 표준.", {
    x: M, y: 1.32, w: 11.9, h: 0.3, margin: 0, fontFace: BF, fontSize: 12.5, color: TXT2,
  });

  const hdr = (t, sub) => ({
    text: sub ? t + "\n" + sub : t,
    options: { fill: { color: "2C3540" }, color: PAPER, bold: true, fontFace: TF, fontSize: 11, align: "center", valign: "middle" },
  });
  const lbl = (t) => ({ text: t, options: { fill: { color: MUTE }, color: TXT, bold: true, fontFace: BF, fontSize: 11.5, align: "left", valign: "middle" } });
  const val = (t, hi) => ({ text: t, options: { color: hi ? COPPER : TXT, bold: !!hi, fontFace: BF, fontSize: 11.5, align: "center", valign: "middle" } });

  const rows = [
    [hdr("구분"), hdr("Standard Package", "2D · 유기 기판"), hdr("Advanced Package", "2.5D · 브리지"), hdr("UCIe-3D", "하이브리드 본딩")],
    [lbl("범프 / 본드 피치"), val("100 – 130 µm"), val("25 – 55 µm"), val("< 10 µm", true)],
    [lbl("대역폭 밀도"), val("28 – 224 GB/s/mm"), val("165 – 1,317 GB/s/mm", true), val("> 300 GB/s/mm²")],
    [lbl("에너지 효율"), val("≤ 0.5 pJ/bit"), val("≤ 0.25 pJ/bit"), val("~ 0.05 pJ/bit", true)],
    [lbl("지연 (D2D)"), val("< 2 ns"), val("< 2 ns"), val("< 1 ns")],
    [lbl("도달 거리"), val("≤ 25 mm"), val("≤ 2 mm"), val("수직 적층")],
    [lbl("데이터율 / 레인"), val("4 – 32 GT/s"), val("4 – 32 GT/s"), val("— (병렬)")],
  ];
  s.addTable(rows, {
    x: M, y: 1.78, w: 8.35, colW: [1.95, 2.15, 2.35, 1.9],
    rowH: [0.52, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42],
    border: { type: "solid", color: LINE, pt: 0.75 },
    fontFace: BF, valign: "middle", autoPage: false,
  });
  s.addText("출처: UCIe 1.1 / 2.0 스펙 정의값. 실제 구현치는 모듈 구성과 공정에 따라 달라진다.", {
    x: M, y: 5.1, w: 8.35, h: 0.28, margin: 0, fontFace: BF, fontSize: 9.5, italic: true, color: TXT2,
  });

  /* right rail: protocol stack + alternative standards */
  const rx = 9.4, rw = 3.4;
  card(s, rx, 1.78, rw, 2.05, false);
  s.addText("UCIe 계층 구조", { x: rx + 0.26, y: 1.94, w: rw - 0.52, h: 0.28, margin: 0, fontFace: TF, fontSize: 12.5, bold: true, color: TXT });
  const layers = [["Protocol", "PCIe · CXL · Streaming", COPPER], ["Die-to-Die Adapter", "CRC · 재전송 · 링크 관리", SLATE], ["Physical Layer", "전기 · 범프 맵 · 트레이닝", "56707E"]];
  layers.forEach((l, i) => {
    const y = 2.34 + i * 0.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx + 0.26, y, w: rw - 0.52, h: 0.44, rectRadius: 0.12, fill: { color: l[2] }, line: { width: 0 } });
    s.addText(l[0], { x: rx + 0.4, y: y + 0.02, w: rw - 0.8, h: 0.2, margin: 0, fontFace: TF, fontSize: 9.5, bold: true, color: PAPER });
    s.addText(l[1], { x: rx + 0.4, y: y + 0.21, w: rw - 0.8, h: 0.2, margin: 0, fontFace: BF, fontSize: 8.5, color: "E8EDF0" });
  });

  card(s, rx, 3.95, rw, 2.6, false);
  s.addText("그 외 D2D 표준", { x: rx + 0.26, y: 4.11, w: rw - 0.52, h: 0.28, margin: 0, fontFace: TF, fontSize: 12.5, bold: true, color: TXT });
  const alts = [
    ["BoW (OCP)", "단순 unterminated 병렬. 유기 · 어드밴스드 패키지 모두 지원."],
    ["OpenHBI", "HBM PHY 기반의 광폭 병렬 방식."],
    ["AIB", "Intel 초기 병렬 표준. CHIPS Alliance로 이관."],
    ["XSR / USR SerDes", "OIF 직렬 방식. 배선은 적고 거리는 길지만 pJ/bit가 높다."],
  ];
  alts.forEach((a, i) => {
    const y = 4.48 + i * 0.51;
    glyph(s, rx + 0.26, y + 0.04, 0.1);
    s.addText(a[0], { x: rx + 0.44, y: y - 0.03, w: rw - 0.7, h: 0.22, margin: 0, fontFace: TF, fontSize: 10.5, bold: true, color: TXT });
    s.addText(a[1], { x: rx + 0.44, y: y + 0.17, w: rw - 0.7, h: 0.32, margin: 0, fontFace: BF, fontSize: 9, color: TXT2 });
  });
  s.addNotes("UCIe의 의의는 물리 계층뿐 아니라 프로토콜(PCIe/CXL)과 어댑터 계층까지 한 번에 규정해 서로 다른 벤더의 다이가 실제로 상호운용될 수 있는 길을 열었다는 점입니다. 표준 패키지와 어드밴스드 패키지의 성능 차이는 결국 앞 장의 범프 피치에서 옵니다 — 피치가 좁으면 같은 다이 엣지 길이에 더 많은 레인을 넣을 수 있으므로 대역폭 밀도가 자릿수로 벌어집니다. UCIe 2.0에서 3D 본딩 프로파일과 시스템 관리(DFx) 아키텍처가 추가되었고, 3.0에서 레인당 데이터율이 48 GT/s로 확장되었습니다.");
}

/* ══════════════════════════════════════════════════════════════════
   8. CASE STUDIES
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(false);
  head(s, "Case Studies", "실제 제품 사례", false);

  const cases = [
    ["AMD", "EPYC (Zen 4) · Instinct MI300X",
      [["EPYC Genoa", "CCD 66 mm² (N5) 최대 12개 + IOD 122 mm² (N6), 유기 기판 2D · Infinity Fabric"],
       ["MI300X", "XCD 8 (N5) + IOD 4 (N6) 하이브리드 본딩 + HBM3 8스택, 약 1,530억 TR"],
       ["3D V-Cache", "SRAM 다이를 CCD 위에 Cu–Cu 직접 접합"]]],
    ["Intel", "Meteor Lake · Ponte Vecchio",
      [["Meteor Lake", "4개 타일 — Compute(Intel 4) / Graphics(N5) / SoC(N6) / IO(N6), Foveros 36 µm"],
       ["Ponte Vecchio", "47개 타일 · 5개 공정 노드, EMIB + Foveros 혼용"],
       ["의미", "자사 · 파운드리 공정을 한 패키지에 혼합한 첫 대량 양산 사례"]]],
    ["NVIDIA", "Blackwell B200",
      [["구성", "레티클 한계급 다이 2개를 하나의 GPU로 결합, 약 2,080억 TR"],
       ["인터커넥트", "NV-HBI 10 TB/s — 두 다이를 소프트웨어에 단일 GPU로 노출"],
       ["패키지", "CoWoS-L + HBM3E 8스택"]]],
    ["Apple", "M1 / M2 Ultra — UltraFusion",
      [["구성", "Max 다이 2개를 실리콘 인터포저로 미러 결합"],
       ["대역폭", "다이 간 2.5 TB/s, 저지연으로 OS에 단일 SoC로 인식"],
       ["의미", "동일 다이 2개 = 상위 SKU. 파생 전략의 교과서적 사례"]]],
  ];
  const cw = 5.79, chh = 2.32;
  cases.forEach((c, i) => {
    const col = i % 2, r = Math.floor(i / 2);
    const x = M + col * (cw + 0.35), y = 1.5 + r * (chh + 0.28);
    card(s, x, y, cw, chh, false);
    s.addText(c[0], { x: x + 0.32, y: y + 0.2, w: 2.0, h: 0.34, margin: 0, fontFace: TF, fontSize: 16, bold: true, color: COPPER });
    s.addText(c[1], { x: x + 2.2, y: y + 0.26, w: cw - 2.52, h: 0.3, margin: 0, align: "right", fontFace: BF, fontSize: 10.5, color: TXT2 });
    c[2].forEach((row, j) => {
      const ry = y + 0.66 + j * 0.53;
      s.addText(row[0], { x: x + 0.32, y: ry, w: 1.42, h: 0.24, margin: 0, fontFace: TF, fontSize: 10, bold: true, color: TXT });
      s.addText(row[1], { x: x + 1.78, y: ry, w: cw - 2.1, h: 0.5, margin: 0, valign: "top", fontFace: BF, fontSize: 10.5, color: TXT2 });
    });
  });
  s.addNotes("네 사례의 성격이 다릅니다. AMD는 원가와 SKU 파생이 동기(유기 기판 2D로 시작), NVIDIA와 Apple은 레티클 한계 돌파가 동기(고급 패키징 필수), Intel은 이종 공정 혼합이 동기입니다. 동기가 다르면 선택하는 패키징도 달라진다는 점이 요지입니다 — AMD EPYC은 대역폭 요구가 상대적으로 낮은 경계를 골랐기 때문에 값싼 유기 기판으로 충분했고, Apple UltraFusion은 다이 경계가 메모리 대역폭 경로에 걸리므로 실리콘 인터포저가 불가피했습니다.");
}

/* ══════════════════════════════════════════════════════════════════
   9. CHALLENGES
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(false);
  head(s, "Open Challenges", "남은 과제", false);

  const rows = [
    ["01", "생태계 상호운용성", "Interoperability",
      "UCIe가 전기 · 프로토콜 규격을 통일했지만, 실제 서드파티 다이를 섞으려면 범프 맵 · 전력 시퀀싱 · 테스트 접근 · 펌웨어까지 합의가 필요하다. '칩렛 마켓플레이스'는 아직 기술보다 사업 · 계약 문제에 가깝다."],
    ["02", "열 관리", "Thermal",
      "3D 적층은 열원을 수직으로 겹친다. 상부 다이의 열이 하부를 통과해야 하고, 하이브리드 본딩은 TIM을 넣을 공간조차 없다. 백사이드 전력 공급(BSPDN)과 열 경로 설계가 함께 풀려야 한다."],
    ["03", "테스트 · 책임 소재", "Test & KGD",
      "조립 후 불량이 났을 때 어느 다이 · 어느 공정의 책임인지 가리기 어렵다. 다이별 DFT, 패키지 내 접근 경로(IEEE 1838), 리페어 · RMA 정책이 표준화되어야 한다."],
    ["04", "설계 · EDA 흐름", "Design Flow",
      "다이 분할 결정, 패키지 · 다이 동시 최적화(co-design), 다이 간 SI/PI · 열 공동 해석 등 기존 SoC 흐름에 없던 단계가 필요하다. 3DIC 대응 EDA 흐름이 아직 성숙 중이다."],
  ];
  let y = 1.52;
  rows.forEach((r) => {
    card(s, M, y, 11.93, 1.14, false);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.32, y: y + 0.26, w: 0.62, h: 0.62, rectRadius: 0.14, fill: { color: COPPER }, line: { width: 0 } });
    s.addText(r[0], { x: M + 0.32, y: y + 0.26, w: 0.62, h: 0.62, margin: 0, align: "center", valign: "middle", fontFace: TF, fontSize: 15, bold: true, color: PAPER });
    s.addText(r[1], { x: M + 1.2, y: y + 0.26, w: 3.0, h: 0.32, margin: 0, fontFace: TF, fontSize: 14.5, bold: true, color: TXT });
    s.addText(r[2], { x: M + 1.2, y: y + 0.6, w: 3.0, h: 0.26, margin: 0, fontFace: BF, fontSize: 10, italic: true, color: COPPER });
    s.addText(r[3], { x: M + 4.35, y: y + 0.2, w: 7.28, h: 0.8, margin: 0, valign: "top", fontFace: BF, fontSize: 11.5, color: TXT2, lineSpacingMultiple: 1.14 });
    y += 1.28;
  });
  s.addNotes("네 과제 중 기술적으로 가장 급한 것은 열이고, 산업 전체로 가장 오래 걸릴 것은 상호운용성입니다. 현재 양산되는 칩렛은 사실상 전부 '한 회사가 자기 다이를 쪼갠 것'이며, 서로 다른 벤더의 다이를 사서 조립하는 진짜 칩렛 마켓플레이스는 아직 없습니다. 표준이 필요조건이지만 충분조건은 아니라는 점을 강조하세요.");
}

/* ══════════════════════════════════════════════════════════════════
   10. SUMMARY  (dark)
   ══════════════════════════════════════════════════════════════════ */
{
  const s = newSlide(true);
  head(s, "Summary & Outlook", "정리와 전망", true);

  const take = [
    ["칩렛은 목적이 아니라 수단이다.", "레티클 · 수율 · 노드 원가라는 세 가지 물리적 · 경제적 제약을 우회하기 위한 선택."],
    ["분할 지점이 설계를 결정한다.", "경계를 넘는 대역폭 × pJ/bit 가 전력 예산에 들어오는 지점만 쪼갤 수 있다."],
    ["패키징이 성능의 일부가 되었다.", "범프 피치가 D2D 대역폭 밀도를 정한다. 패키지 선택은 이제 아키텍처 결정이다."],
    ["표준은 필요조건이지 충분조건이 아니다.", "UCIe가 전기 규격을 통일했으나, 이종 벤더 조립은 여전히 사업 · 검증의 문제다."],
  ];
  take.forEach((t, i) => {
    const y = 1.62 + i * 1.04;
    glyph(s, M, y + 0.07, 0.2);
    s.addText(t[0], { x: M + 0.42, y, w: 7.3, h: 0.34, margin: 0, fontFace: TF, fontSize: 15, bold: true, color: PAPER });
    s.addText(t[1], { x: M + 0.42, y: y + 0.36, w: 7.3, h: 0.5, margin: 0, fontFace: BF, fontSize: 12, color: D_TXT2, lineSpacingMultiple: 1.1 });
  });

  const rx = 8.65, rw = 4.0;
  card(s, rx, 1.55, rw, 4.35, true);
  s.addText("전망", { x: rx + 0.3, y: 1.74, w: rw - 0.6, h: 0.3, margin: 0, fontFace: TF, fontSize: 14, bold: true, color: PAPER });
  s.addText("Outlook", { x: rx + 0.3, y: 2.04, w: rw - 0.6, h: 0.24, margin: 0, fontFace: BF, fontSize: 10, italic: true, color: COPPER_L });
  const road = [
    ["~2020", "유기 기판 2D 분할이 서버 CPU에 정착"],
    ["2022 –", "2.5D 인터포저 + HBM이 AI 가속기의 기본형이 됨"],
    ["2024 –", "하이브리드 본딩 양산 진입, 패키지 캐파가 공급을 좌우"],
    ["2026 →", "UCIe 기반 이종 벤더 조립 · 광 I/O(CPO) 결합 시도"],
  ];
  road.forEach((r, i) => {
    const y = 2.5 + i * 0.86;
    s.addShape(pres.shapes.OVAL, { x: rx + 0.32, y: y + 0.06, w: 0.15, h: 0.15, fill: { color: i === 3 ? COPPER_L : SLATE_L }, line: { width: 0 } });
    if (i < 3) {
      s.addShape(pres.shapes.RECTANGLE, { x: rx + 0.386, y: y + 0.21, w: 0.018, h: 0.71, fill: { color: "3A4657" }, line: { width: 0 } });
    }
    s.addText(r[0], { x: rx + 0.62, y, w: 1.1, h: 0.26, margin: 0, fontFace: TF, fontSize: 11, bold: true, color: COPPER_L });
    s.addText(r[1], { x: rx + 0.62, y: y + 0.26, w: rw - 0.95, h: 0.55, margin: 0, fontFace: BF, fontSize: 11, color: D_TXT, lineSpacingMultiple: 1.08 });
  });

  s.addText("칩렛은 무어의 법칙을 대체하지 않는다. 미세화가 느려진 만큼을 패키지에서 벌어오는 것이다.", {
    x: M, y: 6.15, w: 11.9, h: 0.35, margin: 0, fontFace: BF, fontSize: 13, italic: true, color: COPPER_L,
  });
  s.addNotes("마무리 메시지: 칩렛은 미세화의 대안이 아니라 보완재입니다. 트랜지스터 밀도 개선이 느려진 만큼을 '같은 패키지 안에 실리콘을 더 많이, 더 싸게 넣는 것'으로 벌충하는 접근이고, 그래서 패키징 기술과 D2D 인터커넥트 효율이 앞으로 성능 경쟁의 축이 됩니다. 질의응답에서 나올 만한 것: 분할 기준, 열 문제, UCIe 실제 채택 현황, 칩렛 마켓플레이스 실현 가능성.");
}

pres.writeFile({ fileName: "chiplet-overview.pptx" }).then(() => console.log("wrote chiplet-overview.pptx"));
