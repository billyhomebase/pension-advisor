import { useCallback, useEffect, useRef } from 'react';
import { useChat as useChatContext } from '../context/ChatContext';
import { sendChatMessage, getGreeting } from '../services/api';
import { parseAssistantResponse, shouldShowAdvisorForm } from '../utils/parseResponse';

export function useChatActions() {
  const { state, actions } = useChatContext();
  const initializedRef = useRef(false);

  // Fetch initial greeting on mount (only if no messages exist)
  useEffect(() => {
    if (initializedRef.current) return;
    if (state.messages.length > 0) {
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;

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
  }, []);

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
        const { displayContent, stage, extractedData } = parseAssistantResponse(response.content);

        // Add assistant response to UI
        actions.addMessage({
          role: 'assistant',
          content: displayContent
        });

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

  return {
    sendMessage,
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
