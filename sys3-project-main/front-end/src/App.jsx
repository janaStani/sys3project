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

function NavLink({ onClick, children, danger }) {
  return (
    <a onClick={onClick} href="#" className={`nav-link${danger ? " nav-link--danger" : ""}`}>
      {children}
    </a>
  );
}

class App extends Component {
  state = {
    currentPage:    "ABOUT",
    user:           null,
    sessionChecked: false,
    cars:           [],
    allScheduled:   {},
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
      this.setState({ user, sessionChecked:true }, () => {
        if (user) this.loadGarage();
      });
    } catch {
      this.setState({ sessionChecked:true });
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
  };

  saveScheduled = (carId, scheduled) => {
    axiosAuth.post(`${API_URL}/cars/${carId}/scheduled`, scheduled)
      .catch(() => this.setState({ garageError:"Could not save schedule. Please try again." }));
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

  handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/users/logout`, { withCredentials:true });
    } finally {
      this.setState({
        user:null, currentPage:"ABOUT",
        cars:[], allScheduled:{}, garageLoaded:false, garageError:"",
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
          garageLoaded={garageLoaded}
          garageError={garageError}
          onAddCar={this.handleAddCar}
          onDeleteCar={this.handleDeleteCar}
          onToggle={this.handleToggle}
          onDate={this.handleDate}
          onComplete={this.handleComplete}
          onClearError={() => this.setState({ garageError:"" })}
          saveScheduled={this.saveScheduled}
        />
      );
    }

    if (currentPage === "HISTORY") {
      return (
        <History
          cars={cars}
          allScheduled={allScheduled}
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
    const { user, allScheduled } = this.state;

    const totalCompleted = Object.values(allScheduled).reduce(
      (sum, car) => sum + Object.values(car).filter(s => s.completed).length, 0
    );

    return (
      <div id="APP">
        <nav className="navbar">
          <a onClick={() => this.setPage("ABOUT")} href="#" className="navbar-brand">CARCARE</a>
          <div className="navbar-links">
            {user ? (
              <>
                <NavLink onClick={() => this.setPage("MY_CAR")}>My Car</NavLink>
                <NavLink onClick={() => this.setPage("CAR")}>Car</NavLink>
                <NavLink onClick={() => this.setPage("MECHANIC")}>Mechanic</NavLink>
                <span style={{ position:"relative", display:"inline-flex", alignItems:"center" }}>
                  <NavLink onClick={() => this.setPage("HISTORY")}>History</NavLink>
                  {totalCompleted > 0 && (
                    <span style={{ position:"absolute", top:-6, right:-10, background:"#639922", color:"#fff", fontSize:9, fontWeight:700, borderRadius:"50%", width:15, height:15, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                      {totalCompleted > 9 ? "9+" : totalCompleted}
                    </span>
                  )}
                </span>
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