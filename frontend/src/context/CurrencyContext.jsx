import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

// Tasas de respaldo por si falla la API
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  CLP: 940,
}

const SYMBOLS = {
  USD: '$',
  EUR: '€',
  CLP: '$',
}

const LABELS = {
  USD: 'USD — Dólar',
  EUR: 'EUR — Euro',
  CLP: 'CLP — Peso chileno',
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD')
  const [rates, setRates]       = useState(FALLBACK_RATES)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // API gratuita — no requiere key para conversiones básicas
        const res  = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const data = await res.json()
        setRates({
          USD: 1,
          EUR: data.rates.EUR,
          CLP: data.rates.CLP,
        })
      } catch (err) {
        console.warn('No se pudo obtener tipo de cambio, usando valores de respaldo.', err)
        setRates(FALLBACK_RATES)
      } finally {
        setLoading(false)
      }
    }
    fetchRates()
  }, [])

  // Convierte un monto desde USD a la moneda activa
  const convert = (amountUSD) => {
    const converted = amountUSD * rates[currency]
    if (currency === 'CLP') return Math.round(converted).toLocaleString('es-CL')
    return converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const symbol = SYMBOLS[currency]

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, symbol, loading, LABELS }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  return useContext(CurrencyContext)
}
