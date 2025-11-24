# IMPORTS
import os, json, random, zipfile, re, traceback
from tqdm import tqdm
import numpy as np
import pandas as pd
import torch
from sentence_transformers import SentenceTransformer
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from sklearn.metrics.pairwise import cosine_similarity

# File paths in the end
Dataset = "/kaggle/input/legalcorp/train.jsonl" #Dataset here

OUT_JSON = "/kaggle/working/Eval_data.json"
OUT_LONG_CSV = "/kaggle/working/Eval_data_long.csv"
OUT_WIDE_IDS = "/kaggle/working/Eval_data_wide_ids.csv"
OUT_ZIP = "/kaggle/working/Eval_data_outputs.zip"

# Flatten
def text_flatten(x):
    if isinstance(x, list):
        return " ".join(text_flatten(e) for e in x)
    if isinstance(x, tuple):
        return " ".join(text_flatten(e) for e in x)
    if x is None:
        return ""
    return str(x)

# Load Data
print("Loading corpus")
cases = []
with open(Dataset, "r", encoding="utf-8") as f:
    for line in f:
        obj = json.loads(line)
        text = flatten_text(obj.get("sentences") or obj.get("text") or "")
        cases.append({
            "case_id": obj.get("id", obj.get("case_id")),
            "text": text
        })

df_corpus = pd.DataFrame(cases)
print(f" Loaded {len(df_corpus)} cases")

# Excluding empty docs
docs = [flatten_text(t).strip() for t in df_corpus["text"].fillna("")]
valid_docs = []
valid_idx_map = []
for i, d in enumerate(docs):
    if d:
        valid_docs.append(d)
        valid_idx_map.append(i)
print(f" {len(valid_docs)} non-empty documents to encode")

# Embedding and Summarizer
  print("Loading SentenceTransformer embedder")
  embedder = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

  device_for_summarizer = 0 if torch.cuda.is_available() else -1
  print(" Loading BART ")
  summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=device_for_summarizer)

# Encode embeddings
print("Encoding corpus")
emb_matrix = embedder.encode(valid_docs, show_progress_bar=True, convert_to_numpy=True, batch_size=32)
print("Embeddings shape:", emb_matrix.shape)

# Create realistic English queries
def make_realistic_query(text):
    text = re.sub(r"\s+", " ", text.strip())
    snippet = text[:1200]
    try:
        summary = summarizer(snippet, max_length=40, min_length=15, do_sample=False)[0]["summary_text"]
    except Exception:
        summary = snippet[:300]
    summary = summary.strip().rstrip(".")
    templates = [
        "What are some cases discussing {}?",
        "How have courts ruled in matters involving {}?",
        "Find precedents related to {}.",
        "Examples of cases about {}.",
        "Which judgments concern {}?",
        "Show legal cases involving {}."
    ]
    return random.choice(templates).format(summary.lower())

# Generate English queries
NUM_QUERIES = 120
NUM_QUERIES = min(NUM_QUERIES, len(df_corpus))
random.seed(42)
selected_idxs = random.sample(range(len(df_corpus)), NUM_QUERIES)

queries = []
for i in tqdm(selected_idxs, desc="Generating English queries"):
    queries.append(make_realistic_query(df_corpus.loc[i, "text"]))
print(f"Done {len(queries)} English queries")

# Load IndicTrans2 v2 (EN -> Indic)
IT2_MODEL_ID = "ai4bharat/indictrans2-en-indic-v2"
print(f"Loading IndicTrans2 model: {IT2_MODEL_ID} (FP16 if available)")
it2_tokenizer = None
it2_model = None
try:
    it2_tokenizer = AutoTokenizer.from_pretrained(IT2_MODEL_ID, trust_remote_code=True)
    it2_model = AutoModelForSeq2SeqLM.from_pretrained(
        IT2_MODEL_ID,
        trust_remote_code=True,
        device_map="auto",
        torch_dtype=torch.float16 if torch.cuda.is_available() else None
    )
    print("IndicTrans2 loaded.")
except Exception as e:
    print("Failed to load IndicTrans2 v2:", e)
    traceback.print_exc()
    it2_tokenizer = None
    it2_model = None

INDIC_LANGS = [
    "as","bn","brx","doi","gu","hi","kn","ks","kok","mai",
    "ml","mni","mr","ne","or","pa","sa","sat","sd","ta","te","ur"
]

# 6) Translate queries efficiently (batch per language) & retrieval
TOP_K = 10
dataset = []

# If translation model loaded, do batched translations per language.
# We'll create a translations table: translations[lang] = list of translated queries aligned with `queries`.
translations = {lang: [""] * len(queries) for lang in INDIC_LANGS}

if it2_model is not None and it2_tokenizer is not None:
    print("Translating all queries (batched per language)")
    batch_size = 32 
    for lang in tqdm(INDIC_LANGS, desc="Languages"):
        prefixed_texts = [f"<2{lang}> {q}" for q in queries]
        # batch inference
        for i in range(0, len(prefixed_texts), batch_size):
            batch_texts = prefixed_texts[i:i+batch_size]
            try:
                inputs = it2_tokenizer(batch_texts, return_tensors="pt", padding=True, truncation=True, max_length=512).to(it2_model.device)
                with torch.no_grad():
                    outs = it2_model.generate(
                        **inputs,
                        max_length=128,
                        num_beams=4,
                        early_stopping=True,
                        no_repeat_ngram_size=2
                    )
                decoded = it2_tokenizer.batch_decode(outs, skip_special_tokens=True)
                for j, d in enumerate(decoded):
                    translations[lang][i + j] = d
            except Exception as e:
                # fallback: translate one-by-one
                print(f" Batch translation failed for lang {lang} at batch starting {i}: {e}")
                for j, txt in enumerate(batch_texts):
                    try:
                        inp = it2_tokenizer(txt, return_tensors="pt", truncation=True, max_length=512).to(it2_model.device)
                        with torch.no_grad():
                            out = it2_model.generate(**inp, max_length=128, num_beams=4)
                        translations[lang][i + j] = it2_tokenizer.decode(out[0], skip_special_tokens=True)
                    except Exception:
                        translations[lang][i + j] = ""
else:
    print("Model unavailable — translations will be empty strings.")

# Now for each query, build multilingual versions and retrieve top-K cases using English embedding
print("Retrieving top-K cases and assembling dataset")
for qi, q in enumerate(tqdm(queries, desc="Queries")):
    ml_queries = {"en": q}
    for lang in INDIC_LANGS:
        ml_queries[lang] = translations.get(lang, [""] * len(queries))[qi]

    # Retrieval on English query embedding
    q_emb = embedder.encode(q, convert_to_numpy=True)
    sims = cosine_similarity([q_emb], emb_matrix)[0]
    top_local_idxs = np.argsort(sims)[::-1][:TOP_K]

    relevant = []
    for li in top_local_idxs:
        orig_idx = valid_idx_map[li]
        relevant.append({
            "case_id": df_corpus.loc[orig_idx, "case_id"],
            "text": df_corpus.loc[orig_idx, "text"]
        })

    dataset.append({"queries": ml_queries, "relevant_cases": relevant})

print(f"Dataset built: {len(dataset)} entries")

# Save JSON + CSVs + ZIP
print("Saving JSON")
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(dataset, f, indent=2, ensure_ascii=False)
print("Saved JSON:", OUT_JSON)

# long CSV
rows = []
for entry in dataset:
    for lang, qtext in entry["queries"].items():
        for rnk, rel in enumerate(entry["relevant_cases"], start=1):
            rows.append({
                "query_lang": lang,
                "query": qtext,
                "rank": rnk,
                "case_id": rel["case_id"],
                "case_text": rel["text"]
            })
df_long = pd.DataFrame(rows)
df_long.to_csv(OUT_LONG_CSV, index=False)
print("Saved long CSV:", OUT_LONG_CSV)

# wide CSV (one row per (orig_query_index, lang))
wide_rows = []
for qi, entry in enumerate(dataset):
    for lang, qtext in entry["queries"].items():
        row = {"orig_q_index": qi, "lang": lang, "query": qtext}
        for rnk, rel in enumerate(entry["relevant_cases"], start=1):
            row[f"case_id_{rnk}"] = rel["case_id"]
            row[f"case_text_{rnk}"] = rel["text"][:500]
        wide_rows.append(row)
df_wide = pd.DataFrame(wide_rows)
df_wide.to_csv(OUT_WIDE_IDS, index=False)
print("Saved wide CSV:", OUT_WIDE_IDS)

# zip
with zipfile.ZipFile(OUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    zf.write(OUT_JSON, arcname=os.path.basename(OUT_JSON))
    zf.write(OUT_LONG_CSV, arcname=os.path.basename(OUT_LONG_CSV))
    zf.write(OUT_WIDE_IDS, arcname=os.path.basename(OUT_WIDE_IDS))
print("Saved ZIP:", OUT_ZIP)

print("All done.")
