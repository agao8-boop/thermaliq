// ─── Direction 2 · Living Glass ─────────────────────────────────────────────
// Layered frosted glass on a soft mesh of mint/sky/peach. Soft tactile depth
// inspired by the user's references. Zones rendered as an isometric building.

const G = {
  inkDeep: '#1B2A2A',
  ink:     '#243333',
  ink70:   'rgba(36,51,51,0.70)',
  ink55:   'rgba(36,51,51,0.55)',
  ink35:   'rgba(36,51,51,0.35)',
  ink15:   'rgba(36,51,51,0.15)',
  ink08:   'rgba(36,51,51,0.08)',
  mint:    '#7DB8A1',
  mintDeep:'#3F7F66',
  teal:    '#5E9DA4',
  amber:   '#C9905E',
  rust:    '#B5604B',
  sky:     '#84B6CC',
  white:   'rgba(255,255,255,0.78)',
  whiteHi: 'rgba(255,255,255,0.92)',
  whiteLo: 'rgba(255,255,255,0.55)',
  sans:    "'Geist', 'Inter Tight', system-ui, sans-serif",
  mono:    "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace",
};

const gStatus = { OK: G.mintDeep, WARN: G.amber, HOT: G.rust, COLD: G.sky };

// Background mesh — soft blurry orbs on a pale mint canvas
function GMesh({ children }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: 'linear-gradient(155deg, #E8F1EA 0%, #DEEAEE 45%, #F2EAD9 100%)',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          radial-gradient(closest-side at 12% 18%, rgba(125,184,161,0.55), transparent 70%),
          radial-gradient(closest-side at 90% 8%, rgba(132,182,204,0.45), transparent 65%),
          radial-gradient(closest-side at 75% 92%, rgba(201,144,94,0.30), transparent 65%),
          radial-gradient(closest-side at 30% 78%, rgba(95,158,164,0.30), transparent 60%)
        `,
        filter: 'blur(0px)',
      }} />
      {/* Soft grain */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35, mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
      }} />
      {children}
    </div>
  );
}

// Glass surface primitive
function GGlass({ children, style, strong, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: strong ? G.whiteHi : G.white,
      backdropFilter: 'blur(28px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
      border: '1px solid rgba(255,255,255,0.85)',
      borderRadius: 24,
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 50px -32px rgba(31,53,52,0.30), 0 1px 2px rgba(31,53,52,0.05)',
      position: 'relative',
      ...style,
    }}>{children}</div>
  );
}
function GLabel({ children, style }) {
  return <div style={{ fontFamily: G.sans, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: G.ink55, ...style }}>{children}</div>;
}

// Top mode toggle — inspired by user reference 1
function GToggle({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex', padding: 4, background: G.ink, borderRadius: 999,
      boxShadow: '0 8px 22px -12px rgba(31,53,52,0.5)',
    }}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <span key={opt} onClick={() => onChange && onChange(opt)} style={{
            padding: '8px 18px', borderRadius: 999, fontFamily: G.sans, fontSize: 12, letterSpacing: '0.02em',
            background: active ? G.whiteHi : 'transparent', color: active ? G.inkDeep : 'rgba(255,255,255,0.9)',
            fontWeight: active ? 600 : 400, cursor: 'pointer',
            boxShadow: active ? '0 4px 14px -6px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.95) inset' : 'none',
            transition: 'all .2s',
          }}>{opt}</span>
        );
      })}
    </div>
  );
}

// ── AI Director sidebar — glass, ambient ────────────────────────────────────
function GSidebar({ onPick }) {
  return (
    <div style={{ width: 304, flexShrink: 0, padding: 18, position: 'relative', zIndex: 2 }}>
      <GGlass style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 28, height: 28, borderRadius: 999, background: `radial-gradient(circle at 30% 30%, ${G.mint}, ${G.mintDeep})`, boxShadow: '0 4px 12px -4px rgba(63,127,102,0.5), 0 1px 0 rgba(255,255,255,0.9) inset' }} />
          <div>
            <div style={{ fontFamily: G.sans, fontSize: 13, color: G.ink, fontWeight: 600 }}>AI Director</div>
            <div style={{ fontFamily: G.mono, fontSize: 9, color: G.mintDeep }}>● listening</div>
          </div>
        </div>

        <div style={{ fontSize: 13, lineHeight: 1.55, color: G.ink, fontFamily: G.sans }}>
          Three quiet wins ready for you this morning. Carbon target is{' '}
          <span style={{ color: G.mintDeep, fontWeight: 600 }}>78% met</span>; let's close the gap before the afternoon peak.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {AI_QUEUE.slice(0, 3).map((a) => (
            <div key={a.id} onClick={() => onPick && onPick(a)} style={{
              position: 'relative', padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
              background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: G.ink, fontWeight: 600 }}>{a.title}</span>
                <span style={{ fontFamily: G.mono, fontSize: 9, color: G.mintDeep, background: `${G.mint}22`, padding: '2px 7px', borderRadius: 999 }}>
                  −{a.impact_kg.toFixed(1)}kg
                </span>
              </div>
              <div style={{ fontSize: 11, color: G.ink70, lineHeight: 1.5 }}>{a.rationale.slice(0, 92)}…</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                <span style={{ fontFamily: G.mono, fontSize: 9, color: G.ink55 }}>{a.eta} · {a.confidence}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 6px 6px 14px',
            background: 'rgba(255,255,255,0.55)', borderRadius: 999, border: '1px solid rgba(255,255,255,0.85)',
          }}>
            <input placeholder="Ask…" style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: G.sans, fontSize: 12, color: G.ink, padding: '6px 0',
            }} />
            <button style={{
              width: 32, height: 32, borderRadius: 999, border: 'none',
              background: `radial-gradient(circle at 30% 30%, ${G.mint}, ${G.mintDeep})`,
              color: 'white', fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 12px -4px rgba(63,127,102,0.6), 0 1px 0 rgba(255,255,255,0.7) inset',
            }}>→</button>
          </div>
        </div>
      </GGlass>
    </div>
  );
}

// Big number tile — glass
function GMetric({ label, value, unit, sub, accent = G.mintDeep }) {
  return (
    <GGlass style={{ padding: '16px 18px' }}>
      <GLabel>{label}</GLabel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
        <span style={{ fontFamily: G.sans, fontSize: 30, color: accent, fontWeight: 600, letterSpacing: '-0.02em' }}>{value}</span>
        {unit && <span style={{ fontSize: 11, color: G.ink55 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 10, color: G.ink55, marginTop: 4 }}>{sub}</div>}
    </GGlass>
  );
}

// Decarbonization hero — glass + radial progress
function GCarbonHero() {
  const pctOfTarget = KPI.carbon_avoided_kg_m2 / KPI.carbon_target_kg_m2;
  const r = 80, c = 2 * Math.PI * r;
  return (
    <GGlass style={{ padding: '24px 26px', display: 'grid', gridTemplateColumns: '1fr 200px', gap: 18 }} strong>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <GLabel>Decarbonization · YTD</GLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span style={{ fontFamily: G.sans, fontSize: 56, color: G.inkDeep, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>26.4</span>
          <span style={{ fontSize: 14, color: G.ink55 }}>tCO₂e avoided</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <span style={{ padding: '3px 9px', borderRadius: 999, fontFamily: G.mono, fontSize: 10, color: G.mintDeep, background: `${G.mint}28` }}>−38.7% vs baseline</span>
          <span style={{ padding: '3px 9px', borderRadius: 999, fontFamily: G.mono, fontSize: 10, color: G.ink70, background: 'rgba(255,255,255,0.5)' }}>Target 68.2t · year end</span>
        </div>

        {/* Mini stacked progress: today */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: G.ink70 }}>Today’s mix</span>
            <span style={{ fontFamily: G.mono, fontSize: 10, color: G.ink55 }}>{(KPI.passive_kwh + KPI.nbs_kwh).toFixed(1)} / {(KPI.passive_kwh + KPI.nbs_kwh + KPI.active_kwh).toFixed(1)} kWh</span>
          </div>
          <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.85)' }}>
            <div style={{ flex: KPI.passive_kwh, background: G.mintDeep }} />
            <div style={{ flex: KPI.nbs_kwh,     background: G.mint }} />
            <div style={{ flex: KPI.active_kwh,  background: G.ink15 }} />
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontFamily: G.sans, fontSize: 10, color: G.ink70 }}>
            <span><span style={{ width: 8, height: 8, background: G.mintDeep, display: 'inline-block', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />Passive 32.4 kWh</span>
            <span><span style={{ width: 8, height: 8, background: G.mint, display: 'inline-block', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />NBS 8.2 kWh</span>
            <span><span style={{ width: 8, height: 8, background: G.ink15, display: 'inline-block', borderRadius: 2, marginRight: 6, verticalAlign: 'middle' }} />Active 244 kWh</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Glass orb backdrop */}
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(125,184,161,0.35) 60%, transparent 75%)`,
          filter: 'blur(2px)',
        }} />
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: 'relative' }}>
          <defs>
            <linearGradient id="gRing" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%"  stopColor={G.mint} />
              <stop offset="100%" stopColor={G.mintDeep} />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={r} stroke="rgba(255,255,255,0.85)" strokeWidth="10" fill="none" />
          <circle cx="100" cy="100" r={r} stroke="url(#gRing)" strokeWidth="10" fill="none" strokeLinecap="round"
            strokeDasharray={`${c * pctOfTarget} ${c}`} transform="rotate(-90 100 100)"
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontFamily: G.sans, fontSize: 42, color: G.inkDeep, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {Math.round(pctOfTarget * 100)}<span style={{ fontSize: 16, color: G.ink55 }}>%</span>
          </div>
          <div style={{ fontFamily: G.sans, fontSize: 10, color: G.ink55, marginTop: 6, letterSpacing: '0.12em' }}>OF DAILY TARGET</div>
        </div>
      </div>
    </GGlass>
  );
}

// ── Isometric building visualization ────────────────────────────────────────
function GIsometricBuilding({ selectedId, onSelect }) {
  // Render floors stacked. Each floor is a parallelogram. Zones drawn as colored polygons within.
  const W = 460, H = 320;
  const cx = W / 2, baseY = H * 0.78;
  const fW = 260, fD = 110; // floor width & depth
  // Project (xf, yf, zf) -> screen
  const proj = (xf, yf, zf) => [cx + (xf - 0.5) * fW + (yf - 0.5) * fD * 0.45, baseY - zf * 36 - (yf - 0.5) * fD * 0.42];

  // Build floor list — only show floors 2,3,4,6 (we have those)
  const floors = [2, 3, 4, 6];
  const zonesByFloor = (f) => ZONES.filter(z => z.floor === f);

  return (
    <GGlass style={{ padding: '20px 22px 12px' }} strong>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <GLabel>Building condition</GLabel>
          <div style={{ fontFamily: G.sans, fontSize: 18, color: G.ink, marginTop: 4, fontWeight: 500 }}>
            6 zones · live
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, fontFamily: G.mono, fontSize: 9 }}>
          {[['OK', G.mintDeep], ['Warn', G.amber], ['Hot', G.rust], ['Cold', G.sky]].map(([l, c]) => (
            <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, color: G.ink55 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 0 3px ${c}22` }} />{l}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
          {/* Ground shadow */}
          <ellipse cx={cx} cy={baseY + 28} rx={fW * 0.55} ry={14} fill="rgba(31,53,52,0.10)" />
          {floors.map((f, idx) => {
            const z = idx;
            const [tl] = [proj(0, 0, z + 0.9)];
            const corners = [
              proj(0, 0, z + 0.9), proj(1, 0, z + 0.9),
              proj(1, 1, z + 0.9), proj(0, 1, z + 0.9),
            ];
            const cornersBot = [
              proj(0, 0, z + 0.0), proj(1, 0, z + 0.0),
              proj(1, 1, z + 0.0), proj(0, 1, z + 0.0),
            ];
            // Floor slab
            const top = `M ${corners[0]} L ${corners[1]} L ${corners[2]} L ${corners[3]} Z`;
            // Side faces (front-right + front-left)
            const frontR = `M ${corners[1]} L ${corners[2]} L ${cornersBot[2]} L ${cornersBot[1]} Z`;
            const frontL = `M ${corners[0]} L ${corners[3]} L ${cornersBot[3]} L ${cornersBot[0]} Z`;
            const floorZones = zonesByFloor(f);
            return (
              <g key={f}>
                <path d={frontL} fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.85)" />
                <path d={frontR} fill="rgba(255,255,255,0.30)" stroke="rgba(255,255,255,0.7)" />
                <path d={top} fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.95)" />

                {floorZones.map(zn => {
                  // Place each zone as a colored rectangle on the floor top
                  const c = gStatus[zn.status];
                  const x0 = zn.x, x1 = zn.x + zn.w, y0 = zn.y, y1 = zn.y + zn.h;
                  const p = [proj(x0, y0, z + 0.9), proj(x1, y0, z + 0.9), proj(x1, y1, z + 0.9), proj(x0, y1, z + 0.9)];
                  const path = `M ${p[0]} L ${p[1]} L ${p[2]} L ${p[3]} Z`;
                  const sel = zn.id === selectedId;
                  return (
                    <g key={zn.id} onClick={() => onSelect && onSelect(zn.id)} style={{ cursor: 'pointer' }}>
                      <path d={path} fill={c} fillOpacity={sel ? 0.7 : 0.40} stroke={c} strokeWidth={sel ? 1.5 : 0.5} strokeOpacity={0.9} />
                      {/* Vertical pulse light on hot zones */}
                      {zn.status === 'HOT' && (
                        <line x1={p[0][0] + (p[2][0] - p[0][0]) / 2} y1={p[0][1] + (p[2][1] - p[0][1]) / 2}
                              x2={p[0][0] + (p[2][0] - p[0][0]) / 2} y2={p[0][1] + (p[2][1] - p[0][1]) / 2 - 22}
                              stroke={c} strokeWidth="1" opacity="0.8" />
                      )}
                    </g>
                  );
                })}
                {/* Floor label */}
                <text x={cornersBot[0][0] - 8} y={(corners[0][1] + cornersBot[0][1]) / 2 + 4}
                  fontFamily={G.mono} fontSize="10" fill={G.ink55} textAnchor="end">F{f}</text>
              </g>
            );
          })}
        </svg>

        {/* Tiny annotation pills floating over hot zones */}
        <div style={{ position: 'absolute', top: 28, right: 18, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.85)', border: `1px solid ${G.rust}44`, fontFamily: G.mono, fontSize: 10, color: G.rust, boxShadow: '0 6px 14px -8px rgba(31,53,52,0.3)' }}>
          Roof terrace · 82.4°F
        </div>
      </div>
    </GGlass>
  );
}

// ── Drill-in glass sheet ────────────────────────────────────────────────────
function GZoneSheet({ zone, onClose }) {
  if (!zone) return null;
  const c = gStatus[zone.status];
  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 400, padding: 18, zIndex: 10,
      animation: 'gSlide 320ms cubic-bezier(.2,.7,.1,1)',
    }}>
      <style>{`@keyframes gSlide { from { transform: translateX(40px); opacity: 0 } to { transform: none; opacity: 1 } }`}</style>
      <GGlass strong style={{ height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: G.sans }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <GLabel>Zone detail</GLabel>
            <div style={{ fontSize: 22, color: G.inkDeep, fontWeight: 600, marginTop: 6, letterSpacing: '-0.01em' }}>{zone.name}</div>
            <div style={{ fontSize: 11, color: G.ink55, marginTop: 2 }}>F{zone.floor} · {zone.area} m² · {zone.occ} people</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.7)',
            color: G.ink, cursor: 'pointer', boxShadow: '0 4px 12px -6px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.95) inset',
          }}>×</button>
        </div>

        {/* Big number */}
        <div style={{
          position: 'relative', padding: '20px 22px', borderRadius: 18,
          background: `linear-gradient(155deg, ${c}30, ${c}10)`,
          border: '1px solid rgba(255,255,255,0.85)', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: G.sans, fontSize: 56, color: c, fontWeight: 600, letterSpacing: '-0.03em' }}>{zone.temp.toFixed(1)}</span>
            <span style={{ fontSize: 18, color: c }}>°F</span>
            <span style={{ marginLeft: 'auto', fontFamily: G.mono, fontSize: 11, color: G.ink55 }}>SP {zone.sp}°F</span>
          </div>
          <div style={{ fontSize: 11, color: G.ink70, marginTop: 4 }}>{zone.status === 'HOT' ? `+${(zone.temp - zone.sp).toFixed(1)}°F above setpoint` : 'within band'}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[{ l: 'RH', v: `${zone.rh}%` }, { l: 'CO₂', v: `${zone.co2}` }, { l: 'Comfort', v: `${zone.comfort}%` }].map(m => (
            <div key={m.l} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.55)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.85)' }}>
              <div style={{ fontSize: 9, letterSpacing: '0.12em', color: G.ink55, textTransform: 'uppercase' }}>{m.l}</div>
              <div style={{ fontFamily: G.mono, fontSize: 15, color: G.ink, marginTop: 4 }}>{m.v}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 14, background: 'rgba(255,255,255,0.55)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.85)' }}>
          <GLabel>AI says</GLabel>
          <div style={{ fontSize: 13, color: G.ink, marginTop: 6, lineHeight: 1.55 }}>
            Run indirect evaporative pre-cool for 30 min. Expecting <span style={{ color: G.mintDeep, fontWeight: 600 }}>−2.4°F</span> and <span style={{ color: G.mintDeep, fontWeight: 600 }}>3.5 kg CO₂e</span> saved.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button style={{
              flex: 1, padding: '11px 0', borderRadius: 999, border: 'none', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: `linear-gradient(180deg, ${G.mint}, ${G.mintDeep})`,
              boxShadow: '0 6px 14px -6px rgba(63,127,102,0.6), 0 1px 0 rgba(255,255,255,0.4) inset',
            }}>Approve · run now</button>
            <button style={{
              padding: '11px 16px', borderRadius: 999, border: '1px solid rgba(36,51,51,0.15)',
              background: 'rgba(255,255,255,0.7)', color: G.ink70, fontSize: 12, cursor: 'pointer',
            }}>Hold</button>
          </div>
        </div>

        <div style={{ marginTop: 'auto', fontFamily: G.mono, fontSize: 10, color: G.ink35 }}>
          BMS · last write 11:42 · setpoint = {zone.sp}°F
        </div>
      </GGlass>
    </div>
  );
}

// ── Admin layout ────────────────────────────────────────────────────────────
function LivingGlassAdmin({ openZoneId = null }) {
  const [sel, setSel] = React.useState(openZoneId);
  const zone = ZONES.find(z => z.id === sel);
  return (
    <div style={{ width: 1280, height: 820, overflow: 'hidden', position: 'relative', fontFamily: G.sans, color: G.ink, fontSize: 12 }}>
      <GMesh>
        <div style={{ display: 'flex', height: '100%' }}>
          <GSidebar onPick={() => setSel('z-003')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '18px 18px 18px 0' }}>
            {/* Top */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 22, color: G.inkDeep, fontWeight: 700, letterSpacing: '-0.02em' }}>thermal·iq</span>
                <span style={{ color: G.ink15 }}>·</span>
                <span style={{ fontSize: 12, color: G.ink70 }}>Meridian Tower</span>
              </div>
              <GToggle value="Admin" options={['Admin', 'Occupant']} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: G.mono, fontSize: 10, color: G.ink55 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: G.mint, boxShadow: `0 0 0 3px ${G.mint}33` }} />
                  BMS LIVE
                </span>
                <span>420 gCO₂/kWh</span>
                <span>10:42 AM</span>
              </div>
            </div>

            {/* Main */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <GCarbonHero />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <GMetric label="Carbon today" value="17.1" unit="kg CO₂e" sub="avoided · 2 zones" />
                  <GMetric label="AI intercepts" value="6" unit="actions" sub="2 awaiting you" accent={G.amber} />
                  <GMetric label="Comfort events" value="8" unit="vs 11 avg" sub="−27% week-on-week" />
                </div>
                <GGlass style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <GLabel>AI Director queue</GLabel>
                      <div style={{ fontFamily: G.sans, fontSize: 15, color: G.ink, marginTop: 4, fontWeight: 500 }}>4 interventions today</div>
                    </div>
                    <span style={{ fontSize: 11, color: G.ink55 }}>tap to drill in →</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {AI_QUEUE.map(a => (
                      <div key={a.id} onClick={() => setSel('z-003')} style={{
                        padding: '10px 12px', borderRadius: 14, cursor: 'pointer',
                        background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: G.ink }}>{a.title}</span>
                          <span style={{ fontFamily: G.mono, fontSize: 9, color: G.mintDeep, background: `${G.mint}22`, padding: '2px 7px', borderRadius: 999 }}>−{a.impact_kg.toFixed(1)}kg</span>
                        </div>
                        <div style={{ fontSize: 10, color: G.ink70 }}>{a.eta} · {a.priority}</div>
                      </div>
                    ))}
                  </div>
                </GGlass>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <GIsometricBuilding selectedId={sel} onSelect={setSel} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <GGlass style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setSel('z-006')}>
                    <GLabel>Passive strategies</GLabel>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 26, color: G.mintDeep, fontWeight: 600 }}>5</span>
                      <span style={{ fontSize: 11, color: G.ink55 }}>/ 6 active</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {PASSIVE.map(p => <div key={p.id} style={{ width: 16, height: 4, borderRadius: 2, background: p.active ? G.mintDeep : G.ink15 }} />)}
                    </div>
                  </GGlass>
                  <GGlass style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setSel('z-001')}>
                    <GLabel>Nature-based</GLabel>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 26, color: G.amber, fontWeight: 600 }}>1</span>
                      <span style={{ fontSize: 11, color: G.ink55 }}>asset needs water</span>
                    </div>
                    <div style={{ fontFamily: G.mono, fontSize: 10, color: G.ink55, marginTop: 8 }}>Green roof · 28% VWC</div>
                  </GGlass>
                </div>
              </div>
            </div>
          </div>
          {zone && <GZoneSheet zone={zone} onClose={() => setSel(null)} />}
        </div>
      </GMesh>
    </div>
  );
}

// ── Occupant — glassy, AI-first ─────────────────────────────────────────────
function LivingGlassOccupant() {
  return (
    <div style={{ width: 460, height: 820, overflow: 'hidden', position: 'relative', fontFamily: G.sans, color: G.ink, fontSize: 12 }}>
      <GMesh>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '22px 20px 20px' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: G.ink55 }}>Hello, Mia</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: G.inkDeep, marginTop: 2 }}>North Office · F3</div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: 999,
              background: `radial-gradient(circle at 30% 30%, ${G.mint}, ${G.mintDeep})`,
              boxShadow: '0 6px 14px -6px rgba(63,127,102,0.5), 0 1px 0 rgba(255,255,255,0.9) inset',
            }} />
          </div>

          {/* Hero comfort glass */}
          <div style={{ marginTop: 18 }}>
            <GGlass strong style={{ padding: '22px 24px' }}>
              <GLabel>Your air right now</GLabel>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: G.sans, fontSize: 56, fontWeight: 600, color: G.amber, letterSpacing: '-0.03em', lineHeight: 1 }}>74.2</span>
                    <span style={{ fontSize: 16, color: G.amber }}>°F</span>
                  </div>
                  <div style={{ fontSize: 11, color: G.ink55, marginTop: 4 }}>+2.2° above your target</div>
                </div>
                <div style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: `${G.amber}22`, color: G.amber,
                }}>a touch warm</div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                {[{ l: 'RH', v: '44%' }, { l: 'CO₂', v: '820' }, { l: 'Air', v: 'Calm' }].map(x => (
                  <div key={x.l} style={{ flex: 1, padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)' }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.12em', color: G.ink55, textTransform: 'uppercase' }}>{x.l}</div>
                    <div style={{ fontFamily: G.mono, fontSize: 14, color: G.ink, marginTop: 2 }}>{x.v}</div>
                  </div>
                ))}
              </div>
            </GGlass>
          </div>

          {/* AI status banner */}
          <div style={{ marginTop: 14 }}>
            <GGlass style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: `radial-gradient(circle at 30% 30%, ${G.mint}, ${G.mintDeep})`,
                boxShadow: '0 4px 12px -4px rgba(63,127,102,0.5), 0 1px 0 rgba(255,255,255,0.9) inset',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: G.ink }}>
                  Already nudging supply −1.5°F and deploying shading.
                </div>
                <div style={{ fontSize: 10, color: G.mintDeep, marginTop: 4, fontWeight: 600 }}>Resolving in ~8 min · no action needed</div>
              </div>
            </GGlass>
          </div>

          {/* Chat thread */}
          <div style={{ flex: 1, marginTop: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {OCCUPANT_CONVO.slice(1).map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'AI' ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  maxWidth: '88%', padding: '11px 14px', fontSize: 12, lineHeight: 1.55,
                  borderRadius: m.role === 'AI' ? '6px 18px 18px 18px' : '18px 6px 18px 18px',
                  background: m.role === 'AI' ? 'rgba(255,255,255,0.8)' : `linear-gradient(180deg, ${G.mint}, ${G.mintDeep})`,
                  color: m.role === 'AI' ? G.ink : 'white',
                  border: m.role === 'AI' ? '1px solid rgba(255,255,255,0.85)' : 'none',
                  boxShadow: m.role === 'AI' ? '0 1px 0 rgba(255,255,255,0.95) inset' : '0 6px 14px -6px rgba(63,127,102,0.5)',
                }}>{m.text}</div>
              </div>
            ))}
          </div>

          {/* Quick reactions */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 0' }}>
            {OCCUPANT_QUICK.map(q => (
              <span key={q.id} style={{
                padding: '8px 14px', fontSize: 11, color: G.ink70, cursor: 'pointer',
                background: 'rgba(255,255,255,0.65)', borderRadius: 999, border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset',
              }}>{q.label}</span>
            ))}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 16px',
            background: 'rgba(255,255,255,0.75)', borderRadius: 999, border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset, 0 6px 16px -10px rgba(31,53,52,0.2)',
          }}>
            <input placeholder="Tell the director…" style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: G.sans, fontSize: 13, color: G.ink, padding: '10px 0',
            }} />
            <button style={{
              width: 40, height: 40, borderRadius: 999, border: 'none', color: 'white',
              background: `radial-gradient(circle at 30% 30%, ${G.mint}, ${G.mintDeep})`,
              cursor: 'pointer', fontSize: 14,
              boxShadow: '0 6px 14px -6px rgba(63,127,102,0.6), 0 1px 0 rgba(255,255,255,0.7) inset',
            }}>→</button>
          </div>
        </div>
      </GMesh>
    </div>
  );
}

Object.assign(window, { LivingGlassAdmin, LivingGlassOccupant });
