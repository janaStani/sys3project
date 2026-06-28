import { Component } from "react";         // base class App uses to be a react class component

// all page components
import About from "./CustomComponents/about";
import MyCar from "./CustomComponents/MyCar";
import Car from "./CustomComponents/car";
import Mechanic from "./CustomComponents/Mechanic";
import History from "./CustomComponents/History";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
// public calls, HTTP requests, comm between back and front end, react sends/gets data from the express server
import axios from "axios";                         
import axiosAuth from "./Utils/axiosAuth";         // auth calls, returns user specific data
import { API_URL } from "./Utils/Configuration";  // backend's address, so it can use it in all axios calls, so it knows where to send requests
import "./App.css";

const PROTECTED_PAGES = ["MY_CAR", "CAR", "MECHANIC", "HISTORY"];  // pages only when user is logged in

// same template filled in diff for individual items on navbar
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
    user:           null,       // wether user is logged in
    sessionChecked: false,      // finish checking login status
    cars:           [],
    allScheduled:   {},
    serviceLog:     [],         // completed service
    garageLoaded:   false,      
    garageError:    "",
  };

  componentDidMount() {
    this.checkSession();        // is user already logged in? call checkSession
  }

  checkSession = async () => {     // pause until server responds
    try {
      const { data } = await axios.get(`${API_URL}/users/session`, { withCredentials:true });
      const user = data.logged_in ? data.user : null;
      this.setState({ user, sessionChecked:true, currentPage: "MY_CAR" }, () => {
        if (user) this.loadGarage();
      });
    } catch {
      this.setState({ sessionChecked:true, currentPage: "MY_CAR" }); // if the request fails, show My Car, just without a user
    }
  };

  // fetch logged in user data from backend
  loadGarage = () => {
    axiosAuth.get(`${API_URL}/cars`)     // load cars
      .then(res => {
        const loaded = res.data || [];
        const sched  = {};                  // maps each cars id to its scheduled services data
        loaded.forEach(c => {              // for every car c
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

  refreshCars = () => {
  console.log("Refreshing cars from server...");
  axiosAuth.get(`${API_URL}/cars`)
    .then(res => {
      const loaded = res.data || [];
      const sched = {};
      loaded.forEach(c => {
        sched[c.id] = c.scheduled
          ? typeof c.scheduled === "string" ? JSON.parse(c.scheduled) : c.scheduled
          : {};
      });
      this.setState({ cars: loaded, allScheduled: sched });
      console.log("Cars refreshed:", loaded);
    })
    .catch(err => console.error("Failed to refresh cars:", err));
};

  handleEditCar = (updatedCar) => {
    console.log("handleEditCar called with:", updatedCar);
    this.setState(prevState => ({
      cars: prevState.cars.map(car => 
        car.id === updatedCar.id ? { ...updatedCar } : car
      )
    }), () => {
      
      this.refreshCars();
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

  handleScheduleNext = (carId, svcId) => {
    // Reset this service's scheduled state so the card returns to fresh/unscheduled.
    // The completed service is already in the service log (history), so it stays there.
    // generateSchedule then recalculates the next due date from the latest log entry.
    this.setState(prev => {
      const carSched = { ...(prev.allScheduled[carId] || {}) };
      delete carSched[svcId];                          // remove completed/confirmed/date flags
      this.saveScheduled(carId, carSched);             // persist the cleared entry to backend
      return { allScheduled: { ...prev.allScheduled, [carId]: carSched } };
    });
  };

  handleServiceLogRemoved = (logId) => {
    this.setState(prev => ({
      serviceLog: prev.serviceLog.filter(l => (l.logId ?? l.id) !== logId),
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


  handleDeleteHistory = async (logId) => {
    
    console.log("delete logId:", logId, typeof logId);
    console.log("serviceLog ids:", this.state.serviceLog.map(l => [l.logId, typeof l.logId]));
    
    const entry = this.state.serviceLog.find(l => Number(l.logId ?? l.id) === Number(logId));
    console.log("matched entry:", entry);
    if (!entry) return;

    try {
      await axiosAuth.delete(`${API_URL}/cars/${entry.carId}/service-log/${logId}`, { withCredentials: true });
    } catch (err) {
      console.error("Failed to delete history record:", err);
      return; // don't update UI if the server delete failed
    }

    // Compute the cleared schedule outside of setState
    const carSched = { ...(this.state.allScheduled[entry.carId] || {}) };
    let schedChanged = false;
    if (carSched[entry.serviceId]) {
      delete carSched[entry.serviceId];
      schedChanged = true;
    }

    // Pure state update — no side effects inside
    this.setState(prev => ({
      serviceLog: prev.serviceLog.filter(l => Number(l.logId ?? l.id) !== Number(logId)),
      allScheduled: { ...prev.allScheduled, [entry.carId]: carSched },
    }));

    // Side effect AFTER, outside the updater
    if (schedChanged) {
      this.saveScheduled(entry.carId, carSched);
    }
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
          onEditCar={this.handleEditCar}
          onRefreshCars={this.refreshCars} 
          onDeleteCar={this.handleDeleteCar}
          onToggle={this.handleToggle}
          onDate={this.handleDate}
          onComplete={this.handleComplete}
          onClearError={() => this.setState({ garageError:"" })}
          onServiceLogged={this.handleServiceLogged}
          onServiceLogRemoved={this.handleServiceLogRemoved}
          onScheduleNext={this.handleScheduleNext}
          saveScheduled={this.saveScheduled}
          onNavigate={(page, provider) => {
            this.setState({ selectedProvider: provider, currentPage: page });
          }}
          user={user}
        />
      );
    }

    if (currentPage === "HISTORY") {
      return (
        <History
          cars={cars}
          serviceLog={this.state.serviceLog}
          garageLoaded={garageLoaded}
          onDelete={this.handleDeleteHistory}
        />
      );
    }

    if (currentPage === "CAR")      return <Car/>;
    if (currentPage === "MECHANIC") return <Mechanic user={this.state.user} selectedProvider={this.state.selectedProvider}/>;
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
                <NavLink onClick={() => this.setPage("HISTORY")}active={this.state.currentPage === "HISTORY"}>History</NavLink>
                <NavLink onClick={() => this.setPage("MECHANIC")}active={this.state.currentPage === "MECHANIC"}>Mechanic</NavLink>
                <NavLink onClick={() => this.setPage("CAR")}active={this.state.currentPage === "CAR"}>Cars</NavLink>
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