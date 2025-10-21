<div id="registerModal" class="auth-modal" style="display: none;">
    <div class="auth-modal-content">
        <button class="auth-close-btn" onclick="closeAuthModal('registerModal')">
            <svg viewBox="0 0 24 24" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
        </button>

        <div class="auth-header">
            <div class="auth-icon">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
                    <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" stroke-width="2"/>
                    <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" stroke-width="2"/>
                </svg>
            </div>
            <h2>Create Account</h2>
            <p>Join our creative community today</p>
        </div>

        <form id="registerForm" class="auth-form">
            @csrf
            <div class="form-group">
                <label for="registerName">Full Name</label>
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" fill="none"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    <input type="text" id="registerName" name="name" placeholder="John Doe" required>
                </div>
            </div>

            <div class="form-group">
                <label for="registerEmail">Email Address</label>
                <div class="input-icon">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" fill="none"/>
                        <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" fill="none"/>
                    </svg>
                    <input type="email" id="registerEmail" name="email" placeholder="your@email.com" required>
                </div>
            </div>

            <div class="form-group">
                <label for="registerPassword">Password</label>
                <div class="password-input">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <input type="password" id="registerPassword" name="password" placeholder="Minimum 8 characters" required minlength="8">
                    </div>
                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('registerPassword')">
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
                <div class="password-strength">
                    <div class="strength-bar">
                        <div class="strength-fill" id="strengthFill"></div>
                    </div>
                    <span class="strength-text" id="strengthText">Password strength</span>
                </div>
            </div>

            <div class="form-group">
                <label for="registerPasswordConfirm">Confirm Password</label>
                <div class="password-input">
                    <div class="input-icon">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        <input type="password" id="registerPasswordConfirm" name="password_confirmation" placeholder="Re-enter password" required>
                    </div>
                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility('registerPasswordConfirm')">
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

            <label class="checkbox-label">
                <input type="checkbox" name="terms" required>
                <span class="checkmark"></span>
                <span>I agree to the <a href="#" onclick="alert('Terms coming soon!'); return false;">Terms & Conditions</a></span>
            </label>

            <button type="submit" class="auth-submit-btn">
                <span>Create Account</span>
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12 5 19 12 12 19" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            </button>
        </form>

        <div class="auth-footer">
            Already have an account? <a href="#" onclick="switchAuthModal('login'); return false;">Login here</a>
        </div>
    </div>
</div>