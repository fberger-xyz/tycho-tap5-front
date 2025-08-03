import toast from 'react-hot-toast'

// Default toast styles
const defaultStyle = {
    background: '#333',
    color: '#fff',
    borderRadius: '8px',
    padding: '12px',
}

// Toast utility functions with consistent styling
export const showErrorToast = (message: string, duration = 5000) => {
    return toast.error(message, {
        duration,
        style: {
            ...defaultStyle,
            background: '#dc2626', // red-600
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#dc2626',
        },
    })
}

export const showSuccessToast = (message: string, duration = 3000) => {
    return toast.success(message, {
        duration,
        style: {
            ...defaultStyle,
            background: '#059669', // green-600
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#059669',
        },
    })
}

export const showWarningToast = (message: string, duration = 4000) => {
    return toast(message, {
        duration,
        style: {
            ...defaultStyle,
            background: '#d97706', // amber-600
        },
        icon: '⚠️',
    })
}

export const showInfoToast = (message: string, duration = 3000) => {
    return toast(message, {
        duration,
        style: defaultStyle,
        icon: 'ℹ️',
    })
}

// Generic error messages for common scenarios
export const TOAST_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    API_ERROR: 'Unable to fetch data. Please try again later.',
    PRICE_FETCH_ERROR: 'Unable to fetch current prices. Displaying cached data.',
    STRATEGY_LOAD_ERROR: 'Unable to load strategies. Please refresh the page.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const
