import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import aerolineas from '../../data/aerolineas.json'
import styles from './FlightCard.module.css'

// Badge de aerolínea con color de marca
function AirlineBadge({ nombre }) {
  const info = aerolineas[nombre] || { color: '#1a56db', textColor: '#fff', initials: nombre.slice(0, 2).toUpperCase() }
  return (
    <span className={styles.airlineBadge} style={{ background: info.color, color: info.textColor }}>
      {info.initials}
    </span>
  )
}

export default function FlightCard({ vuelo, index, paxData, isBestValue, isFastest }) {
  const navigate = useNavigate()
  const { convert, symbol, currency } = useCurrency()

  const adultos = paxData?.adultos ?? 1
  const ninos = paxData?.ninos ?? 0
  const infantes = paxData?.infantes ?? 0
  const totalPax = adultos + ninos + infantes

  const isEco = vuelo.avion.includes('A350') || vuelo.avion.includes('787')

  // Precio total según pasajeros
  const precioTotal = vuelo.precio * (adultos + ninos * 0.75 + infantes * 0.1)

  const handleSelect = () => {
    navigate('/asientos', { state: { vuelo, paxData: paxData ?? { adultos: 1, ninos: 0, infantes: 0, totalPax: 1 } } })
  }

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onClick={handleSelect}
    >
      {/* SMART BADGES */}
      <div className={styles.badgesContainer}>
        {isBestValue && <span className={`${styles.smartBadge} ${styles.bestValue}`}>Mejor Valor</span>}
        {isFastest && <span className={`${styles.smartBadge} ${styles.fastest}`}>Más Rápido</span>}
        {isEco && <span className={`${styles.smartBadge} ${styles.eco}`}>Eco-Nova</span>}
      </div>
      {/* ORIGEN */}
      <div className={styles.routeBlock}>
        <div className={styles.time}>{vuelo.salida}</div>
        <div className={styles.airportCode}>{vuelo.codigoOrigen}</div>
        <div className={styles.cityName}>{vuelo.origen}</div>
      </div>

      {/* LÍNEA CENTRAL */}
      <div className={styles.routeLine}>
        <div className={styles.duration}>{vuelo.duracion}</div>
        <div className={styles.lineTrack}>
          <div className={styles.lineDot} />
          <div className={styles.lineFill}>
            <span className={styles.planeIcon} style={{ left: '10%' }}>✈</span>
          </div>
          <div className={styles.lineDot} />
        </div>
        <span className={`${styles.stops} ${vuelo.escalas === 0 ? styles.stopsDirecto : styles.stopsEscala}`}>
          {vuelo.escalas === 0 ? 'Directo' : `${vuelo.escalas} escala`}
        </span>
      </div>

      {/* DESTINO */}
      <div className={styles.routeBlock}>
        <div className={styles.time}>{vuelo.llegada}</div>
        <div className={styles.airportCode}>{vuelo.codigoDestino}</div>
        <div className={styles.cityName}>{vuelo.destino}</div>
      </div>

      {/* INFO VUELO */}
      <div className={styles.flightInfo}>
        <div className={styles.flightNumRow}>
          <AirlineBadge nombre={vuelo.aerolinea} />
          <div className={styles.flightNum}>{vuelo.id}</div>
        </div>
        <div className={styles.airlineName}>{vuelo.aerolinea}</div>
        <div className={styles.airplane}>✈ {vuelo.avion}</div>
        <span className={styles.classBadge}>{vuelo.clase}</span>
      </div>

      {/* PRECIO */}
      <div className={styles.priceBlock}>
        <div className={styles.priceFrom}>
          {totalPax > 1 ? `${totalPax} pasajeros` : 'precio por persona'}
        </div>
        <div className={styles.price}>
          {symbol}{convert(precioTotal)}
          <span className={styles.priceCurrency}> {currency}</span>
        </div>
        {totalPax > 1 && (
          <div className={styles.pricePerPax}>
            {symbol}{convert(vuelo.precio)} {currency} / pax
          </div>
        )}
        <button className={styles.btnSelect} onClick={e => { e.stopPropagation(); handleSelect() }}>
          Seleccionar →
        </button>
      </div>
    </motion.div>
  )
}