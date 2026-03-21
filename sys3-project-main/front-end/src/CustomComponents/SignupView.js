import React from "react";
import axios from "axios";
import { API_URL } from "../Utils/Configuration";

// SignupView component handles user registration.
class SignupView extends React.Component {
  constructor(props) {
    super(props);
    // Initialize component state with user input fields and status messages.
    this.state = {
      user_input: {
        username: "",
        email: "",
        password: "",
        name: "",
        surname: ""
      },
      status: {
        success: null, // Success status of the signup operation
        msg: "" // Message related to the signup operation
      }
    };
  }

  // Updates state with user input from form fields
  QGetTextFromField = (e) => {
    this.setState({
      user_input: {
        ...this.state.user_input,
        [e.target.name]: e.target.value
      }
    });
  }

  // Handles form submission for user registration
  QPostSignup = async () => {
    const { username, email, password, name, surname } = this.state.user_input;

    // Validate that all fields are filled
    if (!username || !email || !password || !name || !surname) {
      this.setState({
        status: {
          success: false,
          msg: "Please fill in all fields."
        }
      });
      return;
    }

    try {
      // Send POST request to register a new user
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        email,
        password,
        name,
        surname
      });

      // Check if the registration was successful
      if (response.status === 200) {
        this.setState({
          status: {
            success: true,
            msg: "User registered successfully."
          },
          user_input: { // Clear the form fields after successful registration
            username: "",
            email: "",
            password: "",
            name: "",
            surname: ""
          }
        });

        // Optionally store user data for auto-login
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        localStorage.setItem('remember_me', JSON.stringify(true)); // Store "remember me" status

        // Call parent component method if provided
        if (this.props.QUserFromChild) {
          this.props.QUserFromChild(response.data.user);
        }
      } else {
        this.setState({
          status: {
            success: false,
            msg: "Failed to register user."
          }
        });
      }
    } catch (err) {
      console.error(err);
      this.setState({
        status: {
          success: false,
          msg: "An error occurred. Please try again later."
        }
      });
    }
  }

  render() {
    const { user_input, status } = this.state;

    return (
      <div className="card" style={{ width: "400px", margin: "10px auto", padding: "20px" }}>
        {/* Registration form */}
        <form>
          {/* Name input */}
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              name="name"
              onChange={this.QGetTextFromField}
              value={user_input.name}
              type="text"
              className="form-control"
            />
          </div>

          {/* Surname input */}
          <div className="mb-3">
            <label className="form-label">Surname</label>
            <input
              name="surname"
              onChange={this.QGetTextFromField}
              value={user_input.surname}
              type="text"
              className="form-control"
            />
          </div>

          {/* Username input */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              name="username"
              onChange={this.QGetTextFromField}
              value={user_input.username}
              type="text"
              className="form-control"
            />
          </div>

          {/* Email input */}
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              name="email"
              onChange={this.QGetTextFromField}
              value={user_input.email}
              type="email"
              className="form-control"
            />
            <div className="form-text">
              Your email will never be shared with anyone else.
            </div>
          </div>

          {/* Password input */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              onChange={this.QGetTextFromField}
              value={user_input.password}
              type="password"
              className="form-control"
            />
            <div className="form-text">
              Your password should have at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.
            </div>
          </div>
        </form>

        {/* Sign up button */}
        <button
          style={{ marginTop: "10px", backgroundColor: '#003f5c', borderColor: '#003f5c' }}
          onClick={this.QPostSignup}
          className="btn btn-primary"
        >
          Sign Up
        </button>

        <div className="form-text" style={{ marginTop: "10px" }}>
          When you sign up, please log in to proceed with the web application.
        </div>

        {/* Display status messages */}
        {status.success === true && status.msg && (
          <p className="alert alert-success" role="alert">
            {status.msg}
          </p>
        )}

        {status.success === false && status.msg && (
          <p className="alert alert-danger" role="alert">
            {status.msg}
          </p>
        )}
      </div>
    );
  }
}

export default SignupView;