# SentinelMesh: Federated Graph Neural Network Detection of Lateral Movement with Differential Privacy

**Status:** Draft — do not distribute

## Abstract
<!-- TODO: complete after experiments -->

## 1. Introduction
Advanced Persistent Threat (APT) lateral movement detection remains unsolved in operational SOC environments.
Signature-based tools fail against living-off-the-land techniques. Per-host analysis misses graph-level signals.
Cross-organisation threat sharing is legally constrained. SentinelMesh addresses all three gaps.

## 2. Related Work
<!-- TODO: cite GNN-based NIDS papers, federated learning in security, DP for ML -->

## 3. System Architecture
<!-- Reference docs/architecture.md -->

## 4. GNN Model
Architecture: Graph Attention Network (GAT), 2 layers, 3 heads, hidden dim 64.
Input: host communication graph (node features: 8-dim, edge features: 8-dim).
Training: UNSW-NB15, CIC-IDS2018, LANL Unified Host and Network Dataset.
Target: AUC > 0.85 at less than 1% FPR on clean traffic.

## 5. Federated Learning with Differential Privacy
Framework: Flower (flwr). Aggregation: FedAvg default, FedProx for non-IID, Krum for Byzantine robustness.
Privacy: Opacus DP-SGD, L2 clip norm C=1.0, target epsilon 1.0-8.0, delta=1/N.

## 6. Evaluation
<!-- TODO: fill in after experiments complete -->

## 7. Conclusion
<!-- TODO -->

## Publication Targets
- IEEE S&P (primary)
- USENIX Security
- NDSS
