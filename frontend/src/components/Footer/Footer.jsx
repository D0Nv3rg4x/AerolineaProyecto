import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import logo from '../../assets/logo.png'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="SkyNova" className={styles.logoImg} />
            <div className={styles.logoName}>Sky<span>Nova</span></div>
          </Link>
          <p className={styles.brandDesc}>
            Elevando tus experiencias de viaje con tecnología de vanguardia y un servicio de clase mundial desde 2026.
          </p>
          <div className={styles.socials}>
            {['𝕏', 'f', 'ig', 'in'].map(s => (
              <a key={s} href="#" className={styles.socialIcon}>{s}</a>
            ))}
          </div>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Descubre</h4>
          <ul className={styles.links}>
            <li><Link to="/vuelos">Buscar Vuelos</Link></li>
            <li><Link to="/">Destinos Premium</Link></li>
            <li><Link to="/">Ofertas Especiales</Link></li>
            <li><Link to="/">SkyPriority</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>Soporte</h4>
          <ul className={styles.links}>
            <li><Link to="/">Centro de Ayuda</Link></li>
            <li><Link to="/">Estado del Vuelo</Link></li>
            <li><Link to="/">Reclamarciones</Link></li>
            <li><Link to="/">Contacto</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4 className={styles.colTitle}>SkyNova</h4>
          <ul className={styles.links}>
            <li><Link to="/">Nuestra Flota</Link></li>
            <li><Link to="/">Sostenibilidad</Link></li>
            <li><Link to="/">Carreras</Link></li>
            <li><Link to="/">Prensa</Link></li>
          </ul>
        </div>

      </div>

      <div className={styles.bottom}>
        <div>© 2026 SkyNova Airlines. Todos los derechos reservados.</div>
        <div className={styles.legal}>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/terminos">Términos</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  )
}
