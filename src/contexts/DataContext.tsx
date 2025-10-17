import React, { createContext, useContext, useState, ReactNode } from 'react'
import { GPXData } from '../utils/gpxParser'

interface DataContextType {
  parsedData: GPXData[]
  setParsedData: (data: GPXData[]) => void
  addParsedData: (data: GPXData[]) => void
  clearData: () => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useDataContext = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider')
  }
  return context
}

interface DataProviderProps {
  children: ReactNode
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [parsedData, setParsedData] = useState<GPXData[]>([])

  const addParsedData = (newData: GPXData[]) => {
    setParsedData(prevData => [...prevData, ...newData])
  }

  const clearData = () => {
    setParsedData([])
  }

  const value: DataContextType = {
    parsedData,
    setParsedData,
    addParsedData,
    clearData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
