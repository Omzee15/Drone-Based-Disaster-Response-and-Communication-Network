
import React, { useState } from 'react';
import { Drone, MapOverlay } from '@/types/drone';
import { Hotspot } from '@/types/sensor';
import { GoogleDroneMap } from '@/components/GoogleDroneMap';

interface ReliefDeliveryDashboardProps {
  drones: Drone[];
  overlays: MapOverlay[];
  selectedDrone: string | null;
  onSelectDrone: (droneId: string | null) => void;
  hotspots?: Hotspot[];
  onSelectHotspot?: (hotspotId: string) => void;  // Making this prop optional
}

export const ReliefDeliveryDashboard: React.FC<ReliefDeliveryDashboardProps> = ({
  drones,
  overlays,
  selectedDrone,
  onSelectDrone,
  hotspots = [],
  onSelectHotspot,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const handleHotspotSelect = (hotspotId: string) => {
    const hotspot = hotspots?.find(h => h.id === hotspotId) || null;
    setSelectedHotspot(hotspot);
    if (onSelectHotspot) onSelectHotspot(hotspotId);
  };

  return (
    <div className="flex-1 h-full overflow-hidden bg-slate-900">
      <GoogleDroneMap 
        drones={drones}
        overlays={overlays}
        selectedDrone={selectedDrone}
        currentPhase="relief"
        onSelectDrone={onSelectDrone}
        hotspots={hotspots}
        onSelectHotspot={handleHotspotSelect}
      />
      
      {selectedHotspot && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-slate-800 bg-opacity-90 p-4 rounded-lg shadow-lg border border-slate-700">
          <h3 className="text-white font-medium mb-2">Hotspot Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
            <div>People Count:</div>
            <div className="text-white">{selectedHotspot.peopleCount}</div>
            <div>Radius:</div>
            <div className="text-white">{selectedHotspot.radius}m</div>
            <div>Coordinates:</div>
            <div className="text-white">
              {selectedHotspot.location.latitude.toFixed(4)}, {selectedHotspot.location.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
