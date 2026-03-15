import { motion } from 'framer-motion'
import styles from './Legal.module.css'

export default function Cookies() {
  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Política de Cookies</h1>
        <div className={styles.subtitle}>
          <span>Actualizado: 2026</span>
          <span>•</span>
          <span>Transparencia Digital</span>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>¿Qué son las cookies?</h2>
            <p className={styles.text}>
              Las cookies son pequeños archivos de datos que nos permiten recordar sus preferencias de viaje, moneda seleccionada y sesiones de usuario para que su experiencia en SkyNova sea lo más fluida posible.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tipos de cookies que usamos</h2>
            <ul className={styles.list}>
              <li><strong>Esenciales:</strong> Necesarias para el funcionamiento del motor de reservas y el inicio de sesión.</li>
              <li><strong>Personalización:</strong> Recuerdan su idioma, moneda y destinos favoritos.</li>
              <li><strong>Rendimiento:</strong> Nos ayudan a optimizar la velocidad de carga de nuestras interfaces interactivas.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Control de cookies</h2>
            <p className={styles.text}>
              Usted tiene el control total. Puede gestionar o deshabilitar las cookies a través de la configuración de su navegador en cualquier momento, aunque esto podría afectar la fluidez de algunas micro-interacciones premium.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
