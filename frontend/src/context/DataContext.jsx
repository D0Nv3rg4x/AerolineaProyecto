import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const DataContext = createContext()

export const DataProvider = ({ children }) => {
  const [vuelos, setVuelos] = useState([])
  const [aerolineas, setAerolineas] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vuelosRes, aerolineasRes] = await Promise.all([
          fetch('/api/vuelos'),
          fetch('/api/aerolineas')
        ])

        if (!vuelosRes.ok || !aerolineasRes.ok) {
          throw new Error('Error al cargar datos desde la API')
        }

        const vuelosData = await vuelosRes.json()
        const aerolineasData = await aerolineasRes.json()

        setVuelos(vuelosData)
        setAerolineas(aerolineasData)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const fetchFilteredVuelos = useCallback(async (params) => {
    setLoading(true)
    try {
      const query = new URLSearchParams(params).toString()
      const res = await fetch(`/api/vuelos?${query}`)
      if (!res.ok) throw new Error('Error en búsqueda filtrada')
      const data = await res.json()
      return data
    } catch (error) {
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <DataContext.Provider value={{ vuelos, aerolineas, loading, fetchFilteredVuelos }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData debe usarse dentro de un DataProvider')
  }
  return context
}
