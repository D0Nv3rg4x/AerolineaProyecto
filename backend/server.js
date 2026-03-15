const express = require('express')
const nodemailer = require('nodemailer')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: (origin, callback) => callback(null, true) }))
app.use(express.json())

app.get('/api/status', (req, res) => {
  res.json({ ok: true, message: 'Backend SkyNova corriendo', emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS) })
})

function buildVoucherHTML({ pasajero, vuelo, origen, destino, fecha, referencia, total, metodo, asientos }) {
  const origenCod = origen.includes('(') ? origen.split('(')[1].replace(')', '') : origen
  const destinoCod = destino.includes('(') ? destino.split('(')[1].replace(')', '') : destino
  const origenNom = origen.split('(')[0].trim()
  const destinoNom = destino.split('(')[0].trim()
  const asientosStr = asientos && asientos.length > 0 ? asientos.join(', ') : 'Por asignar'

  const rows = [
    ['Pasajero', pasajero],
    ['Vuelo', vuelo],
    ['Fecha', fecha],
    ['Asientos', asientosStr],
    ['Pago', metodo || 'Tarjeta'],
    ['Referencia', referencia],
  ]
  const rowsHTML = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #edf2f7; color:#718096; font-size:13px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${label}</td>
      <td style="padding:10px 0; border-bottom:1px solid #edf2f7; color:#1a202c; font-size:13px; font-weight:700; text-align:right; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">${value}</td>
    </tr>`).join('')

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
                <!-- CONTENEDOR PRINCIPAL -->
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);">
                    
                    <!-- HEADER -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0b1120 0%, #0f172a 100%); padding:48px 40px; text-align:center;">
                            <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:800; letter-spacing:-1px;">SkyNova<span style="color:#3b82f6;">Airlines</span></h1>
                            <p style="color:#94a3b8; margin:8px 0 0; font-size:14px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">Confirmación de Reserva</p>
                        </td>
                    </tr>

                    <!-- STATUS BAR -->
                    <tr>
                        <td style="background-color:#10b981; padding:12px; text-align:center;">
                            <span style="color:#ffffff; font-weight:700; font-size:14px; letter-spacing:1px;">✓ VUELO CONFIRMADO</span>
                        </td>
                    </tr>

                    <!-- HERO TICKET -->
                    <tr>
                        <td style="padding:40px; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="text-align:center;">
                                        <div style="font-size:48px; font-weight:800; color:#1e3a8a; letter-spacing:-2px; margin-bottom:4px;">
                                            ${origenCod} 
                                            <span style="color:#94a3b8; font-size:32px; vertical-align:middle; margin:0 10px;">✈</span> 
                                            ${destinoCod}
                                        </div>
                                        <div style="color:#64748b; font-size:14px; font-weight:500;">
                                            ${origenNom} &bull; ${destinoNom}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- INFO TABLE -->
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

                    <!-- FOOTER MENSAJE -->
                    <tr>
                        <td style="padding:0 40px 40px; text-align:center;">
                            <p style="color:#64748b; font-size:14px; line-height:1.6; margin:0;">
                                Gracias por elegir <strong>SkyNova</strong>. Tu viaje comienza aquí. Por favor, presenta este comprobante digital o impreso en el mostrador de facturación.
                            </p>
                        </td>
                    </tr>

                    <!-- DISCLAIMER -->
                    <tr>
                        <td style="background-color:#fffbeb; border-top:1px solid #fef3c7; padding:20px 40px; text-align:center;">
                            <p style="color:#92400e; font-size:11px; font-style:italic; margin:0;">
                                Este es un correo de simulación académica para fines de demostración. No representa un boleto de avión real ni genera transacciones financieras.
                            </p>
                        </td>
                    </tr>

                    <!-- FINAL FOOTER -->
                    <tr>
                        <td style="background-color:#0b1120; padding:32px; text-align:center;">
                            <div style="margin-bottom:16px;">
                                <a href="#" style="color:#60a5fa; text-decoration:none; margin:0 10px; font-size:12px;">Privacidad</a>
                                <a href="#" style="color:#60a5fa; text-decoration:none; margin:0 10px; font-size:12px;">Sugerencias</a>
                                <a href="#" style="color:#60a5fa; text-decoration:none; margin:0 10px; font-size:12px;">Ayuda</a>
                            </div>
                            <p style="color:#475569; font-size:11px; margin:0;">
                                © 2026 SkyNova Airlines. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- FIN CONTENEDOR -->
            </td>
        </tr>
    </table>
</body>
</html>`
}

app.post('/api/send-voucher', async (req, res) => {
  const { to, pasajero, vuelo, origen, destino, fecha, referencia, total, metodo, asientos } = req.body

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
      from: `"SkyNova Airlines" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Tu reserva ${referencia} - SkyNova Airlines`,
      html: buildVoucherHTML({ pasajero, vuelo, origen, destino, fecha, referencia, total, metodo, asientos }),
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