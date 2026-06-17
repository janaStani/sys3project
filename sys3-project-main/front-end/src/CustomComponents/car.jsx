import { useState, useMemo } from "react";

// General reference data for each car model. `baseYear` is the anchor
// year the spec numbers below are accurate for; specs for any other
// selectable year are derived from it in getYearSpecs().
const CAR_MODELS = [
  { id: 1,  make: "BMW",        model: "X5",       type: "SUV",       baseYear: 2023, basePower: 380, basePrice: 68000,  fuelType: "Petrol",  engine: "3.0L turbocharged inline-6",          drivetrain: "All-wheel drive (xDrive)",        doors: 5, seats: 5, baseConsumption: 10.5, description: "BMW's flagship mid-size SUV — a blend of luxury, off-road capability and sharp on-road handling." },
  { id: 2,  make: "BMW",        model: "M3",       type: "Sedan",     baseYear: 2022, basePower: 480, basePrice: 78000,  fuelType: "Petrol",  engine: "3.0L twin-turbo inline-6 (S58)",      drivetrain: "Rear-wheel drive",                doors: 4, seats: 5, baseConsumption: 11.2, description: "The benchmark sports sedan — track-ready performance with everyday usability." },
  { id: 3,  make: "BMW",        model: "i4",       type: "Electric",  baseYear: 2024, basePower: 340, basePrice: 58000,  fuelType: "Electric", engine: "Single electric motor",              drivetrain: "Rear-wheel drive (eDrive)",       doors: 4, seats: 5, batteryKWh: 80, baseRange: 480, description: "BMW's electric Gran Coupé, pairing combustion-era driving dynamics with a zero-emission drivetrain." },
  { id: 4,  make: "Audi",       model: "A4",       type: "Sedan",     baseYear: 2022, basePower: 190, basePrice: 46000,  fuelType: "Petrol",  engine: "2.0L turbocharged inline-4",          drivetrain: "Front-wheel drive (quattro optional)", doors: 4, seats: 5, baseConsumption: 7.0,  description: "A compact executive sedan known for understated styling and a refined cabin." },
  { id: 5,  make: "Audi",       model: "Q5",       type: "SUV",       baseYear: 2023, basePower: 265, basePrice: 52000,  fuelType: "Petrol",  engine: "2.0L turbocharged inline-4",          drivetrain: "All-wheel drive (quattro)",       doors: 5, seats: 5, baseConsumption: 8.6,  description: "A compact luxury SUV balancing comfort, tech and all-weather capability." },
  { id: 6,  make: "Audi",       model: "R8",       type: "Coupe",     baseYear: 2021, basePower: 570, basePrice: 165000, fuelType: "Petrol",  engine: "5.2L naturally aspirated V10",        drivetrain: "All-wheel drive (quattro)",       doors: 2, seats: 2, baseConsumption: 13.5, description: "Audi's halo supercar — a naturally aspirated V10 in an everyday-usable package." },
  { id: 7,  make: "Mercedes",   model: "C-Class",  type: "Sedan",     baseYear: 2023, basePower: 255, basePrice: 50000,  fuelType: "Petrol",  engine: "2.0L turbocharged inline-4",          drivetrain: "Rear-wheel drive",                doors: 4, seats: 5, baseConsumption: 7.4,  description: "Mercedes' compact executive sedan, offering S-Class tech in a smaller footprint." },
  { id: 8,  make: "Mercedes",   model: "G-Class",  type: "SUV",       baseYear: 2022, basePower: 422, basePrice: 145000, fuelType: "Petrol",  engine: "4.0L twin-turbo V8",                  drivetrain: "All-wheel drive (permanent 4MATIC)", doors: 5, seats: 5, baseConsumption: 13.2, description: "An icon of go-anywhere luxury — boxy styling, serious off-road hardware." },
  { id: 9,  make: "Mercedes",   model: "S-Class",  type: "Sedan",     baseYear: 2024, basePower: 367, basePrice: 118000, fuelType: "Petrol",  engine: "3.0L turbocharged inline-6, mild hybrid", drivetrain: "Rear-wheel drive",            doors: 4, seats: 5, baseConsumption: 8.4,  description: "Mercedes' flagship luxury sedan, setting the benchmark for comfort and in-car technology." },
  { id: 10, make: "Volkswagen", model: "Golf GTI", type: "Hatchback", baseYear: 2022, basePower: 245, basePrice: 33000,  fuelType: "Petrol",  engine: "2.0L turbocharged inline-4",          drivetrain: "Front-wheel drive",               doors: 5, seats: 5, baseConsumption: 7.6,  description: "The original hot hatch — a practical daily driver with genuine performance credentials." },
  { id: 11, make: "Volkswagen", model: "Tiguan",   type: "SUV",       baseYear: 2023, basePower: 200, basePrice: 34000,  fuelType: "Petrol",  engine: "2.0L turbocharged inline-4",          drivetrain: "Front-wheel drive (AWD optional)", doors: 5, seats: 5, baseConsumption: 8.1,  description: "A practical compact SUV built for families, with a spacious and well-equipped cabin." },
  { id: 12, make: "Toyota",     model: "Corolla",  type: "Sedan",     baseYear: 2022, basePower: 122, basePrice: 25000,  fuelType: "Hybrid",  engine: "1.8L hybrid (petrol-electric)",       drivetrain: "Front-wheel drive",               doors: 4, seats: 5, baseConsumption: 4.4,  description: "One of the world's best-selling sedans — efficient, reliable and cheap to run." },
  { id: 13, make: "Toyota",     model: "RAV4",     type: "SUV",       baseYear: 2023, basePower: 219, basePrice: 32000,  fuelType: "Hybrid",  engine: "2.5L hybrid (petrol-electric)",       drivetrain: "All-wheel drive (E-Four hybrid)", doors: 5, seats: 5, baseConsumption: 5.6,  description: "A hybrid SUV with strong real-world fuel economy and confident all-weather grip." },
  { id: 14, make: "Toyota",     model: "Supra",    type: "Coupe",     baseYear: 2023, basePower: 382, basePrice: 56000,  fuelType: "Petrol",  engine: "3.0L turbocharged inline-6",          drivetrain: "Rear-wheel drive",                doors: 2, seats: 2, baseConsumption: 8.8,  description: "Toyota's revived sports coupé — a rear-drive grand tourer with sharp handling." },
  { id: 15, make: "Ford",       model: "Mustang",  type: "Coupe",     baseYear: 2022, basePower: 480, basePrice: 47000,  fuelType: "Petrol",  engine: "5.0L naturally aspirated V8",         drivetrain: "Rear-wheel drive",                doors: 2, seats: 4, baseConsumption: 12.4, description: "America's quintessential muscle car — V8 power and rear-drive theatre." },
  { id: 16, make: "Ford",       model: "Kuga",     type: "SUV",       baseYear: 2023, basePower: 190, basePrice: 35000,  fuelType: "Hybrid",  engine: "2.5L hybrid (petrol-electric)",       drivetrain: "Front-wheel drive (AWD optional)", doors: 5, seats: 5, baseConsumption: 5.4,  description: "A family-friendly hybrid SUV focused on efficiency and everyday usability." },
];

const CAR_IMAGES = {
  "BMW X5":            "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  "BMW M3":            "https://images.unsplash.com/photo-1617531653332-bd46c16f3adf?w=800&q=80",
  "BMW i4":            "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
  "Audi A4":           "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
  "Audi Q5":           "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&q=80",
  "Audi R8":           "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80",
  "Mercedes C-Class":  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  "Mercedes G-Class":  "https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&q=80",
  "Mercedes S-Class":  "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&q=80",
  "Volkswagen Golf GTI": "https://images.unsplash.com/photo-1541443131876-9b69e6e3afab?w=800&q=80",
  "Volkswagen Tiguan":   "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
  "Toyota Corolla":    "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80",
  "Toyota RAV4":       "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800&q=80",
  "Toyota Supra":      "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80",
  "Ford Mustang":      "https://images.unsplash.com/photo-1584345604476-8ec5f452d1f2?w=800&q=80",
  "Ford Kuga":         "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
};

const MAKES = ["All", ...Array.from(new Set(CAR_MODELS.map(c => c.make))).sort()];
const YEAR_SPAN = 2; // how many years before/after baseYear are selectable

// Derives plausible specs for any selectable year from a model's base specs.
function getYearSpecs(model, year) {
  const diff = year - model.baseYear;
  const isElectric = model.fuelType === "Electric";
  const powerStep = isElectric ? 8 : model.fuelType === "Hybrid" ? 4 : 5;

  const power = Math.max(80, Math.round(model.basePower + diff * powerStep));
  const price = Math.max(15000, Math.round(model.basePrice * (1 + 0.025 * diff)));
  const zeroToHundred = Math.max(2.5, +(13.5 - power / 45).toFixed(1));

  const efficiency = isElectric
    ? { label: "Range", value: `${Math.max(150, Math.round((model.baseRange || 400) + diff * 15))} km` }
    : { label: "Fuel economy", value: `${Math.max(3.5, +(model.baseConsumption - diff * 0.1).toFixed(1))} L/100km` };

  return { diff, power, price, zeroToHundred, efficiency };
}

function getYearHighlight(diff) {
  if (diff === 0) return "Current model year — specification shown as standard.";
  if (diff > 0)   return "Projected update — expect refinements to power, efficiency and equipment.";
  if (diff <= -2) return "Earlier model year — different equipment levels and fewer driver-assist features.";
  return "Previous model year — minor trim and equipment differences.";
}

function FactItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#ccc", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SpecCard({ label, value }) {
  return (
    <div className="stat-box">
      <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#e0a820" }}>{value}</div>
    </div>
  );
}

export default function CarModels() {
  const [view, setView] = useState("select"); // "select" | "detail"
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMake, setFilterMake] = useState("All");
  const [imgError, setImgError] = useState(false);

  const filteredModels = useMemo(() => {
    return CAR_MODELS.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || `${c.make} ${c.model}`.toLowerCase().includes(q);
      const matchMake = filterMake === "All" || c.make === filterMake;
      return matchQ && matchMake;
    });
  }, [searchQuery, filterMake]);

  function handleSelectModel(model) {
    setSelectedModel(model);
    setSelectedYear(model.baseYear);
    setImgError(false);
    setView("detail");
  }

  const specs = useMemo(() => {
    if (!selectedModel || selectedYear == null) return null;
    return getYearSpecs(selectedModel, selectedYear);
  }, [selectedModel, selectedYear]);

  const imgSrc = selectedModel ? CAR_IMAGES[`${selectedModel.make} ${selectedModel.model}`] || "" : "";

  if (view === "select") {
    return (
      <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0d0f12", color: "#f0f0f0" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #1a1c21; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
          .car-tile { background: #16181e; border: 1px solid #252830; border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; }
          .car-tile:hover { border-color: #e0a820; transform: translateY(-2px); }
          .make-pill { background: #1e2028; border: 1px solid #2e3040; border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer; color: #aaa; transition: all 0.15s; white-space: nowrap; }
          .make-pill.active { background: #e0a820; border-color: #e0a820; color: #0d0f12; font-weight: 600; }
          .search-in { background: #16181e; border: 1px solid #252830; border-radius: 10px; padding: 10px 14px 10px 38px; font-size: 14px; color: #f0f0f0; outline: none; width: 100%; font-family: inherit; }
          .search-in::placeholder { color: #555; }
          .search-in:focus { border-color: #e0a820; }
        `}</style>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 60px" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: "0.08em", color: "#e0a820", lineHeight: 1 }}>
              CARCARE
            </div>
            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
              Browse general specifications for popular models — pick one to see how specs change by year
            </div>
          </div>

          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#555" }}>🔍</span>
            <input
              className="search-in"
              placeholder="Search make or model…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
            {MAKES.map(m => (
              <button key={m} className={`make-pill${filterMake === m ? " active" : ""}`} onClick={() => setFilterMake(m)}>{m}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {filteredModels.map(m => (
              <div key={m.id} className="car-tile" onClick={() => handleSelectModel(m)}>
                <div style={{
                  height: 80, borderRadius: 8, marginBottom: 12, overflow: "hidden",
                  background: "#0d0f12", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {CAR_IMAGES[`${m.make} ${m.model}`] ? (
                    <img
                      src={CAR_IMAGES[`${m.make} ${m.model}`]}
                      alt={`${m.make} ${m.model}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                  ) : null}
                  <div style={{
                    display: CAR_IMAGES[`${m.make} ${m.model}`] ? "none" : "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 32, width: "100%", height: "100%",
                  }}>🚗</div>
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>{m.make}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#f0f0f0" }}>{m.model}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "#e0a820", fontWeight: 600 }}>{m.basePower} hp</span>
                  <span style={{
                    fontSize: 10, background: "#1e2028", border: "1px solid #2e3040",
                    color: "#888", borderRadius: 20, padding: "2px 8px",
                  }}>{m.type}</span>
                </div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>{m.fuelType} · {m.drivetrain}</div>
              </div>
            ))}
          </div>

          {filteredModels.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#444", fontSize: 14 }}>
              No models match your search
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detail view
  const model = selectedModel;
  const yearOptions = [];
  for (let y = model.baseYear - YEAR_SPAN; y <= model.baseYear + YEAR_SPAN; y++) yearOptions.push(y);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0d0f12", color: "#f0f0f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #1a1c21; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .stat-box { background: #16181e; border: 1px solid #252830; border-radius: 10px; padding: 14px 16px; }
        .year-chip { background: #16181e; border: 1px solid #252830; border-radius: 20px; padding: 7px 16px; font-size: 13px; cursor: pointer; color: #888; transition: all 0.15s; font-family: inherit; }
        .year-chip.active { background: #e0a820; border-color: #e0a820; color: #0d0f12; font-weight: 700; }
        .back-btn { background: none; border: 1px solid #252830; border-radius: 8px; padding: 8px 14px; color: #888; font-size: 13px; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .back-btn:hover { border-color: #e0a820; color: #e0a820; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.08em", color: "#e0a820" }}>
            CARCARE
          </div>
          <button className="back-btn" onClick={() => setView("select")}>
            ← Browse all models
          </button>
        </div>

        {/* Model hero */}
        <div style={{
          background: "#16181e", border: "1px solid #252830", borderRadius: 16,
          overflow: "hidden", marginBottom: 20,
          display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 200,
        }}>
          <div style={{ position: "relative", minHeight: 180, background: "#0d0f12", overflow: "hidden" }}>
            {imgSrc && !imgError ? (
              <img
                src={imgSrc}
                alt={`${model.make} ${model.model}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 180 }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%", minHeight: 180,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 64, opacity: 0.3,
              }}>🚗</div>
            )}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(13,15,18,0.9))",
              padding: "20px 16px 12px",
            }}>
              <div style={{ fontSize: 11, color: "#e0a820", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {model.type}
              </div>
            </div>
          </div>

          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{model.make}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.04em", color: "#f0f0f0", lineHeight: 1 }}>
                {model.model}
              </div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 10, lineHeight: 1.6 }}>{model.description}</div>
            </div>

            <div style={{ display: "flex", gap: 18, marginTop: 16, flexWrap: "wrap" }}>
              <FactItem label="Engine" value={model.engine} />
              <FactItem label="Drivetrain" value={model.drivetrain} />
              <FactItem label="Doors / Seats" value={`${model.doors} / ${model.seats}`} />
              {model.batteryKWh && <FactItem label="Battery" value={`${model.batteryKWh} kWh`} />}
            </div>
          </div>
        </div>

        {/* Year selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Model year — change it to see updated specs
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {yearOptions.map(y => (
              <button
                key={y}
                className={`year-chip${selectedYear === y ? " active" : ""}`}
                onClick={() => setSelectedYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Specs for the selected year */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
          <SpecCard label="Power" value={`${specs.power} hp`} />
          <SpecCard label="0–100 km/h" value={`${specs.zeroToHundred}s`} />
          <SpecCard label="Starting price" value={`€${specs.price.toLocaleString()}`} />
          <SpecCard label={specs.efficiency.label} value={specs.efficiency.value} />
        </div>

        {/* What's different this year */}
        <div style={{ background: "#16181e", border: "1px solid #252830", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>
          <strong style={{ color: "#e0a820" }}>{selectedYear} {model.make} {model.model}: </strong>
          {getYearHighlight(specs.diff)}
        </div>

      </div>
    </div>
  );
}