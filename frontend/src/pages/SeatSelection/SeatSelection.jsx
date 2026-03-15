import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import styles from './SeatSelection.module.css'

export default function SeatSelection() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { convert, symbol, currency } = useCurrency()

  const [configData, setConfigData] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:3001/api/config/vuelos')
      .then(res => {
        setConfigData(res.data)
        setLoadingConfig(false)
      })
      .catch(err => {
        console.error('Error loading plane config:', err)
        setLoadingConfig(false)
      })
  }, [])

  if (!state?.vuelo) { navigate('/'); return null }

  const { vuelo, paxData, tipo = 'vuelo', producto = null } = state
  const totalPax = paxData?.totalPax ?? 1
  const avion = vuelo.avion

  const PLANE_CONFIG = configData?.planeConfigs || {}
  const COLS = configData?.cols || ['A', 'B', 'C', 'D', 'E', 'F']
  const COL_LABELS = configData?.colLabels || ['A', 'B', 'C', '', 'D', 'E', 'F']

  const getTakenSeats = (avion) => {
    const seed = avion.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const taken = new Set()
    const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
    if (!config) return taken
    const allFilas = Object.values(config).flatMap(c => c.filas)
    allFilas.forEach(fila => {
      COLS.forEach(col => {
        const pseudo = (fila * 7 + col.charCodeAt(0) + seed) % 5
        if (pseudo === 0) taken.add(`${fila}${col}`)
      })
    })
    return taken
  }

  const getSeatClass = (fila, avion) => {
    const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
    if (!config) return 'economica'
    if (config.primera?.filas.includes(fila)) return 'primera'
    if (config.ejecutiva?.filas.includes(fila)) return 'ejecutiva'
    return 'economica'
  }

  const getSeatPrice = (fila, avion) => {
    const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
    if (!config) return 0
    if (config.primera?.filas.includes(fila)) return config.primera.precio
    if (config.ejecutiva?.filas.includes(fila)) return config.ejecutiva.precio
    return config.economica?.precio ?? 0
  }

  const getSeatLabel = (fila, avion) => {
    const config = PLANE_CONFIG[avion] || PLANE_CONFIG.default
    if (!config) return 'Económica'
    if (config.primera?.filas.includes(fila)) return config.primera.label
    if (config.ejecutiva?.filas.includes(fila)) return config.ejecutiva.label
    return config.economica?.label ?? 'Económica'
  }

  const takenSeats = useMemo(() => {
    if (loadingConfig) return new Set()
    return getTakenSeats(avion)
  }, [avion, loadingConfig, configData])

  const currentConfig = PLANE_CONFIG[avion] || PLANE_CONFIG.default
  const allFilas = useMemo(() => {
    if (!currentConfig) return []
    return Object.values(currentConfig).flatMap(c => c.filas).sort((a, b) => a - b)
  }, [currentConfig])

  const [selected, setSelected] = useState([])
  const [hovered, setHovered] = useState(null)

  const isAiRecommended = (sid) => {
    const fila = parseInt(sid)
    const col = sid.slice(-1)
    return (fila === 1 || fila === 7 || fila === 12) && (col === 'A' || col === 'F')
  }

  const toggleSeat = (seatId, fila) => {
    if (takenSeats.has(seatId)) return
    if (selected.includes(seatId)) {
      setSelected(s => s.filter(x => x !== seatId))
    } else {
      if (selected.length >= totalPax) {
        setSelected(s => [...s.slice(0, totalPax - 1), seatId])
      } else {
        setSelected(s => [...s, seatId])
      }
    }
  }

  const extraTotal = selected.reduce((acc, sid) => {
    const fila = parseInt(sid)
    return acc + getSeatPrice(fila, avion)
  }, 0)

  const basePrice = (tipo === 'oferta' && producto?.precioOferta)
    ? producto.precioOferta
    : (tipo === 'paquete' && (producto?.price || producto?.precio))
      ? (producto?.price || producto.precio)
      : (vuelo?.precio || 0);

  const precioBase = basePrice * ((paxData?.adultos ?? 1) + (paxData?.ninos ?? 0) * 0.75 + (paxData?.infantes ?? 0) * 0.1)
  const precioFinal = precioBase + extraTotal

  const handleContinue = () => {
    navigate('/pago', {
      state: {
        producto: producto || vuelo,
        tipo,
        paxData,
        extraData: {
          asientos: selected,
          totalConAsientos: precioFinal,
        }
      }
    })
  }

  const classDividers = useMemo(() => {
    const dividers = {}
    if (!currentConfig) return dividers
    Object.entries(currentConfig).forEach(([cls, conf]) => {
      if (conf.filas.length > 0) dividers[Math.min(...conf.filas)] = conf.label
    })
    return dividers
  }, [currentConfig])

  if (loadingConfig) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.loader}>Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate(-1)}>← Volver</a>
          </div>
          <h1 className={styles.pageTitle}>Elige tu asiento</h1>
          <p className={styles.pageSub}>{vuelo.avion} · {vuelo.codigoOrigen} → {vuelo.codigoDestino} · {totalPax} pasajero{totalPax > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className={styles.body}>
        <motion.div className={styles.planeWrap}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          <div className={styles.planeTitle}>{avion}</div>

          <div className={styles.planeNose} />

          <div className={styles.planeCabin}>
            <div className={styles.legend}>
              {currentConfig?.primera && (
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

            <div className={styles.colLabels}>
              <div />
              {COL_LABELS.map((c, i) => <div key={i}>{c}</div>)}
            </div>

            {allFilas.map(fila => (
              <div key={fila}>
                {classDividers[fila] && (
                  <div className={styles.classDivider}>{classDividers[fila]}</div>
                )}
                <div className={styles.seatRow}>
                  <div className={styles.rowNum}>{fila}</div>
                  {COLS.slice(0, 3).map(col => {
                    const sid = `${fila}${col}`
                    const cls = getSeatClass(fila, avion)
                    const taken = takenSeats.has(sid)
                    const isSel = selected.includes(sid)
                    const isAi = !taken && isAiRecommended(sid)

                    return (
                      <div key={col} className={styles.seatContainer}>
                        <button
                          className={`${styles.seat} ${styles[cls]} ${taken ? styles.taken : ''} ${isSel ? styles.selected : ''} ${isAi ? styles.aiSeat : ''}`}
                          onClick={() => toggleSeat(sid, fila)}
                          onMouseEnter={() => setHovered(sid)}
                          onMouseLeave={() => setHovered(null)}
                          title={taken ? 'Ocupado' : `Asiento ${sid} · ${getSeatLabel(fila, avion)}${getSeatPrice(fila, avion) > 0 ? ` · +${symbol}${convert(getSeatPrice(fila, avion))} ${currency}` : ' · Incluido'}`}
                        >
                          {taken ? '✕' : isSel ? '✓' : col}
                          {isAi && <span className={styles.aiBadge}>AI</span>}
                        </button>
                      </div>
                    )
                  })}
                  <div className={styles.aisle} />
                  {COLS.slice(3, 6).map(col => {
                    const sid = `${fila}${col}`
                    const cls = getSeatClass(fila, avion)
                    const taken = takenSeats.has(sid)
                    const isSel = selected.includes(sid)
                    const isAi = !taken && isAiRecommended(sid)

                    return (
                      <div key={col} className={styles.seatContainer}>
                        <button
                          className={`${styles.seat} ${styles[cls]} ${taken ? styles.taken : ''} ${isSel ? styles.selected : ''} ${isAi ? styles.aiSeat : ''}`}
                          onClick={() => toggleSeat(sid, fila)}
                          onMouseEnter={() => setHovered(sid)}
                          onMouseLeave={() => setHovered(null)}
                          title={taken ? 'Ocupado' : `Asiento ${sid} · ${getSeatLabel(fila, avion)}${getSeatPrice(fila, avion) > 0 ? ` · +${symbol}${convert(getSeatPrice(fila, avion))} ${currency}` : ' · Incluido'}`}
                        >
                          {taken ? '✕' : isSel ? '✓' : col}
                          {isAi && <span className={styles.aiBadge}>AI</span>}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className={styles.panel}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>

          <div className={styles.panelTitle}>Resumen</div>

          <div className={styles.flightInfo}>
            <div className={styles.flightRoute}>
              <span className={styles.flightCode}>{vuelo.codigoOrigen}</span>
              <span className={styles.flightArrow}>→</span>
              <span className={styles.flightCode}>{vuelo.codigoDestino}</span>
            </div>
            <div className={styles.flightMeta}>{vuelo.id} · {vuelo.duracion} · {vuelo.escalas === 0 ? 'Directo' : 'Con escala'}</div>
          </div>

          <div className={styles.paxList}>
            {Array.from({ length: totalPax }, (_, i) => (
              <div key={i} className={styles.paxItem}>
                <div className={`${styles.paxDot} ${selected[i] ? styles.paxDone : styles.paxPending}`} />
                <span>Pasajero {i + 1}</span>
                {selected[i]
                  ? <strong style={{ marginLeft: 'auto', color: 'var(--color-primary)' }}>Asiento {selected[i]}</strong>
                  : <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Sin asignar</span>
                }
              </div>
            ))}
          </div>

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
          <div className={styles.totalRow} style={{ fontWeight: 700, fontSize: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 4 }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>{symbol}{convert(precioFinal)} {currency}</span>
          </div>

          <button
            className={styles.btnContinue}
            onClick={handleContinue}
            disabled={selected.length === 0}
          >
            {selected.length === 0
              ? 'Selecciona al menos 1 asiento'
              : `Continuar con ${selected.length} asiento${selected.length > 1 ? 's' : ''} →`}
          </button>

          {selected.length < totalPax && selected.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 10 }}>
              Puedes continuar sin asignar todos los asientos
            </p>
          )}

        </motion.div>
      </div>
    </div>
  )
}