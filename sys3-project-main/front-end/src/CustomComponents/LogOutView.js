import React, { useEffect } from 'react';
import axios from 'axios';
import { API_URL } from "../Utils/Configuration";

// The LogOutView component handles user logout functionality.
const LogOutView = ({ onLogoutSuccess }) => {
  useEffect(() => {
    // Define an asynchronous function to handle the logout process.
    const logOut = async () => {
      try {
        // Send a POST request to the server to perform the logout action.
        const response = await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });

        // Check if the response indicates a successful logout.
        if (response.data.status && response.data.status.success) {
          // Call the onLogoutSuccess callback function if logout was successful.
          onLogoutSuccess();
        } else {
          // Log the response data to the console if logout was unsuccessful.
          console.error("Logout failed:", response.data);
          // Call the onLogoutSuccess callback function even if logout failed.
          onLogoutSuccess();
        }
      } catch (error) {
        // Log any errors that occur during the logout process.
        console.error("Error logging out:", error);
        // Call the onLogoutSuccess callback function if there was an error.
        onLogoutSuccess();
      }
    };

    // Invoke the logOut function to initiate the logout process when the component mounts.
    logOut();
  }, [onLogoutSuccess]); // Dependency array: effect will run when onLogoutSuccess changes.

  // This component does not render any UI elements.
  // It only performs the logout logic and redirects based on the result.
  return null;
};

export default LogOutView;