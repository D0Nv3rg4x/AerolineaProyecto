import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import styles from './Payment.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } })
}

const IMPUESTO = 0.19   // 19% IVA
const CARGO_SRV = 12     // cargo de servicio fijo USD

export default function Payment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { convert, symbol, currency } = useCurrency()

  const vuelo = state?.vuelo
  const paxData = state?.paxData ?? { adultos: 1, ninos: 0, infantes: 0, totalPax: 1 }
  const asientos = state?.asientos ?? []
  const totalConAsientos = state?.totalConAsientos ?? null

  // Redirigir si no hay vuelo
  if (!vuelo) { navigate('/'); return null }

  // ── Estado del formulario ──
  const [metodo, setMetodo] = useState('credito')
  const [paying, setPaying] = useState(false)
  const [errores, setErrores] = useState({})
  const [showErrorBanner, setShowErrorBanner] = useState(false)

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', rut: '',
    cardNum: '', cardName: '', cardExp: '', cardCvv: '',
    banco: '', cuentaNum: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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

  // Precios — usa totalConAsientos si viene de selección de asientos
  const base = totalConAsientos ?? (vuelo.precio * ((paxData.adultos) + (paxData.ninos ?? 0) * 0.75 + (paxData.infantes ?? 0) * 0.1))
  const impuesto = +(base * IMPUESTO).toFixed(2)
  const total = +(base + impuesto + CARGO_SRV).toFixed(2)

  // Validación básica
  const isExpValid = (v) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return false
    const [m, a] = v.split('/').map(Number)
    const now = new Date(2026, 2) // Marzo 2026 (index 2)
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
    if (!form.nombre.trim()) e.nombre = 'Nombre requerido'
    if (!form.apellido.trim()) e.apellido = 'Apellido requerido'
    if (!isEmailValid(form.email)) e.email = 'Email inválido'
    if (!isRUTValid(form.rut)) e.rut = 'RUT inválido'
    if (form.telefono.length < 9) e.telefono = 'Teléfono muy corto'
    
    if (metodo === 'credito' || metodo === 'debito') {
      if (form.cardNum.replace(/\s/g, '').length < 16) e.cardNum = 'Número inválido'
      if (!form.cardName.trim()) e.cardName = 'Requerido'
      if (!isExpValid(form.cardExp)) e.cardExp = 'Fecha expirada o inválida'
      if (form.cardCvv.length < 3) e.cardCvv = 'CVV inválido'
    }
    if (metodo === 'transferencia') {
      if (!form.banco.trim()) e.banco = 'Requerido'
      if (!form.cuentaNum.trim()) e.cuentaNum = 'Requerido'
    }
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
    // Simular procesamiento 2s
    await new Promise(r => setTimeout(r, 2000))
    setPaying(false)
    navigate('/confirmacion', {
      state: {
        vuelo, form, metodo, total, asientos,
        referencia: 'SN-' + Date.now().toString(36).toUpperCase().slice(-8),
      }
    })
  }

  const cardDisplay = form.cardNum || '•••• •••• •••• ••••'
  const nameDisplay = form.cardName || 'NOMBRE APELLIDO'
  const expDisplay = form.cardExp || 'MM/AA'

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.breadcrumb}>
            <a onClick={() => navigate('/')}>Inicio</a> ›
            <a onClick={() => navigate(-1)}>Vuelos</a> ›
            <span>Pago</span>
          </div>
          <h1 className={styles.pageTitle}>Completa tu reserva</h1>

          {/* Steps */}
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

      {/* BODY */}
      <div className={styles.body}>

        {/* ── PANEL IZQUIERDO ── */}
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

          {/* Datos del pasajero */}
          <motion.div className={styles.card} variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className={styles.cardTitle}>Datos del pasajero</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre</label>
                <input className={`${styles.input} ${errores.nombre ? styles.error : ''}`}
                  placeholder="Juan" value={form.nombre}
                  onChange={e => set('nombre', e.target.value)} />
                {errores.nombre && <span className={styles.errorMsg}>{errores.nombre}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Apellido</label>
                <input className={`${styles.input} ${errores.apellido ? styles.error : ''}`}
                  placeholder="García" value={form.apellido}
                  onChange={e => set('apellido', e.target.value)} />
                {errores.apellido && <span className={styles.errorMsg}>{errores.apellido}</span>}
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>RUT / Pasaporte</label>
                <div style={{ position: 'relative' }}>
                  <input className={`${styles.input} ${errores.rut ? styles.error : ''}`} 
                    placeholder="12.345.678-9"
                    value={form.rut} onChange={e => set('rut', fmtRUT(e.target.value))} />
                  {isRUTValid(form.rut) && <span style={{ position: 'absolute', right: 12, top: 12, color: '#4ade80', fontWeight: 'bold' }}>✓</span>}
                </div>
                {errores.rut && <span className={styles.errorMsg}>{errores.rut}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Teléfono</label>
                <input className={`${styles.input} ${errores.telefono ? styles.error : ''}`} 
                  placeholder="+56 9 1234 5678"
                  value={form.telefono} onChange={e => set('telefono', fmtPhone(e.target.value))} />
                {errores.telefono && <span className={styles.errorMsg}>{errores.telefono}</span>}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <input className={`${styles.input} ${errores.email ? styles.error : ''}`}
                  type="email" placeholder="juan@email.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
                {form.email && (
                  isEmailValid(form.email) 
                    ? <span style={{ position: 'absolute', right: 12, top: 12, color: '#4ade80', fontWeight: 'bold' }}>✓</span>
                    : <span style={{ position: 'absolute', right: 12, top: 12, color: '#f87171', fontWeight: 'bold' }}>✕</span>
                )}
              </div>
              {errores.email && <span className={styles.errorMsg}>{errores.email}</span>}
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                El voucher se enviará a este correo
              </span>
            </div>
          </motion.div>

          {/* Método de pago */}
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

            {/* Formulario tarjeta crédito/débito */}
            {(metodo === 'credito' || metodo === 'debito') && (
              <>
                {/* Vista previa tarjeta */}
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
                        color: form.cardExp.length === 5 && !isExpValid(form.cardExp) ? '#ffa5a5' : 'inherit' 
                      }}>
                        {expDisplay}
                        {form.cardExp.length === 5 && (
                          isExpValid(form.cardExp)
                            ? <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 900 }}>✓</span>
                            : <span style={{ color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 900 }}>✕</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className={styles.cardPreviewLabel}>CVV</div>
                      <div className={styles.cardPreviewValue} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {form.cardCvv || '•••'}
                        {form.cardCvv.length >= 3 && (
                          <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 900 }}>✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {form.cardNum.replace(/\s/g, '').length === 16 && 
                   isExpValid(form.cardExp) && 
                   form.cardCvv.length >= 3 && (
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
                    placeholder="1234 5678 9012 3456" value={form.cardNum}
                    onChange={e => set('cardNum', fmtCard(e.target.value))} />
                  {errores.cardNum && <span className={styles.errorMsg}>{errores.cardNum}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre en la tarjeta</label>
                  <input className={`${styles.input} ${errores.cardName ? styles.error : ''}`}
                    placeholder="JUAN GARCÍA" value={form.cardName}
                    onChange={e => set('cardName', e.target.value.toUpperCase())} />
                  {errores.cardName && <span className={styles.errorMsg}>{errores.cardName}</span>}
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Vencimiento</label>
                    <input className={`${styles.input} ${errores.cardExp ? styles.error : ''}`}
                      placeholder="MM/AA" value={form.cardExp}
                      onChange={e => set('cardExp', fmtExp(e.target.value))} />
                    {errores.cardExp && <span className={styles.errorMsg}>{errores.cardExp}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CVV</label>
                    <input className={`${styles.input} ${errores.cardCvv ? styles.error : ''}`}
                      placeholder="123" maxLength={4} value={form.cardCvv}
                      onChange={e => set('cardCvv', e.target.value.replace(/\D/g, ''))} />
                    {errores.cardCvv && <span className={styles.errorMsg}>{errores.cardCvv}</span>}
                  </div>
                </div>
              </>
            )}

            {/* Transferencia */}
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
                    placeholder="Ej: Banco de Chile" value={form.banco}
                    onChange={e => set('banco', e.target.value)} />
                  {errores.banco && <span className={styles.errorMsg}>{errores.banco}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>N° de cuenta origen</label>
                  <input className={`${styles.input} ${errores.cuentaNum ? styles.error : ''}`}
                    placeholder="Ej: 0123456789" value={form.cuentaNum}
                    onChange={e => set('cuentaNum', e.target.value.replace(/\D/g, ''))} />
                  {errores.cuentaNum && <span className={styles.errorMsg}>{errores.cuentaNum}</span>}
                </div>
              </>
            )}

          </motion.div>
        </div>

        {/* ── PANEL DERECHO — RESUMEN ── */}
        <motion.div className={styles.summary} variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <div className={styles.summaryTitle}>Resumen de tu viaje</div>

          {/* Vuelo */}
          <div className={styles.flightSummary}>
            <div className={styles.flightSummaryRoute}>
              <span className={styles.fsCode}>{vuelo.codigoOrigen}</span>
              <span className={styles.fsArrow}>→</span>
              <span className={styles.fsCode}>{vuelo.codigoDestino}</span>
            </div>
            <div className={styles.fsMeta}>
              <div className={styles.fsItem}>
                <div className={styles.fsLabel}>Vuelo</div>
                <div className={styles.fsValue}>{vuelo.id}</div>
              </div>
              <div className={styles.fsItem}>
                <div className={styles.fsLabel}>Avión</div>
                <div className={styles.fsValue}>{vuelo.avion}</div>
              </div>
              <div className={styles.fsItem}>
                <div className={styles.fsLabel}>Salida</div>
                <div className={styles.fsValue}>{vuelo.salida}</div>
              </div>
              <div className={styles.fsItem}>
                <div className={styles.fsLabel}>Llegada</div>
                <div className={styles.fsValue}>{vuelo.llegada}</div>
              </div>
              <div className={styles.fsItem}>
                <div className={styles.fsLabel}>Duración</div>
                <div className={styles.fsValue}>{vuelo.duracion}</div>
              </div>
              <div className={styles.fsItem}>
                <div className={styles.fsLabel}>Pasajeros</div>
                <div className={styles.fsValue}>{paxData.totalPax ?? 1}</div>
              </div>
              {asientos.length > 0 && (
                <div className={styles.fsItem} style={{ gridColumn: 'span 2' }}>
                  <div className={styles.fsLabel}>Asientos</div>
                  <div className={styles.fsValue}>{asientos.join(', ')}</div>
                </div>
              )}
            </div>
          </div>

          {/* Precio desglosado */}
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

          <button className={styles.btnPay} onClick={handlePagar} disabled={paying}>
            {paying
              ? <><span className={styles.spinner} /> Procesando...</>
              : `Pagar ${symbol}${convert(total)} ${currency}`
            }
          </button>

          <div className={styles.secureNote}>
            Pago 100% simulado — ningún cargo real
          </div>
        </motion.div>

      </div>
    </div>
  )
}