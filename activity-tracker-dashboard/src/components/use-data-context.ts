import { createContext, useContext } from "react";


export type DataContextType = {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
};

export const DataContext = createContext<DataContextType | null>(null);

export const useDataContext = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useDataContext must be used within a DataContextProvider');
  }
  return ctx;
};