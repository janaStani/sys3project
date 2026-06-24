import { useState, useMemo, useEffect  } from "react";
import axiosAuth from "../Utils/axiosAuth";
import { API_URL } from "../Utils/Configuration";
import { CAR_MODELS, YEAR_SPAN } from "./car";

const MAKES = ["BMW","Mercedes","Audi","Volkswagen","Toyota","Ford","Honda","Hyundai","Kia","Mazda","Peugeot","Renault","Fiat","Volvo","Skoda","Seat","Opel","Nissan","Subaru","Lexus","Other"];
const TYPES = ["Sedan","SUV","Hatchback","Coupe","Estate","Convertible","Van","Pickup","Electric","Hybrid"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const CAR_ICONS = {
  SUV: "/icons/suv-car.png",
  Sedan: "/icons/sedan.png",
  Hatchback: "/icons/microcar.png",
  Coupe: "/icons/sports-car.png",
  Estate: "/icons/compact-car.png",
  Convertible: "/icons/cabriolet.png",
  Van: "/icons/minivan.png",
  Pickup: "/icons/pickup-truck.png",
  Electric: "/icons/camper-van.png",
  Hybrid: "/icons/camper-van.png",
};

const TAB_ICONS = {
  garage: "/icons/car-repair (1).png",
  calendar: "/icons/calendar.png",
  calendar1: "/icons/calendar1.png",
  load: "/icons/hourglass.png",
  location: "/icons/pin.png",
  technician: "/icons/technician.png",
  search: "/icons/magnifying-glass.png",
  phone: "/icons/phone-call.png",
  website: "/icons/link (1).png"
};

const STATUS_STYLES = {
  urgent: { label:"Overdue",  bg:"#2a1010", border:"#5a1a1a", text:"#E24B4A" },
  soon:   { label:"Due soon", bg:"#241c0a", border:"#5a420a", text:"#EF9F27" },
  ok:     { label:"Good",     bg:"#0e1e0a", border:"#1a4a0a", text:"#639922" },
};

const INPUT_STYLE = {
  background:"#0d0f12", border:"1px solid #333", borderRadius:8,
  padding:"10px 12px", fontSize:14, color:"#f0f0f0",
  fontFamily:"inherit", outline:"none", width:"100%",
};

// OSM category tags relevant to each service id
const SERVICE_OSM_TAGS = {
  oil:      ["car_repair","oil"],
  brakes:   ["car_repair","brake"],
  tires:    ["tyres","tyre_fitting","car_repair"],
  air:      ["car_repair"],
  cabin:    ["car_repair"],
  spark:    ["car_repair","electrician"],
  brake_fl: ["car_repair"],
  battery:  ["car_repair","battery"],
  trans:    ["car_repair"],
  wiper:    ["car_repair"],
  coolant:  ["car_repair"],
  susp:     ["car_repair"],
};

function getCarType(car) {
  return car.type || car.style || "Sedan";
}

function getServiceIntervals(isElectric) {
  return [
    { id:"oil",      name:isElectric?"Coolant flush":"Engine oil & filter",     icon:"/icons/engine.png", category:"Engine",       kmInterval:isElectric?40000:10000,  tasks:[{action:"replace",desc:isElectric?"Flush & replace coolant":"Drain & replace oil — 5W-30 fully synthetic"},{action:"inspect",desc:"Check for leaks around gaskets and seals"}],                                                                 baseCost:[isElectric?80:70, isElectric?120:110] },
    { id:"brakes",   name:"Brake pads & discs",                                 icon:"/icons/brake.png", category:"Brakes",       kmInterval:40000,                    tasks:[{action:"inspect",desc:"Measure pad thickness — replace if below 3mm"},{action:"replace",desc:"Front & rear pads; check disc wear and runout"}],                                                                                              baseCost:[180,350] },
    { id:"tires",    name:"Tyre rotation & alignment",                           icon:"/icons/tire rot.png", category:"Wheels",       kmInterval:10000,                    tasks:[{action:"check",desc:"Rotate all four tyres, balance wheels"},{action:"inspect",desc:"Check tread depth — min 1.6mm legal, 3mm recommended"},{action:"inspect",desc:"Adjust alignment if needed"}],                                             baseCost:[50,90] },
    { id:"air",      name:"Engine air filter",                                   icon:"/icons/air-filter.png", category:"Filters",      kmInterval:20000,                    tasks:[{action:"inspect",desc:"Check filter for dust/debris"},{action:"replace",desc:"Replace with OEM-spec air filter element"}],                                                                                                                   baseCost:[25,60] },
    { id:"cabin",    name:"Cabin air filter",                                    icon:"/icons/air-filter (1).png", category:"Filters",      kmInterval:15000,                    tasks:[{action:"replace",desc:"Replace cabin pollen filter — affects AC performance"},{action:"inspect",desc:"Check AC system for mould/odours"}],                                                                                                    baseCost:[20,50] },
    { id:"spark",    name:isElectric?"Battery health & cells":"Spark plugs",     icon:isElectric?"/icons/spark-plug (1).png":"/icons/spark-plug (1).png", category:"Engine", kmInterval:isElectric?50000:60000, tasks:[{action:isElectric?"check":"replace",desc:isElectric?"Check cell balance, capacity, and cooling":"Replace with iridium plugs; check ignition coils"}],                                                                             baseCost:isElectric?[150,300]:[80,200] },
    { id:"brake_fl", name:"Brake fluid",                                         icon:"/icons/brake-pad.png", category:"Fluids",       kmInterval:30000,                    tasks:[{action:"replace",desc:"Replace DOT 4 brake fluid"},{action:"inspect",desc:"Check for contamination with tester strips"}],                                                                                                                    baseCost:[40,80] },
    { id:"battery",  name:isElectric?"12V auxiliary battery":"Car battery",      icon:"/icons/battery.png", category:"Electrical",   kmInterval:60000,                    tasks:[{action:"inspect",desc:"Load test battery under 250A draw"},{action:"replace",desc:"Replace if below 70% capacity or 4+ years old"}],                                                                                                        baseCost:[80,200] },
    { id:"trans",    name:isElectric?"Motor & gearbox oil":"Transmission fluid", icon:"/icons/automatic-transmission.png", category:"Transmission", kmInterval:60000,                    tasks:[{action:"inspect",desc:"Check fluid level and condition"},{action:"replace",desc:isElectric?"Replace motor oil per manufacturer spec":"Flush ATF — ZF or OEM fluid"}],                                                                       baseCost:[120,250] },
    { id:"wiper",    name:"Wiper blades",                                        icon:"/icons/wiper.png", category:"Visibility",   kmInterval:20000,                    tasks:[{action:"replace",desc:"Replace front & rear wiper blades"},{action:"check",desc:"Top up screenwash fluid"}],                                                                                                                                baseCost:[20,60] },
    { id:"coolant",  name:isElectric?"Thermal management fluid":"Coolant flush", icon:"/icons/radiator.png", category:"Fluids",       kmInterval:isElectric?60000:50000,   tasks:[{action:"replace",desc:isElectric?"Replace thermal management coolant":"Flush and replace OEM-spec coolant"},{action:"inspect",desc:"Inspect hoses and expansion tank"}],                                                                   baseCost:[isElectric?100:60, isElectric?180:120] },
    { id:"susp",     name:"Suspension & steering",                               icon:"/icons/steering-wheel (1).png", category:"Chassis",      kmInterval:40000,                    tasks:[{action:"inspect",desc:"Check ball joints, tie rod ends, bushings"},{action:"inspect",desc:"Check power steering fluid and rack for leaks"}],                                                                                                baseCost:[80,200] },
  ];
}

function generateSchedule(car, serviceLog = []) {
  const isElectric = ["Electric","Hybrid"].includes(getCarType(car));
  const km = parseInt(car.mileage) || 0;
  const logForCar = serviceLog.filter(l => l.carId === car.id);

  return getServiceIntervals(isElectric).map(s => {
    const entries = logForCar.filter(l => l.serviceId === s.id);
    const lastEntry = entries.sort((a,b) => b.mileageAt - a.mileageAt)[0];
    const lastDone = lastEntry ? lastEntry.mileageAt : 0;
    const nextDue = lastDone + s.kmInterval;
    const remaining = nextDue - km;
    const pct = Math.min(100, Math.max(0, ((km - lastDone) / s.kmInterval) * 100));
    const status = remaining <= 0 ? "urgent" : remaining < s.kmInterval * 0.2 ? "soon" : "ok";
    return { ...s, lastDone, nextDue, remaining, pct, status, costMin:s.baseCost[0], costMax:s.baseCost[1] };
  }).sort((a, b) => ({ urgent:0, soon:1, ok:2 }[a.status] - { urgent:0, soon:1, ok:2 }[b.status]) || a.remaining - b.remaining);
}

// ── OSM fetch (same as Mechanic.jsx) ─────────────────────────────────────────
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

async function fetchOSMMechanics(coords, radius = 25000) {
  const q = `
    [out:json][timeout:25];
    (
      node["amenity"="car_repair"](around:${radius},${coords.lat},${coords.lng});
      way["amenity"="car_repair"](around:${radius},${coords.lat},${coords.lng});
      node["craft"="car_repair"](around:${radius},${coords.lat},${coords.lng});
      way["craft"="car_repair"](around:${radius},${coords.lat},${coords.lng});
      node["shop"="car_repair"](around:${radius},${coords.lat},${coords.lng});
      way["shop"="car_repair"](around:${radius},${coords.lat},${coords.lng});
      node["shop"="tyres"](around:${radius},${coords.lat},${coords.lng});
      way["shop"="tyres"](around:${radius},${coords.lat},${coords.lng});
      node["craft"="tyre_fitting"](around:${radius},${coords.lat},${coords.lng});
    );
    out center 40;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(q)}`,
  });
  if (!res.ok) throw new Error("OSM error");
  const data = await res.json();
  return data.elements
    .map(el => ({
      id:       "osm-" + el.id,
      name:     el.tags?.name || el.tags?.["name:sl"] || el.tags?.["name:en"] || "Auto servis",
      address:  [el.tags?.["addr:street"], el.tags?.["addr:housenumber"], el.tags?.["addr:city"]].filter(Boolean).join(", "),
      phone:    el.tags?.phone || el.tags?.["contact:phone"] || "",
      website:  el.tags?.website || el.tags?.["contact:website"] || "",
      lat:      el.lat ?? el.center?.lat,
      lng:      el.lon ?? el.center?.lon,
      osmType:  el.tags?.amenity || el.tags?.craft || el.tags?.shop || "",
      source:   "osm",
    }))
    .filter(el => el.lat && el.lng);
}

async function geocodeZipcode(zipcode) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(zipcode)}&country=SI&format=json&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

function Field({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:".08em" }}>{label}</label>
      {children}
    </div>
  );
}

function Badge({ text, gold, green }) {
  return (
    <span style={{ fontSize:10, borderRadius:20, padding:"2px 8px", background:gold?"#1e1a08":green?"#0e1e0a":"#1e2028", color:gold?"#e0a820":green?"#639922":"#888", border:`1px solid ${gold?"#4a3a10":green?"#1a4a0a":"#252830"}` }}>
      {text}
    </span>
  );
}

function StatusChip({ n, label, bg, border, col, sub }) {
  return (
    <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:8, padding:"5px 10px", flex:1, textAlign:"center" }}>
      <div style={{ fontSize:16, fontWeight:700, color:col }}>{n}</div>
      <div style={{ fontSize:10, color:sub }}>{label}</div>
    </div>
  );
}

// ── ADD CAR MODAL ─────────────────────────────────────────────────────────────
function AddCarModal({ onAdd, onClose, saving }) {
  const [form, setForm] = useState({ make: "BMW", model: "", year: "", mileage: "", fuelType:""});
  const [err,  setErr]  = useState("");

  const availableModels = CAR_MODELS.filter(c => c.make === form.make);
  const selectedCarDef  = CAR_MODELS.find(c => c.make === form.make && c.model === form.model);

  const yearOptions = useMemo(() => {
    if (!selectedCarDef?.years?.length) return [];
    const years = new Set();
    selectedCarDef.years.forEach(gen => {
      const end = gen.yearEnd ?? new Date().getFullYear();
      for (let y = gen.yearStart; y <= end; y++) years.add(y);
    });
    return [...years].sort((a, b) => a - b);
  }, [selectedCarDef]);

  const selectedGen = useMemo(() => {
    if (!selectedCarDef?.years?.length || !form.year) return null;
    return selectedCarDef.years.find(
      g => parseInt(form.year) >= g.yearStart && parseInt(form.year) <= (g.yearEnd ?? Infinity)
    ) || null;
  }, [selectedCarDef, form.year]);

  const fuelOptions = useMemo(() => {
    if (!selectedGen?.fuelType) return [];
    return selectedGen.fuelType.split(",").map(f => f.trim()).filter(Boolean);
  }, [selectedGen]);

  function setField(key, value) { setForm(f => ({ ...f, [key]: value })); }

  function submit() {
    if (!selectedCarDef) { setErr("Please select a valid car."); return; }
    if (!form.year)       { setErr("Please select a year."); return; }
    if (form.mileage === "" || form.mileage < 0) { setErr("Please enter current mileage."); return; }
    onAdd({
      make:     selectedCarDef.make,
      model:    selectedCarDef.model,
      type:     selectedCarDef.type,
      fuelType: form.fuelType || selectedGen?.fuelType || selectedCarDef.years?.[0]?.fuelType || "Petrol",
      year:     parseInt(form.year),
      mileage:  parseInt(form.mileage),
    });
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, zIndex:200 }}>
      <div style={{ background:"#1a1c22", border:"1px solid #333", borderRadius:16, width:"100%", maxWidth:460 }}>
        <div style={{ padding:"20px 20px 0", display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontSize:18, fontWeight:600 }}>Add your car</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:24, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ padding:"0 20px 20px", display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="Make">
            <select value={form.make}
              onChange={e => setForm({ make:e.target.value, model:"", year:"", mileage:form.mileage, fuelType:"" })}
              style={INPUT_STYLE}>
              {[...new Set(CAR_MODELS.map(c => c.make))].map(make => <option key={make}>{make}</option>)}
            </select>
          </Field>
          <Field label="Model">
            <select value={form.model}
              onChange={e => setForm(f => ({ ...f, model: e.target.value, year: "", fuelType: "" }))}
              style={INPUT_STYLE}>
              <option value="">Select model</option>
              {[...new Set(availableModels.map(c => c.model))].map(model => <option key={model}>{model}</option>)}
            </select>
          </Field>
          <Field label="Year">
            <select value={form.year} onChange={e => setField("year", e.target.value)} style={INPUT_STYLE} disabled={!selectedCarDef}>
              <option value="">Select year</option>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          {selectedGen && (
            <div style={{ background:"#16181e", border:"1px solid #252830", borderRadius:10, padding:14 }}>
              <div style={{ fontSize:12, color:"#e0a820", fontWeight:600, marginBottom:6 }}>
                {selectedGen.generation} ({selectedGen.yearStart}–{selectedGen.yearEnd ?? "present"})
              </div>
              <div style={{ fontSize:13, color:"#ccc", marginBottom:2 }}><strong style={{ color:"#888" }}>Type:</strong> {selectedCarDef.type}</div>
              <div style={{ fontSize:13, color:"#ccc", marginBottom:2 }}><strong style={{ color:"#888" }}>Fuel:</strong> {selectedGen.fuelType}</div>
              <div style={{ fontSize:13, color:"#ccc", marginBottom:2 }}><strong style={{ color:"#888" }}>Power:</strong> {selectedGen.power}</div>
              <div style={{ fontSize:12, color:"#555", marginTop:6 }}>
                {Array.isArray(selectedGen.engine) ? selectedGen.engine.join(" · ") : selectedGen.engine}
              </div>
            </div>
          )}
          {fuelOptions.length > 1 && (
            <Field label="Fuel type">
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {fuelOptions.map(f => (
                  <button key={f} type="button" onClick={() => setField("fuelType", f)}
                    style={{ background:form.fuelType===f?"#e0a820":"#16181e", border:`1px solid ${form.fuelType===f?"#e0a820":"#252830"}`, borderRadius:20, padding:"6px 14px", fontSize:13, fontWeight:form.fuelType===f?700:400, color:form.fuelType===f?"#0d0f12":"#ccc", cursor:"pointer", fontFamily:"inherit" }}>
                    {f}
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field label="Current mileage (km)">
            <input type="number" value={form.mileage} onChange={e => setField("mileage", e.target.value)} min="0" style={INPUT_STYLE}/>
          </Field>
          {err && (
            <div style={{ fontSize:12, color:"#E24B4A", padding:"8px 12px", background:"#2a1010", border:"1px solid #5a1a1a", borderRadius:8 }}>{err}</div>
          )}
          <button onClick={submit} disabled={saving}
            style={{ background:"#e0a820", border:"none", borderRadius:10, padding:12, fontSize:15, fontWeight:700, color:"#0d0f12", cursor:saving?"not-allowed":"pointer" }}>
            {saving ? "Saving..." : "Add to my garage →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DayEventsPicker({ events, onSelect, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:400, padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#16181e", border:"1px solid #252830", borderRadius:16, width:"100%", maxWidth:400, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontSize:15, fontWeight:600 }}>Choose a service</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {events.map((ev, i) => {
            const sm = STATUS_STYLES[ev.svc.status];
            return (
              <div key={i} onClick={() => onSelect(ev)}
                style={{ background:"#0d0f12", border:"1px solid #252830", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#e0a820"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#252830"}>
                <div style={{ width:36, height:36, borderRadius:8, background:sm.bg, border:`1px solid ${sm.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <img src={ev.svc.icon} alt={ev.svc.name} style={{ width:22, height:22, objectFit:"contain" }}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{ev.svc.name}</div>
                  <div style={{ fontSize:11, color:"#555" }}>{ev.car.make} {ev.car.model}</div>
                </div>
                <div style={{ fontSize:12, color:"#888" }}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PROVIDER CARD ─────────────────────────────────────────────────────────────
function ProviderCard({ provider: p}) {
  const rating   = parseFloat(p.avgRating || p.rating) || 0;
  const stars    = Math.round(rating);
  const reviewed = p.reviewCount > 0;

  return (
    <div style={{ background:"#0d0f12", border:"1px solid #252830", borderRadius:12, padding:16 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:10 }}>
        <div style={{ width:44, height:44, borderRadius:10, background:"#16181e", border:"1px solid #252830", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}><img src={TAB_ICONS.technician} alt="Technician" style={{ width:26, height:26 }}/></div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
            <div style={{ fontSize:15, fontWeight:600 }}>{p.provider || p.name || "Service Provider"}</div>
            {p.userAdded && (
              <span style={{ fontSize:10, color:"#555", background:"#16181e", border:"1px solid #252830", borderRadius:12, padding:"1px 7px" }}>User added</span>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            {reviewed ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize:12, color:n<=stars?"#e0a820":"#2a2d35" }}>★</span>)}
                </div>
                <span style={{ fontSize:11, color:"#888" }}>{rating.toFixed(1)} · {p.reviewCount} review{p.reviewCount !== 1 ? "s" : ""}</span>
              </>
            ) : (
              <span style={{ fontSize:11, color:"#444" }}>No reviews yet</span>
            )}
            {p.priceRange && <span style={{ fontSize:11, color:"#e0a820", background:"#1e1a08", border:"1px solid #4a3a10", borderRadius:12, padding:"1px 8px" }}>{p.priceRange}</span>}
          </div>
        </div>
        {p.distance != null && (
          <div style={{ fontSize:12, color:"#e0a820", fontWeight:700, flexShrink:0, textAlign:"right" }}>
            {p.distance.toFixed(1)} km
          </div>
        )}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
        {(p.location || p.address) && <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#888" }}><span style={{ color:"#555" }}><img src={TAB_ICONS.location} alt="Location" style={{ width:14, height:15 }}/></span>{p.location || p.address}</div>}
        {p.phone    && <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#888" }}><span style={{ color:"#555" }}><img src={TAB_ICONS.phone} alt="Phone" style={{ width:13, height:13 }}/></span>{p.phone}</div>}
        {p.website  && <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#888" }}><span style={{ color:"#555" }}><img src={TAB_ICONS.website} alt="Website" style={{ width:15, height:16 }}/></span><a href={p.website} target="_blank" rel="noopener noreferrer" style={{ color:"#639922" }}>{p.website.replace(/^https?:\/\//, "")}</a></div>}
      </div>
      <div>
      <a href={`https://www.google.com/maps/search/${encodeURIComponent((p.provider || p.name || "") + " " + (p.location || p.address || ""))}`}
        target="_blank" rel="noopener noreferrer"
        style={{ display:"inline-block", background:"#e0a820", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, color:"#0d0f12", textDecoration:"none" }}>
        View on Maps →
      </a>
      <button style={{ display:"inline-block", marginLeft:12, background:"#e0a820", border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, color:"#0d0f12", cursor:"pointer", fontFamily:"inherit" }}>See Reviews</button>
      </div>
    </div>
  );
}

// ── NEARBY PROVIDERS PANEL ────────────────────────────────────────────────────
function NearbyProviders({ event, onClose }) {
  console.log("NearbyProviders event:", event);
  const [osmMechanics,  setOsmMechanics]  = useState([]);
  const [dbProviders,   setDbProviders]   = useState([]);
  const [coords,        setCoords]        = useState(null);
  const [phase,         setPhase]         = useState("locating"); // locating | loading | done | error
  const [locError,      setLocError]      = useState("");

  const { svc, car, date, user: currentUser } = event || {};

  useEffect(() => {
    async function init() {
      setPhase("loading");

      // Try browser geolocation first (works on HTTPS)
      const tryGeo = () => new Promise(resolve => {
        if (!navigator.geolocation || location.protocol !== 'https:') return resolve(null);
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          ()  => resolve(null),
          { timeout: 8000 }
        );
      });

      let c = await tryGeo();

      // Fall back to zipcode geocoding
      if (!c && event?.user?.zipcode) {
        c = await geocodeZipcode(event.user.zipcode).catch(() => null);
        if (c) setLocError("Using location from your account zipcode.");
      }

      if (!c) {
        setLocError("Location unavailable — showing saved providers.");
        loadDbProviders(null).then(() => setPhase("done"));
        return;
      }

      setCoords(c);
      const [osm] = await Promise.all([
        fetchOSMMechanics(c).catch(() => []),
        loadDbProviders(c),
      ]);
      setOsmMechanics(
        osm.map(m => ({ ...m, distance: distanceKm(c.lat, c.lng, m.lat, m.lng) }))
          .sort((a, b) => a.distance - b.distance)
      );
      setPhase("done");
    }

    init();
  }, []);

  function loadDbProviders(c) {
    return axiosAuth.get(`${API_URL}/providers`)
      .then(res => {
        const all = Array.isArray(res.data?.providers) ? res.data.providers : [];
        const withDist = all.map(p => ({
          ...p,
          distance: c && p.lat && p.lng ? distanceKm(c.lat, c.lng, p.lat, p.lng) : null,
        }));
        setDbProviders(withDist);
        return withDist;
      })
      .catch(() => { setDbProviders([]); return []; });
  }

  // Merge: DB providers first (they have ratings), then OSM — deduplicated by name
  const merged = useMemo(() => {
    const dbNames = new Set(dbProviders.map(p => (p.provider || "").toLowerCase()));
    const osmFiltered = osmMechanics.filter(m => !dbNames.has(m.name.toLowerCase()));

    const allDb = dbProviders.map(p => ({ ...p, source: p.userAdded ? "user" : "db" }));
    const combined = [...allDb, ...osmFiltered];

    // Sort: rated first, then by distance
    return combined.sort((a, b) => {
      const aRated = (a.reviewCount > 0 || a.rating > 0) ? 0 : 1;
      const bRated = (b.reviewCount > 0 || b.rating > 0) ? 0 : 1;
      if (aRated !== bRated) return aRated - bRated;
      if (a.distance != null && b.distance != null) return a.distance - b.distance;
      if (a.distance != null) return -1;
      if (b.distance != null) return 1;
      return 0;
    });
  }, [dbProviders, osmMechanics]);

  const osmCount = osmMechanics.length;
  const dbCount  = dbProviders.length;

  const statusLine = phase === "locating" ? "Detecting your location…"
    : phase === "loading" ? (coords ? "Location found, fetching nearby mechanics…" : "Fetching saved providers…")
    : locError ? locError
    : coords ? ` ${osmCount} nearby on map · ${dbCount} saved`
    : `${dbCount} saved provider${dbCount !== 1 ? "s" : ""}`;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#16181e", borderRadius:"20px 20px 0 0", border:"1px solid #252830", borderBottom:"none", width:"100%", maxWidth:680, maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ padding:"20px 20px 14px", borderBottom:"1px solid #252830", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>
                {date?.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" })}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <img src={svc.icon} alt={svc.name} style={{ width:24, height:24, objectFit:"contain" }}/>
                <div style={{ fontSize:16, fontWeight:600 }}>{svc.name}</div>
              </div>
              {car && <div style={{ fontSize:12, color:"#555", marginTop:3 }}>{car.make} {car.model} {car.year}</div>}
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", fontSize:24, cursor:"pointer", lineHeight:1, padding:4 }}>×</button>
          </div>

          {/* Location status bar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#0d0f12", border:"1px solid #252830", borderRadius:8, padding:"8px 12px" }}>
            <span style={{ fontSize:14 }}>{phase === "done" && coords ? <img src={TAB_ICONS.location} alt="Location" style={{ width:14, height:15 }}/> : <img src={TAB_ICONS.load} alt="Loading" style={{ width:14, height:15 }}/>}</span>
            <span style={{ fontSize:12, color:phase === "done" && coords ? "#639922" : "#555" }}>{statusLine}</span>
            {phase === "loading" && (
              <div style={{ width:14, height:14, border:"2px solid #252830", borderTop:"2px solid #e0a820", borderRadius:"50%", animation:"spin 1s linear infinite", marginLeft:"auto", flexShrink:0 }}/>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY:"auto", padding:"16px 20px 32px", flex:1 }}>
          {phase !== "done" ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#555", fontSize:13 }}>
              <div style={{ fontSize:28, marginBottom:8, opacity:.4 }}> <img src={TAB_ICONS.technician} alt="technician" style={{ width:33, height:35 }}/></div>
              {phase === "locating" ? "Getting your location…" : "Finding mechanics near you…"}
            </div>
          ) : merged.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#555", fontSize:13 }}>
              <div style={{ fontSize:28, marginBottom:8, opacity:.4 }}> <img src={TAB_ICONS.search} alt="Search" style={{ width:28, height:30 }}/></div>
              No mechanics found.
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>
                {merged.length} mechanic{merged.length !== 1 ? "s" : ""} · sorted by rating then distance
              </div>
              {merged.map((p, i) => <ProviderCard key={p.id || p.providerId || i} provider={p}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ cars, allScheduled, serviceLog, user }) {
  const today = new Date();
  const [viewYear,      setViewYear]      = useState(today.getFullYear());
  const [viewMonth,     setViewMonth]     = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dayEvents,     setDayEvents]     = useState(null);

  const events = useMemo(() => {
    const out = [];
    cars.forEach(car => {
      const sched    = allScheduled[car.id] || {};
      const schedule = generateSchedule(car, serviceLog);
      schedule.forEach(svc => {
        const s = sched[svc.id];
        if (s?.confirmed && s?.date) {
          out.push({ car, svc, date: new Date(s.date + "T00:00:00") });
        }
      });
    });
    return out;
  }, [cars, allScheduled, serviceLog]);

  const eventsByDate = useMemo(() => {
    return events.reduce((map, ev) => {
      const key = ev.date.toISOString().slice(0,10);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
      return map;
    }, {});
  }, [events]);

  function prevMonth() { if (viewMonth===0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }
  function nextMonth() { if (viewMonth===11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }

  function handleDayClick(dayEvs) {
    if (!dayEvs.length) return;
    if (dayEvs.length === 1) setSelectedEvent({ ...dayEvs[0], user });
    else setDayEvents(dayEvs);
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length:daysInMonth }, (_, i) => i+1)];
  const todayStr    = today.toISOString().slice(0,10);

  const upcomingThisMonth = [...events]
    .filter(e => e.date >= new Date(viewYear, viewMonth, 1) && e.date <= new Date(viewYear, viewMonth+1, 0))
    .sort((a, b) => a.date - b.date);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={prevMonth} style={{ background:"#16181e", border:"1px solid #252830", borderRadius:8, padding:"7px 14px", color:"#888", fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>‹</button>
        <div style={{ fontSize:17, fontWeight:600 }}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
        <button onClick={nextMonth} style={{ background:"#16181e", border:"1px solid #252830", borderRadius:8, padding:"7px 14px", color:"#888", fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>›</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".06em", padding:"4px 0" }}>{d}</div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:24 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`}/>;
          const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const dayEvs  = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} onClick={() => handleDayClick(dayEvs)}
              onMouseEnter={e => { if (dayEvs.length) e.currentTarget.style.borderColor = "#e0a820"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isToday?"#e0a820":dayEvs.length?"#1a4a0a":"#252830"; }}
              style={{ minHeight:64, borderRadius:8, padding:"6px 4px", background:isToday?"#1e1a08":dayEvs.length?"#0e1e0a":"#16181e", border:`1px solid ${isToday?"#e0a820":dayEvs.length?"#1a4a0a":"#252830"}`, cursor:dayEvs.length?"pointer":"default", transition:"border-color .15s" }}>
              <div style={{ fontSize:12, fontWeight:isToday?700:400, color:isToday?"#e0a820":dayEvs.length?"#639922":"#555", textAlign:"right", marginBottom:3 }}>{day}</div>
              {dayEvs.slice(0,3).map((ev, j) => (
                <div key={j} title={`${ev.car.make} ${ev.car.model} — ${ev.svc.name}`}
                  style={{ fontSize:9, background:STATUS_STYLES[ev.svc.status].bg, color:STATUS_STYLES[ev.svc.status].text, border:`1px solid ${STATUS_STYLES[ev.svc.status].border}`, borderRadius:4, padding:"1px 4px", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap", overflow:"hidden" }}>
                    <img src={ev.svc.icon} alt={ev.svc.name} style={{ width:12, height:12, objectFit:"contain", flexShrink:0 }}/>
                    <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{ev.svc.name}</span>
                  </div>
                </div>
              ))}
              {dayEvs.length > 3 && <div style={{ fontSize:9, color:"#555" }}>+{dayEvs.length-3} more</div>}
            </div>
          );
        })}
      </div>

      {upcomingThisMonth.length > 0 ? (
        <div>
          <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8 }}>Scheduled this month</div>
          <div style={{ fontSize:11, color:"#444", marginBottom:12 }}>Tap a service to find nearby mechanics</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {upcomingThisMonth.map((ev, i) => {
              const sm = STATUS_STYLES[ev.svc.status];
              return (
                <div key={i} onClick={() => setSelectedEvent({...ev, user})}
                  style={{ background:"#16181e", border:"1px solid #252830", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", transition:"border-color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#e0a820"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#252830"}>
                  <div style={{ width:44, height:44, borderRadius:8, background:sm.bg, border:`1px solid ${sm.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    <img src={ev.svc.icon} alt={ev.svc.name} style={{ width:24, height:24, objectFit:"contain" }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{ev.svc.name}</div>
                    <div style={{ fontSize:11, color:"#666" }}>{ev.car.make} {ev.car.model} {ev.car.year}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#e0a820" }}>€{ev.svc.costMin}–{ev.svc.costMax}</div>
                    <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{ev.date.getDate()} {MONTH_NAMES[ev.date.getMonth()].slice(0,3)}</div>
                  </div>
                  <div style={{ fontSize:16, color:"#555", flexShrink:0 }}>›</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"32px 0", color:"#444", fontSize:13 }}>
          No services scheduled for {MONTH_NAMES[viewMonth]}.<br/>
          <span style={{ color:"#555" }}>Go to a car card, pick a date and hit "Schedule service".</span>
        </div>
      )}

      {dayEvents     && <DayEventsPicker events={dayEvents} onSelect={ev => { setDayEvents(null); setSelectedEvent({...ev, user}); }} onClose={() => setDayEvents(null)}/>}
      {selectedEvent && <NearbyProviders event={selectedEvent} onClose={() => setSelectedEvent(null)}/>}
    </div>
  );
}

function ServiceCard({ svc, scheduled, onToggle, onDate, onComplete }) {
  const sm        = STATUS_STYLES[svc.status];
  const confirmed = scheduled?.confirmed || false;
  const completed = scheduled?.completed || false;
  const dateVal   = scheduled?.date      || "";

  return (
    <div style={{ background:"#0d0f12", borderRadius:10, padding:14, border:`1px solid ${completed?"#1a4a0a":"#252830"}`, marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
        <img src={svc.icon} alt={svc.name} style={{ width:28, height:28, objectFit:"contain", flexShrink:0 }}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:3 }}>
            <span style={{ fontSize:14, fontWeight:600 }}>{svc.name}</span>
            {completed
              ? <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20, background:"#0e1e0a", color:"#639922", border:"1px solid #1a4a0a" }}>✓ Done</span>
              : <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20, background:sm.bg, color:sm.text, border:`1px solid ${sm.border}` }}>{sm.label}</span>
            }
          </div>
          <div style={{ fontSize:11, color:"#555" }}>
            {svc.category} · {svc.remaining <= 0 ? `Overdue by ${Math.abs(svc.remaining).toLocaleString()} km` : `Due in ${svc.remaining.toLocaleString()} km`} · Next at {svc.nextDue.toLocaleString()} km
          </div>
        </div>
      </div>

      {svc.tasks.map((t, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#888", marginBottom:4 }}>
          <span style={{ color:"#555" }}>→</span>
          <span style={{ flex:1 }}>{t.desc}</span>
          <span style={{ fontSize:10, borderRadius:12, padding:"1px 7px", fontWeight:600,
            background:t.action==="replace"?"#2a1010":t.action==="inspect"?"#1e2028":"#0e1e0a",
            color:t.action==="replace"?"#E24B4A":t.action==="inspect"?"#888":"#639922",
            border:`1px solid ${t.action==="replace"?"#5a1a1a":t.action==="inspect"?"#252830":"#1a4a0a"}` }}>
            {t.action}
          </span>
        </div>
      ))}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid #252830", paddingTop:8, marginTop:8 }}>
        <span style={{ fontSize:11, color:"#555" }}>Approx. cost</span>
        <span style={{ fontSize:13, fontWeight:700, color:"#e0a820" }}>€{svc.costMin}–€{svc.costMax}</span>
      </div>

      <div style={{ height:3, borderRadius:2, background:"#252830", overflow:"hidden", marginTop:10 }}>
        <div style={{ height:"100%", width:`${Math.round(svc.pct)}%`, background:completed?"#639922":sm.text, borderRadius:2, transition:"width .4s" }}/>
      </div>

      {!confirmed && !completed && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10, gap:8, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".06em" }}>Date:</span>
            <input type="date" value={dateVal} onChange={e => onDate(svc.id, e.target.value)}
              style={{ background:"#16181e", border:"1px solid #252830", borderRadius:6, padding:"5px 9px", fontSize:12, color:"#f0f0f0", fontFamily:"inherit", outline:"none", cursor:"pointer" }}/>
          </div>
          <button onClick={() => onToggle(svc.id, true)}
            style={{ background:"#e0a820", border:"none", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, color:"#0d0f12", cursor:"pointer", fontFamily:"inherit" }}>
            Schedule service
          </button>
        </div>
      )}

      {confirmed && !completed && (
        <>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10, gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".06em" }}>Date:</span>
              <span style={{ fontSize:12, color:"#888" }}>{dateVal || "—"}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ background:"#0e1e0a", border:"1px solid #1a4a0a", borderRadius:8, padding:"7px 12px", fontSize:12, fontWeight:700, color:"#639922" }}>
                ✓ Scheduled
              </div>
              <button onClick={() => onToggle(svc.id, false)} title="Unschedule"
                style={{ background:"#1a1010", border:"1px solid #5a1a1a", borderRadius:8, padding:"7px 10px", fontSize:14, fontWeight:700, color:"#E24B4A", cursor:"pointer", fontFamily:"inherit", lineHeight:1 }}>
                ×
              </button>
            </div>
          </div>
          <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid #252830", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:"#555" }}>Service performed?</span>
            <button onClick={() => onComplete(svc.id)}
              style={{ background:"#0e1e0a", border:"1px solid #1a4a0a", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, color:"#639922", cursor:"pointer", fontFamily:"inherit" }}
              onMouseEnter={e => { e.currentTarget.style.background="#1a3a0a"; e.currentTarget.style.borderColor="#2a6a0a"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#0e1e0a"; e.currentTarget.style.borderColor="#1a4a0a"; }}>
              ✓ Mark as done
            </button>
          </div>
        </>
      )}

      {completed && (
        <div style={{ marginTop:10, borderTop:"1px solid #252830", paddingTop:10, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:11, color:"#639922" }}>✓ Completed{dateVal ? ` on ${dateVal}` : ""}</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => onComplete(svc.id, true)}
              style={{ background:"none", border:"1px solid #252830", borderRadius:6, padding:"5px 10px", fontSize:11, color:"#555", cursor:"pointer", fontFamily:"inherit" }}>
              Undo
            </button>
            <button onClick={() => onToggle(svc.id, false)}
              style={{ background:"#e0a820", border:"none", borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:700, color:"#0d0f12", cursor:"pointer", fontFamily:"inherit" }}>
              Schedule next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CarCard({ car, serviceLog, onDelete, scheduled, onToggle, onDate, onComplete, deleting }) {
  const [open, setOpen] = useState(false);
  const schedule = useMemo(() => generateSchedule(car, serviceLog), [car, serviceLog]);
  const statusCounts = useMemo(() => ({
    urgent: schedule.filter(s => s.status === "urgent").length,
    soon:   schedule.filter(s => s.status === "soon").length,
    ok:     schedule.filter(s => s.status === "ok").length,
  }), [schedule]);

  const scheduledCount = Object.values(scheduled || {}).filter(s => s.confirmed && !s.completed).length;
  const completedCount = Object.values(scheduled || {}).filter(s => s.completed).length;
  const type = getCarType(car);
  const icon = CAR_ICONS[type] || CAR_ICONS.Sedan;

  const carDef = CAR_MODELS.find(c => c.make === car.make && c.model === car.model);
  const photoSrc = (
    carDef?.years?.find(g => car.year >= g.yearStart && car.year <= (g.yearEnd ?? Infinity))?.image
    || carDef?.years?.[carDef.years.length - 1]?.image
    || null
  );

  return (
    <div style={{ background:"#16181e", border:"1px solid #252830", borderRadius:14, overflow:"hidden", marginBottom:12 }}>
      {!open && (
        <div onClick={() => setOpen(true)} style={{ padding:16, display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
          <div style={{ width:52, height:52, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:"#0d0f12" }}>
            <img src={icon} alt={type} style={{ width:40, height:40, objectFit:"contain" }}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <span style={{ fontSize:12, color:"#555" }}>{car.make}</span>
              <span style={{ fontSize:12, color:"#888" }}>{car.year}</span>
            </div>
            <div style={{ fontSize:17, fontWeight:600 }}>{car.model}</div>
            <div style={{ fontSize:13, color:"#888", marginTop:2 }}>{parseInt(car.mileage).toLocaleString()} km</div>
            <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
              <Badge text={type}/>
              {car.fuelType && <Badge text={car.fuelType}/>}
              <Badge text={`${parseInt(car.mileage).toLocaleString()} km`}/>
              {scheduledCount > 0 && <Badge text={<><img src={TAB_ICONS.calendar1} alt="Scheduled" style={{ width:16, height:16, marginRight:4 }}/> {scheduledCount} scheduled</>} green/>}
              {completedCount > 0 && <Badge text={`✓ ${completedCount} done`} green/>}
            </div>
          </div>
          <span style={{ color:"#555", fontSize:20, lineHeight:1, flexShrink:0 }}>▾</span>
        </div>
      )}

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ display:"flex", alignItems:"stretch", cursor:"pointer", minHeight:160 }}>
            <div style={{ width:190, flexShrink:0, padding:17, display:"flex", alignItems:"center" }}>
              <div style={{ width:"100%", height:160, borderRadius:12, border:"1px solid #252830", overflow:"hidden", background:"#0d0f12", position:"relative", flexShrink:0 }}>
                {photoSrc && (
                  <img src={photoSrc} alt={`${car.make} ${car.model}`}
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", borderRadius:12 }}
                    onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
                  />
                )}
                <div style={{ display:photoSrc?"none":"flex", alignItems:"center", justifyContent:"center", width:"100%", height:"100%" }}>
                  <img src={icon} alt={type} style={{ width:60, height:60, objectFit:"contain", opacity:.7 }}/>
                </div>
              </div>
            </div>
            <div style={{ flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", gap:6, minWidth:0 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3 }}>
                  <span style={{ fontSize:12, color:"#555" }}>{car.make}</span>
                  <span style={{ fontSize:12, color:"#888" }}>{car.year}</span>
                </div>
                <div style={{ fontSize:19, fontWeight:700, lineHeight:1.1 }}>{car.model}</div>
                <div style={{ fontSize:13, color:"#888", marginTop:4 }}>{parseInt(car.mileage).toLocaleString()} km</div>
              </div>
              <div style={{ display:"flex", gap:6, marginTop:2, flexWrap:"wrap" }}>
                <Badge text={type}/>
                {car.fuelType && <Badge text={car.fuelType}/>}
                <Badge text={`${parseInt(car.mileage).toLocaleString()} km`}/>
                {scheduledCount > 0 && <Badge text={<><img src={TAB_ICONS.calendar1} alt="Scheduled" style={{ width:14, height:15, marginRight:4 }}/> {scheduledCount} scheduled</>} green/>}
                {completedCount > 0 && <Badge text={`✓ ${completedCount} done`} green/>}
              </div>
              <div style={{ display:"flex", gap:6, marginTop:7, flexWrap:"wrap" }}>
                {statusCounts.urgent > 0 && (
                  <div style={{ background:"#2a1010", border:"1px solid #5a1a1a", borderRadius:8, padding:"4px 10px" }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#E24B4A" }}>{statusCounts.urgent}</span>
                    <span style={{ fontSize:10, color:"#a06060", marginLeft:4 }}>overdue</span>
                  </div>
                )}
                {statusCounts.soon > 0 && (
                  <div style={{ background:"#241c0a", border:"1px solid #5a420a", borderRadius:8, padding:"4px 10px" }}>
                    <span style={{ fontSize:14, fontWeight:700, color:"#EF9F27" }}>{statusCounts.soon}</span>
                    <span style={{ fontSize:10, color:"#8a7040", marginLeft:4 }}>due soon</span>
                  </div>
                )}
                <div style={{ background:"#0e1e0a", border:"1px solid #1a4a0a", borderRadius:8, padding:"4px 10px" }}>
                  <span style={{ fontSize:14, fontWeight:700, color:"#639922" }}>{statusCounts.ok}</span>
                  <span style={{ fontSize:10, color:"#4a6a20", marginLeft:4 }}>good</span>
                </div>
              </div>
            </div>
            <div style={{ padding:"14px 12px 0 0", flexShrink:0 }}>
              <span style={{ color:"#555", fontSize:20, lineHeight:1, transform:"rotate(180deg)", display:"inline-block" }}>▾</span>
            </div>
          </div>

          <div style={{ borderTop:"1px solid #252830", padding:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".08em" }}>
                Maintenance · {schedule.length} items
              </span>
              <button onClick={e => { e.stopPropagation(); onDelete(car.id); }} disabled={deleting}
                style={{ background:"none", border:"none", fontSize:13, color:deleting?"#333":"#555", cursor:deleting?"not-allowed":"pointer", padding:"4px 8px", borderRadius:6, fontFamily:"inherit" }}>
                {deleting ? "Removing…" : "Remove car"}
              </button>
            </div>
            {schedule.map(svc => (
              <ServiceCard key={svc.id} svc={svc}
                scheduled={(scheduled || {})[svc.id]}
                onToggle={onToggle}
                onDate={onDate}
                onComplete={onComplete}
              />
            ))}
          </div>
        </>
      )}

      {!open && (
        <div style={{ display:"flex", gap:8, padding:"0 16px 14px" }}>
          {statusCounts.urgent > 0 && <StatusChip n={statusCounts.urgent} label="overdue"  bg="#2a1010" border="#5a1a1a" col="#E24B4A" sub="#a06060"/>}
          {statusCounts.soon   > 0 && <StatusChip n={statusCounts.soon}   label="due soon" bg="#241c0a" border="#5a420a" col="#EF9F27" sub="#8a7040"/>}
          <StatusChip n={statusCounts.ok} label="good" bg="#0e1e0a" border="#1a4a0a" col="#639922" sub="#4a6a20"/>
        </div>
      )}
    </div>
  );
}

function MyCar({
  cars, allScheduled, serviceLog, garageLoaded, garageError,
  onAddCar, onDeleteCar, onToggle, onDate, onComplete,
  onClearError, onServiceLogged, onServiceLogRemoved, user
}) {
  const [showModal,  setShowModal]  = useState(false);
  const [tab,        setTab]        = useState("garage");
  const [saving,     setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function addCar(formData) {
    setSaving(true);
    try {
      const res = await axiosAuth.post(`${API_URL}/cars`, formData);
      onAddCar(res.data);
      setShowModal(false);
    } catch {}
    finally { setSaving(false); }
  }

  async function deleteCar(id) {
    setDeletingId(id);
    try {
      await axiosAuth.delete(`${API_URL}/cars/${id}`);
      onDeleteCar(id);
    } catch {}
    finally { setDeletingId(null); }
  }

  async function completeService(carId, svcId) {
    const car = cars.find(c => c.id === carId);
    const svc = generateSchedule(car, serviceLog).find(s => s.id === svcId);
    const res = await axiosAuth.post(`${API_URL}/cars/${carId}/complete-service`, {
      serviceId: svc.id, serviceName: svc.name, category: svc.category,
      mileageAt: car.mileage, date: new Date().toISOString().slice(0,10),
      costMin: svc.costMin, costMax: svc.costMax,
    });
    onServiceLogged({ ...res.data, carId: parseInt(carId) });
    onComplete(carId, svcId);
  }

  async function undoService(carId, svcId) {
    const logForCar = serviceLog.filter(l => l.carId === parseInt(carId) && l.serviceId === svcId);
    const mostRecent = logForCar.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (!mostRecent?.id) { onComplete(carId, svcId, true); return; }
    try {
      await axiosAuth.delete(`${API_URL}/cars/${carId}/service-log/${mostRecent.id}`, { withCredentials: true });
      onServiceLogRemoved(mostRecent.id);
    } catch (err) {
      console.error("Failed to delete service log", err);
    }
    onComplete(carId, svcId, true);
  }

  const totalScheduled = Object.values(allScheduled).reduce(
    (sum, car) => sum + Object.values(car).filter(s => s.confirmed && !s.completed).length, 0
  );

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", minHeight:"100vh", background:"#0d0f12", color:"#f0f0f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        input[type=date]::-webkit-calendar-picker-indicator { filter:invert(.6); cursor:pointer; }
        input[type=number]::-webkit-inner-spin-button { opacity:.4; }
        select option { background:#1a1c22; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#1a1c21; }
        ::-webkit-scrollbar-thumb { background:#333; border-radius:4px; }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px 80px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:".08em", color:"#e0a820" }}>CARCARE</div>
          <button onClick={() => setShowModal(true)} style={{ background:"#e0a820", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, color:"#0d0f12", cursor:"pointer", fontFamily:"inherit" }}>+ Add car</button>
        </div>

        {garageError && (
          <div style={{ background:"#2a1010", border:"1px solid #5a1a1a", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#E24B4A", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            {garageError}
            <button onClick={onClearError} style={{ background:"none", border:"none", color:"#E24B4A", cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
          </div>
        )}

        <div style={{ display:"flex", gap:4, marginBottom:24, background:"#16181e", borderRadius:10, padding:4, width:"fit-content" }}>
          {[["garage", "My Garage"],["calendar", "Calendar"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ background:tab===key?"#e0a820":"none", border:"none", borderRadius:7, padding:"7px 18px", fontSize:13, fontWeight:tab===key?700:400, color:tab===key?"#0d0f12":"#888", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
              <img src={TAB_ICONS[key]} alt={key} style={{ width:25, height:25 }}/>{label}
            </button>
          ))}
        </div>

        {!garageLoaded ? (
          <div style={{ textAlign:"center", padding:"80px 20px", color:"#555", fontSize:14 }}>
            <div style={{ fontSize:32, marginBottom:12, opacity:.4 }}>⏳</div>
            Loading your garage…
          </div>
        ) : (
          <>
            {tab === "garage" && (
              <>
                <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>My garage</div>
                <div style={{ fontSize:13, color:"#555", marginBottom:20 }}>Click a car to expand its maintenance schedule</div>
                {cars.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"80px 20px", color:"#555" }}>
                    <div style={{ fontSize:56, opacity:.3, marginBottom:16 }}>🚗</div>
                    <div style={{ fontSize:18, color:"#888", marginBottom:8, fontWeight:500 }}>No vehicles yet</div>
                    <div style={{ fontSize:13, lineHeight:1.7, marginBottom:24 }}>Add your car to get a personalised maintenance schedule<br/>with service items, costs and calendar scheduling.</div>
                    <button onClick={() => setShowModal(true)} style={{ background:"#e0a820", border:"none", borderRadius:8, padding:"10px 20px", fontSize:14, fontWeight:700, color:"#0d0f12", cursor:"pointer", fontFamily:"inherit" }}>+ Add my first car</button>
                  </div>
                ) : cars.map(car => (
                  <CarCard key={car.id} car={car} serviceLog={serviceLog}
                    onDelete={deleteCar}
                    deleting={deletingId === car.id}
                    scheduled={allScheduled[car.id] || {}}
                    onToggle={(svcId, val) => onToggle(car.id, svcId, val)}
                    onDate={(svcId, val) => onDate(car.id, svcId, val)}
                    onComplete={(svcId, undo) => {
                      if (undo) undoService(car.id, svcId);
                      else      completeService(car.id, svcId);
                    }}
                  />
                ))}
              </>
            )}
            {tab === "calendar" && (
              <>
                <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Service calendar</div>
                <div style={{ fontSize:13, color:"#555", marginBottom:20 }}>All your scheduled services across every vehicle</div>
                {cars.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"60px 20px", color:"#555", fontSize:13 }}>Add a car first, then schedule its services to see them here.</div>
                ) : (
                  <CalendarView cars={cars} allScheduled={allScheduled} serviceLog={serviceLog} user={user}/>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showModal && <AddCarModal onAdd={addCar} onClose={() => setShowModal(false)} saving={saving}/>}
    </div>
  );
}

export default MyCar;