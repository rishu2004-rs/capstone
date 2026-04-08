import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gavel, LayoutDashboard, User, LogOut, Search, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-[#202124] sticky top-0 z-50 border-b border-[#dadce0] dark:border-[#5f6368] px-6 py-3 transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="text-[#1a73e8] dark:text-[#8ab4f8]">
            <Gavel size={26} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-semibold text-[#202124] dark:text-[#e8eaed] tracking-tight">
            E-Court Tracer
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] transition-colors font-medium">Home</Link>
          <Link to="/search" className="flex items-center gap-2 text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] transition-colors font-medium group">
            <Search size={18} strokeWidth={2.5} />
            <span>Check Case Status</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-[#dadce0] dark:border-[#5f6368]">
              {(user.role === 'admin' || user.role === 'court_staff') && (
                <Link to="/dashboard" className="flex items-center gap-1 text-[#1a73e8] hover:bg-[#f1f3f4] dark:text-[#8ab4f8] dark:hover:bg-[#3c4043] px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1 text-[#1a73e8] hover:bg-[#f1f3f4] dark:text-[#8ab4f8] dark:hover:bg-[#3c4043] px-4 py-2 rounded-full text-sm font-medium transition-colors">
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
              
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-[#202124] dark:text-[#e8eaed] leading-tight">{user.name}</span>
                  <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6] capitalize">{user.role.replace('_', ' ')}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] dark:hover:bg-[#3c4043] rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut size={20} className="ml-1" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-[#202124] hover:bg-[#f1f3f4] dark:text-[#e8eaed] dark:hover:bg-[#3c4043] font-medium px-4 py-2 rounded-full transition-colors">Login</Link>
              <Link to="/register" className="bg-[#1a73e8] text-white px-6 py-2 rounded-full font-medium hover:bg-[#1557b0] transition-colors shadow-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
