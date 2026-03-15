import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { useData } from '../../context/DataContext'
import PassengerSelector from '../../components/PassengerSelector/PassengerSelector.jsx'
import usePageTitle from '../../hooks/usePageTitle'
import styles from './Offers.module.css'
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

export default function Offers() {
  usePageTitle('Ofertas');
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('Todas')
  const { convert, symbol, currency } = useCurrency()
  const { vuelos: todosLosVuelos } = useData()

  const [search, setSearch] = useState({
    origen: 'Santiago (SCL)',
    destino: '',
    entrada: '',
    pax: { adultos: 2, ninos: 0, infantes: 0, totalPax: 2 }
  })

  useEffect(() => {
    fetch('http://localhost:3001/api/ofertas')
      .then(res => res.json())
      .then(data => {
        setOffers(data)
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
      })
  }, [])

  const ORIGENES = useMemo(() => {
    if (!todosLosVuelos) return []
    return [...new Set(todosLosVuelos.map(v => `${v.origen} (${v.codigoOrigen})`))].sort()
  }, [todosLosVuelos])

  const DESTINOS = useMemo(() => {
    return [...new Set(offers.map(o => o.titulo.replace('Oferta relámpago a ', '')))].sort()
  }, [offers])

  const filteredOffers = useMemo(() => {
    return offers.filter(o => {
      const matchesType = filterType === 'Todas' || o.tipo === filterType
      const oDest = o.titulo.replace('Oferta relámpago a ', '')
      const matchesDest = !search.destino || oDest.toLowerCase().includes(search.destino.toLowerCase())
      return matchesType && matchesDest
    })
  }, [offers, filterType, search.destino])

  const types = ['Todas', ...new Set(offers.map(o => o.tipo))]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a> › <span>Ofertas relámpago</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className={styles.title}
          >
            Ofertas Relámpago
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styles.subtitle}
          >
            Descuentos exclusivos de hasta el 60%. ¡Corre que vuelan!
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

            <div className={styles.miniSwap}>⇆</div>

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
              <span className={styles.miniLabel}>Fecha</span>
              <input type="date" className={styles.miniDate} value={search.entrada} onChange={(e) => setSearch({...search, entrada: e.target.value})} />
            </div>

            <div className={styles.miniDivider} />

            <div className={styles.miniField}>
              <span className={styles.miniLabel}>Viajeros</span>
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
          <FilterSection title="Categoría">
            {types.map(t => (
              <label key={t} className={styles.filterOption}>
                <input 
                  type="checkbox" 
                  checked={filterType === t}
                  onChange={() => setFilterType(t)}
                />
                <span>{t}</span>
              </label>
            ))}
          </FilterSection>
        </motion.aside>

        <main className={styles.results}>
          <div className={styles.grid}>
            {filteredOffers.map((offer, idx) => (
              <motion.div 
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <img src={offer.imagen} alt={offer.titulo} className={styles.image} />
                  <div className={styles.promoBadge}>{offer.badge}</div>
                  <div className={styles.discountBadge}>-{offer.descuento}</div>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.typeBadge}>{offer.tipo}</div>
                  <h3 className={styles.cardTitle}>{offer.titulo}</h3>
                  <p className={styles.cardDesc}>{offer.descripcion}</p>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.priceSection}>
                      <span className={styles.oldPrice}>{symbol}{convert(offer.precioOriginal)}</span>
                      <span className={styles.newPrice}>{symbol}{convert(offer.precioOferta)}</span>
                    </div>
                    <button 
                      className={styles.btnClaim}
                      onClick={() => {
                        const isFlightRelated = offer.tipo === 'Vuelo' || offer.tipo === 'Paquete';
                        if (isFlightRelated) {
                          const destStr = offer.titulo.replace('Oferta relámpago a ', '').toLowerCase();
                          const flight = todosLosVuelos.find(v => v.destino.toLowerCase().includes(destStr)) || todosLosVuelos[0];
                          navigate('/asientos', {
                            state: {
                              producto: offer,
                              tipo: 'oferta',
                              vuelo: flight,
                              paxData: search.pax
                            }
                          });
                        } else {
                          navigate('/pago', {
                            state: {
                              producto: offer,
                              tipo: 'oferta',
                              paxData: search.pax
                            }
                          });
                        }
                      }}
                    >
                      Aprovechar
                    </button>
                  </div>
                  
                  <div className={styles.expiry}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                    Vence: {offer.vence}
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
