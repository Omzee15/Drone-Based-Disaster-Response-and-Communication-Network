
import React, { useRef, useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { Drone, MapOverlay } from '@/types/drone';
import { Hotspot } from '@/types/sensor';
import { Gauge, Users } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Sikkim, India coordinates
const DEFAULT_CENTER = {
  lat: 27.3389,
  lng: 88.6065,
};

interface GoogleDroneMapProps {
  drones: Drone[];
  overlays: MapOverlay[];
  selectedDrone: string | null;
  currentPhase: 'surveillance' | 'search' | 'relief';
  onSelectDrone: (droneId: string | null) => void;
  networkExtenders?: { id: string; position: { lat: number; lng: number }; coverage: number; status: string; battery: number }[];
  hotspots?: Hotspot[];
  onSelectHotspot?: (hotspotId: string) => void; // Added this prop
}

export const GoogleDroneMap: React.FC<GoogleDroneMapProps> = ({
  drones,
  overlays,
  selectedDrone,
  currentPhase,
  onSelectDrone,
  networkExtenders = [],
  hotspots = [],
  onSelectHotspot, // Added this prop
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBMI3hWZEgYcXxuxYno5xlarm5aKOQYpPc',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hoveredDrone, setHoveredDrone] = useState<string | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  
  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMouseMove = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setCursorCoords({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  };

  const getDroneIcon = (drone: Drone) => {
    let iconColor = '';
    
    switch (drone.status) {
      case 'active': iconColor = '#10b981'; break;
      case 'maintenance': iconColor = '#f59e0b'; break;
      case 'emergency': iconColor = '#ef4444'; break;
      default: iconColor = '#6b7280';
    }
    
    // SVG for drone icon
    const droneIcon = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${iconColor}">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="${iconColor}" />
        <text x="12" y="16" font-size="12" text-anchor="middle" fill="white">${drone.id.slice(-1)}</text>
      </svg>
    `);

    return {
      url: `data:image/svg+xml;charset=UTF-8,${droneIcon}`,
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 16),
    };
  };

  const getOverlayColor = (overlay: MapOverlay) => {
    // Return color with opacity
    return overlay.color.replace(')', ', 0.4)').replace('rgb', 'rgba');
  };

  // Get hotspot icon based on people count
  const getHotspotIcon = (hotspot: Hotspot) => {
    // Color based on people count severity
    let color = hotspot.peopleCount > 150 ? '#ef4444' : 
                hotspot.peopleCount > 100 ? '#f59e0b' : 
                '#10b981';
                
    // SVG for hotspot icon
    const hotspotIcon = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `);

    return {
      url: `data:image/svg+xml;charset=UTF-8,${hotspotIcon}`,
      scaledSize: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 40),
    };
  };

  // Show network coverage bubbles for each drone
  const renderDroneNetworkCoverage = () => {
    return drones
      .filter(drone => drone.sensors.signalStrength && drone.sensors.signalStrength > 0)
      .map(drone => (
        <Circle
          key={`network-${drone.id}`}
          center={{
            lat: drone.position.latitude,
            lng: drone.position.longitude
          }}
          options={{
            strokeColor: '#3b82f6',
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: 'rgba(59, 130, 246, 0.1)',
            fillOpacity: 0.2,
            clickable: false,
          }}
          radius={(drone.sensors.signalStrength || 0) * 1000} // Convert signal strength to coverage radius
        />
      ));
  };

  if (!isLoaded) return <div className="w-full h-full bg-slate-700 flex items-center justify-center">Loading Google Maps...</div>;

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_CENTER}
        zoom={12}
        options={{
          mapTypeId: 'satellite',
          styles: [
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }]
            },
          ],
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onMouseMove={handleMouseMove}
      >
        {/* Map Overlays */}
        {overlays
          .filter(overlay => overlay.phase === currentPhase || currentPhase === 'search' && overlay.type === 'connectivity')
          .map((overlay) => (
            <Circle
              key={overlay.id}
              center={{ 
                lat: overlay.coordinates.latitude, 
                lng: overlay.coordinates.longitude 
              }}
              options={{
                strokeColor: overlay.color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: getOverlayColor(overlay),
                fillOpacity: overlay.intensity * 0.6,
                clickable: false,
              }}
              radius={overlay.radius / 2}
            />
        ))}
        
        {/* Drone Network Coverage */}
        {renderDroneNetworkCoverage()}

        {/* Hotspots */}
        {hotspots.map((hotspot) => (
          <React.Fragment key={hotspot.id}>
            <Marker
              position={{ 
                lat: hotspot.location.latitude, 
                lng: hotspot.location.longitude 
              }}
              icon={getHotspotIcon(hotspot)}
              onMouseOver={() => setHoveredHotspot(hotspot.id)}
              onMouseOut={() => setHoveredHotspot(null)}
              onClick={() => onSelectHotspot && onSelectHotspot(hotspot.id)}
            />
            
            {/* Hotspot circle to show coverage */}
            <Circle
              center={{ 
                lat: hotspot.location.latitude, 
                lng: hotspot.location.longitude 
              }}
              options={{
                strokeColor: hotspot.peopleCount > 150 ? '#ef4444' : 
                            hotspot.peopleCount > 100 ? '#f59e0b' : 
                            '#10b981',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: hotspot.peopleCount > 150 ? 'rgba(239, 68, 68, 0.2)' : 
                          hotspot.peopleCount > 100 ? 'rgba(245, 158, 11, 0.2)' : 
                          'rgba(16, 185, 129, 0.2)',
                fillOpacity: 0.35,
                clickable: false,
              }}
              radius={hotspot.radius}
            />
            
            {/* Show info window for hovered hotspot */}
            {hoveredHotspot === hotspot.id && (
              <InfoWindow
                position={{ 
                  lat: hotspot.location.latitude, 
                  lng: hotspot.location.longitude 
                }}
                options={{ pixelOffset: new google.maps.Size(0, -40) }}
              >
                <div className="bg-slate-800 text-white p-2 rounded min-w-[120px]">
                  <div className="font-medium flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Population Hotspot
                  </div>
                  <div className="text-xs mt-1">People count: {hotspot.peopleCount}</div>
                  <div className="text-xs">Radius: {(hotspot.radius).toFixed(0)}m</div>
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
        
        {/* Network Extenders for Phase 2 */}
        {currentPhase === 'search' && networkExtenders.map((extender) => (
          <Circle
            key={extender.id}
            center={{ lat: extender.position.lat, lng: extender.position.lng }}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: 'rgba(59, 130, 246, 0.3)',
              fillOpacity: 0.5,
              clickable: false,
            }}
            radius={extender.coverage}
          />
        ))}

        {/* Drone Markers */}
        {drones.map((drone) => (
          <React.Fragment key={drone.id}>
            <Marker
              position={{ 
                lat: drone.position.latitude, 
                lng: drone.position.longitude 
              }}
              icon={getDroneIcon(drone)}
              onClick={() => onSelectDrone(drone.id)}
              onMouseOver={() => setHoveredDrone(drone.id)}
              onMouseOut={() => setHoveredDrone(null)}
            />
            
            {/* Show info window for selected or hovered drone */}
            {(selectedDrone === drone.id || hoveredDrone === drone.id) && (
              <InfoWindow
                position={{ 
                  lat: drone.position.latitude, 
                  lng: drone.position.longitude 
                }}
                options={{ pixelOffset: new google.maps.Size(0, -30) }}
                onCloseClick={() => onSelectDrone(null)}
              >
                <div className="bg-slate-800 text-white p-2 rounded min-w-[120px]">
                  <div className="font-medium">{drone.name}</div>
                  <div className="text-xs">Battery: {drone.battery.toFixed(0)}%</div>
                  <div className="text-xs">Alt: {drone.position.altitude.toFixed(0)}m</div>
                  <div className="text-xs">Status: {drone.status}</div>
                </div>
              </InfoWindow>
            )}
          </React.Fragment>
        ))}
      </GoogleMap>

      {/* Cursor Coordinates Display */}
      {cursorCoords && (
        <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 border border-slate-600 z-20 text-xs">
          <div className="font-medium">Cursor Position</div>
          <div className="grid grid-cols-2 gap-x-2">
            <span className="text-slate-400">Lat:</span>
            <span className="text-right">{cursorCoords.lat.toFixed(6)}</span>
            <span className="text-slate-400">Lng:</span>
            <span className="text-right">{cursorCoords.lng.toFixed(6)}</span>
          </div>
        </div>
      )}

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
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-300">Network Coverage</span>
          </div>
          {hotspots.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-slate-300">Population Hotspot</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get phase color
const getPhaseColor = (phase: string) => {
  switch (phase) {
    case 'surveillance': return '#ef4444';
    case 'search': return '#f59e0b';
    case 'relief': return '#10b981';
    default: return '#6b7280';
  }
};
