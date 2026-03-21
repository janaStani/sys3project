import React, { Component } from "react";
import About from "./CustomComponents/about";
import Car from "./CustomComponents/car";
import Schedule from "./CustomComponents/schedule"; 
import Rating from "./CustomComponents/Rating";
import ServiceProvider from "./CustomComponents/serviceProvider";
import Expense from "./CustomComponents/expense";
import Task from "./CustomComponents/task";
import Notification from "./CustomComponents/notification";
import SignupView from "./CustomComponents/SignupView";
import LoginView from "./CustomComponents/LoginView";
import LogOutView from "./CustomComponents/LogOutView";
import axios from "axios";
import { API_URL } from "./Utils/Configuration";

class App extends Component {
  constructor(props) {
    super(props);
    // Initialize component state with default page and user state
    this.state = {
      CurrentPage: 'LOGIN', // Default page to show initially
      user: null // Track user login state
    };
  }

  // Check if the user session is still valid
  checkSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/session`, { withCredentials: true });
      if (response.data.logged_in) {
        this.setState({ user: response.data.user });
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  // Handle user logout
  handleLogout = () => {
    this.setState({ CurrentPage: 'LOGOUT' }); // Switch to logout page
  };

  // Handle successful logout and redirect to about page
  handleLogoutSuccess = () => {
    this.setState({ user: null, CurrentPage: 'ABOUT' });
  };

  // Set the logged-in user and redirect to the about page
  QSetLoggedIn = (user) => {
    this.setState({ user }, () => {
      this.setState({ CurrentPage: 'ABOUT' });
    });
  };

  // Update the current view based on the selected page
  QSetView = (obj) => {
    this.setState({
      CurrentPage: obj.page
    });
  };

  // Determine which component to render based on the current page
  QGetView() {
    const { CurrentPage } = this.state;
    switch (CurrentPage) {
      case 'CAR':
        return <Car />;
      case 'SCHEDULE':
        return <Rating />; // Ensure this reflects the correct component
      case 'SIGNUP':
        return <SignupView QUserFromChild={this.QSetLoggedIn} />;
      case 'LOGIN':
        return <LoginView QUserFromChild={this.QSetLoggedIn} />;
      case 'LOGOUT':
        return <LogOutView onLogoutSuccess={this.handleLogoutSuccess} />;
      default:
        return <About />;
      case 'SCHEDULE':
        return <Schedule />;
      case 'SERVICEPROVIDER':
        return <ServiceProvider />;
      case 'EXPENSE':
        return <Expense />;
      case 'TASK':
        return <Task />;
      case 'NOTIFICATION':
        return <Notification />;
    }
  }

  render() {
    const { user } = this.state;
    return (
      <div
        id="APP"
        className="container"
        style={{
        //  backgroundImage: `url(${require('./assets/images/st3.avif')})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '100vh'
        }}
      >
        {/* Navigation bar */}
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#003f5c' }}>
          <div className="container-fluid">
            <a onClick={() => this.QSetView({ page: 'ABOUT' })} className="navbar-brand" href="#">
              About
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {user ? (
                  <>
                    {/* Navigation links for logged-in users */}
                    <li className="nav-item">
                      <a onClick={() => this.QSetView({ page: 'CAR' })} className="nav-link" href="#">
                        Car
                      </a>
                    </li>
                    <li className="nav-item">
                      <a onClick={() => this.QSetView({ page: 'SCHEDULE' })} className="nav-link" href="#">
                        Rating
                      </a>
                    </li>
                    <li className="nav-item">
                      <a onClick={this.handleLogoutSuccess} className="nav-link" href="#">
                        Log out
                      </a>
                    </li>
                  </>
                ) : (
                  <>
                    {/* Navigation links for unauthenticated users */}
                    <li className="nav-item">
                      <a onClick={() => this.QSetView({ page: 'SIGNUP' })} className="nav-link" href="#">
                        Sign up
                      </a>
                    </li>
                    <li className="nav-item">
                      <a onClick={() => this.QSetView({ page: 'LOGIN' })} className="nav-link" href="#">
                        Log in
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
        {/* Main content area */}
        <div id="viewer" className="row container">
          {this.QGetView()} {/* Render the appropriate component based on state */}
        </div>
      </div>
    );
  }
}

export default App;