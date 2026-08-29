import json
import os
import sys

# Ensure apps/nlp is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.classifier import classifier_service
from schemas.classification import VALID_CATEGORIES
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

def run_classification_eval():
    data_path = os.path.join(os.path.dirname(__file__), "data", "classification_eval_set.json")
    results_dir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(results_dir, exist_ok=True)

    with open(data_path, "r") as f:
        samples = json.load(f)

    y_true = []
    y_pred = []
    sample_results = []

    print(f"📊 Running Report Classification Evaluation on {len(samples)} multi-species samples...")

    for i, item in enumerate(samples):
        text = item["text"]
        species = item.get("species", "dog")
        true_cat = item["ground_truth"]

        pred_cat, conf, all_scores = classifier_service.classify(text, species=species)

        y_true.append(true_cat)
        y_pred.append(pred_cat)

        sample_results.append({
            "index": i + 1,
            "text": text,
            "species": species,
            "ground_truth": true_cat,
            "predicted": pred_cat,
            "confidence": conf,
            "correct": true_cat == pred_cat,
        })

    # Metrics computation
    accuracy = float(accuracy_score(y_true, y_pred))
    report_dict = classification_report(y_true, y_pred, labels=VALID_CATEGORIES, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_true, y_pred, labels=VALID_CATEGORIES).tolist()

    metrics = {
        "dataset_size": len(samples),
        "overall_accuracy": round(accuracy, 4),
        "macro_avg": {
            "precision": round(report_dict["macro avg"]["precision"], 4),
            "recall": round(report_dict["macro avg"]["recall"], 4),
            "f1_score": round(report_dict["macro avg"]["f1-score"], 4),
        },
        "weighted_avg": {
            "precision": round(report_dict["weighted avg"]["precision"], 4),
            "recall": round(report_dict["weighted avg"]["recall"], 4),
            "f1_score": round(report_dict["weighted avg"]["f1-score"], 4),
        },
        "per_class": {
            cat: {
                "precision": round(report_dict[cat]["precision"], 4),
                "recall": round(report_dict[cat]["recall"], 4),
                "f1_score": round(report_dict[cat]["f1-score"], 4),
                "support": int(report_dict[cat]["support"]),
            }
            for cat in VALID_CATEGORIES
        },
        "labels": VALID_CATEGORIES,
        "confusion_matrix": cm,
    }

    out_file = os.path.join(results_dir, "classification_metrics.json")
    with open(out_file, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n🎯 Classification Evaluation Completed!")
    print(f"   Accuracy: {accuracy * 100:.2f}%")
    print(f"   Macro F1: {metrics['macro_avg']['f1_score']:.4f}")
    print(f"   Weighted F1: {metrics['weighted_avg']['f1_score']:.4f}")
    print(f"   Saved JSON metrics to: {out_file}")

    return metrics

if __name__ == "__main__":
    run_classification_eval()
