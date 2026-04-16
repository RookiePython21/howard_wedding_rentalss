import { X, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { useSeatingStore } from '../../store/seatingStore';

interface VersionsModalProps {
  onClose: () => void;
}

export default function VersionsModal({ onClose }: VersionsModalProps) {
  const { versions, loadVersion, deleteVersion, guests, tables } = useSeatingStore();

  const seated = guests.filter(g => g.tableId !== null).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h2 className="font-playfair text-2xl text-gray-800">Saved Versions</h2>
            <p className="font-raleway text-sm text-gray-500">
              Current: {seated}/{guests.length} guests seated · {tables.length} tables
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {versions.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📂</div>
              <p className="font-playfair text-gray-600 mb-1">No saved versions yet</p>
              <p className="font-raleway text-sm text-gray-400">
                Use the "Save Version" button in the toolbar to save your current arrangement.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...versions].reverse().map(version => {
                const date = new Date(version.timestamp);
                const seatedCount = Object.values(version.guestTableAssignments).filter(v => v !== null).length;
                return (
                  <div
                    key={version.id}
                    className="flex items-center gap-3 p-4 border border-cream-200 rounded-xl hover:border-cream-300 hover:bg-cream-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-raleway font-semibold text-gray-700">{version.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={11} className="text-gray-400" />
                        <p className="font-raleway text-xs text-gray-400">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <span className="text-gray-300">·</span>
                        <p className="font-raleway text-xs text-gray-400">{seatedCount} guests seated</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { loadVersion(version.id); onClose(); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gold-100 text-gold-700 rounded-lg text-xs font-raleway hover:bg-gold-200 transition-colors"
                      >
                        <RotateCcw size={12} /> Restore
                      </button>
                      <button
                        onClick={() => deleteVersion(version.id)}
                        className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete version"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
