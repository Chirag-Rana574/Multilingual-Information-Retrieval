import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { Pinecone } from "@pinecone-database/pinecone"
import { embedText, translateFromEnglish, translateToEnglish } from "./pipeline.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "4mb" }))

const PORT = Number(process.env.API_PORT || 8787)
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || ""
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "legal-documents"

const pinecone =
  PINECONE_API_KEY && PINECONE_INDEX_NAME
    ? new Pinecone({ apiKey: PINECONE_API_KEY })
    : null

const getIndex = () => {
  if (!pinecone) return null
  try {
    return pinecone.index(PINECONE_INDEX_NAME)
  } catch (err) {
    console.error("Pinecone index error:", err)
    return null
  }
}

app.post("/api/query", async (req, res) => {
  try {
    const { query, language = "en", topK = 3 } = req.body || {}
    const lang = language || "en"
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Missing 'query' string" })
    }

    const index = getIndex()
    if (!index) {
      return res.status(500).json({ error: "Pinecone not configured" })
    }

    const translated = await translateToEnglish(query, lang)
    const vector = await embedText(translated)

    const pineconeRes = await index.query({
      topK: Number(topK) || 3,
      vector,
      includeMetadata: true,
    })

    const matches =
      pineconeRes?.matches?.map((m) => {
        const meta = m.metadata || {}
        const body =
          meta.data ||
          meta.text ||
          meta.body ||
          meta.content ||
          meta.translated ||
          meta.query ||
          ""
        const title =
          meta.title ||
          meta.case_title ||
          meta.query ||
          (typeof body === "string" ? body : "Result")
        return {
          id: m.id,
          score: m.score,
          metadata: {
            ...meta,
            title,
            snippet: typeof body === "string" ? body : "",
          },
        }
      }) || []

    const englishSummary = matches.length
      ? matches
          .map((m, idx) => {
            const meta = m.metadata || {}
            const text =
              meta.title ||
              meta.translated ||
              meta.query ||
              meta.data ||
              meta.text ||
              "Result"
            return `${idx + 1}. ${text}`
          })
          .join("\n")
      : "No results found."

    return res.json({
      translatedQuery: translated,
      matches,
      englishSummary,
      nativeSummary: "",
      sourceLanguage: "en",
    })
  } catch (err) {
    console.error("Query pipeline error:", err)
    return res.status(500).json({ error: "Query failed", details: String(err) })
  }
})

/**
 * Ingestion endpoint: accepts { rows: [{id?, query, language, ...}] }
 * Embeds 'query' field and writes to Pinecone.
 */
app.post("/api/ingest", async (req, res) => {
  try {
    const { rows } = req.body || {}
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Provide rows: [...] payload" })
    }

    const index = getIndex()
    if (!index) {
      return res.status(500).json({ error: "Pinecone not configured" })
    }

    const vectors = []
    for (const row of rows) {
      if (!row?.query) continue
      const lang = row.language || "auto"
      const translated = await translateToEnglish(row.query, lang)
      const embedding = await embedText(translated)
      vectors.push({
        id: row.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        values: embedding,
        metadata: {
          language: lang,
          query: row.query,
          translated,
          relevant_cases: row.relevant_cases || [],
          title: row.title || row.query.slice(0, 64),
        },
      })
    }

    if (!vectors.length) {
      return res.status(400).json({ error: "No valid rows to ingest" })
    }

    // Pinecone recommends batches of ~100; keep it simple here.
    await index.upsert(vectors)

    return res.json({
      status: "ok",
      ingested: vectors.length,
    })
  } catch (err) {
    console.error("Ingestion error:", err)
    return res.status(500).json({ error: "Ingestion failed", details: String(err) })
  }
})

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    pinecone: Boolean(pinecone),
    index: PINECONE_INDEX_NAME,
  })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
