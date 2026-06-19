"""
FastAPI Analyst Brief Generation Service.
Accepts a structured alert cluster, returns a plain-English analyst brief.
Fine-tuned BART/T5 model. Falls back to template if model not loaded.
"""
import os
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SentinelMesh Brief Generation", version="1.0.0")
summariser = None

class AlertCluster(BaseModel):
    src_ip: str
    dst_ip: str
    protocol: str
    alert_type: str
    anomaly_score: float
    mitre_technique: str
    mitre_tactic: str
    graph_path: list[str]
    timestamp: str
    detection_id: str

@app.on_event("startup")
async def load_model():
    global summariser
    model_path = os.getenv('BERT_MODEL_PATH', '')
    if model_path and os.path.exists(model_path):
        from transformers import pipeline
        summariser = pipeline("summarization", model=model_path)
        print(f"NLP model loaded from {model_path}")
    else:
        print("WARNING: No fine-tuned model found. Using template fallback.")

@app.get("/health")
def health(): return {"status": "ok", "service": "brief-generation", "model_loaded": summariser is not None}

@app.post("/generate")
def generate_brief(cluster: AlertCluster):
    path_str = " → ".join(cluster.graph_path)
    if summariser:
        prompt = (f"Alert: {cluster.alert_type} | Src: {cluster.src_ip} | Dst: {cluster.dst_ip} | "
                  f"Protocol: {cluster.protocol} | MITRE: {cluster.mitre_technique} ({cluster.mitre_tactic}) | "
                  f"Path: {path_str} | Score: {cluster.anomaly_score} | Time: {cluster.timestamp}")
        result = summariser(prompt, max_length=200, min_length=60, do_sample=False)
        brief_text = result[0]['summary_text']
    else:
        brief_text = (
            f"At {cluster.timestamp}, host {cluster.src_ip} established a {cluster.protocol} connection "
            f"to {cluster.dst_ip}. Alert type: {cluster.alert_type}. "
            f"MITRE technique {cluster.mitre_technique} ({cluster.mitre_tactic}) was identified. "
            f"Attack path: {path_str}. Anomaly score: {cluster.anomaly_score:.2f}. "
            f"Investigate {cluster.src_ip} for lateral movement indicators."
        )
    return {
        "detection_id": cluster.detection_id,
        "brief": brief_text,
        "confidence": cluster.anomaly_score,
        "mitre_technique": cluster.mitre_technique
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
