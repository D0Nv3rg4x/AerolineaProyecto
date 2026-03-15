import { motion, AnimatePresence } from 'framer-motion'
import styles from './LogoutModal.module.css'

export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onCancel}>
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.icon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.title}>¿Ya te vas?</h2>
            <p className={styles.desc}>
              Esperamos verte pronto de regreso para seguir explorando nuevos destinos con SkyNova.
            </p>
            <div className={styles.actions}>
              <button className={styles.btnCancel} onClick={onCancel}>
                Cancelar
              </button>
              <button className={styles.btnConfirm} onClick={onConfirm}>
                Cerrar Sesión
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
