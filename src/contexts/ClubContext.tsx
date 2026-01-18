/* eslint-disable prettier/prettier */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ClubInfo {
  logoUrl: string;
  clubName: string;
}

interface ClubContextType {
  clubInfo: ClubInfo;
  updateClubInfo: (info: Partial<ClubInfo>) => void;
  isLoading: boolean;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    logoUrl: '',
    clubName: '电脑学会',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load club info from localStorage on mount
    const loadClubInfo = () => {
      try {
        const stored = localStorage.getItem('clubInfo');
        if (stored) {
          const parsed = JSON.parse(stored);
          setClubInfo(prev => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error('Failed to load club info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClubInfo();
  }, []);

  const updateClubInfo = (info: Partial<ClubInfo>) => {
    setClubInfo(prev => {
      const updated = { ...prev, ...info };
      try {
        localStorage.setItem('clubInfo', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save club info:', error);
      }
      return updated;
    });
  };

  return (
    <ClubContext.Provider value={{ clubInfo, updateClubInfo, isLoading }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
}
