// context/FestivalContext.tsx - Festival data provider for reuse across components
import { useHomeFestivals, UseHomeFestivalsResult } from '@/hooks/useHomeFestivals';
import React, { createContext, ReactNode, useContext } from 'react';

interface FestivalContextType extends UseHomeFestivalsResult {}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const festivalData = useHomeFestivals({ daysAhead: 30 });

  return <FestivalContext.Provider value={festivalData}>{children}</FestivalContext.Provider>;
};

export const useFestivalContext = () => {
  const context = useContext(FestivalContext);
  if (context === undefined) {
    throw new Error('useFestivalContext must be used within a FestivalProvider');
  }
  return context;
};
