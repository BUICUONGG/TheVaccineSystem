import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

const Welcome = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  
  // Get user role and access token from localStorage
  const userRole = localStorage.getItem("role");
  const accessToken = localStorage.getItem("accesstoken");

  useEffect(() => {
    // Check if there's a valid token
    if (!accessToken) {
      // If no token, clear any remaining localStorage and redirect to login
      localStorage.clear();
      navigate("/login");
      return;
    }

    // Start fade out after 1 second
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1000);

    // Navigate after fade out (1.5 seconds total)
    const navigationTimer = setTimeout(() => {
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "staff") {
        navigate("/staffLayout");
      } else {
        navigate("/homepage");
      }
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate, userRole, accessToken]);

  return (
    <div className={`welcome-container ${fadeOut ? "fade-out" : "fade-in"}`}>
      <div className="welcome-content">
        <div className="header-container">
          <img src="/images/LogoHeader.png" alt="Logo" className="welcome-logo" />
          <h1>Chào mừng đến Diary Vaccine!</h1>
        </div>
        <p>Xin đợi một chút...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
