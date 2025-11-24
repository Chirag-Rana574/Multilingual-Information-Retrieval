# 🎯 Democratizing Legal Information in India through Multilingual Semantic Retrieval
*A cross-lingual, transformer-powered legal search engine for 22 Indian languages.*

---

![Python](https://img.shields.io/badge/Python-3.10-blue)
![Transformers](https://img.shields.io/badge/NLP-Transformers-purple)
![IndicTrans2](https://img.shields.io/badge/Model-IndicTrans2-orange)
![HNSW](https://img.shields.io/badge/Vector%20Search-HNSW-green)
![MIT](https://img.shields.io/badge/License-MIT-yellow)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Motivation](#motivation)
- [Core Idea](#core-idea)
- [System Architecture](#system-architecture)
- [Dataset](#dataset)
- [Results](#results)
- [Technologies Used](#technologies-used)
- [Future Scope](#future-scope)
- [Citation](#citation)
- [Contact](#contact)

---

## 🚀 Overview
India is home to 1.4B people speaking hundreds of languages, yet English dominates court judgments.
This project enables:

- Queries in **22 Indian languages**
- **Semantic** (not keyword) retrieval
- Translated, readable case summaries
- Accurate embeddings + high-speed vector search

A step toward **justice accessibility and linguistic equality**.

---

## 🌍 Motivation
Only **6–10% of Indians** speak English, yet legal information is almost entirely in English.
This creates:

- Linguistic inequality
- Barriers for rural users
- Lack of access to case laws

Our system returns legal case information **in the user’s native language**, making justice more accessible.

---

## 🧠 Core Idea
All queries and documents are aligned in a **shared English semantic embedding space**.

**Workflow:**

1. User inputs a query in any Indian language
2. Translate query → English using **IndicTrans2**
3. Generate semantic embedding via Transformer
4. Use **HNSWlib** to perform vector similarity search
5. Retrieve top legal cases
6. Translate case titles & summaries back → user’s language

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A["User Query (Any Indic Language)"] --> B["IndicTrans2: Indic to English"]
    B --> C["Transformer Encoder (Semantic Embedding)"]
    C --> D["HNSW Vector Search"]
    D --> E["Top Retrieval Results"]
    E --> F["IndicTrans2: English to Indic"]
    F --> G["Final Output (Titles, Summaries, Scores)"]
 ```
## 📚 Dataset

### 📘 **LeSICiN (Primary Corpus)**
- **42,835** Indian legal case documents  
- **JSONL-formatted**  
- Contains case facts, judicial reasoning & statute citations  

### 📝 **Evaluation Dataset**
- **100 multilingual queries**  
- Queries in **22 Indian languages**  
- Each query manually annotated with **3 relevant legal cases**

---

## 📊 Results

| **Metric**      | **K = 1** | **K = 3** | **K = 5** |
|-----------------|-----------|-----------|-----------|
| **Precision@K** | **0.9833** | 0.5222    | 0.3133    |
| **Recall@K**    | 0.0983    | 0.2567    | 0.4567    |
| **NDCG@K**      | **0.9833** | 0.6203    | 0.4483    |

### ⭐ **Highlights**
- **98.33% Precision@1** — almost always correct first result  
- Outperforms **BM25** in ranking quality  
- Strong **cross-lingual semantic matching** robustness  

---

## 🛠️ Technologies Used

- **IndicTrans2** — neural translation for 22 Indian languages  
- **Transformer Encoder (ONNX Runtime)** — semantic embedding generation  
- **HNSWlib** — approximate nearest neighbors (vector search)  
- **Python** — pipeline + preprocessing  
- **JSONL** — legal dataset format  

---

## 🔮 Future Scope

- RAG-powered **conversational legal QA**  
- Expand corpus → **Supreme Court + High Courts**  
- Add **voice-based query** interface  
- **Legal expert–guided** annotation & benchmarking  
- Deploy as a **public legal aid tool** (web/mobile)

---

## 📄 Citation

Bangwal, A., Gusain, A., Rana, C., Sharma, N., & Kumar, R.  
"Democratizing Legal Information in India through Multilingual Semantic Retrieval," 2025.

---

## 📬 Contact

- **Ashish Bangwal** — ashish.04014811622@aiml.mait.ac.in  
- **Anubhav Gusain** — anubhav.20314811622@aiml.mait.ac.in  
- **Chirag Rana** — chirag.35514811622@aiml.mait.ac.in  
- **Neelam Sharma** — neelamsharma@mait.ac.in  
- **Rajat Kumar** — rajat.05214811622@aiml.mait.ac.in  
