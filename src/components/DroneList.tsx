
import React from 'react';
import { Drone } from '@/types/drone';
import { Battery, Wifi, Camera, Package, Search, Signal, Activity } from 'lucide-react';

interface DroneListProps {
  drones: Drone[];
  selectedDrone: string | null;
  onSelectDrone: (droneId: string) => void;
  currentPhase: 'surveillance' | 'search' | 'relief';
}

export const DroneList: React.FC<DroneListProps> = ({
  drones,
  selectedDrone,
  onSelectDrone,
  currentPhase,
}) => {
  // Filter drones based on current phase
  const filteredDrones = drones.filter(drone => 
    currentPhase === 'search' ? 
      (drone.missionPhase === 'search') : 
      drone.missionPhase === currentPhase
  );
  
  const getDroneTypeIcon = (droneId: string) => {
    if (droneId.startsWith('SUR')) return <Activity className="w-3 h-3" />;
    if (droneId.startsWith('SCN')) return <Search className="w-3 h-3" />;
    if (droneId.startsWith('NET')) return <Signal className="w-3 h-3" />;
    if (droneId.startsWith('REL')) return <Package className="w-3 h-3" />;
    return <Activity className="w-3 h-3" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-400';
    if (battery > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDroneTypeBadge = (droneId: string) => {
    if (droneId.startsWith('SUR')) return 'bg-red-500/20 text-red-400';
    if (droneId.startsWith('SCN')) return 'bg-yellow-500/20 text-yellow-400';
    if (droneId.startsWith('NET')) return 'bg-blue-500/20 text-blue-400';
    if (droneId.startsWith('REL')) return 'bg-green-500/20 text-green-400';
    return 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-2">
          {currentPhase === 'surveillance' ? 'Surveillance Drones' : 
           currentPhase === 'search' ? 'Search & Network Drones' : 
           'Relief Delivery Drones'}
        </h2>
        <div className="text-sm text-slate-400">
          {filteredDrones.filter(d => d.status === 'active').length} of {filteredDrones.length} active
        </div>
      </div>

      <div className="p-2 space-y-2">
        {filteredDrones.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            No drones available for this phase
          </div>
        ) : (
          filteredDrones.map((drone) => (
            <div
              key={drone.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedDrone === drone.id
                  ? 'bg-blue-500/20 border-blue-400'
                  : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
              }`}
              onClick={() => onSelectDrone(drone.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(drone.status)}`} />
                  <span className="text-white font-medium text-sm">{drone.name}</span>
                </div>
                <div className={`text-xs px-1.5 py-0.5 rounded ${getDroneTypeBadge(drone.id)}`}>
                  {drone.id.substring(0, 3)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3" />
                  <span className={getBatteryColor(drone.battery)}>
                    {drone.battery.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400">Alt:</span>
                  <span className="text-white">{drone.position.altitude.toFixed(0)}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3" />
                  <span className="text-white">
                    {((drone.sensors.signalStrength || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {getDroneTypeIcon(drone.id)}
                  <span className={drone.payload.attached ? 'text-green-400' : 'text-slate-400'}>
                    {drone.id.startsWith('NET') ? 'Network' : 
                     drone.id.startsWith('SCN') ? 'Scanner' : 
                     drone.payload.type !== 'none' ? drone.payload.type : 'No payload'}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-400">
                Updated: {drone.lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
