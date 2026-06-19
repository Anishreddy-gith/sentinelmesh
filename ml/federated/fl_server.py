"""
Flower Federated Learning Server.
Aggregates model updates from organisation clients.
Default strategy: FedAvg. Switch to Krum for Byzantine-robust deployments.
"""
import flwr as fl
import logging
logging.basicConfig(level=logging.INFO)

strategy = fl.server.strategy.FedAvg(
    min_fit_clients=2,
    min_evaluate_clients=2,
    min_available_clients=2,
    # TODO: switch to FedProx for non-IID data
    # TODO: switch to Krum for Byzantine-robust aggregation
)

if __name__ == "__main__":
    fl.server.start_server(
        server_address="0.0.0.0:8080",
        config=fl.server.ServerConfig(num_rounds=10),
        strategy=strategy,
    )
