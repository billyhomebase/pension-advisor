import { useEffect, useRef, useState } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

function MessageList({ messages, isLoading, onToolComplete }) {
  const listRef = useRef(null);
  // Track message IDs that have already been displayed (don't animate these)
  const [seenMessageIds, setSeenMessageIds] = useState(() => new Set());

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
  }, [messages, isLoading]);

  return (
    <div className="message-list" ref={listRef} role="log" aria-live="polite">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onToolComplete={onToolComplete}
          animate={!seenMessageIds.has(message.id)}
        />
      ))}

      {isLoading && <TypingIndicator />}
    </div>
  );
}

export default MessageList;
