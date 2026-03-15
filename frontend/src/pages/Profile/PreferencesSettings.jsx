import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { useDarkMode } from '../../context/DarkModeContext.jsx'
import styles from './SettingsPage.module.css'

export default function PreferencesSettings() {
  const navigate = useNavigate()
  const { currency, setCurrency } = useCurrency()
  const { dark, toggle } = useDarkMode()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a>
            <span>›</span>
            <a onClick={() => navigate('/perfil')}>Mi Perfil</a>
            <span>›</span>
            <span>Preferencias</span>
          </div>
          <h1 className={styles.pageTitle}>Preferencias de Visualización</h1>
        </div>
      </div>

      <div className={styles.body}>
        <motion.div 
          className={styles.contentCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="2" y1="12" x2="22" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Idioma y Moneda
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Moneda de Venta</label>
              <select 
                className={styles.select} 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="CLP">Peso Chileno (CLP)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Idioma</label>
              <select className={styles.select} defaultValue="es">
                <option value="es">Español (Chile)</option>
                <option value="en">English (US)</option>
                <option value="pt">Português (Brasil)</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={styles.contentCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {dark ? (
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
            Personalización de Interfaz
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Sincronizar con el Sistema</span>
              <span className={styles.toggleDesc}>Adaptar automáticamente entre modo claro y oscuro.</span>
            </div>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>Próximamente</span>
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Modo Oscuro</span>
              <span className={styles.toggleDesc}>Utilizar la paleta de colores de noche diseñada por SkyNova.</span>
            </div>
            <button className={styles.btnSecondary} onClick={toggle}>
              {dark ? 'Desactivar' : 'Activar'}
            </button>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => navigate('/perfil')}>Volver al Perfil</button>
            <button className={styles.btnPrimary}>Actualizar Preferencias</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
