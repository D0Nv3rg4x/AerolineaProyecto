import { useState, useMemo, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FlightCard from '../../components/FlightCard/FlightCard.jsx'
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard.jsx'
import PassengerSelector from '../../components/PassengerSelector/PassengerSelector.jsx'
import { useData } from '../../context/DataContext'
import styles from './Flights.module.css'

// Auxiliares se usarán dentro del componente para tener acceso a los datos

// Componente acordeón para cada grupo de filtros
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

export default function Flights() {
  const { state, search } = useLocation()
  const queryParams = useMemo(() => new URLSearchParams(search), [search])
  const navigate = useNavigate()
  const { vuelos: todosLosVuelos, aerolineas, fetchFilteredVuelos, loading: initialLoading } = useData()
  const [loading, setLoading] = useState(false)
  const [vuelosApi, setVuelosApi] = useState([])

  const ORIGENES = useMemo(() => {
    if (!todosLosVuelos) return []
    return [...new Set(todosLosVuelos.map(v => `${v.origen} (${v.codigoOrigen})`))].sort()
  }, [todosLosVuelos])

  const getDestinosPara = (org) => {
    if (!todosLosVuelos) return []
    const orgNombre = org.split(' (')[0]
    const destinos = todosLosVuelos
      .filter(v => v.origen === orgNombre)
      .map(v => `${v.destino} (${v.codigoDestino})`)
    return [...new Set(destinos)].sort()
  }

  const initialOrigen = queryParams.get('origen') 
    ? ORIGENES.find(o => o.startsWith(queryParams.get('origen'))) || state?.origen
    : state?.origen

  const [origen, setOrigen] = useState(initialOrigen || (ORIGENES.length > 0 ? ORIGENES[0] : ''))

  const highlightVueloId = queryParams.get('vueloId')

  useEffect(() => {
    if (!origen && ORIGENES.length > 0) {
      setOrigen(initialOrigen || ORIGENES[0])
    }
  }, [ORIGENES, origen, initialOrigen])

  const destinosDisponibles = useMemo(() => {
    return getDestinosPara(origen)
  }, [origen, todosLosVuelos])

  const initialDestino = queryParams.get('destino')
    ? destinosDisponibles.find(d => d.startsWith(queryParams.get('destino'))) || state?.destino
    : state?.destino

  const [destino, setDestino] = useState(initialDestino || '')

  useEffect(() => {
    if (destinosDisponibles.length > 0) {
      if (!destino || !destinosDisponibles.includes(destino)) {
        setDestino(initialDestino || destinosDisponibles[0])
      }
    }
  }, [destinosDisponibles, origen, initialDestino])

  const initialFecha = queryParams.get('fecha') || state?.fecha || new Date().toISOString().split('T')[0]
  const [fecha, setFecha] = useState(initialFecha)
  useEffect(() => {
    if (queryParams.get('origen')) {
      const found = ORIGENES.find(o => o.startsWith(queryParams.get('origen')))
      if (found) setOrigen(found)
    }
    if (queryParams.get('destino')) {
      const found = destinosDisponibles.find(d => d.startsWith(queryParams.get('destino')))
      if (found) setDestino(found)
    }
    if (queryParams.get('fecha')) setFecha(queryParams.get('fecha'))
  }, [search, ORIGENES, destinosDisponibles])

  const [fechaVuelta, setFechaVuelta] = useState(state?.fechaVuelta || '')
  const [paxData, setPaxData] = useState(state?.paxData || { adultos: 1, ninos: 0, infantes: 0, totalPax: 1 })
  const [activeTab, setActiveTab] = useState(state?.activeTab || 'ida')

  // Filtros Avanzados
  const [maxPrecio, setMaxPrecio] = useState(2500)
  const limitPrecio = useMemo(() => {
    const prices = todosLosVuelos
      .filter(v => v.origen.includes(origen.split('(')[0].trim()) && v.destino.includes(destino.split('(')[0].trim()))
      .map(v => v.precio)
    return prices.length > 0 ? Math.max(...prices) : 2500
  }, [origen, destino])

  useEffect(() => {
    setMaxPrecio(limitPrecio)
  }, [limitPrecio])

  // Filtros
  const [ordenar, setOrdenar] = useState('precio')
  const [soloDirecto, setSoloDirecto] = useState(false)
  const [soloEscala, setSoloEscala] = useState(false)
  const [aerolineasSel, setAerolineasSel] = useState([])

  const nombreOrigen = origen.split('(')[0].trim()
  const nombreDestino = destino.split('(')[0].trim()

  const vuelos = useMemo(() => {
    let lista = [...vuelosApi]

    if (soloDirecto) lista = lista.filter(v => v.escalas === 0)
    if (soloEscala) lista = lista.filter(v => v.escalas > 0)
    if (aerolineasSel.length) lista = lista.filter(v => aerolineasSel.includes(v.aerolinea))

    // Filtro de precio máximo
    lista = lista.filter(v => v.precio <= maxPrecio)

    if (ordenar === 'precio') lista = [...lista].sort((a, b) => a.precio - b.precio)
    if (ordenar === 'duracion') lista = [...lista].sort((a, b) => a.duracionMin - b.duracionMin)
    if (ordenar === 'salida') lista = [...lista].sort((a, b) => a.salida.localeCompare(b.salida))

    return lista
  }, [vuelosApi, ordenar, soloDirecto, soloEscala, aerolineasSel, maxPrecio])

  // Buscar vuelos del servidor cuando cambian origen/destino/fecha
  useEffect(() => {
    const search = async () => {
      setLoading(true)
      const results = await fetchFilteredVuelos({ origen: nombreOrigen, destino: nombreDestino, fecha })
      setVuelosApi(results)
      setLoading(false)
    }
    if (nombreOrigen && nombreDestino && fecha) {
      search()
    }
  }, [nombreOrigen, nombreDestino, fecha, fetchFilteredVuelos])

  // Lógica de Smart Labels (Mejor valor y Más rápido)
  const bestValueId = useMemo(() => {
    if (vuelos.length === 0) return null
    return [...vuelos].sort((a, b) => (a.precio * a.duracionMin) - (b.precio * b.duracionMin))[0].id
  }, [vuelos])

  const fastestId = useMemo(() => {
    if (vuelos.length === 0) return null
    return [...vuelos].sort((a, b) => a.duracionMin - b.duracionMin)[0].id
  }, [vuelos])

  // Días para el Date Strip
  const dateStrip = useMemo(() => {
    const baseDate = new Date(fecha + 'T12:00:00')
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate)
      d.setDate(baseDate.getDate() + i - 3)
      const dateStr = d.toISOString().split('T')[0]
      // Simular un precio mínimo para ese día si no hay datos reales
      const dayFlights = todosLosVuelos.filter(v => v.origen.includes(nombreOrigen) && v.destino.includes(nombreDestino) && v.fecha === dateStr)
      const minPrice = dayFlights.length > 0 ? Math.min(...dayFlights.map(v => v.precio)) : Math.floor(Math.random() * 200 + 300)
      return {
        date: dateStr,
        label: d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric' }),
        price: minPrice,
        isToday: dateStr === fecha
      }
    })
  }, [fecha, nombreOrigen, nombreDestino])

  // Aerolíneas disponibles para la ruta buscada
  const availableAirlines = useMemo(() => {
    const base = todosLosVuelos.filter(v =>
      v.origen.toLowerCase().includes(nombreOrigen.toLowerCase()) &&
      v.destino.toLowerCase().includes(nombreDestino.toLowerCase())
    )
    return [...new Set(base.map(v => v.aerolinea))]
  }, [nombreOrigen, nombreDestino])

  const toggleAerolinea = (nombre) => {
    setAerolineasSel(prev =>
      prev.includes(nombre) ? prev.filter(a => a !== nombre) : [...prev, nombre]
    )
  }

  const pasajerosString = useMemo(() => {
    const parts = []
    if (paxData.adultos) parts.push(`${paxData.adultos} adulto${paxData.adultos > 1 ? 's' : ''}`)
    if (paxData.ninos) parts.push(`${paxData.ninos} niño${paxData.ninos > 1 ? 's' : ''}`)
    if (paxData.infantes) parts.push(`${paxData.infantes} infante${paxData.infantes > 1 ? 's' : ''}`)
    return parts.join(', ') || '1 adulto'
  }, [paxData])

  const fechaFormateada = fecha
    ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    : ''

  if (initialLoading || (!origen && !vuelosApi.length)) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}>Inicializando sistema...</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a>
            <span>›</span>
            <span>Resultados de búsqueda</span>
          </div>

          <motion.h1 className={styles.routeTitle}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {origen.split('(')[0].trim()} → {nombreDestino}
          </motion.h1>
          <p className={styles.routeSub}>{fechaFormateada} · {paxData.totalPax} pasajero{paxData.totalPax !== 1 ? 's' : ''}</p>

          {/* Formulario de búsqueda interactivo premium */}
          <motion.div className={styles.miniSearch}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Origen</span>
              <select className={styles.miniSelect} value={origen} onChange={e => setOrigen(e.target.value)}>
                {ORIGENES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div className={styles.miniSwap} onClick={() => {
              const oldOrg = origen;
              const oldDest = destino;
              if (ORIGENES.includes(oldDest)) {
                setOrigen(oldDest);
                setDestino(oldOrg);
              }
            }}>⇆</div>

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Destino</span>
              <select className={styles.miniSelect} value={destino} onChange={e => setDestino(e.target.value)}>
                {destinosDisponibles.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className={styles.miniDivider} />

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Fecha ida</span>
              <input type="date" className={styles.miniDate} value={fecha}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setFecha(e.target.value)} />
            </div>

            {(fechaVuelta || activeTab === 'vuelta') && <>
              <div className={styles.miniDivider} />
              <div className={styles.miniField}>
                <span className={styles.miniLabel}>Fecha vuelta</span>
                <input type="date" className={styles.miniDate} value={fechaVuelta}
                  min={fecha || new Date().toISOString().split('T')[0]}
                  onChange={e => setFechaVuelta(e.target.value)} />
              </div>
            </>}

            <div className={styles.miniDivider} />

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Pasajeros</span>
              <PassengerSelector initialData={paxData} onChange={setPaxData} variant="mini" />
            </div>

          </motion.div>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.body}>

        {/* SIDEBAR FILTROS ACORDEÓN */}
        <motion.aside className={styles.sidebar}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <div className={styles.sidebarTitle}>Filtros</div>

          <FilterSection title="Ordenar por">
            {[
              { val: 'precio', label: 'Precio (menor a mayor)' },
              { val: 'duracion', label: 'Duración del vuelo' },
              { val: 'salida', label: 'Hora de salida' },
            ].map(op => (
              <label key={op.val} className={styles.filterOption}>
                <input type="checkbox" checked={ordenar === op.val}
                  onChange={() => setOrdenar(op.val)} />
                {op.label}
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Escalas">
            <label className={styles.filterOption}>
              <input type="checkbox" checked={soloDirecto}
                onChange={e => { setSoloDirecto(e.target.checked); if (e.target.checked) setSoloEscala(false) }} />
              Solo vuelos directos
            </label>
            <label className={styles.filterOption}>
              <input type="checkbox" checked={soloEscala}
                onChange={e => { setSoloEscala(e.target.checked); if (e.target.checked) setSoloDirecto(false) }} />
              Solo con escalas
            </label>
          </FilterSection>

          <FilterSection title="Presupuesto máximo">
            <div className={styles.priceSliderContainer}>
              <div className={styles.priceValues}>
                <span>$0</span>
                <span className={styles.priceCurrent}>${maxPrecio}</span>
              </div>
              <input
                type="range"
                className={styles.priceSlider}
                min="0"
                max={limitPrecio}
                step="10"
                value={maxPrecio}
                onChange={e => setMaxPrecio(Number(e.target.value))}
              />
            </div>
          </FilterSection>

          {availableAirlines.length > 1 && (
            <FilterSection title="Aerolínea">
              {availableAirlines.map(nombre => {
                const info = aerolineas[nombre] || { color: '#1a56db', textColor: '#fff', initials: nombre.slice(0, 2).toUpperCase() }
                return (
                  <label key={nombre} className={styles.filterOption}>
                    <input type="checkbox"
                      checked={aerolineasSel.includes(nombre)}
                      onChange={() => toggleAerolinea(nombre)} />
                    <span className={styles.airlineFilterBadge}
                      style={{ background: info.color, color: info.textColor }}>
                      {info.initials}
                    </span>
                    {nombre}
                  </label>
                )
              })}
            </FilterSection>
          )}

        </motion.aside>

        {/* LISTA DE VUELOS */}
        <div className={styles.results}>

          {/* DATE STRIP */}
          <div className={styles.dateStrip}>
            {dateStrip.map(day => (
              <div
                key={day.date}
                className={`${styles.dateItem} ${day.isToday ? styles.dateItemActive : ''}`}
                onClick={() => setFecha(day.date)}
              >
                <span className={styles.dateLabel}>{day.label}</span>
                <span className={styles.datePrice}>desde ${day.price}</span>
              </div>
            ))}
          </div>

          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              <strong>{vuelos.length}</strong> vuelo{vuelos.length !== 1 ? 's' : ''} encontrado{vuelos.length !== 1 ? 's' : ''}
            </p>
            <select className={styles.sortSelect} value={ordenar} onChange={e => setOrdenar(e.target.value)}>
              <option value="precio">Precio ↑</option>
              <option value="duracion">Duración ↑</option>
              <option value="salida">Hora de salida ↑</option>
            </select>
          </div>

          {loading ? (
            <div className={styles.skeletonList}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : vuelos.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>Vuelos</div>
              <div className={styles.emptyTitle}>No encontramos vuelos</div>
              <p className={styles.emptySub}>Prueba cambiando el destino o la fecha de viaje.</p>
            </div>
          ) : (
            vuelos.map((v, i) => (
              <FlightCard
                key={v.id}
                vuelo={v}
                index={i}
                paxData={paxData}
                isBestValue={v.id === bestValueId}
                isFastest={v.id === fastestId}
                isHighlighted={v.id === highlightVueloId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}