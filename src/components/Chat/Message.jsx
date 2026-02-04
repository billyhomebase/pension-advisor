import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTypewriter } from '../../hooks/useTypewriter';
import AdvisorForm from '../AdvisorForm/AdvisorForm';
import './Message.css';

function Message({ message, animate = false, userName, customerData, onShowCalculator, onTypingComplete }) {
  const isUser = message.role === 'user';
  const hasTool = message.tool && message.tool.type;

  // Track if calculator link was clicked (to disable the button)
  const [calculatorClicked, setCalculatorClicked] = useState(false);

  // Track if adviser form should be shown (triggered by clicking the link)
  const [showAdviserForm, setShowAdviserForm] = useState(false);

  // Capture animate value on first render - don't change it later
  const [shouldAnimate] = useState(() => animate && !isUser && !!message.content);

  const { displayedText, isTyping } = useTypewriter(message.content || '', {
    speed: 20,
    enabled: shouldAnimate
  });

  // Track if we've already notified completion to prevent duplicate calls
  const hasNotifiedRef = useRef(false);

  // Notify parent when typing completes (or immediately if no animation needed)
  useEffect(() => {
    if (!onTypingComplete || hasNotifiedRef.current) return;

    // If this message doesn't animate (user message, already seen, or no content), notify immediately
    if (!shouldAnimate) {
      hasNotifiedRef.current = true;
      onTypingComplete(message.id);
      return;
    }

    // If animating, notify when typing finishes
    if (!isTyping) {
      hasNotifiedRef.current = true;
      onTypingComplete(message.id);
    }
  }, [isTyping, shouldAnimate, message.id, onTypingComplete]);

  const handleCalculatorClick = (e) => {
    e.preventDefault();
    setCalculatorClicked(true);
    // Get initial values from tool metadata if available
    const initialValues = (hasTool && message.tool.type === 'pension-calculator')
      ? message.tool.initialValues
      : {};
    if (onShowCalculator) {
      onShowCalculator(initialValues);
    }
  };

  const handleAdviserFormClick = (e) => {
    e.preventDefault();
    setShowAdviserForm(true);
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

    // Check if this is an adviser form link
    const isAdviserLinkByHref = linkHref && (
      linkHref === '#show-adviser-form' ||
      linkHref.includes('show-adviser') ||
      linkHref.includes('adviser-form')
    );

    const isAdviserLinkByText = linkText.toLowerCase().includes('speak with an adviser') ||
      linkText.toLowerCase().includes('book a call') ||
      linkText.toLowerCase().includes('request a call');

    const isAdviserLink = isAdviserLinkByHref || isAdviserLinkByText;

    if (isCalculatorLink) {
      return (
        <button
          type="button"
          className="calculator-link"
          onClick={handleCalculatorClick}
          disabled={calculatorClicked}
        >
          {children}
        </button>
      );
    }

    if (isAdviserLink) {
      return (
        <button
          type="button"
          className="adviser-link"
          onClick={handleAdviserFormClick}
          disabled={showAdviserForm}
        >
          {children}
        </button>
      );
    }

    return <a href={linkHref} target="_blank" rel="noopener noreferrer">{children}</a>;
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
      {showAdviserForm && (
        <div className="message-tool">
          <AdvisorForm
            userName={userName}
            customerData={customerData}
          />
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
