// Auth and Utility logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Check (if needed later)
    // 2. Auth State Check
    updateNavbarState();

    // 3. Setup Logout
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        });
    }
});

function updateNavbarState() {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    const authLinks = document.getElementById('auth-links');
    const guestLinks = document.getElementById('guest-links');
    
    if (userStr && token) {
        // User is logged in
        const user = JSON.parse(userStr);
        
        authLinks.classList.remove('hidden');
        guestLinks.classList.add('hidden');
        
        document.getElementById('nav-username').textContent = user.name;
        document.getElementById('nav-userrole').textContent = user.role.replace('_', ' ');
        
        if (user.role === 'admin' || user.role === 'court_staff') {
            document.getElementById('nav-dashboard').classList.remove('hidden');
            document.getElementById('nav-dashboard').classList.add('flex');
        } else {
            document.getElementById('nav-dashboard').classList.add('hidden');
            document.getElementById('nav-dashboard').classList.remove('flex');
        }
        
        if (user.role === 'admin') {
            document.getElementById('nav-admin').classList.remove('hidden');
            document.getElementById('nav-admin').classList.add('flex');
        } else {
            document.getElementById('nav-admin').classList.add('hidden');
            document.getElementById('nav-admin').classList.remove('flex');
        }
    } else {
        // User is guest
        authLinks.classList.add('hidden');
        guestLinks.classList.remove('hidden');
    }
}
