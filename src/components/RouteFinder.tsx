
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Route, Shield, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Mock routes data structure
interface RouteOption {
  id: string;
  startPoint: string;
  endPoint: string;
  distance: number;  // in kilometers
  estimatedTime: number;  // in minutes
  safetyScore: number;  // 0-100
  obstacles: string[];
  path: Array<{lat: number; lng: number}>; // For drawing on the map
}

interface RouteFinderProps {
  currentLocation?: {lat: number; lng: number};
  onSelectRoute?: (route: RouteOption) => void;
  onViewOnMap?: (points: Array<{lat: number; lng: number}>) => void;
}

export const RouteFinder: React.FC<RouteFinderProps> = ({ 
  currentLocation,
  onSelectRoute,
  onViewOnMap
}) => {
  const [startPoint, setStartPoint] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [showRouteDetails, setShowRouteDetails] = useState<boolean>(false);
  const { toast } = useToast();

  // Set current location as start point if available
  useEffect(() => {
    if (currentLocation) {
      setStartPoint(`${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`);
    }
  }, [currentLocation]);

  // Mock function to find routes
  const findRoutes = () => {
    if (!startPoint || !endPoint) {
      toast({
        title: "Missing Information",
        description: "Please provide both start and end points.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock routes
      const mockRoutes: RouteOption[] = [
        {
          id: 'route-1',
          startPoint,
          endPoint,
          distance: 12.5,
          estimatedTime: 25,
          safetyScore: 85,
          obstacles: ['Minor landslide', 'Damaged bridge (passable)'],
          path: generateMockPath(4),
        },
        {
          id: 'route-2',
          startPoint,
          endPoint,
          distance: 15.2,
          estimatedTime: 35,
          safetyScore: 92,
          obstacles: ['Road debris'],
          path: generateMockPath(6),
        },
        {
          id: 'route-3',
          startPoint,
          endPoint,
          distance: 18.7,
          estimatedTime: 45,
          safetyScore: 98,
          obstacles: [],
          path: generateMockPath(8),
        }
      ];
      
      setRouteOptions(mockRoutes);
      setIsSearching(false);
      
      toast({
        title: "Routes Found",
        description: `Found ${mockRoutes.length} possible routes to your destination.`,
      });
    }, 2000);
  };

  // Generate mock path points
  const generateMockPath = (points: number) => {
    const path = [];
    const baseLat = 27.3389;
    const baseLng = 88.6065;
    
    for (let i = 0; i < points; i++) {
      path.push({
        lat: baseLat + (Math.random() - 0.5) * 0.03,
        lng: baseLng + (Math.random() - 0.5) * 0.03
      });
    }
    
    return path;
  };

  // Handle route selection
  const handleSelectRoute = (route: RouteOption) => {
    setSelectedRoute(route);
    setShowRouteDetails(true);
    
    if (onSelectRoute) {
      onSelectRoute(route);
    }
  };

  // Handle viewing route on map
  const handleViewOnMap = () => {
    if (selectedRoute && onViewOnMap) {
      onViewOnMap(selectedRoute.path);
      setShowRouteDetails(false);
    }
  };

  // Get safety color based on score
  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Route className="h-5 w-5 text-blue-400" />
          <span>Emergency Route Finder</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Point</label>
          <Input 
            value={startPoint}
            onChange={(e) => setStartPoint(e.target.value)}
            placeholder="Enter coordinates or location"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Destination</label>
          <Input 
            value={endPoint}
            onChange={(e) => setEndPoint(e.target.value)}
            placeholder="Enter coordinates or location"
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
        
        {routeOptions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Available Routes:</h3>
            <div className="space-y-2">
              {routeOptions.map((route) => (
                <div 
                  key={route.id} 
                  className="bg-slate-700 p-3 rounded-md flex justify-between items-center cursor-pointer hover:bg-slate-600"
                  onClick={() => handleSelectRoute(route)}
                >
                  <div>
                    <div className="font-medium">Route {route.id.split('-')[1]}</div>
                    <div className="text-xs text-slate-400">{route.distance} km • {route.estimatedTime} min</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`${getSafetyColor(route.safetyScore)} text-white`}
                    >
                      {route.safetyScore}% Safe
                    </Badge>
                    <Shield className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={findRoutes}
          disabled={!startPoint || !endPoint || isSearching}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSearching ? 'Searching...' : 'Find Safe Routes'}
        </Button>
      </CardFooter>

      {/* Route Details Dialog */}
      <Dialog open={showRouteDetails} onOpenChange={setShowRouteDetails}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Route Details</DialogTitle>
            <DialogDescription className="text-slate-300">
              Details about your selected emergency route
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-slate-400">From</div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-blue-400" />
                    <span>{selectedRoute.startPoint}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-slate-400">To</div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-green-400" />
                    <span>{selectedRoute.endPoint}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-700 p-3 rounded-md text-center">
                  <div className="text-sm text-slate-400">Distance</div>
                  <div className="text-lg font-bold">{selectedRoute.distance} km</div>
                </div>
                
                <div className="bg-slate-700 p-3 rounded-md text-center">
                  <div className="text-sm text-slate-400">Time</div>
                  <div className="text-lg font-bold flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedRoute.estimatedTime} min
                  </div>
                </div>
                
                <div className="bg-slate-700 p-3 rounded-md text-center">
                  <div className="text-sm text-slate-400">Safety</div>
                  <div className={`text-lg font-bold ${selectedRoute.safetyScore >= 90 ? 'text-green-400' : selectedRoute.safetyScore >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {selectedRoute.safetyScore}%
                  </div>
                </div>
              </div>
              
              {selectedRoute.obstacles.length > 0 && (
                <div className="bg-slate-700/50 p-3 rounded-md">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-400" />
                    <span className="text-sm font-medium">Obstacles & Warnings</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    {selectedRoute.obstacles.map((obstacle, index) => (
                      <li key={index}>{obstacle}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setShowRouteDetails(false)}
              className="bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleViewOnMap}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View on Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
