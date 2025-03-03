import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Thank.css';

const Thank = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
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
        <h1>Thank You!</h1>
        <p>Have a great day!</p>
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
