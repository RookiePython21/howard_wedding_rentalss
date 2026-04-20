import { CloudDownload, X } from 'lucide-react';
import { useSeatingStore } from '../../store/seatingStore';

interface ResumeChartPromptProps {
  uid: string;
  onClose: () => void;
}

export default function ResumeChartPrompt({ uid, onClose }: ResumeChartPromptProps) {
  const { loadFromCloud, cloudLoading, cloudError } = useSeatingStore();

  const handleLoad = async () => {
    try {
      await loadFromCloud(uid);
      onClose();
    } catch {
      // error surfaced via cloudError
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-start justify-between px-6 pt-5 pb-3 border-b border-cream-200">
          <div>
            <h2 className="font-playfair text-xl text-gray-800">Resume your saved chart?</h2>
            <p className="font-raleway text-sm text-gray-500 mt-0.5">
              We found a chart saved to your account.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="font-raleway text-sm text-gray-600 leading-relaxed">
            Loading will replace the chart currently on this device. Your saved version
            stays safe in the cloud — you can re-save this one later if you'd rather keep it.
          </p>

          {cloudError && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg font-raleway text-sm text-red-700">
              {cloudError}
            </div>
          )}

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl font-raleway text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleLoad}
              disabled={cloudLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm font-medium transition-colors disabled:opacity-50"
            >
              <CloudDownload size={15} />
              {cloudLoading ? 'Loading…' : 'Load saved chart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
