import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import usePageTitle from '../../hooks/usePageTitle'
import styles from './Profile.module.css'

export default function Profile() {
  usePageTitle('Mi Perfil');
  const { user, bookings } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.unauth}>
          <div className={styles.avatar}>?</div>
          <h2>Inicia sesión para ver tu perfil</h2>
          <button className="btnPrimary" onClick={() => window.location.reload()}>
            Acceder
          </button>
        </div>
      </div>
    )
  }

  const settings = [
    {
      title: 'Información Personal',
      desc: 'Gestiona tu nombre, dirección y detalles de contacto.',
      path: '/perfil/personal',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: 'Seguridad',
      desc: 'Actualiza tu contraseña y gestiona la autenticación de dos pasos.',
      path: '/perfil/seguridad',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: 'Preferencias',
      desc: 'Idioma, moneda y configuración de notificaciones.',
      path: '/perfil/preferencias',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: 'Métodos de Pago',
      desc: 'Gestiona tus tarjetas guardadas y opciones de facturación.',
      path: '/perfil/pagos',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a>
            <span>›</span>
            <span>Mi Perfil</span>
          </div>
          <motion.h1 
            className={styles.pageTitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Configuración de Cuenta
          </motion.h1>
          <p className={styles.pageSub}>Gestiona tu información personal y preferencias de SkyNova.</p>
        </div>
      </div>

      <div className={styles.body}>
        <motion.div 
          className={styles.profileCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.avatar}>{user.nombre[0]}{user.apellido[0]}</div>
          <h2 className={styles.userName}>{user.nombre} {user.apellido}</h2>
          <p className={styles.userEmail}>{user.email}</p>
          
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statVal}>{bookings.length}</span>
              <span className={styles.statLabel}>Vuelos</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statVal}>Oro</span>
              <span className={styles.statLabel}>Categoría</span>
            </div>
          </div>
        </motion.div>

        <div className={styles.settingsGrid}>
          {settings.map((s, i) => (
            <motion.div 
              key={s.title}
              className={styles.settingCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(s.path)}
            >
              <div className={styles.settingIcon}>{s.icon}</div>
              <div className={styles.settingInfo}>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
