import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

function MessageList({ messages, isLoading, onToolComplete }) {
  const listRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive (within container only)
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  return (
    <div className="message-list" ref={listRef} role="log" aria-live="polite">
      {messages.length === 0 && !isLoading && (
        <div className="message-list-empty">
          <p>Welcome to your pension planning journey.</p>
          <p>Let's get started...</p>
        </div>
      )}

      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onToolComplete={onToolComplete}
        />
      ))}

      {isLoading && <TypingIndicator />}
    </div>
  );
}

export default MessageList;
