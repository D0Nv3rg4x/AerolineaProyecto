import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDarkMode } from '../../context/DarkModeContext.jsx'
import logo from '../../assets/logo.png'
import styles from './Navbar.module.css'
import LogoutModal from '../LogoutModal/LogoutModal.jsx'

export default function Navbar() {
  const location = useLocation()
  const { currency, setCurrency, loading } = useCurrency()
  const { user, logout, setAuthModal } = useAuth()
  const { dark, toggle } = useDarkMode()
  const [userMenu, setUserMenu] = useState(false)
  const [currMenu, setCurrMenu] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.inner}>

        <Link to="/" className={styles.logo}>
          <img src={logo} alt="SkyNova" className={styles.logoImg} />
          <div className={styles.logoText}>
            <span className={styles.logoName}>Sky<span>Nova</span></span>
            <span className={styles.logoTagline}>Airlines</span>
          </div>
        </Link>

        <ul className={styles.links}>
          <li>
            <Link to="/" className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/alojamientos" className={`${styles.navLink} ${isActive('/alojamientos') ? styles.active : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M3 10V7a2 2 0 012-2h14a2 2 0 012 2v3"/><path d="M7 15h10"/><path d="M7 11h10"/>
              </svg>
              Alojamientos
            </Link>
          </li>
          <li>
            <Link to="/vuelos" className={`${styles.navLink} ${isActive('/vuelos') ? styles.active : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h11"/><path d="m17 7 3 5-3 5"/><path d="M11 12H2"/>
              </svg>
              Vuelos
            </Link>
          </li>
          <li>
            <Link to="/paquetes" className={`${styles.navLink} ${isActive('/paquetes') ? styles.active : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              Paquetes
            </Link>
          </li>
          <li>
            <Link to="/ofertas" className={`${styles.navLink} ${isActive('/ofertas') ? styles.active : ''}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0011 12a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 012.5 2.5 2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5-2.5 2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5-2.5 2.5 2.5 0 012.5-2.5z"/><path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/>
              </svg>
              Ofertas
            </Link>
          </li>
        </ul>

        <div className={styles.navRight}>

          <button className={styles.iconBtn} onClick={toggle} title={dark ? 'Modo claro' : 'Modo oscuro'}>
            <AnimatePresence mode="wait">
              {dark ? (
                <motion.svg
                  key="sun"
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2m-19.78 7.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="moon"
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          <div className={styles.currencyWrapper}>
            <button 
              className={styles.currencyBtn} 
              onClick={() => { setCurrMenu(!currMenu); setUserMenu(false) }}
              disabled={loading}
            >
              <span className={styles.currencyIcon}>$</span>
              <span className={styles.currencyVal}>{currency}</span>
              <span className={`${styles.chevron} ${currMenu ? styles.chevronOpen : ''}`}>▼</span>
            </button>

            {loading && <span className={styles.loadingDot} />}

            <AnimatePresence>
              {currMenu && (
                <motion.div
                  className={styles.dropdown}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {['USD', 'EUR', 'CLP'].map(c => (
                    <button
                      key={c}
                      className={`${styles.dropoutItem} ${currency === c ? styles.dropoutActive : ''}`}
                      onClick={() => { setCurrency(c); setCurrMenu(false) }}
                    >
                      {c} {c === 'USD' ? '$' : c === 'EUR' ? '€' : '$'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>


            {user ? (
            <div className={styles.userWrap}>
              <button className={styles.userBtn} onClick={() => { setUserMenu(m => !m); setCurrMenu(false) }}>
                <div className={styles.userAvatar}>
                  {user.nombre[0]}{user.apellido[0]}
                </div>
                <span className={styles.userName}>{user.nombre}</span>
                <span className={`${styles.chevron} ${userMenu ? styles.chevronOpen : ''}`}>▼</span>
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    className={styles.userMenu}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={styles.userMenuHeader}>
                      <div className={styles.userMenuLabel}>Cuenta Premium</div>
                      <div className={styles.userMenuName}>{user.nombre} {user.apellido}</div>
                      <div className={styles.userMenuEmail}>{user.email}</div>
                    </div>
                    
                    <div className={styles.userMenuList}>
                      <Link to="/perfil" className={styles.userMenuItem} onClick={() => setUserMenu(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Mi Perfil</span>
                      </Link>

                      <Link to="/mis-viajes" className={styles.userMenuItem} onClick={() => setUserMenu(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2-0 002-2V7a2 2-0 00-2-2H5a2 2-0 00-2 2v12a2 2-0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Mis reservas</span>
                      </Link>
                      
                      <button className={`${styles.userMenuItem} ${styles.userMenuLogout}`}
                        onClick={() => { setUserMenu(false); setShowLogoutModal(true) }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className={styles.btnLogin} onClick={() => setAuthModal('login')}>
              Iniciar sesión
            </button>
          )}

        </div>
      </div>

      <LogoutModal 
        isOpen={showLogoutModal} 
        onConfirm={() => { logout(); setShowLogoutModal(false) }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </motion.nav>
  )
}