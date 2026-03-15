import { motion } from 'framer-motion'
import styles from './Legal.module.css'
import usePageTitle from '../../hooks/usePageTitle'

export default function Privacy() {
  usePageTitle('Privacidad');
  return (
    <div className={styles.page}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Política de Privacidad</h1>
        <div className={styles.subtitle}>
          <span>Última actualización: 14 de Marzo, 2026</span>
          <span>•</span>
          <span>Versión 2.0</span>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Introducción</h2>
            <p className={styles.text}>
              En SkyNova, la privacidad de nuestros pasajeros es una prioridad fundamental. Esta política detalla cómo recopilamos, usamos y protegemos su información personal cuando utiliza nuestra plataforma de reserva de vuelos.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Información que recopilamos</h2>
            <p className={styles.text}>
              Para proporcionar un servicio de clase mundial, procesamos los siguientes tipos de datos:
            </p>
            <ul className={styles.list}>
              <li>Datos de identidad: Nombre completo, fecha de nacimiento y número de pasaporte.</li>
              <li>Información de contacto: Correo electrónico, número de teléfono y dirección de facturación.</li>
              <li>Detalles de pago: Información de tarjeta procesada de forma segura mediante socios certificados.</li>
              <li>Preferencias de viaje: Selección de asientos, menús especiales y servicios adicionales.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Uso de sus datos</h2>
            <p className={styles.text}>
              Utilizamos su información exclusivamente para la gestión de sus reservas, la emisión de pases de abordar electrónicos y para mejorar su experiencia mediante ofertas personalizadas de SkyNova Elite.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Seguridad</h2>
            <p className={styles.text}>
              Implementamos protocolos de cifrado de nivel bancario (AES-256) para asegurar que cada bit de su información permanezca privado y bajo su control.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
