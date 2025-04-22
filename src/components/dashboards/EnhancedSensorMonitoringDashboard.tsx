import React, { useState, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { Sensor, DisasterPrediction } from '@/types/sensor';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Alert, AlertDescription, AlertTitle 
} from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress';
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, Thermometer, Activity, Gauge, CloudRain, Wind, Droplets
} from 'lucide-react';

// Update the interface to correctly use Sensor type
interface EnhancedSensorMonitoringDashboardProps {
  sensors: Sensor[];
  predictions: DisasterPrediction[];
  selectedSensor: string | null;
  onSelectSensor: (sensorId: string | null) => void;
}

export const EnhancedSensorMonitoringDashboard: React.FC<EnhancedSensorMonitoringDashboardProps> = ({
  sensors,
  predictions,
  selectedSensor,
  onSelectSensor,
}) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Filter sensors by type when a tab is selected
  const filteredSensors = useMemo(() => {
    if (activeTab === 'overview') {
      return sensors;
    }
    return sensors.filter(sensor => sensor.type === activeTab);
  }, [sensors, activeTab]);

  // Get the selected sensor details
  const selectedSensorData = useMemo(() => {
    if (!selectedSensor) return null;
    return sensors.find(sensor => sensor.id === selectedSensor) || null;
  }, [sensors, selectedSensor]);

  // Group sensors by location for the map
  const sensorsByLocation = useMemo(() => {
    const locations: Record<string, Sensor[]> = {};
    
    sensors.forEach(sensor => {
      const key = `${sensor.location.latitude},${sensor.location.longitude}`;
      if (!locations[key]) {
        locations[key] = [];
      }
      locations[key].push(sensor);
    });
    
    return locations;
  }, [sensors]);

  // Sikkim, India coordinates
  const DEFAULT_CENTER = {
    lat: 27.3389,
    lng: 88.6065,
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBMI3hWZEgYcXxuxYno5xlarm5aKOQYpPc',
  });

  // Get sensor icon based on type and status
  const getSensorIcon = (sensor: Sensor) => {
    let color = '';
    switch(sensor.status) {
      case 'normal': color = '#10b981'; break;
      case 'warning': color = '#f59e0b'; break;
      case 'alert': color = '#ef4444'; break;
      case 'offline': color = '#6b7280'; break;
    }
    
    // SVG for sensor icon
    const sensorIcon = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" stroke="white" stroke-width="2" fill="${color}" />
      </svg>
    `);

    return {
      url: `data:image/svg+xml;charset=UTF-8,${sensorIcon}`,
      scaledSize: new google.maps.Size(24, 24),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(12, 12),
    };
  };

  // Get prediction severity color
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'low': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'extreme': return '#7f1d1d';
      default: return '#6b7280';
    }
  };

  // Get sensor type icon
  const getSensorTypeIcon = (type: string) => {
    switch(type) {
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      case 'seismic': return <Activity className="h-4 w-4" />;
      case 'barometric': return <Gauge className="h-4 w-4" />;
      case 'rainfall': return <CloudRain className="h-4 w-4" />;
      case 'wind': return <Wind className="h-4 w-4" />;
      case 'humidity': return <Droplets className="h-4 w-4" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  };

  // Get cursor coordinates on map
  const [cursorCoords, setCursorCoords] = useState<{ lat: number, lng: number } | null>(null);
  const handleMouseMove = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setCursorCoords({ lat, lng });
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-900 p-4">
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 auto-rows-min h-full">
        {/* Main sensor data and map */}
        <Card className="bg-slate-800 border-slate-700 text-white col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Sensor Monitoring Dashboard</span>
              
              {cursorCoords && (
                <Badge variant="secondary" className="ml-2 bg-slate-700">
                  Lat: {cursorCoords.lat.toFixed(5)}, Lng: {cursorCoords.lng.toFixed(5)}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-slate-300">
              Sensor readings across Sikkim region
            </CardDescription>
            <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-700">
                <TabsTrigger value="overview" className="data-[state=active]:bg-slate-600">Overview</TabsTrigger>
                <TabsTrigger value="temperature" className="data-[state=active]:bg-slate-600">Temperature</TabsTrigger>
                <TabsTrigger value="seismic" className="data-[state=active]:bg-slate-600">Seismic</TabsTrigger>
                <TabsTrigger value="barometric" className="data-[state=active]:bg-slate-600">Barometric</TabsTrigger>
                <TabsTrigger value="rainfall" className="data-[state=active]:bg-slate-600">Rainfall</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px] mb-4 relative">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
                  center={DEFAULT_CENTER}
                  zoom={9}
                  options={{
                    mapTypeId: 'satellite',
                    styles: [
                      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                      { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
                    ],
                    fullscreenControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                  }}
                  onLoad={setMapInstance}
                  onMouseMove={handleMouseMove}
                >
                  {/* Render sensor markers grouped by location */}
                  {Object.entries(sensorsByLocation).map(([locationKey, locationSensors]) => {
                    const [lat, lng] = locationKey.split(',').map(Number);
                    const hasCritical = locationSensors.some(s => s.status === 'alert');
                    const hasWarning = locationSensors.some(s => s.status === 'warning');
                    const status = hasCritical ? 'alert' : (hasWarning ? 'warning' : 'normal');
                    
                    return (
                      <Marker
                        key={locationKey}
                        position={{ lat, lng }}
                        icon={getSensorIcon({ ...locationSensors[0], status })}
                        onClick={() => onSelectSensor(locationSensors[0].id)}
                      />
                    );
                  })}
                  
                  {/* Render disaster prediction circles */}
                  {predictions.map(prediction => (
                    <Circle
                      key={prediction.id}
                      center={{ 
                        lat: prediction.location.latitude, 
                        lng: prediction.location.longitude 
                      }}
                      options={{
                        strokeColor: getSeverityColor(prediction.severity),
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: getSeverityColor(prediction.severity),
                        fillOpacity: 0.2 + (prediction.probability * 0.3),
                        clickable: false,
                      }}
                      radius={prediction.location.radius}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full bg-slate-700 rounded-md">
                  Loading map...
                </div>
              )}
            </div>
            
            {/* Display disaster predictions if any */}
            {predictions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Disaster Predictions</h3>
                {predictions.map(prediction => (
                  <Alert key={prediction.id} className={`bg-slate-700 border-${getSeverityColor(prediction.severity).substr(1)} text-white`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center">
                      {prediction.type.charAt(0).toUpperCase() + prediction.type.slice(1)} Prediction
                      <Badge 
                        className={`ml-2`}
                        style={{ backgroundColor: getSeverityColor(prediction.severity) }}
                      >
                        {prediction.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {Math.round(prediction.probability * 100)}% probability
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="text-slate-300">
                      {prediction.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sensor readings list */}
        <Card className="bg-slate-800 border-slate-700 text-white h-[calc(100%-1rem)] overflow-y-auto">
          <CardHeader>
            <CardTitle>Sensor Readings</CardTitle>
            <CardDescription className="text-slate-300">
              {filteredSensors.length} sensors monitoring the region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredSensors.map(sensor => (
                <div 
                  key={sensor.id}
                  className={`p-3 rounded-md cursor-pointer border ${
                    selectedSensor === sensor.id 
                      ? 'bg-blue-500/20 border-blue-400' 
                      : `bg-slate-700/50 border-slate-600 hover:bg-slate-700 ${
                          sensor.status === 'alert' ? 'border-red-500/50' : 
                          sensor.status === 'warning' ? 'border-yellow-500/50' : ''
                        }`
                  }`}
                  onClick={() => onSelectSensor(sensor.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded-full ${
                        sensor.status === 'alert' ? 'bg-red-500/20' : 
                        sensor.status === 'warning' ? 'bg-yellow-500/20' : 
                        'bg-green-500/20'
                      }`}>
                        {getSensorTypeIcon(sensor.type)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {sensor.name}
                        </div>
                        <div className="text-xs text-slate-400">{sensor.location.name}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      sensor.status === 'alert' ? 'text-red-400' : 
                      sensor.status === 'warning' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {typeof sensor.lastReading.values.value === 'number' ? 
                       sensor.lastReading.values.value.toFixed(sensor.type === 'seismic' ? 2 : 1) :
                       sensor.lastReading.values.value} {sensor.lastReading.values.unit}
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      sensor.status === 'alert' ? 'bg-red-500' : 
                      sensor.status === 'warning' ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`} style={{
                      width: `${Math.min(100, (sensor.lastReading.values.value as number / 100) * 100)}%`
                    }}/>
                  </div>
                  
                  <div className="text-xs text-slate-400 mt-1">
                    Updated: {sensor.lastReading.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}

              {filteredSensors.length === 0 && (
                <div className="text-center py-4 text-slate-400">
                  No sensors of this type found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
