import React from "react";

const FEATURES = [
    { icon: "🔧", title: "Smart maintenance schedules",  desc: "Get personalised service intervals based on your car's mileage and type. Never miss an oil change or brake inspection again." },
    { icon: "💰", title: "Cost estimates",                desc: "Know what to expect before visiting the garage. Each service item comes with a realistic cost range so you can budget ahead." },
    { icon: "📅", title: "Calendar planning",             desc: "Schedule upcoming services directly on the built-in calendar. See all your vehicles' service events in one place." },
    { icon: "🚗", title: "Multi-vehicle garage",          desc: "Add as many cars as you need. Each vehicle gets its own maintenance dashboard tailored to its make, model, and fuel type." },
    { icon: "⚡", title: "EV & hybrid support",           desc: "Electric and hybrid vehicles have different needs. CarCare adapts service intervals and items automatically for your powertrain." },
    { icon: "🔒", title: "Your data, your garage",        desc: "Your vehicles and schedules are saved to your account and persist across sessions. Log in from anywhere and pick up where you left off." },
];

const BADGES = ["🛢️ Oil & filters", "🔴 Brakes", "🔄 Tyres", "⚡ Battery", "📅 Scheduling"];

class About extends React.Component {
    render() {
        return (
            <div style={S.page}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap');`}</style>

                {/* Hero */}
                <div style={S.hero}>
                    <div style={S.logo}>CARCARE</div>
                    <div style={S.tagline}>
                        Your personal vehicle maintenance companion. Keep your cars in top shape
                        with smart service schedules, cost estimates, and calendar planning.
                    </div>
                    <div style={S.badges}>
                        {BADGES.map(b => <span key={b} style={S.badge}>{b}</span>)}
                    </div>
                </div>

                {/* Feature cards */}
                <div style={S.grid}>
                    {FEATURES.map((f, i) => (
                        <div key={i} style={S.card}>
                            <div style={S.cardIcon}>{f.icon}</div>
                            <div style={S.cardTitle}>{f.title}</div>
                            <div style={S.cardDesc}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                <div style={S.footer}>Sign up or log in to start tracking your vehicles.</div>
            </div>
        );
    }
}

const S = {
    page:      { minHeight: "calc(100vh - 56px)", background: "#0d0f12", fontFamily: "'DM Sans', system-ui, sans-serif", color: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px" },
    hero:      { textAlign: "center", maxWidth: 640, marginBottom: 64 },
    logo:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, letterSpacing: ".1em", color: "#e0a820", lineHeight: 1, marginBottom: 16 },
    tagline:   { fontSize: 18, color: "#888", lineHeight: 1.7, marginBottom: 32 },
    badges:    { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
    badge:     { fontSize: 12, padding: "6px 14px", borderRadius: 20, background: "#16181e", border: "1px solid #252830", color: "#888" },
    grid:      { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, width: "100%", maxWidth: 900 },
    card:      { background: "#16181e", border: "1px solid #252830", borderRadius: 16, padding: "24px 20px" },
    cardIcon:  { fontSize: 32, marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
    cardDesc:  { fontSize: 13, color: "#666", lineHeight: 1.6 },
    footer:    { marginTop: 64, fontSize: 12, color: "#333", textAlign: "center" },
};

export default About;