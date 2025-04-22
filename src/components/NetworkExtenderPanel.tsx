
import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface NetworkExtender {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  coverage: number;
  status: string;
  battery: number;
  signal: number;
  deployedTime: Date;
}

interface NetworkExtenderPanelProps {
  extenders: NetworkExtender[];
}

export const NetworkExtenderPanel: React.FC<NetworkExtenderPanelProps> = ({ extenders }) => {
  if (!extenders || extenders.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Wifi className="w-5 h-5 mr-2" />
          Cell Network Tower Extenders
        </h3>
        <div className="text-slate-400 mt-2">No network extenders deployed yet</div>
      </div>
    );
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-400';
    if (battery > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <Wifi className="w-5 h-5 mr-2" />
        Cell Network Tower Extenders
      </h3>
      <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md">
          {extenders.length} Deployed
        </span>
        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-md">
          {extenders.filter(e => e.status === 'active').length} Active
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {extenders.map(extender => (
          <div key={extender.id} className="bg-slate-700/50 rounded-md p-3">
            <div className="flex justify-between items-center">
              <div className="font-medium text-white">{extender.name}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                extender.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {extender.status.toUpperCase()}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center">
                  <Battery className="w-4 h-4 mr-1" /> Battery
                </span>
                <span className={getBatteryColor(extender.battery)}>
                  {extender.battery}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400 flex items-center">
                  <Signal className="w-4 h-4 mr-1" /> Signal
                </span>
                <span className="text-white">
                  {extender.signal}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Coverage</span>
                <span className="text-white">
                  {(extender.coverage / 1000).toFixed(1)} km
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Deployed</span>
                <span className="text-white">
                  {extender.deployedTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
