import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Thank.css';

const Thank = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Ensure localStorage is completely cleared
    localStorage.clear();
    
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Navigate after fade out (3 seconds total)
    const navigationTimer = setTimeout(() => {
      navigate('/homepage');
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);

  return (
    <div className={`thanks-container ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="thanks-content">
        <div className="header-container">
          <img src="/images/LogoHeader.png" alt="Logo" className="welcome-logo" />
          <h1>Cảm ơn đã sử dụng dịch vụ!</h1>
        </div>
        <p>Một ngày tốt lành!</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Thank;
