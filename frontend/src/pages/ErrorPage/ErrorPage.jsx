import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from '../NotFound/NotFound.module.css'
import usePageTitle from '../../hooks/usePageTitle'

export default function ErrorPage() {
  usePageTitle('Error');
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className={styles.icon} style={{ color: 'var(--color-error)' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className={styles.title}>Error de Sistema</h1>
        <p className={styles.desc}>
          Hubo una falla técnica en nuestros sistemas. Por favor intenta de nuevo en unos momentos.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnBack} onClick={() => window.location.reload()}>
            Reintentar
          </button>
          <button className={styles.btnHome} onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </motion.div>
    </div>
  )
}
