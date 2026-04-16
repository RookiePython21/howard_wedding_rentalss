import React, { useEffect, useState } from 'react';
import { useSeatingStore } from '../../store/seatingStore';
import ImportWizard from './import/ImportWizard';
import TableSetupWizard from './setup/TableSetupWizard';
import ListView from './workspace/ListView';
import FloorPlanView from './workspace/FloorPlanView';
import Toolbar from './workspace/Toolbar';
import ExportModal from './export/ExportModal';
import VersionsModal from './VersionsModal';

// ─── Error Boundary ───────────────────────────────────────────────────────────
// Prevents any render error from wiping the entire page white.

interface ErrorBoundaryState { error: Error | null }

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8 bg-cream-50">
          <div className="text-4xl">⚠️</div>
          <h2 className="font-playfair text-xl text-gray-700">Something went wrong</h2>
          <p className="font-raleway text-sm text-gray-500 text-center max-w-sm">
            An unexpected error occurred in the seating chart. Your data is safe — click below to reload the tool.
          </p>
          <code className="bg-gray-100 text-red-600 text-xs px-3 py-2 rounded-lg font-mono max-w-md break-all">
            {this.state.error.message}
          </code>
          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-raleway text-sm transition-colors"
          >
            Reload Tool
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

function SeatingChartInner() {
  const { currentStep, viewMode, loadFromStorage } = useSeatingStore();
  const [showExport, setShowExport] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Step Indicator (import step only) */}
      {currentStep === 'import' && (
        <div className="flex-shrink-0 border-b border-cream-200 bg-cream-50 px-6 py-2.5">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <StepBadge n={1} label="Import Guests" active={true} done={false} />
            <div className="flex-1 h-px bg-gray-200" />
            <StepBadge n={2} label="Place Main Table" active={false} done={false} />
            <div className="flex-1 h-px bg-gray-200" />
            <StepBadge n={3} label="Arrange & Seat" active={false} done={false} />
          </div>
        </div>
      )}

      {currentStep === 'import' && <ImportWizard />}
      {currentStep === 'setup' && <TableSetupWizard />}

      {currentStep === 'workspace' && (
        <>
          <Toolbar
            onExport={() => setShowExport(true)}
            onVersionsOpen={() => setShowVersions(true)}
          />
          <div className="flex-1 overflow-hidden">
            {viewMode === 'list' ? <ListView /> : <FloorPlanView />}
          </div>
        </>
      )}

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showVersions && <VersionsModal onClose={() => setShowVersions(false)} />}
    </div>
  );
}

export default function SeatingChartApp() {
  return (
    <ErrorBoundary>
      <SeatingChartInner />
    </ErrorBoundary>
  );
}

function StepBadge({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-raleway font-semibold transition-colors ${
        active ? 'bg-gold-500 text-white' :
        done ? 'bg-gold-200 text-gold-700' :
        'bg-gray-200 text-gray-400'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`font-raleway text-sm hidden sm:block ${active ? 'text-gold-600 font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
