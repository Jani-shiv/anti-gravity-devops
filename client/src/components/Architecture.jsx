import React from 'react';
import { motion } from 'framer-motion';
import { Server, Globe, Database, Shield, Zap, Box } from 'lucide-react';

const Architecture = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-2">System Architecture</h2>
                <p className="text-gray-400">Visualizing the self-healing infrastructure stack.</p>
            </header>

            <div className="relative">
                {/* Flow Lines (SVG Overlay) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0">
                    <line x1="50%" y1="100" x2="50%" y2="200" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="300" x2="25%" y2="450" stroke="white" strokeWidth="2" />
                    <line x1="50%" y1="300" x2="75%" y2="450" stroke="white" strokeWidth="2" />
                </svg>

                <div className="flex flex-col items-center gap-16 relative z-10">
                    
                    {/* Level 1: Ingress */}
                    <div className="w-full max-w-md">
                        <Node 
                           title="Ingress Controller" 
                           subtitle="NGINX / Load Balancer"
                           icon={Globe}
                           color="blue"
                        />
                    </div>

                    {/* Level 2: Service Layer */}
                    <div className="w-full max-w-md">
                        <Node 
                           title="K8s Service" 
                           subtitle="ClusterIP (Internal Networking)"
                           icon={Shield}
                           color="indigo"
                        />
                    </div>

                    {/* Level 3: Pods (Auto-scaling) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                        <Node 
                           title="Pod Replicas" 
                           subtitle="Node.js App Instances"
                           icon={Box}
                           color="green"
                           isMulti
                        />
                        <Node 
                           title="HPA" 
                           subtitle="Horizontal Pod Autoscaler"
                           icon={Zap}
                           color="yellow"
                        />
                        <Node 
                           title="Monitoring" 
                           subtitle="Prometheus & Grafana"
                           icon={ActivityIcon}
                           color="orange"
                        />
                    </div>

                    {/* Level 4: Data/Storage */}
                    <div className="w-full max-w-md">
                         <Node 
                           title="Persistent Storage" 
                           subtitle="Redis / PV / PVC"
                           icon={Database}
                           color="red"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
};

const Node = ({ title, subtitle, icon: Icon, color, isMulti }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
        green: 'bg-green-500/10 border-green-500/30 text-green-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
        red: 'bg-red-500/10 border-red-500/30 text-red-400',
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-6 rounded-2xl border backdrop-blur-sm ${colorClasses[color]} relative group hover:scale-105 transition-transform duration-300`}
        >
            {isMulti && (
                <div className={`absolute top-0 left-0 w-full h-full rounded-2xl border ${colorClasses[color]} translate-x-2 -translate-y-2 -z-10`}></div>
            )}
             {isMulti && (
                <div className={`absolute top-0 left-0 w-full h-full rounded-2xl border ${colorClasses[color]} translate-x-4 -translate-y-4 -z-20 opacity-50`}></div>
            )}

            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-black/20 text-${color}-400`}>
                    <Icon size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white">{title}</h3>
                    <p className="text-sm opacity-80">{subtitle}</p>
                </div>
            </div>
        </motion.div>
    );
};

const ActivityIcon = (props) => (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export default Architecture;
