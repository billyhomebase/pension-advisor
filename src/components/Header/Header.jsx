import './Header.css';

function Header({ onReset }) {
  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? This will clear your conversation.')) {
      onReset();
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <a href="/" className="header-logo" aria-label="M&G Home">
          <img src="/images/logo.svg" alt="M&G" />
        </a>
        <div className="header-title">
          <span className="header-subtitle">Pension Planning Assistant</span>
        </div>
        {onReset && (
          <button className="header-reset" onClick={handleReset} aria-label="Start over">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="reset-text">Start Over</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
