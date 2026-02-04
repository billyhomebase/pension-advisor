import { useState, useEffect } from 'react';

/**
 * Hook that creates a typewriter effect for text
 * @param {string} text - The full text to type out
 * @param {object} options - Configuration options
 * @param {number} options.speed - Milliseconds per word (default: 50)
 * @param {boolean} options.enabled - Whether to animate
 * @returns {object} - { displayedText, isTyping }
 */
export function useTypewriter(text, { speed = 50, enabled = true } = {}) {
  const [displayedText, setDisplayedText] = useState(enabled ? '' : text);
  // Initialize isTyping to true if we're going to animate (prevents false completion detection)
  const [isTyping, setIsTyping] = useState(enabled && !!text);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    if (!enabled) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // Start animation
    setIsTyping(true);
    setDisplayedText('');

    const words = text.split(/(\s+)/);
    let index = 0;

    const typeNextWord = () => {
      index++;
      if (index <= words.length) {
        setDisplayedText(words.slice(0, index).join(''));
      }
      if (index >= words.length) {
        setIsTyping(false);
        clearInterval(interval);
      }
    };

    const interval = setInterval(typeNextWord, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayedText, isTyping };
}
