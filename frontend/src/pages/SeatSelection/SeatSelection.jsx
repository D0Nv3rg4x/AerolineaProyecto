import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import styles from './SeatSelection.module.css'

// Configuración de clases por avión
const PLANE_CONFIG = {
  'Boeing 787-9': {
    primera:   { filas: [1,2],        precio: 320, label: 'Primera Clase'  },
    ejecutiva:  { filas: [3,4,5,6],   precio: 180, label: 'Ejecutiva'       },
    economica:  { filas: [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30], precio: 0, label: 'Económica' },
  },
  'Boeing 777-300': {
    primera:   { filas: [1,2],        precio: 400, label: 'Primera Clase'  },
    ejecutiva:  { filas: [3,4,5,6,7], precio: 220, label: 'Ejecutiva'       },
    economica:  { filas: Array.from({length:30}, (_,i) => i+8), precio: 0, label: 'Económica' },
  },
  'Airbus A350': {
    primera:   { filas: [1,2],       precio: 300, label: 'Primera Clase'  },
    ejecutiva:  { filas: [3,4,5,6],  precio: 160, label: 'Ejecutiva'       },
    economica:  { filas: Array.from({length:26}, (_,i) => i+7), precio: 0, label: 'Económica' },
  },
  default: {
    ejecutiva:  { filas: [1,2,3],    precio: 80,  label: 'Ejecutiva'       },
    economica:  { filas: Array.from({length:20}, (_,i) => i+4), precio: 0, label: 'Económica' },
  }
}

const COLS = ['A','B','C','D','E','F']
const COL_LABELS = ['A','B','C','','D','E','F']

// Asientos tomados simulados (fijos para consistencia)
function getTakenSeats(avion) {
  const seed = avion.split('').reduce((a,c) => a + c.charCodeAt(0), 0)
  const taken = new Set()
  const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
  const allFilas = Object.values(config).flatMap(c => c.filas)
  allFilas.forEach(fila => {
    COLS.forEach(col => {
      const pseudo = (fila * 7 + col.charCodeAt(0) + seed) % 5
      if (pseudo === 0) taken.add(`${fila}${col}`)
    })
  })
  return taken
}

function getSeatClass(fila, avion) {
  const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
  if (config.primera?.filas.includes(fila))  return 'primera'
  if (config.ejecutiva?.filas.includes(fila)) return 'ejecutiva'
  return 'economica'
}

function getSeatPrice(fila, avion) {
  const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
  if (config.primera?.filas.includes(fila))  return config.primera.precio
  if (config.ejecutiva?.filas.includes(fila)) return config.ejecutiva.precio
  return config.economica?.precio ?? 0
}

function getSeatLabel(fila, avion) {
  const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
  if (config.primera?.filas.includes(fila))  return config.primera.label
  if (config.ejecutiva?.filas.includes(fila)) return config.ejecutiva.label
  return config.economica?.label ?? 'Económica'
}

export default function SeatSelection() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const { convert, symbol, currency } = useCurrency()

  if (!state?.vuelo) { navigate('/'); return null }

  const { vuelo, paxData } = state
  const totalPax = paxData?.totalPax ?? 1
  const avion    = vuelo.avion

  const takenSeats = useMemo(() => getTakenSeats(avion), [avion])
  const config     = PLANE_CONFIG[avion] || PLANE_CONFIG.default
  const allFilas   = Object.values(config).flatMap(c => c.filas).sort((a,b) => a-b)

  // Asientos seleccionados: array de strings "1A", "2C"...
  const [selected, setSelected] = useState([])
  const [hovered,  setHovered]  = useState(null)

  const toggleSeat = (seatId, fila) => {
    if (takenSeats.has(seatId)) return
    if (selected.includes(seatId)) {
      setSelected(s => s.filter(x => x !== seatId))
    } else {
      if (selected.length >= totalPax) {
        // Reemplaza el último seleccionado
        setSelected(s => [...s.slice(0, totalPax - 1), seatId])
      } else {
        setSelected(s => [...s, seatId])
      }
    }
  }

  // Total precio asientos extras
  const extraTotal = selected.reduce((acc, sid) => {
    const fila = parseInt(sid)
    return acc + getSeatPrice(fila, avion)
  }, 0)

  // Precio base total pasajeros
  const precioBase = vuelo.precio * ((paxData?.adultos ?? 1) + (paxData?.ninos ?? 0) * 0.75 + (paxData?.infantes ?? 0) * 0.1)
  const precioFinal = precioBase + extraTotal

  const handleContinue = () => {
    navigate('/pago', {
      state: {
        vuelo,
        paxData,
        asientos: selected,
        totalConAsientos: precioFinal,
      }
    })
  }

  // Agrupar filas por clase para mostrar divisores
  const classDividers = {}
  Object.entries(config).forEach(([cls, conf]) => {
    if (conf.filas.length > 0) classDividers[Math.min(...conf.filas)] = conf.label
  })

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate(-1)}>← Volver</a>
          </div>
          <h1 className={styles.pageTitle}>Elige tu asiento</h1>
          <p className={styles.pageSub}>{vuelo.avion} · {vuelo.codigoOrigen} → {vuelo.codigoDestino} · {totalPax} pasajero{totalPax > 1 ? 's':''}</p>
        </div>
      </div>

      <div className={styles.body}>

        {/* MAPA DEL AVIÓN */}
        <motion.div className={styles.planeWrap}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>

          <div className={styles.planeTitle}>{avion}</div>

          {/* Nariz */}
          <div className={styles.planeNose} />

          <div className={styles.planeCabin}>

            {/* Leyenda */}
            <div className={styles.legend}>
              {config.primera && (
                <div className={styles.legendItem}>
                  <div className={`${styles.legendDot} ${styles.primera}`} />
                  Primera Clase
                </div>
              )}
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.ejecutiva}`} />
                Ejecutiva
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.economica}`} />
                Económica
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.taken}`} />
                Ocupado
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.selected}`} />
                Tu selección
              </div>
            </div>

            {/* Etiquetas columnas */}
            <div className={styles.colLabels}>
              <div />
              {COL_LABELS.map((c,i) => <div key={i}>{c}</div>)}
            </div>

            {/* Filas de asientos */}
            {allFilas.map(fila => (
              <div key={fila}>
                {classDividers[fila] && (
                  <div className={styles.classDivider}>{classDividers[fila]}</div>
                )}
                <div className={styles.seatRow}>
                  <div className={styles.rowNum}>{fila}</div>
                  {['A','B','C'].map(col => {
                    const sid    = `${fila}${col}`
                    const cls    = getSeatClass(fila, avion)
                    const taken  = takenSeats.has(sid)
                    const isSel  = selected.includes(sid)
                    const isHov  = hovered === sid
                    return (
                      <button
                        key={col}
                        className={`${styles.seat} ${styles[cls]} ${taken ? styles.taken : ''} ${isSel ? styles.selected : ''}`}
                        onClick={() => toggleSeat(sid, fila)}
                        onMouseEnter={() => setHovered(sid)}
                        onMouseLeave={() => setHovered(null)}
                        title={taken ? 'Ocupado' : `Asiento ${sid} · ${getSeatLabel(fila, avion)}${getSeatPrice(fila,avion) > 0 ? ` · +${symbol}${convert(getSeatPrice(fila,avion))} ${currency}` : ' · Incluido'}`}
                      >
                        {taken ? '✕' : isSel ? '✓' : col}
                      </button>
                    )
                  })}
                  <div className={styles.aisle} />
                  {['D','E','F'].map(col => {
                    const sid    = `${fila}${col}`
                    const cls    = getSeatClass(fila, avion)
                    const taken  = takenSeats.has(sid)
                    const isSel  = selected.includes(sid)
                    return (
                      <button
                        key={col}
                        className={`${styles.seat} ${styles[cls]} ${taken ? styles.taken : ''} ${isSel ? styles.selected : ''}`}
                        onClick={() => toggleSeat(sid, fila)}
                        onMouseEnter={() => setHovered(sid)}
                        onMouseLeave={() => setHovered(null)}
                        title={taken ? 'Ocupado' : `Asiento ${sid} · ${getSeatLabel(fila, avion)}${getSeatPrice(fila,avion) > 0 ? ` · +${symbol}${convert(getSeatPrice(fila,avion))} ${currency}` : ' · Incluido'}`}
                      >
                        {taken ? '✕' : isSel ? '✓' : col}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* PANEL LATERAL */}
        <motion.div className={styles.panel}
          initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, delay:0.2 }}>

          <div className={styles.panelTitle}>Resumen</div>

          {/* Info vuelo */}
          <div className={styles.flightInfo}>
            <div className={styles.flightRoute}>
              <span className={styles.flightCode}>{vuelo.codigoOrigen}</span>
              <span className={styles.flightArrow}>→</span>
              <span className={styles.flightCode}>{vuelo.codigoDestino}</span>
            </div>
            <div className={styles.flightMeta}>{vuelo.id} · {vuelo.duracion} · {vuelo.escalas === 0 ? 'Directo':'Con escala'}</div>
          </div>

          {/* Pasajeros y asientos */}
          <div className={styles.paxList}>
            {Array.from({ length: totalPax }, (_, i) => (
              <div key={i} className={styles.paxItem}>
                <div className={`${styles.paxDot} ${selected[i] ? styles.paxDone : styles.paxPending}`} />
                <span>Pasajero {i+1}</span>
                {selected[i]
                  ? <strong style={{marginLeft:'auto', color:'var(--color-primary)'}}>Asiento {selected[i]}</strong>
                  : <span style={{marginLeft:'auto', color:'var(--color-text-muted)', fontSize:'0.78rem'}}>Sin asignar</span>
                }
              </div>
            ))}
          </div>

          {/* Asiento hover info */}
          {hovered && !takenSeats.has(hovered) && (
            <div className={styles.selectedInfo}>
              <div className={styles.selectedSeatNum}>{hovered}</div>
              <div className={styles.selectedClass}>{getSeatLabel(parseInt(hovered), avion)}</div>
              <div className={styles.selectedPrice}>
                Cargo adicional: <span className={styles.selectedPriceVal}>
                  {getSeatPrice(parseInt(hovered), avion) > 0
                    ? `+${symbol}${convert(getSeatPrice(parseInt(hovered), avion))} ${currency}`
                    : 'Incluido en tarifa'}
                </span>
              </div>
            </div>
          )}

          {/* Precio total */}
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Vuelo ({totalPax} pax)</span>
            <span className={styles.totalVal}>{symbol}{convert(precioBase)} {currency}</span>
          </div>
          {extraTotal > 0 && (
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Cargo asientos</span>
              <span className={styles.totalVal}>+{symbol}{convert(extraTotal)} {currency}</span>
            </div>
          )}
          <div className={styles.totalRow} style={{fontWeight:700, fontSize:'1rem', borderTop:'1px solid var(--color-border)', paddingTop:12, marginTop:4}}>
            <span>Total</span>
            <span style={{color:'var(--color-primary)'}}>{symbol}{convert(precioFinal)} {currency}</span>
          </div>

          <button
            className={styles.btnContinue}
            onClick={handleContinue}
            disabled={selected.length === 0}
          >
            {selected.length === 0
              ? 'Selecciona al menos 1 asiento'
              : `Continuar con ${selected.length} asiento${selected.length > 1 ? 's':''} →`}
          </button>

          {selected.length < totalPax && selected.length > 0 && (
            <p style={{fontSize:'0.75rem', color:'var(--color-text-muted)', textAlign:'center', marginTop:10}}>
              Puedes continuar sin asignar todos los asientos
            </p>
          )}

        </motion.div>
      </div>
    </div>
  )
}