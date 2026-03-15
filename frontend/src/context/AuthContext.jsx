import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const DEMO_USERS = [
  { email: 'demo@skynova.cl',  password: '123456', nombre: 'Juan',  apellido: 'García'  },
  { email: 'admin@skynova.cl', password: 'admin',  nombre: 'Admin', apellido: 'SkyNova' },
]

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [bookings,  setBookings]  = useState([])
  const [authModal, setAuthModal] = useState(false)

  useEffect(() => {
    const savedUser     = localStorage.getItem('sn_user')
    const savedBookings = localStorage.getItem('sn_bookings')
    if (savedUser)     setUser(JSON.parse(savedUser))
    if (savedBookings) setBookings(JSON.parse(savedBookings))
  }, [])

  const login = (email, password) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    const registered = JSON.parse(localStorage.getItem('sn_registered') || '[]')
    const regFound   = registered.find(u => u.email === email && u.password === password)
    const match      = found || regFound
    if (!match) return { ok: false, error: 'Correo o contraseña incorrectos' }

    const userData = { email: match.email, nombre: match.nombre, apellido: match.apellido }
    setUser(userData)
    localStorage.setItem('sn_user', JSON.stringify(userData))

    const allBookings = JSON.parse(localStorage.getItem('sn_bookings') || '[]')
    const myBookings  = allBookings.filter(b => b.userEmail === email)
    setBookings(myBookings)
    return { ok: true }
  }

  const register = (nombre, apellido, email, password) => {
    const registered = JSON.parse(localStorage.getItem('sn_registered') || '[]')
    if (registered.find(u => u.email === email) || DEMO_USERS.find(u => u.email === email)) {
      return { ok: false, error: 'Este correo ya está registrado' }
    }
    const newUser = { nombre, apellido, email, password }
    registered.push(newUser)
    localStorage.setItem('sn_registered', JSON.stringify(registered))

    const userData = { email, nombre, apellido }
    setUser(userData)
    localStorage.setItem('sn_user', JSON.stringify(userData))
    setBookings([])
    return { ok: true }
  }

  const logout = () => {
    setUser(null)
    setBookings([])
    localStorage.removeItem('sn_user')
  }

  const addBooking = (booking) => {
    const newBooking = { ...booking, userEmail: user?.email, createdAt: new Date().toISOString() }
    const allBookings = JSON.parse(localStorage.getItem('sn_bookings') || '[]')
    allBookings.push(newBooking)
    localStorage.setItem('sn_bookings', JSON.stringify(allBookings))
    setBookings(prev => [...prev, newBooking])
  }

  return (
    <AuthContext.Provider value={{
      user, bookings, authModal,
      setAuthModal, login, register, logout, addBooking
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
