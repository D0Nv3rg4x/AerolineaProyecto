import { useState, useEffect, useRef } from 'react'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import styles from './PassengerSelector.module.css'

export default function PassengerSelector({ initialData, onChange, variant = 'light', priceBase = null }) {
    const { convert, symbol, currency } = useCurrency()
    const [open, setOpen] = useState(false)
    const [adultos, setAdultos] = useState(initialData?.adultos ?? 1)
    const [ninos, setNinos] = useState(initialData?.ninos ?? 0)
    const [infantes, setInfantes] = useState(initialData?.infantes ?? 0)
    const ref = useRef(null)

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Notificar cambios al padre
    useEffect(() => {
        if (onChange) {
            const totalPax = adultos + ninos + infantes
            const totalPrecio = priceBase * (adultos + ninos * 0.75 + infantes * 0.1)
            onChange({ adultos, ninos, infantes, totalPax, totalPrecio: +totalPrecio.toFixed(2) })
        }
    }, [adultos, ninos, infantes, priceBase])

    const totalPax = adultos + ninos + infantes
    const totalPrecio = priceBase * (adultos + ninos * 0.75 + infantes * 0.1)

    const label = () => {
        const parts = []
        if (adultos) parts.push(`${adultos} adulto${adultos > 1 ? 's' : ''}`)
        if (ninos) parts.push(`${ninos} niño${ninos > 1 ? 's' : ''}`)
        if (infantes) parts.push(`${infantes} infante${infantes > 1 ? 's' : ''}`)
        return parts.join(', ') || '1 adulto'
    }

    const triggerClass = variant === 'light'
        ? `${styles.triggerLight} ${open ? styles.open : ''}`
        : variant === 'mini'
            ? `${styles.triggerMini} ${open ? styles.open : ''}`
            : `${styles.trigger} ${open ? styles.open : ''}`

    const adjust = (setter, current, delta, min = 0, max = 9) => {
        const next = current + delta
        if (next >= min && next <= max) setter(next)
    }

    return (
        <div className={styles.wrapper} ref={ref}>
            <button className={triggerClass} onClick={() => setOpen(o => !o)} type="button">
                <span>{label()}</span>
                <span className={styles.triggerChevron}>{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className={styles.dropdown}>

                    {/* Adultos */}
                    <div className={styles.row}>
                        <div className={styles.rowInfo}>
                            <div className={styles.rowLabel}>Adultos</div>
                            <div className={styles.rowSub}>12 años o más</div>
                        </div>
                        <div className={styles.counter}>
                            <button className={styles.btn} onClick={() => adjust(setAdultos, adultos, -1, 1)} disabled={adultos <= 1}>−</button>
                            <span className={styles.count}>{adultos}</span>
                            <button className={styles.btn} onClick={() => adjust(setAdultos, adultos, +1, 1, 9)}>+</button>
                        </div>
                    </div>

                    {/* Niños */}
                    <div className={styles.row}>
                        <div className={styles.rowInfo}>
                            <div className={styles.rowLabel}>Niños</div>
                            <div className={styles.rowSub}>2 a 11 años · 75% del precio</div>
                        </div>
                        <div className={styles.counter}>
                            <button className={styles.btn} onClick={() => adjust(setNinos, ninos, -1)} disabled={ninos <= 0}>−</button>
                            <span className={styles.count}>{ninos}</span>
                            <button className={styles.btn} onClick={() => adjust(setNinos, ninos, +1, 0, 9)}>+</button>
                        </div>
                    </div>

                    {/* Infantes */}
                    <div className={styles.row}>
                        <div className={styles.rowInfo}>
                            <div className={styles.rowLabel}>Infantes</div>
                            <div className={styles.rowSub}>Menores de 2 años · 10% del precio</div>
                        </div>
                        <div className={styles.counter}>
                            <button className={styles.btn} onClick={() => adjust(setInfantes, infantes, -1)} disabled={infantes <= 0}>−</button>
                            <span className={styles.count}>{infantes}</span>
                            <button className={styles.btn} onClick={() => adjust(setInfantes, infantes, +1, 0, adultos)} disabled={infantes >= adultos}>+</button>
                        </div>
                    </div>

                    {/* Total si hay precio base */}
                    {priceBase > 0 && (
                        <div className={styles.total}>
                            <span>{totalPax} pasajero{totalPax !== 1 ? 's' : ''}</span>
                            <span className={styles.totalPrice}>
                                {symbol}{convert(totalPrecio)} {currency}
                            </span>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}