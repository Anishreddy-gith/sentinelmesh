"""
Training pipeline.
Trains GAT or GraphSAGE on graph snapshot datasets with early stopping on validation AUC.
"""
import torch
import torch.nn as nn
from sklearn.metrics import roc_auc_score

def train_epoch(model, loader, optimizer):
    model.train()
    criterion = nn.BCELoss()
    total_loss = 0
    for batch in loader:
        optimizer.zero_grad()
        out = model(batch.x, batch.edge_index)
        loss = criterion(out[batch.train_mask], batch.y[batch.train_mask].float())
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(loader)

def evaluate(model, data, mask_attr='test_mask'):
    model.eval()
    mask = getattr(data, mask_attr)
    with torch.no_grad():
        out = model(data.x, data.edge_index)
        scores = out[mask].numpy()
        labels = data.y[mask].numpy()
    return roc_auc_score(labels, scores)

def train(model, train_loader, val_data, epochs=100, patience=10):
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=5e-4)
    best_auc, no_improve = 0, 0
    for epoch in range(epochs):
        loss = train_epoch(model, train_loader, optimizer)
        auc = evaluate(model, val_data, 'val_mask')
        print(f'Epoch {epoch+1:03d} | Loss: {loss:.4f} | Val AUC: {auc:.4f}')
        if auc > best_auc:
            best_auc = auc
            torch.save(model.state_dict(), 'checkpoints/best_model.pt')
            no_improve = 0
        else:
            no_improve += 1
        if no_improve >= patience:
            print(f'Early stopping at epoch {epoch+1}')
            break
    return best_auc
