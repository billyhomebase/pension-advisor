import { useChatActions } from '../../hooks/useChat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import './ChatContainer.css';

function ChatContainer() {
  const { messages, isLoading, error, sendMessage } = useChatActions();

  return (
    <div className="chat-container">
      {error && (
        <div className="chat-error" role="alert">
          {error}
        </div>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder="Type your message..."
      />
    </div>
  );
}

export default ChatContainer;
