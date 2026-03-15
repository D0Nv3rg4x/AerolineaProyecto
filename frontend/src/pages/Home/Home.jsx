import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './Home.module.css'
import { useData } from '../../context/DataContext'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' }
  })
}

const getDestinosPara = (org, vuelos) => {
  const orgNombre = org.split(' (')[0]
  const destinos = vuelos
    .filter(v => v.origen === orgNombre)
    .map(v => `${v.destino} (${v.codigoDestino})`)
  return [...new Set(destinos)].sort()
}

function LuxuryParticles({ trigger }) {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    if (!trigger) return
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: trigger.x,
      y: trigger.y,
      size: Math.random() * 4 + 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      opacity: 1
    }))
    setParticles(prev => [...prev, ...newParticles])
    
    const timeout = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)))
    }, 1000)
    
    return () => clearTimeout(timeout)
  }, [trigger])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={styles.particle}
          initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
          animate={{ 
            x: p.x + p.vx * 40, 
            y: p.y + p.vy * 40, 
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: p.size, height: p.size, backgroundColor: 'rgba(96, 165, 250, 0.6)', boxShadow: '0 0 10px #60a5fa' }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const { vuelos: todosLosVuelos, loading } = useData()

  const ORIGENES = useMemo(() => {
    if (!todosLosVuelos) return []
    return [...new Set(todosLosVuelos.map(v => `${v.origen} (${v.codigoOrigen})`))].sort()
  }, [todosLosVuelos])

  const [activeTab, setActiveTab] = useState('ida')
  const [origen, setOrigen] = useState('')

  useEffect(() => {
    if (ORIGENES.length > 0 && !origen) {
      setOrigen(ORIGENES[0])
    }
  }, [ORIGENES, origen])
  
  const destinosDisponibles = useMemo(() => {
    if (!origen || !todosLosVuelos) return []
    return getDestinosPara(origen, todosLosVuelos)
  }, [origen, todosLosVuelos])

  const [destino, setDestino] = useState('')

  useEffect(() => {
    if (destinosDisponibles.length > 0) {
      if (!destinosDisponibles.includes(destino)) {
        setDestino(destinosDisponibles[0])
      }
    } else {
      setDestino('')
    }
  }, [destinosDisponibles, destino])

  const [fecha, setFecha] = useState('')
  const [fechaVuelta, setFechaVuelta] = useState('')
  const [pasajeros, setPasajeros] = useState({ adultos: 1, ninos: 0, bebes: 0 })
  const [showPasajeros, setShowPasajeros] = useState(false)
  const pasajerosRef = useRef(null)

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [burst, setBurst] = useState(null)
  const searchBoxRef = useRef(null)

  const [activeUsers, setActiveUsers] = useState(42)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const delta = Math.floor(Math.random() * 5) - 2
        return Math.max(20, Math.min(100, prev + delta))
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e) => {
    if (!searchBoxRef.current) return
    const rect = searchBoxRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const triggerBurst = (e) => {
    setBurst({ x: e.clientX, y: e.clientY, t: Date.now() })
  }

  const hoy = new Date().toISOString().split('T')[0]
  const [multiLegs, setMultiLegs] = useState([])

  useEffect(() => {
    if (ORIGENES.length > 0 && multiLegs.length === 0) {
      const firstOrg = ORIGENES[0]
      const firstDest = getDestinosPara(firstOrg, todosLosVuelos)[0]
      const secondDest = getDestinosPara(firstDest, todosLosVuelos)[0] || firstOrg
      setMultiLegs([
        { origen: firstOrg, destino: firstDest, fecha: hoy },
        { origen: firstDest, destino: secondDest, fecha: hoy },
      ])
    }
  }, [ORIGENES, todosLosVuelos, hoy, multiLegs.length])

  const addLeg = () => {
    if (multiLegs.length >= 5) return
    const lastLeg = multiLegs[multiLegs.length - 1]
    const nextDestinos = getDestinosPara(lastLeg.destino, todosLosVuelos)
    setMultiLegs([...multiLegs, { origen: lastLeg.destino, destino: nextDestinos[0] || ORIGENES[0], fecha: lastLeg.fecha }])
  }

  const removeLeg = (idx) => {
    if (multiLegs.length <= 2) return
    setMultiLegs(multiLegs.filter((_, i) => i !== idx))
  }

  const updateLeg = (idx, field, value) => {
    setMultiLegs(multiLegs.map((leg, i) => i === idx ? { ...leg, [field]: value } : leg))
  }

  const swapLeg = (idx) => {
    setMultiLegs(multiLegs.map((leg, i) => i === idx ? { ...leg, origen: leg.destino, destino: leg.origen } : leg))
  }

  useEffect(() => {
    setFecha(hoy)
    setFechaVuelta(hoy)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pasajerosRef.current && !pasajerosRef.current.contains(event.target)) {
        setShowPasajeros(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getTotalPasajeros = () => pasajeros.adultos + pasajeros.ninos + pasajeros.bebes
  
  const pasajerosString = useMemo(() => {
    const total = getTotalPasajeros()
    if (total === 1) return '1 pasajero'
    return `${total} pasajeros`
  }, [pasajeros])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId, t = 0

    const resize = () => {
      if (!canvas || !canvas.parentElement) return 
      canvas.width = canvas.parentElement.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement.offsetHeight || window.innerHeight
    }

    const ribbons = Array.from({ length: 12 }, (_, i) => ({
      amp: 50 + Math.random() * 120,
      freq: 0.002 + Math.random() * 0.004,
      speed: 0.003 + Math.random() * 0.005,
      offset: Math.random() * Math.PI * 2,
      yBase: 0.08 + (i / 12) * 0.84,
      width: 1.2 + Math.random() * 2.5,
      hue: 205 + Math.random() * 50,
      alpha: 0.05 + Math.random() * 0.13,
    }))

    const drawRibbon = (r, thin) => {
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 4) {
        const y = r.yBase * canvas.height
          + Math.sin(x * r.freq + t * r.speed + r.offset) * r.amp
          + Math.sin(x * r.freq * 0.6 + t * r.speed * 1.4 + 1) * (r.amp * 0.35)
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      if (thin) {
        ctx.strokeStyle = `hsla(${r.hue + 15}, 100%, 88%, ${r.alpha * 0.45})`
        ctx.lineWidth = 0.5
      } else {
        ctx.strokeStyle = `hsla(${r.hue}, 75%, 62%, ${r.alpha})`
        ctx.lineWidth = r.width
      }
      ctx.stroke()
    }

    const loop = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t++
      ribbons.forEach(r => {
        drawRibbon(r, false)
        drawRibbon(r, true)
      })
      animId = requestAnimationFrame(loop)
    }

    resize()
    loop()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const [busquedasRecientes, setBusquedasRecientes] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('skyNova_recentSearches')
    if (saved) setBusquedasRecientes(JSON.parse(saved))
  }, [])

  const saveSearch = (search) => {
    const newSearch = {
      ...search,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const filtered = busquedasRecientes.filter(s => 
      !(s.origen === search.origen && s.destino === search.destino)
    )
    const updated = [newSearch, ...filtered].slice(0, 3)
    setBusquedasRecientes(updated)
    localStorage.setItem('skyNova_recentSearches', JSON.stringify(updated))
  }

  const handleSearch = () => {
    if (activeTab === 'multi') {
      navigate('/vuelos', {
        state: { origen: multiLegs[0].origen, destino: multiLegs[0].destino, fecha: multiLegs[0].fecha, pasajeros: pasajerosString, activeTab }
      })
      return
    }
    if (!fecha) return
    
    saveSearch({ origen, destino, fecha, activeTab })

    navigate('/vuelos', {
      state: { origen, destino, fecha, fechaVuelta: activeTab === 'vuelta' ? fechaVuelta : null, pasajeros: pasajerosString, activeTab }
    })
  }

  const handleRecentClick = (search) => {
    setOrigen(search.origen)
    setDestino(search.destino)
    setFecha(search.fecha)
    setActiveTab(search.activeTab)
  }

  return (
    <main style={{ overflow: 'hidden', height: 'calc(100vh - 69px)' }}>

      <section className={styles.hero}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.heroGradient} />

        <div className={styles.heroContent}>

          <motion.div
            className={styles.heroBadge}
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
          >
            ✦ &nbsp; La aerolínea del futuro
          </motion.div>

          <motion.h1
            className={styles.heroTitle}
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Vuela hacia <br />
            <span>donde sueñas.</span>
          </motion.h1>

          <motion.p
            className={styles.heroSub}
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            Más de 120 destinos en 48 países. Encuentra tu vuelo ideal
            y reserva en minutos con SkyNova Airlines.
          </motion.p>

          <motion.div
            ref={searchBoxRef}
            className={`${styles.searchBox} ${loading ? styles.loading : ''}`}
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            onMouseMove={handleMouseMove}
          >
            <div className={styles.liveActivity}>
              <span className={styles.liveDot} />
              {activeUsers} personas buscando vuelos ahora
            </div>

            {loading ? (
              <div className={styles.loader}>Cargando rutas...</div>
            ) : (
              <>
                <LuxuryParticles trigger={burst} />
                <div className={styles.glowContainer}>
                  <div 
                    className={styles.magneticGlow} 
                    style={{ left: mousePos.x, top: mousePos.y }}
                  />
                </div>
                <div className={styles.tripTabs}>
                  {['ida', 'vuelta', 'multi'].map(tab => (
                    <button
                      key={tab}
                      className={`${styles.tripTab} ${activeTab === tab ? styles.tripTabActive : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'ida' && 'Solo ida'}
                      {tab === 'vuelta' && 'Ida y vuelta'}
                      {tab === 'multi' && 'Multidestino'}
                    </button>
                  ))}
                </div>

                {activeTab !== 'multi' ? (
                  <>
                    <div className={styles.searchRow}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Origen</label>
                        <select className={styles.fieldInput} value={origen} onChange={e => { setOrigen(e.target.value); triggerBurst(e) }}>
                          {ORIGENES.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>

                      <div className={styles.swapBtn} onClick={() => { 
                        const oldOrg = origen; 
                        const oldDest = destino;
                        if (ORIGENES.includes(oldDest)) {
                          setOrigen(oldDest); 
                          setDestino(oldOrg);
                        }
                      }}>⇆</div>

                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Destino</label>
                        <select className={styles.fieldInput} value={destino} onChange={e => { setDestino(e.target.value); triggerBurst(e) }}>
                          {destinosDisponibles.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className={styles.searchRow}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>{activeTab === 'ida' ? 'Fecha' : 'Ida'}</label>
                        <input type="date" className={styles.fieldInput} value={fecha} min={hoy} onChange={e => { setFecha(e.target.value); triggerBurst(e) }} />
                      </div>

                      {activeTab === 'vuelta' && (
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Vuelta</label>
                          <input type="date" className={styles.fieldInput} value={fechaVuelta} min={fecha || hoy} onChange={e => setFechaVuelta(e.target.value)} />
                        </div>
                      )}

                      <div className={styles.field} ref={pasajerosRef} style={{ position: 'relative' }}>
                        <label className={styles.fieldLabel}>Pasajeros</label>
                        <div className={`${styles.fieldInput} ${styles.pasajerosTrigger}`} onClick={() => setShowPasajeros(!showPasajeros)}>
                          <span>{pasajerosString}</span>
                          <span className={styles.chevron}>▾</span>
                        </div>
                        {showPasajeros && (
                          <div className={styles.pasajerosPopover}>
                            {[
                              { key: 'adultos', label: 'Adultos', sub: 'Desde 12 años', min: 1 },
                              { key: 'ninos',   label: 'Niños',   sub: '2 – 11 años',  min: 0 },
                              { key: 'bebes',   label: 'Bebés',   sub: '0 – 2 años',   min: 0 },
                            ].map(cat => (
                              <div className={styles.pasajeroRow} key={cat.key}>
                                <div className={styles.pasajeroInfo}>
                                  <span className={styles.pasajeroName}>{cat.label}</span>
                                  <span className={styles.pasajeroSub}>{cat.sub}</span>
                                </div>
                                <div className={styles.counter}>
                                  <button className={styles.counterBtn} disabled={pasajeros[cat.key] <= cat.min} onClick={() => setPasajeros(p => ({ ...p, [cat.key]: Math.max(cat.min, p[cat.key] - 1) }))}>−</button>
                                  <span className={styles.counterVal}>{pasajeros[cat.key]}</span>
                                  <button className={styles.counterBtn} onClick={() => setPasajeros(p => ({ ...p, [cat.key]: p[cat.key] + 1 }))}>+</button>
                                </div>
                              </div>
                            ))}
                            <button className={styles.popoverDone} onClick={() => setShowPasajeros(false)}>Listo</button>
                          </div>
                        )}
                      </div>

                      <button className={styles.btnSearch} onClick={handleSearch}>Buscar</button>
                    </div>
                  </>
                ) : (
                  <>
                    {multiLegs.map((leg, idx) => (
                      <div className={styles.legRow} key={idx}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Origen</label>
                          <select className={styles.fieldInput} value={leg.origen} onChange={e => updateLeg(idx, 'origen', e.target.value)}>
                            {ORIGENES.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>

                        <div className={styles.swapBtn} onClick={() => swapLeg(idx)}>⇆</div>

                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Destino</label>
                          <select className={styles.fieldInput} value={leg.destino} onChange={e => updateLeg(idx, 'destino', e.target.value)}>
                            {(() => {
                              const flightDestinos = getDestinosPara(leg.origen, todosLosVuelos)
                              return flightDestinos.map(d => <option key={d}>{d}</option>)
                            })()}
                          </select>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Ida</label>
                          <input type="date" className={styles.fieldInput} value={leg.fecha} min={hoy} onChange={e => updateLeg(idx, 'fecha', e.target.value)} />
                        </div>

                        {idx === 0 && (
                          <div className={styles.field} ref={pasajerosRef} style={{ position: 'relative' }}>
                            <label className={styles.fieldLabel}>Pasajeros</label>
                            <div className={`${styles.fieldInput} ${styles.pasajerosTrigger}`} onClick={() => setShowPasajeros(!showPasajeros)}>
                              <span>{pasajerosString}</span>
                              <span className={styles.chevron}>▾</span>
                            </div>
                            {showPasajeros && (
                              <div className={styles.pasajerosPopover}>
                                {[
                                  { key: 'adultos', label: 'Adultos', sub: 'Desde 12 años', min: 1 },
                                  { key: 'ninos',   label: 'Niños',   sub: '2 – 11 años',  min: 0 },
                                  { key: 'bebes',   label: 'Bebés',   sub: '0 – 2 años',   min: 0 },
                                ].map(cat => (
                                  <div className={styles.pasajeroRow} key={cat.key}>
                                    <div className={styles.pasajeroInfo}>
                                      <span className={styles.pasajeroName}>{cat.label}</span>
                                      <span className={styles.pasajeroSub}>{cat.sub}</span>
                                    </div>
                                    <div className={styles.counter}>
                                      <button className={styles.counterBtn} disabled={pasajeros[cat.key] <= cat.min} onClick={() => setPasajeros(p => ({ ...p, [cat.key]: Math.max(cat.min, p[cat.key] - 1) }))}>−</button>
                                      <span className={styles.counterVal}>{pasajeros[cat.key]}</span>
                                      <button className={styles.counterBtn} onClick={() => setPasajeros(p => ({ ...p, [cat.key]: p[cat.key] + 1 }))}>+</button>
                                    </div>
                                  </div>
                                ))}
                                <button className={styles.popoverDone} onClick={() => setShowPasajeros(false)}>Listo</button>
                              </div>
                            )}
                          </div>
                        )}

                        {multiLegs.length > 2 && (
                          <button className={styles.legRemoveInline} onClick={() => removeLeg(idx)}>✕</button>
                        )}
                      </div>
                    ))}

                    <div className={styles.multiFooter}>
                      {multiLegs.length < 5 && (
                        <button className={styles.btnAddLeg} onClick={addLeg}>+ Agregar tramo</button>
                      )}
                      <button className={styles.btnSearch} onClick={handleSearch}>Buscar</button>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>

          <motion.div 
            className={styles.partnersSection}
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
          >
            <span className={styles.partnersTitle}>Nuestros Partners Globales</span>
            <div className={styles.partnersGrid}>
              <span>Emirates</span>
              <span>Lufthansa</span>
              <span>Iberia</span>
              <span>Qatar Airways</span>
              <span>Delta</span>
              <span>British Airways</span>
            </div>
          </motion.div>

          {busquedasRecientes.length > 0 && (
            <motion.div 
              className={styles.recentSearches}
              variants={fadeUp} initial="hidden" animate="visible" custom={4}
            >
              <h3 className={styles.recentTitle}>Tus búsquedas recientes</h3>
              <div className={styles.recentGrid}>
                {busquedasRecientes.map((s) => (
                  <div 
                    key={s.id} 
                    className={styles.recentCard}
                    onClick={() => handleRecentClick(s)}
                  >
                    <div className={styles.recentRoute}>
                      <span>{s.origen.includes(' (') ? s.origen.split(' (')[1].replace(')', '') : s.origen}</span>
                      <span className={styles.recentArrow}>→</span>
                      <span>{s.destino.includes(' (') ? s.destino.split(' (')[1].replace(')', '') : s.destino}</span>
                    </div>
                    <div className={styles.recentMeta}>
                      {s.fecha} • {s.time}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </section>
    </main>
  )
}
