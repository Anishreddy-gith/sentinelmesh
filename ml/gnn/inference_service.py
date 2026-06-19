"""
FastAPI GNN Inference Service.
Receives graph snapshots, returns per-node anomaly scores and top anomalous subgraphs.
"""
import os
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from ml.gnn.models.gat import GATDetector

app = FastAPI(title="SentinelMesh GNN Inference", version="1.0.0")
model = None

class GraphInput(BaseModel):
    node_features: list   # list of float arrays, one per node
    edge_index: list      # [[src_indices], [dst_indices]]
    node_ids: list        # IP addresses corresponding to each node index

@app.on_event("startup")
async def load_model():
    global model
    model_path = os.getenv('GNN_MODEL_PATH', 'checkpoints/gat_model.pt')
    if os.path.exists(model_path):
        model = GATDetector(in_channels=8)
        model.load_state_dict(torch.load(model_path, map_location='cpu'))
        model.eval()
        print(f"Model loaded from {model_path}")
    else:
        print("WARNING: No model checkpoint found. Run training first.")

@app.get("/health")
def health(): return {"status": "ok", "service": "gnn-inference", "model_loaded": model is not None}

@app.post("/infer")
def infer(graph: GraphInput):
    if model is None:
        return {"error": "Model not loaded", "anomaly_scores": []}
    x = torch.tensor(graph.node_features, dtype=torch.float)
    edge_index = torch.tensor(graph.edge_index, dtype=torch.long)
    with torch.no_grad():
        scores = model(x, edge_index).tolist()
    results = [{"node_ip": ip, "anomaly_score": score}
               for ip, score in zip(graph.node_ids, scores)]
    anomalous = [r for r in results if r["anomaly_score"] > 0.7]
    return {"anomaly_scores": results, "anomalous_nodes": anomalous, "threshold": 0.7}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
