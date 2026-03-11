import { logout } from '@/lib/api';
import { LogOut } from 'lucide-react';

export default function Settings() {
  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Account</h2>
          <p className="text-xs text-gray-500 mb-4">
            Connected to RelationshipOS API at relationshipos-api.onrender.com
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-xs text-gray-500">
            RelationshipOS (Relate) — Relationship Intelligence Operating System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            People are the central object. The system builds memory, structure, and intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
