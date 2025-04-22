
import React, { useRef, useEffect } from 'react';
import { Drone, MapOverlay } from '@/types/drone';

interface DroneMapProps {
  drones: Drone[];
  overlays: MapOverlay[];
  selectedDrone: string | null;
  currentPhase: 'surveillance' | 'search' | 'relief';
  onSelectDrone: (droneId: string | null) => void;
}

export const DroneMap: React.FC<DroneMapProps> = ({
  drones,
  overlays,
  selectedDrone,
  currentPhase,
  onSelectDrone,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'surveillance': return '#ef4444';
      case 'search': return '#f59e0b';
      case 'relief': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getDroneStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'maintenance': return '#f59e0b';
      case 'emergency': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div ref={mapRef} className="w-full h-full bg-slate-700 relative overflow-hidden">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Phase Indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getPhaseColor(currentPhase) }}
            />
            <span className="text-white font-medium">
              Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Map Overlays */}
      {overlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute rounded-full border-2 opacity-60 animate-pulse"
          style={{
            left: `${30 + (overlay.coordinates.longitude + 74.006) * 8000}px`,
            top: `${300 + (40.7128 - overlay.coordinates.latitude) * 8000}px`,
            width: `${overlay.radius / 2}px`,
            height: `${overlay.radius / 2}px`,
            borderColor: overlay.color,
            backgroundColor: `${overlay.color}20`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Drone Markers */}
      {drones.map((drone) => (
        <div
          key={drone.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
            selectedDrone === drone.id ? 'scale-150 z-30' : 'hover:scale-125 z-20'
          }`}
          style={{
            left: `${30 + (drone.position.longitude + 74.006) * 8000}px`,
            top: `${300 + (40.7128 - drone.position.latitude) * 8000}px`,
          }}
          onClick={() => onSelectDrone(drone.id)}
        >
          {/* Drone Icon */}
          <div 
            className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: getDroneStatusColor(drone.status) }}
          >
            {drone.id.slice(-1)}
          </div>
          
          {/* Selection Ring */}
          {selectedDrone === drone.id && (
            <div className="absolute inset-0 w-6 h-6 border-2 border-blue-400 rounded-full animate-ping" />
          )}
          
          {/* Drone Info Tooltip */}
          {selectedDrone === drone.id && (
            <div className="absolute left-8 top-0 bg-slate-800/95 backdrop-blur-sm text-white p-2 rounded-lg border border-slate-600 text-xs whitespace-nowrap">
              <div className="font-medium">{drone.name}</div>
              <div>Battery: {drone.battery.toFixed(0)}%</div>
              <div>Alt: {drone.position.altitude.toFixed(0)}m</div>
              <div>Speed: {drone.speed.toFixed(1)} m/s</div>
            </div>
          )}
        </div>
      ))}

      {/* Coordinates Display */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 border border-slate-600 text-xs text-slate-300">
        <div>Lat: 40.7128°N</div>
        <div>Lon: 74.0060°W</div>
        <div>Zoom: 15</div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600 text-xs">
        <div className="text-white font-medium mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-300">Active Drone</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-300">Maintenance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-300">Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
};
