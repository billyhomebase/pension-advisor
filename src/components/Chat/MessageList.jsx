import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

function MessageList({ messages, isLoading }) {
  const listRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
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
        <Message key={message.id} message={message} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}

export default MessageList;
