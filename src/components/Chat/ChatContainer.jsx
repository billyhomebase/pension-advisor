import { useState, useEffect } from 'react';
import { useChatActions } from '../../hooks/useChat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import AdvisorForm from '../AdvisorForm/AdvisorForm';
import './ChatContainer.css';

function ChatContainer() {
  const { messages, isLoading, error, sendMessage, handleToolComplete, userName, customerData, currentStage } = useChatActions();

  // Track when typing animation is complete for showing adviser form
  const [typingComplete, setTypingComplete] = useState(false);

  // Reset typing complete when loading starts (new message incoming)
  useEffect(() => {
    if (isLoading) {
      setTypingComplete(false);
    }
  }, [isLoading]);

  const handleAllTypingComplete = () => {
    setTypingComplete(true);
  };

  return (
    <div className="chat-container">
      {error && (
        <div className="chat-error" role="alert">
          {error}
        </div>
      )}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onToolComplete={handleToolComplete}
        userName={userName}
        customerData={customerData}
        onAllTypingComplete={handleAllTypingComplete}
      />
      {currentStage === 4 && !isLoading && typingComplete && (
        <div className="chat-advisor-form">
          <AdvisorForm
            userName={userName}
            customerData={customerData}
          />
        </div>
      )}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Type your message..."
      />
    </div>
  );
}

export default ChatContainer;
