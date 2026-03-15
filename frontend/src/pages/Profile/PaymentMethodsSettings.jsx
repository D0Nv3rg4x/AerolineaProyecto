import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './SettingsPage.module.css'

export default function PaymentMethodsSettings() {
  const navigate = useNavigate()

  const cards = [
    { type: 'Visa', num: '•••• 4242', exp: '12/26', icon: '💳' },
    { type: 'Mastercard', num: '•••• 8888', exp: '08/25', icon: '💳' }
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a>
            <span>›</span>
            <a onClick={() => navigate('/perfil')}>Mi Perfil</a>
            <span>›</span>
            <span>Métodos de Pago</span>
          </div>
          <h1 className={styles.pageTitle}>Mi Billetera Digital</h1>
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
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tarjetas Guardadas
          </div>

          <div className={styles.cardList}>
            {cards.map((c, i) => (
              <motion.div 
                key={c.num} 
                className={styles.paymentCard}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.cardInfo}>
                  <span className={styles.cardIcon}>{c.icon}</span>
                  <div>
                    <div className={styles.cardNum}>{c.type} {c.num}</div>
                    <div className={styles.cardExp}>Vence en {c.exp}</div>
                  </div>
                </div>
                <button className={styles.btnSecondary} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Eliminar</button>
              </motion.div>
            ))}
          </div>

          <button className={styles.btnPrimary} style={{ marginTop: '24px', width: '100%' }}>
            Añadir Nueva Tarjeta
          </button>
        </motion.div>

        <motion.div 
          className={styles.contentCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Pagos en una Cuota
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Habilita la compra rápida para tus vuelos más frecuentes. Usaremos tu tarjeta predeterminada.
          </p>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => navigate('/perfil')}>Volver al Perfil</button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
