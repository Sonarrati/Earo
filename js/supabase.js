// Supabase configuration
const SUPABASE_URL = 'https://yxzztomtgaqmboquoszg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4enp0b210Z2FxbWJvcXVvc3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzU4OTQsImV4cCI6MjA3ODAxMTg5NH0.NKaBpeTUE3zgcyCOl_mbF1NJHGry5I8vBDzkb1RS1DY';

// Initialize Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Utility functions
const utils = {
    // Format currency
    formatCurrency(amount) {
        return '₹' + amount;
    },

    // Generate random number in range
    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Get today's date in YYYY-MM-DD format
    getToday() {
        return new Date().toISOString().split('T')[0];
    },

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};
