import React, { useState } from "react";
import axiosAuth from "../Utils/axiosAuth";
import { API_URL } from "../Utils/Configuration";

// ── OSM / Overpass ────────────────────────────────────────────────────────────
async function getNearbyMechanicsOSM(coords) {
  const radius = 25000;
  const overpassQuery = `
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
    body: `data=${encodeURIComponent(overpassQuery)}`,
  });
  if (!res.ok) throw new Error(`OSM error: ${res.status}`);
  const data = await res.json();
  return data.elements
    .map(el => ({
      id:      String(el.id),
      name:    el.tags?.name || el.tags?.["name:sl"] || el.tags?.["name:en"] || "Auto servis",
      address: [el.tags?.["addr:street"], el.tags?.["addr:housenumber"], el.tags?.["addr:city"]].filter(Boolean).join(", "),
      phone:   el.tags?.phone || el.tags?.["contact:phone"] || "",
      website: el.tags?.website || el.tags?.["contact:website"] || "",
      lat:     el.lat ?? el.center?.lat,
      lng:     el.lon ?? el.center?.lon,
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

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const STAR_COLORS = ["#E24B4A", "#e07820", "#e0a820", "#a0c030", "#639922"];
const STAR_LABELS = ["Terrible", "Poor", "OK", "Good", "Excellent"];

const S = {
  card:      { background:"#16181e", border:"1px solid #252830", borderRadius:16, padding:24, marginBottom:32 },
  label:     { fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:".08em", marginBottom:8, display:"block" },
  input:     { width:"100%", background:"#0d0f12", border:"1px solid #252830", borderRadius:10, padding:"11px 14px", fontSize:14, color:"#f0f0f0", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  editBanner:{ background:"#1e1a08", border:"1px solid #4a3a10", borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:13, color:"#e0a820", display:"flex", justifyContent:"space-between", alignItems:"center" },
  jobTag:    { fontSize:11, color:"#e0a820", background:"#1e1a08", border:"1px solid #4a3a10", borderRadius:20, padding:"2px 10px", display:"inline-block", marginBottom:8 },
  editBtn:   { background:"none", border:"1px solid #252830", borderRadius:6, padding:"5px 10px", fontSize:11, color:"#888", cursor:"pointer", fontFamily:"inherit" },
  deleteBtn: { background:"none", border:"1px solid #5a1a1a", borderRadius:6, padding:"5px 10px", fontSize:11, color:"#E24B4A", cursor:"pointer", fontFamily:"inherit" },
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
  website: "/icons/link (1).png",
  car: "/icons/car.png",
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StarPicker({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = readonly ? value : (hovered || value);
  return (
    <div style={{ display:"flex", gap:6 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => !readonly && onChange?.(n === value ? 0 : n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{ fontSize:readonly?16:28, cursor:readonly?"default":"pointer", color:n<=display?STAR_COLORS[Math.min(display,5)-1]:"#2a2d35", transition:"color .15s, transform .1s", transform:(!readonly&&n<=display)?"scale(1.15)":"scale(1)", display:"inline-block", userSelect:"none" }}
        >★</span>
      ))}
    </div>
  );
}

function MechanicRow({ mechanic, onSelect, distKm, highlight }) {
  return (
    <div onClick={() => onSelect(mechanic)}
      style={{ padding:"12px 16px", cursor:"pointer", borderBottom:"1px solid #1a1c22", display:"flex", alignItems:"center", gap:12, background:highlight?"#1e2028":"transparent", transition:"background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#1e2028"}
      onMouseLeave={e => e.currentTarget.style.background = highlight?"#1e2028":"transparent"}
    >
      <div style={{ width:45, height:45, borderRadius:10, background:"#0d0f12", border:"1px solid #252830", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}><img src={TAB_ICONS.technician} style={{width: 30, height:30}}/></div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600 }}>{mechanic.name}</div>
        {mechanic.address && <div style={{ fontSize:11, color:"#555", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{mechanic.address}</div>}
        {mechanic.phone && <div style={{ fontSize:11, color:"#444", marginTop:1 }}>{mechanic.phone}</div>}
      </div>
      {distKm != null && (
        <div style={{ fontSize:11, color:"#e0a820", fontWeight:600, flexShrink:0 }}>{distKm.toFixed(1)} km</div>
      )}
    </div>
  );
}

function ReviewCard({ review: r, onEdit, onDelete }) {
  const stars = r.rating || 0;
  return (
    <div style={{ background:"#16181e", border:"1px solid #252830", borderRadius:14, padding:18 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:45, height:45, borderRadius:10, background:"#0d0f12", border:"1px solid #252830", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}><img src={TAB_ICONS.technician} style={{width: 30, height:30}}/></div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:3 }}>{r.mechanicName}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <StarPicker value={stars} readonly/>
              {stars > 0 && <span style={{ fontSize:11, color:STAR_COLORS[stars-1], fontWeight:600 }}>{STAR_LABELS[stars-1]}</span>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button onClick={() => onEdit(r)} style={S.editBtn}>Edit</button>
          <button onClick={() => onDelete(r.id)} style={S.deleteBtn}>Delete</button>
        </div>
      </div>
      {r.jobType && <div style={S.jobTag}>{r.jobType}</div>}
      <p style={{ fontSize:13, color:"#aaa", lineHeight:1.7 }}>{r.comment}</p>
      {r.createdAt && (
        <div style={{ fontSize:11, color:"#444", marginTop:10 }}>
          {new Date(r.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
class Mechanic extends React.Component {
  state = {
    // location + nearby
    userCoords:      null,
    nearbyMechanics: [],
    nearbyLoading:   true,
    nearbyError:     "",
    nearbyInfo:      "",

    // search
    searchQuery:   "",
    searchError:   "",

    // selection
    selectedMechanic: null,

    // form
    rating:     0,
    comment:    "",
    jobType:    "",
    saving:     false,
    saveStatus: null,
    editId:     null,

    // reviews
    reviews:        [],
    reviewsLoading: false,

    // user-added mechanics from DB
    userAddedMechanics: [],
  };

  saveStatusTimer = null;

  componentWillUnmount() {
    if (this.saveStatusTimer) clearTimeout(this.saveStatusTimer);
  }

  componentDidMount() {
    this.fetchReviews();

    const zipcode = this.props.user?.zipcode;

    const loadFromCoords = (coords) => {
      this.setState({ userCoords: coords });
      getNearbyMechanicsOSM(coords)
        .then(results => {
          const sorted = results
            .map(m => ({ ...m, distance: distanceKm(coords.lat, coords.lng, m.lat, m.lng) }))
            .sort((a, b) => a.distance - b.distance);
          this.setState({ nearbyMechanics: sorted, nearbyLoading: false });
        })
        .catch(err => {
          console.error("OSM fetch failed:", err);
          this.setState({ nearbyLoading: false, nearbyError: "Could not load nearby mechanics." });
        });
    };

    const tryZipcode = () => {
      if (!zipcode) {
        this.setState({ nearbyLoading: false, nearbyError: "Location unavailable." });
        return;
      }
      geocodeZipcode(zipcode)
        .then(coords => {
          if (!coords) {
            this.setState({ nearbyLoading: false, nearbyError: "Could not resolve your postcode." });
            return;
          }
          this.setState({ nearbyError: "", nearbyInfo: "Showing results for your account postcode." });
          loadFromCoords(coords);  // ← nearbyLoading is set to false inside here only on success
        })
        .catch(() => this.setState({ nearbyLoading: false, nearbyError: "Location unavailable." }));
    };

    if (!navigator.geolocation || location.protocol !== 'https:') {
      tryZipcode();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => loadFromCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()  => tryZipcode(),
      { timeout: 10000 }
    );
  }

  fetchReviews = () => {
    this.setState({ reviewsLoading: true });
    axiosAuth.get(`${API_URL}/reviews`)
      .then(res => this.setState({ reviews: Array.isArray(res.data) ? res.data : [], reviewsLoading: false }))
      .catch(() => this.setState({ reviews: [], reviewsLoading: false }));
  };

  selectMechanic = (m) => {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.setState({ selectedMechanic:{ ...m, manual: false}, searchQuery: ""});
  };

  clearSelection = () => {
    this.setState({ selectedMechanic: null, searchQuery: "" });
  };

  handleManualName = (e) => {
      const name = e.target.value;

      this.setState({
        searchQuery: name,
        selectedMechanic: name.trim()
          ? {
              id: "manual",
              name: name.trim(),
              address: "",
              phone: "",
              manual: true
            }
          : null
      });
    };

  showSaveStatus = (status) => {
    if (this.saveStatusTimer) clearTimeout(this.saveStatusTimer);
    this.setState({ saveStatus: status });
    if (status.success) {
      this.saveStatusTimer = setTimeout(() => this.setState({ saveStatus: null }), 3000);
    }
  };

  dismissSaveStatus = () => {
    if (this.saveStatusTimer) clearTimeout(this.saveStatusTimer);
    this.setState({ saveStatus: null });
  };

  submitReview = async () => {
    const { selectedMechanic, rating, comment, jobType, editId } = this.state;
    if (!selectedMechanic && !editId) { this.showSaveStatus({ success:false, msg:"Select a mechanic first." }); return; }
    if (!rating)         { this.showSaveStatus({ success:false, msg:"Please select a star rating." }); return; }
    if (!comment.trim()) { this.showSaveStatus({ success:false, msg:"Please write a comment." }); return; }

    // One review per user per mechanic — block obvious duplicates before the round-trip.
    // (The backend enforces this authoritatively; this is just nicer UX.)
    if (!editId && selectedMechanic) {
      const alreadyReviewed = this.state.reviews.some(
        r => r.providerId && String(r.providerId) === String(selectedMechanic.id)
      );
      if (alreadyReviewed) {
        this.showSaveStatus({ success:false, msg:"You've already reviewed this mechanic. Edit your existing review instead." });
        return;
      }
    }

    this.setState({ saving: true, saveStatus: null });
    try {
      if (editId) {
        await axiosAuth.put(`${API_URL}/reviews/${editId}`, { rating, comment, jobType });
      } else {
        // Send providerId only if it's a real DB id (small integer).
        // For OSM mechanics the backend will auto-create a ServiceProvider row.
        const sentProviderId = selectedMechanic.id;
        const isDbId = sentProviderId && /^\d+$/.test(String(sentProviderId)) && Number(sentProviderId) < 2_000_000_000;
        await axiosAuth.post(`${API_URL}/reviews`, {
          providerId:      isDbId ? sentProviderId : null,
          mechanicName:    selectedMechanic.name,
          mechanicAddress: selectedMechanic.address || "",
          rating, comment, jobType,
        });
      }
      this.setState({ saving:false, rating:0, comment:"", jobType:"", selectedMechanic:null, searchQuery:"", editId:null });
      this.showSaveStatus({ success:true, msg: editId ? "Review updated!" : "Review submitted!" });
      this.fetchReviews();
    } catch (err) {
      this.setState({ saving:false });
      this.showSaveStatus({ success:false, msg: err.response?.data?.status?.msg || "Could not save review." });
    }
  };

  editReview = (r) => {
    this.setState({ editId:r.id, rating:r.rating||0, comment:r.comment||"", jobType:r.jobType||"", selectedMechanic:{ id:r.providerId, name:r.mechanicName }, searchQuery:"", saveStatus:null });
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  deleteReview = (id) => {
    axiosAuth.delete(`${API_URL}/reviews/${id}`).then(() => this.fetchReviews()).catch(() => {});
  };

  cancelEdit = () => {
    this.setState({ editId:null, rating:0, comment:"", jobType:"", selectedMechanic:null, searchQuery:"", saveStatus:null });
  };

  render() {
    const { userCoords, nearbyMechanics, nearbyLoading, nearbyError, nearbyInfo, searchQuery, selectedMechanic, rating, comment, jobType, saving, saveStatus, editId, reviews, reviewsLoading } = this.state;

    return (
      <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", minHeight:"100vh", background:"#0d0f12", color:"#f0f0f0" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
          * { box-sizing:border-box; margin:0; padding:0; }
          ::placeholder { color:#444; }
          ::-webkit-scrollbar { width:4px; }
          ::-webkit-scrollbar-thumb { background:#333; border-radius:4px; }
          input:focus, textarea:focus { border-color:#e0a820 !important; }
          @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        `}</style>

        <div style={{ maxWidth:900, margin:"0 auto", padding: "28px 20px 80px"  }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:".08em", color:"#e0a820" }}>Rate a mechanic</div>
          </div>
          
          <div style={{ fontSize: 14, color: "#666", marginBottom: 24}}>Find a garage and share your experience</div>

          

          
          <div style={S.card}>
            <div style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:".08em", marginBottom:20 }}>
              <img src={TAB_ICONS.location} alt="location" style={{width:16, height:16, verticalAlign: 'middle'}}/> Mechanics near you, click to select
            </div>

            {nearbyInfo && (
              <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>{nearbyInfo}</div>
            )}

            {nearbyLoading ? (
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", color:"#555", fontSize:13 }}>
                <div style={{ width:24, height:24, border:"2px solid #252830", borderTop:"2px solid #e0a820", borderRadius:"50%", animation:"spin 1s linear infinite", flexShrink:0 }}/>
                Detecting your location…
              </div>
            ) : nearbyError ? (
              <div style={{ fontSize:13, color:"#555", padding:"8px 0" }}>{nearbyError}</div>
            ) : nearbyMechanics.length === 0 ? (
              <div style={{ fontSize:13, color:"#555", padding:"8px 0" }}>No mechanics found within 25 km.</div>
            ) : (
              <div style={{ maxHeight:320, overflowY:"auto", margin:"0 -24px", borderTop:"1px solid #252830" }}>
                {nearbyMechanics.map(m => (
                  <MechanicRow
                    key={m.id}
                    mechanic={m}
                    distKm={m.distance}
                    highlight={selectedMechanic?.id === m.id}
                    onSelect={this.selectMechanic}
                  />
                ))}
              </div>
            )}

            
            {selectedMechanic && (
              <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:10, background:"#0e1e0a", border:"1px solid #1a4a0a", borderRadius:10, padding:"10px 14px" }}>
                <span style={{ fontSize:18 }}>✓</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, color:"#639922", fontWeight:600 }}>{selectedMechanic.name}</div>
                  {selectedMechanic.address ? (
                    <div style={{ fontSize:11, color:"#3a6a1a", marginTop:2 }}>{selectedMechanic.address}</div>
                  ) : selectedMechanic.manual ? (
                    <div style={{ fontSize:11, color:"#3a6a1a", marginTop:2 }}>Manually entered</div>
                  ) : null}
                </div>
                <button onClick={this.clearSelection} style={{ background:"none", border:"1px solid #5a1a1a", borderRadius:6, color:"#E24B4A", cursor:"pointer", fontSize:12, padding:"4px 10px", fontFamily:"inherit" }}>
                  x</button>
              </div>
            )}

            <div style={{marginTop: 20,borderTop: "1px solid #252830",paddingTop: 20}}>
              <div style={{fontSize: 12,color: "#888",marginBottom: 10}}>
                Can't find your mechanic?</div>

              <input
                value={searchQuery}
                onChange={this.handleManualName}
                placeholder="Enter mechanic name manually..."
                style={S.input}
              />
            </div>

            </div>

          {/* ── Review form ── */}
          <div style={S.card}>
            {editId && (
              <div style={S.editBanner}>
                Editing your review
                <button onClick={this.cancelEdit} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>Cancel</button>
              </div>
            )}

            <div style={{ marginBottom:20 }}>
              <label style={S.label}>Type of Job <span style={{ color:"#555", fontWeight:400 }}>(optional)</span></label>
              <input value={jobType} onChange={e => this.setState({ jobType:e.target.value })} placeholder="e.g. Oil change, Brake service, Annual service…" style={S.input}/>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={S.label}>Your Rating</label>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:4 }}>
                <StarPicker value={rating} onChange={r => this.setState({ rating:r })}/>
                {rating > 0 && <span style={{ fontSize:13, fontWeight:600, color:STAR_COLORS[rating-1] }}>{STAR_LABELS[rating-1]}</span>}
              </div>
            </div>

            <div style={{ marginBottom:24 }}>
              <label style={S.label}>Your Review</label>
              <textarea value={comment} onChange={e => this.setState({ comment:e.target.value })} placeholder="Describe your experience — quality of work, value, professionalism…" rows={4} style={{ ...S.input, resize:"vertical", lineHeight:1.6 }}/>
            </div>

            {saveStatus && (
              <div style={{ background:saveStatus.success?"#0e1e0a":"#2a1010", border:`1px solid ${saveStatus.success?"#1a4a0a":"#5a1a1a"}`, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:saveStatus.success?"#639922":"#E24B4A", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                <span>{saveStatus.success ? `✓ ${saveStatus.msg}` : saveStatus.msg}</span>
                <button onClick={this.dismissSaveStatus} style={{ background:"none", border:"none", color:"inherit", cursor:"pointer", fontSize:16, lineHeight:1, padding:"0 2px", opacity:0.7, fontFamily:"inherit" }} aria-label="Dismiss">×</button>
              </div>
            )}

            <button onClick={this.submitReview} disabled={saving} style={{ background:"#e0a820", border:"none", borderRadius:10, padding:"12px 24px", fontSize:14, fontWeight:700, color:"#0d0f12", fontFamily:"inherit", cursor:saving?"not-allowed":"pointer", opacity:saving?0.7:1 }}>
              {saving ? "Saving…" : editId ? "Update Review →" : "Submit Review →"}
            </button>
          </div>

          {/* ── Reviews list ── */}
          <div style={{ marginTop:8 }}>
            <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:".08em", marginBottom:16 }}>
              {reviews.length > 0 ? `${reviews.length} Review${reviews.length !== 1 ? "s" : ""}` : "No reviews yet"}
            </div>
            {reviewsLoading ? (
              <div style={{ textAlign:"center", padding:"48px 0", color:"#555", fontSize:13 }}>Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 20px", color:"#555", fontSize:13 }}>
                <div style={{ fontSize:40, marginBottom:12, opacity:0.3 }}>🔧</div>
                Pick a mechanic above and leave your first review.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {reviews.map(r => <ReviewCard key={r.id} review={r} onEdit={this.editReview} onDelete={this.deleteReview}/>)}
              </div>
            )}
          </div>

        </div>
      </div>
      
    );
  }
}

export default Mechanic;