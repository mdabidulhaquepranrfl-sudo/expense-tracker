import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [loading, setLoading] = useState(false);
    
    // Currency logic
    const [currency, setCurrencyState] = useState(() => {
        return localStorage.getItem('expense_currency') || '$';
    });
    const setCurrency = useCallback((val) => {
        localStorage.setItem('expense_currency', val);
        setCurrencyState(val);
    }, []);

    const showSuccess = useCallback((message) => {
        toast.success(message, {
            duration: 3000,
            style: {
                background: '#1e1b4b',
                color: '#c7d2fe',
                border: '1px solid #4f46e5',
            },
            iconTheme: { primary: '#6366f1', secondary: '#fff' },
        });
    }, []);

    const showError = useCallback((message) => {
        toast.error(message, {
            duration: 5000,
            style: {
                background: '#1e1b4b',
                color: '#fca5a5',
                border: '1px solid #ef4444',
            },
        });
    }, []);

    return (
        <AppContext.Provider value={{ loading, setLoading, showSuccess, showError, currency, setCurrency }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
