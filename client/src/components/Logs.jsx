import React, { useState, useEffect, useRef } from 'react';
import { FileText, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const scrollRef = useRef(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/logs');
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      if (autoRefresh) fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Auto-scroll to bottom of logs on initial load or manual refresh if desired, 
  // but usually for tailing logs we want newest at *bottom* or *top*. 
  // Backend returns newest first in array due to .reverse(), so we render list as is.

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <FileText className="text-gray-400" /> System Logs
           </h2>
           <p className="text-gray-400 text-sm">Live stream from `combined.log` (Last 100 lines)</p>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={() => setAutoRefresh(!autoRefresh)}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${autoRefresh ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
           >
             <RefreshCw size={16} className={autoRefresh ? "animate-spin" : ""} />
             {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
           </button>
           
           <button 
             onClick={fetchLogs}
             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
           >
             Refresh Now
           </button>
        </div>
      </header>

      <div className="flex-1 bg-black/80 rounded-xl border border-gray-800 overflow-hidden flex flex-col font-mono text-sm relative shadow-2xl">
         {/* Terminal Header */}
         <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            <div className="ml-auto text-xs text-gray-500">root@anti-gravity-server</div>
         </div>

         {/* Logs Content */}
         <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar" ref={scrollRef}>
            {loading && logs.length === 0 ? (
                <div className="text-gray-500 italic">Connecting to log stream...</div>
            ) : (
                logs.map((log, index) => (
                    <div key={index} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors group">
                        <span className="text-gray-600 shrink-0 select-none w-36 text-xs pt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`break-all ${
                            log.level === 'error' ? 'text-red-400' : 
                            log.level === 'warn' ? 'text-yellow-400' : 
                            'text-gray-300'
                        }`}>
                           {log.message || JSON.stringify(log)}
                        </span>
                    </div>
                ))
            )}
         </div>
         
         <div className="p-2 text-xs text-gray-600 border-t border-gray-800 bg-gray-900/50 text-right">
            {logs.length} lines buffered
         </div>
      </div>
    </div>
  );
};

export default Logs;
