import { useCallback, useEffect, useRef } from 'react';
import { useChat as useChatContext } from '../context/ChatContext';
import { sendChatMessage, getGreeting } from '../services/api';
import { parseAssistantResponse, shouldShowAdvisorForm } from '../utils/parseResponse';

export function useChatActions() {
  const { state, actions } = useChatContext();
  const fetchedSessionRef = useRef(null);

  // Fetch greeting when session starts or resets
  useEffect(() => {
    // Skip if we already have messages (restored from session storage)
    if (state.messages.length > 0) {
      fetchedSessionRef.current = state.sessionId;
      return;
    }

    // Skip if we've already fetched or are fetching for this session
    if (fetchedSessionRef.current === state.sessionId) {
      return;
    }

    // Mark this session as being fetched BEFORE the async call
    fetchedSessionRef.current = state.sessionId;

    const fetchGreeting = async () => {
      actions.setLoading(true);
      try {
        const response = await getGreeting(state.sessionId);
        if (response.success) {
          const { displayContent, stage, extractedData } = parseAssistantResponse(response.content);

          actions.addMessage({
            role: 'assistant',
            content: displayContent
          });

          actions.addToConversationHistory({
            role: 'assistant',
            content: response.content
          });

          if (stage) {
            actions.setStage(stage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch greeting:', error);
        actions.setError('Failed to start conversation. Please refresh the page.');

        // Fallback greeting
        actions.addMessage({
          role: 'assistant',
          content: "Hello! Welcome to M&G's Pension Planning Assistant. Before we start, what would you like to be called today?"
        });
      } finally {
        actions.setLoading(false);
      }
    };

    fetchGreeting();
  }, [state.sessionId, state.messages.length]);

  const sendMessage = useCallback(async (content) => {
    // Add user message to UI
    actions.addMessage({
      role: 'user',
      content
    });

    // Add to conversation history for API
    actions.addToConversationHistory({
      role: 'user',
      content
    });

    actions.setLoading(true);
    actions.setError(null);

    try {
      // Prepare messages for API (just user and assistant messages)
      const apiMessages = [...state.conversationHistory, { role: 'user', content }]
        .map(msg => ({ role: msg.role, content: msg.content }));

      const response = await sendChatMessage(apiMessages, state.customerData, state.sessionId);

      if (response.success) {
        const { displayContent, stage, extractedData, tool } = parseAssistantResponse(response.content);

        // Build the message object
        const messageObj = {
          role: 'assistant',
          content: displayContent
        };

        // Add tool if present
        if (tool) {
          messageObj.tool = tool;
        }

        // Add assistant response to UI
        actions.addMessage(messageObj);

        // Add full response to conversation history
        actions.addToConversationHistory({
          role: 'assistant',
          content: response.content
        });

        // Update stage if provided
        if (stage && stage !== state.currentStage) {
          actions.setStage(stage);
        }

        // Update customer data if extracted
        if (extractedData && Object.keys(extractedData).length > 0) {
          actions.updateCustomerData(extractedData);

          // Special handling for name
          if (extractedData.name && !state.userName) {
            actions.setUserName(extractedData.name);
          }
        }

        // Check if we should show advisor form
        const newStage = stage || state.currentStage;
        if (shouldShowAdvisorForm(displayContent, newStage)) {
          actions.showAdvisorForm(true);
        }
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      actions.setError(error.message || 'Failed to send message. Please try again.');

      // Add error message to UI
      actions.addMessage({
        role: 'assistant',
        content: "I apologise, but I'm having trouble processing your message right now. Please try again in a moment."
      });
    } finally {
      actions.setLoading(false);
    }
  }, [state.conversationHistory, state.customerData, state.currentStage, state.userName, state.sessionId, actions]);

  // Handle tool completion (e.g., pension calculator results)
  const handleToolComplete = useCallback((messageId, toolType, result) => {
    if (toolType === 'pension-calculator') {
      const { inputs, projection, yearsToRetirement } = result;

      // Format the results as a message
      const resultMessage = `Based on my calculations:

**Your inputs:**
- Current age: ${inputs.currentAge}
- Retirement age: ${inputs.retirementAge}
- Current pension pot: £${inputs.currentPot.toLocaleString()}
- Monthly contribution: £${inputs.monthlyContribution.toLocaleString()}
- Risk level: ${inputs.riskLevel}

**Projected pension pot at retirement:** £${Math.round(projection.futurePot).toLocaleString()}
- Tax-free cash (25%): £${Math.round(projection.taxFreeCash).toLocaleString()}
- Remaining for income: £${Math.round(projection.remainingPot).toLocaleString()}
- In today's money: £${Math.round(projection.todaysValue).toLocaleString()}

That's over ${yearsToRetirement} years of saving. Would you like me to explain what these figures mean for your retirement planning, or shall we explore ways to potentially increase your pension pot?`;

      // Send as a user message summarizing the tool results
      sendMessage(`I've completed the pension calculator. Here are my details:
- Current age: ${inputs.currentAge}
- Planning to retire at: ${inputs.retirementAge}
- Current pension pot: £${inputs.currentPot.toLocaleString()}
- Monthly contribution: £${inputs.monthlyContribution.toLocaleString()}
- Risk preference: ${inputs.riskLevel}
- Projected pot: £${Math.round(projection.futurePot).toLocaleString()}`);
    }
  }, [sendMessage]);

  return {
    sendMessage,
    handleToolComplete,
    isLoading: state.isLoading,
    error: state.error,
    messages: state.messages,
    currentStage: state.currentStage,
    showAdvisorForm: state.showAdvisorForm,
    userName: state.userName,
    customerData: state.customerData,
    sessionId: state.sessionId,
    resetChat: actions.resetChat
  };
}
