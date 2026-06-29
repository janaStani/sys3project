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

  // fetch logged in user data from backend, cars and history
  loadGarage = () => {
    axiosAuth.get(`${API_URL}/cars`)     // load logged in user's cars
      .then(res => {                      //  runs when the server responds successfully
        const loaded = res.data || [];     //  array of cars or empty array ir res is empty
        const sched  = {};                  // maps each cars id to its scheduled services data
        loaded.forEach(c => {              // for every car c { 1: {...}, 2: {...} }
          sched[c.id] = c.scheduled         // if car has data process it
            ? typeof c.scheduled === "string" ? JSON.parse(c.scheduled) : c.scheduled   // convert string to object
            : {};                       // othervise store empty 
        });
        this.setState({ cars:loaded, allScheduled:sched, garageLoaded:true, garageError:"" });  // saves everything into state
      })
      .catch(() => this.setState({ garageError:"Could not load your cars.", garageLoaded:true }));
      // handles failure

    // fetch users service history 
      axiosAuth.get(`${API_URL}/cars/service-log`)   // asks backend for users service-log entries
      .then(res => this.setState({ serviceLog: Array.isArray(res.data) ? res.data : [] }))
      .catch(() => this.setState({ serviceLog: [] }));
  };

  saveScheduled = (carId, scheduled) => {   // takes cars id and schedule object, save in backend db (POST) 
    axiosAuth.post(`${API_URL}/cars/${carId}/scheduled`, scheduled)
      .catch(() => this.setState({ garageError:"Could not save schedule. Please try again." }));
  };

  handleServiceLogged = (entry) => {   // runs when a service is completed
    this.setState(prev => ({ serviceLog: [...prev.serviceLog, entry] }));
  };

  handleAddCar = (saved) => {
    this.setState(prev => ({
      cars:         [...prev.cars, saved],   // copy existing cars, add new one at end. New array, react re-renders, new car appears in garage
      allScheduled: { ...prev.allScheduled, [saved.id]:{} },  // new entry for new cars id, with empty schedule
    }));
  };

  // when user clicks "Remove car," this gets called with that car's id
  // car has two pieces of associated data in state: entry in cars array, and schedule in allScheduled object (keyed by id) 
  // to fully delete car, we remove both because if we dont we'll have schedule entry for a car that no longer exists
  handleDeleteCar = (id) => {
    this.setState(prev => {
      const allScheduled = { ...prev.allScheduled };     // copy current scheduled objects
      delete allScheduled[id];                           // remove 
      return { cars:prev.cars.filter(c => c.id !== id), allScheduled }; // create a new array containing every car whose id its not the one we want to remove
    });
  };

  //update cars info after user edits it, takes the edited car from backend
  handleEditCar = (updatedCar) => {
    this.setState(prevState => ({     // updates the cars array 
      cars: prevState.cars.map(car =>     // go through cars to find a match
        car.id === updatedCar.id ? { ...updatedCar } : car  // if cars id matches the edited cars id, then replace it with a copy of the new version
      )
    }));
  };

  // takes which car, which service and new confirmed value true/false scheduled
  handleToggle = (carId, svcId, val) => {
    this.setState(prev => {      // create new version of the schedule for the car
      const carSchedule = {
        ...prev.allScheduled[carId],         // copy all existing services
        [svcId]: { ...(prev.allScheduled[carId] || {})[svcId], confirmed:val },   // get cars schedule or {} if car has non yet, override one service with new value
      };
      this.saveScheduled(carId, carSchedule);      // save to backend
      return { allScheduled:{ ...prev.allScheduled, [carId]:carSchedule } };  // copy all the other cars schedules and replace this cars with the updated one
    });
  };

  // car, which service and new date value
  handleDate = (carId, svcId, val) => {
    this.setState(prev => {
      const carSchedule = {
        ...prev.allScheduled[carId],    // copy all existing services
        [svcId]: { ...(prev.allScheduled[carId] || {})[svcId], date:val },  // get cars schedule or {} if car has non yet, override one service with new date
      };
      this.saveScheduled(carId, carSchedule);
      return { allScheduled:{ ...prev.allScheduled, [carId]:carSchedule } };
    });
  };


  // mark service as completed (undo), takes car service and whether to undo it
  handleComplete = (carId, svcId, undo = false) => {
    this.setState(prev => {
      const existing    = (prev.allScheduled[carId] || {})[svcId] || {};   // get car's schedule, then this service
      const today       = new Date().toISOString().slice(0, 10);            // take todays date
      const patch       = undo
        ? { ...existing, completed:false }                      // keep all service's existing data, but set completed to false
        : { ...existing, completed:true, confirmed:true, date:existing.date || today };  // else keep existing data and set completed and scheduled to true, use users data
      const carSchedule = { ...prev.allScheduled[carId], [svcId]:patch };    // copy services, replace the one thats changed
      this.saveScheduled(carId, carSchedule);                                  // save to backend
      return { allScheduled:{ ...prev.allScheduled, [carId]:carSchedule } };  // return the updated schedule othrs are unchanged
    });
  };

  // reset service back to its unscheduled state, after its completed, so we can schedule it for the next time is due
  // takes car and which service to reset
  handleScheduleNext = (carId, svcId) => {
    // The completed service is already in the service log (history)
    // generateSchedule then recalculates the next due date from the latest log entry
    this.setState(prev => {
      const carSched = { ...(prev.allScheduled[carId] || {}) };    // copy cars schedule
      delete carSched[svcId];                          // remove completed/confirmed/date flags
      this.saveScheduled(carId, carSched);             // persist the cleared entry to backend
      return { allScheduled: { ...prev.allScheduled, [carId]: carSched } };   // copy cars leave unchanged just replace this cars schedule with the cleared version
    }); 
  };

  // removes history entry, takes id of service log
  handleServiceLogRemoved = (logId) => {
    this.setState(prev => ({               // filers it out of the service log array
      serviceLog: prev.serviceLog.filter(l => (l.logId ?? l.id) !== logId),
    })); // makes a new array keeping only entries that don't match
  };

  // logs the user out
  handleLogout = async () => {
    try {                        // tells backend to end session, sends the cookie so the server knows which session to end
      await axios.get(`${API_URL}/users/logout`, { withCredentials:true });
    } finally {
      this.setState({    // makes sure frontend wipes clean even if backend logout server call fails 
        user:null, currentPage:"MY_CAR",
        cars:[], allScheduled:{}, serviceLog:[], garageLoaded:false, garageError:"",
      });
    }
  };

  // runs when user successfully loggs in or signs up
  setLoggedIn = (user) => {    // sets user and page to mycar, the loads users cars and history
    this.setState({ user, currentPage:"MY_CAR" }, () => this.loadGarage());
  };


  handleDeleteHistory = async (logId) => {
    // find the log etry matching logId, handles both fresh completed entries id and reloaded logId
    const entry = this.state.serviceLog.find(l => Number(l.logId ?? l.id) === Number(logId)); // make sure id is a number
    if (!entry) return;   // no match found nothing to delete

    try {    // delete from backend
      // e.g http://localhost:30100/cars/5/service-log/12 identifies exavtly which record to delete
      await axiosAuth.delete(`${API_URL}/cars/${entry.carId}/service-log/${logId}`, { withCredentials: true });
    } catch (err) {
      console.error("Failed to delete history record:", err);
      return; // don't update UI if the server delete failed
    }

    // also clear services scheduled flags
    const carSched = { ...(this.state.allScheduled[entry.carId] || {}) };   // copy cars schedule
    let schedChanged = false;
    if (carSched[entry.serviceId]) {
      delete carSched[entry.serviceId];    // if service has an entry delete it from the copy and set the changed flag
      schedChanged = true;
    }

    // replace cars schedule with the cleared version
    this.setState(prev => ({
      serviceLog: prev.serviceLog.filter(l => Number(l.logId ?? l.id) !== Number(logId)), // creates new array keeps all entries that are not deleted
      allScheduled: { ...prev.allScheduled, [entry.carId]: carSched },
    }));

    // after the update if the schedule chaged save to backend
    if (schedChanged) {
      this.saveScheduled(entry.carId, carSched);
    }
  };

  setPage = (currentPage) => this.setState({ currentPage });  // updates currentPage to the new value

  // decides which page component to show based on the current state and returns it
  renderPage() {
    // so we dont use this.state.something
    const { currentPage, user, sessionChecked, cars, allScheduled, garageLoaded, garageError } = this.state;

    // if app still hasnt finished checking if user is logged in
    if (!sessionChecked) {
      return (
        <div className="loading-screen">
          <div className="loading-brand">CARCARE</div>
          <div>Loading...</div>
        </div>
      );
    }

    // stop someone not logged in trying to view a protected page
    if (PROTECTED_PAGES.includes(currentPage) && !user) {
      return <LoginView QUserFromChild={this.setLoggedIn}/>;  // when user logs in, store user and render again, the !user is false, and they are allowed 
    }

    // check current page  name and return that page's component
    if (currentPage === "MY_CAR") {
      return (
        <MyCar   // props 
        // data props give my car infor it needs to show on screen (data flows down to mycar)
        // handler props functions gives component ways to talk back to App (actions flow up)
          cars={cars}                                    // list of cars
          allScheduled={allScheduled}                    // the schedules
          serviceLog={this.state.serviceLog}             // the history
          garageLoaded={garageLoaded}                    // is it loaded yet?
          garageError={garageError}                      // any error message
        // user adds car inside MyCar, MyCar calls onAddCar(newCar) which is actually App's handleAddCar, App updates its state
          onAddCar={this.handleAddCar}            // call this to add a car
          onEdit={this.handleEditCar}             // call this to edit a car
          onDeleteCar={this.handleDeleteCar}      // call this to delete a car
          onToggle={this.handleToggle}            // call this to toggle a service
          onDate={this.handleDate}                // call this to set a date
          onComplete={this.handleComplete}        // call this to complete a service
          onClearError={() => this.setState({ garageError:"" })}
          onServiceLogged={this.handleServiceLogged}
          onServiceLogRemoved={this.handleServiceLogRemoved}
          onScheduleNext={this.handleScheduleNext}
          saveScheduled={this.saveScheduled}
          user={user}           // who logged in
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
    if (currentPage === "MECHANIC") return <Mechanic user={this.state.user}/>;
    if (currentPage === "SIGNUP")   return <SignupView QUserFromChild={this.setLoggedIn}/>;
    if (currentPage === "LOGIN")    return <LoginView  QUserFromChild={this.setLoggedIn}/>;

    return <About/>; // fallback, if current page doesnt match any of the above
  }
  
  // method to actually draw components on screen
  render() {
    const { user } = this.state;

    return (
      <div id="APP">
        <nav className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div onClick={() => this.setPage("ABOUT")} className="navbar-brand">
            <img src="/icons/cycle1.png" alt="CARCARE" className="navbar-logo"/>CARCARE</div>
          </div>
          <div className="navbar-links">   {/*logged in links*/}
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
            )}  {/*loggd out links*/}
          </div>
        </nav>
        <div id="viewer">{this.renderPage()}</div>    {/*curent page renders in viewer, beneath the navbar*/}
      </div>
    );
  }
}

export default App;