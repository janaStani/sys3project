import { Component } from "react";
import About from "./CustomComponents/about";
import MyCar from "./CustomComponents/MyCar";
import Car from "./CustomComponents/car";
import Mechanic from "./CustomComponents/Mechanic";
import History from "./CustomComponents/History";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
import axios from "axios";
import axiosAuth from "./Utils/axiosAuth";
import { API_URL } from "./Utils/Configuration";
import "./App.css";

const PROTECTED_PAGES = ["MY_CAR", "CAR", "MECHANIC", "HISTORY"];

function NavLink({ onClick, children, danger, active }) {
  return (
    <div
      onClick={onClick}
      className={`nav-link${danger ? " nav-link--danger" : ""}${active ? " nav-link--active" : ""}`}
    >
      {children}
    </div>
  );
}

class App extends Component {
  state = {
    currentPage:    "MY_CAR",
    user:           null,
    sessionChecked: false,
    cars:           [],
    allScheduled:   {},
    serviceLog:     [],
    garageLoaded:   false,
    garageError:    "",
  };

  componentDidMount() {
    this.checkSession();
  }

  checkSession = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users/session`, { withCredentials:true });
      const user = data.logged_in ? data.user : null;
      this.setState({ user, sessionChecked:true, currentPage: "MY_CAR" }, () => {
        if (user) this.loadGarage();
      });
    } catch {
      this.setState({ sessionChecked:true, currentPage: "MY_CAR" });
    }
  };

  loadGarage = () => {
    axiosAuth.get(`${API_URL}/cars`)
      .then(res => {
        const loaded = res.data || [];
        const sched  = {};
        loaded.forEach(c => {
          sched[c.id] = c.scheduled
            ? typeof c.scheduled === "string" ? JSON.parse(c.scheduled) : c.scheduled
            : {};
        });
        this.setState({ cars:loaded, allScheduled:sched, garageLoaded:true, garageError:"" });
      })
      .catch(() => this.setState({ garageError:"Could not load your cars.", garageLoaded:true }));

    axiosAuth.get(`${API_URL}/cars/service-log`)
      .then(res => this.setState({ serviceLog: Array.isArray(res.data) ? res.data : [] }))
      .catch(() => this.setState({ serviceLog: [] }));
  };

  saveScheduled = (carId, scheduled) => {
    axiosAuth.post(`${API_URL}/cars/${carId}/scheduled`, scheduled)
      .catch(() => this.setState({ garageError:"Could not save schedule. Please try again." }));
  };

  handleServiceLogged = (entry) => {
    this.setState(prev => ({ serviceLog: [...prev.serviceLog, entry] }));
  };

  handleAddCar = (saved) => {
    this.setState(prev => ({
      cars:         [...prev.cars, saved],
      allScheduled: { ...prev.allScheduled, [saved.id]:{} },
    }));
  };

  handleDeleteCar = (id) => {
    this.setState(prev => {
      const allScheduled = { ...prev.allScheduled };
      delete allScheduled[id];
      return { cars:prev.cars.filter(c => c.id !== id), allScheduled };
    });
  };

  handleToggle = (carId, svcId, val) => {
    this.setState(prev => {
      const carSchedule = {
        ...prev.allScheduled[carId],
        [svcId]: { ...(prev.allScheduled[carId] || {})[svcId], confirmed:val },
      };
      this.saveScheduled(carId, carSchedule);
      return { allScheduled:{ ...prev.allScheduled, [carId]:carSchedule } };
    });
  };

  handleDate = (carId, svcId, val) => {
    this.setState(prev => {
      const carSchedule = {
        ...prev.allScheduled[carId],
        [svcId]: { ...(prev.allScheduled[carId] || {})[svcId], date:val },
      };
      this.saveScheduled(carId, carSchedule);
      return { allScheduled:{ ...prev.allScheduled, [carId]:carSchedule } };
    });
  };

  handleComplete = (carId, svcId, undo = false) => {
    this.setState(prev => {
      const existing    = (prev.allScheduled[carId] || {})[svcId] || {};
      const today       = new Date().toISOString().slice(0, 10);
      const patch       = undo
        ? { ...existing, completed:false }
        : { ...existing, completed:true, confirmed:true, date:existing.date || today };
      const carSchedule = { ...prev.allScheduled[carId], [svcId]:patch };
      this.saveScheduled(carId, carSchedule);
      return { allScheduled:{ ...prev.allScheduled, [carId]:carSchedule } };
    });
  };

  handleServiceLogRemoved = (logId) => {
    this.setState(prev => ({
      serviceLog: prev.serviceLog.filter(l => l.id !== logId),
    }));
  };

  handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/users/logout`, { withCredentials:true });
    } finally {
      this.setState({
        user:null, currentPage:"MY_CAR",
        cars:[], allScheduled:{}, serviceLog:[], garageLoaded:false, garageError:"",
      });
    }
  };

  setLoggedIn = (user) => {
    this.setState({ user, currentPage:"MY_CAR" }, () => this.loadGarage());
  };

  setPage = (currentPage) => this.setState({ currentPage });

  renderPage() {
    const { currentPage, user, sessionChecked, cars, allScheduled, garageLoaded, garageError } = this.state;

    if (!sessionChecked) {
      return (
        <div className="loading-screen">
          <div className="loading-brand">CARCARE</div>
          <div>Loading...</div>
        </div>
      );
    }

    if (PROTECTED_PAGES.includes(currentPage) && !user) {
      return <LoginView QUserFromChild={this.setLoggedIn}/>;
    }

    if (currentPage === "MY_CAR") {
      return (
        <MyCar
          cars={cars}
          allScheduled={allScheduled}
          serviceLog={this.state.serviceLog}
          garageLoaded={garageLoaded}
          garageError={garageError}
          onAddCar={this.handleAddCar}
          onDeleteCar={this.handleDeleteCar}
          onToggle={this.handleToggle}
          onDate={this.handleDate}
          onComplete={this.handleComplete}
          onClearError={() => this.setState({ garageError:"" })}
          onServiceLogged={this.handleServiceLogged}
          onServiceLogRemoved={this.handleServiceLogRemoved}
          saveScheduled={this.saveScheduled}
        />
      );
    }

    if (currentPage === "HISTORY") {
      return (
        <History
          cars={cars}
          serviceLog={this.state.serviceLog}
          garageLoaded={garageLoaded}
        />
      );
    }

    if (currentPage === "CAR")      return <Car/>;
    if (currentPage === "MECHANIC") return <Mechanic/>;
    if (currentPage === "SIGNUP")   return <SignupView QUserFromChild={this.setLoggedIn}/>;
    if (currentPage === "LOGIN")    return <LoginView  QUserFromChild={this.setLoggedIn}/>;

    return <About/>;
  }

  render() {
    const { user } = this.state;

    return (
      <div id="APP">
        <nav className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              onClick={() => this.setPage("ABOUT")}
              
              className="navbar-brand"
            >
              <img
                src="/icons/cycle1.png"
                alt="CARCARE"
                className="navbar-logo"
              />

              CARCARE
            </div>
            
          </div>
          <div className="navbar-links">
            {user ? (
              <>
                <NavLink onClick={() => this.setPage("MY_CAR")}active={this.state.currentPage === "MY_CAR"}>My Car</NavLink>
                <NavLink onClick={() => this.setPage("CAR")}active={this.state.currentPage === "CAR"}>Car</NavLink>
                <NavLink onClick={() => this.setPage("MECHANIC")}active={this.state.currentPage === "MECHANIC"}>Mechanic</NavLink>
                <NavLink onClick={() => this.setPage("HISTORY")}active={this.state.currentPage === "HISTORY"}>History</NavLink>
                <NavLink onClick={this.handleLogout} danger>Log out</NavLink>
              </>
            ) : (
              <>
                <NavLink onClick={() => this.setPage("SIGNUP")}active={this.state.currentPage === "SIGNUP"}>Sign up</NavLink>
                <NavLink onClick={() => this.setPage("LOGIN")}active={this.state.currentPage === "LOGIN"}>Log in</NavLink>
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