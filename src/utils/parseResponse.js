/**
 * Parse LLM response to extract display content and metadata
 *
 * Expected metadata format:
 * ```metadata
 * {"stage": 1, "extractedData": {"name": "John"}, "tool": {"type": "pension-calculator"}}
 * ```
 */
export function parseAssistantResponse(response) {
  // Match metadata block with code fence
  const metadataMatch = response.match(/```metadata\s*\n?([\s\S]*?)\n?```/);

  if (metadataMatch) {
    try {
      const metadata = JSON.parse(metadataMatch[1].trim());
      const displayContent = response
        .replace(/```metadata\s*\n?[\s\S]*?\n?```/, '')
        .trim();

      return {
        displayContent,
        stage: metadata.stage || null,
        extractedData: metadata.extractedData || {},
        tool: metadata.tool || null
      };
    } catch (parseError) {
      console.warn('Failed to parse metadata JSON:', parseError);
    }
  }

  // Fallback: return original response if no valid metadata found
  return {
    displayContent: response.trim(),
    stage: null,
    extractedData: {},
    tool: null
  };
}

/**
 * Determine if we should show the advisor form based on response
 */
export function shouldShowAdvisorForm(response, currentStage) {
  if (currentStage !== 5) return false;

  // Look for phrases that indicate the conversation is concluding
  const ctaIndicators = [
    'speak with one of our',
    'arrange a call',
    'qualified advisor',
    'next step'
  ];

  const lowerResponse = response.toLowerCase();
  return ctaIndicators.some(indicator => lowerResponse.includes(indicator));
}
