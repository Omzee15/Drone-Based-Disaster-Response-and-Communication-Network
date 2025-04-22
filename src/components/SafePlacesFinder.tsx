
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Users, ShieldCheck, Compass } from 'lucide-react';

// Mock safe place data structure
interface SafePlace {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'camp' | 'station';
  coordinates: { lat: number; lng: number };
  distance: number; // in kilometers from current position
  capacity: number;
  currentOccupancy: number;
  services: string[];
}

interface SafePlacesFinderProps {
  currentLocation?: { lat: number; lng: number };
  onViewPlace?: (place: SafePlace) => void;
}

export const SafePlacesFinder: React.FC<SafePlacesFinderProps> = ({
  currentLocation,
  onViewPlace
}) => {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const { toast } = useToast();

  // Mock function to find nearby safe places
  const findSafePlaces = () => {
    if (!currentLocation) {
      toast({
        title: "Location Required",
        description: "Your current location is needed to find nearby safe places.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    // Simulate API call delay
    setTimeout(() => {
      // Generate mock safe places
      const mockPlaces: SafePlace[] = [
        {
          id: 'shelter-1',
          name: 'Gangtok Relief Center',
          type: 'shelter',
          coordinates: {
            lat: currentLocation.lat + (Math.random() - 0.5) * 0.02,
            lng: currentLocation.lng + (Math.random() - 0.5) * 0.02
          },
          distance: 2.3,
          capacity: 500,
          currentOccupancy: 210,
          services: ['Food', 'Medical', 'Water', 'Communications']
        },
        {
          id: 'hospital-1',
          name: 'STNM Hospital',
          type: 'hospital',
          coordinates: {
            lat: currentLocation.lat + (Math.random() - 0.5) * 0.015,
            lng: currentLocation.lng + (Math.random() - 0.5) * 0.015
          },
          distance: 3.8,
          capacity: 200,
          currentOccupancy: 140,
          services: ['Emergency Care', 'Surgery', 'Medication']
        },
        {
          id: 'camp-1',
          name: 'Army Relief Camp',
          type: 'camp',
          coordinates: {
            lat: currentLocation.lat + (Math.random() - 0.5) * 0.025,
            lng: currentLocation.lng + (Math.random() - 0.5) * 0.025
          },
          distance: 5.1,
          capacity: 1000,
          currentOccupancy: 450,
          services: ['Food', 'Water', 'Security', 'Transportation']
        },
        {
          id: 'station-1',
          name: 'NGO Supply Station',
          type: 'station',
          coordinates: {
            lat: currentLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: currentLocation.lng + (Math.random() - 0.5) * 0.01
          },
          distance: 1.7,
          capacity: 300,
          currentOccupancy: 120,
          services: ['Food Distribution', 'Water', 'First Aid']
        }
      ];

      // Sort by distance
      mockPlaces.sort((a, b) => a.distance - b.distance);
      
      setPlaces(mockPlaces);
      setIsSearching(false);
      
      toast({
        title: "Safe Places Found",
        description: `Found ${mockPlaces.length} safe locations near you.`,
      });
    }, 1500);
  };

  // Get icon based on place type
  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'shelter': return <ShieldCheck className="h-4 w-4 text-blue-400" />;
      case 'hospital': return <ShieldCheck className="h-4 w-4 text-red-400" />;
      case 'camp': return <ShieldCheck className="h-4 w-4 text-green-400" />;
      case 'station': return <ShieldCheck className="h-4 w-4 text-yellow-400" />;
      default: return <ShieldCheck className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get occupancy percentage
  const getOccupancyPercentage = (current: number, total: number) => {
    return Math.round((current / total) * 100);
  };

  // Get occupancy color class
  const getOccupancyColorClass = (percentage: number) => {
    if (percentage < 50) return 'text-green-400';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Handle viewing place on map
  const handleViewPlace = (place: SafePlace) => {
    if (onViewPlace) {
      onViewPlace(place);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-green-400" />
          <span>Nearby Safe Places</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {currentLocation && (
          <div className="bg-slate-700 p-2 rounded-md text-xs flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-blue-400" />
              <span>Your location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
            </div>
            <Compass className="h-3 w-3 text-slate-400" />
          </div>
        )}
        
        {places.length > 0 ? (
          <div className="space-y-3">
            {places.map((place) => (
              <div 
                key={place.id}
                className="bg-slate-700 p-3 rounded-md hover:bg-slate-600 cursor-pointer transition-colors"
                onClick={() => handleViewPlace(place)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium flex items-center">
                      {getPlaceIcon(place.type)}
                      <span className="ml-1">{place.name}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {place.distance} km away
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className="capitalize border-slate-600"
                  >
                    {place.type}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs bg-slate-800/50 p-2 rounded">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>
                      Capacity: <span className={getOccupancyColorClass(getOccupancyPercentage(place.currentOccupancy, place.capacity))}>
                        {place.currentOccupancy}/{place.capacity}
                      </span>
                    </span>
                  </div>
                  <span>
                    {getOccupancyPercentage(place.currentOccupancy, place.capacity)}% Full
                  </span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {place.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="bg-slate-600 text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Search for nearby safe places</p>
            <p className="text-xs mt-1">Shelters, hospitals and relief camps</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={findSafePlaces}
          disabled={isSearching || !currentLocation}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Find Safe Places'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
