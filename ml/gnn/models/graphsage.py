"""
GraphSAGE — baseline comparison model.
Easier to implement, used to validate GAT performance gain.
"""
import torch
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv

class GraphSAGEDetector(torch.nn.Module):
    def __init__(self, in_channels: int, hidden_channels: int = 64):
        super().__init__()
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, hidden_channels)
        self.classifier = torch.nn.Linear(hidden_channels, 1)

    def forward(self, x, edge_index):
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.3, training=self.training)
        x = self.conv2(x, edge_index)
        return torch.sigmoid(self.classifier(x)).squeeze(-1)
