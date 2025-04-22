
import React from 'react';
import { Drone } from '@/types/drone';
import { 
  Battery, 
  Thermometer, 
  Zap, 
  Camera, 
  Package, 
  Navigation,
  Clock,
  Gauge
} from 'lucide-react';

interface TelemetryPanelProps {
  selectedDrone: Drone | null;
  drones: Drone[];
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  selectedDrone,
  drones,
}) => {
  if (!selectedDrone) {
    return (
      <div className="h-full">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Telemetry</h2>
          <p className="text-sm text-slate-400">Select a drone to view details</p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Fleet Overview */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <h3 className="text-white font-medium mb-3">Fleet Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Drones:</span>
                <span className="text-white">{drones.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Active:</span>
                <span className="text-green-400">{drones.filter(d => d.status === 'active').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Maintenance:</span>
                <span className="text-yellow-400">{drones.filter(d => d.status === 'maintenance').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Avg Battery:</span>
                <span className="text-white">
                  {(drones.reduce((acc, d) => acc + d.battery, 0) / drones.length).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-green-400';
    if (battery > 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'maintenance': return 'text-yellow-400';
      case 'emergency': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Telemetry</h2>
        <p className="text-sm text-slate-400">{selectedDrone.name} ({selectedDrone.id})</p>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Status Overview */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Gauge className="w-4 h-4 mr-2" />
            Status
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status:</span>
              <span className={getStatusColor(selectedDrone.status)}>
                {selectedDrone.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Phase:</span>
              <span className="text-white">{selectedDrone.missionPhase}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Last Update:</span>
              <span className="text-white">{selectedDrone.lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Power & Performance */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Battery className="w-4 h-4 mr-2" />
            Power & Performance
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Battery:</span>
                <span className={getBatteryColor(selectedDrone.battery)}>
                  {selectedDrone.battery.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    selectedDrone.battery > 60 ? 'bg-green-400' :
                    selectedDrone.battery > 30 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${selectedDrone.battery}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Speed:</span>
              <span className="text-white">{selectedDrone.speed.toFixed(1)} m/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Heading:</span>
              <span className="text-white">{selectedDrone.heading.toFixed(0)}°</span>
            </div>
          </div>
        </div>

        {/* Position */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Navigation className="w-4 h-4 mr-2" />
            Position
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Latitude:</span>
              <span className="text-white">{selectedDrone.position.latitude.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Longitude:</span>
              <span className="text-white">{selectedDrone.position.longitude.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Altitude:</span>
              <span className="text-white">{selectedDrone.position.altitude.toFixed(1)} m</span>
            </div>
          </div>
        </div>

        {/* Sensors */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Thermometer className="w-4 h-4 mr-2" />
            Sensors
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Thermal:</span>
              <span className="text-white">{selectedDrone.sensors.thermal.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Infrared:</span>
              <span className="text-white">{(selectedDrone.sensors.infrared * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Signal:</span>
              <span className="text-white">
                {((selectedDrone.sensors.signalStrength || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Payload */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Payload
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Type:</span>
              <span className="text-white">{selectedDrone.payload.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Status:</span>
              <span className={selectedDrone.payload.attached ? 'text-green-400' : 'text-slate-400'}>
                {selectedDrone.payload.attached ? 'Attached' : 'Detached'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Delivered:</span>
              <span className="text-white">
                {selectedDrone.payload.delivered}/{selectedDrone.payload.capacity}
              </span>
            </div>
          </div>
        </div>

        {/* Camera Feed */}
        <div className="bg-slate-700/30 rounded-lg p-3">
          <h3 className="text-white font-medium mb-3 flex items-center">
            <Camera className="w-4 h-4 mr-2" />
            Camera Feed
          </h3>
          <div className="aspect-video bg-slate-600 rounded-lg overflow-hidden">
            <img 
              src={selectedDrone.sensors.cameraUrl} 
              alt="Drone camera feed"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-2 text-xs text-slate-400 text-center">
            Live feed - {selectedDrone.name}
          </div>
        </div>
      </div>
    </div>
  );
};
