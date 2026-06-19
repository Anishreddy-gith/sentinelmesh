"""
Graph Attention Network (GAT) — primary SentinelMesh detection model.
Architecture: 2 GATConv layers, 3 attention heads, hidden dim 64.
Task: binary node classification (normal=0, anomalous=1).
Target: AUC > 0.85 on UNSW-NB15 / CIC-IDS2018 test sets.
"""
import torch
import torch.nn.functional as F
from torch_geometric.nn import GATConv

class GATDetector(torch.nn.Module):
    def __init__(self, in_channels: int, hidden_channels: int = 64,
                 heads: int = 3, dropout: float = 0.3):
        super().__init__()
        self.dropout = dropout
        self.conv1 = GATConv(in_channels, hidden_channels, heads=heads, dropout=dropout)
        self.conv2 = GATConv(hidden_channels * heads, hidden_channels,
                             heads=1, concat=False, dropout=dropout)
        self.classifier = torch.nn.Linear(hidden_channels, 1)

    def forward(self, x, edge_index):
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = F.elu(self.conv1(x, edge_index))
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv2(x, edge_index)
        return torch.sigmoid(self.classifier(x)).squeeze(-1)
