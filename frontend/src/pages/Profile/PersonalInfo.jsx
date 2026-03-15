import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import usePageTitle from '../../hooks/usePageTitle'
import styles from './SettingsPage.module.css'

export default function PersonalInfo() {
  usePageTitle('Información Personal');
  const { user } = useAuth()
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
            <span>Información Personal</span>
          </div>
          <h1 className={styles.pageTitle}>Información Personal</h1>
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
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tus Datos de Contacto
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre</label>
              <input type="text" className={styles.input} defaultValue={user?.nombre} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Apellido</label>
              <input type="text" className={styles.input} defaultValue={user?.apellido} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo Electrónico</label>
              <input type="email" className={styles.input} value={user?.email} disabled />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono</label>
              <input type="tel" className={styles.input} placeholder="+56 9 1234 5678" />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Dirección de Residencia</label>
              <input type="text" className={styles.input} placeholder="Av. Providencia 1234, Santiago" />
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => navigate('/perfil')}>Volver al Perfil</button>
            <button className={styles.btnPrimary}>Guardar Cambios</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
