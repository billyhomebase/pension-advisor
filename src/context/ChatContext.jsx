import { createContext, useContext, useReducer, useEffect } from 'react';

const ChatContext = createContext(null);

const STORAGE_KEY = 'pensionChatState';

// Generate a unique session ID
function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}

const initialState = {
  sessionId: null,
  currentStage: 1,
  userName: '',
  messages: [],
  isLoading: false,
  customerData: {
    name: '',
    topicOfInterest: '',
    yearsToRetirement: null,
    currentSavings: '',
    familySituation: '',
    preferences: [],
    riskTolerance: ''
  },
  conversationHistory: [],
  showAdvisorForm: false,
  error: null
};

const actionTypes = {
  SET_STAGE: 'SET_STAGE',
  SET_USER_NAME: 'SET_USER_NAME',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  UPDATE_CUSTOMER_DATA: 'UPDATE_CUSTOMER_DATA',
  ADD_TO_CONVERSATION_HISTORY: 'ADD_TO_CONVERSATION_HISTORY',
  SHOW_ADVISOR_FORM: 'SHOW_ADVISOR_FORM',
  SET_ERROR: 'SET_ERROR',
  RESET_CHAT: 'RESET_CHAT',
  RESTORE_STATE: 'RESTORE_STATE'
};

function chatReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_STAGE:
      return { ...state, currentStage: action.payload };

    case actionTypes.SET_USER_NAME:
      return {
        ...state,
        userName: action.payload,
        customerData: { ...state.customerData, name: action.payload }
      };

    case actionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, {
          ...action.payload,
          id: Date.now(),
          timestamp: new Date().toISOString()
        }]
      };

    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case actionTypes.UPDATE_CUSTOMER_DATA:
      return {
        ...state,
        customerData: { ...state.customerData, ...action.payload }
      };

    case actionTypes.ADD_TO_CONVERSATION_HISTORY:
      return {
        ...state,
        conversationHistory: [...state.conversationHistory, action.payload]
      };

    case actionTypes.SHOW_ADVISOR_FORM:
      return { ...state, showAdvisorForm: action.payload };

    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case actionTypes.RESET_CHAT:
      return { ...initialState, sessionId: generateSessionId() };

    case actionTypes.RESTORE_STATE:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    sessionId: generateSessionId()
  });

  // Restore state from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure we have a session ID (restore or keep the new one)
        const sessionId = parsed.sessionId || state.sessionId;
        dispatch({ type: actionTypes.RESTORE_STATE, payload: { ...parsed, sessionId } });
      }
    } catch (error) {
      console.error('Failed to restore chat state:', error);
    }
  }, []);

  // Save state to sessionStorage on changes
  useEffect(() => {
    try {
      const stateToSave = {
        sessionId: state.sessionId,
        currentStage: state.currentStage,
        userName: state.userName,
        messages: state.messages,
        customerData: state.customerData,
        conversationHistory: state.conversationHistory,
        showAdvisorForm: state.showAdvisorForm
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save chat state:', error);
    }
  }, [state.sessionId, state.currentStage, state.userName, state.messages, state.customerData, state.conversationHistory, state.showAdvisorForm]);

  const actions = {
    setStage: (stage) => dispatch({ type: actionTypes.SET_STAGE, payload: stage }),
    setUserName: (name) => dispatch({ type: actionTypes.SET_USER_NAME, payload: name }),
    addMessage: (message) => dispatch({ type: actionTypes.ADD_MESSAGE, payload: message }),
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    updateCustomerData: (data) => dispatch({ type: actionTypes.UPDATE_CUSTOMER_DATA, payload: data }),
    addToConversationHistory: (message) => dispatch({ type: actionTypes.ADD_TO_CONVERSATION_HISTORY, payload: message }),
    showAdvisorForm: (show) => dispatch({ type: actionTypes.SHOW_ADVISOR_FORM, payload: show }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    resetChat: () => {
      sessionStorage.removeItem(STORAGE_KEY);
      dispatch({ type: actionTypes.RESET_CHAT });
    }
  };

  return (
    <ChatContext.Provider value={{ state, actions }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export { actionTypes };
