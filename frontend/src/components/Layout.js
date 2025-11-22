import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUser, FiLogOut, FiCreditCard, FiCalendar, FiUsers, FiSettings } from 'react-icons/fi';
import MedBot from './MedBot';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (user?.role === 'patient') {
      return [
        { path: '/', icon: <FiHome />, label: 'Home' },
        { path: '/doctors', icon: <FiUsers />, label: 'Doctors' },
        { path: '/consultations', icon: <FiCalendar />, label: 'Appointments' },
        { path: '/credits', icon: <FiCreditCard />, label: 'Wallet' },
        { path: '/complaints', icon: <FiSettings />, label: 'Complaints' },
        { path: '/profile', icon: <FiUser />, label: 'Profile' },
      ];
    } else if (user?.role === 'doctor') {
      return [
        { path: '/', icon: <FiHome />, label: 'Dashboard' },
        { path: '/consultations', icon: <FiCalendar />, label: 'Consultations' },
        { path: '/doctor/slots', icon: <FiCalendar />, label: 'Manage Slots' },
        { path: '/doctor/profile', icon: <FiUser />, label: 'My Profile' },
        { path: '/credits', icon: <FiCreditCard />, label: 'Credits' },
        { path: '/complaints', icon: <FiSettings />, label: 'Complaints' },
      ];
    } else if (user?.role === 'admin') {
      return [
        { path: '/', icon: <FiHome />, label: 'Dashboard' },
        { path: '/admin/doctors', icon: <FiUsers />, label: 'Doctors' },
        { path: '/admin/patients', icon: <FiUsers />, label: 'Patients' },
        { path: '/admin/approvals', icon: <FiSettings />, label: 'Approvals' },
        { path: '/admin/appointments', icon: <FiCalendar />, label: 'Appointments' },
        { path: '/admin/transactions', icon: <FiCreditCard />, label: 'Transactions' },
        { path: '/admin/complaints', icon: <FiSettings />, label: 'Complaints' },
        { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
      ];
    }
    return [];
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>🏥 Telehealth</h2>
        </div>
        <div className="navbar-user">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            <FiLogOut /> Logout
          </button>
        </div>
      </nav>

      <div className="layout-container">
        <aside className="sidebar">
          {getNavItems().map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="sidebar-item"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>

      {/* MedBot - AI Assistant */}
      <MedBot />
    </div>
  );
};

export default Layout;
