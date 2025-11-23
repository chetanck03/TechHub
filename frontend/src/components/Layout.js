import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, CreditCard, Calendar, Users, Settings, Stethoscope } from 'lucide-react';
import MedBot from './MedBot';

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
        { path: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
        { path: '/doctors', icon: <Users className="w-5 h-5" />, label: 'Doctors' },
        { path: '/consultations', icon: <Calendar className="w-5 h-5" />, label: 'Appointments' },
        { path: '/credits', icon: <CreditCard className="w-5 h-5" />, label: 'Wallet' },
        { path: '/complaints', icon: <Settings className="w-5 h-5" />, label: 'Complaints' },
        { path: '/profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
      ];
    } else if (user?.role === 'doctor') {
      return [
        { path: '/', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/consultations', icon: <Calendar className="w-5 h-5" />, label: 'Consultations' },
        { path: '/doctor/slots', icon: <Calendar className="w-5 h-5" />, label: 'Manage Slots' },
        { path: '/doctor/profile', icon: <User className="w-5 h-5" />, label: 'My Profile' },
        { path: '/credits', icon: <CreditCard className="w-5 h-5" />, label: 'Credits' },
        { path: '/complaints', icon: <Settings className="w-5 h-5" />, label: 'Complaints' },
      ];
    } else if (user?.role === 'admin') {
      return [
        { path: '/', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/admin/doctors', icon: <Users className="w-5 h-5" />, label: 'Doctors' },
        { path: '/admin/patients', icon: <Users className="w-5 h-5" />, label: 'Patients' },
        { path: '/admin/approvals', icon: <Settings className="w-5 h-5" />, label: 'Approvals' },
        { path: '/admin/appointments', icon: <Calendar className="w-5 h-5" />, label: 'Appointments' },
        { path: '/admin/transactions', icon: <CreditCard className="w-5 h-5" />, label: 'Transactions' },
        { path: '/admin/complaints', icon: <Settings className="w-5 h-5" />, label: 'Complaints' },
        { path: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
      ];
    }
    return [];
  };

  return (
    <div className="h-screen bg-secondary-50 flex flex-col overflow-hidden">
      <nav className="bg-white shadow-soft border-b border-secondary-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-primary-500" />
              <h2 className="text-xl font-bold text-primary-600">Telehealth</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-secondary-700 font-medium">{user?.name}</span>
              <button 
                onClick={handleLogout} 
                className="btn btn-danger btn-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-soft flex-shrink-0 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
          <div className="py-6">
            {getNavItems().map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className="flex items-center gap-4 px-6 py-3 text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 hover:border-r-4 hover:border-primary-500 transition-all duration-200"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
            {children}
          </div>
        </main>
      </div>

      {/* MedBot - AI Assistant */}
      <MedBot />
    </div>
  );
};

export default Layout;
