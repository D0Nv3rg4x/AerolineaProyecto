# 🚀 SkyNova: Plataforma Integral de Viajes
Proyecto web de ecosistema de viajes desarrollado para un trabajo de redes. Simula un sistema completo de búsqueda y reserva de **vuelos, alojamientos, paquetes turísticos y ofertas relámpago**, con pasarela de pago segura y generación automática de vouchers.

![Stack](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![Express](https://img.shields.io/badge/Express-4-green) ![Node](https://img.shields.io/badge/Node-20-brightgreen)

---

## 🖥️ Vista previa y Funcionalidades

- **Buscador Multiproducto**: Pestañas dedicadas para Vuelos, Hoteles, Paquetes (Vuelo + Hotel) y Ofertas.
- **Soporte Multi-pasajero**: Formularios dinámicos para recolectar datos de múltiples viajeros o huéspedes en una sola transacción.
- **Flujo de Reserva Unificado**: Selección de asientos para vuelos y paquetes, con persistencia de datos hasta el checkout.
- **Voucher Universal Adaptativo**: Rediseño inteligente que cambia su look según el producto (Azul/Barcode para vuelos, Verde/QR para hoteles, Púrpura para paquetes).
- **Pasarela de Pago Refinada**: Resumen dinámico en tiempo real, validación de RUT/Email, y sellos de confianza (SSL/PCI-DSS).
- **Conversión de Moneda en Vivo**: Soporte para USD, EUR y CLP sincronizado con tasas reales.
- **Estructura Global**: Cobertura en 12 hubs internacionales con miles de rutas programadas.
- **Modo Oscuro / Claro**: Interfaz moderna y premium con micro-animaciones (Framer Motion).

---

## 📦 Requisitos

- [Node.js](https://nodejs.org) v18 o superior
- npm (viene incluido con Node.js)
- Una cuenta Gmail con verificación en 2 pasos activada

---

## 🚀 Instalación y uso

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/AerolineaProyecto.git
cd AerolineaProyecto
```

### 2. Configurar el Backend

```bash
cd backend
npm install
cp .env.example .env
```

Abre el archivo `.env` que acabas de crear y completa tus datos:

```env
PORT=3001
EMAIL_USER=tucorreo@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

> **¿Cómo obtener EMAIL_PASS?**
> 1. Ve a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
> 2. En "Nombre de la app" escribe: `SkyNova`
> 3. Haz clic en **Crear**
> 4. Google te dará 16 caracteres — cópialos tal cual en `EMAIL_PASS`
>
> ⚠️ Esto requiere tener la **verificación en 2 pasos activa** en tu cuenta Gmail.

### 3. Iniciar el Backend

```bash
# Dentro de la carpeta backend/
node server.js
```

Deberías ver:
```
Backend SkyNova en http://localhost:3001
Email: tucorreo@gmail.com
```

### 4. Configurar e iniciar el Frontend

Abre una **nueva terminal**:

```bash
cd frontend
npm install
npm run dev
```

### 5. Abrir en el navegador

```
http://localhost:5173
```

---

## 🐧 En Linux (Ubuntu / Debian)

Si no tienes Node.js instalado:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # debe mostrar v20.x.x
```

Luego sigue los mismos pasos de arriba.

---

## 🗂️ Estructura del proyecto

```
AerolineaProyecto/
├── frontend/
│   └── src/
│       ├── assets/          # Logo y recursos estáticos
│       ├── components/
│       │   ├── AuthModal/         # Login / Registro
│       │   ├── BoardingPassModal/ # Detalle del ticket
│       │   ├── FlightCard/        # Tarjeta de vuelo con Badges
│       │   ├── Navbar/            # Navegación y Theme Toggle
│       │   ├── SearchBox/         # Buscador dinámico de Home
│       │   └── ...                # Otros UI components
│       ├── context/
│       │   ├── AuthContext.jsx      # Gestión de usuario y reservas
│       │   ├── CurrencyContext.jsx  # Conversión de monedas
│       │   └── DarkModeContext.jsx  # Control de tema
│       ├── data/
│       │   ├── aerolineas.json # Info de marcas y colores
│       │   └── vuelos.json     # 1680+ rutas dinámicas
│       ├── pages/
│       │   ├── Home/           # Landing con buscador multiproducto
│       │   ├── Flights/        # Resultados de vuelos con filtros
│       │   ├── Accommodations/ # Buscador y reserva de hoteles
│       │   ├── Packages/       # Experiencias Vuelo + Hotel
│       │   ├── Offers/         # Ofertas relámpago dinámicas
│       │   ├── SeatSelection/  # Mapa de cabina interactivo
│       │   ├── Payment/        # Pasarela con soporte multipasajero
│       │   └── Confirmation/   # Voucher universal y envío de email
│       └── styles/
│           └── globals.css   # Tokens de diseño y variables
└── backend/
    ├── server.js         # Servidor Express + Nodemailer
    └── .env              # Credenciales (Gmail/SMTP)
```

---

## 🔑 Cuenta de demo

Si no quieres registrarte, puedes usar la cuenta de prueba:

| Campo      | Valor             |
|------------|-------------------|
| Correo     | demo@skynova.cl   |
| Contraseña | 123456            |

---

## 🛠️ Stack tecnológico

| Capa        | Tecnología                        |
|-------------|-----------------------------------|
| Frontend    | React 18 + Vite 5                 |
| Routing     | React Router DOM v6               |
| Animaciones | Framer Motion                     |
| Estilos     | CSS Modules + CSS Variables       |
| Backend     | Express.js                        |
| Correos     | Nodemailer + Gmail App Password   |
| Estado      | React Context API + localStorage  |
| Monedas     | exchangerate-api.com (tiempo real)|

---

## 🌍 Destinos y Cobertura

Red global de 12 hubs interconectados incluyendo:
- **Latinoamérica**: Santiago (SCL), Buenos Aires, Lima, Bogotá, São Paulo, México.
- **Norteamérica**: Miami, Nueva York.
- **Europa**: Madrid, Londres, París, Roma.

---

## ⚠️ Notas importantes

- Los pagos son **100% simulados** — ningún cargo real se procesa
- Las reservas se guardan en `localStorage` del navegador (se borran al limpiar datos del navegador)
- El envío de correo requiere internet y credenciales Gmail configuradas en `.env`
- Este proyecto es de uso educativo / académico

---

## 📄 Licencia

MIT — libre para usar, modificar y distribuir con atribución.
