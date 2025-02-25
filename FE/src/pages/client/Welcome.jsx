import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/homepage');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome Back{username ? `, ${username}` : ''}!</h1>
        <p>We're glad to see you again</p>
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