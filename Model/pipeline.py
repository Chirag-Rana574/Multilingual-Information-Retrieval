"""
pipeline_module.py
------------------
Handles text → embedding → Pinecone search → (optional) translation.
"""

import numpy as np
import pandas as pd
import pinecone
from sentence_transformers import SentenceTransformer
from translator_module import Translator


class LegalPipeline:
    """
    End-to-end pipeline:
    - Optional translation of user query
    - Embedding generation (MiniLM)
    - Pinecone vector search
    """

    def __init__(self, pinecone_api_key, index_name, csv_path=None):
        self.translator = Translator()

        # Load SentenceTransformer model
        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

        # Optional data table
        self.data = pd.read_csv(csv_path) if csv_path else None

        # Initialize Pinecone
        self.pc = pinecone.Pinecone(api_key=pinecone_api_key)
        self.index = self.pc.Index(index_name)

    def encode(self, text: str):
        """Generate embedding for input text."""
        return self.model.encode(text)

    def get_cases(self, user_input, lang="English", top_k=3):
        """
        Main method: translate (if needed), embed, query Pinecone.
        """
        if lang != "English":
            user_input = self.translator.translate_indic_en(user_input, lang)

        embedding = self.encode(user_input)

        response = self.index.query(
            vector=embedding.tolist(),
            top_k=top_k,
            include_metadata=True,
        )

        return response["matches"]

    def translate_results(self, case_summaries, tgt_lang):
        """Translate list of English case summaries to target lang."""
        return self.translator.translate_en_indic(case_summaries, tgt_lang)


if __name__ == "__main__":
    pipeline = LegalPipeline(
        pinecone_api_key="YOUR_PINECONE_KEY",
        index_name="legal-minilm-embeddings",
        csv_path="processed_cases.csv",
    )

    matches = pipeline.get_cases("some input text", "English", top_k=3)
    summaries = [m["metadata"]["data"] for m in matches]

    translated = pipeline.translate_results(summaries, "hin_Deva")
    print(translated)

