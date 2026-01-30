import './TypingIndicator.css';

function TypingIndicator() {
  return (
    <div className="typing-indicator" aria-label="Assistant is typing">
      <div className="typing-indicator-bubble">
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
        <span className="typing-dot"></span>
      </div>
    </div>
  );
}

export default TypingIndicator;
