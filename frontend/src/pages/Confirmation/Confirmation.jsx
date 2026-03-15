import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import styles from './Confirmation.module.css'

export default function Confirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { convert, symbol, currency } = useCurrency()
  const { user, addBooking } = useAuth()
  const barcodeRef = useRef(null)
  const savedRef = useRef(false)

  const [email, setEmail] = useState(state?.form?.email || '')
  const [sending, setSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)

  if (!state?.vuelo) { navigate('/'); return null }

  const { vuelo, form, metodo, total, referencia } = state
  const asientos = state?.asientos ?? []
  const metodosLabel = { credito: 'Tarjeta de crédito', debito: 'Tarjeta de débito', transferencia: 'Transferencia bancaria' }

  // Guardar reserva en perfil del usuario (solo una vez)
  useEffect(() => {
    if (user && !savedRef.current) {
      savedRef.current = true
      addBooking({ vuelo, form, metodo: metodosLabel[metodo] || metodo, total, referencia })
    }
  }, [user])

  // Generar barcode visual al montar
  useEffect(() => {
    if (!barcodeRef.current) return
    barcodeRef.current.innerHTML = ''
    for (let i = 0; i < 55; i++) {
      const bar = document.createElement('span')
      bar.style.height = (Math.random() * 20 + 28) + 'px'
      barcodeRef.current.appendChild(bar)
    }
  }, [])

  // Enviar voucher por correo (llama al backend Express)
  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      setEmailStatus('error-format')
      return
    }
    setSending(true)
    setEmailStatus(null)
    try {
      await axios.post('/api/send-voucher', {
        to: email,
        pasajero: `${form.nombre} ${form.apellido}`,
        vuelo: vuelo.id,
        origen: `${vuelo.origen} (${vuelo.codigoOrigen})`,
        destino: `${vuelo.destino} (${vuelo.codigoDestino})`,
        fecha: vuelo.fecha,
        referencia,
        total: `${symbol}${convert(total)} ${currency}`,
        metodo: metodosLabel[metodo],
        asientos: asientos,
      })
      setEmailStatus('ok')
    } catch {
      setEmailStatus('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* ── HEADER ÉXITO ── */}
      <motion.div
        className={styles.successHeader}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className={styles.successIcon}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
        >
          ✓
        </motion.div>
        <h1 className={styles.successTitle}>¡Reserva confirmada!</h1>
        <p className={styles.successSub}>Tu vuelo está reservado. ¡Buen viaje!</p>
        <div className={styles.refCode}>Ref: {referencia}</div>
      </motion.div>

      <div className={styles.body}>

        {/* ── BOARDING PASS ── */}
        <motion.div
          className={styles.boardingPass}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Top azul */}
          <div className={styles.bpTop}>
            <div>
              <div className={styles.bpAirline}>SkyNova Airlines</div>
              <div className={styles.bpFlightNum}>Vuelo {vuelo.id} · {vuelo.avion}</div>
            </div>
            <div className={styles.bpClass}>{vuelo.clase}</div>
          </div>

          {/* Ruta */}
          <div className={styles.bpRoute}>
            <div className={styles.bpCity}>
              <div className={styles.bpCode}>{vuelo.codigoOrigen}</div>
              <div className={styles.bpCityName}>{vuelo.origen}</div>
              <div className={styles.bpTime}>{vuelo.salida}</div>
            </div>

            <div className={styles.bpArrowBlock}>
              <div className={styles.bpDuration}>{vuelo.duracion}</div>
              <div className={styles.bpLine} />
              <div className={styles.bpPlane}>→</div>
              <div className={styles.bpDuration}>
                {vuelo.escalas === 0 ? 'Directo' : `${vuelo.escalas} escala`}
              </div>
            </div>

            <div className={styles.bpCity}>
              <div className={styles.bpCode}>{vuelo.codigoDestino}</div>
              <div className={styles.bpCityName}>{vuelo.destino}</div>
              <div className={styles.bpTime}>{vuelo.llegada}</div>
            </div>
          </div>

          {/* Separador dentado */}
          <div className={styles.bpDivider}>
            <div className={styles.bpDividerCircleL} />
            <div className={styles.bpDividerLine} />
            <div className={styles.bpDividerCircleR} />
          </div>

          {/* Detalles */}
          <div className={styles.bpDetails}>
            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Pasajero</div>
              <div className={styles.bpDetailValue}>{form.nombre} {form.apellido}</div>
            </div>
            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Fecha</div>
              <div className={styles.bpDetailValue}>{vuelo.fecha}</div>
            </div>
            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Asiento(s)</div>
              <div className={styles.bpDetailValue}>
                {asientos.length > 0 ? asientos.join(', ') : 'Por asignar'}
              </div>
            </div>
            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Referencia</div>
              <div className={styles.bpDetailValue}>{referencia}</div>
            </div>
            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Método de pago</div>
              <div className={styles.bpDetailValue}>{metodosLabel[metodo]}</div>
            </div>
            <div className={styles.bpDetail} style={{ gridColumn: 'span 1' }}>
              <div className={styles.bpDetailLabel}>Total pagado</div>
              <div className={styles.bpDetailValue} style={{ color: 'var(--color-primary)', marginTop: '6px' }}>
                {symbol}{convert(total)} {currency}
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className={styles.bpBarcode}>
            <div className={styles.barcodeLines} ref={barcodeRef} />
            <div className={styles.barcodeRef}>{referencia}</div>
          </div>
        </motion.div>

        {/* ── ENVIAR VOUCHER POR CORREO ── */}
        <motion.div
          className={styles.emailCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <div className={styles.emailCardTitle}>Enviar voucher por correo</div>
          <div className={styles.emailCardSub}>
            Recibirás el comprobante de tu reserva con todos los detalles del vuelo.
          </div>
          <div className={styles.emailRow}>
            <input
              className={styles.emailInput}
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailStatus(null) }}
            />
            <button className={styles.btnSend} onClick={handleSendEmail} disabled={sending}>
              {sending ? <><span className={styles.spinner} />Enviando...</> : 'Enviar'}
            </button>
          </div>

          {emailStatus === 'ok' && (
            <div className={`${styles.emailStatus} ${styles.emailOk}`}>
              Voucher enviado a {email} — revisa tu bandeja de entrada.
            </div>
          )}
          {emailStatus === 'error' && (
            <div className={`${styles.emailStatus} ${styles.emailError}`}>
              No se pudo enviar el correo. Verifica que el backend esté corriendo.
            </div>
          )}
          {emailStatus === 'error-format' && (
            <div className={`${styles.emailStatus} ${styles.emailError}`}>
              Ingresa un correo válido.
            </div>
          )}
        </motion.div>

        {/* ── ACCIONES ── */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <button className={`${styles.btnAction} ${styles.btnPrimary}`} onClick={() => navigate('/')}>
            Buscar otro vuelo
          </button>
          <button className={`${styles.btnAction} ${styles.btnOutline}`} onClick={() => window.print()}>
            Imprimir boarding pass
          </button>
        </motion.div>

      </div>
    </div>
  )
}