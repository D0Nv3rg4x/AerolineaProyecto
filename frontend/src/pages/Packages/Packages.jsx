import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { useData } from '../../context/DataContext'
import PassengerSelector from '../../components/PassengerSelector/PassengerSelector.jsx'
import styles from './Packages.module.css'


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

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07 }
  })
}

export default function Packages() {
  const navigate = useNavigate()
  const [paquetesApi, setPaquetesApi] = useState([])
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

  const [activeFilters, setActiveFilters] = useState({
    mes: 'Cualquier mes',
    estrellas: null,
    noches: null,
    maxPrecio: 3000
  })

  // Derivar Orígenes únicos
  const ORIGENES = useMemo(() => {
    if (!todosLosVuelos) return []
    return [...new Set(todosLosVuelos.map(v => `${v.origen} (${v.codigoOrigen})`))].sort()
  }, [todosLosVuelos])

  // Derivar Destinos únicos de los Paquetes
  const DESTINOS = useMemo(() => {
    return [...new Set(paquetesApi.map(p => `${p.destino}, ${p.pais}`))].sort()
  }, [paquetesApi])

  const limitPrecio = useMemo(() => {
    const prices = paquetesApi.map(p => p.price || p.precio)
    return prices.length > 0 ? Math.max(...prices) : 3000
  }, [paquetesApi])

  useEffect(() => {
    fetch('http://localhost:3001/api/paquetes')
      .then(res => res.json())
      .then(data => {
        setPaquetesApi(data)
        setLoading(false)
        const max = Math.max(...data.map(p => p.price || p.precio))
        setActiveFilters(prev => ({...prev, maxPrecio: max}))
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // ── LÓGICA DE FILTRADO REAL-TIME ──
  const filteredPaquetes = useMemo(() => {
    return paquetesApi.filter(p => {
      const pPrecio = p.price || p.precio
      if (search.destino && !`${p.destino}, ${p.pais}`.toLowerCase().includes(search.destino.toLowerCase())) return false
      if (activeFilters.estrellas && p.estrellas !== activeFilters.estrellas) return false
      if (pPrecio > activeFilters.maxPrecio) return false

      if (activeFilters.noches) {
        const numNoches = parseInt(p.duracion.split('/')[1]) || 0
        if (activeFilters.noches === '3-5' && (numNoches < 3 || numNoches > 5)) return false
        if (activeFilters.noches === '6+' && numNoches < 6) return false
      }
      return true
    })
  }, [paquetesApi, search.destino, activeFilters])

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}>Cargando experiencias inolvidables...</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a>
            <span>›</span>
            <span>Paquetes turísticos</span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className={styles.title}
          >
            Vuelo + Hotel
          </motion.h1>
          <p className={styles.subtitle}>Aquí están los paquetes más baratos para tu viaje</p>
          
          {/* ── MINI BUSCADOR (Mismo estilo que vuelos) ── */}
          <motion.div 
            className={styles.miniSearch}
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Origen</span>
              <select className={styles.miniSelect} value={search.origen} onChange={e => setSearch({...search, origen: e.target.value})}>
                {ORIGENES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className={styles.miniSwap}>⇆</div>

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Destino</span>
              <select className={styles.miniSelect} value={search.destino} onChange={e => setSearch({...search, destino: e.target.value})}>
                <option value="">Cualquier destino</option>
                {DESTINOS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className={styles.miniDivider} />

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Entrada</span>
              <input type="date" className={styles.miniDate} />
            </div>

            <div className={styles.miniDivider} />

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Pasajeros</span>
              <PassengerSelector initialData={search.pax} onChange={(p) => setSearch({...search, pax: p})} variant="mini" />
            </div>
          </motion.div>
        </div>
      </header>

      <div className={styles.body}>
        {/* ── SIDEBAR FILTROS (Mismo estilo que vuelos) ── */}
        <motion.aside className={styles.sidebar}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className={styles.sidebarTitle}>Filtros</div>

          <FilterSection title="Estrellas">
            {[5, 4, 3].map(s => (
              <label key={s} className={styles.filterOption}>
                <input type="checkbox" checked={activeFilters.estrellas === s}
                  onChange={() => setActiveFilters({...activeFilters, estrellas: activeFilters.estrellas === s ? null : s})} />
                {"★".repeat(s)} {s === 5 ? '(Lujo)' : ''}
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Duración">
            {[
              { val: '3-5', label: '3 a 5 noches' },
              { val: '6+', label: '6+ noches' },
            ].map(op => (
              <label key={op.val} className={styles.filterOption}>
                <input type="checkbox" checked={activeFilters.noches === op.val}
                  onChange={() => setActiveFilters({...activeFilters, noches: activeFilters.noches === op.val ? null : op.val})} />
                {op.label}
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Presupuesto máximo">
            <div className={styles.priceSliderContainer}>
              <div className={styles.priceValues}>
                <span>$0</span>
                <span className={styles.priceCurrent}>{symbol}{convert(activeFilters.maxPrecio)}</span>
              </div>
              <input
                type="range"
                className={styles.priceSlider}
                min="0"
                max={limitPrecio}
                step="50"
                value={activeFilters.maxPrecio}
                onChange={e => setActiveFilters({...activeFilters, maxPrecio: Number(e.target.value)})}
              />
            </div>
          </FilterSection>
        </motion.aside>

        <main className={styles.results}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              <strong>{filteredPaquetes.length}</strong> paquetes encontrados
            </p>
          </div>

          <div className={styles.grid}>
              {filteredPaquetes.map((p, i) => (
                <motion.div 
                  key={p.id}
                  className={styles.card}
                  variants={cardAnimation}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                >
                  <div className={styles.imageContainer}>
                    <img src={p.imagen} alt={p.destino} className={styles.image} />
                    {p.tag && <span className={`${styles.tag} ${styles[p.tag.toLowerCase()]}`}>{p.tag}</span>}
                    <div className={styles.overlay}>
                      <div className={styles.stars}>{"★".repeat(p.estrellas)}</div>
                      <div className={styles.duration}>{p.duracion}</div>
                    </div>
                  </div>
                  
                  <div className={styles.info}>
                    <h3 className={styles.packageName}>{p.nombre}</h3>
                    <div className={styles.location}>{p.destino}, {p.pais}</div>
                    <div className={styles.hotel}>🏢 {p.hotel}</div>
                    
                    <ul className={styles.includeList}>
                      {p.incluye.map((item, idx) => (
                        <li key={idx}>✓ {item}</li>
                      ))}
                    </ul>

                    <div className={styles.footer}>
                      <div className={styles.priceContainer}>
                        <span className={styles.from}>Desde</span>
                        <span className={styles.price}>{symbol}{convert(p.price || p.precio)} <small>{currency}</small></span>
                      </div>
                      <button 
                        className={styles.btnReserve}
                        onClick={() => {
                          // Buscar un vuelo que coincida con el destino del paquete para la selección de asientos
                          const flight = todosLosVuelos.find(v => v.destino === p.destino) || todosLosVuelos[0];
                          navigate('/asientos', {
                            state: {
                              vuelo: flight,
                              tipo: 'paquete',
                              producto: p,
                              paxData: search.pax,
                            }
                          })
                        }}
                      >
                        Reservar ahora →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </main>
      </div>
    </div>
  )
}
