"""
Flower FL Client.
Trains GNN locally using Opacus DP-SGD, sends clipped+noised gradient to server.
Privacy budget tracked per round using Renyi DP accounting.
"""
import flwr as fl
import torch
from opacus import PrivacyEngine
from ml.gnn.models.gat import GATDetector

class SentinelMeshClient(fl.client.NumPyClient):
    def __init__(self, model, train_loader, val_loader, target_epsilon=4.0, target_delta=1e-5):
        self.model = model
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.target_epsilon = target_epsilon
        self.target_delta = target_delta
        self.optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
        self.privacy_engine = PrivacyEngine()
        self.model, self.optimizer, self.train_loader = self.privacy_engine.make_private(
            module=self.model,
            optimizer=self.optimizer,
            data_loader=self.train_loader,
            noise_multiplier=1.1,
            max_grad_norm=1.0,   # L2 clip norm C
        )

    def get_parameters(self, config):
        return [p.detach().cpu().numpy() for p in self.model.parameters()]

    def fit(self, parameters, config):
        # TODO: set_parameters(parameters), run local training loop
        epsilon = self.privacy_engine.get_epsilon(delta=self.target_delta)
        print(f"Round complete | epsilon={epsilon:.4f} | delta={self.target_delta}")
        return self.get_parameters(config), len(self.train_loader.dataset), {"epsilon": epsilon}

    def evaluate(self, parameters, config):
        # TODO: evaluate on val_loader, return loss and AUC
        return 0.0, len(self.val_loader.dataset), {"auc": 0.0}
