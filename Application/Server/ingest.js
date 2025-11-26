import fs from "fs"
import readline from "readline"
import dotenv from "dotenv"
import { Pinecone } from "@pinecone-database/pinecone"
import { embedText, translateToEnglish } from "./pipeline.js"

dotenv.config()

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || ""
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "legal-documents"

if (!PINECONE_API_KEY) {
  console.error("Missing PINECONE_API_KEY")
  process.exit(1)
}

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY })
const index = pinecone.index(PINECONE_INDEX_NAME)

const upsertBatch = async (vectors) => {
  if (!vectors.length) return
  await index.upsert(vectors)
}

const ingestFile = async (filePath) => {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  })

  let batch = []
  let count = 0

  for await (const line of rl) {
    if (!line.trim()) continue
    const row = JSON.parse(line)
    if (!row?.query) continue

    const lang = row.language || "auto"
    const translated = await translateToEnglish(row.query, lang)
    const embedding = await embedText(translated)

    batch.push({
     
      values: embedding,
      metadata: {
        language: lang,
        query: row.query,
        translated,
        relevant_cases: row.relevant_cases || [],
      
      },
    })

    if (batch.length >= 50) {
      await upsertBatch(batch)
      count += batch.length
      console.log(`Upserted ${count} vectors...`)
      batch = []
    }
  }

  if (batch.length) {
    await upsertBatch(batch)
    count += batch.length
    console.log(`Upserted ${count} vectors (final batch).`)
  }
}

const filePath = process.argv[2]
if (!filePath) {
  console.error("Usage: node ingest.js <path-to-jsonl>")
  process.exit(1)
}

ingestFile(filePath)
  .then(() => {
    console.log("Ingestion complete")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Ingestion failed:", err)
    process.exit(1)
  })
