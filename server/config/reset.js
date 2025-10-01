import './dotenv.js'
import { pool } from './database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function resetDatabase() {
  try {
    console.log('Connecting to database...')

    // Drop and recreate tips table
    await pool.query('DROP TABLE IF EXISTS tips')

    // Create tips table
    await pool.query(`
      CREATE TABLE tips (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        effort INTEGER NOT NULL CHECK (effort >= 0 AND effort <= 3),
        impact INTEGER NOT NULL CHECK (impact >= 0 AND impact <= 3),
        cost INTEGER NOT NULL CHECK (cost >= 0 AND cost <= 3),
        description TEXT NOT NULL,
        content TEXT NOT NULL,
        image VARCHAR(255)
      )
    `)

    console.log('Tips table created successfully')

    // Load and insert data from tips.json
    const tipsPath = path.join(__dirname, '..', 'tips.json')
    const tipsData = JSON.parse(fs.readFileSync(tipsPath, 'utf8'))

    for (const tip of tipsData.tips) {
      // Merge detailed_description and implementation_steps into content
      let content = tip.detailed_description
      if (tip.implementation_steps && tip.implementation_steps.length > 0) {
        content += '\n\n## Implementation Steps\n\n'
        tip.implementation_steps.forEach((step, index) => {
          content += `${index + 1}. ${step}\n`
        })
      }

      await pool.query(`
        INSERT INTO tips (id, title, category, effort, impact, cost, description, content, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        tip.id,
        tip.title,
        tip.category,
        tip.effort,
        tip.impact,
        tip.cost,
        tip.description,
        content,
        tip.image
      ])
    }

    console.log(`Inserted ${tipsData.tips.length} tips into database`)
    console.log('Database reset completed successfully')

  } catch (error) {
    console.error('Error resetting database:', error)
    throw error
  } finally {
    await pool.end()
  }
}

resetDatabase().catch(console.error)
