import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { useCurrency } from '../../context/CurrencyContext'
import logoImg from '../../assets/logo.png'
import styles from './SkyAssistant.module.css'

export default function SkyAssistant() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { vuelos } = useData()
  const { convert, symbol, currency } = useCurrency()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { 
      type: 'bot', 
      text: user ? `¡Hola ${user.nombre}! Soy Nova, tu asistente de SkyNova. ¿En qué puedo ayudarte hoy?` : "¡Hola! Soy Nova, tu asistente virtual de SkyNova. ¿Cómo puedo hacer tu viaje más fácil hoy?",
      showChips: true 
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef(null)

  const defaultChips = [
    { label: '✈️ Vuelo más barato', query: 'vuelo mas barato' },
    { label: '🔥 Ofertas de hoy', query: 'ofertas' },
    { label: '🏨 Mejores hoteles', query: 'mejores hoteles' },
    { label: '🌎 Destinos top', query: 'destinos' }
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const findCheapestFlight = () => {
    if (!vuelos?.length) return null
    return [...vuelos].sort((a, b) => a.precio - b.precio)[0]
  }

  const findFlightsByCity = (city, isTargetingDestination = false) => {
    if (!vuelos?.length) return null
    if (isTargetingDestination) {
      const results = vuelos.filter(v => 
        v.destino.toLowerCase().includes(city.toLowerCase()) || 
        v.codigoDestino.toLowerCase() === city.toLowerCase()
      ).sort((a, b) => a.precio - b.precio)
      if (results.length > 0) return results[0]
    }
    
    return vuelos.filter(v => 
      v.destino.toLowerCase().includes(city.toLowerCase()) || 
      v.origen.toLowerCase().includes(city.toLowerCase())
    ).sort((a, b) => a.precio - b.precio)[0]
  }

  const processResponse = (userInput) => {
    const text = userInput.toLowerCase()
    
    // 1. DYNAMIC CITY MATCHING
    const citiesInVuelos = [...new Set(vuelos.map(v => v.destino.toLowerCase()))]
    const matchedCity = citiesInVuelos.find(city => text.includes(city))

    if (matchedCity && (text.includes("vuelo") || text.includes("viajar") || text.includes("ir a"))) {
      const isTo = text.includes(" a ") || text.includes(" hacia ") || text.includes(" para ")
      const flight = findFlightsByCity(matchedCity, isTo)
      if (flight) {
        return {
          text: `¡Claro! He encontrado vuelos hacia ${flight.destino} para el ${flight.fecha}. La mejor tarifa ahora mismo es de ${symbol}${convert(flight.precio)} ${currency}.`,
          card: {
            type: 'flight',
            title: `${flight.origen} → ${flight.destino}`,
            desc: `${flight.aerolinea} · ${flight.id}`,
            price: `${symbol}${convert(flight.precio)}`,
            tag: 'RECOMENDADO',
            link: `/vuelos?origen=${flight.origen}&destino=${flight.destino}&fecha=${flight.fecha}&vueloId=${flight.id}`
          }
        }
      }
    }

    // 2. CHEAPEST FLIGHT
    if (text.includes("barato") || text.includes("económico")) {
      const flight = findCheapestFlight()
      if (flight) {
        return {
          text: `¡He encontrado una ganga para ti! El vuelo más económico ahora mismo es de ${flight.origen} a ${flight.destino} por solo ${symbol}${convert(flight.precio)} ${currency}.`,
          card: {
            type: 'flight',
            title: `${flight.origen} → ${flight.destino}`,
            desc: `${flight.aerolinea} · ${flight.id}`,
            price: `${symbol}${convert(flight.precio)}`,
            tag: 'MEJOR PRECIO',
            link: `/vuelos?origen=${flight.origen}&destino=${flight.destino}&vueloId=${flight.id}`
          }
        }
      }
    }

    // 3. OFFERS
    if (text.includes("oferta") || text.includes("promo") || text.includes("descuento")) {
      return {
        text: "¡Tenemos 'Hot Deals' activos! Actualmente hay descuentos de hasta el 40% en rutas seleccionadas. ¿Quieres ver nuestras mini-ofertas?",
        card: {
          type: 'promo',
          title: 'Hot Deals 2026',
          desc: 'Descuentos exclusivos en vuelos internacionales.',
          price: '-40%',
          tag: 'OFERTA',
          link: '/ofertas'
        }
      }
    }

    // 4. HOTELS
    if (text.includes("hotel") || text.includes("alojamiento")) {
      return {
        text: "Contamos con alianzas en las principales ciudades. ¿En qué destino buscas hospedarte?",
        customChips: [
          { label: '🏨 Hoteles en Santiago', query: 'hoteles Santiago' },
          { label: '🏨 Hoteles en Lima', query: 'hoteles Lima' }
        ]
      }
    }

    if (text.includes("hoteles santiago")) {
       return {
         text: "En Santiago tenemos opciones de lujo cerca de Costanera Center y en el centro histórico.",
         card: {
           type: 'hotel',
           title: 'Grand Hyatt Santiago',
           desc: 'Lujo y confort en el corazón de la ciudad.',
           price: 'Desde $120',
           tag: 'RECOMENDADO',
           link: '/alojamientos'
         }
       }
    }

    // 5. DESTINATIONS
    if (text.includes("destino") || text.includes("donde") || text.includes("dónde")) {
      return {
        text: "Nuestros destinos más buscados hoy son Madrid, Miami, Buenos Aires y Cancún. ¿Te interesa alguno?",
        customChips: [
          { label: '✈️ Vuelo a Madrid', query: 'vuelo a madrid' },
          { label: '✈️ Vuelo a Miami', query: 'vuelo a miami' },
          { label: '✈️ Vuelo a Cancún', query: 'vuelo a cancun' }
        ]
      }
    }

    if (text.includes("hola") || text.includes("buenos días")) {
      return { 
        text: user ? `¡Hola de nuevo, ${user.nombre}! ¿Lista para planear tu viaje?` : "¡Hola! Soy Nova. ¿En qué puedo ayudarte?",
        showChips: true
      }
    }

    if (text.includes("gracias")) return { text: "¡Un placer! Estaré aquí si necesitas algo más. ✈️" }

    return { 
      text: "No estoy segura de entender eso, pero puedo ayudarte a buscar vuelos económicos, sugerir destinos o encontrarte un hotel de lujo.",
      showChips: true
    }
  }

  const handleSend = (e, manualQuery) => {
    if (e) e.preventDefault()
    const query = manualQuery || inputValue
    if (!query.trim()) return

    setMessages(prev => [...prev, { type: 'user', text: query }])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      const result = processResponse(query)
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: result.text, 
        card: result.card,
        showChips: result.showChips,
        customChips: result.customChips
      }])
    }, 1000)
  }

  const handleCardClick = (link) => {
    setIsOpen(false)
    if (link) navigate(link)
  }

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.chatWindow}
            initial={{ opacity: 0, scale: 0.8, y: 30, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.chatHeader}>
              <div className={styles.botIcon}>
                <img src={logoImg} alt="Nova AI" />
              </div>
              <div>
                <div className={styles.botName}>Nova AI</div>
                <div className={styles.botStatus}>Asistente Premium</div>
              </div>
              <button className={styles.btnClose} onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className={styles.chatBody} ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8 }}>
                  <motion.div 
                    className={`${styles.message} ${styles[msg.type]}`}
                    initial={{ opacity: 0, x: msg.type === 'bot' ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {msg.text}
                  </motion.div>
                  
                  {msg.card && (
                    <motion.div 
                      className={styles.miniCard}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTag}>{msg.card.tag}</span>
                        <span className={styles.cardPrice}>{msg.card.price}</span>
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.cardTitle}>{msg.card.title}</div>
                        <div className={styles.cardDesc}>{msg.card.desc}</div>
                      </div>
                      <button className={styles.cardBtn} onClick={() => handleCardClick(msg.card.link)}>Saber más</button>
                    </motion.div>
                  )}

                  {(msg.showChips || msg.customChips) && (
                    <div className={styles.chipsContainer}>
                      {(msg.customChips || defaultChips).map((chip, idx) => (
                        <button 
                          key={idx} 
                          className={styles.chip}
                          onClick={() => handleSend(null, chip.query)}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.message} ${styles.bot} ${styles.typing}`}>
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>

            <form className={styles.chatFooter} onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Escribe tu mensaje..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className={styles.floatButton}
        whileHover={{ scale: 1.05, boxShadow: '0 15px 35px rgba(37, 99, 235, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.logo}>
          <img src={logoImg} alt="SkyNova Logo" />
        </div>
        {!isOpen && <div className={styles.pulse} />}
        {!isOpen && <div className={styles.badge}>Nova</div>}
      </motion.button>
    </div>
  )
}
