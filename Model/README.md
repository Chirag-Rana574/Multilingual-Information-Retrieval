# 🧠 Model Module

This folder contains the core backend components responsible for:

- Translating queries between **Indic ↔ English**
- Generating **semantic embeddings**
- Searching case vectors in **Pinecone**
- Returning **multilingual legal case results**

These components power the intelligent multilingual search system used in the project.

---

## 📌 Files Included

### **1. `pipeline.py`**

Handles the complete retrieval pipeline:

- Optional translation of user query to English  
- Embedding generation using **MiniLM (SentenceTransformer)**  
- Querying the **Pinecone vector database**  
- Returning the top relevant legal cases  
- Optional translation of results back to user’s language  

#### ⭐ Example Usage

```python
from model import LegalPipeline

pipeline = LegalPipeline(
    pinecone_api_key="YOUR_API_KEY",
    index_name="legal-minilm-embeddings"
)

matches = pipeline.get_cases("धारा 302 के मामले", lang="hin_Deva", top_k=3)
print(matches)
```

---

## 2. `translator.py`

Responsible for translation using **IndicTrans2** (optimized with **8-bit quantization**).

Supports:

- Indic → English  
- English → Indic  
- Batch translations for efficiency  

---

### ⭐ Example Usage

```python
from model import Translator
t = Translator()

print(t.translate_indic_en("मुझे केस बताओ", "hin_Deva"))
```
