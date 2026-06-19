"""
Utility: track cumulative privacy budget across FL rounds.
"""
def compute_epsilon(noise_multiplier: float, num_steps: int,
                    batch_size: int, dataset_size: int, delta: float) -> float:
    """
    Rough RDP accounting estimate.
    For production use Opacus privacy_engine.get_epsilon(delta).
    """
    from opacus.accountants import RDPAccountant
    accountant = RDPAccountant()
    sampling_rate = batch_size / dataset_size
    for _ in range(num_steps):
        accountant.step(noise_multiplier=noise_multiplier, sample_rate=sampling_rate)
    return accountant.get_epsilon(delta=delta)
