import { useState } from "react"
import { DataContext } from "./use-data-context"


export const DataContextProvider  = (
  {
    children
  }:
    {
      children: React.ReactNode
    }
) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <DataContext.Provider value={{
      selectedDate, 
      setSelectedDate
    }}>
      {children}
    </DataContext.Provider>
  )
}

