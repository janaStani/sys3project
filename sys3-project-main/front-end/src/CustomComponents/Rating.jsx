import React from "react";
import axiosAuth from "../Utils/axiosAuth";
import { API_URL } from "../Utils/Configuration";

const STAR_COLORS = ["#E24B4A", "#e07820", "#e0a820", "#a0c030", "#639922"];
const STAR_LABELS = ["Terrible", "Poor", "OK", "Good", "Excellent"];

function StarPicker({ value, onChange, readonly = false }) {
    const [hovered, setHovered] = React.useState(0);
    const display = readonly ? value : (hovered || value);

    return (
        <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <span
                    key={n}
                    onClick={() => !readonly && onChange?.(n === value ? 0 : n)}
                    onMouseEnter={() => !readonly && setHovered(n)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    style={{
                        fontSize:   readonly ? 18 : 28,
                        cursor:     readonly ? "default" : "pointer",
                        color:      n <= display ? STAR_COLORS[Math.min(display, 5) - 1] : "#2a2d35",
                        transition: "color .15s, transform .1s",
                        transform:  !readonly && n <= display ? "scale(1.15)" : "scale(1)",
                        display:    "inline-block",
                        userSelect: "none",
                    }}
                >★</span>
            ))}
        </div>
    );
}

class Rating extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery:       "",
            mechanics:         [],
            searchLoading:     false,
            searchError:       "",
            selectedMechanic:  null,
            rating:            0,
            comment:           "",
            jobType:           "",
            saving:            false,
            saveStatus:        null,
            reviews:           [],
            reviewsLoading:    false,
            editId:            null,
        };
    }

    componentDidMount() {
        this.fetchReviews();
    }

    fetchReviews = () => {
        this.setState({ reviewsLoading: true });
        axiosAuth.get(`${API_URL}/reviews`)
            .then(res => {
                const data = res.data;
                const reviews = Array.isArray(data) ? data : Array.isArray(data.reviews) ? data.reviews : [];
                this.setState({ reviews, reviewsLoading: false });
            })
            .catch(() => this.setState({ reviews: [], reviewsLoading: false }));
    };

    searchMechanics = () => {
        const { searchQuery } = this.state;
        if (!searchQuery.trim()) return;
        this.setState({ searchLoading: true, searchError: "", mechanics: [] });
        axiosAuth.get(`${API_URL}/reviews/mechanics?q=${encodeURIComponent(searchQuery)}`)
            .then(res => this.setState({ mechanics: res.data.mechanics || res.data || [], searchLoading: false }))
            .catch(() => this.setState({ searchError: "Could not find mechanics. Try a different name.", searchLoading: false }));
    };

    selectMechanic = (m) => {
        this.setState({ selectedMechanic: m, mechanics: [], searchQuery: m.name || m.username || "" });
    };

    submitReview = async () => {
        const { selectedMechanic, rating, comment, jobType, editId } = this.state;

        if (!selectedMechanic && !editId) return;
        if (!rating)         { this.setState({ saveStatus: { success: false, msg: "Please select a star rating." } }); return; }
        if (!comment.trim()) { this.setState({ saveStatus: { success: false, msg: "Please write a comment." } }); return; }

        this.setState({ saving: true, saveStatus: null });

        try {
            const payload = {
                mechanicId:   selectedMechanic?.id,
                mechanicName: selectedMechanic?.name || selectedMechanic?.username,
                rating,
                comment,
                jobType,
            };

            if (editId) {
                await axiosAuth.put(`${API_URL}/reviews/${editId}`, payload);
            } else {
                await axiosAuth.post(`${API_URL}/reviews`, payload);
            }

            this.setState({
                saving: false,
                saveStatus:      { success: true, msg: editId ? "Review updated!" : "Review submitted!" },
                rating:          0,
                comment:         "",
                jobType:         "",
                selectedMechanic: null,
                searchQuery:     "",
                editId:          null,
            });
            this.fetchReviews();
        } catch (err) {
            this.setState({ saving: false, saveStatus: { success: false, msg: err.response?.data?.status?.msg || "Could not save review." } });
        }
    };

    editReview = (r) => {
        this.setState({
            editId:           r.id,
            rating:           r.rating || r.star || 0,
            comment:          r.comment || "",
            jobType:          r.jobType || "",
            selectedMechanic: { id: r.mechanicId, name: r.mechanicName },
            searchQuery:      r.mechanicName || "",
            saveStatus:       null,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    deleteReview = (id) => {
        axiosAuth.delete(`${API_URL}/reviews/${id}`)
            .then(() => this.fetchReviews())
            .catch(() => {});
    };

    cancelEdit = () => {
        this.setState({ editId: null, rating: 0, comment: "", jobType: "", selectedMechanic: null, searchQuery: "", saveStatus: null });
    };

    render() {
        const { searchQuery, mechanics, searchLoading, searchError, selectedMechanic, rating, comment, jobType, saving, saveStatus, reviews, reviewsLoading, editId } = this.state;

        return (
            <div style={S.page}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Bebas+Neue&display=swap');
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    ::placeholder { color: #444; }
                    ::-webkit-scrollbar { width: 4px; }
                    ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                    input:focus, textarea:focus { outline: none; border-color: #e0a820 !important; }
                `}</style>

                <div style={{ maxWidth: 720, margin: "0 auto" }}>

                    {/* Header */}
                    <div style={{ marginBottom: 32 }}>
                        <div style={S.logo}>Rate a Mechanic</div>
                        <div style={{ fontSize: 13, color: "#555" }}>Find your mechanic and share your experience</div>
                    </div>

                    {/* Form card */}
                    <div style={S.card}>

                        {editId && (
                            <div style={S.editBanner}>
                                Editing your review
                                <button onClick={this.cancelEdit} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Cancel</button>
                            </div>
                        )}

                        {/* Mechanic search */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Find Mechanic / Garage</label>
                            <div style={{ position: "relative" }}>
                                <input
                                    value={searchQuery}
                                    onChange={e => this.setState({ searchQuery: e.target.value, selectedMechanic: null })}
                                    onKeyDown={e => e.key === "Enter" && this.searchMechanics()}
                                    placeholder="Search by name or garage…"
                                    style={S.input}
                                />
                                <button onClick={this.searchMechanics} style={S.searchBtn}>
                                    {searchLoading ? "…" : "Search"}
                                </button>
                            </div>

                            {/* Search results dropdown */}
                            {mechanics.length > 0 && (
                                <div style={{ background: "#1a1c22", border: "1px solid #252830", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
                                    {mechanics.map((m, i) => (
                                        <div
                                            key={i}
                                            onClick={() => this.selectMechanic(m)}
                                            style={{ padding: "12px 16px", cursor: "pointer", borderBottom: i < mechanics.length - 1 ? "1px solid #252830" : "none", display: "flex", alignItems: "center", gap: 12 }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#252830"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            <div style={S.mechanicIcon}>🔧</div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name || m.username}</div>
                                                {m.location && <div style={{ fontSize: 11, color: "#555" }}>{m.location}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchError && <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 6 }}>{searchError}</div>}

                            {selectedMechanic && (
                                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, background: "#0e1e0a", border: "1px solid #1a4a0a", borderRadius: 8, padding: "8px 12px" }}>
                                    <span style={{ fontSize: 16 }}>✓</span>
                                    <span style={{ fontSize: 13, color: "#639922", fontWeight: 600 }}>{selectedMechanic.name || selectedMechanic.username} selected</span>
                                </div>
                            )}
                        </div>

                        {/* Job type */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Type of Job <span style={{ color: "#555", fontWeight: 400 }}>(optional)</span></label>
                            <input value={jobType} onChange={e => this.setState({ jobType: e.target.value })} placeholder="e.g. Oil change, Brake service, Full service…" style={S.input} />
                        </div>

                        {/* Star rating */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={S.label}>Your Rating</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                                <StarPicker value={rating} onChange={r => this.setState({ rating: r })} />
                                {rating > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: STAR_COLORS[rating - 1] }}>{STAR_LABELS[rating - 1]}</span>}
                            </div>
                        </div>

                        {/* Comment */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={S.label}>Your Review</label>
                            <textarea value={comment} onChange={e => this.setState({ comment: e.target.value })} placeholder="Describe your experience — quality of work, professionalism, value for money…" rows={4} style={{ ...S.input, resize: "vertical", lineHeight: 1.6 }} />
                        </div>

                        {saveStatus && (
                            <div style={{ background: saveStatus.success ? "#0e1e0a" : "#2a1010", border: `1px solid ${saveStatus.success ? "#1a4a0a" : "#5a1a1a"}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: saveStatus.success ? "#639922" : "#E24B4A" }}>
                                {saveStatus.msg}
                            </div>
                        )}

                        <button onClick={this.submitReview} disabled={saving} style={{ ...S.submitBtn, opacity: saving ? 0.7 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                            {saving ? "Saving…" : editId ? "Update Review →" : "Submit Review →"}
                        </button>
                    </div>

                    {/* Reviews list */}
                    <div style={{ marginTop: 32 }}>
                        <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>
                            {reviews.length > 0 ? `${reviews.length} Review${reviews.length !== 1 ? "s" : ""}` : "No reviews yet"}
                        </div>

                        {reviewsLoading ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#555", fontSize: 13 }}>Loading reviews…</div>
                        ) : reviews.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#555", fontSize: 13 }}>
                                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🔧</div>
                                Be the first to rate a mechanic.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {reviews.map(r => {
                                    const stars = r.rating || r.star || 0;
                                    return (
                                        <div key={r.id} style={S.reviewCard}>
                                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={S.mechanicIcon}>🔧</div>
                                                    <div>
                                                        <div style={{ fontSize: 15, fontWeight: 600 }}>{r.mechanicName || r.mechanic || "Mechanic"}</div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                                                            <StarPicker value={stars} readonly />
                                                            {stars > 0 && <span style={{ fontSize: 11, color: STAR_COLORS[stars - 1], fontWeight: 600 }}>{STAR_LABELS[stars - 1]}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                                    <button onClick={() => this.editReview(r)}   style={S.editBtn}>Edit</button>
                                                    <button onClick={() => this.deleteReview(r.id)} style={S.deleteBtn}>Delete</button>
                                                </div>
                                            </div>

                                            {r.jobType && <div style={S.jobTag}>{r.jobType}</div>}

                                            <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>{r.comment}</p>

                                            {r.createdAt && (
                                                <div style={{ fontSize: 11, color: "#444", marginTop: 10 }}>
                                                    {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const S = {
    page:       { fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0d0f12", color: "#f0f0f0", padding: "32px 20px 80px" },
    logo:       { fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: ".08em", color: "#e0a820", marginBottom: 4 },
    card:       { background: "#16181e", border: "1px solid #252830", borderRadius: 16, padding: 24, marginBottom: 32 },
    label:      { fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8, display: "block" },
    input:      { width: "100%", background: "#0d0f12", border: "1px solid #252830", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#f0f0f0", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    searchBtn:  { position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#e0a820", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#0d0f12", cursor: "pointer", fontFamily: "inherit" },
    submitBtn:  { background: "#e0a820", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#0d0f12", fontFamily: "inherit", transition: "opacity .2s" },
    editBanner: { background: "#1e1a08", border: "1px solid #4a3a10", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#e0a820", display: "flex", justifyContent: "space-between", alignItems: "center" },
    mechanicIcon: { width: 36, height: 36, borderRadius: 8, background: "#0d0f12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1px solid #252830", flexShrink: 0 },
    reviewCard: { background: "#16181e", border: "1px solid #252830", borderRadius: 14, padding: 18 },
    jobTag:     { fontSize: 11, color: "#e0a820", background: "#1e1a08", border: "1px solid #4a3a10", borderRadius: 20, padding: "2px 10px", display: "inline-block", marginBottom: 8 },
    editBtn:    { background: "none", border: "1px solid #252830", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#888", cursor: "pointer", fontFamily: "inherit" },
    deleteBtn:  { background: "none", border: "1px solid #5a1a1a", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#E24B4A", cursor: "pointer", fontFamily: "inherit" },
};

export default Rating;