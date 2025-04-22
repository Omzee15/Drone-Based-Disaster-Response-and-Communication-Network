
import React from 'react';
import { Drone, MapOverlay } from '@/types/drone';
import { Hotspot } from '@/types/sensor';
import { GoogleDroneMap } from '@/components/GoogleDroneMap';

interface SearchConnectivityDashboardProps {
  drones: Drone[];
  overlays: MapOverlay[];
  networkExtenders: any[];
  selectedDrone: string | null;
  onSelectDrone: (droneId: string | null) => void;
  hotspots?: Hotspot[];
}

export const SearchConnectivityDashboard: React.FC<SearchConnectivityDashboardProps> = ({
  drones,
  overlays,
  networkExtenders,
  selectedDrone,
  onSelectDrone,
  hotspots = [],
}) => {
  return (
    <div className="flex-1 h-full overflow-hidden bg-slate-900">
      <GoogleDroneMap 
        drones={drones}
        overlays={overlays}
        selectedDrone={selectedDrone}
        currentPhase="search"
        onSelectDrone={onSelectDrone}
        networkExtenders={networkExtenders}
        hotspots={hotspots}
      />
    </div>
  );
};
