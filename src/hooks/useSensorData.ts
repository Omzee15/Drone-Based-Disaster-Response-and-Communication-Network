
import { useState, useEffect } from 'react';
import { SensorReading, DisasterPrediction, Hotspot } from '@/types/sensor';

// Sikkim region coordinates for generating mock data
const SIKKIM_BOUNDS = {
  north: 28.10,
  south: 27.05,
  east: 88.93,
  west: 88.00
};

// Generate mock sensor data
const generateMockSensors = (): SensorReading[] => {
  const sensorTypes: Array<SensorReading['type']> = [
    'temperature', 'seismic', 'barometric', 'rainfall', 'wind', 'humidity'
  ];
  
  const sensorLocations = [
    { name: "Gangtok", latitude: 27.3389, longitude: 88.6065 },
    { name: "Namchi", latitude: 27.1667, longitude: 88.3639 },
    { name: "Mangan", latitude: 27.5167, longitude: 88.5333 },
    { name: "Rangpo", latitude: 27.1772, longitude: 88.5340 },
    { name: "Singtam", latitude: 27.2333, longitude: 88.5019 },
    { name: "Pakyong", latitude: 27.2320, longitude: 88.6086 },
    { name: "Ravangla", latitude: 27.3000, longitude: 88.3667 },
    { name: "Jorethang", latitude: 27.1075, longitude: 88.3236 },
    { name: "Pelling", latitude: 27.3000, longitude: 88.2400 },
  ];
  
  const sensors: SensorReading[] = [];
  
  sensorTypes.forEach(type => {
    sensorLocations.forEach((location, index) => {
      let value, unit, warningThreshold, criticalThreshold;
      
      switch(type) {
        case 'temperature':
          value = 15 + Math.random() * 15;
          unit = '°C';
          warningThreshold = 30;
          criticalThreshold = 40;
          break;
        case 'seismic':
          value = Math.random() * 6;
          unit = 'Richter';
          warningThreshold = 3;
          criticalThreshold = 5;
          break;
        case 'barometric':
          value = 950 + Math.random() * 100;
          unit = 'hPa';
          warningThreshold = 970;
          criticalThreshold = 950;
          break;
        case 'rainfall':
          value = Math.random() * 50;
          unit = 'mm/h';
          warningThreshold = 15;
          criticalThreshold = 30;
          break;
        case 'wind':
          value = Math.random() * 80;
          unit = 'km/h';
          warningThreshold = 40;
          criticalThreshold = 60;
          break;
        case 'humidity':
          value = 40 + Math.random() * 60;
          unit = '%';
          warningThreshold = 80;
          criticalThreshold = 95;
          break;
        default:
          value = Math.random() * 100;
          unit = 'units';
          warningThreshold = 70;
          criticalThreshold = 90;
      }
      
      // Only add one of each type per location
      if (index % sensorLocations.length < 3) {
        const statusValue: 'normal' | 'warning' | 'critical' = 
          value >= criticalThreshold || value <= criticalThreshold * 0.5 ? 'critical' :
          value >= warningThreshold || value <= warningThreshold * 0.7 ? 'warning' : 
          'normal';
          
        sensors.push({
          id: `${type}-${index}`,
          type,
          value,
          unit,
          location,
          timestamp: new Date(Date.now() - Math.random() * 3600000),
          status: statusValue,
          thresholds: {
            warning: warningThreshold,
            critical: criticalThreshold,
          }
        });
      }
    });
  });
  
  return sensors;
};

// Generate mock disaster predictions
const generateMockDisasterPredictions = (sensors: SensorReading[]): DisasterPrediction[] => {
  const predictions: DisasterPrediction[] = [];
  
  // Find abnormal sensor readings
  const abnormalSensors = sensors.filter(s => s.status !== 'normal');
  
  // Group by location
  const locationGroups: {[key: string]: SensorReading[]} = {};
  
  abnormalSensors.forEach(sensor => {
    const locationKey = `${sensor.location.latitude},${sensor.location.longitude}`;
    if (!locationGroups[locationKey]) {
      locationGroups[locationKey] = [];
    }
    locationGroups[locationKey].push(sensor);
  });
  
  // Generate predictions based on abnormal sensor clusters
  Object.values(locationGroups).forEach(sensorGroup => {
    if (sensorGroup.length >= 2) {
      const location = sensorGroup[0].location;
      const criticalSensors = sensorGroup.filter(s => s.status === 'critical');
      const hasCritical = criticalSensors.length > 0;
      
      // Determine disaster type based on sensor types
      let disasterType: 'earthquake' | 'landslide' | 'flood' | 'storm';
      
      if (sensorGroup.some(s => s.type === 'seismic' && s.status === 'critical')) {
        disasterType = 'earthquake';
      } else if (sensorGroup.some(s => s.type === 'rainfall' && s.status === 'critical')) {
        disasterType = Math.random() > 0.5 ? 'flood' : 'landslide';
      } else if (sensorGroup.some(s => s.type === 'wind' && s.status === 'warning')) {
        disasterType = 'storm';
      } else {
        disasterType = ['earthquake', 'landslide', 'flood', 'storm'][Math.floor(Math.random() * 4)] as any;
      }
      
      // Set probability based on sensor statuses
      const probability = hasCritical ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.4;
      
      // Set severity based on probability
      let severity: 'low' | 'moderate' | 'high' | 'extreme';
      if (probability < 0.4) severity = 'low';
      else if (probability < 0.6) severity = 'moderate';
      else if (probability < 0.8) severity = 'high';
      else severity = 'extreme';
      
      // Only add high probability events
      if (probability > 0.5 || Math.random() > 0.7) {
        predictions.push({
          id: `pred-${predictions.length + 1}`,
          type: disasterType,
          probability,
          location: {
            ...location,
            radius: 500 + Math.random() * 2000
          },
          estimatedTime: new Date(Date.now() + Math.random() * 3600000 * 6),
          severity,
          description: `Potential ${severity} ${disasterType} in the ${location.name} area based on ${sensorGroup.length} abnormal sensor readings.`,
          affectedAreas: [location.name],
          triggeredBy: sensorGroup
        });
      }
    }
  });
  
  // Ensure at least one prediction for demo purposes
  if (predictions.length === 0 && abnormalSensors.length > 0) {
    const sensor = abnormalSensors[0];
    predictions.push({
      id: 'pred-default',
      type: 'earthquake',
      probability: 0.7,
      location: {
        ...sensor.location,
        radius: 1000
      },
      estimatedTime: new Date(Date.now() + 1800000),
      severity: 'high',
      description: `Potential high severity earthquake in the ${sensor.location.name} area based on seismic sensor readings.`,
      affectedAreas: [sensor.location.name],
      triggeredBy: [sensor]
    });
  }
  
  return predictions;
};

// Generate mock hotspots
const generateMockHotspots = (): Hotspot[] => {
  const hotspots: Hotspot[] = [];
  
  // Generate 3-5 hotspots
  const count = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < count; i++) {
    hotspots.push({
      id: `hotspot-${i + 1}`,
      location: {
        latitude: SIKKIM_BOUNDS.south + Math.random() * (SIKKIM_BOUNDS.north - SIKKIM_BOUNDS.south),
        longitude: SIKKIM_BOUNDS.west + Math.random() * (SIKKIM_BOUNDS.east - SIKKIM_BOUNDS.west)
      },
      radius: 100 + Math.random() * 400,
      peopleCount: 50 + Math.floor(Math.random() * 200),
      timestamp: new Date()
    });
  }
  
  return hotspots;
};

export const useSensorData = () => {
  const [sensors, setSensors] = useState<SensorReading[]>(() => generateMockSensors());
  const [predictions, setPredictions] = useState<DisasterPrediction[]>(() => generateMockDisasterPredictions(generateMockSensors()));
  const [hotspots, setHotspots] = useState<Hotspot[]>(() => generateMockHotspots());
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isSimulationRunning) return;
    
    const interval = setInterval(() => {
      // Update sensor values
      setSensors(prevSensors => {
        const updatedSensors = prevSensors.map(sensor => {
          let newValue = sensor.value;
          
          // Add small random fluctuations
          switch(sensor.type) {
            case 'temperature':
              newValue += (Math.random() - 0.5) * 2;
              break;
            case 'seismic':
              // Occasionally add a seismic spike
              if (Math.random() > 0.95) {
                newValue = Math.random() * 2 + 3;
              } else {
                newValue = Math.random() * 1.5;
              }
              break;
            case 'barometric':
              newValue += (Math.random() - 0.5) * 3;
              break;
            case 'rainfall':
              newValue += (Math.random() - 0.2) * 2;
              if (newValue < 0) newValue = 0;
              break;
            case 'wind':
              newValue += (Math.random() - 0.5) * 5;
              if (newValue < 0) newValue = 0;
              break;
            case 'humidity':
              newValue += (Math.random() - 0.5) * 3;
              if (newValue < 0) newValue = 0;
              if (newValue > 100) newValue = 100;
              break;
          }
          
          // Update status based on new value
          const newStatus: 'normal' | 'warning' | 'critical' = 
            newValue >= sensor.thresholds.critical || newValue <= sensor.thresholds.critical * 0.5 ? 'critical' :
            newValue >= sensor.thresholds.warning || newValue <= sensor.thresholds.warning * 0.7 ? 'warning' : 
            'normal';
            
          return {
            ...sensor,
            value: newValue,
            status: newStatus,
            timestamp: new Date()
          };
        });
        
        return updatedSensors;
      });
      
      // Update disaster predictions based on updated sensors
      setSensors(currentSensors => {
        setPredictions(generateMockDisasterPredictions(currentSensors));
        return currentSensors;
      });
      
      // Occasionally update hotspots
      if (Math.random() > 0.7) {
        setHotspots(generateMockHotspots());
      }
      
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [isSimulationRunning]);

  return {
    sensors,
    predictions,
    hotspots,
    isSimulationRunning,
    setIsSimulationRunning,
  };
};
