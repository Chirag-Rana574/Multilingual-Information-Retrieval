import axios from "axios"
import dotenv from "dotenv"
import { HfInference } from "@huggingface/inference"

dotenv.config()

const HF_API_TOKEN = process.env.HF_API_TOKEN || ""
const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

const hf = HF_API_TOKEN ? new HfInference(HF_API_TOKEN) : null

const translate = async (text, source, target) => {
  const q = text?.trim() || ""
  if (!q) return ""
  if (source === target) return q
  try {
    const { data } = await axios.get("https://api.mymemory.translated.net/get", {
      params: { q, langpair: `${source || "auto"}|${target}` },
      timeout: 10000,
    })
    return data?.responseData?.translatedText || q
  } catch (err) {
    console.warn("Translation fallback due to error:", err?.message || err)
    return q
  }
}

export const translateToEnglish = async (text, language = "en") =>
  translate(text, language || "auto", "en")

export const translateFromEnglish = async (text, language = "en") =>
  translate(text, "en", language || "en")

const meanPoolAndNormalize = (tokenEmbeddings) => {
  const tokens = (tokenEmbeddings || []).filter(Array.isArray)
  if (!tokens.length) return []
  const dim = tokens[0].length
  const sum = new Array(dim).fill(0)
  tokens.forEach((vec) => {
    for (let i = 0; i < dim; i += 1) {
      sum[i] += Number(vec[i]) || 0
    }
  })
  const mean = sum.map((v) => v / tokens.length)
  const norm = Math.sqrt(mean.reduce((acc, v) => acc + v * v, 0)) || 1
  return mean.map((v) => v / norm)
}

export const embedText = async (text) => {
  const input = text?.trim() || ""
  if (!input) return []
  if (!hf) throw new Error("Missing HF_API_TOKEN for embeddings")

  const data = await hf.featureExtraction({
    model: HF_MODEL,
    inputs: input,
  })

  // HfInference returns tokens x dims for featureExtraction
  const tokenEmbeddings = Array.isArray(data?.[0]) ? data : [data]
  if (!tokenEmbeddings.length || !Array.isArray(tokenEmbeddings[0])) {
    throw new Error("Empty embeddings returned from Hugging Face")
  }
  return meanPoolAndNormalize(tokenEmbeddings)
}

export const processQuery = async (text, sourceLanguage = "en") => {
  const english = await translateToEnglish(text, sourceLanguage)
  const vector = await embedText(english)
  return { english, vector }
}
