import { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import StepIndicator from './components/StepIndicator/StepIndicator';
import { ChatContainer } from './components/Chat';
import AdvisorForm from './components/AdvisorForm/AdvisorForm';
import './styles/global.css';
import './App.css';

function AppContent() {
  const { state, actions } = useChat();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="app">
      <Header onReset={actions.resetChat} />
      <main className="app-main">
        <StepIndicator currentStage={state.currentStage} />
        <div className="chat-page">
          {state.showAdvisorForm && (
            <div className="chat-tabs">
              <button
                className={`chat-tab ${activeTab === 'chat' ? 'chat-tab--active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Conversation
              </button>
              <button
                className={`chat-tab ${activeTab === 'advisor' ? 'chat-tab--active' : ''}`}
                onClick={() => setActiveTab('advisor')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Speak with Advisor
              </button>
            </div>
          )}
          <div className="chat-tab-content">
            {activeTab === 'chat' || !state.showAdvisorForm ? (
              <ChatContainer />
            ) : (
              <AdvisorForm
                userName={state.userName}
                customerData={state.customerData}
                onClose={() => setActiveTab('chat')}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
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
