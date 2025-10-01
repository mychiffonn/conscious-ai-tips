import express from "express"
import path from "path"
import { dirname } from "path"
import { fileURLToPath } from "url"
import "./config/dotenv.js"
import { pool } from "./config/database.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Validate database connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err)
    process.exit(1)
  }
  console.log('Database connected successfully')
  release()
})

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.disable('x-powered-by')
app.use(express.json({ limit: '10mb' }))

// Static file serving
app.use(express.static(path.join(__dirname, "..", "client")))
app.use(express.static(path.join(__dirname, "..", "public")))

const buildTipsQuery = (category, sort, search) => {
  let query = "SELECT * FROM tips"
  let queryParams = []
  let whereConditions = []
  let paramIndex = 1

  if (category) {
    whereConditions.push(`LOWER(category) = LOWER($${paramIndex})`)
    queryParams.push(category)
    paramIndex++
  }

  if (search) {
    // Use PostgreSQL full-text search with tsvector and tsquery
    const searchVector = `(
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(category, '')), 'D')
    )`

    // Convert search query to tsquery, handling multiple words and special characters
    whereConditions.push(`${searchVector} @@ plainto_tsquery('english', $${paramIndex})`)
    queryParams.push(search)
    paramIndex++
  }

  if (whereConditions.length > 0) {
    query += " WHERE " + whereConditions.join(" AND ")
  }

  if (sort) {
    const [field, direction] = sort.split("-")
    const allowedFields = ["title", "category", "effort", "impact", "cost"]
    if (allowedFields.includes(field)) {
      query += ` ORDER BY ${field} ${direction === "desc" ? "DESC" : "ASC"}`
    }
  } else if (search) {
    // When searching, order by relevance (ts_rank) for better results
    const searchVector = `(
      setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(category, '')), 'D')
    )`
    query += ` ORDER BY ts_rank(${searchVector}, plainto_tsquery('english', $${paramIndex})) DESC`
    queryParams.push(search)
  }

  return { query, queryParams }
}

const handleDatabaseError = (error, res, message = "Database error") => {
  console.error(message + ":", error)
  res.status(500).json({ error: "Internal server error" })
}

// API Routes
app.get("/api/tips", async (req, res) => {
  try {
    const { category, sort, search } = req.query
    const { query, queryParams } = buildTipsQuery(category, sort, search)

    const result = await pool.query(query, queryParams)
    res.json({ tips: result.rows })
  } catch (error) {
    handleDatabaseError(error, res, "Error fetching tips")
  }
})

app.get("/api/tips/:id", async (req, res) => {
  try {
    const { id } = req.params

    // Input validation
    if (!id || id.length > 255) {
      return res.status(400).json({ error: "Invalid tip ID" })
    }

    const result = await pool.query("SELECT * FROM tips WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tip not found" })
    }
    res.json(result.rows[0])

  } catch (error) {
    handleDatabaseError(error, res, "Error fetching tip")
  }
})

// Static Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"))
})

app.get("/:tipId", async (req, res) => {
  try {
    const { tipId } = req.params

    // Input validation
    if (!tipId || tipId.length > 255) {
      return res.status(404).sendFile(path.join(__dirname, "..", "client", "404.html"))
    }

    const result = await pool.query("SELECT id FROM tips WHERE id = $1", [tipId])

    if (result.rows.length > 0) {
      res.sendFile(path.join(__dirname, "..", "client", "tip.html"))
    } else {
      res.status(404).sendFile(path.join(__dirname, "..", "client", "404.html"))
    }
  } catch (error) {
    console.error("Error checking tip:", error)
    res.status(404).sendFile(path.join(__dirname, "..", "client", "404.html"))
  }
})

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "..", "client", "404.html"))
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: "Internal server error" })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...')
  await pool.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down server...')
  await pool.end()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
