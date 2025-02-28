import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // Navigate after fade out (3 seconds total)
    const navigationTimer = setTimeout(() => {
      if (userRole == 'admin') {
        navigate('/admin');
      } else {
       navigate('/homepage');
      }
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate, userRole]);

  return (
    <div className={`welcome-container ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="welcome-content">
        <h1>Chào mừng đến Diary Vaccine{username ? `, ${username}` : ''}!</h1>
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
