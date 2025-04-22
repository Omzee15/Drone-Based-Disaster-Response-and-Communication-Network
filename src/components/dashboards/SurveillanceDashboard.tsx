
import React from 'react';
import { DroneList } from '@/components/DroneList';
import { GoogleDroneMap } from '@/components/GoogleDroneMap';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { Drone, MapOverlay } from '@/types/drone';
import { Gauge } from 'lucide-react';

interface SurveillanceDashboardProps {
  drones: Drone[];
  overlays: MapOverlay[];
  selectedDrone: string | null;
  onSelectDrone: (droneId: string | null) => void;
}

export const SurveillanceDashboard: React.FC<SurveillanceDashboardProps> = ({
  drones,
  overlays,
  selectedDrone,
  onSelectDrone,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Dashboard Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-medium text-white">Surveillance Dashboard</h2>
          </div>
          <div className="text-sm text-slate-400">
            Active Drones: {drones.filter(d => d.status === 'active').length}/{drones.length}
          </div>
        </div>
      </div>
      
      {/* Map Area */}
      <div className="flex-1 relative">
        <GoogleDroneMap 
          drones={drones} 
          overlays={overlays.filter(overlay => overlay.phase === 'surveillance')}
          selectedDrone={selectedDrone}
          currentPhase="surveillance"
          onSelectDrone={onSelectDrone}
        />
      </div>
    </div>
  );
};
