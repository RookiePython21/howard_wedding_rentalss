import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import paymentsRouter from './routes/payments'

dotenv.config()

const app = express()
const PORT = process.env.PORT ?? 3001
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

app.use('/api', paymentsRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'howard-wedding-rentals-api' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
