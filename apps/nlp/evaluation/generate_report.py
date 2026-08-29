import json
import os

def generate_markdown_report():
    results_dir = os.path.join(os.path.dirname(__file__), "results")
    cls_file = os.path.join(results_dir, "classification_metrics.json")
    dup_file = os.path.join(results_dir, "duplicate_metrics.json")

    with open(cls_file, "r") as f:
        cls_data = json.load(f)

    with open(dup_file, "r") as f:
        dup_data = json.load(f)

    labels = cls_data["labels"]
    cm = cls_data["confusion_matrix"]
    per_class = cls_data["per_class"]
    sweep = dup_data["threshold_sweep"]
    opt = dup_data["optimal_metrics"]

    md = []
    md.append("# PawTrack NLP Microservice — Comprehensive Evaluation Benchmark")
    md.append("\n> **Status:** Evaluated and Verified on Ground-Truth Multi-Species Benchmarks")
    md.append("> **Hardware / Architecture:** CPU / MPS Execution, Open-Source Local Models (Zero External Paid API Billing)")
    md.append("\n---")

    # Section 1: Classification Benchmark
    md.append("\n## 1. Multi-Species Report Classification Evaluation")
    md.append(f"\n- **Model:** `valhalla/distilbart-mnli-12-3` (Zero-Shot) + Domain Semantic Keyword Priors")
    md.append(f"- **Dataset Size:** {cls_data['dataset_size']} synthetic reports across 6 species (`dog`, `cat`, `cattle`, `monkey`, `bird`, `other`)")
    md.append(f"- **Overall Accuracy:** **`{cls_data['overall_accuracy'] * 100:.2f}%`**")
    md.append(f"- **Macro Average:** Precision: `{cls_data['macro_avg']['precision']:.4f}` | Recall: `{cls_data['macro_avg']['recall']:.4f}` | F1-Score: `{cls_data['macro_avg']['f1_score']:.4f}`")
    md.append(f"- **Weighted Average:** Precision: `{cls_data['weighted_avg']['precision']:.4f}` | Recall: `{cls_data['weighted_avg']['recall']:.4f}` | F1-Score: `{cls_data['weighted_avg']['f1_score']:.4f}`")

    md.append("\n### Per-Class Performance Breakdown")
    md.append("\n| Category Enum | Precision | Recall | F1-Score | Support (N) |")
    md.append("|---|---|---|---|---|")
    for cat in labels:
        stat = per_class[cat]
        md.append(f"| `{cat}` | {stat['precision']:.4f} | {stat['recall']:.4f} | **{stat['f1_score']:.4f}** | {stat['support']} |")

    md.append("\n### Confusion Matrix (Rows = Ground Truth, Columns = Predicted)")
    header = "| Ground Truth \\ Predicted | " + " | ".join([f"`{l[:6]}`" for l in labels]) + " |"
    sep = "|---|" + "|".join(["---" for _ in labels]) + "|"
    md.append("\n" + header)
    md.append(sep)
    for i, label in enumerate(labels):
        row_vals = " | ".join([str(val) for val in cm[i]])
        md.append(f"| `{label}` | {row_vals} |")

    # Section 2: Duplicate Detection Benchmark
    md.append("\n---")
    md.append("\n## 2. Semantic Duplicate Detection & Cosine Similarity Benchmark")
    md.append(f"\n- **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors)")
    md.append(f"- **Evaluation Dataset:** {dup_data['dataset_size']} pairs ({dup_data['positive_pairs']} Positive Paraphrased Duplicates / {dup_data['negative_pairs']} Negative Distinctions)")
    md.append(f"- **Optimal Similarity Threshold:** **`{dup_data['optimal_threshold']:.2f}`**")
    md.append(f"- **Performance at Optimal Threshold:** Precision: **`{opt['precision'] * 100:.2f}%`** | Recall: **`{opt['recall'] * 100:.2f}%`** | F1-Score: **`{opt['f1_score']:.4f}`** | Accuracy: **`{opt['accuracy'] * 100:.2f}%`**")

    md.append("\n### Threshold Sweep & Precision-Recall Curve")
    md.append("\n| Cosine Threshold | Precision | Recall | F1-Score | Accuracy |")
    md.append("|---|---|---|---|---|")
    for s in sweep:
        bold = "**" if s["threshold"] == dup_data["optimal_threshold"] else ""
        md.append(f"| {bold}{s['threshold']:.2f}{bold} | {bold}{s['precision']:.4f}{bold} | {bold}{s['recall']:.4f}{bold} | {bold}{s['f1_score']:.4f}{bold} | {bold}{s['accuracy'] * 100:.1f}%{bold} |")

    md.append(f"\n### 🔍 Empirical Threshold Justification")
    md.append(f"> {dup_data['threshold_justification']}")

    # Section 3: Species-Aware NER & Urgency Scoring
    md.append("\n---")
    md.append("\n## 3. Species-Aware NER & Explainable Urgency Scoring")
    md.append("\n- **Named Entity Recognition (NER):** Uses spaCy `en_core_web_sm` integrated with tailored token and domain phrase dictionaries.")
    md.append("  - **Cattle:** Specializes in rumen impaction (plastic bloat), expressway obstruction hazards, ear tags, and foot-and-mouth signs.")
    md.append("  - **Dogs:** Identifies rabies markers (foaming at mouth), canine aggression patterns, collar tags, and puppy litters.")
    md.append("  - **Cats:** Extracts TNR ear-notch markers, feral colony tags, entrapments (engine bonnets/trees), and kitten distress.")
    md.append("  - **Monkeys & Birds:** Extracts electrocution trauma, troop conflicts, kite string (manja) wing lacerations, and grounded fledglings.")
    md.append("- **Explainable Urgency Scoring:** Blends DistilBERT sentiment polarity with clinical severity weights to yield a bounded score (0.0 to 1.0) and human-readable signal contributing factors for auditability.")

    report_content = "\n".join(md)
    out_md = os.path.join(results_dir, "EVALUATION_REPORT.md")
    with open(out_md, "w") as f:
        f.write(report_content)

    print(f"✅ Generated comprehensive Markdown evaluation report: {out_md}")

if __name__ == "__main__":
    generate_markdown_report()
