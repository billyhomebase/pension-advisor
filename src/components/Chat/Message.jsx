import { PensionCalculator } from '../PensionCalculator';
import './Message.css';

function Message({ message, onToolComplete }) {
  const isUser = message.role === 'user';
  const hasTool = message.tool && message.tool.type;

  const handleToolComplete = (result) => {
    if (onToolComplete) {
      onToolComplete(message.id, message.tool.type, result);
    }
  };

  const renderTool = () => {
    if (!hasTool) return null;

    switch (message.tool.type) {
      case 'pension-calculator':
        return (
          <PensionCalculator
            initialValues={message.tool.initialValues}
            onComplete={handleToolComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--assistant'}`}>
      {message.content && (
        <div className="message-content">
          {message.content}
        </div>
      )}
      {hasTool && (
        <div className="message-tool">
          {renderTool()}
        </div>
      )}
      {message.timestamp && (
        <time className="message-time" dateTime={message.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </time>
      )}
    </div>
  );
}

export default Message;
