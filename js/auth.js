// Google OAuth configuration
const GOOGLE_CLIENT_ID = '474561787549-c72e86a3u7k1rgoba7tn30buof0g9pij.apps.googleusercontent.com';

document.getElementById('googleLogin').addEventListener('click', async function() {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: `${window.location.origin}/dashboard.html`
            }
        });

        if (error) throw error;
    } catch (error) {
        console.error('Login error:', error);
        utils.showNotification('Login failed. Please try again.', 'error');
    }
});

// Check if user is logged in
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    if (!session && !window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
        return;
    }
    
    return session;
}

// Initialize auth check
document.addEventListener('DOMContentLoaded', checkAuth);
