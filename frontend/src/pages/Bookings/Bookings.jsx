import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import BoardingPassModal from '../../components/BoardingPassModal/BoardingPassModal.jsx'
import usePageTitle from '../../hooks/usePageTitle'
import styles from './Bookings.module.css'

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const target = new Date(targetDate)
      const diff = target - now

      if (diff <= 0) {
        clearInterval(timer)
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className={styles.countdown}>
      <div className={styles.countdownItem}><span>{timeLeft.days}</span>d</div>
      <div className={styles.countdownItem}><span>{timeLeft.hours}</span>h</div>
      <div className={styles.countdownItem}><span>{timeLeft.minutes}</span>m</div>
    </div>
  )
}

export default function Bookings() {
  usePageTitle('Mis Viajes');
  const navigate          = useNavigate()
  const { user, bookings, setAuthModal } = useAuth()
  const { convert, symbol, currency }    = useCurrency()
  const [selectedBooking, setSelectedBooking] = useState(null)

  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const items = bookings.slice().sort((a, b) => {
      const dateA = new Date(a.producto?.fecha || a.extraData?.entrada || a.createdAt)
      const dateB = new Date(b.producto?.fecha || b.extraData?.entrada || b.createdAt)
      return dateB - dateA
    })
    
    return {
      upcoming: items.filter(b => {
        const date = new Date(b.producto?.fecha || b.extraData?.entrada || b.createdAt)
        return date >= now
      }).reverse(),
      past: items.filter(b => {
        const date = new Date(b.producto?.fecha || b.extraData?.entrada || b.createdAt)
        return date < now
      })
    }
  }, [bookings])

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.breadcrumb}>
              <a onClick={() => navigate('/')}>Inicio</a>
              <span>›</span>
              <span>Mis Reservas</span>
            </div>
            <h1 className={styles.pageTitle}>Mis Reservas</h1>
            <p className={styles.pageSub}>Gestiona todos tus vuelos en un solo lugar</p>
            <div className={styles.headerSpacer} />
          </div>
        </div>
        <div className={styles.body}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarTitle}>Acceso Seguro</div>
            <p className={styles.sidebarText}>
              Inicia sesión para gestionar tus itinerarios, realizar cambios y acceder a servicios exclusivos.
            </p>
          </aside>
          <div className={styles.results}>
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="5" y="11" width="14" height="10" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.emptyTitle}>Inicia sesión para ver tus reservas</div>
              <p className={styles.emptySub}>Necesitas una cuenta para acceder a tu historial de vuelos.</p>
              <button className={styles.btnSearch} onClick={() => setAuthModal('login')}>
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a>
            <span>›</span>
            <span>Mis Reservas</span>
          </div>

          <motion.h1 className={styles.pageTitle}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Mis Reservas
          </motion.h1>
          <p className={styles.pageSub}>
            Hola, {user.nombre} — tienes {bookings.length} reserva{bookings.length !== 1 ? 's' : ''}
          </p>

          <div className={styles.headerSpacer} />
        </div>
      </div>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>Estado de Viajes</div>
          <div className={styles.sidebarText}>
            Tienes <strong>{upcoming.length}</strong> {upcoming.length === 1 ? 'vuelo próximo' : 'vuelos próximos'}.
          </div>
          {upcoming.length > 0 && (
            <div className={styles.nextTrip}>
              <div className={styles.nextTripLabel}>Tu próximo viaje es en:</div>
              <Countdown targetDate={upcoming[0].producto?.fecha || upcoming[0].extraData?.entrada} />
            </div>
          )}
          <div style={{ marginTop: '30px' }}>
            <p className={styles.sidebarText} style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              Toda la información de tus vuelos se mantiene sincronizada en tiempo real.
            </p>
          </div>
        </aside>

        <div className={styles.results}>
          {bookings.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={styles.emptyTitle}>Aún no tienes reservas</div>
              <p className={styles.emptySub}>Busca un vuelo y reserva tu próximo viaje.</p>
              <button className={styles.btnSearch} onClick={() => navigate('/')}>
                Buscar vuelos
              </button>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className={styles.sectionTitle}>Próximos Viajes</div>
              )}
              {upcoming.map((b, i) => (
                <motion.div
                  key={b.referencia}
                  className={`${styles.bookingCard} ${styles.upcomingCard}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className={styles.cardTop}>
                    <div>
                      <div className={styles.cardRef}>CONFIRMADO · {b.referencia}</div>
                      <div className={styles.cardDate}>Reservado el {new Date(b.createdAt).toLocaleDateString('es-CL')}</div>
                    </div>
                    <div className={styles.cardBadge}>PRÓXIMO</div>
                  </div>

                  <div className={styles.route}>
                    {b.tipo === 'vuelo' ? (
                      <>
                        <div>
                          <div className={styles.routeCode}>{b.producto.codigoOrigen}</div>
                          <div className={styles.routeName}>{b.producto.origen}</div>
                        </div>
                        <div className={styles.routeLine}>
                          <span className={styles.planeIcon}>✈</span>
                        </div>
                        <div>
                          <div className={styles.routeCode}>{b.producto.codigoDestino}</div>
                          <div className={styles.routeName}>{b.producto.destino}</div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.otherInfo}>
                        <div className={styles.otherTitle}>{b.producto.nombre || b.producto.titulo}</div>
                        <div className={styles.otherDest}>{b.producto.ciudad || b.producto.destino}</div>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.metaInfo}>
                      <span>{b.producto.fecha || b.extraData?.entrada}</span>
                      <span className={styles.dot}>•</span>
                      <span>{b.tipo === 'vuelo' ? `Vuelo ${b.producto.id}` : b.tipo.toUpperCase()}</span>
                    </div>
                    <div className={styles.viewPass}>Ver detalle →</div>
                  </div>
                </motion.div>
              ))}

              {past.length > 0 && (
                <div className={styles.sectionTitle} style={{ marginTop: '40px' }}>Historial de Viajes</div>
              )}
              {past.map((b, i) => (
                <motion.div
                  key={b.referencia}
                  className={`${styles.bookingCard} ${styles.pastCard}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardRef}>COMPLETADO · {b.referencia}</div>
                  </div>
                  <div className={styles.route}>
                    <div className={styles.routeCode}>{b.producto.codigoOrigen || b.producto.ciudad || b.producto.destino}</div>
                    <div className={styles.routeArrow}>→</div>
                    <div className={styles.routeCode}>{b.producto.codigoDestino || (b.producto.nombre ? 'COMPLETADO' : '...') }</div>
                    <div className={styles.pastDate}>{b.producto.fecha || b.extraData?.entrada}</div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <BoardingPassModal 
            booking={selectedBooking} 
            onClose={() => setSelectedBooking(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
