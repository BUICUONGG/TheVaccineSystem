import { useState } from 'react';
import { Link } from 'react-router-dom';
import './adminPage.css';

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="container">
      <div className="sidebar">
        <div className="admin-info">
          <div className="admin-icon">👤</div>
          <span className="admin-name">adminName</span>
        </div>
        
        <ul className="menu-items">
          <li className="menu-item">
            <Link to="/admin/overview">Overview</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/customers">Customers</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/staffs">Staffs</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/vaccines">Vaccines</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/feedback">Feedback</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/appointments">Appointments</Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/consultations">Consultations</Link>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <header className="header">
          <nav className="navigation">
            <span className="nav-item">Home</span>
            <span className="nav-item">Contact</span>
          </nav>
          <input
            type="text"
            className="search-bar"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </header>
        <main className="content">
          {/* Main content will go here */}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
