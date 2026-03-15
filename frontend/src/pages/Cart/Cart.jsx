import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext.jsx';
import { useCurrency } from '../../context/CurrencyContext.jsx';
import styles from './Cart.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 }
  })
};

export default function Cart() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { convert, symbol, currency } = useCurrency();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || item.precio || 0), 0);
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className={styles.emptyContent}
        >
          <div className={styles.emptyIcon}>🛒</div>
          <h2 className={styles.emptyTitle}>Tu carrito está vacío</h2>
          <p className={styles.emptyText}>Parece que aún no has añadido ninguna aventura a tu lista.</p>
          <button className={styles.btnExplore} onClick={() => navigate('/paquetes')}>
            Explorar Paquetes
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Tu Carrito</h1>
          <p className={styles.subtitle}>Revisa tus selecciones antes de despegar.</p>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.itemList}>
          <AnimatePresence>
            {cartItems.map((item, i) => (
              <motion.div 
                key={item.id}
                layout
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -50 }}
                custom={i}
                className={styles.cartItem}
              >
                <div className={styles.itemImageContainer}>
                  <img src={item.imagen} alt={item.nombre} className={styles.itemImage} />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemType}>{item.type === 'package' ? 'PAQUETE' : 'VUELO'}</span>
                    <h3 className={styles.itemName}>{item.nombre || `${item.origen} → ${item.destino}`}</h3>
                  </div>
                  <div className={styles.itemDetails}>
                    {item.type === 'package' ? (
                      <>
                        <span>🏢 {item.hotel}</span>
                        <span>📅 {item.duracion}</span>
                      </>
                    ) : (
                      <>
                        <span>✈️ {item.aerolinea}</span>
                        <span>⏰ {item.salida}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.itemPriceAction}>
                  <div className={styles.itemPrice}>
                    {symbol}{convert(item.price || item.precio)}
                  </div>
                  <button className={styles.btnRemove} onClick={() => removeFromCart(item.id)}>
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <button className={styles.btnClear} onClick={clearCart}>Limpiar carrito</button>
        </div>

        <aside className={styles.summary}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Resumen de orden</h3>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{symbol}{convert(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tasas e impuestos</span>
              <span>{symbol}{convert(taxes)}</span>
            </div>
            <div className={styles.divider} />
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>{symbol}{convert(total)} <small>{currency}</small></span>
            </div>
            <button className={styles.btnCheckout} onClick={() => alert('Próximamente: Integración con pasarela de pago')}>
              Confirmar Reserva
            </button>
            <p className={styles.secureText}>🔒 Pago seguro y encriptado</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
