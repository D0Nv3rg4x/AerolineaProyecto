import { motion } from 'framer-motion'
import styles from './Legal.module.css'
import usePageTitle from '../../hooks/usePageTitle'

export default function Terms() {
  usePageTitle('Términos');
  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Términos de Servicio</h1>
        <div className={styles.subtitle}>
          <span>Vigente desde: 14 de Marzo, 2026</span>
          <span>•</span>
          <span>SkyNova Global</span>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Aceptación de los términos</h2>
            <p className={styles.text}>
              Al acceder y utilizar los servicios de SkyNova, usted acepta quedar vinculado por estos términos legales. Si no está de acuerdo con alguna parte, le rogamos que no utilice nuestra plataforma.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Reservas y Pagos</h2>
            <p className={styles.text}>
              Todas las reservas están sujetas a disponibilidad. Los precios mostrados incluyen tasas base, pero pueden variar según la selección de asientos y servicios adicionales elegidos en el flujo de reserva.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Cambios y Cancelaciones</h2>
            <p className={styles.text}>
              SkyNova ofrece flexibilidad Premium. Las condiciones de cancelación dependen de la clase de tarifa seleccionada (Económica, Ejecutiva o Primera Clase).
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Conducta del Pasajero</h2>
            <p className={styles.text}>
              Nos reservamos el derecho de admisión para garantizar la seguridad y el confort de todos nuestros pasajeros en nuestra flota de vanguardia.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
