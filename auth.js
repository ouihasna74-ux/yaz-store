// auth.js - Handles Authentication logic (Login, Signup, Session)

// Helper: Get users from local storage
function getUsers() {
    const users = localStorage.getItem('ecommerce_users');
    return users ? JSON.parse(users) : [];
}

// Helper: Save users to local storage
function saveUsers(users) {
    localStorage.setItem('ecommerce_users', JSON.stringify(users));
}

// Helper: Get current signed in user
function getCurrentUser() {
    const user = localStorage.getItem('ecommerce_active_user');
    return user ? JSON.parse(user) : null;
}

// Helper: Set active user
function setActiveUser(user) {
    localStorage.setItem('ecommerce_active_user', JSON.stringify(user));
}

// Ensure the user is logged in for protected pages
function requireAuth() {
    if (!getCurrentUser()) {
        window.location.href = 'login.html';
    }
}

// Show a simple toast message
function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Form Handlers
document.addEventListener('DOMContentLoaded', () => {

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const location = document.getElementById('location').value.trim();
            const genre = document.getElementById('genre').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorText = document.getElementById('errorText');

            if (password !== confirmPassword) {
                errorText.textContent = "Passwords do not match.";
                errorText.style.display = 'block';
                return;
            }

            const users = getUsers();
            if (users.find(u => u.email === email)) {
                errorText.textContent = "Email already in use.";
                errorText.style.display = 'block';
                return;
            }

            // Save user
            users.push({ username, email, location, genre, password });
            saveUsers(users);
            
            showToast("Sign up successful! Please login.");
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorText = document.getElementById('errorText');

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                setActiveUser({ username: user.username, email: user.email, location: user.location, genre: user.genre });
                window.location.href = 'index.html';
            } else {
                errorText.textContent = "Invalid email or password.";
                errorText.style.display = 'block';
            }
        });
    }

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const errorText = document.getElementById('errorText');
            errorText.style.color = "var(--secondary)"; // Success color
            errorText.textContent = "Password reset link sent to your email (Simulated).";
            errorText.style.display = 'block';
        });
    }

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('ecommerce_active_user');
            window.location.href = 'login.html';
        });
    }

    // Dynamic Navigation update using Auth Status
    const authLinks = document.getElementById('nav-auth-links');
    if (authLinks && getCurrentUser()) {
        authLinks.innerHTML = `
            <a href="profile.html">Profile</a>
        `;
        
        // Inject logout button to the far left of the navbar ONLY if we are on the profile page
        const navbar = document.querySelector('.navbar');
        if (navbar && window.location.pathname.includes('profile.html')) {
            const logoutBtn = document.createElement('a');
            logoutBtn.href = '#';
            logoutBtn.id = 'navLogoutBtn';
            logoutBtn.innerHTML = '<span style="margin-right: 5px;">✖</span> Logout';
            logoutBtn.style.cssText = 'background: linear-gradient(135deg, #ff416c, #ff4b2b); color: white; padding: 0.5rem 1.2rem; border-radius: 30px; font-weight: 700; text-decoration: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(255, 75, 43, 0.4); transition: transform 0.2s, box-shadow 0.2s; letter-spacing: 0.5px; font-size: 0.9rem;';
            
            logoutBtn.onmouseover = () => {
                logoutBtn.style.transform = 'translateY(-2px)';
                logoutBtn.style.boxShadow = '0 6px 20px rgba(255, 75, 43, 0.6)';
            }
            logoutBtn.onmouseout = () => {
                logoutBtn.style.transform = 'translateY(0)';
                logoutBtn.style.boxShadow = '0 4px 15px rgba(255, 75, 43, 0.4)';
            }

            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('ecommerce_active_user');
                window.location.reload();
            });

            navbar.insertBefore(logoutBtn, navbar.firstChild);
        }
    }
});
