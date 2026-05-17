import React, { Component } from "react";
import About from "./CustomComponents/about";
import MyCar from "./CustomComponents/MyCar";
import Car from "./CustomComponents/car";
import Rating from "./CustomComponents/Rating";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
import axios from "axios";
import { API_URL } from "./Utils/Configuration";
import "./App.css";

const PROTECTED_PAGES = ["MY_CAR", "CAR", "RATING"];

const PAGE_MAP = {
  MY_CAR: MyCar,
  CAR: Car,
  RATING: Rating,
};

function NavLink({ onClick, children, danger }) {
  return (
    <a
      onClick={onClick}
      href="#"
      className={`nav-link${danger ? " nav-link--danger" : ""}`}
    >
      {children}
    </a>
  );
}

class App extends Component {
  state = {
    currentPage: "ABOUT",
    user: null,
    sessionChecked: false,
  };

  componentDidMount() {
    this.checkSession();
  }

  checkSession = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/session`, { withCredentials: true });
      this.setState({
        user: data.logged_in ? data.user : null,
        sessionChecked: true,
      });
    } catch {
      this.setState({ sessionChecked: true });
    }
  };

  handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/users/logout`, { withCredentials: true });
    } finally {
      this.setState({ user: null, currentPage: "ABOUT" });
    }
  };

  setLoggedIn = (user) => {
    this.setState({ user, currentPage: "MY_CAR" });
  };

  setPage = (currentPage) => {
    this.setState({ currentPage });
  };

  renderPage() {
    const { currentPage, user, sessionChecked } = this.state;

    if (!sessionChecked) {
      return (
        <div className="loading-screen">
          <div className="loading-brand">CARCARE</div>
          <div>Loading…</div>
        </div>
      );
    }

    if (PROTECTED_PAGES.includes(currentPage) && !user) {
      return <LoginView QUserFromChild={this.setLoggedIn} />;
    }

    if (PAGE_MAP[currentPage]) {
      const PageComponent = PAGE_MAP[currentPage];
      return <PageComponent />;
    }

    if (currentPage === "SIGNUP") return <SignupView QUserFromChild={this.setLoggedIn} />;
    if (currentPage === "LOGIN") return <LoginView QUserFromChild={this.setLoggedIn} />;

    return <About />;
  }

  render() {
    const { user } = this.state;

    return (
      <div id="APP">
        <nav className="navbar">
          <a onClick={() => this.setPage("ABOUT")} href="#" className="navbar-brand">
            CARCARE
          </a>
          <div className="navbar-links">
            {user ? (
              <>
                <NavLink onClick={() => this.setPage("MY_CAR")}>My Car</NavLink>
                <NavLink onClick={() => this.setPage("CAR")}>Car</NavLink>
                <NavLink onClick={() => this.setPage("RATING")}>Rating</NavLink>
                <NavLink onClick={this.handleLogout} danger>Log out</NavLink>
              </>
            ) : (
              <>
                <NavLink onClick={() => this.setPage("SIGNUP")}>Sign up</NavLink>
                <NavLink onClick={() => this.setPage("LOGIN")}>Log in</NavLink>
              </>
            )}
          </div>
        </nav>
        <div id="viewer">{this.renderPage()}</div>
      </div>
    );
  }
}

export default App;