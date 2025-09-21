const express = require("express")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files
app.use(express.static(path.join(__dirname, "..", "client")))
app.use(express.static(path.join(__dirname, "..", "public")))

// Load tips data
const tipsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "tips.json"), "utf8")
)

// Home route - serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"))
})

app.get("/api/tips", (req, res) => {
  let tips = [...tipsData.tips]

  // Filter by category
  const { category, sort } = req.query
  if (category) {
    tips = tips.filter(
      (tip) => tip.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Sort tips
  if (sort) {
    const [field, direction] = sort.split("-")
    tips.sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return direction === "desc" ? -comparison : comparison
    })
  }

  res.json({ ...tipsData, tips })
})

app.get("/api/tips/:id", (req, res) => {
  const tip = tipsData.tips.find((t) => t.id === req.params.id)
  if (tip) {
    res.json(tip)
  } else {
    res.status(404).json({ error: "Tip not found" })
  }
})

// Detail page routes for each tip
app.get("/:tipId", (req, res) => {
  const tip = tipsData.tips.find((t) => t.id === req.params.tipId)
  if (tip) {
    res.sendFile(path.join(__dirname, "..", "client", "tip.html"))
  } else {
    res.status(404).sendFile(path.join(__dirname, "..", "client", "404.html"))
  }
})

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "..", "client", "404.html"))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
