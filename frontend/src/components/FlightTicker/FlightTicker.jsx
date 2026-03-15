import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './FlightTicker.module.css'

const FLIGHT_EVENTS = [
  { type: 'FLIGHT', text: "✈️ Vuelo SN-102 despegando de Santiago hacia Mendoza" },
  { type: 'WEATHER', text: "☀️ Miami: Cielo despejado, 28°C. Ideal para tu llegada." },
  { type: 'BOOKING', text: "🔥 ¡Nuevo! Alguien acaba de reservar un paquete a Punta Cana." },
  { type: 'GATE', text: "📢 Vuelo SN-330: Cambio de puerta a B12. Embarque en 15 min." },
  { type: 'DEAL', text: "✨ Oferta Relámpago: -40% en vuelos a Madrid solo por la próxima hora." },
  { type: 'FLIGHT', text: "✅ Vuelo AM-405 aterrizado exitosamente en São Paulo" },
  { type: 'WEATHER', text: "🌧️ Bogotá: Lluvia moderada. Vuelos SN operando con normalidad." },
  { type: 'BOOKING', text: "💎 Reserva confirmada para Hotel SkyLuxury en París." },
  { type: 'SYSTEM', text: "🌟 SkyNova: Ahora aceptamos pagos con criptomonedas y puntos SN." }
]

export default function FlightTicker() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % FLIGHT_EVENTS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.tickerContainer}>
      <div className={styles.label}>LIVE UPDATES</div>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className={`${styles.message} ${styles[FLIGHT_EVENTS[index].type.toLowerCase()]}`}
          >
            {FLIGHT_EVENTS[index].text}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
