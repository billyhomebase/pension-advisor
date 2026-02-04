import { useEffect, useRef, useState } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { PensionCalculator } from '../PensionCalculator';
import './MessageList.css';

function MessageList({ messages, isLoading, onToolComplete, userName, customerData, onAllTypingComplete }) {
  const listRef = useRef(null);
  // Track message IDs that have already been displayed (don't animate these)
  const [seenMessageIds, setSeenMessageIds] = useState(() => new Set());

  // Track if calculator should be shown (triggered by clicking the link in any message)
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorInitialValues, setCalculatorInitialValues] = useState({});

  // Track which messages have completed typing
  const [typingCompleteIds, setTypingCompleteIds] = useState(() => new Set());

  // Mark messages as seen after they've been rendered
  useEffect(() => {
    const newIds = messages.filter((m) => !seenMessageIds.has(m.id)).map((m) => m.id);

    if (newIds.length > 0) {
      // Delay marking as seen to allow animation to start
      const timer = setTimeout(() => {
        setSeenMessageIds((prev) => {
          const updated = new Set(prev);
          newIds.forEach((id) => updated.add(id));
          return updated;
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, seenMessageIds]);

  // Auto-scroll to bottom when new messages arrive (within container only)
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, showCalculator]);

  // Handler for showing calculator from message links
  const handleShowCalculator = (initialValues = {}) => {
    setCalculatorInitialValues(initialValues);
    setShowCalculator(true);
  };

  // Handler for calculator completion
  const handleCalculatorComplete = (result) => {
    if (onToolComplete) {
      onToolComplete(null, 'pension-calculator', result);
    }
  };

  // Handler for when a message finishes typing
  const handleTypingComplete = (messageId) => {
    setTypingCompleteIds((prev) => {
      const updated = new Set(prev);
      updated.add(messageId);
      return updated;
    });

    // Check if this is the last message and notify parent
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.id === messageId && onAllTypingComplete) {
      onAllTypingComplete();
    }
  };

  return (
    <div className="message-list" ref={listRef} role="log" aria-live="polite">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          animate={!seenMessageIds.has(message.id)}
          userName={userName}
          customerData={customerData}
          onShowCalculator={handleShowCalculator}
          onTypingComplete={handleTypingComplete}
        />
      ))}

      {showCalculator && (
        <div className="calculator-container">
          <PensionCalculator
            initialValues={calculatorInitialValues}
            onComplete={handleCalculatorComplete}
          />
        </div>
      )}

      {isLoading && <TypingIndicator />}
    </div>
  );
}

export default MessageList;
