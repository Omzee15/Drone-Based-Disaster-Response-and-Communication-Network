import React, { useState, useEffect } from 'react';
import { DroneList } from '@/components/DroneList';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDroneSimulation } from '@/hooks/useDroneSimulation';
import { useSensorData } from '@/hooks/useSensorData';
import { SurveillanceDashboard } from '@/components/dashboards/SurveillanceDashboard';
import { SearchConnectivityDashboard } from '@/components/dashboards/SearchConnectivityDashboard';
import { ReliefDeliveryDashboard } from '@/components/dashboards/ReliefDeliveryDashboard';
import { EnhancedSensorMonitoringDashboard } from '@/components/dashboards/EnhancedSensorMonitoringDashboard';
import { NetworkExtenderPanel } from '@/components/NetworkExtenderPanel';
import { DisasterAlert } from '@/components/AlertDialog';
import { MessagingService } from '@/components/MessagingService';
import { Progress } from '@/components/ui/progress';
import { SafePlacesFinder } from '@/components/SafePlacesFinder';
import { RouteFinder } from '@/components/RouteFinder';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Activity, Eye, Search, Package2, Route, Shield } from 'lucide-react';
import { SensorReading, Sensor } from '@/types/sensor';

const Index = () => {
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'monitoring' | 'surveillance' | 'search' | 'relief'>('monitoring');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [isPhaseActive, setIsPhaseActive] = useState<boolean>(false);
  const [currentActivePrediction, setCurrentActivePrediction] = useState<any>(null);
  const [showMessagingPanel, setShowMessagingPanel] = useState<boolean>(false);
  const [mapCursorPosition, setMapCursorPosition] = useState<{lat: number, lng: number} | null>(null);
  const [showRouteFinder, setShowRouteFinder] = useState<boolean>(false);
  const [showSafePlaces, setShowSafePlaces] = useState<boolean>(false);
  
  const {
    drones,
    overlays,
    networkExtenders,
    updateDrone,
    setMissionPhase
  } = useDroneSimulation();
  
  const {
    sensors,
    predictions,
    hotspots,
  } = useSensorData();
  
  const {
    isConnected,
    sendMessage
  } = useWebSocket();

  // Map sensor readings to the format expected by EnhancedSensorMonitoringDashboard
  const mapSensorReadingsToSensors = (readings: SensorReading[]): Sensor[] => {
    return readings.map(reading => ({
      id: reading.id,
      name: `${reading.type.charAt(0).toUpperCase() + reading.type.slice(1)} Sensor at ${reading.location.name}`,
      type: reading.type,
      description: `${reading.type} sensor located in ${reading.location.name}`,
      location: {
        name: reading.location.name,
        latitude: reading.location.latitude,
        longitude: reading.location.longitude,
        altitude: 0, // Default value as it's not in SensorReading
      },
      status: reading.status === 'critical' ? 'alert' : 
              reading.status === 'warning' ? 'warning' : 
              'normal',
      lastReading: {
        timestamp: reading.timestamp,
        values: {
          value: reading.value,
          unit: reading.unit
        }
      }
    }));
  };

  // Check for high-severity disaster predictions and trigger alerts
  useEffect(() => {
    if (!isPhaseActive && predictions.length > 0) {
      const highSeverityPrediction = predictions.find(
        p => (p.severity === 'high' || p.severity === 'extreme') && p.probability > 0.7
      );
      
      if (highSeverityPrediction && !currentActivePrediction) {
        setCurrentActivePrediction(highSeverityPrediction);
      }
    }
  }, [predictions, isPhaseActive, currentActivePrediction]);

  // Handle disaster response activation
  const handleActivateDisasterResponse = () => {
    setIsPhaseActive(true);
    setCurrentPhase('surveillance');
    setMissionPhase('surveillance');
    setPhaseProgress(0);
    startPhaseProgress();
  };

  // Dismiss disaster alert
  const handleDismissAlert = () => {
    setCurrentActivePrediction(null);
  };

  // Progress through phases automatically
  const startPhaseProgress = () => {
    const interval = setInterval(() => {
      setPhaseProgress(prev => {
        const newProgress = prev + 1;
        
        // Phase transitions based on progress
        if (newProgress === 33) {
          setCurrentPhase('surveillance');
          setMissionPhase('surveillance');
        } else if (newProgress === 66) {
          setCurrentPhase('search');
          setMissionPhase('search');
        } else if (newProgress === 99) {
          setCurrentPhase('relief');
          setMissionPhase('relief');
        } else if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        return newProgress;
      });
    }, 1000); // Update every second for demo purposes

    return () => clearInterval(interval);
  };

  // Handle phase change from dropdown
  const handlePhaseChange = (phase: 'monitoring' | 'surveillance' | 'search' | 'relief') => {
    setCurrentPhase(phase);
    if (phase !== 'monitoring') {
      setMissionPhase(phase);
      
      // For utility panels, show the appropriate one based on phase
      if (phase === 'surveillance') {
        setShowRouteFinder(true);
        setShowSafePlaces(false);
        setShowMessagingPanel(false);
      } else if (phase === 'search') {
        setShowRouteFinder(false);
        setShowSafePlaces(true);
        setShowMessagingPanel(false);
      } else if (phase === 'relief') {
        setShowRouteFinder(false);
        setShowSafePlaces(false);
        setShowMessagingPanel(true);
      }
    }
    setSelectedDrone(null); // Reset selected drone when changing phases
  };

  // Get relevant drones for the current phase
  const getPhaseSpecificDrones = () => {
    if (currentPhase === 'monitoring') return [];
    
    return drones.filter(drone => {
      if (currentPhase === 'search') {
        // Both scanner drones and network extender drones
        return drone.missionPhase === 'search';
      }
      return drone.missionPhase === currentPhase;
    });
  };

  // Show messaging service when a hotspot is detected
  useEffect(() => {
    if (hotspots.length > 0 && hotspots.some(h => h.peopleCount > 100) && currentPhase === 'relief') {
      setShowMessagingPanel(true);
    }
  }, [hotspots, currentPhase]);

  // Prepare emergency message based on active prediction
  const getEmergencyMessage = () => {
    if (!currentActivePrediction) return "";
    
    return `EMERGENCY ALERT: ${currentActivePrediction.severity.toUpperCase()} ${
      currentActivePrediction.type.toUpperCase()
    } predicted in ${currentActivePrediction.location.name} area. Expected at ${
      currentActivePrediction.estimatedTime.toLocaleTimeString()
    }. Please seek shelter immediately and follow official instructions. DO NOT attempt to travel to affected areas.`;
  };

  // Handle utility panel selection
  const handleUtilityPanelChange = (panel: 'messaging' | 'routes' | 'safeplaces') => {
    setShowRouteFinder(panel === 'routes');
    setShowSafePlaces(panel === 'safeplaces');
    setShowMessagingPanel(panel === 'messaging');
  };

  // Render the appropriate dashboard based on current phase
  const renderDashboard = () => {
    switch(currentPhase) {
      case 'monitoring':
        return (
          <EnhancedSensorMonitoringDashboard 
            sensors={mapSensorReadingsToSensors(sensors)}
            predictions={predictions}
            selectedSensor={selectedSensor}
            onSelectSensor={setSelectedSensor}
          />
        );
      case 'surveillance':
        return (
          <SurveillanceDashboard 
            drones={getPhaseSpecificDrones()}
            overlays={overlays}
            selectedDrone={selectedDrone}
            onSelectDrone={setSelectedDrone}
          />
        );
      case 'search':
        return (
          <SearchConnectivityDashboard
            drones={getPhaseSpecificDrones()}
            overlays={overlays}
            networkExtenders={networkExtenders}
            selectedDrone={selectedDrone}
            onSelectDrone={setSelectedDrone}
            hotspots={hotspots}
          />
        );
      case 'relief':
        return (
          <ReliefDeliveryDashboard
            drones={getPhaseSpecificDrones()}
            overlays={overlays}
            selectedDrone={selectedDrone}
            onSelectDrone={setSelectedDrone}
            hotspots={hotspots}
            onSelectHotspot={() => setShowMessagingPanel(true)}
          />
        );
      default:
        return null;
    }
  };

  // Render the appropriate utility panel based on current phase and selection
  const renderUtilityPanel = () => {
    if (showMessagingPanel) {
      return (
        <MessagingService 
          recipientNumbers={["123-456-7890", "234-567-8901"]}
          predefinedMessage={getEmergencyMessage()}
          onMessageSent={() => setShowMessagingPanel(false)}
        />
      );
    } else if (showRouteFinder) {
      return (
        <RouteFinder 
          currentLocation={mapCursorPosition}
          onViewOnMap={(path) => console.log("View route on map:", path)}
        />
      );
    } else if (showSafePlaces) {
      return (
        <SafePlacesFinder 
          currentLocation={mapCursorPosition ? {
            lat: mapCursorPosition.lat, 
            lng: mapCursorPosition.lng
          } : undefined}
          onViewPlace={(place) => console.log("View place on map:", place)}
        />
      );
    } else {
      return (
        <DroneList 
          drones={drones} 
          selectedDrone={selectedDrone} 
          onSelectDrone={setSelectedDrone} 
          currentPhase={currentPhase === 'monitoring' ? 'surveillance' : currentPhase} 
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-bold text-white">DRC</h1>
            <span className="text-sm text-slate-400">Sikkim Disaster Response</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Phase Selection Dropdown */}
            <div className="min-w-[220px]">
              <Select
                value={currentPhase}
                onValueChange={(value) => handlePhaseChange(value as 'monitoring' | 'surveillance' | 'search' | 'relief')}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectGroup>
                    <SelectItem value="monitoring" className="text-white focus:bg-slate-700 focus:text-white">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-blue-500" />
                        Sensor Monitoring
                      </div>
                    </SelectItem>
                    <SelectItem value="surveillance" className="text-white focus:bg-slate-700 focus:text-white">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-red-500" />
                        Surveillance
                      </div>
                    </SelectItem>
                    <SelectItem value="search" className="text-white focus:bg-slate-700 focus:text-white">
                      <div className="flex items-center">
                        <Search className="w-4 h-4 mr-2 text-yellow-500" />
                        Search & Connectivity
                      </div>
                    </SelectItem>
                    <SelectItem value="relief" className="text-white focus:bg-slate-700 focus:text-white">
                      <div className="flex items-center">
                        <Package2 className="w-4 h-4 mr-2 text-green-500" />
                        Relief Delivery
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Utility Panel Selector - Only visible when in operational phases */}
            {currentPhase !== 'monitoring' && (
              <div className="min-w-[180px]">
                <Select
                  value={
                    showRouteFinder ? 'routes' : 
                    showSafePlaces ? 'safeplaces' : 
                    showMessagingPanel ? 'messaging' : 'drones'
                  }
                  onValueChange={(value) => {
                    if (value === 'routes' || value === 'safeplaces' || value === 'messaging') {
                      handleUtilityPanelChange(value);
                    } else {
                      setShowRouteFinder(false);
                      setShowSafePlaces(false);
                      setShowMessagingPanel(false);
                    }
                  }}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select utility" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectGroup>
                      <SelectItem value="drones" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-slate-400" />
                          Drone List
                        </div>
                      </SelectItem>
                      <SelectItem value="routes" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Route className="w-4 h-4 mr-2 text-blue-500" />
                          Route Finder
                        </div>
                      </SelectItem>
                      <SelectItem value="safeplaces" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-green-500" />
                          Safe Places
                        </div>
                      </SelectItem>
                      <SelectItem value="messaging" className="text-white focus:bg-slate-700 focus:text-white">
                        <div className="flex items-center">
                          <Package2 className="w-4 h-4 mr-2 text-red-500" />
                          Messaging
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </div>
            <div className="text-sm text-slate-400">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Phase Progress Bar (only visible when phases are actively running) */}
        {isPhaseActive && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Phase Progress</span>
              <span>{phaseProgress}%</span>
            </div>
            <div className="relative pt-1">
              <Progress 
                value={phaseProgress} 
                className="h-2 rounded-full bg-slate-700"
                indicatorClassName={
                  currentPhase === 'surveillance' ? 'bg-red-500' :
                  currentPhase === 'search' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }
              />
              
              {/* Phase Markers */}
              <div className="flex justify-between mt-2">
                <div className="relative">
                  <div className={`h-3 w-3 rounded-full ${phaseProgress >= 0 ? 'bg-red-500' : 'bg-slate-600'}`}></div>
                  <span className="absolute text-xs -ml-6 mt-4">Surveillance</span>
                </div>
                <div className="relative">
                  <div className={`h-3 w-3 rounded-full ${phaseProgress >= 33 ? 'bg-yellow-500' : 'bg-slate-600'}`}></div>
                  <span className="absolute text-xs -ml-12 mt-4">Search & Connectivity</span>
                </div>
                <div className="relative">
                  <div className={`h-3 w-3 rounded-full ${phaseProgress >= 66 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="absolute text-xs -ml-8 mt-4">Relief Delivery</span>
                </div>
                <div className="relative">
                  <div className={`h-3 w-3 rounded-full ${phaseProgress >= 100 ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                  <span className="absolute text-xs -ml-8 mt-4">Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Drone List or Utility Panels */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
          {renderUtilityPanel()}
        </div>

        {/* Main Content Area - Phase-specific Dashboard */}
        {renderDashboard()}

        {/* Right Sidebar - Telemetry */}
        <div className="w-96 bg-slate-800 border-l border-slate-700 overflow-y-auto">
          <TelemetryPanel 
            selectedDrone={selectedDrone ? drones.find(d => d.id === selectedDrone) : null} 
            drones={getPhaseSpecificDrones()} 
          />
          
          {/* Network Extender Panel - Only visible in Phase 2 */}
          {currentPhase === 'search' && (
            <div className="p-4">
              <NetworkExtenderPanel extenders={networkExtenders} />
            </div>
          )}
        </div>
      </div>

      {/* Disaster Alert Dialog */}
      <DisasterAlert 
        prediction={currentActivePrediction}
        onDismiss={handleDismissAlert}
        onAccept={handleActivateDisasterResponse}
      />
    </div>
  );
};

export default Index;
