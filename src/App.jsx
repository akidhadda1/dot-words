import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { sGet, sSet } from "./storage";

// ---- Sound effects ----
async function ensureAudio() { if (Tone.context.state !== "running") await Tone.start(); }
async function sfxCorrect() {
  await ensureAudio();
  const s = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.15, sustain: 0.1, release: 0.3 } }).toDestination();
  s.volume.value = -8; const t = Tone.now();
  s.triggerAttackRelease("C5", "16n", t); s.triggerAttackRelease("E5", "16n", t + 0.1); s.triggerAttackRelease("G5", "16n", t + 0.2);
  setTimeout(() => s.dispose(), 1500);
}
async function sfxWrong() {
  await ensureAudio();
  const s = new Tone.Synth({ oscillator: { type: "square" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.05, release: 0.2 } }).toDestination();
  s.volume.value = -14; const t = Tone.now();
  s.triggerAttackRelease("D3", "16n", t); s.triggerAttackRelease("Db3", "16n", t + 0.12);
  setTimeout(() => s.dispose(), 1000);
}
async function sfxHint() {
  await ensureAudio();
  const s = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.2 } }).toDestination();
  s.volume.value = -10; const t = Tone.now();
  s.triggerAttackRelease("E4", "32n", t); s.triggerAttackRelease("B4", "32n", t + 0.07);
  setTimeout(() => s.dispose(), 800);
}

// ---- Themes (~200 words each) ----
const THEMES = {
  "Movies": [
    "TITANIC","JAWS","CASABLANCA","PSYCHO","GLADIATOR","ROCKY","ALIEN","ALIENS",
    "SCARFACE","GOODFELLAS","INCEPTION","GODFATHER","MATRIX","AVATAR","BRAVEHEART",
    "GREASE","BAMBI","DUMBO","ALADDIN","FANTASIA","PINOCCHIO","CINDERELLA",
    "GHOSTBUSTERS","BEETLEJUICE","CLUELESS","ROBOCOP","PREDATOR","TERMINATOR",
    "RAMBO","MOANA","FROZEN","COCO","SHREK","SPEED","INTERSTELLAR","PARASITE",
    "GRAVITY","JUNO","CORALINE","TANGLED","BRAVE","RATATOUILLE","MULAN","DUNKIRK",
    "JOKER","ZOOTOPIA","ENCANTO","OPPENHEIMER","BARBIE","NEMO","ANCHORMAN",
    "AIRPLANE","ANASTASIA","AQUAMAN","BLADE","BORAT","BRIDESMAIDS","CASINO",
    "CARRIE","CREED","DEADPOOL","DUNE","FARGO","FLASHDANCE","FOOTLOOSE","GANDHI",
    "GHOST","GOLDENEYE","GREMLINS","HAIRSPRAY","HALLOWEEN","HANCOCK","HERCULES",
    "HOLES","HOOK","HULK","JUMANJI","KONG","LABYRINTH","LUCA","LUCY","MADAGASCAR",
    "MALEFICENT","MASK","MATILDA","MAVERICK","MEGAMIND","MISERY","NAPOLEON","NOAH",
    "NOPE","PADDINGTON","PHILADELPHIA","PLATOON","POCAHONTAS","POLTERGEIST",
    "SCREAM","SIGNS","SKYFALL","SMILE","SOUL","SPECTRE","SPLIT","SULLY","SUPERBAD",
    "TAKEN","TARZAN","THOR","TROY","TWISTER","UNFORGIVEN","VENOM","WICKED",
    "WOLVERINE","WONDER","LINCOLN","ONWARD","ELEMENTAL","SALT","WANTED","BOLT",
    "CARS","CRUELLA","ENCHANTED","ELF","WHIPLASH","ARRIVAL","SPOTLIGHT","MEMENTO",
  ],
  "Countries": [
    "AFGHANISTAN","ALBANIA","ALGERIA","ANDORRA","ANGOLA","ARGENTINA","ARMENIA",
    "AUSTRALIA","AUSTRIA","AZERBAIJAN","BAHAMAS","BAHRAIN","BANGLADESH","BARBADOS",
    "BELARUS","BELGIUM","BELIZE","BENIN","BHUTAN","BOLIVIA","BOTSWANA","BRAZIL",
    "BRUNEI","BULGARIA","BURUNDI","CAMBODIA","CAMEROON","CANADA","CHAD","CHILE",
    "CHINA","COLOMBIA","COMOROS","CONGO","CROATIA","CUBA","CYPRUS","DENMARK",
    "DJIBOUTI","DOMINICA","ECUADOR","EGYPT","ERITREA","ESTONIA","ESWATINI",
    "ETHIOPIA","FIJI","FINLAND","FRANCE","GABON","GAMBIA","GEORGIA","GERMANY",
    "GHANA","GREECE","GRENADA","GUATEMALA","GUINEA","GUYANA","HAITI","HONDURAS",
    "HUNGARY","ICELAND","INDIA","INDONESIA","IRAN","IRAQ","IRELAND","ISRAEL",
    "ITALY","JAMAICA","JAPAN","JORDAN","KAZAKHSTAN","KENYA","KIRIBATI","KUWAIT",
    "KYRGYZSTAN","LAOS","LATVIA","LEBANON","LESOTHO","LIBERIA","LIBYA",
    "LIECHTENSTEIN","LITHUANIA","LUXEMBOURG","MADAGASCAR","MALAWI","MALAYSIA",
    "MALDIVES","MALI","MALTA","MAURITANIA","MAURITIUS","MEXICO","MICRONESIA",
    "MOLDOVA","MONACO","MONGOLIA","MONTENEGRO","MOROCCO","MOZAMBIQUE","MYANMAR",
    "NAMIBIA","NAURU","NEPAL","NETHERLANDS","NICARAGUA","NIGER","NIGERIA",
    "NORWAY","OMAN","PAKISTAN","PALAU","PANAMA","PARAGUAY","PERU","PHILIPPINES",
    "POLAND","PORTUGAL","QATAR","ROMANIA","RUSSIA","RWANDA","SAMOA","SENEGAL",
    "SERBIA","SEYCHELLES","SINGAPORE","SLOVAKIA","SLOVENIA","SOMALIA","SPAIN",
    "SUDAN","SURINAME","SWEDEN","SWITZERLAND","SYRIA","TAIWAN","TAJIKISTAN",
    "TANZANIA","THAILAND","TOGO","TONGA","TUNISIA","TURKEY","TURKMENISTAN",
    "TUVALU","UGANDA","UKRAINE","URUGUAY","UZBEKISTAN","VANUATU","VENEZUELA",
    "VIETNAM","YEMEN","ZAMBIA","ZIMBABWE",
  ],
  "Foods": [
    "PIZZA","SUSHI","TACOS","RAMEN","CROISSANT","PAELLA","DUMPLING","BURRITO",
    "TIRAMISU","RISOTTO","PRETZEL","FALAFEL","CHURROS","GYOZA","GELATO","PASTA",
    "CURRY","STEAK","SALMON","LOBSTER","PANCAKES","WAFFLES","HUMMUS","KEBAB",
    "TEMPURA","PESTO","GNOCCHI","LASAGNA","RAVIOLI","CEVICHE","KIMCHI","TOFU",
    "MOCHI","CREPE","QUICHE","FONDUE","BIRYANI","SOUVLAKI","EMPANADA","PIEROGI",
    "BAKLAVA","SHAWARMA","BRUSCHETTA","CALZONE","GAZPACHO","NACHOS","EDAMAME",
    "NOODLES","DOUGHNUT","BROWNIE","TRUFFLE","GRANOLA","BRIOCHE","TARTARE",
    "COUSCOUS","TAGINE","POLENTA","GOULASH","SCHNITZEL","STRUDEL","BAGUETTE",
    "CIABATTA","FOCACCIA","QUESADILLA","ENCHILADA","TAMALE","GUACAMOLE",
    "CROQUETTE","PROFITEROLE","MACARON","MERINGUE","SOUFFLE","PARFAIT","GANACHE",
    "MOUSSE","PRALINE","MARZIPAN","CANNOLI","BISCOTTI","AFFOGATO","ANTIPASTO",
    "CARPACCIO","PROSCIUTTO","PANCETTA","HALLOUMI","TZATZIKI","SAMOSA","PAKORA",
    "TANDOORI","VINDALOO","KORMA","MASALA","CHUTNEY","PANEER","CHAPATI",
    "PARATHA","SATAY","RENDANG","LAKSA","CONGEE","WONTON","TERIYAKI","WASABI",
    "MISO","UDON","SOBA","SASHIMI","YAKITORI","TONKATSU","TAKOYAKI","MATCHA",
    "BORSCHT","STROGANOFF","KIELBASA","POUTINE","CHOWDER","GUMBO","JAMBALAYA",
    "BEIGNET","CORNBREAD","BRISKET","COBBLER","ESPRESSO","CAPPUCCINO","LATTE",
    "KOMBUCHA","KEFIR","YOGURT","GRANITA","SORBET","CUSTARD","PUDDING","TOFFEE",
    "FUDGE","NOUGAT","ECLAIR","SCONE","MUFFIN","BAGEL","CHALLAH","SOURDOUGH",
    "PUMPERNICKEL","FLATBREAD","LAVASH","AREPA","PUPUSA","CINNAMON","TURMERIC",
    "PAPRIKA","SAFFRON","CARDAMOM","CUMIN","FENNEL","OREGANO","ROSEMARY",
    "TARRAGON","NUTMEG","VANILLA","CARAMEL","BUTTERSCOTCH","CHOCOLATE",
    "PISTACHIO","HAZELNUT","ALMOND","WALNUT","CASHEW","ARUGULA","ASPARAGUS",
    "ARTICHOKE","AVOCADO","KOHLRABI","EGGPLANT","ZUCCHINI","PARSNIP","RUTABAGA",
    "RADICCHIO","ENDIVE","SHALLOT","LEMONGRASS","GALANGAL","GINGER","SUMAC",
    "SRIRACHA","HARISSA","CHIMICHURRI","ROMESCO","TAPENADE","AIOLI","BECHAMEL",
    "HOLLANDAISE","BOLOGNESE","MARINARA","CARBONARA","PUTTANESCA","AGLIO",
  ],
};

// ---- Constants ----
const REVEAL = [0.025, 0.045, 0.07, 0.11, 0.18, 0.28, 0.45];
const MAX_HINTS = REVEAL.length - 1;
const BASE = 1000, HINT_PEN = 150, WRONG_PEN = 100, FLOOR = 100, PER_GAME = 10;
const CW = 680, CH = 200, CELL = 7;
const todayStr = () => new Date().toISOString().slice(0, 10);

// ---- Utilities ----
function rng(seed) { let s = Math.abs(seed) || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function dailySeed() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
function shuffle(arr, r) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function dailyWords(key) { return shuffle(THEMES[key], rng(dailySeed() + key.charCodeAt(0) * 100)).slice(0, PER_GAME); }

// ---- Edge detection ----
function findEdges(word, w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  let fs = 150;
  ctx.font = `900 ${fs}px Arial, Helvetica, sans-serif`;
  while (ctx.measureText(word).width > w * 0.88 && fs > 24) { fs -= 2; ctx.font = `900 ${fs}px Arial, Helvetica, sans-serif`; }
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(word, w / 2, h / 2);
  const img = ctx.getImageData(0, 0, w, h).data;
  const on = (x, y) => x >= 0 && x < w && y >= 0 && y < h && img[(y * w + x) * 4 + 3] > 128;
  const edges = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    if (on(x, y) && (!on(x-1,y) || !on(x+1,y) || !on(x,y-1) || !on(x,y+1))) edges.push([x, y]);
  return edges;
}

// ---- Grid-based even distribution ----
function distribute(rawEdges, seed) {
  const r = rng(seed);
  const cells = {};
  for (const [x, y] of rawEdges) {
    const k = (Math.floor(x / CELL) * 1000) + Math.floor(y / CELL);
    if (!cells[k]) cells[k] = [];
    cells[k].push([x, y]);
  }
  const reps = [], rest = [];
  for (const k of Object.keys(cells)) {
    const pts = cells[k]; const pick = Math.floor(r() * pts.length);
    reps.push(pts[pick]);
    for (let i = 0; i < pts.length; i++) if (i !== pick) rest.push(pts[i]);
  }
  return [...shuffle(reps, r), ...shuffle(rest, r)];
}

// ---- Drawing ----
function drawDots(canvas, dots) {
  const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, CW, CH);
  ctx.shadowColor = "rgba(255,248,220,0.5)"; ctx.shadowBlur = 5; ctx.fillStyle = "#FFF5D6";
  for (const [x, y] of dots) { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.shadowBlur = 0;
}

// ---- Styles ----
const ST = {
  page: { minHeight: "100vh", background: "#0D1520", color: "#F0ECE2", fontFamily: "'Inter',system-ui,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: 24 },
  center: { justifyContent: "center" },
  sub: { fontSize: 12, letterSpacing: 5, textTransform: "uppercase", color: "#66778A", marginBottom: 6 },
  h1: { fontSize: 46, fontWeight: 800, margin: "0 0 6px", letterSpacing: -1 },
  muted: { color: "#66778A", fontSize: 14, textAlign: "center", maxWidth: 380, marginBottom: 36, lineHeight: 1.5 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", maxWidth: 380 },
  themeBtn: { padding: "18px 14px", background: "#162032", border: "1px solid #243248", borderRadius: 12, color: "#F0ECE2", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" },
  themeDone: { padding: "18px 14px", background: "#0F1A12", border: "1px solid #1A3A24", borderRadius: 12, color: "#66778A", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" },
  canvasWrap: { background: "#080E18", borderRadius: 14, padding: 10, marginBottom: 18, border: "1px solid #162032" },
  canvas: { display: "block", maxWidth: "100%", height: "auto", borderRadius: 6 },
  input: { flex: 1, padding: "12px 16px", background: "#162032", border: "1px solid #243248", borderRadius: 10, color: "#F0ECE2", fontSize: 16, outline: "none" },
  btnBlue: { padding: "12px 22px", background: "#2563EB", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 },
  btnHint: (on) => ({ padding: "12px 14px", background: on ? "#342A0E" : "#162032", border: "1px solid " + (on ? "#5C4A1A" : "#243248"), borderRadius: 10, color: on ? "#FBBF24" : "#3A4A5C", fontWeight: 600, cursor: on ? "pointer" : "default", fontSize: 14, whiteSpace: "nowrap" }),
  btnSkip: { padding: "12px 14px", background: "#162032", border: "1px solid #243248", borderRadius: 10, color: "#66778A", fontWeight: 500, cursor: "pointer", fontSize: 14 },
  btnGreen: { padding: "14px 32px", background: "#16803C", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 16 },
  btnGhost: { padding: "10px 20px", background: "transparent", border: "1px solid #243248", borderRadius: 10, color: "#66778A", cursor: "pointer", fontSize: 13 },
  row: { display: "flex", gap: 8, marginBottom: 16, width: "100%", maxWidth: 540 },
  lbRow: (hl) => ({ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: hl ? "#0F2418" : "#162032", borderRadius: 10, marginBottom: 5, border: "1px solid " + (hl ? "#1A3A24" : "#243248") }),
};

// ============================================================
export default function DotWordGame() {
  const [phase, setPhase] = useState("menu");
  const [theme, setTheme] = useState(null);
  const [words, setWords] = useState([]);
  const [wi, setWi] = useState(0);
  const [hints, setHints] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [guess, setGuess] = useState("");
  const [scores, setScores] = useState([]);
  const [fb, setFb] = useState(null);
  const [solved, setSolved] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [edges, setEdges] = useState([]);
  const [pName, setPName] = useState("");
  const [lb, setLb] = useState([]);
  const [played, setPlayed] = useState({});
  const cvRef = useRef(null);
  const inRef = useRef(null);

  const word = words[wi] || "";
  const total = scores.reduce((a, b) => a + b, 0);
  const potential = Math.max(FLOOR, BASE - hints * HINT_PEN - wrongs * WRONG_PEN);

  // Check played themes on mount
  useEffect(() => {
    (async () => {
      const d = todayStr(), done = {};
      for (const t of Object.keys(THEMES)) {
        const v = await sGet(`done:${d}:${t}`, false);
        if (v) try { done[t] = JSON.parse(v); } catch {}
      }
      setPlayed(done);
    })();
  }, []);

  // Compute edges when word changes
  useEffect(() => {
    if (!word || phase !== "playing") return;
    const seed = dailySeed() + wi * 777 + word.charCodeAt(0);
    setEdges(distribute(findEdges(word, CW, CH), seed));
    setHints(0); setWrongs(0); setGuess(""); setFb(null); setSolved(false); setSkipped(false); setShowFull(false);
  }, [word, phase]);

  // Draw dots
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv || !edges.length) return;
    const frac = showFull ? 1 : REVEAL[Math.min(hints, REVEAL.length - 1)];
    drawDots(cv, edges.slice(0, Math.ceil(edges.length * frac)));
  }, [edges, hints, showFull]);

  // Focus input
  useEffect(() => {
    if (phase === "playing" && !solved && !skipped) setTimeout(() => inRef.current?.focus(), 50);
  }, [phase, solved, skipped, wi]);

  // ---- Storage ----
  async function loadLb(t) {
    const raw = await sGet(`lb:${todayStr()}:${t}`, true);
    setLb(raw ? JSON.parse(raw) : []);
  }
  async function saveLb(name, sc, t) {
    const raw = await sGet(`lb:${todayStr()}:${t}`, true);
    let entries = raw ? JSON.parse(raw) : [];
    entries.push({ name, score: sc, time: Date.now() });
    entries.sort((a, b) => b.score - a.score);
    entries = entries.slice(0, 25);
    await sSet(`lb:${todayStr()}:${t}`, JSON.stringify(entries), true);
    setLb(entries);
  }
  async function markPlayed(t, sc) {
    await sSet(`done:${todayStr()}:${t}`, JSON.stringify({ score: sc }), false);
    setPlayed(p => ({ ...p, [t]: { score: sc } }));
  }

  // ---- Actions ----
  function start(t) {
    if (played[t]) { setTheme(t); loadLb(t); setPhase("lb"); return; }
    setTheme(t); setWords(dailyWords(t)); setWi(0); setScores([]); setPhase("playing"); setPName(""); loadLb(t);
  }
  function doGuess() {
    if (!guess.trim()) return;
    if (guess.trim().toUpperCase() === word) {
      const sc = Math.max(FLOOR, BASE - hints * HINT_PEN - wrongs * WRONG_PEN);
      setScores(p => [...p, sc]); setSolved(true); setShowFull(true); setFb({ ok: true, sc }); setGuess(""); sfxCorrect();
    } else {
      setWrongs(p => p + 1); setFb({ ok: false, t: guess.trim().toUpperCase() }); setGuess(""); sfxWrong();
    }
  }
  function doHint() { if (hints < MAX_HINTS) { setHints(p => p + 1); setFb(null); sfxHint(); } }
  function doSkip() { setSkipped(true); setShowFull(true); setScores(p => [...p, 0]); setFb({ ok: false, skip: true }); }
  function next() { wi + 1 >= PER_GAME ? setPhase("over") : setWi(p => p + 1); }
  async function submit() {
    if (!pName.trim()) return;
    await saveLb(pName.trim(), total, theme); await markPlayed(theme, total); setPhase("lb");
  }
  async function skipSubmit() { await markPlayed(theme, total); setPhase("menu"); }

  // ========== RENDER ==========

  if (phase === "menu") return (
    <div style={{ ...ST.page, ...ST.center }}>
      <div style={ST.sub}>Daily Challenge</div>
      <h1 style={ST.h1}>DOT WORDS</h1>
      <p style={ST.muted}>Guess the word from its dot outline. Use hints to reveal more dots, but each one costs you points.</p>
      <div style={ST.grid}>
        {Object.keys(THEMES).map(t => {
          const done = played[t];
          return (
            <button key={t} onClick={() => start(t)} style={done ? ST.themeDone : ST.themeBtn}
              onMouseEnter={e => { if (!done) { e.currentTarget.style.background = "#1E2E44"; e.currentTarget.style.borderColor = "#3A5068"; }}}
              onMouseLeave={e => { if (!done) { e.currentTarget.style.background = "#162032"; e.currentTarget.style.borderColor = "#243248"; }}}>
              <div>{t}</div>
              {done && <div style={{ fontSize: 11, color: "#4ADE80", marginTop: 4 }}>Played today · {done.score} pts</div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (phase === "playing") return (
    <div style={ST.page}>
      <div style={{ width: "100%", maxWidth: 700, display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#66778A", letterSpacing: 2, textTransform: "uppercase" }}>{theme}</span>
        <span style={{ fontSize: 12, color: "#66778A" }}>Word {wi + 1} / {PER_GAME}</span>
      </div>
      <div style={{ width: "100%", maxWidth: 700, display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#556677" }}>Total: <b style={{ color: "#F0ECE2" }}>{total}</b></span>
        <span style={{ fontSize: 13, color: "#556677" }}>This word: <b style={{ color: "#FBBF24" }}>{potential}</b></span>
      </div>

      <div style={ST.canvasWrap}>
        <canvas ref={cvRef} width={CW} height={CH} style={ST.canvas} />
      </div>

      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 3 }}>
        {word.split("").map((ch, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 20, height: 28,
            borderBottom: (solved || skipped) ? "2px solid #FBBF24" : "2px solid #2A3A4E",
            color: (solved || skipped) ? "#FBBF24" : "transparent",
            fontWeight: 700, fontSize: 15,
          }}>
            {(solved || skipped) ? ch : "\u00A0"}
          </span>
        ))}
        <span style={{ marginLeft: 8, fontSize: 12, color: "#556677" }}>({word.length})</span>
      </div>

      {!(solved || skipped) ? (
        <div style={ST.row}>
          <input ref={inRef} value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && doGuess()} placeholder="Type your guess..." style={ST.input} />
          <button onClick={doGuess} style={ST.btnBlue}>Guess</button>
          <button onClick={doHint} disabled={hints >= MAX_HINTS} style={ST.btnHint(hints < MAX_HINTS)}>
            Hint&nbsp;({MAX_HINTS - hints})
          </button>
          <button onClick={doSkip} style={ST.btnSkip}>Skip</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2 }}>{word}</div>
          <button onClick={next} style={ST.btnGreen}>{wi + 1 >= PER_GAME ? "See Results" : "Next Word →"}</button>
        </div>
      )}

      {fb && (
        <div style={{ fontSize: 14, fontWeight: 600, color: fb.ok ? "#4ADE80" : fb.skip ? "#FBBF24" : "#F87171", marginTop: 4 }}>
          {fb.ok ? `Correct! +${fb.sc} points` : fb.skip ? `Skipped! The word was ${word}.` : `"${fb.t}" is not right.`}
        </div>
      )}

      <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
        {Array.from({ length: MAX_HINTS }).map((_, i) => (
          <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < hints ? "#FBBF24" : "#162032", border: "1px solid #243248" }} />
        ))}
      </div>
    </div>
  );

  if (phase === "over") return (
    <div style={{ ...ST.page, ...ST.center }}>
      <div style={ST.sub}>Challenge Complete</div>
      <h2 style={{ fontSize: 44, fontWeight: 800, margin: "0 0 4px" }}>{total}</h2>
      <p style={{ color: "#66778A", marginBottom: 28, fontSize: 14 }}>points across {PER_GAME} words</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
        {scores.map((sc, i) => (
          <div key={i} style={{ background: "#162032", borderRadius: 8, padding: "8px 12px", textAlign: "center", minWidth: 48 }}>
            <div style={{ fontSize: 11, color: "#556677" }}>#{i+1}</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: sc >= 800 ? "#4ADE80" : sc >= 400 ? "#FBBF24" : sc === 0 ? "#556677" : "#F87171" }}>{sc}</div>
          </div>
        ))}
      </div>
      <p style={{ color: "#66778A", fontSize: 13, marginBottom: 10 }}>Enter your name for the leaderboard:</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input value={pName} onChange={e => setPName(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Your name" style={{ ...ST.input, width: 180 }} />
        <button onClick={submit} style={ST.btnBlue}>Submit</button>
      </div>
      <button onClick={skipSubmit} style={ST.btnGhost}>Skip & Return to Menu</button>
    </div>
  );

  if (phase === "lb") return (
    <div style={{ ...ST.page, ...ST.center }}>
      <div style={ST.sub}>Today's Leaderboard</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 20px" }}>{theme}</h2>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {lb.length === 0 ? (
          <p style={{ color: "#556677", textAlign: "center" }}>No scores yet today. Be the first to submit!</p>
        ) : lb.map((e, i) => (
          <div key={i} style={ST.lbRow(i === 0)}>
            <div><span style={{ color: "#556677", marginRight: 10, fontWeight: 700 }}>#{i+1}</span><span style={{ fontWeight: 600 }}>{e.name}</span></div>
            <span style={{ fontWeight: 700, color: i === 0 ? "#4ADE80" : "#FBBF24" }}>{e.score}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setPhase("menu")} style={{ ...ST.btnBlue, marginTop: 28 }}>Back to Menu</button>
    </div>
  );

  return null;
}
