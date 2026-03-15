import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home.jsx'
import Flights from './pages/Flights/Flights.jsx'
import SeatSelection from './pages/SeatSelection/SeatSelection.jsx'
import Payment from './pages/Payment/Payment.jsx'
import Confirmation from './pages/Confirmation/Confirmation.jsx'
import Bookings from './pages/Bookings/Bookings.jsx'
import Privacy from './pages/Legal/Privacy.jsx'
import Terms from './pages/Legal/Terms.jsx'
import Cookies from './pages/Legal/Cookies.jsx'
import Profile from './pages/Profile/Profile.jsx'
import PersonalInfo from './pages/Profile/PersonalInfo.jsx'
import SecuritySettings from './pages/Profile/SecuritySettings.jsx'
import PreferencesSettings from './pages/Profile/PreferencesSettings.jsx'
import PaymentMethodsSettings from './pages/Profile/PaymentMethodsSettings.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import ErrorPage from './pages/ErrorPage/ErrorPage.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import Footer from './components/Footer/Footer.jsx'
import AuthModal from './components/AuthModal/AuthModal.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DarkModeProvider } from './context/DarkModeContext.jsx'
import { useLocation } from 'react-router-dom'

function AppInner() {
  const { authModal } = useAuth()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const allRoutes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vuelos" element={<Flights />} />
      <Route path="/asientos" element={<SeatSelection />} />
      <Route path="/pago" element={<Payment />} />
      <Route path="/confirmacion" element={<Confirmation />} />
      <Route path="/mis-viajes" element={<Bookings />} />
      <Route path="/privacidad" element={<Privacy />} />
      <Route path="/terminos" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      
      {/* Profile & Settings */}
      <Route path="/perfil" element={<Profile />} />
      <Route path="/perfil/personal" element={<PersonalInfo />} />
      <Route path="/perfil/seguridad" element={<SecuritySettings />} />
      <Route path="/perfil/preferencias" element={<PreferencesSettings />} />
      <Route path="/perfil/pagos" element={<PaymentMethodsSettings />} />
      
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )

  return (
    <>
      <Navbar />
      {authModal && <AuthModal />}
      {isHome ? (
        allRoutes
      ) : (
        <div style={{ minHeight: 'calc(100vh - 69px)', display: 'flex', flexDirection: 'column' }}>
          {allRoutes}
          <Footer />
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <DarkModeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <AppInner />
        </AuthProvider>
      </CurrencyProvider>
    </DarkModeProvider>
  )
}

export default App