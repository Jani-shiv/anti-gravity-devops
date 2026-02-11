import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Zap, FileText, Server, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { jwtDecode } from 'jwt-decode';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Layout = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Operator');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Assuming the token payload has user.id not username, we might need to fetch it or store it.
        // For simplicity, let's assume we can fetch it or just show "User".
        // Actually the backend payload is { user: { id, role } }. 
        // We should update backend to include username in token or fetch /api/auth/me.
        // For now, let's fetch /api/auth/me or just default.
        // To be safe and quick, I'll fetch /api/auth/me here or just show role.
        // Let's rely on a helper or just "User" for now to avoid complexity in this step.
        // Wait, I can't easily fetch here without axios setup with headers.
        // I'll just decode and check if I can get role.
        if (decoded.user.role) setUsername(decoded.user.role === 'admin' ? 'Admin' : 'User');
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="bg-indigo-600 p-2 rounded-lg"
            >
              <Server size={24} />
            </motion.div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Anti-Gravity</h1>
              <p className="text-xs text-gray-500">DevOps Platform</p>
            </div>
          </div>

          <nav className="space-y-2">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/architecture" icon={Activity} label="Architecture" />
            <SidebarItem to="/chaos" icon={Zap} label="Chaos Center" />
            <SidebarItem to="/logs" icon={FileText} label="System Logs" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
              {username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium truncate w-32">{username}</p>
              <button 
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
