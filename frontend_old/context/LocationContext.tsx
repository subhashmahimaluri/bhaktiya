'use client';

import { createContext, ReactNode, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { reactLocalStorage } from 'reactjs-localstorage';

interface LocationData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  offset: number; // Timezone offset in hours from UTC
}

interface LocationContextType extends LocationData {
  setLocationData: (data: LocationData) => void;
}

const defaultValues: LocationData = {
  city: 'Hyderabad',
  country: 'India',
  lat: 17.385044,
  lng: 78.486671,
  timezone: 'Asia/Kolkata',
  offset: 5.5, // IST offset from UTC
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData>(defaultValues);

  useEffect(() => {
    const saved = reactLocalStorage.getObject('LOCATION');
    if (
      saved &&
      typeof saved === 'object' &&
      'city' in saved &&
      'country' in saved &&
      'lat' in saved &&
      'lng' in saved &&
      'timezone' in saved &&
      'offset' in saved
    ) {
      setLocation(saved as LocationData);
    }
  }, []);

  const setLocationData = useCallback((data: LocationData) => {
    setLocation(data);
    reactLocalStorage.setObject('LOCATION', data);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ ...location, setLocationData }), [location, setLocationData]);

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
