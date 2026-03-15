import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { useData } from '../../context/DataContext'
import PassengerSelector from '../../components/PassengerSelector/PassengerSelector.jsx'
import styles from './Accommodations.module.css'

// Componente acordeón (reutilizado de Flights)
function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={styles.filterGroup}>
      <button className={styles.filterGroupBtn} onClick={() => setOpen(o => !o)}>
        <span className={styles.filterLabel}>{title}</span>
        <span className={styles.filterChevron}>{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.filterOptions}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Accommodations() {
  const navigate = useNavigate()
  const [alojamientos, setAlojamientos] = useState([])
  const [loading, setLoading] = useState(true)
  const { convert, symbol, currency } = useCurrency()
  const { vuelos: todosLosVuelos } = useData()

  // ── ESTADOS DE BÚSQUEDA Y FILTROS ──
  const [search, setSearch] = useState({
    origen: 'Santiago (SCL)',
    destino: '',
    entrada: '',
    salida: '',
    pax: { adultos: 2, ninos: 0, infantes: 0, totalPax: 2 }
  })

  const [filters, setFilters] = useState({
    estrellas: [],
    tipo: [],
    precioMax: 1000
  })

  // Derivar Orígenes únicos de vuelos
  const ORIGENES = useMemo(() => {
    if (!todosLosVuelos) return []
    return [...new Set(todosLosVuelos.map(v => `${v.origen} (${v.codigoOrigen})`))].sort()
  }, [todosLosVuelos])

  // Derivar Destinos únicos de Alojamientos
  const DESTINOS = useMemo(() => {
    return [...new Set(alojamientos.map(a => `${a.ciudad}, ${a.pais}`))].sort()
  }, [alojamientos])

  const limitPrecio = useMemo(() => {
    const prices = alojamientos.map(a => a.precioPorNoche)
    return prices.length > 0 ? Math.max(...prices) : 1000
  }, [alojamientos])

  useEffect(() => {
    fetch('http://localhost:3001/api/alojamientos')
      .then(res => res.json())
      .then(data => {
        setAlojamientos(data)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }, [])

  const filteredItems = useMemo(() => {
    return alojamientos.filter(a => {
      const aDestinoComp = `${a.ciudad}, ${a.pais}`
      const matchesDestino = !search.destino || aDestinoComp.toLowerCase().includes(search.destino.toLowerCase())
      const matchesEstrellas = filters.estrellas.length === 0 || filters.estrellas.includes(a.estrellas)
      const matchesTipo = filters.tipo.length === 0 || filters.tipo.includes(a.tipo)
      const matchesPrecio = a.precioPorNoche <= filters.precioMax
      return matchesDestino && matchesEstrellas && matchesTipo && matchesPrecio
    })
  }, [alojamientos, search.destino, filters])

  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) 
        ? prev[key].filter(v => v !== value) 
        : [...prev[key], value]
    }))
  }


  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => window.location.href='/'}>Inicio</a> › <span>Alojamientos</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.title}
          >
            Encuentra tu próximo refugio
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styles.subtitle}
          >
            Hoteles, apartamentos y resorts con el sello de calidad SkyNova.
          </motion.p>
          
          <motion.div 
            className={styles.miniSearch}
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Origen</span>
              <select 
                className={styles.miniSelect} 
                value={search.origen} 
                onChange={e => setSearch({...search, origen: e.target.value})}
              >
                {ORIGENES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className={styles.miniSwap} onClick={() => {
              const oldOrg = search.origen;
              const oldDest = search.destino;
              // Intercambiar solo si el destino es un origen válido
              const destEsOrigen = ORIGENES.some(o => o.includes(oldDest.split(',')[0].trim()))
              if (destEsOrigen) {
                setSearch({
                  ...search,
                  origen: ORIGENES.find(o => o.includes(oldDest.split(',')[0].trim())),
                  destino: DESTINOS.find(d => d.includes(oldOrg.split(' (')[0])) || ''
                })
              }
            }}>⇆</div>

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Destino</span>
              <select 
                className={styles.miniSelect} 
                value={search.destino} 
                onChange={e => setSearch({...search, destino: e.target.value})}
              >
                <option value="">Cualquier destino</option>
                {DESTINOS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className={styles.miniDivider} />

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Entrada</span>
              <input type="date" className={styles.miniDate} value={search.entrada} onChange={(e) => setSearch({...search, entrada: e.target.value})} />
            </div>

            <div className={styles.miniDivider} />

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Pasajeros</span>
              <PassengerSelector 
                initialData={search.pax} 
                onChange={(p) => setSearch({...search, pax: p})} 
                variant="mini" 
              />
            </div>
          </motion.div>
        </div>
      </header>

      <div className={styles.body}>
        <motion.aside 
          className={styles.sidebar}
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.sidebarTitle}>Filtros</div>
          <FilterSection title="Estrellas">
            {[5, 4, 3, 2].map(star => (
              <label key={star} className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={filters.estrellas.includes(star)}
                  onChange={() => toggleFilter('estrellas', star)}
                />
                <span className={styles.stars}>{'★'.repeat(star)}{'☆'.repeat(5-star)}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Tipo de alojamiento">
            {["Hotel", "Apartamento", "Resort", "Hostal"].map(t => (
              <label key={t} className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={filters.tipo.includes(t)}
                  onChange={() => toggleFilter('tipo', t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Presupuesto por noche">
            <div className={styles.priceSliderContainer}>
              <div className={styles.priceValues}>
                <span>$0</span>
                <span className={styles.priceCurrent}>{symbol}{convert(filters.precioMax)}</span>
              </div>
              <input 
                type="range" 
                className={styles.priceSlider}
                min="0" max={limitPrecio} 
                step="50"
                value={filters.precioMax}
                onChange={(e) => setFilters({...filters, precioMax: parseInt(e.target.value)})}
              />
            </div>
          </FilterSection>
        </motion.aside>

        <section className={styles.results}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              <strong>{filteredItems.length}</strong> alojamientos encontrados
            </p>
          </div>

          <div className={styles.grid}>
              {filteredItems.map((a, idx) => (
                <motion.div 
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  className={styles.card}
                >
                  <div className={styles.cardImage}>
                    <img src={a.imagen} alt={a.nombre} />
                    <div className={styles.cardBadge}>{a.tipo}</div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardLocation}>{a.ciudad}, {a.pais}</span>
                      <div className={styles.cardStars}>{'★'.repeat(a.estrellas)}</div>
                    </div>
                    <h3 className={styles.cardName}>{a.nombre}</h3>
                    <div className={styles.cardServicios}>
                      {a.servicios.slice(0, 3).map(s => (
                        <span key={s} className={styles.servicioTag}>{s}</span>
                      ))}
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.priceInfo}>
                        <span className={styles.priceVal}>{symbol}{convert(a.precioPorNoche)}</span>
                        <span className={styles.priceLabel}>/ noche</span>
                      </div>
                      <button 
                        className={styles.btnBook}
                        onClick={() => {
                          const nights = search.entrada && search.salida 
                            ? Math.ceil((new Date(search.salida) - new Date(search.entrada)) / (1000 * 60 * 60 * 24)) 
                            : 1;
                          navigate('/pago', {
                            state: {
                              producto: a,
                              tipo: 'alojamiento',
                              paxData: search.pax,
                              extraData: {
                                entrada: search.entrada,
                                salida: search.salida,
                                noches: nights > 0 ? nights : 1
                              }
                            }
                          })
                        }}
                      >
                        Reservar ahora
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
