import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import styles from './BoardingPassModal.module.css'

export default function BoardingPassModal({ booking, onClose }) {
  const { convert, symbol, currency } = useCurrency()
  const { vuelo, form, referencia, total } = booking

  const barcodeBars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      height: `${20 + Math.random() * 40}%`,
      opacity: 0.1 + Math.random() * 0.9
    }))
  }, [])

  return (
    <motion.div 
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className={styles.modal}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.btnClose} onClick={onClose}>✕</button>

        <div className={styles.passContainer}>
          {/* TOP SECTION: BRANDING */}
          <div className={styles.top}>
            <div className={styles.brand}>
              <span className={styles.brandLogo}>✦</span>
              SkyNova <span className={styles.brandAirlines}>Airlines</span>
            </div>
            <div className={styles.flightNum}>
              Vuelo {vuelo.id}
            </div>
          </div>

          {/* MAIN CONTENT: TRAJECTORY */}
          <div className={styles.main}>
            <div className={styles.station}>
              <div className={styles.cityCode}>{vuelo.codigoOrigen}</div>
              <div className={styles.cityName}>{vuelo.origen}</div>
              <div className={styles.time}>{vuelo.salida}</div>
            </div>

            <div className={styles.trajectory}>
              <div className={styles.line}>
                <motion.div 
                  className={styles.plane}
                  initial={{ left: -10 }}
                  animate={{ left: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  ✈
                </motion.div>
              </div>
              <div className={styles.duration}>{vuelo.duracion}</div>
            </div>

            <div className={styles.station}>
              <div className={styles.cityCode}>{vuelo.codigoDestino}</div>
              <div className={styles.cityName}>{vuelo.destino}</div>
              <div className={styles.time}>{vuelo.llegada}</div>
            </div>
          </div>

          {/* DASHED DIVIDER */}
          <div className={styles.divider}>
            <div className={styles.circleL} />
            <div className={styles.dashed} />
            <div className={styles.circleR} />
          </div>

          {/* BOTTOM SECTION: PASSENGER INFO */}
          <div className={styles.bottom}>
            <div className={styles.grid}>
              <div className={styles.infoBox}>
                <div className={styles.label}>PASAJERO</div>
                <div className={styles.value}>{form.nombre} {form.apellido}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.label}>FECHA</div>
                <div className={styles.value}>{vuelo.fecha}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.label}>ASIENTO</div>
                <div className={styles.value}>{booking.asientos?.join(', ') || 'Confirmado'}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.label}>REFERENCIA</div>
                <div className={styles.value}>{referencia}</div>
              </div>
            </div>

            <div className={styles.barcodeWrap}>
              <div className={styles.barcode}>
                {barcodeBars.map((bar, i) => (
                  <div 
                    key={i} 
                    className={styles.bar} 
                    style={{ height: bar.height, opacity: bar.opacity }} 
                  />
                ))}
              </div>
              <div className={styles.barcodeText}>{referencia}</div>
            </div>

            <div className={styles.totalPay}>
              Pagado: <span>{symbol}{convert(total)} {currency}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrint} onClick={() => window.print()}>Imprimir Boarding Pass</button>
          <button className={styles.btnDone} onClick={onClose}>Cerrar</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
