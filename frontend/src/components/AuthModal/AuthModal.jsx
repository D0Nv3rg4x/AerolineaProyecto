import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext.jsx'
import logo from '../../assets/logo.png'
import styles from './AuthModal.module.css'

export default function AuthModal() {
  const { setAuthModal, login, register } = useAuth()
  const [tab,     setTab]     = useState('login')
  const [error,   setError]   = useState('')
  const [form,    setForm]    = useState({ nombre:'', apellido:'', email:'', password:'' })

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setError('') }

  const handleSubmit = () => {
    if (tab === 'login') {
      const res = login(form.email, form.password)
      if (!res.ok) return setError(res.error)
    } else {
      if (!form.nombre || !form.apellido || !form.email || !form.password)
        return setError('Completa todos los campos')
      if (form.password.length < 6)
        return setError('La contraseña debe tener al menos 6 caracteres')
      const res = register(form.nombre, form.apellido, form.email, form.password)
      if (!res.ok) return setError(res.error)
    }
    setAuthModal(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setAuthModal(false)}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={e => e.stopPropagation()}
        >
          <button className={styles.close} onClick={() => setAuthModal(false)}>✕</button>

          <div className={styles.modalLogo}>
            <img src={logo} alt="SkyNova" className={styles.logoImg} />
            <span className={styles.logoName}>Sky<span>Nova</span></span>
          </div>

          <h2 className={styles.title}>
            {tab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h2>
          <p className={styles.sub}>
            {tab === 'login'
              ? 'Inicia sesión para ver tus reservas'
              : 'Regístrate gratis para guardar tus vuelos'}
          </p>

          <div className={styles.modalTabs}>
            <button className={`${styles.tab} ${tab === 'login'    ? styles.active : ''}`} onClick={() => { setTab('login');    setError('') }}>Iniciar sesión</button>
            <button className={`${styles.tab} ${tab === 'register' ? styles.active : ''}`} onClick={() => { setTab('register'); setError('') }}>Registrarse</button>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          {tab === 'register' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre</label>
                <input className={styles.input} id="nombre" name="nombre" placeholder="Juan" autoComplete="given-name" value={form.nombre}
                  onChange={e => set('nombre', e.target.value)} onKeyDown={handleKey} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Apellido</label>
                <input className={styles.input} id="apellido" name="apellido" placeholder="García" autoComplete="family-name" value={form.apellido}
                  onChange={e => set('apellido', e.target.value)} onKeyDown={handleKey} />
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Correo electrónico</label>
            <input className={styles.input} id="email" name="email" type="email" placeholder="tu@correo.com" autoComplete="email"
              value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={handleKey} />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Contraseña</label>
            <input className={styles.input} id="password" name="password" type="password" placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={handleKey} />
          </div>

          <button className={styles.btnSubmit} onClick={handleSubmit}>
            {tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>

          {tab === 'login' && (
            <div className={styles.demoNote}>
              Cuenta demo: <strong>demo@skynova.cl</strong> / <strong>123456</strong>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
