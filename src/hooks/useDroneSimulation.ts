
import { useState, useEffect, useCallback } from 'react';
import { Drone, MapOverlay, NetworkExtender } from '@/types/drone';

const generateMockDrones = (): Drone[] => {
  // Sikkim coordinates (general area)
  const baseCoordinates = { latitude: 27.3389, longitude: 88.6065 };
  
  const drones: Drone[] = [];
  
  // 8 drones for surveillance
  for (let i = 0; i < 8; i++) {
    drones.push({
      id: `SUR-${String(i + 1).padStart(3, '0')}`,
      name: `Surveillance ${i + 1}`,
      position: {
        latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.03,
        longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.03,
        altitude: 150 + Math.random() * 100,
      },
      battery: 70 + Math.random() * 30,
      status: Math.random() > 0.8 ? 'maintenance' : 'active',
      missionPhase: 'surveillance',
      sensors: {
        thermal: 20 + Math.random() * 15,
        infrared: 0.5 + Math.random() * 0.5,
        signalStrength: Math.random(),
        cameraUrl: 'https://picsum.photos/320/240?random=' + i,
      },
      payload: {
        type: 'none',
        attached: false,
        capacity: 0,
        delivered: 0,
      },
      lastUpdate: new Date(),
      speed: 15 + Math.random() * 10,
      heading: Math.random() * 360,
    });
  }
  
  // 6 drones for scanning (part of search phase)
  for (let i = 0; i < 6; i++) {
    drones.push({
      id: `SCN-${String(i + 1).padStart(3, '0')}`,
      name: `Scanner ${i + 1}`,
      position: {
        latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.02,
        longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.02,
        altitude: 80 + Math.random() * 60,
      },
      battery: 60 + Math.random() * 40,
      status: Math.random() > 0.9 ? 'maintenance' : 'active',
      missionPhase: 'search',
      sensors: {
        thermal: 30 + Math.random() * 20,
        infrared: 0.7 + Math.random() * 0.3,
        signalStrength: 0.6 + Math.random() * 0.4,
        cameraUrl: 'https://picsum.photos/320/240?random=' + (i + 8),
        thermalImageUrl: 'https://picsum.photos/320/240?random=' + (i + 20),
        bodyScanImageUrl: 'https://picsum.photos/320/240?random=' + (i + 30),
      },
      payload: {
        type: 'none',
        attached: false,
        capacity: 0,
        delivered: 0,
      },
      lastUpdate: new Date(),
      speed: 10 + Math.random() * 8,
      heading: Math.random() * 360,
    });
  }
  
  // 3 network extender drones (part of search phase)
  for (let i = 0; i < 3; i++) {
    drones.push({
      id: `NET-${String(i + 1).padStart(3, '0')}`,
      name: `NetExtend ${i + 1}`,
      position: {
        latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.025,
        longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.025,
        altitude: 200 + Math.random() * 100,
      },
      battery: 75 + Math.random() * 25,
      status: 'active',  // All network extenders should be active by default
      missionPhase: 'search',
      sensors: {
        thermal: 5 + Math.random() * 5,
        infrared: 0.2 + Math.random() * 0.2,
        signalStrength: 0.8 + Math.random() * 0.2,
        cameraUrl: 'https://picsum.photos/320/240?random=' + (i + 14),
      },
      payload: {
        type: 'none',
        attached: false,
        capacity: 0,
        delivered: 0,
      },
      lastUpdate: new Date(),
      speed: 5 + Math.random() * 5,
      heading: Math.random() * 360,
    });
  }
  
  // 8 drones for relief delivery
  for (let i = 0; i < 8; i++) {
    drones.push({
      id: `REL-${String(i + 1).padStart(3, '0')}`,
      name: `Relief ${i + 1}`,
      position: {
        latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.035,
        longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.035,
        altitude: 100 + Math.random() * 50,
      },
      battery: 65 + Math.random() * 35,
      status: Math.random() > 0.85 ? 'maintenance' : 'active',
      missionPhase: 'relief',
      sensors: {
        thermal: 10 + Math.random() * 10,
        infrared: 0.3 + Math.random() * 0.3,
        signalStrength: 0.5 + Math.random() * 0.5,
        cameraUrl: 'https://picsum.photos/320/240?random=' + (i + 17),
      },
      payload: {
        type: ['medical', 'food', 'water'][Math.floor(Math.random() * 3)] as any,
        attached: true,
        capacity: 10,
        delivered: Math.floor(Math.random() * 5),
      },
      lastUpdate: new Date(),
      speed: 12 + Math.random() * 8,
      heading: Math.random() * 360,
    });
  }
  
  return drones;
};

const generateNetworkExtenders = (): NetworkExtender[] => {
  // Sikkim coordinates
  const baseCoordinates = { lat: 27.3389, lng: 88.6065 };
  
  return Array.from({ length: 4 }, (_, i) => ({
    id: `NE-${String(i + 1).padStart(3, '0')}`,
    name: `Network Extender ${i + 1}`,
    position: {
      lat: baseCoordinates.lat + (Math.random() - 0.5) * 0.02,
      lng: baseCoordinates.lng + (Math.random() - 0.5) * 0.02,
    },
    coverage: 500 + Math.random() * 500, // Coverage radius in meters
    status: Math.random() > 0.2 ? 'active' : 'inactive',
    battery: 40 + Math.random() * 60,
    signal: 60 + Math.random() * 40,
    deployedTime: new Date(Date.now() - Math.random() * 3600000), // Deployed within the last hour
  }));
};

const generateOverlays = (phase: string): MapOverlay[] => {
  // Sikkim coordinates
  const baseCoordinates = { latitude: 27.3389, longitude: 88.6065 };
  
  const overlays: MapOverlay[] = [];
  
  if (phase === 'surveillance') {
    // Damage zones
    for (let i = 0; i < 5; i++) {
      overlays.push({
        id: `damage-${i}`,
        type: 'damage',
        coordinates: {
          latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.025,
          longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.025,
          altitude: 0,
        },
        radius: 100 + Math.random() * 200,
        intensity: Math.random(),
        color: '#ef4444',
        phase: 'surveillance',
      });
    }
  } else if (phase === 'search') {
    // Search zones and connectivity bubbles
    for (let i = 0; i < 4; i++) {
      overlays.push({
        id: `search-${i}`,
        type: 'search',
        coordinates: {
          latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.025,
          longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.025,
          altitude: 0,
        },
        radius: 150 + Math.random() * 100,
        intensity: Math.random(),
        color: '#f59e0b',
        phase: 'search',
      });
    }
    for (let i = 0; i < 3; i++) {
      overlays.push({
        id: `connectivity-${i}`,
        type: 'connectivity',
        coordinates: {
          latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.025,
          longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.025,
          altitude: 0,
        },
        radius: 200 + Math.random() * 150,
        intensity: 0.3 + Math.random() * 0.4,
        color: '#3b82f6',
        phase: 'search',
      });
    }
  } else if (phase === 'relief') {
    // Delivery zones
    for (let i = 0; i < 6; i++) {
      overlays.push({
        id: `delivery-${i}`,
        type: 'delivery',
        coordinates: {
          latitude: baseCoordinates.latitude + (Math.random() - 0.5) * 0.025,
          longitude: baseCoordinates.longitude + (Math.random() - 0.5) * 0.025,
          altitude: 0,
        },
        radius: 50 + Math.random() * 100,
        intensity: Math.random(),
        color: '#10b981',
        phase: 'relief',
      });
    }
  }
  
  return overlays;
};

export const useDroneSimulation = () => {
  const [drones, setDrones] = useState<Drone[]>(() => generateMockDrones());
  const [overlays, setOverlays] = useState<MapOverlay[]>(() => generateOverlays('surveillance'));
  const [networkExtenders, setNetworkExtenders] = useState<NetworkExtender[]>(() => generateNetworkExtenders());
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);

  const updateDrone = useCallback((droneId: string, updates: Partial<Drone>) => {
    setDrones(prev => prev.map(drone => 
      drone.id === droneId 
        ? { ...drone, ...updates, lastUpdate: new Date() }
        : drone
    ));
  }, []);

  const setMissionPhase = useCallback((phase: 'surveillance' | 'search' | 'relief') => {
    setOverlays(generateOverlays(phase));
    setDrones(prev => prev.map(drone => ({ ...drone, missionPhase: phase })));
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setDrones(prev => prev.map(drone => {
        if (drone.status !== 'active') return drone;

        // Small random position updates
        const newPosition = {
          latitude: drone.position.latitude + (Math.random() - 0.5) * 0.0001,
          longitude: drone.position.longitude + (Math.random() - 0.5) * 0.0001,
          altitude: Math.max(20, drone.position.altitude + (Math.random() - 0.5) * 5),
        };

        // Update sensors
        const newSensors = {
          ...drone.sensors,
          thermal: Math.max(0, drone.sensors.thermal + (Math.random() - 0.5) * 2),
          infrared: Math.max(0, Math.min(1, drone.sensors.infrared + (Math.random() - 0.5) * 0.1)),
          signalStrength: Math.max(0, Math.min(1, (drone.sensors.signalStrength || 0) + (Math.random() - 0.5) * 0.1)),
        };

        // Battery drain
        const newBattery = Math.max(0, drone.battery - 0.1);

        return {
          ...drone,
          position: newPosition,
          sensors: newSensors,
          battery: newBattery,
          speed: Math.max(0, drone.speed + (Math.random() - 0.5) * 2),
          heading: (drone.heading + (Math.random() - 0.5) * 10) % 360,
          lastUpdate: new Date(),
        };
      }));

      // Update network extenders
      setNetworkExtenders(prev => prev.map(extender => {
        // Small battery drain
        const newBattery = Math.max(0, extender.battery - 0.05);
        // Random signal fluctuation
        const newSignal = Math.max(0, Math.min(100, extender.signal + (Math.random() - 0.5) * 5));
        
        return {
          ...extender,
          battery: newBattery,
          signal: newSignal,
          status: newBattery < 10 ? 'inactive' : extender.status,
        };
      }));
      
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  return {
    drones,
    overlays,
    networkExtenders,
    isSimulationRunning,
    updateDrone,
    setMissionPhase,
    setIsSimulationRunning,
  };
};
