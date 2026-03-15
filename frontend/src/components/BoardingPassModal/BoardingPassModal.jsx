import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import styles from './BoardingPassModal.module.css'

export default function BoardingPassModal({ booking, onClose }) {
  const { convert, symbol, currency } = useCurrency()
  const { producto, tipo, form, referencia, total } = booking

  const barcodeBars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      height: `${20 + Math.random() * 40}%`,
      opacity: 0.1 + Math.random() * 0.9
    }))
  }, [])

  const isFlight = tipo === 'vuelo'

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
          <div className={styles.top} style={{ 
            background: tipo === 'alojamiento' 
              ? 'linear-gradient(135deg, #064e3b, #065f46)' 
              : tipo === 'vuelo' 
                ? 'linear-gradient(135deg, #0b1120, #1a3060)'
                : 'linear-gradient(135deg, #4c1d95, #6d28d9)'
          }}>
            <div className={styles.brand}>
              <span className={styles.brandLogo}>✦</span>
              SkyNova <span className={styles.brandAirlines}>{tipo === 'alojamiento' ? 'Hotels' : 'Airlines'}</span>
            </div>
            <div className={styles.flightNum}>
              {isFlight ? `Vuelo ${producto.id}` : tipo.toUpperCase()}
            </div>
          </div>

          <div className={styles.main}>
            {isFlight ? (
              <>
                <div className={styles.station}>
                  <div className={styles.cityCode}>{producto.codigoOrigen}</div>
                  <div className={styles.cityName}>{producto.origen}</div>
                  <div className={styles.time}>{producto.salida}</div>
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
                  <div className={styles.duration}>{producto.duracion}</div>
                </div>

                <div className={styles.station}>
                  <div className={styles.cityCode}>{producto.codigoDestino}</div>
                  <div className={styles.cityName}>{producto.destino}</div>
                  <div className={styles.time}>{producto.llegada}</div>
                </div>
              </>
            ) : (
              <div className={styles.genericInfo}>
                <div className={styles.genericTitle}>{producto.nombre || producto.titulo}</div>
                <div className={styles.genericSubtitle}>{producto.ciudad || producto.destino || 'Premium Service'}</div>
              </div>
            )}
          </div>

          <div className={styles.divider}>
            <div className={styles.circleL} />
            <div className={styles.dashed} />
            <div className={styles.circleR} />
          </div>

          <div className={styles.bottom}>
            <div className={styles.grid}>
              <div className={styles.infoBox}>
                <div className={styles.label}>{tipo === 'alojamiento' ? 'HUÉSPED' : 'PASAJERO'}</div>
                <div className={styles.value}>{form.nombre} {form.apellido}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.label}>{tipo === 'alojamiento' ? 'CHECK-IN' : 'FECHA'}</div>
                <div className={styles.value}>{producto.fecha || booking.extraData?.entrada}</div>
              </div>
              <div className={styles.infoBox}>
                <div className={styles.label}>{isFlight ? 'ASIENTO' : 'DETALLE'}</div>
                <div className={styles.value}>{booking.asientos?.join(', ') || booking.extraData?.noches ? `${booking.extraData.noches} noches` : 'Confirmado'}</div>
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
          <button className={styles.btnPrint} onClick={() => window.print()}>
            Imprimir {isFlight ? 'Boarding Pass' : 'Voucher'}
          </button>
          <button className={styles.btnDone} onClick={onClose}>Cerrar</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
