
export interface DronePosition {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface SensorData {
  thermal: number;
  infrared: number;
  signalStrength?: number;
  cameraUrl: string;
  thermalImageUrl?: string;
  bodyScanImageUrl?: string;
}

export interface PayloadStatus {
  type: 'medical' | 'food' | 'water' | 'none';
  attached: boolean;
  capacity: number;
  delivered: number;
}

export interface Drone {
  id: string;
  name: string;
  position: DronePosition;
  battery: number;
  status: 'active' | 'inactive' | 'maintenance' | 'emergency';
  missionPhase: 'surveillance' | 'search' | 'relief';
  sensors: SensorData;
  payload: PayloadStatus;
  lastUpdate: Date;
  speed: number;
  heading: number;
}

export interface MapOverlay {
  id: string;
  type: 'damage' | 'search' | 'connectivity' | 'delivery';
  coordinates: DronePosition;
  radius: number;
  intensity: number;
  color: string;
  phase: 'surveillance' | 'search' | 'relief';
}

export interface MissionPhase {
  name: 'surveillance' | 'search' | 'relief';
  displayName: string;
  description: string;
  color: string;
  icon: string;
}

export interface NetworkExtender {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  coverage: number;
  status: 'active' | 'inactive';
  battery: number;
  signal: number;
  deployedTime: Date;
}

export interface AffectedArea {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  peopleCount: number;
  requiresMedical: number;
  requiresFood: number;
  requiresWater: number;
  suppliesDelivered: {
    medical: number;
    food: number;
    water: number;
  };
}
