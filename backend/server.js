const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: (origin, callback) => callback(null, true) }))
app.use(express.json())

app.use(cors({ origin: (origin, callback) => callback(null, true) }))
app.use(express.json())

app.get('/api/status', (req, res) => {
    res.json({ 
        ok: true, 
        message: 'Backend SkyNova activo y escuchando', 
        emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS) 
    })
})

app.get('/api/vuelos', (req, res) => {
    try {
        const { origen, destino, fecha } = req.query
        let vuelos = require('./data/vuelos.json')

        if (origen) {
            vuelos = vuelos.filter(v => 
                v.origen.toLowerCase().includes(origen.toLowerCase()) || 
                v.codigoOrigen.toLowerCase() === origen.toLowerCase()
            )
        }
        if (destino) {
            vuelos = vuelos.filter(v => 
                v.destino.toLowerCase().includes(destino.toLowerCase()) || 
                v.codigoDestino.toLowerCase() === destino.toLowerCase()
            )
        }
        if (fecha) {
            vuelos = vuelos.filter(v => v.fecha === fecha)
        }

        const now = new Date("2026-03-14T22:55:00")
        
        vuelos = vuelos.map(v => {
            const flightDate = new Date(`${v.fecha}T${v.salida}:00`)
            const diffMs = flightDate - now
            const diffMins = diffMs / (1000 * 60)

            let status = "Programado"
            if (diffMins < -v.duracionMin) status = "Aterrizado"
            else if (diffMins < 0) status = "En Aire"
            else if (diffMins < 30) status = "En Puerta"
            else if (diffMins < 120) status = "Check-in Abierto"
            
            const seatsLeft = Math.floor(Math.random() * 25) + 1 
            
            const weatherOptions = [
                { temp: 22, icon: '☀️', desc: 'Soleado' },
                { temp: 18, icon: '⛅', desc: 'Parcial' },
                { temp: 28, icon: '🔥', desc: 'Caluroso' },
                { temp: 15, icon: '☁️', desc: 'Nublado' }
            ]
            const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)]

            return { ...v, status, seatsLeft, weather }
        })

        res.json(vuelos)
        console.log(`Búsqueda: ${origen} -> ${destino} (${vuelos.length} resultados)`)
    } catch (error) {
        console.error('Error cargando vuelos:', error)
        res.status(500).json({ error: 'No se pudo cargar los vuelos' })
    }
})

app.get('/api/aerolineas', (req, res) => {
    try {
        const aerolineas = require('./data/aerolineas.json')
        res.json(aerolineas)
        console.log("Aerolineas cargadas correctamente")
    } catch (error) {
        res.status(500).json({ error: 'No se pudo cargar las aerolineas' })
        console.log("Error al cargar las aerolineas")
    }
})

app.get('/api/paquetes', (req, res) => {
    try {
        const paquetes = require('./data/paquetes.json')
        res.json(paquetes)
        console.log("Paquetes cargados correctamente")
    } catch (error) {
        console.error('Error cargando paquetes:', error)
        res.status(500).json({ error: 'No se pudo cargar los paquetes' })
    }
})

app.get('/api/alojamientos', (req, res) => {
    try {
        const { ciudad } = req.query
        let alojamientos = require('./data/alojamientos.json')
        if (ciudad) {
            alojamientos = alojamientos.filter(a => a.ciudad.toLowerCase().includes(ciudad.toLowerCase()))
        }
        res.json(alojamientos)
        console.log("Alojamientos cargados correctamente")
    } catch (error) {
        console.error('Error cargando alojamientos:', error)
        res.status(500).json({ error: 'No se pudo cargar los alojamientos' })
    }
})

app.get('/api/ofertas', (req, res) => {
    try {
        const ofertas = require('./data/ofertas.json')
        res.json(ofertas)
        console.log("Ofertas cargadas correctamente")
    } catch (error) {
        console.error('Error cargando ofertas:', error)
        res.status(500).json({ error: 'No se pudo cargar las ofertas' })
    }
})

function buildVoucherHTML({ pasajero, passengers, tipo, productoNombre, origen, destino, fecha, referencia, total, metodo, asientos }) {
    const isFlight = tipo === 'vuelo'
    const isPackage = tipo === 'paquete'

    let origenCod = origen
    let destinoCod = destino
    if (isFlight && origen.includes('(')) {
        origenCod = origen.split('(')[1].replace(')', '')
        destinoCod = destino.includes('(') ? destino.split('(')[1].replace(')', '') : destino
    }

    const travelerLabel = tipo === 'alojamiento' ? 'Huéspedes' : 'Pasajeros'
    const travelerValue = (passengers && passengers.length > 0) ? passengers.join(', ') : pasajero

    const rows = [
        [travelerLabel, travelerValue],
        [isFlight ? 'Vuelo' : 'Producto', productoNombre],
        ['Fecha', fecha],
        ['Referencia', referencia],
        ['Método de Pago', metodo || 'Tarjeta'],
    ]

    if (asientos && asientos.length > 0) {
        rows.push(['Asientos', asientos.join(', ')])
    }

    const rowsHTML = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #edf2f7; color:#718096; font-size:13px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${label}</td>
      <td style="padding:10px 0; border-bottom:1px solid #edf2f7; color:#1a202c; font-size:13px; font-weight:700; text-align:right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${value}</td>
    </tr>`).join('')

    const statusLabel = isFlight ? '✓ VUELO CONFIRMADO' : (isPackage ? '✓ PAQUETE CONFIRMADO' : '✓ RESERVA CONFIRMADA')
    const icon = isFlight ? '✈' : (tipo === 'alojamiento' ? '🏨' : '🎁')

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserva SkyNova</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9; padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #0b1120 0%, #0f172a 100%); padding:48px 40px; text-align:center;">
                            <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:800; letter-spacing:-1px;">SkyNova<span style="color:#3b82f6;">${tipo === 'alojamiento' ? 'Hotels' : 'Airlines'}</span></h1>
                            <p style="color:#94a3b8; margin:8px 0 0; font-size:14px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">Confirmación de Reserva</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#10b981; padding:12px; text-align:center;">
                            <span style="color:#ffffff; font-weight:700; font-size:14px; letter-spacing:1px;">${statusLabel}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="text-align:center;">
                                        <div style="font-size:38px; font-weight:800; color:#1e3a8a; letter-spacing:-1px; margin-bottom:4px;">
                                            ${origenCod} 
                                            <span style="color:#94a3b8; font-size:28px; vertical-align:middle; margin:0 10px;">${icon}</span> 
                                            ${destinoCod}
                                        </div>
                                        <div style="color:#64748b; font-size:14px; font-weight:500;">
                                            ${productoNombre}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 40px 40px;">
                            <div style="background-color:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:24px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    ${rowsHTML}
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:20px;">
                                    <tr>
                                        <td style="color:#1a202c; font-size:16px; font-weight:700;">Importe Total</td>
                                        <td style="color:#2563eb; font-size:24px; font-weight:800; text-align:right;">${total}</td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 40px 40px; text-align:center;">
                            <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0;">
                                Gracias por elegir <strong>SkyNova</strong>. Tu viaje comienza aquí. Por favor, presenta este comprobante digital o impreso en el mostrador de facturación.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#fffbeb; border-top:1px solid #fef3c7; padding:20px 40px; text-align:center;">
                            <p style="color:#92400e; font-size:11px; font-style:italic; margin:0;">
                                Este es un correo de simulación académica para fines de demostración. No representa un boleto de avión real ni genera transacciones financieras.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#0b1120; padding:32px; text-align:center;">
                            <div style="margin-bottom:16px;">
                                <a href="#" style="color:#60a5fa; text-decoration:none; margin:0 10px; font-size:12px;">Privacidad</a>
                                <a href="#" style="color:#60a5fa; text-decoration:none; margin:0 10px; font-size:12px;">Sugerencias</a>
                                <a href="#" style="color:#60a5fa; text-decoration:none; margin:0 10px; font-size:12px;">Ayuda</a>
                            </div>
                            <p style="color:#475569; font-size:11px; margin:0;">
                                © 2026 SkyNova. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
}

app.post('/api/send-voucher', async (req, res) => {
    const { to, pasajero, passengers, tipo, productoNombre, origen, destino, fecha, referencia, total, metodo, asientos } = req.body

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ ok: false, message: 'Credenciales no configuradas. Crea backend/.env' })
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })

    try {
        await transporter.verify()
    } catch (err) {
        console.error('Error autenticacion Gmail:', err.message)
        return res.status(500).json({ ok: false, message: 'Error de autenticacion Gmail. Revisa tu .env' })
    }

    try {
        await transporter.sendMail({
            from: `"SkyNova" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Tu reserva ${referencia} - SkyNova`,
            html: buildVoucherHTML({ pasajero, passengers, tipo, productoNombre, origen, destino, fecha, referencia, total, metodo, asientos }),
        })
        console.log(`Voucher enviado a ${to} - Ref: ${referencia}`)
        res.json({ ok: true, message: `Voucher enviado a ${to}` })
    } catch (error) {
        console.error('Error enviando correo:', error.message)
        res.status(500).json({ ok: false, message: 'Error al enviar', detail: error.message })
    }
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\nBackend SkyNova en http://localhost:${PORT}`)
    console.log(`Email: ${process.env.EMAIL_USER || 'NO CONFIGURADO - crea backend/.env'}`)
})