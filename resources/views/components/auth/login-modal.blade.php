<div id="loginModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-content">
        <button class="auth-close-btn" onclick="closeAuthModal('loginModal')">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>

        <div class="auth-header">
            <div class="auth-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="2" fill="none"/>
                    <polyline points="10 17 15 12 10 7" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <h2>Welcome Back!</h2>
            <p>Login to access your account</p>
        </div>

        <form id="loginForm" class="auth-form">
            @csrf
            <div class="form-group">
                <label for="loginEmail">Email Address</label>
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    <input type="email" id="loginEmail" name="email" placeholder="your@email.com" required>
                </div>
            </div>

            <div class="form-group">
                <label for="loginPassword">Password</label>
                <div class="password-input">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <input type="password" id="loginPassword" name="password" placeholder="Enter your password" required>
                    </div>
                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('loginPassword')">
                        <svg class="eye-open" viewBox="0 0 24 24" width="20" height="20">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" fill="none"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <svg class="eye-closed" viewBox="0 0 24 24" width="20" height="20" style="display: none;">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" fill="none"/>
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="form-options">
                <label class="checkbox-label">
                    <input type="checkbox" name="remember">
                    <span class="checkmark"></span>
                    <span>Remember me</span>
                </label>
                <a href="#" class="forgot-password" onclick="alert('Feature coming soon!'); return false;">Forgot password?</a>
            </div>

            <button type="submit" class="auth-submit-btn">
                <span>Login</span>
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12 5 19 12 12 19" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </button>
        </form>

        <div class="auth-footer">
            Don't have an account? <a href="#" onclick="switchAuthModal('register'); return false;">Register here</a>
        </div>
    </div>
</div>