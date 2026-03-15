import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import styles from './QuickSearch.module.css'

export default function QuickSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const { vuelos, loading } = useData()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const results = useMemo(() => {
    if (query.length < 2 || !vuelos) return []
    const q = query.toLowerCase()
    const seen = new Set()
    const unique = []
    
    for (const v of vuelos) {
      const match = 
        v.destino.toLowerCase().includes(q) || 
        v.origen.toLowerCase().includes(q) ||
        v.codigoDestino.toLowerCase().includes(q)
      
      if (match) {
        const routeId = `${v.origen}-${v.destino}`
        if (!seen.has(routeId)) {
          seen.add(routeId)
          unique.push(v)
        }
      }
      if (unique.length >= 5) break
    }
    return unique
  }, [query, vuelos])

  const handleSelect = (v) => {
    onClose()
    navigate('/vuelos', { 
      state: { 
        origen: `${v.origen} (${v.codigoOrigen})`, 
        destino: `${v.destino} (${v.codigoDestino})`, 
        fecha: new Date().toISOString().split('T')[0],
        activeTab: 'ida'
      } 
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay} 
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className={styles.modal} 
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className={styles.header}>
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                ref={inputRef}
                className={styles.input}
                placeholder="Busca destinos, ciudades o aeropuertos..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <div className={styles.shortcut}>ESC</div>
            </div>

            <div className={styles.body}>
              {!query && (
                <div className={styles.empty}>
                  <span>Escribe para empezar a buscar vuelos...</span>
                </div>
              )}

              {query && results.length === 0 && !loading && (
                <div className={styles.empty}>
                  <span>No encontramos vuelos para "{query}"</span>
                </div>
              )}

              {results.length > 0 && (
                <div className={styles.results}>
                  {results.map((v, i) => (
                    <motion.div 
                      key={v.id || i}
                      className={styles.item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelect(v)}
                    >
                      <div className={styles.itemInfo}>
                        <div className={styles.route}>
                          <span>{v.origen}</span>
                          <span className={styles.arrow}>→</span>
                          <span className={styles.dest}>{v.destino}</span>
                        </div>
                        <div className={styles.meta}>
                          {v.codigoDestino} • Vuelo directo • Clase Nova
                        </div>
                      </div>
                      <div className={styles.itemAction}>
                        Ver vuelos
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <span>Presiona <b>Enter</b> para seleccionar</span>
              <span>↑↓ para navegar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
