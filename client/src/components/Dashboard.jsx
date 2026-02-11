import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, Box, Server, Cpu, Zap, ArrowUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [requests, setRequests] = useState(0);
  const [metricsHistory, setMetricsHistory] = useState([]);
  
  const fetchHealth = async () => {
    try {
      const res = await axios.get('/health');
      setHealth(res.data);
      setRequests(prev => prev + 1);
      
      // Simulate tracking metrics over time for chart
      setMetricsHistory(prev => {
        const newHistory = [...prev, { time: new Date().toLocaleTimeString(), memory: parseInt(res.data.memory.used) }];
        return newHistory.slice(-20); // Keep last 20 points
      });

    } catch (err) {
      console.error("Health check failed", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchHealth, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
         <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
         <p className="text-gray-400">System health, performance metrics, and real-time pod status.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Cpu />} label="Memory Usage" value={health ? health.memory.used : '-'} color="purple" />
        <StatCard icon={<Shield />} label="Resilience Score" value={health ? `${health.survivorCount * 10}%` : '-'} color="green" />
        <StatCard icon={<Activity />} label="Requests Handled" value={requests} color="blue" />
        <StatCard icon={<Box />} label="Current Pod" value={health ? health.hostname : '-'} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Zap className="text-yellow-400" /> Live Resource Usage
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricsHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 10}} />
                        <YAxis stroke="#9ca3af" tick={{fontSize: 10}} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }} />
                        <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{r: 6}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Status Panel */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 backdrop-blur-sm flex flex-col justify-between">
            <div>
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                 <Server className="text-indigo-400" /> System Status
               </h3>
               
               <div className="flex items-center gap-3 mb-6 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">All Systems Operational</span>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Kubernetes Cluster</span>
                     <span className="text-white">Active</span>
                  </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-400">API Gateway</span>
                     <span className="text-white">Active</span>
                  </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Database (Redis)</span>
                     <span className="text-white">Connected</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
               <div className="flex items-center gap-2 text-indigo-400 text-sm">
                  <ArrowUp size={16} />
                  <span>Uptime: {health ? Math.floor(health.uptime / 60) : 0} minutes</span>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-800/50 p-6 rounded-2xl border border-gray-700 relative overflow-hidden group hover:border-${color}-500/50 transition-colors`}
    >
        <div className={`text-${color}-400 mb-4`}>{icon}</div>
        <div className="text-3xl font-bold mb-1 text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className={`absolute -right-4 -bottom-4 opacity-10 text-${color}-500 group-hover:scale-110 transition-transform`}>
            {React.cloneElement(icon, { size: 64 })}
        </div>
    </motion.div>
);

export default Dashboard;
