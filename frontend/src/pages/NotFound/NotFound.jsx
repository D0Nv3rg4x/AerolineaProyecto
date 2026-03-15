import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './NotFound.module.css'
import usePageTitle from '../../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('404 No Encontrado');
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className={styles.icon}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2-0 001.71 3h16.94a2 2-0 001.71-3L13.71 3.86a2 2-0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className={styles.title}>404 - Fuera de Ruta</h1>
        <p className={styles.desc}>
          Parece que nos desviamos del plan de vuelo. La página que buscas no existe o ha sido movida a otro hangar.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnBack} onClick={() => navigate(-1)}>
            Volver atrás
          </button>
          <button className={styles.btnHome} onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </motion.div>
    </div>
  )
}
