import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './SettingsPage.module.css'

export default function SecuritySettings() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a>
            <span>›</span>
            <a onClick={() => navigate('/perfil')}>Mi Perfil</a>
            <span>›</span>
            <span>Seguridad</span>
          </div>
          <h1 className={styles.pageTitle}>Seguridad de la Cuenta</h1>
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cambiar Contraseña
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contraseña Actual</label>
              <input type="password" className={styles.input} placeholder="••••••••" />
            </div>
            <div className={styles.formGroup}></div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nueva Contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirmar Nueva Contraseña</label>
              <input type="password" className={styles.input} placeholder="••••••••" />
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => navigate('/perfil')}>Volver al Perfil</button>
            <button className={styles.btnPrimary}>Actualizar Seguridad</button>
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Doble Factor de Autenticación (2FA)
          </div>
          <div className={styles.toggleRow}>
            <div className={styles.toggleLabel}>
              <span className={styles.toggleTitle}>Autenticación por SMS</span>
              <span className={styles.toggleDesc}>Recibe un código en tu teléfono cada vez que inicies sesión.</span>
            </div>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>Activar</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
