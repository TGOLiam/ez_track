import { createContext, useContext, useReducer } from 'react'
import { CONFIG } from '@/config'

const AppContext = createContext(null)

const initialState = {
  profileId: null,
  user: null,
  business: null,
  tier: CONFIG.DEFAULT_TIER,
  billing: 'monthly',
  currentTab: 'home',
  transactionType: CONFIG.TX.INCOME,
  transactions: [],
  nextTransactionId: 1,
  inventory: [],
  customers: [],
  goals: [],
  simulaQueriesRemaining: CONFIG.AI_QUERY_LIMIT,
  dbReady: false,
  chatMessages: [],
  documents: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'DB_READY':
      return { ...state, dbReady: true }
    case 'LOGIN':
      return {
        ...state,
        ...action.payload,
        currentTab: 'home',
        transactionType: CONFIG.TX.INCOME,
        documents: JSON.parse(localStorage.getItem('eztrack_docs') || '[]'),
      }
    case 'LOGOUT':
      return { ...initialState, dbReady: state.dbReady }
    case 'SET_TIER':
      return { ...state, tier: action.payload }
    case 'SET_BILLING':
      return { ...state, billing: action.payload }
    case 'SET_CURRENT_TAB':
      return { ...state, currentTab: action.payload }
    case 'SET_TRANSACTION_TYPE':
      return { ...state, transactionType: action.payload }
    case 'SET_BUSINESS':
      return { ...state, business: { ...state.business, ...action.payload } }
    case 'ADD_TRANSACTION': {
      const tx = action.payload
      return { ...state, transactions: [tx, ...state.transactions], nextTransactionId: state.nextTransactionId + 1 }
    }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) }
    case 'ADD_INVENTORY_ITEM': {
      const item = action.payload
      return { ...state, inventory: [...state.inventory, item] }
    }
    case 'SET_STOCK_THRESHOLD': {
      const { item_id, min_threshold } = action.payload
      return {
        ...state,
        inventory: state.inventory.map(i => (i.id === item_id ? { ...i, min_threshold } : i)),
      }
    }
    case 'UPDATE_INVENTORY_ITEM': {
      const { item_id, ...fields } = action.payload
      return { ...state, inventory: state.inventory.map(i => (i.id === item_id ? { ...i, ...fields } : i)) }
    }
    case 'DELETE_INVENTORY_ITEM':
      return { ...state, inventory: state.inventory.filter(i => i.id !== action.payload) }
    case 'ADD_CUSTOMER': {
      const c = action.payload
      return { ...state, customers: [...state.customers, c] }
    }
    case 'ADD_GOAL': {
      const g = action.payload
      return { ...state, goals: [...state.goals, g] }
    }
    case 'DECREMENT_QUERY':
      return { ...state, simulaQueriesRemaining: Math.max(0, state.simulaQueriesRemaining - 1) }
    case 'RESET_QUERIES':
      return { ...state, simulaQueriesRemaining: CONFIG.AI_QUERY_LIMIT }
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] }
    case 'ADD_DOCUMENT': {
      const docs = [...state.documents, action.payload]
      localStorage.setItem('eztrack_docs', JSON.stringify(docs))
      return { ...state, documents: docs }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
