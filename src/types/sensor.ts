
export interface SensorReading {
  id: string;
  type: 'temperature' | 'seismic' | 'barometric' | 'rainfall' | 'wind' | 'humidity';
  value: number;
  unit: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  thresholds: {
    warning: number;
    critical: number;
  };
}

export interface DisasterPrediction {
  id: string;
  type: 'earthquake' | 'landslide' | 'flood' | 'storm';
  probability: number;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  estimatedTime: Date;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  description: string;
  affectedAreas: string[];
  triggeredBy: SensorReading[];
  sensorId?: string; // Adding this property to fix the error
}

export interface Hotspot {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  peopleCount: number;
  timestamp: Date;
}

// Twilio messaging response type
export interface TwilioResponse {
  success: boolean;
  message: string;
  sid?: string;
  error?: string;
}

// Add the Sensor interface that's being referenced in EnhancedSensorMonitoringDashboard.tsx
export interface Sensor {
  id: string;
  name: string;
  type: string;
  description?: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    altitude: number;
  };
  status: 'normal' | 'warning' | 'alert' | 'offline';
  lastReading: {
    timestamp: Date;
    values: {
      [key: string]: number | string;
    };
  };
}
