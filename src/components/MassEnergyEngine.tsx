"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";

// ── DATA ──
interface Element {
  s: string; n: string; Z: number; A: number; N: number; d: number; cat: string; row: number; col: number;
}

const EL: Element[] = [
  {s:'H',n:'Hydrogen',Z:1,A:1.008,N:0,d:70.8,cat:'nonmetal',row:1,col:1},{s:'He',n:'Helium',Z:2,A:4.003,N:2,d:125,cat:'noble',row:1,col:18},{s:'Li',n:'Lithium',Z:3,A:6.941,N:4,d:534,cat:'alkali',row:2,col:1},{s:'Be',n:'Beryllium',Z:4,A:9.012,N:5,d:1850,cat:'alkaline',row:2,col:2},{s:'B',n:'Boron',Z:5,A:10.81,N:6,d:2340,cat:'metalloid',row:2,col:13},{s:'C',n:'Carbon',Z:6,A:12.011,N:6,d:2267,cat:'nonmetal',row:2,col:14},{s:'N',n:'Nitrogen',Z:7,A:14.007,N:7,d:808,cat:'nonmetal',row:2,col:15},{s:'O',n:'Oxygen',Z:8,A:15.999,N:8,d:1141,cat:'nonmetal',row:2,col:16},{s:'F',n:'Fluorine',Z:9,A:18.998,N:10,d:1696,cat:'halogen',row:2,col:17},{s:'Ne',n:'Neon',Z:10,A:20.18,N:10,d:900,cat:'noble',row:2,col:18},{s:'Na',n:'Sodium',Z:11,A:22.99,N:12,d:971,cat:'alkali',row:3,col:1},{s:'Mg',n:'Magnesium',Z:12,A:24.305,N:12,d:1738,cat:'alkaline',row:3,col:2},{s:'Al',n:'Aluminium',Z:13,A:26.982,N:14,d:2700,cat:'transition',row:3,col:13},{s:'Si',n:'Silicon',Z:14,A:28.086,N:14,d:2330,cat:'metalloid',row:3,col:14},{s:'P',n:'Phosphorus',Z:15,A:30.974,N:16,d:1820,cat:'nonmetal',row:3,col:15},{s:'S',n:'Sulfur',Z:16,A:32.06,N:16,d:2070,cat:'nonmetal',row:3,col:16},{s:'Cl',n:'Chlorine',Z:17,A:35.45,N:18,d:3210,cat:'halogen',row:3,col:17},{s:'Ar',n:'Argon',Z:18,A:39.948,N:22,d:1784,cat:'noble',row:3,col:18},{s:'K',n:'Potassium',Z:19,A:39.098,N:20,d:862,cat:'alkali',row:4,col:1},{s:'Ca',n:'Calcium',Z:20,A:40.078,N:20,d:1550,cat:'alkaline',row:4,col:2},{s:'Ti',n:'Titanium',Z:22,A:47.867,N:26,d:4507,cat:'transition',row:4,col:4},{s:'Cr',n:'Chromium',Z:24,A:51.996,N:28,d:7190,cat:'transition',row:4,col:6},{s:'Mn',n:'Manganese',Z:25,A:54.938,N:30,d:7440,cat:'transition',row:4,col:7},{s:'Fe',n:'Iron',Z:26,A:55.845,N:30,d:7874,cat:'transition',row:4,col:8},{s:'Co',n:'Cobalt',Z:27,A:58.933,N:32,d:8900,cat:'transition',row:4,col:9},{s:'Ni',n:'Nickel',Z:28,A:58.693,N:30,d:8908,cat:'transition',row:4,col:10},{s:'Cu',n:'Copper',Z:29,A:63.546,N:34,d:8960,cat:'transition',row:4,col:11},{s:'Zn',n:'Zinc',Z:30,A:65.38,N:34,d:7134,cat:'transition',row:4,col:12},{s:'Br',n:'Bromine',Z:35,A:79.904,N:44,d:3120,cat:'halogen',row:4,col:17},{s:'Kr',n:'Krypton',Z:36,A:83.798,N:48,d:3749,cat:'noble',row:4,col:18},{s:'Ag',n:'Silver',Z:47,A:107.868,N:60,d:10490,cat:'transition',row:5,col:11},{s:'Sn',n:'Tin',Z:50,A:118.71,N:68,d:7310,cat:'transition',row:5,col:14},{s:'I',n:'Iodine',Z:53,A:126.904,N:74,d:4930,cat:'halogen',row:5,col:17},{s:'Xe',n:'Xenon',Z:54,A:131.293,N:77,d:5894,cat:'noble',row:5,col:18},{s:'W',n:'Tungsten',Z:74,A:183.84,N:110,d:19250,cat:'transition',row:6,col:6},{s:'Pt',n:'Platinum',Z:78,A:195.08,N:117,d:21450,cat:'transition',row:6,col:10},{s:'Au',n:'Gold',Z:79,A:196.967,N:118,d:19300,cat:'transition',row:6,col:11},{s:'Pb',n:'Lead',Z:82,A:207.2,N:125,d:11340,cat:'transition',row:6,col:14},{s:'U',n:'Uranium',Z:92,A:238.029,N:146,d:19100,cat:'actinide',row:9,col:6},{s:'Pu',n:'Plutonium',Z:94,A:244,N:150,d:19816,cat:'actinide',row:9,col:8}
];

const CC = 299792458, C2 = CC * CC, U_KG = 1.66053906660e-27, EV = 1.602176634e-19;
const HIRO = 6.3e13, TNT_MT = 4.184e15, HOME_YR = 36e9, SHUTTLE = 1.2e13, LIGHTNING = 5e9;
const METHODS: Record<string, { eff: number; mev: number }> = {
  annihilation: { eff: 1.0, mev: 0.511 },
  fusion: { eff: 0.007, mev: 17.6 },
  fission: { eff: 0.0008, mev: 200 },
};

function fE(j: number) {
  if (j >= 1e18) return (j / 1e18).toFixed(2) + ' EJ';
  if (j >= 1e15) return (j / 1e15).toFixed(2) + ' PJ';
  if (j >= 1e12) return (j / 1e12).toFixed(2) + ' TJ';
  if (j >= 1e9) return (j / 1e9).toFixed(2) + ' GJ';
  if (j >= 1e6) return (j / 1e6).toFixed(2) + ' MJ';
  return j.toExponential(2) + ' J';
}
function fC(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toLocaleString();
}
function fSci(n: number) {
  if (!n) return '0';
  const e = Math.floor(Math.log10(Math.abs(n)));
  const m = n / Math.pow(10, e);
  const s = '\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079';
  return m.toFixed(2) + '\u00D710' + [...String(Math.abs(e))].map(d => s[+d]).join('');
}

// Build periodic table grid
function buildGrid() {
  const grid: Record<string, Element> = {};
  EL.forEach(e => { grid[e.row + '-' + e.col] = e; });
  const cells: { el: Element | null; row: number; col: number }[] = [];
  for (let r = 1; r <= 9; r++) {
    if (r === 8) continue;
    for (let c = 1; c <= 18; c++) {
      cells.push({ el: grid[r + '-' + c] || null, row: r, col: c });
    }
  }
  return cells;
}
const ptableCells = buildGrid();

export default function MassEnergyEngine() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);

  const [isDark, setIsDark] = useState(true);
  const [selIdx, setSelIdx] = useState(EL.findIndex(e => e.s === 'Fe'));
  const [method, setMethod] = useState('annihilation');
  const [mass, setMass] = useState(1.0);
  const [phase, setPhase] = useState<'idle' | 'converting' | 'reforming' | 'done'>('idle');

  // HUD state
  const [hud, setHud] = useState({
    eqEVal: '89.88 PJ', eqMVal: '1.000 kg',
    outEnergy: '0.00', outEnergyUnit: 'PJ',
    outPhotons: '0', outPerPhoton: '\u2014',
    outMassConv: '0 kg', outMassRem: '1.000 kg',
    cmpTnt: '0', cmpHiro: '0', cmpHomes: '0', cmpShuttle: '0', cmpLightning: '0',
    effPct: '100%', effWidth: '100%',
    elSym: 'Fe', elName: 'Iron-56',
    elMeta: 'Z=26 \u00B7 A=55.845<br>26 protons \u00B7 30 neutrons \u00B7 26 electrons',
    stAtoms: '1.08\u00D710\u00B2\u2075', stRadius: 'r \u2248 3.1 cm', stDensity: '7,874 kg/m\u00B3', stNucleons: '56',
    statusClass: 'matter', statusText: 'Matter at rest',
    centerHintOpacity: '1',
    showConvert: true, showReset: false, massDisabled: false,
  });

  // Compute and set HUD from current state
  const updateHUD = useCallback((sIdx: number, m: string, ms: number) => {
    const el = EL[sIdx];
    const meth = METHODS[m];
    const atomCount = ms / (el.A * U_KG);
    const totalE = ms * C2;
    const convE = totalE * meth.eff;
    const ePP = meth.mev * 1e6 * EV;
    const photons = convE / ePP;
    const realR = Math.cbrt(3 * (ms / el.d) / (4 * Math.PI));

    setHud(prev => ({
      ...prev,
      eqEVal: fE(convE), eqMVal: ms.toFixed(3) + ' kg',
      effPct: (meth.eff * 100).toFixed(meth.eff < 0.01 ? 2 : 1) + '%',
      effWidth: (meth.eff * 100) + '%',
      elSym: el.s, elName: el.n + '-' + Math.round(el.A),
      elMeta: 'Z=' + el.Z + ' \u00B7 A=' + el.A.toFixed(3) + '<br>' + el.Z + ' protons \u00B7 ' + el.N + ' neutrons \u00B7 ' + el.Z + ' electrons',
      stAtoms: fSci(atomCount),
      stRadius: 'r \u2248 ' + (realR < 0.01 ? (realR * 1000).toFixed(1) + ' mm' : realR < 1 ? (realR * 100).toFixed(1) + ' cm' : realR.toFixed(2) + ' m'),
      stDensity: el.d.toLocaleString() + ' kg/m\u00B3',
      stNucleons: String(Math.round(el.A)),
    }));

    // Store computed values for the engine
    if (engineRef.current) {
      engineRef.current.setComputedValues(meth, totalE, convE, photons);
    }
  }, []);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      if (engineRef.current) engineRef.current.setDark(next);
      return next;
    });
  }, []);

  // Element selection
  const handleSelectElement = useCallback((idx: number) => {
    setSelIdx(idx);
    setPhase(prev => {
      if (prev === 'idle' && engineRef.current) {
        engineRef.current.initParticles(mass, EL[idx]);
      }
      return prev;
    });
    updateHUD(idx, method, mass);
  }, [mass, method, updateHUD]);

  // Method selection
  const handleSelectMethod = useCallback((m: string) => {
    setMethod(m);
    updateHUD(selIdx, m, mass);
  }, [selIdx, mass, updateHUD]);

  // Mass slider
  const handleMassChange = useCallback((val: number) => {
    setMass(val);
    setPhase(prev => {
      if (prev === 'idle' && engineRef.current) {
        engineRef.current.initParticles(val, EL[selIdx]);
      }
      return prev;
    });
    updateHUD(selIdx, method, val);
  }, [selIdx, method, updateHUD]);

  // Format mass display
  const massDisplay = mass < 0.01 ? mass.toExponential(1) + ' kg' : mass < 1 ? (mass * 1000).toFixed(0) + ' g' : mass.toFixed(mass >= 1 ? 2 : 1) + ' kg';

  // Start conversion
  const startConversion = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('converting');
    setHud(prev => ({
      ...prev,
      showConvert: false, showReset: true,
      centerHintOpacity: '0',
      statusClass: 'converting', statusText: 'Converting...',
      massDisabled: true,
    }));
    if (engineRef.current) engineRef.current.startConversion();
  }, [phase]);

  // Reset
  const resetSim = useCallback(() => {
    if (phase !== 'done') return;
    setPhase('reforming');
    setHud(prev => ({
      ...prev,
      statusClass: 'converting', statusText: 'Reforming...',
    }));
    if (engineRef.current) engineRef.current.resetSim();
  }, [phase]);

  // Mount Three.js engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = createEngine(canvasRef.current, isDark, mass, EL[selIdx], METHODS[method], (updates) => {
      setPhase(updates.phase);
      setHud(prev => ({ ...prev, ...updates.hud }));
    });
    engineRef.current = engine;

    updateHUD(selIdx, method, mass);

    return () => {
      engine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="vig" />
      <div className="grid-bg" />
      <div ref={canvasRef} />
      <div className="hud">
        {/* Top bar */}
        <div className="top-bar">
          <div className="top-left">
            <div className="logo">
              <div className="logo-mark" />
              <span className="logo-text">Mass-Energy Engine</span>
            </div>
            <div className="theme-toggle" onClick={toggleTheme} title="Toggle theme" />
          </div>
          <div className="eq-main">
            <span className="e">E</span><span className="eq">=</span><span className="m">m</span><span className="c">c<sup>2</sup></span>
          </div>
          <div className="eq-live">
            <span className="hi">{hud.eqEVal}</span> = {hud.eqMVal} &times; (3.00&times;10&#x2078; m/s)&sup2;
          </div>
        </div>

        {/* Left panel */}
        <div className="left-panel">
          <div className="panel-section">
            <div className="section-title">Periodic table &mdash; pick element</div>
            <div className="ptable">
              {ptableCells.map((cell, i) => {
                if (!cell.el) return <div key={i} className="ptable-el empty" />;
                const idx = EL.indexOf(cell.el);
                return (
                  <div
                    key={i}
                    className={`ptable-el cat-${cell.el.cat}${idx === selIdx ? ' active' : ''}`}
                    title={`${cell.el.n} (Z=${cell.el.Z})`}
                    onClick={() => handleSelectElement(idx)}
                  >
                    {cell.el.s}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">Selected element</div>
            <div className="el-detail">
              <div className="el-symbol">{hud.elSym}</div>
              <div className="el-info">
                <div className="el-name">{hud.elName}</div>
                <div className="el-meta" dangerouslySetInnerHTML={{ __html: hud.elMeta }} />
              </div>
            </div>
            <div className="atom-stats">
              <div className="stat-box"><div className="stat-label">Atoms in sphere</div><div className="stat-val mass-c">{hud.stAtoms}</div></div>
              <div className="stat-box"><div className="stat-label">Sphere radius</div><div className="stat-val">{hud.stRadius}</div></div>
              <div className="stat-box"><div className="stat-label">Density</div><div className="stat-val">{hud.stDensity}</div></div>
              <div className="stat-box"><div className="stat-label">Nucleons</div><div className="stat-val">{hud.stNucleons}</div></div>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">Mass</div>
            <div className="mass-slider-wrap">
              <input
                type="range" min="0.001" max="10" step="0.001" value={mass}
                onChange={e => handleMassChange(parseFloat(e.target.value))}
                disabled={hud.massDisabled}
              />
              <div className="mass-val-display">{massDisplay}</div>
            </div>
          </div>

          <div className="panel-section">
            <div className="section-title">How to convert</div>
            <div className="method-list">
              {([
                { key: 'annihilation', name: 'Antimatter annihilation', eff: '100% of mass \u2192 energy', desc: 'Every particle meets its antiparticle. All mass becomes gamma photons.' },
                { key: 'fusion', name: 'Nuclear fusion', eff: '~0.7% of mass \u2192 energy', desc: 'Nuclei merge \u2014 how the Sun shines. Small mass defect releases huge energy.' },
                { key: 'fission', name: 'Nuclear fission', eff: '~0.08% of mass \u2192 energy', desc: 'Heavy atoms split apart \u2014 how nuclear reactors and bombs work.' },
              ]).map(m => (
                <div
                  key={m.key}
                  className={`method-btn${method === m.key ? ' active' : ''}`}
                  onClick={() => handleSelectMethod(m.key)}
                >
                  <div className="method-name">{m.name}</div>
                  <div className="method-eff">{m.eff}</div>
                  <div className="method-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="center-void">
          <div className="center-hint" style={{ opacity: hud.centerHintOpacity }}>click the sphere to convert</div>
        </div>

        {/* Right panel */}
        <div className="right-panel">
          <div className="panel-section">
            <div className="section-title">Energy released</div>
            <div className="output-big" dangerouslySetInnerHTML={{ __html: (hud.outEnergy + ' ' + hud.outEnergyUnit).replace(/ /, '<span class="unit">') + '</span>' }} />
          </div>
          <div className="panel-section">
            <div className="section-title">Gamma photons emitted</div>
            <div className="stat-val energy-c" style={{ fontSize: 15, fontWeight: 600 }}>{hud.outPhotons}</div>
            <div style={{ marginTop: 6 }}>
              <div className="stat-label">Energy per photon</div>
              <div className="stat-val" style={{ fontSize: 12 }}>{hud.outPerPhoton}</div>
            </div>
          </div>
          <div className="panel-section">
            <div className="section-title">Mass converted</div>
            <div className="stat-val energy-c" style={{ fontSize: 15, fontWeight: 600 }}>{hud.outMassConv}</div>
            <div style={{ marginTop: 6 }}>
              <div className="stat-label">Remaining mass</div>
              <div className="stat-val mass-c" style={{ fontSize: 12 }}>{hud.outMassRem}</div>
            </div>
          </div>
          <div className="panel-section">
            <div className="section-title">That&apos;s equivalent to</div>
            <div className="comparison-row"><div className="cmp-icon">&#x1F4A5;</div><div className="cmp-val">{hud.cmpTnt}</div><div className="cmp-label">megatons of TNT</div></div>
            <div className="comparison-row"><div className="cmp-icon">&#x2622;</div><div className="cmp-val">{hud.cmpHiro}</div><div className="cmp-label">Hiroshima bombs</div></div>
            <div className="comparison-row"><div className="cmp-icon">&#x1F3E0;</div><div className="cmp-val">{hud.cmpHomes}</div><div className="cmp-label">homes powered / year</div></div>
            <div className="comparison-row"><div className="cmp-icon">&#x1F680;</div><div className="cmp-val">{hud.cmpShuttle}</div><div className="cmp-label">Shuttle launches</div></div>
            <div className="comparison-row"><div className="cmp-icon">&#x26A1;</div><div className="cmp-val">{hud.cmpLightning}</div><div className="cmp-label">lightning bolts</div></div>
          </div>
          <div className="panel-section">
            <div className="section-title">Conversion efficiency</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: hud.effWidth, background: 'var(--energy)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
              <div className="stat-val energy-c" style={{ fontSize: 13 }}>{hud.effPct}</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="bottom-bar">
          <div className={`status-pill ${hud.statusClass}`}>{hud.statusText}</div>
          {hud.showConvert && <button className="btn btn-convert" onClick={startConversion}>&#x26A1; Convert</button>}
          {hud.showReset && <button className="btn btn-reset" onClick={resetSim}>&#x21BA; Reform</button>}
          <div className="speed-control">
            <span className="speed-label">Speed</span>
            <input type="range" min="0.2" max="4" step="0.1" defaultValue="1" onChange={e => { if (engineRef.current) engineRef.current.setSpeed(parseFloat(e.target.value)); }} />
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// THREE.JS ENGINE (imperative, runs in useEffect)
// ══════════════════════════════════════════════════════════════
interface EngineUpdate {
  phase: 'idle' | 'converting' | 'reforming' | 'done';
  hud: Record<string, string | boolean>;
}

function createEngine(
  container: HTMLDivElement,
  initialDark: boolean,
  initialMass: number,
  initialEl: Element,
  initialMethod: { eff: number; mev: number },
  onUpdate: (updates: EngineUpdate) => void,
) {
  let _isDark = initialDark;
  let _mass = initialMass;
  let _simSpeed = 1;
  let _phase: 'idle' | 'converting' | 'reforming' | 'done' = 'idle';
  let _progress = 0;
  let _m = initialMethod;
  let _totalE = initialMass * C2;
  let _convE = _totalE * _m.eff;
  let _photons = _convE / (_m.mev * 1e6 * EV);
  let _selEl = initialEl;
  let _disposed = false;

  const NP = 8000;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 800);
  camera.position.set(0, 0, 65);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x04060b);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:0';

  const onResize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  };
  window.addEventListener('resize', onResize);

  // Particle system
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(NP * 3);
  const col = new Float32Array(NP * 3);
  const sizes = new Float32Array(NP);
  const alphaArr = new Float32Array(NP);
  const pph = new Float32Array(NP);
  const porb = new Float32Array(NP);
  const pospd = new Float32Array(NP);
  const pang = new Float32Array(NP);
  const pexA = new Float32Array(NP);
  const pexS = new Float32Array(NP);
  const pexAy = new Float32Array(NP);
  let baseR = 12;

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alphaArr, 1));

  const vertShader = `
    attribute float size;
    attribute float alpha;
    varying vec3 vColor;
    varying float vAlpha;
    void main(){
      vColor = color;
      vAlpha = alpha;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (500.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
    }
  `;
  const fragShader = `
    varying vec3 vColor;
    varying float vAlpha;
    void main(){
      float d = length(gl_PointCoord - 0.5) * 2.0;
      if(d > 1.0) discard;
      float core = exp(-d * d * 6.0);
      float mid  = exp(-d * d * 1.8);
      float outer = exp(-d * 1.2) * 0.6;
      float haze = exp(-d * 0.7) * 0.25;
      float intensity = core * 1.8 + mid * 0.8 + outer + haze;
      vec3 c = vColor * intensity;
      c += vColor * core * 2.5;
      c += vec3(1.0,0.95,0.9) * core * core * 0.8;
      float a = vAlpha * smoothstep(1.0, 0.1, d);
      gl_FragColor = vec4(c, a);
    }
  `;
  const mat = new THREE.ShaderMaterial({
    vertexShader: vertShader, fragmentShader: fragShader,
    vertexColors: true, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Rings
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x6baaff, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const rGeo = new THREE.RingGeometry(baseR * 0.9 + i * 2, baseR * 0.95 + i * 2, 80);
    const ring = new THREE.Mesh(rGeo, ringMat.clone());
    ring.rotation.x = Math.PI / 2 + i * 0.4;
    ring.rotation.z = i * 1.2;
    ringGroup.add(ring);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const core = { scale: { setScalar(_v: number) {} }, material: { color: { copy(_c: THREE.Color) {} }, opacity: 0 } };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const outerGlow = { scale: { setScalar(_v: number) {} }, material: { color: { copy(_c: THREE.Color) {} }, opacity: 0 } };

  // Shockwaves
  const shockRings: { mesh: THREE.Mesh; r: number; speed: number; opacity: number; delay: number }[] = [];
  function addShockwave() {
    for (let k = 0; k < 3; k++) {
      const sGeo = new THREE.RingGeometry(0.1, 0.3, 64);
      const sMat = new THREE.MeshBasicMaterial({ color: k === 0 ? 0xffffff : k === 1 ? 0xff8844 : 0xff4400, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.rotation.x = Math.random() * 0.5 - 0.25;
      sMesh.rotation.y = Math.random() * 0.5 - 0.25;
      scene.add(sMesh);
      shockRings.push({ mesh: sMesh, r: 0.1, speed: 60 + k * 20, opacity: 0.8 - k * 0.2, delay: k * 0.05 });
    }
  }

  // Flash
  const flashGeo = new THREE.PlaneGeometry(200, 200);
  const flashMat2 = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const flashPlane = new THREE.Mesh(flashGeo, flashMat2);
  flashPlane.position.z = 30;
  scene.add(flashPlane);
  let flashIntensity = 0;

  // Mouse
  const mouseNDC = new THREE.Vector2(0, 0);
  const raycaster = new THREE.Raycaster();
  const onMouseMove = (e: MouseEvent) => {
    mouseNDC.x = (e.clientX / innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / innerHeight) * 2 + 1;
  };
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    mouseNDC.x = (e.touches[0].clientX / innerWidth) * 2 - 1;
    mouseNDC.y = -(e.touches[0].clientY / innerHeight) * 2 + 1;
  };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onTouchMove, { passive: false });

  function getMouseWorld() {
    raycaster.setFromCamera(mouseNDC, camera);
    const d = raycaster.ray.direction.clone().multiplyScalar(65);
    return camera.position.clone().add(d);
  }

  // Click on canvas
  const onClick = () => {
    if (_phase === 'idle') {
      const mp = getMouseWorld();
      if (mp.length() < baseR * 2.5) {
        engineStartConversion();
      }
    } else if (_phase === 'done') {
      engineResetSim();
    }
  };
  renderer.domElement.addEventListener('click', onClick);

  let shakeAmount = 0;

  function initParticlesInternal(m: number, el: Element) {
    _mass = m;
    _selEl = el;
    baseR = 6 + Math.cbrt(m) * 5;
    ringGroup.children.forEach((ring, i) => {
      (ring as THREE.Mesh).geometry.dispose();
      (ring as THREE.Mesh).geometry = new THREE.RingGeometry(baseR * 0.8 + i * 1.5, baseR * 0.85 + i * 1.5, 80);
    });
    core.scale.setScalar(baseR * 0.7);
    outerGlow.scale.setScalar(baseR * 1.8);

    for (let i = 0; i < NP; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.35) * baseR;
      porb[i] = r; pang[i] = theta; pph[i] = Math.random() * Math.PI * 2;
      pospd[i] = (0.1 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1);
      pos[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r * 0.6;
      pos[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
      pexA[i] = Math.random() * Math.PI * 2;
      pexAy[i] = (Math.random() - 0.5) * Math.PI;
      pexS[i] = 0.5 + Math.random() * 2;
      sizes[i] = 0.3 + Math.random() * 0.7;
      alphaArr[i] = 0.75 + Math.random() * 0.25;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
    geo.attributes.alpha.needsUpdate = true;
  }

  function engineStartConversion() {
    if (_phase !== 'idle') return;
    _phase = 'converting'; _progress = 0;
    const eff = _m.eff;
    for (let i = 0; i < NP; i++) {
      pexA[i] = Math.atan2(pos[i * 3 + 2], pos[i * 3]) + (Math.random() - 0.5) * 0.4;
      pexAy[i] = Math.atan2(pos[i * 3 + 1], Math.hypot(pos[i * 3], pos[i * 3 + 2])) + (Math.random() - 0.5) * 0.4;
      pexS[i] = (0.3 + Math.random() * 2.5) * (0.3 + eff * 2);
    }
    shakeAmount = 2.5;
    flashIntensity = 1.0;
    addShockwave();
    onUpdate({
      phase: 'converting',
      hud: {
        showConvert: false, showReset: true,
        centerHintOpacity: '0',
        statusClass: 'converting', statusText: 'Converting...',
        massDisabled: true,
      },
    });
  }

  function engineResetSim() {
    if (_phase !== 'done') return;
    _phase = 'reforming'; _progress = 1;
    onUpdate({
      phase: 'reforming',
      hud: { statusClass: 'converting', statusText: 'Reforming...' },
    });
  }

  function getMassColor() {
    const el = _selEl;
    if (el.s === 'Au') return new THREE.Color(1.0, 0.85, 0.2);
    if (el.s === 'Cu') return new THREE.Color(1.0, 0.6, 0.3);
    if (el.s === 'Ag') return new THREE.Color(0.8, 0.85, 0.95);
    if (el.cat === 'noble') return new THREE.Color(0.4, 0.45, 1.0);
    if (el.cat === 'alkali') return new THREE.Color(1.0, 0.35, 0.35);
    if (el.cat === 'halogen') return new THREE.Color(0.7, 0.3, 1.0);
    if (el.cat === 'actinide') return new THREE.Color(0.2, 1.0, 0.5);
    if (el.cat === 'nonmetal') return new THREE.Color(0.3, 0.8, 1.0);
    return new THREE.Color(0.42, 0.67, 1.0);
  }

  // Init
  initParticlesInternal(initialMass, initialEl);

  // Render loop
  const clock = new THREE.Clock();
  let animId: number;

  function frame() {
    if (_disposed) return;
    animId = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05) * _simSpeed;
    const t = clock.getElapsedTime();
    const eff = _m.eff;

    renderer.setClearColor(_isDark ? 0x04060b : 0xf2f0eb);

    if (_phase === 'converting') {
      _progress = Math.min(1, _progress + dt * 0.3);
      if (_progress >= 1) {
        _phase = 'done';
        onUpdate({ phase: 'done', hud: { statusClass: 'done', statusText: 'Converted' } });
      }
    } else if (_phase === 'reforming') {
      _progress = Math.max(0, _progress - dt * 0.35);
      if (_progress <= 0) {
        _phase = 'idle'; _progress = 0;
        initParticlesInternal(_mass, _selEl);
        onUpdate({
          phase: 'idle',
          hud: {
            showConvert: true, showReset: false,
            centerHintOpacity: '1',
            statusClass: 'matter', statusText: 'Matter at rest',
            massDisabled: false,
            outEnergy: '0.00', outEnergyUnit: 'PJ',
            outPhotons: '0', outPerPhoton: '\u2014',
            outMassConv: '0 kg', outMassRem: _mass.toFixed(3) + ' kg',
            cmpTnt: '0', cmpHiro: '0', cmpHomes: '0', cmpShuttle: '0', cmpLightning: '0',
          },
        });
      }
    }

    const eased = _progress < 0.5 ? 2 * _progress * _progress : 1 - Math.pow(-2 * _progress + 2, 2) / 2;
    const convCount = Math.floor(NP * eff);

    // HUD readouts during conversion
    if (_phase !== 'idle') {
      const rE = _convE * eased;
      const rM = _mass * eff * eased;
      const remM = _mass - rM;
      const rP = _photons * eased;
      const eStr = fE(rE);
      const parts = eStr.split(' ');
      onUpdate({
        phase: _phase,
        hud: {
          eqEVal: eStr,
          eqMVal: remM.toFixed(4) + ' kg',
          outEnergy: parts[0], outEnergyUnit: parts[1] || '',
          outPhotons: fSci(rP),
          outPerPhoton: _m.mev.toFixed(1) + ' MeV each',
          outMassConv: rM < 0.001 ? (rM * 1e6).toFixed(2) + ' mg' : rM.toFixed(4) + ' kg',
          outMassRem: remM.toFixed(4) + ' kg',
          cmpTnt: (rE / TNT_MT).toFixed(2),
          cmpHiro: fC(rE / HIRO),
          cmpHomes: fC(rE / HOME_YR),
          cmpShuttle: fC(rE / SHUTTLE),
          cmpLightning: fC(rE / LIGHTNING),
        },
      });
    }

    // Camera
    shakeAmount *= 0.88;
    const shakeX = (Math.random() - 0.5) * shakeAmount;
    const shakeY = (Math.random() - 0.5) * shakeAmount;
    const camAngle = t * 0.08;
    camera.position.x = Math.sin(camAngle) * 5 + mouseNDC.x * 4 + shakeX;
    camera.position.y = Math.cos(t * 0.12) * 2 + mouseNDC.y * 3 + shakeY;
    camera.position.z = 55 + Math.sin(t * 0.06) * 3;
    camera.lookAt(0, 0, 0);

    const mw = getMouseWorld();
    const mc = getMassColor();
    const coreScale = baseR * (1 - eff * eased) * 0.7;
    core.scale.setScalar(Math.max(0.1, coreScale));
    core.material.color.copy(mc);
    core.material.opacity = 0.12 + 0.06 * Math.sin(t * 2);
    outerGlow.scale.setScalar(Math.max(0.1, coreScale * 2.5));
    outerGlow.material.color.copy(mc);
    outerGlow.material.opacity = 0.04 + 0.015 * Math.sin(t * 1.5);

    // Rings
    const ringVis = Math.max(0, 1 - eased * eff * 2);
    ringGroup.children.forEach((ring, i) => {
      ring.rotation.z += (0.15 + i * 0.1) * dt;
      ring.rotation.x += 0.03 * dt;
      (ring as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>).material.color.copy(mc);
      (ring as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>).material.opacity = 0.06 * ringVis * (0.7 + 0.3 * Math.sin(t * 2 + i));
    });

    // Shockwaves
    for (let i = shockRings.length - 1; i >= 0; i--) {
      const sr = shockRings[i];
      sr.r += sr.speed * dt;
      sr.opacity -= dt * 0.5;
      if (sr.opacity <= 0) {
        scene.remove(sr.mesh);
        sr.mesh.geometry.dispose();
        (sr.mesh.material as THREE.Material).dispose();
        shockRings.splice(i, 1);
        continue;
      }
      sr.mesh.geometry.dispose();
      sr.mesh.geometry = new THREE.RingGeometry(sr.r, sr.r + 0.5 + sr.r * 0.04, 64);
      (sr.mesh.material as THREE.MeshBasicMaterial).opacity = sr.opacity * 0.7;
    }

    // Flash
    flashIntensity *= 0.9;
    if (flashIntensity > 0.001) {
      flashPlane.visible = true;
      flashMat2.opacity = flashIntensity * 0.95;
      flashMat2.color.setRGB(1.0, 0.85 + 0.15 * (1 - flashIntensity), 0.6 + 0.4 * (1 - flashIntensity));
      flashPlane.lookAt(camera.position);
    } else {
      flashPlane.visible = false;
    }

    // Particles
    for (let i = 0; i < NP; i++) {
      const i3 = i * 3;
      const isConv = i < convCount;
      const pE = isConv ? eased : 0;
      const px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];

      if (pE < 0.05) {
        pang[i] += pospd[i] * dt * (1.5 + _mass * 0.3);
        const wobble = 1 + 0.15 * Math.sin(t * 1.2 + pph[i] * 4);
        let tR = porb[i] * wobble;
        if (isConv) tR *= Math.max(0.05, 1 - eased * 5);
        tR = Math.min(tR, baseR * (isConv ? 1 - eased : 1));
        const theta = pang[i];
        const phi = pph[i] + Math.sin(t * 0.5 + pph[i] * 2) * 0.3;
        let tx = Math.cos(theta) * Math.sin(phi) * tR;
        let ty = Math.cos(phi) * tR * 0.5;
        let tz = Math.sin(theta) * Math.sin(phi) * tR;
        const mdx = px - mw.x, mdy = py - mw.y, mdz = pz - mw.z;
        const md = Math.sqrt(mdx * mdx + mdy * mdy + mdz * mdz);
        if (md < 8 && md > 0.1) {
          const f = (8 - md) / 8 * 3;
          tx += mdx / md * f; ty += mdy / md * f; tz += mdz / md * f;
        }
        pos[i3] += (tx - px) * 0.08; pos[i3 + 1] += (ty - py) * 0.08; pos[i3 + 2] += (tz - pz) * 0.08;
        const flk = 0.85 + 0.15 * Math.sin(t * 3 + pph[i] * 5);
        col[i3] = mc.r * flk; col[i3 + 1] = mc.g * flk; col[i3 + 2] = mc.b * flk;
        sizes[i] = (0.3 + 0.5 * Math.random()) * ((_isDark ? 1 : 0.8) + 0.2 * Math.sin(t * 2 + pph[i]));
        alphaArr[i] = 0.75 + 0.25 * Math.sin(t * 4 + pph[i] * 3);
      } else if (pE > 0.9 && isConv) {
        const spd = pexS[i] * 1.8;
        const dx = Math.cos(pexA[i]) * Math.cos(pexAy[i]);
        const dy = Math.sin(pexAy[i]);
        const dz = Math.sin(pexA[i]) * Math.cos(pexAy[i]);
        pos[i3] += dx * spd; pos[i3 + 1] += dy * spd; pos[i3 + 2] += dz * spd;
        const wave = Math.sin(t * 6 + pph[i] * 5) * 0.15;
        pos[i3 + 1] += wave;
        const mdx2 = pos[i3] - mw.x, mdy2 = pos[i3 + 1] - mw.y, mdz2 = pos[i3 + 2] - mw.z;
        const md2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2 + mdz2 * mdz2);
        if (md2 < 12 && md2 > 0.3) {
          const f2 = (12 - md2) / 12 * 0.8;
          pos[i3] += mdx2 / md2 * f2; pos[i3 + 1] += mdy2 / md2 * f2; pos[i3 + 2] += mdz2 / md2 * f2;
          pexA[i] += (mdz2 * Math.cos(pexA[i]) - mdx2 * Math.sin(pexA[i])) * 0.001 * (12 - md2);
        }
        const d2 = pos[i3] * pos[i3] + pos[i3 + 1] * pos[i3 + 1] + pos[i3 + 2] * pos[i3 + 2];
        if (d2 > 80 * 80) {
          const a = Math.random() * Math.PI * 2;
          const p2 = Math.acos(2 * Math.random() - 1);
          pos[i3] = Math.cos(a) * Math.sin(p2) * 2;
          pos[i3 + 1] = Math.cos(p2) * 2;
          pos[i3 + 2] = Math.sin(a) * Math.sin(p2) * 2;
        }
        const flk2 = 0.8 + 0.2 * Math.sin(t * 8 + pph[i] * 7);
        col[i3] = 1.0 * flk2; col[i3 + 1] = (0.4 + 0.2 * Math.sin(t * 3 + pph[i] * 2)) * flk2; col[i3 + 2] = 0.1 * flk2;
        sizes[i] = (0.25 + 0.6 * Math.random()) * flk2;
        alphaArr[i] = 0.6 + 0.4 * Math.sin(t * 5 + pph[i] * 4);
      } else if (isConv) {
        const spd = pexS[i] * pE * 5;
        const dx = Math.cos(pexA[i]) * Math.cos(pexAy[i]);
        const dy = Math.sin(pexAy[i]);
        const dz = Math.sin(pexA[i]) * Math.cos(pexAy[i]);
        pos[i3] += dx * spd * dt * 60; pos[i3 + 1] += dy * spd * dt * 60; pos[i3 + 2] += dz * spd * dt * 60;
        if (_phase === 'reforming') {
          const td = Math.sqrt(pos[i3] * pos[i3] + pos[i3 + 1] * pos[i3 + 1] + pos[i3 + 2] * pos[i3 + 2]);
          if (td > 0.1) {
            const pull = (1 - pE) * 1.5;
            pos[i3] += -pos[i3] / td * pull; pos[i3 + 1] += -pos[i3 + 1] / td * pull; pos[i3 + 2] += -pos[i3 + 2] / td * pull;
            const sw = (1 - pE) * 0.3;
            pos[i3] += -pos[i3 + 2] / td * sw; pos[i3 + 2] += pos[i3] / td * sw;
          }
        }
        const tt = (pE - 0.05) / 0.85;
        col[i3] = mc.r + (1.0 - mc.r) * tt;
        col[i3 + 1] = mc.g + (0.9 - mc.g) * tt;
        col[i3 + 2] = mc.b + (0.7 - mc.b) * tt;
        sizes[i] = 0.4 + tt * 0.8;
        alphaArr[i] = 0.85 + 0.15 * tt;
      }
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
    geo.attributes.alpha.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animId = requestAnimationFrame(frame);

  return {
    setDark(d: boolean) { _isDark = d; },
    setSpeed(s: number) { _simSpeed = s; },
    setComputedValues(m: { eff: number; mev: number }, totalE: number, convE: number, photons: number) {
      _m = m; _totalE = totalE; _convE = convE; _photons = photons;
    },
    initParticles(m: number, el: Element) { initParticlesInternal(m, el); },
    startConversion() { engineStartConversion(); },
    resetSim() { engineResetSim(); },
    dispose() {
      _disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
