import React from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

class SignupView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fields:       { username: "", email: "", password: "", name: "", surname: "", zipcode: "" },
            status:       { success: null, msg: "" },
            loading:      false,
            showPassword: false,
        };
    }

    handleField = (e) => {
        this.setState({ fields: { ...this.state.fields, [e.target.name]: e.target.value } });
    };

    handleKeyDown = (e) => {
        if (e.key === "Enter") this.submit();
    };

    submit = async () => {
        const { username, email, password, name, surname, zipcode } = this.state.fields;

        if (!username || !email || !password || !name || !surname || !zipcode) {
            this.setState({ status: { success: false, msg: "Please fill in all fields." } });
            return;
        }
        if (password.length < 8) {
            this.setState({ status: { success: false, msg: "Password must be at least 8 characters." } });
            return;
        }

        this.setState({ loading: true, status: { success: null, msg: "" } });

        try {
            const res = await axios.post(
                `${API_URL}/users/register`,
                { username, email, password, name, surname, zipcode },
                { withCredentials: true }
            );

            if (res.status === 201 || res.data.status?.success) {
                this.setState({
                    status: { success: true, msg: "Account created! You can now sign in." },
                    fields: { username: "", email: "", password: "", name: "", surname: "" },
                    loading: false,
                });
            } else {
                this.setState({ status: { success: false, msg: res.data.status?.msg || "Failed to register." }, loading: false });
            }
        } catch (err) {
            const msg = err.response?.data?.status?.msg || "An error occurred. Please try again.";
            this.setState({ status: { success: false, msg }, loading: false });
        }
    };

    render() {
        const { fields, status, loading, showPassword } = this.state;

        return (
            <div style={S.page}>
                <style>{FONTS}</style>
                <div style={S.card}>
                    <div style={S.logo}>CARCARE</div>
                    <div style={S.subtitle}>Create your account</div>

                    <div style={S.grid}>
                        <div>
                            <label style={S.label}>Name</label>
                            <input name="name" value={fields.name} onChange={this.handleField} onKeyDown={this.handleKeyDown} type="text" placeholder="Jan" style={S.input} />
                        </div>
                        <div>
                            <label style={S.label}>Surname</label>
                            <input name="surname" value={fields.surname} onChange={this.handleField} onKeyDown={this.handleKeyDown} type="text" placeholder="Novak" style={S.input} />
                        </div>
                    </div>
                    <div style={S.fieldWrap}>
                        <label style={S.label}>Zipcode</label>
                        <input name="zipcode" value={fields.zipcode} onChange={this.handleField} onKeyDown={this.handleKeyDown} type="text" placeholder="1000" style={S.input} />
                    </div>

                    <div style={S.fieldWrap}>
                        <label style={S.label}>Username</label>
                        <input name="username" value={fields.username} onChange={this.handleField} onKeyDown={this.handleKeyDown} type="text" placeholder="your_username" style={S.input} autoComplete="username" />
                    </div>

                    <div style={S.fieldWrap}>
                        <label style={S.label}>Email</label>
                        <input name="email" value={fields.email} onChange={this.handleField} onKeyDown={this.handleKeyDown} type="email" placeholder="you@example.com" style={S.input} autoComplete="email" />
                    </div>

                    <div style={S.fieldWrap}>
                        <label style={S.label}>Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                name="password"
                                value={fields.password}
                                onChange={this.handleField}
                                onKeyDown={this.handleKeyDown}
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                style={{ ...S.input, paddingRight: 52 }}
                                autoComplete="new-password"
                            />
                            <button style={S.toggleBtn} onClick={() => this.setState({ showPassword: !showPassword })} tabIndex={-1}>
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        <div style={S.hint}>At least 8 characters</div>
                    </div>

                    <button
                        style={{ ...S.btn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                        onClick={this.submit}
                        disabled={loading}
                    >
                        {loading ? "Creating account…" : "Create account →"}
                    </button>

                    {status.success === false && <div style={S.error}>{status.msg}</div>}
                    {status.success === true  && <div style={S.success}>{status.msg}</div>}
                </div>
            </div>
        );
    }
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap');*{box-sizing:border-box;}`;

const S = {
    page:      { minHeight: "100vh", width: "100%", background: "#0d0f12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif", padding: "20px" },
    card:      { width: "100%", maxWidth: 460, background: "#16181e", border: "1px solid #252830", borderRadius: 20, padding: "40px 36px", boxShadow: "0 24px 80px rgba(0,0,0,.5)" },
    logo:      { fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: ".1em", color: "#e0a820", marginBottom: 6 },
    subtitle:  { fontSize: 13, color: "#555", marginBottom: 32 },
    label:     { fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6, display: "block" },
    input:     { width: "100%", background: "#0d0f12", border: "1px solid #252830", borderRadius: 10, padding: "11px 14px", fontSize: 14, color: "#f0f0f0", fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    grid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
    fieldWrap: { marginBottom: 16 },
    toggleBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "inherit" },
    hint:      { fontSize: 11, color: "#444", marginTop: 5 },
    btn:       { width: "100%", background: "#e0a820", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, color: "#0d0f12", fontFamily: "inherit", marginTop: 8, transition: "opacity .2s" },
    error:     { background: "#2a1010", border: "1px solid #5a1a1a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#E24B4A", marginTop: 14 },
    success:   { background: "#0e1e0a", border: "1px solid #1a4a0a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#639922", marginTop: 14 },
};

export default SignupView;