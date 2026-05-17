import { useState, useMemo } from "react";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_STYLES = {
  urgent: { bg:"#2a1010", border:"#5a1a1a", text:"#E24B4A" },
  soon:   { bg:"#241c0a", border:"#5a420a", text:"#EF9F27" },
  ok:     { bg:"#0e1e0a", border:"#1a4a0a", text:"#639922" },
};

const CAR_EMOJIS = {
  SUV:"🚙", Sedan:"🚗", Hatchback:"🚗", Coupe:"🏎️",
  Estate:"🚙", Convertible:"🏎️", Van:"🚐", Pickup:"🛻",
  Electric:"⚡", Hybrid:"🔋",
};

function getCarType(car) {
  return car.type || car.style || "Sedan";
}

function getServiceIntervals(isElectric) {
  return [
    { id:"oil",      name:isElectric?"Coolant flush":"Engine oil & filter",     icon:"🛢️", category:"Engine",       kmInterval:isElectric?40000:10000,  baseCost:[isElectric?80:70, isElectric?120:110] },
    { id:"brakes",   name:"Brake pads & discs",                                 icon:"🔴", category:"Brakes",       kmInterval:40000,                    baseCost:[180,350] },
    { id:"tires",    name:"Tyre rotation & alignment",                           icon:"🔄", category:"Wheels",       kmInterval:10000,                    baseCost:[50,90] },
    { id:"air",      name:"Engine air filter",                                   icon:"💨", category:"Filters",      kmInterval:20000,                    baseCost:[25,60] },
    { id:"cabin",    name:"Cabin air filter",                                    icon:"🌬️", category:"Filters",      kmInterval:15000,                    baseCost:[20,50] },
    { id:"spark",    name:isElectric?"Battery health & cells":"Spark plugs",     icon:isElectric?"⚡":"✨", category:"Engine", kmInterval:isElectric?50000:60000, baseCost:isElectric?[150,300]:[80,200] },
    { id:"brake_fl", name:"Brake fluid",                                         icon:"🧪", category:"Fluids",       kmInterval:30000,                    baseCost:[40,80] },
    { id:"battery",  name:isElectric?"12V auxiliary battery":"Car battery",      icon:"🔋", category:"Electrical",   kmInterval:60000,                    baseCost:[80,200] },
    { id:"trans",    name:isElectric?"Motor & gearbox oil":"Transmission fluid", icon:"⚙️", category:"Transmission", kmInterval:60000,                    baseCost:[120,250] },
    { id:"wiper",    name:"Wiper blades",                                        icon:"🌧️", category:"Visibility",   kmInterval:20000,                    baseCost:[20,60] },
    { id:"coolant",  name:isElectric?"Thermal management fluid":"Coolant flush", icon:"🌡️", category:"Fluids",       kmInterval:isElectric?60000:50000,   baseCost:[isElectric?100:60, isElectric?180:120] },
    { id:"susp",     name:"Suspension & steering",                               icon:"🔩", category:"Chassis",      kmInterval:40000,                    baseCost:[80,200] },
  ];
}

function getSvcMeta(svcId, isElectric) {
  return getServiceIntervals(isElectric).find(s => s.id === svcId) || null;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
}

function StatCard({ icon, value, label, accent }) {
  return (
    <div style={{ background:"#16181e", border:"1px solid #252830", borderRadius:12, padding:"16px 20px", flex:1, minWidth:100 }}>
      <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:24, fontWeight:700, color:accent||"#e0a820", lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11, color:"#555", marginTop:4, textTransform:"uppercase", letterSpacing:".07em" }}>{label}</div>
    </div>
  );
}

function HistoryEntry({ entry, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const carEmoji = CAR_EMOJIS[getCarType(entry.car)] || "🚗";

  return (
    <div style={{ display:"flex", gap:16, position:"relative" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:36 }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:"#0e1e0a", border:"2px solid #1a4a0a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, zIndex:1, flexShrink:0 }}>
          {entry.svc.icon}
        </div>
        {!isLast && <div style={{ width:2, flex:1, background:"#1e2028", marginTop:4, minHeight:24 }}/>}
      </div>

      <div
        onClick={() => setExpanded(o => !o)}
        style={{ flex:1, background:"#16181e", border:"1px solid #252830", borderRadius:12, padding:"14px 16px", marginBottom:isLast?0:12, cursor:"pointer", transition:"border-color .15s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#e0a820"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "#252830"}
      >
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{entry.svc.name}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:"#555" }}>{carEmoji} {entry.car.make} {entry.car.model} {entry.car.year}</span>
              <span style={{ fontSize:10, color:"#888", background:"#1e2028", border:"1px solid #252830", borderRadius:20, padding:"1px 8px" }}>{entry.svc.category}</span>
            </div>
          </div>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#e0a820" }}>€{entry.svc.costMin}–{entry.svc.costMax}</div>
            <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{formatDate(entry.date)}</div>
          </div>
          <div style={{ fontSize:16, color:"#555", flexShrink:0, alignSelf:"center", transition:"transform .2s", transform:expanded?"rotate(180deg)":"none" }}>▾</div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#639922", background:"#0e1e0a", border:"1px solid #1a4a0a", borderRadius:20, padding:"2px 10px" }}>✓ Completed</span>
        </div>

        {expanded && (
          <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #252830" }}>
            <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>Service details</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <div style={{ display:"flex", gap:8, fontSize:12, color:"#888" }}>
                <span style={{ color:"#555", width:18, flexShrink:0 }}>📅</span>
                <span>Performed on {formatDate(entry.date)}</span>
              </div>
              <div style={{ display:"flex", gap:8, fontSize:12, color:"#888" }}>
                <span style={{ color:"#555", width:18, flexShrink:0 }}>🔧</span>
                <span>Service interval: every {entry.svc.kmInterval.toLocaleString()} km</span>
              </div>
              <div style={{ display:"flex", gap:8, fontSize:12, color:"#888" }}>
                <span style={{ color:"#555", width:18, flexShrink:0 }}>💶</span>
                <span>Estimated cost: €{entry.svc.costMin}–€{entry.svc.costMax}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const SELECT_STYLE = {
  background:"#0d0f12", border:"1px solid #333", borderRadius:8,
  padding:"8px 12px", fontSize:12, color:"#f0f0f0",
  fontFamily:"inherit", outline:"none", cursor:"pointer",
};

export default function History({ cars = [], allScheduled = {}, garageLoaded = false }) {
  const [filterCar, setFilterCar] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [sortDesc,  setSortDesc]  = useState(true);

  const history = useMemo(() => {
    const out = [];
    cars.forEach(car => {
      const isElectric = ["Electric","Hybrid"].includes(getCarType(car));
      const sched = allScheduled[car.id] || {};
      Object.entries(sched).forEach(([svcId, s]) => {
        if (!s?.completed) return;
        const meta = getSvcMeta(svcId, isElectric);
        if (!meta) return;
        out.push({
          car,
          svc: { ...meta, costMin:meta.baseCost[0], costMax:meta.baseCost[1] },
          date: s.date,
        });
      });
    });
    return out;
  }, [cars, allScheduled]);

  const categories = useMemo(() => {
    const cats = new Set(history.map(e => e.svc.category));
    return ["all", ...Array.from(cats).sort()];
  }, [history]);

  const filtered = useMemo(() => {
    let list = history;
    if (filterCar !== "all") list = list.filter(e => String(e.car.id) === filterCar);
    if (filterCat !== "all") list = list.filter(e => e.svc.category === filterCat);
    return [...list].sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      return sortDesc ? diff : -diff;
    });
  }, [history, filterCar, filterCat, sortDesc]);

  const totalSpendMin = history.reduce((s, e) => s + e.svc.costMin, 0);
  const uniqueCars    = new Set(history.map(e => e.car.id)).size;

  const carsWithHistory = cars.filter(c => {
    const sched = allScheduled[c.id] || {};
    return Object.values(sched).some(s => s?.completed);
  });

  if (!garageLoaded) {
    return (
      <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", minHeight:"100vh", background:"#0d0f12", color:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", color:"#555", fontSize:14 }}>
          <div style={{ fontSize:32, marginBottom:12, opacity:.4 }}>⏳</div>
          Loading service history…
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", minHeight:"100vh", background:"#0d0f12", color:"#f0f0f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        select option { background:#1a1c22; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#1a1c21; }
        ::-webkit-scrollbar-thumb { background:#333; border-radius:4px; }
      `}</style>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"28px 20px 80px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:".08em", color:"#e0a820", marginBottom:4 }}>SERVICE HISTORY</div>
          <div style={{ fontSize:13, color:"#555" }}>A complete log of all completed maintenance across your vehicles</div>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px", color:"#555" }}>
            <div style={{ fontSize:56, opacity:.3, marginBottom:16 }}>📋</div>
            <div style={{ fontSize:18, color:"#888", marginBottom:8, fontWeight:500 }}>No history yet</div>
            <div style={{ fontSize:13, lineHeight:1.7, color:"#444" }}>
              Completed services will appear here automatically.<br/>
              Go to <strong style={{ color:"#e0a820" }}>My Garage</strong>, schedule a service and mark it as done.
            </div>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
              <StatCard icon="✅" value={history.length}                        label="Services done"/>
              <StatCard icon="🚗" value={uniqueCars}                            label="Vehicles"/>
              <StatCard icon="💶" value={`€${totalSpendMin.toLocaleString()}+`} label="Est. spent" accent="#639922"/>
            </div>

            <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
              <select value={filterCar} onChange={e => setFilterCar(e.target.value)} style={SELECT_STYLE}>
                <option value="all">All vehicles</option>
                {carsWithHistory.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.make} {c.model} {c.year}</option>
                ))}
              </select>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={SELECT_STYLE}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "all" ? "All categories" : cat}</option>
                ))}
              </select>
              <button
                onClick={() => setSortDesc(d => !d)}
                style={{ ...SELECT_STYLE, background:"#16181e", border:"1px solid #252830", display:"flex", alignItems:"center", gap:6 }}
              >
                {sortDesc ? "↓ Newest first" : "↑ Oldest first"}
              </button>
              <div style={{ marginLeft:"auto", fontSize:12, color:"#555" }}>
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>

            {(() => {
              const groups = {};
              filtered.forEach(entry => {
                const d   = new Date(entry.date + "T00:00:00");
                const key = `${d.getFullYear()}-${d.getMonth()}`;
                const lbl = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
                if (!groups[key]) groups[key] = { label:lbl, entries:[] };
                groups[key].entries.push(entry);
              });

              return Object.entries(groups).map(([key, group]) => (
                <div key={key} style={{ marginBottom:28 }}>
                  <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".1em", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
                    <span>{group.label}</span>
                    <span style={{ flex:1, height:1, background:"#1e2028" }}/>
                    <span style={{ color:"#444" }}>{group.entries.length} service{group.entries.length !== 1 ? "s" : ""}</span>
                  </div>
                  {group.entries.map((entry, i) => (
                    <HistoryEntry
                      key={`${entry.car.id}-${entry.svc.id}-${entry.date}`}
                      entry={entry}
                      isLast={i === group.entries.length - 1}
                    />
                  ))}
                </div>
              ));
            })()}
          </>
        )}
      </div>
    </div>
  );
}