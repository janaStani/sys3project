import { useState, useMemo, useEffect, useCallback } from "react";
import axiosAuth from "../Utils/axiosAuth";
import { API_URL } from "../Utils/Configuration";

const MAKES = ["BMW","Mercedes","Audi","Volkswagen","Toyota","Ford","Honda","Hyundai","Kia","Mazda","Peugeot","Renault","Fiat","Volvo","Skoda","Seat","Opel","Nissan","Subaru","Lexus","Other"];
const TYPES = ["Sedan","SUV","Hatchback","Coupe","Estate","Convertible","Van","Pickup","Electric","Hybrid"];
const CAR_EMOJIS = {"SUV":"🚙","Sedan":"🚗","Hatchback":"🚗","Coupe":"🏎️","Estate":"🚙","Convertible":"🏎️","Van":"🚐","Pickup":"🛻","Electric":"⚡","Hybrid":"🔋"};
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Visual config for each service urgency level, used across cards and the calendar
const STATUS_STYLES = {
  urgent: { label:"Overdue",  bg:"#2a1010", border:"#5a1a1a", text:"#E24B4A" },
  soon:   { label:"Due soon", bg:"#241c0a", border:"#5a420a", text:"#EF9F27" },
  ok:     { label:"Good",     bg:"#0e1e0a", border:"#1a4a0a", text:"#639922" },
};

const INPUT_STYLE = { background:"#0d0f12",border:"1px solid #333",borderRadius:8,padding:"10px 12px",fontSize:14,color:"#f0f0f0",fontFamily:"inherit",outline:"none",width:"100%" };

// Returns the full list of service intervals, adjusted for electric/hybrid vehicles
function getServiceIntervals(isElectric) {
  return [
    { id:"oil",      name:isElectric?"Coolant flush":"Engine oil & filter",       icon:"🛢️", category:"Engine",       kmInterval:isElectric?40000:10000,  tasks:[{action:"replace",desc:isElectric?"Flush & replace coolant":"Drain & replace oil — 5W-30 fully synthetic"},{action:"inspect",desc:"Check for leaks around gaskets and seals"}],               baseCost:[isElectric?80:70,isElectric?120:110] },
    { id:"brakes",   name:"Brake pads & discs",                                   icon:"🔴", category:"Brakes",       kmInterval:40000,                    tasks:[{action:"inspect",desc:"Measure pad thickness — replace if below 3mm"},{action:"replace",desc:"Front & rear pads; check disc wear and runout"}],                                              baseCost:[180,350] },
    { id:"tires",    name:"Tyre rotation & alignment",                             icon:"🔄", category:"Wheels",       kmInterval:10000,                    tasks:[{action:"check",desc:"Rotate all four tyres, balance wheels"},{action:"inspect",desc:"Check tread depth — min 1.6mm legal, 3mm recommended"},{action:"inspect",desc:"Adjust alignment if needed"}], baseCost:[50,90] },
    { id:"air",      name:"Engine air filter",                                     icon:"💨", category:"Filters",      kmInterval:20000,                    tasks:[{action:"inspect",desc:"Check filter for dust/debris"},{action:"replace",desc:"Replace with OEM-spec air filter element"}],                                                                   baseCost:[25,60] },
    { id:"cabin",    name:"Cabin air filter",                                      icon:"🌬️", category:"Filters",      kmInterval:15000,                    tasks:[{action:"replace",desc:"Replace cabin pollen filter — affects AC performance"},{action:"inspect",desc:"Check AC system for mould/odours"}],                                                    baseCost:[20,50] },
    { id:"spark",    name:isElectric?"Battery health & cells":"Spark plugs",       icon:isElectric?"⚡":"✨", category:"Engine", kmInterval:isElectric?50000:60000, tasks:[{action:isElectric?"check":"replace",desc:isElectric?"Check cell balance, capacity, and cooling":"Replace with iridium plugs; check ignition coils"}],                             baseCost:isElectric?[150,300]:[80,200] },
    { id:"brake_fl", name:"Brake fluid",                                           icon:"🧪", category:"Fluids",       kmInterval:30000,                    tasks:[{action:"replace",desc:"Replace DOT 4 brake fluid"},{action:"inspect",desc:"Check for contamination with tester strips"}],                                                                    baseCost:[40,80] },
    { id:"battery",  name:isElectric?"12V auxiliary battery":"Car battery",        icon:"🔋", category:"Electrical",   kmInterval:60000,                    tasks:[{action:"inspect",desc:"Load test battery under 250A draw"},{action:"replace",desc:"Replace if below 70% capacity or 4+ years old"}],                                                        baseCost:[80,200] },
    { id:"trans",    name:isElectric?"Motor & gearbox oil":"Transmission fluid",   icon:"⚙️", category:"Transmission", kmInterval:60000,                    tasks:[{action:"inspect",desc:"Check fluid level and condition"},{action:"replace",desc:isElectric?"Replace motor oil per manufacturer spec":"Flush ATF — ZF or OEM fluid"}],                       baseCost:[120,250] },
    { id:"wiper",    name:"Wiper blades",                                          icon:"🌧️", category:"Visibility",   kmInterval:20000,                    tasks:[{action:"replace",desc:"Replace front & rear wiper blades"},{action:"check",desc:"Top up screenwash fluid"}],                                                                                baseCost:[20,60] },
    { id:"coolant",  name:isElectric?"Thermal management fluid":"Coolant flush",   icon:"🌡️", category:"Fluids",       kmInterval:isElectric?60000:50000,   tasks:[{action:"replace",desc:isElectric?"Replace thermal management coolant":"Flush and replace OEM-spec coolant"},{action:"inspect",desc:"Inspect hoses and expansion tank"}],                   baseCost:[isElectric?100:60,isElectric?180:120] },
    { id:"susp",     name:"Suspension & steering",                                 icon:"🔩", category:"Chassis",      kmInterval:40000,                    tasks:[{action:"inspect",desc:"Check ball joints, tie rod ends, bushings"},{action:"inspect",desc:"Check power steering fluid and rack for leaks"}],                                                baseCost:[80,200] },
  ];
}

function getCarType(car) { return car.type || car.style || "Sedan"; }

// Builds a prioritised maintenance schedule based on current mileage.
// Sorts: overdue first, then due soon, then ok.
function generateSchedule(car) {
  const isElectric = ["Electric","Hybrid"].includes(getCarType(car));
  const km = parseInt(car.mileage) || 0;
  return getServiceIntervals(isElectric).map(s => {
    const lastDone  = Math.floor(km / s.kmInterval) * s.kmInterval;
    const nextDue   = lastDone + s.kmInterval;
    const remaining = nextDue - km;
    const pct       = Math.min(100, Math.max(0, ((km - lastDone) / s.kmInterval) * 100));
    const status    = remaining <= 0 ? "urgent" : remaining < s.kmInterval * 0.2 ? "soon" : "ok";
    return { ...s, lastDone, nextDue, remaining, pct, status, costMin: s.baseCost[0], costMax: s.baseCost[1] };
  }).sort((a,b) => ({urgent:0,soon:1,ok:2}[a.status] - {urgent:0,soon:1,ok:2}[b.status]) || a.remaining - b.remaining);
}


// Shown when multiple services share the same calendar day — lets the user pick which one to open
function DayEventsPicker({ events, onSelect, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#16181e",border:"1px solid #252830",borderRadius:16,width:"100%",maxWidth:400,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:600}}>Choose a service</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {events.map((ev,i) => {
            const sm = STATUS_STYLES[ev.svc.status];
            return (
              <div key={i} onClick={()=>onSelect(ev)}
                style={{background:"#0d0f12",border:"1px solid #252830",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#e0a820"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#252830"}>
                <div style={{width:36,height:36,borderRadius:8,background:sm.bg,border:`1px solid ${sm.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{ev.svc.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600}}>{ev.svc.name}</div>
                  <div style={{fontSize:11,color:"#555"}}>{ev.car.make} {ev.car.model}</div>
                </div>
                <div style={{fontSize:12,color:"#888"}}>›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// Slide-up panel showing service providers near the user's location.
// Requests geolocation on mount, then fetches from the API with coordinates if available.
function NearbyProviders({ event, onClose }) {
  const [providers, setProviders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [location,  setLocation]  = useState(null);
  const [locError,  setLocError]  = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported by your browser.");
      fetchProviders(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => { const coords = {lat:pos.coords.latitude,lng:pos.coords.longitude}; setLocation(coords); fetchProviders(coords); },
      ()  => { setLocError("Could not detect location — showing all providers."); fetchProviders(null); },
      { timeout:6000 }
    );
  }, []);

  function fetchProviders(coords) {
    setLoading(true);
    const query = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : "";
    axiosAuth.get(`${API_URL}/providers${query}`)
      .then(res => {
        const data = res.data;
        // API may return a plain array or { providers: [...] }
        const list = Array.isArray(data) ? data : Array.isArray(data.providers) ? data.providers : [];
        setProviders(list);
      })
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }

  const { svc, car, date } = event || {};
  const locationStatus = loading ? "Detecting your location…" : location ? "Location detected — showing nearby providers" : locError || "Showing all providers";

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#16181e",borderRadius:"20px 20px 0 0",border:"1px solid #252830",borderBottom:"none",width:"100%",maxWidth:680,maxHeight:"80vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>

        <div style={{padding:"20px 20px 16px",borderBottom:"1px solid #252830",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
            <div>
              <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>
                {date?.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}
              </div>
              <div style={{fontSize:18,fontWeight:600}}>{svc?.icon} {svc?.name}</div>
              {car && <div style={{fontSize:12,color:"#555",marginTop:2}}>{car.make} {car.model} {car.year}</div>}
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:24,cursor:"pointer",lineHeight:1,padding:4}}>×</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>📍</span>
            <span style={{fontSize:12,color:location?"#639922":"#555"}}>{locationStatus}</span>
          </div>
        </div>

        <div style={{overflowY:"auto",padding:"16px 20px 24px",flex:1}}>
          {loading ? (
            <div style={{textAlign:"center",padding:"40px 0",color:"#555",fontSize:13}}>
              <div style={{fontSize:28,marginBottom:8,opacity:.4}}>🔧</div>
              Finding mechanics near you…
            </div>
          ) : providers.length === 0 ? (
            <div style={{textAlign:"center",padding:"40px 0",color:"#555",fontSize:13}}>
              <div style={{fontSize:28,marginBottom:8,opacity:.4}}>🔍</div>
              No service providers found near you.
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>
                {providers.length} Provider{providers.length!==1?"s":""} found
              </div>
              {providers.map((p,i) => <ProviderCard key={p.providerId||i} provider={p} svc={svc}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider: p }) {
  const rating = parseFloat(p.rating) || 0;
  const stars  = Math.round(rating);
  return (
    <div style={{background:"#0d0f12",border:"1px solid #252830",borderRadius:12,padding:16}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
        <div style={{width:44,height:44,borderRadius:10,background:"#16181e",border:"1px solid #252830",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🔧</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:15,fontWeight:600,marginBottom:2}}>{p.provider||p.name||"Service Provider"}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            {rating>0 && (
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                {[1,2,3,4,5].map(n=><span key={n} style={{fontSize:12,color:n<=stars?"#e0a820":"#2a2d35"}}>★</span>)}
                <span style={{fontSize:11,color:"#888"}}>{rating.toFixed(1)}</span>
              </div>
            )}
            {p.priceRange && <span style={{fontSize:11,color:"#e0a820",background:"#1e1a08",border:"1px solid #4a3a10",borderRadius:12,padding:"1px 8px"}}>{p.priceRange}</span>}
          </div>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
        {p.location && <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#888"}}><span style={{color:"#555",width:14,textAlign:"center"}}>📍</span>{p.location}{p.zipcode?`, ${p.zipcode}`:""}</div>}
        {p.hours    && <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#888"}}><span style={{color:"#555",width:14,textAlign:"center"}}>🕐</span>{p.hours}</div>}
        {p.item     && <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#888"}}><span style={{color:"#555",width:14,textAlign:"center"}}>🛠️</span>Specialises in: {p.item}</div>}
      </div>
      <a href={`https://www.google.com/maps/search/${encodeURIComponent((p.provider||"")+" "+(p.location||""))}`}
        target="_blank" rel="noopener noreferrer"
        style={{display:"inline-block",background:"#e0a820",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:700,color:"#0d0f12",textDecoration:"none"}}>
        View on Maps →
      </a>
    </div>
  );
}


// Modal for adding a new vehicle — validates inputs before calling onAdd
function AddCarModal({ onAdd, onClose, saving }) {
  const [form, setForm] = useState({ make:"BMW", model:"", year:"", type:"Sedan", mileage:"" });
  const [err,  setErr]  = useState("");
  const setField = (k,v) => setForm(f=>({...f,[k]:v}));

  function submit() {
    if (!form.model.trim())                                  { setErr("Please enter a model name."); return; }
    if (!form.year || form.year < 1990 || form.year > 2026) { setErr("Enter a valid year (1990–2026)."); return; }
    if (form.mileage === "" || form.mileage < 0)            { setErr("Please enter current mileage."); return; }
    onAdd({ ...form, year:parseInt(form.year), mileage:parseInt(form.mileage) });
  }

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,zIndex:200}}>
      <div style={{background:"#1a1c22",border:"1px solid #333",borderRadius:16,width:"100%",maxWidth:460}}>
        <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:600}}>Add your car</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:24,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"0 20px 20px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Make"><select value={form.make} onChange={e=>setField("make",e.target.value)} style={INPUT_STYLE}>{MAKES.map(m=><option key={m}>{m}</option>)}</select></Field>
            <Field label="Model"><input value={form.model} onChange={e=>setField("model",e.target.value)} placeholder="e.g. X5, Golf…" style={INPUT_STYLE}/></Field>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Year"><input type="number" value={form.year} onChange={e=>setField("year",e.target.value)} placeholder="2020" min="1990" max="2026" style={INPUT_STYLE}/></Field>
            <Field label="Type"><select value={form.type} onChange={e=>setField("type",e.target.value)} style={INPUT_STYLE}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></Field>
          </div>
          <Field label="Current mileage (km)">
            <input type="number" value={form.mileage} onChange={e=>setField("mileage",e.target.value)} placeholder="e.g. 35000" min="0" style={INPUT_STYLE}/>
          </Field>
          {err && <div style={{fontSize:12,color:"#E24B4A",padding:"8px 12px",background:"#2a1010",border:"1px solid #5a1a1a",borderRadius:8}}>{err}</div>}
          <button onClick={submit} disabled={saving} style={{background:"#e0a820",border:"none",borderRadius:10,padding:12,fontSize:15,fontWeight:700,color:"#0d0f12",cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",opacity:saving?.7:1}}>
            {saving ? "Saving…" : "Add to my garage →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <label style={{fontSize:11,color:"#888",textTransform:"uppercase",letterSpacing:".08em"}}>{label}</label>
      {children}
    </div>
  );
}


// Interactive month-view calendar. Clicking a day with events opens the nearby-providers
// panel, or a picker first if multiple services share that day.
function CalendarView({ cars, allScheduled }) {
  const today = new Date();
  const [viewYear,      setViewYear]      = useState(today.getFullYear());
  const [viewMonth,     setViewMonth]     = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dayEvents,     setDayEvents]     = useState(null);

  // Collect every confirmed service event across all cars
  const events = useMemo(() => {
    const out = [];
    cars.forEach(car => {
      const sched    = allScheduled[car.id] || {};
      const schedule = generateSchedule(car);
      schedule.forEach(svc => {
        const s = sched[svc.id];
        if (s?.confirmed && s?.date) {
          out.push({ car, svc, date: new Date(s.date + "T00:00:00") });
        }
      });
    });
    return out;
  }, [cars, allScheduled]);

  // Index events by ISO date string for fast calendar cell lookups
  const eventsByDate = useMemo(() => {
    return events.reduce((map, ev) => {
      const key = ev.date.toISOString().slice(0,10);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
      return map;
    }, {});
  }, [events]);

  function prevMonth() { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); }
  function nextMonth() { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); }

  function handleDayClick(dayEvs) {
    if (!dayEvs.length) return;
    if (dayEvs.length === 1) setSelectedEvent(dayEvs[0]);
    else setDayEvents(dayEvs);
  }

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const cells       = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  const todayStr    = today.toISOString().slice(0,10);

  const upcomingThisMonth = [...events]
    .filter(e => e.date >= new Date(viewYear,viewMonth,1) && e.date <= new Date(viewYear,viewMonth+1,0))
    .sort((a,b) => a.date-b.date);

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <button onClick={prevMonth} style={{background:"#16181e",border:"1px solid #252830",borderRadius:8,padding:"7px 14px",color:"#888",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>‹</button>
        <div style={{fontSize:17,fontWeight:600}}>{MONTH_NAMES[viewMonth]} {viewYear}</div>
        <button onClick={nextMonth} style={{background:"#16181e",border:"1px solid #252830",borderRadius:8,padding:"7px 14px",color:"#888",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>›</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {DAY_NAMES.map(d=><div key={d} style={{textAlign:"center",fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:".06em",padding:"4px 0"}}>{d}</div>)}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:24}}>
        {cells.map((day,i) => {
          if (!day) return <div key={`empty-${i}`}/>;
          const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const dayEvs  = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          return (
            <div key={dateStr} onClick={()=>handleDayClick(dayEvs)}
              onMouseEnter={e=>{ if(dayEvs.length) e.currentTarget.style.borderColor="#e0a820"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor = isToday?"#e0a820":dayEvs.length?"#1a4a0a":"#252830"; }}
              style={{minHeight:64,borderRadius:8,padding:"6px 4px",background:isToday?"#1e1a08":dayEvs.length?"#0e1e0a":"#16181e",border:`1px solid ${isToday?"#e0a820":dayEvs.length?"#1a4a0a":"#252830"}`,cursor:dayEvs.length?"pointer":"default",transition:"border-color .15s"}}>
              <div style={{fontSize:12,fontWeight:isToday?700:400,color:isToday?"#e0a820":dayEvs.length?"#639922":"#555",textAlign:"right",marginBottom:3}}>{day}</div>
              {dayEvs.slice(0,3).map((ev,j)=>(
                <div key={j} title={`${ev.car.make} ${ev.car.model} — ${ev.svc.name}`}
                  style={{fontSize:9,background:STATUS_STYLES[ev.svc.status].bg,color:STATUS_STYLES[ev.svc.status].text,border:`1px solid ${STATUS_STYLES[ev.svc.status].border}`,borderRadius:4,padding:"1px 4px",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                  {ev.svc.icon} {ev.svc.name}
                </div>
              ))}
              {dayEvs.length>3 && <div style={{fontSize:9,color:"#555"}}>+{dayEvs.length-3} more</div>}
            </div>
          );
        })}
      </div>

      {upcomingThisMonth.length > 0 ? (
        <div>
          <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:".08em",marginBottom:8}}>Scheduled this month</div>
          <div style={{fontSize:11,color:"#444",marginBottom:12}}>Tap a service to find nearby mechanics</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {upcomingThisMonth.map((ev,i)=>{
              const sm = STATUS_STYLES[ev.svc.status];
              return (
                <div key={i} onClick={()=>setSelectedEvent(ev)}
                  style={{background:"#16181e",border:"1px solid #252830",borderRadius:10,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"border-color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#e0a820"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#252830"}>
                  <div style={{width:44,height:44,borderRadius:8,background:sm.bg,border:`1px solid ${sm.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{ev.svc.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{ev.svc.name}</div>
                    <div style={{fontSize:11,color:"#666"}}>{ev.car.make} {ev.car.model} {ev.car.year}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#e0a820"}}>€{ev.svc.costMin}–{ev.svc.costMax}</div>
                    <div style={{fontSize:11,color:"#555",marginTop:2}}>{ev.date.getDate()} {MONTH_NAMES[ev.date.getMonth()].slice(0,3)}</div>
                  </div>
                  <div style={{fontSize:16,color:"#555",flexShrink:0}}>›</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{textAlign:"center",padding:"32px 0",color:"#444",fontSize:13}}>
          No services scheduled for {MONTH_NAMES[viewMonth]}.<br/>
          <span style={{color:"#555"}}>Go to a car card, pick a date and hit "Schedule service".</span>
        </div>
      )}

      {dayEvents && (
        <DayEventsPicker events={dayEvents} onSelect={ev=>{ setDayEvents(null); setSelectedEvent(ev); }} onClose={()=>setDayEvents(null)}/>
      )}
      {selectedEvent && (
        <NearbyProviders event={selectedEvent} onClose={()=>setSelectedEvent(null)}/>
      )}
    </div>
  );
}


// Displays a single service item with status, tasks, cost estimate, progress bar, and schedule controls
function ServiceCard({ svc, scheduled, onToggle, onDate }) {
  const sm        = STATUS_STYLES[svc.status];
  const confirmed = scheduled?.confirmed || false;
  const dateVal   = scheduled?.date || "";
  return (
    <div style={{background:"#0d0f12",borderRadius:10,padding:14,border:"1px solid #252830",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
        <span style={{fontSize:22,flexShrink:0}}>{svc.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
            <span style={{fontSize:14,fontWeight:600}}>{svc.name}</span>
            <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:20,background:sm.bg,color:sm.text,border:`1px solid ${sm.border}`}}>{sm.label}</span>
          </div>
          <div style={{fontSize:11,color:"#555"}}>
            {svc.category} · {svc.remaining<=0?`Overdue by ${Math.abs(svc.remaining).toLocaleString()} km`:`Due in ${svc.remaining.toLocaleString()} km`} · Next at {svc.nextDue.toLocaleString()} km
          </div>
        </div>
      </div>
      {svc.tasks.map((t,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#888",marginBottom:4}}>
          <span style={{color:"#555"}}>→</span>
          <span style={{flex:1}}>{t.desc}</span>
          <span style={{fontSize:10,borderRadius:12,padding:"1px 7px",fontWeight:600,background:t.action==="replace"?"#2a1010":t.action==="inspect"?"#1e2028":"#0e1e0a",color:t.action==="replace"?"#E24B4A":t.action==="inspect"?"#888":"#639922",border:`1px solid ${t.action==="replace"?"#5a1a1a":t.action==="inspect"?"#252830":"#1a4a0a"}`}}>{t.action}</span>
        </div>
      ))}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #252830",paddingTop:8,marginTop:8}}>
        <span style={{fontSize:11,color:"#555"}}>Approx. cost</span>
        <span style={{fontSize:13,fontWeight:700,color:"#e0a820"}}>€{svc.costMin}–€{svc.costMax}</span>
      </div>
      {/* Progress bar showing how far through the service interval the car is */}
      <div style={{height:3,borderRadius:2,background:"#252830",overflow:"hidden",marginTop:10}}>
        <div style={{height:"100%",width:`${Math.round(svc.pct)}%`,background:sm.text,borderRadius:2,transition:"width .4s"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,gap:8,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:".06em"}}>Date:</span>
          <input type="date" value={dateVal} onChange={e=>onDate(svc.id,e.target.value)} disabled={confirmed}
            style={{background:"#16181e",border:"1px solid #252830",borderRadius:6,padding:"5px 9px",fontSize:12,color:"#f0f0f0",fontFamily:"inherit",outline:"none",opacity:confirmed?.4:1,cursor:confirmed?"default":"pointer"}}/>
        </div>
        <button onClick={()=>onToggle(svc.id,!confirmed)} style={{background:confirmed?"#0e1e0a":"#e0a820",border:confirmed?"1px solid #1a4a0a":"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,color:confirmed?"#639922":"#0d0f12",cursor:"pointer",fontFamily:"inherit"}}>
          {confirmed?"✓ Scheduled":"Schedule service"}
        </button>
      </div>
    </div>
  );
}


// Expandable card representing one vehicle. Shows status chips collapsed,
// full maintenance schedule when expanded.
function CarCard({ car, onDelete, scheduled, onToggle, onDate, deleting }) {
  const [open, setOpen] = useState(false);
  const schedule = useMemo(()=>generateSchedule(car),[car]);
  const statusCounts = useMemo(()=>({
    urgent: schedule.filter(s=>s.status==="urgent").length,
    soon:   schedule.filter(s=>s.status==="soon").length,
    ok:     schedule.filter(s=>s.status==="ok").length,
  }),[schedule]);
  const scheduledCount = Object.values(scheduled||{}).filter(s=>s.confirmed).length;
  const type  = getCarType(car);
  const emoji = CAR_EMOJIS[type] || "🚗";
  return (
    <div style={{background:"#16181e",border:"1px solid #252830",borderRadius:14,overflow:"hidden",marginBottom:12}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:16,display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
        <div style={{width:52,height:52,borderRadius:10,background:"#0d0f12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,border:"1px solid #252830"}}>{emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,color:"#555",marginBottom:2}}>{car.make}</div>
          <div style={{fontSize:17,fontWeight:600}}>{car.model}</div>
          <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
            <Badge text={car.year} gold/>
            <Badge text={type}/>
            <Badge text={`${parseInt(car.mileage).toLocaleString()} km`}/>
            {scheduledCount>0 && <Badge text={`📅 ${scheduledCount} scheduled`} green/>}
          </div>
        </div>
        <span style={{color:"#555",fontSize:20,transition:"transform .2s",transform:open?"rotate(180deg)":"none",lineHeight:1,flexShrink:0}}>▾</span>
      </div>
      <div style={{display:"flex",gap:8,padding:"0 16px 14px"}}>
        {statusCounts.urgent>0 && <StatusChip n={statusCounts.urgent} label="overdue"  bg="#2a1010" border="#5a1a1a" col="#E24B4A" sub="#a06060"/>}
        {statusCounts.soon>0   && <StatusChip n={statusCounts.soon}   label="due soon" bg="#241c0a" border="#5a420a" col="#EF9F27" sub="#8a7040"/>}
        <StatusChip n={statusCounts.ok} label="good" bg="#0e1e0a" border="#1a4a0a" col="#639922" sub="#4a6a20"/>
      </div>
      {open && (
        <div style={{borderTop:"1px solid #252830",padding:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:".08em"}}>Maintenance · {schedule.length} items</span>
            <button onClick={e=>{e.stopPropagation();onDelete(car.id);}} disabled={deleting} style={{background:"none",border:"none",fontSize:13,color:deleting?"#333":"#555",cursor:deleting?"not-allowed":"pointer",padding:"4px 8px",borderRadius:6,fontFamily:"inherit"}}>
              {deleting?"Removing…":"Remove car"}
            </button>
          </div>
          {schedule.map(svc=>(
            <ServiceCard key={svc.id} svc={svc} scheduled={(scheduled||{})[svc.id]} onToggle={onToggle} onDate={onDate}/>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ text, gold, green }) {
  return <span style={{fontSize:10,borderRadius:20,padding:"2px 8px",background:gold?"#1e1a08":green?"#0e1e0a":"#1e2028",color:gold?"#e0a820":green?"#639922":"#888",border:`1px solid ${gold?"#4a3a10":green?"#1a4a0a":"#252830"}`}}>{text}</span>;
}

function StatusChip({ n, label, bg, border, col, sub }) {
  return (
    <div style={{background:bg,border:`1px solid ${border}`,borderRadius:8,padding:"5px 10px",flex:1,textAlign:"center"}}>
      <div style={{fontSize:16,fontWeight:700,color:col}}>{n}</div>
      <div style={{fontSize:10,color:sub}}>{label}</div>
    </div>
  );
}


// Root page component. Owns the car list and scheduled-service state,
// and syncs both to the backend on every mutation.
export default function MyCar() {
  const [cars,         setCars]         = useState([]);
  const [allScheduled, setAllScheduled] = useState({});
  const [showModal,    setShowModal]    = useState(false);
  const [tab,          setTab]          = useState("garage");
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [deletingId,   setDeletingId]   = useState(null);
  const [error,        setError]        = useState("");

  // Load cars on mount. Scheduled data may arrive as a JSON string from the DB.
  useEffect(() => {
    axiosAuth.get(`${API_URL}/cars`)
      .then(res => {
        const loaded = res.data || [];
        setCars(loaded);
        const sched = {};
        loaded.forEach(c => {
          sched[c.id] = c.scheduled
            ? typeof c.scheduled === "string" ? JSON.parse(c.scheduled) : c.scheduled
            : {};
        });
        setAllScheduled(sched);
      })
      .catch(() => setError("Could not load your cars. Are you logged in?"))
      .finally(() => setLoading(false));
  }, []);

  // Persist a car's scheduled map — fire-and-forget with error surfacing
  const saveScheduled = useCallback((carId, scheduled) => {
    axiosAuth.post(`${API_URL}/cars/${carId}/scheduled`, scheduled)
      .catch(() => setError("Could not save schedule. Please try again."));
  }, []);

  async function addCar(formData) {
    setSaving(true); setError("");
    try {
      const res  = await axiosAuth.post(`${API_URL}/cars`, formData);
      const saved = res.data;
      setCars(prev => [...prev, saved]);
      setAllScheduled(prev => ({ ...prev, [saved.id]: {} }));
      setShowModal(false);
    } catch { setError("Could not save car. Please try again."); }
    finally { setSaving(false); }
  }

  async function deleteCar(id) {
    setDeletingId(id); setError("");
    try {
      await axiosAuth.delete(`${API_URL}/cars/${id}`);
      setCars(prev => prev.filter(c => c.id !== id));
      setAllScheduled(prev => { const n={...prev}; delete n[id]; return n; });
    } catch { setError("Could not remove car. Please try again."); }
    finally { setDeletingId(null); }
  }

  function handleToggle(carId, svcId, val) {
    setAllScheduled(prev => {
      const updated = { ...prev, [carId]: { ...prev[carId], [svcId]: { ...(prev[carId]||{})[svcId], confirmed: val } } };
      saveScheduled(carId, updated[carId]);
      return updated;
    });
  }

  function handleDate(carId, svcId, val) {
    setAllScheduled(prev => {
      const updated = { ...prev, [carId]: { ...prev[carId], [svcId]: { ...(prev[carId]||{})[svcId], date: val } } };
      saveScheduled(carId, updated[carId]);
      return updated;
    });
  }

  const totalScheduled = Object.values(allScheduled).reduce((sum,car)=>sum+Object.values(car).filter(s=>s.confirmed).length, 0);

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",minHeight:"100vh",background:"#0d0f12",color:"#f0f0f0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.6);cursor:pointer;}
        input[type=number]::-webkit-inner-spin-button{opacity:.4;}
        select option{background:#1a1c22;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#1a1c21;}::-webkit-scrollbar-thumb{background:#333;border-radius:4px;}
      `}</style>

      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px 80px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:".08em",color:"#e0a820"}}>CARCARE</div>
          <button onClick={()=>setShowModal(true)} style={{background:"#e0a820",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:700,color:"#0d0f12",cursor:"pointer",fontFamily:"inherit"}}>+ Add car</button>
        </div>

        {error && (
          <div style={{background:"#2a1010",border:"1px solid #5a1a1a",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#E24B4A",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            {error}
            <button onClick={()=>setError("")} style={{background:"none",border:"none",color:"#E24B4A",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
          </div>
        )}

        <div style={{display:"flex",gap:4,marginBottom:24,background:"#16181e",borderRadius:10,padding:4,width:"fit-content"}}>
          {[["garage","🚗 My Garage"],["calendar","📅 Calendar"]].map(([key,label])=>(
            <button key={key} onClick={()=>setTab(key)} style={{background:tab===key?"#e0a820":"none",border:"none",borderRadius:7,padding:"7px 18px",fontSize:13,fontWeight:tab===key?700:400,color:tab===key?"#0d0f12":"#888",cursor:"pointer",fontFamily:"inherit",transition:"all .15s",position:"relative"}}>
              {label}
              {/* Badge showing total confirmed appointments across all cars */}
              {key==="calendar" && totalScheduled>0 && (
                <span style={{position:"absolute",top:-4,right:-4,background:"#E24B4A",color:"#fff",fontSize:9,fontWeight:700,borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>{totalScheduled}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"80px 20px",color:"#555",fontSize:14}}>
            <div style={{fontSize:32,marginBottom:12,opacity:.4}}>⏳</div>
            Loading your garage…
          </div>
        ) : (
          <>
            {tab==="garage" && (
              <>
                <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>My garage</div>
                <div style={{fontSize:13,color:"#555",marginBottom:20}}>Click a car to expand its maintenance schedule</div>
                {cars.length===0 ? (
                  <div style={{textAlign:"center",padding:"80px 20px",color:"#555"}}>
                    <div style={{fontSize:56,opacity:.3,marginBottom:16}}>🚗</div>
                    <div style={{fontSize:18,color:"#888",marginBottom:8,fontWeight:500}}>No vehicles yet</div>
                    <div style={{fontSize:13,lineHeight:1.7,marginBottom:24}}>Add your car to get a personalised maintenance schedule<br/>with service items, costs and calendar scheduling.</div>
                    <button onClick={()=>setShowModal(true)} style={{background:"#e0a820",border:"none",borderRadius:8,padding:"10px 20px",fontSize:14,fontWeight:700,color:"#0d0f12",cursor:"pointer",fontFamily:"inherit"}}>+ Add my first car</button>
                  </div>
                ) : cars.map(car=>(
                  <CarCard key={car.id} car={car}
                    onDelete={deleteCar}
                    deleting={deletingId===car.id}
                    scheduled={allScheduled[car.id]||{}}
                    onToggle={(svcId,val)=>handleToggle(car.id,svcId,val)}
                    onDate={(svcId,val)=>handleDate(car.id,svcId,val)}/>
                ))}
              </>
            )}
            {tab==="calendar" && (
              <>
                <div style={{fontSize:20,fontWeight:600,marginBottom:4}}>Service calendar</div>
                <div style={{fontSize:13,color:"#555",marginBottom:20}}>All your scheduled services across every vehicle</div>
                {cars.length===0 ? (
                  <div style={{textAlign:"center",padding:"60px 20px",color:"#555",fontSize:13}}>Add a car first, then schedule its services to see them here.</div>
                ) : (
                  <CalendarView cars={cars} allScheduled={allScheduled}/>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showModal && <AddCarModal onAdd={addCar} onClose={()=>setShowModal(false)} saving={saving}/>}
    </div>
  );
}