import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import usePageTitle from '../../hooks/usePageTitle'
import styles from './Payment.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } })
}

const IMPUESTO = 0.19
const CARGO_SRV = 12

export default function Payment() {
  usePageTitle('Pago');
  const { state } = useLocation()
  const navigate = useNavigate()
  const { convert, symbol, currency } = useCurrency()

  const { producto, tipo, paxData = { adultos: 1, ninos: 0, infantes: 0, totalPax: 1 }, extraData = {} } = state || {}
  const { asientos = [], totalConAsientos = null, noches = 1 } = extraData

  if (!producto) { navigate('/'); return null }

  const [metodo, setMetodo] = useState('credito')
  const [paying, setPaying] = useState(false)
  const [errores, setErrores] = useState({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showErrorBanner, setShowErrorBanner] = useState(false)

  const [passengers, setPassengers] = useState(
    Array.from({ length: paxData.totalPax || 1 }, () => ({ nombre: '', apellido: '', rut: '' }))
  )

  const [contact, setContact] = useState({ email: '', telefono: '' })
  
  const [payment, setPayment] = useState({
    cardNum: '', cardName: '', cardExp: '', cardCvv: '',
    banco: '', cuentaNum: '',
  })

  const setPax = (idx, k, v) => {
    const newPax = [...passengers]
    newPax[idx][k] = v
    setPassengers(newPax)
  }

  const setCont = (k, v) => setContact(f => ({ ...f, [k]: v }))
  const setPay = (k, v) => setPayment(f => ({ ...f, [k]: v }))

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }
  const fmtPhone = (v) => v.replace(/[^\d+]/g, '').slice(0, 15)
  const fmtRUT = (v) => {
    let value = v.replace(/[^\dkK]/g, '').toUpperCase()
    if (value.length > 1) {
      const dv = value.slice(-1)
      const num = value.slice(0, -1).slice(0, 8)
      value = num.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + '-' + dv
    }
    return value
  }

  let base = 0
  if (totalConAsientos) {
    base = totalConAsientos
  } else if (tipo === 'vuelo') {
    base = (producto.precio * ((paxData.adultos) + (paxData.ninos ?? 0) * 0.75 + (paxData.infantes ?? 0) * 0.1))
  } else if (tipo === 'alojamiento') {
    base = (producto.precioPorNoche * noches) * paxData.totalPax
  } else if (tipo === 'paquete') {
    base = (producto.price || producto.precio) * paxData.totalPax
  } else if (tipo === 'oferta') {
    base = producto.precioOferta * paxData.totalPax
  }

  const impuesto = +(base * IMPUESTO).toFixed(2)
  const total = +(base + impuesto + CARGO_SRV).toFixed(2)

  const isExpValid = (v) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return false
    const [m, a] = v.split('/').map(Number)
    const now = new Date(2026, 2)
    const currentYearShort = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1
    if (a < currentYearShort) return false
    if (a === currentYearShort && m < currentMonth) return false
    return true
  }

  const isRUTValid = (rut) => {
    if (!/^[0-9.]+-[0-9kK]{1}$/.test(rut)) return false
    let [num, dv] = rut.replace(/\./g, '').split('-')
    if (dv.toUpperCase() === 'K') dv = 'k'
    
    let sum = 0
    let mul = 2
    for (let i = num.length - 1; i >= 0; i--) {
      sum += num[i] * mul
      mul = mul === 7 ? 2 : mul + 1
    }
    const res = 11 - (sum % 11)
    const dvr = res === 11 ? '0' : res === 10 ? 'k' : res.toString()
    return dv === dvr
  }

  const isEmailValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const validar = () => {
    const e = {}
    
    const paxErrors = []
    passengers.forEach((p, i) => {
      const pe = {}
      if (!p.nombre.trim()) pe.nombre = 'Requerido'
      if (!p.apellido.trim()) pe.apellido = 'Requerido'
      if (!isRUTValid(p.rut)) pe.rut = 'Invalido'
      if (Object.keys(pe).length > 0) paxErrors[i] = pe
    })
    if (paxErrors.length > 0) e.passengers = paxErrors

    if (!isEmailValid(contact.email)) e.email = 'Email inválido'
    if (contact.telefono.length < 9) e.telefono = 'Teléfono muy corto'
    
    if (metodo === 'credito' || metodo === 'debito') {
      if (payment.cardNum.replace(/\s/g, '').length < 16) e.cardNum = 'Número inválido'
      if (!payment.cardName.trim()) e.cardName = 'Requerido'
      if (!isExpValid(payment.cardExp)) e.cardExp = 'Fecha expirada o inválida'
      if (payment.cardCvv.length < 3) e.cardCvv = 'CVV inválido'
    }
    if (metodo === 'transferencia') {
      if (!payment.banco.trim()) e.banco = 'Requerido'
      if (!payment.cuentaNum.trim()) e.cuentaNum = 'Requerido'
    }

    if (!acceptedTerms) e.terms = 'Debes aceptar los términos y condiciones'

    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handlePagar = async () => {
    if (!validar()) {
      setShowErrorBanner(true)
      window.scrollTo({ top: 300, behavior: 'smooth' })
      return
    }
    setShowErrorBanner(false)
    setPaying(true)
    await new Promise(r => setTimeout(r, 2000))
    setPaying(false)
    navigate('/confirmacion', {
      state: {
        producto, tipo, 
        form: { ...passengers[0], ...contact },
        passengers,
        metodo, total, extraData,
        referencia: 'SN-' + Date.now().toString(36).toUpperCase().slice(-8),
      }
    })
  }

  const cardDisplay = payment.cardNum || '•••• •••• •••• ••••'
  const nameDisplay = payment.cardName || 'NOMBRE APELLIDO'
  const expDisplay = payment.cardExp || 'MM/AA'

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a> ›
            <a onClick={() => navigate(-1)}>Vuelos</a> ›
            <span>Pago</span>
          </div>
          <h1 className={styles.pageTitle}>Completa tu reserva</h1>

          <div className={styles.steps}>
            {[
              { n: 1, label: 'Vuelo seleccionado', done: true },
              { n: 2, label: 'Datos y pago', active: true },
              { n: 3, label: 'Confirmación' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`${styles.step} ${s.active ? styles.active : ''} ${s.done ? styles.done : ''}`}>
                  <div className={styles.stepNum}>{s.done ? '✓' : s.n}</div>
                  {s.label}
                </div>
                {i < 2 && <div className={styles.stepLine} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>

        <div className={styles.formPanel}>
          
          {showErrorBanner && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.errorBanner}
            >
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <div>
                <strong>Revisa los datos ingresados</strong>
                <p>Hay campos vacíos o con errores que debes corregir para continuar.</p>
              </div>
              <button onClick={() => setShowErrorBanner(false)} style={{ marginLeft: 'auto', fontSize: '1.2rem', opacity: 0.5 }}>✕</button>
            </motion.div>
          )}

          {passengers.map((p, i) => (
            <motion.div key={i} className={styles.card} variants={fadeUp} initial="hidden" animate="visible" custom={i * 0.1}>
              <div className={styles.cardTitle}>
                {tipo === 'alojamiento' ? `Huésped ${i + 1}` : `Pasajero ${i + 1}`}
                {i === 0 && <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginLeft: '10px' }}>(Titular)</span>}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre</label>
                  <input className={`${styles.input} ${errores.passengers?.[i]?.nombre ? styles.error : ''}`}
                    placeholder="Juan" value={p.nombre}
                    onChange={e => setPax(i, 'nombre', e.target.value)} />
                  {errores.passengers?.[i]?.nombre && <span className={styles.errorMsg}>{errores.passengers[i].nombre}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Apellido</label>
                  <input className={`${styles.input} ${errores.passengers?.[i]?.apellido ? styles.error : ''}`}
                    placeholder="García" value={p.apellido}
                    onChange={e => setPax(i, 'apellido', e.target.value)} />
                  {errores.passengers?.[i]?.apellido && <span className={styles.errorMsg}>{errores.passengers[i].apellido}</span>}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>RUT / Pasaporte</label>
                <div style={{ position: 'relative' }}>
                  <input className={`${styles.input} ${errores.passengers?.[i]?.rut ? styles.error : ''}`} 
                    placeholder="12.345.678-9"
                    value={p.rut} onChange={e => setPax(i, 'rut', fmtRUT(e.target.value))} />
                  {isRUTValid(p.rut) && <span style={{ position: 'absolute', right: 12, top: 12, color: '#4ade80', fontWeight: 'bold' }}>✓</span>}
                </div>
                {errores.passengers?.[i]?.rut && <span className={styles.errorMsg}>{errores.passengers[i].rut}</span>}
              </div>
            </motion.div>
          ))}

          <motion.div className={styles.card} variants={fadeUp} initial="hidden" animate="visible" custom={0.3}>
            <div className={styles.cardTitle}>Información de contacto</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Correo electrónico</label>
                <div style={{ position: 'relative' }}>
                  <input className={`${styles.input} ${errores.email ? styles.error : ''}`}
                    type="email" placeholder="juan@email.com"
                    value={contact.email} onChange={e => setCont('email', e.target.value)} />
                  {contact.email && (
                    isEmailValid(contact.email) 
                      ? <span style={{ position: 'absolute', right: 12, top: 12, color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                      : <span style={{ position: 'absolute', right: 12, top: 12, color: '#f87171', fontWeight: 'bold' }}>✕</span>
                  )}
                </div>
                {errores.email && <span className={styles.errorMsg}>{errores.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Teléfono</label>
                <input className={`${styles.input} ${errores.telefono ? styles.error : ''}`} 
                  placeholder="+56 9 1234 5678"
                  value={contact.telefono} onChange={e => setCont('telefono', fmtPhone(e.target.value))} />
                {errores.telefono && <span className={styles.errorMsg}>{errores.telefono}</span>}
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              El voucher y comprobantes se enviarán a este contacto.
            </span>
          </motion.div>

          <motion.div className={styles.card} variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <div className={styles.cardTitle}>Método de pago</div>

            <div className={styles.payMethods}>
              {[
                { id: 'credito', icon: '', label: 'Crédito' },
                { id: 'debito', icon: '', label: 'Débito' },
                { id: 'transferencia', icon: '', label: 'Transferencia' },
              ].map(m => (
                <div
                  key={m.id}
                  className={`${styles.payMethod} ${metodo === m.id ? styles.selected : ''}`}
                  onClick={() => setMetodo(m.id)}
                >
                  <div className={styles.payMethodIcon}>{m.icon}</div>
                  <div className={styles.payMethodLabel}>{m.label}</div>
                </div>
              ))}
            </div>

            {(metodo === 'credito' || metodo === 'debito') && (
              <>
                <div className={styles.cardPreview}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: 1.5, opacity: 0.9 }}>
                      SKYNOVA <span style={{ fontWeight: 300 }}>PREMIUM</span>
                    </div>
                    <div style={{ width: 40, height: 26, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />
                  </div>
                  
                  <div className={styles.cardPreviewNum}>{cardDisplay}</div>
                  
                  <div className={styles.cardPreviewBottom}>
                    <div>
                      <div className={styles.cardPreviewLabel}>Titular</div>
                      <div className={styles.cardPreviewValue}>{nameDisplay}</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div className={styles.cardPreviewLabel}>Vence</div>
                      <div className={styles.cardPreviewValue} style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px',
                        color: payment.cardExp.length === 5 && !isExpValid(payment.cardExp) ? '#ffa5a5' : 'inherit' 
                      }}>
                        {expDisplay}
                        {payment.cardExp.length === 5 && (
                          isExpValid(payment.cardExp)
                            ? <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 900 }}>✓</span>
                            : <span style={{ color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 900 }}>✕</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className={styles.cardPreviewLabel}>CVV</div>
                      <div className={styles.cardPreviewValue} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {payment.cardCvv || '•••'}
                        {payment.cardCvv.length >= 3 && (
                          <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 900 }}>✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {payment.cardNum.replace(/\s/g, '').length === 16 && 
                   isExpValid(payment.cardExp) && 
                   payment.cardCvv.length >= 3 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ 
                        position: 'absolute', top: 12, right: 12, 
                        background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.6rem',
                        fontWeight: 800, border: '1px solid rgba(74, 222, 128, 0.4)',
                        letterSpacing: '1px'
                      }}
                    >
                      VERIFICADA
                    </motion.div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Número de tarjeta</label>
                  <input className={`${styles.input} ${errores.cardNum ? styles.error : ''}`}
                    placeholder="1234 5678 9012 3456" value={payment.cardNum}
                    onChange={e => setPay('cardNum', fmtCard(e.target.value))} />
                  {errores.cardNum && <span className={styles.errorMsg}>{errores.cardNum}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre en la tarjeta</label>
                  <input className={`${styles.input} ${errores.cardName ? styles.error : ''}`}
                    placeholder="JUAN GARCÍA" value={payment.cardName}
                    onChange={e => setPay('cardName', e.target.value.toUpperCase())} />
                  {errores.cardName && <span className={styles.errorMsg}>{errores.cardName}</span>}
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Vencimiento</label>
                    <input className={`${styles.input} ${errores.cardExp ? styles.error : ''}`}
                      placeholder="MM/AA" value={payment.cardExp}
                      onChange={e => setPay('cardExp', fmtExp(e.target.value))} />
                    {errores.cardExp && <span className={styles.errorMsg}>{errores.cardExp}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CVV</label>
                    <input className={`${styles.input} ${errores.cardCvv ? styles.error : ''}`}
                      placeholder="123" maxLength={4} value={payment.cardCvv}
                      onChange={e => setPay('cardCvv', e.target.value.replace(/\D/g, ''))} />
                    {errores.cardCvv && <span className={styles.errorMsg}>{errores.cardCvv}</span>}
                  </div>
                </div>
              </>
            )}

            {metodo === 'transferencia' && (
              <>
                <div className={styles.transferInfo}>
                  <strong>Datos para transferencia</strong>
                  Banco: SkyNova Bank Chile<br />
                  Cuenta corriente: 000-123456-78<br />
                  RUT: 76.543.210-K<br />
                  Email: pagos@skynova.cl<br />
                  <br />
                  Ingresa tus datos para validar el pago:
                </div>
                <br />
                <div className={styles.formGroup}>
                  <label className={styles.label}>Banco de origen</label>
                  <input className={`${styles.input} ${errores.banco ? styles.error : ''}`}
                    placeholder="Ej: Banco de Chile" value={payment.banco}
                    onChange={e => setPay('banco', e.target.value)} />
                  {errores.banco && <span className={styles.errorMsg}>{errores.banco}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>N° de cuenta origen</label>
                  <input className={`${styles.input} ${errores.cuentaNum ? styles.error : ''}`}
                    placeholder="Ej: 0123456789" value={payment.cuentaNum}
                    onChange={e => setPay('cuentaNum', e.target.value.replace(/\D/g, ''))} />
                  {errores.cuentaNum && <span className={styles.errorMsg}>{errores.cuentaNum}</span>}
                </div>
              </>
            )}

          </motion.div>
        </div>

        <motion.div className={styles.summary} variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <div className={styles.summaryTitle}>Resumen de tu compra</div>

          {tipo === 'vuelo' && (
            <div className={styles.productSummary}>
              <div className={styles.flightSummaryRoute}>
                <span className={styles.fsCode}>{producto.codigoOrigen}</span>
                <span className={styles.fsArrow}>→</span>
                <span className={styles.fsCode}>{producto.codigoDestino}</span>
              </div>
              <div className={styles.fsMeta}>
                <div className={styles.fsItem}>
                  <div className={styles.fsLabel}>Vuelo</div>
                  <div className={styles.fsValue}>{producto.id}</div>
                </div>
                <div className={styles.fsItem}>
                  <div className={styles.fsLabel}>Salida</div>
                  <div className={styles.fsValue}>{producto.salida}</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.paxSummaryList}>
            <div className={styles.fsLabel} style={{ marginBottom: 8 }}>{tipo === 'alojamiento' ? 'Huéspedes' : 'Viajeros'}</div>
            {passengers.map((p, i) => (
              <div key={i} className={styles.paxSummaryItem}>
                <div className={styles.paxSummaryIcon}>{tipo === 'alojamiento' ? '👤' : '✈️'}</div>
                <div className={styles.paxSummaryName}>
                   {p.nombre || p.apellido ? `${p.nombre} ${p.apellido}` : `Viajero ${i + 1}`}
                </div>
                {asientos[i] && <div className={styles.paxSummarySeat}>{asientos[i]}</div>}
              </div>
            ))}
          </div>

          <div className={styles.fsItem} style={{ marginTop: 16 }}>
            <div className={styles.fsLabel}>Total viajeros</div>
            <div className={styles.fsValue}>{paxData.totalPax ?? 1}</div>
          </div>

          <div className={styles.priceBreakdown}>
            <div className={styles.priceRow}>
              <span className={styles.priceRowLabel}>Tarifa base</span>
              <span className={styles.priceRowValue}>{symbol}{convert(base)} {currency}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.priceRowLabel}>Impuestos (19%)</span>
              <span className={styles.priceRowValue}>{symbol}{convert(impuesto)} {currency}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.priceRowLabel}>Cargo de servicio</span>
              <span className={styles.priceRowValue}>{symbol}{convert(CARGO_SRV)} {currency}</span>
            </div>
          </div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalAmount}>{symbol}{convert(total)} {currency}</span>
          </div>

          <div className={styles.termsRow}>
            <label className={styles.checkboxContainer}>
              <input 
                type="checkbox" 
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.termsText}>
                Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a> de SkyNova.
              </span>
            </label>
            {errores.terms && <div className={styles.errorMsg} style={{ marginTop: 4 }}>{errores.terms}</div>}
          </div>

          <button className={styles.btnPay} onClick={handlePagar} disabled={paying}>
            {paying
              ? <><span className={styles.spinner} /> Procesando...</>
              : `Pagar ${symbol}${convert(total)} ${currency}`
            }
          </button>

          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>🔒 SSL</div>
            <div className={styles.trustBadge}>💳 PCI-DSS</div>
            <div className={styles.trustBadge}>🛡️ Secure</div>
          </div>

          <div className={styles.secureNote}>
            Pago 100% simulado — ningún cargo real
          </div>
        </motion.div>

      </div>
    </div>
  )
}