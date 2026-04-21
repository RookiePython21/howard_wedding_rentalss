import React, { useEffect, useRef, useState } from 'react';
import { useSeatingStore } from '../../store/seatingStore';
import { useAuth } from '../../hooks/useAuth';
import { loadChartFromCloud } from '../../services/cloudSync';
import ImportWizard from './import/ImportWizard';
import HeadTableSetup from './setup/HeadTableSetup';
import ElementsSetup from './setup/ElementsSetup';
import TableSetupWizard from './setup/TableSetupWizard';
import GuidedSeating from './setup/GuidedSeating';
import ListView from './workspace/ListView';
import FloorPlanView from './workspace/FloorPlanView';
import Toolbar from './workspace/Toolbar';
import ExportModal from './export/ExportModal';
import VersionsModal from './VersionsModal';
import SaveProgressButton from './SaveProgressButton';
import ResumeChartPrompt from './ResumeChartPrompt';
import WelcomePrompt from './WelcomePrompt';
import AuthModal from './AuthModal';

const WELCOME_DISMISSED_KEY = 'seating_welcome_dismissed';

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
  const { currentStep, viewMode, loadFromStorage, setCurrentStep } = useSeatingStore();
  const [showExport, setShowExport] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuthFromWelcome, setShowAuthFromWelcome] = useState(false);
  const { user, initializing } = useAuth();
  const checkedCloudFor = useRef<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Show the welcome/resume prompt on first mount when no user is signed in.
  // Dismissal is remembered for the rest of the tab session.
  useEffect(() => {
    if (initializing) return;
    if (user) return;
    if (sessionStorage.getItem(WELCOME_DISMISSED_KEY) === '1') return;
    setShowWelcome(true);
  }, [initializing, user]);

  // When a user signs in, check whether they have a cloud-saved chart and
  // offer to resume it. Only prompt once per signed-in UID per session.
  useEffect(() => {
    if (!user) { checkedCloudFor.current = null; return; }
    if (checkedCloudFor.current === user.uid) return;
    checkedCloudFor.current = user.uid;
    loadChartFromCloud(user.uid)
      .then((data) => { if (data) setShowResumePrompt(true); })
      .catch(() => { /* silent — save still works */ });
  }, [user]);

  const dismissWelcome = () => {
    sessionStorage.setItem(WELCOME_DISMISSED_KEY, '1');
    setShowWelcome(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Persistent header: save progress across every step */}
      <div className="flex-shrink-0 border-b border-cream-200 bg-white px-4 py-2 flex items-center justify-between gap-3">
        <div className="font-playfair text-sm text-gray-500">
          {currentStep === 'workspace' ? 'Your seating chart' : 'Building your chart'}
        </div>
        <SaveProgressButton />
      </div>

      {/* Step Indicator (pre-workspace steps only) */}
      {currentStep !== 'workspace' && (
        <div className="flex-shrink-0 border-b border-cream-200 bg-cream-50 px-6 py-2.5">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            {(() => {
              const order: typeof currentStep[] = ['import', 'head-table', 'elements', 'setup', 'seat'];
              const currentIdx = order.indexOf(currentStep);
              const labels = ['Guests', 'Head Table', 'Elements', 'Tables', 'Seating'];
              return order.map((s, i) => (
                <React.Fragment key={s}>
                  <StepBadge
                    n={i + 1}
                    label={labels[i]}
                    active={currentIdx === i}
                    done={currentIdx > i}
                    onClick={currentIdx > i ? () => setCurrentStep(s) : undefined}
                  />
                  {i < order.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
                </React.Fragment>
              ));
            })()}
          </div>
        </div>
      )}

      {currentStep === 'import' && <ImportWizard />}
      {currentStep === 'head-table' && <HeadTableSetup />}
      {currentStep === 'elements' && <ElementsSetup />}
      {currentStep === 'setup' && <TableSetupWizard />}
      {currentStep === 'seat' && <GuidedSeating />}

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
      {showResumePrompt && user && (
        <ResumeChartPrompt uid={user.uid} onClose={() => setShowResumePrompt(false)} />
      )}

      {showWelcome && !showAuthFromWelcome && (
        <WelcomePrompt
          onSignIn={() => setShowAuthFromWelcome(true)}
          onStartFresh={dismissWelcome}
        />
      )}

      {showAuthFromWelcome && (
        <AuthModal
          mode="resume"
          onClose={() => {
            setShowAuthFromWelcome(false);
            dismissWelcome();
          }}
          onAuthed={() => {
            setShowAuthFromWelcome(false);
            dismissWelcome();
            // The signed-in effect will detect a cloud chart and surface the
            // ResumeChartPrompt automatically.
          }}
        />
      )}
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

function StepBadge({ n, label, active, done, onClick }: { n: number; label: string; active: boolean; done: boolean; onClick?: () => void }) {
  const clickable = !!onClick;
  const Wrapper: React.ElementType = clickable ? 'button' : 'div';
  return (
    <Wrapper
      onClick={onClick}
      type={clickable ? 'button' : undefined}
      title={clickable ? `Back to ${label}` : undefined}
      className={`flex items-center gap-2 flex-shrink-0 rounded-full group ${
        clickable ? 'cursor-pointer hover:opacity-90' : ''
      }`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-raleway font-semibold transition-colors ${
        active ? 'bg-gold-500 text-white' :
        done ? `bg-gold-200 text-gold-700 ${clickable ? 'group-hover:bg-gold-300' : ''}` :
        'bg-gray-200 text-gray-400'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`font-raleway text-sm hidden sm:block transition-colors ${
        active ? 'text-gold-600 font-medium' :
        done && clickable ? 'text-gold-700 group-hover:text-gold-800 group-hover:underline' :
        'text-gray-400'
      }`}>
        {label}
      </span>
    </Wrapper>
  );
}
