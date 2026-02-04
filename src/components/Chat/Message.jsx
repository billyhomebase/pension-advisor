import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTypewriter } from '../../hooks/useTypewriter';
import { PensionCalculator } from '../PensionCalculator';
import './Message.css';

function Message({ message, onToolComplete, animate = false }) {
  const isUser = message.role === 'user';
  const hasTool = message.tool && message.tool.type;

  // Track if calculator should be shown (triggered by clicking the link)
  const [showCalculator, setShowCalculator] = useState(false);

  // Capture animate value on first render - don't change it later
  const [shouldAnimate] = useState(() => animate && !isUser && !!message.content);

  const { displayedText, isTyping } = useTypewriter(message.content || '', {
    speed: 20,
    enabled: shouldAnimate
  });

  const handleToolComplete = (result) => {
    if (onToolComplete) {
      onToolComplete(message.id, message.tool.type, result);
    }
  };

  const handleCalculatorClick = (e) => {
    e.preventDefault();
    setShowCalculator(true);
  };

  // Custom link renderer for ReactMarkdown
  const MarkdownLink = (props) => {
    const { href, children, node } = props;
    // Get href from props or node (react-markdown v10 compatibility)
    const linkHref = href || node?.properties?.href || '';

    // Get link text content (for fallback detection)
    const linkText = typeof children === 'string'
      ? children
      : Array.isArray(children)
        ? children.map(c => typeof c === 'string' ? c : c?.props?.children || '').join('')
        : '';

    // Check if this is a calculator link by href OR by link text
    // This handles cases where react-markdown sanitizes the href
    const isCalculatorLinkByHref = linkHref && (
      linkHref === '#show-calculator' ||
      linkHref.includes('show-calculator') ||
      linkHref === '#calculator' ||
      linkHref.includes('calculator:show')
    );

    const isCalculatorLinkByText = linkText.toLowerCase().includes('pension pot calculator') ||
      linkText.toLowerCase().includes('calculator');

    const isCalculatorLink = isCalculatorLinkByHref || isCalculatorLinkByText;

    if (isCalculatorLink) {
      return (
        <button
          type="button"
          className="calculator-link"
          onClick={handleCalculatorClick}
          disabled={showCalculator}
        >
          {children}
        </button>
      );
    }
    return <a href={linkHref} target="_blank" rel="noopener noreferrer">{children}</a>;
  };

  const renderCalculator = () => {
    // Get initial values from tool metadata if available, otherwise use empty object
    const initialValues = (hasTool && message.tool.type === 'pension-calculator')
      ? message.tool.initialValues
      : {};

    return (
      <PensionCalculator
        initialValues={initialValues}
        onComplete={handleToolComplete}
      />
    );
  };

  // Use displayed text for animated messages, full content otherwise
  const textToShow = shouldAnimate ? displayedText : message.content;

  return (
    <div className={`message ${isUser ? 'message--user' : 'message--assistant'}${isTyping ? ' message--typing' : ''}`}>
      {textToShow && (
        <div className="message-content">
          {isUser ? (
            textToShow
          ) : (
            <ReactMarkdown components={{ a: MarkdownLink }}>{textToShow}</ReactMarkdown>
          )}
        </div>
      )}
      {showCalculator && (
        <div className="message-tool">
          {renderCalculator()}
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
