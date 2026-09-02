import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { toBE } from '../utils/thaiYear';
import { getSubDistrictsByDistrict, getVillagesBySubDistrict, NAKHON_DISTRICTS } from '../data/nakhonDistricts';

export type FilterYear = number | 'all';

interface FilterContextType {
  selectedYear: FilterYear;
  setSelectedYear: (year: FilterYear) => void;
  selectedProvince: string;
  setSelectedProvince: (province: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedSubDistrict: string;
  setSelectedSubDistrict: (subDistrict: string) => void;
  selectedVillage: string;
  setSelectedVillage: (village: string) => void;
  selectedSpecies: string;
  setSelectedSpecies: (species: string) => void;
  selectedSeverity: string;
  setSelectedSeverity: (severity: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableSubDistricts: string[];
  availableVillages: string[];
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const AVAILABLE_YEARS_BE: FilterYear[] = [
  'all',
  2569,
  2568,
  2567,
  2566,
  2565,
  2564,
  2563,
  2562,
  2561,
  2560,
  2559,
  2558,
  2557,
  2556,
  2555,
];

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState<FilterYear>(2569);
  const [selectedProvince, setSelectedProvince] = useState<string>('นครศรีธรรมราช');
  const [selectedDistrict, setSelectedDistrictState] = useState<string>('all');
  const [selectedSubDistrict, setSelectedSubDistrictState] = useState<string>('all');
  const [selectedVillage, setSelectedVillageState] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cascading update for District -> resets SubDistrict & Village
  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);
    setSelectedSubDistrictState('all');
    setSelectedVillageState('all');
  };

  // Cascading update for SubDistrict -> resets Village
  const setSelectedSubDistrict = (subDistrict: string) => {
    setSelectedSubDistrictState(subDistrict);
    setSelectedVillageState('all');
  };

  const setSelectedVillage = (village: string) => {
    setSelectedVillageState(village);
  };

  // Compute available SubDistricts based on currently selected District
  const availableSubDistricts = useMemo(() => {
    return getSubDistrictsByDistrict(selectedDistrict);
  }, [selectedDistrict]);

  // Compute available Villages based on currently selected SubDistrict & District
  const availableVillages = useMemo(() => {
    return getVillagesBySubDistrict(selectedSubDistrict, selectedDistrict);
  }, [selectedSubDistrict, selectedDistrict]);

  const resetFilters = () => {
    setSelectedYear('all');
    setSelectedProvince('นครศรีธรรมราช');
    setSelectedDistrictState('all');
    setSelectedSubDistrictState('all');
    setSelectedVillageState('all');
    setSelectedSpecies('all');
    setSelectedSeverity('all');
    setSearchQuery('');
  };

  return (
    <FilterContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        selectedProvince,
        setSelectedProvince,
        selectedDistrict,
        setSelectedDistrict,
        selectedSubDistrict,
        setSelectedSubDistrict,
        selectedVillage,
        setSelectedVillage,
        selectedSpecies,
        setSelectedSpecies,
        selectedSeverity,
        setSelectedSeverity,
        searchQuery,
        setSearchQuery,
        availableSubDistricts,
        availableVillages,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
