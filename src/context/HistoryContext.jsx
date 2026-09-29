import { createContext, useReducer, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

// Unit 3.1: Context API + useReducer
function historyReducer(state, action) {
  switch (action.type) {
    case 'SET_HISTORY':
      return { fixes: action.payload };
    case 'ADD_FIX':
      return {
        ...state,
        fixes: [action.payload, ...state.fixes]
      };
    case 'CLEAR_HISTORY':
      return { fixes: [] };
    default:
      return state;
  }
}

export function HistoryProvider({ children }) {
  const [state, dispatch] = useReducer(historyReducer, { fixes: [] });
  const { user } = useAuth();
  
  const historyStorageKey = `fixmycode_history_${user?.email || 'guest'}`;

  // Load history when user changes
  useEffect(() => {
    const saved = localStorage.getItem(historyStorageKey);
    if (saved) {
      dispatch({ type: 'SET_HISTORY', payload: JSON.parse(saved) });
    } else {
      dispatch({ type: 'SET_HISTORY', payload: [] });
    }
  }, [historyStorageKey]);

  // Save history whenever it changes (we can just add a simple interceptor in the functions)
  // Actually a simpler way is to save after dispatch
  const addFix = (fixRecord) => {
    const newFixes = [{ ...fixRecord, id: Date.now() }, ...state.fixes];
    dispatch({ type: 'SET_HISTORY', payload: newFixes });
    localStorage.setItem(historyStorageKey, JSON.stringify(newFixes));
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
    localStorage.setItem(historyStorageKey, JSON.stringify([]));
  };

  return (
    <HistoryContext.Provider value={{ fixes: state.fixes, addFix, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryContext);
}
