"""
translator_module.py
--------------------
Provides a Translator class for Indic <-> English translation
using IndicTrans2 models with 8-bit quantization.
"""

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
from transformers.utils.quantization_config import BitsAndBytesConfig
from IndicTransToolkit.processor import IndicProcessor
from huggingface_hub import login


DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def initialize_model_and_tokenizer(ckpt_dir, quantization="8-bit"):
    """
    Load Seq2Seq model + tokenizer with optional 4-bit / 8-bit quantization.
    """
    if quantization == "4-bit":
        qconfig = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_compute_dtype=torch.bfloat16,
        )
    elif quantization == "8-bit":
        qconfig = BitsAndBytesConfig(
            load_in_8bit=True,
            bnb_8bit_use_double_quant=True,
            bnb_8bit_compute_dtype=torch.bfloat16,
        )
    else:
        qconfig = None

    tokenizer = AutoTokenizer.from_pretrained(ckpt_dir, trust_remote_code=True)
    model = AutoModelForSeq2SeqLM.from_pretrained(
        ckpt_dir,
        trust_remote_code=True,
        low_cpu_mem_usage=True,
        quantization_config=qconfig,
    )

    if qconfig is None:
        model = model.to(DEVICE)
        if DEVICE == "cuda":
            model.half()

    model.eval()
    return tokenizer, model


def batch_translate(input_sentences, src_lang, tgt_lang, model, tokenizer, ip):
    """
    Perform vectorized batch translation using IndicTrans2.
    """
    data = ip.preprocess_batch(input_sentences, src_lang=src_lang, tgt_lang=tgt_lang)

    inputs = tokenizer(
        data,
        truncation=True,
        padding="longest",
        return_tensors="pt",
        return_attention_mask=True,
    ).to(DEVICE)

    with torch.no_grad():
        generated_tokens = model.generate(
            **inputs,
            use_cache=True,
            max_length=256,
            num_beams=5,
            num_return_sequences=1,
        )

    outputs = tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )

    result = ip.postprocess_batch(outputs, lang=tgt_lang)

    del inputs
    torch.cuda.empty_cache()
    return result


class Translator:
    """
    Wrapper class for IndicTrans2 translation utilities.
    """

    def __init__(self):
        login("YOUR_HF_TOKEN")  # ← replace with env var ideally

        self.indic_en_model_name = "ai4bharat/indictrans2-indic-en-dist-200M"
        self.en_indic_model_name = "ai4bharat/indictrans2-en-indic-dist-200M"

        self.indic_en_tokenizer, self.indic_en_model = initialize_model_and_tokenizer(
            self.indic_en_model_name, "8-bit"
        )
        self.en_indic_tokenizer, self.en_indic_model = initialize_model_and_tokenizer(
            self.en_indic_model_name, "8-bit"
        )

        self.ip = IndicProcessor(inference=True)

    def translate_indic_en(self, sentence, src_lang):
        """Translate one Indic sentence → English."""
        result = batch_translate(
            [sentence],
            src_lang,
            "eng_Latn",
            self.indic_en_model,
            self.indic_en_tokenizer,
            self.ip,
        )
        return result[0]

    def translate_en_indic(self, sentences, tgt_lang):
        """Translate English → Indic (batch)."""
        return batch_translate(
            sentences,
            "eng_Latn",
            tgt_lang,
            self.en_indic_model,
            self.en_indic_tokenizer,
            self.ip,
        )

