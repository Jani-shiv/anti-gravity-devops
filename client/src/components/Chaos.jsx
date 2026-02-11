import React from 'react';
import ChaosControl from './ChaosControl';
import { Skull, AlertTriangle, Info } from 'lucide-react';

const Chaos = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-red-400 to-orange-600 mb-2">
          Chaos Engineering Center
        </h2>
        <p className="text-gray-400">
          Simulate failures to test the system's resilience. Kubernetes will automatically recover from these events.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Skull className="text-red-500" /> Controls
            </h3>
            <ChaosControl />
          </div>

          <div className="bg-blue-500/10 p-6 rounded-2xl border border-blue-500/20">
            <h3 className="text-lg font-bold mb-2 text-blue-400 flex items-center gap-2">
              <Info size={20} /> How it works
            </h3>
            <ul className="text-sm text-gray-300 space-y-2 list-disc pl-4">
              <li>
                <strong className="text-white">Gravity Simulator:</strong> Generates CPU load. The Horizontal Pod Autoscaler (HPA) triggers when CPU > 50% and adds more pods.
              </li>
              <li>
                <strong className="text-white">Kill Pod:</strong> Terminates the current Node.js process. Kubernetes Liveness Probe detects the failure and restarts the pod.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
               <AlertTriangle className="text-yellow-500" /> Live Status
             </h3>
             <div className="space-y-4">
               <div className="p-4 bg-black/40 rounded-lg">
                 <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Strategy</div>
                 <div className="font-mono text-green-400">RollingUpdate</div>
               </div>
               <div className="p-4 bg-black/40 rounded-lg">
                 <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Replicas</div>
                 <div className="font-mono text-indigo-400">Min: 2 / Max: 10</div>
               </div>
                <div className="p-4 bg-black/40 rounded-lg">
                 <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Self-Healing</div>
                 <div className="font-mono text-green-400">Enabled (Liveness/Readiness Probes)</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Chaos;
