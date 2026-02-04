import { ChatProvider, useChat } from './context/ChatContext';
import StepIndicator from './components/StepIndicator/StepIndicator';
import { ChatContainer } from './components/Chat';
import './styles/global.css';
import './App.css';

function AppContent() {
  const { state, actions } = useChat();

  return (
    <div className="app">
      <div className="app-header-bar">
        <h1 className="app-title">Pension Planning Assistant</h1>
        <button className="app-reset-btn" onClick={actions.resetChat} aria-label="Start over">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Start Again
        </button>
      </div>
      <StepIndicator currentStage={state.currentStage} />
      <div className="chat-page">
        <div className="chat-tab-content">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}

export default App;
