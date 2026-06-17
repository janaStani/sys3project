import { CAR_MODELS } from "./CarModels"; // import the shared array

const YEAR_SPAN = 2;

function AddCarModal({ onAdd, onClose, saving }) {
  const [step, setStep]           = useState(1);       // 1 | 2 | 3
  const [query, setQuery]         = useState("");
  const [selectedCar, setSelected] = useState(null);
  const [selectedYear, setYear]   = useState(null);
  const [mileage, setMileage]     = useState("");
  const [err, setErr]             = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q
      ? CAR_MODELS.filter(c => `${c.make} ${c.model}`.toLowerCase().includes(q))
      : CAR_MODELS;
  }, [query]);

  const yearOptions = useMemo(() => {
    if (!selectedCar) return [];
    const years = [];
    for (let y = selectedCar.baseYear - YEAR_SPAN; y <= selectedCar.baseYear + YEAR_SPAN; y++) years.push(y);
    return years;
  }, [selectedCar]);

  function goNext() {
    setErr("");
    if (step === 1) {
      if (!selectedCar) { setErr("Please select a car from the list."); return; }
      setYear(selectedCar.baseYear);
      setStep(2);
    } else if (step === 2) {
      if (!selectedYear) { setErr("Please select a year."); return; }
      setStep(3);
    } else {
      const km = parseInt(mileage);
      if (isNaN(km) || km < 0) { setErr("Please enter a valid mileage."); return; }
      onAdd({
        make:     selectedCar.make,
        model:    selectedCar.model,
        type:     selectedCar.type,
        fuelType: selectedCar.fuelType,
        year:     selectedYear,
        mileage:  km,
      });
    }
  }

  function goBack() {
    setErr("");
    setStep(s => s - 1);
  }

  const CAR_EMOJIS_LOCAL = {
    SUV:"🚙", Sedan:"🚗", Hatchback:"🚗", Coupe:"🏎️", Electric:"⚡", Hybrid:"🔋",
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, zIndex:200 }}>
      <div style={{ background:"#1a1c22", border:"1px solid #333", borderRadius:16, width:"100%", maxWidth:460, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ padding:"20px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4, flexShrink:0 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:600 }}>
              {step === 1 ? "Add your car" : step === 2 ? "Choose model year" : "Almost done"}
            </div>
            {/* Step dots */}
            <div style={{ display:"flex", gap:6, marginTop:8 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  width:6, height:6, borderRadius:"50%",
                  background: i < step ? "#639922" : i === step ? "#e0a820" : "#252830",
                }}/>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:24, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>

        <div style={{ padding:"14px 20px 20px", display:"flex", flexDirection:"column", gap:14, overflowY:"auto", flex:1 }}>

          {/* Step 1 — search & pick */}
          {step === 1 && (
            <>
              <div>
                <label style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:6 }}>
                  Search &amp; pick your model
                </label>
                <div style={{ position:"relative", marginBottom:10 }}>
                  <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"#555" }}>🔍</span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g. BMW X5, Golf, Supra…"
                    style={{ ...INPUT_STYLE, paddingLeft:36 }}
                  />
                </div>
                <div style={{ maxHeight:230, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                  {filtered.length === 0 && (
                    <div style={{ textAlign:"center", padding:20, color:"#555", fontSize:13 }}>No models match your search</div>
                  )}
                  {filtered.map(c => (
                    <div key={c.id} onClick={() => setSelected(c)}
                      style={{
                        display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                        borderRadius:8, border:`1px solid ${selectedCar?.id === c.id ? "#e0a820" : "#252830"}`,
                        background: selectedCar?.id === c.id ? "#1e1a08" : "#0d0f12",
                        cursor:"pointer", transition:"border-color .15s",
                      }}>
                      <div style={{ width:38, height:38, borderRadius:7, background:"#16181e", border:"1px solid #252830", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                        {CAR_EMOJIS_LOCAL[c.type] || "🚗"}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, color:"#666", marginBottom:1 }}>{c.make}</div>
                        <div style={{ fontSize:15, fontWeight:600 }}>{c.model}</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                        <span style={{ fontSize:10, borderRadius:12, padding:"2px 7px", background:"#1e2028", color:"#888", border:"1px solid #252830" }}>{c.type}</span>
                        <span style={{ fontSize:10, borderRadius:12, padding:"2px 7px", background:"#1e1a08", color:"#e0a820", border:"1px solid #4a3a10" }}>{c.basePower} hp</span>
                        <span style={{ fontSize:10, borderRadius:12, padding:"2px 7px", background: ["Hybrid","Electric"].includes(c.fuelType)?"#0e1e0a":"#1e2028", color:["Hybrid","Electric"].includes(c.fuelType)?"#639922":"#888", border:`1px solid ${["Hybrid","Electric"].includes(c.fuelType)?"#1a4a0a":"#252830"}` }}>{c.fuelType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2 — year */}
          {step === 2 && (
            <div>
              <label style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:10 }}>Model year</label>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {yearOptions.map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    style={{ background:selectedYear===y?"#e0a820":"#16181e", border:`1px solid ${selectedYear===y?"#e0a820":"#252830"}`, borderRadius:20, padding:"7px 16px", fontSize:13, cursor:"pointer", color:selectedYear===y?"#0d0f12":"#888", fontWeight:selectedYear===y?700:400, fontFamily:"inherit" }}>
                    {y}
                    {y === selectedCar?.baseYear && <span style={{ fontSize:10, marginLeft:5, opacity:.7 }}>base</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — mileage */}
          {step === 3 && (
            <>
              {/* summary card */}
              <div style={{ background:"#0d0f12", border:"1px solid #252830", borderRadius:8, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontSize:26 }}>{CAR_EMOJIS_LOCAL[selectedCar.type] || "🚗"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:"#666" }}>{selectedCar.make} · {selectedYear}</div>
                  <div style={{ fontSize:16, fontWeight:600 }}>{selectedCar.model}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                  <span style={{ fontSize:10, borderRadius:12, padding:"2px 7px", background:"#1e2028", color:"#888", border:"1px solid #252830" }}>{selectedCar.type}</span>
                  <span style={{ fontSize:10, borderRadius:12, padding:"2px 7px", background:"#1e1a08", color:"#e0a820", border:"1px solid #4a3a10" }}>{selectedCar.basePower} hp</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:".08em", display:"block", marginBottom:6 }}>Current mileage (km)</label>
                <input
                  type="number" min="0"
                  value={mileage}
                  onChange={e => setMileage(e.target.value)}
                  placeholder="e.g. 35000"
                  style={INPUT_STYLE}
                />
              </div>
            </>
          )}

          {err && (
            <div style={{ fontSize:12, color:"#E24B4A", padding:"8px 12px", background:"#2a1010", border:"1px solid #5a1a1a", borderRadius:8 }}>{err}</div>
          )}

          <div style={{ display:"flex", gap:8 }}>
            {step > 1 && (
              <button onClick={goBack} style={{ background:"#16181e", border:"1px solid #252830", borderRadius:10, padding:"12px 18px", fontSize:14, fontWeight:600, color:"#888", cursor:"pointer", fontFamily:"inherit" }}>
                ← Back
              </button>
            )}
            <button onClick={goNext} disabled={saving || (step===1 && !selectedCar) || (step===2 && !selectedYear) || (step===3 && mileage==="")}
              style={{ flex:1, background:"#e0a820", border:"none", borderRadius:10, padding:12, fontSize:15, fontWeight:700, color:"#0d0f12", cursor:"pointer", fontFamily:"inherit", opacity:(saving||(step===1&&!selectedCar)||(step===2&&!selectedYear)||(step===3&&mileage===""))?.5:1 }}>
              {saving ? "Saving…" : step < 3 ? (step===1?"Choose year →":"Enter mileage →") : "Add to my garage →"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}