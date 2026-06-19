export default function Settings() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-4">Settings</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">User Management</h2>
          {/* TODO: RBAC role assignment — SOC_ANALYST, THREAT_HUNTER, ADMIN, READ_ONLY */}
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Federated Learning Status</h2>
          {/* TODO: FL round count, epsilon budget used, connected orgs */}
        </div>
      </div>
    </div>
  );
}
