import { useState, useMemo } from "react";

const CARS = [
  { id: 1,  make: "BMW",        model: "X5",       year: 2023, type: "SUV",        img: "https://cdn.jsdelivr.net/gh/nicholasgasior/car-images@main/bmw-x5.jpg",       color: "#1c69d4" },
  { id: 2,  make: "BMW",        model: "M3",       year: 2022, type: "Sedan",      img: "",       color: "#1c69d4" },
  { id: 3,  make: "BMW",        model: "i4",       year: 2024, type: "Electric",   img: "",       color: "#1c69d4" },
  { id: 4,  make: "Audi",       model: "A4",       year: 2022, type: "Sedan",      img: "",       color: "#bb0a14" },
  { id: 5,  make: "Audi",       model: "Q5",       year: 2023, type: "SUV",        img: "",       color: "#bb0a14" },
  { id: 6,  make: "Audi",       model: "R8",       year: 2021, type: "Coupe",      img: "",       color: "#bb0a14" },
  { id: 7,  make: "Mercedes",   model: "C-Class",  year: 2023, type: "Sedan",      img: "",       color: "#2d2d2d" },
  { id: 8,  make: "Mercedes",   model: "G-Class",  year: 2022, type: "SUV",        img: "",       color: "#2d2d2d" },
  { id: 9,  make: "Mercedes",   model: "S-Class",  year: 2024, type: "Sedan",      img: "",       color: "#2d2d2d" },
  { id: 10, make: "Volkswagen", model: "Golf GTI", year: 2022, type: "Hatchback",  img: "",       color: "#001e50" },
  { id: 11, make: "Volkswagen", model: "Tiguan",   year: 2023, type: "SUV",        img: "",       color: "#001e50" },
  { id: 12, make: "Toyota",     model: "Corolla",  year: 2022, type: "Sedan",      img: "",       color: "#eb0a1e" },
  { id: 13, make: "Toyota",     model: "RAV4",     year: 2023, type: "SUV",        img: "",       color: "#eb0a1e" },
  { id: 14, make: "Toyota",     model: "Supra",    year: 2023, type: "Coupe",      img: "",       color: "#eb0a1e" },
  { id: 15, make: "Ford",       model: "Mustang",  year: 2022, type: "Coupe",      img: "",       color: "#003499" },
  { id: 16, make: "Ford",       model: "Kuga",     year: 2023, type: "SUV",        img: "",       color: "#003499" },
];

const MAKES = ["All", ...Array.from(new Set(CARS.map(c => c.make))).sort()];

const CAR_IMAGES = {
  "BMW X5 2023":        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  "BMW M3 2022":        "https://images.unsplash.com/photo-1617531653332-bd46c16f3adf?w=800&q=80",
  "BMW i4 2024":        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
  "Audi A4 2022":       "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
  "Audi Q5 2023":       "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&q=80",
  "Audi R8 2021":       "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80",
  "Mercedes C-Class 2023": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  "Mercedes G-Class 2022": "https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&q=80",
  "Mercedes S-Class 2024": "https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&q=80",
  "Volkswagen Golf GTI 2022": "https://images.unsplash.com/photo-1541443131876-9b69e6e3afab?w=800&q=80",
  "Volkswagen Tiguan 2023": "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&q=80",
  "Toyota Corolla 2022": "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80",
  "Toyota RAV4 2023":   "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800&q=80",
  "Toyota Supra 2023":  "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80",
  "Ford Mustang 2022":  "https://images.unsplash.com/photo-1584345604476-8ec5f452d1f2?w=800&q=80",
  "Ford Kuga 2023":     "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
};

function makeMaintenanceItems(car) {
  const isElectric = car.type === "Electric";
  const mileage = car.id % 3 === 0 ? 62000 : car.id % 3 === 1 ? 28000 : 14000;

  return [
    {
      id: "oil",
      category: "Engine",
      name: isElectric ? "Coolant check" : "Engine oil change",
      icon: "🛢️",
      interval: isElectric ? "2 years" : "Every 10,000 km",
      lastDone: mileage - 7800,
      dueMileage: mileage + 2200,
      currentMileage: mileage,
      status: mileage + 2200 - mileage < 3000 ? "soon" : "ok",
      note: isElectric ? "Check coolant level and condition" : "Use 5W-30 fully synthetic",
    },
    {
      id: "tires",
      category: "Wheels",
      name: "Tyre rotation & pressure",
      icon: "🔄",
      interval: "Every 10,000 km",
      lastDone: mileage - 4100,
      dueMileage: mileage + 5900,
      currentMileage: mileage,
      status: "ok",
      note: "Check tread depth. Min. 3mm recommended",
    },
    {
      id: "brakes",
      category: "Brakes",
      name: "Brake pads & discs",
      icon: "🔴",
      interval: "Every 40,000 km",
      lastDone: mileage - 38000,
      dueMileage: mileage + 2000,
      currentMileage: mileage,
      status: "urgent",
      note: "Front pads at ~15% remaining. Replace soon!",
    },
    {
      id: "air",
      category: "Filters",
      name: "Air filter",
      icon: "💨",
      interval: "Every 20,000 km",
      lastDone: mileage - 9500,
      dueMileage: mileage + 10500,
      currentMileage: mileage,
      status: "ok",
      note: "Inspect for dust/debris accumulation",
    },
    {
      id: "cabin",
      category: "Filters",
      name: "Cabin air filter",
      icon: "🌬️",
      interval: "Every 15,000 km",
      lastDone: mileage - 13100,
      dueMileage: mileage + 1900,
      currentMileage: mileage,
      status: "soon",
      note: "Affects AC performance and air quality",
    },
    {
      id: "spark",
      category: "Engine",
      name: isElectric ? "Battery health check" : "Spark plugs",
      icon: isElectric ? "⚡" : "✨",
      interval: isElectric ? "Every year" : "Every 60,000 km",
      lastDone: mileage - 41000,
      dueMileage: mileage + 19000,
      currentMileage: mileage,
      status: "ok",
      note: isElectric ? "Check battery cell balance and capacity" : "Iridium plugs recommended",
    },
    {
      id: "fluid",
      category: "Fluids",
      name: "Brake fluid",
      icon: "🧪",
      interval: "Every 2 years",
      lastDone: mileage - 21000,
      dueMileage: mileage + 9000,
      currentMileage: mileage,
      status: "ok",
      note: "DOT 4 required. Absorbs moisture over time",
    },
    {
      id: "battery",
      category: "Electrical",
      name: isElectric ? "12V auxiliary battery" : "Car battery",
      icon: "🔋",
      interval: "Every 4–5 years",
      lastDone: mileage - 55000,
      dueMileage: mileage - 5000,
      currentMileage: mileage,
      status: "urgent",
      note: "Battery showing signs of weakness. Cold-start issues reported.",
    },
    {
      id: "wiper",
      category: "Visibility",
      name: "Wiper blades",
      icon: "🌧️",
      interval: "Every year",
      lastDone: mileage - 8000,
      dueMileage: mileage + 4000,
      currentMileage: mileage,
      status: "ok",
      note: "Check for streaking. Replace before winter",
    },
    {
      id: "trans",
      category: "Transmission",
      name: isElectric ? "Motor oil check" : "Transmission fluid",
      icon: "⚙️",
      interval: "Every 60,000 km",
      lastDone: mileage - 12000,
      dueMileage: mileage + 48000,
      currentMileage: mileage,
      status: "ok",
      note: "Automatic transmission fluid — dealer fill only",
    },
  ];
}

const STATUS_META = {
  urgent: { label: "Overdue",    bg: "#FCEBEB", text: "#A32D2D", border: "#F09595", dot: "#E24B4A" },
  soon:   { label: "Due soon",   bg: "#FAEEDA", text: "#633806", border: "#EF9F27", dot: "#BA7517" },
  ok:     { label: "Good",       bg: "#EAF3DE", text: "#27500A", border: "#97C459", dot: "#639922" },
};

const CATEGORIES = ["All", "Engine", "Brakes", "Wheels", "Filters", "Fluids", "Electrical", "Transmission", "Visibility"];

export default function CarCare() {
  const [view, setView] = useState("select"); // "select" | "dashboard"
  const [selectedCar, setSelectedCar] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMake, setFilterMake] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [checkedItems, setCheckedItems] = useState({});
  const [mileageInput, setMileageInput] = useState("");
  const [imgError, setImgError] = useState(false);

  const filteredCars = useMemo(() => {
    return CARS.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchQ = !q || `${c.make} ${c.model} ${c.year}`.toLowerCase().includes(q);
      const matchMake = filterMake === "All" || c.make === filterMake;
      return matchQ && matchMake;
    });
  }, [searchQuery, filterMake]);

  const maintenanceItems = useMemo(() => {
    if (!selectedCar) return [];
    return makeMaintenanceItems(selectedCar);
  }, [selectedCar]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return maintenanceItems;
    return maintenanceItems.filter(i => i.category === activeCategory);
  }, [maintenanceItems, activeCategory]);

  const stats = useMemo(() => {
    const urgent = maintenanceItems.filter(i => i.status === "urgent").length;
    const soon = maintenanceItems.filter(i => i.status === "soon").length;
    const ok = maintenanceItems.filter(i => i.status === "ok").length;
    return { urgent, soon, ok };
  }, [maintenanceItems]);

  function handleSelectCar(car) {
    setSelectedCar(car);
    setCheckedItems({});
    setActiveCategory("All");
    setImgError(false);
    setMileageInput(String(car.id % 3 === 0 ? 62000 : car.id % 3 === 1 ? 28000 : 14000));
    setView("dashboard");
  }

  function toggleCheck(id) {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const imgKey = selectedCar ? `${selectedCar.make} ${selectedCar.model} ${selectedCar.year}` : "";
  const imgSrc = CAR_IMAGES[imgKey] || "";

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
              Select your vehicle to view your maintenance dashboard
            </div>
          </div>

          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#555" }}>🔍</span>
            <input
              className="search-in"
              placeholder="Search make, model or year…"
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
            {filteredCars.map(car => (
              <div key={car.id} className="car-tile" onClick={() => handleSelectCar(car)}>
                <div style={{
                  height: 80, borderRadius: 8, marginBottom: 12, overflow: "hidden",
                  background: "#0d0f12", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {CAR_IMAGES[`${car.make} ${car.model} ${car.year}`] ? (
                    <img
                      src={CAR_IMAGES[`${car.make} ${car.model} ${car.year}`]}
                      alt={`${car.make} ${car.model}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                  ) : null}
                  <div style={{
                    display: CAR_IMAGES[`${car.make} ${car.model} ${car.year}`] ? "none" : "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 32, width: "100%", height: "100%",
                  }}>🚗</div>
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 2 }}>{car.make}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#f0f0f0" }}>{car.model}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "#e0a820", fontWeight: 600 }}>{car.year}</span>
                  <span style={{
                    fontSize: 10, background: "#1e2028", border: "1px solid #2e3040",
                    color: "#888", borderRadius: 20, padding: "2px 8px",
                  }}>{car.type}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#444", fontSize: 14 }}>
              No vehicles match your search
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dashboard view
  const car = selectedCar;
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0d0f12", color: "#f0f0f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #1a1c21; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .cat-btn { background: #16181e; border: 1px solid #252830; border-radius: 20px; padding: 5px 12px; font-size: 12px; cursor: pointer; color: #888; transition: all 0.15s; white-space: nowrap; font-family: inherit; }
        .cat-btn.active { background: #e0a820; border-color: #e0a820; color: #0d0f12; font-weight: 600; }
        .maint-card { background: #16181e; border: 1px solid #252830; border-radius: 12px; padding: 16px; transition: border-color 0.15s; }
        .maint-card:hover { border-color: #333; }
        .maint-card.done { opacity: 0.45; }
        .check-btn { border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all 0.15s; }
        .check-btn:active { transform: scale(0.96); }
        .stat-box { background: #16181e; border: 1px solid #252830; border-radius: 10px; padding: 14px 16px; flex: 1; }
        .mile-input { background: #16181e; border: 1px solid #252830; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #f0f0f0; outline: none; font-family: inherit; width: 120px; }
        .mile-input:focus { border-color: #e0a820; }
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
            ← Change vehicle
          </button>
        </div>

        {/* Car hero */}
        <div style={{
          background: "#16181e", border: "1px solid #252830", borderRadius: 16,
          overflow: "hidden", marginBottom: 20,
          display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 200,
        }}>
          <div style={{ position: "relative", minHeight: 180, background: "#0d0f12", overflow: "hidden" }}>
            {imgSrc && !imgError ? (
              <img
                src={imgSrc}
                alt={`${car.make} ${car.model}`}
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
                {car.type}
              </div>
            </div>
          </div>

          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{car.make}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.04em", color: "#f0f0f0", lineHeight: 1 }}>
                {car.model}
              </div>
              <div style={{ fontSize: 20, color: "#e0a820", fontWeight: 600, marginTop: 4 }}>{car.year}</div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Current mileage
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  className="mile-input"
                  type="number"
                  value={mileageInput}
                  onChange={e => setMileageInput(e.target.value)}
                />
                <span style={{ fontSize: 13, color: "#666" }}>km</span>
              </div>
            </div>

            {/* Urgency stats */}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              {stats.urgent > 0 && (
                <div style={{ background: "#2a1010", border: "1px solid #5a1a1a", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                  <span style={{ color: "#E24B4A", fontWeight: 600 }}>{stats.urgent}</span>
                  <span style={{ color: "#a06060", marginLeft: 4 }}>overdue</span>
                </div>
              )}
              {stats.soon > 0 && (
                <div style={{ background: "#241c0a", border: "1px solid #5a420a", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                  <span style={{ color: "#EF9F27", fontWeight: 600 }}>{stats.soon}</span>
                  <span style={{ color: "#8a7040", marginLeft: 4 }}>due soon</span>
                </div>
              )}
              <div style={{ background: "#0e1e0a", border: "1px solid #1a4a0a", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>
                <span style={{ color: "#639922", fontWeight: 600 }}>{stats.ok}</span>
                <span style={{ color: "#4a6a20", marginLeft: 4 }}>good</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-btn${activeCategory === cat ? " active" : ""}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>
          {filteredItems.length} maintenance item{filteredItems.length !== 1 ? "s" : ""}
          {Object.values(checkedItems).filter(Boolean).length > 0 &&
            ` · ${Object.values(checkedItems).filter(Boolean).length} marked done`}
        </div>

        {/* Maintenance cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filteredItems.map(item => {
            const s = STATUS_META[item.status];
            const done = !!checkedItems[item.id];
            const kmLeft = item.dueMileage - item.currentMileage;

            return (
              <div key={item.id} className={`maint-card${done ? " done" : ""}`}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ fontSize: 28, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{item.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f0" }}>{item.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                        background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                      }}>{s.label}</span>
                      <span style={{ fontSize: 10, color: "#555", background: "#1a1c22", border: "1px solid #252830", borderRadius: 20, padding: "2px 8px" }}>
                        {item.category}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{item.note}</div>

                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Interval</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>{item.interval}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Last done</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 1 }}>{item.lastDone.toLocaleString()} km</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          {kmLeft < 0 ? "Overdue by" : "Due in"}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 1, color: item.status === "urgent" ? "#E24B4A" : item.status === "soon" ? "#EF9F27" : "#639922" }}>
                          {Math.abs(kmLeft).toLocaleString()} km
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: "#252830", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(100, Math.max(0, ((item.currentMileage - item.lastDone) / (item.dueMileage - item.lastDone)) * 100))}%`,
                        background: item.status === "urgent" ? "#E24B4A" : item.status === "soon" ? "#EF9F27" : "#639922",
                        borderRadius: 2, transition: "width 0.4s",
                      }} />
                    </div>
                  </div>

                  <button
                    className="check-btn"
                    style={{
                      background: done ? "#1a1c22" : item.status === "urgent" ? "#E24B4A" : item.status === "soon" ? "#BA7517" : "#3B6D11",
                      color: done ? "#555" : "#fff",
                      flexShrink: 0,
                    }}
                    onClick={() => toggleCheck(item.id)}
                  >
                    {done ? "✓ Done" : "Mark done"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        {Object.values(checkedItems).filter(Boolean).length > 0 && (
          <div style={{
            marginTop: 20, background: "#0e1e0a", border: "1px solid #1a4a0a",
            borderRadius: 10, padding: "14px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 13, color: "#639922" }}>
              ✓ {Object.values(checkedItems).filter(Boolean).length} item{Object.values(checkedItems).filter(Boolean).length > 1 ? "s" : ""} marked as serviced
            </div>
            <button
              className="check-btn"
              style={{ background: "#1e2028", color: "#888", border: "1px solid #252830" }}
              onClick={() => setCheckedItems({})}
            >
              Reset all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}