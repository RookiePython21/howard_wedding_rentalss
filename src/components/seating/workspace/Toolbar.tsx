import { useState } from 'react';
import {
  Undo2, Redo2, Save, Shuffle, LayoutList, Map, Download, RotateCcw, History
} from 'lucide-react';
import { useSeatingStore } from '../../../store/seatingStore';

interface ToolbarProps {
  onExport: () => void;
  onVersionsOpen: () => void;
}

export default function Toolbar({ onExport, onVersionsOpen }: ToolbarProps) {
  const { viewMode, setViewMode, undo, redo, past, future, chaosMode, saveVersion, setCurrentStep, versions, reset } = useSeatingStore();
  const [saveVersionName, setSaveVersionName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSaveVersion = () => {
    if (!saveVersionName.trim()) return;
    saveVersion(saveVersionName.trim());
    setSaveVersionName('');
    setShowSaveForm(false);
  };

  const handleChaosMode = () => {
    if (confirm('🎲 Chaos Mode: Randomly assign all guests to tables?\n\nYou can undo this action.')) {
      chaosMode();
    }
  };

  return (
    <div className="bg-white border-b border-cream-200 px-4 py-2.5 flex items-center gap-2 flex-wrap">
      {/* Navigation */}
      <button
        onClick={() => setCurrentStep('setup')}
        className="flex items-center gap-1.5 text-sm font-raleway text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
      >
        ← Setup
      </button>

      <div className="h-6 w-px bg-cream-200" />

      {/* View toggle */}
      <div className="flex items-center bg-cream-50 border border-cream-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-raleway transition-colors ${
            viewMode === 'list' ? 'bg-gold-500 text-white' : 'text-gray-500 hover:bg-cream-100'
          }`}
        >
          <LayoutList size={15} /> List
        </button>
        <button
          onClick={() => setViewMode('floorplan')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-raleway transition-colors ${
            viewMode === 'floorplan' ? 'bg-gold-500 text-white' : 'text-gray-500 hover:bg-cream-100'
          }`}
        >
          <Map size={15} /> Floor Plan
        </button>
      </div>

      <div className="h-6 w-px bg-cream-200" />

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={past.length === 0}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title={`Undo (${past.length} actions)`}
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={redo}
        disabled={future.length === 0}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title={`Redo (${future.length} actions)`}
      >
        <Redo2 size={16} />
      </button>

      <div className="h-6 w-px bg-cream-200" />

      {/* Chaos Mode */}
      <button
        onClick={handleChaosMode}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-raleway bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
        title="Randomly shuffle all guests into tables"
      >
        <Shuffle size={14} /> Chaos Mode
      </button>

      <div className="h-6 w-px bg-cream-200" />

      {/* Save Version */}
      {showSaveForm ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="text"
            placeholder='e.g. "Conservative"'
            value={saveVersionName}
            onChange={e => setSaveVersionName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSaveVersion(); if (e.key === 'Escape') setShowSaveForm(false); }}
            className="text-sm border border-gold-300 rounded-lg px-2.5 py-1.5 font-raleway focus:outline-none w-36"
          />
          <button
            onClick={handleSaveVersion}
            disabled={!saveVersionName.trim()}
            className="px-3 py-1.5 bg-gold-500 text-white text-sm font-raleway rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setShowSaveForm(false)}
            className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowSaveForm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-raleway border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Save size={14} /> Save Version
        </button>
      )}

      {versions.length > 0 && (
        <button
          onClick={onVersionsOpen}
          className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-raleway text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          title={`${versions.length} saved version${versions.length > 1 ? 's' : ''}`}
        >
          <History size={14} />
          <span className="text-xs bg-gold-100 text-gold-700 px-1.5 rounded-full">{versions.length}</span>
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Reset */}
        {showConfirmReset ? (
          <div className="flex items-center gap-1">
            <span className="font-raleway text-xs text-red-600">Reset everything?</span>
            <button onClick={() => { reset(); setShowConfirmReset(false); }} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg font-raleway">Yes</button>
            <button onClick={() => setShowConfirmReset(false)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg text-gray-500 font-raleway">No</button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Reset / Start Over"
          >
            <RotateCcw size={15} />
          </button>
        )}

        {/* Export */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-sm font-raleway rounded-xl transition-colors"
        >
          <Download size={14} /> Export
        </button>
      </div>
    </div>
  );
}
