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

  if (!state?.producto) { navigate('/'); return null }

  const { producto, tipo, form, passengers = [], metodo, total, referencia, extraData = {} } = state
  const asientos = extraData?.asientos ?? []
  const metodosLabel = { credito: 'Tarjeta de crédito', debito: 'Tarjeta de débito', transferencia: 'Transferencia bancaria' }

  useEffect(() => {
    if (user && !savedRef.current) {
      savedRef.current = true
      addBooking({ producto, tipo, form, metodo: metodosLabel[metodo] || metodo, total, referencia, extraData })
    }
  }, [user])

  useEffect(() => {
    if (!barcodeRef.current) return
    barcodeRef.current.innerHTML = ''
    
    if (tipo === 'vuelo') {
      for (let i = 0; i < 55; i++) {
        const bar = document.createElement('span')
        bar.style.height = (Math.random() * 20 + 28) + 'px'
        bar.style.width = '2px'
        bar.style.background = 'var(--color-text)'
        bar.style.display = 'inline-block'
        bar.style.margin = '0 1px'
        barcodeRef.current.appendChild(bar)
      }
    } else {
      barcodeRef.current.style.display = 'grid'
      barcodeRef.current.style.gridTemplateColumns = 'repeat(8, 1fr)'
      barcodeRef.current.style.gap = '2px'
      barcodeRef.current.style.width = '60px'
      barcodeRef.current.style.height = '60px'
      for (let i = 0; i < 64; i++) {
        const pixel = document.createElement('div')
        pixel.style.background = Math.random() > 0.5 ? 'var(--color-text)' : 'transparent'
        barcodeRef.current.appendChild(pixel)
      }
    }
  }, [tipo])

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
        passengers: passengers.map(p => `${p.nombre} ${p.apellido}`),
        tipo,
        productoNombre: producto.nombre || producto.titulo || producto.id,
        origen: tipo === 'vuelo' ? `${producto.origen} (${producto.codigoOrigen})` : producto.ciudad || producto.destino,
        destino: tipo === 'vuelo' ? `${producto.destino} (${producto.codigoDestino})` : '',
        fecha: producto.fecha || extraData.entrada || '',
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
        <p className={styles.successSub}>Tu reserva se ha completado con éxito. ¡Disfruta tu viaje!</p>
        <div className={styles.refCode}>Ref: {referencia}</div>
      </motion.div>

      <div className={styles.body}>

        <motion.div
          className={styles.boardingPass}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className={styles.bpTop} style={{ 
            background: tipo === 'alojamiento' 
              ? 'linear-gradient(135deg, #064e3b, #065f46)' 
              : tipo === 'vuelo' 
                ? 'linear-gradient(135deg, #0b1120, #1a3060)'
                : 'linear-gradient(135deg, #4c1d95, #6d28d9)'
          }}>
            <div>
              <div className={styles.bpAirline} style={{ color: tipo === 'alojamiento' ? '#6ee7b7' : '#60a5fa' }}>
                SkyNova {tipo === 'alojamiento' ? 'Hotels' : tipo === 'vuelo' ? 'Airlines' : 'Travel'}
              </div>
              <div className={styles.bpFlightNum}>
                {tipo === 'vuelo' ? `✈️ Vuelo ${producto.id} · ${producto.avion}` : ''}
                {tipo === 'alojamiento' ? `🏨 ${producto.nombre}` : ''}
                {tipo === 'paquete' ? `🎁 Paquete: ${producto.nombre}` : ''}
                {tipo === 'oferta' ? `🔥 Oferta: ${producto.titulo}` : ''}
              </div>
            </div>
            <div className={styles.bpClass} style={{ 
              background: tipo === 'alojamiento' ? 'rgba(110, 231, 183, 0.15)' : 'rgba(96, 165, 250, 0.15)',
              borderColor: tipo === 'alojamiento' ? 'rgba(110, 231, 183, 0.3)' : 'rgba(96, 165, 250, 0.3)',
              color: tipo === 'alojamiento' ? '#6ee7b7' : '#60a5fa'
            }}>
              {tipo === 'vuelo' ? producto.clase : tipo === 'alojamiento' ? 'HOTEL' : tipo.toUpperCase()}
            </div>
          </div>

          {tipo === 'vuelo' ? (
            <div className={styles.bpRoute}>
              <div className={styles.bpCity}>
                <div className={styles.bpCode}>{producto.codigoOrigen}</div>
                <div className={styles.bpCityName}>{producto.origen}</div>
                <div className={styles.bpTime}>{producto.salida}</div>
              </div>

              <div className={styles.bpArrowBlock}>
                <div className={styles.bpDuration}>{producto.duracion}</div>
                <div className={styles.bpLine} />
                <div className={styles.bpPlane}>→</div>
                <div className={styles.bpDuration}>
                  {producto.escalas === 0 ? 'Directo' : `${producto.escalas} escala`}
                </div>
              </div>

              <div className={styles.bpCity}>
                <div className={styles.bpCode}>{producto.codigoDestino}</div>
                <div className={styles.bpCityName}>{producto.destino}</div>
                <div className={styles.bpTime}>{producto.llegada}</div>
              </div>
            </div>
          ) : (
            <div className={styles.voucherMain}>
              <div className={styles.voucherInfo}>
                <div className={styles.voucherDest}>
                  {producto.ciudad || producto.destino || 'Destino global'}
                  <span className={styles.voucherCountry}>{producto.pais || ''}</span>
                </div>
                
                {tipo === 'alojamiento' && (
                  <div className={styles.voucherStay}>
                    <div className={styles.stayPoint}>
                      <div className={styles.stayDate}>{extraData.entrada}</div>
                      <div className={styles.stayLabel}>Check-in</div>
                    </div>
                    <div className={styles.stayLine}>
                      <span>{extraData.noches || 1} noches</span>
                    </div>
                    <div className={styles.stayPoint}>
                      <div className={styles.stayDate}>—</div>
                      <div className={styles.stayLabel}>Check-out</div>
                    </div>
                  </div>
                )}

                {tipo === 'paquete' && (
                  <div className={styles.pkgSummary}>
                    <div className={styles.pkgInclusions}>
                      {producto.incluye?.slice(0, 3).map((inc, i) => (
                        <span key={i} className={styles.pkgTag}>✓ {inc}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={tipo === 'vuelo' ? styles.bpDivider : styles.voucherDivider}>
            {tipo === 'vuelo' && <div className={styles.bpDividerCircleL} />}
            <div className={styles.bpDividerLine} />
            {tipo === 'vuelo' && <div className={styles.bpDividerCircleR} />}
          </div>

          <div className={styles.bpDetails}>
            <div className={styles.bpDetail} style={{ gridColumn: 'span 2' }}>
              <div className={styles.bpDetailLabel}>
                {tipo === 'alojamiento' ? 'Huéspedes' : 'Pasajeros'}
              </div>
              <div className={styles.bpDetailValue}>
                {passengers.length > 0 
                  ? passengers.map(p => `${p.nombre} ${p.apellido}`).join(', ')
                  : `${form.nombre} ${form.apellido}`
                }
              </div>
            </div>
            
            {tipo === 'vuelo' && (
              <>
                <div className={styles.bpDetail}>
                  <div className={styles.bpDetailLabel}>Fecha</div>
                  <div className={styles.bpDetailValue}>{producto.fecha}</div>
                </div>
                <div className={styles.bpDetail}>
                  <div className={styles.bpDetailLabel}>Asiento(s)</div>
                  <div className={styles.bpDetailValue}>
                    {asientos.length > 0 ? asientos.join(', ') : 'Por asignar'}
                  </div>
                </div>
              </>
            )}

            {tipo === 'alojamiento' && (
              <>
                <div className={styles.bpDetail}>
                  <div className={styles.bpDetailLabel}>Check-in</div>
                  <div className={styles.bpDetailValue}>{extraData.entrada || 'Ver en voucher'}</div>
                </div>
                <div className={styles.bpDetail}>
                  <div className={styles.bpDetailLabel}>Noches</div>
                  <div className={styles.bpDetailValue}>{extraData.noches || 1}</div>
                </div>
              </>
            )}

            {tipo === 'paquete' && (
              <>
                <div className={styles.bpDetail}>
                  <div className={styles.bpDetailLabel}>Duración</div>
                  <div className={styles.bpDetailValue}>{producto.duracion}</div>
                </div>
                <div className={styles.bpDetail}>
                  <div className={styles.bpDetailLabel}>Asiento vuela</div>
                  <div className={styles.bpDetailValue}>{asientos.length > 0 ? asientos.join(', ') : 'Por asignar'}</div>
                </div>
              </>
            )}

            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Referencia</div>
              <div className={styles.bpDetailValue}>{referencia}</div>
            </div>
            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Método de pago</div>
              <div className={styles.bpDetailValue}>{metodosLabel[metodo]}</div>
            </div>
            <div className={styles.bpDetail}>
              <div className={styles.bpDetailLabel}>Total pagado</div>
              <div className={styles.bpDetailValue} style={{ color: 'var(--color-primary)' }}>
                {symbol}{convert(total)} {currency}
              </div>
            </div>
          </div>

          <div className={styles.voucherFooter}>
            <div className={styles.qrSection}>
              <div className={styles.barcodeLines} ref={barcodeRef} />
              <div className={styles.qrLabel}>
                {tipo === 'vuelo' ? 'BOARDING PASS' : 'SECURE VOUCHER'}
              </div>
            </div>
            <div className={styles.footerInfo}>
              <div className={styles.barcodeRef}>{referencia}</div>
              <div className={styles.footerStamp}>SkyNova Verified</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.emailCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <div className={styles.emailCardTitle}>Enviar voucher por correo</div>
          <div className={styles.emailCardSub}>
            Recibirás el comprobante de tu reserva con todos los detalles de tu compra.
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

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <button className={`${styles.btnAction} ${styles.btnPrimary}`} onClick={() => navigate('/')}>
            Realizar otra búsqueda
          </button>
          <button className={`${styles.btnAction} ${styles.btnOutline}`} onClick={() => window.print()}>
            Imprimir comprobante
          </button>
        </motion.div>

      </div>
    </div>
  )
}